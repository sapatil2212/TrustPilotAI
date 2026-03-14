import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { connectBusinessSchema } from '@/lib/validators';
import { generateAndUploadQRCode } from '@/lib/cloudinary';
import { syncBusinessReviews } from '@/services/reviewFetcherService';

// Get the base URL
function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = connectBusinessSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { placeId, businessName } = validation.data;

    // Generate Google review link
    const reviewLink = `https://search.google.com/local/writereview?placeid=${placeId}`;

    // Check if a business with this Place ID already exists for this user
    const existingWithPlaceId = await prisma.business.findFirst({
      where: { 
        userId: session.user.id,
        placeId: placeId,
      },
    });

    if (existingWithPlaceId) {
      return NextResponse.json(
        { error: 'This business is already connected' },
        { status: 400 }
      );
    }

    // Check if user has an unconnected business to update, otherwise create new
    const business = await prisma.business.findFirst({
      where: { 
        userId: session.user.id,
        isConnected: false,
      },
    });

    let updatedBusiness;

    if (business) {
      // Update existing business with Place ID
      updatedBusiness = await prisma.business.update({
        where: { id: business.id },
        data: {
          placeId,
          reviewLink,
          isConnected: true,
          ...(businessName && { businessName }),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new business with Place ID
      updatedBusiness = await prisma.business.create({
        data: {
          userId: session.user.id,
          businessName: businessName || 'My Business',
          placeId,
          reviewLink,
          isConnected: true,
        },
      });
    }

    // Auto-generate QR code after connecting
    let qrCodeUrl = updatedBusiness.qrCodeUrl;
    try {
      const baseUrl = getBaseUrl();
      const reviewFunnelUrl = `${baseUrl}/review/${updatedBusiness.id}`;
      qrCodeUrl = await generateAndUploadQRCode(reviewFunnelUrl);
      
      if (qrCodeUrl) {
        await prisma.business.update({
          where: { id: updatedBusiness.id },
          data: { qrCodeUrl },
        });
      }
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
      // Continue even if QR generation fails
    }

    // Auto-sync reviews after connecting (non-blocking)
    let syncResult = { newReviews: 0, totalReviews: 0 };
    try {
      syncResult = await syncBusinessReviews(updatedBusiness.id, { processWithAI: true });
      
      // Update business with new review counts
      await prisma.business.update({
        where: { id: updatedBusiness.id },
        data: {
          totalReviews: syncResult.totalReviews,
          lastSyncAt: new Date(),
        },
      });
    } catch (syncError) {
      console.error('Auto-sync reviews error:', syncError);
      // Continue even if sync fails - user can manually sync later
    }

    return NextResponse.json({
      message: 'Business connected successfully',
      business: {
        id: updatedBusiness.id,
        businessName: updatedBusiness.businessName,
        businessType: updatedBusiness.businessType,
        placeId: updatedBusiness.placeId,
        reviewLink: updatedBusiness.reviewLink,
        qrCodeUrl: qrCodeUrl,
        isConnected: updatedBusiness.isConnected,
        totalReviews: syncResult.totalReviews,
        newReviews: syncResult.newReviews,
      },
    });
  } catch (error) {
    console.error('Connect business error:', error);
    return NextResponse.json(
      { error: 'Failed to connect business' },
      { status: 500 }
    );
  }
}
