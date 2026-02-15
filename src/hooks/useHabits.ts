import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useHabits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const habitsQuery = useQuery({
    queryKey: ["habits", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const checkInsQuery = useQuery({
    queryKey: ["check_ins", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("check_ins")
        .select("*")
        .eq("user_id", user!.id)
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addHabit = useMutation({
    mutationFn: async ({ name, icon, goal_minutes }: { name: string; icon: string; goal_minutes?: number }) => {
      const { error } = await supabase.from("habits").insert({
        user_id: user!.id,
        name,
        icon,
        goal_minutes: goal_minutes || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Hábito adicionado!");
    },
  });

  const checkIn = useMutation({
    mutationFn: async (habitId: string) => {
      const { error } = await supabase.from("check_ins").insert({
        user_id: user!.id,
        habit_id: habitId,
        completed_at: new Date().toISOString().split("T")[0],
      });
      if (error) {
        if (error.code === "23505") {
          toast.info("Já fez check-in hoje neste hábito!");
          return;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["check_ins"] });
      toast.success("Check-in realizado! 🔥");
    },
  });

  const getStreak = (habitId: string): number => {
    if (!checkInsQuery.data) return 0;
    const habitCheckins = checkInsQuery.data
      .filter((c) => c.habit_id === habitId)
      .map((c) => c.completed_at)
      .sort((a, b) => b.localeCompare(a));

    if (habitCheckins.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < habitCheckins.length; i++) {
      const checkDate = new Date(habitCheckins[i] + "T00:00:00");
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (checkDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (i === 0) {
        // Allow yesterday
        expectedDate.setDate(expectedDate.getDate() - 1);
        if (checkDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else break;
      } else break;
    }
    return streak;
  };

  const isCheckedToday = (habitId: string): boolean => {
    if (!checkInsQuery.data) return false;
    const today = new Date().toISOString().split("T")[0];
    return checkInsQuery.data.some(
      (c) => c.habit_id === habitId && c.completed_at === today
    );
  };

  return {
    habits: habitsQuery.data || [],
    checkIns: checkInsQuery.data || [],
    isLoading: habitsQuery.isLoading,
    addHabit,
    checkIn,
    getStreak,
    isCheckedToday,
  };
};
