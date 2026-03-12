import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { SignupInput, BusinessTypeEnum } from '@/lib/validators';
import { sendWelcomeEmail } from '@/lib/email';

const TRIAL_DAYS = 14;

export interface UserWithTrial {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  trialEndsAt: Date;
  isTrialExpired: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface UserWithBusiness extends UserWithTrial {
  business?: {
    id: string;
    businessName: string;
    businessType: string;
  };
}

export async function createUser(data: SignupInput): Promise<UserWithBusiness> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Check if email was verified
  const emailVerification = await prisma.emailVerification.findFirst({
    where: {
      email: data.email,
      verified: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!emailVerification) {
    throw new Error('Email not verified. Please verify your email first.');
  }

  // Hash password
  const hashedPassword = await hash(data.password, 12);

  // Calculate trial end date
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  // Create user with business in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'USER',
        isEmailVerified: true,
        trialEndsAt,
        isTrialExpired: false,
        isActive: true,
      },
    });

    // Create business
    const business = await tx.business.create({
      data: {
        userId: user.id,
        businessName: data.businessName,
        businessType: data.businessType as BusinessTypeEnum,
        isConnected: false,
      },
    });

    // Clean up verification records
    await tx.emailVerification.deleteMany({
      where: { email: data.email },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      trialEndsAt: user.trialEndsAt,
      isTrialExpired: user.isTrialExpired,
      isActive: user.isActive,
      createdAt: user.createdAt,
      business: {
        id: business.id,
        businessName: business.businessName,
        businessType: business.businessType,
      },
    };
  });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(result.email, result.name).catch(console.error);

  return result;
}

export async function getUserById(id: string): Promise<UserWithTrial | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      trialEndsAt: true,
      isTrialExpired: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function getUserByEmail(email: string): Promise<UserWithTrial | null> {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      trialEndsAt: true,
      isTrialExpired: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function updateUser(
  id: string,
  data: Partial<{ name: string; email: string }>
): Promise<UserWithTrial> {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      trialEndsAt: true,
      isTrialExpired: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function deactivateUser(id: string): Promise<UserWithTrial> {
  return prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      trialEndsAt: true,
      isTrialExpired: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function activateUser(id: string): Promise<UserWithTrial> {
  return prisma.user.update({
    where: { id },
    data: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      trialEndsAt: true,
      isTrialExpired: true,
      isActive: true,
      createdAt: true,
    },
  });
}
