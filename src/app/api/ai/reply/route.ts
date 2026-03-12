import { NextRequest, NextResponse } from 'next/server';
import { requireActiveSubscription } from '@/lib/session';
import { generateReviewReply } from '@/lib/ai/geminiService';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const replySchema = z.object({
  reviewText: z.string().min(1, 'Review text is required'),
  rating: z.number().min(1).max(5),
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().optional(),
  businessId: z.string().uuid().optional(),
});

// POST /api/ai/reply - Generate AI reply for a review
export async function POST(request: NextRequest) {
  const authResult = await requireActiveSubscription();
  if (authResult.error) {
    return authResult.error;
  }

  const { auth } = authResult;

  try {
    const body = await request.json();
    const validationResult = replySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { reviewText, rating, businessName, businessType, businessId } = validationResult.data;

    // If businessId is provided, verify user owns it
    if (businessId) {
      const business = await prisma.business.findFirst({
        where: {
          id: businessId,
          userId: auth.user.id,
        },
      });

      if (!business) {
        return NextResponse.json(
          { error: 'Business not found or unauthorized' },
          { status: 404 }
        );
      }
    }

    // Generate AI reply
    const aiReply = await generateReviewReply({
      reviewText,
      rating,
      businessName,
      businessType,
      businessId,
    });

    return NextResponse.json({
      success: true,
      aiReply,
    });
  } catch (error) {
    console.error('Error generating AI reply:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI reply' },
      { status: 500 }
    );
  }
}
