import { LayoutDashboard, Calendar, User, Settings, LogOut, Terminal } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard },
  { to: "/calendar", label: "CALENDAR", icon: Calendar },
  { to: "/social", label: "PROFILE", icon: User },
  { to: "/settings", label: "SETTINGS", icon: Settings },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { userId } = useAuth();
  const { signOut } = useClerk();

  return (
    <aside className="hidden md:flex w-20 lg:w-24 bg-background-dark border-r-2 border-[#224949] flex-col items-center py-8 shrink-0 fixed h-screen z-50">
      {/* Logo */}
      <div className="w-10 h-10 rounded-full bg-[#25f4f4] flex items-center justify-center mb-12 neo-shadow">
        <Terminal className="w-5 h-5 text-background-dark" />
      </div>

      {/* Nav */}
      <nav className="flex-1 w-full flex flex-col items-center gap-8">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to ||
            (item.to === "/social" && location.pathname.startsWith("/profile"));
          return (
            <NavLink
              key={item.to}
              to={item.to === "/social" ? `/profile/${userId}` : item.to}
              className="group relative flex items-center justify-center w-full"
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 h-8 w-1 bg-[#25f4f4]" />
              )}

              <div className={cn(
                "p-3 rounded transition-all",
                isActive
                  ? "bg-[#25f4f4] text-background-dark neo-shadow"
                  : "text-slate-400 hover:text-[#25f4f4]"
              )}>
                <item.icon className="w-6 h-6" />
              </div>

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-1 bg-background-dark neo-border text-[#25f4f4] text-xs font-bold neo-shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 uppercase tracking-wider">
                {item.label}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto">
        <button
          onClick={() => signOut()}
          className="w-10 h-10 rounded border-2 border-[#224949] flex items-center justify-center text-slate-400 hover:text-[#25f4f4] hover:border-[#25f4f4] transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
