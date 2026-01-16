/**
 * POST /api/waitlist/offer/[token]/respond - Accept or decline an offer
 *
 * This is a public endpoint that uses token-based validation.
 * No authentication required - the token provides access control.
 *
 * Actions:
 * - accept: Creates an appointment and marks entry as booked
 * - decline: Triggers cascade to next eligible patient
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import {
  offersByToken,
  entriesStore,
  appointmentsStore,
  type WaitlistOffer,
  type WaitlistEntry,
  type Appointment,
} from '@/lib/stores/waitlistStore';

// Settings
const WAITLIST_SETTINGS = {
  maxOffersPerSlot: 3,
  offerExpiryMinutes: 30,
};

// Service details
const serviceDetails: Record<string, { category: string }> = {
  'Botox Treatment': { category: 'injectables' },
  'Dermal Fillers': { category: 'injectables' },
  'Lip Filler': { category: 'injectables' },
  'Chemical Peel': { category: 'facial' },
  'HydraFacial': { category: 'facial' },
  'Microneedling': { category: 'facial' },
  'Laser Hair Removal': { category: 'laser' },
  'IPL Photofacial': { category: 'laser' },
  'CoolSculpting': { category: 'body' },
  'Therapeutic Massage': { category: 'wellness' },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Add CORS headers
 */
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

/**
 * Generate unique ID
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create appointment from accepted offer
 */
function createAppointmentFromOffer(offer: WaitlistOffer): Appointment {
  const slot = offer.appointmentSlot;
  const service = serviceDetails[slot.serviceName];

  return {
    id: generateId('apt'),
    patientId: offer.patientId,
    patientName: offer.patientName,
    patientPhone: offer.patientPhone,
    patientEmail: offer.patientEmail,
    serviceName: slot.serviceName,
    serviceCategory: service?.category || 'other',
    practitionerId: slot.practitionerId,
    practitionerName: slot.practitionerName,
    startTime: slot.startTime,
    endTime: slot.endTime,
    duration: slot.duration,
    status: 'scheduled',
    roomId: slot.roomId,
    bookingType: 'waitlist',
    createdAt: new Date(),
    notes: 'Booked from waitlist offer',
  };
}

/**
 * Send confirmation SMS (mock)
 */
async function sendAcceptanceConfirmationSms(
  phone: string,
  patientName: string,
  serviceName: string,
  date: string,
  time: string,
  practitionerName: string
): Promise<boolean> {
  const message = `Confirmed! Your ${serviceName} appointment with ${practitionerName} is booked for ${date} at ${time}. We look forward to seeing you!`;
  console.log(`[SMS] Sending to ${phone}: ${message}`);
  return true;
}

/**
 * Send decline confirmation SMS (mock)
 */
async function sendDeclineConfirmationSms(
  phone: string,
  patientName: string
): Promise<boolean> {
  const message = `Hi ${patientName}, no worries! You're still on our waitlist and we'll notify you when another opening becomes available.`;
  console.log(`[SMS] Sending to ${phone}: ${message}`);
  return true;
}

/**
 * Mock cascade to next patient
 * In production, this would find the next eligible patient and create a new offer
 */
async function cascadeToNextPatient(
  declinedOffer: WaitlistOffer
): Promise<{ patientName: string; cascadeLevel: number } | null> {
  // In production, this would:
  // 1. Find eligible patients from the waitlist
  // 2. Calculate match scores
  // 3. Create a new offer for the top match
  // 4. Send SMS notification

  // For demo, simulate cascade
  if (declinedOffer.cascadeLevel < WAITLIST_SETTINGS.maxOffersPerSlot - 1) {
    console.log(`[Waitlist] Cascading offer to next patient (level ${declinedOffer.cascadeLevel + 1})`);
    return {
      patientName: 'Next Patient',
      cascadeLevel: declinedOffer.cascadeLevel + 1,
    };
  }

  return null;
}

/**
 * Update response statistics for the entry
 */
function updateEntryResponseStats(
  entry: WaitlistEntry,
  offer: WaitlistOffer,
  action: 'accepted' | 'declined'
): void {
  const responseTimeMinutes = Math.floor(
    (new Date().getTime() - offer.sentAt.getTime()) / (1000 * 60)
  );

  entry.totalResponses = (entry.totalResponses || 0) + 1;

  // Update average response time
  const prevTotal = entry.totalResponses - 1;
  const prevAvg = entry.averageResponseTimeMinutes || 0;
  entry.averageResponseTimeMinutes = Math.round(
    (prevAvg * prevTotal + responseTimeMinutes) / entry.totalResponses
  );

  if (action === 'accepted') {
    entry.acceptedOffers = (entry.acceptedOffers || 0) + 1;
  } else {
    entry.declinedOffers = (entry.declinedOffers || 0) + 1;
  }
}

