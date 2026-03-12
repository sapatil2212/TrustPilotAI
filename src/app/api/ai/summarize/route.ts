import { NextRequest, NextResponse } from 'next/server';
import { requireActiveSubscription } from '@/lib/session';
import { summarizeReviews } from '@/lib/ai/geminiService';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const summarizeSchema = z.object({
  businessId: z.string().uuid('Business ID is required'),
});

// Alternative schema for passing reviews directly
const summarizeReviewsSchema = z.object({
  reviews: z.array(z.object({
    reviewText: z.string(),
    rating: z.number().min(1).max(5),
  })).min(1, 'At least one review is required'),
  businessName: z.string().optional(),
  businessId: z.string().uuid().optional(),
});

// POST /api/ai/summarize - Summarize reviews
export async function POST(request: NextRequest) {
  const authResult = await requireActiveSubscription();
  if (authResult.error) {
    return authResult.error;
  }

  const { auth } = authResult;

  try {
    const body = await request.json();

    // Try to parse with businessId schema first
    const businessIdResult = summarizeSchema.safeParse(body);
    
    if (businessIdResult.success) {
      const { businessId } = businessIdResult.data;

      // Verify user owns this business
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

      // Get reviews from database
      const reviews = await prisma.review.findMany({
        where: { businessId },
        select: {
          reviewText: true,
          rating: true,
        },
        orderBy: { reviewDate: 'desc' },
        take: 20,
      });

      if (reviews.length === 0) {
        return NextResponse.json({
          success: true,
          summary: 'No reviews available to summarize.',
        });
      }

      // Generate summary
      const summary = await summarizeReviews({
        reviews: reviews.map((r: { reviewText: string | null; rating: number }) => ({
          reviewText: r.reviewText || '',
          rating: r.rating,
        })),
        businessName: business.businessName,
        businessId,
      });

      return NextResponse.json({
        success: true,
        summary,
        reviewCount: reviews.length,
      });
    }

    // Try to parse with reviews array schema
    const reviewsResult = summarizeReviewsSchema.safeParse(body);
    
    if (reviewsResult.success) {
      const { reviews, businessName, businessId } = reviewsResult.data;

      const summary = await summarizeReviews({
        reviews,
        businessName,
        businessId,
      });

      return NextResponse.json({
        success: true,
        summary,
        reviewCount: reviews.length,
      });
    }

    return NextResponse.json(
      { error: 'Validation failed. Provide either businessId or reviews array.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error summarizing reviews:', error);
    return NextResponse.json(
      { error: 'Failed to summarize reviews' },
      { status: 500 }
    );
  }
}
