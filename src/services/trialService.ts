import prisma from '@/lib/prisma';
import { sendTrialExpiryEmail } from '@/lib/email';
import { createNotification } from './notificationService';

export interface TrialStatus {
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
  trialEndsAt: Date;
}

/**
 * Calculate trial status for a user
 */
export function calculateTrialStatus(trialEndsAt: Date): TrialStatus {
  const now = new Date();
  const endDate = new Date(trialEndsAt);
  const isExpired = now > endDate;
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  return {
    isActive: !isExpired,
    isExpired,
    daysRemaining,
    trialEndsAt: endDate,
  };
}

/**
 * Get trial status for a user
 */
export async function getTrialStatus(userId: string): Promise<TrialStatus | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialEndsAt: true },
  });

  if (!user) {
    return null;
  }

  return calculateTrialStatus(user.trialEndsAt);
}

/**
 * Check if user's trial has expired and update status
 */
export async function checkAndUpdateTrialStatus(userId: string): Promise<TrialStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      trialEndsAt: true,
      isTrialExpired: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const status = calculateTrialStatus(user.trialEndsAt);

  // If trial just expired, update user and send notifications
  if (status.isExpired && !user.isTrialExpired) {
    await prisma.user.update({
      where: { id: userId },
      data: { isTrialExpired: true },
    });

    // Send trial expiry email
    sendTrialExpiryEmail(user.email, user.name).catch(console.error);

    // Create notification
    await createNotification(userId, {
      title: 'Trial Expired',
      message: 'Your 14-day free trial has ended. Please upgrade your plan to continue using TrustPilotAI.',
    });
  }

  return status;
}

/**
 * Get all users with expired trials
 */
export async function getExpiredTrialUsers() {
  const now = new Date();
  
  return prisma.user.findMany({
    where: {
      trialEndsAt: { lt: now },
      isTrialExpired: false,
      role: 'USER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      trialEndsAt: true,
    },
  });
}

/**
 * Process expired trials (to be run by a cron job)
 */
export async function processExpiredTrials(): Promise<number> {
  const expiredUsers = await getExpiredTrialUsers();
  let processed = 0;

  for (const user of expiredUsers) {
    try {
      await checkAndUpdateTrialStatus(user.id);
      processed++;
    } catch (error) {
      console.error(`Failed to process trial for user ${user.id}:`, error);
    }
  }

  return processed;
}

/**
 * Extend trial period for a user (admin function)
 */
export async function extendTrial(userId: string, days: number): Promise<TrialStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialEndsAt: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const newTrialEndsAt = new Date(user.trialEndsAt);
  newTrialEndsAt.setDate(newTrialEndsAt.getDate() + days);

  await prisma.user.update({
    where: { id: userId },
    data: {
      trialEndsAt: newTrialEndsAt,
      isTrialExpired: false,
    },
  });

  return calculateTrialStatus(newTrialEndsAt);
}

/**
 * Get trial statistics
 */
export async function getTrialStats() {
  const now = new Date();

  const [totalUsers, activeTrials, expiredTrials] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({
      where: {
        role: 'USER',
        trialEndsAt: { gt: now },
        isTrialExpired: false,
      },
    }),
    prisma.user.count({
      where: {
        role: 'USER',
        isTrialExpired: true,
      },
    }),
  ]);

  return {
    totalUsers,
    activeTrials,
    expiredTrials,
  };
}
