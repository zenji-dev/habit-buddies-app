import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";
import { toast } from "sonner";

const ICONS = ["💪", "📖", "📚", "🏃", "🧘", "💻", "🎵", "🥗", "💤", "🌊"];

interface AddHabitDialogProps {
  children?: React.ReactNode;
}

export const AddHabitDialog = ({ children }: AddHabitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💪");
  const [goalMinutes, setGoalMinutes] = useState("30");
  const { addHabit, habits } = useHabits();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (habits.length >= 8) {
      toast.error("Limite máximo alcançado!", {
        description: "Você já atingiu o limite de 8 hábitos ativos."
      });
      return;
    }

    addHabit.mutate(
      { name, icon, goal_minutes: parseInt(goalMinutes) || 0 },
      { onSuccess: () => { setOpen(false); setName(""); setGoalMinutes("30"); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="text-[#00a375] gap-2 text-xs uppercase tracking-widest flex items-center">
            <Plus className="w-4 h-4" /> INIT_HABIT
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-background-dark border-slate-900 rounded-none max-w-md shadow-neon-box">
        <DialogHeader>
          <DialogTitle className="text-white text-sm uppercase tracking-wider font-mono-tech flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#00a375]" /> INIT_NEW_HABIT
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono-tech block mb-2">HABIT_NAME</label>
            <Input
              placeholder="enter_habit_name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-card-dark border-slate-900 text-white rounded-none text-xs font-mono-tech focus:border-[#00a375] focus:ring-[#00a375]/30 placeholder:text-gray-600"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono-tech block mb-2">SELECT_ICON</label>
            <div className="flex flex-wrap gap-1">
              {ICONS.map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 flex items-center justify-center text-xl transition-all ${icon === i
                    ? "bg-[#00a375]/10 border border-[#00a375] shadow-[0_0_5px_rgba(0,163,117,0.3)]"
                    : "bg-card-dark border border-slate-900 hover:border-[#00a375]/50"
                    }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono-tech block mb-2">DAILY_TARGET</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="30"
                value={goalMinutes}
                onChange={(e) => setGoalMinutes(e.target.value)}
                className="pr-20 bg-card-dark border-slate-900 text-white rounded-none text-xs font-mono-tech focus:border-[#00a375]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-600 font-mono-tech uppercase tracking-widest pointer-events-none">
                MINUTES
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#00a375] text-white font-bold font-mono-tech py-3 rounded-none text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,163,117,0.4)] hover:shadow-[0_0_25px_rgba(0,163,117,0.6)] hover:bg-[#008f66] transition-all disabled:opacity-50"
            disabled={addHabit.isPending}
          >
            EXECUTE
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
