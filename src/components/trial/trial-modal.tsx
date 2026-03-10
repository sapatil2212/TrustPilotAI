"use client";

import { useState, useEffect } from "react";
import { useTrialStore } from "@/lib/store/trial-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Sparkles } from "lucide-react";
import Link from "next/link";

export function TrialModal() {
  const { isActive, daysRemaining } = useTrialStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isActive && daysRemaining === 0) {
      setIsOpen(true);
    }
  }, [isActive, daysRemaining]);

  if (isActive && daysRemaining > 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <DialogTitle className="text-xl">Trial Expired</DialogTitle>
          <DialogDescription className="text-base">
            Your free trial has ended. Upgrade to a paid plan to continue using
            TrustPilotAI and manage your business reviews.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-trust-green" />
              <span className="text-sm">Unlimited review monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-trust-green" />
              <span className="text-sm">AI-powered reply generation</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-trust-green" />
              <span className="text-sm">Advanced analytics & reporting</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-trust-green" />
              <span className="text-sm">Multi-location management</span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Link href="/pricing" className="w-full sm:w-auto">
            <Button className="w-full rounded-full">View Pricing</Button>
          </Link>
          <Link href="/contact" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full rounded-full">
              Contact Sales
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
