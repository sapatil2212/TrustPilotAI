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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </div>
            {isActive ? (
              <Badge variant="secondary" className="rounded-full">
                Trial Active
              </Badge>
            ) : (
              <Badge className="rounded-full">Active</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">{currentPlan.name} Plan</h3>
              <p className="text-sm text-muted-foreground">
                {isActive
                  ? `Your trial ends in ${daysRemaining} days`
                  : "Billed monthly"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold">
                {currentPlan.currency}{currentPlan.price}
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>

          {isActive && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">You&apos;re on a free trial</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your trial ends in {daysRemaining} days. Upgrade now to continue
                    using all features without interruption.
                  </p>
                  <Link href="/pricing">
                    <Button className="mt-3 rounded-full">
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Plan Features</h4>
            <ul className="grid gap-2 sm:grid-cols-2">
              {currentPlan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-trust-green" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          {isActive ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payment method required during trial</p>
              <p className="text-sm">
                Add a payment method when you upgrade
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                Update
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {isActive ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No billing history during trial</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { date: "Mar 1, 2026", amount: "₹2,499", status: "Paid" },
                { date: "Feb 1, 2026", amount: "₹2,499", status: "Paid" },
                { date: "Jan 1, 2026", amount: "₹2,499", status: "Paid" },
              ].map((invoice, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Growth Plan - Monthly</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{invoice.amount}</span>
                    <Badge variant="secondary">{invoice.status}</Badge>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Download className="w-4 h-4" />
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
