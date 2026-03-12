import { requireAdmin, successResponse, errorResponse } from '@/lib/session';
import { getTrialStats } from '@/services/trialService';
import { getTotalBusinessCount } from '@/services/businessService';
import prisma from '@/lib/prisma';

// GET /api/admin/overview - Get admin dashboard overview
export async function GET() {
  try {
    const { error, auth } = await requireAdmin();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const [trialStats, totalBusinesses, totalReviewsFetched] = await Promise.all([
      getTrialStats(),
      getTotalBusinessCount(),
      prisma.review.count(),
    ]);

    return successResponse({
      totalUsers: trialStats.totalUsers,
      totalBusinesses,
      activeTrials: trialStats.activeTrials,
      expiredTrials: trialStats.expiredTrials,
      totalReviewsFetched,
    });
  } catch (error) {
    console.error('Get admin overview error:', error);
    return errorResponse('Failed to get overview', 500);
  }
}
