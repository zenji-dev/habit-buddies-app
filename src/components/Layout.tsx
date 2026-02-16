import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen h-[100dvh] bg-background overflow-hidden">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
};
