import { requireAuth, successResponse, errorResponse } from '@/lib/session';
import { getUserById } from '@/services/userService';
import { getTrialStatus } from '@/services/trialService';

export async function GET() {
  try {
    const { error, auth } = await requireAuth();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const user = await getUserById(auth.user.id);
    
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const trialStatus = await getTrialStatus(auth.user.id);

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      trial: trialStatus,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse('Failed to get user', 500);
  }
}
