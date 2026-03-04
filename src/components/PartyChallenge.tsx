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
        if (count <= 2) return 96;
        if (count <= 4) return 72;
        if (count <= 6) return 56;
        return 48;
    }, [members.length]);

    const currentUser = members.find(m => m.user_id === userId);
    const userCompletedAll = currentUser && habits.length > 0 && currentUser.completedHabits.length >= habits.length;

    return (
        <>
            <div className="glass-panel rounded-none flex flex-col p-0 shadow-neon-box relative overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 grid-bg opacity-30" />

                {/* Header */}
                <div className="border-b border-slate-900 p-2.5 bg-background-dark/80 backdrop-blur z-10 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white font-mono-tech tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#e66b00] animate-pulse" />
                        MY_PARTY_NET
                    </h2>
                    <div className="flex items-center gap-2">
                        {hasChallenge && (
                            <>
                                <button
                                    onClick={() => setIsInviteOpen(true)}
                                    className="px-2.5 py-1 border border-[#00a375]/40 text-[#00a375] text-[9px] font-mono-tech hover:bg-[#00a375]/10 hover:shadow-[0_0_8px_rgba(0,163,117,0.2)] transition-all uppercase tracking-wider flex items-center gap-1"
                                >
                                    <UserPlus className="w-3 h-3" />
                                    INVITE
                                </button>
                                <button
                                    onClick={() => leaveParty.mutate()}
                                    disabled={leaveParty.isPending}
                                    title="Sair da party"
                                    className="px-2.5 py-1 border border-red-700/40 text-red-500 text-[9px] font-mono-tech hover:bg-red-900/20 transition-all uppercase tracking-wider flex items-center gap-1 disabled:opacity-50"
                                >
                                    <LogOut className="w-3 h-3" />
                                    LEAVE
                                </button>
                            </>
                        )}
                        <div className="text-xs text-[#e66b00] font-mono-tech">
                            STATUS: {isOnline ? "ONLINE" : "OFFLINE"}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 relative z-10">
                    {!hasChallenge ? (
                        <div className="flex items-center justify-center h-full min-h-[300px]">
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
                            {/* Info layer */}
                            <div className="p-4 space-y-1 border-b border-slate-900/50 bg-gradient-to-b from-background-dark/60 to-transparent">
                                <div className="flex gap-2 text-[10px] font-mono-tech">
                                    <span className="text-gray-600"># PARTY_NAME:</span>
                                    <span className="text-[#00a375] font-bold uppercase">{challenge.title}</span>
                                </div>
                                <div className="flex gap-2 text-[10px] font-mono-tech">
                                    <span className="text-gray-600"># DAY:</span>
                                    <span className="text-white/60">{challenge.currentDay}/{challenge.duration_days}</span>
                                </div>
                                <div className="flex gap-2 text-[10px] font-mono-tech">
                                    <span className="text-gray-600"># ACTIVE_MODULES:</span>
                                    <span className="text-white/40 italic">{habits.map(h => h.name).join(", ")}</span>
                                </div>
                            </div>

                            {/* Risk Meter + Participants */}
                            <div className="grid grid-cols-3 gap-4 p-4 items-center">
                                {/* Risk Meter Gauge */}
                                <div className="flex flex-col items-center justify-center">
                                    <div className="relative w-32 h-16 overflow-hidden flex items-end justify-center">
                                        <svg className="absolute top-0 w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                                            <circle cx="64" cy="64" r="52" fill="none" stroke="#0a120d" strokeWidth="8" strokeDasharray="163 326" />
                                            <circle
                                                cx="64" cy="64" r="52" fill="none"
                                                stroke={riskMeterValue > 70 ? "#00a375" : riskMeterValue > 30 ? "#e66b00" : "#ff2a2a"}
                                                strokeWidth="8"
                                                strokeDasharray={`${(riskMeterValue * 1.63)} 326`}
                                                className="transition-all duration-[1500ms]"
                                            />
                                        </svg>
                                        <div className="z-10 text-center pb-1">
                                            <div className="text-xl font-black text-white leading-none font-mono-tech">{riskMeterValue}%</div>
                                        </div>
                                        {/* Needle */}
                                        <div
                                            className="absolute bottom-0 left-1/2 w-0.5 h-12 bg-white/30 origin-bottom transition-all duration-[1500ms]"
                                            style={{ transform: `translateX(-50%) rotate(${(riskMeterValue * 1.8) - 90}deg)` }}
                                        />
                                    </div>
                                    <div className="text-[8px] text-white/20 tracking-[0.2em] font-mono-tech mt-1 uppercase">RISK_METER</div>
                                </div>

                                {/* Participants Grid */}
                                <div className="col-span-2 flex flex-wrap justify-center gap-4">
                                    {members.map((member) => {
                                        const isDone = habits.length > 0 && member.completedHabits.length >= habits.length;
                                        return (
                                            <div key={member.user_id} className="flex flex-col items-center gap-1.5 group relative">
                                                <Link to={`/profile/${member.user_id}`}>
                                                    <div
                                                        className={cn(
                                                            "border-2 bg-background-dark flex items-center justify-center overflow-hidden transition-all duration-500 relative",
                                                            "group-hover:scale-110 shadow-[0_0_20px_rgba(0,163,117,0.10)]",
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

                                                        {/* 100% overlay */}
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
                                                <div className="text-center">
                                                    <span className={cn(
                                                        "text-[10px] font-mono-tech font-bold uppercase tracking-wider transition-colors",
                                                        isDone ? "text-white" : "text-white/40"
                                                    )}>
                                                        {member.name?.split(" ")[0]}
                                                    </span>
                                                    {/* Habit dots */}
                                                    <div className="flex justify-center gap-1 mt-0.5">
                                                        {habits.map((h) => (
                                                            <div
                                                                key={h.id}
                                                                className={cn(
                                                                    "w-1.5 h-1.5 rounded-full transition-all",
                                                                    member.completedHabits.includes(h.name)
                                                                        ? "bg-[#00a375] shadow-[0_0_4px_#00a375]"
                                                                        : "bg-white/5 border border-white/10"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

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
                            </div>

                            {/* Habit Data Table — habits as rows, members as columns */}
                            {habits.length > 0 && (
                                <div className="w-full overflow-x-auto border-t border-white/5">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/5 text-[8px] uppercase tracking-[0.15em] text-white/30 text-left bg-white/[0.02] font-mono-tech">
                                                <th className="p-3 font-black border-r border-white/5 min-w-[120px]">HABIT</th>
                                                {members.map(m => (
                                                    <th key={m.user_id} className="p-3 font-black text-center">
                                                        {m.name?.split(" ")[0]}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {habits.map((habit) => {
                                                const isSelfRow = true; // check per cell
                                                return (
                                                    <tr key={habit.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                                                        {/* Habit name cell */}
                                                        <td className="p-3 border-r border-white/5 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-base leading-none">{habit.icon}</span>
                                                                <span className="text-[10px] font-bold font-mono-tech text-white/70 uppercase tracking-wide">
                                                                    {habit.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        {/* One cell per member */}
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
                                                                            "w-5 h-5 rounded-full border mx-auto flex items-center justify-center transition-all",
                                                                            isCompleted
                                                                                ? "bg-[#00a375] border-[#00a375] shadow-[0_0_6px_#00a375]"
                                                                                : canCheckIn
                                                                                    ? "border-white/20 hover:border-[#00a375] hover:shadow-[0_0_6px_rgba(0,163,117,0.4)] cursor-pointer"
                                                                                    : "border-white/10 cursor-default"
                                                                        )}
                                                                    >
                                                                        {isCompleted && <Check className="w-3 h-3 text-black stroke-[3px]" />}
                                                                    </button>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Footer legend */}
                            <div className="p-2 border-t border-white/5 flex justify-center gap-6">
                                <div className="flex items-center gap-1.5 text-[7px] font-black tracking-[0.2em] text-white/15 font-mono-tech">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00a375]" /> COMPLETED
                                </div>
                                <div className="flex items-center gap-1.5 text-[7px] font-black tracking-[0.2em] text-white/15 font-mono-tech">
                                    <div className="w-1.5 h-1.5 border border-[#e66b00]" /> IN_PROGRESS
                                </div>
                                <div className="flex items-center gap-1.5 text-[7px] font-black tracking-[0.2em] text-white/15 font-mono-tech">
                                    <div className="w-1.5 h-1.5 border border-white/10" /> NULL
                                </div>
                            </div>
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
