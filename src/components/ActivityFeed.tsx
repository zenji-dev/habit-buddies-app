import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MapPin, Clock, Calendar, Activity, User } from "lucide-react";

interface ActivityItem {
    id: string;
    activity_name: string;
    distance: number | null;
    moving_time: number | null;
    type: string | null;
    start_date: string | null;
    user_id: string;
    created_at: string;
    profiles: {
        name: string | null;
        avatar_url: string | null;
    } | null;
}

export const ActivityFeed = () => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFeed = async () => {
        const { data, error } = await supabase
            .from("activities")
            .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
            .order("start_date", { ascending: false })
            .limit(20);

        if (error) {
            console.error(error);
        } else {
            setActivities(data as any);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFeed();

        // Real-time updates
        const channel = supabase
            .channel("activities_feed")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "activities" }, () => {
                fetchFeed();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const formatDistance = (meters: number | null) => meters ? (meters / 1000).toFixed(2) + " km" : "0 km";
    const formatTime = (seconds: number | null) => {
        if (!seconds) return "0m";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    if (loading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <Card key={i} className="p-6 bg-card border-border animate-pulse h-32" />
            ))}
        </div>
    );

    if (activities.length === 0) return (
        <div className="text-center p-12 bg-card border border-border rounded-2xl">
            <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground italic">Nenhuma atividade postada ainda. Seja o primeiro!</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {activities.map((act) => (
                <Card key={act.id} className="overflow-hidden border-border bg-card hover:border-primary/30 transition-all group">
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <Link to={`/profile/${act.user_id}`} className="hover:opacity-80 transition-opacity flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                                    {act.profiles?.avatar_url ? (
                                        <img src={act.profiles.avatar_url} alt={act.profiles.name || ""} className="w-full h-full object-cover" />
                                    ) : (
                                        act.profiles?.name?.charAt(0) || <User className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-foreground leading-none hover:text-primary transition-colors">
                                        {act.profiles?.name || "Usuário"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                                        Postou uma atividade
                                    </p>
                                </div>
                            </Link>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                                {act.activity_name}
                            </h4>

                            <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/50">
                                <div className="text-center">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Distância</p>
                                    <p className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
                                        <MapPin className="w-3 h-3 text-streak" /> {formatDistance(act.distance)}
                                    </p>
                                </div>
                                <div className="text-center border-x border-border/50">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Tempo</p>
                                    <p className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
                                        <Clock className="w-3 h-3 text-streak" /> {formatTime(act.moving_time)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Tipo</p>
                                    <p className="text-sm font-bold text-foreground capitalize truncate px-1">
                                        {act.type?.replace(/_/g, " ") || "Esporte"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-widest">
                                    <Calendar className="w-3 h-3" /> {act.start_date ? new Date(act.start_date).toLocaleDateString() : ""}
                                </span>
                                <span className="text-[10px] font-black text-streak/60 italic uppercase">
                                    #KeepMoving
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
