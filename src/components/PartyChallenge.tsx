import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { useState } from "react";
import { StartPartyDialog } from "./StartPartyDialog";
import { cn } from "@/lib/utils";
import { Network, CheckCircle, Users } from "lucide-react";

export const PartyChallenge = () => {
    const { challenge, checkIn } = usePartyChallenge();
    const [isStartOpen, setIsStartOpen] = useState(false);

    const hasChallenge = !!challenge;
    const members = challenge?.members || [];
    const isOnline = hasChallenge && members.length > 0;

    return (
        <>
            <div className="bg-card-dark border border-slate-900 rounded-none h-full flex flex-col p-0 shadow-neon-box relative overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 grid-bg opacity-30" />

                {/* Header */}
                <div className="border-b border-slate-900 p-2.5 bg-background-dark/80 backdrop-blur z-10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white font-mono-tech tracking-wider flex items-center gap-2">
                        {/* Orange pulse dot */}
                        <span className="w-2 h-2 bg-[#e66b00] animate-pulse" />
                        MY_PARTY_NET
                    </h2>
                    {/* Orange status text */}
                    <div className="text-[10px] text-[#e66b00] font-mono-tech">
                        STATUS: {isOnline ? "ONLINE" : "OFFLINE"}
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
                                    <div key={member.user_id} className="flex flex-col items-center gap-1">
                                        <div className={cn(
                                            "w-10 h-10 border bg-background-dark flex items-center justify-center overflow-hidden",
                                            member.checkedInToday
                                                ? "border-[#00a375] shadow-[0_0_10px_rgba(0,163,117,0.3)]"
                                                : "border-slate-800"
                                        )}>
                                            {member.avatar_url ? (
                                                <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover grayscale contrast-125" />
                                            ) : (
                                                <Users className="w-4 h-4 text-gray-500" />
                                            )}
                                        </div>
                                        <span className="text-[8px] font-mono-tech text-gray-500">{member.name?.split(" ")[0]}</span>
                                        {member.checkedInToday && (
                                            <CheckCircle className="w-3 h-3 text-[#00a375]" />
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
        </>
    );
};
