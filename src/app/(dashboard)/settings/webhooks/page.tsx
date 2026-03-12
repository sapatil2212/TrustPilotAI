"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Webhook, Trash2, TestTube, Copy, Check, AlertCircle, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const WEBHOOK_EVENTS = [
  { id: "NEW_REVIEW", label: "New Review", description: "Triggered when a new review is synced" },
  { id: "REVIEW_REPLIED", label: "Review Replied", description: "Triggered when a review is marked as replied" },
  { id: "QR_SCAN", label: "QR Code Scan", description: "Triggered when someone scans a QR code" },
  { id: "NEGATIVE_REVIEW", label: "Negative Review", description: "Triggered for reviews with low ratings" },
  { id: "AI_REPLY_GENERATED", label: "AI Reply Generated", description: "Triggered when AI generates a reply suggestion" },
];

interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTriggeredAt: string | null;
  failureCount: number;
  createdAt: string;
  secret?: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: [] as string[] });
  const [creating, setCreating] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    try {
      const response = await fetch('/api/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      toast.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleCreate = async () => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (newWebhook.events.length === 0) {
      toast.error("Please select at least one event");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebhook),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Webhook created successfully!");
        setNewSecret(data.webhook.secret);
        setNewWebhook({ name: "", url: "", events: [] });
        fetchWebhooks();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create webhook");
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast.error("Failed to create webhook");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (webhookId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        toast.success(isActive ? "Webhook enabled" : "Webhook disabled");
        fetchWebhooks();
      } else {
        toast.error("Failed to update webhook");
      }
    } catch (error) {
      console.error('Error toggling webhook:', error);
      toast.error("Failed to update webhook");
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Webhook deleted");
        fetchWebhooks();
      } else {
        toast.error("Failed to delete webhook");
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error("Failed to delete webhook");
    }
  };

  const handleTest = async (webhookId: string) => {
    setTesting(webhookId);
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Test successful! Status: ${data.statusCode}`);
      } else {
        toast.error(data.message || "Test failed");
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error("Failed to test webhook");
    } finally {
      setTesting(null);
    }
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopied(secret);
    toast.success("Secret copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleEvent = (eventId: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Secret Display Dialog */}
      <Dialog open={!!newSecret} onOpenChange={() => setNewSecret(null)}>
        <DialogContent className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Webhook Created
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Save your webhook secret - it won&apos;t be shown again!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-sm font-medium">Signing Secret</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newSecret || ""}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => newSecret && copySecret(newSecret)}
              >
                {copied === newSecret ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Use this secret to verify webhook signatures in your application.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setNewSecret(null)} className="rounded-xl">
              I&apos;ve saved the secret
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Webhooks</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Receive real-time notifications when events occur
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger
              render={
                <Button className="rounded-xl gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Plus className="w-4 h-4" />
                  Add Webhook
                </Button>
              }
            />
            <DialogContent className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-gray-800 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create Webhook
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                  Configure a new webhook endpoint
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="My Webhook"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Endpoint URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://your-server.com/webhook"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Events to subscribe</Label>
                  <div className="space-y-2">
                    {WEBHOOK_EVENTS.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50"
                        onClick={() => toggleEvent(event.id)}
                      >
                        <Checkbox
                          checked={newWebhook.events.includes(event.id)}
                          onCheckedChange={() => toggleEvent(event.id)}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{event.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={creating}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {creating ? "Creating..." : "Create Webhook"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="pt-6">
          {webhooks.length === 0 ? (
            <EmptyState
              icon={Webhook}
              title="No Webhooks"
              description="Create a webhook to receive real-time notifications"
            />
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{webhook.name}</h4>
                      {webhook.isActive ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="border-0">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                      {webhook.failureCount > 0 && (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {webhook.failureCount} failures
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {webhook.url}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                    {webhook.lastTriggeredAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        Last triggered: {new Date(webhook.lastTriggeredAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Switch
                      checked={webhook.isActive}
                      onCheckedChange={(checked) => handleToggle(webhook.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(webhook.id)}
                      disabled={testing === webhook.id}
                      className="rounded-lg"
                    >
                      <TestTube className={`w-4 h-4 mr-1 ${testing === webhook.id ? 'animate-pulse' : ''}`} />
                      {testing === webhook.id ? "Testing..." : "Test"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(webhook.id)}
                      className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card className="border-0 shadow-soft bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Webhook Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payload Format</h4>
            <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl text-sm overflow-x-auto">
{`{
  "event": "NEW_REVIEW",
  "timestamp": "2026-03-12T10:30:00Z",
  "data": {
    "review": {
      "id": "...",
      "businessId": "...",
      "reviewerName": "John Doe",
      "rating": 5,
      "reviewText": "Great service!"
    }
  }
}`}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Signature Verification</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              All webhooks include a signature header <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">X-TrustPilotAI-Signature</code> for verification.
            </p>
            <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl text-sm overflow-x-auto">
{`// Node.js example
const crypto = require('crypto');

function verifySignature(payload, header, secret) {
  const [timestamp, signature] = header.split(',').map(part => part.split('=')[1]);
  const expected = crypto
    .createHmac('sha256', secret)
    .update(\`\${timestamp}.\${JSON.stringify(payload)}\`)
    .digest('hex');
  return signature === expected;
}`}
            </pre>
          </div>
          <a
            href="https://docs.trustpilotai.com/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            View full documentation
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
