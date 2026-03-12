import { NextRequest } from 'next/server';
import { requireActiveSubscription, successResponse, errorResponse } from '@/lib/session';
import prisma from '@/lib/prisma';
import { 
  generateAndUploadQRCode, 
  generateQRCodePNG, 
  generateQRCodeSVG 
} from '@/lib/cloudinary';
import { z } from 'zod';

const generateQRSchema = z.object({
  businessId: z.string().uuid('Invalid business ID').optional(),
  format: z.enum(['png', 'svg', 'both']).default('both'),
});

// Get the base URL from environment or use a default
function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

// POST /api/business/generate-qr - Generate QR code for business review funnel
export async function POST(request: NextRequest) {
  try {
    const { error, auth } = await requireActiveSubscription();
    
    if (error) return error;
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    
    // Validate input
    const validationResult = generateQRSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const { businessId, format } = validationResult.data;

    let targetBusinessId: string;
    let businessName: string;

    if (businessId) {
      // Get business by ID
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: {
          id: true,
          userId: true,
          businessName: true,
          placeId: true,
          isConnected: true,
        },
      });

      if (!business) {
        return errorResponse('Business not found', 404);
      }

      // Verify ownership
      if (business.userId !== auth.user.id && auth.user.role !== 'ADMIN') {
        return errorResponse('Access denied', 403);
      }

      if (!business.isConnected || !business.placeId) {
        return errorResponse('Please connect your business with Place ID first', 400);
      }

      targetBusinessId = business.id;
      businessName = business.businessName;
    } else {
      // Get user's primary business
      const business = await prisma.business.findFirst({
        where: { userId: auth.user.id },
        select: {
          id: true,
          businessName: true,
          placeId: true,
          isConnected: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (!business) {
        return errorResponse('No business found. Please add a business first.', 400);
      }

      if (!business.isConnected || !business.placeId) {
        return errorResponse('Please connect your business with Place ID first', 400);
      }

      targetBusinessId = business.id;
      businessName = business.businessName;
    }

    // Generate the review funnel URL (customers will scan this QR)
    const baseUrl = getBaseUrl();
    const reviewFunnelUrl = `${baseUrl}/review/${targetBusinessId}`;

    // Generate QR codes based on format
    const result: {
      qrCodeUrl?: string | null;
      pngDataUrl?: string | null;
      svgString?: string | null;
      reviewFunnelUrl: string;
      businessName: string;
    } = { reviewFunnelUrl, businessName };

    if (format === 'png' || format === 'both') {
      result.pngDataUrl = await generateQRCodePNG(reviewFunnelUrl);
    }

    if (format === 'svg' || format === 'both') {
      result.svgString = await generateQRCodeSVG(reviewFunnelUrl);
    }

    // Upload to Cloudinary and update database
    const qrCodeUrl = await generateAndUploadQRCode(reviewFunnelUrl);
    
    if (qrCodeUrl) {
      await prisma.business.update({
        where: { id: targetBusinessId },
        data: { qrCodeUrl },
      });
      result.qrCodeUrl = qrCodeUrl;
    }

    return successResponse(result);
  } catch (error) {
    console.error('Generate QR code error:', error);
    return errorResponse('Failed to generate QR code', 500);
  }
}
