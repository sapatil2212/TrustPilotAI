import { NextRequest } from 'next/server';
import { requireActiveSubscription, successResponse, errorResponse } from '@/lib/session';
import { getBusinessReviews, getReviewStats } from '@/services/reviewFetcherService';
import { getMonitoringStatus } from '@/services/reviewMonitorService';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  page: z.string().nullish().transform(v => parseInt(v || '1')),
  limit: z.string().nullish().transform(v => parseInt(v || '10')),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).nullish(),
  sortBy: z.enum(['date', 'rating']).nullish(),
  sortOrder: z.enum(['asc', 'desc']).nullish(),
});

interface RouteParams {
  params: Promise<{ businessId: string }>;
}

// GET /api/reviews/business/[businessId] - Get reviews for a business
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { error, auth } = await requireActiveSubscription();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const { businessId } = await params;

    // Verify user owns this business or is admin
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return errorResponse('Business not found', 404);
    }

    // Check ownership (admins can access any business)
    if (business.userId !== auth.user.id && auth.user.role !== 'ADMIN') {
      return errorResponse('Access denied', 403);
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const queryResult = querySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sentiment: searchParams.get('sentiment'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    if (!queryResult.success) {
      return errorResponse('Invalid query parameters', 400);
    }

    const options = {
      page: queryResult.data.page,
      limit: queryResult.data.limit,
      sentiment: queryResult.data.sentiment ?? undefined,
      sortBy: queryResult.data.sortBy ?? undefined,
      sortOrder: queryResult.data.sortOrder ?? undefined,
    };

    // Get reviews with pagination (sorted by newest by default)
    const reviewsData = await getBusinessReviews(businessId, {
      page: options.page,
      limit: options.limit,
      sentiment: options.sentiment,
      sortBy: options.sortBy || 'date',
      sortOrder: options.sortOrder || 'desc',
    });

    // Get review stats
    const stats = await getReviewStats(businessId);

    // Get monitoring status
    const monitoring = await getMonitoringStatus(businessId);

    return successResponse({
      business: {
        id: business.id,
        businessName: business.businessName,
        reviewLink: business.reviewLink,
        qrCodeUrl: business.qrCodeUrl,
      },
      reviews: reviewsData.reviews.map((r: {
        id: string;
        reviewerName: string;
        reviewerAvatar: string | null;
        rating: number;
        reviewText: string | null;
        reviewDate: Date;
        sentiment: string;
        aiReplySuggestion: string | null;
        isReplied: boolean;
        createdAt: Date;
      }) => ({
        id: r.id,
        reviewerName: r.reviewerName,
        reviewerAvatar: r.reviewerAvatar,
        rating: r.rating,
        reviewText: r.reviewText,
        reviewDate: r.reviewDate,
        sentiment: r.sentiment,
        aiReplySuggestion: r.aiReplySuggestion,
        isReplied: r.isReplied,
        createdAt: r.createdAt,
      })),
      pagination: reviewsData.pagination,
      stats,
      monitoring,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return errorResponse('Failed to fetch reviews', 500);
  }
}
