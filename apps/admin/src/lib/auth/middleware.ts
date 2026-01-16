/**
 * Authentication Middleware
 * Provides request authentication and authorization utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, TokenPayload } from './jwt';
import { apiError } from '../api-response';

export interface AuthenticatedRequest extends NextRequest {
  user: TokenPayload;
}

/**
 * Middleware to require authentication
 * Returns the authenticated user or an error response
 */
export async function requireAuth(
  request: Request
): Promise<{ user: TokenPayload } | NextResponse> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json(
      apiError('UNAUTHORIZED', 'Authentication required'),
      { status: 401 }
    );
  }

  return { user };
}

/**
 * Middleware to require specific roles
 */
export async function requireRole(
  request: Request,
  allowedRoles: string[]
): Promise<{ user: TokenPayload } | NextResponse> {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      apiError('FORBIDDEN', 'Insufficient permissions'),
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Middleware to require patient role
 */
export async function requirePatient(
  request: Request
): Promise<{ user: TokenPayload } | NextResponse> {
  return requireRole(request, ['PATIENT', 'ADMIN']);
}

/**
 * Middleware to require staff role
 */
export async function requireStaff(
  request: Request
): Promise<{ user: TokenPayload } | NextResponse> {
  return requireRole(request, ['STAFF', 'PROVIDER', 'ADMIN']);
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(
  request: Request
): Promise<{ user: TokenPayload } | NextResponse> {
  return requireRole(request, ['ADMIN']);
}

/**
 * Optional authentication - returns user if authenticated, null otherwise
 */
export async function optionalAuth(
  request: Request
): Promise<TokenPayload | null> {
  return getAuthenticatedUser(request);
}

/**
 * Helper to check if request is authenticated
 */
export async function isAuthenticated(request: Request): Promise<boolean> {
  const user = await getAuthenticatedUser(request);
  return user !== null;
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * In production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Apply rate limiting middleware
 */
export function applyRateLimit(
  request: Request,
  maxRequests: number = 100,
  windowMs: number = 60000
): NextResponse | null {
  // Use IP or user ID as identifier
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed, remaining, resetTime } = rateLimit(ip, maxRequests, windowMs);

  if (!allowed) {
    return NextResponse.json(
      apiError('RATE_LIMIT_EXCEEDED', 'Too many requests, please try again later'),
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetTime.toString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}

/**
 * CORS headers for patient portal API
 */
export function corsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081', // Expo
    'https://patient.luxemedspa.com',
    'https://portal.luxemedspa.com',
  ];

  const requestOrigin = origin || '*';
  const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle OPTIONS preflight request
 */
export function handlePreflight(request: Request): NextResponse {
  const origin = request.headers.get('Origin') || undefined;
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}
