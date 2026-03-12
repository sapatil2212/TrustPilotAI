import { NextRequest } from 'next/server';
import { requireAdmin, successResponse, errorResponse } from '@/lib/session';
import { deactivateUserSchema } from '@/lib/validators';
import { deactivateUser, getUserById } from '@/services/userService';

// POST /api/admin/user/deactivate - Deactivate a user
export async function POST(request: NextRequest) {
  try {
    const { error, auth } = await requireAdmin();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    
    // Validate input
    const validationResult = deactivateUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse('Invalid user ID', 400);
    }

    const { userId } = validationResult.data;

    // Check if user exists
    const user = await getUserById(userId);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Don't allow deactivating admins
    if (user.role === 'ADMIN') {
      return errorResponse('Cannot deactivate admin users', 403);
    }

    const deactivatedUser = await deactivateUser(userId);

    return successResponse({
      message: 'User deactivated successfully',
      user: {
        id: deactivatedUser.id,
        email: deactivatedUser.email,
        isActive: deactivatedUser.isActive,
      },
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    return errorResponse('Failed to deactivate user', 500);
  }
}
