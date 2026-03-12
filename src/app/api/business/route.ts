import { NextRequest } from 'next/server';
import { 
  requireActiveSubscription, 
  successResponse, 
  errorResponse 
} from '@/lib/session';
import { createBusinessSchema } from '@/lib/validators';
import { 
  createBusiness, 
  getBusinessesByUserId 
} from '@/services/businessService';

// GET /api/business - Get all businesses for current user
export async function GET() {
  try {
    const { error, auth } = await requireActiveSubscription();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const businesses = await getBusinessesByUserId(auth.user.id);

    return successResponse({ businesses });
  } catch (error) {
    console.error('Get businesses error:', error);
    return errorResponse('Failed to get businesses', 500);
  }
}

// POST /api/business - Create a new business
export async function POST(request: NextRequest) {
  try {
    const { error, auth } = await requireActiveSubscription();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    
    // Validate input
    const validationResult = createBusinessSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.flatten().fieldErrors.businessName?.[0] ||
        validationResult.error.flatten().fieldErrors.placeId?.[0] ||
        'Validation failed',
        400
      );
    }

    const business = await createBusiness(auth.user.id, validationResult.data);

    return successResponse(
      {
        message: 'Business created successfully',
        business,
      },
      201
    );
  } catch (error) {
    console.error('Create business error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Business with this Place ID already exists') {
        return errorResponse(error.message, 409);
      }
    }

    return errorResponse('Failed to create business', 500);
  }
}
