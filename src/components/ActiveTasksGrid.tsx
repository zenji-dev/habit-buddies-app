import { format, startOfWeek, addDays, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Check, Flame, Loader2 } from "lucide-react";
import { useMemo } from "react";

interface Habit {
    id: string;
    name: string;
    icon: string;
    goal_minutes: number;
}

interface CheckIn {
    completed_at: string;
    habit_id: string;
}

interface ActiveTasksGridProps {
    habits: Habit[];
    checkIns: CheckIn[];
    isCheckedToday: (habitId: string) => boolean;   // from useHabits — already correct
    getStreak: (habitId: string) => number;          // from useHabits — already correct
    onCheckIn: (id: string) => void;
    onUncheck: (id: string) => void;
    isPending: boolean;
    isUnchecking: boolean;
}

const DAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"]; // kept for future use
const DAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export const ActiveTasksGrid = ({
    habits,
    checkIns,
    isCheckedToday,
    getStreak,
    onCheckIn,
    onUncheck,
    isPending,
    isUnchecking,
}: ActiveTasksGridProps) => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    // Current week only (Sunday → Saturday)
    const currentWeekDays = useMemo(() => {
        const weekStart = startOfWeek(today, { weekStartsOn: 0 });
        return Array.from({ length: 7 }).map((_, dayIdx) => {
            const date = addDays(weekStart, dayIdx);
            const dateStr = format(date, "yyyy-MM-dd");
            return {
                date,
                dateStr,
                isToday: isToday(date),
                isFuture: dateStr > todayStr,
                dayOfWeek: dayIdx,
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [todayStr]);

    // Use raw string comparison (same format as Supabase returns)
    const isCheckedOn = (habitId: string, dateStr: string) =>
        checkIns.some(c => c.habit_id === habitId && c.completed_at.startsWith(dateStr));

    // Completion rate over the current week's past days
    const getRate = (habitId: string) => {
        const pastDays = currentWeekDays.filter(d => !d.isFuture);
        if (!pastDays.length) return 0;
        const done = pastDays.filter(d => isCheckedOn(habitId, d.dateStr)).length;
        return Math.round((done / pastDays.length) * 100);
    };

    const handleToggle = (habitId: string) => {
        if (isPending || isUnchecking) return;
        if (isCheckedToday(habitId)) {
            onUncheck(habitId);
        } else {
            onCheckIn(habitId);
        }
    };

    if (habits.length === 0) {
        return (
            <div className="bg-card-dark border border-slate-900 rounded-none shadow-neon-box p-6">
                <h3 className="text-base font-bold text-white font-mono-tech tracking-wider mb-4">active tasks</h3>
                <p className="text-[10px] font-mono-tech text-gray-600 text-center py-8 uppercase tracking-widest">
                    &gt; waiting for input...
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card-dark border border-slate-900 rounded-none shadow-neon-box relative overflow-hidden h-full flex flex-col">
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full flex-1 min-h-0">
                {/* ─── HEADER ─── */}
                <div className="flex items-stretch border-b border-slate-900 shrink-0">
                    {/* Left col header */}
                    <div className="w-64 shrink-0 px-5 py-3 border-r border-slate-900 flex items-center">
                        <span className="text-base font-bold text-white font-mono-tech tracking-wider">active tasks</span>
                    </div>

                    <div className="flex-1">
                        <div className="flex">
                            {currentWeekDays.map((day, dIdx) => (
                                <div
                                    key={dIdx}
                                    className={cn(
                                        "flex-1 text-center py-3 text-[8px] font-mono-tech uppercase font-bold border-r border-slate-900/60 last:border-r-0",
                                        day.isToday ? "text-[#e66b00]" : "text-gray-600"
                                    )}
                                >
                                    {DAY_NAMES[day.dayOfWeek]}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── HABIT ROWS ─── */}
                <div className="divide-y divide-slate-900 flex-1 flex flex-col min-h-0 overflow-hidden">
                    {habits.map((habit) => {
                        const checked = isCheckedToday(habit.id);
                        const rate = getRate(habit.id);
                        const streak = getStreak(habit.id);
                        const busy = isPending || isUnchecking;

                        return (
                            <div key={habit.id} className="flex-1 min-h-[44px] max-h-[72px] flex items-stretch hover:bg-[#00a375]/[0.03] transition-colors">

                                {/* ─── LEFT: Check-in button + name ─── */}
                                <div className="w-64 shrink-0 px-4 border-r border-slate-900 flex items-center gap-3">
                                    {/* CHECK-IN BUTTON */}
                                    <button
                                        onClick={() => handleToggle(habit.id)}
                                        disabled={busy}
                                        title={checked ? "Clique para desmarcar o check-in de hoje" : "Clique para marcar o check-in de hoje"}
                                        className={cn(
                                            "w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00a375]/50",
                                            checked
                                                ? "bg-[#00a375] border-[#00a375] shadow-[0_0_14px_rgba(0,163,117,0.55)] hover:bg-[#008f66] hover:border-[#008f66]"
                                                : "border-slate-600 bg-transparent hover:border-[#00a375] hover:bg-[#00a375]/10 hover:shadow-[0_0_12px_rgba(0,163,117,0.3)]",
                                            busy && "opacity-40 cursor-not-allowed"
                                        )}
                                    >
                                        {busy ? (
                                            <Loader2 className="w-4 h-4 text-[#00a375] animate-spin" />
                                        ) : checked ? (
                                            <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                        ) : null}
                                    </button>

                                    {/* NAME + STREAK + PROGRESS */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <span className={cn(
                                                "text-sm font-bold font-mono-tech truncate transition-colors",
                                                checked ? "text-[#00a375]" : "text-white"
                                            )}>
                                                {habit.name}
                                            </span>
                                            {streak > 0 && (
                                                <span className="flex items-center gap-0.5 text-[9px] font-mono-tech text-[#e66b00] shrink-0">
                                                    <Flame className="w-3 h-3" />
                                                    {streak}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-[#050a14] border border-slate-900 overflow-hidden">
                                                <div
                                                    className="h-full bg-[#00a375] transition-all duration-500"
                                                    style={{ width: `${rate}%` }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-mono-tech text-[#00a375]/80 w-7 text-right shrink-0">
                                                {rate}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* ─── RIGHT: Weekly dots ─── */}
                                <div className="flex-1 flex">
                                    {currentWeekDays.map((day) => {
                                        const dayChecked = isCheckedOn(habit.id, day.dateStr);
                                        return (
                                            <div
                                                key={day.dateStr}
                                                className="flex-1 flex items-center justify-center border-r border-slate-900/40 last:border-r-0"
                                            >
                                                <div
                                                    title={`${day.dateStr}${dayChecked ? " ✓" : ""}`}
                                                    className={cn(
                                                        "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                                        dayChecked
                                                            ? "bg-[#00a375] border-[#00a375] shadow-[0_0_6px_rgba(0,163,117,0.4)]"
                                                            : day.isToday
                                                                ? "border-[#e66b00] bg-transparent shadow-[0_0_4px_rgba(230,107,0,0.3)]"
                                                                : day.isFuture
                                                                    ? "border-slate-900/30 bg-transparent opacity-20"
                                                                    : "border-slate-700/50 bg-transparent"
                                                    )}
                                                >
                                                    {dayChecked && (
                                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ─── LEGEND ─── */}
                <div className="flex items-center gap-5 px-5 py-2.5 border-t border-slate-900 shrink-0">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#00a375]" />
                        <span className="text-[9px] font-mono-tech text-gray-500 uppercase tracking-wider">Concluído</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full border border-[#e66b00]" />
                        <span className="text-[9px] font-mono-tech text-gray-500 uppercase tracking-wider">Hoje</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full border border-slate-700/50" />
                        <span className="text-[9px] font-mono-tech text-gray-500 uppercase tracking-wider">Não realizado</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                        <Flame className="w-3 h-3 text-[#e66b00]" />
                        <span className="text-[9px] font-mono-tech text-gray-500 uppercase tracking-wider">Streak atual</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
