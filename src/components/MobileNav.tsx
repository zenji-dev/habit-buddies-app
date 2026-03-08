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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background-dark border-t-2 border-[#224949] z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 text-[8px] uppercase tracking-widest font-bold transition-colors relative",
                isActive ? "text-[#25f4f4]" : "text-slate-500"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#25f4f4]" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
