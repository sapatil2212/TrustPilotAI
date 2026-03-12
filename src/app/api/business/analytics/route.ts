import { NextRequest } from 'next/server';
import { requireActiveSubscription, successResponse, errorResponse } from '@/lib/session';
import prisma from '@/lib/prisma';
import { getBusinessAnalytics, updateBusinessAnalytics } from '@/services/analyticsService';

// GET /api/business/analytics - Get analytics for user's business
export async function GET(request: NextRequest) {
  try {
    const { error, auth } = await requireActiveSubscription();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    let targetBusinessId: string;

    if (businessId) {
      // Verify ownership
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { userId: true },
      });

      if (!business) {
        return errorResponse('Business not found', 404);
      }

      if (business.userId !== auth.user.id && auth.user.role !== 'ADMIN') {
        return errorResponse('Access denied', 403);
      }

      targetBusinessId = businessId;
    } else {
      // Get user's primary business
      const business = await prisma.business.findFirst({
        where: { userId: auth.user.id },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });

      if (!business) {
        return errorResponse('No business found', 400);
      }

      targetBusinessId = business.id;
    }

    // Update analytics first (recalculate from current data)
    await updateBusinessAnalytics(targetBusinessId);

    // Get the analytics
    const analytics = await getBusinessAnalytics(targetBusinessId);

    return successResponse({
      totalReviews: analytics.totalReviews,
      positiveReviews: analytics.positiveReviews,
      neutralReviews: analytics.neutralReviews,
      negativeReviews: analytics.negativeReviews,
      averageRating: Math.round(analytics.averageRating * 10) / 10,
      reviewTrend: analytics.reviewTrend,
      ratingDistribution: analytics.ratingDistribution,
      sentimentDistribution: analytics.sentimentDistribution,
    });
  } catch (error) {
    console.error('Get business analytics error:', error);
    return errorResponse('Failed to get analytics', 500);
  }
}
