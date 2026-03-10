"use client";

import { useTrialStore } from "@/lib/store/trial-store";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  className?: string;
}

export function TrialBanner({ className }: TrialBannerProps) {
  const { isActive, daysRemaining } = useTrialStore();

  if (!isActive) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-2xl p-4 sm:p-6",
        "bg-gradient-to-r from-indigo-600 to-purple-600",
        "shadow-lg shadow-indigo-500/25",
        className
      )}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Upgrade to Premium</h3>
              <p className="text-white/80 text-sm mt-1">
                Unlock unlimited businesses and advanced features with our premium plans.
              </p>
            </div>
          </div>
          <Link href="/pricing" className="shrink-0">
            <Button 
              size="sm" 
              className="rounded-xl bg-white text-indigo-600 hover:bg-white/90 font-medium shadow-lg"
            >
              View Plans
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isWarning = daysRemaining <= 3;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-4 sm:p-6",
      isWarning 
        ? "bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/25" 
        : "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25",
      className
    )}>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            {isWarning ? (
              <AlertTriangle className="h-5 w-5 text-white" />
            ) : (
              <Clock className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isWarning ? "Trial Expiring Soon" : "Free Trial Active"}
            </h3>
            <p className="text-white/80 text-sm mt-1">
              {isWarning
                ? `Your free trial ends in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}. Upgrade now to keep using all features.`
                : `You have ${daysRemaining} days remaining in your free trial. Enjoy all premium features!`}
            </p>
          </div>
        </div>
        <Link href="/settings/billing" className="shrink-0">
          <Button 
            size="sm" 
            className={cn(
              "rounded-xl font-medium shadow-lg",
              isWarning 
                ? "bg-white text-red-600 hover:bg-white/90" 
                : "bg-white text-indigo-600 hover:bg-white/90"
            )}
          >
            Upgrade Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
