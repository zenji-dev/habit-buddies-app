import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CheckIn {
    completed_at: string;
    habit_id: string;
    user_id: string;
    id: string;
}

interface DayStreak {
    date: Date;
    status: "completed" | "partial" | "none";
    isToday: boolean;
}

export const WeeklyStreak = ({ checkIns, habitsCount }: { checkIns: CheckIn[], habitsCount: number }) => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday

    const days: DayStreak[] = Array.from({ length: 7 }).map((_, i) => {
        const date = addDays(start, i);
        const dateStr = format(date, "yyyy-MM-dd");
        const dayCheckIns = checkIns.filter(c => c.completed_at === dateStr).length;

        let status: "completed" | "partial" | "none" = "none";
        if (dayCheckIns >= habitsCount && habitsCount > 0) status = "completed";
        else if (dayCheckIns > 0) status = "partial";

        return {
            date,
            status,
            isToday: isToday(date)
        };
    });

    return (
        /* 
           Visualização do progresso semanal. 
           Mostra o status de cada dia com uma linha conectora para indicar fluxo.
        */
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg shadow-black/20 hover:shadow-black/30 transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-foreground">Sequência Semanal</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    {format(start, "MMM d")} - {format(addDays(start, 6), "MMM d")}
                </p>
            </div>

            <div className="flex justify-between items-center relative">
                {/* Connection Line */}
                <div className="absolute top-[47px] left-0 w-full h-0.5 bg-border z-0" />

                {days.map((day, i) => {
                    const isDone = day.status === "completed";
                    const isPartial = day.status === "partial";

                    return (
                        <div key={i} className="flex flex-col items-center gap-3 relative z-10 w-full">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                {format(day.date, "eee", { locale: ptBR })}
                            </span>

                            <div className={cn(
                                "w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all bg-card",
                                isDone ? "border-streak bg-streak text-white" :
                                    isPartial ? "border-streak/40 text-streak" :
                                        "border-border text-muted-foreground"
                            )}>
                                {isDone ? (
                                    <Check className="w-5 h-5" />
                                ) : isPartial ? (
                                    <span className="text-[10px] font-black">50%</span>
                                ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                )}
                            </div>

                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider h-4",
                                day.isToday ? "text-streak" : "text-transparent"
                            )}>
                                {day.isToday ? "Hoje" : ""}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
