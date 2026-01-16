/**
 * POST /api/waitlist/join - Patient joins the waitlist
 *
 * This endpoint allows authenticated patients to join the waitlist for a specific service.
 * It validates the request, calculates the patient's tier, and sends a confirmation SMS.
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';

// =============================================================================
// TYPE DEFINITIONS (inline to avoid cross-app imports in patient portal)
// =============================================================================

type WaitlistTier = 'platinum' | 'gold' | 'silver';
type WaitlistPriority = 'high' | 'medium' | 'low';
type WaitlistEntryStatus = 'active' | 'offered' | 'booked' | 'removed' | 'expired';

interface WaitlistEntry {
  id: string;
  patientId: string;
  name: string;
  phone: string;
  email: string;
  requestedService: string;
  serviceCategory: string;
  serviceDuration: number;
  preferredPractitioner?: string;
  practitionerId?: string;
  availabilityStart: Date;
  availabilityEnd: Date;
  availabilityWindows?: AvailabilityWindow[];
  waitingSince: Date;
  priority: WaitlistPriority;
  notes?: string;
  hasCompletedForms: boolean;
  deposit?: number;
  status: WaitlistEntryStatus;
  tier: WaitlistTier;
  offerCount: number;
  consentGiven: boolean;
  consentTimestamp?: Date;
}

interface AvailabilityWindow {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

interface PatientSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: Date;
  lastVisit?: Date;
}

// =============================================================================
// IN-MEMORY STORES (In production, replace with database)
// =============================================================================

// Shared waitlist entries store for patient portal
const patientWaitlistEntries: Map<string, WaitlistEntry> = new Map();

// Available services (subset for patient portal)
const availableServices = [
  { id: 'botox', name: 'Botox Treatment', category: 'injectables', duration: 30 },
  { id: 'filler', name: 'Dermal Fillers', category: 'injectables', duration: 45 },
  { id: 'lip-filler', name: 'Lip Filler', category: 'injectables', duration: 45 },
  { id: 'chemical-peel', name: 'Chemical Peel', category: 'facial', duration: 60 },
  { id: 'hydrafacial', name: 'HydraFacial', category: 'facial', duration: 60 },
  { id: 'microneedling', name: 'Microneedling', category: 'facial', duration: 90 },
  { id: 'laser-hair', name: 'Laser Hair Removal', category: 'laser', duration: 30 },
  { id: 'ipl', name: 'IPL Photofacial', category: 'laser', duration: 45 },
  { id: 'coolsculpting', name: 'CoolSculpting', category: 'body', duration: 60 },
  { id: 'massage', name: 'Therapeutic Massage', category: 'wellness', duration: 60 },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Mock authentication - In production, use NextAuth or similar
 * Returns the authenticated patient session or null
 */
function getPatientSession(request: NextRequest): PatientSession | null {
  // Check for authorization header or session cookie
  const authHeader = request.headers.get('authorization');
  const sessionCookie = request.cookies.get('patient-session');

  // For demo purposes, accept a patient ID in the header
  // In production, validate JWT or session token
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Mock: treat token as patient ID for demo
    return {
      id: token,
      name: 'Demo Patient',
      email: 'patient@example.com',
      phone: '(555) 000-0000',
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    };
  }

  // Mock session from cookie
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
 * Calculate patient tier based on history
 */
function calculateTier(patient: PatientSession): WaitlistTier {
  let tierScore = 0;

  // Account age scoring
  if (patient.createdAt) {
    const accountAgeDays = moment().diff(moment(patient.createdAt), 'days');
    if (accountAgeDays > 365) tierScore += 30;
    else if (accountAgeDays > 180) tierScore += 20;
    else if (accountAgeDays > 90) tierScore += 10;
  }

  // Recent activity scoring
  if (patient.lastVisit) {
    const daysSinceLastVisit = moment().diff(moment(patient.lastVisit), 'days');
    if (daysSinceLastVisit < 30) tierScore += 25;
    else if (daysSinceLastVisit < 60) tierScore += 15;
    else if (daysSinceLastVisit < 90) tierScore += 10;
  }

  // Profile completeness
  if (patient.email && patient.phone) tierScore += 10;

  // Determine tier
  if (tierScore >= 50) return 'platinum';
  if (tierScore >= 25) return 'gold';
  return 'silver';
}

/**
 * Check if patient is already on waitlist for the same service
 */
