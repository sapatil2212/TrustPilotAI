"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "spinner" | "dots" | "pulse" | "logo";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export function LoadingSpinner({ size = "md", className, variant = "spinner" }: LoadingSpinnerProps) {
  if (variant === "dots") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-indigo-600 dark:bg-indigo-400",
              size === "sm" ? "w-1.5 h-1.5" : size === "lg" ? "w-3 h-3" : "w-2 h-2"
            )}
            style={{
              animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`,
            }}
          />
        ))}
        <style jsx>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("relative", sizeClasses[size], className)}>
        <div className="absolute inset-0 rounded-full bg-indigo-600/30 animate-ping" />
        <div className="relative rounded-full bg-indigo-600 w-full h-full" />
      </div>
    );
  }

  if (variant === "logo") {
    return (
      <div className={cn("relative", className)}>
        <div className={cn(
          "rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse",
          sizeClasses[size]
        )}>
          <Star className={cn(
            "text-white fill-white",
            size === "sm" ? "w-2 h-2" : size === "lg" ? "w-6 h-6" : size === "xl" ? "w-8 h-8" : "w-4 h-4"
          )} />
        </div>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-ping opacity-20" />
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-900" />
      <div className="absolute inset-0 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
    </div>
  );
}

export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" variant="logo" />
        <div className="flex flex-col items-center gap-2">
          <LoadingSpinner size="sm" variant="dots" />
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function FullPageLoader({ message = "Loading TrustPilotAI..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <LoadingSpinner size="xl" variant="logo" />
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="md" variant="dots" />
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function ButtonLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LoadingSpinner size="sm" />
      <span>Loading...</span>
    </div>
  );
}

export function CardLoader() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    </div>
  );
}

export function TableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
}
