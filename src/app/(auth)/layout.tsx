import Link from "next/link";
import { Star, TrendingUp, Lightbulb, Target } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0f0f14]">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-semibold text-xl tracking-tight">TrustPilotAI</span>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-8 max-w-md">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">87%</p>
                <p className="text-white/70 text-sm">Increase in customer engagement</p>
              </div>
            </div>
            
            <blockquote className="text-2xl font-medium leading-relaxed tracking-tight">
              &ldquo;Your online reputation is your business currency. 
              Manage it wisely, and growth follows naturally.&rdquo;
            </blockquote>
            
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-white/60" />
                <span className="text-sm text-white/80">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-white/60" />
                <span className="text-sm text-white/80">Results Driven</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-white/60">
          © 2026 TrustPilotAI. All rights reserved.
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="lg:hidden p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight dark:text-white">TrustPilotAI</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-8">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
