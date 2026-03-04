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

interface ChallengeHabit {
    id: string;
    name: string;
    icon: string;
}

interface MemberWithProfile extends Profile {
    completedHabits: string[];
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
    habits: ChallengeHabit[];
    duration_days: number;
    start_date: string;
    created_by: string;
    currentDay: number;
    members: MemberWithProfile[];
}

export const usePartyChallenge = () => {
    const { userId } = useAuth();
    const queryClient = useQueryClient();
    const today = format(new Date(), "yyyy-MM-dd");

    const challengeQuery = useQuery({
        queryKey: ["partyChallenge", userId],
        queryFn: async (): Promise<PartyChallenge | null> => {
            // 1. Find active challenge memberships
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

            // 3. Fetch members and today's logs in parallel
            const [
                { data: allMembers, error: amErr },
                { data: todayLogs, error: lErr },
            ] = await Promise.all([
                supabase
                    .from("challenge_members")
                    .select("user_id, status")
                    .eq("challenge_id", activeChallenge.id)
                    .eq("status", "accepted"),
                supabase
                    .from("daily_logs")
                    .select("user_id, habit_name")
                    .eq("challenge_id", activeChallenge.id)
                    .eq("log_date", today),
            ]);

            if (amErr) throw amErr;
            if (lErr) throw lErr;

            const memberIds = (allMembers || []).map((m) => m.user_id);

            // 4. Fetch profiles
            const { data: profiles, error: pErr } = await supabase
                .from("profiles")
                .select("user_id, name, avatar_url")
                .in("user_id", memberIds);

            if (pErr) throw pErr;

            // Build per-user completed habits map
            const userHabitsMap: Record<string, string[]> = {};
            (todayLogs || []).forEach((log) => {
                if (!log.habit_name) return;
                if (!userHabitsMap[log.user_id]) userHabitsMap[log.user_id] = [];
                userHabitsMap[log.user_id].push(log.habit_name);
            });

            // Parse habits from target_habit JSON field (stored as JSON string)
            let habits: ChallengeHabit[] = [];
            try {
                const parsed = JSON.parse(activeChallenge.target_habit || "[]");
                if (Array.isArray(parsed)) {
                    habits = parsed.map((h: any, i: number) => ({
                        id: String(i),
                        name: h.name || h,
                        icon: h.icon || "💪",
                    }));
                }
            } catch {
                // fallback: treat as comma-separated string
                habits = (activeChallenge.target_habit || "").split(",").filter(Boolean).map((name, i) => ({
                    id: String(i),
                    name: name.trim(),
                    icon: "💪",
                }));
            }

            const members: MemberWithProfile[] = (profiles || []).map((p) => ({
                user_id: p.user_id,
                name: p.name,
                avatar_url: p.avatar_url,
                completedHabits: userHabitsMap[p.user_id] || [],
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
                habits,
                duration_days: activeChallenge.duration_days,
                start_date: activeChallenge.start_date,
                created_by: activeChallenge.created_by,
                currentDay: Math.min(currentDay, activeChallenge.duration_days),
                members,
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
            const challengeId = challengeQuery.data?.id;

            const [{ data: friendships }, { data: currentMembers }] = await Promise.all([
                supabase
                    .from("friendships")
                    .select("*")
                    .or(`user_id.eq.${userId!},friend_id.eq.${userId!}`)
                    .eq("status", "accepted"),
                challengeId
                    ? supabase.from("challenge_members").select("user_id").eq("challenge_id", challengeId)
                    : Promise.resolve({ data: null }),
            ]);

            const friendIds = (friendships || []).map(f => f.user_id === userId! ? f.friend_id : f.user_id);
            if (friendIds.length === 0) return [];

            const excludedIds = currentMembers?.map((m: { user_id: string }) => m.user_id) || [];

            const memberIdsSet = new Set(excludedIds);
            const inviteableIds = friendIds.filter(id => !memberIdsSet.has(id));

            if (inviteableIds.length === 0 && challengeQuery.data?.id) return [];

            const finalIds = challengeQuery.data?.id ? inviteableIds : friendIds;
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
        mutationFn: async ({ title, habits, duration_days, friendIds }: {
            title: string,
            habits: { name: string, icon: string }[],
            duration_days: number,
            friendIds: string[]
        }) => {
            // 1. Create Challenge — habits stored as JSON in target_habit
            const { data: challenge, error: cErr } = await supabase
                .from("challenges")
                .insert({
                    title,
                    target_habit: JSON.stringify(habits.map(h => ({ name: h.name, icon: h.icon }))),
                    duration_days,
                    start_date: today,
                    created_by: userId!
                })
                .select()
                .single();

            if (cErr) throw cErr;

            // 2. Add creator membership
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
            toast.success("Party criada com sucesso!");
        },
        onError: (err: any) => {
            console.error("Erro ao criar party:", err);
            toast.error(`Erro ao criar party: ${err?.message || "tente novamente"}`);
        }
    });

    const checkIn = useMutation({
        mutationFn: async ({ challengeId, habitName }: { challengeId: string, habitName: string }) => {
            const { error } = await supabase.from("daily_logs").insert({
                challenge_id: challengeId,
                user_id: userId!,
                log_date: today,
                habit_name: habitName,
            });
            if (error && error.code !== "23505") throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partyChallenge"] });
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

    const kickMember = useMutation({
        mutationFn: async (targetUserId: string) => {
            if (!challengeQuery.data) return;
            const { error } = await supabase
                .from("challenge_members")
                .delete()
                .eq("challenge_id", challengeQuery.data.id)
                .eq("user_id", targetUserId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partyChallenge"] });
            queryClient.invalidateQueries({ queryKey: ["friendsToInvite"] });
            toast.success("Membro removido da party.");
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
            toast.success(variables.accept ? "Convite aceito!" : "Convite recusado.");
        }
    });

    const leaveParty = useMutation({
        mutationFn: async () => {
            if (!challengeQuery.data) return;
            const { error } = await supabase
                .from("challenge_members")
                .delete()
                .eq("challenge_id", challengeQuery.data.id)
                .eq("user_id", userId!);
            if (error) throw error;
        },
        onSuccess: () => {
            // Limpa imediatamente o cache para mostrar tela de criar party
            queryClient.setQueryData(["partyChallenge", userId], null);
            queryClient.removeQueries({ queryKey: ["friendsToInvite"] });
            toast.success("Você saiu da party.");
        },
        onError: (err: any) => {
            toast.error(`Erro ao sair da party: ${err?.message || "tente novamente"}`);
        }
    });

    const checkUserInParty = async (targetId: string) => {
        const { data, error } = await supabase
            .from("challenge_members")
            .select("challenge_id")
            .eq("user_id", targetId)
            .eq("status", "accepted");

        if (error) throw error;
        return data && data.length > 0;
    };

    return {
        challenge: challengeQuery.data ?? null,
        invites: invitesQuery.data || [],
        friendsToInvite: friendsToInviteQuery.data || [],
        isLoading: challengeQuery.isLoading || invitesQuery.isLoading,
        createChallenge,
        checkIn,
        inviteFriend,
        kickMember,
        leaveParty,
        respondToInvite,
        checkUserInParty
    };
};
