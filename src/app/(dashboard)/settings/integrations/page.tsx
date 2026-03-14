"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ExternalLink, Building2, MessageSquare, Bell, Webhook, Sparkles, Slack } from "lucide-react";
import { toast } from "sonner";

interface Business {
  id: string;
  businessName: string;
  isConnected: boolean;
  placeId: string | null;
}

interface SlackIntegration {
  id: string;
  teamName: string;
  channelName: string | null;
  isActive: boolean;
  notifyNewReview: boolean;
  notifyNegative: boolean;
  notifyQrScan: boolean;
}

interface WebhookCount {
  total: number;
  active: number;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  connected: boolean;
  configurable: boolean;
  comingSoon: boolean;
  href?: string;
}

export default function IntegrationsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [webhookCount, setWebhookCount] = useState<WebhookCount>({ total: 0, active: 0 });
  const [slackIntegration] = useState<SlackIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [slackDialogOpen, setSlackDialogOpen] = useState(false);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [connectingSlack, setConnectingSlack] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [businessRes, webhookRes] = await Promise.all([
        fetch('/api/business/list'),
        fetch('/api/webhooks'),
      ]);

      if (businessRes.ok) {
        const data = await businessRes.json();
        setBusinesses(data.businesses || []);
      }

      if (webhookRes.ok) {
        const data = await webhookRes.json();
        const webhooks = data.webhooks || [];
        setWebhookCount({
          total: webhooks.length,
          active: webhooks.filter((w: { isActive: boolean }) => w.isActive).length,
        });
      }

      // Check for Slack integration (using webhook URL method for simplicity)
      // In a full implementation, you'd check the SlackIntegration table
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const connectedBusinesses = businesses.filter(b => b.isConnected);
  const hasGoogleConnection = connectedBusinesses.length > 0;

  const handleSlackConnect = async () => {
    if (!slackWebhookUrl.trim()) {
      toast.error("Please enter a Slack webhook URL");
      return;
    }

    // Validate URL format
    if (!slackWebhookUrl.startsWith("https://hooks.slack.com/")) {
      toast.error("Please enter a valid Slack webhook URL");
      return;
    }

    setConnectingSlack(true);
    try {
      // Test the webhook first
      const testResponse = await fetch(slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "🎉 TrustPilotAI connected successfully! You'll receive review notifications here.",
        }),
      });

      if (testResponse.ok) {
        // Create webhook for Slack notifications
        const response = await fetch('/api/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: "Slack Notifications",
            url: slackWebhookUrl,
            events: ["NEW_REVIEW", "NEGATIVE_REVIEW"],
          }),
        });

        if (response.ok) {
          toast.success("Slack connected successfully! Check your channel for a test message.");
          setSlackDialogOpen(false);
          setSlackWebhookUrl("");
          fetchData();
        } else {
          toast.error("Failed to save Slack webhook");
        }
      } else {
        toast.error("Failed to connect to Slack. Please check your webhook URL.");
      }
    } catch (error) {
      console.error('Error connecting Slack:', error);
      toast.error("Failed to connect to Slack");
    } finally {
      setConnectingSlack(false);
    }
  };

  const integrations: Integration[] = [
    {
      id: "google",
      name: "Google Business Profile",
      description: hasGoogleConnection 
        ? `Connected to ${connectedBusinesses.length} business${connectedBusinesses.length > 1 ? 'es' : ''}`
        : "Connect your Google Business Profile to sync reviews",
      icon: Building2,
      connected: hasGoogleConnection,
      configurable: true,
      comingSoon: false,
      href: "/businesses",
    },
    {
      id: "ai",
      name: "AI Reply Generation",
      description: "Powered by Google Gemini for intelligent review responses",
      icon: Sparkles,
      connected: true,
      configurable: false,
      comingSoon: false,
    },
    {
      id: "notifications",
      name: "Email Notifications",
      description: "Get notified about new reviews and AI-generated replies",
      icon: Bell,
      connected: true,
      configurable: false,
      comingSoon: false,
    },
    {
      id: "slack",
      name: "Slack",
      description: slackIntegration 
        ? `Connected to #${slackIntegration.channelName || 'channel'}`
        : "Get notifications in your Slack workspace",
      icon: MessageSquare,
      connected: !!slackIntegration,
      configurable: true,
      comingSoon: false,
    },
    {
      id: "webhook",
      name: "Webhooks",
      description: webhookCount.total > 0 
        ? `${webhookCount.active} of ${webhookCount.total} webhooks active`
        : "Send review data to your own systems",
      icon: Webhook,
      connected: webhookCount.total > 0,
      configurable: true,
      comingSoon: false,
      href: "/settings/webhooks",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Slack Connection Dialog */}
      <Dialog open={slackDialogOpen} onOpenChange={setSlackDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-gray-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Slack className="w-5 h-5" />
              Connect Slack
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Receive review notifications directly in your Slack channel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <h4 className="font-medium text-indigo-900 dark:text-indigo-300 mb-2">How to get your Webhook URL:</h4>
              <ol className="text-sm text-indigo-700 dark:text-indigo-400 space-y-1 list-decimal list-inside">
                <li>Go to your Slack workspace settings</li>
                <li>Navigate to Apps → Incoming Webhooks</li>
                <li>Create a new webhook and select a channel</li>
                <li>Copy the webhook URL and paste it below</li>
              </ol>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slackUrl">Slack Webhook URL</Label>
              <Input
                id="slackUrl"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlackDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSlackConnect}
              disabled={connectingSlack}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {connectingSlack ? "Connecting..." : "Connect Slack"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Integrations */}
      <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
        <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Integrations</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Connect your favorite tools to TrustPilotAI
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <div
                  key={integration.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    integration.comingSoon 
                      ? 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30' 
                      : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      integration.connected 
                        ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        integration.connected 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${integration.comingSoon ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {integration.name}
                        </p>
                        {integration.connected && !integration.comingSoon && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                            <Check className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                        {integration.comingSoon && (
                          <Badge variant="outline" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!integration.comingSoon && (
                      <>
                        <Switch 
                          checked={integration.connected} 
                          disabled={!integration.configurable}
                        />
                        {integration.id === "slack" ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl h-9 px-4 border-gray-200 dark:border-gray-700"
                            onClick={() => setSlackDialogOpen(true)}
                          >
                            {integration.connected ? "Configure" : "Connect"}
                            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        ) : integration.href ? (
                          <Link href={integration.href}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl h-9 px-4 border-gray-200 dark:border-gray-700"
                            >
                              {integration.connected ? "Manage" : "Connect"}
                              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl h-9 px-4 border-gray-200 dark:border-gray-700"
                            disabled
                          >
                            Active
                          </Button>
                        )}
                      </>
                    )}
                    {integration.comingSoon && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled
                        className="rounded-xl h-9 px-4 opacity-50"
                      >
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connected Businesses Details */}
      {connectedBusinesses.length > 0 && (
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Connected Businesses</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Your Google Business Profile connections
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {connectedBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{business.businessName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{business.placeId}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                    <Check className="w-3 h-3 mr-1" />
                    Syncing Reviews
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
