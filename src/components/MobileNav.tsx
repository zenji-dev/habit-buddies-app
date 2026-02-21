import { LayoutDashboard, Calendar, User, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";

export const MobileNav = () => {
  const location = useLocation();
  const { userId } = useAuth();

  const navItems = [
    { to: "/dashboard", label: "DASH", icon: LayoutDashboard },
    { to: "/calendar", label: "CAL", icon: Calendar },
    { to: `/profile/${userId}`, label: "USER", icon: User },
    { to: "/settings", label: "CFG", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background-dark border-t border-slate-900 z-50 shadow-[0_-2px_15px_rgba(0,163,117,0.05)]">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 text-[8px] uppercase tracking-widest font-mono-tech transition-colors relative",
                isActive ? "text-[#00a375]" : "text-[#00a375]/40"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#e66b00] shadow-[0_0_5px_#e66b00]" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
