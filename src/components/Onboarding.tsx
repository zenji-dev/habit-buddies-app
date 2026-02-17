import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Camera, User } from "lucide-react";

export const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            const { data, error } = await supabase
                .from("profiles")
                .select("name, username, avatar_url")
                .eq("user_id", user.id)
                .single();

            if (data) {
                setName(data.name || "");
                setUsername(data.username || "");
                setAvatarUrl(data.avatar_url || "");
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !username.trim()) {
            toast.error("Nome e usuário são obrigatórios");
            return;
        }

        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            toast.error("O usuário deve conter apenas letras, números e underscores.");
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    name: name.trim(),
                    username: username.toLowerCase().trim(),
                    avatar_url: avatarUrl.trim() || null,
                    onboarded: true,
                    updated_at: new Date().toISOString()
                })
                .eq("user_id", user!.id);

            if (error) {
                if (error.code === '23505') {
                    toast.error("Este @usuário já está em uso.");
                } else {
                    throw error;
                }
            } else {
                toast.success("Perfil configurado!");
                onComplete();
            }
        } catch (error: any) {
            toast.error("Erro ao salvar perfil: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card w-full max-w-md rounded-2xl border border-border p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 italic text-primary-foreground font-black text-2xl">
                        H
                    </div>
                    <h2 className="text-2xl font-black text-foreground">Bem-vindo ao HabitTracker!</h2>
                    <p className="text-muted-foreground mt-2">Vamos configurar seu perfil para começar.</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-muted-foreground" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full text-primary-foreground shadow-lg">
                                <Camera className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-wider">Foto de Perfil (Opcional)</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Como quer ser chamado?</label>
                            <Input
                                placeholder="Ex: João Silva"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="bg-secondary/50 border-transparent focus:border-primary/30 h-12"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Seu @usuário único</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
                                <Input
                                    placeholder="joao_do_habito"
                                    value={username}
                                    onChange={e => setUsername(e.target.value.toLowerCase())}
                                    className="pl-8 bg-secondary/50 border-transparent focus:border-primary/30 h-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Link da foto (Avatar)</label>
                            <Input
                                placeholder="https://exemplo.com/foto.jpg"
                                value={avatarUrl}
                                onChange={e => setAvatarUrl(e.target.value)}
                                className="bg-secondary/50 border-transparent focus:border-primary/30 h-12"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20" disabled={saving}>
                        {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Concluir Configuração
                    </Button>
                </form>
            </div>
        </div>
    );
};
