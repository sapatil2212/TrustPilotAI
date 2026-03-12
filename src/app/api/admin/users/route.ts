import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse } from '@/lib/session';
import prisma from '@/lib/prisma';
import { paginationSchema } from '@/lib/validators';

// GET /api/admin/users - Get all users with pagination
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

    const skip = (page - 1) * limit;

    // Get users with their primary business
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'USER' },
        select: {
          id: true,
          name: true,
          email: true,
          trialEndsAt: true,
          isTrialExpired: true,
          isActive: true,
          createdAt: true,
          businesses: {
            select: {
              businessName: true,
            },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: { role: 'USER' } }),
    ]);

    // Calculate trial status for each user
    const now = new Date();
    const usersWithTrialStatus = users.map((user: {
      id: string;
      name: string;
      email: string;
      trialEndsAt: Date;
      isTrialExpired: boolean;
      isActive: boolean;
      createdAt: Date;
      businesses: { businessName: string }[];
    }) => {
      const trialEndsAt = new Date(user.trialEndsAt);
      const isExpired = now > trialEndsAt;
      const daysRemaining = Math.max(
        0,
        Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        trialEndsAt: user.trialEndsAt,
        trialStatus: isExpired ? 'expired' : 'active',
        trialDaysRemaining: daysRemaining,
        isActive: user.isActive,
        createdAt: user.createdAt,
        businessName: user.businesses[0]?.businessName || null,
      };
    });

    return successResponse({
      users: usersWithTrialStatus,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    return errorResponse('Failed to get users', 500);
  }
}
