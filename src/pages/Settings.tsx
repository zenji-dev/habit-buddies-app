import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings as SettingsIcon, User as UserIcon, Link2, LogOut, Monitor } from "lucide-react";

const Settings = () => {
  const { userId, signOut } = useAuth();
  const { user } = useUser();
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
            <UserIcon className="w-4 h-4" /> Perfil
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
              {(profile?.avatar_url || (user as any)?.profileImageUrl || (user as any)?.imageUrl) ? (
                <img
                  src={profile?.avatar_url || (user as any).profileImageUrl || (user as any).imageUrl}
                  alt={profile?.name || "Avatar"}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                (profile?.name || user?.primaryEmailAddress?.emailAddress || "?").charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile?.name || "Sem nome"}</p>
              <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
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

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Aparência
          </h2>
          <p className="text-sm text-muted-foreground">
            O aplicativo segue automaticamente as preferências de tema do seu sistema operacional. Para alterar o tema, ajuste as configurações de aparência do seu dispositivo.
          </p>
        </div>

        
        

        {/* Sign out */}
        <Button variant="outline" onClick={() => signOut()} className="gap-2">
          <LogOut className="w-4 h-4" /> Sair da conta
        </Button>
      </div>
    </Layout>
  );
};

export default Settings;
