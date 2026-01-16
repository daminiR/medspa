/**
 * GET /api/waitlist/offer/[token] - Get offer details (for web UI)
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import {
  getOfferByToken,
  getTierDisplayName,
} from '@/lib/waitlist';
import { practitioners, services, locations } from '@/lib/data';
import { waitlistEntries } from '../../store';

// GET - Get offer details by token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const offer = getOfferByToken(token);
    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if offer has expired
    const now = new Date();
    if (now > offer.expiresAt && offer.status === 'pending') {
      // Update status to expired
      offer.status = 'expired';
      offer.responseAction = 'expired';
      return NextResponse.json(
        {
          success: false,
          error: 'This offer has expired',
          code: 'EXPIRED',
          data: {
            expiredAt: offer.expiresAt.toISOString(),
          },
        },
        { status: 410 }
      );
    }

    // Check if already responded
    if (offer.status !== 'pending') {
      return NextResponse.json({
        success: false,
        error: `This offer has already been ${offer.status}`,
        code: `ALREADY_${offer.status.toUpperCase()}`,
        data: {
          status: offer.status,
          respondedAt: offer.respondedAt?.toISOString(),
          responseAction: offer.responseAction,
        },
      }, { status: 400 });
    }

    // Get related data
    const entry = waitlistEntries.find(e => e.id === offer.waitlistEntryId);
    const practitioner = practitioners.find(p => p.id === offer.appointmentSlot.practitionerId);
    const service = services.find(s => s.name.toLowerCase() === offer.appointmentSlot.serviceName.toLowerCase());
    const location = locations[0]; // Default to first location

    // Calculate time remaining
    const timeRemainingMs = offer.expiresAt.getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeRemainingMs / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));

    return NextResponse.json({
      success: true,
      data: {
        offer: {
          id: offer.id,
          token: offer.offerToken,
          status: offer.status,
          sentAt: offer.sentAt.toISOString(),
          expiresAt: offer.expiresAt.toISOString(),
          sentVia: offer.sentVia,
          cascadeLevel: offer.cascadeLevel,
          timeRemaining: {
            hours: Math.max(0, hoursRemaining),
            minutes: Math.max(0, minutesRemaining),
            totalMinutes: Math.max(0, Math.floor(timeRemainingMs / (1000 * 60))),
            isExpired: timeRemainingMs <= 0,
          },
        },
        patient: {
          id: offer.patientId,
          name: offer.patientName,
          phone: offer.patientPhone,
          email: offer.patientEmail,
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
          service: {
            name: offer.appointmentSlot.serviceName,
            category: service?.category,
            description: service?.description,
            price: service?.price,
            duration: service?.duration,
          },
          practitioner: {
            id: practitioner?.id,
            name: offer.appointmentSlot.practitionerName,
            initials: practitioner?.initials,
            discipline: practitioner?.discipline,
          },
          location: {
            id: location.id,
            name: location.name,
            address: location.address,
          },
          roomId: offer.appointmentSlot.roomId,
        },
        clinic: {
          name: 'Medical Spa',
          phone: '(555) 100-0000',
          cancellationPolicy:
            'We require 24 hours notice for cancellations. Late cancellations or no-shows may be charged a fee.',
        },
        actions: {
          acceptUrl: `/api/waitlist/offer/${token}/respond`,
          declineUrl: `/api/waitlist/offer/${token}/respond`,
        },
      },
    });
  } catch (error) {
    console.error('Waitlist offer GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch offer details' },
      { status: 500 }
    );
  }
}
