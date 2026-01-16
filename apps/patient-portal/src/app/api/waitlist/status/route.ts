/**
 * GET /api/waitlist/status - Get patient's waitlist entries and status
 *
 * Returns all active waitlist entries for the authenticated patient,
 * including position in queue, days waiting, and pending offers.
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import {
  patientWaitlistEntries,
  patientOffers,
  type WaitlistEntry,
  type WaitlistOffer,
} from '@/lib/stores/waitlistStore';

// Re-define types for local use
type WaitlistTier = 'platinum' | 'gold' | 'silver';
type WaitlistPriority = 'high' | 'medium' | 'low';
type WaitlistEntryStatus = 'active' | 'offered' | 'booked' | 'removed' | 'expired';
type WaitlistOfferStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'superseded';

interface PatientSession {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Service details for enrichment
const serviceDetails: Record<string, { description: string; price: number }> = {
  'Botox Treatment': { description: 'Reduce fine lines and wrinkles', price: 350 },
  'Dermal Fillers': { description: 'Add volume and smooth deep lines', price: 600 },
  'Lip Filler': { description: 'Enhance lip fullness and shape', price: 550 },
  'Chemical Peel': { description: 'Improve skin texture and tone', price: 150 },
  'HydraFacial': { description: 'Deep cleanse, extract, and hydrate', price: 200 },
  'Microneedling': { description: 'Stimulate collagen production', price: 300 },
  'Laser Hair Removal': { description: 'Permanent hair reduction', price: 200 },
  'IPL Photofacial': { description: 'Treat sun damage and pigmentation', price: 250 },
  'CoolSculpting': { description: 'Non-invasive fat reduction', price: 750 },
  'Therapeutic Massage': { description: 'Relaxation and muscle relief', price: 120 },
};

// Provider details for enrichment
const providerDetails: Record<string, { name: string; discipline: string; imageUrl?: string }> = {
  '1': { name: 'Dr. Sarah Johnson', discipline: 'Aesthetic Medicine' },
  '2': { name: 'Dr. Emily Wilson', discipline: 'Dermatology' },
  '3': { name: 'Dr. Michael Chen', discipline: 'Cosmetic Surgery' },
  '4': { name: 'Jessica Martinez, RN', discipline: 'Aesthetic Nursing' },
};

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
 * Calculate position in queue for a specific entry
 */
function calculatePosition(entry: WaitlistEntry, allEntries: WaitlistEntry[]): number {
  let position = 1;

  for (const other of allEntries) {
    if (
      other.id !== entry.id &&
      other.status === 'active' &&
      other.requestedService === entry.requestedService
    ) {
      // Higher priority comes first
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const otherPriority = other.priority || 'low';
      const entryPriority = entry.priority || 'low';

      if (
        priorityOrder[otherPriority] > priorityOrder[entryPriority] ||
        (priorityOrder[otherPriority] === priorityOrder[entryPriority] &&
          new Date(other.waitingSince) < new Date(entry.waitingSince))
      ) {
        position++;
      }
    }
  }

  return position;
}

/**
 * Get pending offers for an entry
 */
function getPendingOffersForEntry(entryId: string): WaitlistOffer[] {
  const offers: WaitlistOffer[] = [];
  for (const offer of patientOffers.values()) {
    if (offer.waitlistEntryId === entryId && offer.status === 'pending') {
      // Check if expired
      if (new Date() > offer.expiresAt) {
        offer.status = 'expired';
      } else {
        offers.push(offer);
      }
    }
  }
  return offers;
}

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

// =============================================================================
// API ROUTE HANDLER
// =============================================================================

export async function GET(request: NextRequest) {
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

    // Get all entries for this patient
    const allEntries = Array.from(patientWaitlistEntries.values());
    const patientEntries = allEntries.filter(e => e.patientId === patient.id);

    // Calculate status counts
    const statusCounts = {
      active: 0,
      offered: 0,
      booked: 0,
      removed: 0,
      expired: 0,
    };

    for (const entry of patientEntries) {
      statusCounts[entry.status]++;
    }

    // Enrich entries with additional data
    const enrichedEntries = patientEntries.map(entry => {
      const daysWaiting = moment().diff(moment(entry.waitingSince), 'days');
      const position = calculatePosition(entry, allEntries);
      const pendingOffers = getPendingOffersForEntry(entry.id);
      const service = serviceDetails[entry.requestedService];
      const provider = entry.practitionerId ? providerDetails[entry.practitionerId] : null;

      return {
        id: entry.id,
        status: entry.status,
        tier: entry.tier,
        tierDisplayName: getTierDisplayName(entry.tier),
        service: {
          name: entry.requestedService,
          category: entry.serviceCategory,
          duration: entry.serviceDuration,
          description: service?.description,
          estimatedPrice: service?.price,
        },
        provider: provider
          ? {
              id: entry.practitionerId,
              name: provider.name,
              discipline: provider.discipline,
            }
          : entry.preferredPractitioner
          ? { name: entry.preferredPractitioner }
          : null,
        priority: entry.priority,
        position: entry.status === 'active' ? position : null,
        queueInfo: entry.status === 'active'
          ? {
              position,
              estimatedWait: position <= 3 ? 'Soon' : position <= 7 ? '1-2 weeks' : '2+ weeks',
            }
          : null,
        timing: {
          waitingSince: entry.waitingSince instanceof Date
            ? entry.waitingSince.toISOString()
            : entry.waitingSince,
          daysWaiting,
          availabilityStart: entry.availabilityStart instanceof Date
            ? entry.availabilityStart.toISOString()
            : entry.availabilityStart,
          availabilityEnd: entry.availabilityEnd instanceof Date
            ? entry.availabilityEnd.toISOString()
            : entry.availabilityEnd,
        },
        pendingOffers: pendingOffers.map(offer => ({
          id: offer.id,
          token: offer.offerToken,
          status: offer.status,
          expiresAt: offer.expiresAt.toISOString(),
          expiresIn: {
            minutes: Math.max(0, Math.floor((offer.expiresAt.getTime() - Date.now()) / (1000 * 60))),
            isExpired: new Date() > offer.expiresAt,
          },
          appointment: {
            date: moment(offer.appointmentSlot.date).format('dddd, MMMM D, YYYY'),
            time: moment(offer.appointmentSlot.startTime).format('h:mm A'),
            practitioner: offer.appointmentSlot.practitionerName,
            service: offer.appointmentSlot.serviceName,
            duration: offer.appointmentSlot.duration,
          },
          actionUrl: `/api/waitlist/offer/${offer.offerToken}/respond`,
        })),
        hasPendingOffer: pendingOffers.length > 0,
        offerCount: entry.offerCount,
        formsCompleted: entry.hasCompletedForms,
        depositPaid: entry.deposit ? entry.deposit > 0 : false,
        depositAmount: entry.deposit || 0,
        notes: entry.notes,
      };
    });

    // Sort by status (active first) then by waiting time
    enrichedEntries.sort((a, b) => {
      const statusOrder = { active: 0, offered: 1, booked: 2, removed: 3, expired: 4 };
      const statusDiff = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.timing.waitingSince).getTime() - new Date(a.timing.waitingSince).getTime();
    });

    return NextResponse.json({
      success: true,
      data: {
        entries: enrichedEntries,
        summary: {
          totalEntries: patientEntries.length,
          activeEntries: statusCounts.active,
          pendingOffers: enrichedEntries.filter(e => e.hasPendingOffer).length,
          statusCounts,
        },
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
        },
      },
    });
  } catch (error) {
    console.error('Waitlist status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch waitlist status',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
