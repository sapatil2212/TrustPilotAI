import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/session';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// GET /api/auth/profile - Get current user profile
export async function GET() {
  try {
    const { error, auth } = await requireAuth();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        trialEndsAt: true,
        isTrialExpired: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse('Failed to get profile', 500);
  }
}

// PATCH /api/auth/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const { error, auth } = await requireAuth();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    
    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const { name, email } = validationResult.data;
    const updateData: { name?: string; email?: string } = {};

    if (name) {
      updateData.name = name;
    }

    if (email && email !== auth.user.email) {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return errorResponse('Email is already in use', 400);
      }

      updateData.email = email;
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return successResponse({
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('Failed to update profile', 500);
  }
}

// POST /api/auth/profile - Update password
export async function POST(request: NextRequest) {
  try {
    const { error, auth } = await requireAuth();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    
    // Validate input
    const validationResult = updatePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { password: true },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return errorResponse('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: auth.user.id },
      data: { password: hashedPassword },
    });

    return successResponse({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);
    return errorResponse('Failed to update password', 500);
  }
}
