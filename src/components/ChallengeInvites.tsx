import { Button } from "@/components/ui/button";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { Check, X, Users, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ChallengeInvites = () => {
    const { invites, respondToInvite } = usePartyChallenge();

    if (invites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <Users className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground">Sem notificações</p>
                <p className="text-xs text-muted-foreground leading-tight">
                    Você não tem nenhum convite de party pendente no momento.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
            {invites.map((invite) => (
                <div
                    key={invite.id}
                    className="p-3 border border-border rounded-xl bg-card hover:bg-secondary/30 transition-colors relative overflow-hidden group"
                >
                    <div className="flex items-start justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center overflow-hidden border border-primary/20 shadow-sm relative shrink-0">
                                {invite.invited_by_profile?.avatar_url ? (
                                    <img
                                        src={invite.invited_by_profile.avatar_url}
                                        alt={invite.invited_by_profile.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Users className="w-5 h-5 text-primary" />
                                )}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center border border-card shadow-sm">
                                    <Sparkles className="w-2 h-2 text-primary-foreground" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-foreground truncate">
                                    {invite.invited_by_profile?.name || "Alguém"} te chamou!
                                </p>
                                <div className="flex flex-col gap-1 mt-0.5">
                                    <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-tight">
                                        {invite.challenge_title}
                                    </p>
                                    {invite.target_habit && (
                                        <Badge variant="outline" className="text-[9px] font-black h-4 bg-primary/5 border-primary/20 text-primary w-fit px-1 uppercase italic">
                                            🎯 Foco: {invite.target_habit}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0 pt-0.5">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="w-7 h-7 rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm flex-shrink-0 transition-transform active:scale-90"
                                onClick={() => respondToInvite.mutate({ inviteId: invite.id, accept: true })}
                                disabled={respondToInvite.isPending}
                            >
                                {respondToInvite.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="w-7 h-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive bg-secondary/50 border border-border flex-shrink-0 transition-transform active:scale-90"
                                onClick={() => respondToInvite.mutate({ inviteId: invite.id, accept: false })}
                                disabled={respondToInvite.isPending}
                            >
                                {respondToInvite.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
