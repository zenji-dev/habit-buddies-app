import { LayoutDashboard, Calendar, User, Settings, LogOut, Terminal } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "DASHBOARD_V1", icon: LayoutDashboard },
  { to: "/calendar", label: "CALENDAR_EXE", icon: Calendar },
  { to: "/social", label: "NETWORK_SYS", icon: User },
  { to: "/settings", label: "SYSTEM_CONFIG", icon: Settings },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { userId } = useAuth();
  const { signOut } = useClerk();

  return (
    <aside className="hidden md:flex w-20 lg:w-24 bg-sidebar-dark border-r border-slate-900 shadow-[2px_0_15px_rgba(0,163,117,0.05)] flex-col items-center py-8 shrink-0 fixed h-screen z-50">
      {/* Logo */}
      <div className="w-10 h-10 bg-transparent border border-[#00a375] text-[#00a375] flex items-center justify-center mb-12 shadow-[0_0_10px_rgba(0,163,117,0.3)] hover:shadow-[0_0_15px_rgba(0,163,117,0.6)] transition-all duration-300">
        <Terminal className="w-5 h-5" />
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
              {/* Active indicator bar — orange accent */}
              {isActive && (
                <div className="absolute left-0 h-8 w-1 bg-[#e66b00] shadow-[0_0_8px_#e66b00]" />
              )}

              <div className={cn(
                "p-3 transition-all",
                isActive
                  ? "bg-[#00a375]/10 border border-[#00a375]/50 text-[#00a375] shadow-[0_0_10px_rgba(0,163,117,0.2)]"
                  : "text-[#00a375]/50 hover:text-[#00a375] hover:border hover:border-[#00a375]/50 hover:bg-[#00a375]/5 hover:shadow-[0_0_10px_rgba(0,163,117,0.2)]"
              )}>
                <item.icon className="w-6 h-6" />
              </div>

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-1 bg-background-dark border border-[#00a375] text-[#00a375] font-mono-tech text-xs shadow-neon opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
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
          className="w-10 h-10 border border-slate-800 flex items-center justify-center text-[#00a375]/50 hover:text-[#00a375] hover:border-[#00a375] hover:shadow-[0_0_10px_rgba(0,163,117,0.3)] transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
