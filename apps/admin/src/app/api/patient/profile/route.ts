/**
 * GET /api/patient/profile - Get patient profile
 * PATCH /api/patient/profile - Update patient profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiValidationError, ErrorCodes } from '@/lib/api-response';
import { updateProfileSchema } from '@/lib/validations/patient';
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

    // Get user
    const user = await db.users.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'User not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get patient profile
    const patient = await db.patients.findByUserId(user.id);
    if (!patient) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Patient profile not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get referral program
    const referralProgram = await db.referralPrograms.findByPatientId(patient.id);

    // Get notification preferences
    const notificationPrefs = await db.notificationPreferences.findByPatientId(patient.id);

    // Build profile response
    const profile = {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        dateOfBirth: user.dateOfBirth?.toISOString()?.split('T')[0], // Just the date part
        gender: user.gender,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      patient: {
        id: patient.id,
        // Medical info
        allergies: patient.allergies,
        medications: patient.medications,
        conditions: patient.conditions,
        // Emergency contact
        emergencyContact: patient.emergencyContactName
          ? {
              name: patient.emergencyContactName,
              phone: patient.emergencyContactPhone,
              relationship: patient.emergencyContactRelationship,
            }
          : null,
        // Address
        address: patient.addressStreet
          ? {
              street: patient.addressStreet,
              city: patient.addressCity,
              state: patient.addressState,
              zipCode: patient.addressZipCode,
              country: patient.addressCountry,
            }
          : null,
        // Preferences
        preferredLocationId: patient.preferredLocationId,
        preferredProviderId: patient.preferredProviderId,
        marketingOptIn: patient.marketingOptIn,
        smsOptIn: patient.smsOptIn,
        // Membership
        membershipId: patient.membershipId,
      },
      referralProgram: referralProgram
        ? {
            referralCode: referralProgram.referralCode,
            shareUrl: referralProgram.shareUrl,
            totalReferrals: referralProgram.totalReferrals,
            pendingReferrals: referralProgram.pendingReferrals,
            successfulReferrals: referralProgram.successfulReferrals,
            totalEarnings: referralProgram.totalEarnings,
            availableCredits: referralProgram.availableCredits,
          }
        : null,
      notificationPreferences: notificationPrefs
        ? {
            enabled: notificationPrefs.enabled,
            appointmentReminders: notificationPrefs.appointmentReminders,
            appointmentReminder24h: notificationPrefs.appointmentReminder24h,
            appointmentReminder2h: notificationPrefs.appointmentReminder2h,
            promotions: notificationPrefs.promotions,
            rewards: notificationPrefs.rewards,
            messages: notificationPrefs.messages,
            sound: notificationPrefs.sound,
            badge: notificationPrefs.badge,
            vibration: notificationPrefs.vibration,
            quietHoursEnabled: notificationPrefs.quietHoursEnabled,
            quietHoursStart: notificationPrefs.quietHoursStart,
            quietHoursEnd: notificationPrefs.quietHoursEnd,
          }
        : null,
    };

    return NextResponse.json(
      apiSuccess(profile),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while fetching profile.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.issues),
        { status: 400, headers: corsHeaders() }
      );
    }

    const updates = validationResult.data;

    // Get user
    const user = await db.users.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'User not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get patient profile
    const patient = await db.patients.findByUserId(user.id);
    if (!patient) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Patient profile not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Update user fields
    const userUpdates: Partial<typeof user> = {};
    if (updates.firstName) userUpdates.firstName = updates.firstName;
    if (updates.lastName) userUpdates.lastName = updates.lastName;
    if (updates.firstName || updates.lastName) {
      userUpdates.fullName = `${updates.firstName || user.firstName} ${updates.lastName || user.lastName}`;
    }
    if (updates.phone) userUpdates.phone = updates.phone;
    if (updates.dateOfBirth) userUpdates.dateOfBirth = new Date(updates.dateOfBirth);
    if (updates.gender) userUpdates.gender = updates.gender as any;

    if (Object.keys(userUpdates).length > 0) {
      await db.users.update(user.id, userUpdates);
    }

    // Update patient fields
    const patientUpdates: Partial<typeof patient> = {};
    if (updates.addressStreet !== undefined) patientUpdates.addressStreet = updates.addressStreet;
    if (updates.addressCity !== undefined) patientUpdates.addressCity = updates.addressCity;
    if (updates.addressState !== undefined) patientUpdates.addressState = updates.addressState;
    if (updates.addressZipCode !== undefined) patientUpdates.addressZipCode = updates.addressZipCode;
    if (updates.addressCountry !== undefined) patientUpdates.addressCountry = updates.addressCountry;
    if (updates.emergencyContactName !== undefined) patientUpdates.emergencyContactName = updates.emergencyContactName;
    if (updates.emergencyContactPhone !== undefined) patientUpdates.emergencyContactPhone = updates.emergencyContactPhone;
    if (updates.emergencyContactRelationship !== undefined) patientUpdates.emergencyContactRelationship = updates.emergencyContactRelationship;
    if (updates.preferredLocationId !== undefined) patientUpdates.preferredLocationId = updates.preferredLocationId;
    if (updates.preferredProviderId !== undefined) patientUpdates.preferredProviderId = updates.preferredProviderId;
    if (updates.marketingOptIn !== undefined) patientUpdates.marketingOptIn = updates.marketingOptIn;
    if (updates.smsOptIn !== undefined) patientUpdates.smsOptIn = updates.smsOptIn;
    if (updates.allergies !== undefined) patientUpdates.allergies = updates.allergies;
    if (updates.medications !== undefined) patientUpdates.medications = updates.medications;
    if (updates.conditions !== undefined) patientUpdates.conditions = updates.conditions;

    if (Object.keys(patientUpdates).length > 0) {
      await db.patients.update(patient.id, patientUpdates);
    }

    // Get updated data
    const updatedUser = await db.users.findById(user.id);
    const updatedPatient = await db.patients.findById(patient.id);

    return NextResponse.json(
      apiSuccess({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser?.id,
          email: updatedUser?.email,
          phone: updatedUser?.phone,
          firstName: updatedUser?.firstName,
          lastName: updatedUser?.lastName,
          fullName: updatedUser?.fullName,
          dateOfBirth: updatedUser?.dateOfBirth?.toISOString()?.split('T')[0],
          gender: updatedUser?.gender,
        },
        patient: {
          id: updatedPatient?.id,
          allergies: updatedPatient?.allergies,
          medications: updatedPatient?.medications,
          conditions: updatedPatient?.conditions,
          emergencyContact: updatedPatient?.emergencyContactName
            ? {
                name: updatedPatient.emergencyContactName,
                phone: updatedPatient.emergencyContactPhone,
                relationship: updatedPatient.emergencyContactRelationship,
              }
            : null,
          address: updatedPatient?.addressStreet
            ? {
                street: updatedPatient.addressStreet,
                city: updatedPatient.addressCity,
                state: updatedPatient.addressState,
                zipCode: updatedPatient.addressZipCode,
                country: updatedPatient.addressCountry,
              }
            : null,
          preferredLocationId: updatedPatient?.preferredLocationId,
          preferredProviderId: updatedPatient?.preferredProviderId,
          marketingOptIn: updatedPatient?.marketingOptIn,
          smsOptIn: updatedPatient?.smsOptIn,
        },
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while updating profile.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
