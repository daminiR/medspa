/**
 * Next.js Middleware for Route Protection
 *
 * Implements server-side authentication checks for protected routes.
 * This middleware runs on the Edge runtime for fast performance.
 *
 * Authentication is determined by checking for the 'refreshToken' httpOnly
 * cookie set by the backend on successful authentication.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Routes that require authentication
 * Users will be redirected to login if not authenticated
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/appointments',
  '/booking',
  '/messages',
  '/profile',
  '/photos',
  '/forms',
  '/referrals',
  '/rewards',
  '/groups',
  '/waiting-room',
  '/waitlist',
  '/health-records',
  '/payments',
];

/**
 * Routes that should redirect to dashboard if already authenticated
 */
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
];

/**
 * Routes that should NOT redirect even if user is authenticated (verify flows)
 * These are special auth flows that authenticated users may still need to access
 */
const VERIFY_ROUTES = [
  '/auth/verify',
  '/auth/verify-otp',
];

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/',
  '/auth/error',
  '/offline',
];

/**
 * Check if a path matches any of the route patterns
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    // Exact match
    if (pathname === route) return true;
    // Starts with route (for nested paths like /dashboard/settings)
    if (pathname.startsWith(`${route}/`)) return true;
    return false;
  });
}

/**
 * Middleware function to handle authentication
 * Checks for refreshToken cookie set by backend to determine auth state
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, _next, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') || // Static files with extensions
    pathname.startsWith('/api/') // All API routes handled separately
  ) {
    return NextResponse.next();
  }

  // Check for refresh token cookie (indicates backend session)
  const refreshToken = request.cookies.get('refreshToken');
  const isAuthenticated = !!refreshToken?.value;

  // Check route types
  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES);
  const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);
  const isVerifyRoute = matchesRoute(pathname, VERIFY_ROUTES);

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    // Store the intended destination for redirect after login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages (but not verify pages)
  if (isAuthRoute && !isVerifyRoute && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Add security headers to response
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

/**
 * Configure which paths the middleware should run on
 * Using a matcher for better performance
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (icons, images)
     * - files with extensions (static assets)
     * - api routes (handled separately by API middleware)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|images|api/).*)',
  ],
};
