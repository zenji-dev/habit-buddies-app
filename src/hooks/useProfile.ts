import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@clerk/clerk-react";

export const useProfile = () => {
  const { userId } = useAuth();

  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID"); // Safeguard

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(); // Use maybeSingle to avoid 406 on no rows

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
