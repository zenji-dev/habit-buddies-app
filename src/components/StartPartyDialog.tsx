import { useState } from "react";
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
            onSuccess: () => { onOpenChange(false); resetCreateForm(); }
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
            <DialogContent className="sm:max-w-md bg-background-dark border-slate-900 rounded-none shadow-neon-box">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white text-sm uppercase tracking-wider font-mono-tech">
                        <Trophy className="w-4 h-4 text-[#00a375]" />
                        INIT_PARTY_NET
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono-tech text-gray-500 uppercase tracking-widest">PARTY_NAME</label>
                        <Input
                            placeholder="enter_party_name..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-card-dark border-slate-900 text-white rounded-none text-xs font-mono-tech focus:border-[#00a375] placeholder:text-gray-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono-tech text-gray-500 uppercase tracking-widest">TARGET_HABIT</label>
                        <Select onValueChange={setSelectedHabitId} value={selectedHabitId}>
                            <SelectTrigger className="bg-card-dark border-slate-900 text-white rounded-none text-xs font-mono-tech">
                                <SelectValue placeholder="select_habit..." />
                            </SelectTrigger>
                            <SelectContent className="bg-background-dark border-slate-900 rounded-none">
                                {habits.map((habit) => (
                                    <SelectItem key={habit.id} value={habit.id} className="text-white text-xs focus:bg-[#00a375]/10 focus:text-[#00a375]">
                                        <span className="flex items-center gap-2">
                                            <span className="text-lg">{habit.icon}</span>
                                            {habit.name}
                                        </span>
                                    </SelectItem>
                                ))}
                                {habits.length === 0 && (
                                    <p className="p-2 text-[10px] text-gray-600 uppercase tracking-widest font-mono-tech">NO_HABITS_FOUND</p>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono-tech text-gray-500 uppercase tracking-widest">DURATION_DAYS</label>
                        <Input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="bg-card-dark border-slate-900 text-white rounded-none text-xs font-mono-tech focus:border-[#00a375] w-1/2"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-mono-tech text-gray-500 uppercase tracking-widest">INVITE_NODES</label>
                        <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1 border border-slate-900 p-2 bg-card-dark">
                            {friendsToInvite.length === 0 ? (
                                <p className="text-center py-4 text-[10px] text-gray-600 uppercase tracking-widest font-mono-tech">NO_FRIENDS_CONNECTED</p>
                            ) : (
                                friendsToInvite.map((friend) => (
                                    <div
                                        key={friend.user_id}
                                        className={`flex items-center justify-between p-2 cursor-pointer transition-all ${selectedFriendIds.includes(friend.user_id)
                                            ? "bg-[#00a375]/10 border border-[#00a375]/30"
                                            : "hover:bg-[#02040a] border border-transparent"
                                            }`}
                                        onClick={() => toggleFriendSelection(friend.user_id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 border border-slate-800 flex items-center justify-center overflow-hidden bg-background-dark">
                                                {friend.avatar_url ? (
                                                    <img src={friend.avatar_url} alt={friend.name} className="w-full h-full object-cover grayscale" />
                                                ) : (
                                                    <span className="text-[#00a375] font-bold text-[9px]">{friend.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-white font-medium">{friend.name}</span>
                                        </div>
                                        {selectedFriendIds.includes(friend.user_id) && <Check className="w-3 h-3 text-[#00a375]" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter className="pt-4">
                    <button
                        onClick={handleStartParty}
                        disabled={!selectedHabitId || createChallenge.isPending}
                        className="w-full bg-[#00a375] text-white font-bold font-mono-tech py-3 rounded-none text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,163,117,0.4)] hover:shadow-[0_0_25px_rgba(0,163,117,0.6)] hover:bg-[#008f66] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {createChallenge.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                        EXEC_PARTY_INIT
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
