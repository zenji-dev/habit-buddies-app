import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Onboarding } from "@/components/Onboarding";
import { useProfile } from "@/hooks/useProfile";
import { setClerkToken } from "@/integrations/supabase/client";
import { useSession } from "@clerk/clerk-react";
import { useEffect } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Social from "./pages/Social";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import StravaCallback from "./pages/StravaCallback";
import NotFound from "./pages/NotFound";
import CalendarPage from "./pages/Calendar";

// Configuração do Cliente de Query (React Query) para gerenciar estado assíncrono
const queryClient = new QueryClient();

// Componente para Sincronizar o Token do Supabase com a Sessão do Clerk
// Isso permite que o Supabase use o token do Clerk para autenticação RLS
const SupabaseTokenSync = () => {
  const { session } = useSession();

  useEffect(() => {
    const syncToken = async () => {
      try {
        const token = await session?.getToken({ template: "supabase" });
        setClerkToken(token || null);
      } catch (error) {
        console.error("Error syncing Supabase token:", error);
      }
    };

    syncToken();
  }, [session]);

  return null;
};

// Componente para proteger rotas que exigem autenticação
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: profile, isLoading: profileLoading, refetch } = useProfile();

  // Exibe uma tela de carregamento enquanto verifica a autenticação ou o perfil
  if (!isLoaded || (isSignedIn && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // Se o usuário estiver logado mas não completou o onboarding (ou não tem perfil), redireciona
  if ((!profileLoading && !profile) || (profile && !profile.onboarded)) {
    return <Onboarding onComplete={() => refetch()} />;
  }

  return <>{children}</>;
};

// Componente principal que define todos os provedores (Tema, Query, Auth) e as Rotas
const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="habit-buddies-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SupabaseTokenSync />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings/strava/callback" element={<ProtectedRoute><StravaCallback /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
