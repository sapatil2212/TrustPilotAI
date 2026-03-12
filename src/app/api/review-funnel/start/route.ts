import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/session';
import prisma from '@/lib/prisma';
import { createFunnelSession } from '@/services/reviewFunnelService';
import { z } from 'zod';

const startFunnelSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
});

// POST /api/review-funnel/start - Start a new review funnel session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = startFunnelSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const { businessId } = validationResult.data;

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        businessName: true,
        reviewLink: true,
      },
    });

    if (!business) {
      return errorResponse('Business not found', 404);
    }

    // Create funnel session
    const session = await createFunnelSession(businessId);

    return successResponse({
      sessionId: session.id,
      businessId: session.businessId,
      businessName: business.businessName,
      reviewLink: business.reviewLink,
      createdAt: session.createdAt,
    }, 201);
  } catch (error) {
    console.error('Start review funnel error:', error);
    return errorResponse('Failed to start review funnel', 500);
  }
}
