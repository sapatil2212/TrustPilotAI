import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateAndUploadQRCode } from '@/lib/cloudinary';
import { syncBusinessReviews } from '@/services/reviewFetcherService';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

function getRedirectUri() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-business/callback`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/auth/google-business/callback`;
  }
  return 'http://localhost:3000/api/auth/google-business/callback';
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

// Interface for Google Business location
interface GoogleBusinessLocation {
  name: string;
  locationName?: string;
  title?: string;
  storefrontAddress?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
    regionCode?: string;
  };
  metadata?: {
    placeId?: string;
    mapsUri?: string;
  };
  profile?: {
    description?: string;
  };
  categories?: {
    primaryCategory?: {
      displayName?: string;
    };
  };
}

// GET /api/auth/google-business/callback - Handle OAuth callback
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // User ID
  const error = searchParams.get('error');

  // Error response helper
  const sendErrorResponse = (message: string) => {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Connection Failed</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
            .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 400px; }
            .icon { font-size: 3rem; margin-bottom: 1rem; }
            h2 { color: #1f2937; margin: 0 0 0.5rem 0; }
            p { color: #6b7280; margin: 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">❌</div>
            <h2>Connection Failed</h2>
            <p>${message}</p>
          </div>
          <script>
            window.opener?.postMessage({
              type: 'GOOGLE_BUSINESS_ERROR',
              error: '${message.replace(/'/g, "\\'")}'
            }, window.location.origin);
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  };

  // Success response helper
  const sendSuccessResponse = (businessName: string) => {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Connected Successfully</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%); }
            .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 400px; }
            .icon { font-size: 3rem; margin-bottom: 1rem; }
            h2 { color: #1f2937; margin: 0 0 0.5rem 0; }
            p { color: #6b7280; margin: 0; }
            .business { color: #4f46e5; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✅</div>
            <h2>Connected Successfully!</h2>
            <p><span class="business">${businessName}</span> has been connected.</p>
            <p style="margin-top: 0.5rem; font-size: 0.875rem;">This window will close automatically...</p>
          </div>
          <script>
            window.opener?.postMessage({
              type: 'GOOGLE_BUSINESS_CONNECTED',
              businessName: '${businessName.replace(/'/g, "\\'")}'
            }, window.location.origin);
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  };

  try {
    // Check for OAuth errors
    if (error) {
      console.error('Google OAuth error:', error);
      return sendErrorResponse('Google authentication was cancelled or failed.');
    }

    if (!code || !state) {
      return sendErrorResponse('Invalid callback parameters.');
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return sendErrorResponse('Google OAuth is not configured.');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: getRedirectUri(),
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return sendErrorResponse('Failed to authenticate with Google.');
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // Get user's Google Business accounts
    const accountsResponse = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error('Failed to fetch accounts:', errorText);
      return sendErrorResponse('No Google Business accounts found. Make sure you have a Google Business Profile.');
    }

    const accountsData = await accountsResponse.json();
    const accounts = accountsData.accounts || [];

    if (accounts.length === 0) {
      return sendErrorResponse('No Google Business accounts found. Please create a Google Business Profile first.');
    }

    // Get locations for the first account
    const accountName = accounts[0].name;
    const locationsResponse = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress,metadata,profile,categories`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    let locations: GoogleBusinessLocation[] = [];
    
    if (locationsResponse.ok) {
      const locationsData = await locationsResponse.json();
      locations = locationsData.locations || [];
    }

    if (locations.length === 0) {
      return sendErrorResponse('No business locations found in your Google Business account.');
    }

    // Use the first location (in future, could let user choose)
    const location = locations[0];
    const placeId = location.metadata?.placeId;
    const businessName = location.title || location.locationName || 'My Business';

    if (!placeId) {
      return sendErrorResponse('Could not retrieve Place ID for your business.');
    }

    // Check if already connected
    const existingBusiness = await prisma.business.findFirst({
      where: { 
        userId: state,
        placeId: placeId,
      },
    });

    if (existingBusiness) {
      return sendErrorResponse('This business is already connected to your account.');
    }

    // Generate review link
    const reviewLink = `https://search.google.com/local/writereview?placeid=${placeId}`;

    // Create or update business
    let business = await prisma.business.findFirst({
      where: { 
        userId: state,
        isConnected: false,
      },
    });

    if (business) {
      business = await prisma.business.update({
        where: { id: business.id },
        data: {
          businessName,
          placeId,
          reviewLink,
          isConnected: true,
          updatedAt: new Date(),
        },
      });
    } else {
      business = await prisma.business.create({
        data: {
          userId: state,
          businessName,
          placeId,
          reviewLink,
          isConnected: true,
        },
      });
    }

    // Generate QR code
    try {
      const baseUrl = getBaseUrl();
      const reviewFunnelUrl = `${baseUrl}/review/${business.id}`;
      const qrCodeUrl = await generateAndUploadQRCode(reviewFunnelUrl);
      
      if (qrCodeUrl) {
        await prisma.business.update({
          where: { id: business.id },
          data: { qrCodeUrl },
        });
      }
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
    }

    // Sync reviews (non-blocking)
    syncBusinessReviews(business.id, { processWithAI: true }).catch((err) => {
      console.error('Review sync error:', err);
    });

    return sendSuccessResponse(businessName);

  } catch (error) {
    console.error('Google Business callback error:', error);
    return sendErrorResponse('An unexpected error occurred. Please try again.');
  }
}
