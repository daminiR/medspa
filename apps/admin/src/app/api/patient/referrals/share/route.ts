/**
 * POST /api/patient/referrals/share
 * Track a referral share event
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiValidationError, ErrorCodes } from '@/lib/api-response';
import { shareReferralSchema } from '@/lib/validations/patient';
import { requireAuth, handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';

// In-memory share tracking (would be in db in production)
const shareEvents: Map<string, any> = new Map();

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
    const validationResult = shareReferralSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.issues),
        { status: 400, headers: corsHeaders() }
      );
    }

    const { method, recipients, message } = validationResult.data;

    // Get patient profile
    const patient = await db.patients.findByUserId(tokenUser.userId);
    if (!patient) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Patient profile not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get referral program
    const referralProgram = await db.referralPrograms.findByPatientId(patient.id);
    if (!referralProgram) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Referral program not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Generate share tracking ID
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate tracking URL with share ID
    const trackingUrl = `${referralProgram.shareUrl}?sid=${shareId}`;

    // Create share event record
    const shareEvent = {
      id: shareId,
      referralProgramId: referralProgram.id,
      patientId: patient.id,
      method,
      trackingUrl,
      recipientCount: recipients?.length || 0,
      clickCount: 0,
      conversionCount: 0,
      createdAt: new Date(),
    };

    shareEvents.set(shareId, shareEvent);

    // In production, if method is SMS or EMAIL, actually send the messages
    // For now, we just track the share intent

    // Update referral program stats (track total shares)
    await db.referralPrograms.update(referralProgram.id, {
      totalReferrals: referralProgram.totalReferrals + (recipients?.length || 1),
    });

    return NextResponse.json(
      apiSuccess({
        success: true,
        shareId,
        trackingUrl,
        method,
        recipientCount: recipients?.length || 0,
        message: 'Share tracked successfully',
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Share referral error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while sharing referral.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
