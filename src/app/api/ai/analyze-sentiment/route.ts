import { NextRequest, NextResponse } from 'next/server';
import { requireActiveSubscription } from '@/lib/session';
import { analyzeSentiment } from '@/lib/ai/geminiService';
import { z } from 'zod';

const sentimentSchema = z.object({
  reviewText: z.string().min(1, 'Review text is required'),
  businessId: z.string().uuid().optional(),
});

// POST /api/ai/analyze-sentiment - Analyze sentiment of a review
export async function POST(request: NextRequest) {
  const authResult = await requireActiveSubscription();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const validationResult = sentimentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { reviewText, businessId } = validationResult.data;

    // Analyze sentiment
    const sentiment = await analyzeSentiment({
      reviewText,
      businessId,
    });

    return NextResponse.json({
      success: true,
      sentiment,
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
}
