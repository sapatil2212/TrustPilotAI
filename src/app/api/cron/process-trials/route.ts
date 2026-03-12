import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/session';
import { processExpiredTrials } from '@/services/trialService';

// POST /api/cron/process-trials - Process expired trials (called by cron job)
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional security layer)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse('Unauthorized', 401);
    }

    const processedCount = await processExpiredTrials();

    return successResponse({
      message: 'Trial processing complete',
      processedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Process trials cron error:', error);
    return errorResponse('Failed to process trials', 500);
  }
}
