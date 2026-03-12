/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Google API Service (Placeholder)
 * 
 * This service is designed to be extended when Google Business Profile API
 * approval is obtained. Currently, it provides the interface for future
 * integration without breaking existing functionality.
 */

// Configuration - to be set when Google API is available
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Google API Scopes (for future use)
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// Types for Google Business Profile data
export interface GoogleBusinessLocation {
  locationId: string;
  businessName: string;
  address: string;
  placeId: string;
  phoneNumber?: string;
  websiteUrl?: string;
}

export interface GoogleReview {
  reviewId: string;
  reviewerName: string;
  rating: number;
  comment?: string;
  createTime: Date;
  updateTime: Date;
  reply?: {
    comment: string;
    updateTime: Date;
  };
}

export interface GoogleAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// Check if Google API is configured
export function isGoogleApiConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REDIRECT_URI);
}

// Generate OAuth URL for Google login
export function getGoogleAuthUrl(state: string): string {
  if (!isGoogleApiConfigured()) {
    throw new Error('Google API is not configured');
  }
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Exchange authorization code for tokens (placeholder)
export async function exchangeCodeForTokens(
  _code: string
): Promise<GoogleAuthTokens | null> {
  if (!isGoogleApiConfigured()) {
    console.warn('Google API not configured - returning null');
    return null;
  }
  
  // TODO: Implement when Google API is available
  // const response = await fetch('https://oauth2.googleapis.com/token', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: new URLSearchParams({
  //     code,
  //     client_id: GOOGLE_CLIENT_ID!,
  //     client_secret: GOOGLE_CLIENT_SECRET!,
  //     redirect_uri: GOOGLE_REDIRECT_URI!,
  //     grant_type: 'authorization_code',
  //   }),
  // });
  
  console.log('Google API token exchange not implemented');
  return null;
}

// Refresh access token (placeholder)
export async function refreshAccessToken(
  _refreshToken: string
): Promise<GoogleAuthTokens | null> {
  if (!isGoogleApiConfigured()) {
    return null;
  }
  
  // TODO: Implement when Google API is available
  console.log('Google API token refresh not implemented');
  return null;
}

// Get business locations from Google Business Profile (placeholder)
export async function getBusinessLocations(
  _accessToken: string
): Promise<GoogleBusinessLocation[]> {
  if (!isGoogleApiConfigured()) {
    return [];
  }
  
  // TODO: Implement when Google API is available
  // This would call the Google Business Profile API
  console.log('Google Business locations fetch not implemented');
  return [];
}

// Fetch reviews from Google Business Profile (placeholder)
export async function fetchGoogleReviews(
  _accessToken: string,
  _locationId: string
): Promise<GoogleReview[]> {
  if (!isGoogleApiConfigured()) {
    return [];
  }
  
  // TODO: Implement when Google API is available
  // This would call the Google Business Profile API
  console.log('Google reviews fetch not implemented');
  return [];
}

// Post reply to a Google review (placeholder)
export async function postReviewReply(
  _accessToken: string,
  _locationId: string,
  _reviewId: string,
  _replyText: string
): Promise<boolean> {
  if (!isGoogleApiConfigured()) {
    return false;
  }
  
  // TODO: Implement when Google API is available
  // This would call the Google Business Profile API
  console.log('Google review reply not implemented');
  return false;
}

// Delete review reply (placeholder)
export async function deleteReviewReply(
  _accessToken: string,
  _locationId: string,
  _reviewId: string
): Promise<boolean> {
  if (!isGoogleApiConfigured()) {
    return false;
  }
  
  // TODO: Implement when Google API is available
  console.log('Google review reply delete not implemented');
  return false;
}

// Validate Place ID (placeholder - currently just validates format)
export function validatePlaceId(placeId: string): boolean {
  // Google Place IDs typically start with "ChIJ" and are 27 characters long
  // But they can vary, so we do a basic check
  return placeId.length > 10 && /^[A-Za-z0-9_-]+$/.test(placeId);
}

// Generate review link from Place ID (works without API)
export function generateReviewLink(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}

// Generate maps link from Place ID (works without API)
export function generateMapsLink(placeId: string): string {
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
}
