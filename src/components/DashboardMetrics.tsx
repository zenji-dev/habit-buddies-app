import { BarChart3, Zap, TrendingUp, Target } from "lucide-react";

interface DashboardMetricsProps {
    totalHabits: number;
    totalCompleted: number;
    streak: number;
    completionRate: number;
    todayProgress: number;
    todayTotal: number;
    bestStreak: number;
    completionTrend: { value: string; isUp: boolean };
}

interface MetricCardProps {
    label: string;
    value: string | number;
    subLabel: string;
    subHighlight?: boolean;
    icon: React.ElementType;
    valueColor?: string;
}

const MetricCard = ({ label, value, subLabel, subHighlight = false, icon: Icon, valueColor }: MetricCardProps) => (
    <div className="bg-card-dark neo-border neo-shadow rounded p-3 flex flex-col justify-between text-white relative group overflow-hidden transition-all duration-300 h-full min-h-[100px] hover:border-[#25f4f4]">
        <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#25f4f4]">
                {label}
            </span>
            <div className="text-[#25f4f4] group-hover:scale-110 transition-transform">
                <Icon className="w-3.5 h-3.5" />
            </div>
        </div>

        <div className="relative z-10 mt-auto pt-2">
            <span className={`text-3xl font-black leading-none ${valueColor || "text-white group-hover:text-[#25f4f4]"} transition-colors`}>
                {value}
            </span>
            <p className={`text-[9px] mt-1.5 uppercase tracking-wider ${subHighlight ? "text-[#25f4f4]" : "text-slate-500"}`}>
                {subLabel}
            </p>
        </div>
    </div>
);

export const DashboardMetrics = ({
    totalHabits,
    totalCompleted,
    streak,
    completionRate,
    todayProgress,
    todayTotal,
    bestStreak,
    completionTrend,
}: DashboardMetricsProps) => {
    return (
        <div className="grid grid-cols-2 gap-3">
            <MetricCard
                label="Total Habits 📊"
                value={totalHabits}
                subLabel={`ACTIVE_SESSIONS: ${totalCompleted > 0 ? String(totalCompleted).padStart(2, "0") : "00"}`}
                icon={BarChart3}
            />
            <MetricCard
                label="Streak.sys ⚡"
                value={streak}
                subLabel={`HIGHEST: ${bestStreak}`}
                subHighlight={true}
                icon={Zap}
                valueColor="text-[#25f4f4]"
            />
            <MetricCard
                label="Comp. Rate ↗"
                value={`${Math.round(completionRate)}%`}
                subLabel={`WEEKLY_DELTA: ${completionTrend.isUp ? "+" : "-"}${completionTrend.value}`}
                subHighlight={true}
                icon={TrendingUp}
            />
            <MetricCard
                label="Target.lock ⊙"
                value={String(todayTotal - todayProgress).padStart(2, "0")}
                subLabel="CRITICAL_HABITS"
                icon={Target}
            />
        </div>
    );
};
