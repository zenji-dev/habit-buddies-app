import { useMemo } from "react";
import { CalendarDays } from "lucide-react";

interface ConsistencyMapProps {
    checkIns: { completed_at: string }[];
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DAYS = ["", "Seg", "", "Qua", "", "Sex", ""];

export const ConsistencyMap = ({ checkIns }: ConsistencyMapProps) => {
    const { grid, monthLabels, totalCheckIns } = useMemo(() => {
        // Build a map of date -> count
        const countMap: Record<string, number> = {};
        for (const ci of checkIns) {
            const d = ci.completed_at.slice(0, 10); // "YYYY-MM-DD"
            countMap[d] = (countMap[d] || 0) + 1;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Go back ~52 weeks (364 days) to start on a Sunday
        const endDay = new Date(today);
        const startDay = new Date(today);
        startDay.setDate(startDay.getDate() - 363); // 364 days total = 52 weeks

        // Adjust to start on Sunday
        const dayOfWeek = startDay.getDay();
        startDay.setDate(startDay.getDate() - dayOfWeek);

        // Build columns (weeks)
        const weeks: { date: Date; count: number }[][] = [];
        const labels: { text: string; col: number }[] = [];
        let current = new Date(startDay);
        let lastMonth = -1;

        while (current <= endDay) {
            const week: { date: Date; count: number }[] = [];
            for (let d = 0; d < 7; d++) {
                const dateStr = current.toISOString().slice(0, 10);
                const isFuture = current > today;
                week.push({
                    date: new Date(current),
                    count: isFuture ? -1 : (countMap[dateStr] || 0),
                });

                // Track month labels on first day of each month
                if (current.getDate() <= 7 && d === 0 && current.getMonth() !== lastMonth) {
                    labels.push({ text: MONTHS[current.getMonth()], col: weeks.length });
                    lastMonth = current.getMonth();
                }

                current.setDate(current.getDate() + 1);
            }
            weeks.push(week);
        }

        let total = 0;
        for (const v of Object.values(countMap)) total += v;

        return { grid: weeks, monthLabels: labels, totalCheckIns: total };
    }, [checkIns]);

    const getColor = (count: number): string => {
        if (count < 0) return "bg-transparent";
        if (count === 0) return "bg-secondary";
        if (count === 1) return "bg-primary/30";
        if (count === 2) return "bg-primary/55";
        if (count === 3) return "bg-primary/75";
        return "bg-primary";
    };

    return (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    Mapa de Consistência
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                    Menos
                    <span className="w-2.5 h-2.5 rounded-[3px] bg-secondary" />
                    <span className="w-2.5 h-2.5 rounded-[3px] bg-primary/30" />
                    <span className="w-2.5 h-2.5 rounded-[3px] bg-primary/55" />
                    <span className="w-2.5 h-2.5 rounded-[3px] bg-primary" />
                    Mais
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="inline-flex flex-col gap-0">
                    {/* Month labels */}
                    <div className="flex ml-8">
                        {monthLabels.map((label, i) => (
                            <span
                                key={i}
                                className="text-[10px] text-muted-foreground font-medium"
                                style={{
                                    position: "relative",
                                    left: `${label.col * 14}px`,
                                    marginRight: i < monthLabels.length - 1
                                        ? `${((monthLabels[i + 1]?.col || 0) - label.col) * 14 - 26}px`
                                        : "0px",
                                }}
                            >
                                {label.text}
                            </span>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="flex gap-0">
                        {/* Day labels */}
                        <div className="flex flex-col justify-between pr-2 pt-0.5" style={{ height: `${7 * 14 - 2}px` }}>
                            {DAYS.map((day, i) => (
                                <span key={i} className="text-[9px] text-muted-foreground font-medium leading-none h-[12px] flex items-center">
                                    {day}
                                </span>
                            ))}
                        </div>

                        {/* Cells */}
                        <div className="flex gap-[2px]">
                            {grid.map((week, wi) => (
                                <div key={wi} className="flex flex-col gap-[2px]">
                                    {week.map((day, di) => (
                                        <div
                                            key={di}
                                            className={`w-[12px] h-[12px] rounded-[3px] ${getColor(day.count)} transition-colors`}
                                            title={
                                                day.count >= 0
                                                    ? `${day.date.toLocaleDateString("pt-BR")}: ${day.count} check-in${day.count !== 1 ? "s" : ""}`
                                                    : ""
                                            }
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3 font-medium">
                <span className="text-foreground font-bold">{totalCheckIns.toLocaleString("pt-BR")}</span> check-ins no último ano
            </p>
        </div>
    );
};
