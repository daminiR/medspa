/**
 * POST /api/waitlist/offer - Send a slot offer to a waitlist patient
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import {
  WaitlistEntry,
  WaitlistOffer,
  OfferChannel,
  DEFAULT_WAITLIST_SETTINGS,
  createWaitlistOffer,
  isSlotLocked,
  acquireSlotLock,
  buildOfferUrl,
  waitlistSmsTemplates,
} from '@/lib/waitlist';
import { practitioners, services } from '@/lib/data';
import { waitlistEntries } from '../store';

// POST - Create and send a slot offer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      waitlistEntryId,
      appointmentSlot,
      expiresInMinutes = DEFAULT_WAITLIST_SETTINGS.offerExpiryMinutes,
      notificationChannel,
    } = body;

    // Validate required fields
    if (!waitlistEntryId) {
      return NextResponse.json(
        { success: false, error: 'waitlistEntryId is required' },
        { status: 400 }
      );
    }

    if (!appointmentSlot) {
      return NextResponse.json(
        { success: false, error: 'appointmentSlot is required' },
        { status: 400 }
      );
    }

    // Validate appointment slot structure
    const { date, startTime, endTime, practitionerId, serviceName, roomId } = appointmentSlot;

    if (!date || !startTime || !endTime || !practitionerId || !serviceName) {
      return NextResponse.json(
        {
          success: false,
          error: 'appointmentSlot must include date, startTime, endTime, practitionerId, and serviceName',
        },
        { status: 400 }
      );
    }

    // Get the waitlist entry
    const entry = waitlistEntries.find(e => e.id === waitlistEntryId);
    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    // Check entry status
    if (entry.status !== 'active' && entry.status !== 'offered') {
      return NextResponse.json(
        { success: false, error: `Cannot send offer to entry with status: ${entry.status}` },
        { status: 400 }
      );
    }

    // Validate practitioner
    const practitioner = practitioners.find(p => p.id === practitionerId);
    if (!practitioner) {
      return NextResponse.json(
        { success: false, error: 'Practitioner not found' },
        { status: 404 }
      );
    }

    // Parse dates
    const slotDate = new Date(date);
    const slotStartTime = new Date(startTime);
    const slotEndTime = new Date(endTime);

    // Validate slot is in the future
    if (slotStartTime <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Appointment slot must be in the future' },
        { status: 400 }
      );
    }

    // Check minimum notice time
    const hoursUntilSlot = moment(slotStartTime).diff(moment(), 'hours', true);
    if (hoursUntilSlot < DEFAULT_WAITLIST_SETTINGS.minNoticeHours) {
      return NextResponse.json(
        {
          success: false,
          error: `Slot is too soon. Minimum ${DEFAULT_WAITLIST_SETTINGS.minNoticeHours} hours notice required.`,
        },
        { status: 400 }
      );
    }

    // Check if slot is already locked
    if (isSlotLocked(practitionerId, slotDate, slotStartTime)) {
      return NextResponse.json(
        { success: false, error: 'The requested slot is currently locked by another offer' },
        { status: 409 }
      );
    }

    // Calculate duration
    const duration = moment(slotEndTime).diff(moment(slotStartTime), 'minutes');

    // Create the offer using the library function
    const offer = await createWaitlistOffer(
      entry,
      {
        practitionerId,
        practitionerName: practitioner.name,
        date: slotDate,
        startTime: slotStartTime,
        endTime: slotEndTime,
        serviceName,
        duration,
        roomId,
      } as any, // Cast to match the slot interface
      practitioner.name,
      serviceName,
      {
        ...DEFAULT_WAITLIST_SETTINGS,
        offerExpiryMinutes: expiresInMinutes,
      },
      0, // cascade level
      undefined // no previous offer
    );

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Failed to create offer. The slot may already be locked or an offer was already sent.' },
        { status: 409 }
      );
    }

    // Update entry status and tracking
    entry.status = 'offered';
    entry.offeredAt = new Date();
    entry.offerCount++;
    entry.lastOfferAt = new Date();

    // Build the offer URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const offerUrl = buildOfferUrl(baseUrl, offer.offerToken);

    // Generate SMS message
    const smsMessage = waitlistSmsTemplates.slotOffer(
      entry.name,
      serviceName,
      moment(slotDate).format('MMM D'),
      moment(slotStartTime).format('h:mm A'),
      practitioner.name,
      expiresInMinutes,
      offerUrl
    );

    return NextResponse.json({
      success: true,
      data: {
        offer: {
          id: offer.id,
          token: offer.offerToken,
          waitlistEntryId: offer.waitlistEntryId,
          patientId: offer.patientId,
          patientName: offer.patientName,
          status: offer.status,
          sentAt: offer.sentAt.toISOString(),
          expiresAt: offer.expiresAt.toISOString(),
          sentVia: offer.sentVia,
          cascadeLevel: offer.cascadeLevel,
          appointmentSlot: {
            date: offer.appointmentSlot.date.toISOString(),
            startTime: offer.appointmentSlot.startTime.toISOString(),
            endTime: offer.appointmentSlot.endTime.toISOString(),
            practitionerId: offer.appointmentSlot.practitionerId,
            practitionerName: offer.appointmentSlot.practitionerName,
            serviceName: offer.appointmentSlot.serviceName,
            duration: offer.appointmentSlot.duration,
            roomId: offer.appointmentSlot.roomId,
          },
        },
        offerUrl,
        smsMessage,
        entryStatus: entry.status,
      },
      message: `Offer sent successfully via ${offer.sentVia}`,
    }, { status: 201 });
  } catch (error) {
    console.error('Waitlist offer POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create and send offer' },
      { status: 500 }
    );
  }
}
