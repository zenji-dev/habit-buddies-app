import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings as SettingsIcon, User, Link2, LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: profile, refetch } = useProfile();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkingStrava, setCheckingStrava] = useState(true);
  const [stravaConnected, setStravaConnected] = useState(false);

  useEffect(() => {
    const checkStrava = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("strava_tokens")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) setStravaConnected(true);
      setCheckingStrava(false);
    };
    checkStrava();
  }, [user]);

  const handleStravaConnect = () => {
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    if (!clientId) {
      toast.error("Configuração do Strava ausente (.env)");
      return;
    }

    const redirectUri = window.location.origin + "/settings/strava/callback";
    const scope = "read,activity:read_all";
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&approval_prompt=force`;

    window.location.href = authUrl;
  };

  const handleUpdateName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim() })
      .eq("user_id", user!.id);
    if (error) toast.error("Erro ao atualizar nome");
    else {
      toast.success("Nome atualizado!");
      refetch();
    }
    setSaving(false);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="w-6 h-6" /> Configurações
        </h1>

        {/* Profile */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4" /> Perfil
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {(profile?.name || user?.email || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile?.name || "Sem nome"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Novo nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={handleUpdateName} disabled={saving}>
              Salvar
            </Button>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Moon className="w-4 h-4" /> Aparência
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === "light" ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
                }`}
            >
              <Sun className={`w-8 h-8 mb-2 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${theme === "light" ? "text-primary" : "text-foreground"}`}>Claro</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
                }`}
            >
              <Moon className={`w-8 h-8 mb-2 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${theme === "dark" ? "text-primary" : "text-foreground"}`}>Escuro</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${theme === "system" ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
                }`}
            >
              <Monitor className={`w-8 h-8 mb-2 ${theme === "system" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${theme === "system" ? "text-primary" : "text-foreground"}`}>Sistema</span>
            </button>
          </div>
        </div>

        {/* Strava Integration */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Integrações
          </h2>
          <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-streak/20 flex items-center justify-center">
                <span className="text-lg font-bold text-streak">S</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Strava</p>
                <p className="text-xs text-muted-foreground">
                  {checkingStrava ? "Verificando conexão..." :
                    stravaConnected ? "Status: Conectado ✅" : "Sincronize treinos automaticamente"}
                </p>
              </div>
            </div>
            <Button
              variant={stravaConnected ? "secondary" : "default"}
              disabled={checkingStrava || stravaConnected}
              onClick={handleStravaConnect}
            >
              {stravaConnected ? "Conectado" : "Conectar ao Strava"}
            </Button>
          </div>
          {!stravaConnected && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground space-y-2 border border-border/50">
              <p className="font-medium text-foreground">Como funciona:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Ao conectar, seus treinos do Strava serão sincronizados.</li>
                <li>Atividades elegíveis marcarão presença nos seus hábitos automaticamente.</li>
                <li>Você pode desconectar a qualquer momento.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Sign out */}
        <Button variant="outline" onClick={signOut} className="gap-2">
          <LogOut className="w-4 h-4" /> Sair da conta
        </Button>
      </div>
    </Layout>
  );
};

export default Settings;
