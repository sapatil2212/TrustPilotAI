import { requireActiveSubscription, successResponse, errorResponse } from '@/lib/session';
import prisma from '@/lib/prisma';

// GET /api/business/profile - Get business owner's profile and business info
export async function GET() {
  try {
    const { error, auth } = await requireActiveSubscription();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    // Get user's primary connected business with trial info
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        trialEndsAt: true,
        isTrialExpired: true,
        businesses: {
          where: { isConnected: true }, // Only get connected businesses
          select: {
            id: true,
            businessName: true,
            businessType: true,
            placeId: true,
            reviewLink: true,
            qrCodeUrl: true,
            isConnected: true,
            totalReviews: true,
            averageRating: true,
            lastSyncAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' }, // Most recently connected first
          take: 1,
        },
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const primaryBusiness = user.businesses[0] || null;

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        trialEndsAt: user.trialEndsAt,
        isTrialExpired: user.isTrialExpired,
        trialDaysRemaining: auth.trialDaysRemaining,
      },
      business: primaryBusiness ? {
        id: primaryBusiness.id,
        businessName: primaryBusiness.businessName,
        businessType: primaryBusiness.businessType,
        placeId: primaryBusiness.placeId,
        reviewLink: primaryBusiness.reviewLink,
        qrCodeUrl: primaryBusiness.qrCodeUrl,
        isConnected: primaryBusiness.isConnected,
        totalReviews: primaryBusiness.totalReviews,
        averageRating: primaryBusiness.averageRating,
        lastSyncAt: primaryBusiness.lastSyncAt,
        createdAt: primaryBusiness.createdAt,
      } : null,
    });
  } catch (error) {
    console.error('Get business profile error:', error);
    return errorResponse('Failed to get profile', 500);
  }
}
