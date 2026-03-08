import { format, startOfWeek, addDays, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Check, Flame, Loader2, Terminal } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Habit {
    id: string;
    name: string;
    icon: string;
    goal_minutes: number;
    description?: string | null;
}

interface CheckIn {
    completed_at: string;
    habit_id: string;
}

interface ActiveTasksGridProps {
    habits: Habit[];
    checkIns: CheckIn[];
    isCheckedToday: (habitId: string) => boolean;
    getStreak: (habitId: string) => number;
    onCheckIn: (id: string) => void;
    onUncheck: (id: string) => void;
    isPending: boolean;
    isUnchecking: boolean;
    isLoading?: boolean;
}

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
    isLoading,
}: ActiveTasksGridProps) => {
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

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

    const isCheckedOn = (habitId: string, dateStr: string) =>
        checkIns.some(c => c.habit_id === habitId && c.completed_at.startsWith(dateStr));

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

    const visibleHabits = habits.slice(0, 8);

    if (isLoading) {
        return (
            <div className="glass-panel rounded-none shadow-neon-box p-6 flex flex-col">
                <h3 className="text-sm font-bold text-[#00a375] font-mono-tech tracking-wider mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    active_tasks.sys
                </h3>
                <div className="flex-1 flex flex-col justify-center gap-3 px-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-8 h-8 bg-slate-800 rounded-none" />
                            <div className="flex-1 h-3 bg-slate-800 rounded-none" style={{ width: `${60 + i * 10}%` }} />
                            <div className="w-16 h-3 bg-slate-800 rounded-none" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (visibleHabits.length === 0) {
        return (
            <div className="glass-panel rounded-none shadow-neon-box p-6 flex flex-col">
                <h3 className="text-sm font-bold text-[#00a375] font-mono-tech tracking-wider mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    active_tasks.sys
                </h3>
                <div className="flex-1 flex items-center justify-center py-8">
                    <p className="text-[10px] font-mono-tech text-gray-600 uppercase tracking-widest">
                        &gt; waiting for input...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-none shadow-neon-box relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

            <div className="relative z-10 flex flex-col">
                {/* ─── HEADER ─── */}
                <div className="px-4 py-2.5 border-b border-[#00a375]/30 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#00a375]" />
                    <span className="text-sm font-bold text-[#00a375] font-mono-tech tracking-wider">active_tasks.sys</span>
                </div>

                {/* ─── TABLE HEADER ─── */}
                <div className="shrink-0 flex items-stretch border-b border-[#00a375]/30">
                    <div className="w-48 shrink-0 px-4 py-2 border-r border-[#00a375]/30 flex items-center">
                        <span className="text-[10px] font-bold text-gray-500 font-mono-tech tracking-wider uppercase">HABIT_PROTOCOL</span>
                    </div>

                    <div className="flex-1">
                        <div className="flex h-full">
                            {currentWeekDays.map((day, dIdx) => (
                                <div
                                    key={dIdx}
                                    className={cn(
                                        "flex-1 flex items-center justify-center text-[10px] font-mono-tech uppercase font-bold border-r border-[#00a375]/30 last:border-r-0 py-2",
                                        day.isToday ? "text-[#e66b00] bg-[#e66b00]/5" : "text-gray-500"
                                    )}
                                >
                                    {DAY_NAMES[day.dayOfWeek]}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Intensity header */}
                    <div className="w-28 shrink-0 px-3 py-2 flex items-center justify-center border-l border-[#00a375]/30">
                        <span className="text-[10px] font-bold text-gray-500 font-mono-tech tracking-wider uppercase">INTENSITY</span>
                    </div>
                </div>

                {/* ─── HABIT ROWS ─── */}
                <div className="flex flex-col">
                    {visibleHabits.map((habit) => {
                        const checked = isCheckedToday(habit.id);
                        const rate = getRate(habit.id);
                        const busy = isPending || isUnchecking;

                        // Intensity bar color based on rate
                        const barColor = rate >= 80 ? "#00a375" : rate >= 50 ? "#00a375" : rate >= 30 ? "#e66b00" : "#1a3a5c";

                        return (
                            <div key={habit.id} className="flex items-stretch hover:bg-[#00a375]/[0.03] transition-all duration-300 border-b border-[#00a375]/20 last:border-b-0">

                                {/* ─── LEFT: Name ─── */}
                                <div className="w-48 shrink-0 px-4 py-3 border-r border-[#00a375]/30 flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedHabit(habit)}
                                        className={cn(
                                            "text-[11px] font-bold font-mono-tech truncate transition-colors text-left hover:underline uppercase",
                                            checked ? "text-[#00a375]" : "text-white/70 hover:text-[#00a375]"
                                        )}>
                                        {habit.name}
                                    </button>
                                </div>

                                {/* ─── CENTER: Weekly checkboxes ─── */}
                                <div className="flex-1 flex items-stretch">
                                    <div className="flex flex-1">
                                        {currentWeekDays.map((day) => {
                                            const dayChecked = isCheckedOn(habit.id, day.dateStr);
                                            const isTodayCell = day.isToday;
                                            const canToggle = isTodayCell && !busy;

                                            return (
                                                <div
                                                    key={day.dateStr}
                                                    className={cn(
                                                        "flex-1 flex items-center justify-center border-r border-[#00a375]/30 last:border-r-0",
                                                        isTodayCell && "bg-[#e66b00]/5"
                                                    )}
                                                >
                                                    <button
                                                        onClick={() => canToggle && handleToggle(habit.id)}
                                                        disabled={!canToggle}
                                                        title={dayChecked ? (isTodayCell ? "Desmarcar" : day.dateStr) : (isTodayCell ? "Check-in" : day.dateStr)}
                                                        className={cn(
                                                            "w-4 h-4 border flex items-center justify-center transition-all",
                                                            dayChecked
                                                                ? "bg-[#00a375] border-[#00a375] shadow-[0_0_6px_rgba(0,163,117,0.4)]"
                                                                : isTodayCell
                                                                    ? "border-[#e66b00]/50 bg-transparent hover:border-[#e66b00] cursor-pointer"
                                                                    : day.isFuture
                                                                        ? "border-slate-900/30 bg-transparent opacity-20"
                                                                        : "border-slate-700/50 bg-transparent",
                                                            canToggle && !dayChecked && "hover:border-[#00a375] hover:shadow-[0_0_6px_rgba(0,163,117,0.3)] cursor-pointer",
                                                            busy && isTodayCell && "opacity-40 cursor-not-allowed"
                                                        )}
                                                    >
                                                        {busy && isTodayCell ? (
                                                            <Loader2 className="w-2.5 h-2.5 text-[#00a375] animate-spin" />
                                                        ) : dayChecked ? (
                                                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                                        ) : null}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ─── RIGHT: Intensity bar ─── */}
                                <div className="w-28 shrink-0 px-3 py-3 flex items-center border-l border-[#00a375]/30">
                                    <div className="w-full h-2 bg-[#050a14] border border-[#00a375]/20 overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-700"
                                            style={{
                                                width: `${rate}%`,
                                                background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                                                boxShadow: rate > 50 ? `0 0 8px ${barColor}66` : "none",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Habit Detail Dialog */}
            <Dialog open={!!selectedHabit} onOpenChange={(open) => !open && setSelectedHabit(null)}>
                <DialogContent className="bg-background-dark border-slate-900 rounded-none max-w-sm shadow-neon-box">
                    <DialogHeader>
                        <DialogTitle className="text-white text-base uppercase tracking-wider font-mono-tech flex items-center gap-3">
                            <span className="text-[#00a375] text-xl bg-[#00a375]/10 w-8 h-8 flex items-center justify-center border border-[#00a375]/30">{selectedHabit?.icon}</span>
                            {selectedHabit?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-mono-tech mb-2">DESCRIPTION</h4>
                        <div className="bg-card-dark border border-slate-900 p-3 rounded-none relative">
                            <p className="text-xs font-mono-tech text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {selectedHabit?.description || "> no_description_provided"}
                            </p>
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00a375]/50 -mt-[1px] -mr-[1px]" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00a375]/50 -mb-[1px] -ml-[1px]" />
                        </div>
                        {selectedHabit?.goal_minutes ? (
                            <div className="mt-5">
                                <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-mono-tech mb-2">DAILY_TARGET</h4>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00a375]/10 border border-[#00a375]/30">
                                    <span className="text-sm font-bold font-mono-tech text-[#00a375]">{selectedHabit.goal_minutes}</span>
                                    <span className="text-[10px] text-[#00a375]/70 font-mono-tech tracking-widest">MINUTES</span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
