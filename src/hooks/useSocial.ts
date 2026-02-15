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

  const feedQuery = useQuery({
    queryKey: ["feed", user?.id],
    queryFn: async () => {
      if (!friendsQuery.data || friendsQuery.data.length === 0) return [];
      const friendIds = friendsQuery.data.map((f) => f.user_id);

      const { data, error } = await supabase
        .from("check_ins")
        .select("*, habits(*)")
        .in("user_id", friendIds)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      // Fetch profiles for these check-ins
      const userIds = [...new Set((data || []).map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      // Fetch kudos counts
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

  const addFriend = useMutation({
    mutationFn: async (friendEmail: string) => {
      // Find profile by searching for user
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, name")
        .neq("user_id", user!.id);
      if (pErr) throw pErr;

      // For simplicity, find by name match
      const friend = profiles?.find((p) =>
        p.name.toLowerCase().includes(friendEmail.toLowerCase())
      );
      if (!friend) {
        toast.error("Usuário não encontrado");
        return;
      }

      const { error } = await supabase.from("friendships").insert({
        user_id: user!.id,
        friend_id: friend.user_id,
        status: "accepted",
      });
      if (error) {
        if (error.code === "23505") {
          toast.info("Já são amigos!");
          return;
        }
        throw error;
      }
      toast.success(`${friend.name} adicionado como amigo!`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  return {
    friends: friendsQuery.data || [],
    feed: feedQuery.data || [],
    isLoading: friendsQuery.isLoading || feedQuery.isLoading,
    giveKudos,
    addFriend,
  };
};
