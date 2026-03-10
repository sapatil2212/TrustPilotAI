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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your reviews.
          </p>
        </div>
        <Link href="/reviews">
          <Button className="rounded-full gap-2">
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
        <Card>
          <CardHeader>
            <CardTitle>Review Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reviewTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {ratingDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {ratingDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Reviews</CardTitle>
          <Link href="/reviews">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_REVIEWS.slice(0, 4).map((review) => (
              <div
                key={review.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {review.reviewerAvatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{review.reviewerName}</span>
                    <StarRating rating={review.rating} size="sm" />
                    <Badge
                      variant={review.status === "replied" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {review.status === "replied" ? "Replied" : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {review.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {review.status === "pending" && (
                  <Button size="sm" variant="outline" className="shrink-0">
                    <Sparkles className="w-4 h-4 mr-1" />
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
