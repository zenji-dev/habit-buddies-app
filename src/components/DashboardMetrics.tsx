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
}

const MetricCard = ({ label, value, subLabel, subHighlight = false, icon: Icon }: MetricCardProps) => (
    <div className="bg-card-dark border border-slate-900 hover:border-[#00a375]/50 rounded-none p-2.5 text-white relative group overflow-hidden shadow-neon-box transition-all duration-300">
        {/* Orange status dot */}
        <div className="absolute top-0 right-0 p-1">
            <div className="w-1.5 h-1.5 bg-[#e66b00] rounded-full group-hover:shadow-[0_0_5px_#e66b00] transition-all" />
        </div>

        <div className="flex justify-between items-start mb-1 relative z-10">
            <span className="text-[11px] font-mono-tech font-bold uppercase tracking-widest text-[#00a375]/70">
                {label}
            </span>
            <div className="text-[#00a375] group-hover:scale-110 transition-transform">
                <Icon className="w-[16px] h-[16px]" />
            </div>
        </div>

        <div className="relative z-10 mt-1">
            <span className="text-2xl font-bold font-mono-tech text-white group-hover:text-[#00a375] transition-colors">
                {value}
            </span>
            <p className={`text-[10px] mt-0.5 font-mono-tech border-t border-slate-900 pt-1 group-hover:border-[#00a375]/30 ${subHighlight ? "text-[#00a375]" : "text-gray-500 group-hover:text-[#00a375]/80"
                }`}>
                {subLabel}
            </p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#00a375]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            <MetricCard
                label="Total Habits"
                value={totalHabits}
                subLabel={`Check-ins: ${totalCompleted > 0 ? "OK" : "PENDING"}`}
                icon={BarChart3}
            />
            <MetricCard
                label="Streak.sys"
                value={`${streak}`}
                subLabel={`Peak: ${bestStreak} day${bestStreak !== 1 ? "s" : ""}`}
                subHighlight={true}
                icon={Zap}
            />
            <MetricCard
                label="Comp. Rate"
                value={`${Math.round(completionRate)}%`}
                subLabel={`${completionTrend.isUp ? "+" : "-"}${completionTrend.value} WEEK`}
                subHighlight={true}
                icon={TrendingUp}
            />
            <MetricCard
                label="Target.lock"
                value={`${todayProgress}/${todayTotal}`}
                subLabel={`${todayTotal - todayProgress} remaining`}
                icon={Target}
            />
        </div>
    );
};
