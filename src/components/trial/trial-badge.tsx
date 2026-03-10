"use client";

import { useTrialStore } from "@/lib/store/trial-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface TrialBadgeProps {
  className?: string;
}

export function TrialBadge({ className }: TrialBadgeProps) {
  const { isActive, daysRemaining } = useTrialStore();

  if (!isActive) return null;

  const isWarning = daysRemaining <= 3;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Badge
        variant={isWarning ? "destructive" : "secondary"}
        className={cn(
          "px-3 py-1.5 font-medium",
          isWarning && "animate-pulse"
        )}
      >
        {isWarning ? (
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
        ) : (
          <Clock className="w-3.5 h-3.5 mr-1.5" />
        )}
        Trial: {daysRemaining} days remaining
      </Badge>
      <Link href="/settings/billing">
        <Button size="sm" className="rounded-full h-8">
          Upgrade Now
        </Button>
      </Link>
    </div>
  );
}
