import { NextRequest, NextResponse } from 'next/server';
import { requireActiveSubscription } from '@/lib/session';
import { generateReviewSuggestions } from '@/services/aiService';
import { z } from 'zod';

const generateReviewSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  experience: z.string().min(10, 'Please describe your experience (min 10 characters)'),
});

// POST /api/reviews/generate - Generate AI review suggestions for customers
export async function POST(request: NextRequest) {
  const authResult = await requireActiveSubscription();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const validationResult = generateReviewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { businessName, serviceType, experience } = validationResult.data;

    // Generate AI review suggestions
    const reviews = await generateReviewSuggestions(
      businessName,
      serviceType,
      experience
    );

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error('Error generating reviews:', error);
    return NextResponse.json(
      { error: 'Failed to generate review suggestions' },
      { status: 500 }
    );
  }
}
