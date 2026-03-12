import crypto from 'crypto';
import prisma from '@/lib/prisma';
import * as gemini from '@/lib/ai/geminiService';

// Sentiment type (matches Prisma enum)
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

// Types for review data
export interface FetchedReview {
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  reviewText?: string;
  reviewDate: Date;
}

interface SerpApiReview {
  user?: {
    name?: string;
    thumbnail?: string;
  };
  rating?: number;
  snippet?: string;
  date?: string;
  iso_date?: string;
}

interface SerpApiResponse {
  reviews?: SerpApiReview[];
  place_info?: {
    rating?: number;
    reviews?: number;
  };
  serpapi_pagination?: {
    next?: string;
    next_page_token?: string;
  };
  error?: string;
}

// Generate hash for duplicate detection
export function generateReviewHash(
  businessId: string,
  reviewerName: string,
  reviewText: string | undefined,
  rating: number,
  reviewDate: Date
): string {
  const content = `${businessId}-${reviewerName}-${reviewText || ''}-${rating}-${reviewDate.toISOString().split('T')[0]}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

// Analyze sentiment based on rating and text
export function analyzeSentiment(rating: number, reviewText?: string): Sentiment {
  // Primary: Rating-based sentiment
  if (rating >= 4) return 'POSITIVE';
  if (rating <= 2) return 'NEGATIVE';
  
  // Secondary: Text-based sentiment for neutral ratings
  if (reviewText) {
    const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'recommend', 'awesome', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'disappointed', 'avoid', 'never'];
    
    const lowerText = reviewText.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'POSITIVE';
    if (negativeCount > positiveCount) return 'NEGATIVE';
  }
  
  return 'NEUTRAL';
}

// Fetch reviews using SerpAPI with pagination to get ALL reviews
export async function fetchReviewsFromSerpApi(placeId: string, maxPages: number = 5): Promise<FetchedReview[]> {
  const apiKey = process.env.SERPAPI_KEY;
  
  if (!apiKey) {
    console.warn('SERPAPI_KEY not configured, using mock data');
    return getMockReviews();
  }
  
  const allReviews: FetchedReview[] = [];
  let nextPageToken: string | null = null;
  let pageCount = 0;
  
  try {
    // Fetch reviews with pagination
    do {
      pageCount++;
      let url = `https://serpapi.com/search.json?engine=google_maps_reviews&place_id=${placeId}&api_key=${apiKey}`;
      
      // Add pagination token if available
      if (nextPageToken) {
        url += `&next_page_token=${encodeURIComponent(nextPageToken)}`;
      }
      
      console.log(`[SerpAPI] Fetching reviews page ${pageCount} for placeId:`, placeId);
      
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        console.error('[SerpAPI] Request failed with status:', response.status);
        throw new Error(`SerpAPI request failed: ${response.status}`);
      }
      
      const data: SerpApiResponse = await response.json();
      
      if (pageCount === 1) {
        console.log('[SerpAPI] Place info:', data.place_info);
      }
      
      if (data.error) {
        console.error('[SerpAPI] API Error:', data.error);
        throw new Error(`SerpAPI error: ${data.error}`);
      }
      
      if (data.reviews && data.reviews.length > 0) {
        const pageReviews = data.reviews.map((review: SerpApiReview) => ({
          reviewerName: review.user?.name || 'Anonymous',
          reviewerAvatar: review.user?.thumbnail,
          rating: review.rating || 5,
          reviewText: review.snippet,
          reviewDate: review.iso_date ? new Date(review.iso_date) : new Date(),
        }));
        allReviews.push(...pageReviews);
        console.log(`[SerpAPI] Page ${pageCount}: Found ${pageReviews.length} reviews (total: ${allReviews.length})`);
      }
      
      // Get next page token
      nextPageToken = data.serpapi_pagination?.next_page_token || null;
      
      // Rate limit: wait between pages
      if (nextPageToken && pageCount < maxPages) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } while (nextPageToken && pageCount < maxPages);
    
    console.log(`[SerpAPI] Total reviews fetched: ${allReviews.length} across ${pageCount} page(s)`);
    return allReviews;
    
  } catch (error) {
    console.error('[SerpAPI] Error fetching reviews:', error);
    // Return whatever we've collected so far, or mock data if nothing
    return allReviews.length > 0 ? allReviews : getMockReviews();
  }
}

