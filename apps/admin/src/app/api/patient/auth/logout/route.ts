/**
 * POST /api/patient/auth/logout
 * Logout and invalidate session
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { extractBearerToken } from '@/lib/auth/jwt';
import { handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  try {
    // Get access token from header
    const authHeader = request.headers.get('Authorization');
    const accessToken = extractBearerToken(authHeader);

    if (!accessToken) {
      return NextResponse.json(
        apiError(ErrorCodes.UNAUTHORIZED, 'No access token provided'),
        { status: 401, headers: corsHeaders() }
      );
    }

    // Delete session by access token
    const deleted = await db.sessions.deleteByAccessToken(accessToken);

    if (!deleted) {
      // Session might already be deleted or expired, but we still return success
      return NextResponse.json(
        apiSuccess({
          message: 'Logged out successfully',
        }),
        { status: 200, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      apiSuccess({
        message: 'Logged out successfully',
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred during logout.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
