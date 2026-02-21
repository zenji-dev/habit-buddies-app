import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useSocial } from "@/hooks/useSocial";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ConsistencyMap } from "@/components/ConsistencyMap";
import {
    User,
    Calendar,
    UserPlus,
    UserMinus,
    Loader2,
    ArrowLeft,
    History,
    Edit,
    Save,
    X,
    Instagram,
    Twitter,
    PartyPopper,
    Upload,
    Flame,
    Sparkles,
    MapPin,
    Users,
} from "lucide-react";
import { StartPartyDialog } from "@/components/StartPartyDialog";
import { toast } from "sonner";

const Profile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { userId: currentUserId } = useAuth();
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
    const [checkIns, setCheckIns] = useState<any[]>([]);
    const [habits, setHabits] = useState<any[]>([]);
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Edit states
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editAvatar, setEditAvatar] = useState("");
    const [editInstagram, setEditInstagram] = useState("");
    const [editTwitter, setEditTwitter] = useState("");
    const [editLocation, setEditLocation] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

    /* Contadores sociais: seguidores e seguindo */
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const isOwner = currentUserId === id;

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
            setEditInstagram(p.instagram_url || "");
            setEditTwitter(p.twitter_url || "");
            setEditLocation(p.location || "");
            setCheckIns(acts.checkIns);
            setHabits(acts.habits || []);
            setStatus(s);

            /* 
               Calcular seguidores e seguindo a partir da tabela friendships.
               - Seguidores: amizades aceitas onde o usuário é o friend_id (alguém seguiu ele)
               - Seguindo: amizades aceitas onde o usuário é o user_id (ele seguiu alguém)
            */
            const [followersRes, followingRes] = await Promise.all([
                supabase
                    .from("friendships")
                    .select("id", { count: "exact", head: true })
                    .eq("friend_id", id)
                    .eq("status", "accepted"),
                supabase
                    .from("friendships")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", id)
                    .eq("status", "accepted"),
            ]);
            setFollowersCount(followersRes.count || 0);
            setFollowingCount(followingRes.count || 0);
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
                    instagram_url: editInstagram.trim() || null,
                    twitter_url: editTwitter.trim() || null,
                    location: editLocation.trim() || null,
                    updated_at: new Date().toISOString()
                })
                .eq("user_id", currentUserId!);

            if (error) throw error;

            toast.success("Perfil atualizado!");
            setProfile({
                ...profile,
                name: editName,
                bio: editBio,
                avatar_url: editAvatar,
                instagram_url: editInstagram,
                twitter_url: editTwitter,
                location: editLocation
            });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao salvar perfil");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            setUploading(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${currentUserId!}/${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setEditAvatar(data.publicUrl);
            toast.success("Imagem carregada com sucesso!");
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao fazer upload da imagem: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    // Compute streak for a given habit
    const getStreak = (habitId: string): number => {
        const habitCheckins = Array.from(
            new Set(
                checkIns
                    .filter((c) => c.habit_id === habitId)
                    .map((c) => c.completed_at)
            )
        ).sort((a, b) => b.localeCompare(a));

        if (habitCheckins.length === 0) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const lastCheckinDate = new Date(habitCheckins[0] + "T00:00:00");
        lastCheckinDate.setHours(0, 0, 0, 0);

        if (lastCheckinDate.getTime() < yesterday.getTime()) return 0;

        let streak = 1;
        let currentDate = lastCheckinDate;

        for (let i = 1; i < habitCheckins.length; i++) {
            const nextCheckinDate = new Date(habitCheckins[i] + "T00:00:00");
            nextCheckinDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(currentDate);
            expectedDate.setDate(expectedDate.getDate() - 1);

            if (nextCheckinDate.getTime() === expectedDate.getTime()) {
                streak++;
                currentDate = nextCheckinDate;
            } else {
                break;
            }
        }

        return streak;
    };

    // Compute last check-in label
    const getLastCheckInLabel = (habitId: string): string | null => {
        const habitCheckins = checkIns
            .filter((c) => c.habit_id === habitId)
            .sort((a, b) => b.completed_at.localeCompare(a.completed_at));

        if (habitCheckins.length === 0) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().slice(0, 10);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        const lastDate = habitCheckins[0].completed_at.slice(0, 10);

        if (lastDate === todayStr) return "Hoje";
        if (lastDate === yesterdayStr) return "Ontem";
        return new Date(lastDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
    };

    const isPending = incomingRequests.some(r => r.user_id === id);

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
            <div className="max-w-4xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-2">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </Button>

                {/* ===== PROFILE HEADER ===== */}
                <div className="bg-card rounded-2xl border border-border p-6 md:p-8 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-r from-primary/10 via-primary/5 to-streak/10" />
                    <div className="relative flex flex-col md:flex-row items-center gap-6 pt-4">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center text-5xl font-bold border-4 border-card overflow-hidden relative shadow-lg shadow-primary/10">
                                {uploading ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                ) : (
                                    <>
                                        <span className="absolute z-0 text-primary uppercase">
                                            {(isEditing ? editName : profile.name)?.charAt(0)}
                                        </span>
                                        {(isEditing ? editAvatar : profile.avatar_url) && (
                                            <img
                                                src={isEditing ? editAvatar : profile.avatar_url}
                                                alt={isEditing ? editName : profile.name}
                                                className="w-full h-full object-cover relative z-10"
                                                onError={(e) => e.currentTarget.style.display = 'none'}
                                            />
                                        )}
                                    </>
                                )}

                                {isEditing && !uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <Upload className="w-8 h-8 text-white" />
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute inset-0 cursor-pointer rounded-full z-50"
                                    aria-label="Upload Avatar"
                                >
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left min-w-0">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <Input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        placeholder="Nome de exibição"
                                        className="text-2xl font-black bg-background"
                                    />
                                    <Textarea
                                        value={editBio}
                                        onChange={e => setEditBio(e.target.value)}
                                        placeholder="Conte um pouco sobre você..."
                                        className="bg-background min-h-[80px] text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Upload className="w-3 h-3" /> Clique na foto para alterar
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="relative">
                                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                value={editInstagram}
                                                onChange={e => setEditInstagram(e.target.value)}
                                                placeholder="Link Instagram"
                                                className="pl-9 text-xs bg-background"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                value={editTwitter}
                                                onChange={e => setEditTwitter(e.target.value)}
                                                placeholder="Link X (Twitter)"
                                                className="pl-9 text-xs bg-background"
                                            />
                                        </div>
                                    </div>
                                    {/* Campo de localização editável */}
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            value={editLocation}
                                            onChange={e => setEditLocation(e.target.value)}
                                            placeholder="Sua localização (ex: São Paulo, SP)"
                                            className="pl-9 text-xs bg-background"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                                        <h1 className="text-3xl font-black text-foreground">{profile.name}</h1>
                                        {profile.username && (
                                            <span className="text-primary font-bold text-lg">@{profile.username}</span>
                                        )}
                                    </div>
                                    {profile.bio && (
                                        <p className="text-muted-foreground text-sm mt-2 leading-relaxed max-w-lg">
                                            {profile.bio}
                                        </p>
                                    )}
                                    {/* 
                                        Barra de estatísticas sociais: seguidores, seguindo e localização.
                                        Inspirado no layout do GitHub para mostrar presença social.
                                    */}
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                                        <p className="text-muted-foreground text-xs flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="font-bold text-foreground">{followersCount}</span> seguidores
                                        </p>
                                        <span className="text-border">·</span>
                                        <p className="text-muted-foreground text-xs flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                                            <span className="font-bold text-foreground">{followingCount}</span> seguindo
                                        </p>
                                        {profile.location && (
                                            <>
                                                <span className="text-border">·</span>
                                                <p className="text-muted-foreground text-xs flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {profile.location}
                                                </p>
                                            </>
                                        )}
                                        <span className="text-border">·</span>
                                        <p className="text-muted-foreground text-xs flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Membro desde {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                                        </p>
                                    </div>

                                    {/* Social links */}
                                    {(profile.instagram_url || profile.twitter_url) && (
                                        <div className="flex gap-2 mt-3 justify-center md:justify-start">
                                            {profile.instagram_url && (
                                                <Button variant="secondary" size="sm" className="gap-2 rounded-full text-xs font-bold shadow-sm hover:scale-105 transition-transform" asChild>
                                                    <a href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://${profile.instagram_url}`} target="_blank" rel="noopener noreferrer">
                                                        <Instagram className="w-3.5 h-3.5 text-pink-500" />
                                                        Instagram
                                                    </a>
                                                </Button>
                                            )}
                                            {profile.twitter_url && (
                                                <Button variant="secondary" size="sm" className="gap-2 rounded-full text-xs font-bold shadow-sm hover:scale-105 transition-transform" asChild>
                                                    <a href={profile.twitter_url.startsWith('http') ? profile.twitter_url : `https://${profile.twitter_url}`} target="_blank" rel="noopener noreferrer">
                                                        <Twitter className="w-3.5 h-3.5 text-sky-500" />
                                                        Twitter / X
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 shrink-0">
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
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="outline"
                                            className="text-destructive hover:bg-destructive/10 gap-2 border-destructive/20"
                                            onClick={() => unfriend.mutate(id!)}
                                        >
                                            <UserMinus className="w-4 h-4" /> Desfazer Amizade
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="gap-2 font-bold shadow-sm"
                                            onClick={() => setIsInviteDialogOpen(true)}
                                        >
                                            <PartyPopper className="w-4 h-4" /> Convidar para Party
                                        </Button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Bio prompt for owner without bio */}
                    {!isEditing && isOwner && !profile.bio && (
                        <div className="relative mt-4">
                            <button onClick={() => setIsEditing(true)} className="text-sm text-muted-foreground hover:text-primary transition-colors italic">
                                + Adicionar uma bio ao seu perfil
                            </button>
                        </div>
                    )}
                </div>

                {/* ===== CONSISTENCY MAP ===== */}
                <ConsistencyMap checkIns={checkIns} />

                {/* ===== PUBLIC HABITS ===== */}
                <div>
                    <h3 className="text-base font-bold flex items-center gap-2 text-foreground mb-4">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Hábitos
                    </h3>

                    {habits.length === 0 ? (
                        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
                            Nenhum hábito cadastrado.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {habits.map((habit) => {
                                const streak = getStreak(habit.id);
                                const lastLabel = getLastCheckInLabel(habit.id);
                                const habitCheckInCount = checkIns.filter(c => c.habit_id === habit.id).length;

                                return (
                                    <div
                                        key={habit.id}
                                        className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="text-2xl">{habit.icon}</span>
                                            {streak > 0 && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                                    <Flame className="w-3 h-3" />
                                                    {streak} {streak === 1 ? "dia" : "dias"}
                                                </span>
                                            )}
                                            {streak === 0 && lastLabel && (
                                                <span className="text-[11px] text-muted-foreground font-medium">
                                                    Último: {lastLabel}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                                            {habit.name}
                                        </h4>
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            {habitCheckInCount} check-in{habitCheckInCount !== 1 ? "s" : ""} este ano
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <StartPartyDialog
                    open={isInviteDialogOpen}
                    onOpenChange={setIsInviteDialogOpen}
                    initialSelectedFriendId={id}
                />
            </div>
        </Layout>
    );
};

export default Profile;
