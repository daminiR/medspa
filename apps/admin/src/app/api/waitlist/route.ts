/**
 * GET /api/waitlist - List all waitlist entries with filters
 * POST /api/waitlist - Add a patient to the waitlist
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import {
  WaitlistEntry,
  WaitlistEntryStatus,
  WaitlistPriority,
  WaitlistTier,
  toWaitlistEntry,
  getWaitlistStats,
  calculateTierFromHistory,
} from '@/lib/waitlist';
import { mockWaitlistPatients, WaitlistPatient } from '@/lib/data/waitlist';
import { patients, services, practitioners } from '@/lib/data';
import { waitlistEntries } from './store';

// GET - List waitlist entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get('status') as WaitlistEntryStatus | null;
    const statusArray = searchParams.get('statuses')?.split(',') as WaitlistEntryStatus[] | undefined;
    const priority = searchParams.get('priority') as WaitlistPriority | null;
    const priorityArray = searchParams.get('priorities')?.split(',') as WaitlistPriority[] | undefined;
    const tier = searchParams.get('tier') as WaitlistTier | null;
    const tierArray = searchParams.get('tiers')?.split(',') as WaitlistTier[] | undefined;
    const serviceCategory = searchParams.get('serviceCategory') || undefined;
    const practitionerId = searchParams.get('practitionerId') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'waitingSince';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let result = [...waitlistEntries];

    // Calculate status counts before filtering
    const statusCounts: Record<WaitlistEntryStatus, number> = {
      active: waitlistEntries.filter(e => e.status === 'active').length,
      offered: waitlistEntries.filter(e => e.status === 'offered').length,
      booked: waitlistEntries.filter(e => e.status === 'booked').length,
      expired: waitlistEntries.filter(e => e.status === 'expired').length,
      removed: waitlistEntries.filter(e => e.status === 'removed').length,
    };

    // Apply filters
    if (statusArray && statusArray.length > 0) {
      result = result.filter(e => statusArray.includes(e.status));
    } else if (status) {
      result = result.filter(e => e.status === status);
    }

    if (priorityArray && priorityArray.length > 0) {
      result = result.filter(e => priorityArray.includes(e.priority));
    } else if (priority) {
      result = result.filter(e => e.priority === priority);
    }

    if (tierArray && tierArray.length > 0) {
      result = result.filter(e => tierArray.includes(e.tier));
    } else if (tier) {
      result = result.filter(e => e.tier === tier);
    }

    if (serviceCategory) {
      result = result.filter(e => e.serviceCategory === serviceCategory);
    }

    if (practitionerId) {
      result = result.filter(e => e.practitionerId === practitionerId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(searchLower) ||
        e.requestedService.toLowerCase().includes(searchLower) ||
        e.phone.includes(search) ||
        e.email?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const priorityOrder: Record<WaitlistPriority, number> = { high: 3, medium: 2, low: 1 };
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'priority':
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'tier':
          const tierOrder: Record<WaitlistTier, number> = { platinum: 3, gold: 2, silver: 1 };
          comparison = tierOrder[a.tier] - tierOrder[b.tier];
          break;
        case 'waitingSince':
        default:
          comparison = new Date(a.waitingSince).getTime() - new Date(b.waitingSince).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const total = result.length;

    // Pagination
    const start = (page - 1) * limit;
    result = result.slice(start, start + limit);

    // Enrich entries with additional data
    const enrichedEntries = result.map(entry => {
      const practitioner = entry.practitionerId
        ? practitioners.find(p => p.id === entry.practitionerId)
        : undefined;

      // Calculate days waiting
      const daysWaiting = moment().diff(moment(entry.waitingSince), 'days');

      return {
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
        preferredPractitioner: practitioner
          ? {
              id: practitioner.id,
              name: practitioner.name,
              discipline: practitioner.discipline,
            }
          : entry.preferredPractitioner ? { name: entry.preferredPractitioner } : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedEntries,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts,
    });
  } catch (error) {
    console.error('Waitlist GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch waitlist entries' },
      { status: 500 }
    );
  }
}

// POST - Add patient to waitlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      patientId,
      name,
      phone,
      email,
      requestedService,
      serviceCategory,
      serviceDuration,
      preferredPractitioner,
      practitionerId,
      availabilityStart,
      availabilityEnd,
      priority = 'medium',
      notes,
      hasCompletedForms = false,
      deposit,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'name is required' },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'phone is required' },
        { status: 400 }
      );
    }

    if (!requestedService) {
      return NextResponse.json(
        { success: false, error: 'requestedService is required' },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities: WaitlistPriority[] = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate practitioner if specified
    if (practitionerId) {
      const practitioner = practitioners.find(p => p.id === practitionerId);
      if (!practitioner) {
        return NextResponse.json(
          { success: false, error: 'Practitioner not found' },
          { status: 404 }
        );
      }
    }

    // Create the waitlist patient entry
    const newPatient: WaitlistPatient = {
      id: `wl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      phone,
      email: email || '',
      requestedService,
      serviceCategory: serviceCategory || 'other',
      serviceDuration: serviceDuration || 60,
      preferredPractitioner,
      practitionerId,
      availabilityStart: availabilityStart ? new Date(availabilityStart) : new Date(),
      availabilityEnd: availabilityEnd ? new Date(availabilityEnd) : moment().add(30, 'days').toDate(),
      waitingSince: new Date(),
      priority: priority as WaitlistPriority,
      notes,
      hasCompletedForms,
      deposit,
    };

    // Convert to full WaitlistEntry with tier calculation
    const patientHistory = patientId ? patients.find(p => p.id === patientId) : undefined;
    const newEntry = toWaitlistEntry(newPatient, patientHistory);

    // Add to store
    waitlistEntries.push(newEntry);

    return NextResponse.json({
      success: true,
      data: {
        ...newEntry,
        waitingSince: newEntry.waitingSince instanceof Date
          ? newEntry.waitingSince.toISOString()
          : newEntry.waitingSince,
        availabilityStart: newEntry.availabilityStart instanceof Date
          ? newEntry.availabilityStart.toISOString()
          : newEntry.availabilityStart,
        availabilityEnd: newEntry.availabilityEnd instanceof Date
          ? newEntry.availabilityEnd.toISOString()
          : newEntry.availabilityEnd,
      },
      message: 'Patient added to waitlist successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Waitlist POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add patient to waitlist' },
      { status: 500 }
    );
  }
}
