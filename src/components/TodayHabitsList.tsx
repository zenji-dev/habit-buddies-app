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
                <p className="text-[10px] font-bold text-slate-400">waiting for input...</p>
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
                            "bg-card-dark rounded p-3 text-white shadow-sm cursor-pointer border transition-all group relative overflow-hidden",
                            checked
                                ? "border-[#25f4f4]/50 neo-shadow"
                                : "border-[#224949] hover:border-[#25f4f4]"
                        )}
                    >
                        {/* Left accent bar */}
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1 transition-all",
                            checked
                                ? "bg-[#25f4f4] "
                                : "bg-[#224949] group-hover:bg-[#25f4f4] group-hover:"
                        )} />

                        <div className="flex items-center gap-3 pl-2">
                            {/* ===== ROUND CHECK BUTTON ===== */}
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300",
                                checked
                                    ? "bg-[#25f4f4] border-[#25f4f4] "
                                    : "bg-transparent border-[#224949] group-hover:border-[#25f4f4] group-hover:neo-shadow"
                            )}>
                                {checked ? (
                                    /* Checkmark when done */
                                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                ) : (
                                    /* Emoji icon when not done */
                                    <span className="text-base leading-none text-[#25f4f4] group-hover:scale-110 transition-transform">
                                        {habit.icon || "💪"}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className={cn(
                                    "font-bold font-bold text-sm truncate transition-colors",
                                    checked ? "text-[#25f4f4]" : "text-white group-hover:text-[#25f4f4]"
                                )}>
                                    {habit.name.toUpperCase()}.exe
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-1">
                                    <span className="text-[#25f4f4]">TARGET: {habit.goal_minutes}m</span>
                                    <span className="text-[#224949]">|</span>
                                    <span className="text-slate-400">SEQ: {streak}</span>
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
                        <div className="mt-3 w-full bg-background-dark h-1 rounded overflow-hidden border border-[#224949]">
                            <div className={cn(
                                "h-full transition-all duration-500",
                                checked
                                    ? "bg-[#25f4f4]  w-full"
                                    : "bg-[#25f4f4]/40 w-1/4"
                            )} />
                        </div>
                    </div>
                );
            })}

            {/* Skeleton placeholders */}
            {habits.length === 1 && (
                <div className="mt-4 space-y-4 opacity-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-background-dark border border-[#224949]" />
                        <div className="h-2 bg-background-dark w-full" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-background-dark border border-[#224949]" />
                        <div className="h-2 bg-background-dark w-2/3" />
                    </div>
                </div>
            )}

            {habits.length <= 2 && (
                <div className="mt-6 text-center">
                    <p className="text-[10px] font-bold text-slate-400">waiting for input...</p>
                </div>
            )}
        </div>
    );
};
