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
                    <button className="gap-2 border border-slate-900 hover:border-[#00a375] text-[#00a375] rounded-none px-4 py-2 text-xs uppercase tracking-widest font-mono-tech flex items-center">
                        <Settings2 className="w-4 h-4" /> CONFIG_HABITS
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-background-dark border-slate-900 rounded-none max-w-md p-0 overflow-hidden shadow-neon-box">
                <DialogHeader className="p-5 pb-3 border-b border-slate-900">
                    <DialogTitle className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider font-mono-tech">
                        <Settings2 className="w-4 h-4 text-[#00a375]" />
                        CONFIG_HABITS
                    </DialogTitle>
                </DialogHeader>

                <div className="p-5 pt-4 space-y-1">
                    {habits.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-slate-900">
                            <Terminal className="w-8 h-8 text-gray-800 mx-auto mb-3" />
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono-tech">NO_HABITS_INITIALIZED</p>
                        </div>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-1">
                            {habits.map((habit) => (
                                <div
                                    key={habit.id}
                                    className="flex items-center justify-between p-3 bg-card-dark border border-slate-900 hover:border-[#00a375]/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 border border-slate-800 group-hover:border-[#00a375] flex items-center justify-center text-lg bg-background-dark transition-colors">
                                            {habit.icon || "💪"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-white uppercase tracking-wider font-mono-tech group-hover:text-[#00a375] transition-colors">
                                                {habit.name}
                                            </p>
                                            {habit.goal_minutes > 0 && (
                                                <p className="text-[9px] text-gray-500 font-mono-tech">
                                                    TARGET: {habit.goal_minutes}m
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(habit.id)}
                                        className="h-8 w-8 flex items-center justify-center text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-none opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-500/30"
                                        disabled={deleteHabit.isPending}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 bg-card-dark border-t border-slate-900">
                    <p className="text-[8px] text-center text-gray-700 font-mono-tech uppercase tracking-[0.3em]">
                        HABIT_BUDDIES :: CONFIG_MODULE
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
