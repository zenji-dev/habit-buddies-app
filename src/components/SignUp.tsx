import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

const HABIT_ICONS = ["💪", "📖", "📚", "🏃", "🧘", "💻", "🎵", "🥗", "💤", "🌊"];
const HABIT_NAMES = ["Exercício", "Leitura", "Estudo", "Corrida", "Meditação", "Programação", "Música", "Nutrição", "Dormir", "Natação"];

interface SelectedHabit {
  name: string;
  icon: string;
}

export const SignUp = ({ onNavigateToSignIn }: { onNavigateToSignIn: () => void }) => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }

    if (password.length < 8) {
      toast.error("Senha deve ter no mínimo 8 caracteres");
      return;
    }


    setLoading(true);

    try {
      // Verificar se o email já existe no Clerk
      if (!isLoaded) {
        toast.error("Clerk não carregou");
        setLoading(false);
        return;
      }

      // Criar conta no Clerk
      await signUp?.create({
        emailAddress: email,
        password: password,
      });

      // Aguardar verificação de email (ou usar OTP)
      await signUp?.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Redirecionar para página de verificação
      navigate("/verify-email", { 
        state: { 
          email, 
          signUpId: signUp?.id 
        } 
      });

      toast.success("Verifique seu email para continuar!");
    } catch (error: any) {
      console.error("Erro no signup:", error);
      
      if (error.errors?.[0]?.code === "form_identifier_exists") {
        toast.error("Este email já está cadastrado");
      } else {
        toast.error(error.errors?.[0]?.message || "Erro ao criar conta");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card rounded-xl shadow-sm p-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">
          H
        </div>
        <h2 className="text-2xl font-bold text-foreground">Criar Conta</h2>
        <p className="text-muted-foreground mt-2 text-sm">Comece sua jornada de hábitos</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Senha */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Senha</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirmar Senha */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Confirmar Senha</label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>



        {/* Botão Enviar */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-10"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Criando conta..." : "Criar Conta"}
        </Button>
      </form>

      {/* Link para Sign In */}
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Já tem uma conta? </span>
        <button
          onClick={onNavigateToSignIn}
          className="text-primary hover:underline font-medium"
        >
          Faça login
        </button>
      </div>
    </div>
  );
};
