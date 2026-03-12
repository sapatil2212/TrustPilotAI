import { 
  requireActiveSubscription, 
  successResponse, 
  errorResponse 
} from '@/lib/session';
import { getTrialStatus } from '@/services/trialService';
import { getBusinessesByUserId } from '@/services/businessService';
import { getReviewStats } from '@/services/reviewFetcherService';
import { getMonitoringStatus, triggerManualSync } from '@/services/reviewMonitorService';
import prisma from '@/lib/prisma';

// GET /api/business/me - Get current user's business dashboard data
export async function GET() {
  try {
    const { error, auth } = await requireActiveSubscription();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const [businesses, trialStatus] = await Promise.all([
      getBusinessesByUserId(auth.user.id),
      getTrialStatus(auth.user.id),
    ]);

    // Get primary business (first one)
    const primaryBusiness = businesses[0] || null;

    // Get review stats and monitoring data if business exists
    let reviewStats = null;
    let monitoring = null;
    let recentReviews: {
      id: string;
      reviewerName: string;
      rating: number;
      reviewText: string | null;
      sentiment: string;
      reviewDate: Date;
      aiReplySuggestion: string | null;
      isReplied: boolean;
    }[] = [];

    if (primaryBusiness) {
      // Auto-sync if never synced or last sync was >6 hours ago
      const needsSync = !primaryBusiness.lastSyncAt || 
        (Date.now() - new Date(primaryBusiness.lastSyncAt).getTime()) > 6 * 60 * 60 * 1000;
      
      if (needsSync) {
        try {
          await triggerManualSync(primaryBusiness.id);
        } catch (e) {
          console.log('Auto-sync failed:', e);
        }
      }

      [reviewStats, monitoring, recentReviews] = await Promise.all([
        getReviewStats(primaryBusiness.id),
        getMonitoringStatus(primaryBusiness.id),
        prisma.review.findMany({
          where: { businessId: primaryBusiness.id },
          orderBy: { reviewDate: 'desc' },
          take: 5,
          select: {
            id: true,
            reviewerName: true,
            rating: true,
            reviewText: true,
            sentiment: true,
            reviewDate: true,
            aiReplySuggestion: true,
            isReplied: true,
          },
        }),
      ]);
    }

    return successResponse({
      user: {
        id: auth.user.id,
        name: auth.user.name,
        email: auth.user.email,
        role: auth.user.role,
      },
      business: primaryBusiness
        ? {
            id: primaryBusiness.id,
            businessName: primaryBusiness.businessName,
            reviewLink: primaryBusiness.reviewLink,
            qrCodeUrl: primaryBusiness.qrCodeUrl,
            totalReviews: primaryBusiness.totalReviews,
            averageRating: primaryBusiness.averageRating,
          }
        : null,
      trialEndsAt: trialStatus?.trialEndsAt || null,
      trialDaysRemaining: trialStatus?.daysRemaining || 0,
      isTrialExpired: trialStatus?.isExpired || false,
      totalBusinesses: businesses.length,
      reviewStats,
      monitoring,
      recentReviews,
    });
  } catch (error) {
    console.error('Get business dashboard error:', error);
    return errorResponse('Failed to get business data', 500);
  }
}
