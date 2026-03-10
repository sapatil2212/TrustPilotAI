"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { 
  ArrowRight,
  Star,
  Check,
  Sparkles,
  Building2,
  Zap
} from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small businesses getting started",
    price: "499",
    currency: "₹",
    period: "/month",
    features: [
      "1 Business Location",
      "Up to 50 Reviews/Month",
      "AI Reply Suggestions",
      "Basic Analytics",
      "Email Support",
      "QR Code Generator",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    description: "For growing businesses with multiple locations",
    price: "1,499",
    currency: "₹",
    period: "/month",
    features: [
      "5 Business Locations",
      "Unlimited Reviews",
      "Advanced AI Replies",
      "Full Analytics Dashboard",
      "Priority Support",
      "Review Funnel Builder",
      "Team Collaboration",
      "API Access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations with custom needs",
    price: "Custom",
    currency: "",
    period: "",
    features: [
      "Unlimited Locations",
      "Unlimited Reviews",
      "Custom AI Training",
      "White-label Options",
      "Dedicated Account Manager",
      "Advanced Integrations",
      "SLA Guarantee",
      "Custom Reporting",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I change plans at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, all plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f14]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-[#0f0f14] dark:to-[#0f0f14]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <Badge className="mb-6 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-0 font-medium text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Simple Pricing
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
              Choose Your
              <br />
              <span className="gradient-text">Perfect Plan</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
              Start with a 14-day free trial. No credit card required. 
              Scale your plan as your business grows.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl lg:scale-105"
                    : "bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-soft-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-white text-indigo-600 border-0 font-semibold px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? "text-white" : "text-gray-900 dark:text-white"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.popular ? "text-indigo-100" : "text-gray-500 dark:text-gray-400"}`}>
                    {plan.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900 dark:text-white"}`}>
                    {plan.currency}{plan.price}
                  </span>
                  <span className={plan.popular ? "text-indigo-200" : "text-gray-500 dark:text-gray-400"}>
                    {plan.period}
                  </span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 shrink-0 ${plan.popular ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`} />
                      <span className={`text-sm ${plan.popular ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/signup">
                  <Button
                    className={`w-full h-11 rounded-xl font-medium ${
                      plan.popular
                        ? "bg-white text-indigo-600 hover:bg-gray-100"
                        : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 lg:py-32 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">
              All Plans Include
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Every plan comes with these essential features
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: "GMB Integration", description: "Connect your Google Business Profile" },
              { icon: Zap, title: "AI-Powered", description: "Smart reply suggestions" },
              { icon: Star, title: "Review Monitoring", description: "Track all your reviews" },
              { icon: Check, title: "Secure & Reliable", description: "Enterprise-grade security" },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="p-6 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-12 lg:p-20 text-center">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6 tracking-tight">
                Ready to get started?
              </h2>
              <p className="text-lg text-indigo-100 mb-10">
                Start your 14-day free trial today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="rounded-full px-8 h-12 text-base font-medium bg-white text-indigo-600 hover:bg-gray-100 shadow-soft-lg">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-medium border-white/30 text-white hover:bg-white/10">
                    Contact Sales
                  </Button>
                </Link>
              </div>
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
