import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/session';
import {
  getNotificationsByUserId,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from '@/services/notificationService';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const { error, auth } = await requireAuth();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const [notifications, unreadCount] = await Promise.all([
      getNotificationsByUserId(auth.user.id, { unreadOnly, limit }),
      getUnreadNotificationCount(auth.user.id),
    ]);

    return successResponse({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse('Failed to get notifications', 500);
  }
}

// POST /api/notifications - Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const { error, auth } = await requireAuth();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    
    if (body.action === 'mark-all-read') {
      const count = await markAllNotificationsAsRead(auth.user.id);
      return successResponse({
        message: 'All notifications marked as read',
        markedCount: count,
      });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    console.error('Update notifications error:', error);
    return errorResponse('Failed to update notifications', 500);
  }
}
