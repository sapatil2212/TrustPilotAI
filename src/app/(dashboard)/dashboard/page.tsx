"use client";

import { StatCard } from "@/components/shared/stat-card";
import { StarRating } from "@/components/shared/star-rating";
import { TrialBanner } from "@/components/trial/trial-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Star,
  TrendingUp,
  Reply,
  Sparkles,
  ArrowRight,
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
import { MOCK_REVIEWS } from "@/lib/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";

const reviewTrendData = [
  { date: "Mon", count: 4 },
  { date: "Tue", count: 6 },
  { date: "Wed", count: 8 },
  { date: "Thu", count: 5 },
  { date: "Fri", count: 9 },
  { date: "Sat", count: 7 },
  { date: "Sun", count: 6 },
];

const ratingDistribution = [
  { name: "5 Stars", value: 65, color: "#10B981" },
  { name: "4 Stars", value: 20, color: "#3B82F6" },
  { name: "3 Stars", value: 10, color: "#F59E0B" },
  { name: "2 Stars", value: 3, color: "#EF4444" },
  { name: "1 Star", value: 2, color: "#DC2626" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Welcome back! Here&apos;s what&apos;s happening with your reviews.
          </p>
        </div>
        <Link href="/reviews">
          <Button className="rounded-xl gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 h-11">
            <Sparkles className="w-4 h-4" />
            Generate AI Reply
          </Button>
        </Link>
      </div>

      <TrialBanner />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reviews"
          value="1,284"
          description="All time reviews"
          icon={MessageSquare}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Average Rating"
          value="4.6"
          description="Out of 5 stars"
          icon={Star}
          trend={{ value: 0.3, isPositive: true }}
        />
        <StatCard
          title="New This Week"
          value="45"
          description="+8 from last week"
          icon={TrendingUp}
          trend={{ value: 21, isPositive: true }}
        />
        <StatCard
          title="Response Rate"
          value="92%"
          description="Industry avg: 65%"
          icon={Reply}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Review Growth Chart */}
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Review Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reviewTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      padding: "12px",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      padding: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4">
              {ratingDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card className="border-0 shadow-soft bg-white dark:bg-[#1a1a1f]">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reviews</CardTitle>
          <Link href="/reviews">
            <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_REVIEWS.slice(0, 4).map((review) => (
              <div
                key={review.id}
                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              >
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium">
                    {review.reviewerAvatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{review.reviewerName}</span>
                    <StarRating rating={review.rating} size="sm" />
                    <Badge
                      variant={review.status === "replied" ? "secondary" : "outline"}
                      className={cn(
                        "text-xs",
                        review.status === "replied" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0" 
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0"
                      )}
                    >
                      {review.status === "replied" ? "Replied" : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {review.text}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {review.status === "pending" && (
                  <Button size="sm" variant="outline" className="shrink-0 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
