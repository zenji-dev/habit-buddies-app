import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Clerk Publishable Key")
}

const ClerkWithRoutes = () => {
    const navigate = useNavigate();

    return (
        <ClerkProvider
            publishableKey={PUBLISHABLE_KEY}
            routerPush={(to) => navigate(to)}
            routerReplace={(to) => navigate(to, { replace: true })}
            signInUrl="/"
            signUpUrl="/"
            afterSignOutUrl="/"
        >
            <App />
        </ClerkProvider>
    );
};

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <ClerkWithRoutes />
        </BrowserRouter>
    </StrictMode>
);
