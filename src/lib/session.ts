import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';
import prisma from './prisma';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthenticatedRequest {
  user: SessionUser;
  isTrialExpired: boolean;
  trialDaysRemaining: number;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedRequest | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      trialEndsAt: true,
      isTrialExpired: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  // Calculate trial status
  const now = new Date();
  const trialEndsAt = new Date(user.trialEndsAt);
  const isTrialExpired = now > trialEndsAt;
  const trialDaysRemaining = Math.max(
    0,
    Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Update trial expired status if needed
  if (isTrialExpired && !user.isTrialExpired) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isTrialExpired: true },
    });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    isTrialExpired,
    trialDaysRemaining,
  };
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message, code: 'UNAUTHORIZED' },
    { status: 401 }
  );
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json(
    { error: message, code: 'FORBIDDEN' },
    { status: 403 }
  );
}

export function trialExpiredResponse() {
  return NextResponse.json(
    { 
      error: 'Your trial has expired. Please upgrade to continue.', 
      code: 'TRIAL_EXPIRED' 
    },
    { status: 402 }
  );
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    { error: message, code: 'ERROR' },
    { status }
  );
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export async function requireAuth() {
  const auth = await getAuthenticatedUser();
  
  if (!auth) {
    return { error: unauthorizedResponse(), auth: null };
  }

  return { error: null, auth };
}

export async function requireAdmin() {
  const auth = await getAuthenticatedUser();
  
  if (!auth) {
    return { error: unauthorizedResponse(), auth: null };
  }

  if (auth.user.role !== 'ADMIN') {
    return { error: forbiddenResponse('Admin access required'), auth: null };
  }

  return { error: null, auth };
}

export async function requireActiveSubscription() {
  const auth = await getAuthenticatedUser();
  
  if (!auth) {
    return { error: unauthorizedResponse(), auth: null };
  }

  // Admins bypass trial check
  if (auth.user.role === 'ADMIN') {
    return { error: null, auth };
  }

  if (auth.isTrialExpired) {
    return { error: trialExpiredResponse(), auth: null };
  }

  return { error: null, auth };
}
