/**
 * GET /api/waitlist/offer/[token] - Get offer details (public endpoint)
 *
 * This is a public endpoint that uses token-based validation.
 * No authentication required - the token itself provides access control.
 * Returns offer details if valid, or appropriate error messages for
 * expired/invalid/already-accepted offers.
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import {
  offersByToken,
  entriesStore,
  type WaitlistOffer,
  type WaitlistEntry,
} from '@/lib/stores/waitlistStore';

// Re-define tier type for local use
type WaitlistTier = 'platinum' | 'gold' | 'silver';

// Service details for enrichment
const serviceDetails: Record<string, { description: string; price: number; category: string }> = {
  'Botox Treatment': { description: 'Reduce fine lines and wrinkles', price: 350, category: 'injectables' },
  'Dermal Fillers': { description: 'Add volume and smooth deep lines', price: 600, category: 'injectables' },
  'Lip Filler': { description: 'Enhance lip fullness and shape', price: 550, category: 'injectables' },
  'Chemical Peel': { description: 'Improve skin texture and tone', price: 150, category: 'facial' },
  'HydraFacial': { description: 'Deep cleanse, extract, and hydrate', price: 200, category: 'facial' },
  'Microneedling': { description: 'Stimulate collagen production', price: 300, category: 'facial' },
  'Laser Hair Removal': { description: 'Permanent hair reduction', price: 200, category: 'laser' },
  'IPL Photofacial': { description: 'Treat sun damage and pigmentation', price: 250, category: 'laser' },
  'CoolSculpting': { description: 'Non-invasive fat reduction', price: 750, category: 'body' },
  'Therapeutic Massage': { description: 'Relaxation and muscle relief', price: 120, category: 'wellness' },
};

// Provider details for enrichment
const providerDetails: Record<string, { discipline: string; initials: string }> = {
  '1': { discipline: 'Aesthetic Medicine', initials: 'SJ' },
  '2': { discipline: 'Dermatology', initials: 'EW' },
  '3': { discipline: 'Cosmetic Surgery', initials: 'MC' },
  '4': { discipline: 'Aesthetic Nursing', initials: 'JM' },
};

// Location details
const locationDetails = {
  id: 'loc-1',
  name: 'Medical Spa Main',
  address: '123 Beauty Lane, Suite 100',
  city: 'Los Angeles',
  state: 'CA',
  zip: '90001',
  phone: '(555) 100-0000',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get tier display name
 */
function getTierDisplayName(tier: WaitlistTier): string {
  switch (tier) {
    case 'platinum': return 'Platinum VIP';
    case 'gold': return 'Gold Member';
    case 'silver': return 'Member';
    default: return 'Member';
  }
}

/**
 * Add CORS headers for cross-origin requests
 */
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// =============================================================================
// API ROUTE HANDLER
// =============================================================================

