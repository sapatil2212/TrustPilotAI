"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { 
  Sparkles, 
  ArrowRight,
  Check,
  Star,
  Zap,
  MessageSquare,
  BarChart3,
  Building2,
  QrCode,
  Globe,
  Phone,
  ExternalLink
} from "lucide-react";



// Hero Section
function HeroSection() {
  return (
    <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-[#0f0f14] dark:to-[#0f0f14]" />
      
      {/* Animated background orbs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge className="mb-8 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-0 font-medium text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            Powered by AI Technology
          </Badge>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
            AI-Powered Review
            <br />
            <span className="gradient-text">Management Platform</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
            Monitor, respond, and grow your online reputation automatically. 
            The smartest way to manage Google reviews for your business.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-8 h-12 text-base font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-soft-lg">
                Start for free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-medium border-gray-300 dark:border-gray-700">
                View pricing
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, color }: { icon: React.ComponentType<{ className?: string }>, title: string, description: string, color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
    purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
    green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
    orange: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
    blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    pink: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400",
  };

  return (
    <div className="group p-6 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-soft-lg transition-all duration-300">
      <div className={`w-11 h-11 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    { icon: Sparkles, title: "AI Review Replies", description: "Generate professional, personalized responses to reviews in seconds with AI-powered suggestions.", color: "indigo" },
    { icon: MessageSquare, title: "Smart Responses", description: "Customize tone and style for each reply while maintaining your brand voice consistently.", color: "purple" },
    { icon: Building2, title: "Multi-Location", description: "Manage reviews across all your business locations from a single, unified dashboard.", color: "blue" },
    { icon: BarChart3, title: "Analytics", description: "Track sentiment trends, response times, and reputation metrics with detailed insights.", color: "green" },
    { icon: QrCode, title: "QR Codes", description: "Generate custom QR codes to direct customers to your review page and boost ratings.", color: "orange" },
    { icon: Zap, title: "Instant Alerts", description: "Get notified immediately when new reviews are posted so you can respond quickly.", color: "pink" },
  ];

  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 text-xs font-medium">
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">
            Everything you need to
            <br />
            manage reviews
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Powerful tools to help you monitor, respond, and grow your online reputation.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    { step: "01", title: "Connect", description: "Link your Google Business Profile in just a few clicks." },
    { step: "02", title: "Monitor", description: "We automatically track all new reviews across your locations." },
    { step: "03", title: "Reply", description: "Use AI to generate professional responses instantly." },
    { step: "04", title: "Grow", description: "Watch your ratings improve and reputation soar." },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-gray-50/50 dark:bg-gray-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 text-xs font-medium">
            How It Works
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">
            Get started in minutes
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Simple setup process that gets you up and running quickly.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold mb-5 shadow-glow">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-full w-full h-px bg-gradient-to-r from-indigo-200 dark:from-indigo-900 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Stats Section
function StatsSection() {
  const stats = [
    { value: "50K+", label: "Reviews Managed" },
    { value: "3,000+", label: "Businesses" },
    { value: "4.9", label: "Average Rating" },
    { value: "99%", label: "Uptime" },
  ];

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-12 lg:p-20 text-center">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-6 tracking-tight">
              Ready to transform your review management?
            </h2>
            <p className="text-lg text-indigo-100 mb-10">
              Join thousands of businesses using TrustPilotAI to grow their reputation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="rounded-full px-8 h-12 text-base font-medium bg-white text-indigo-600 hover:bg-gray-100 shadow-soft-lg">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-medium border-white/30 text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-semibold">TrustPilotAI</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-xs">
              AI-powered Google review management for modern businesses.
            </p>
            <div className="flex items-center gap-4">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Made with care</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-white">Product</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/#features" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Pricing</Link></li>
              <li><Link href="/" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Integrations</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-white">Company</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">About</Link></li>
              <li><Link href="/" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-white">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 TrustPilotAI. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A product of{" "}
            <a 
              href="https://digiworldtechnologies.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 inline-flex items-center gap-1"
            >
              Digiworld Infotech
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// WhatsApp & Call Widget
function ContactWidget() {
  const phoneNumber = "7745868073";
  const whatsappUrl = `https://wa.me/91${phoneNumber}`;
  const telUrl = `tel:+91${phoneNumber}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-full pl-4 pr-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="text-sm font-medium hidden group-hover:inline-block transition-all">WhatsApp</span>
      </a>
      
      {/* Call Button */}
      <a
        href={telUrl}
        className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full pl-4 pr-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Phone className="w-6 h-6" />
        <span className="text-sm font-medium hidden group-hover:inline-block transition-all">Call Now</span>
      </a>
    </div>
  );
}

// Main Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f14]">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
      <ContactWidget />
    </div>
  );
}
