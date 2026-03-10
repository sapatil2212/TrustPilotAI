"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { 
  ArrowRight,
  Star,
  Target,
  Users,
  TrendingUp,
  BarChart3,
  Megaphone,
  Phone
} from "lucide-react";

const features = [
  { icon: Target, title: "Targeted Campaigns", description: "Reach your ideal audience with precision targeting across all major platforms." },
  { icon: Megaphone, title: "Ad Creation", description: "Professional ad creatives that capture attention and drive conversions." },
  { icon: Users, title: "Audience Growth", description: "Build and engage your community with strategic content and campaigns." },
  { icon: BarChart3, title: "Performance Tracking", description: "Real-time analytics and insights to optimize your ad spend." },
  { icon: TrendingUp, title: "ROI Optimization", description: "Maximize return on investment with data-driven campaign adjustments." },
  { icon: Star, title: "Brand Awareness", description: "Increase visibility and establish your brand across social platforms." },
];

export default function SocialMediaAdsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f14]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-[#0f0f14] dark:to-[#0f0f14]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <Badge className="mb-6 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-0 font-medium text-sm">
              <Megaphone className="w-3.5 h-3.5 mr-2" />
              Advertising Service
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
              Social Media
              <br className="hidden sm:block" />
              <span className="gradient-text">Advertising</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
              Drive results with targeted social media ad campaigns across Facebook, Instagram, 
              LinkedIn, and more. Reach your ideal customers where they spend their time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button size="lg" className="rounded-full px-8 h-12 text-base font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-soft-lg">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="tel:+917745868073">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-medium border-gray-300 dark:border-gray-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">
              Complete Ad Management
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              End-to-end social media advertising solutions for your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="group p-6 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-soft-lg transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-12 lg:p-20 text-center">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6 tracking-tight">
                Ready to scale your advertising?
              </h2>
              <p className="text-lg text-indigo-100 mb-10">
                Let&apos;s create high-performing ad campaigns that drive real results.
              </p>
              <Link href="/contact">
                <Button size="lg" className="rounded-full px-8 h-12 text-base font-medium bg-white text-indigo-600 hover:bg-gray-100 shadow-soft-lg">
                  Contact Us
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2026 TrustPilotAI. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A product of{" "}
              <a href="https://digiworldtechnologies.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                Digiworld Infotech
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
