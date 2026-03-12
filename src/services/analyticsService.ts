import prisma from '@/lib/prisma';

type SentimentType = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface BusinessAnalyticsData {
  totalReviews: number;
  positiveReviews: number;
  neutralReviews: number;
  negativeReviews: number;
  averageRating: number;
  reviewTrend: { date: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  sentimentDistribution: { sentiment: string; count: number }[];
}

export interface ReviewTrendItem {
  date: string;
  count: number;
}

/**
 * Get or create analytics record for a business
 */
export async function getBusinessAnalytics(businessId: string): Promise<BusinessAnalyticsData> {
  // Try to get cached analytics
  let analytics = await prisma.reviewAnalytics.findUnique({
    where: { businessId },
  });

  // If no analytics exist or outdated, calculate fresh
  if (!analytics) {
    await updateBusinessAnalytics(businessId);
    analytics = await prisma.reviewAnalytics.findUnique({
      where: { businessId },
    });
  }

  // Get review trend for last 30 days
  const reviewTrend = await getReviewTrend(businessId, 30);

  // Get rating distribution
  const ratingDistribution = await getRatingDistribution(businessId);

  // Get sentiment distribution
  const sentimentDistribution = await getSentimentDistribution(businessId);

  return {
    totalReviews: analytics?.totalReviews ?? 0,
    positiveReviews: analytics?.positiveCount ?? 0,
    neutralReviews: analytics?.neutralCount ?? 0,
    negativeReviews: analytics?.negativeCount ?? 0,
    averageRating: analytics?.averageRating ?? 0,
    reviewTrend,
    ratingDistribution,
    sentimentDistribution,
  };
}

/**
 * Update analytics from review data
 */
export async function updateBusinessAnalytics(businessId: string): Promise<void> {
  // Get sentiment counts
  const sentimentCounts = await prisma.review.groupBy({
    by: ['sentiment'],
    where: { businessId },
    _count: { id: true },
  });

  const positiveCount = sentimentCounts.find((s: { sentiment: SentimentType; _count: { id: number } }) => s.sentiment === 'POSITIVE')?._count.id ?? 0;
  const negativeCount = sentimentCounts.find((s: { sentiment: SentimentType; _count: { id: number } }) => s.sentiment === 'NEGATIVE')?._count.id ?? 0;
  const neutralCount = sentimentCounts.find((s: { sentiment: SentimentType; _count: { id: number } }) => s.sentiment === 'NEUTRAL')?._count.id ?? 0;
  const totalReviews = positiveCount + negativeCount + neutralCount;

  // Calculate average rating
  const ratingAgg = await prisma.review.aggregate({
    where: { businessId },
    _avg: { rating: true },
  });

  const averageRating = ratingAgg._avg.rating ?? 0;

  // Upsert analytics record
  await prisma.reviewAnalytics.upsert({
    where: { businessId },
    create: {
      businessId,
      totalReviews,
      positiveCount,
      negativeCount,
      neutralCount,
      averageRating,
    },
    update: {
      totalReviews,
      positiveCount,
      negativeCount,
      neutralCount,
      averageRating,
    },
  });

  // Also update the cached stats on business
  await prisma.business.update({
    where: { id: businessId },
    data: {
      totalReviews,
      averageRating,
    },
  });
}

/**
 * Get review trend over specified days
 */
export async function getReviewTrend(
  businessId: string,
  days: number = 30
): Promise<ReviewTrendItem[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const reviews = await prisma.review.findMany({
    where: {
      businessId,
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by date
  const trendMap = new Map<string, number>();
  
  // Initialize all days with 0
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    trendMap.set(dateStr, 0);
  }

  // Count reviews per day
  for (const review of reviews) {
    const dateStr = review.createdAt.toISOString().split('T')[0];
    trendMap.set(dateStr, (trendMap.get(dateStr) ?? 0) + 1);
  }

  // Convert to array
  return Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

/**
 * Get rating distribution for a business
 */
export async function getRatingDistribution(
  businessId: string
): Promise<{ rating: number; count: number }[]> {
  const distribution = await prisma.review.groupBy({
    by: ['rating'],
    where: { businessId },
    _count: { id: true },
    orderBy: { rating: 'asc' },
  });

  // Ensure all ratings 1-5 are present
  const result: { rating: number; count: number }[] = [];
  for (let rating = 1; rating <= 5; rating++) {
    const found = distribution.find((d: { rating: number; _count: { id: number } }) => d.rating === rating);
    result.push({
      rating,
      count: found?._count.id ?? 0,
    });
  }

  return result;
}

/**
 * Get sentiment distribution for a business
 */
export async function getSentimentDistribution(
  businessId: string
): Promise<{ sentiment: string; count: number }[]> {
  const distribution = await prisma.review.groupBy({
    by: ['sentiment'],
    where: { businessId },
    _count: { id: true },
  });

  return ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(sentiment => ({
    sentiment,
    count: distribution.find((d: { sentiment: SentimentType; _count: { id: number } }) => d.sentiment === sentiment)?._count.id ?? 0,
  }));
}

/**
 * Get analytics summary for admin dashboard
 */
export async function getAdminAnalyticsSummary(): Promise<{
  totalReviews: number;
  avgRating: number;
  positivePercentage: number;
}> {
  const reviews = await prisma.review.aggregate({
    _count: { id: true },
    _avg: { rating: true },
  });

  const positiveCount = await prisma.review.count({
    where: { sentiment: 'POSITIVE' },
  });

  const totalReviews = reviews._count.id;
  const positivePercentage = totalReviews > 0 
    ? Math.round((positiveCount / totalReviews) * 100) 
    : 0;

  return {
    totalReviews,
    avgRating: reviews._avg.rating ?? 0,
    positivePercentage,
  };
}
