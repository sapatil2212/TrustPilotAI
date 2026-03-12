"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { Funnel, ExternalLink, Copy, Check, BarChart3, QrCode, TrendingUp, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface FunnelStats {
  businessId: string;
  businessName: string;
  totalSessions: number;
  completedSessions: number;
  conversionRate: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
  recentActivity: {
    date: string;
    sessions: number;
    completions: number;
  }[];
}

interface FunnelData {
  funnels: FunnelStats[];
  totals: {
    totalSessions: number;
    totalCompletions: number;
    overallConversionRate: number;
  };
}

export default function FunnelsPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedFunnel, setSelectedFunnel] = useState<FunnelStats | null>(null);

  const fetchFunnelStats = useCallback(async () => {
    try {
      const response = await fetch('/api/review-funnel/stats');
      if (response.ok) {
        const result = await response.json();
        setData(result);
        if (result.funnels.length > 0 && !selectedFunnel) {
          setSelectedFunnel(result.funnels[0]);
        }
      } else {
        toast.error('Failed to load funnel data');
      }
    } catch (error) {
      console.error('Error fetching funnel stats:', error);
      toast.error('Failed to load funnel data');
    } finally {
      setLoading(false);
    }
  }, [selectedFunnel]);

  useEffect(() => {
    fetchFunnelStats();
  }, [fetchFunnelStats]);

  const handleCopy = (businessId: string) => {
    const url = `${window.location.origin}/review/${businessId}`;
    navigator.clipboard.writeText(url);
    setCopied(businessId);
    toast.success("Funnel URL copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const getReviewUrl = (businessId: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/review/${businessId}`;
    }
    return `/review/${businessId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data || data.funnels.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Review Funnels</h1>
            <p className="text-muted-foreground mt-1">
              Track QR code scans and review conversions
            </p>
          </div>
        </div>
        <EmptyState
          icon={Funnel}
          title="No Active Funnels"
          description="Connect a business and generate a QR code to start collecting reviews through funnels"
        >
          <Link href="/businesses">
            <Button className="mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              Go to Businesses
            </Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  // Format activity data for chart
  const activityChartData = selectedFunnel?.recentActivity.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    scans: item.sessions,
    reviews: item.completions,
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Review Funnels</h1>
          <p className="text-muted-foreground mt-1">
            Track QR code scans and review conversions
          </p>
        </div>
        <Link href="/qr-codes">
          <Button className="rounded-xl gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <QrCode className="w-4 h-4" />
            Manage QR Codes
          </Button>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totals.totalSessions}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total QR Scans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totals.totalCompletions}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reviews Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totals.overallConversionRate}%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funnels" className="w-full">
        <TabsList className="rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
          <TabsTrigger value="funnels" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Active Funnels</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="funnels" className="mt-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.funnels.map((funnel) => (
              <Card key={funnel.businessId} className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f] hover:shadow-soft-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{funnel.businessName}</CardTitle>
                      <CardDescription className="text-gray-500 dark:text-gray-400">Review Funnel</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{funnel.totalSessions}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Scans</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{funnel.completedSessions}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Reviews</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{funnel.conversionRate}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rate</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={getReviewUrl(funnel.businessId)}
                        readOnly
                        className="pr-10 rounded-xl h-11 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                      />
                      <button
                        onClick={() => handleCopy(funnel.businessId)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {copied === funnel.businessId ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <Link href={`/review/${funnel.businessId}`} target="_blank">
                      <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6 space-y-6">
          {/* Business Selector for Analytics */}
          {data.funnels.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {data.funnels.map((funnel) => (
                <Button
                  key={funnel.businessId}
                  variant={selectedFunnel?.businessId === funnel.businessId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFunnel(funnel)}
                  className="rounded-xl"
                >
                  {funnel.businessName}
                </Button>
              ))}
            </div>
          )}

          {selectedFunnel && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Activity Chart */}
              <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Funnel Activity (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activityChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={activityChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--background)', 
                            border: '1px solid var(--border)',
                            borderRadius: '8px'
                          }} 
                        />
                        <Line
                          type="monotone"
                          dataKey="scans"
                          name="QR Scans"
                          stroke="#6366F1"
                          strokeWidth={2}
                          dot={{ fill: "#6366F1", strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="reviews"
                          name="Reviews"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ fill: "#10B981", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-gray-500">
                      No activity data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rating Distribution */}
              <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Rating Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedFunnel.ratingDistribution.some(r => r.count > 0) ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={selectedFunnel.ratingDistribution.map(r => ({
                        rating: `${r.rating}★`,
                        count: r.count,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--background)', 
                            border: '1px solid var(--border)',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-gray-500">
                      No rating data yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f] lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Performance Summary - {selectedFunnel.businessName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-center">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{selectedFunnel.totalSessions}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total QR Scans</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-center">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{selectedFunnel.completedSessions}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reviews Completed</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-center">
                      <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{selectedFunnel.conversionRate}%</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Conversion Rate</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-center">
                      <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{selectedFunnel.averageRating.toFixed(1)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Avg Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
