import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse } from '@/lib/session';
import { z } from 'zod';
import { extendTrial } from '@/services/trialService';
import { getUserById } from '@/services/userService';

const extendTrialSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  days: z.number().int().positive().max(365, 'Cannot extend more than 365 days'),
});

// POST /api/admin/user/extend-trial - Extend a user's trial
export async function POST(request: NextRequest) {
  try {
    const { error, auth } = await requireAdmin();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    
    // Validate input
    const validationResult = extendTrialSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.flatten().fieldErrors.userId?.[0] ||
        validationResult.error.flatten().fieldErrors.days?.[0] ||
        'Validation failed',
        400
      );
    }

    const { userId, days } = validationResult.data;

    // Check if user exists
    const user = await getUserById(userId);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Don't allow extending trial for admins
    if (user.role === 'ADMIN') {
      return errorResponse('Cannot extend trial for admin users', 403);
    }

    const newTrialStatus = await extendTrial(userId, days);

    return successResponse({
      message: `Trial extended by ${days} days`,
      trial: newTrialStatus,
    });
  } catch (error) {
    console.error('Extend trial error:', error);
    return errorResponse('Failed to extend trial', 500);
  }
}
