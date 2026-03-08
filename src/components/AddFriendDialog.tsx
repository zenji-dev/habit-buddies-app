import { useState } from "react";
import { useSocial } from "@/hooks/useSocial";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Loader2, Check } from "lucide-react";

interface AddFriendDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const AddFriendDialog = ({ open, onOpenChange }: AddFriendDialogProps) => {
    const { searchUsers, addFriendById, cancelFriendRequest } = useSocial();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [sentIds, setSentIds] = useState<string[]>([]);

    const handleSearch = async (value: string) => {
        setQuery(value);
        if (value.length < 2) { setResults([]); return; }
        setIsSearching(true);
        try {
            const data = await searchUsers(value);
            setResults(data);
        } catch { setResults([]); }
        finally { setIsSearching(false); }
    };

    const handleClick = (user: any) => {
        const sent = sentIds.includes(user.user_id) || user.friendshipStatus === "pending";

        if (sent && user.isRequester) {
            cancelFriendRequest.mutate(user.user_id, {
                onSuccess: () => {
                    setSentIds(prev => prev.filter(id => id !== user.user_id));
                    setResults(prev => prev.map(u => u.user_id === user.user_id ? { ...u, friendshipStatus: null, isRequester: false } : u));
                }
            });
        } else if (!sent && !user.friendshipStatus) {
            addFriendById.mutate(user.user_id, {
                onSuccess: () => {
                    setSentIds(prev => [...prev, user.user_id]);
                    setResults(prev => prev.map(u => u.user_id === user.user_id ? { ...u, friendshipStatus: "pending", isRequester: true } : u));
                },
            });
        }
    };

    const handleClose = (val: boolean) => {
        onOpenChange(val);
        if (!val) { setQuery(""); setResults([]); setSentIds([]); }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-sm glass-panel rounded neo-shadow">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white text-sm uppercase tracking-wider font-bold">
                        <UserPlus className="w-4 h-4 text-[#25f4f4]" />
                        ADD_NODE
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="search by name or @username..."
                            value={query}
                            onChange={e => handleSearch(e.target.value)}
                            className="pl-9 bg-card-dark border-[#224949] text-white rounded text-xs font-bold focus:border-[#25f4f4] placeholder:text-slate-400"
                            autoFocus
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#25f4f4] animate-spin" />
                        )}
                    </div>

                    {results.length > 0 && (
                        <div className="space-y-1 max-h-64 overflow-y-auto border border-[#224949] bg-card-dark p-1">
                            {results.map(user => {
                                const sent = sentIds.includes(user.user_id) || user.friendshipStatus === "pending";
                                const isFriend = user.friendshipStatus === "accepted";
                                const canCancel = sent && user.isRequester;
                                const isPendingAction = addFriendById.isPending || cancelFriendRequest.isPending;
                                const isDisabled = isFriend || (sent && !user.isRequester) || isPendingAction;

                                return (
                                    <div
                                        key={user.user_id}
                                        className="flex items-center justify-between p-2 hover:bg-[#242424] transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 border border-[#224949] flex items-center justify-center overflow-hidden bg-background-dark flex-shrink-0">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover grayscale" />
                                                ) : (
                                                    <span className="text-[#25f4f4] font-bold text-[10px]">{user.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-white font-medium font-bold">{user.name}</p>
                                                {user.username && (
                                                    <p className="text-[10px] text-slate-400 font-bold">@{user.username}</p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleClick(user)}
                                            disabled={isDisabled}
                                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1 ${isDisabled
                                                ? "border-[#25f4f4]/30 text-[#25f4f4]/50 bg-[#25f4f4]/5 cursor-default"
                                                : canCancel
                                                    ? "border-red-500/50 text-red-500 hover:bg-red-500/10"
                                                    : "border-[#25f4f4]/50 text-[#25f4f4] hover:bg-[#25f4f4]/10 hover:neo-shadow"
                                                }`}
                                        >
                                            {isFriend ? (
                                                <><Check className="w-3 h-3" /> FRIEND</>
                                            ) : sent ? (
                                                <div className="relative group/btn">
                                                    {canCancel ? (
                                                        <>
                                                            <span className="flex items-center gap-1 group-hover/btn:hidden">
                                                                <Check className="w-3 h-3" /> SENT
                                                            </span>
                                                            <span className="hidden group-hover/btn:flex items-center gap-1">
                                                                CANCEL
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> SENT
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <><UserPlus className="w-3 h-3" /> ADD</>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {query.length >= 2 && !isSearching && results.length === 0 && (
                        <p className="text-center py-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                            NODE_NOT_FOUND
                        </p>
                    )}

                    {query.length < 2 && (
                        <p className="text-center py-2 text-[10px] text-slate-400 font-bold">
                            &gt; type at least 2 chars to search_
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
