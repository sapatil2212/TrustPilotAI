import { NextRequest, NextResponse } from 'next/server';
import { requireActiveSubscription } from '@/lib/session';
import { generateReplyForReview } from '@/services/aiService';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const replySchema = z.object({
  regenerate: z.boolean().optional().default(false),
});

// GET /api/reviews/[id] - Get a specific review
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireActiveSubscription();
  if (authResult.error) {
    return authResult.error;
  }

  const { auth } = authResult;
  const { id } = params;

  try {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            businessName: true,
            userId: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify user owns the business
    if (review.business.userId !== auth.user.id && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

// POST /api/reviews/[id] - Generate AI reply for a review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireActiveSubscription();
  if (authResult.error) {
    return authResult.error;
  }

  const { auth } = authResult;
  const { id } = params;

  try {
    // Verify user owns this review's business
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    if (review.business.userId !== auth.user.id && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Parse options
    const body = await request.json().catch(() => ({}));
    const validationResult = replySchema.safeParse(body);
    const options = validationResult.success ? validationResult.data : { regenerate: false };

    // Generate AI reply
    const aiReply = await generateReplyForReview(id, {
      regenerate: options.regenerate,
    });

    return NextResponse.json({
      success: true,
      reviewId: id,
      aiReplySuggestion: aiReply,
    });
  } catch (error) {
    console.error('Error generating reply:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI reply' },
      { status: 500 }
    );
  }
}

// PATCH /api/reviews/[id] - Mark review as replied
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireActiveSubscription();
  if (authResult.error) {
    return authResult.error;
  }

  const { auth } = authResult;
  const { id } = params;

  try {
    // Verify user owns this review's business
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    if (review.business.userId !== auth.user.id && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isReplied } = body;

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { isReplied: isReplied ?? true },
    });

    return NextResponse.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
