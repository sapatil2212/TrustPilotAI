import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse } from '@/lib/session';
import { z } from 'zod';
import { activateUser, getUserById } from '@/services/userService';

const activateUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// POST /api/admin/user/activate - Activate a user
export async function POST(request: NextRequest) {
  try {
    const { error, auth } = await requireAdmin();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    
    // Validate input
    const validationResult = activateUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse('Invalid user ID', 400);
    }

    const { userId } = validationResult.data;

    // Check if user exists
    const user = await getUserById(userId);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const activatedUser = await activateUser(userId);

    return successResponse({
      message: 'User activated successfully',
      user: {
        id: activatedUser.id,
        email: activatedUser.email,
        isActive: activatedUser.isActive,
      },
    });
  } catch (error) {
    console.error('Activate user error:', error);
    return errorResponse('Failed to activate user', 500);
  }
}
