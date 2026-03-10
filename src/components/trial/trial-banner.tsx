"use client";

import { useTrialStore } from "@/lib/store/trial-store";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, AlertTriangle, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  className?: string;
}

export function TrialBanner({ className }: TrialBannerProps) {
  const { isActive, daysRemaining } = useTrialStore();

  if (!isActive) {
    return (
      <Alert className={cn("bg-trust-blue/10 border-trust-blue/20", className)}>
        <Sparkles className="h-4 w-4 text-trust-blue" />
        <AlertTitle className="text-trust-blue">Upgrade to Premium</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>
            Unlock unlimited businesses and advanced features with our premium plans.
          </span>
          <Link href="/pricing">
            <Button size="sm" className="rounded-full shrink-0">
              View Plans
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  const isWarning = daysRemaining <= 3;

  return (
    <Alert
      className={cn(
        isWarning
          ? "bg-destructive/10 border-destructive/20"
          : "bg-primary/10 border-primary/20",
        className
      )}
    >
      {isWarning ? (
        <AlertTriangle className="h-4 w-4 text-destructive" />
      ) : (
        <Clock className="h-4 w-4 text-primary" />
      )}
      <AlertTitle className={isWarning ? "text-destructive" : "text-primary"}>
        {isWarning ? "Trial Expiring Soon" : "Free Trial Active"}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>
          {isWarning
            ? `Your free trial ends in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}. Upgrade now to keep using all features.`
            : `You have ${daysRemaining} days remaining in your free trial. Enjoy all premium features!`}
        </span>
        <Link href="/settings/billing">
          <Button
            size="sm"
            variant={isWarning ? "destructive" : "default"}
            className="rounded-full shrink-0"
          >
            Upgrade Now
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
