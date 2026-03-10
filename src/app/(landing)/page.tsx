"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Funnel, 
  BarChart3, 
  Building2, 
  QrCode,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Clock
} from "lucide-react";
import { FEATURES, HOW_IT_WORKS_STEPS } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Funnel,
  BarChart3,
  Building2,
  QrCode,
};

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-trust-blue/5" />
        <div className="container relative">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Now with AI-Powered Replies
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              AI Powered{" "}
              <span className="gradient-text">Google Review</span>{" "}
              Management Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Monitor reviews, generate AI replies, and grow your reputation automatically. 
              The smartest way to manage your business reviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="rounded-full gap-2 text-base">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="rounded-full text-base">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-trust-green" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-trust-green" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-trust-green" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8">
            Trusted by businesses worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50">
            {["Google", "Trustpilot", "Yelp", "TripAdvisor", "Facebook"].map((brand) => (
              <div key={brand} className="text-lg font-semibold text-muted-foreground">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage reviews
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features to help you monitor, respond, and grow your online reputation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = iconMap[feature.icon] || Sparkles;
              return (
                <Card key={feature.title} className="group hover:shadow-saas-lg transition-all duration-300 border-0 shadow-saas">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6 text-primary group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
            <Card className="group hover:shadow-saas-lg transition-all duration-300 border-0 shadow-saas">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-trust-green/10 flex items-center justify-center mb-4 group-hover:bg-trust-green group-hover:text-white transition-colors">
                  <Zap className="w-6 h-6 text-trust-green group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Notifications</h3>
                <p className="text-muted-foreground">
                  Get real-time alerts when new reviews are posted to any of your locations.
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-saas-lg transition-all duration-300 border-0 shadow-saas">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Shield className="w-6 h-6 text-orange-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Reputation Protection</h3>
                <p className="text-muted-foreground">
                  Flag and manage negative reviews before they impact your business.
                </p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-saas-lg transition-all duration-300 border-0 shadow-saas">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Clock className="w-6 h-6 text-purple-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Monitoring</h3>
                <p className="text-muted-foreground">
                  Our system monitors your reviews around the clock so you never miss anything.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Get started in minutes and see results immediately.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-trust-blue p-8 md:p-16 text-center">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to transform your review management?
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Join thousands of businesses using TrustPilotAI to grow their reputation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="rounded-full gap-2">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white/10">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
