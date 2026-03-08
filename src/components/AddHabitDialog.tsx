import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
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
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("💪");
  const [goalMinutes, setGoalMinutes] = useState("30");
  const [nameError, setNameError] = useState("");
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const { addHabit, habits } = useHabits();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("O nome do hábito é obrigatório.");
      return;
    }
    setNameError("");

    if (habits.length >= 8) {
      toast.error("Limite máximo alcançado!", {
        description: "Você já atingiu o limite de 8 hábitos ativos."
      });
      return;
    }

    addHabit.mutate(
      { name, icon, description, goal_minutes: parseInt(goalMinutes) || 0, target_date: targetDate ? format(targetDate, "yyyy-MM-dd") : null },
      { onSuccess: () => { setOpen(false); setName(""); setDescription(""); setGoalMinutes("30"); setNameError(""); setTargetDate(undefined); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="text-[#25f4f4] gap-2 text-xs uppercase tracking-widest flex items-center">
            <Plus className="w-4 h-4" /> INIT_HABIT
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-background-dark border-[#224949] rounded max-w-md neo-shadow">
        <DialogHeader>
          <DialogTitle className="text-white text-sm uppercase tracking-wider font-bold flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#25f4f4]" /> INIT_NEW_HABIT
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">HABIT_NAME</label>
            <Input
              placeholder="enter_habit_name..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError("");
              }}
              required
              className={`bg-card-dark border-[#224949] text-white rounded text-xs font-bold focus:border-[#25f4f4] focus:ring-[#25f4f4]/30 placeholder:text-slate-400 ${nameError ? "border-red-500" : ""}`}
            />
            {nameError && (
              <p className="text-xs text-red-500 mt-1 font-bold">{nameError}</p>
            )}
          </div>
          <div>
            <label className="text-[10px] text-slate-400 flex justify-between uppercase tracking-widest font-bold mb-2">
              <span>DESCRIPTION</span>
              <span className="text-slate-400">OPTIONAL</span>
            </label>
            <Input
              placeholder="enter_habit_details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-card-dark border-[#224949] text-white rounded text-xs font-bold focus:border-[#25f4f4] focus:ring-[#25f4f4]/30 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">SELECT_ICON</label>
            <div className="flex flex-wrap gap-1">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 flex items-center justify-center text-xl transition-all z-10 ${icon === i
                    ? "bg-[#25f4f4]/10 border border-[#25f4f4] neo-shadow"
                    : "bg-card-dark border border-[#224949] hover:border-[#25f4f4]/50"
                    }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">DAILY_TARGET</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="30"
                value={goalMinutes}
                onChange={(e) => setGoalMinutes(e.target.value)}
                className="pr-20 bg-card-dark border-[#224949] text-white rounded text-xs font-bold focus:border-[#25f4f4]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold uppercase tracking-widest pointer-events-none">
                MINUTES
              </span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">DATA OBJETIVO</label>
            <div className="bg-card-dark border border-[#224949] rounded p-2">
              <Calendar
                mode="single"
                selected={targetDate}
                onSelect={setTargetDate}
                fromDate={new Date()}
                captionLayout="dropdown"
                className="rounded-md shadow-sm"
              />
              {targetDate && (
                <div className="mt-2 text-xs text-primary font-bold flex items-center gap-2">
                  Data escolhida: {format(targetDate, "dd 'de' MMMM 'de' yyyy", { locale: undefined })}
                  <button type="button" className="ml-2 text-xs text-red-500 underline" onClick={() => setTargetDate(undefined)}>Limpar</button>
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#25f4f4] text-white font-bold font-bold py-3 rounded text-xs uppercase tracking-wider neo-shadow hover:neo-shadow hover:bg-[#1ec8c8] transition-all disabled:opacity-50"
            disabled={addHabit.isPending}
          >
            EXECUTE
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
