"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

const mockApiKeys = [
  { id: "1", name: "Production API Key", key: "tp_live_xxxxxxxxxxxx", created: "2026-01-15", lastUsed: "2 hours ago" },
];

export default function ApiKeysPage() {
  const [showKey, setShowKey] = useState<string | null>(null);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage API keys for accessing the TrustPilotAI API
            </CardDescription>
          </div>
          <Button className="rounded-full gap-2">
            <Plus className="w-4 h-4" />
            Generate Key
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockApiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{apiKey.name}</p>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created {apiKey.created} • Last used {apiKey.lastUsed}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <code className="text-sm font-mono">
                      {showKey === apiKey.id ? apiKey.key : "tp_live_••••••••••••"}
                    </code>
                    <button
                      onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showKey === apiKey.id ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(apiKey.key)}
                    className="rounded-full"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-destructive hover:text-destructive"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to integrate with our API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg">
            <code className="text-sm font-mono block">
              curl https://api.trustpilotai.com/v1/reviews \\n              <br />
              &nbsp;&nbsp;-H &quot;Authorization: Bearer tp_live_xxxxxxxxxxxx&quot;
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
