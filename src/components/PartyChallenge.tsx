import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { useState } from "react";
import { StartPartyDialog } from "./StartPartyDialog";
import { InviteToPartyDialog } from "./InviteToPartyDialog";
import { cn } from "@/lib/utils";
import { Network, CheckCircle, Users, UserPlus, UserMinus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export const PartyChallenge = () => {
    const { challenge, checkIn, kickMember } = usePartyChallenge();
    const { userId } = useAuth();
    const [isStartOpen, setIsStartOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const hasChallenge = !!challenge;
    const members = challenge?.members || [];
    const isOnline = hasChallenge && members.length > 0;
    const isOwner = challenge?.created_by === userId;

    return (
        <>
            <div className="glass-panel rounded-none h-full flex flex-col p-0 shadow-neon-box relative overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 grid-bg opacity-30" />

                {/* Header */}
                <div className="border-b border-slate-900 p-2.5 bg-background-dark/80 backdrop-blur z-10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white font-mono-tech tracking-wider flex items-center gap-2">
                        {/* Orange pulse dot */}
                        <span className="w-2 h-2 bg-[#e66b00] animate-pulse" />
                        MY_PARTY_NET
                    </h2>
                    <div className="flex items-center gap-2">
                        {/* Invite button (only when party exists) */}
                        {hasChallenge && (
                            <button
                                onClick={() => setIsInviteOpen(true)}
                                className="px-2.5 py-1 border border-[#00a375]/40 text-[#00a375] text-[9px] font-mono-tech hover:bg-[#00a375]/10 hover:shadow-[0_0_8px_rgba(0,163,117,0.2)] transition-all uppercase tracking-wider flex items-center gap-1"
                            >
                                <UserPlus className="w-3 h-3" />
                                INVITE
                            </button>
                        )}
                        {/* Orange status text */}
                        <div className="text-xs text-[#e66b00] font-mono-tech">
                            STATUS: {isOnline ? "ONLINE" : "OFFLINE"}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center relative z-10">
                    {!hasChallenge ? (
                        <div className="text-gray-700 font-mono-tech text-sm flex flex-col items-center gap-3">
                            <Network className="w-10 h-10 opacity-20" />
                            <span>NO_NODES_CONNECTED</span>
                            <button
                                onClick={() => setIsStartOpen(true)}
                                className="mt-2 px-4 py-2 border border-[#00a375]/50 text-[#00a375] text-xs font-mono-tech hover:bg-[#00a375]/10 hover:shadow-[0_0_10px_rgba(0,163,117,0.2)] transition-all uppercase tracking-wider"
                            >
                                INIT_PARTY
                            </button>
                        </div>
                    ) : (
                        <div className="w-full p-3 space-y-3">
                            <div className="text-center mb-4">
                                <p className="text-[10px] font-mono-tech text-[#00a375]/70 uppercase tracking-widest">
                                    {challenge.title}
                                </p>
                                {challenge.target_habit && (
                                    <p className="text-[9px] font-mono-tech text-gray-500 mt-1">
                                        TARGET: {challenge.target_habit}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap justify-center gap-3">
                                {members.map((member) => (
                                    <div key={member.user_id} className="flex flex-col items-center gap-1 group relative">
                                        <Link to={`/profile/${member.user_id}`}>
                                            <div className={cn(
                                                "w-16 h-16 border-2 bg-background-dark flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-[0_0_20px_rgba(0,163,117,0.10)]",
                                                member.checkedInToday
                                                    ? "border-[#00a375] shadow-[0_0_20px_rgba(0,163,117,0.5)]"
                                                    : "border-slate-800"
                                            )}>
                                                {member.avatar_url ? (
                                                    <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover grayscale contrast-125" />
                                                ) : (
                                                    <Users className="w-8 h-8 text-gray-500" />
                                                )}
                                            </div>
                                        </Link>
                                        <span className="text-xs font-mono-tech text-gray-300 group-hover:text-white transition-colors font-bold tracking-wide mt-1">
                                            {member.name?.split(" ")[0]}
                                        </span>
                                        {member.checkedInToday && (
                                            <CheckCircle className="w-3 h-3 text-[#00a375]" />
                                        )}

                                        {/* Kick button — visible on hover, only for owner and not self */}
                                        {isOwner && member.user_id !== userId && (
                                            <button
                                                onClick={() => kickMember.mutate(member.user_id)}
                                                disabled={kickMember.isPending}
                                                title="Expulsar da party"
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-900/80 border border-red-700/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 z-20"
                                            >
                                                <UserMinus className="w-2.5 h-2.5 text-red-400" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center mt-2">
                                <button
                                    onClick={() => checkIn.mutate(challenge.id)}
                                    disabled={checkIn.isPending || challenge.userCheckedInToday}
                                    className="px-6 py-2 bg-[#00a375]/10 border border-[#00a375]/50 text-[#00a375] text-xs font-mono-tech hover:bg-[#00a375]/20 hover:shadow-[0_0_15px_rgba(0,163,117,0.3)] transition-all uppercase tracking-wider disabled:opacity-50"
                                >
                                    {challenge.userCheckedInToday ? "CHECKED_IN ✓" : "EXEC_CHECKIN"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Corner brackets — teal */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#00a375]" />
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#00a375]" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#00a375]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#00a375]" />
            </div>

            <StartPartyDialog open={isStartOpen} onOpenChange={setIsStartOpen} />
            <InviteToPartyDialog open={isInviteOpen} onOpenChange={setIsInviteOpen} />
        </>
    );
};
