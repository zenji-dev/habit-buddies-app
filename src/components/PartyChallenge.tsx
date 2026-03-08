import { useMemo, useState, useRef } from "react";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { StartPartyDialog } from "./StartPartyDialog";
import { InviteToPartyDialog } from "./InviteToPartyDialog";
import { cn } from "@/lib/utils";
import { Network, Check, Users, UserPlus, UserMinus, LogOut, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

export const PartyChallenge = () => {
    const { challenge, checkIn, kickMember, leaveParty, addHabitToParty } = usePartyChallenge();
    const { userId } = useAuth();
    const [isStartOpen, setIsStartOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [newHabitName, setNewHabitName] = useState("");
    const [newHabitIcon, setNewHabitIcon] = useState("💪");
    const [showAddRow, setShowAddRow] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const handleAddHabit = () => {
        const name = newHabitName.trim();
        if (!name) return;
        addHabitToParty.mutate({ name, icon: newHabitIcon }, {
            onSuccess: () => {
                setNewHabitName("");
                setNewHabitIcon("💪");
                setShowAddRow(false);
            }
        });
    };

    return (
        <>
            <div className="bg-card-dark neo-border neo-shadow rounded flex flex-col p-0 relative overflow-hidden">

                {/* Header Row */}
                <div className="border-b-2 border-[#224949] px-4 py-2.5 bg-background-dark/80 backdrop-blur z-10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border-2 border-[#25f4f4]/50 bg-[#25f4f4]/10 rounded flex items-center justify-center">
                            <Network className="w-4 h-4 text-[#25f4f4]" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white tracking-wider leading-none uppercase">
                                MY_PARTY_NET
                            </h2>
                            <div className="flex items-center gap-2 text-[9px] mt-0.5">
                                <span className="text-slate-500">STATUS:</span>
                                <span className={isOnline ? "text-[#25f4f4]" : "text-slate-500"}>{isOnline ? "ONLINE" : "OFFLINE"}</span>
                                {hasChallenge && (
                                    <>
                                        <span className="text-slate-400">|</span>
                                        <span className="text-slate-500">#HABIT_SYNC_V4</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasChallenge && (
                            <>
                                {/* Net ID */}
                                <span className="text-[8px] text-slate-600 mr-2">
                                    NET_ID: {challenge.id?.slice(0, 6).toUpperCase() || "---"}
                                </span>
                                <button
                                    onClick={() => setIsInviteOpen(true)}
                                    className="px-3 py-1.5 border-2 border-[#224949] text-[#25f4f4] text-[10px] font-bold hover:bg-[#25f4f4]/10 hover:border-[#25f4f4] transition-all uppercase tracking-wider flex items-center gap-1.5 rounded"
                                >
                                    INVITE
                                </button>
                                <button
                                    onClick={() => leaveParty.mutate()}
                                    disabled={leaveParty.isPending}
                                    title="Sair da party"
                                    className="px-3 py-1.5 border-2 border-red-700/40 text-red-500 text-[10px] font-bold hover:bg-red-900/20 transition-all uppercase tracking-wider flex items-center gap-1.5 rounded disabled:opacity-50"
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
                            <div className="text-slate-500 text-sm flex flex-col items-center gap-3">
                                <Network className="w-10 h-10 opacity-20" />
                                <span>NO_NODES_CONNECTED</span>
                                <button
                                    onClick={() => setIsStartOpen(true)}
                                    className="mt-2 px-4 py-2 border-2 border-[#224949] text-[#25f4f4] text-xs font-bold hover:bg-[#25f4f4]/10 hover:border-[#25f4f4] transition-all uppercase tracking-wider rounded"
                                >
                                    INIT_PARTY
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full">
                            {/* Avatars Row + Risk Meter */}
                            <div className="flex items-center gap-4 p-4 border-b-2 border-[#224949]">
                                {/* Participant Avatars */}
                                <div className="flex gap-4 flex-1">
                                    {members.map((member) => {
                                        const isDone = habits.length > 0 && member.completedHabits.length >= habits.length;
                                        return (
                                            <div key={member.user_id} className="flex flex-col items-center gap-1.5 group relative">
                                                <Link to={`/profile/${member.user_id}`}>
                                                    <div
                                                        className={cn(
                                                            "border-2 bg-background-dark rounded flex items-center justify-center overflow-hidden transition-all duration-500 relative",
                                                            "group-hover:scale-105",
                                                            isDone
                                                                ? "border-[#25f4f4] neo-shadow"
                                                                : member.completedHabits.length > 0
                                                                    ? "border-[#25f4f4]/50"
                                                                    : "border-[#224949]"
                                                        )}
                                                        style={{ width: avatarSize, height: avatarSize }}
                                                    >
                                                        {member.avatar_url ? (
                                                            <img
                                                                src={member.avatar_url}
                                                                alt={member.name}
                                                                className={cn(
                                                                    "w-full h-full object-cover transition-all",
                                                                    isDone ? "opacity-100" : "grayscale opacity-60"
                                                                )}
                                                            />
                                                        ) : (
                                                            <Users className="text-slate-500" style={{ width: avatarSize * 0.5, height: avatarSize * 0.5 }} />
                                                        )}

                                                        {isDone && (
                                                            <>
                                                                <div className="absolute inset-0 bg-[#25f4f4]/8 z-10 pointer-events-none" />
                                                                <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-[#25f4f4] text-background-dark flex items-center justify-center z-20 rounded">
                                                                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </Link>
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider transition-colors",
                                                    isDone ? "text-[#25f4f4]" : "text-white/60"
                                                )}>
                                                    {member.name?.split(" ")[0]}
                                                </span>

                                                {/* Kick button */}
                                                {isOwner && member.user_id !== userId && (
                                                    <button
                                                        onClick={() => kickMember.mutate(member.user_id)}
                                                        disabled={kickMember.isPending}
                                                        title="Expulsar da party"
                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-900/80 border border-red-700/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 z-20"
                                                    >
                                                        <UserMinus className="w-2.5 h-2.5 text-red-400" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Risk Meter */}
                                <div className="flex flex-col items-center justify-center border-2 border-[#224949] bg-background-dark/50 px-6 py-3 rounded">
                                    <div className="text-[8px] text-slate-500 tracking-[0.15em] uppercase mb-1">RISK_METER</div>
                                    <div className="text-2xl font-black text-white leading-none">{riskMeterValue}%</div>
                                    <div className="w-full mt-2 h-1 bg-background-dark border border-[#224949] rounded overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-[1500ms] rounded"
                                            style={{
                                                width: `${riskMeterValue}%`,
                                                background: riskMeterValue > 70 ? "#25f4f4" : riskMeterValue > 30 ? "#3a8888" : "#ff2a2a",
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
                                            <tr className="border-b-2 border-[#224949] text-[9px] uppercase tracking-[0.15em] text-slate-500 text-left bg-[#224949]">
                                                <th className="p-3 font-bold border-r-2 border-[#224949] min-w-[140px]">NETWORK_HABIT</th>
                                                {members.map(m => (
                                                    <th key={m.user_id} className="p-3 font-bold text-center uppercase text-[#25f4f4]">
                                                        {m.name?.split(" ")[0]}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {habits.map((habit) => (
                                                <tr key={habit.id} className="border-b border-[#224949] hover:bg-[#25f4f4]/[0.03] transition-colors group">
                                                    <td className="p-3 border-r-2 border-[#224949] whitespace-nowrap">
                                                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide">
                                                            {habit.icon} {habit.name}
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
                                                                        "w-4 h-4 border-2 rounded-sm mx-auto flex items-center justify-center transition-all",
                                                                        isCompleted
                                                                            ? "bg-[#25f4f4] border-[#25f4f4]"
                                                                            : canCheckIn
                                                                                ? "border-[#224949] hover:border-[#25f4f4] cursor-pointer"
                                                                                : "border-[#224949]/50 cursor-default"
                                                                    )}
                                                                >
                                                                    {isCompleted && <Check className="w-2.5 h-2.5 text-background-dark stroke-[3px]" />}
                                                                </button>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}

                                            {/* Add Habit Row — owner only */}
                                            {isOwner && (
                                                showAddRow ? (
                                                    <tr className="border-t-2 border-[#25f4f4]/30 bg-[#25f4f4]/[0.03]">
                                                        <td className="p-2 border-r-2 border-[#224949]" colSpan={1}>
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    ref={inputRef}
                                                                    type="text"
                                                                    value={newHabitIcon}
                                                                    onChange={e => setNewHabitIcon(e.target.value)}
                                                                    className="w-9 bg-background-dark border border-[#224949] text-white text-sm text-center rounded px-1 py-1 focus:border-[#25f4f4] outline-none"
                                                                    maxLength={2}
                                                                    placeholder="💪"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={newHabitName}
                                                                    onChange={e => setNewHabitName(e.target.value)}
                                                                    onKeyDown={e => { if (e.key === "Enter") handleAddHabit(); if (e.key === "Escape") setShowAddRow(false); }}
                                                                    className="flex-1 bg-background-dark border border-[#224949] text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 rounded focus:border-[#25f4f4] outline-none placeholder:text-slate-600 min-w-0"
                                                                    placeholder="NOME_DO_HÁBITO"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        </td>
                                                        <td colSpan={members.length} className="p-2">
                                                            <div className="flex items-center gap-2 justify-end">
                                                                <button
                                                                    onClick={() => { setShowAddRow(false); setNewHabitName(""); setNewHabitIcon("💪"); }}
                                                                    className="text-[9px] text-slate-500 hover:text-white uppercase tracking-wider font-bold px-2 py-1 transition-colors"
                                                                >
                                                                    ESC
                                                                </button>
                                                                <button
                                                                    onClick={handleAddHabit}
                                                                    disabled={!newHabitName.trim() || addHabitToParty.isPending}
                                                                    className="px-3 py-1 bg-[#25f4f4] text-background-dark text-[9px] font-bold uppercase tracking-wider rounded disabled:opacity-40 hover:bg-[#1ec8c8] transition-colors flex items-center gap-1"
                                                                >
                                                                    <Plus className="w-3 h-3" /> ADD
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    <tr>
                                                        <td colSpan={members.length + 1} className="p-2">
                                                            <button
                                                                onClick={() => { setShowAddRow(true); setTimeout(() => inputRef.current?.focus(), 50); }}
                                                                className="w-full flex items-center justify-center gap-1.5 text-[9px] text-slate-500 hover:text-[#25f4f4] uppercase tracking-widest font-bold py-1 border border-dashed border-[#224949] hover:border-[#25f4f4]/40 rounded transition-all"
                                                            >
                                                                <Plus className="w-3 h-3" /> ADD_HABIT
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <StartPartyDialog open={isStartOpen} onOpenChange={setIsStartOpen} />
            <InviteToPartyDialog open={isInviteOpen} onOpenChange={setIsInviteOpen} />
        </>
    );
};
