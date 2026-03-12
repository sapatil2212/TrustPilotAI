import { NextRequest, NextResponse } from 'next/server';
import { requireActiveSubscription } from '@/lib/session';
import { generateReviewReply } from '@/lib/ai/geminiService';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const generateReplySchema = z.object({
  reviewText: z.string().min(1, 'Review text is required'),
  tone: z.enum(['professional', 'friendly', 'short', 'detailed']).default('professional'),
  rating: z.number().min(1).max(5).optional(),
});

// POST /api/ai/generate-reply - Generate AI reply for a review (standalone)
export async function POST(request: NextRequest) {
  const authResult = await requireActiveSubscription();
  if (authResult.error) {
    return authResult.error;
  }

  const { auth } = authResult;

  try {
    const body = await request.json();
    const validationResult = generateReplySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { reviewText, tone, rating } = validationResult.data;

    // Get user's business for context
    const business = await prisma.business.findFirst({
      where: { userId: auth.user.id },
      select: { businessName: true, businessType: true, id: true },
    });

    const businessName = business?.businessName || 'Our Business';
    const businessType = business?.businessType || 'business';

    // Estimate rating from review text if not provided
    const estimatedRating = rating || estimateRatingFromText(reviewText);

    // Generate AI reply using Gemini
    const reply = await generateReviewReply({
      reviewText,
      rating: estimatedRating,
      businessName,
      businessType,
      businessId: business?.id,
    });

    return NextResponse.json({
      success: true,
      reply,
      tone,
    });
  } catch (error) {
    console.error('Error generating AI reply:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI reply' },
      { status: 500 }
    );
  }
}

// Simple heuristic to estimate rating from review text
function estimateRatingFromText(text: string): number {
  const lowerText = text.toLowerCase();
  
  const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 
    'best', 'recommend', 'awesome', 'perfect', 'outstanding', 'friendly', 'helpful', 'incredible'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 
    'poor', 'disappointed', 'avoid', 'never', 'rude', 'slow', 'unprofessional', 'waste'];
  
  const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
  
  if (negativeCount > positiveCount) return 2;
  if (positiveCount > negativeCount + 2) return 5;
  if (positiveCount > negativeCount) return 4;
  return 3;
}
