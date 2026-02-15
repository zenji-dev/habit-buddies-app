import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useSocial } from "@/hooks/useSocial";
import { useHabits } from "@/hooks/useHabits";
import { ProgressCircle } from "@/components/ProgressCircle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, UserPlus, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Social = () => {
  const { feed, friends, giveKudos, addFriend, isLoading } = useSocial();
  const { habits, isCheckedToday } = useHabits();
  const [searchFriend, setSearchFriend] = useState("");

  const todayChecked = habits.filter((h) => isCheckedToday(h.id)).length;
  const percentage = habits.length > 0 ? (todayChecked / habits.length) * 100 : 0;

  const handleAddFriend = () => {
    if (searchFriend.trim()) {
      addFriend.mutate(searchFriend.trim());
      setSearchFriend("");
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Feed Social</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feed */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Atividade dos Amigos</h2>

            {feed.length === 0 && !isLoading && (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <p className="text-muted-foreground">Nenhuma atividade ainda.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Adicione amigos para ver a atividade deles aqui!
                </p>
              </div>
            )}

            {feed.map((item) => (
              <div key={item.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                    {item.profile?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.profile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 bg-secondary rounded-lg p-3">
                  <span className="text-xl">{item.habits?.icon}</span>
                  <p className="text-foreground">
                    {item.profile?.name} completou a{" "}
                    <strong className="text-primary">{item.habits?.name}</strong> hoje! 🔥
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {item.kudosCount > 0 && (
                      <span>
                        <Heart className="w-3.5 h-3.5 inline text-primary fill-primary" />{" "}
                        {item.kudosCount} pessoa{item.kudosCount > 1 ? "s" : ""} deram Kudos
                      </span>
                    )}
                  </div>
                  {!item.hasGivenKudos && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary gap-1"
                      onClick={() =>
                        giveKudos.mutate({
                          checkInId: item.id,
                          toUserId: item.user_id,
                        })
                      }
                    >
                      <Heart className="w-4 h-4" />
                      Kudos
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Add friend */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Buscar amigos
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do amigo..."
                  value={searchFriend}
                  onChange={(e) => setSearchFriend(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
                />
                <Button size="icon" onClick={handleAddFriend} disabled={addFriend.isPending}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* My progress today */}
            <div className="gradient-success rounded-xl p-5 text-primary-foreground">
              <h3 className="font-semibold mb-1">Seu progresso hoje</h3>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{Math.round(percentage)}%</span>
                <div className="flex-1 bg-primary-foreground/20 rounded-full h-2">
                  <div
                    className="bg-primary-foreground rounded-full h-2 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              {habits.length > 0 && percentage < 100 && (
                <p className="text-sm mt-2 opacity-90">
                  Falta{habits.length - todayChecked > 1 ? "m" : ""}{" "}
                  {habits.length - todayChecked} hábito{habits.length - todayChecked > 1 ? "s" : ""} para fechar o dia!
                </p>
              )}
            </div>

            {/* Friends list */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3">Amigos ({friends.length})</h3>
              {friends.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum amigo ainda.</p>
              ) : (
                <div className="space-y-2">
                  {friends.map((f) => (
                    <div key={f.user_id} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {f.name.charAt(0)}
                      </div>
                      <span className="text-sm text-foreground">{f.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Social;
