import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const StravaCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");
            const error = searchParams.get("error");

            if (error) {
                toast.error("Erro na autorização do Strava: " + error);
                navigate("/settings");
                return;
            }

            if (!code || !user) {
                return;
            }

            try {
                const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
                const clientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;

                if (!clientId || !clientSecret) {
                    throw new Error("Configuração do Strava ausente no .env");
                }

                // Exchange code for tokens
                const response = await fetch("https://www.strava.com/oauth/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        client_id: clientId,
                        client_secret: clientSecret,
                        code,
                        grant_type: "authorization_code",
                    }),
                });

                const data = await response.json();

                if (data.errors) {
                    throw new Error(data.message || "Erro ao trocar tokens");
                }

                // Save to Supabase
                const { error: dbError } = await supabase.from("strava_tokens").upsert({
                    user_id: user.id,
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    expires_at: data.expires_at,
                    athlete_id: data.athlete.id,
                    updated_at: new Date().toISOString(),
                });

                if (dbError) throw dbError;

                toast.success("Strava conectado com sucesso!");
                navigate("/settings");
            } catch (err: any) {
                console.error("Strava error:", err);
                toast.error("Erro ao conectar ao Strava: " + err.message);
                navigate("/settings");
            }
        };

        handleCallback();
    }, [searchParams, navigate, user]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground animate-pulse">Conectando ao Strava...</p>
            </div>
        </div>
    );
};

export default StravaCallback;
