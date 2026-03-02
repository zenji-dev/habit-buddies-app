import { useState, useEffect } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LocationState {
  email: string;
  signUpId?: string;
}

export const VerifyEmail = () => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as LocationState | null;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const { email = "" } = state || {};

  // Timer para reenvio de código
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      toast.error("Digite o código de verificação");
      return;
    }

    if (!isLoaded || !signUp) {
      toast.error("Sistema ainda carregando");
      return;
    }

    setLoading(true);

    try {
      // Verificar o código de email
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        // Email verificado! Agora criar perfil e hábitos no Supabase
        const userId = signUpAttempt.createdUserId;

        // Criar perfil no Supabase
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: userId,
            name: email.split("@")[0], // Usar parte do email como nome inicial
            username: email.split("@")[0],
            onboarded: false,
          });

        if (profileError) {
          console.error("Erro ao criar perfil:", profileError);
          throw new Error("Erro ao criar perfil no banco de dados");
        }



        // Fazer login automático no Clerk
        await setActive({ session: signUpAttempt.createdSessionId });

        toast.success("Conta criada com sucesso! Bem-vindo!");
        navigate("/onboarding");
      } else {
        throw new Error("Verificação incompleta. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro na verificação:", error);
      toast.error(
        error.errors?.[0]?.message || 
        error.message || 
        "Código inválido. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;

    setResending(true);
    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      toast.success("Código reenviado! Verifique seu email.");
      setTimeLeft(60);
    } catch (error: any) {
      toast.error("Erro ao reenviar código");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
            H
          </div>
          <h2 className="text-2xl font-bold text-foreground">Verifique seu email</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Enviamos um código para <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerifyEmail} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Código de verificação
            </label>
            <Input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-10">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Verificando..." : "Verificar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResendCode}
            disabled={resending || timeLeft > 0}
            className="text-sm text-primary hover:underline font-medium disabled:text-muted-foreground disabled:cursor-not-allowed"
          >
            {timeLeft > 0 
              ? `Reenviar em ${timeLeft}s` 
              : resending 
              ? "Reenviando..." 
              : "Reenviar código"}
          </button>
        </div>
      </div>
    </div>
  );
};
