import { LayoutDashboard, Users, BarChart3, Settings, LogOut, Moon, Sun } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/social", label: "Social", icon: Users },
  { to: "/stats", label: "Estatísticas", icon: BarChart3 },
  { to: "/settings", label: "Configurações", icon: Settings },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 p-4 pb-10 overflow-y-auto">
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-8 h-8 rounded-full gradient-success flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">H</span>
        </div>
        <div>
          <h1 className="font-bold text-foreground text-lg leading-tight">HabitTracker</h1>
          <p className="text-xs text-muted-foreground">Social Edition</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border pt-4 mt-4 space-y-2">
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold text-xs">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.email?.split("@")[0]}</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
            title="Alternar tema"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
};
