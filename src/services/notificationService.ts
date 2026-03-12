import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

// Notification types matching Prisma enum
export type NotificationType = 'GENERAL' | 'NEW_REVIEW' | 'TRIAL_EXPIRY_WARNING' | 'AI_REPLY_READY';

export interface NotificationData {
  title: string;
  message: string;
  type?: NotificationType;
}

export interface NotificationWithTimestamp {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  userId: string;
}

/**
 * Create a new notification
 */
export async function createNotification(
  userId: string,
  data: NotificationData
): Promise<NotificationWithTimestamp> {
  return prisma.notification.create({
    data: {
      userId,
      title: data.title,
      message: data.message,
      type: data.type || 'GENERAL',
      isRead: false,
    },
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      createdAt: true,
      userId: true,
    },
  });
}

/**
 * Get all notifications for a user
 */
export async function getNotificationsByUserId(
  userId: string,
  options: { unreadOnly?: boolean; limit?: number; type?: NotificationType } = {}
): Promise<NotificationWithTimestamp[]> {
  const { unreadOnly = false, limit = 50, type } = options;

  return prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
      ...(type ? { type } : {}),
    },
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      createdAt: true,
      userId: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  id: string
): Promise<NotificationWithTimestamp> {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      createdAt: true,
      userId: true,
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return result.count;
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<void> {
  await prisma.notification.delete({
    where: { id },
  });
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

/**
 * Create system notification for all users
 */
export async function createSystemNotification(
  data: NotificationData,
  userIds?: string[]
): Promise<number> {
  let targetUserIds: string[] = userIds || [];

  if (targetUserIds.length === 0) {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    targetUserIds = users.map((u: { id: string }) => u.id);
  }

  const notifications = targetUserIds.map((userId: string) => ({
    userId,
    title: data.title,
    message: data.message,
    type: data.type || 'GENERAL',
    isRead: false,
  }));

  const result = await prisma.notification.createMany({
    data: notifications,
  });

  return result.count;
}

/**
 * Create notification for new review
 */
export async function createNewReviewNotification(
  userId: string,
  reviewerName: string,
  businessName: string,
  rating: number
): Promise<NotificationWithTimestamp> {
  return createNotification(userId, {
    title: 'New Review Received',
    message: `${reviewerName} left a ${rating}-star review for ${businessName}`,
    type: 'NEW_REVIEW',
  });
}

/**
 * Create notification for trial expiry warning
 */
export async function createTrialExpiryWarning(
  userId: string,
  daysRemaining: number
): Promise<NotificationWithTimestamp> {
  const message = daysRemaining === 1
    ? 'Your trial expires tomorrow! Upgrade now to continue using TrustPilotAI.'
    : `Your trial expires in ${daysRemaining} days. Upgrade now to continue using TrustPilotAI.`;

  return createNotification(userId, {
    title: 'Trial Expiring Soon',
    message,
    type: 'TRIAL_EXPIRY_WARNING',
  });
}

/**
 * Create notification for AI reply ready
 */
export async function createAIReplyReadyNotification(
  userId: string,
  businessName: string,
  reviewerName: string
): Promise<NotificationWithTimestamp> {
  return createNotification(userId, {
    title: 'AI Reply Suggestion Ready',
    message: `AI has generated a reply suggestion for ${reviewerName}'s review on ${businessName}`,
    type: 'AI_REPLY_READY',
  });
}

/**
 * Send email notification
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  await sendEmail({ to, subject, html });
}
