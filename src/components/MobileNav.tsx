import { LayoutDashboard, Users, Settings, User, Calendar } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export const MobileNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
    { to: "/calendar", label: "Agenda", icon: Calendar },
    { to: "/social", label: "Social", icon: Users },
    { to: `/profile/${user?.id}`, label: "Perfil", icon: User },
    { to: "/settings", label: "Config", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
