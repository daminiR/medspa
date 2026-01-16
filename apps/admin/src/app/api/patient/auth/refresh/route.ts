/**
 * POST /api/patient/auth/refresh
 * Refresh access token using refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiValidationError, ErrorCodes } from '@/lib/api-response';
import { refreshTokenSchema } from '@/lib/validations/patient';
import { verifyRefreshToken, generateTokens } from '@/lib/auth/jwt';
import { handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = refreshTokenSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.issues),
        { status: 400, headers: corsHeaders() }
      );
    }

    const { refreshToken } = validationResult.data;

    // Verify refresh token
    const tokenPayload = await verifyRefreshToken(refreshToken);
    if (!tokenPayload) {
      return NextResponse.json(
        apiError(ErrorCodes.TOKEN_INVALID, 'Invalid or expired refresh token'),
        { status: 401, headers: corsHeaders() }
      );
    }

    // Find session by refresh token
    const session = await db.sessions.findByRefreshToken(refreshToken);
    if (!session) {
      return NextResponse.json(
        apiError(ErrorCodes.SESSION_EXPIRED, 'Session not found. Please login again.'),
        { status: 401, headers: corsHeaders() }
      );
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      await db.sessions.delete(session.id);
      return NextResponse.json(
        apiError(ErrorCodes.SESSION_EXPIRED, 'Session expired. Please login again.'),
        { status: 401, headers: corsHeaders() }
      );
    }

    // Find user
    const user = await db.users.findById(tokenPayload.userId);
    if (!user) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'User not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Check if user is active
    if (!user.active) {
      // Delete all sessions for deactivated user
      await db.sessions.deleteByUserId(user.id);
      return NextResponse.json(
        apiError(ErrorCodes.FORBIDDEN, 'Your account has been deactivated. Please contact support.'),
        { status: 403, headers: corsHeaders() }
      );
    }

    // Generate new tokens
    const newTokens = await generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Delete old session
    await db.sessions.delete(session.id);

    // Create new session
    await db.sessions.create({
      userId: user.id,
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      userAgent: request.headers.get('user-agent') || session.userAgent,
      ipAddress: request.headers.get('x-forwarded-for') || session.ipAddress,
      deviceName: session.deviceName,
      expiresAt: new Date(newTokens.expiresAt),
    });

    // Return new tokens
    return NextResponse.json(
      apiSuccess({
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresAt: newTokens.expiresAt,
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while refreshing token.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
