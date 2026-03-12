import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/session';
import { processAllBusinessReviews } from '@/services/reviewMonitorService';

// POST /api/cron/sync-reviews - Sync reviews for all businesses (called every 6 hours)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional security layer)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse('Unauthorized', 401);
    }

    const result = await processAllBusinessReviews();

    return successResponse({
      message: 'Review sync complete',
      processed: result.processed,
      newReviews: result.newReviews,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync reviews cron error:', error);
    return errorResponse('Failed to sync reviews', 500);
  }
}
