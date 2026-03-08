import { useState } from "react";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Send, Check } from "lucide-react";
import { toast } from "sonner";

interface InviteToPartyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const InviteToPartyDialog = ({ open, onOpenChange }: InviteToPartyDialogProps) => {
    const { friendsToInvite, inviteFriend } = usePartyChallenge();

    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
    const [sending, setSending] = useState(false);

    const toggleFriend = (id: string) => {
        setSelectedFriendIds(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    // Limpa a seleção ao fechar o modal
    const reset = () => {
        setSelectedFriendIds([]);
    };

    // Envia os convites para todos os amigos selecionados
    const handleSend = async () => {
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
            <DialogContent className="sm:max-w-sm glass-panel rounded neo-shadow">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white text-sm uppercase tracking-wider font-bold">
                        <Send className="w-4 h-4 text-[#25f4f4]" />
                        INVITE_TO_PARTY
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            SELECT_FRIENDS_TO_JOIN
                        </label>
                        <div className="max-h-[250px] overflow-y-auto border border-[#224949] bg-card-dark p-1 space-y-0.5">
                            {friendsToInvite.length === 0 ? (
                                <p className="text-center py-8 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
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
                                                ? "bg-[#25f4f4]/10 border border-[#25f4f4]/30"
                                                : "hover:bg-[#242424] border border-transparent"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 border border-[#224949] flex items-center justify-center overflow-hidden bg-background-dark flex-shrink-0">
                                                    {friend.avatar_url ? (
                                                        <img src={friend.avatar_url} alt={friend.name} className="w-full h-full object-cover grayscale" />
                                                    ) : (
                                                        <span className="text-[#25f4f4] font-bold text-[9px]">{friend.name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-white font-medium font-bold">{friend.name}</span>
                                            </div>
                                            {selected && <Check className="w-3 h-3 text-[#25f4f4]" />}
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
                        disabled={sending || selectedFriendIds.length === 0}
                        className="w-full bg-[#25f4f4] text-white font-bold font-bold py-3 rounded text-xs uppercase tracking-wider neo-shadow hover:neo-shadow hover:bg-[#1ec8c8] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        SEND_INVITES
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
