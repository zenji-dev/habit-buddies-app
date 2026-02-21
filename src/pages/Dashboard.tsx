import { useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import { useProfile } from "@/hooks/useProfile";
import { useSocial } from "@/hooks/useSocial";
import { Layout } from "@/components/Layout";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { WeeklyStreak } from "@/components/WeeklyStreak";
import { TodayHabitsList } from "@/components/TodayHabitsList";

import { PartyChallenge } from "@/components/PartyChallenge";
import { ChallengeInvites } from "@/components/ChallengeInvites";
import { DashboardActivityLog } from "@/components/DashboardActivityLog";
import { MyHabitsDialog } from "@/components/MyHabitsDialog";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { Bell, Plus, Users, Settings2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { data: profile } = useProfile();
  const { habits, isLoading, checkIn, uncheck, getStreak, isCheckedToday, checkIns } = useHabits();
  const { friends, feed } = useSocial();
  const { invites } = usePartyChallenge();

  const invitesCount = invites?.length || 0;

  const todayChecked = habits.filter((h) => isCheckedToday(h.id)).length;
  const totalHabitsCount = habits.length;

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

  // Calculate best streak (all-time)
  const getBestStreak = () => {
    if (!checkIns.length) return 0;

    // Group all check-ins by habit
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

        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        currentMax = Math.max(currentMax, tempStreak);
      }
      maxStreak = Math.max(maxStreak, currentMax);
    });
    return maxStreak;
  };

  const bestStreak = getBestStreak();

  // Calculate completion rate trend (Current week vs Last week)
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

    return {
      value: `${Math.abs(Math.round(diff))}%`,
      isUp: diff >= 0
    };
  };

  const completionTrend = getTrend();

  // Removido a lógica de filtros (searchTerm) para centralizar a interface
  // Agora usamos a lista de hábitos diretamente.

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
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        {/* Header Centralizado - Removido o campo de busca que criava um vazio no meio */}
        <div className="flex flex-col items-center justify-center text-center gap-6 mb-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-foreground tracking-tight">Visão Geral</h1>
            <div className="inline-flex bg-card border border-border px-4 py-1.5 rounded-full text-xs font-bold text-muted-foreground items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary/80 animate-pulse"></span>
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 bg-card/50 p-2 rounded-2xl border border-border/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-card text-muted-foreground hover:text-foreground relative w-12 h-12 border border-transparent hover:border-border transition-all">
                    <Bell className="w-6 h-6" />
                    {invitesCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-primary rounded-full border-2 border-background animate-pulse" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 bg-card border-border shadow-2xl rounded-2xl overflow-hidden" align="end">
                  <div className="p-4 border-b border-border bg-secondary/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground">Notificações</h3>
                      {invitesCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] h-5 px-1.5 font-bold">
                          {invitesCount} novas
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-2 bg-card">
                    <ChallengeInvites />
                  </div>
                </PopoverContent>
              </Popover>

              <MyHabitsDialog>
                <div>
                  <Button className="hidden sm:flex gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl px-5 h-11 shadow-sm hover:shadow-md hover:scale-105 transition-all border border-border/50">
                    <Settings2 className="w-5 h-5" /> Meus Hábitos
                  </Button>
                  <Button variant="ghost" size="icon" className="sm:hidden rounded-xl hover:bg-card text-muted-foreground hover:text-foreground w-10 h-10 border border-transparent hover:border-border transition-all">
                    <Settings2 className="w-5 h-5" />
                  </Button>
                </div>
              </MyHabitsDialog>
            </div>

            <AddHabitDialog>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-5 h-11 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all">
                <Plus className="w-5 h-5" /> Novo Hábito
              </Button>
            </AddHabitDialog>
          </div>
        </div>

        {/* 
            Seção de Métricas resumidas no topo. 
            Isso fornece uma visão rápida do progresso sem ocupar espaço excessivo.
        */}
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

        {/* 
            Grid de Conteúdo Principal. 
            Dividimos em 2/3 para o progresso/hábitos e 1/3 para social/atividades.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda (2/3): Focada no progresso individual e hábitos */}
          <div className="lg:col-span-2 space-y-8">
            {/* 
                Weekly Streak movido para dentro da coluna para alinhar verticalmente 
                com a lista de hábitos, criando um visual mais coeso e organizado.
            */}
            <WeeklyStreak
              checkIns={checkIns}
              habitsCount={totalHabitsCount}
            />

            <TodayHabitsList
              habits={habits}
              checkIns={checkIns}
              getStreak={getStreak}
              isCheckedToday={isCheckedToday}
              onCheckIn={(id) => checkIn.mutate(id)}
              onUncheck={(id) => uncheck.mutate(id)}
              isPending={checkIn.isPending}
              isUnchecking={uncheck.isPending}
            />
          </div>

          {/* Coluna Direita (1/3): Focada em Party e Log de Atividades */}
          <div className="space-y-8">
            <PartyChallenge />

            <DashboardActivityLog activity={feed} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
