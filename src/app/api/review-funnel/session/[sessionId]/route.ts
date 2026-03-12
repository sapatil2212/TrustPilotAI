import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/session';
import prisma from '@/lib/prisma';
import { 
  getFunnelSession, 
  updateSessionRating, 
  updateSessionAIReview, 
  markRedirectedToGoogle 
} from '@/services/reviewFunnelService';
import { generateCustomerReviewSuggestions } from '@/services/aiService';
import { z } from 'zod';

const updateFunnelSchema = z.object({
  ratingSelected: z.number().int().min(1).max(5).optional(),
  aiReviewGenerated: z.string().optional(),
  redirectedToGoogle: z.boolean().optional(),
  generateAIReview: z.boolean().optional(),
  serviceType: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

// GET /api/review-funnel/session/[sessionId] - Get funnel session details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { sessionId } = await params;
    
    const session = await getFunnelSession(sessionId);

    if (!session) {
      return errorResponse('Session not found', 404);
    }

    // Get business info
    const business = await prisma.business.findUnique({
      where: { id: session.businessId },
      select: {
        businessName: true,
        reviewLink: true,
      },
    });

    return successResponse({
      sessionId: session.id,
      businessId: session.businessId,
      businessName: business?.businessName,
      reviewLink: business?.reviewLink,
      ratingSelected: session.ratingSelected,
      aiReviewGenerated: session.aiReviewGenerated,
      redirectedToGoogle: session.redirectedToGoogle,
      createdAt: session.createdAt,
    });
  } catch (error) {
    console.error('Get funnel session error:', error);
    return errorResponse('Failed to get session', 500);
  }
}

// PATCH /api/review-funnel/session/[sessionId] - Update funnel session
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    
    // Validate input
    const validationResult = updateFunnelSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const { ratingSelected, aiReviewGenerated, redirectedToGoogle, generateAIReview, serviceType } = validationResult.data;

    // Verify session exists
    const existingSession = await getFunnelSession(sessionId);
    
    if (!existingSession) {
      return errorResponse('Session not found', 404);
    }

    let updatedSession = existingSession;
    let aiSuggestions: string[] | null = null;

    // Update rating if provided
    if (ratingSelected !== undefined) {
      updatedSession = await updateSessionRating(sessionId, ratingSelected);
    }

    // Generate AI review if requested
    if (generateAIReview) {
      const business = await prisma.business.findUnique({
        where: { id: existingSession.businessId },
        select: { businessName: true },
      });

      if (business) {
        const rating = updatedSession.ratingSelected || 5;
        aiSuggestions = await generateCustomerReviewSuggestions(
          business.businessName,
          serviceType || 'general service',
          rating,
          existingSession.businessId
        );
        
        // Store the first suggestion in the session
        if (aiSuggestions.length > 0) {
          updatedSession = await updateSessionAIReview(sessionId, aiSuggestions[0]);
        }
      }
    }

    // Update AI review text directly if provided
    if (aiReviewGenerated !== undefined) {
      updatedSession = await updateSessionAIReview(sessionId, aiReviewGenerated);
    }

    // Mark as redirected to Google if provided
    if (redirectedToGoogle) {
      updatedSession = await markRedirectedToGoogle(sessionId);
    }

    // Get business info for response
    const business = await prisma.business.findUnique({
      where: { id: updatedSession.businessId },
      select: {
        businessName: true,
        reviewLink: true,
      },
    });

    return successResponse({
      sessionId: updatedSession.id,
      businessId: updatedSession.businessId,
      businessName: business?.businessName,
      reviewLink: business?.reviewLink,
      ratingSelected: updatedSession.ratingSelected,
      aiReviewGenerated: updatedSession.aiReviewGenerated,
      aiSuggestions, // Include all suggestions if generated
      redirectedToGoogle: updatedSession.redirectedToGoogle,
      createdAt: updatedSession.createdAt,
    });
  } catch (error) {
    console.error('Update funnel session error:', error);
    return errorResponse('Failed to update session', 500);
  }
}