// Mock reviews for development/testing
function getMockReviews(): FetchedReview[] {
  const now = new Date();
  return [
    {
      reviewerName: 'John Smith',
      rating: 5,
      reviewText: 'Excellent service! The team was professional and helpful. Highly recommend to anyone looking for quality work.',
      reviewDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      reviewerName: 'Sarah Johnson',
      rating: 4,
      reviewText: 'Great experience overall. Quick response time and good communication throughout the process.',
      reviewDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      reviewerName: 'Mike Wilson',
      rating: 5,
      reviewText: 'Amazing! Best in the business. Will definitely be coming back.',
      reviewDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      reviewerName: 'Emily Brown',
      rating: 3,
      reviewText: 'Service was okay. Room for improvement in some areas but nothing major.',
      reviewDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
    {
      reviewerName: 'David Lee',
      rating: 5,
      reviewText: 'Outstanding work! Exceeded my expectations. The attention to detail was impressive.',
      reviewDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    },
  ];
}

// Sync reviews for a business
export async function syncBusinessReviews(businessId: string, options: {
  processWithAI?: boolean;
} = {}): Promise<{
  newReviews: number;
  totalReviews: number;
  newReviewIds: string[];
}> {
  const { processWithAI = true } = options;
  
  console.log('[ReviewSync] Starting sync for businessId:', businessId);
  
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });
  
  if (!business) {
    console.error('[ReviewSync] Business not found:', businessId);
    throw new Error('Business not found');
  }

  console.log('[ReviewSync] Business found:', business.businessName, 'placeId:', business.placeId);

  if (!business.placeId) {
    console.error('[ReviewSync] Business has no placeId');
    throw new Error('Business is not connected to Google (no Place ID)');
  }
  
  // Fetch reviews from external source
  const fetchedReviews = await fetchReviewsFromSerpApi(business.placeId);
  console.log('[ReviewSync] Fetched', fetchedReviews.length, 'reviews from SerpAPI');
  
  let newReviewsCount = 0;
  const newReviewIds: string[] = [];
  
  for (const review of fetchedReviews) {
    const reviewHash = generateReviewHash(
      businessId,
      review.reviewerName,
      review.reviewText,
      review.rating,
      review.reviewDate
    );
    
    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { reviewHash },
    });
    
    if (!existingReview) {
      // Create new review with basic sentiment
      try {
        const newReview = await prisma.review.create({
          data: {
            businessId,
            reviewerName: review.reviewerName,
            reviewerAvatar: review.reviewerAvatar,
            rating: review.rating,
            reviewText: review.reviewText,
            reviewDate: review.reviewDate,
            reviewHash,
            sentiment: analyzeSentiment(review.rating, review.reviewText),
          },
        });
        newReviewsCount++;
        newReviewIds.push(newReview.id);
        console.log('[ReviewSync] Created review:', newReview.id, 'from', review.reviewerName);
      
        // Process with AI if enabled
        if (processWithAI && review.reviewText) {
          try {
            // Run AI processing in parallel
            const [aiSentiment, aiReply] = await Promise.all([
              gemini.analyzeSentiment({ reviewText: review.reviewText, businessId }),
              gemini.generateReviewReply({
                reviewText: review.reviewText,
                rating: review.rating,
                businessName: business.businessName,
                businessId,
              }),
            ]);
            
            // Update with AI data
            await prisma.review.update({
              where: { id: newReview.id },
              data: {
                sentiment: aiSentiment,
                aiReplySuggestion: aiReply,
                aiReplyGeneratedAt: new Date(),
              },
            });
          } catch (error) {
            console.error(`AI processing failed for review ${newReview.id}:`, error);
            // Continue with basic sentiment - AI will be retried later
          }
        }
      } catch (error) {
        console.error('[ReviewSync] Error creating review:', error);
      }
    }
  }
  
  // Update business stats
  const reviews = await prisma.review.findMany({
    where: { businessId },
    select: { rating: true },
  });
  
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / totalReviews
    : 0;
  
  await prisma.business.update({
    where: { id: businessId },
    data: {
      lastSyncAt: new Date(),
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
    },
  });
  
  return { newReviews: newReviewsCount, totalReviews, newReviewIds };
}

// Get reviews for a business
export async function getBusinessReviews(
  businessId: string,
  options: {
    page?: number;
    limit?: number;
    sentiment?: Sentiment;
    sortBy?: 'date' | 'rating';
    sortOrder?: 'asc' | 'desc';
  } = {}
) {
  const {
    page = 1,
    limit = 10,
    sentiment,
    sortBy = 'date',
    sortOrder = 'desc',
  } = options;
  
  const where = {
    businessId,
    ...(sentiment && { sentiment }),
  };
  
  const orderBy = sortBy === 'date'
    ? { reviewDate: sortOrder as 'asc' | 'desc' }
    : { rating: sortOrder as 'asc' | 'desc' };
  
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);
  
  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get review statistics
export async function getReviewStats(businessId: string) {
  const [total, byRating, bySentiment] = await Promise.all([
    prisma.review.count({ where: { businessId } }),
    prisma.review.groupBy({
      by: ['rating'],
      where: { businessId },
      _count: true,
    }),
    prisma.review.groupBy({
      by: ['sentiment'],
      where: { businessId },
      _count: true,
    }),
  ]);
  
  // Calculate rating distribution
  const ratingDistribution = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  };
  byRating.forEach((r: { rating: number; _count: number }) => {
    ratingDistribution[r.rating as keyof typeof ratingDistribution] = r._count;
  });
  
  // Calculate sentiment distribution
  const sentimentDistribution = {
    POSITIVE: 0,
    NEUTRAL: 0,
    NEGATIVE: 0,
  };
  bySentiment.forEach((s: { sentiment: Sentiment; _count: number }) => {
    sentimentDistribution[s.sentiment] = s._count;
  });
  
  return {
    total,
    ratingDistribution,
    sentimentDistribution,
  };
}
