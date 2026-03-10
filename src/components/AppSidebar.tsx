import { useState } from "react";
import { LayoutDashboard, Calendar, User, Settings, LogOut, Terminal, Bell, Plus, Settings2, UserPlus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { AddFriendDialog } from "@/components/AddFriendDialog";
import { MyHabitsDialog } from "@/components/MyHabitsDialog";
import { ChallengeInvites } from "@/components/ChallengeInvites";
import { usePartyChallenge } from "@/hooks/usePartyChallenge";
import { useSocial } from "@/hooks/useSocial";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/social", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { userId } = useAuth();
  const { signOut } = useClerk();
  const { invites } = usePartyChallenge();
  const { incomingRequests } = useSocial();
  const [isFriendDialogOpen, setIsFriendDialogOpen] = useState(false);

  const invitesCount = (invites?.length || 0) + (incomingRequests?.length || 0);

  return (
    <>
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-background-dark border-b-2 border-[#224949] items-center px-6 z-50">
        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#25f4f4] flex items-center justify-center neo-shadow">
            <Terminal className="w-4 h-4 text-background-dark" />
          </div>
          <span className="text-white font-bold text-sm tracking-wider uppercase hidden lg:inline">
            Habit-Buddies
          </span>
        </NavLink>

        {/* Center nav links */}
        <nav className="flex-1 flex items-center justify-center gap-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to === "/social" && location.pathname.startsWith("/profile"));
            return (
              <NavLink
                key={item.to}
                to={item.to === "/social" ? `/profile/${userId}` : item.to}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded",
                  isActive
                    ? "bg-[#25f4f4] text-background-dark neo-shadow"
                    : "text-slate-400 hover:text-[#25f4f4]"
                )}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right side: action buttons + logout */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Bell */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-9 h-9 flex items-center justify-center rounded border-2 border-[#224949] hover:border-[#25f4f4] transition-all text-[#25f4f4] bg-background-dark relative">
                <Bell className="w-4 h-4" />
                {invitesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#25f4f4] text-background-dark text-[8px] font-bold flex items-center justify-center rounded">
                    {invitesCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-background-dark neo-border neo-shadow rounded" align="end">
              <div className="p-3 border-b-2 border-[#224949]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">INCOMING_SIGNALS</h3>
              </div>
              <div className="p-2">
                <ChallengeInvites />
              </div>
            </PopoverContent>
          </Popover>

          {/* ADD_FRIEND */}
          <button
            onClick={() => setIsFriendDialogOpen(true)}
            className="h-9 bg-background-dark text-[#25f4f4] font-bold px-3 rounded flex items-center justify-center gap-1.5 transition-colors border-2 border-[#224949] hover:border-[#25f4f4] uppercase tracking-wider text-[10px]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">ADD_FRIEND</span>
          </button>

          {/* CONFIG_HABITS */}
          <MyHabitsDialog>
            <div>
              <button className="h-9 bg-background-dark text-[#25f4f4] font-bold px-3 rounded flex items-center justify-center gap-1.5 transition-colors border-2 border-[#224949] hover:border-[#25f4f4] uppercase tracking-wider text-[10px]">
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">CONFIG_HABITS</span>
              </button>
            </div>
          </MyHabitsDialog>

          {/* INIT_HABIT */}
          <AddHabitDialog>
            <button className="h-9 bg-[#25f4f4] text-background-dark font-bold px-3 rounded flex items-center justify-center gap-1.5 transition-all hover:brightness-110 tracking-wider uppercase text-[10px] group">
              <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
              <span className="hidden xl:inline">INIT_HABIT</span>
            </button>
          </AddHabitDialog>

          {/* Divider */}
          <div className="w-px h-6 bg-[#224949] mx-1" />

          {/* Logout */}
          <button
            onClick={() => signOut()}
            className="w-9 h-9 rounded border-2 border-[#224949] flex items-center justify-center text-slate-400 hover:text-[#25f4f4] hover:border-[#25f4f4] transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <AddFriendDialog open={isFriendDialogOpen} onOpenChange={setIsFriendDialogOpen} />
    </>
  );
};
