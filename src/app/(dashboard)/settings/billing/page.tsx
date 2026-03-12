"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTrialStore } from "@/lib/store/trial-store";
import { Check, Sparkles, Calendar, CreditCard, Download } from "lucide-react";
import { PRICING_PLANS } from "@/lib/constants";

export default function BillingPage() {
  const { isActive, daysRemaining, plan } = useTrialStore();
  const currentPlan = PRICING_PLANS.find((p) => p.id === plan) || PRICING_PLANS[1];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
        <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Current Plan</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">Manage your subscription and billing</CardDescription>
            </div>
            {isActive ? (
              <Badge variant="secondary" className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                Trial Active
              </Badge>
            ) : (
              <Badge className="rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="mb-4 sm:mb-0">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{currentPlan.name} Plan</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isActive
                  ? `Your trial ends in ${daysRemaining} days`
                  : "Billed monthly"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentPlan.currency}{currentPlan.price}
              </span>
              <span className="text-gray-500 dark:text-gray-400">/month</span>
            </div>
          </div>

          {isActive && (
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">You&apos;re on a free trial</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Your trial ends in {daysRemaining} days. Upgrade now to continue
                    using all features without interruption.
                  </p>
                  <Link href="/pricing">
                    <Button className="mt-4 rounded-xl h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 font-medium">
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <Separator className="bg-gray-100 dark:bg-gray-800" />

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Plan Features</h4>
            <ul className="grid gap-3 sm:grid-cols-2">
              {currentPlan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
        <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isActive ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">No payment method required during trial</p>
              <p className="text-sm mt-1">
                Add a payment method when you upgrade
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-md shadow-sm" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                Update
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
        <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Billing History</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">View your past invoices</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isActive ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">No billing history during trial</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { date: "Mar 1, 2026", amount: "₹2,499", status: "Paid" },
                { date: "Feb 1, 2026", amount: "₹2,499", status: "Paid" },
                { date: "Jan 1, 2026", amount: "₹2,499", status: "Paid" },
              ].map((invoice, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  <div className="mb-3 sm:mb-0">
                    <p className="font-medium text-gray-900 dark:text-white">Growth Plan - Monthly</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900 dark:text-white">{invoice.amount}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">{invoice.status}</Badge>
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
