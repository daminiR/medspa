/**
 * POST /api/patient/referrals/apply
 * Apply a referral code
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiValidationError, ErrorCodes } from '@/lib/api-response';
import { applyReferralCodeSchema } from '@/lib/validations/patient';
import { requireAuth, handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: tokenUser } = authResult;

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = applyReferralCodeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.issues),
        { status: 400, headers: corsHeaders() }
      );
    }

    const { code } = validationResult.data;

    // Get patient profile
    const patient = await db.patients.findByUserId(tokenUser.userId);
    if (!patient) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Patient profile not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Find referral program by code
    const referrerProgram = await db.referralPrograms.findByCode(code);
    if (!referrerProgram) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Invalid referral code'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Check if user is trying to use their own code
    if (referrerProgram.patientId === patient.id) {
      return NextResponse.json(
        apiError(ErrorCodes.CONFLICT, 'You cannot use your own referral code'),
        { status: 409, headers: corsHeaders() }
      );
    }

    // Check if user already has a referral from this code
    const existingReferrals = await db.referrals.findByReferrerId(referrerProgram.patientId);
    const alreadyReferred = existingReferrals.some(
      (r) => r.refereeId === patient.id || r.refereeEmail === tokenUser.email
    );

    if (alreadyReferred) {
      return NextResponse.json(
        apiError(ErrorCodes.CONFLICT, 'You have already used this referral code'),
        { status: 409, headers: corsHeaders() }
      );
    }

    // Get user info
    const user = await db.users.findById(tokenUser.userId);

    // Create referral record
    const referral = await db.referrals.create({
      referrerId: referrerProgram.patientId,
      refereeId: patient.id,
      refereeEmail: user?.email,
      refereeName: user?.fullName,
      status: 'SIGNED_UP',
      referrerReward: 25,
      refereeReward: 25,
      statusChangedAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });

    // Update referrer's program stats
    await db.referralPrograms.update(referrerProgram.id, {
      totalReferrals: referrerProgram.totalReferrals + 1,
      pendingReferrals: referrerProgram.pendingReferrals + 1,
    });

    // Credit referee (applying user) with signup bonus
    const ownProgram = await db.referralPrograms.findByPatientId(patient.id);
    if (ownProgram) {
      await db.referralPrograms.update(ownProgram.id, {
        availableCredits: ownProgram.availableCredits + 25,
      });
    }

    return NextResponse.json(
      apiSuccess({
        success: true,
        referralId: referral.id,
        reward: 25,
        message: '$25 credit has been applied to your account!',
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Apply referral code error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while applying referral code.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
