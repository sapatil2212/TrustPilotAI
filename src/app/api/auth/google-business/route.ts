import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Google OAuth configuration for Business Profile API
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// GOOGLE_CLIENT_SECRET is used in the callback route
const _GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

function getRedirectUri() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-business/callback`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/auth/google-business/callback`;
  }
  return 'http://localhost:3000/api/auth/google-business/callback';
}

// GET /api/auth/google-business - Redirect to Google OAuth
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if Google OAuth is configured
    if (!GOOGLE_CLIENT_ID) {
      // Return a page that sends message back to parent
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head><title>Google Business Connection</title></head>
          <body>
            <script>
              window.opener?.postMessage({
                type: 'GOOGLE_BUSINESS_ERROR',
                error: 'Google OAuth is not configured. Please use Place ID method or contact support.'
              }, window.location.origin);
              window.close();
            </script>
            <p>Google OAuth is not configured. Please close this window and use the Place ID method.</p>
          </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Build Google OAuth URL with Business Profile scopes
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: getRedirectUri(),
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: session.user.id, // Pass user ID in state
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <script>
            window.opener?.postMessage({
              type: 'GOOGLE_BUSINESS_ERROR',
              error: 'Failed to initiate Google authentication'
            }, window.location.origin);
            window.close();
          </script>
          <p>Failed to initiate Google authentication. Please close this window and try again.</p>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}
