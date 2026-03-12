import { NextRequest } from 'next/server';
import { 
  requireActiveSubscription, 
  successResponse, 
  errorResponse 
} from '@/lib/session';
import { 
  getBusinessById, 
  regenerateQRCode
} from '@/services/businessService';

interface RouteParams {
  params: Promise<{ businessId: string }>;
}

// POST /api/business/[businessId]/qr - Regenerate QR code for a business
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { error, auth } = await requireActiveSubscription();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const { businessId } = await params;
    const business = await getBusinessById(businessId);

    if (!business) {
      return errorResponse('Business not found', 404);
    }

    // Check ownership
    if (business.userId !== auth.user.id && auth.user.role !== 'ADMIN') {
      return errorResponse('Not authorized to update this business', 403);
    }

    const updatedBusiness = await regenerateQRCode(businessId);

    if (!updatedBusiness) {
      return errorResponse('Failed to regenerate QR code', 500);
    }

    return successResponse({
      message: 'QR code regenerated successfully',
      qrCodeUrl: updatedBusiness.qrCodeUrl,
    });
  } catch (error) {
    console.error('Regenerate QR code error:', error);
    return errorResponse('Failed to regenerate QR code', 500);
  }
}
