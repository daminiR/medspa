/**
 * Waitlist Offer Management
 * Functions for managing waitlist offers that can be imported by other modules
 */

import { sendSMS, formatPhoneNumber } from '@/lib/twilio'
import { appointments, services, practitioners } from '@/lib/data'
import { WaitlistPatient, mockWaitlistPatients } from '@/lib/data/waitlist'

// Import WaitlistOffer type from the main waitlist library
// Note: The WaitlistOffer type in waitlist.ts is more comprehensive.
// This file uses a simplified local interface for its specific use case.
// For the full type definition, see @/lib/waitlist.ts

// ============================================================================
// TYPES (Local simplified version for this module)
// ============================================================================

/**
 * Simplified WaitlistOffer for this module's SMS-based offer flow.
 * For the full WaitlistOffer type with cascade tracking and more,
 * see WaitlistOffer in @/lib/waitlist.ts
 */
export interface WaitlistOfferSimple {
  id: string
  waitlistEntryId: string
  patientPhone: string
  patientName: string
  serviceId: string
  serviceName: string
  practitionerId: string
  slotStartTime: Date
  slotEndTime: Date
  offeredAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'slot_taken'
  respondedAt?: Date
  version: number
}

// Re-export as WaitlistOffer for backwards compatibility
export type WaitlistOffer = WaitlistOfferSimple

export interface WaitlistEntry {
  id: string
  patientPhone: string
  patientName: string
  patientId?: string
  serviceId: string
  serviceName: string
  preferredPractitionerId?: string
  status: 'active' | 'booked' | 'removed' | 'expired'
  removedReason?: string
  removedAt?: Date
  createdAt: Date
  position: number
}

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

export const waitlistOffers: Map<string, WaitlistOffer> = new Map()
export const waitlistEntries: Map<string, WaitlistEntry> = new Map()

