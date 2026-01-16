/**
 * GET /api/waitlist/[id] - Get single waitlist entry details
 * PUT /api/waitlist/[id] - Update waitlist entry
 * DELETE /api/waitlist/[id] - Remove from waitlist
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import {
  WaitlistEntry,
  WaitlistEntryStatus,
  WaitlistPriority,
  WaitlistTier,
  getOffersByEntryId,
  getTierDisplayName,
} from '@/lib/waitlist';
import { practitioners } from '@/lib/data';

// Import shared waitlist store from main route
// Note: In production, this would be a database
import { waitlistEntries } from '../store';

// GET - Get single entry details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const entry = waitlistEntries.find(e => e.id === id);
    if (!entry) {
      return NextResponse.json(
        { success: false, error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    // Get practitioner details if available
    const practitioner = entry.practitionerId
      ? practitioners.find(p => p.id === entry.practitionerId)
      : undefined;

    // Get offer history for this entry
    const offers = getOffersByEntryId(entry.id);
    const offerHistory = offers.map(offer => ({
      id: offer.id,
      status: offer.status,
      sentAt: offer.sentAt instanceof Date ? offer.sentAt.toISOString() : offer.sentAt,
      expiresAt: offer.expiresAt instanceof Date ? offer.expiresAt.toISOString() : offer.expiresAt,
      respondedAt: offer.respondedAt instanceof Date ? offer.respondedAt.toISOString() : offer.respondedAt,
      responseAction: offer.responseAction,
      sentVia: offer.sentVia,
      cascadeLevel: offer.cascadeLevel,
      appointmentSlot: {
        practitionerName: offer.appointmentSlot.practitionerName,
        serviceName: offer.appointmentSlot.serviceName,
        date: offer.appointmentSlot.date instanceof Date
          ? offer.appointmentSlot.date.toISOString()
          : offer.appointmentSlot.date,
        startTime: offer.appointmentSlot.startTime instanceof Date
          ? offer.appointmentSlot.startTime.toISOString()
          : offer.appointmentSlot.startTime,
        endTime: offer.appointmentSlot.endTime instanceof Date
          ? offer.appointmentSlot.endTime.toISOString()
          : offer.appointmentSlot.endTime,
        duration: offer.appointmentSlot.duration,
      },
    })).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    // Calculate days waiting
    const daysWaiting = moment().diff(moment(entry.waitingSince), 'days');

    const enrichedEntry = {
      ...entry,
      waitingSince: entry.waitingSince instanceof Date
        ? entry.waitingSince.toISOString()
        : entry.waitingSince,
      availabilityStart: entry.availabilityStart instanceof Date
        ? entry.availabilityStart.toISOString()
        : entry.availabilityStart,
      availabilityEnd: entry.availabilityEnd instanceof Date
        ? entry.availabilityEnd.toISOString()
        : entry.availabilityEnd,
      offeredAt: entry.offeredAt instanceof Date ? entry.offeredAt.toISOString() : entry.offeredAt,
      bookedAt: entry.bookedAt instanceof Date ? entry.bookedAt.toISOString() : entry.bookedAt,
      removedAt: entry.removedAt instanceof Date ? entry.removedAt.toISOString() : entry.removedAt,
      lastOfferAt: entry.lastOfferAt instanceof Date ? entry.lastOfferAt.toISOString() : entry.lastOfferAt,
      daysWaiting,
      tierDisplayName: getTierDisplayName(entry.tier),
      preferredPractitionerDetails: practitioner
        ? {
            id: practitioner.id,
            name: practitioner.name,
            initials: practitioner.initials,
            discipline: practitioner.discipline,
          }
        : undefined,
      offerHistory,
      offerStats: {
        totalOffers: entry.offerCount,
        acceptedOffers: entry.acceptedOffers || 0,
        declinedOffers: entry.declinedOffers || 0,
        averageResponseTimeMinutes: entry.averageResponseTimeMinutes,
      },
    };

    return NextResponse.json({
      success: true,
      data: enrichedEntry,
    });
  } catch (error) {
    console.error('Waitlist GET [id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch waitlist entry' },
      { status: 500 }
    );
  }
}

// PUT - Update waitlist entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Find the entry
    const entryIndex = waitlistEntries.findIndex(e => e.id === id);
    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    const existingEntry = waitlistEntries[entryIndex];

    // Cannot update removed/booked entries
    if (existingEntry.status === 'removed' || existingEntry.status === 'booked') {
      return NextResponse.json(
        { success: false, error: `Cannot update entry with status: ${existingEntry.status}` },
        { status: 400 }
      );
    }

    const {
      priority,
      status,
      notes,
      availabilityStart,
      availabilityEnd,
      hasCompletedForms,
      deposit,
    } = body;

    // Validate priority if provided
    if (priority) {
      const validPriorities: WaitlistPriority[] = ['low', 'medium', 'high'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { success: false, error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses: WaitlistEntryStatus[] = ['active', 'offered', 'booked', 'expired', 'removed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Apply updates
    if (priority !== undefined) existingEntry.priority = priority;
    if (status !== undefined) existingEntry.status = status;
    if (notes !== undefined) existingEntry.notes = notes;
    if (availabilityStart !== undefined) existingEntry.availabilityStart = new Date(availabilityStart);
    if (availabilityEnd !== undefined) existingEntry.availabilityEnd = new Date(availabilityEnd);
    if (hasCompletedForms !== undefined) existingEntry.hasCompletedForms = hasCompletedForms;
    if (deposit !== undefined) existingEntry.deposit = deposit;

    // Handle status transitions
    if (status === 'booked' && !existingEntry.bookedAt) {
      existingEntry.bookedAt = new Date();
    }
    if (status === 'removed' && !existingEntry.removedAt) {
      existingEntry.removedAt = new Date();
      existingEntry.removedReason = body.removedReason;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...existingEntry,
        waitingSince: existingEntry.waitingSince instanceof Date
          ? existingEntry.waitingSince.toISOString()
          : existingEntry.waitingSince,
        availabilityStart: existingEntry.availabilityStart instanceof Date
          ? existingEntry.availabilityStart.toISOString()
          : existingEntry.availabilityStart,
        availabilityEnd: existingEntry.availabilityEnd instanceof Date
          ? existingEntry.availabilityEnd.toISOString()
          : existingEntry.availabilityEnd,
        offeredAt: existingEntry.offeredAt instanceof Date ? existingEntry.offeredAt.toISOString() : existingEntry.offeredAt,
        bookedAt: existingEntry.bookedAt instanceof Date ? existingEntry.bookedAt.toISOString() : existingEntry.bookedAt,
        removedAt: existingEntry.removedAt instanceof Date ? existingEntry.removedAt.toISOString() : existingEntry.removedAt,
        lastOfferAt: existingEntry.lastOfferAt instanceof Date ? existingEntry.lastOfferAt.toISOString() : existingEntry.lastOfferAt,
      },
      message: 'Waitlist entry updated successfully',
    });
  } catch (error) {
    console.error('Waitlist PUT [id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update waitlist entry' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from waitlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Get removal details from query params or body
    let reason: string | undefined;

    // Try to get from body (for POST-style DELETE with body)
    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // No body, try query params
      reason = searchParams.get('reason') || undefined;
    }

    // Find the entry
    const entryIndex = waitlistEntries.findIndex(e => e.id === id);
    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    const entry = waitlistEntries[entryIndex];

    // Cannot remove already removed entries
    if (entry.status === 'removed') {
      return NextResponse.json(
        { success: false, error: 'Entry has already been removed' },
        { status: 400 }
      );
    }

    // Soft delete - mark as removed
    entry.status = 'removed';
    entry.removedAt = new Date();
    entry.removedReason = reason;

    return NextResponse.json({
      success: true,
      data: {
        id: entry.id,
        status: entry.status,
        removedAt: entry.removedAt.toISOString(),
        removedReason: entry.removedReason,
      },
      message: 'Patient removed from waitlist successfully',
    });
  } catch (error) {
    console.error('Waitlist DELETE [id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove from waitlist' },
      { status: 500 }
    );
  }
}
