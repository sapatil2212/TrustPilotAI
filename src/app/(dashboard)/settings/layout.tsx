"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Users, CreditCard, Plug, Key, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsNav = [
  { name: "Profile", href: "/settings/profile", icon: User },
  { name: "Team Members", href: "/settings/team", icon: Users },
  { name: "Billing", href: "/settings/billing", icon: CreditCard },
  { name: "Integrations", href: "/settings/integrations", icon: Plug },
  { name: "Webhooks", href: "/settings/webhooks", icon: Webhook },
  { name: "API Keys", href: "/settings/api-keys", icon: Key },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <aside className="lg:w-64 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
