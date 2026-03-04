import React, { useState, useMemo } from 'react';
import { Check, UserPlus, Zap, Users, Shield, Activity } from 'lucide-react';

const MyPartyNet = () => {
    const partyInfo = {
        name: "HABIT_BUDDIES_GIGA",
        description: "Fazer o habits buddies gigante",
        habits: ["Leitura", "Beber Água", "Academia"]
    };

    const [participants, setParticipants] = useState([
        { id: '1', name: 'Djesus08', habits: { 'Leitura': true, 'Beber Água': true, 'Academia': true }, avatar: null },
        { id: '2', name: 'Zenji', habits: { 'Leitura': true, 'Beber Água': true, 'Academia': true }, avatar: null },
        { id: '3', name: 'Felipe', habits: { 'Leitura': false, 'Beber Água': false, 'Academia': false }, avatar: null },
        { id: '4', name: 'Dejesus', habits: { 'Leitura': true, 'Beber Água': false, 'Academia': false }, avatar: '/placeholder.svg' },
    ]);

    // Cálculo Risk Meter: (Concluídos / Total) * 100
    const riskMeterValue = useMemo(() => {
        const totalHabits = participants.length * partyInfo.habits.length;
        const completedHabits = participants.reduce((sum, p) =>
            sum + Object.values(p.habits).filter(v => v).length, 0
        );
        return Math.round((completedHabits / totalHabits) * 100);
    }, [participants, partyInfo.habits]);

    return (
        <div className="w-full bg-black text-[#00FF88] font-mono border border-[#00FF88]/20 shadow-[0_0_30px_rgba(0,255,136,0.05)] overflow-hidden">
            {/* HEADER SECTION */}
            <div className="flex justify-between items-center p-4 border-b border-[#00FF88]/10 bg-[#000805]">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#e66b00] shadow-[0_0_8px_#e66b00]"></div>
                    <h2 className="text-lg font-black tracking-tighter uppercase text-white">MY_PARTY_NET</h2>
                </div>
                <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 px-3 py-1 border border-[#00FF88]/40 hover:bg-[#00FF88]/10 transition-all text-[10px] font-bold">
                        <UserPlus className="w-3 h-3" /> INVITE
                    </button>
                    <div className="text-[10px] font-bold tracking-widest text-[#e66b00]">
                        STATUS: <span className="animate-pulse">ONLINE</span>
                    </div>
                </div>
            </div>

            {/* INFORMATION LAYER */}
            <div className="p-6 space-y-2 border-b border-[#00FF88]/10 bg-gradient-to-b from-black to-[#000502]">
                <div className="flex gap-2 text-[11px]">
                    <span className="text-white/40"># PARTY_NAME:</span>
                    <span className="text-white font-bold">{partyInfo.name}</span>
                </div>
                <div className="flex gap-2 text-[11px]">
                    <span className="text-white/40"># TARGET:</span>
                    <span className="text-[#00FF88]/80">{partyInfo.description}</span>
                </div>
                <div className="flex gap-2 text-[11px]">
                    <span className="text-white/40"># ACTIVE_MODULES:</span>
                    <span className="text-white/60 lowercase italic">{partyInfo.habits.join(", ")}</span>
                </div>
            </div>

            {/* PROGRESS FLOW SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 items-center border-b border-[#00FF88]/10">

                {/* RISK METER GAUGE */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-48 h-24 overflow-hidden flex items-end justify-center">
                        {/* SVG GAUGE BG */}
                        <svg className="absolute top-0 w-48 h-48 -rotate-90">
                            <circle cx="96" cy="96" r="80" fill="none" stroke="#0a120d" strokeWidth="12" strokeDasharray="251 502" />
                            <circle
                                cx="96" cy="96" r="80" fill="none"
                                stroke={riskMeterValue > 70 ? "#00FF88" : riskMeterValue > 30 ? "#e66b00" : "#ff2a2a"}
                                strokeWidth="12"
                                strokeDasharray={`${(riskMeterValue * 2.51)} 502`}
                                className="transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1)"
                            />
                        </svg>
                        <div className="z-10 text-center pb-2">
                            <div className="text-[10px] text-[#00FF88]/40 font-black tracking-[0.2em] uppercase mb-1">Risk Meter</div>
                            <div className="text-3xl font-black text-white leading-none">{riskMeterValue}%</div>
                        </div>
                        {/* Pointer needle */}
                        <div
                            className="absolute bottom-0 left-1/2 w-0.5 h-16 bg-white/40 origin-bottom transition-all duration-[1500ms]"
                            style={{ transform: `translateX(-50%) rotate(${(riskMeterValue * 1.8) - 90}deg)` }}
                        ></div>
                    </div>
                    <div className="text-[9px] text-white/20 tracking-[0.4em]">SYNC_CAPACITY_LIMIT</div>
                </div>

                {/* PARTICIPANTS NODES */}
                <div className="lg:col-span-2 flex flex-wrap justify-center gap-6">
                    {participants.map(user => {
                        const isDone = Object.values(user.habits).every(v => v);
                        const partial = Object.values(user.habits).filter(v => v).length;
                        const total = partyInfo.habits.length;
                        const pct = Math.round((partial / total) * 100);

                        return (
                            <div key={user.id} className="flex flex-col items-center gap-3 group">
                                <div className={`relative w-24 h-24 border p-1 transition-all duration-500 
                  ${isDone ? 'border-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.2)]' : 'border-white/10'}`}>

                                    <div className={`w-full h-full bg-[#050505] flex items-center justify-center relative overflow-hidden`}>
                                        {user.avatar ? (
                                            <img src={user.avatar} className={`w-full h-full object-cover grayscale opacity-60 transition-all ${isDone ? 'backdrop-blur-sm scale-110' : ''}`} alt="" />
                                        ) : (
                                            user.id === '2' ? <Zap className="w-10 h-10 text-white/40" /> : <Users className="w-10 h-10 text-white/10" />
                                        )}

                                        {/* Discrete Check Icon */}
                                        {isDone && (
                                            <div className="absolute top-1 right-1 w-5 h-5 bg-[#00FF88] text-black flex items-center justify-center shadow-[0_0_10px_#00FF88] z-20">
                                                <Check className="w-3.5 h-3.5 stroke-[4px]" />
                                            </div>
                                        )}

                                        {/* Background Blur Overlay for 100% users */}
                                        {isDone && <div className="absolute inset-0 bg-[#00FF88]/5 backdrop-blur-[2px] z-10"></div>}
                                    </div>
                                </div>

                                <div className="text-center space-y-1">
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isDone ? 'text-white' : 'text-white/40'}`}>
                                        {user.name}
                                    </span>
                                    {/* Status Grid Below Name */}
                                    <div className="flex justify-center gap-1.5 pt-0.5">
                                        {partyInfo.habits.map((h, idx) => (
                                            <div key={idx} className={`w-1.5 h-1.5 rounded-full ${user.habits[h] ? 'bg-[#00FF88] shadow-[0_0_4px_#00FF88]' : 'bg-white/5 border border-white/10'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* HABIT DATA TABLE */}
            <div className="w-full overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-white/30 text-left bg-white/[0.02]">
                            <th className="p-4 font-black border-r border-white/5">Participant_Node</th>
                            <th className="p-4 font-black">Daily_Habit_Pulse</th>
                            <th className="p-4 font-black text-right pr-8">Efficiency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map(user => {
                            const partial = Object.values(user.habits).filter(v => v).length;
                            const total = partyInfo.habits.length;
                            const pct = (partial / total) * 100;
                            const isDone = pct === 100;

                            return (
                                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                                    <td className="p-4 w-1/4 border-r border-white/5">
                                        <span className="text-[10px] font-bold text-white/80 group-hover:text-[#00FF88] transition-colors">{user.name}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-4">
                                            {partyInfo.habits.map((habit, ix) => (
                                                <div key={ix} className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${user.habits[habit] ? 'bg-[#00FF88] shadow-[0_0_5px_#00FF88]' : 'bg-white/5 border border-white/10'}`}></div>
                                                    <span className={`text-[9px] uppercase tracking-tighter ${user.habits[habit] ? 'text-white/60' : 'text-white/10'}`}>{habit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 w-1/4">
                                        <div className="flex items-center justify-end gap-3 px-4">
                                            <div className="w-24 h-1 bg-[#111] border border-white/5 relative">
                                                <div
                                                    className={`h-full transition-all duration-700 ${isDone ? 'bg-[#00FF88] shadow-[0_0_8px_#00FF88]' : 'bg-[#e66b00]'}`}
                                                    style={{ width: `${pct}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-[10px] font-black w-8 text-right ${isDone ? 'text-[#00FF88]' : 'text-[#e66b00]'}`}>{Math.round(pct)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* FOOTER LEGEND */}
            <div className="p-4 bg-black border-t border-white/5 flex justify-center gap-8">
                <div className="flex items-center gap-2 text-[8px] font-black tracking-[0.3em] text-white/20">
                    <div className="w-2 h-2 rounded-full bg-[#00FF88]"></div> COMPLETED_LINK
                </div>
                <div className="flex items-center gap-2 text-[8px] font-black tracking-[0.3em] text-white/20">
                    <div className="w-2 h-2 border border-[#e66b00]"></div> UPLINK_ACTIVE
                </div>
                <div className="flex items-center gap-2 text-[8px] font-black tracking-[0.3em] text-white/20">
                    <div className="w-2 h-2 border border-white/10"></div> NULL_PACKET
                </div>
            </div>
        </div>
    );
};

export default MyPartyNet;
