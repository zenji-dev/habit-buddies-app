import { useMemo } from "react";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { useState } from "react";
import { StartPartyDialog } from "./StartPartyDialog";
import { InviteToPartyDialog } from "./InviteToPartyDialog";
import { cn } from "@/lib/utils";
import { Network, Check, Users, UserPlus, UserMinus, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export const PartyChallenge = () => {
    const { challenge, checkIn, kickMember, leaveParty } = usePartyChallenge();
    const { userId } = useAuth();
    const [isStartOpen, setIsStartOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const hasChallenge = !!challenge;
    const members = challenge?.members || [];
    const habits = challenge?.habits || [];
    const isOnline = hasChallenge && members.length > 0;
    const isOwner = challenge?.created_by === userId;

    // Risk meter: % of total checkins done across all members and all habits
    const riskMeterValue = useMemo(() => {
        if (!challenge || habits.length === 0 || members.length === 0) return 0;
        const totalPossible = members.length * habits.length;
        const totalCompleted = members.reduce((sum, m) => sum + m.completedHabits.length, 0);
        return Math.round((totalCompleted / totalPossible) * 100);
    }, [challenge, habits, members]);

    // Avatar size based on member count
    const avatarSize = useMemo(() => {
        const count = members.length;
        if (count <= 2) return 80;
        if (count <= 4) return 64;
        if (count <= 6) return 52;
        return 44;
    }, [members.length]);

    const currentUser = members.find(m => m.user_id === userId);
    const userCompletedAll = currentUser && habits.length > 0 && currentUser.completedHabits.length >= habits.length;

    return (
        <>
            <div className="glass-panel rounded-none flex flex-col p-0 shadow-neon-box relative overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 grid-bg opacity-30" />

                {/* Header Row */}
                <div className="border-b border-slate-900 px-4 py-2.5 bg-background-dark/80 backdrop-blur z-10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-[#e66b00]/50 bg-[#e66b00]/10 flex items-center justify-center">
                            <Network className="w-4 h-4 text-[#e66b00]" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white font-mono-tech tracking-wider leading-none">
                                MY_PARTY_NET
                            </h2>
                            <div className="flex items-center gap-2 text-[9px] font-mono-tech mt-0.5">
                                <span className="text-gray-600">STATUS:</span>
                                <span className={isOnline ? "text-[#00a375]" : "text-gray-600"}>{isOnline ? "ONLINE" : "OFFLINE"}</span>
                                {hasChallenge && (
                                    <>
                                        <span className="text-gray-800">|</span>
                                        <span className="text-gray-600">#HABIT_SYNC_V4</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasChallenge && (
                            <>
                                {/* Net ID */}
                                <span className="text-[8px] font-mono-tech text-gray-700 mr-2">
                                    NET_ID: {challenge.id?.slice(0, 6).toUpperCase() || "---"}
                                </span>
                                <button
                                    onClick={() => setIsInviteOpen(true)}
                                    className="px-3 py-1.5 border border-[#00a375]/40 text-[#00a375] text-[10px] font-mono-tech font-bold hover:bg-[#00a375]/10 hover:shadow-[0_0_8px_rgba(0,163,117,0.2)] transition-all uppercase tracking-wider flex items-center gap-1.5"
                                >
                                    INVITE
                                </button>
                                <button
                                    onClick={() => leaveParty.mutate()}
                                    disabled={leaveParty.isPending}
                                    title="Sair da party"
                                    className="px-3 py-1.5 border border-red-700/40 text-red-500 text-[10px] font-mono-tech font-bold hover:bg-red-900/20 transition-all uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    LEAVE
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 relative z-10">
                    {!hasChallenge ? (
                        <div className="flex items-center justify-center h-full min-h-[200px]">
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
                        </div>
                    ) : (
                        <div className="w-full">
                            {/* Avatars Row + Risk Meter */}
                            <div className="flex items-center gap-4 p-4 border-b border-white/5">
                                {/* Participant Avatars */}
                                <div className="flex gap-4 flex-1">
                                    {members.map((member) => {
                                        const isDone = habits.length > 0 && member.completedHabits.length >= habits.length;
                                        return (
                                            <div key={member.user_id} className="flex flex-col items-center gap-1.5 group relative">
                                                <Link to={`/profile/${member.user_id}`}>
                                                    <div
                                                        className={cn(
                                                            "border-2 bg-background-dark flex items-center justify-center overflow-hidden transition-all duration-500 relative",
                                                            "group-hover:scale-105 shadow-[0_0_20px_rgba(0,163,117,0.10)]",
                                                            isDone
                                                                ? "border-[#00a375] shadow-[0_0_20px_rgba(0,163,117,0.4)]"
                                                                : member.completedHabits.length > 0
                                                                    ? "border-[#e66b00]/50"
                                                                    : "border-slate-800"
                                                        )}
                                                        style={{ width: avatarSize, height: avatarSize }}
                                                    >
                                                        {member.avatar_url ? (
                                                            <img
                                                                src={member.avatar_url}
                                                                alt={member.name}
                                                                className={cn(
                                                                    "w-full h-full object-cover grayscale contrast-125 transition-all",
                                                                    isDone && "blur-[2px] scale-110"
                                                                )}
                                                            />
                                                        ) : (
                                                            <Users className="text-gray-500" style={{ width: avatarSize * 0.5, height: avatarSize * 0.5 }} />
                                                        )}

                                                        {isDone && (
                                                            <>
                                                                <div className="absolute inset-0 bg-[#00a375]/10 backdrop-blur-[1px] z-10" />
                                                                <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-[#00a375] text-black flex items-center justify-center shadow-[0_0_10px_#00a375] z-20">
                                                                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </Link>
                                                <span className={cn(
                                                    "text-[10px] font-mono-tech font-bold uppercase tracking-wider transition-colors",
                                                    isDone ? "text-[#00a375]" : "text-white/60"
                                                )}>
                                                    {member.name?.split(" ")[0]}
                                                </span>

                                                {/* Kick button */}
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
                                        );
                                    })}
                                </div>

                                {/* Risk Meter */}
                                <div className="flex flex-col items-center justify-center border border-[#00a375]/20 bg-background-dark/50 px-6 py-3">
                                    <div className="text-[8px] text-white/30 tracking-[0.15em] font-mono-tech uppercase mb-1">RISK_METER</div>
                                    <div className="text-2xl font-black text-white leading-none font-mono-tech">{riskMeterValue}%</div>
                                    <div className="w-full mt-2 h-1 bg-[#050a14] border border-[#00a375]/20 overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-[1500ms]"
                                            style={{
                                                width: `${riskMeterValue}%`,
                                                background: riskMeterValue > 70 ? "#00a375" : riskMeterValue > 30 ? "#e66b00" : "#ff2a2a",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Habit Data Table — habits as rows, members as columns */}
                            {habits.length > 0 && (
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.15em] text-gray-500 text-left bg-white/[0.02] font-mono-tech">
                                                <th className="p-3 font-bold border-r border-white/5 min-w-[140px]">NETWORK_HABIT</th>
                                                {members.map(m => (
                                                    <th key={m.user_id} className="p-3 font-bold text-center uppercase">
                                                        {m.name?.split(" ")[0]}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {habits.map((habit) => (
                                                <tr key={habit.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                                                    <td className="p-3 border-r border-white/5 whitespace-nowrap">
                                                        <span className="text-[10px] font-bold font-mono-tech text-white/70 uppercase tracking-wide">
                                                            {habit.name}
                                                        </span>
                                                    </td>
                                                    {members.map((member) => {
                                                        const isCompleted = member.completedHabits.includes(habit.name);
                                                        const isSelf = member.user_id === userId;
                                                        const canCheckIn = isSelf && !isCompleted;
                                                        return (
                                                            <td key={member.user_id} className="p-3 text-center">
                                                                <button
                                                                    onClick={() => canCheckIn && checkIn.mutate({ challengeId: challenge.id, habitName: habit.name })}
                                                                    disabled={!canCheckIn || checkIn.isPending}
                                                                    title={canCheckIn ? `Check-in: ${habit.name}` : undefined}
                                                                    className={cn(
                                                                        "w-4 h-4 border mx-auto flex items-center justify-center transition-all",
                                                                        isCompleted
                                                                            ? "bg-[#00a375] border-[#00a375] shadow-[0_0_6px_#00a375]"
                                                                            : canCheckIn
                                                                                ? "border-white/20 hover:border-[#00a375] hover:shadow-[0_0_6px_rgba(0,163,117,0.4)] cursor-pointer"
                                                                                : "border-white/10 cursor-default"
                                                                    )}
                                                                >
                                                                    {isCompleted && <Check className="w-2.5 h-2.5 text-black stroke-[3px]" />}
                                                                </button>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Corner brackets */}
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
