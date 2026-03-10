"use client";

import { Bell, User, LogOut, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sidebar } from "./sidebar";
import { TrialBadge } from "@/components/trial/trial-badge";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const isDark = resolvedTheme === "dark";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 border-b backdrop-blur-xl",
      isDark 
        ? "bg-[#0f0f14]/80 border-gray-800" 
        : "bg-white/80 border-gray-200",
      className
    )}>
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Sidebar />
        
        <div className="flex-1" />
        
        <div className="hidden md:flex items-center gap-4">
          <TrialBadge />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "rounded-lg w-9 h-9",
              isDark 
                ? "hover:bg-gray-800 text-gray-400" 
                : "hover:bg-gray-100 text-gray-600"
            )}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "rounded-lg w-9 h-9 relative",
              isDark 
                ? "hover:bg-gray-800 text-gray-400" 
                : "hover:bg-gray-100 text-gray-600"
            )}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-[#0f0f14]" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button 
                variant="ghost" 
                className={cn(
                  "relative h-9 pl-2 pr-3 rounded-lg gap-2",
                  isDark 
                    ? "hover:bg-gray-800 text-gray-300" 
                    : "hover:bg-gray-100 text-gray-700"
                )}
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-medium">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">{user?.name?.split(' ')[0] || "User"}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className={cn(
                "w-56",
                isDark 
                  ? "bg-[#1a1a1f] border-gray-800" 
                  : "bg-white border-gray-200"
              )} 
              align="end"
            >
              <DropdownMenuLabel className={isDark ? "text-gray-300" : ""}>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className={isDark ? "bg-gray-800" : ""} />
              <DropdownMenuItem onClick={() => router.push("/settings/profile")} className={cn("cursor-pointer", isDark ? "text-gray-300 focus:bg-gray-800" : "")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings/billing")} className={cn("cursor-pointer", isDark ? "text-gray-300 focus:bg-gray-800" : "")}>
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator className={isDark ? "bg-gray-800" : ""} />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
