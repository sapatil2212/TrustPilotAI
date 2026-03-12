import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Gemini Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.0-flash'; // Updated model name

// Sentiment types
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

// Rate limiting cache
const requestCache = new Map<string, { result: string; timestamp: number }>();
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per business

// Initialize Gemini client
let geminiClient: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  
  return geminiClient;
}

function getModel(): GenerativeModel {
  if (!model) {
    model = getGeminiClient().getGenerativeModel({ model: MODEL_NAME });
  }
  return model;
}

// Check rate limit for a business
function checkRateLimit(businessId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(businessId);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(businessId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  limit.count++;
  return true;
}

// Get cached result or null
function getCachedResult(cacheKey: string): string | null {
  const cached = requestCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  requestCache.delete(cacheKey);
  return null;
}

// Store result in cache
function cacheResult(cacheKey: string, result: string): void {
  requestCache.set(cacheKey, { result, timestamp: Date.now() });
  
  // Clean old cache entries (max 1000 entries)
  if (requestCache.size > 1000) {
    const oldestKey = requestCache.keys().next().value;
    if (oldestKey) requestCache.delete(oldestKey);
  }
}

// Sanitize text before sending to AI
function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control characters
    .trim()
    .substring(0, 2000); // Limit length
}

// Generate content with error handling
async function generateContent(prompt: string): Promise<string> {
  try {
    const geminiModel = getModel();
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

// Default fallback reply
const FALLBACK_REPLY = "Thank you for your feedback. We appreciate your support and value your input.";

/**
 * Generate a professional reply to a Google review
 */
export async function generateReviewReply(options: {
  reviewText: string;
  rating: number;
  businessName: string;
  businessType?: string;
  businessId?: string;
}): Promise<string> {
  const { reviewText, rating, businessName, businessType = 'business', businessId } = options;
  
  // Check rate limit
  if (businessId && !checkRateLimit(businessId)) {
    console.warn(`Rate limit exceeded for business ${businessId}`);
    return FALLBACK_REPLY;
  }
  
  // Check cache
  const cacheKey = `reply:${businessName}:${rating}:${reviewText.substring(0, 100)}`;
  const cached = getCachedResult(cacheKey);
  if (cached) return cached;
  
  const sanitizedReview = sanitizeText(reviewText);
  const ratingDesc = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';
  
  const prompt = `You are a professional customer service representative for "${businessName}", a ${businessType}.

Generate a reply to this Google review:

Rating: ${rating} stars (${ratingDesc})
Review: "${sanitizedReview}"

Reply guidelines:
- Polite and professional tone
- Maximum 80 words
- Personalized response that acknowledges specific feedback
- Thank the customer
- If negative, apologize and offer to resolve the issue
- If positive, express gratitude and invite them back
- Do not use generic phrases like "Dear valued customer"
- Do not include signatures or business names at the end

Reply:`;

  try {
    const reply = await generateContent(prompt);
    const cleanedReply = reply.trim().replace(/^["']|["']$/g, '');
    cacheResult(cacheKey, cleanedReply);
    return cleanedReply;
  } catch (error) {
    console.error('Error generating review reply:', error);
    return FALLBACK_REPLY;
  }
}

/**
 * Generate customer review suggestions
 */
export async function generateCustomerReview(options: {
  businessName: string;
  serviceType: string;
  experience?: string;
  rating?: number;
  businessId?: string;
}): Promise<string[]> {
  const { businessName, serviceType, experience = 'good service', rating = 5, businessId } = options;
  
  // Check rate limit
  if (businessId && !checkRateLimit(businessId)) {
    console.warn(`Rate limit exceeded for business ${businessId}`);
    return getDefaultReviews(businessName, serviceType, rating);
  }
  
  // Check cache
  const cacheKey = `review:${businessName}:${serviceType}:${experience.substring(0, 50)}:${rating}`;
  const cached = getCachedResult(cacheKey);
  if (cached) {
    return cached.split('|||');
  }
  
  const sanitizedExp = sanitizeText(experience);
  
  // Customize prompt based on rating
  let toneGuidance = '';
  let experienceContext = '';
  
  if (rating >= 4) {
    toneGuidance = 'enthusiastic, grateful, highly satisfied';
    experienceContext = 'excellent service, friendly staff, would recommend to others';
  } else if (rating === 3) {
    toneGuidance = 'balanced, fair, objective';
    experienceContext = 'decent service with some room for improvement, average experience';
  } else {
    toneGuidance = 'honest, constructive, disappointed but fair';
    experienceContext = 'service below expectations, some issues that need addressing';
  }
  
  const prompt = `Generate exactly 3 unique, authentic Google reviews for "${businessName}" (a ${serviceType}).

This customer gave ${rating} stars.
Customer experience: ${sanitizedExp}
Overall tone: ${toneGuidance}
Context: ${experienceContext}

Requirements for each review:
- Sound natural and genuine, like a real customer wrote it
- Maximum 70 words each
- Different writing styles (casual, professional, enthusiastic)
- Match the ${rating}-star rating sentiment
- Mention specific aspects like service quality, staff attitude, or overall experience
- If rating is low (1-2), include constructive feedback without being harsh
- If rating is high (4-5), express genuine enthusiasm and recommend to others

Format: Provide exactly 3 reviews, separated by "|||" (three pipe characters).
Do not number them or add any labels.

Reviews:`;

  try {
    const response = await generateContent(prompt);
    const reviews = response
      .split('|||')
      .map(r => r.trim().replace(/^["'\d.\s]+|["']$/g, ''))
      .filter(r => r.length > 10)
      .slice(0, 3);
    
    // Ensure we have 3 reviews
    while (reviews.length < 3) {
      reviews.push(getDefaultReviews(businessName, serviceType, rating)[reviews.length] || 
        `Great experience at ${businessName}! Highly recommend.`);
    }
    
    cacheResult(cacheKey, reviews.join('|||'));
    return reviews;
  } catch (error) {
    console.error('Error generating customer reviews:', error);
    return getDefaultReviews(businessName, serviceType, rating);
  }
}

function getDefaultReviews(businessName: string, serviceType: string, rating: number = 5): string[] {
  if (rating >= 4) {
    return [
      `Had a wonderful experience at ${businessName}. The ${serviceType} service was excellent and the team was very professional. Would definitely recommend!`,
      `Great ${serviceType} service! ${businessName} exceeded my expectations. The staff was friendly and attentive. Will be coming back for sure.`,
      `Impressed with ${businessName}! Their ${serviceType} services are top-notch. Fast, efficient, and high quality. Five stars!`,
    ];
  } else if (rating === 3) {
    return [
      `${businessName} was okay. The ${serviceType} service was decent but nothing special. Room for improvement in some areas.`,
      `Average experience at ${businessName}. The ${serviceType} was fine, but I expected a bit more. Staff was helpful though.`,
      `Mixed feelings about ${businessName}. Some things were good, others could be better. Worth trying but manage expectations.`,
    ];
  } else {
    return [
      `My experience at ${businessName} wasn't great. The ${serviceType} service needs improvement. Hope they can address these issues.`,
      `Disappointed with ${businessName}. Expected better ${serviceType} service. The staff seemed overwhelmed.`,
      `Unfortunately, ${businessName} didn't meet expectations. Some issues with the ${serviceType} that need attention.`,
    ];
  }
}

/**
 * Analyze sentiment of a review text
 */
export async function analyzeSentiment(options: {
  reviewText: string;
  businessId?: string;
}): Promise<Sentiment> {
  const { reviewText, businessId } = options;
  
  // Check rate limit
  if (businessId && !checkRateLimit(businessId)) {
    return analyzeSentimentFallback(reviewText);
  }
  
  // Check cache
  const cacheKey = `sentiment:${reviewText.substring(0, 100)}`;
  const cached = getCachedResult(cacheKey);
  if (cached) return cached as Sentiment;
  
  const sanitizedText = sanitizeText(reviewText);
  
  const prompt = `Analyze the sentiment of this customer review and classify it as exactly one of: POSITIVE, NEUTRAL, or NEGATIVE.

Review: "${sanitizedText}"

Consider:
- Overall tone and emotion
- Word choice (positive/negative/neutral words)
- Star rating context if implied
- Customer satisfaction level

Respond with ONLY one word: POSITIVE, NEUTRAL, or NEGATIVE`;

  try {
    const response = await generateContent(prompt);
    const sentiment = response.trim().toUpperCase();
    
    if (['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(sentiment)) {
      cacheResult(cacheKey, sentiment);
      return sentiment as Sentiment;
    }
    
    // Try to extract sentiment if response is verbose
    if (sentiment.includes('POSITIVE')) return 'POSITIVE';
    if (sentiment.includes('NEGATIVE')) return 'NEGATIVE';
    return 'NEUTRAL';
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return analyzeSentimentFallback(reviewText);
  }
}

// Fallback sentiment analysis using keywords
function analyzeSentimentFallback(text: string): Sentiment {
  const lowerText = text.toLowerCase();
  
  const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 
    'best', 'recommend', 'awesome', 'perfect', 'outstanding', 'friendly', 'helpful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 
    'poor', 'disappointed', 'avoid', 'never', 'rude', 'slow', 'unprofessional'];
  
  const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
  
  if (positiveCount > negativeCount) return 'POSITIVE';
  if (negativeCount > positiveCount) return 'NEGATIVE';
  return 'NEUTRAL';
}

/**
 * Summarize multiple reviews
 */
export async function summarizeReviews(options: {
  reviews: Array<{ reviewText: string; rating: number }>;
  businessName?: string;
  businessId?: string;
}): Promise<string> {
  const { reviews, businessName = 'this business', businessId } = options;
  
  if (reviews.length === 0) {
    return 'No reviews available to summarize.';
  }
  
  // Check rate limit
  if (businessId && !checkRateLimit(businessId)) {
    return generateBasicSummary(reviews);
  }
  
  // Create cache key from review texts
  const reviewTexts = reviews.map(r => r.reviewText.substring(0, 30)).join(',');
  const cacheKey = `summary:${businessName}:${reviewTexts}`;
  const cached = getCachedResult(cacheKey);
  if (cached) return cached;
  
  const formattedReviews = reviews
    .slice(0, 20) // Limit to 20 reviews for API
    .map((r, i) => `${i + 1}. [${r.rating}★] ${sanitizeText(r.reviewText).substring(0, 200)}`)
    .join('\n');
  
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  
  const prompt = `Summarize the following ${reviews.length} customer reviews for "${businessName}".

Average rating: ${avgRating.toFixed(1)} stars

Reviews:
${formattedReviews}

Create a concise summary (2-3 sentences) that:
- Highlights common positive themes
- Mentions any recurring concerns
- Provides actionable insights for the business owner
- Does not list individual reviews

Summary:`;

  try {
    const summary = await generateContent(prompt);
    const cleanedSummary = summary.trim();
    cacheResult(cacheKey, cleanedSummary);
    return cleanedSummary;
  } catch (error) {
    console.error('Error summarizing reviews:', error);
    return generateBasicSummary(reviews);
  }
}

// Generate basic summary without AI
function generateBasicSummary(reviews: Array<{ reviewText: string; rating: number }>): string {
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const positiveCount = reviews.filter(r => r.rating >= 4).length;
  const negativeCount = reviews.filter(r => r.rating <= 2).length;
  
  let summary = `Based on ${reviews.length} reviews with an average rating of ${avgRating.toFixed(1)} stars. `;
  
  if (positiveCount > negativeCount * 2) {
    summary += 'Customers generally express high satisfaction with the service.';
  } else if (negativeCount > positiveCount) {
    summary += 'There are some areas that may need attention based on customer feedback.';
  } else {
    summary += 'Customer feedback shows mixed experiences with room for improvement.';
  }
  
  return summary;
}

/**
 * Check if Gemini is properly configured
 */
export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}

/**
 * Get rate limit status for a business
 */
export function getRateLimitStatus(businessId: string): {
  remaining: number;
  resetTime: number | null;
} {
  const now = Date.now();
  const limit = rateLimitMap.get(businessId);
  
  if (!limit || now > limit.resetTime) {
    return { remaining: RATE_LIMIT_MAX, resetTime: null };
  }
  
  return {
    remaining: Math.max(0, RATE_LIMIT_MAX - limit.count),
    resetTime: limit.resetTime,
  };
}
