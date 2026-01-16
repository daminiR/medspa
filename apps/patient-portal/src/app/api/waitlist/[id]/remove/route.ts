/**
 * DELETE /api/waitlist/[id]/remove - Remove patient from waitlist
 *
 * Allows authenticated patients to remove themselves from the waitlist.
 * Validates that the entry belongs to the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type WaitlistTier = 'platinum' | 'gold' | 'silver';
type WaitlistPriority = 'high' | 'medium' | 'low';
type WaitlistEntryStatus = 'active' | 'offered' | 'booked' | 'removed' | 'expired';

interface WaitlistEntry {
  id: string;
  patientId: string;
  name: string;
  phone: string;
  email: string;
  requestedService: string;
  serviceCategory: string;
  serviceDuration: number;
  preferredPractitioner?: string;
  practitionerId?: string;
  availabilityStart: Date;
  availabilityEnd: Date;
  waitingSince: Date;
  priority: WaitlistPriority;
  notes?: string;
  hasCompletedForms: boolean;
  deposit?: number;
  status: WaitlistEntryStatus;
  tier: WaitlistTier;
  offerCount: number;
  removedAt?: Date;
  removedReason?: string;
}

interface PatientSession {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// =============================================================================
// IN-MEMORY STORE (shared reference)
// =============================================================================

// In production, this would be imported from a shared module
const patientWaitlistEntries: Map<string, WaitlistEntry> = new Map();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Mock authentication
 */
function getPatientSession(request: NextRequest): PatientSession | null {
  const authHeader = request.headers.get('authorization');
  const sessionCookie = request.cookies.get('patient-session');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return {
      id: token,
      name: 'Demo Patient',
      email: 'patient@example.com',
      phone: '(555) 000-0000',
    };
  }

  if (sessionCookie?.value) {
    try {
      return JSON.parse(sessionCookie.value);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Send removal confirmation SMS (mock implementation)
 */
async function sendRemovalConfirmationSms(
  phone: string,
  patientName: string,
  serviceName: string
): Promise<boolean> {
  const message = `Hi ${patientName}, you've been removed from the waitlist for ${serviceName}. If you'd like to rejoin, visit our booking page or contact us.`;
  console.log(`[SMS] Sending to ${phone}: ${message}`);
  // In production, integrate with Twilio
  return true;
}

// =============================================================================
// API ROUTE HANDLER
// =============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the patient
    const patient = getPatientSession(request);
    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const { id: entryId } = await params;

    if (!entryId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Waitlist entry ID is required',
          code: 'ID_REQUIRED',
        },
        { status: 400 }
      );
    }

    // Find the entry
    const entry = patientWaitlistEntries.get(entryId);

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Waitlist entry not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Verify ownership
    if (entry.patientId !== patient.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to remove this entry',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // Check if already removed
    if (entry.status === 'removed') {
      return NextResponse.json(
        {
          success: false,
          error: 'This entry has already been removed',
          code: 'ALREADY_REMOVED',
        },
        { status: 400 }
      );
    }

    // Check if booked (cannot remove a booked entry, must cancel appointment)
    if (entry.status === 'booked') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot remove a booked entry. Please cancel the appointment instead.',
          code: 'ENTRY_BOOKED',
        },
        { status: 400 }
      );
    }

    // Parse optional reason from request body
    let reason = 'Patient requested removal';
    try {
      const body = await request.json();
      if (body.reason) {
        reason = body.reason;
      }
    } catch {
      // No body provided, use default reason
    }

    // Update the entry status
    entry.status = 'removed';
    entry.removedAt = new Date();
    entry.removedReason = reason;

    // Send confirmation SMS
    await sendRemovalConfirmationSms(patient.phone, patient.name, entry.requestedService);

    return NextResponse.json({
      success: true,
      data: {
        entryId: entry.id,
        service: entry.requestedService,
        status: 'removed',
        removedAt: entry.removedAt.toISOString(),
        reason,
      },
      message: `You've been removed from the waitlist for ${entry.requestedService}. You can rejoin at any time.`,
    });
  } catch (error) {
    console.error('Waitlist remove error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove from waitlist',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// Also support POST method for broader client compatibility
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return DELETE(request, context);
}
