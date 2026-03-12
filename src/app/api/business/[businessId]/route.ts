import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncBusinessReviews } from '@/services/reviewFetcherService';

interface RouteParams {
  params: Promise<{ businessId: string }>;
}

// GET /api/business/[businessId] - Get single business details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await params;

    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: session.user.id,
      },
      include: {
        _count: { select: { reviews: true } },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({ business });
  } catch (error) {
    console.error('Get business error:', error);
    return NextResponse.json({ error: 'Failed to get business' }, { status: 500 });
  }
}

// PATCH /api/business/[businessId] - Update business (disconnect)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await params;
    const body = await request.json();

    // Verify ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Update business
    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        ...(body.isConnected !== undefined && { isConnected: body.isConnected }),
        ...(body.businessName && { businessName: body.businessName }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Business updated',
      business: updated,
    });
  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
  }
}

// DELETE /api/business/[businessId] - Delete business and its reviews
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await params;

    // Verify ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Delete all reviews first (cascade)
    await prisma.review.deleteMany({
      where: { businessId },
    });

    // Delete review funnel sessions
    await prisma.reviewFunnelSession.deleteMany({
      where: { businessId },
    });

    // Delete review analytics
    await prisma.reviewAnalytics.deleteMany({
      where: { businessId },
    });

    // Delete the business
    await prisma.business.delete({
      where: { id: businessId },
    });

    return NextResponse.json({
      message: 'Business deleted successfully',
    });
  } catch (error) {
    console.error('Delete business error:', error);
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 });
  }
}

// POST /api/business/[businessId] - Sync reviews for this business
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessId } = await params;

    // Verify ownership (admins can access any business)
    const isAdmin = session.user.role === 'ADMIN';
    const business = await prisma.business.findFirst({
      where: isAdmin ? { id: businessId } : {
        id: businessId,
        userId: session.user.id,
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (!business.placeId) {
      return NextResponse.json({ error: 'Business is not connected to Google' }, { status: 400 });
    }

    console.log('[API] Triggering sync for business:', business.businessName, 'placeId:', business.placeId);

    // Sync reviews
    const result = await syncBusinessReviews(businessId, { processWithAI: true });

    console.log('[API] Sync complete:', result);

    // Update business stats
    await prisma.business.update({
      where: { id: businessId },
      data: {
        totalReviews: result.totalReviews,
        lastSyncAt: new Date(),
      },
    });

    return NextResponse.json({
      message: `Synced ${result.newReviews} new reviews`,
      newReviews: result.newReviews,
      totalReviews: result.totalReviews,
    });
  } catch (error) {
    console.error('Sync reviews error:', error);
    return NextResponse.json({ error: 'Failed to sync reviews' }, { status: 500 });
  }
}
