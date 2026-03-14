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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Key, Trash2, Copy, Check, AlertTriangle, Clock, Shield } from "lucide-react";
import { toast } from "sonner";

const API_PERMISSIONS = [
  { id: "reviews:read", label: "Read Reviews", description: "Access to view reviews" },
  { id: "reviews:write", label: "Write Reviews", description: "Ability to update review status" },
  { id: "businesses:read", label: "Read Businesses", description: "Access to view business data" },
  { id: "businesses:write", label: "Write Businesses", description: "Ability to modify businesses" },
  { id: "analytics:read", label: "Read Analytics", description: "Access to analytics data" },
  { id: "ai:generate", label: "AI Generation", description: "Generate AI replies" },
];

const EXPIRY_OPTIONS = [
  { value: "never", label: "Never expires" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "1y", label: "1 year" },
];

interface ApiKeyData {
  id: string;
  name: string;
  keyPrefix: string;
  key?: string; // Only present on creation
  permissions: string[];
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState({ name: "", permissions: [] as string[], expiresIn: "never" });
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchApiKeys = useCallback(async () => {
    try {
      const response = await fetch('/api/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleCreate = async () => {
    if (!newKey.name.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    if (newKey.permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKey.name,
          permissions: newKey.permissions,
          expiresIn: newKey.expiresIn === "never" ? null : newKey.expiresIn,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedKey(data.apiKey.key);
        setNewKey({ name: "", permissions: [], expiresIn: "never" });
        fetchApiKeys();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create API key");
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (keyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        toast.success(isActive ? "API key enabled" : "API key disabled");
        fetchApiKeys();
      } else {
        toast.error("Failed to update API key");
      }
    } catch (error) {
      console.error('Error toggling API key:', error);
      toast.error("Failed to update API key");
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("API key revoked");
        fetchApiKeys();
      } else {
        toast.error("Failed to revoke API key");
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error("Failed to revoke API key");
    }
  };

  const copyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      toast.success("API key copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const togglePermission = (permId: string) => {
    setNewKey(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
      {/* Key Created Dialog */}
      <Dialog open={!!createdKey} onOpenChange={() => setCreatedKey(null)}>
        <DialogContent className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-gray-800 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-green-500" />
              API Key Created
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Make sure to copy your API key now. You won&apos;t be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  This is the only time you&apos;ll see this key. Store it securely!
                </p>
              </div>
            </div>
            <Label className="text-sm font-medium">Your API Key</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={createdKey || ""}
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={copyKey}>
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreatedKey(null)} className="rounded-xl">
              I&apos;ve saved the key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Keys List */}
      <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Manage API keys for programmatic access
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger
              render={
                <Button className="rounded-xl gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Plus className="w-4 h-4" />
                  Generate Key
                </Button>
              }
            />
            <DialogContent className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-gray-800 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generate API Key
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                  Create a new API key with specific permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="Production API Key"
                    value={newKey.name}
                    onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiration</Label>
                  <Select 
                    value={newKey.expiresIn} 
                    onValueChange={(v) => v && setNewKey({ ...newKey, expiresIn: v })}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    {API_PERMISSIONS.map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50"
                        onClick={() => togglePermission(perm.id)}
                      >
                        <Checkbox
                          checked={newKey.permissions.includes(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{perm.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{perm.description}</p>
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
                  {creating ? "Generating..." : "Generate Key"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="pt-6">
          {apiKeys.length === 0 ? (
            <EmptyState
              icon={Key}
              title="No API Keys"
              description="Generate an API key to access the TrustPilotAI API"
            />
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{apiKey.name}</h4>
                      {apiKey.isActive && !isExpired(apiKey.expiresAt) ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                          Active
                        </Badge>
                      ) : isExpired(apiKey.expiresAt) ? (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                          <Clock className="w-3 h-3 mr-1" />
                          Expired
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="border-0">
                          Disabled
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {apiKey.keyPrefix}...
                      </code>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {apiKey.permissions.map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          {perm}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {apiKey.lastUsedAt && (
                        <span>Last used: {new Date(apiKey.lastUsedAt).toLocaleDateString()}</span>
                      )}
                      {apiKey.expiresAt && (
                        <span>Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}</span>
                      )}
                      <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Switch
                      checked={apiKey.isActive}
                      onCheckedChange={(checked) => handleToggle(apiKey.id, checked)}
                      disabled={isExpired(apiKey.expiresAt)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(apiKey.id)}
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

      {/* API Documentation Preview */}
      <Card className="border-0 shadow-soft bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Authentication</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Include your API key in the Authorization header:
            </p>
            <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl text-sm overflow-x-auto">
{`curl -X GET https://api.trustpilotai.com/v1/reviews \\
  -H "Authorization: Bearer tpai_your_api_key_here"`}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Example Response</h4>
            <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "...",
        "rating": 5,
        "reviewerName": "John D.",
        "reviewText": "Great service!",
        "sentiment": "POSITIVE"
      }
    ]
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
