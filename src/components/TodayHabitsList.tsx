import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <div className="group relative flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all">
            {/* Checkbox */}
            <button
                onClick={onCheckIn}
                disabled={isPending || isChecked}
                className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                    isChecked
                        ? "border-streak bg-streak text-white"
                        : "border-muted-foreground/30 hover:border-streak/50"
                )}
            >
                {isChecked && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={cn(
                        "font-bold text-sm truncate",
                        isChecked ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                        {name}
                    </h3>
                    {isChecked ? (
                        <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                            Feito
                        </span>
                    ) : (
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tabular-nums">
                            {goalMinutes > 0 ? `Progresso` : ""}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <p className="text-[10px] text-muted-foreground truncate">
                        {goalMinutes > 0 ? `Meta: ${goalMinutes} min` : "Rotina diária"} • Sequência: {streak} dias
                    </p>

                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                            className={cn("h-full transition-all duration-500", isChecked ? "bg-primary w-full" : "bg-primary/30 w-0")}
                        />
                    </div>
                </div>
            </div>

            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                {icon}
            </div>
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
    isPending
}: {
    habits: Habit[];
    checkIns: CheckIn[];
    getStreak: (id: string) => number;
    isCheckedToday: (id: string) => boolean;
    onCheckIn: (id: string) => void;
    isPending: boolean;
}) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Hábitos de Hoje</h2>
                <div className="flex gap-2">
                    {["Todos", "Manhã", "Noite"].map((filter) => (
                        <button
                            key={filter}
                            className={cn(
                                "px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all",
                                filter === "Todos" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

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
                        onCheckIn={() => onCheckIn(habit.id)}
                        isPending={isPending}
                    />
                ))}

                {habits.length === 0 && (
                    <div className="p-12 border-2 border-dashed border-border rounded-xl text-center">
                        <p className="text-muted-foreground italic">Nenhum hábito cadastrado. Adicione um para começar!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