// Initialize mock waitlist entries from existing waitlist patients
mockWaitlistPatients.forEach((patient, index) => {
  const normalizedPhone = patient.phone.replace(/\D/g, '')
  waitlistEntries.set(patient.id, {
    id: patient.id,
    patientPhone: normalizedPhone,
    patientName: patient.name,
    serviceId: patient.requestedService.toLowerCase().replace(/\s+/g, '-'),
    serviceName: patient.requestedService,
    preferredPractitionerId: patient.practitionerId,
    status: 'active',
    createdAt: patient.waitingSince,
    position: index + 1
  })
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function findPendingOfferByPhone(phone: string): WaitlistOffer | null {
  const normalizedPhone = phone.replace(/\D/g, '').slice(-10)

  for (const offer of Array.from(waitlistOffers.values())) {
    const offerPhone = offer.patientPhone.replace(/\D/g, '').slice(-10)
    if (offerPhone === normalizedPhone && offer.status === 'pending') {
      if (new Date() < offer.expiresAt) {
        return offer
      }
    }
  }
  return null
}

export function findWaitlistEntriesByPhone(phone: string): WaitlistEntry[] {
  const normalizedPhone = phone.replace(/\D/g, '').slice(-10)
  const entries: WaitlistEntry[] = []

  for (const entry of Array.from(waitlistEntries.values())) {
    const entryPhone = entry.patientPhone.replace(/\D/g, '').slice(-10)
    if (entryPhone === normalizedPhone && entry.status === 'active') {
      entries.push(entry)
    }
  }

  return entries.sort((a, b) => a.position - b.position)
}

export function isSlotStillAvailable(practitionerId: string, startTime: Date, endTime: Date): boolean {
  const practitionerAppointments = appointments.filter(apt =>
    apt.practitionerId === practitionerId &&
    apt.status !== 'cancelled' &&
    apt.status !== 'deleted'
  )

  for (const apt of practitionerAppointments) {
    const aptStart = new Date(apt.startTime).getTime()
    const aptEnd = new Date(apt.endTime).getTime()
    const slotStart = startTime.getTime()
    const slotEnd = endTime.getTime()

    if (slotStart < aptEnd && slotEnd > aptStart) {
      return false
    }
  }

  return true
}

export function getWaitlistPosition(phone: string): { position: number; total: number; estimatedWait?: string } | null {
  const entries = findWaitlistEntriesByPhone(phone)
  if (entries.length === 0) return null

  const entry = entries[0]

  const activeEntries = Array.from(waitlistEntries.values())
    .filter(e => e.status === 'active')
    .sort((a, b) => a.position - b.position)

  const positionIndex = activeEntries.findIndex(e => e.id === entry.id)
  if (positionIndex === -1) return null

  const position = positionIndex + 1
  const total = activeEntries.length

  let estimatedWait: string | undefined
  if (position <= 3) {
    estimatedWait = 'You may receive an offer soon'
  } else if (position <= 10) {
    estimatedWait = 'Estimated wait: 1-3 days'
  } else {
    estimatedWait = 'Estimated wait: 3-7 days'
  }

  return { position, total, estimatedWait }
}

export function removeFromWaitlist(phone: string, reason: string): { removed: number; entries: WaitlistEntry[] } {
  const entries = findWaitlistEntriesByPhone(phone)
  const removed: WaitlistEntry[] = []

  for (const entry of entries) {
    entry.status = 'removed'
    entry.removedReason = reason
    entry.removedAt = new Date()
    waitlistEntries.set(entry.id, entry)
    removed.push(entry)
  }

  return { removed: removed.length, entries: removed }
}

// ============================================================================
// EXPORTED API FUNCTIONS
// ============================================================================

/**
 * Create and send a waitlist offer to a patient
 */
export async function createWaitlistOffer(
  patientPhone: string,
  patientName: string,
  serviceId: string,
  serviceName: string,
  practitionerId: string,
  slotStartTime: Date,
  slotEndTime: Date,
  expiryMinutes: number = 30
): Promise<{ success: boolean; offerId?: string; error?: string }> {
  const entries = findWaitlistEntriesByPhone(patientPhone)
  const entry = entries.find(e => e.serviceName.toLowerCase() === serviceName.toLowerCase())

  if (!entry) {
    return { success: false, error: 'Patient not found on waitlist for this service' }
  }

  if (!isSlotStillAvailable(practitionerId, slotStartTime, slotEndTime)) {
    return { success: false, error: 'Slot is no longer available' }
  }

  const existingOffer = findPendingOfferByPhone(patientPhone)
  if (existingOffer) {
    return { success: false, error: 'Patient already has a pending offer' }
  }

  const offerId = `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const offer: WaitlistOffer = {
    id: offerId,
    waitlistEntryId: entry.id,
    patientPhone: patientPhone.replace(/\D/g, ''),
    patientName,
    serviceId,
    serviceName,
    practitionerId,
    slotStartTime,
    slotEndTime,
    offeredAt: new Date(),
    expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
    status: 'pending',
    version: 1
  }

  waitlistOffers.set(offerId, offer)

  const timeStr = slotStartTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const dateStr = slotStartTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const practitioner = practitioners.find(p => p.id === practitionerId)

  const offerMessage = `Hi ${patientName}! Great news - a ${serviceName} appointment just opened up for ${dateStr} at ${timeStr}${practitioner ? ` with ${practitioner.name}` : ''}. Reply YES to book or NO to pass. This offer expires in ${expiryMinutes} minutes.`

  const smsResult = await sendSMS(formatPhoneNumber(patientPhone), offerMessage)

  if (!smsResult.success) {
    waitlistOffers.delete(offerId)
    return { success: false, error: 'Failed to send offer SMS' }
  }

  console.log(`[WAITLIST OFFER] Sent offer ${offerId} to ${patientName} for ${serviceName} on ${dateStr} at ${timeStr}`)

  return { success: true, offerId }
}

/**
 * Get all active waitlist entries
 */
export function getActiveWaitlistEntries(): WaitlistEntry[] {
  return Array.from(waitlistEntries.values())
    .filter(e => e.status === 'active')
    .sort((a, b) => a.position - b.position)
}

/**
 * Get all pending waitlist offers
 */
export function getPendingWaitlistOffers(): WaitlistOffer[] {
  return Array.from(waitlistOffers.values())
    .filter(o => o.status === 'pending' && new Date() < o.expiresAt)
}

/**
 * Manually expire old offers (can be called by a cron job)
 */
export function expireOldOffers(): { expired: number } {
  let expiredCount = 0
  const now = new Date()

  for (const [id, offer] of Array.from(waitlistOffers.entries())) {
    if (offer.status === 'pending' && now >= offer.expiresAt) {
      offer.status = 'expired'
      waitlistOffers.set(id, offer)
      expiredCount++
    }
  }

  return { expired: expiredCount }
}
