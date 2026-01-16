/**
 * GET /api/patient/auth/me
 * Get current authenticated user information
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

    // Get full user data
    const user = await db.users.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'User not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get patient profile
    const patient = await db.patients.findByUserId(user.id);

    // Get referral program
    let referralProgram = null;
    if (patient) {
      const rp = await db.referralPrograms.findByPatientId(patient.id);
      if (rp) {
        referralProgram = {
          referralCode: rp.referralCode,
          shareUrl: rp.shareUrl,
          totalReferrals: rp.totalReferrals,
          successfulReferrals: rp.successfulReferrals,
          totalEarnings: rp.totalEarnings,
          availableCredits: rp.availableCredits,
        };
      }
    }

    // Get notification preferences
    let notificationPreferences = null;
    if (patient) {
      const np = await db.notificationPreferences.findByPatientId(patient.id);
      if (np) {
        notificationPreferences = {
          enabled: np.enabled,
          appointmentReminders: np.appointmentReminders,
          promotions: np.promotions,
          rewards: np.rewards,
          messages: np.messages,
          sound: np.sound,
          badge: np.badge,
        };
      }
    }

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
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          lastLoginAt: user.lastLoginAt?.toISOString(),
        },
        patient: patient
          ? {
              id: patient.id,
              allergies: patient.allergies,
              medications: patient.medications,
              conditions: patient.conditions,
              emergencyContact: patient.emergencyContactName
                ? {
                    name: patient.emergencyContactName,
                    phone: patient.emergencyContactPhone,
                    relationship: patient.emergencyContactRelationship,
                  }
                : null,
              address: patient.addressStreet
                ? {
                    street: patient.addressStreet,
                    city: patient.addressCity,
                    state: patient.addressState,
                    zipCode: patient.addressZipCode,
                    country: patient.addressCountry,
                  }
                : null,
              preferredLocationId: patient.preferredLocationId,
              preferredProviderId: patient.preferredProviderId,
              marketingOptIn: patient.marketingOptIn,
              smsOptIn: patient.smsOptIn,
              membershipId: patient.membershipId,
            }
          : null,
        referralProgram,
        notificationPreferences,
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while fetching user data.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
