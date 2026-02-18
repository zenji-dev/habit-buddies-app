import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { Check, X, Users, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ChallengeInvites = () => {
    const { invites, respondToInvite } = usePartyChallenge();

    if (invites.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                Convites de Party ({invites.length})
            </h3>
            {invites.map((invite) => (
                <Card key={invite.id} className="p-4 border-2 border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-right-4 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-12 h-12 bg-primary/10 rounded-full blur-xl" />

                    <div className="flex items-center justify-between gap-4 relative">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center overflow-hidden border border-primary/30 shadow-sm relative">
                                {invite.invited_by_profile?.avatar_url ? (
                                    <img src={invite.invited_by_profile.avatar_url} alt={invite.invited_by_profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Users className="w-5 h-5 text-primary" />
                                )}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center border border-card">
                                    <Sparkles className="w-2 h-2 text-primary-foreground" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">
                                    {invite.invited_by_profile?.name || "Alguém"} te chamou!
                                </p>
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-tight">
                                        {invite.challenge_title}
                                    </p>
                                    {invite.target_habit && (
                                        <Badge variant="outline" className="text-[9px] font-black h-4 bg-card border-primary/20 text-primary w-fit px-1 uppercase italic">
                                            🎯 Foco: {invite.target_habit}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="w-8 h-8 text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm transition-all active:scale-95"
                                onClick={() => respondToInvite.mutate({ inviteId: invite.id, accept: true })}
                                disabled={respondToInvite.isPending}
                            >
                                {respondToInvite.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="w-8 h-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive bg-card border border-border"
                                onClick={() => respondToInvite.mutate({ inviteId: invite.id, accept: false })}
                                disabled={respondToInvite.isPending}
                            >
                                {respondToInvite.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
