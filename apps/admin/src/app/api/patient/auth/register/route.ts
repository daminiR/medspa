/**
 * POST /api/patient/auth/register
 * Register a new patient account
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiValidationError, ErrorCodes } from '@/lib/api-response';
import { registerSchema } from '@/lib/validations/patient';
import { hashPassword, generateTokens, generateReferralCode } from '@/lib/auth/jwt';
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
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.issues),
        { status: 400, headers: corsHeaders() }
      );
    }

    const {
      email,
      phone,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      referralCode,
      marketingOptIn,
      smsOptIn,
    } = validationResult.data;

    // Check if email already exists
    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        apiError(ErrorCodes.ALREADY_EXISTS, 'An account with this email already exists'),
        { status: 409, headers: corsHeaders() }
      );
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await db.users.findByPhone(phone);
      if (existingPhone) {
        return NextResponse.json(
          apiError(ErrorCodes.ALREADY_EXISTS, 'An account with this phone number already exists'),
          { status: 409, headers: corsHeaders() }
        );
      }
    }

    // Hash password if provided
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    // Create user
    const user = await db.users.create({
      email,
      phone,
      passwordHash,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender as any,
      role: 'PATIENT',
      emailVerified: false,
      phoneVerified: false,
      active: true,
    });

    // Create patient profile
    const patient = await db.patients.create({
      userId: user.id,
      allergies: [],
      medications: [],
      conditions: [],
      marketingOptIn,
      smsOptIn,
    });

    // Create referral program for new patient
    const referralCodeGenerated = generateReferralCode(firstName);
    const referralProgram = await db.referralPrograms.create({
      patientId: patient.id,
      referralCode: referralCodeGenerated,
      shareUrl: `https://luxemedspa.com/ref/${referralCodeGenerated}`,
      totalReferrals: 0,
      pendingReferrals: 0,
      successfulReferrals: 0,
      totalEarnings: 0,
      availableCredits: 0,
    });

    // Apply referral code if provided
    if (referralCode) {
      const referrerProgram = await db.referralPrograms.findByCode(referralCode);
      if (referrerProgram) {
        // Create referral record
        await db.referrals.create({
          referrerId: referrerProgram.patientId,
          refereeId: patient.id,
          refereeEmail: email,
          refereeName: `${firstName} ${lastName}`,
          status: 'SIGNED_UP',
          referrerReward: 25,
          refereeReward: 25,
          statusChangedAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        });

        // Update referrer stats
        await db.referralPrograms.update(referrerProgram.id, {
          totalReferrals: referrerProgram.totalReferrals + 1,
          pendingReferrals: referrerProgram.pendingReferrals + 1,
        });

        // Credit referee with signup bonus
        await db.referralPrograms.update(referralProgram.id, {
          availableCredits: 25,
        });
      }
    }

    // Create default notification preferences
    await db.notificationPreferences.upsert(patient.id, {
      enabled: true,
      appointmentReminders: true,
      appointmentReminder24h: true,
      appointmentReminder2h: true,
      promotions: marketingOptIn,
      rewards: true,
      messages: true,
      sound: true,
      badge: true,
      vibration: true,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    });

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
        },
        patient: {
          id: patient.id,
          referralCode: referralCodeGenerated,
          availableCredits: referralCode ? 25 : 0, // Signup bonus if used referral
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      }),
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      apiError(
        ErrorCodes.INTERNAL_ERROR,
        'An error occurred during registration. Please try again.'
      ),
      { status: 500, headers: corsHeaders() }
    );
  }
}
