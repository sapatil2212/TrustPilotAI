"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TrialState {
  isActive: boolean;
  daysRemaining: number;
  startDate: string;
  endDate: string;
  plan: "starter" | "growth" | "agency";
}

interface TrialStore extends TrialState {
  startTrial: (plan?: "starter" | "growth" | "agency") => void;
  decrementDays: () => void;
  endTrial: () => void;
  upgradePlan: (plan: "starter" | "growth" | "agency") => void;
}

const calculateDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const useTrialStore = create<TrialStore>()(
  persist(
    (set, get) => ({
      isActive: true,
      daysRemaining: 14,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      plan: "growth",

      startTrial: (plan = "growth") => {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
        set({
          isActive: true,
          daysRemaining: 14,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          plan,
        });
      },

      decrementDays: () => {
        const { endDate } = get();
        const daysRemaining = calculateDaysRemaining(endDate);
        set({ daysRemaining });
      },

      endTrial: () => {
        set({ isActive: false, daysRemaining: 0 });
      },

      upgradePlan: (plan) => {
        set({ plan, isActive: false, daysRemaining: 0 });
      },
    }),
    {
      name: "trial-storage",
    }
  )
);
