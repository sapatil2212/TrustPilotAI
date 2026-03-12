"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Sparkles,
  Funnel,
  QrCode,
  BarChart3,
  Settings,
  Menu,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Businesses", href: "/businesses", icon: Building2 },
  { name: "Reviews", href: "/reviews", icon: MessageSquare },
  { name: "AI Replies", href: "/ai-replies", icon: Sparkles },
  { name: "Review Funnels", href: "/funnels", icon: Funnel },
  { name: "QR Codes", href: "/qr-codes", icon: QrCode },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="flex h-16 items-center px-6 border-b border-gray-100/80 dark:border-gray-800/50">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-gray-900 dark:text-white">TrustPilotAI</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500 dark:text-gray-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t border-gray-100/80 dark:border-gray-800/50 p-3">
        <nav className="space-y-1">
          {bottomNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500 dark:text-gray-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="lg:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-[#0f0f14] border-r border-gray-200 dark:border-gray-800">
          <div className="flex flex-col h-full">
            <NavContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "flex flex-col w-72 border-r border-gray-100/80 dark:border-gray-800/50 bg-white dark:bg-[#0f0f14] h-full",
          className
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
