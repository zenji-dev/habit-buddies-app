import { LayoutDashboard, Users, Settings, LogOut, Moon, Sun, Calendar } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

const navItems = [
  { to: "/dashboard", label: "Início", icon: LayoutDashboard },
  { to: "/calendar", label: "Calendário", icon: Calendar },
  { to: "/social", label: "Social", icon: Users },
  { to: "/settings", label: "Configurações", icon: Settings },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { signOut, userId } = useAuth();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const { data: profile } = useProfile();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 p-6 pb-8 overflow-y-auto z-50">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-foreground text-xl tracking-tight">Habit Buddies</h1>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border pt-6 mt-6 space-y-4">
        <Link
          to={`/profile/${userId}`}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/50 transition-colors group border border-transparent hover:border-sidebar-border"
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-muted-foreground font-bold text-sm group-hover:text-foreground">
                {profile?.name?.charAt(0) || user?.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {profile?.name || "Meu Perfil"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate italic">
              {profile?.username ? `@${profile.username}` : user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </Link>

        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-muted-foreground font-medium">Tema</span>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Alternar tema"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
};
