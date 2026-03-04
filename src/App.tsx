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
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Social from "./pages/Social";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import CalendarPage from "./pages/Calendar";
import { VerifyEmail } from "./pages/VerifyEmail";
import { Starfield } from "@/components/Starfield";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,        // dados ficam "frescos" por 30 segundos
      gcTime: 1000 * 60 * 5,       // cache mantido por 5 minutos
      refetchOnWindowFocus: false, // não refetch ao trocar de aba
      refetchOnReconnect: false,   // não refetch ao reconectar rede
      retry: 1,                    // só tenta 1x em caso de erro
    },
  },
});

// Loading screen component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background-dark">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-[#00a375] border-t-transparent animate-spin" />
      <p className="text-[#00a37566] text-[10px] font-bold uppercase tracking-widest animate-pulse">&gt; LOADING_SYSTEM...</p>
    </div>
  </div>
);

// Inner component that only mounts AFTER token is synced
const ProtectedRouteInner = ({ children }: { children: React.ReactNode }) => {
  const { data: profile, isLoading: profileLoading, refetch } = useProfile();

  if (profileLoading) return <LoadingScreen />;

  if (!profile || !profile.onboarded) {
    return <Onboarding onComplete={() => refetch()} />;
  }

  return <>{children}</>;
};

// Componente para proteger rotas que exigem autenticação
// Syncs Clerk token to Supabase BEFORE rendering children or running any queries
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { session } = useSession();
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    if (!session) {
      setTokenReady(false);
      return;
    }

    let cancelled = false;
    const syncToken = async () => {
      try {
        const token = await session.getToken({ template: "supabase" });
        if (!cancelled) {
          setClerkToken(token || null);
          setTokenReady(true);
        }
      } catch (error) {
        console.error("Error syncing Supabase token:", error);
        if (!cancelled) setTokenReady(true); // proceed anyway to avoid infinite loading
      }
    };

    syncToken();
    return () => { cancelled = true; };
  }, [session]);

  if (!isLoaded || (isSignedIn && !tokenReady)) {
    return <LoadingScreen />;
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // Token is synced, safe to render children (which will call useProfile, useHabits, etc.)
  return <ProtectedRouteInner>{children}</ProtectedRouteInner>;
};

// Componente principal que define todos os provedores (Tema, Query, Auth) e as Rotas
const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="habit-buddies-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Starfield />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
