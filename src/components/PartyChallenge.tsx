import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { useHabits } from "@/hooks/useHabits";
import { Check, Flame, Users, Loader2, UserPlus, Search, Trophy, Calendar } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const PartyChallenge = () => {
    const { challenge, isLoading, checkIn, friendsToInvite, inviteFriend, createChallenge } = usePartyChallenge();
    const { habits } = useHabits();
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Create Challenge State
    const [newTitle, setNewTitle] = useState("");
    const [selectedHabitId, setSelectedHabitId] = useState("");
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
    const [duration, setDuration] = useState("30");

    if (isLoading) {
        return (
            <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
            </Card>
        );
    }

    const handleStartParty = () => {
        const habit = habits.find(h => h.id === selectedHabitId);
        if (!habit) return;

        createChallenge.mutate({
            title: newTitle || `Party: ${habit.name}`,
            target_habit: habit.name,
            duration_days: parseInt(duration),
            friendIds: selectedFriendIds
        }, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                resetCreateForm();
            }
        });
    };

    const resetCreateForm = () => {
        setNewTitle("");
        setSelectedHabitId("");
        setSelectedFriendIds([]);
        setDuration("30");
    };

    const toggleFriendSelection = (id: string) => {
        setSelectedFriendIds(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    if (!challenge) {
        return (
            <Card className="p-6 bg-card border-border overflow-hidden relative group">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded">
                        Party
                    </span>
                </div>
                <h3 className="text-lg font-black text-foreground mb-2">Minha Party</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    Você ainda não participa de nenhum desafio em grupo. Que tal convidar amigos para baterem uma meta juntos?
                </p>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full gap-2 font-bold shadow-lg shadow-primary/20">
                            <UserPlus className="w-4 h-4" />
                            Começar uma Party
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card border-border">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-primary" />
                                Criar Novo Desafio
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Nome do Grupo</label>
                                <Input
                                    placeholder="Ex: Treino dos Parça"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="bg-secondary/50 border-border"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">O que faremos juntos?</label>
                                <Select onValueChange={setSelectedHabitId} value={selectedHabitId}>
                                    <SelectTrigger className="bg-secondary/50 border-border">
                                        <SelectValue placeholder="Selecione um dos seus hábitos" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        {habits.map((habit) => (
                                            <SelectItem key={habit.id} value={habit.id}>
                                                <span className="flex items-center gap-2">
                                                    <span className="text-lg">{habit.icon}</span>
                                                    {habit.name}
                                                </span>
                                            </SelectItem>
                                        ))}
                                        {habits.length === 0 && (
                                            <p className="p-2 text-xs text-muted-foreground">Você ainda não criou hábitos.</p>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Duração (dias)</label>
                                    <Input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="bg-secondary/50 border-border"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Convidar Amigos</label>
                                <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1 custom-scrollbar border border-border rounded-lg p-2 bg-secondary/20">
                                    {friendsToInvite.length === 0 ? (
                                        <p className="text-center py-4 text-xs text-muted-foreground">Ainda não tem amigos aceitos.</p>
                                    ) : (
                                        friendsToInvite.map((friend) => (
                                            <div
                                                key={friend.user_id}
                                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedFriendIds.includes(friend.user_id) ? "bg-primary/20 border-primary/20" : "hover:bg-secondary/50"
                                                    }`}
                                                onClick={() => toggleFriendSelection(friend.user_id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                                                        {friend.avatar_url ? (
                                                            <img src={friend.avatar_url} alt={friend.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-primary font-bold text-[10px]">{friend.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-medium">{friend.name}</span>
                                                </div>
                                                {selectedFriendIds.includes(friend.user_id) && <Check className="w-3 h-3 text-primary" />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button
                                onClick={handleStartParty}
                                disabled={!selectedHabitId || createChallenge.isPending}
                                className="w-full gap-2 font-bold"
                            >
                                {createChallenge.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                                Confirmar e Convidar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Users className="absolute top-1/2 -right-4 w-20 h-20 text-foreground/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </Card>
        );
    }

    const percentage = Math.round(
        (challenge.currentDay / challenge.duration_days) * 100
    );

    const filteredFriends = friendsToInvite.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="p-6 bg-card border-border overflow-hidden relative group">
            {/* Background glow */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />

            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded w-fit">
                        Minha Party
                    </span>
                    {challenge.target_habit && (
                        <Badge variant="secondary" className="text-[9px] font-medium h-5 bg-secondary/50 border-none px-1.5 flex gap-1 items-center">
                            <Check className="w-2 h-2" /> Meta: {challenge.target_habit}
                        </Badge>
                    )}
                </div>

                {/* Invite Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold uppercase gap-1 hover:bg-primary/10 hover:text-primary transition-colors">
                            <UserPlus className="w-3 h-3" />
                            Convidar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card border-border">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Convidar Amigos
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar amigos..."
                                    className="pl-9 bg-secondary/50 border-border"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {filteredFriends.length === 0 ? (
                                    <p className="text-center py-8 text-sm text-muted-foreground">
                                        {searchQuery ? "Nenhum amigo encontrado." : "Todos os seus amigos já estão na party! 🚀"}
                                    </p>
                                ) : (
                                    filteredFriends.map((friend) => (
                                        <div key={friend.user_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                                                    {friend.avatar_url ? (
                                                        <img src={friend.avatar_url} alt={friend.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-primary font-bold text-xs">{friend.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-foreground">{friend.name}</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 text-xs font-bold text-primary hover:bg-primary/10"
                                                onClick={() => inviteFriend.mutate(friend.user_id)}
                                                disabled={inviteFriend.isPending}
                                            >
                                                {inviteFriend.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Convidar"}
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Challenge Title */}
            <h3 className="text-xl font-black text-foreground mb-1">
                {challenge.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-5">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Dia {challenge.currentDay} de {challenge.duration_days}</span>
            </div>

            {/* Member Avatars */}
            <div className="mb-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    Participantes
                </p>
                <div className="flex flex-wrap gap-3">
                    {challenge.members.map((member) => (
                        <Tooltip key={member.user_id}>
                            <TooltipTrigger asChild>
                                <div className="relative cursor-pointer">
                                    <div
                                        className={`w-12 h-12 rounded-full p-[2.5px] transition-all duration-300 ${member.checkedInToday
                                            ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30"
                                            : "bg-muted-foreground/30"
                                            }`}
                                    >
                                        <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                                            {member.avatar_url ? (
                                                <img
                                                    src={member.avatar_url}
                                                    alt={member.name}
                                                    className={`w-full h-full object-cover transition-all duration-300 ${member.checkedInToday ? "" : "opacity-50 grayscale"
                                                        }`}
                                                />
                                            ) : (
                                                <span
                                                    className={`text-sm font-bold transition-all duration-300 ${member.checkedInToday
                                                        ? "text-emerald-500"
                                                        : "text-muted-foreground/50"
                                                        }`}
                                                >
                                                    {member.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {member.checkedInToday && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-card">
                                            <Check className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                <p className="font-semibold">{member.name}</p>
                                <p className="text-muted-foreground">
                                    {member.checkedInToday ? "✅ Check-in feito!" : "⏳ Ainda não fez check-in"}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-5">
                <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-bold text-foreground">Progresso</p>
                    <p className="text-xs font-black text-primary">{percentage}%</p>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000 rounded-full"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Check-in Button */}
            {challenge.userCheckedInToday ? (
                <Button
                    disabled
                    className="w-full gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/10 font-bold rounded-xl h-11"
                    variant="outline"
                >
                    <Check className="w-4 h-4" />
                    CheckIn
                </Button>
            ) : (
                <Button
                    onClick={() => checkIn.mutate(challenge.id)}
                    disabled={checkIn.isPending}
                    className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-11 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                    {checkIn.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Flame className="w-4 h-4" />
                    )}
                    Marcar como Feito
                </Button>
            )}

            <Users className="absolute top-1/2 -right-4 w-20 h-20 text-foreground/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </Card>
    );
};
