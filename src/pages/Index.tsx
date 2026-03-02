import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { SignUp } from "@/components/SignUp";

const Index = () => {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
      <SignedOut>
        {showSignUp ? (
          <SignUp onNavigateToSignIn={() => setShowSignUp(false)} />
        ) : (
          <div className="w-full max-w-md bg-card rounded-xl shadow-sm flex justify-center">
            <div className="w-full p-8 space-y-6">
              <SignIn
                appearance={{
                  elements: {
                    footerActionLink: "hidden",
                    footer: "hidden",
                    badge: "hidden",
                  },
                }}
              />
              <div className="text-center pt-4 border-t border-border">
                <span className="text-muted-foreground text-sm">Não tem uma conta? </span>
                <button
                  onClick={() => setShowSignUp(true)}
                  className="text-primary hover:underline font-medium ml-1"
                >
                  Criar uma
                </button>
              </div>
            </div>
          </div>
        )}
      </SignedOut>
    </div>
  );
};

export default Index;
