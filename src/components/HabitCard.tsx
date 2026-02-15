import { Check, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  name: string;
  icon: string;
  goalMinutes: number;
  streak: number;
  isChecked: boolean;
  onCheckIn: () => void;
  isPending: boolean;
}

export const HabitCard = ({
  name,
  icon,
  goalMinutes,
  streak,
  isChecked,
  onCheckIn,
  isPending,
}: HabitCardProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {goalMinutes > 0 && <span>Meta: {goalMinutes} min</span>}
          {streak > 0 && (
            <span className="flex items-center gap-1 text-streak font-medium animate-streak-glow">
              <Flame className="w-3.5 h-3.5" />
              {streak}-day streak
            </span>
          )}
          {streak === 0 && (
            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">Nova jornada 🌱</span>
          )}
        </div>
      </div>
      {isChecked ? (
        <div className="flex items-center gap-2 text-primary font-medium text-sm">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-check-bounce">
            <Check className="w-4 h-4 text-primary" />
          </div>
          Concluído
        </div>
      ) : (
        <Button
          onClick={onCheckIn}
          disabled={isPending}
          size="sm"
          className={cn("gap-1.5 shrink-0")}
        >
          <Check className="w-4 h-4" />
          Check-in
        </Button>
      )}
    </div>
  );
};
