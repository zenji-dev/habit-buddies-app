import { useMemo } from "react";

interface SystemLogProps {
    habitsCount: number;
    checkedToday: number;
    hasParty: boolean;
    streak: number;
}

export const SystemLog = ({ habitsCount, checkedToday, hasParty, streak }: SystemLogProps) => {
    const messages = useMemo(() => {
        const msgs: { status: "OK" | "WARN" | "ERR"; text: string }[] = [];

        msgs.push({ status: "OK", text: "DB_SYNC_SUCCESSFUL" });

        if (hasParty) {
            msgs.push({ status: "OK", text: "WEBSOCKET_CONNECTED" });
        } else {
            msgs.push({ status: "WARN", text: "PARTY_NET_OFFLINE" });
        }

        if (checkedToday < habitsCount && habitsCount > 0) {
            const pending = habitsCount - checkedToday;
            msgs.push({ status: "WARN", text: `${pending}_HABITS_PENDING_TODAY` });
        }

        if (streak > 7) {
            msgs.push({ status: "OK", text: `STREAK_SHIELD_ACTIVE_${streak}D` });
        } else if (streak === 0 && habitsCount > 0) {
            msgs.push({ status: "WARN", text: "STREAK_BROKEN_REBUILD_REQ" });
        }

        msgs.push({ status: "OK", text: "HABIT_OS_v2.0.48_READY" });

        return msgs;
    }, [habitsCount, checkedToday, hasParty, streak]);

    const statusColor = (s: "OK" | "WARN" | "ERR") => {
        if (s === "OK") return "text-[#25f4f4]";
        if (s === "WARN") return "text-yellow-400";
        return "text-red-500";
    };

    return (
        <div className="bg-background-dark rounded neo-border p-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-[#25f4f4] rounded-full"></span>
                <p className="text-[10px] text-[#25f4f4] font-bold uppercase">LIVE_FEED</p>
            </div>
            <div className="space-y-1.5">
                {messages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] leading-tight">
                        <span className={`font-bold shrink-0 ${statusColor(msg.status)}`}>
                            [{msg.status}]
                        </span>
                        <span className="text-slate-500">{msg.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
