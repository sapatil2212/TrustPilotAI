import { requireAdmin, successResponse, errorResponse } from '@/lib/session';
import { getSystemStats } from '@/services/systemStatsService';

// GET /api/admin/system-stats - Get system usage statistics
export async function GET() {
  try {
    const { error, auth } = await requireAdmin();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const stats = await getSystemStats();

    return successResponse({
      aiRequestsCount: stats.totalAIRequests,
      reviewFetchCount: stats.totalReviewFetches,
      qrScansCount: stats.totalQRScans,
      apiCallsCount: stats.totalAPICalls,
      todayStats: stats.todayStats ? {
        aiRequests: stats.todayStats.aiRequestCount,
        reviewFetches: stats.todayStats.reviewFetchCount,
        qrScans: stats.todayStats.qrScanCount,
        apiCalls: stats.todayStats.apiCallCount,
        date: stats.todayStats.date,
      } : null,
      last7Days: stats.last7DaysStats.map(s => ({
        date: s.date,
        aiRequests: s.aiRequestCount,
        reviewFetches: s.reviewFetchCount,
        qrScans: s.qrScanCount,
        apiCalls: s.apiCallCount,
      })),
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    return errorResponse('Failed to get system stats', 500);
  }
}
