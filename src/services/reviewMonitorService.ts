import prisma from '@/lib/prisma';
import { syncBusinessReviews } from './reviewFetcherService';
import { batchGenerateReplies } from './aiService';
import { 
  createNewReviewNotification, 
  createAIReplyReadyNotification,
  sendEmailNotification 
} from './notificationService';
import * as systemStats from './systemStatsService';

// Sync interval in hours
const SYNC_INTERVAL_HOURS = 6;

// Check if business needs sync
export function needsSync(lastSyncAt: Date | null): boolean {
  if (!lastSyncAt) return true;
  
  const hoursSinceLastSync = (Date.now() - lastSyncAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastSync >= SYNC_INTERVAL_HOURS;
}

// Process all businesses that need review sync
export async function processAllBusinessReviews(): Promise<{
  processed: number;
  newReviews: number;
  errors: number;
}> {
  const businesses = await prisma.business.findMany({
    where: {
      user: {
        isActive: true,
        isTrialExpired: false,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
  
  let processed = 0;
  let totalNewReviews = 0;
  let errors = 0;
  
  for (const business of businesses) {
    // Skip if recently synced
    if (!needsSync(business.lastSyncAt)) {
      continue;
    }
    
    try {
      // Track review fetch
      await systemStats.incrementReviewFetches();
      
      const result = await syncBusinessReviews(business.id);
      processed++;
      totalNewReviews += result.newReviews;
      
      // If new reviews found, generate AI replies and notify
      if (result.newReviews > 0) {
        await handleNewReviews(business, result.newReviews);
      }
    } catch (error) {
      console.error(`Error syncing business ${business.id}:`, error);
      errors++;
    }
    
    // Rate limiting: wait between businesses
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return { processed, newReviews: totalNewReviews, errors };
}

// Handle new reviews: generate AI replies and send notifications
async function handleNewReviews(
  business: {
    id: string;
    businessName: string;
    user: { id: string; email: string; name: string };
  },
  newReviewCount: number
): Promise<void> {
  // Generate AI replies for new reviews
  await batchGenerateReplies(business.id, { onlyMissing: true });
  
  // Get the newest reviews for notification
  const newReviews = await prisma.review.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: 'desc' },
    take: newReviewCount,
  });
  
  // Create notifications for each new review
  for (const review of newReviews) {
    // Notification for new review
    await createNewReviewNotification(
      business.user.id,
      review.reviewerName,
      business.businessName,
      review.rating
    );
    
    // Notification for AI reply if generated
    if (review.aiReplySuggestion) {
      await createAIReplyReadyNotification(
        business.user.id,
        business.businessName,
        review.reviewerName
      );
    }
    
    // Send email notification
    await sendReviewAlertEmail(business.user, business.businessName, review);
  }
}

// Send email alert for new review
async function sendReviewAlertEmail(
  user: { email: string; name: string },
  businessName: string,
  review: {
    reviewerName: string;
    rating: number;
    reviewText: string | null;
    aiReplySuggestion: string | null;
  }
): Promise<void> {
  const subject = `New Google Review Received - ${businessName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">New Review Alert</h2>
      <p>Hi ${user.name},</p>
      <p>Your business <strong>${businessName}</strong> received a new Google review!</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Reviewer:</strong> ${review.reviewerName}</p>
        <p><strong>Rating:</strong> ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</p>
        <p><strong>Review:</strong></p>
        <p style="font-style: italic;">"${review.reviewText || 'No written review'}"</p>
      </div>
      
      ${review.aiReplySuggestion ? `
        <div style="background: #e8f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>AI-Suggested Reply:</strong></p>
          <p>${review.aiReplySuggestion}</p>
        </div>
      ` : ''}
      
      <p>Log in to your dashboard to respond to this review.</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        - The TrustPilotAI Team
      </p>
    </div>
  `;
  
  try {
    await sendEmailNotification(user.email, subject, html);
  } catch (error) {
    console.error('Error sending review alert email:', error);
  }
}

// Get monitoring status for a business
export async function getMonitoringStatus(businessId: string): Promise<{
  lastSyncAt: Date | null;
  nextSyncAt: Date | null;
  totalReviews: number;
  averageRating: number;
  recentActivity: number;
}> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });
  
  if (!business) {
    throw new Error('Business not found');
  }
  
  // Count reviews in last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const recentActivity = await prisma.review.count({
    where: {
      businessId,
      createdAt: { gte: weekAgo },
    },
  });
  
  const nextSyncAt = business.lastSyncAt
    ? new Date(business.lastSyncAt.getTime() + SYNC_INTERVAL_HOURS * 60 * 60 * 1000)
    : null;
  
  return {
    lastSyncAt: business.lastSyncAt,
    nextSyncAt,
    totalReviews: business.totalReviews,
    averageRating: business.averageRating,
    recentActivity,
  };
}

// Manually trigger sync for a business
export async function triggerManualSync(businessId: string): Promise<{
  newReviews: number;
  totalReviews: number;
}> {
  return syncBusinessReviews(businessId);
}
