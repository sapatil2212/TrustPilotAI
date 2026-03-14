
import { requireActiveSubscription, successResponse, errorResponse } from '@/lib/session';
import prisma from '@/lib/prisma';

// GET /api/business/list - Get all businesses for the current user
export async function GET() {
  try {
    const { error, auth } = await requireActiveSubscription();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const businesses = await prisma.business.findMany({
      where: { userId: auth.user.id },
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
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ businesses });
  } catch (error) {
    console.error('List businesses error:', error);
    return errorResponse('Failed to list businesses', 500);
  }
}
