import { format, startOfWeek, addDays, isToday, isBefore, startOfDay } from "date-fns";
import { useMemo } from "react";

const DAY_ABBR = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

interface CheckIn {
    completed_at: string;
    habit_id: string;
}

// ViewBox dimensions
const VW = 420;
const VH = 100;
const PAD_L = 26;
const PAD_R = 18;
const PAD_T = 14;
const PAD_B = 22;

const PLOT_W = VW - PAD_L - PAD_R;
const PLOT_H = VH - PAD_T - PAD_B;

export const WeeklyStreak = ({
    checkIns,
    habitsCount,
}: {
    checkIns: CheckIn[];
    habitsCount: number;
}) => {
    const start = startOfWeek(new Date(), { weekStartsOn: 0 });

    const days = Array.from({ length: 7 }).map((_, i) => {
        const date = addDays(start, i);
        const dateStr = format(date, "yyyy-MM-dd");
        const count = checkIns.filter(c => c.completed_at.startsWith(dateStr)).length;
        const completion = habitsCount > 0 ? Math.min(count / habitsCount, 1) : 0;
        const past = isBefore(date, startOfDay(new Date()));
        const today = isToday(date);
        const future = !today && !past;
        return {
            date,
            label: DAY_ABBR[i],
            dateStr,
            completion,
            isToday: today,
            isPast: past,
            isFuture: future,
        };
    });

    // Map day index → SVG x/y
    const px = (i: number) => PAD_L + (i / 6) * PLOT_W;
    const py = (v: number) => PAD_T + PLOT_H - v * PLOT_H;

    // Build polyline points
    const points = days.map((d, i) => `${px(i)},${py(d.completion)}`).join(" ");

    // Area path
    const areaPath =
        days.map((d, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(d.completion)}`).join(" ") +
        ` L${px(6)},${py(0)} L${px(0)},${py(0)} Z`;

    const gridPcts = [0.25, 0.5, 0.75, 1.0];

    // Generate analyst note
    const analystNote = useMemo(() => {
        const todayIdx = days.findIndex(d => d.isToday);
        const todayDay = todayIdx >= 0 ? days[todayIdx] : null;
        const pastDays = days.filter(d => d.isPast);
        const avgPast = pastDays.length > 0 ? pastDays.reduce((s, d) => s + d.completion, 0) / pastDays.length : 0;

        if (todayDay && todayDay.completion > avgPast && avgPast > 0) {
            const pctAbove = Math.round(((todayDay.completion - avgPast) / avgPast) * 100);
            return `ANALYST_NOTE: ${todayDay.label} performance exceeded baseline protocols by ${pctAbove}%. Synchronization recommended.`;
        }
        if (todayDay && todayDay.completion === 0 && habitsCount > 0) {
            return `ANALYST_NOTE: No check-ins registered for ${todayDay.label}. Initiate habit protocols.`;
        }
        if (pastDays.length > 0 && avgPast >= 0.8) {
            return `ANALYST_NOTE: Weekly average above 80% threshold. System operating at optimal capacity.`;
        }
        return `ANALYST_NOTE: Monitoring active. Data collection in progress for current cycle.`;
    }, [days, habitsCount]);

    return (
        <div className="glass-panel rounded-none shadow-neon-box relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

            {/* ── Header ── */}
            <div className="relative z-10 flex justify-between items-center px-3 pt-2 pb-1.5 border-b border-[#00a375]/30 shrink-0">
                <h3 className="text-xs font-bold text-white font-mono-tech tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#e66b00] animate-pulse" />
                    STREAK_MONITOR
                </h3>
                <span className="text-[9px] font-mono-tech text-gray-500">
                    [{format(days[0].date, "dd/MM")} — {format(days[6].date, "dd/MM")}]
                </span>
            </div>

            {/* ── Chart ── */}
            <div className="relative z-10 flex-1 min-h-[140px]">
                <svg
                    viewBox={`0 0 ${VW} ${VH}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-full"
                >
                    <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00a375" stopOpacity="0.30" />
                            <stop offset="100%" stopColor="#00a375" stopOpacity="0.01" />
                        </linearGradient>
                        <filter id="lineglow">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="dotglow">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* ── Grid lines ── */}
                    {gridPcts.map(pct => (
                        <g key={pct}>
                            <line
                                x1={PAD_L} y1={py(pct)}
                                x2={VW - PAD_R} y2={py(pct)}
                                stroke="rgba(0,163,117,0.3)"
                                strokeWidth="0.8"
                                strokeDasharray="4 5"
                            />
                            <text
                                x={PAD_L - 4}
                                y={py(pct) + 3}
                                textAnchor="end"
                                fill="#374151"
                                fontSize="7"
                                fontFamily="monospace"
                            >
                                {Math.round(pct * 100)}
                            </text>
                        </g>
                    ))}

                    {/* ── Vertical day separators ── */}
                    {days.map((_, i) => (
                        <line
                            key={i}
                            x1={px(i)} y1={PAD_T}
                            x2={px(i)} y2={PAD_T + PLOT_H}
                            stroke="rgba(0,163,117,0.2)"
                            strokeWidth="0.6"
                        />
                    ))}

                    {/* ── Baseline ── */}
                    <line
                        x1={PAD_L} y1={PAD_T + PLOT_H}
                        x2={VW - PAD_R} y2={PAD_T + PLOT_H}
                        stroke="rgba(0,163,117,0.3)"
                        strokeWidth="1"
                    />

                    {/* ── Area fill ── */}
                    <path d={areaPath} fill="url(#areaGrad)" />

                    {/* ── Line ── */}
                    <polyline
                        points={points}
                        fill="none"
                        stroke="#00a375"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        filter="url(#lineglow)"
                        strokeDasharray="6 3"
                    />

                    {/* ── Dots + labels per day ── */}
                    {days.map((day, i) => {
                        const cx = px(i);
                        const cy = py(day.completion);
                        const hasData = day.completion > 0;
                        const dotColor = day.isToday ? "#e66b00" : "#00a375";
                        const dotStroke = day.isToday ? "#e66b00" : day.isFuture ? "#1f2d3d" : "#00a375";
                        const dotFill = day.isFuture
                            ? "#070e1a"
                            : day.completion === 0
                                ? "#070e1a"
                                : dotColor;

                        return (
                            <g key={i}>
                                {/* Outer glow ring for today */}
                                {day.isToday && (
                                    <circle
                                        cx={cx} cy={cy}
                                        r="7"
                                        fill="none"
                                        stroke="#e66b00"
                                        strokeWidth="1"
                                        opacity="0.35"
                                    />
                                )}

                                {/* Diamond for today, circle for others */}
                                {day.isToday ? (
                                    <polygon
                                        points={`${cx},${cy - 5} ${cx + 5},${cy} ${cx},${cy + 5} ${cx - 5},${cy}`}
                                        fill={dotFill}
                                        stroke={dotStroke}
                                        strokeWidth="1.5"
                                        filter="url(#dotglow)"
                                    />
                                ) : (
                                    <circle
                                        cx={cx} cy={cy}
                                        r={day.completion >= 1 ? 4.5 : 3}
                                        fill={dotFill}
                                        stroke={dotStroke}
                                        strokeWidth={day.completion >= 1 ? 1.5 : 1}
                                        opacity={day.isFuture ? 0.3 : 1}
                                        filter={day.completion >= 1 ? "url(#dotglow)" : undefined}
                                    />
                                )}

                                {/* % above dot */}
                                {hasData && !day.isFuture && (
                                    <text
                                        x={cx}
                                        y={cy - 8}
                                        textAnchor="middle"
                                        fill={day.isToday ? "#e66b00" : "#00a375"}
                                        fontSize="7"
                                        fontFamily="monospace"
                                        opacity="0.85"
                                    >
                                        {Math.round(day.completion * 100)}%
                                    </text>
                                )}

                                {/* Day label */}
                                <text
                                    x={cx}
                                    y={PAD_T + PLOT_H + 10}
                                    textAnchor="middle"
                                    fill={day.isToday ? "#e66b00" : "#4b5563"}
                                    fontSize="6"
                                    fontFamily="monospace"
                                    fontWeight={day.isToday ? "bold" : "normal"}
                                >
                                    {day.label}
                                </text>

                                {/* NOW */}
                                {day.isToday && (
                                    <text
                                        x={cx}
                                        y={PAD_T + PLOT_H + 18}
                                        textAnchor="middle"
                                        fill="#00a375"
                                        fontSize="5"
                                        fontFamily="monospace"
                                    >
                                        NOW
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* ── Analyst Note ── */}
            <div className="relative z-10 mx-3 mb-3 p-2.5 bg-[#00a375]/5 border border-[#00a375]/30">
                <p className="text-[10px] font-mono-tech text-[#00a375] leading-relaxed">
                    {analystNote}
                </p>
            </div>
        </div>
    );
};
