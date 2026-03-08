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
        if (s === "OK") return "text-[#00a375]";
        if (s === "WARN") return "text-[#e66b00]";
        return "text-red-500";
    };

    return (
        <div className="glass-panel rounded-none shadow-neon-box overflow-hidden">
            <div className="p-3 space-y-1.5">
                {messages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] font-mono-tech leading-tight">
                        <span className={`font-bold shrink-0 ${statusColor(msg.status)}`}>
                            [{msg.status}]
                        </span>
                        <span className="text-gray-500">{msg.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
