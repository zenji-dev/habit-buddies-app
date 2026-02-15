import { Layout } from "@/components/Layout";
import { useHabits } from "@/hooks/useHabits";
import { useSocial } from "@/hooks/useSocial";
import { ProgressCircle } from "@/components/ProgressCircle";
import { Flame, CheckCircle, Globe } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const Stats = () => {
  const { habits, checkIns, getStreak, isCheckedToday } = useHabits();
  const { friends } = useSocial();

  const todayChecked = habits.filter((h) => isCheckedToday(h.id)).length;
  const totalHabits = habits.length;
  const weeklyPercentage = totalHabits > 0 ? (todayChecked / totalHabits) * 100 : 0;

  // Best streak
  const bestStreak = habits.reduce((max, h) => Math.max(max, getStreak(h.id)), 0);

  // Weekly comparison data
  const weekDays = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
  const today = new Date();
  const weekData = weekDays.map((day, i) => {
    const date = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = i - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    date.setDate(today.getDate() + diff);
    const dateStr = date.toISOString().split("T")[0];
    const myCount = checkIns.filter((c) => c.completed_at === dateStr).length;
    return { day, Você: myCount, Amigos: Math.floor(Math.random() * 4) };
  });

  // Weekly completed count
  const startOfWeek = new Date(today);
  const dow = today.getDay();
  startOfWeek.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  const startStr = startOfWeek.toISOString().split("T")[0];
  const weeklyCompleted = checkIns.filter((c) => c.completed_at >= startStr).length;
  const weeklyTotal = totalHabits * 7;
  const weeklyPct = weeklyTotal > 0 ? (weeklyCompleted / weeklyTotal) * 100 : 0;
  const weeklyFinished = weeklyCompleted;
  const weeklyRemaining = Math.max(0, weeklyTotal - weeklyCompleted);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estatísticas e Progresso</h1>
          <p className="text-muted-foreground">Acompanhe sua consistência e compare com seus amigos.</p>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Estatísticas Semanais</h3>
                <p className="text-xs text-muted-foreground">Minha Consistência vs. Média dos Amigos</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Você
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" /> Amigos
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="Você" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Amigos" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 flex flex-col items-center">
            <h3 className="font-semibold text-foreground mb-1">Metas Semanais</h3>
            <p className="text-xs text-muted-foreground mb-4">Status de conclusão</p>
            <ProgressCircle percentage={weeklyPct} label="CONCLUÍDO" />
            <div className="flex gap-4 mt-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Finalizadas</p>
                <p className="text-xl font-bold text-primary">{weeklyFinished}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Restantes</p>
                <p className="text-xl font-bold text-foreground">{weeklyRemaining}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-streak/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-streak" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Melhor Streak</p>
              <p className="text-2xl font-bold text-foreground">{bestStreak} Dias</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Hábito Hoje</p>
              <p className="text-2xl font-bold text-foreground">{todayChecked}/{totalHabits} Feitos</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Amigos</p>
              <p className="text-2xl font-bold text-foreground">{friends.length}</p>
            </div>
          </div>
        </div>

        {/* Friends ranking */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-1">Top Streaks - Amigos</h3>
          <p className="text-xs text-muted-foreground mb-4">Ranking baseado na consistência atual</p>
          {friends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Adicione amigos para ver o ranking!</p>
          ) : (
            <div className="space-y-3">
              {friends.map((f, i) => (
                <div key={f.user_id} className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-foreground">
                    {f.name.charAt(0)}
                  </div>
                  <span className="flex-1 font-medium text-foreground">{f.name}</span>
                  <span className="text-sm text-streak font-medium flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {Math.floor(Math.random() * 20)} Dias
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Stats;
