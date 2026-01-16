/**
 * GET /api/waitlist/history - Get patient's offer history
 *
 * Returns all offers sent to the authenticated patient, including
 * accepted, declined, and expired offers. Paginated results with
 * appointment details for accepted offers.
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type WaitlistOfferStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'superseded';
type OfferChannel = 'sms' | 'email' | 'both';
type OfferResponseAction = 'accepted' | 'declined' | 'expired' | 'no_response';

interface WaitlistOffer {
  id: string;
  waitlistEntryId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  offerToken: string;
  status: WaitlistOfferStatus;
  sentAt: Date;
  sentVia: OfferChannel;
  expiresAt: Date;
  respondedAt?: Date;
  responseAction?: OfferResponseAction;
  cascadeLevel: number;
  appointmentSlot: {
    practitionerId: string;
    practitionerName: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    serviceName: string;
    duration: number;
    roomId?: string;
  };
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  serviceName: string;
  practitionerId: string;
  practitionerName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: string;
  roomId?: string;
  bookingType: string;
}

interface PatientSession {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// =============================================================================
// IN-MEMORY STORES
// =============================================================================

// Offers store indexed by patient ID
const offersByPatient: Map<string, WaitlistOffer[]> = new Map();

// Appointments store for accepted offer details
const appointmentsStore: Map<string, Appointment> = new Map();

// Provider details
const providerDetails: Record<string, { discipline: string; initials: string }> = {
  '1': { discipline: 'Aesthetic Medicine', initials: 'SJ' },
  '2': { discipline: 'Dermatology', initials: 'EW' },
  '3': { discipline: 'Cosmetic Surgery', initials: 'MC' },
  '4': { discipline: 'Aesthetic Nursing', initials: 'JM' },
};

// Service details
const serviceDetails: Record<string, { category: string; price: number }> = {
  'Botox Treatment': { category: 'injectables', price: 350 },
  'Dermal Fillers': { category: 'injectables', price: 600 },
  'Lip Filler': { category: 'injectables', price: 550 },
  'Chemical Peel': { category: 'facial', price: 150 },
  'HydraFacial': { category: 'facial', price: 200 },
  'Microneedling': { category: 'facial', price: 300 },
  'Laser Hair Removal': { category: 'laser', price: 200 },
  'IPL Photofacial': { category: 'laser', price: 250 },
  'CoolSculpting': { category: 'body', price: 750 },
  'Therapeutic Massage': { category: 'wellness', price: 120 },
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
 * Get human-readable status label
 */
function getStatusLabel(status: WaitlistOfferStatus): string {
  switch (status) {
    case 'pending': return 'Awaiting Response';
    case 'accepted': return 'Accepted';
    case 'declined': return 'Declined';
    case 'expired': return 'Expired';
    case 'superseded': return 'No Longer Available';
    default: return status;
  }
}

/**
 * Get status color for UI
 */
function getStatusColor(status: WaitlistOfferStatus): string {
  switch (status) {
    case 'pending': return 'yellow';
    case 'accepted': return 'green';
    case 'declined': return 'gray';
    case 'expired': return 'red';
    case 'superseded': return 'orange';
    default: return 'gray';
  }
}

/**
 * Get appointment for an accepted offer
 */
