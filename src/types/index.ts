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

// New types for role-based dashboard

export interface ReviewFunnelSession {
  id: string;
  businessId: string;
  ratingSelected: number | null;
  aiReviewGenerated: string | null;
  redirectedToGoogle: boolean;
  createdAt: Date;
}

export interface ReviewAnalytics {
  id: string;
  businessId: string;
  totalReviews: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  averageRating: number;
  updatedAt: Date;
}

export interface SystemStats {
  id: string;
  date: Date;
  aiRequestCount: number;
  reviewFetchCount: number;
  qrScanCount: number;
  apiCallCount: number;
}

export interface AdminOverview {
  totalUsers: number;
  totalBusinesses: number;
  activeTrials: number;
  expiredTrials: number;
  totalReviewsFetched: number;
}

export interface AdminUserView {
  id: string;
  name: string;
  email: string;
  businessName: string | null;
  trialEndsAt: Date;
  trialStatus: 'active' | 'expired';
  trialDaysRemaining: number;
  isActive: boolean;
  createdAt: Date;
}

export interface AdminBusinessView {
  id: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  placeId: string;
  totalReviews: number;
  averageRating: number;
  createdAt: Date;
}

export interface BusinessAnalytics {
  totalReviews: number;
  positiveReviews: number;
  neutralReviews: number;
  negativeReviews: number;
  averageRating: number;
  reviewTrend: { date: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  sentimentDistribution: { sentiment: string; count: number }[];
}

export interface FunnelStats {
  totalSessions: number;
  completedSessions: number;
  conversionRate: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
}

export type NotificationType = 'GENERAL' | 'NEW_REVIEW' | 'TRIAL_EXPIRY_WARNING' | 'AI_REPLY_READY';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}
