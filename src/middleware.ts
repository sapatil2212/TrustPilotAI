import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/businesses',
  '/reviews',
  '/analytics',
  '/ai-replies',
  '/qr-codes',
  '/funnels',
  '/settings',
];

// Admin-only routes
const adminRoutes = [
  '/admin',
];

// Public routes (auth pages)
const authRoutes = ['/login', '/signup', '/forgot-password'];

// Public routes that should never require auth (review funnel for customers)
const publicRoutes = ['/review'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a public route first (review funnel for customers)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Get the token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Check if user is on auth page while already logged in
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      // Redirect to appropriate dashboard based on role
      const redirectUrl = token.role === 'ADMIN' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Check if trying to access protected routes without auth
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute || isAdminRoute) {
    if (!token) {
      // Redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin routes
    if (isAdminRoute && token.role !== 'ADMIN') {
      // Non-admin trying to access admin route
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Check if regular user trying to access user routes
    if (isProtectedRoute && token.role === 'ADMIN') {
      // Admin can access all routes
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|fonts).*)',
  ],
};
