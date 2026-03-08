import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useHabits } from "@/hooks/useHabits";
import { Trash2, Settings2, Terminal } from "lucide-react";

interface MyHabitsDialogProps {
    children?: React.ReactNode;
}

export const MyHabitsDialog = ({ children }: MyHabitsDialogProps) => {
    const [open, setOpen] = useState(false);
    const { habits, deleteHabit } = useHabits();

    const handleDelete = (id: string) => {
        if (confirm("CONFIRM: DELETE habit and all associated data?")) {
            deleteHabit.mutate(id);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <button className="gap-2 border border-[#224949] hover:border-[#25f4f4] text-[#25f4f4] rounded px-4 py-2 text-xs uppercase tracking-widest font-bold flex items-center">
                        <Settings2 className="w-4 h-4" /> CONFIG_HABITS
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="glass-panel rounded max-w-md p-0 overflow-hidden neo-shadow">
                <DialogHeader className="p-5 pb-3 border-b border-[#224949]">
                    <DialogTitle className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider font-bold">
                        <Settings2 className="w-4 h-4 text-[#25f4f4]" />
                        CONFIG_HABITS
                    </DialogTitle>
                </DialogHeader>

                <div className="p-5 pt-4 space-y-1">
                    {habits.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-[#224949]">
                            <Terminal className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">NO_HABITS_INITIALIZED</p>
                        </div>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-1">
                            {habits.map((habit) => (
                                <div
                                    key={habit.id}
                                    className="flex items-center justify-between p-3 bg-card-dark border border-[#224949] hover:border-[#25f4f4]/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 border border-[#224949] group-hover:border-[#25f4f4] flex items-center justify-center text-lg bg-background-dark transition-colors">
                                            {habit.icon || "💪"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-white uppercase tracking-wider font-bold group-hover:text-[#25f4f4] transition-colors">
                                                {habit.name}
                                            </p>
                                            {habit.goal_minutes > 0 && (
                                                <p className="text-[9px] text-slate-400 font-bold">
                                                    TARGET: {habit.goal_minutes}m
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(habit.id)}
                                        className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-500/30"
                                        disabled={deleteHabit.isPending}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 bg-card-dark border-t border-[#224949]">
                    <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-[0.3em]">
                        HABIT_BUDDIES :: CONFIG_MODULE
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
