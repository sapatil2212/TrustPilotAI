import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface StatsRecord {
  id: string;
  date: Date;
  aiRequestCount: number;
  reviewFetchCount: number;
  qrScanCount: number;
  apiCallCount: number;
  createdAt: Date;
}

export interface SystemStatsData {
  aiRequestCount: number;
  reviewFetchCount: number;
  qrScanCount: number;
  apiCallCount: number;
  date: Date;
}

export interface AggregatedStats {
  totalAIRequests: number;
  totalReviewFetches: number;
  totalQRScans: number;
  totalAPICalls: number;
  todayStats: SystemStatsData | null;
  last7DaysStats: SystemStatsData[];
}

/**
 * Get or create today's stats record with proper race condition handling.
 * Uses a try-catch pattern to handle P2002 unique constraint errors
 * that can occur when multiple concurrent requests try to create the same record.
 */
async function getOrCreateTodayStats(): Promise<{ id: string }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Try upsert first - this will work in most cases
    const stats = await prisma.systemStats.upsert({
      where: { date: today },
      update: {}, // No update needed, just return the existing record
      create: { date: today },
      select: { id: true },
    });
    return stats;
  } catch (error) {
    // Handle P2002 race condition: another request created the record between
    // the time we checked and tried to insert
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // Record was created by another concurrent request, fetch it
      const existing = await prisma.systemStats.findUnique({
        where: { date: today },
        select: { id: true },
      });
      if (existing) {
        return existing;
      }
    }
    // Re-throw if it's a different error or record still not found
    throw error;
  }
}

/**
 * Increment AI request count
 */
export async function incrementAIRequests(count: number = 1): Promise<void> {
  try {
    const stats = await getOrCreateTodayStats();
    await prisma.systemStats.update({
      where: { id: stats.id },
      data: { aiRequestCount: { increment: count } },
    });
  } catch (error) {
    // Log error but don't fail the request - stats tracking is not critical
    console.warn('Failed to increment AI requests:', error);
  }
}

/**
 * Increment review fetch count
 */
export async function incrementReviewFetches(count: number = 1): Promise<void> {
  try {
    const stats = await getOrCreateTodayStats();
    await prisma.systemStats.update({
      where: { id: stats.id },
      data: { reviewFetchCount: { increment: count } },
    });
  } catch (error) {
    console.warn('Failed to increment review fetches:', error);
  }
}

/**
 * Increment QR scan count
 */
export async function incrementQRScans(count: number = 1): Promise<void> {
  try {
    const stats = await getOrCreateTodayStats();
    await prisma.systemStats.update({
      where: { id: stats.id },
      data: { qrScanCount: { increment: count } },
    });
  } catch (error) {
    console.warn('Failed to increment QR scans:', error);
  }
}

/**
 * Increment API call count
 */
export async function incrementAPICalls(count: number = 1): Promise<void> {
  try {
    const stats = await getOrCreateTodayStats();
    await prisma.systemStats.update({
      where: { id: stats.id },
      data: { apiCallCount: { increment: count } },
    });
  } catch (error) {
    console.warn('Failed to increment API calls:', error);
  }
}

/**
 * Get today's stats
 */
export async function getTodayStats(): Promise<SystemStatsData | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await prisma.systemStats.findUnique({
    where: { date: today },
  });

  if (!stats) return null;

  return {
    aiRequestCount: stats.aiRequestCount,
    reviewFetchCount: stats.reviewFetchCount,
    qrScanCount: stats.qrScanCount,
    apiCallCount: stats.apiCallCount,
    date: stats.date,
  };
}

/**
 * Get stats for the last N days
 */
export async function getStatsForLastDays(days: number = 7): Promise<SystemStatsData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const stats = await prisma.systemStats.findMany({
    where: { date: { gte: startDate } },
    orderBy: { date: 'desc' },
  });

  return stats.map((s: StatsRecord) => ({
    aiRequestCount: s.aiRequestCount,
    reviewFetchCount: s.reviewFetchCount,
    qrScanCount: s.qrScanCount,
    apiCallCount: s.apiCallCount,
    date: s.date,
  }));
}

/**
 * Get aggregated system stats for admin dashboard
 */
export async function getSystemStats(): Promise<AggregatedStats> {
  // Get all-time totals
  const totals = await prisma.systemStats.aggregate({
    _sum: {
      aiRequestCount: true,
      reviewFetchCount: true,
      qrScanCount: true,
      apiCallCount: true,
    },
  });

  // Get today's stats
  const todayStats = await getTodayStats();

  // Get last 7 days stats
  const last7DaysStats = await getStatsForLastDays(7);

  return {
    totalAIRequests: totals._sum.aiRequestCount ?? 0,
    totalReviewFetches: totals._sum.reviewFetchCount ?? 0,
    totalQRScans: totals._sum.qrScanCount ?? 0,
    totalAPICalls: totals._sum.apiCallCount ?? 0,
    todayStats,
    last7DaysStats,
  };
}

/**
 * Get stats for a specific date range
 */
export async function getStatsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<SystemStatsData[]> {
  const stats = await prisma.systemStats.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
  });

  return stats.map((s: StatsRecord) => ({
    aiRequestCount: s.aiRequestCount,
    reviewFetchCount: s.reviewFetchCount,
    qrScanCount: s.qrScanCount,
    apiCallCount: s.apiCallCount,
    date: s.date,
  }));
}

/**
 * Clean up old stats (keep last 90 days)
 */
export async function cleanupOldStats(): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  cutoffDate.setHours(0, 0, 0, 0);

  const result = await prisma.systemStats.deleteMany({
    where: { date: { lt: cutoffDate } },
  });

  return result.count;
}
