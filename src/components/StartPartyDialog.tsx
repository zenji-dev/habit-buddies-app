import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { useHabits } from "@/hooks/useHabits";
import { Check, Flame, Trophy, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface StartPartyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialSelectedFriendId?: string;
}

export const StartPartyDialog = ({ open, onOpenChange, initialSelectedFriendId }: StartPartyDialogProps) => {
    const { habits } = useHabits();
    const { friendsToInvite, createChallenge } = usePartyChallenge();

    // Create Challenge State
    const [newTitle, setNewTitle] = useState("");
    const [selectedHabitId, setSelectedHabitId] = useState("");
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(
        initialSelectedFriendId ? [initialSelectedFriendId] : []
    );
    const [duration, setDuration] = useState("30");

    const handleStartParty = () => {
        const habit = habits.find(h => h.id === selectedHabitId);
        if (!habit) return;

        createChallenge.mutate({
            title: newTitle || `Party: ${habit.name}`,
            target_habit: habit.name,
            duration_days: parseInt(duration),
            friendIds: selectedFriendIds
        }, {
            onSuccess: () => {
                onOpenChange(false);
                resetCreateForm();
            }
        });
    };

    const resetCreateForm = () => {
        setNewTitle("");
        setSelectedHabitId("");
        setSelectedFriendIds(initialSelectedFriendId ? [initialSelectedFriendId] : []);
        setDuration("30");
    };

    const toggleFriendSelection = (id: string) => {
        setSelectedFriendIds(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Criar Novo Desafio
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Nome do Grupo</label>
                        <Input
                            placeholder="Ex: Treino dos Parça"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-secondary/50 border-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">O que faremos juntos?</label>
                        <Select onValueChange={setSelectedHabitId} value={selectedHabitId}>
                            <SelectTrigger className="bg-secondary/50 border-border">
                                <SelectValue placeholder="Selecione um dos seus hábitos" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                {habits.map((habit) => (
                                    <SelectItem key={habit.id} value={habit.id}>
                                        <span className="flex items-center gap-2">
                                            <span className="text-lg">{habit.icon}</span>
                                            {habit.name}
                                        </span>
                                    </SelectItem>
                                ))}
                                {habits.length === 0 && (
                                    <p className="p-2 text-xs text-muted-foreground">Você ainda não criou hábitos.</p>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Duração (dias)</label>
                            <Input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="bg-secondary/50 border-border"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Convidar Amigos</label>
                        <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1 custom-scrollbar border border-border rounded-lg p-2 bg-secondary/20">
                            {friendsToInvite.length === 0 ? (
                                <p className="text-center py-4 text-xs text-muted-foreground">Ainda não tem amigos aceitos.</p>
                            ) : (
                                friendsToInvite.map((friend) => (
                                    <div
                                        key={friend.user_id}
                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedFriendIds.includes(friend.user_id) ? "bg-primary/20 border-primary/20" : "hover:bg-secondary/50"
                                            }`}
                                        onClick={() => toggleFriendSelection(friend.user_id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                                                {friend.avatar_url ? (
                                                    <img src={friend.avatar_url} alt={friend.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-primary font-bold text-[10px]">{friend.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <span className="text-xs font-medium">{friend.name}</span>
                                        </div>
                                        {selectedFriendIds.includes(friend.user_id) && <Check className="w-3 h-3 text-primary" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter className="pt-4">
                    <Button
                        onClick={handleStartParty}
                        disabled={!selectedHabitId || createChallenge.isPending}
                        className="w-full gap-2 font-bold"
                    >
                        {createChallenge.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                        Confirmar e Convidar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
