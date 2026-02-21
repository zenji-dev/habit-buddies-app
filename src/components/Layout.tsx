import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-background-dark text-gray-300 min-h-screen flex flex-row overflow-x-hidden selection:bg-[#00a375] selection:text-white">
      {/* Scanline overlay */}
      <div className="scanline" />

      {/* ── Neon edge glows (fixed, non-interactive) ── */}
      {/* Top edge — teal */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] pointer-events-none z-50"
        style={{ background: "linear-gradient(90deg, transparent 0%, #00a375 30%, #00a375 70%, transparent 100%)", opacity: 0.7 }}
      />
      {/* Top glow bloom */}
      <div
        className="fixed top-0 left-0 right-0 h-32 pointer-events-none z-40"
        style={{ background: "linear-gradient(to bottom, rgba(0,163,117,0.10) 0%, transparent 100%)" }}
      />

      {/* Top-right — subtle orange warmth */}
      <div
        className="fixed top-0 right-0 w-96 h-48 pointer-events-none z-40"
        style={{ background: "radial-gradient(ellipse at top right, rgba(230,107,0,0.07) 0%, transparent 70%)" }}
      />

      {/* Left edge — teal line */}
      <div
        className="fixed top-0 left-0 w-[2px] h-full pointer-events-none z-50"
        style={{ background: "linear-gradient(to bottom, transparent 0%, #00a375 20%, #00a375 80%, transparent 100%)", opacity: 0.35 }}
      />
      {/* Left glow bloom */}
      <div
        className="fixed top-0 left-0 w-24 h-full pointer-events-none z-40"
        style={{ background: "linear-gradient(to right, rgba(0,163,117,0.06) 0%, transparent 100%)" }}
      />

      {/* Right edge — very faint teal */}
      <div
        className="fixed top-0 right-0 w-[1px] h-full pointer-events-none z-50"
        style={{ background: "linear-gradient(to bottom, transparent 0%, #00a375 25%, #00a375 75%, transparent 100%)", opacity: 0.20 }}
      />

      <AppSidebar />

      <main className="flex-1 ml-0 md:ml-20 lg:ml-24 px-[60px] pt-[24px] pb-[60px] min-h-screen relative z-10 pb-24 md:pb-[60px]">
        {children}
      </main>

      <MobileNav />
    </div>
  );
};
