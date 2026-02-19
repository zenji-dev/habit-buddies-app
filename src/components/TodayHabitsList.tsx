import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { Button } from "@/components/ui/button";

interface HabitItemProps {
    id: string;
    name: string;
    icon: string;
    goalMinutes: number;
    streak: number;
    isChecked: boolean;
    onCheckIn: () => void;
    isPending: boolean;
}

const HabitItem = ({
    name,
    icon,
    goalMinutes,
    streak,
    isChecked,
    onCheckIn,
    isPending,
}: HabitItemProps) => {
    return (
        <div className="group flex items-center gap-5 p-5 bg-card hover:bg-secondary/20 border border-border/50 rounded-2xl transition-all duration-300 shadow-md shadow-black/30 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 relative overflow-hidden">
            {/* Checkbox Circle */}
            <button
                onClick={onCheckIn}
                disabled={isPending || isChecked}
                className={cn(
                    "w-12 h-12 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 shrink-0 z-10",
                    isChecked
                        ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-100"
                        : "border-muted-foreground/20 hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50 scale-95 hover:scale-100"
                )}
            >
                {isChecked && <Check className="w-6 h-6 stroke-[3] animate-check-bounce" />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0 z-10">
                <div className="flex justify-between items-center mb-1.5">
                    <h3 className={cn(
                        "font-bold text-base truncate transition-colors",
                        isChecked ? "text-muted-foreground line-through decoration-primary/50 decoration-2" : "text-foreground"
                    )}>
                        {name}
                    </h3>
                    {isChecked ? (
                        <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-1 rounded-md tracking-wider">
                            Done
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                            Em andamento
                        </span>
                    )}
                </div>

                <p className="text-xs text-muted-foreground font-medium mb-3 flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full", isChecked ? "bg-primary" : "bg-muted-foreground/50")}></span>
                    {goalMinutes > 0 ? `Meta: ${goalMinutes}m` : "Meta Diária"} <span className="text-border mx-1">|</span> Sequência: {streak} dias
                </p>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-700 ease-out", isChecked ? "bg-primary w-full" : "bg-primary/50 w-0 opacity-50")}
                    />
                </div>
            </div>

            {/* Right Icon */}
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors z-10",
                isChecked ? "bg-primary/10 text-primary" : "bg-secondary/50 text-muted-foreground"
            )}>
                <span className="text-2xl drop-shadow-sm">{icon}</span>
            </div>

            {/* Background Gradient for completed */}
            {isChecked && <div className="absolute inset-0 bg-primary/5 pointer-events-none z-0" />}
        </div>
    );
};

interface Habit {
    id: string;
    name: string;
    icon: string;
    goal_minutes?: number;
}

interface CheckIn {
    habit_id: string;
    completed_at: string;
}

export const TodayHabitsList = ({
    habits,
    checkIns,
    getStreak,
    isCheckedToday,
    onCheckIn,
    onUncheck,
    isPending,
    isUnchecking
}: {
    habits: Habit[];
    checkIns: CheckIn[];
    getStreak: (id: string) => number;
    isCheckedToday: (id: string) => boolean;
    onCheckIn: (id: string) => void;
    onUncheck: (id: string) => void;
    isPending: boolean;
    isUnchecking: boolean;
}) => {
    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {habits.map((habit) => (
                    <HabitItem
                        key={habit.id}
                        id={habit.id}
                        name={habit.name}
                        icon={habit.icon}
                        goalMinutes={habit.goal_minutes || 0}
                        streak={getStreak(habit.id)}
                        isChecked={isCheckedToday(habit.id)}
                        onCheckIn={() => {
                            if (isCheckedToday(habit.id)) {
                                onUncheck(habit.id);
                            } else {
                                onCheckIn(habit.id);
                            }
                        }}
                        isPending={isPending || isUnchecking}
                    />
                ))}

                {/* 
                    Estado vazio: substituímos o ícone de brilhos por um botão '+' 
                    que abre o diálogo de criação de hábito diretamente ao ser clicado.
                */}
                {habits.length === 0 && (
                    <div className="p-12 border-2 border-dashed border-border/50 rounded-2xl text-center bg-card/50">
                        <AddHabitDialog>
                            <button className="w-16 h-16 bg-primary/10 hover:bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 transition-all hover:scale-110 group">
                                <Plus className="w-8 h-8 transition-transform group-hover:rotate-90" />
                            </button>
                        </AddHabitDialog>
                        <h3 className="text-foreground font-bold mb-1">Nenhum hábito encontrado</h3>
                        <p className="text-muted-foreground text-sm">Adicione um novo hábito para começar sua jornada!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
