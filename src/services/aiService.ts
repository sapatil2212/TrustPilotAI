import prisma from '@/lib/prisma';
import * as gemini from '@/lib/ai/geminiService';
import * as systemStats from './systemStatsService';

// Re-export types
export type { Sentiment } from '@/lib/ai/geminiService';

// AI Provider configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

/**
 * Generate AI reply suggestion for a review
 */
export async function generateReplyForReview(
  reviewId: string,
  options: { regenerate?: boolean } = {}
): Promise<string> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { business: true },
  });
  
  if (!review) {
    throw new Error('Review not found');
  }
  
  // Return existing reply if not regenerating
  if (review.aiReplySuggestion && !options.regenerate) {
    return review.aiReplySuggestion;
  }
  
  // Use Gemini service for AI reply generation
  await systemStats.incrementAIRequests();
  const aiReply = await gemini.generateReviewReply({
    reviewText: review.reviewText || '',
    rating: review.rating,
    businessName: review.business.businessName,
    businessId: review.businessId,
  });
  
  // Save the generated reply with timestamp
  await prisma.review.update({
    where: { id: reviewId },
    data: { 
      aiReplySuggestion: aiReply,
      aiReplyGeneratedAt: new Date(),
    },
  });
  
  return aiReply;
}

/**
 * Generate AI review suggestions for customers
 */
export async function generateReviewSuggestions(
  businessName: string,
  serviceType: string,
  experience: string,
  businessId?: string
): Promise<string[]> {
  return gemini.generateCustomerReview({
    businessName,
    serviceType,
    experience,
    businessId,
  });
}

/**
 * Analyze sentiment of a review
 */
export async function analyzeReviewSentiment(
  reviewText: string,
  businessId?: string
): Promise<gemini.Sentiment> {
  return gemini.analyzeSentiment({
    reviewText,
    businessId,
  });
}

/**
 * Summarize multiple reviews
 */
export async function summarizeBusinessReviews(
  businessId: string
): Promise<string> {
  const reviews = await prisma.review.findMany({
    where: { businessId },
    select: {
      reviewText: true,
      rating: true,
    },
    orderBy: { reviewDate: 'desc' },
    take: 20,
  });
  
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { businessName: true },
  });
  
  return gemini.summarizeReviews({
    reviews: reviews.map((r: { reviewText: string | null; rating: number }) => ({
      reviewText: r.reviewText || '',
      rating: r.rating,
    })),
    businessName: business?.businessName,
    businessId,
  });
}

/**
 * Batch generate replies for multiple reviews
 */
export async function batchGenerateReplies(
  businessId: string,
  options: { onlyMissing?: boolean } = {}
): Promise<number> {
  const where = {
    businessId,
    ...(options.onlyMissing && { aiReplySuggestion: null }),
  };
  
  const reviews = await prisma.review.findMany({
    where,
    include: { business: true },
    take: 10, // Process in batches of 10
  });
  
  let generatedCount = 0;
  
  for (const review of reviews) {
    try {
      const aiReply = await gemini.generateReviewReply({
        reviewText: review.reviewText || '',
        rating: review.rating,
        businessName: review.business.businessName,
        businessId: review.businessId,
      });
      
      await prisma.review.update({
        where: { id: review.id },
        data: { 
          aiReplySuggestion: aiReply,
          aiReplyGeneratedAt: new Date(),
        },
      });
      
      generatedCount++;
      
      // Rate limiting: wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error generating reply for review ${review.id}:`, error);
    }
  }
  
  return generatedCount;
}

/**
 * Process new review with AI (sentiment + reply)
 */
export async function processNewReviewWithAI(reviewId: string): Promise<{
  sentiment: gemini.Sentiment;
  aiReply: string;
}> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { business: true },
  });
  
  if (!review) {
    throw new Error('Review not found');
  }
  
  // Analyze sentiment
  const sentiment = await gemini.analyzeSentiment({
    reviewText: review.reviewText || '',
    businessId: review.businessId,
  });
  
  // Generate AI reply
  const aiReply = await gemini.generateReviewReply({
    reviewText: review.reviewText || '',
    rating: review.rating,
    businessName: review.business.businessName,
    businessId: review.businessId,
  });
  
  // Update review with AI data
  await prisma.review.update({
    where: { id: reviewId },
    data: {
      sentiment,
      aiReplySuggestion: aiReply,
      aiReplyGeneratedAt: new Date(),
    },
  });
  
  return { sentiment, aiReply };
}

/**
 * Check if AI is configured
 */
export function isAIConfigured(): boolean {
  if (AI_PROVIDER === 'gemini') {
    return gemini.isGeminiConfigured();
  }
  return false;
}

/**
 * Get AI rate limit status for a business
 */
export function getAIRateLimitStatus(businessId: string) {
  return gemini.getRateLimitStatus(businessId);
}

/**
 * Generate customer review suggestions for the review funnel
 * Returns 3 unique suggestions, each under 70 words
 */
export async function generateCustomerReviewSuggestions(
  businessName: string,
  serviceType: string,
  rating: number = 5,
  businessId?: string
): Promise<string[]> {
  await systemStats.incrementAIRequests();
  
  // Determine experience based on rating
  let experience = 'positive';
  if (rating <= 2) {
    experience = 'negative';
  } else if (rating === 3) {
    experience = 'neutral';
  }
  
  // Generate 3 unique review suggestions with rating
  const suggestions = await gemini.generateCustomerReview({
    businessName,
    serviceType,
    experience,
    rating,
    businessId,
  });

  // Ensure each suggestion is under 70 words
  return suggestions.map(suggestion => {
    const words = suggestion.split(/\s+/);
    if (words.length > 70) {
      return words.slice(0, 70).join(' ') + '...';
    }
    return suggestion;
  });
}
