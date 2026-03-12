import prisma from '@/lib/prisma';
import * as systemStats from './systemStatsService';

export interface FunnelSession {
  id: string;
  businessId: string;
  ratingSelected: number | null;
  aiReviewGenerated: string | null;
  redirectedToGoogle: boolean;
  createdAt: Date;
}

export interface FunnelStats {
  totalSessions: number;
  completedSessions: number;
  conversionRate: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
}

/**
 * Create a new funnel session when customer scans QR
 */
export async function createFunnelSession(businessId: string): Promise<FunnelSession> {
  // Track QR scan
  await systemStats.incrementQRScans();

  const session = await prisma.reviewFunnelSession.create({
    data: {
      businessId,
    },
  });

  return session;
}

/**
 * Update session with selected rating
 */
export async function updateSessionRating(
  sessionId: string,
  rating: number
): Promise<FunnelSession> {
  const session = await prisma.reviewFunnelSession.update({
    where: { id: sessionId },
    data: { ratingSelected: rating },
  });

  return session;
}

/**
 * Update session with AI-generated review text
 */
export async function updateSessionAIReview(
  sessionId: string,
  aiReview: string
): Promise<FunnelSession> {
  const session = await prisma.reviewFunnelSession.update({
    where: { id: sessionId },
    data: { aiReviewGenerated: aiReview },
  });

  return session;
}

/**
 * Mark session as redirected to Google
 */
export async function markRedirectedToGoogle(sessionId: string): Promise<FunnelSession> {
  const session = await prisma.reviewFunnelSession.update({
    where: { id: sessionId },
    data: { redirectedToGoogle: true },
  });

  return session;
}

/**
 * Get a single funnel session by ID
 */
export async function getFunnelSession(sessionId: string): Promise<FunnelSession | null> {
  return prisma.reviewFunnelSession.findUnique({
    where: { id: sessionId },
  });
}

/**
 * Get funnel statistics for a business
 */
export async function getFunnelStats(businessId: string): Promise<FunnelStats> {
  // Total sessions
  const totalSessions = await prisma.reviewFunnelSession.count({
    where: { businessId },
  });

  // Completed sessions (redirected to Google)
  const completedSessions = await prisma.reviewFunnelSession.count({
    where: {
      businessId,
      redirectedToGoogle: true,
    },
  });

  // Average rating from sessions
  const ratingAgg = await prisma.reviewFunnelSession.aggregate({
    where: {
      businessId,
      ratingSelected: { not: null },
    },
    _avg: { ratingSelected: true },
  });

  // Rating distribution
  const ratingGroups = await prisma.reviewFunnelSession.groupBy({
    by: ['ratingSelected'],
    where: {
      businessId,
      ratingSelected: { not: null },
    },
    _count: { id: true },
  });

  // Ensure all ratings 1-5 are present
  const ratingDistribution: { rating: number; count: number }[] = [];
  for (let rating = 1; rating <= 5; rating++) {
    const found = ratingGroups.find(
      (g: { ratingSelected: number | null; _count: { id: number } }) => g.ratingSelected === rating
    );
    ratingDistribution.push({
      rating,
      count: found?._count.id ?? 0,
    });
  }

  const conversionRate = totalSessions > 0
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0;

  return {
    totalSessions,
    completedSessions,
    conversionRate,
    averageRating: ratingAgg._avg.ratingSelected ?? 0,
    ratingDistribution,
  };
}

/**
 * Get recent funnel sessions for a business
 */
export async function getRecentFunnelSessions(
  businessId: string,
  limit: number = 10
): Promise<FunnelSession[]> {
  return prisma.reviewFunnelSession.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get funnel sessions within a date range
 */
export async function getFunnelSessionsByDateRange(
  businessId: string,
  startDate: Date,
  endDate: Date
): Promise<FunnelSession[]> {
  return prisma.reviewFunnelSession.findMany({
    where: {
      businessId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Clean up old incomplete sessions (older than 24 hours)
 */
export async function cleanupIncompleteSessions(): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - 24);

  const result = await prisma.reviewFunnelSession.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      redirectedToGoogle: false,
    },
  });

  return result.count;
}
