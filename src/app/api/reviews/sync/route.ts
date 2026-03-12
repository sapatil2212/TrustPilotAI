import { NextRequest, NextResponse } from 'next/server';
import { requireActiveSubscription } from '@/lib/session';
import { triggerManualSync } from '@/services/reviewMonitorService';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const syncSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
});

// POST /api/reviews/sync - Manually sync reviews for a business
export async function POST(request: NextRequest) {
  const authResult = await requireActiveSubscription();
  if (authResult.error) {
    return authResult.error;
  }

  const { auth } = authResult;

  try {
    // Get businessId from query params OR body
    const { searchParams } = new URL(request.url);
    let businessId = searchParams.get('businessId');
    
    if (!businessId) {
      try {
        const body = await request.json();
        const validationResult = syncSchema.safeParse(body);
        if (validationResult.success) {
          businessId = validationResult.data.businessId;
        }
      } catch {
        // No body provided
      }
    }

    if (!businessId) {
      // Get user's first business if no businessId specified
      const userBusiness = await prisma.business.findFirst({
        where: { userId: auth.user.id },
        select: { id: true },
      });
      businessId = userBusiness?.id || null;
    }

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns this business
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: auth.user.id,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Trigger sync
    const result = await triggerManualSync(businessId);

    return NextResponse.json({
      success: true,
      message: `Synced reviews for ${business.businessName}`,
      newReviews: result.newReviews,
      totalReviews: result.totalReviews,
    });
  } catch (error) {
    console.error('Error syncing reviews:', error);
    return NextResponse.json(
      { error: 'Failed to sync reviews' },
      { status: 500 }
    );
  }
}
