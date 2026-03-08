import { useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import { Layout } from "@/components/Layout";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { AddFriendDialog } from "@/components/AddFriendDialog";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { WeeklyStreak } from "@/components/WeeklyStreak";
import { PartyChallenge } from "@/components/PartyChallenge";
import { ChallengeInvites } from "@/components/ChallengeInvites";
import { MyHabitsDialog } from "@/components/MyHabitsDialog";
import { SystemLog } from "@/components/SystemLog";

import { ActiveTasksGrid } from "@/components/ActiveTasksGrid";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { useSocial } from "@/hooks/useSocial";
import { Bell, Plus, Settings2, UserPlus } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@clerk/clerk-react";

const Dashboard = () => {
  const { habits, isLoading, checkIn, uncheck, getStreak, isCheckedToday, checkIns } = useHabits();
  const { invites, challenge } = usePartyChallenge();
  const { incomingRequests } = useSocial();
  const { userId } = useAuth();

  const [isFriendDialogOpen, setIsFriendDialogOpen] = useState(false);

  const invitesCount = (invites?.length || 0) + (incomingRequests?.length || 0);
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

        {/* ===== TOP BAR ===== */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="text-[#25f4f4]/60">SYS</span>
            <span className="text-[#25f4f4]/60">/</span>
            <span className="text-white uppercase tracking-wider">DASHBOARD</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-10 h-10 flex items-center justify-center rounded border-2 border-[#224949] hover:border-[#25f4f4] transition-all text-[#25f4f4] bg-card-dark relative neo-shadow">
                  <Bell className="w-5 h-5" />
                  {invitesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#25f4f4] text-background-dark text-[8px] font-bold flex items-center justify-center rounded">
                      {invitesCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-card-dark neo-border neo-shadow rounded" align="end">
                <div className="p-3 border-b-2 border-[#224949]">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">INCOMING_SIGNALS</h3>
                </div>
                <div className="p-2">
                  <ChallengeInvites />
                </div>
              </PopoverContent>
            </Popover>

            {/* ADD_FRIEND */}
            <button
              onClick={() => setIsFriendDialogOpen(true)}
              className="h-10 bg-card-dark hover:bg-[#2a2a2a] text-[#25f4f4] font-bold px-4 rounded flex items-center justify-center gap-2 transition-colors border-2 border-[#224949] hover:border-[#25f4f4] neo-shadow uppercase tracking-wider text-xs"
            >
              <UserPlus className="w-4 h-4 text-[#25f4f4]" />
              ADD_FRIEND
            </button>

            {/* CONFIG_HABITS */}
            <MyHabitsDialog>
              <div>
                <button className="h-10 bg-card-dark hover:bg-[#2a2a2a] text-[#25f4f4] font-bold px-4 rounded flex items-center justify-center gap-2 transition-colors border-2 border-[#224949] hover:border-[#25f4f4] neo-shadow uppercase tracking-wider text-xs">
                  <Settings2 className="w-4 h-4 text-[#25f4f4]" />
                  CONFIG_HABITS
                </button>
              </div>
            </MyHabitsDialog>

            {/* INIT_HABIT */}
            <AddHabitDialog>
              <button className="h-10 bg-[#25f4f4] text-background-dark font-bold px-5 rounded flex items-center justify-center gap-2 transition-all neo-shadow hover:brightness-110 tracking-wider uppercase text-xs group">
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                INIT_HABIT
              </button>
            </AddHabitDialog>
          </div>
        </div>

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
      <AddFriendDialog open={isFriendDialogOpen} onOpenChange={setIsFriendDialogOpen} />
    </Layout>
  );
};

export default Dashboard;
