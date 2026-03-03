import { useState } from "react";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Check } from "lucide-react";
import { toast } from "sonner";

const ICONS = ["💪", "📖", "📚", "🏃", "🧘", "💻", "🎵", "🥗", "💤", "🌊", "🎯", "⚡", "🔥", "🌱", "🏋️"];

interface InviteToPartyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const InviteToPartyDialog = ({ open, onOpenChange }: InviteToPartyDialogProps) => {
    const { friendsToInvite, inviteFriend } = usePartyChallenge();

    const [habitName, setHabitName] = useState("");
    const [habitDesc, setHabitDesc] = useState("");
    const [habitIcon, setHabitIcon] = useState("💪");
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
    const [sending, setSending] = useState(false);

    const toggleFriend = (id: string) => {
        setSelectedFriendIds(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const reset = () => {
        setHabitName("");
        setHabitDesc("");
        setHabitIcon("💪");
        setSelectedFriendIds([]);
    };

    const handleSend = async () => {
        if (!habitName.trim()) {
            toast.error("Informe o nome do hábito");
            return;
        }
        if (selectedFriendIds.length === 0) {
            toast.error("Selecione pelo menos um amigo");
            return;
        }
        setSending(true);
        try {
            for (const fid of selectedFriendIds) {
                await inviteFriend.mutateAsync(fid);
            }
            toast.success(`${selectedFriendIds.length} convite(s) enviado(s)! 🚀`);
            onOpenChange(false);
            reset();
        } catch {
            toast.error("Erro ao enviar convites");
        } finally {
            setSending(false);
        }
    };

    const handleClose = (val: boolean) => {
        onOpenChange(val);
        if (!val) reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md glass-panel rounded-none shadow-neon-box">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white text-sm uppercase tracking-wider font-mono-tech">
                        <Send className="w-4 h-4 text-[#00a375]" />
                        INVITE_TO_PARTY
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* Habit Name */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono-tech text-gray-500 uppercase tracking-widest">
                            HABIT_NAME <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="ex: Meditar 10 minutos..."
                            value={habitName}
                            onChange={e => setHabitName(e.target.value)}
                            className="bg-card-dark border-slate-900 text-white rounded-none text-xs font-mono-tech focus:border-[#00a375] placeholder:text-gray-600"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono-tech text-gray-500 uppercase tracking-widest flex justify-between">
                            <span>HABIT_DESC</span>
                            <span className="text-gray-700">OPTIONAL</span>
                        </label>
                        <Input
                            placeholder="ex: Todos os dias pela manhã..."
                            value={habitDesc}
                            onChange={e => setHabitDesc(e.target.value)}
                            className="bg-card-dark border-slate-900 text-white rounded-none text-xs font-mono-tech focus:border-[#00a375] placeholder:text-gray-600"
                        />
                    </div>

                    {/* Icon selector */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono-tech text-gray-500 uppercase tracking-widest">
                            HABIT_ICON
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {ICONS.map(ico => (
                                <button
                                    key={ico}
                                    type="button"
                                    onClick={() => setHabitIcon(ico)}
                                    className={`w-10 h-10 flex items-center justify-center text-xl transition-all ${habitIcon === ico
                                            ? "bg-[#00a375]/10 border border-[#00a375] shadow-[0_0_5px_rgba(0,163,117,0.3)]"
                                            : "bg-card-dark border border-slate-900 hover:border-[#00a375]/50"
                                        }`}
                                >
                                    {ico}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Friend selector */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono-tech text-gray-500 uppercase tracking-widest">
                            SELECT_NODES
                        </label>
                        <div className="max-h-[180px] overflow-y-auto border border-slate-900 bg-card-dark p-1 space-y-0.5">
                            {friendsToInvite.length === 0 ? (
                                <p className="text-center py-5 text-[10px] text-gray-600 uppercase tracking-widest font-mono-tech">
                                    NO_NODES_AVAILABLE
                                </p>
                            ) : (
                                friendsToInvite.map(friend => {
                                    const selected = selectedFriendIds.includes(friend.user_id);
                                    return (
                                        <div
                                            key={friend.user_id}
                                            onClick={() => toggleFriend(friend.user_id)}
                                            className={`flex items-center justify-between p-2 cursor-pointer transition-all ${selected
                                                    ? "bg-[#00a375]/10 border border-[#00a375]/30"
                                                    : "hover:bg-[#02040a] border border-transparent"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 border border-slate-800 flex items-center justify-center overflow-hidden bg-background-dark flex-shrink-0">
                                                    {friend.avatar_url ? (
                                                        <img src={friend.avatar_url} alt={friend.name} className="w-full h-full object-cover grayscale" />
                                                    ) : (
                                                        <span className="text-[#00a375] font-bold text-[9px]">{friend.name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-white font-medium font-mono-tech">{friend.name}</span>
                                            </div>
                                            {selected && <Check className="w-3 h-3 text-[#00a375]" />}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-2">
                    <button
                        onClick={handleSend}
                        disabled={sending || !habitName.trim() || selectedFriendIds.length === 0}
                        className="w-full bg-[#00a375] text-white font-bold font-mono-tech py-3 rounded-none text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,163,117,0.4)] hover:shadow-[0_0_25px_rgba(0,163,117,0.6)] hover:bg-[#008f66] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        SEND_INVITES
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
