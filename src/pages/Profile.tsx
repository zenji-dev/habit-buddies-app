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
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

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
            setCheckIns(acts.checkIns);
            setHabits(acts.habits || []);
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
                    instagram_url: editInstagram.trim() || null,
                    twitter_url: editTwitter.trim() || null,
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
                twitter_url: editTwitter
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
                {!isOwner && (
                    <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-2">
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </Button>
                )}

                {/* ===== PROFILE HEADER ===== */}
                <div className="glass-panel rounded-none relative pb-4 shadow-neon-box grid-bg pt-[100px] mt-8">
                    {/* Cover */}
                    <div className="absolute top-0 left-0 w-full h-[120px] bg-[#050a14] overflow-hidden">
                        <div className="absolute inset-0 bg-[#00a375] mix-blend-overlay opacity-5" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/90 to-background-dark" />
                        <div className="absolute top-0 left-0 w-full h-px bg-[#00a375]/40 shadow-[0_0_10px_#00a375]" />
                        <div className="absolute bottom-0 left-0 w-full h-px bg-[#00a375]/10" />
                    </div>

                    {/* Stats box */}
                    <div className="hidden md:flex absolute top-4 right-6 bg-background-dark/90 backdrop-blur-md rounded-none p-2 text-[#00a375] text-center gap-4 text-xs border border-[#00a375]/20 shadow-[0_0_10px_rgba(0,163,117,0.1)] z-20">
                        <div>
                            <span className="block font-bold text-base font-mono-tech text-white">{checkIns.length}</span>
                            <span className="text-[#e66b00] text-[9px] uppercase tracking-widest">Logs</span>
                        </div>
                        <div className="w-px bg-[#00a375]/20" />
                        <div>
                            <span className="block font-bold text-base font-mono-tech text-white">{habits.reduce((max, h) => Math.max(max, getStreak(h.id)), 0)}</span>
                            <span className="text-[#e66b00] text-[9px] uppercase tracking-widest">Max Streak</span>
                        </div>
                    </div>

                    <div className="relative px-6 flex flex-col items-center">
                        {/* Avatar */}
                        <div className="absolute -top-[84px] left-1/2 transform -translate-x-1/2">
                            <div className="w-24 h-24 rounded-none border-2 border-[#00a375] bg-background-dark p-1 shadow-[0_0_15px_rgba(0,163,117,0.4)] group relative">
                                {uploading ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#00a375]" />
                                    </div>
                                ) : (
                                    <>
                                        {(isEditing ? editAvatar : profile.avatar_url) ? (
                                            <img
                                                src={isEditing ? editAvatar : profile.avatar_url}
                                                alt={isEditing ? editName : profile.name}
                                                className="w-full h-full object-cover grayscale contrast-125"
                                                onError={(e) => e.currentTarget.style.display = 'none'}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#00a375] text-3xl font-bold font-mono-tech">
                                                {(isEditing ? editName : profile.name)?.charAt(0) || "?"}
                                            </div>
                                        )}
                                    </>
                                )}

                                {isEditing && !uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <Upload className="w-6 h-6 text-white" />
                                    </div>
                                )}

                                {isEditing && (
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute inset-0 cursor-pointer z-50"
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
                        </div>

                        {/* Spacer for Avatar */}
                        <div className="h-[20px]" />

                        {/* Info */}
                        <div className="w-full text-center mt-4">
                            {isEditing ? (
                                <div className="space-y-3 max-w-sm mx-auto">
                                    <Input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        placeholder="Nome de exibição"
                                        className="text-center font-mono-tech bg-background-dark border-[#00a375]/50 text-white rounded-none"
                                    />
                                    <Textarea
                                        value={editBio}
                                        onChange={e => setEditBio(e.target.value)}
                                        placeholder="System bio..."
                                        className="bg-background-dark border-[#00a375]/50 text-white rounded-none min-h-[80px] text-sm font-mono-tech text-center"
                                    />
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="relative">
                                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00a375]" />
                                            <Input
                                                value={editInstagram}
                                                onChange={e => setEditInstagram(e.target.value)}
                                                placeholder="Insta URI"
                                                className="pl-9 text-xs font-mono-tech bg-background-dark border-[#00a375]/50 text-white rounded-none"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00a375]" />
                                            <Input
                                                value={editTwitter}
                                                onChange={e => setEditTwitter(e.target.value)}
                                                placeholder="X URI"
                                                className="pl-9 text-xs font-mono-tech bg-background-dark border-[#00a375]/50 text-white rounded-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-2">
                                        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2 tracking-tight">
                                            <span className="text-[#e66b00] font-mono-tech mr-1">&gt;</span>
                                            {profile.name}
                                            <span className="text-xl animate-pulse text-[#e66b00]">_</span>
                                        </h1>
                                        {profile.username && (
                                            <p className="text-[#00a375]/70 font-mono-tech text-[10px] mt-1 uppercase tracking-widest">
                                                [ @{profile.username} ]
                                            </p>
                                        )}
                                    </div>
                                    {profile.bio && (
                                        <p className="text-gray-400 text-sm mt-3 leading-relaxed max-w-lg mx-auto font-mono-tech">
                                            {profile.bio}
                                        </p>
                                    )}

                                    <div className="flex justify-center mt-3">
                                        <p className="text-[#00a375]/50 font-mono-tech text-[10px] flex items-center gap-1 uppercase tracking-widest">
                                            <Calendar className="w-3 h-3" /> NODE_CREATED: {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                                        </p>
                                    </div>

                                    {/* Social links */}
                                    {(profile.instagram_url || profile.twitter_url) && (
                                        <div className="flex gap-4 mt-4 justify-center">
                                            {profile.instagram_url && (
                                                <a href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://${profile.instagram_url}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-none border border-slate-800 hover:border-[#00a375] hover:shadow-[0_0_10px_rgba(0,163,117,0.3)] transition-all text-[#00a375] bg-card-dark">
                                                    <Instagram className="w-4 h-4" />
                                                </a>
                                            )}
                                            {profile.twitter_url && (
                                                <a href={profile.twitter_url.startsWith('http') ? profile.twitter_url : `https://${profile.twitter_url}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-none border border-slate-800 hover:border-[#00a375] hover:shadow-[0_0_10px_rgba(0,163,117,0.3)] transition-all text-[#00a375] bg-card-dark">
                                                    <Twitter className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-6 flex justify-center gap-3">
                            {isOwner ? (
                                isEditing ? (
                                    <div className="flex gap-2">
                                        <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-[#00a375]/10 border border-[#00a375]/50 text-[#00a375] text-xs font-mono-tech hover:bg-[#00a375]/20 hover:shadow-[0_0_15px_rgba(0,163,117,0.3)] transition-all uppercase tracking-wider disabled:opacity-50 flex items-center gap-2">
                                            <Save className="w-4 h-4" /> COMMIT
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-slate-700 text-gray-500 text-xs font-mono-tech hover:border-slate-500 hover:text-gray-300 transition-all uppercase tracking-wider">
                                            ABORT
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="px-6 py-2 border border-[#00a375]/50 text-[#00a375] text-xs font-mono-tech hover:bg-[#00a375]/10 hover:shadow-[0_0_10px_rgba(0,163,117,0.2)] transition-all uppercase tracking-wider flex items-center gap-2">
                                        <Edit className="w-4 h-4" /> EDIT_SYS
                                    </button>
                                )
                            ) : (
                                !status ? (
                                    <button onClick={() => addFriendById.mutate(id!)} className="px-6 py-2 border border-[#00a375]/50 text-[#00a375] text-xs font-mono-tech hover:bg-[#00a375]/10 hover:shadow-[0_0_10px_rgba(0,163,117,0.2)] transition-all uppercase tracking-wider flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" /> ADD_NODE
                                    </button>
                                ) : status.status === "pending" ? (
                                    status.user_id === id ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRequest.mutate({ requestId: status.id, status: "accepted" })} className="px-6 py-2 bg-[#00a375]/10 border border-[#00a375]/50 text-[#00a375] text-xs font-mono-tech hover:bg-[#00a375]/20 hover:shadow-[0_0_15px_rgba(0,163,117,0.3)] transition-all uppercase tracking-wider flex items-center gap-2">
                                                ACCEPT_SYNC
                                            </button>
                                        </div>
                                    ) : (
                                        <button disabled className="px-6 py-2 border border-[#e66b00]/50 text-[#e66b00] text-xs font-mono-tech bg-background-dark opacity-70 uppercase tracking-wider flex items-center gap-2">
                                            <History className="w-4 h-4" /> SYNC_PENDING
                                        </button>
                                    )
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            className="px-6 py-2 border border-[#e66b00]/50 text-[#e66b00] text-xs font-mono-tech hover:bg-[#e66b00]/10 hover:shadow-[0_0_10px_rgba(230,107,0,0.2)] transition-all uppercase tracking-wider flex items-center gap-2"
                                            onClick={() => setIsInviteDialogOpen(true)}
                                        >
                                            <PartyPopper className="w-4 h-4" /> INVITE_PARTY
                                        </button>
                                        <button
                                            className="px-6 py-2 border border-red-900/50 text-red-500 text-xs font-mono-tech hover:bg-red-900/20 transition-all uppercase tracking-wider flex items-center gap-2"
                                            onClick={() => unfriend.mutate(id!)}
                                        >
                                            <UserMinus className="w-4 h-4" /> DISCONNECT
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Bio prompt for owner without bio */}
                    {!isEditing && isOwner && !profile.bio && (
                        <div className="relative mt-4 flex justify-center">
                            <button onClick={() => setIsEditing(true)} className="text-[10px] text-[#00a375]/50 font-mono-tech uppercase tracking-widest hover:text-[#00a375] transition-colors">
                                + ADD_SYSTEM_BIO
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