function isAlreadyOnWaitlist(patientId: string, serviceId: string): boolean {
  for (const entry of patientWaitlistEntries.values()) {
    if (
      entry.patientId === patientId &&
      entry.requestedService.toLowerCase().includes(serviceId.toLowerCase()) &&
      entry.status === 'active'
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Send confirmation SMS (mock implementation)
 */
async function sendConfirmationSms(phone: string, patientName: string, serviceName: string, position: number): Promise<boolean> {
  const message = `Hi ${patientName}! You're now on our waitlist for ${serviceName} (position #${position}). We'll text you when a slot opens up. Reply STOP to opt out.`;
  console.log(`[SMS] Sending to ${phone}: ${message}`);
  // In production, integrate with Twilio or similar
  return true;
}

/**
 * Generate unique entry ID
 */
function generateEntryId(): string {
  return `wl-patient-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// =============================================================================
// API ROUTE HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const {
      serviceId,
      serviceName,
      providerPreference,
      practitionerId,
      availabilityWindows,
      availabilityStart,
      availabilityEnd,
      notes,
      consent,
    } = body;

    // ==========================================================================
    // VALIDATION
    // ==========================================================================

    // Validate consent
    if (!consent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Consent is required to join the waitlist',
          code: 'CONSENT_REQUIRED',
        },
        { status: 400 }
      );
    }

    // Validate service
    if (!serviceId && !serviceName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service ID or service name is required',
          code: 'SERVICE_REQUIRED',
        },
        { status: 400 }
      );
    }

    // Find the service
    const service = serviceId
      ? availableServices.find(s => s.id === serviceId)
      : availableServices.find(s => s.name.toLowerCase() === serviceName?.toLowerCase());

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service not found',
          code: 'SERVICE_NOT_FOUND',
          availableServices: availableServices.map(s => ({ id: s.id, name: s.name })),
        },
        { status: 404 }
      );
    }

    // Check if already on waitlist for this service
    if (isAlreadyOnWaitlist(patient.id, service.id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'You are already on the waitlist for this service',
          code: 'ALREADY_ON_WAITLIST',
        },
        { status: 409 }
      );
    }

    // Validate availability windows if provided
    if (availabilityWindows && Array.isArray(availabilityWindows)) {
      for (const window of availabilityWindows) {
        if (window.dayOfWeek < 0 || window.dayOfWeek > 6) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid day of week in availability window (must be 0-6)',
              code: 'INVALID_AVAILABILITY',
            },
            { status: 400 }
          );
        }
        // Validate time format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(window.startTime) || !timeRegex.test(window.endTime)) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid time format in availability window (use HH:mm)',
              code: 'INVALID_TIME_FORMAT',
            },
            { status: 400 }
          );
        }
      }
    }

    // ==========================================================================
    // CREATE WAITLIST ENTRY
    // ==========================================================================

    // Calculate tier
    const tier = calculateTier(patient);

    // Determine availability range
    const startDate = availabilityStart
      ? new Date(availabilityStart)
      : new Date();
    const endDate = availabilityEnd
      ? new Date(availabilityEnd)
      : moment().add(30, 'days').toDate();

    // Create the entry
    const entryId = generateEntryId();
    const entry: WaitlistEntry = {
      id: entryId,
      patientId: patient.id,
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      requestedService: service.name,
      serviceCategory: service.category,
      serviceDuration: service.duration,
      preferredPractitioner: providerPreference,
      practitionerId,
      availabilityStart: startDate,
      availabilityEnd: endDate,
      availabilityWindows,
      waitingSince: new Date(),
      priority: 'medium', // Patients join at medium priority; staff can adjust
      notes,
      hasCompletedForms: false,
      status: 'active',
      tier,
      offerCount: 0,
      consentGiven: true,
      consentTimestamp: new Date(),
    };

    // Store the entry
    patientWaitlistEntries.set(entryId, entry);

    // Calculate approximate position (entries with same service, higher priority, or longer wait)
    let position = 1;
    for (const existingEntry of patientWaitlistEntries.values()) {
      if (
        existingEntry.id !== entryId &&
        existingEntry.status === 'active' &&
        existingEntry.requestedService === service.name &&
        (existingEntry.priority === 'high' ||
          (existingEntry.priority === 'medium' && existingEntry.waitingSince < entry.waitingSince))
      ) {
        position++;
      }
    }

    // Send confirmation SMS
    await sendConfirmationSms(patient.phone, patient.name, service.name, position);

    // ==========================================================================
    // RESPONSE
    // ==========================================================================

    return NextResponse.json(
      {
        success: true,
        data: {
          entryId,
          service: {
            id: service.id,
            name: service.name,
            category: service.category,
            estimatedDuration: service.duration,
          },
          tier,
          tierDescription: tier === 'platinum'
            ? 'Platinum VIP - Priority access to cancellations'
            : tier === 'gold'
            ? 'Gold Member - Elevated priority'
            : 'Member',
          status: 'active',
          position,
          waitingSince: entry.waitingSince.toISOString(),
          availabilityRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
          providerPreference: providerPreference || 'Any available provider',
        },
        message: `You've been added to the waitlist for ${service.name}. We'll notify you when a slot becomes available!`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Waitlist join error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to join waitlist',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// Note: patientWaitlistEntries is module-level store, not exported from routes
