import prisma from '@/lib/prisma';
import { CreateBusinessInput } from '@/lib/validators';
import { generateAndUploadQRCode } from '@/lib/cloudinary';

export interface BusinessWithDetails {
  id: string;
  businessName: string;
  placeId: string | null;
  reviewLink: string | null;
  qrCodeUrl: string | null;
  createdAt: Date;
  userId: string;
  lastSyncAt: Date | null;
  totalReviews: number;
  averageRating: number;
}

/**
 * Generate Google review link from Place ID
 */
export function generateReviewLink(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}

/**
 * Create a new business for a user
 */
export async function createBusiness(
  userId: string,
  data: CreateBusinessInput
): Promise<BusinessWithDetails> {
  // Check if business with same placeId already exists for user
  const existingBusiness = await prisma.business.findFirst({
    where: {
      userId,
      placeId: data.placeId,
    },
  });

  if (existingBusiness) {
    throw new Error('Business with this Place ID already exists');
  }

  // Generate review link
  const reviewLink = data.placeId ? generateReviewLink(data.placeId) : null;

  // Generate and upload QR code
  const qrCodeUrl = reviewLink ? await generateAndUploadQRCode(reviewLink) : null;

  // Create business
  const business = await prisma.business.create({
    data: {
      userId,
      businessName: data.businessName,
      placeId: data.placeId,
      reviewLink,
      qrCodeUrl,
    },
    select: {
      id: true,
      businessName: true,
      placeId: true,
      reviewLink: true,
      qrCodeUrl: true,
      createdAt: true,
      userId: true,
      lastSyncAt: true,
      totalReviews: true,
      averageRating: true,
    },
  });

  return business;
}

/**
 * Get all businesses for a user
 */
export async function getBusinessesByUserId(
  userId: string
): Promise<BusinessWithDetails[]> {
  return prisma.business.findMany({
    where: { userId },
    select: {
      id: true,
      businessName: true,
      placeId: true,
      reviewLink: true,
      qrCodeUrl: true,
      createdAt: true,
      userId: true,
      lastSyncAt: true,
      totalReviews: true,
      averageRating: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a single business by ID
 */
export async function getBusinessById(
  id: string
): Promise<BusinessWithDetails | null> {
  return prisma.business.findUnique({
    where: { id },
    select: {
      id: true,
      businessName: true,
      placeId: true,
      reviewLink: true,
      qrCodeUrl: true,
      createdAt: true,
      userId: true,
      lastSyncAt: true,
      totalReviews: true,
      averageRating: true,
    },
  });
}

/**
 * Update a business
 */
export async function updateBusiness(
  id: string,
  data: Partial<{ businessName: string }>
): Promise<BusinessWithDetails> {
  return prisma.business.update({
    where: { id },
    data,
    select: {
      id: true,
      businessName: true,
      placeId: true,
      reviewLink: true,
      qrCodeUrl: true,
      createdAt: true,
      userId: true,
      lastSyncAt: true,
      totalReviews: true,
      averageRating: true,
    },
  });
}

/**
 * Delete a business
 */
export async function deleteBusiness(id: string): Promise<void> {
  await prisma.business.delete({
    where: { id },
  });
}

/**
 * Regenerate QR code for a business
 */
export async function regenerateQRCode(
  id: string
): Promise<BusinessWithDetails | null> {
  const business = await prisma.business.findUnique({
    where: { id },
  });

  if (!business || !business.reviewLink) {
    return null;
  }

  const qrCodeUrl = await generateAndUploadQRCode(
    business.reviewLink
  );

  return prisma.business.update({
    where: { id },
    data: { qrCodeUrl },
    select: {
      id: true,
      businessName: true,
      placeId: true,
      reviewLink: true,
      qrCodeUrl: true,
      createdAt: true,
      userId: true,
      lastSyncAt: true,
      totalReviews: true,
      averageRating: true,
    },
  });
}

/**
 * Get total business count
 */
export async function getTotalBusinessCount(): Promise<number> {
  return prisma.business.count();
}

export interface AdminBusinessView {
  id: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  placeId: string | null;
  totalReviews: number;
  averageRating: number;
  createdAt: Date;
}

/**
 * Get all businesses for admin dashboard with owner info
 */
export async function getAllBusinessesForAdmin(): Promise<AdminBusinessView[]> {
  const businesses = await prisma.business.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return businesses.map((b: {
    id: string;
    businessName: string;
    placeId: string | null;
    totalReviews: number;
    averageRating: number;
    createdAt: Date;
    user: { name: string; email: string };
  }) => ({
    id: b.id,
    businessName: b.businessName,
    ownerName: b.user.name,
    ownerEmail: b.user.email,
    placeId: b.placeId,
    totalReviews: b.totalReviews,
    averageRating: b.averageRating,
    createdAt: b.createdAt,
  }));
}

/**
 * Get business with owner info by ID
 */
export async function getBusinessWithOwner(businessId: string): Promise<{
  business: BusinessWithDetails;
  owner: { id: string; name: string; email: string; trialEndsAt: Date };
} | null> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          trialEndsAt: true,
        },
      },
    },
  });

  if (!business) return null;

  return {
    business: {
      id: business.id,
      businessName: business.businessName,
      placeId: business.placeId,
      reviewLink: business.reviewLink,
      qrCodeUrl: business.qrCodeUrl,
      createdAt: business.createdAt,
      userId: business.userId,
      lastSyncAt: business.lastSyncAt,
      totalReviews: business.totalReviews,
      averageRating: business.averageRating,
    },
    owner: business.user,
  };
}
