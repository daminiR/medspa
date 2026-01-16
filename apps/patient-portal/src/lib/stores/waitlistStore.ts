/**
 * Shared in-memory stores for waitlist functionality
 *
 * In production, these would be replaced with database queries.
 * These stores are shared across multiple API routes to maintain consistency.
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type WaitlistTier = 'platinum' | 'gold' | 'silver';
type WaitlistOfferStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'superseded';
type WaitlistEntryStatus = 'active' | 'offered' | 'booked' | 'removed' | 'expired';
type OfferChannel = 'sms' | 'email' | 'both';
type OfferResponseAction = 'accepted' | 'declined' | 'expired' | 'no_response';
type WaitlistPriority = 'high' | 'medium' | 'low';

export interface WaitlistOffer {
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
  previousOfferId?: string;
  supersededById?: string;
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

export interface WaitlistEntry {
  id: string;
  patientId: string;
  name: string;
  phone: string;
  email?: string;
  requestedService: string;
  serviceCategory: string;
  serviceDuration?: number;
  preferredPractitioner?: string;
  practitionerId?: string;
  availabilityStart?: Date;
  availabilityEnd?: Date;
  waitingSince: Date;
  priority?: WaitlistPriority;
  notes?: string;
  hasCompletedForms?: boolean;
  deposit?: number;
  status: WaitlistEntryStatus;
  tier: WaitlistTier;
  offerCount: number;
  acceptedOffers?: number;
  declinedOffers?: number;
  totalResponses?: number;
  averageResponseTimeMinutes?: number;
  bookedAt?: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  serviceName: string;
  serviceCategory: string;
  practitionerId: string;
  practitionerName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: string;
  roomId?: string;
  bookingType: string;
  createdAt: Date;
  notes?: string;
}

// =============================================================================
// IN-MEMORY STORES
// =============================================================================

/**
 * Map of offer tokens to offer objects
 */
export const offersByToken: Map<string, WaitlistOffer> = new Map();

/**
 * Map of entry IDs to waitlist entries
 */
export const entriesStore: Map<string, WaitlistEntry> = new Map();

/**
 * Map of patient IDs to their waitlist entries
 */
export const patientWaitlistEntries: Map<string, WaitlistEntry> = new Map();

/**
 * Map of offer IDs to offers (for patient-specific lookups)
 */
export const patientOffers: Map<string, WaitlistOffer> = new Map();

/**
 * Map of appointment IDs to appointments
 */
export const appointmentsStore: Map<string, Appointment> = new Map();
