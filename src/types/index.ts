export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "owner" | "admin" | "member";
  createdAt: Date;
}

export interface Business {
  id: string;
  name: string;
  location: string;
  rating: number;
  totalReviews: number;
  googlePlaceId?: string;
  logo?: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  businessId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  text: string;
  reply?: string;
  repliedAt?: Date;
  createdAt: Date;
  status: "pending" | "replied" | "flagged";
  sentiment: "positive" | "neutral" | "negative";
}

export interface TrialState {
  isActive: boolean;
  daysRemaining: number;
  startDate: Date;
  endDate: Date;
  plan: "starter" | "growth" | "agency";
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
}

export interface AIReply {
  id: string;
  reviewId: string;
  suggestedReply: string;
  tone: "professional" | "friendly" | "short" | "detailed";
  generatedAt: Date;
  accepted: boolean;
}

export interface AnalyticsData {
  totalReviews: number;
  averageRating: number;
  responseRate: number;
  newReviewsThisWeek: number;
  positiveReviews: number;
  negativeReviews: number;
  reviewTrend: { date: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  sentimentData: { name: string; value: number }[];
  keywords: { word: string; count: number }[];
}
