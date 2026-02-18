import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ActivityItem {
    created_at: string;
    profile?: { name: string };
    habits?: { name: string; icon: string };
}

export const DashboardActivityLog = ({ activity }: { activity: ActivityItem[] }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Atividade Recente</h2>
            <Card className="p-6 bg-card border-border">
                {activity.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-8">
                        Nenhuma atividade recente.
                    </p>
                ) : (
                    <div className="space-y-6">
                        {activity.slice(0, 5).map((act, i) => (
                            <div key={i} className="flex gap-4 relative">
                                {/* Timeline Line */}
                                {i < Math.min(activity.length, 5) - 1 && (
                                    <div className="absolute top-6 left-[7px] w-0.5 h-full bg-border" />
                                )}

                                {/* Timeline Dot */}
                                <div className={cn(
                                    "w-4 h-4 rounded-full border-4 border-card z-10 mt-1",
                                    i === 0 ? "bg-primary" : "bg-muted"
                                )} />

                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                                        {(() => {
                                            try {
                                                return format(new Date(act.created_at), "HH:mm", { locale: ptBR });
                                            } catch {
                                                return "--:--";
                                            }
                                        })()}
                                    </p>
                                    <p className="text-sm text-foreground leading-tight">
                                        <span className="font-bold">{act.profile?.name || "Você"}</span>
                                        {" "}completou{" "}
                                        <span className="font-bold text-primary">
                                            {act.habits?.icon ? `${act.habits.icon} ` : ""}{act.habits?.name || "um hábito"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
