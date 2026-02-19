import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHabits } from "@/hooks/useHabits";
import { Trash2, Settings2, Sparkles } from "lucide-react";

interface MyHabitsDialogProps {
    children?: React.ReactNode;
}

export const MyHabitsDialog = ({ children }: MyHabitsDialogProps) => {
    const [open, setOpen] = useState(false);
    const { habits, deleteHabit } = useHabits();

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja excluir este hábito por completo? Todo o histórico será perdido.")) {
            deleteHabit.mutate(id);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? (
                    children
                ) : (
                    <Button variant="outline" className="gap-2 border-border hover:bg-secondary rounded-xl px-4 h-10 transition-all font-bold">
                        <Settings2 className="w-4 h-4" /> Meus Hábitos
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-card border-border shadow-2xl rounded-2xl max-w-md p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-xl font-black">
                        <Settings2 className="w-5 h-5 text-primary" />
                        Meus Hábitos
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-3">
                    {habits.length === 0 ? (
                        <div className="text-center py-8 space-y-3 bg-secondary/20 rounded-2xl border border-dashed border-border">
                            <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                            <p className="text-sm text-muted-foreground">Você ainda não tem hábitos criados.</p>
                        </div>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                            {habits.map((habit) => (
                                <div
                                    key={habit.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-xl shadow-sm border border-border group-hover:scale-110 transition-transform">
                                            {habit.icon || "💪"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-foreground">{habit.name}</p>
                                            {habit.goal_minutes > 0 && (
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                                    Meta: {habit.goal_minutes} min
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(habit.id)}
                                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                        disabled={deleteHabit.isPending}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-secondary/20 border-t border-border mt-2">
                    <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest">
                        Habit Buddies • Gerenciamento
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
