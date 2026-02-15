import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings as SettingsIcon, User, Link2, LogOut } from "lucide-react";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { data: profile, refetch } = useProfile();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

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
                <p className="text-xs text-muted-foreground">Sincronize treinos automaticamente</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                toast.info(
                  "Configure as chaves de API do Strava nas configurações do projeto para habilitar esta integração."
                )
              }
            >
              Conectar ao Strava
            </Button>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Como configurar o Strava:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Acesse <strong>developers.strava.com</strong> e crie um app</li>
              <li>Em "Authorization Callback Domain", use o domínio do seu app</li>
              <li>Copie o <strong>Client ID</strong> e <strong>Client Secret</strong></li>
              <li>Configure a <strong>Redirect URI</strong> para: <code className="text-xs bg-secondary px-1 py-0.5 rounded">{window.location.origin}/settings/strava/callback</code></li>
              <li>Adicione as chaves como secrets no backend</li>
            </ol>
          </div>
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
