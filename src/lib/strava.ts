import { supabase } from "@/integrations/supabase/client";

export interface StravaActivity {
    id: number;
    name: string;
    distance: number;
    moving_time: number;
    type: string;
    start_date: string;
}

export const getStravaAccessToken = async (userId: string) => {
    const { data: tokenData, error } = await supabase
        .from("strava_tokens")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error || !tokenData) {
        throw new Error("Strava não conectado");
    }

    const now = Math.floor(Date.now() / 1000);
    if (tokenData.expires_at < now + 60) {
        // Refresh token
        const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;

        const response = await fetch("https://www.strava.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: tokenData.refresh_token,
                grant_type: "refresh_token",
            }),
        });

        const newData = await response.json();
        if (newData.errors) throw new Error("Falha ao atualizar token do Strava");

        // Update DB
        await supabase.from("strava_tokens").update({
            access_token: newData.access_token,
            refresh_token: newData.refresh_token,
            expires_at: newData.expires_at,
            updated_at: new Date().toISOString(),
        }).eq("user_id", userId);

        return newData.access_token;
    }

    return tokenData.access_token;
};

export const fetchStravaActivities = async (userId: string): Promise<StravaActivity[]> => {
    const accessToken = await getStravaAccessToken(userId);

    const response = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=10", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) throw new Error("Erro ao buscar atividades do Strava");
    return response.json();
};
