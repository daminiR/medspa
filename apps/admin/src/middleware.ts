/**
 * Next.js Middleware
 *
 * Handles route protection for the Admin App
 * Note: This is edge middleware - full auth validation happens client-side
 * This just ensures basic route structure and redirects
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/forgot-password',
  '/reset-password',
];

// API routes (handled separately)
const apiRoutes = [
  '/api',
];

// Static assets and Next.js internals
const ignoredPaths = [
  '/_next',
  '/favicon.ico',
  '/static',
  '/images',
  '/icons',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for ignored paths
  if (ignoredPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Skip middleware for API routes (handled by backend)
  if (apiRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For all other routes, we let the client-side AuthContext handle the redirect
  // The middleware just adds a security header to indicate the route requires auth
  const response = NextResponse.next();
  response.headers.set('x-requires-auth', 'true');

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
