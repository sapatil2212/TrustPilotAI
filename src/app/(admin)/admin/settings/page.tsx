"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Mail, Key, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage system configuration
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Email Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailHost">SMTP Host</Label>
              <Input
                id="emailHost"
                placeholder="smtp.example.com"
                disabled
                value="Configured via ENV"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailPort">SMTP Port</Label>
              <Input
                id="emailPort"
                placeholder="587"
                disabled
                value="Configured via ENV"
              />
            </div>
            <p className="text-xs text-gray-500">
              Email settings are configured via environment variables for security.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-500" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Gemini API</Label>
              <Input disabled value="●●●●●●●●●●●●" />
            </div>
            <div className="space-y-2">
              <Label>SerpAPI</Label>
              <Input disabled value="●●●●●●●●●●●●" />
            </div>
            <p className="text-xs text-gray-500">
              API keys are configured via environment variables for security.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              Application Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Trial Duration</span>
              <span className="text-sm font-medium">14 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Review Sync Interval</span>
              <span className="text-sm font-medium">Every 6 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">AI Provider</span>
              <span className="text-sm font-medium">Google Gemini</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              System Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Clear System Cache
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Run Database Migrations
            </Button>
            <Button variant="outline" className="w-full justify-start text-amber-600 hover:text-amber-700">
              Reset Analytics Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
