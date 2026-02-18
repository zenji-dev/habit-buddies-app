import { useAuth } from "@/contexts/AuthContext";
import { useHabits } from "@/hooks/useHabits";
import { useProfile } from "@/hooks/useProfile";
import { useSocial } from "@/hooks/useSocial";
import { Layout } from "@/components/Layout";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { WeeklyStreak } from "@/components/WeeklyStreak";
import { TodayHabitsList } from "@/components/TodayHabitsList";
import { MonthlyChallenge } from "@/components/MonthlyChallenge";
import { DashboardActivityLog } from "@/components/DashboardActivityLog";
import { Search, Bell, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { habits, isLoading, checkIn, getStreak, isCheckedToday, checkIns } = useHabits();
  const { friends, feed } = useSocial();

  const todayChecked = habits.filter((h) => isCheckedToday(h.id)).length;
  const totalHabitsCount = habits.length;
  const percentage = totalHabitsCount > 0 ? (todayChecked / totalHabitsCount) * 100 : 0;

  // Calculate stats for metrics
  const totalCompletedAllTime = checkIns.length;
  const currentStreak = habits.reduce((max, h) => Math.max(max, getStreak(h.id)), 0);

  // Calculate average completion rate for the last 7 days
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground">Visão Geral</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {format(new Date(), "eeee, MMM d", { locale: ptBR })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar hábitos..."
                className="pl-10 bg-card border-border w-64 h-10 rounded-xl"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </Button>
            <AddHabitDialog>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-4 h-10">
                <Plus className="w-4 h-4" /> Novo Hábito
              </Button>
            </AddHabitDialog>
          </div>
        </div>

        {/* Metrics Section */}
        <DashboardMetrics
          totalHabits={totalCompletedAllTime}
          streak={currentStreak}
          completionRate={averageCompletionRate}
          todayProgress={todayChecked}
          todayTotal={totalHabitsCount}
          bestStreak={currentStreak} // Mocking best as current for now
        />

        {/* Weekly Streak */}
        <WeeklyStreak
          checkIns={checkIns}
          habitsCount={totalHabitsCount}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            <TodayHabitsList
              habits={habits}
              checkIns={checkIns}
              getStreak={getStreak}
              isCheckedToday={isCheckedToday}
              onCheckIn={(id) => checkIn.mutate(id)}
              isPending={checkIn.isPending}
            />
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-8">
            <MonthlyChallenge currentDay={24} totalDays={30} />
            <DashboardActivityLog activity={feed} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
