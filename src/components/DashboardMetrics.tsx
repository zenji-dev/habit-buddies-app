import { CheckCircle2, Flame, BarChart3, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon: React.ElementType;
    iconColorClass: string;
    subValueColorClass?: string;
    trend?: {
        value: string;
        isUp: boolean;
    };
}

const MetricCard = ({
    label,
    value,
    subValue,
    icon: Icon,
    iconColorClass,
    subValueColorClass,
    trend
}: MetricCardProps) => (
    <Card className="p-4 bg-card border-border flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    {label}
                </p>
                <h3 className="text-2xl font-black text-foreground">
                    {value}
                </h3>
            </div>
            <div className={cn("p-2 rounded-lg", iconColorClass)}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
            {subValue && (
                <p className={cn("text-[10px] font-medium", subValueColorClass || "text-muted-foreground")}>
                    {subValue}
                </p>
            )}
            {trend && (
                <p className={cn(
                    "text-[10px] font-bold flex items-center gap-1",
                    trend.isUp ? "text-primary" : "text-destructive"
                )}>
                    {trend.isUp ? "↑" : "↓"} {trend.value} <span className="text-muted-foreground font-normal">esta semana</span>
                </p>
            )}
        </div>
    </Card>
);

export const DashboardMetrics = ({
    totalHabits,
    streak,
    completionRate,
    todayProgress,
    todayTotal,
    bestStreak
}: {
    totalHabits: number;
    streak: number;
    completionRate: number;
    todayProgress: number;
    todayTotal: number;
    bestStreak?: number;
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                label="Total de Hábitos"
                value={totalHabits.toLocaleString()}
                subValue="Concluídos no total"
                icon={CheckCircle2}
                iconColorClass="bg-streak"
            />
            <MetricCard
                label="Sequência Atual"
                value={`${streak} Dias`}
                subValue={`Melhor: ${bestStreak || streak} dias`}
                subValueColorClass="text-primary font-bold"
                icon={Flame}
                iconColorClass="bg-streak/80"
            />
            <MetricCard
                label="Taxa de Conclusão"
                value={`${Math.round(completionRate)}%`}
                trend={{ value: "5%", isUp: true }}
                icon={BarChart3}
                iconColorClass="bg-purple-500"
            />
            <MetricCard
                label="Foco de Hoje"
                value={`${todayProgress}/${todayTotal}`}
                subValue={`${todayTotal - todayProgress} hábitos restantes`}
                icon={Calendar}
                iconColorClass="bg-blue-500"
            />
        </div>
    );
};
