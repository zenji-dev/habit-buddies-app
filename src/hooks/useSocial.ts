import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useSocial = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const friendsQuery = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${user!.id},friend_id.eq.${user!.id}`)
        .eq("status", "accepted");
      if (error) throw error;

      const friendIds = data.map((f) =>
        f.user_id === user!.id ? f.friend_id : f.user_id
      );

      if (friendIds.length === 0) return [];

      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", friendIds);
      if (pError) throw pError;
      return profiles || [];
    },
    enabled: !!user,
  });

  const incomingRequestsQuery = useQuery({
    queryKey: ["friendRequests", user?.id],
    queryFn: async () => {
      const { data: friendships, error } = await supabase
        .from("friendships")
        .select("*")
        .eq("friend_id", user!.id)
        .eq("status", "pending");

      if (error) throw error;
      if (!friendships || friendships.length === 0) return [];

      const requesterIds = friendships.map(f => f.user_id);
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", requesterIds);

      if (pError) throw pError;

      return friendships.map(f => ({
        ...f,
        profile: profiles?.find(p => p.user_id === f.user_id)
      }));
    },
    enabled: !!user,
  });

  const feedQuery = useQuery({
    queryKey: ["feed", user?.id],
    queryFn: async () => {
      const friendIds = [user!.id, ...(friendsQuery.data?.map((f) => f.user_id) || [])];

      const { data, error } = await supabase
        .from("check_ins")
        .select("*, habits(*)")
        .in("user_id", friendIds)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      const userIds = [...new Set((data || []).map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      const checkInIds = (data || []).map((c) => c.id);
      const { data: kudos } = await supabase
        .from("kudos")
        .select("*")
        .in("check_in_id", checkInIds);

      return (data || []).map((checkIn) => ({
        ...checkIn,
        profile: profiles?.find((p) => p.user_id === checkIn.user_id),
        kudosCount: kudos?.filter((k) => k.check_in_id === checkIn.id).length || 0,
        hasGivenKudos: kudos?.some(
          (k) => k.check_in_id === checkIn.id && k.from_user_id === user!.id
        ) || false,
      }));
    },
    enabled: !!user && !!friendsQuery.data,
  });

  const giveKudos = useMutation({
    mutationFn: async ({ checkInId, toUserId }: { checkInId: string; toUserId: string }) => {
      const { error } = await supabase.from("kudos").insert({
        from_user_id: user!.id,
        to_user_id: toUserId,
        check_in_id: checkInId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Kudos enviado! 🎉");
    },
  });

  const unfriend = useMutation({
    mutationFn: async (friendUserId: string) => {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .or(`and(user_id.eq.${user!.id},friend_id.eq.${friendUserId}),and(user_id.eq.${friendUserId},friend_id.eq.${user!.id})`);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Amizade removida.");
    },
  });

  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) return [];

    const searchStr = query.startsWith("@") ? query.slice(1) : query;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`name.ilike.%${searchStr}%,username.ilike.%${searchStr}%`)
      .neq("user_id", user!.id)
      .limit(5);
    if (error) throw error;
    return data || [];
  };

  const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) throw error;
    return data;
  };

  const getUserActivities = async (userId: string) => {
    const { data: activities, error: aErr } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })
      .limit(10);
    if (aErr) throw aErr;

    const { data: checkIns, error: cErr } = await supabase
      .from("check_ins")
      .select("*, habits(*)")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(10);
    if (cErr) throw cErr;

    return { activities, checkIns };
  };

  const getFriendshipStatus = async (otherUserId: string) => {
    const { data, error } = await supabase
      .from("friendships")
      .select("*")
      .or(`and(user_id.eq.${user!.id},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${user!.id})`)
      .maybeSingle();
    if (error) throw error;
    return data;
  };

  const addFriend = useMutation({
    mutationFn: async (friendHandle: string) => {
      const cleanHandle = friendHandle.startsWith("@") ? friendHandle.slice(1) : friendHandle;

      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, name, username")
        .or(`username.eq.${cleanHandle.toLowerCase()},name.eq.${friendHandle}`)
        .neq("user_id", user!.id);

      if (pErr) throw pErr;

      const friend = profiles?.[0];
      if (!friend) {
        toast.error("Usuário não encontrado");
        return;
      }

      const { error } = await supabase.from("friendships").insert({
        user_id: user!.id,
        friend_id: friend.user_id,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          toast.info("Solicitação já enviada!");
          return;
        }
        throw error;
      }
      toast.success(`Solicitação enviada para ${friend.name}!`);
    },
  });

  const addFriendById = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { error } = await supabase.from("friendships").insert({
        user_id: user!.id,
        friend_id: targetUserId,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      toast.success("Solicitação enviada!");
    },
  });

  const handleRequest = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: "accepted" | "rejected" }) => {
      const { error } = await supabase
        .from("friendships")
        .update({ status })
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      if (variables.status === "accepted") {
        toast.success("Solicitação aceita!");
      } else {
        toast.info("Solicitação recusada.");
      }
    },
  });

  return {
    friends: friendsQuery.data || [],
    incomingRequests: incomingRequestsQuery.data || [],
    feed: feedQuery.data || [],
    isLoading: friendsQuery.isLoading || feedQuery.isLoading || incomingRequestsQuery.isLoading,
    giveKudos,
    addFriend,
    addFriendById,
    handleRequest,
    unfriend,
    searchUsers,
    getUserProfile,
    getUserActivities,
    getFriendshipStatus,
  };
};
