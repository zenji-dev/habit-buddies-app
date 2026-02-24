import { useHabits } from "@/hooks/useHabits";
import { Layout } from "@/components/Layout";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { WeeklyStreak } from "@/components/WeeklyStreak";
import { PartyChallenge } from "@/components/PartyChallenge";
import { ChallengeInvites } from "@/components/ChallengeInvites";
import { MyHabitsDialog } from "@/components/MyHabitsDialog";

import { ActiveTasksGrid } from "@/components/ActiveTasksGrid";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { Bell, Plus, Settings2 } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { habits, isLoading, checkIn, uncheck, getStreak, isCheckedToday, checkIns } = useHabits();
  const { invites } = usePartyChallenge();
  const { userId } = useAuth();

  const invitesCount = invites?.length || 0;
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#00a375] border-t-transparent animate-spin" />
            <p className="text-gray-600 text-[10px] font-mono-tech uppercase tracking-widest">
              &gt; LOADING_SYSTEM...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full space-y-6">

        {/* ===== TOP BAR ===== */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-mono-tech">
            <span className="text-gray-500">SYS</span>
            <span className="text-gray-700">/</span>
            <span className="text-[#00a375] font-bold uppercase tracking-wider">DASHBOARD</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-10 h-10 flex items-center justify-center rounded-none border border-slate-800 hover:border-[#00a375] hover:shadow-[0_0_15px_rgba(0,163,117,0.4)] transition-all text-[#00a375] bg-card-dark relative">
                  <Bell className="w-5 h-5" />
                  {invitesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e66b00] text-white text-[8px] font-bold flex items-center justify-center animate-pulse">
                      {invitesCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 glass-panel shadow-neon-box rounded-none" align="end">
                <div className="p-3 border-b border-slate-900">
                  <h3 className="text-xs font-bold text-white font-mono-tech uppercase tracking-wider">INCOMING_SIGNALS</h3>
                </div>
                <div className="p-2">
                  <ChallengeInvites />
                </div>
              </PopoverContent>
            </Popover>

            {/* CONFIG_HABITS */}
            <MyHabitsDialog>
              <div>
                <button className="h-10 bg-card-dark hover:bg-[#050a14] text-[#00a375] font-medium font-mono-tech px-4 rounded-none flex items-center justify-center gap-2 transition-colors border border-[#00a375]/50 hover:border-[#00a375] shadow-[0_0_5px_rgba(0,163,117,0.1)] uppercase tracking-wider text-xs">
                  <Settings2 className="w-4 h-4 text-[#00a375]" />
                  CONFIG_HABITS
                </button>
              </div>
            </MyHabitsDialog>

            {/* INIT_HABIT */}
            <AddHabitDialog>
              <button className="h-10 bg-[#00a375] text-white font-bold font-mono-tech px-5 rounded-none flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,163,117,0.4)] hover:shadow-[0_0_25px_rgba(0,163,117,0.6)] hover:bg-[#008f66] tracking-wider uppercase text-xs group">
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                INIT_HABIT
              </button>
            </AddHabitDialog>
          </div>
        </div>

        {/* ===== MAIN DASHBOARD LAYOUT ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: My Party Net */}
          <div className="lg:col-span-5 xl:col-span-5 h-[420px] lg:h-[auto]">
            <PartyChallenge />
          </div>

          {/* Right Column: Metrics & Streak */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-6 h-[420px] lg:h-auto">
            <div className="flex-[10] min-h-0">
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
            </div>
            <div className="flex-[9] min-h-0">
              <WeeklyStreak checkIns={checkIns} habitsCount={totalHabitsCount} />
            </div>
          </div>
        </div>


        {/* ===== ROW 4: Active Tasks Grid (full width) ===== */}
        <ActiveTasksGrid
          habits={habits}
          checkIns={checkIns}
          isCheckedToday={isCheckedToday}
          getStreak={getStreak}
          onCheckIn={(id) => checkIn.mutate(id)}
          onUncheck={(id) => uncheck.mutate(id)}
          isPending={checkIn.isPending}
          isUnchecking={uncheck.isPending}
        />

      </div>
    </Layout>
  );
};

export default Dashboard;
