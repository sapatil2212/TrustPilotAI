import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { incrementQRScans } from '@/services/systemStatsService';

interface RouteParams {
  params: Promise<{ businessId: string }>;
}

// GET /api/review-funnel/[businessId]/info - Public endpoint for customers
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { businessId } = await params;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        businessName: true,
        businessType: true,
        reviewLink: true,
        isConnected: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    if (!business.isConnected || !business.reviewLink) {
      return NextResponse.json(
        { error: 'Business is not connected to Google' },
        { status: 400 }
      );
    }

    // Track QR scan
    await incrementQRScans().catch(console.error);

    return NextResponse.json({
      business: {
        id: business.id,
        businessName: business.businessName,
        businessType: business.businessType,
        reviewLink: business.reviewLink,
      },
    });
  } catch (error) {
    console.error('Get business info error:', error);
    return NextResponse.json(
      { error: 'Failed to get business info' },
      { status: 500 }
    );
  }
}
