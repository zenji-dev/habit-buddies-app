import { LayoutDashboard, Users, Settings, LogOut, Moon, Sun, Calendar } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calendar", label: "Calendário", icon: Calendar },
  { to: "/social", label: "Social", icon: Users },
  { to: "/settings", label: "Configurações", icon: Settings },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: profile } = useProfile();

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
        <Link
          to={`/profile/${user?.id}`}
          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-semibold text-xs">
                  {profile?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {profile?.name || "Meu Perfil"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate italic">
                {profile?.username ? `@${profile.username}` : user?.email}
              </p>
            </div>
          </div>
        </Link>
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-muted-foreground">Tema</span>
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
