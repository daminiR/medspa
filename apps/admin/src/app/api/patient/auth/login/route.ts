/**
 * POST /api/patient/auth/login
 * Authenticate patient with email/password
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiValidationError, ErrorCodes } from '@/lib/api-response';
import { loginSchema } from '@/lib/validations/patient';
import { verifyPassword, generateTokens } from '@/lib/auth/jwt';
import { handlePreflight, corsHeaders, applyRateLimit } from '@/lib/auth/middleware';
import { db } from '@/lib/db';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (5 attempts per minute)
    const rateLimitResponse = applyRateLimit(request, 5, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.issues),
        { status: 400, headers: corsHeaders() }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await db.users.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        apiError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password'),
        { status: 401, headers: corsHeaders() }
      );
    }

    // Check if user is active
    if (!user.active) {
      return NextResponse.json(
        apiError(ErrorCodes.FORBIDDEN, 'Your account has been deactivated. Please contact support.'),
        { status: 403, headers: corsHeaders() }
      );
    }

    // Check if user has a password (might be passkey-only account)
    if (!user.passwordHash) {
      return NextResponse.json(
        apiError(
          ErrorCodes.INVALID_CREDENTIALS,
          'This account uses passkey authentication. Please use passkey to sign in.'
        ),
        { status: 401, headers: corsHeaders() }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        apiError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password'),
        { status: 401, headers: corsHeaders() }
      );
    }

    // Generate tokens
    const tokens = await generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create session
    await db.sessions.create({
      userId: user.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      expiresAt: new Date(tokens.expiresAt),
    });

    // Update last login
    await db.users.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Get patient profile
    const patient = await db.patients.findByUserId(user.id);

    // Get referral program
    let referralCode: string | undefined;
    let availableCredits = 0;
    if (patient) {
      const referralProgram = await db.referralPrograms.findByPatientId(patient.id);
      if (referralProgram) {
        referralCode = referralProgram.referralCode;
        availableCredits = referralProgram.availableCredits;
      }
    }

    // Return response
    return NextResponse.json(
      apiSuccess({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          dateOfBirth: user.dateOfBirth?.toISOString(),
          gender: user.gender,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          createdAt: user.createdAt.toISOString(),
          lastLoginAt: new Date().toISOString(),
        },
        patient: patient
          ? {
              id: patient.id,
              referralCode,
              availableCredits,
              preferredLocationId: patient.preferredLocationId,
              preferredProviderId: patient.preferredProviderId,
            }
          : null,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred during login. Please try again.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
