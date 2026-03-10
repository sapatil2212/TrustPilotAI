"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Funnel, ExternalLink, Copy, Check, BarChart3 } from "lucide-react";
import { toast } from "sonner";
// import { MOCK_BUSINESSES } from "@/lib/constants";

const mockFunnels = [
  { id: "1", name: "Main Review Funnel", business: "Downtown Cafe", views: 1234, conversions: 89, rate: "7.2%" },
  { id: "2", name: "QR Code Funnel", business: "Westside Bistro", views: 567, conversions: 45, rate: "7.9%" },
];

export default function FunnelsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    toast.success("Funnel URL copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Funnels</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage review collection funnels
          </p>
        </div>
        <Button className="rounded-full gap-2">
          <Funnel className="w-4 h-4" />
          Create Funnel
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="rounded-full">
          <TabsTrigger value="active" className="rounded-full">Active Funnels</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-full">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {mockFunnels.map((funnel) => (
              <Card key={funnel.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{funnel.name}</CardTitle>
                      <CardDescription>{funnel.business}</CardDescription>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{funnel.views}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{funnel.conversions}</p>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{funnel.rate}</p>
                      <p className="text-xs text-muted-foreground">Rate</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={`https://trustpilot.ai/f/${funnel.id}`}
                        readOnly
                        className="pr-10 rounded-lg"
                      />
                      <button
                        onClick={() => handleCopy(`https://trustpilot.ai/f/${funnel.id}`, funnel.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {copied === funnel.id ? (
                          <Check className="w-4 h-4 text-trust-green" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <Link href={`/f/${funnel.id}`} target="_blank">
                      <Button variant="outline" size="icon" className="rounded-lg">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create New Funnel Card */}
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Funnel className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Create New Funnel</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                  Set up a new review collection funnel for your business
                </p>
                <Button className="rounded-full">Create Funnel</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Funnel Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFunnels.map((funnel) => (
                  <div key={funnel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{funnel.name}</p>
                      <p className="text-sm text-muted-foreground">{funnel.business}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{funnel.views}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{funnel.conversions}</p>
                        <p className="text-xs text-muted-foreground">Reviews</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-trust-green">{funnel.rate}</p>
                        <p className="text-xs text-muted-foreground">Conversion</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
