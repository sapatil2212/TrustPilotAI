import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse } from '@/lib/session';
import { getAllBusinessesForAdmin } from '@/services/businessService';
import { paginationSchema } from '@/lib/validators';

// GET /api/admin/businesses - Get all businesses for admin
export async function GET(request: NextRequest) {
  try {
    const { error, auth } = await requireAdmin();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    
    // Parse pagination params
    const paginationResult = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    const { page, limit } = paginationResult.success 
      ? paginationResult.data 
      : { page: 1, limit: 10 };

    // Get all businesses with owner info
    const allBusinesses = await getAllBusinessesForAdmin();
    
    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedBusinesses = allBusinesses.slice(skip, skip + limit);
    
    return successResponse({
      businesses: paginatedBusinesses.map(b => ({
        id: b.id,
        businessName: b.businessName,
        ownerName: b.ownerName,
        ownerEmail: b.ownerEmail,
        placeId: b.placeId,
        totalReviews: b.totalReviews,
        averageRating: b.averageRating,
        createdAt: b.createdAt,
      })),
      pagination: {
        page,
        limit,
        totalCount: allBusinesses.length,
        totalPages: Math.ceil(allBusinesses.length / limit),
      },
    });
  } catch (error) {
    console.error('Get admin businesses error:', error);
    return errorResponse('Failed to get businesses', 500);
  }
}
