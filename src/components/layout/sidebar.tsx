"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Sparkles,
  Filter,
  QrCode,
  BarChart3,
  Settings,
  Menu,
  Star,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Overview & stats" },
  { name: "Businesses", href: "/businesses", icon: Building2, description: "Manage locations" },
  { name: "Reviews", href: "/reviews", icon: MessageSquare, description: "Customer feedback" },
  { name: "AI Replies", href: "/ai-replies", icon: Sparkles, description: "Auto responses" },
  { name: "Review Funnels", href: "/funnels", icon: Filter, description: "Collection flows" },
  { name: "QR Codes", href: "/qr-codes", icon: QrCode, description: "Generate codes" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, description: "Insights & data" },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings, description: "Account settings" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const isHovered = hoveredItem === item.name;

    return (
      <Link
        href={item.href}
        onClick={() => setIsOpen(false)}
        onMouseEnter={() => setHoveredItem(item.name)}
        onMouseLeave={() => setHoveredItem(null)}
        className={cn(
          "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white"
        )}
      >
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
          isActive 
            ? "bg-white/20" 
            : "bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30"
        )}>
          <Icon className={cn(
            "w-4 h-4 transition-colors",
            isActive 
              ? "text-white" 
              : "text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block truncate">{item.name}</span>
          {isHovered && !isActive && (
            <span className="text-xs text-gray-400 dark:text-gray-500 truncate block">
              {item.description}
            </span>
          )}
        </div>
        {isActive && (
          <ChevronRight className="w-4 h-4 text-white/70" />
        )}
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg" />
        )}
      </Link>
    );
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-gray-100 dark:border-gray-800">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-3 group" 
          onClick={() => setIsOpen(false)}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-30 blur-sm transition-opacity" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">TrustPilotAI</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">Review Management</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3">
        <nav className="space-y-1">
          {bottomNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 rounded-xl bg-white dark:bg-gray-900 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0f0f14] border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </Button>
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col w-72 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f0f14] h-screen sticky top-0",
          className
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
