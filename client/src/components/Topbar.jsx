import { Bell, ChevronDown, LogOut } from "lucide-react";
<<<<<<< HEAD
import { useAuth } from "@/lib/auth";
=======
import { useAuth } from "@/AuthContext";
>>>>>>> 3f8021b6a239b887bd48f7170589b29b907ef28d
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Topbar({ title, icon: Icon, bell = 0, onBell }) {
  const { profile, logout, isAdmin } = useAuth();
  return (
    <header className="mb-5 flex items-center justify-between border-b-2 border-border pb-4 print:hidden">
      <h2 className="flex items-center gap-3 text-2xl font-bold text-sidebar-deep drop-shadow-sm sm:text-3xl">
        <Icon className="h-7 w-7" />
        {title}
      </h2>
      <div className="flex items-center gap-3">
        {onBell && (
          <Button variant="ghost" size="icon" className="relative" onClick={onBell} aria-label="Notifications">
            <Bell className="!size-5 text-sidebar-deep" />
            {bell > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{bell}</span>
            )}
          </Button>
        )}
        <div className="h-7 w-px bg-foreground" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2 font-bold text-sidebar-deep">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-sidebar-deep text-xs text-sidebar-foreground">
                {(profile?.name || "?")[0].toUpperCase()}
              </span>
              <span className="hidden sm:inline">{profile?.name}{isAdmin ? " (Admin)" : ""}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{profile?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={logout}><LogOut /> Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
