"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
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
  BarChart,
  Bar,
} from "recharts";
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

interface AnalyticsData {
  totalReviews: number;
  positiveReviews: number;
  neutralReviews: number;
  negativeReviews: number;
  averageRating: number;
  reviewTrend: { date: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  sentimentDistribution: { sentiment: string; count: number }[];
}

const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: "#10B981",
  NEUTRAL: "#F59E0B", 
  NEGATIVE: "#EF4444",
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/business/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6 animate-fade-in">
        <EmptyState
          icon={AlertCircle}
          title="Unable to Load Analytics"
          description={error || "Please connect your business first to view analytics"}
        />
      </div>
    );
  }

  const sentimentData = analytics.sentimentDistribution.map(item => ({
    name: item.sentiment,
    value: item.count,
    color: SENTIMENT_COLORS[item.sentiment] || "#6B7280",
  }));

  const ratingData = analytics.ratingDistribution.map(item => ({
    rating: `${item.rating}★`,
    count: item.count,
  }));

  // Format trend data for chart
  const trendData = analytics.reviewTrend.slice(-14).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    reviews: item.count,
  }));

  const totalSentiment = analytics.positiveReviews + analytics.neutralReviews + analytics.negativeReviews;
  const positivePercentage = totalSentiment > 0 
    ? Math.round((analytics.positiveReviews / totalSentiment) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Review performance insights and trends
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reviews"
          value={analytics.totalReviews}
          icon={MessageSquare}
          trend={analytics.totalReviews > 0 ? { value: analytics.totalReviews, isPositive: true } : undefined}
        />
        <StatCard
          title="Average Rating"
          value={analytics.averageRating.toFixed(1)}
          icon={Star}
          trend={analytics.averageRating >= 4 ? { value: analytics.averageRating, isPositive: true } : undefined}
        />
        <StatCard
          title="Positive Reviews"
          value={analytics.positiveReviews}
          icon={ThumbsUp}
          trend={{ value: positivePercentage, isPositive: positivePercentage >= 70 }}
          description={`${positivePercentage}% of total`}
        />
        <StatCard
          title="Negative Reviews"
          value={analytics.negativeReviews}
          icon={ThumbsDown}
          trend={analytics.negativeReviews > 0 ? { value: analytics.negativeReviews, isPositive: false } : undefined}
        />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Review Trend Chart */}
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Review Trend (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
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
                    dataKey="reviews"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={{ fill: "#6366F1", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No review data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalSentiment > 0 ? (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {sentimentData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                No sentiment data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f] lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.totalReviews > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ratingData}>
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
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No rating data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
