import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/**
 * Página de Registro (Sign Up)
 * Esta página utiliza o componente SignUp do Clerk para gerenciar a criação de novas contas.
 * O Clerk garante que não existam e-mails duplicados e lida com a segurança da senha.
 */
const SignUpPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Botão para voltar à página inicial/login */}
            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10 group"
            >
                <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest">Voltar</span>
            </Link>

            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl relative overflow-hidden">
                    {/* Efeito de brilho no fundo */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[100px]" />

                    {/* Componente SignUp do Clerk customizado via CSS no index.css ou classes nativas */}
                    <SignUp
                        appearance={{
                            elements: {
                                card: "bg-transparent shadow-none border-none p-6",
                                headerTitle: "text-foreground font-black text-2xl tracking-tight text-center",
                                headerSubtitle: "text-muted-foreground text-center",
                                socialButtonsBlockButton: "bg-secondary/50 border-white/5 hover:bg-secondary/80 text-foreground transition-all h-12",
                                dividerRow: "text-muted-foreground/30 uppercase text-[10px] font-bold tracking-widest",
                                formFieldLabel: "text-muted-foreground uppercase text-[10px] font-black tracking-widest ml-1",
                                formFieldInput: "bg-secondary/50 border-white/5 focus:border-primary/50 text-foreground h-12 rounded-xl transition-all",
                                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest h-12 rounded-xl shadow-lg shadow-primary/20 transition-all",
                                footerActionLink: "text-primary hover:text-primary/80 font-bold transition-colors",
                                identityPreviewText: "text-foreground",
                                identityPreviewEditButtonIcon: "text-primary",
                                footer: "bg-transparent",
                                rootBox: "w-full"
                            }
                        }}
                    />
                </div>

                <p className="text-center mt-8 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Start your journey with us &bull; Habit-Buddies
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;
