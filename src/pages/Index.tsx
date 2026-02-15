import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Auth from "./Auth";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;
  return <Auth />;
};

export default Index;
