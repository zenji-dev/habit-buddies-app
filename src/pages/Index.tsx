import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
      <SignedOut>
        <div className="w-full max-w-md bg-card rounded-xl shadow-sm flex justify-center">
          <SignIn />
        </div>
      </SignedOut>
    </div>
  );
};

export default Index;
