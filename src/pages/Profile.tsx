import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useSocial } from "@/hooks/useSocial";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
    User,
    MapPin,
    Clock,
    Calendar,
    UserPlus,
    UserCheck,
    UserMinus,
    Loader2,
    ArrowLeft,
    Activity,
    History,
    Edit,
    Save,
    X
} from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const {
        getUserProfile,
        getUserActivities,
        getFriendshipStatus,
        addFriendById,
        unfriend,
        handleRequest,
        incomingRequests
    } = useSocial();

    const [profile, setProfile] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [checkIns, setCheckIns] = useState<any[]>([]);
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Edit states
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editAvatar, setEditAvatar] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const isOwner = currentUser?.id === id;

    const loadData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [p, acts, s] = await Promise.all([
                getUserProfile(id),
                getUserActivities(id),
                getFriendshipStatus(id)
            ]);
            setProfile(p);
            setEditName(p.name || "");
            setEditBio(p.bio || "");
            setEditAvatar(p.avatar_url || "");
            setActivities(acts.activities);
            setCheckIns(acts.checkIns);
            setStatus(s);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar perfil");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleSave = async () => {
        if (!editName.trim()) {
            toast.error("O nome não pode estar vazio");
            return;
        }
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    name: editName.trim(),
                    bio: editBio.trim(),
                    avatar_url: editAvatar.trim(),
                    updated_at: new Date().toISOString()
                })
                .eq("user_id", currentUser!.id);

            if (error) throw error;

            toast.success("Perfil atualizado!");
            setProfile({ ...profile, name: editName, bio: editBio, avatar_url: editAvatar });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao salvar perfil");
        } finally {
            setIsSaving(false);
        }
    };

    const isPending = incomingRequests.some(r => r.user_id === id);

    const formatDistance = (meters: number | null) => meters ? (meters / 1000).toFixed(2) + " km" : "0 km";
    const formatTime = (seconds: number | null) => {
        if (!seconds) return "0m";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        </Layout>
    );

    if (!profile) return (
        <Layout>
            <div className="text-center py-12">
                <p className="text-muted-foreground">Perfil não encontrado.</p>
                <Button variant="link" onClick={() => navigate(-1)}>Voltar</Button>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-4">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </Button>

                {/* Profile Header */}
                <div className="bg-card rounded-2xl border border-border p-8 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 to-streak/10" />
                    <div className="relative flex flex-col md:flex-row items-center gap-6 mt-8">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold border-4 border-card overflow-hidden">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                profile.name.charAt(0)
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <Input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        placeholder="Nome de exibição"
                                        className="text-2xl font-black bg-background"
                                    />
                                    <Input
                                        value={editAvatar}
                                        onChange={e => setEditAvatar(e.target.value)}
                                        placeholder="URL do Avatar"
                                        className="text-xs bg-background"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                                        <h1 className="text-3xl font-black text-foreground">{profile.name}</h1>
                                        {profile.username && (
                                            <span className="text-primary font-bold text-lg">@{profile.username}</span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground text-sm">Membro desde {new Date(profile.created_at).toLocaleDateString()}</p>
                                </>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {isOwner ? (
                                isEditing ? (
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                                            <Save className="w-4 h-4" /> Salvar
                                        </Button>
                                        <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
                                            Cancelar
                                        </Button>
                                    </div>
                                ) : (
                                    <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                                        <Edit className="w-4 h-4" /> Editar Perfil
                                    </Button>
                                )
                            ) : (
                                !status ? (
                                    <Button onClick={() => addFriendById.mutate(id!)} className="gap-2 shadow-lg shadow-primary/20">
                                        <UserPlus className="w-4 h-4" /> Enviar Solicitação
                                    </Button>
                                ) : status.status === "pending" ? (
                                    status.user_id === id ? (
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleRequest.mutate({ requestId: status.id, status: "accepted" })} className="gap-2">
                                                Aceitar Convite
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button disabled variant="secondary" className="gap-2">
                                            <History className="w-4 h-4" /> Solicitação Pendente
                                        </Button>
                                    )
                                ) : (
                                    <Button variant="outline" className="text-destructive hover:bg-destructive/10 gap-2" onClick={() => unfriend.mutate(id!)}>
                                        <UserMinus className="w-4 h-4" /> Desfazer Amizade
                                    </Button>
                                )
                            )}
                        </div>
                    </div>

                    <div className="mt-8 relative">
                        {isEditing ? (
                            <Textarea
                                value={editBio}
                                onChange={e => setEditBio(e.target.value)}
                                placeholder="Conte um pouco sobre você..."
                                className="bg-background min-h-[100px]"
                            />
                        ) : (
                            profile.bio ? (
                                <p className="text-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4 py-2 bg-secondary/30 rounded-r-lg">
                                    "{profile.bio}"
                                </p>
                            ) : isOwner ? (
                                <button onClick={() => setIsEditing(true)} className="text-sm text-muted-foreground hover:text-primary transition-colors italic">
                                    + Adicionar uma bio ao seu perfil
                                </button>
                            ) : null
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Habits History */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" /> Hábitos Recentes
                        </h3>
                        <div className="space-y-4">
                            {checkIns.length === 0 ? (
                                <Card className="p-6 text-center text-muted-foreground text-sm border-dashed">
                                    Nenhum check-in recente.
                                </Card>
                            ) : (
                                checkIns.map((ci) => (
                                    <Card key={ci.id} className="p-4 bg-card border-border">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{ci.habits?.icon}</span>
                                            <div>
                                                <p className="font-bold text-foreground">{ci.habits?.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">
                                                    {new Date(ci.completed_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Center Column: Strava Activities */}
                    <div className="md:col-span-2 space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-streak" /> Atividades Strava
                        </h3>
                        <div className="space-y-4">
                            {activities.length === 0 ? (
                                <Card className="p-12 text-center text-muted-foreground border-dashed">
                                    Nenhuma atividade postada.
                                </Card>
                            ) : (
                                activities.map((act) => (
                                    <Card key={act.id} className="p-5 border-border bg-card hover:border-primary/30 transition-all">
                                        <h4 className="text-lg font-extrabold text-foreground mb-3">{act.activity_name}</h4>
                                        <div className="grid grid-cols-3 gap-4 py-3 border-y border-border/50">
                                            <div className="text-center">
                                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Distância</p>
                                                <p className="text-sm font-bold text-foreground">
                                                    {formatDistance(act.distance)}
                                                </p>
                                            </div>
                                            <div className="text-center border-x border-border/50">
                                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Tempo</p>
                                                <p className="text-sm font-bold text-foreground">
                                                    {formatTime(act.moving_time)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Data</p>
                                                <p className="text-sm font-bold text-foreground">
                                                    {new Date(act.start_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
