import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useHabits } from "@/hooks/useHabits";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressCircle } from "@/components/ProgressCircle";

const CalendarPage = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { habits, checkIns, isLoading } = useHabits();

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const getCheckInsForDate = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return checkIns.filter((c) => c.completed_at === dateStr);
    };

    const dayCheckIns = getCheckInsForDate(selectedDate);
    const completionPercentage = habits.length > 0 ? (dayCheckIns.length / habits.length) * 100 : 0;

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-pulse text-muted-foreground">Carregando Calendário...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-0">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Calendar Grid */}
                    <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                        {/* Calendar Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <CalendarIcon className="w-5 h-5" />
                                </div>
                                <h1 className="text-xl font-bold text-foreground capitalize">
                                    {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-lg h-9 w-9">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())} className="px-3 h-9 text-xs font-semibold uppercase tracking-wider">
                                    Hoje
                                </Button>
                                <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-lg h-9 w-9">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Days of Week */}
                        <div className="grid grid-cols-7 bg-secondary/10 border-b border-border">
                            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                                <div key={day} className="py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7">
                            {calendarDays.map((day, idx) => {
                                const dayCheckIns = getCheckInsForDate(day);
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, monthStart);
                                const isTodayDate = isToday(day);

                                return (
                                    <div
                                        key={day.toString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={cn(
                                            "min-h-[70px] md:min-h-[100px] p-2 border-r border-b border-border transition-all cursor-pointer relative group",
                                            !isCurrentMonth && "bg-secondary/5 opacity-30",
                                            isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20 z-10",
                                            idx % 7 === 6 && "border-r-0"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full",
                                            isTodayDate && "bg-primary text-primary-foreground",
                                            !isTodayDate && isSelected && "text-primary",
                                            !isTodayDate && !isSelected && "text-muted-foreground"
                                        )}>
                                            {format(day, "d")}
                                        </span>

                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {dayCheckIns.slice(0, 4).map((c, i) => {
                                                const habit = habits.find(h => h.id === c.habit_id);
                                                return (
                                                    <div
                                                        key={c.id}
                                                        className="w-full h-1 rounded-full bg-primary/40"
                                                        title={habit?.name}
                                                    />
                                                );
                                            })}
                                            {dayCheckIns.length > 4 && (
                                                <div className="text-[8px] font-bold text-primary/60 px-1">
                                                    +{dayCheckIns.length - 4}
                                                </div>
                                            )}
                                        </div>

                                        {dayCheckIns.length === habits.length && habits.length > 0 && (
                                            <div className="absolute top-2 right-2">
                                                <CheckCircle2 className="w-3 h-3 text-streak" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Day Detail Sidebar */}
                    <div className="w-full md:w-80 space-y-6">
                        <Card className="p-6 border-border bg-card shadow-sm">
                            <div className="text-center space-y-4">
                                <div>
                                    <h2 className="text-base font-bold text-foreground">
                                        {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                                    </h2>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-1">
                                        {format(selectedDate, "eeee", { locale: ptBR })}
                                    </p>
                                </div>

                                <div className="flex justify-center py-4 border-y border-border/50">
                                    <ProgressCircle percentage={completionPercentage} size={120} strokeWidth={10} />
                                </div>

                                <div className="text-left space-y-3 pt-2">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Hábitos do Dia</h3>
                                    {habits.length === 0 ? (
                                        <p className="text-sm text-center text-muted-foreground italic py-4">Nenhum hábito cadastrado.</p>
                                    ) : (
                                        habits.map((habit) => {
                                            const isCompleted = dayCheckIns.some(c => c.habit_id === habit.id);
                                            return (
                                                <div key={habit.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-xl border border-transparent hover:border-border transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{habit.icon}</span>
                                                        <span className={cn(
                                                            "text-sm font-medium",
                                                            isCompleted ? "text-foreground line-through opacity-50" : "text-foreground"
                                                        )}>
                                                            {habit.name}
                                                        </span>
                                                    </div>
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="w-5 h-5 text-streak" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-muted-foreground/30" />
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </Card>

                        <div className="bg-primary/5 rounded-2xl border border-primary/10 p-6">
                            <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" /> Dica de Consistência
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Manter uma rotina visual no calendário ajuda a reforçar o hábito. Tente não quebrar a corrente!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CalendarPage;
