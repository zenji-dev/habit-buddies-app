import { useHabits } from "@/hooks/useHabits";
import { Layout } from "@/components/Layout";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { WeeklyStreak } from "@/components/WeeklyStreak";
import { PartyChallenge } from "@/components/PartyChallenge";
import { SystemLog } from "@/components/SystemLog";
import { ActiveTasksGrid } from "@/components/ActiveTasksGrid";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { format } from "date-fns";

const Dashboard = () => {
  const { habits, isLoading, checkIn, uncheck, getStreak, isCheckedToday, checkIns } = useHabits();
  const { challenge } = usePartyChallenge();

  const todayChecked = habits.filter((h) => isCheckedToday(h.id)).length;
  const totalHabitsCount = habits.length;
  const totalCompletedAllTime = checkIns.length;
  const currentStreak = habits.reduce((max, h) => Math.max(max, getStreak(h.id)), 0);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return format(d, "yyyy-MM-dd");
  });

  const dailyCompletions = last7Days.map(date => {
    const count = checkIns.filter(c => c.completed_at === date).length;
    return totalHabitsCount > 0 ? (count / totalHabitsCount) * 100 : 0;
  });

  const averageCompletionRate = dailyCompletions.reduce((a, b) => a + b, 0) / 7;

  const getBestStreak = () => {
    if (!checkIns.length) return 0;
    const habitCheckinsMap: Record<string, string[]> = {};
    checkIns.forEach(c => {
      if (!habitCheckinsMap[c.habit_id]) habitCheckinsMap[c.habit_id] = [];
      habitCheckinsMap[c.habit_id].push(c.completed_at);
    });
    let maxStreak = 0;
    Object.keys(habitCheckinsMap).forEach(hId => {
      const dates = Array.from(new Set(habitCheckinsMap[hId])).sort((a, b) => b.localeCompare(a));
      if (dates.length === 0) return;
      let currentMax = 1;
      let tempStreak = 1;
      for (let i = 0; i < dates.length - 1; i++) {
        const current = new Date(dates[i] + "T00:00:00");
        const next = new Date(dates[i + 1] + "T00:00:00");
        const diff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) tempStreak++;
        else tempStreak = 1;
        currentMax = Math.max(currentMax, tempStreak);
      }
      maxStreak = Math.max(maxStreak, currentMax);
    });
    return maxStreak;
  };

  const bestStreak = getBestStreak();

  const getTrend = () => {
    if (totalHabitsCount === 0) return { value: "0%", isUp: true };
    const prev7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (i + 7));
      return format(d, "yyyy-MM-dd");
    });
    const prevCompletions = prev7Days.map(date => {
      const count = checkIns.filter(c => c.completed_at === date).length;
      return (count / totalHabitsCount) * 100;
    });
    const prevAverage = prevCompletions.reduce((a, b) => a + b, 0) / 7;
    const diff = averageCompletionRate - prevAverage;
    return { value: `${Math.abs(Math.round(diff))}%`, isUp: diff >= 0 };
  };

  const completionTrend = getTrend();

  return (
    <Layout>
      <div className="w-full space-y-5">

        {/* ===== MAIN 2-COLUMN LAYOUT ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* ─── LEFT COLUMN: Party + Active Tasks ─── */}
          <div className="lg:col-span-8 space-y-5">
            <PartyChallenge />
            <ActiveTasksGrid
              habits={habits}
              checkIns={checkIns}
              isCheckedToday={isCheckedToday}
              getStreak={getStreak}
              onCheckIn={(id) => checkIn.mutate(id)}
              onUncheck={(id) => uncheck.mutate(id)}
              isPending={checkIn.isPending}
              isUnchecking={uncheck.isPending}
              isLoading={isLoading}
            />
          </div>

          {/* ─── RIGHT COLUMN: Metrics + Streak + SystemLog ─── */}
          <div className="lg:col-span-4 space-y-5">
            <DashboardMetrics
              totalHabits={totalHabitsCount}
              totalCompleted={totalCompletedAllTime}
              streak={currentStreak}
              completionRate={averageCompletionRate}
              todayProgress={todayChecked}
              todayTotal={totalHabitsCount}
              bestStreak={bestStreak}
              completionTrend={completionTrend}
            />
            <WeeklyStreak checkIns={checkIns} habitsCount={totalHabitsCount} />
            <SystemLog
              habitsCount={totalHabitsCount}
              checkedToday={todayChecked}
              hasParty={!!challenge}
              streak={currentStreak}
            />
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;
