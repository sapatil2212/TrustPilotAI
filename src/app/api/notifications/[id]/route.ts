import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/session';
import {
  markNotificationAsRead,
  deleteNotification,
} from '@/services/notificationService';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

// PATCH /api/notifications/[id] - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { error, auth } = await requireAuth();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    if (notification.userId !== auth.user.id) {
      return errorResponse('Not authorized to access this notification', 403);
    }

    const updatedNotification = await markNotificationAsRead(params.id);

    return successResponse({
      message: 'Notification marked as read',
      notification: updatedNotification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return errorResponse('Failed to update notification', 500);
  }
}

// DELETE /api/notifications/[id] - Delete a notification
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { error, auth } = await requireAuth();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    if (notification.userId !== auth.user.id) {
      return errorResponse('Not authorized to delete this notification', 403);
    }

    await deleteNotification(params.id);

    return successResponse({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return errorResponse('Failed to delete notification', 500);
  }
}
