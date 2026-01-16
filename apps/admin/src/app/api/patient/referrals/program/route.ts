/**
 * GET /api/patient/referrals/program
 * Get patient's referral program details
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

    // Get referral program
    let referralProgram = await db.referralPrograms.findByPatientId(patient.id);

    // If no referral program exists, create one
    if (!referralProgram) {
      const user = await db.users.findById(tokenUser.userId);
      const prefix = (user?.firstName || 'USER').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
      const suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      const referralCode = `${prefix}${suffix}`;

      referralProgram = await db.referralPrograms.create({
        patientId: patient.id,
        referralCode,
        shareUrl: `https://luxemedspa.com/ref/${referralCode}`,
        totalReferrals: 0,
        pendingReferrals: 0,
        successfulReferrals: 0,
        totalEarnings: 0,
        availableCredits: 0,
      });
    }

    // Get referral stats
    const referrals = await db.referrals.findByReferrerId(patient.id);

    // Calculate stats
    const pendingCount = referrals.filter((r) => r.status === 'PENDING' || r.status === 'SIGNED_UP').length;
    const completedCount = referrals.filter((r) => r.status === 'COMPLETED').length;
    const firstVisitCount = referrals.filter((r) => r.status === 'FIRST_VISIT').length;

    // Define milestones
    const milestones = [
      {
        id: 'milestone-1',
        count: 5,
        title: 'First 5 Referrals',
        description: 'Extra $10 bonus',
        reward: 10,
        icon: 'star',
        achieved: referralProgram.successfulReferrals >= 5,
        achievedAt: referralProgram.successfulReferrals >= 5
          ? new Date(referralProgram.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      },
      {
        id: 'milestone-2',
        count: 10,
        title: '10 Referrals',
        description: 'Extra $25 bonus',
        reward: 25,
        icon: 'trophy',
        achieved: referralProgram.successfulReferrals >= 10,
        achievedAt: null,
      },
      {
        id: 'milestone-3',
        count: 25,
        title: '25 Referrals',
        description: 'Free HydraFacial',
        reward: 250,
        icon: 'gift',
        achieved: referralProgram.successfulReferrals >= 25,
        achievedAt: null,
      },
    ];

    return NextResponse.json(
      apiSuccess({
        id: referralProgram.id,
        userId: patient.userId,
        referralCode: referralProgram.referralCode,
        shareUrl: referralProgram.shareUrl,
        totalReferrals: referralProgram.totalReferrals,
        pendingReferrals: pendingCount,
        successfulReferrals: completedCount,
        firstVisitReferrals: firstVisitCount,
        totalEarnings: referralProgram.totalEarnings,
        availableCredits: referralProgram.availableCredits,
        milestones,
        rewards: {
          referrerReward: 25,
          refereeReward: 25,
          refereeMinimumSpend: 0,
          referralExpiration: 90, // days
        },
        createdAt: referralProgram.createdAt.toISOString(),
        updatedAt: referralProgram.updatedAt.toISOString(),
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Get referral program error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while fetching referral program.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
