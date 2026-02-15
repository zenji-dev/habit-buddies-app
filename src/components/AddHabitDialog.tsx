import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useHabits } from "@/hooks/useHabits";

const ICONS = ["💪", "📖", "📚", "🏃", "🧘", "💻", "🎵", "🥗", "💤", "🌊"];


interface AddHabitDialogProps {
  children?: React.ReactNode;
}

export const AddHabitDialog = ({ children }: AddHabitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💪");
  const [goalMinutes, setGoalMinutes] = useState("30");
  const { addHabit } = useHabits();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addHabit.mutate(
      { name, icon, goal_minutes: parseInt(goalMinutes) || 0 },
      { onSuccess: () => { setOpen(false); setName(""); setGoalMinutes("30"); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant="ghost" className="text-primary gap-2">
            <Plus className="w-4 h-4" /> Novo Hábito
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Hábito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Nome do hábito" value={name} onChange={(e) => setName(e.target.value)} required />
          <div>
            <p className="text-sm text-muted-foreground mb-2">Ícone</p>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${icon === i ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary hover:bg-muted"
                    }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <Input
            type="number"
            placeholder="Meta em minutos (opcional)"
            value={goalMinutes}
            onChange={(e) => setGoalMinutes(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={addHabit.isPending}>
            Adicionar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
