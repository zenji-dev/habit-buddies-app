import { useState } from "react";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { useHabits } from "@/hooks/useHabits";
import { Check, Flame, Loader2, X, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface StartPartyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialSelectedFriendId?: string;
}

export const StartPartyDialog = ({ open, onOpenChange, initialSelectedFriendId }: StartPartyDialogProps) => {
    const { habits } = useHabits();
    const { friendsToInvite, createChallenge } = usePartyChallenge();

    const [newTitle, setNewTitle] = useState("");
    const [selectedHabits, setSelectedHabits] = useState<{ name: string, icon: string }[]>([]);
    const [customHabitName, setCustomHabitName] = useState("");
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>(
        initialSelectedFriendId ? [initialSelectedFriendId] : []
    );
    const [duration, setDuration] = useState("30");

    const handleStartParty = () => {
        if (selectedHabits.length === 0) return;
        createChallenge.mutate({
            title: newTitle || `Party: ${selectedHabits.map(h => h.name).join(", ")}`,
            habits: selectedHabits,
            duration_days: parseInt(duration),
            friendIds: selectedFriendIds
        }, {
            onSuccess: () => { onOpenChange(false); resetCreateForm(); }
        });
    };

    const resetCreateForm = () => {
        setNewTitle("");
        setSelectedHabits([]);
        setCustomHabitName("");
        setSelectedFriendIds(initialSelectedFriendId ? [initialSelectedFriendId] : []);
        setDuration("30");
    };

    const toggleHabit = (name: string, icon: string) => {
        setSelectedHabits(prev =>
            prev.some(h => h.name === name)
                ? prev.filter(h => h.name !== name)
                : [...prev, { name, icon }]
        );
    };

    const addCustomHabit = () => {
        const trimmed = customHabitName.trim();
        if (!trimmed || selectedHabits.some(h => h.name === trimmed)) return;
        setSelectedHabits(prev => [...prev, { name: trimmed, icon: "💪" }]);
        setCustomHabitName("");
    };

    const removeHabit = (name: string) => {
        setSelectedHabits(prev => prev.filter(h => h.name !== name));
    };

    const toggleFriendSelection = (id: string) => {
        setSelectedFriendIds(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md glass-panel rounded neo-shadow max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white text-sm uppercase tracking-wider font-bold">
                        <Flame className="w-4 h-4 text-[#25f4f4]" />
                        INIT_PARTY_NET
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PARTY_NAME</label>
                        <Input
                            placeholder="enter_party_name..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-card-dark border-[#224949] text-white rounded text-xs font-bold focus:border-[#25f4f4] placeholder:text-slate-400"
                        />
                    </div>

                    {/* Habits selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PARTY_HABITS</label>

                        {/* Selected habits chips */}
                        {selectedHabits.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {selectedHabits.map(h => (
                                    <span key={h.name} className="flex items-center gap-1 px-2 py-1 bg-[#25f4f4]/15 border border-[#25f4f4]/30 text-[#25f4f4] text-[10px] font-bold uppercase tracking-wider">
                                        <span>{h.icon}</span> {h.name}
                                        <button onClick={() => removeHabit(h.name)} className="ml-1 hover:text-white transition-colors">
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Personal habits as suggestions */}
                        {habits.length > 0 && (
                            <div className="border border-[#224949] p-2 bg-card-dark max-h-[120px] overflow-y-auto space-y-1">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">SELECT_FROM_PERSONAL</p>
                                {habits.map((habit) => {
                                    const isSelected = selectedHabits.some(h => h.name === habit.name);
                                    return (
                                        <div
                                            key={habit.id}
                                            className={`flex items-center justify-between p-1.5 cursor-pointer transition-all ${isSelected
                                                ? "bg-[#25f4f4]/10 border border-[#25f4f4]/30"
                                                : "hover:bg-[#242424] border border-transparent"
                                                }`}
                                            onClick={() => toggleHabit(habit.name, habit.icon)}
                                        >
                                            <span className="flex items-center gap-2 text-[11px] text-white">
                                                <span>{habit.icon}</span> {habit.name}
                                            </span>
                                            {isSelected && <Check className="w-3 h-3 text-[#25f4f4]" />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Add custom habit */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="add_custom_habit..."
                                value={customHabitName}
                                onChange={(e) => setCustomHabitName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addCustomHabit()}
                                className="bg-card-dark border-[#224949] text-white rounded text-xs font-bold focus:border-[#25f4f4] placeholder:text-slate-400 flex-1"
                            />
                            <button
                                onClick={addCustomHabit}
                                disabled={!customHabitName.trim()}
                                className="px-3 border border-[#25f4f4]/40 text-[#25f4f4] text-[9px] font-bold hover:bg-[#25f4f4]/10 transition-all uppercase disabled:opacity-30"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DURATION_DAYS</label>
                        <Input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="bg-card-dark border-[#224949] text-white rounded text-xs font-bold focus:border-[#25f4f4] w-1/2"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">INVITE_NODES</label>
                        <div className="max-h-[150px] overflow-y-auto space-y-1 pr-1 border border-[#224949] p-2 bg-card-dark">
                            {friendsToInvite.length === 0 ? (
                                <p className="text-center py-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">NO_FRIENDS_CONNECTED</p>
                            ) : (
                                friendsToInvite.map((friend) => (
                                    <div
                                        key={friend.user_id}
                                        className={`flex items-center justify-between p-2 cursor-pointer transition-all ${selectedFriendIds.includes(friend.user_id)
                                            ? "bg-[#25f4f4]/10 border border-[#25f4f4]/30"
                                            : "hover:bg-[#242424] border border-transparent"
                                            }`}
                                        onClick={() => toggleFriendSelection(friend.user_id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 border border-[#224949] flex items-center justify-center overflow-hidden bg-background-dark">
                                                {friend.avatar_url ? (
                                                    <img src={friend.avatar_url} alt={friend.name} className="w-full h-full object-cover grayscale" />
                                                ) : (
                                                    <span className="text-[#25f4f4] font-bold text-[9px]">{friend.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-white font-medium">{friend.name}</span>
                                        </div>
                                        {selectedFriendIds.includes(friend.user_id) && <Check className="w-3 h-3 text-[#25f4f4]" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter className="pt-4">
                    <button
                        onClick={handleStartParty}
                        disabled={selectedHabits.length === 0 || createChallenge.isPending}
                        className="w-full bg-[#25f4f4] text-white font-bold font-bold py-3 rounded text-xs uppercase tracking-wider neo-shadow hover:neo-shadow hover:bg-[#1ec8c8] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {createChallenge.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                        EXEC_PARTY_INIT
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
