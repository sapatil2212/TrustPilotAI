import { NextRequest } from 'next/server';
import { requireActiveSubscription, successResponse, errorResponse } from '@/lib/session';
import prisma from '@/lib/prisma';

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

// GET /api/review-funnel/stats - Get funnel statistics for all user's businesses
export async function GET(request: NextRequest) {
  try {
    const { error, auth } = await requireActiveSubscription();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    // Get all businesses for the user
    const businesses = await prisma.business.findMany({
      where: { 
        userId: auth.user.id,
        isConnected: true,
      },
      select: {
        id: true,
        businessName: true,
      },
    });

    if (businesses.length === 0) {
      return successResponse({
        funnels: [],
        totals: {
          totalSessions: 0,
          totalCompletions: 0,
          overallConversionRate: 0,
        },
      });
    }

    const funnelStats: FunnelStats[] = [];
    let totalSessionsAll = 0;
    let totalCompletionsAll = 0;

    for (const business of businesses) {
      // Get session counts
      const [totalSessions, completedSessions] = await Promise.all([
        prisma.reviewFunnelSession.count({
          where: { businessId: business.id },
        }),
        prisma.reviewFunnelSession.count({
          where: { 
            businessId: business.id,
            redirectedToGoogle: true,
          },
        }),
      ]);

      // Get average rating from sessions that selected a rating
      const ratingAgg = await prisma.reviewFunnelSession.aggregate({
        where: {
          businessId: business.id,
          ratingSelected: { not: null },
        },
        _avg: { ratingSelected: true },
      });

      // Get rating distribution
      const ratingGroups = await prisma.reviewFunnelSession.groupBy({
        by: ['ratingSelected'],
        where: {
          businessId: business.id,
          ratingSelected: { not: null },
        },
        _count: { id: true },
      });

      // Build rating distribution array (1-5)
      const ratingDistribution: { rating: number; count: number }[] = [];
      for (let rating = 1; rating <= 5; rating++) {
        const found = ratingGroups.find(g => g.ratingSelected === rating);
        ratingDistribution.push({
          rating,
          count: found?._count.id ?? 0,
        });
      }

      // Get activity for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const recentSessions = await prisma.reviewFunnelSession.findMany({
        where: {
          businessId: business.id,
          createdAt: { gte: sevenDaysAgo },
        },
        select: {
          createdAt: true,
          redirectedToGoogle: true,
        },
      });

      // Group by date
      const activityMap = new Map<string, { sessions: number; completions: number }>();
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        activityMap.set(dateStr, { sessions: 0, completions: 0 });
      }

      recentSessions.forEach(session => {
        const dateStr = session.createdAt.toISOString().split('T')[0];
        const activity = activityMap.get(dateStr);
        if (activity) {
          activity.sessions++;
          if (session.redirectedToGoogle) {
            activity.completions++;
          }
        }
      });

      const recentActivity = Array.from(activityMap.entries())
        .map(([date, data]) => ({
          date,
          sessions: data.sessions,
          completions: data.completions,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const conversionRate = totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0;

      funnelStats.push({
        businessId: business.id,
        businessName: business.businessName,
        totalSessions,
        completedSessions,
        conversionRate,
        averageRating: ratingAgg._avg.ratingSelected ?? 0,
        ratingDistribution,
        recentActivity,
      });

      totalSessionsAll += totalSessions;
      totalCompletionsAll += completedSessions;
    }

    const overallConversionRate = totalSessionsAll > 0
      ? Math.round((totalCompletionsAll / totalSessionsAll) * 100)
      : 0;

    return successResponse({
      funnels: funnelStats,
      totals: {
        totalSessions: totalSessionsAll,
        totalCompletions: totalCompletionsAll,
        overallConversionRate,
      },
    });
  } catch (error) {
    console.error('Funnel stats error:', error);
    return errorResponse('Failed to fetch funnel statistics', 500);
  }
}
