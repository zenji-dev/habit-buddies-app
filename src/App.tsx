import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Onboarding } from "@/components/Onboarding";
import { useProfile } from "@/hooks/useProfile";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Social from "./pages/Social";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import StravaCallback from "./pages/StravaCallback";
import NotFound from "./pages/NotFound";
import CalendarPage from "./pages/Calendar";

const queryClient = new QueryClient();

// Componente para proteger rotas que exigem autenticação
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading, refetch } = useProfile();

  // Exibe uma tela de carregamento enquanto verifica a autenticação ou o perfil
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  // Se o usuário estiver logado mas não completou o onboarding, redireciona
  if (profile && !profile.onboarded) {
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
        <BrowserRouter>
          <AuthProvider>
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
