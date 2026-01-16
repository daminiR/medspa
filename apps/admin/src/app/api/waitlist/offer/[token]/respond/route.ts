/**
 * POST /api/waitlist/offer/[token]/respond - Handle offer acceptance or decline
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import {
  getOfferByToken,
  handleOfferResponse,
  cascadeOfferToNext,
  DEFAULT_WAITLIST_SETTINGS,
  waitlistSmsTemplates,
  buildOfferUrl,
} from '@/lib/waitlist';
import { appointments, practitioners } from '@/lib/data';
import { waitlistEntries } from '../../../store';

// POST - Respond to an offer (accept or decline)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    const { action, declineReason } = body;

    // Validate action
    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'action is required and must be "accept" or "decline"',
        },
        { status: 400 }
      );
    }

    // Get the offer
    const offer = getOfferByToken(token);
    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get the entry
    const entry = waitlistEntries.find(e => e.id === offer.waitlistEntryId);
    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Waitlist entry not found', code: 'ENTRY_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Use the library function to handle the response
    const result = await handleOfferResponse(token, action);

    if (!result.success) {
      // Determine appropriate status code
      let statusCode = 400;
      if (result.error?.includes('expired')) {
        statusCode = 410;
      } else if (result.error?.includes('not found') || result.error?.includes('Invalid')) {
        statusCode = 404;
      } else if (result.error?.includes('no longer available')) {
        statusCode = 409;
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: result.error?.includes('expired') ? 'EXPIRED' : 'INVALID_RESPONSE',
        },
        { status: statusCode }
      );
    }

    // If accepted, update entry status and return appointment details
    if (action === 'accept' && result.appointment) {
      // Update entry status
      entry.status = 'booked';
      entry.bookedAt = new Date();
      entry.acceptedOffers = (entry.acceptedOffers || 0) + 1;

      // Track response time
      const responseTimeMinutes = moment(offer.respondedAt).diff(moment(offer.sentAt), 'minutes');
      entry.totalResponses = (entry.totalResponses || 0) + 1;
      const prevTotal = entry.totalResponses - 1;
      const prevAvg = entry.averageResponseTimeMinutes || 0;
      entry.averageResponseTimeMinutes = Math.round(
        (prevAvg * prevTotal + responseTimeMinutes) / entry.totalResponses
      );

      // Add appointment to store
      appointments.push(result.appointment);

      // Generate confirmation SMS
      const smsConfirmation = waitlistSmsTemplates.slotOfferAccepted(
        entry.name,
        offer.appointmentSlot.serviceName,
        moment(offer.appointmentSlot.date).format('MMM D'),
        moment(offer.appointmentSlot.startTime).format('h:mm A'),
        offer.appointmentSlot.practitionerName
      );

      return NextResponse.json({
        success: true,
        data: {
          action: 'accepted',
          offer: {
            id: offer.id,
            status: offer.status,
            respondedAt: offer.respondedAt?.toISOString(),
          },
          appointment: {
            id: result.appointment.id,
            patientName: result.appointment.patientName,
            serviceName: result.appointment.serviceName,
            practitionerId: result.appointment.practitionerId,
            startTime: result.appointment.startTime instanceof Date
              ? result.appointment.startTime.toISOString()
              : result.appointment.startTime,
            endTime: result.appointment.endTime instanceof Date
              ? result.appointment.endTime.toISOString()
              : result.appointment.endTime,
            status: result.appointment.status,
            bookingType: result.appointment.bookingType,
          },
          waitlistEntry: {
            id: entry.id,
            status: entry.status,
            bookedAt: entry.bookedAt?.toISOString(),
          },
          smsConfirmation,
        },
        message: 'Appointment booked successfully! You will receive a confirmation shortly.',
      });
    }

    // If declined, handle cascade to next patient
    if (action === 'decline') {
      // Update entry stats
      entry.declinedOffers = (entry.declinedOffers || 0) + 1;
      entry.status = 'active'; // Back to active for future offers

      // Track response time
      const responseTimeMinutes = moment(offer.respondedAt).diff(moment(offer.sentAt), 'minutes');
      entry.totalResponses = (entry.totalResponses || 0) + 1;
      const prevTotal = entry.totalResponses - 1;
      const prevAvg = entry.averageResponseTimeMinutes || 0;
      entry.averageResponseTimeMinutes = Math.round(
        (prevAvg * prevTotal + responseTimeMinutes) / entry.totalResponses
      );

      // Try to cascade to next patient
      let cascadeInfo = null;
      if (offer.cascadeLevel < DEFAULT_WAITLIST_SETTINGS.maxOffersPerSlot - 1) {
        const nextOffer = await cascadeOfferToNext(
          offer.id,
          waitlistEntries,
          DEFAULT_WAITLIST_SETTINGS
        );

        if (nextOffer) {
          // Find the next entry
          const nextEntry = waitlistEntries.find(e => e.id === nextOffer.waitlistEntryId);

          // Build offer URL for the cascade
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const nextOfferUrl = buildOfferUrl(baseUrl, nextOffer.offerToken);

          cascadeInfo = {
            cascadedTo: {
              entryId: nextOffer.waitlistEntryId,
              patientName: nextOffer.patientName,
            },
            newOffer: {
              id: nextOffer.id,
              token: nextOffer.offerToken,
              expiresAt: nextOffer.expiresAt.toISOString(),
              cascadeLevel: nextOffer.cascadeLevel,
              offerUrl: nextOfferUrl,
            },
          };

          // Update next entry status
          if (nextEntry) {
            nextEntry.status = 'offered';
            nextEntry.offeredAt = new Date();
            nextEntry.offerCount++;
            nextEntry.lastOfferAt = new Date();
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          action: 'declined',
          offer: {
            id: offer.id,
            status: offer.status,
            respondedAt: offer.respondedAt?.toISOString(),
            responseAction: offer.responseAction,
          },
          waitlistEntry: {
            id: entry.id,
            status: entry.status,
            declinedOffers: entry.declinedOffers,
          },
          cascade: cascadeInfo,
        },
        message: declineReason
          ? `Offer declined: ${declineReason}`
          : 'Offer declined. We will notify you of future availability.',
      });
    }

    // Fallback response
    return NextResponse.json({
      success: true,
      data: {
        action,
        offer: {
          id: offer.id,
          status: offer.status,
        },
      },
    });
  } catch (error) {
    console.error('Waitlist offer respond POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process offer response' },
      { status: 500 }
    );
  }
}