function getAppointmentForOffer(offerId: string, patientId: string): Appointment | null {
  for (const apt of appointmentsStore.values()) {
    if (apt.patientId === patientId && apt.bookingType === 'waitlist') {
      // In production, we would have a direct link between offer and appointment
      return apt;
    }
  }
  return null;
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);
    const status = searchParams.get('status') as WaitlistOfferStatus | null;
    const sortBy = searchParams.get('sortBy') || 'sentAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // Get all offers for this patient
    let offers = offersByPatient.get(patient.id) || [];

    // Filter by status if specified
    if (status) {
      offers = offers.filter(o => o.status === status);
    }

    // Calculate status counts
    const allOffers = offersByPatient.get(patient.id) || [];
    const statusCounts = {
      pending: allOffers.filter(o => o.status === 'pending').length,
      accepted: allOffers.filter(o => o.status === 'accepted').length,
      declined: allOffers.filter(o => o.status === 'declined').length,
      expired: allOffers.filter(o => o.status === 'expired').length,
      superseded: allOffers.filter(o => o.status === 'superseded').length,
    };

    // Sort offers
    offers.sort((a, b) => {
      let aValue: Date;
      let bValue: Date;

      switch (sortBy) {
        case 'respondedAt':
          aValue = a.respondedAt || a.sentAt;
          bValue = b.respondedAt || b.sentAt;
          break;
        case 'expiresAt':
          aValue = a.expiresAt;
          bValue = b.expiresAt;
          break;
        case 'appointmentDate':
          aValue = a.appointmentSlot.date;
          bValue = b.appointmentSlot.date;
          break;
        case 'sentAt':
        default:
          aValue = a.sentAt;
          bValue = b.sentAt;
      }

      const diff = aValue.getTime() - bValue.getTime();
      return sortOrder === 'asc' ? diff : -diff;
    });

    // Calculate pagination
    const total = offers.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedOffers = offers.slice(start, start + limit);

    // Enrich offers with additional details
    const enrichedOffers = paginatedOffers.map(offer => {
      const slot = offer.appointmentSlot;
      const provider = providerDetails[slot.practitionerId];
      const service = serviceDetails[slot.serviceName];

      // Get appointment details if accepted
      let appointmentDetails = null;
      if (offer.status === 'accepted') {
        const appointment = getAppointmentForOffer(offer.id, patient.id);
        if (appointment) {
          appointmentDetails = {
            id: appointment.id,
            status: appointment.status,
            startTime: appointment.startTime.toISOString(),
            endTime: appointment.endTime.toISOString(),
            formattedDate: moment(appointment.startTime).format('dddd, MMMM D, YYYY'),
            formattedTime: moment(appointment.startTime).format('h:mm A'),
          };
        }
      }

      // Calculate response time if responded
      let responseTime = null;
      if (offer.respondedAt) {
        const responseMinutes = Math.floor(
          (new Date(offer.respondedAt).getTime() - new Date(offer.sentAt).getTime()) / (1000 * 60)
        );
        responseTime = {
          minutes: responseMinutes,
          display: responseMinutes < 60
            ? `${responseMinutes} min`
            : `${Math.floor(responseMinutes / 60)}h ${responseMinutes % 60}m`,
        };
      }

      return {
        id: offer.id,
        status: offer.status,
        statusLabel: getStatusLabel(offer.status),
        statusColor: getStatusColor(offer.status),
        sentAt: offer.sentAt.toISOString(),
        sentAtFormatted: moment(offer.sentAt).format('MMM D, YYYY [at] h:mm A'),
        sentAtRelative: moment(offer.sentAt).fromNow(),
        sentVia: offer.sentVia,
        expiresAt: offer.expiresAt.toISOString(),
        expiresAtFormatted: moment(offer.expiresAt).format('MMM D, YYYY [at] h:mm A'),
        respondedAt: offer.respondedAt?.toISOString(),
        respondedAtFormatted: offer.respondedAt
          ? moment(offer.respondedAt).format('MMM D, YYYY [at] h:mm A')
          : null,
        responseAction: offer.responseAction,
        responseTime,
        appointment: {
          date: slot.date.toISOString(),
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
          formattedDate: moment(slot.date).format('dddd, MMMM D, YYYY'),
          formattedTime: `${moment(slot.startTime).format('h:mm A')} - ${moment(slot.endTime).format('h:mm A')}`,
          duration: slot.duration,
          service: {
            name: slot.serviceName,
            category: service?.category,
            price: service?.price,
          },
          practitioner: {
            id: slot.practitionerId,
            name: slot.practitionerName,
            initials: provider?.initials,
            discipline: provider?.discipline,
          },
          roomId: slot.roomId,
        },
        bookedAppointment: appointmentDetails,
        cascadeLevel: offer.cascadeLevel,
        isPending: offer.status === 'pending',
        isExpired: offer.status === 'expired',
        wasAccepted: offer.status === 'accepted',
        wasDeclined: offer.status === 'declined',
      };
    });

    // Calculate statistics
    const acceptedOffers = allOffers.filter(o => o.status === 'accepted');
    const declinedOffers = allOffers.filter(o => o.status === 'declined');
    const expiredOffers = allOffers.filter(o => o.status === 'expired');
    const totalResponded = acceptedOffers.length + declinedOffers.length;

    const statistics = {
      totalOffers: allOffers.length,
      acceptedCount: acceptedOffers.length,
      declinedCount: declinedOffers.length,
      expiredCount: expiredOffers.length,
      pendingCount: statusCounts.pending,
      acceptanceRate: totalResponded > 0
        ? Math.round((acceptedOffers.length / totalResponded) * 100)
        : 0,
      averageResponseTime: null as number | null,
    };

    // Calculate average response time for responded offers
    const respondedOffers = allOffers.filter(o => o.respondedAt);
    if (respondedOffers.length > 0) {
      const totalResponseTime = respondedOffers.reduce((sum, o) => {
        return sum + (new Date(o.respondedAt!).getTime() - new Date(o.sentAt).getTime());
      }, 0);
      statistics.averageResponseTime = Math.round(
        totalResponseTime / respondedOffers.length / (1000 * 60)
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        offers: enrichedOffers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        statistics,
        statusCounts,
        filters: {
          status,
          sortBy,
          sortOrder,
        },
      },
    });
  } catch (error) {
    console.error('Offer history error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch offer history',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// Note: offersByPatient and appointmentsStore are module-level stores
// They should not be exported from route files as it violates Next.js route conventions
