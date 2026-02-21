import { useHabits } from "@/hooks/useHabits";
import { useProfile } from "@/hooks/useProfile";
import { useSocial } from "@/hooks/useSocial";
import { Layout } from "@/components/Layout";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { WeeklyStreak } from "@/components/WeeklyStreak";
import { PartyChallenge } from "@/components/PartyChallenge";
import { ChallengeInvites } from "@/components/ChallengeInvites";
import { MyHabitsDialog } from "@/components/MyHabitsDialog";

import { ActiveTasksGrid } from "@/components/ActiveTasksGrid";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { Bell, Plus, Settings2, Instagram, Twitter } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data: profile } = useProfile();
  const { habits, isLoading, checkIn, uncheck, getStreak, isCheckedToday, checkIns } = useHabits();
  const { friends } = useSocial();
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
      <div className="w-full flex flex-col gap-6 lg:h-[calc(100vh-84px)]">

        {/* ===== TOP BAR ===== */}
        <div className="flex items-center justify-between shrink-0">
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
              <PopoverContent className="w-80 p-0 bg-background-dark border-slate-900 shadow-neon-box rounded-none" align="end">
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

        {/* ===== ROW 1: Profile + Party ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 shrink-0">
          {/* Profile card — 3 cols */}
          <div className="lg:col-span-3">
            <div className="bg-surface-dark border border-slate-900 rounded-none relative pb-4 shadow-neon-box grid-bg">
              {/* Cover */}
              <div className="h-[90px] w-full bg-[#050a14] relative overflow-hidden">
                <div className="absolute inset-0 bg-[#00a375] mix-blend-overlay opacity-5" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/60 to-background-dark" />
                <div className="absolute top-0 left-0 w-full h-px bg-[#00a375]/40 shadow-[0_0_10px_#00a375]" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-[#00a375]/10" />
              </div>

              <div className="px-6 relative">
                {/* Avatar */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <Link to={`/profile/${userId}`}>
                    <div className="w-16 h-16 rounded-none border-2 border-[#00a375] bg-background-dark p-1 shadow-[0_0_15px_rgba(0,163,117,0.4)]">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile?.name} className="w-full h-full object-cover grayscale contrast-125" />
                      ) : (
                        <div className="w-full h-full bg-background-dark flex items-center justify-center text-[#00a375] text-2xl font-bold">
                          {profile?.name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>

                {/* Stats box */}
                <div className="hidden md:flex absolute top-4 right-6 bg-background-dark/90 backdrop-blur-md rounded-none p-2 text-[#00a375] text-center gap-4 text-xs border border-[#00a375]/20 -mt-8 shadow-[0_0_10px_rgba(0,163,117,0.1)]">
                  <div>
                    <span className="block font-bold text-base font-mono-tech text-white">{friends?.length || 0}</span>
                    <span className="text-[#e66b00] text-[9px] uppercase tracking-widest">Amigos</span>
                  </div>
                  <div className="w-px bg-[#00a375]/20" />
                  <div>
                    <span className="block font-bold text-base font-mono-tech text-white">{totalCompletedAllTime}</span>
                    <span className="text-[#e66b00] text-[9px] uppercase tracking-widest">Logs</span>
                  </div>
                  <div className="w-px bg-[#00a375]/20" />
                  <div>
                    <span className="block font-bold text-base font-mono-tech text-white">{currentStreak}</span>
                    <span className="text-[#e66b00] text-[9px] uppercase tracking-widest">Streak</span>
                  </div>
                </div>

                {/* Spacer */}
                <div className="h-[34px] mb-2" />

                {/* Name */}
                <div className="text-center mb-4">
                  <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2 tracking-tight">
                    <span className="text-[#e66b00] font-mono-tech mr-2">&gt;</span>
                    {profile?.name || "User"}
                    <span className="text-xl animate-pulse text-[#e66b00]">_</span>
                  </h1>
                  <p className="text-[#00a375]/70 font-mono-tech text-[10px] mt-1 uppercase tracking-widest">
                    [ {profile?.username ? `@${profile.username}` : "USER"} ]
                  </p>
                </div>

                {/* Bell inside card */}
                <div className="flex items-center justify-center">
                  <Link to={`/profile/${userId}`}>
                    <button className="w-10 h-10 flex items-center justify-center rounded-none border border-slate-800 hover:border-[#00a375] hover:shadow-[0_0_10px_rgba(0,163,117,0.3)] transition-all text-[#00a375] bg-card-dark">
                      <Bell className="w-5 h-5" />
                    </button>
                  </Link>
                </div>

                {/* Social links */}
                <div className="flex items-center justify-center gap-3 mt-2">
                  {profile?.instagram_url && (
                    <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-none border border-slate-800 hover:border-[#00a375] hover:shadow-[0_0_10px_rgba(0,163,117,0.3)] transition-all text-[#00a375] bg-card-dark">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {profile?.twitter_url && (
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-none border border-slate-800 hover:border-[#00a375] hover:shadow-[0_0_10px_rgba(0,163,117,0.3)] transition-all text-[#00a375] bg-card-dark">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Party card — 2 cols */}
          <div className="lg:col-span-2">
            <PartyChallenge />
          </div>
        </div>

        {/* ===== ROW 2: Metrics + Weekly Streak ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch shrink-0">
          {/* 4 Metric cards — 3 cols */}
          <div className="lg:col-span-3 h-full">
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

          {/* Weekly Streak — 2 cols */}
          <div className="lg:col-span-2 h-full">
            <WeeklyStreak checkIns={checkIns} habitsCount={totalHabitsCount} />
          </div>
        </div>


        {/* ===== ROW 4: Active Tasks Grid (full width) ===== */}
        <div className="flex-1 min-h-0 h-full">
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

      </div>
    </Layout>
  );
};

export default Dashboard;
