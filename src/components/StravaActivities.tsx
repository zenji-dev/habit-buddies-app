import { useState, useEffect } from "react";
import { fetchStravaActivities, StravaActivity } from "@/lib/strava";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Activity, Share2, Loader2, MapPin, Clock, Calendar } from "lucide-react";

export const StravaActivities = () => {
    const { userId } = useAuth();
    const [activities, setActivities] = useState<StravaActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [postingId, setPostingId] = useState<number | null>(null);

    useEffect(() => {
        const loadActivities = async () => {
            if (!userId) return;
            try {
                const data = await fetchStravaActivities(userId);
                setActivities(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadActivities();
    }, [userId]);

    const postActivity = async (stravaActivity: StravaActivity) => {
        if (!userId) return;
        setPostingId(stravaActivity.id);

        try {
            const { error } = await supabase.from("activities").insert({
                user_id: userId,
                strava_id: stravaActivity.id,
                activity_name: stravaActivity.name,
                distance: stravaActivity.distance,
                moving_time: stravaActivity.moving_time,
                type: stravaActivity.type,
                start_date: stravaActivity.start_date,
            });

            if (error) {
                if (error.code === "23505") {
                    toast.error("Esta atividade já foi postada!");
                } else {
                    throw error;
                }
            } else {
                toast.success("Atividade postada no feed!");
            }
        } catch (err: any) {
            toast.error("Erro ao postar: " + err.message);
        } finally {
            setPostingId(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-8 space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Carregando atividades do Strava...</span>
        </div>
    );

    if (activities.length === 0) return (
        <div className="text-center p-8 border-2 border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">Nenhuma atividade recente encontrada no Strava.</p>
        </div>
    );

    const formatDistance = (meters: number) => (meters / 1000).toFixed(2) + " km";
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 px-1">
                <Activity className="w-5 h-5 text-streak" /> Atividades Recentes do Strava
            </h3>
            <div className="grid gap-4">
                {activities.map((act) => (
                    <Card key={act.id} className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h4 className="font-bold text-foreground">{act.name}</h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {formatDistance(act.distance)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {formatTime(act.moving_time)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {new Date(act.start_date).toLocaleDateString()}
                                    </span>
                                    <span className="bg-streak/10 text-streak px-2 py-0.5 rounded-full font-semibold">
                                        {act.type}
                                    </span>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => postActivity(act)}
                                disabled={postingId === act.id}
                                className="bg-streak hover:bg-streak/90 text-white gap-2 self-start md:self-center"
                            >
                                {postingId === act.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                                Postar no Feed
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
