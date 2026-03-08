import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { useSocial } from "@/hooks/useSocial";
import { Check, X, Users, Loader2, UserPlus, Trophy } from "lucide-react";

export const ChallengeInvites = () => {
    const { invites, respondToInvite } = usePartyChallenge();
    const { incomingRequests, handleRequest } = useSocial();

    const hasNoSignals = invites.length === 0 && incomingRequests.length === 0;

    if (hasNoSignals) {
        return (
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center space-y-2">
                <div className="w-10 h-10 border border-[#224949] flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NO_SIGNALS</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-3 max-h-[350px] overflow-y-auto pr-1 pb-2">

            {/* PARTY INVITES */}
            {invites.length > 0 && (
                <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1 px-1 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> PARTY_INVITES
                    </p>
                    {invites.map((invite) => (
                        <div
                            key={invite.id}
                            className="p-3 border border-[#224949] bg-card-dark hover:border-[#25f4f4]/50 transition-all relative overflow-hidden group"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#25f4f4] group-hover: transition-all" />

                            <div className="flex items-start justify-between gap-3 pl-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 border border-[#224949] flex items-center justify-center overflow-hidden bg-background-dark shrink-0">
                                        {invite.invited_by_profile?.avatar_url ? (
                                            <img src={invite.invited_by_profile.avatar_url} alt={invite.invited_by_profile.name} className="w-full h-full object-cover grayscale" />
                                        ) : (
                                            <Users className="w-4 h-4 text-[#25f4f4]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white truncate font-bold">
                                            {invite.invited_by_profile?.name || "Unknown"}
                                        </p>
                                        <p className="text-[9px] text-slate-400 truncate uppercase tracking-widest font-bold mt-0.5">
                                            {invite.challenge_title}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button
                                        className="w-7 h-7 rounded bg-[#25f4f4] text-white flex items-center justify-center hover:bg-[#1ec8c8] transition-colors"
                                        onClick={() => respondToInvite.mutate({ inviteId: invite.id, accept: true })}
                                        disabled={respondToInvite.isPending}
                                    >
                                        {respondToInvite.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                    </button>
                                    <button
                                        className="w-7 h-7 rounded border border-[#224949] text-slate-400 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors"
                                        onClick={() => respondToInvite.mutate({ inviteId: invite.id, accept: false })}
                                        disabled={respondToInvite.isPending}
                                    >
                                        {respondToInvite.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FRIEND REQUESTS */}
            {incomingRequests.length > 0 && (
                <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1 mt-2 px-1 flex items-center gap-1">
                        <UserPlus className="w-3 h-3" /> FRIEND_REQUESTS
                    </p>
                    {incomingRequests.map((req) => (
                        <div
                            key={req.id}
                            className="p-3 border border-[#224949] bg-card-dark hover:border-[#25f4f4]/50 transition-all relative overflow-hidden group"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#25f4f4] group-hover: transition-all" />

                            <div className="flex items-start justify-between gap-3 pl-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 border border-[#224949] flex items-center justify-center overflow-hidden bg-background-dark shrink-0">
                                        {req.profile?.avatar_url ? (
                                            <img src={req.profile.avatar_url} alt={req.profile.name || ""} className="w-full h-full object-cover grayscale" />
                                        ) : (
                                            <span className="text-[#25f4f4] font-bold text-[10px]">{req.profile?.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white truncate font-bold">
                                            {req.profile?.name || "Unknown"}
                                        </p>
                                        <p className="text-[9px] text-[#25f4f4] truncate uppercase tracking-widest font-bold mt-0.5">
                                            WANTS_TO_CONNECT
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button
                                        className="w-7 h-7 rounded bg-[#25f4f4] text-white flex items-center justify-center hover:bg-[#1ec8c8] transition-colors"
                                        onClick={() => handleRequest.mutate({ requestId: req.id, status: "accepted" })}
                                        disabled={handleRequest.isPending}
                                    >
                                        {handleRequest.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                    </button>
                                    <button
                                        className="w-7 h-7 rounded border border-[#224949] text-slate-400 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors"
                                        onClick={() => handleRequest.mutate({ requestId: req.id, status: "rejected" })}
                                        disabled={handleRequest.isPending}
                                    >
                                        {handleRequest.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
