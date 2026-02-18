import { Card } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

export const MonthlyChallenge = ({ currentDay, totalDays }: { currentDay: number; totalDays: number }) => {
    const percentage = Math.round((currentDay / totalDays) * 100);

    return (
        <Card className="p-6 bg-card border-border overflow-hidden relative group">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />

            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold text-streak uppercase bg-streak/10 px-2 py-1 rounded">
                        Desafio Mensal
                    </span>
                </div>

                <h3 className="text-xl font-black text-foreground mb-2">30 Dias de Fitness</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    Complete um treino todos os dias por 30 dias para ganhar o badge de Ferro.
                </p>

                <div className="mt-auto">
                    <div className="flex justify-between items-end mb-2">
                        <p className="text-xs font-bold text-foreground">Dia {currentDay}/{totalDays}</p>
                        <p className="text-xs font-black text-streak">{percentage}%</p>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-streak transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>

            <Dumbbell className="absolute top-1/2 -right-4 w-20 h-20 text-foreground/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </Card>
    );
};
