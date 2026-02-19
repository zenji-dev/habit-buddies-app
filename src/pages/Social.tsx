import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useSocial } from "@/hooks/useSocial";
import { useHabits } from "@/hooks/useHabits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, UserPlus, Search, Check, X, UserMinus, Loader2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Social = () => {
  const navigate = useNavigate();
  const {
    feed,
    friends,
    incomingRequests,
    giveKudos,
    handleRequest,
    searchUsers,
    unfriend,
    isLoading
  } = useSocial();
  const { habits, isCheckedToday } = useHabits();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const todayChecked = habits.filter((h) => isCheckedToday(h.id)).length;
  const percentage = habits.length > 0 ? (todayChecked / habits.length) * 100 : 0;

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchQuery);
          setSuggestions(results);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Feed Social</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feed */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Atividade dos Amigos</h2>

            {!isLoading && feed.length === 0 && (
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
                  <Link to={`/profile/${item.user_id}`} className="hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary overflow-hidden">
                      {item.profile?.avatar_url ? (
                        <img src={item.profile.avatar_url} alt={item.profile.name} className="w-full h-full object-cover" />
                      ) : (
                        item.profile?.name?.charAt(0) || <User className="w-4 h-4" />
                      )}
                    </div>
                  </Link>
                  <div>
                    <Link to={`/profile/${item.user_id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                      {item.profile?.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 bg-secondary rounded-lg p-3">
                  <span className="text-xl">{item.habits?.icon}</span>
                  <p className="text-foreground">
                    Completou a <strong className="text-primary">{item.habits?.name}</strong> hoje! 🔥
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
            {/* Search users */}
            <div className="bg-card rounded-xl border border-border p-4 relative">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" /> Buscar pessoas
              </h3>
              <div className="relative">
                <Input
                  placeholder="Pesquisar por nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                )}
              </div>

              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-border">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.user_id}
                      onClick={() => {
                        navigate(`/profile/${suggestion.user_id}`);
                        setSearchQuery("");
                        setSuggestions([]);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary overflow-hidden">
                        {suggestion.avatar_url ? (
                          <img src={suggestion.avatar_url} alt={suggestion.name} className="w-full h-full object-cover" />
                        ) : (
                          suggestion.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {suggestion.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @{suggestion.username}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Friend Requests */}
            {incomingRequests.length > 0 && (
              <div className="bg-card rounded-xl border-2 border-primary/20 p-4 animate-in fade-in slide-in-from-right-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary" /> Solicitações ({incomingRequests.length})
                </h3>
                <div className="space-y-3">
                  {incomingRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between gap-2 p-2 bg-secondary rounded-lg">
                      <Link
                        to={`/profile/${req.user_id}`}
                        className="flex items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0 overflow-hidden">
                          {req.profile?.avatar_url ? (
                            <img src={req.profile.avatar_url} alt={req.profile.name || ""} className="w-full h-full object-cover" />
                          ) : (
                            req.profile?.name?.charAt(0)
                          )}
                        </div>
                        <span className="text-sm font-medium text-foreground truncate">{req.profile?.name}</span>
                      </Link>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-primary hover:bg-primary/10"
                          onClick={() => handleRequest.mutate({ requestId: req.id, status: "accepted" })}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRequest.mutate({ requestId: req.id, status: "rejected" })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 
                Card de progresso diário 
                Usa 'gradient-success' que agora segue a cor primária definida no tema (index.css)
                Em modo escuro será laranja, e em modo claro será verde.
            */}
            <div className="gradient-success rounded-xl p-5 text-primary-foreground shadow-lg shadow-primary/20">
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
              <h3 className="font-semibold text-foreground mb-3 flex items-center justify-between">
                <span>Amigos ({friends.length})</span>
              </h3>
              {friends.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  Nenhum amigo ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {friends.map((f) => (
                    <div key={f.user_id} className="flex items-center justify-between group p-1 rounded-lg hover:bg-secondary transition-colors">
                      <Link to={`/profile/${f.user_id}`} className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary overflow-hidden">
                          {f.avatar_url ? (
                            <img src={f.avatar_url} alt={f.name} className="w-full h-full object-cover" />
                          ) : (
                            f.name.charAt(0)
                          )}
                        </div>
                        <span className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">{f.name}</span>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm(`Remover ${f.name} da lista de amigos?`)) {
                            unfriend.mutate(f.user_id);
                          }
                        }}
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </Button>
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
