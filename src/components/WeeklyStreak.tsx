import { format, startOfWeek, addDays, isToday, isBefore, startOfDay } from "date-fns";

const DAY_ABBR = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

interface CheckIn {
    completed_at: string;
    habit_id: string;
}

// ViewBox dimensions — SVG scales to fill whatever space it gets
const VW = 420;
const VH = 85;
const PAD_L = 26;
const PAD_R = 18;
const PAD_T = 12;
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

    // Area path: line + close to baseline
    const areaPath =
        days.map((d, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(d.completion)}`).join(" ") +
        ` L${px(6)},${py(0)} L${px(0)},${py(0)} Z`;

    const gridPcts = [0.25, 0.5, 0.75, 1.0];

    return (
        <div className="bg-card-dark border border-slate-900 rounded-none shadow-neon-box relative overflow-hidden h-full flex flex-col">
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

            {/* ── Header ── */}
            <div className="relative z-10 flex justify-between items-center px-3 pt-1.5 pb-1.5 border-b border-slate-900 shrink-0">
                <h3 className="text-xs font-bold text-white font-mono-tech tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#e66b00] animate-pulse" />
                    STREAK_MONITOR
                </h3>
                <span className="text-[9px] font-mono-tech text-gray-500">
                    [{format(days[0].date, "dd/MM")} — {format(days[6].date, "dd/MM")}]
                </span>
            </div>

            {/* ── Chart fills remaining space ── */}
            <div className="relative z-10 flex-1 min-h-0">
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
                                stroke="#1a2535"
                                strokeWidth="0.8"
                                strokeDasharray="4 5"
                            />
                            <text
                                x={PAD_L - 4}
                                y={py(pct) + 3}
                                textAnchor="end"
                                fill="#374151"
                                fontSize="8"
                                fontFamily="monospace"
                            >
                                {Math.round(pct * 100)}
                            </text>
                        </g>
                    ))}

                    {/* ── Vertical day separators (subtle) ── */}
                    {days.map((_, i) => (
                        <line
                            key={i}
                            x1={px(i)} y1={PAD_T}
                            x2={px(i)} y2={PAD_T + PLOT_H}
                            stroke="#111827"
                            strokeWidth="0.6"
                        />
                    ))}

                    {/* ── Baseline ── */}
                    <line
                        x1={PAD_L} y1={PAD_T + PLOT_H}
                        x2={VW - PAD_R} y2={PAD_T + PLOT_H}
                        stroke="#1a2535"
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

                                {/* Data dot */}
                                <circle
                                    cx={cx} cy={cy}
                                    r={day.isToday || day.completion >= 1 ? 5 : 3.5}
                                    fill={dotFill}
                                    stroke={dotStroke}
                                    strokeWidth={day.isToday || day.completion >= 1 ? 1.8 : 1.2}
                                    opacity={day.isFuture ? 0.3 : 1}
                                    filter={day.isToday || day.completion >= 1 ? "url(#dotglow)" : undefined}
                                />

                                {/* % above dot */}
                                {hasData && !day.isFuture && (
                                    <text
                                        x={cx}
                                        y={cy - 7}
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
        </div>
    );
};
