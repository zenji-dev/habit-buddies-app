import { useAuth } from "@/contexts/AuthContext";
import { useHabits } from "@/hooks/useHabits";
import { useProfile } from "@/hooks/useProfile";
import { useSocial } from "@/hooks/useSocial";
import { Layout } from "@/components/Layout";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { ProgressCircle } from "@/components/ProgressCircle";
import { Flame, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { habits, isLoading, checkIn, getStreak, isCheckedToday, checkIns } = useHabits();
  const { friends } = useSocial();

  const todayChecked = habits.filter((h) => isCheckedToday(h.id)).length;
  const totalHabits = habits.length;
  const percentage = totalHabits > 0 ? (todayChecked / totalHabits) * 100 : 0;

  // Weekly data
  const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];
  const today = new Date();
  const weekData = weekDays.map((day, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    const dateStr = date.toISOString().split("T")[0];
    const count = checkIns.filter((c) => c.completed_at === dateStr).length;
    return { day, count };
  });

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Meu Painel</h1>
        </div>

        {/* Summary + Friends */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-card rounded-xl border border-border p-6 flex items-center gap-6">
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                Resumo de Hoje
              </p>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {percentage >= 100 ? "Parabéns! 🎉" : "Quase lá!"} {profile?.name || user?.email?.split("@")[0]} 🚀
              </h2>
              <p className="text-sm text-muted-foreground">
                Você completou <strong>{todayChecked} de {totalHabits}</strong> hábitos planejados para hoje.
                {percentage < 100 && " Mantenha o foco!"}
              </p>
            </div>
            <ProgressCircle percentage={percentage} />
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-foreground">Amigos Ativos</h3>
            </div>
            {friends.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Adicione amigos na aba Social!
              </p>
            ) : (
              <div className="space-y-2">
                {friends.slice(0, 3).map((f) => (
                  <div key={f.user_id} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                      {f.name.charAt(0)}
                    </div>
                    <span className="text-sm text-foreground truncate">{f.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Habits list */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Meus Hábitos <span className="text-muted-foreground font-normal text-sm">{totalHabits}</span>
          </h2>
          <AddHabitDialog />
        </div>

        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              name={habit.name}
              icon={habit.icon}
              goalMinutes={habit.goal_minutes || 0}
              streak={getStreak(habit.id)}
              isChecked={isCheckedToday(habit.id)}
              onCheckIn={() => checkIn.mutate(habit.id)}
              isPending={checkIn.isPending}
            />
          ))}
          {habits.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Nenhum hábito ainda</p>
              <p className="text-sm">Clique em "Novo Hábito" para começar!</p>
            </div>
          )}
        </div>

        {/* Weekly chart + Achievement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold text-foreground mb-4">Meta Semanal</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={weekData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="gradient-success rounded-xl p-6 text-primary-foreground">
            <Flame className="w-8 h-8 mb-2 opacity-80" />
            <h3 className="text-xl font-bold">Próxima Conquista</h3>
            <p className="text-sm opacity-90 mt-1">
              Complete 7 dias seguidos de treino para ganhar a insígnia 'Atleta Dedicado'.
            </p>
            <p className="text-sm font-semibold mt-3 opacity-80">
              {todayChecked}/{totalHabits} DIAS COMPLETADOS
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
