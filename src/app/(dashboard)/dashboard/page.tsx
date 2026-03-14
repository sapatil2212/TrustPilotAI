"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { StatCard } from "@/components/shared/stat-card";
import { StarRating } from "@/components/shared/star-rating";
import { TrialBanner } from "@/components/trial/trial-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Star,
  TrendingUp,
  Reply,
  Sparkles,
  ArrowRight,
  Building2,
  QrCode,
  ExternalLink,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BusinessProfile {
  id: string;
  businessName: string;
  businessType: string;
  placeId: string | null;
  reviewLink: string | null;
  qrCodeUrl: string | null;
  isConnected: boolean;
  totalReviews: number;
  averageRating: number;
}

interface Analytics {
  totalReviews: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  averageRating: number;
  reviewTrend: { date: string; count: number }[];
}

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  reviewText: string;
  sentiment: string;
  isReplied: boolean;
  reviewDate: string;
}

const RATING_COLORS = {
  5: "#10B981",
  4: "#3B82F6",
  3: "#F59E0B",
  2: "#EF4444",
  1: "#DC2626",
};

export default function DashboardPage() {
  useSession();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [connectDialog, setConnectDialog] = useState(false);
  const [placeId, setPlaceId] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch business profile with cache-busting for fresh data
      const profileRes = await fetch("/api/business/profile", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setBusiness(profileData.business);

        // If business is connected, fetch analytics and reviews in parallel
        if (profileData.business?.isConnected) {
          const [analyticsRes, reviewsRes] = await Promise.all([
            fetch("/api/business/analytics", { cache: "no-store" }),
            fetch(`/api/reviews/business/${profileData.business.id}?limit=5`, {
              cache: "no-store",
            }),
          ]);

          // Process responses in parallel
          const [analyticsData, reviewsData] = await Promise.all([
            analyticsRes.ok ? analyticsRes.json() : Promise.resolve(null),
            reviewsRes.ok ? reviewsRes.json() : Promise.resolve({ reviews: [] }),
          ]);

          if (analyticsData) setAnalytics(analyticsData);
          setReviews(reviewsData.reviews || []);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectBusiness = async () => {
    if (!placeId.trim()) {
      toast.error("Please enter a Place ID");
      return;
    }

    setConnecting(true);
    try {
      const response = await fetch("/api/business/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          placeId: placeId.trim(),
          businessName: business?.businessName || undefined,
        }),
      });

      if (response.ok) {
        toast.success("Business connected successfully!");
        setConnectDialog(false);
        setPlaceId("");
        fetchDashboardData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to connect business");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setConnecting(false);
    }
  };

  const handleGenerateQR = async () => {
    setGeneratingQR(true);
    try {
      const response = await fetch("/api/business/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "both" }),
      });

      if (response.ok) {
        toast.success("QR code generated successfully!");
        fetchDashboardData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to generate QR code");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setGeneratingQR(false);
    }
  };

  // Calculate rating distribution for chart
  const getRatingDistribution = () => {
    if (!analytics) return [];
    const total = analytics.totalReviews || 1;
    return [
      { name: "5 Stars", value: Math.round((analytics.positiveCount / total) * 100), color: RATING_COLORS[5] },
      { name: "4 Stars", value: 20, color: RATING_COLORS[4] },
      { name: "3 Stars", value: Math.round((analytics.neutralCount / total) * 100), color: RATING_COLORS[3] },
      { name: "2 Stars", value: 5, color: RATING_COLORS[2] },
      { name: "1 Star", value: Math.round((analytics.negativeCount / total) * 100), color: RATING_COLORS[1] },
    ];
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Show connect business prompt if not connected
  if (!business?.isConnected) {
    return (
      <div className="space-y-8 animate-fade-in">
        <TrialBanner />
        
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="max-w-lg w-full border-0 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connect Your Business
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Connect your business with Google Place ID to start collecting reviews and generating AI replies.
              </p>
              
              {business && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Business:</span> {business.businessName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Type:</span> {business.businessType?.replace(/_/g, " ")}
                  </p>
                </div>
              )}

              <Dialog open={connectDialog} onOpenChange={setConnectDialog}>
                <DialogTrigger
                  render={
                    <Button className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl">
                      <Building2 className="w-5 h-5 mr-2" />
                      Connect with Place ID
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect Your Business</DialogTitle>
                    <DialogDescription>
                      Enter your Google Place ID to connect your business and enable review collection.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="placeId">Google Place ID</Label>
                      <Input
                        id="placeId"
                        placeholder="ChIJ..."
                        value={placeId}
                        onChange={(e) => setPlaceId(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Find your Place ID at{" "}
                        <a
                          href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Google Place ID Finder
                        </a>
                      </p>
                    </div>
                    <Button
                      onClick={handleConnectBusiness}
                      disabled={connecting}
                      className="w-full"
                    >
                      {connecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect Business"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Welcome back! Here&apos;s what&apos;s happening with your reviews.
          </p>
        </div>
        <div className="flex gap-2">
          {!business.qrCodeUrl ? (
            <Button
              onClick={handleGenerateQR}
              disabled={generatingQR}
              className="rounded-xl gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {generatingQR ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4" />
              )}
              Generate QR Code
            </Button>
          ) : (
            <Link href="/qr-codes">
              <Button variant="outline" className="rounded-xl gap-2">
                <QrCode className="w-4 h-4" />
                View QR Code
              </Button>
            </Link>
          )}
          <Link href="/reviews">
            <Button className="rounded-xl gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 h-11">
              <Sparkles className="w-4 h-4" />
              Generate AI Reply
            </Button>
          </Link>
        </div>
      </div>

      <TrialBanner />

      {/* Business Info Card */}
      <Card className="border-0 shadow-soft bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {business.businessName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Connected to Google
                </p>
              </div>
            </div>
            {business.reviewLink && (
              <a
                href={business.reviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View on Google
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reviews"
          value={analytics?.totalReviews?.toString() || "0"}
          description="All time reviews"
          icon={MessageSquare}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Average Rating"
          value={analytics?.averageRating?.toFixed(1) || "0.0"}
          description="Out of 5 stars"
          icon={Star}
          trend={{ value: 0.3, isPositive: true }}
        />
        <StatCard
          title="Positive Reviews"
          value={analytics?.positiveCount?.toString() || "0"}
          description={`${analytics ? Math.round((analytics.positiveCount / (analytics.totalReviews || 1)) * 100) : 0}% of total`}
          icon={TrendingUp}
          trend={{ value: 21, isPositive: true }}
        />
        <StatCard
          title="Response Rate"
          value={`${reviews.length > 0 ? Math.round((reviews.filter(r => r.isReplied).length / reviews.length) * 100) : 0}%`}
          description="Reviews replied"
          icon={Reply}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Review Growth Chart */}
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Review Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] sm:h-[300px]">
              {analytics?.reviewTrend && analytics.reviewTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.reviewTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        padding: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No review data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] sm:h-[260px]">
              {analytics?.totalReviews && analytics.totalReviews > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getRatingDistribution()}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {getRatingDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No rating data yet
                </div>
              )}
            </div>
            {analytics?.totalReviews && analytics.totalReviews > 0 && (
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4">
                {getRatingDistribution().map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Reviews
          </CardTitle>
          <Link href="/reviews">
            <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 dark:text-indigo-400">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
                >
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium">
                      {review.reviewerName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {review.reviewerName}
                      </span>
                      <StarRating rating={review.rating} size="sm" />
                      <Badge
                        variant={review.isReplied ? "secondary" : "outline"}
                        className={cn(
                          "text-xs",
                          review.isReplied
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0"
                        )}
                      >
                        {review.isReplied ? "Replied" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {review.reviewText}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(review.reviewDate).toLocaleDateString()}
                    </p>
                  </div>
                  {!review.isReplied && (
                    <Link href={`/reviews?id=${review.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 rounded-lg border-gray-200 dark:border-gray-700"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Reply
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No reviews yet</p>
              <p className="text-sm">Reviews will appear here once customers start reviewing your business</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
