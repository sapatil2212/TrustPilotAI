import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/session';
import { generateCustomerReviewSuggestions } from '@/services/aiService';
import { z } from 'zod';

const generateReviewSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  rating: z.number().int().min(1).max(5).optional().default(5),
});

// POST /api/ai/generate-review - Generate customer review suggestions (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = generateReviewSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const { businessName, serviceType, rating } = validationResult.data;

    // Generate 3 unique review suggestions based on rating
    const reviews = await generateCustomerReviewSuggestions(
      businessName,
      serviceType,
      rating
    );

    if (!reviews || reviews.length === 0) {
      return errorResponse('Failed to generate review suggestions', 500);
    }

    return successResponse({
      businessName,
      serviceType,
      rating,
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Generate review error:', error);
    return errorResponse('Failed to generate review suggestions', 500);
  }
}