// =============================================================================
// API ROUTE HANDLER
// =============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Offer token is required',
          code: 'TOKEN_REQUIRED',
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Parse request body
    const body = await request.json();
    const { action, declineReason } = body;

    // Validate action
    if (!action || !['accept', 'decline'].includes(action)) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Action is required and must be "accept" or "decline"',
          code: 'INVALID_ACTION',
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Look up the offer
    const offer = offersByToken.get(token);

    if (!offer) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'This offer link is invalid or has been removed',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    const now = new Date();

    // Check if offer has expired
    if (now > offer.expiresAt && offer.status === 'pending') {
      offer.status = 'expired';
      offer.responseAction = 'expired';

      const response = NextResponse.json(
        {
          success: false,
          error: 'This offer has expired',
          code: 'EXPIRED',
          data: {
            expiredAt: offer.expiresAt.toISOString(),
            expiredAgo: moment(offer.expiresAt).fromNow(),
          },
          suggestion: 'Don\'t worry - we\'ll notify you when another slot becomes available!',
        },
        { status: 410 }
      );
      return addCorsHeaders(response);
    }

    // Check if already responded
    if (offer.status !== 'pending') {
      const response = NextResponse.json(
        {
          success: false,
          error: `This offer has already been ${offer.status}`,
          code: `ALREADY_${offer.status.toUpperCase()}`,
          data: {
            status: offer.status,
            respondedAt: offer.respondedAt?.toISOString(),
          },
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Get the waitlist entry
    const entry = entriesStore.get(offer.waitlistEntryId);

    // Update offer response time
    offer.respondedAt = now;

    // ==========================================================================
    // HANDLE ACCEPT
    // ==========================================================================

    if (action === 'accept') {
      // Create the appointment
      const appointment = createAppointmentFromOffer(offer);
      appointmentsStore.set(appointment.id, appointment);

      // Update offer status
      offer.status = 'accepted';
      offer.responseAction = 'accepted';

      // Update entry status
      if (entry) {
        entry.status = 'booked';
        entry.bookedAt = now;
        updateEntryResponseStats(entry, offer, 'accepted');
      }

      // Send confirmation SMS
      await sendAcceptanceConfirmationSms(
        offer.patientPhone,
        offer.patientName,
        offer.appointmentSlot.serviceName,
        moment(offer.appointmentSlot.date).format('MMM D'),
        moment(offer.appointmentSlot.startTime).format('h:mm A'),
        offer.appointmentSlot.practitionerName
      );

      const response = NextResponse.json({
        success: true,
        data: {
          action: 'accepted',
          message: 'Your appointment has been booked!',
          offer: {
            id: offer.id,
            status: offer.status,
            respondedAt: offer.respondedAt.toISOString(),
          },
          appointment: {
            id: appointment.id,
            serviceName: appointment.serviceName,
            practitionerName: appointment.practitionerName,
            date: appointment.startTime.toISOString(),
            formattedDate: moment(appointment.startTime).format('dddd, MMMM D, YYYY'),
            formattedTime: moment(appointment.startTime).format('h:mm A'),
            duration: appointment.duration,
            status: appointment.status,
            location: {
              name: 'Medical Spa Main',
              address: '123 Beauty Lane, Suite 100, Los Angeles, CA 90001',
            },
          },
          waitlistEntry: entry
            ? {
                id: entry.id,
                status: entry.status,
                bookedAt: entry.bookedAt?.toISOString(),
              }
            : null,
          nextSteps: [
            'You will receive an email confirmation shortly',
            'Please arrive 10 minutes before your appointment',
            'Complete any required forms before your visit',
          ],
        },
      });

      return addCorsHeaders(response);
    }

    // ==========================================================================
    // HANDLE DECLINE
    // ==========================================================================

    // Update offer status
    offer.status = 'declined';
    offer.responseAction = 'declined';

    // Update entry status (back to active for future offers)
    if (entry) {
      entry.status = 'active';
      updateEntryResponseStats(entry, offer, 'declined');
    }

    // Send decline confirmation SMS
    await sendDeclineConfirmationSms(offer.patientPhone, offer.patientName);

    // Try to cascade to next patient
    let cascadeInfo = null;
    const cascadeResult = await cascadeToNextPatient(offer);
    if (cascadeResult) {
      cascadeInfo = {
        cascadedToNext: true,
        message: 'The slot has been offered to the next patient in the waitlist',
        cascadeLevel: cascadeResult.cascadeLevel,
      };
    }

    const response = NextResponse.json({
      success: true,
      data: {
        action: 'declined',
        message: declineReason
          ? `Offer declined: ${declineReason}`
          : 'Offer declined. We\'ll notify you of future availability.',
        offer: {
          id: offer.id,
          status: offer.status,
          respondedAt: offer.respondedAt.toISOString(),
          responseAction: offer.responseAction,
        },
        waitlistEntry: entry
          ? {
              id: entry.id,
              status: entry.status,
              declinedOffers: entry.declinedOffers,
              stillOnWaitlist: true,
            }
          : null,
        cascade: cascadeInfo,
        reassurance: 'You\'re still on our waitlist and will be notified when another slot opens up!',
      },
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error('Offer respond error:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to process your response',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}
