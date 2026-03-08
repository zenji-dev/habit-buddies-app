import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-background-dark text-slate-100 min-h-screen flex flex-row overflow-x-hidden selection:bg-[#25f4f4] selection:text-[#1a1a1a] font-display">
      <AppSidebar />

      <main className="flex-1 ml-0 md:ml-20 lg:ml-24 px-[60px] pt-[24px] pb-[60px] min-h-screen relative z-10 pb-24 md:pb-[60px]">
        {children}
      </main>

      <MobileNav />
    </div>
  );
};
