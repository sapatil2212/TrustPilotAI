import { z } from 'zod';

// Business Type Enum
export const businessTypeEnum = z.enum([
  'RESTAURANT',
  'RETAIL',
  'HEALTHCARE',
  'PROFESSIONAL_SERVICES',
  'HOME_SERVICES',
  'AUTOMOTIVE',
  'BEAUTY_WELLNESS',
  'FITNESS',
  'EDUCATION',
  'HOSPITALITY',
  'REAL_ESTATE',
  'TECHNOLOGY',
  'OTHER',
]);

export type BusinessTypeEnum = z.infer<typeof businessTypeEnum>;

// User Schemas
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(200),
  businessType: businessTypeEnum,
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Business Schemas
export const connectBusinessSchema = z.object({
  placeId: z.string().min(1, 'Place ID is required'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(200).optional(),
});

export const createBusinessSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(200),
  businessType: businessTypeEnum.optional(),
  placeId: z.string().min(1, 'Place ID is required').optional(),
});

export const updateBusinessSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(200).optional(),
});

// Notification Schemas
export const notificationIdSchema = z.object({
  id: z.string().uuid('Invalid notification ID'),
});

// Admin Schemas
export const deactivateUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export const reactivateUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// AI Generation Schemas
export const generateReviewSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(200),
  serviceType: z.string().min(1, 'Service type is required').max(100),
});

// Funnel Schemas
export const funnelSessionSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
  ratingSelected: z.number().int().min(1).max(5).optional(),
});

export const updateFunnelSessionSchema = z.object({
  ratingSelected: z.number().int().min(1).max(5).optional(),
  aiReviewGenerated: z.string().optional(),
  redirectedToGoogle: z.boolean().optional(),
});

// QR Code Schema
export const generateQRSchema = z.object({
  businessId: z.string().uuid('Invalid business ID').optional(),
  placeId: z.string().min(1, 'Place ID is required').optional(),
  format: z.enum(['png', 'svg', 'both']).default('both'),
});

// Pagination Schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Types from schemas
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type GenerateReviewInput = z.infer<typeof generateReviewSchema>;
export type FunnelSessionInput = z.infer<typeof funnelSessionSchema>;
export type UpdateFunnelSessionInput = z.infer<typeof updateFunnelSessionSchema>;
export type GenerateQRInput = z.infer<typeof generateQRSchema>;