export async function GET(
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

    // Look up the offer by token
    const offer = offersByToken.get(token);

    if (!offer) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'This offer link is invalid or has been removed',
          code: 'NOT_FOUND',
          suggestion: 'Please contact us if you believe this is an error.',
        },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    const now = new Date();

    // Check if offer has expired
    if (now > offer.expiresAt && offer.status === 'pending') {
      // Auto-update status to expired
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
            service: offer.appointmentSlot.serviceName,
          },
          suggestion: 'Don\'t worry - we\'ll notify you when another slot becomes available!',
        },
        { status: 410 }
      );
      return addCorsHeaders(response);
    }

    // Check if already responded
    if (offer.status !== 'pending') {
      let message = `This offer has already been ${offer.status}`;
      let suggestion = '';

      switch (offer.status) {
        case 'accepted':
          message = 'This offer has already been accepted';
          suggestion = 'Check your email or SMS for appointment confirmation details.';
          break;
        case 'declined':
          message = 'This offer was declined';
          suggestion = 'You\'re still on the waitlist and will be notified of future openings.';
          break;
        case 'superseded':
          message = 'This offer is no longer available';
          suggestion = 'This slot has been offered to another patient. We\'ll notify you of future openings.';
          break;
        case 'expired':
          message = 'This offer has expired';
          suggestion = 'Don\'t worry - we\'ll notify you when another slot becomes available!';
          break;
      }

      const response = NextResponse.json(
        {
          success: false,
          error: message,
          code: `ALREADY_${offer.status.toUpperCase()}`,
          data: {
            status: offer.status,
            respondedAt: offer.respondedAt?.toISOString(),
            responseAction: offer.responseAction,
          },
          suggestion,
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Offer is valid and pending - return full details
    const entry = entriesStore.get(offer.waitlistEntryId);
    const service = serviceDetails[offer.appointmentSlot.serviceName];
    const provider = providerDetails[offer.appointmentSlot.practitionerId];

    // Calculate time remaining
    const timeRemainingMs = offer.expiresAt.getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeRemainingMs / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const secondsRemaining = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);

    const response = NextResponse.json({
      success: true,
      data: {
        offer: {
          id: offer.id,
          token: offer.offerToken,
          status: offer.status,
          sentAt: offer.sentAt.toISOString(),
          sentVia: offer.sentVia,
          expiresAt: offer.expiresAt.toISOString(),
          cascadeLevel: offer.cascadeLevel,
          timeRemaining: {
            hours: Math.max(0, hoursRemaining),
            minutes: Math.max(0, minutesRemaining),
            seconds: Math.max(0, secondsRemaining),
            totalMinutes: Math.max(0, Math.floor(timeRemainingMs / (1000 * 60))),
            totalSeconds: Math.max(0, Math.floor(timeRemainingMs / 1000)),
            display: hoursRemaining > 0
              ? `${hoursRemaining}h ${minutesRemaining}m`
              : `${minutesRemaining}m ${secondsRemaining}s`,
            isUrgent: timeRemainingMs < 10 * 60 * 1000, // Less than 10 minutes
            isExpired: timeRemainingMs <= 0,
          },
        },
        patient: {
          name: offer.patientName,
          // Mask phone and email for privacy
          phoneLast4: offer.patientPhone.slice(-4),
          emailMasked: offer.patientEmail
            ? `${offer.patientEmail.substring(0, 2)}***@${offer.patientEmail.split('@')[1]}`
            : undefined,
          tier: entry?.tier,
          tierDisplayName: entry ? getTierDisplayName(entry.tier) : undefined,
        },
        appointment: {
          date: offer.appointmentSlot.date.toISOString(),
          startTime: offer.appointmentSlot.startTime.toISOString(),
          endTime: offer.appointmentSlot.endTime.toISOString(),
          duration: offer.appointmentSlot.duration,
          formattedDate: moment(offer.appointmentSlot.date).format('dddd, MMMM D, YYYY'),
          formattedTime: `${moment(offer.appointmentSlot.startTime).format('h:mm A')} - ${moment(offer.appointmentSlot.endTime).format('h:mm A')}`,
          formattedStartTime: moment(offer.appointmentSlot.startTime).format('h:mm A'),
          relativeDate: moment(offer.appointmentSlot.date).calendar(null, {
            sameDay: '[Today]',
            nextDay: '[Tomorrow]',
            nextWeek: 'dddd',
            sameElse: 'MMMM D',
          }),
          service: {
            name: offer.appointmentSlot.serviceName,
            category: service?.category,
            description: service?.description,
            price: service?.price,
            duration: offer.appointmentSlot.duration,
          },
          practitioner: {
            id: offer.appointmentSlot.practitionerId,
            name: offer.appointmentSlot.practitionerName,
            initials: provider?.initials,
            discipline: provider?.discipline,
          },
          location: locationDetails,
          roomId: offer.appointmentSlot.roomId,
        },
        clinic: {
          name: 'Medical Spa',
          phone: locationDetails.phone,
          address: `${locationDetails.address}, ${locationDetails.city}, ${locationDetails.state} ${locationDetails.zip}`,
          cancellationPolicy: 'We require 24 hours notice for cancellations. Late cancellations or no-shows may be charged a fee.',
          bookingConfirmation: 'You will receive an SMS and email confirmation once you accept this offer.',
        },
        actions: {
          acceptUrl: `/api/waitlist/offer/${token}/respond`,
          declineUrl: `/api/waitlist/offer/${token}/respond`,
          instructions: {
            accept: 'POST with { "action": "accept" }',
            decline: 'POST with { "action": "decline", "reason": "optional reason" }',
          },
        },
      },
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error('Offer details error:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch offer details',
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
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}
