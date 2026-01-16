/**
 * GET /api/patient/referrals/history
 * Get patient's referral history
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth, handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: tokenUser } = authResult;

    // Get patient profile
    const patient = await db.patients.findByUserId(tokenUser.userId);
    if (!patient) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Patient profile not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get referrals
    const referrals = await db.referrals.findByReferrerId(patient.id);

    // Format referrals for response
    const formattedReferrals = referrals.map((referral) => ({
      id: referral.id,
      referrerId: referral.referrerId,
      refereeId: referral.refereeId,
      refereeName: referral.refereeName,
      refereeEmail: referral.refereeEmail
        ? `${referral.refereeEmail.slice(0, 3)}***@${referral.refereeEmail.split('@')[1]}`
        : null, // Mask email for privacy
      status: referral.status,
      referrerReward: referral.referrerReward,
      refereeReward: referral.refereeReward,
      statusChangedAt: referral.statusChangedAt?.toISOString(),
      firstAppointmentDate: referral.firstAppointmentDate?.toISOString(),
      completedAt: referral.completedAt?.toISOString(),
      expiresAt: referral.expiresAt?.toISOString(),
      createdAt: referral.createdAt.toISOString(),
      updatedAt: referral.updatedAt.toISOString(),
    }));

    // Calculate summary stats
    const stats = {
      total: referrals.length,
      pending: referrals.filter((r) => r.status === 'PENDING').length,
      signedUp: referrals.filter((r) => r.status === 'SIGNED_UP').length,
      firstVisit: referrals.filter((r) => r.status === 'FIRST_VISIT').length,
      completed: referrals.filter((r) => r.status === 'COMPLETED').length,
      expired: referrals.filter((r) => r.status === 'EXPIRED').length,
      cancelled: referrals.filter((r) => r.status === 'CANCELLED').length,
    };

    return NextResponse.json(
      apiSuccess({
        referrals: formattedReferrals,
        stats,
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Get referral history error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while fetching referral history.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
