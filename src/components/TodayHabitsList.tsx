import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Habit {
    id: string;
    name: string;
    icon: string;
    goal_minutes: number;
}

interface CheckIn {
    habit_id: string;
    completed_at: string;
}

interface TodayHabitsListProps {
    habits: Habit[];
    checkIns: CheckIn[];
    getStreak: (id: string) => number;
    isCheckedToday: (id: string) => boolean;
    onCheckIn: (id: string) => void;
    onUncheck: (id: string) => void;
    isPending: boolean;
    isUnchecking: boolean;
}

export const TodayHabitsList = ({
    habits,
    checkIns,
    getStreak,
    isCheckedToday,
    onCheckIn,
    onUncheck,
    isPending,
    isUnchecking,
}: TodayHabitsListProps) => {
    if (habits.length === 0) {
        return (
            <div className="mt-8 text-center py-6">
                <p className="text-[10px] font-mono-tech text-gray-600">waiting for input...</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {habits.map((habit) => {
                const checked = isCheckedToday(habit.id);
                const streak = getStreak(habit.id);

                return (
                    <div
                        key={habit.id}
                        onClick={() => {
                            if (isPending || isUnchecking) return;
                            checked ? onUncheck(habit.id) : onCheckIn(habit.id);
                        }}
                        className={cn(
                            "bg-surface-dark rounded-none p-3 text-white shadow-sm cursor-pointer border transition-all group relative overflow-hidden",
                            checked
                                ? "border-[#00a375]/50 shadow-[0_0_10px_rgba(0,163,117,0.1)]"
                                : "border-slate-900 hover:border-[#00a375]"
                        )}
                    >
                        {/* Left accent bar */}
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1 transition-all",
                            checked
                                ? "bg-[#00a375] shadow-[0_0_10px_#00a375]"
                                : "bg-slate-800 group-hover:bg-[#00a375] group-hover:shadow-[0_0_10px_#00a375]"
                        )} />

                        <div className="flex items-center gap-3 pl-2">
                            {/* ===== ROUND CHECK BUTTON ===== */}
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300",
                                checked
                                    ? "bg-[#00a375] border-[#00a375] shadow-[0_0_12px_rgba(0,163,117,0.6)]"
                                    : "bg-transparent border-slate-700 group-hover:border-[#00a375] group-hover:shadow-[0_0_8px_rgba(0,163,117,0.3)]"
                            )}>
                                {checked ? (
                                    /* Checkmark when done */
                                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                ) : (
                                    /* Emoji icon when not done */
                                    <span className="text-base leading-none text-[#00a375] group-hover:scale-110 transition-transform">
                                        {habit.icon || "💪"}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                    "font-bold font-mono-tech text-sm truncate transition-colors",
                                    checked ? "text-[#00a375]" : "text-white group-hover:text-[#00a375]"
                                )}>
                                    {habit.name.toUpperCase()}.exe
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono-tech mt-1">
                                    <span className="text-[#00a375]">TARGET: {habit.goal_minutes}m</span>
                                    <span className="text-slate-800">|</span>
                                    <span className="text-gray-400">SEQ: {streak}</span>
                                </div>
                            </div>

                            {/* Right emoji icon — always teal tinted */}
                            <div className={cn(
                                "shrink-0 text-lg transition-all duration-300",
                                checked ? "opacity-100 grayscale-0" : "opacity-40 group-hover:opacity-80"
                            )}>
                                {habit.icon}
                            </div>
                        </div>

                        {/* Progress bar — orange accent */}
                        <div className="mt-3 w-full bg-[#050a14] h-1 rounded-none overflow-hidden border border-slate-900">
                            <div className={cn(
                                "h-full transition-all duration-500",
                                checked
                                    ? "bg-[#e66b00] shadow-[0_0_8px_#e66b00] w-full"
                                    : "bg-[#e66b00]/40 w-1/4"
                            )} />
                        </div>
                    </div>
                );
            })}

            {/* Skeleton placeholders */}
            {habits.length === 1 && (
                <div className="mt-4 space-y-4 opacity-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800" />
                        <div className="h-2 bg-slate-900 w-full" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800" />
                        <div className="h-2 bg-slate-900 w-2/3" />
                    </div>
                </div>
            )}

            {habits.length <= 2 && (
                <div className="mt-6 text-center">
                    <p className="text-[10px] font-mono-tech text-gray-600">waiting for input...</p>
                </div>
            )}
        </div>
    );
};
