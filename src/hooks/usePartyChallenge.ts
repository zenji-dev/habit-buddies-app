import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Profile {
    user_id: string;
    name: string;
    avatar_url: string | null;
}

interface MemberWithProfile extends Profile {
    checkedInToday: boolean;
    status: string;
}

interface ChallengeInvite {
    id: string;
    challenge_id: string;
    challenge_title: string;
    target_habit: string | null;
    invited_by_profile: Profile | null;
}

interface PartyChallenge {
    id: string;
    title: string;
    target_habit: string | null;
    duration_days: number;
    start_date: string;
    created_by: string;
    currentDay: number;
    members: MemberWithProfile[];
    userCheckedInToday: boolean;
}

export const usePartyChallenge = () => {
    const { userId } = useAuth();
    const queryClient = useQueryClient();
    const today = format(new Date(), "yyyy-MM-dd");

    const challengeQuery = useQuery({
        queryKey: ["partyChallenge", userId],
        queryFn: async (): Promise<PartyChallenge | null> => {
            // 1. Find active challenge memberships (accepted)
            const { data: memberships, error: mErr } = await supabase
                .from("challenge_members")
                .select("challenge_id")
                .eq("user_id", userId!)
                .eq("status", "accepted");

            if (mErr) throw mErr;
            if (!memberships || memberships.length === 0) return null;

            const challengeIds = memberships.map((m) => m.challenge_id);

            // 2. Fetch challenges
            const { data: challenges, error: cErr } = await supabase
                .from("challenges")
                .select("*")
                .in("id", challengeIds)
                .order("start_date", { ascending: false });

            if (cErr) throw cErr;
            if (!challenges || challenges.length === 0) return null;

            const activeChallenge = challenges[0];

            // 3. Fetch all members (accepted)
            const { data: allMembers, error: amErr } = await supabase
                .from("challenge_members")
                .select("user_id, status")
                .eq("challenge_id", activeChallenge.id)
                .eq("status", "accepted");

            if (amErr) throw amErr;

            const memberIds = (allMembers || []).map((m) => m.user_id);

            // 4. Fetch profiles
            const { data: profiles, error: pErr } = await supabase
                .from("profiles")
                .select("user_id, name, avatar_url")
                .in("user_id", memberIds);

            if (pErr) throw pErr;

            // 5. Fetch today's logs
            const { data: todayLogs, error: lErr } = await supabase
                .from("daily_logs")
                .select("user_id")
                .eq("challenge_id", activeChallenge.id)
                .eq("log_date", today);

            if (lErr) throw lErr;

            const checkedInUserIds = new Set((todayLogs || []).map((l) => l.user_id));

            const members: MemberWithProfile[] = (profiles || []).map((p) => ({
                user_id: p.user_id,
                name: p.name,
                avatar_url: p.avatar_url,
                checkedInToday: checkedInUserIds.has(p.user_id),
                status: allMembers?.find(m => m.user_id === p.user_id)?.status || 'accepted'
            }));

            members.sort((a, b) => (a.user_id === userId! ? -1 : 1));

            const startDate = new Date(activeChallenge.start_date);
            const diffTime = new Date(today).getTime() - startDate.getTime();
            const currentDay = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

            return {
                id: activeChallenge.id,
                title: activeChallenge.title,
                target_habit: activeChallenge.target_habit,
                duration_days: activeChallenge.duration_days,
                start_date: activeChallenge.start_date,
                created_by: activeChallenge.created_by,
                currentDay: Math.min(currentDay, activeChallenge.duration_days),
                members,
                userCheckedInToday: checkedInUserIds.has(userId!),
            };
        },
        enabled: !!userId,
    });

    const invitesQuery = useQuery({
        queryKey: ["partyInvites", userId],
        queryFn: async (): Promise<ChallengeInvite[]> => {
            const { data: invites, error } = await supabase
                .from("challenge_members")
                .select("id, challenge_id, invited_by, challenges(title, target_habit)")
                .eq("user_id", userId!)
                .eq("status", "pending");

            if (error) throw error;
            if (!invites) return [];

            const inviterIds = invites.map(i => i.invited_by).filter(Boolean) as string[];
            const { data: profiles } = await supabase
                .from("profiles")
                .select("user_id, name, avatar_url")
                .in("user_id", inviterIds);

            return invites.map((invite: any) => ({
                id: invite.id,
                challenge_id: invite.challenge_id,
                challenge_title: invite.challenges?.title || "Desafio",
                target_habit: invite.challenges?.target_habit || null,
                invited_by_profile: profiles?.find(p => p.user_id === invite.invited_by) || null
            }));
        },
        enabled: !!userId,
    });

    const friendsToInviteQuery = useQuery({
        queryKey: ["friendsToInvite", challengeQuery.data?.id],
        queryFn: async () => {
            // Get friendships
            const { data: friendships } = await supabase
                .from("friendships")
                .select("*")
                .or(`user_id.eq.${userId!},friend_id.eq.${userId!}`)
                .eq("status", "accepted");

            const friendIds = (friendships || []).map(f => f.user_id === userId! ? f.friend_id : f.user_id);
            if (friendIds.length === 0) return [];

            // If we have an active challenge, filter out those already in it
            let excludedIds: string[] = [];
            if (challengeQuery.data) {
                const { data: currentMembers } = await supabase
                    .from("challenge_members")
                    .select("user_id")
                    .eq("challenge_id", challengeQuery.data.id);
                excludedIds = currentMembers?.map(m => m.user_id) || [];
            }

            const memberIdsSet = new Set(excludedIds);
            const inviteableIds = friendIds.filter(id => !memberIdsSet.has(id));

            if (inviteableIds.length === 0 && challengeQuery.data) return [];

            // If no challenge, show all friends
            const finalIds = challengeQuery.data ? inviteableIds : friendIds;
            if (finalIds.length === 0) return [];

            const { data: profiles } = await supabase
                .from("profiles")
                .select("user_id, name, avatar_url")
                .in("user_id", finalIds);

            return profiles || [];
        },
        enabled: !!userId,
    });

    const createChallenge = useMutation({
        mutationFn: async ({ title, target_habit, duration_days, friendIds }: { title: string, target_habit: string, duration_days: number, friendIds: string[] }) => {
            // 1. Create Challenge
            const { data: challenge, error: cErr } = await supabase
                .from("challenges")
                .insert({
                    title,
                    target_habit,
                    duration_days,
                    start_date: today,
                    created_by: userId!
                })
                .select()
                .single();

            if (cErr) throw cErr;

            // 2. Add creator
            const { error: creatorErr } = await supabase.from("challenge_members").insert({
                challenge_id: challenge.id,
                user_id: userId!,
                status: "accepted"
            });

            if (creatorErr) throw creatorErr;

            // 3. Add friends (pending)
            if (friendIds.length > 0) {
                const inviteEntries = friendIds.map(fid => ({
                    challenge_id: challenge.id,
                    user_id: fid,
                    status: "pending",
                    invited_by: userId!
                }));
                const { error: inviteErr } = await supabase.from("challenge_members").insert(inviteEntries);
                if (inviteErr) throw inviteErr;
            }

            return challenge;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partyChallenge"] });
            queryClient.invalidateQueries({ queryKey: ["partyInvites"] });
            toast.success("Party criada com sucesso! 🚀");
        }
    });

    const checkIn = useMutation({
        mutationFn: async (challengeId: string) => {
            const { error } = await supabase.from("daily_logs").insert({
                challenge_id: challengeId,
                user_id: userId!,
                log_date: today,
            });
            if (error && error.code !== "23505") throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partyChallenge"] });
            toast.success("Check-in feito! 🎉");
        }
    });

    const inviteFriend = useMutation({
        mutationFn: async (friendId: string) => {
            if (!challengeQuery.data) return;
            const { error } = await supabase.from("challenge_members").insert({
                challenge_id: challengeQuery.data.id,
                user_id: friendId,
                status: "pending",
                invited_by: userId!
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["friendsToInvite"] });
            toast.success("Convite enviado!");
        }
    });

    const respondToInvite = useMutation({
        mutationFn: async ({ inviteId, accept }: { inviteId: string, accept: boolean }) => {
            if (accept) {
                const { error } = await supabase
                    .from("challenge_members")
                    .update({ status: "accepted", joined_at: new Date().toISOString() })
                    .eq("id", inviteId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("challenge_members")
                    .delete()
                    .eq("id", inviteId);
                if (error) throw error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["partyChallenge"] });
            queryClient.invalidateQueries({ queryKey: ["partyInvites"] });
            toast.success(variables.accept ? "Convite aceito! 🚀" : "Convite recusado.");
        }
    });

    return {
        challenge: challengeQuery.data ?? null,
        invites: invitesQuery.data || [],
        friendsToInvite: friendsToInviteQuery.data || [],
        isLoading: challengeQuery.isLoading || invitesQuery.isLoading,
        createChallenge,
        checkIn,
        inviteFriend,
        respondToInvite
    };
};
