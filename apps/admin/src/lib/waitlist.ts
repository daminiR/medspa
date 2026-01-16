/**
 * =============================================================================
 * WAITLIST SERVICE LIBRARY
 * =============================================================================
 * Core service library powering the entire waitlist management system.
 * Provides smart matching, offer management, slot locking, and tier-based priority.
 *
 * Features:
 * - VIP tier system (Platinum 2x, Gold 1.5x, Silver 1x multipliers)
 * - Smart matching algorithm with response speed bonus and offer count penalty
 * - Cryptographically secure offer tokens
 * - Slot locking with optimistic locking (version field)
 * - Offer cascading to next eligible patient
 * - Idempotency tracking to prevent duplicate SMS
 * - Auto-expiration cleanup
 * =============================================================================
 */

import moment from 'moment'
import { Appointment, Patient } from '@/lib/data'
import { WaitlistPatient } from '@/lib/data/waitlist'
import { AvailableSlot } from '@/types/calendar'

// =============================================================================
// CORE TYPE DEFINITIONS
// =============================================================================

/**
 * VIP tier levels for priority-based waitlist management
 * Platinum: High-value, frequent customers (2x score multiplier)
 * Gold: Regular customers with good history (1.5x score multiplier)
 * Silver: New or infrequent customers (1x score multiplier)
 */
export type WaitlistTier = 'platinum' | 'gold' | 'silver'

/**
 * Status of a waitlist entry through its lifecycle
 */
export type WaitlistEntryStatus = 'active' | 'offered' | 'booked' | 'removed' | 'expired'

/**
 * Priority levels for waitlist entries
 */
export type WaitlistPriority = 'high' | 'medium' | 'low'

/**
 * Extended waitlist entry with full lifecycle tracking
 * Builds on the existing WaitlistPatient type with additional fields
 */
export interface WaitlistEntry extends WaitlistPatient {
  status: WaitlistEntryStatus
  tier: WaitlistTier
  offeredAt?: Date
  bookedAt?: Date
  removedAt?: Date
  removedReason?: string
  offerCount: number
  lastOfferAt?: Date
  // Response tracking for priority scoring
  averageResponseTimeMinutes?: number
  totalResponses?: number
  acceptedOffers?: number
  declinedOffers?: number
}

/**
 * Appointment slot details for an offer
 */
export interface OfferAppointmentSlot {
  practitionerId: string
  practitionerName: string
  date: Date
  startTime: Date
  endTime: Date
  serviceName: string
  duration: number
  roomId?: string
}

/**
 * Status of a waitlist offer
 */
export type WaitlistOfferStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'superseded'

/**
 * Response action taken on an offer
 */
export type OfferResponseAction = 'accepted' | 'declined' | 'expired' | 'no_response'

/**
 * Communication channel for sending offers
 */
export type OfferChannel = 'sms' | 'email' | 'both'

/**
 * Full waitlist offer with tracking
 */
export interface WaitlistOffer {
  id: string
  waitlistEntryId: string
  patientId: string
  patientName: string
  patientPhone: string
  patientEmail?: string
  appointmentSlot: OfferAppointmentSlot
  offerToken: string // Secure token for URL/SMS
  expiresAt: Date
  status: WaitlistOfferStatus
  sentAt: Date
  sentVia: OfferChannel
  respondedAt?: Date
  responseAction?: OfferResponseAction
  smsMessageId?: string // Twilio SID
  emailMessageId?: string
  // Cascade tracking
  cascadeLevel: number
  previousOfferId?: string
  supersededById?: string
}

/**
 * Offer sequence strategies for determining which patient gets offered first
 */
export type OfferSequence = 'priority' | 'fifo' | 'tier_weighted'

/**
 * Tier weight configuration for weighted selection
 * Values represent percentage weights (e.g., 60/30/10)
 */
export interface TierWeights {
  platinum: number
  gold: number
  silver: number
}

/**
 * Waitlist system settings
 */
export interface WaitlistSettings {
  autoOfferEnabled: boolean
  offerExpiryMinutes: number // Default: 30
  maxOffersPerSlot: number // Cascade to N patients
  minNoticeHours: number // Don't offer if <N hours away
  offerSequence: OfferSequence
  tierWeights: TierWeights // e.g., { platinum: 60, gold: 30, silver: 10 }
  sendReminders: boolean
  reminderFrequencyDays: number // Default: 7
  autoExpireAfterDays: number // Default: 30
  smsEnabled: boolean
  emailEnabled: boolean
  multiChannelDelay: number // Minutes between SMS and email
}

/**
 * Cancelled slot information for matching
 */
export interface CancelledSlot {
  appointmentId: string
  practitionerId: string
  practitionerName: string
  date: Date
  startTime: Date
  endTime: Date
  duration: number
  serviceName: string
  serviceCategory: string
  roomId?: string
  cancelledAt: Date
}

/**
 * Match result with scoring breakdown
 */
export interface WaitlistMatch {
  entry: WaitlistEntry
  score: number
  matchReasons: string[]
  scoreBreakdown: ScoreBreakdown
  isEligible: boolean
  ineligibilityReasons: string[]
}

/**
 * Detailed score breakdown for transparency
 */
export interface ScoreBreakdown {
  baseScore: number
  tierMultiplier: number
  tierScore: number
  priorityScore: number
  serviceMatchScore: number
  durationFitScore: number
  practitionerMatchScore: number
  waitTimeScore: number
  formsReadyScore: number
  depositScore: number
  availabilityScore: number
  responseSpeedBonus: number
  offerCountPenalty: number
  totalScore: number
}

/**
 * Slot lock for preventing double-booking
 * Uses optimistic locking with version field
 */
export interface SlotLock {
  id: string
  slotKey: string
  practitionerId: string
  date: Date
  startTime: Date
  endTime: Date
  offerId: string
  lockedAt: Date
  expiresAt: Date
  version: number // Optimistic locking version
}

/**
 * Result of handling an offer response
 */
export interface OfferResponseResult {
  success: boolean
  appointment?: Appointment
  error?: string
  nextOffer?: WaitlistOffer
}

// =============================================================================
// DEFAULT SETTINGS
// =============================================================================

export const DEFAULT_WAITLIST_SETTINGS: WaitlistSettings = {
  autoOfferEnabled: true,
  offerExpiryMinutes: 30,
  maxOffersPerSlot: 3,
  minNoticeHours: 2,
  offerSequence: 'tier_weighted',
  tierWeights: {
    platinum: 60,
    gold: 30,
    silver: 10
  },
  sendReminders: true,
  reminderFrequencyDays: 7,
  autoExpireAfterDays: 30,
  smsEnabled: true,
  emailEnabled: true,
  multiChannelDelay: 5
}

// =============================================================================
// IN-MEMORY STORES (Replace with database in production)
// =============================================================================

// Offer tracking store
const offersStore: Map<string, WaitlistOffer> = new Map()
const offersByToken: Map<string, string> = new Map()
const offersByEntry: Map<string, string[]> = new Map()

// Slot lock store with version tracking
const slotLocks: Map<string, SlotLock> = new Map()

// Idempotency tracking (entryId + slotTime + date) to prevent duplicate SMS
const sentOfferKeys: Set<string> = new Set()

// =============================================================================
// TIER CALCULATION
// =============================================================================

/**
 * Calculate VIP tier based on patient history
 *
 * Platinum: High-value, frequent customers
 * - Account age > 1 year
 * - Recent visits (within 30 days)
 * - Complete profile
 *
 * Gold: Regular customers with good history
 * - Account age > 6 months
 * - Recent visits (within 60 days)
 *
 * Silver: New or infrequent customers
 * - Default tier for everyone else
 */
export function calculateTierFromHistory(patient: Patient): WaitlistTier {
  // In production, this would query appointment history, spending, etc.
  // For now, use a simplified calculation based on available data

  let tierScore = 0

  // Factor 1: Account age (older = more loyal)
  if (patient.createdAt) {
    const accountAgeDays = moment().diff(moment(patient.createdAt), 'days')
    if (accountAgeDays > 365) tierScore += 30 // Over 1 year
    else if (accountAgeDays > 180) tierScore += 20 // Over 6 months
    else if (accountAgeDays > 90) tierScore += 10 // Over 3 months
  }

  // Factor 2: Recent activity (recent visits = engaged customer)
  if (patient.lastVisit) {
    const daysSinceLastVisit = moment().diff(moment(patient.lastVisit), 'days')
    if (daysSinceLastVisit < 30) tierScore += 25 // Very recent
    else if (daysSinceLastVisit < 60) tierScore += 15
    else if (daysSinceLastVisit < 90) tierScore += 10
  }

  // Factor 3: Has complete profile (shows engagement)
  if (patient.email && patient.phone) tierScore += 10
  if (patient.dateOfBirth) tierScore += 5
  if (patient.address) tierScore += 5

  // Determine tier based on score
  if (tierScore >= 50) return 'platinum'
  if (tierScore >= 25) return 'gold'
  return 'silver'
}

/**
 * Get tier multiplier for scoring
 * Platinum: 2x, Gold: 1.5x, Silver: 1x
 */
export function getTierMultiplier(tier: WaitlistTier): number {
  switch (tier) {
    case 'platinum': return 2.0
    case 'gold': return 1.5
    case 'silver': return 1.0
    default: return 1.0
  }
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: WaitlistTier): string {
  switch (tier) {
    case 'platinum': return 'Platinum VIP'
    case 'gold': return 'Gold Member'
    case 'silver': return 'Member'
    default: return 'Member'
  }
}

// =============================================================================
// SECURE TOKEN GENERATION
// =============================================================================

/**
 * Generate a cryptographically secure random token for offer URLs
 * Uses Web Crypto API when available, falls back to Math.random
 *
 * Token format: URL-safe base64, 32 bytes of entropy
 */
export function generateOfferToken(): string {
  // Generate 32 bytes of random data
  const bytes = new Uint8Array(32)

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Use Web Crypto API for secure randomness
    crypto.getRandomValues(bytes)
  } else {
    // Fallback for environments without Web Crypto
    // NOTE: Less secure, should only be used in development
    console.warn('[Waitlist] Using fallback random generation - not cryptographically secure')
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }

  // Convert to URL-safe base64
  const base64 = btoa(String.fromCharCode(...Array.from(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return base64
}

/**
 * Generate a unique offer ID
 */
export function generateOfferId(): string {
  const timestamp = Date.now().toString(36)
  const random = generateOfferToken().substring(0, 8)
  return `offer_${timestamp}_${random}`
}

/**
 * Generate a unique lock ID
 */
function generateLockId(): string {
  return `lock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// =============================================================================
// SLOT LOCKING MECHANISM
// =============================================================================

/**
 * Generate a unique key for a slot
 */
function generateSlotKey(
  practitionerId: string,
  date: Date,
  startTime: Date
): string {
  const dateStr = moment(date).format('YYYY-MM-DD')
  const timeStr = moment(startTime).format('HH:mm')
  return `${practitionerId}_${dateStr}_${timeStr}`
}

/**
 * Attempt to acquire a lock on a slot
 * Returns the lock if successful, null if slot is already locked
 * Uses optimistic locking with version field
 */
export function acquireSlotLock(
  practitionerId: string,
  date: Date,
  startTime: Date,
  endTime: Date,
  offerId: string,
  expiryMinutes: number
): SlotLock | null {
  const slotKey = generateSlotKey(practitionerId, date, startTime)

  // Check for existing lock
  const existingLock = slotLocks.get(slotKey)
  if (existingLock) {
    // Check if existing lock has expired
    if (moment().isBefore(moment(existingLock.expiresAt))) {
      // Lock still valid - cannot acquire
      console.log(`[Waitlist] Slot ${slotKey} is locked by offer ${existingLock.offerId} until ${existingLock.expiresAt}`)
      return null
    }
    // Lock expired - remove it
    console.log(`[Waitlist] Removing expired lock for slot ${slotKey}`)
    slotLocks.delete(slotKey)
  }

  // Create new lock with version 1
  const lock: SlotLock = {
    id: generateLockId(),
    slotKey,
    practitionerId,
    date,
    startTime,
    endTime,
    offerId,
    lockedAt: new Date(),
    expiresAt: moment().add(expiryMinutes, 'minutes').toDate(),
    version: 1
  }

  slotLocks.set(slotKey, lock)
  console.log(`[Waitlist] Acquired lock ${lock.id} for slot ${slotKey}, expires at ${lock.expiresAt}`)

  return lock
}

/**
 * Release a slot lock
 * Only releases if the offer ID matches (prevents releasing someone else's lock)
 */
export function releaseSlotLock(
  practitionerId: string,
  date: Date,
  startTime: Date,
  offerId: string
): boolean {
  const slotKey = generateSlotKey(practitionerId, date, startTime)
  const lock = slotLocks.get(slotKey)

  if (!lock) {
    console.log(`[Waitlist] No lock found for slot ${slotKey}`)
    return false
  }

  // Only release if the offer ID matches
  if (lock.offerId !== offerId) {
    console.warn(`[Waitlist] Cannot release lock - offer ID mismatch (expected ${lock.offerId}, got ${offerId})`)
    return false
  }

  slotLocks.delete(slotKey)
  console.log(`[Waitlist] Released lock for slot ${slotKey}`)
  return true
}

/**
 * Check if a slot is currently locked
 */
export function isSlotLocked(
  practitionerId: string,
  date: Date,
  startTime: Date
): boolean {
  const slotKey = generateSlotKey(practitionerId, date, startTime)
  const lock = slotLocks.get(slotKey)

  if (!lock) return false

  // Check if lock has expired
  if (moment().isAfter(moment(lock.expiresAt))) {
    slotLocks.delete(slotKey)
    return false
  }

  return true
}

/**
 * Get the lock for a slot if it exists and is valid
 */
export function getSlotLock(
  practitionerId: string,
  date: Date,
  startTime: Date
): SlotLock | null {
  const slotKey = generateSlotKey(practitionerId, date, startTime)
  const lock = slotLocks.get(slotKey)

  if (!lock) return null

  // Check if lock has expired
  if (moment().isAfter(moment(lock.expiresAt))) {
    slotLocks.delete(slotKey)
    return null
  }

  return lock
}

/**
 * Update lock version (optimistic locking)
 * Returns the new version or null if version mismatch
 */
export function updateLockVersion(
  slotKey: string,
  expectedVersion: number
): number | null {
  const lock = slotLocks.get(slotKey)

  if (!lock) {
    console.warn(`[Waitlist] Lock not found for key ${slotKey}`)
    return null
  }

  if (lock.version !== expectedVersion) {
    console.warn(`[Waitlist] Version mismatch for lock ${slotKey} (expected ${expectedVersion}, got ${lock.version})`)
    return null
  }

  lock.version++
  return lock.version
}

// =============================================================================
// IDEMPOTENCY TRACKING
// =============================================================================

/**
 * Generate idempotency key for an offer
 * Combination of entryId + date + startTime ensures uniqueness
 */
function generateIdempotencyKey(
  entryId: string,
  date: Date,
  startTime: Date
): string {
  const dateStr = moment(date).format('YYYY-MM-DD')
  const timeStr = moment(startTime).format('HH:mm')
  return `${entryId}_${dateStr}_${timeStr}`
}

/**
 * Check if an offer has already been sent for this combination
 * Prevents duplicate SMS for the same offer
 */
export function hasOfferBeenSent(
  entryId: string,
  date: Date,
  startTime: Date
): boolean {
  const key = generateIdempotencyKey(entryId, date, startTime)
  return sentOfferKeys.has(key)
}

/**
 * Mark an offer as sent
 */
export function markOfferAsSent(
  entryId: string,
  date: Date,
  startTime: Date
): void {
  const key = generateIdempotencyKey(entryId, date, startTime)
  sentOfferKeys.add(key)
  console.log(`[Waitlist] Marked offer as sent for key ${key}`)
}

/**
 * Clear idempotency tracking (useful for testing)
 */
export function clearIdempotencyTracking(): void {
  sentOfferKeys.clear()
  console.log('[Waitlist] Cleared idempotency tracking')
}

// =============================================================================
// SMART MATCHING ALGORITHM
// =============================================================================

/**
 * Calculate comprehensive match score for a waitlist entry against a slot
 *
 * Scoring factors:
 * - VIP tier multiplier (Platinum 2x, Gold 1.5x, Silver 1x)
 * - Priority level (high/medium/low)
 * - Service match (exact, similar, or category)
 * - Duration fit (service must fit in slot)
 * - Practitioner preference match
 * - Wait time bonus (longer wait = higher priority)
 * - Forms/deposit completion bonus
 * - Availability window match
 * - Response speed bonus (fast responders get priority)
 * - Offer count penalty (reduce score if offered many times without booking)
 */
export function calculateMatchScore(
  entry: WaitlistEntry,
  slot: CancelledSlot,
  settings: WaitlistSettings
): {
  score: number
  breakdown: ScoreBreakdown
  reasons: string[]
  eligible: boolean
  ineligibilityReasons: string[]
} {
  const reasons: string[] = []
  const ineligibilityReasons: string[] = []
  let eligible = true

  // Initialize score breakdown
  const breakdown: ScoreBreakdown = {
    baseScore: 0,
    tierMultiplier: getTierMultiplier(entry.tier),
    tierScore: 0,
    priorityScore: 0,
    serviceMatchScore: 0,
    durationFitScore: 0,
    practitionerMatchScore: 0,
    waitTimeScore: 0,
    formsReadyScore: 0,
    depositScore: 0,
    availabilityScore: 0,
    responseSpeedBonus: 0,
    offerCountPenalty: 0,
    totalScore: 0
  }

  // ==========================================================================
  // ELIGIBILITY CHECKS (Hard requirements)
  // ==========================================================================

  // Check 1: Service duration must fit in the slot
  // Don't offer 4-hour facial for 2-hour slot
  if (entry.serviceDuration > slot.duration) {
    eligible = false
    ineligibilityReasons.push(`Service requires ${entry.serviceDuration}min but slot is only ${slot.duration}min`)
  }

  // Check 2: Slot must be within patient's availability window
  const slotTime = moment(slot.startTime)
  const availStart = moment(entry.availabilityStart)
  const availEnd = moment(entry.availabilityEnd)

  // Compare only times (not dates) for availability
  const slotMinutes = slotTime.hours() * 60 + slotTime.minutes()
  const availStartMinutes = availStart.hours() * 60 + availStart.minutes()
  const availEndMinutes = availEnd.hours() * 60 + availEnd.minutes()

  if (slotMinutes < availStartMinutes || slotMinutes >= availEndMinutes) {
    eligible = false
    ineligibilityReasons.push(`Slot at ${slotTime.format('h:mm A')} is outside availability window (${availStart.format('h:mm A')} - ${availEnd.format('h:mm A')})`)
  }

  // Check 3: Minimum notice time
  const hoursUntilSlot = moment(slot.startTime).diff(moment(), 'hours', true)
  if (hoursUntilSlot < settings.minNoticeHours) {
    eligible = false
    ineligibilityReasons.push(`Only ${hoursUntilSlot.toFixed(1)} hours notice, minimum is ${settings.minNoticeHours} hours`)
  }

  // Check 4: Entry must be active
  if (entry.status !== 'active') {
    eligible = false
    ineligibilityReasons.push(`Entry status is "${entry.status}", not active`)
  }

  // Check 5: Forms completion (if required)
  // Note: Forms are not strictly required but we track for scoring

  // ==========================================================================
  // SCORING (Soft preferences - even if not eligible, we calculate for insights)
  // ==========================================================================

  // Score 1: Base tier score (VIP tiers get higher base)
  switch (entry.tier) {
    case 'platinum':
      breakdown.tierScore = 40
      reasons.push('Platinum VIP')
      break
    case 'gold':
      breakdown.tierScore = 25
      reasons.push('Gold VIP')
      break
    case 'silver':
      breakdown.tierScore = 10
      break
  }

  // Score 2: Priority level
  switch (entry.priority) {
    case 'high':
      breakdown.priorityScore = 30
      reasons.push('High priority')
      break
    case 'medium':
      breakdown.priorityScore = 20
      break
    case 'low':
      breakdown.priorityScore = 10
      break
  }

  // Score 3: Service match
  const entryService = entry.requestedService.toLowerCase()
  const slotService = slot.serviceName.toLowerCase()

  if (entryService === slotService) {
    breakdown.serviceMatchScore = 25
    reasons.push('Exact service match')
  } else if (entryService.includes(slotService) || slotService.includes(entryService)) {
    breakdown.serviceMatchScore = 15
    reasons.push('Similar service')
  } else if (entry.serviceCategory === slot.serviceCategory) {
    breakdown.serviceMatchScore = 10
    reasons.push('Same service category')
  }

  // Score 4: Duration fit
  const durationDiff = slot.duration - entry.serviceDuration
  if (durationDiff === 0) {
    breakdown.durationFitScore = 20
    reasons.push('Perfect duration fit')
  } else if (durationDiff > 0 && durationDiff <= 15) {
    breakdown.durationFitScore = 15
    reasons.push('Good duration fit')
  } else if (durationDiff > 15 && durationDiff <= 30) {
    breakdown.durationFitScore = 10
  } else if (durationDiff < 0) {
    // Duration doesn't fit - penalty
    breakdown.durationFitScore = -20
  }

  // Score 5: Practitioner preference match
  if (entry.practitionerId === slot.practitionerId) {
    breakdown.practitionerMatchScore = 20
    reasons.push('Preferred practitioner')
  }

  // Score 6: Wait time bonus (longer wait = higher priority)
  // Cap at 20 points to prevent gaming
  const daysWaiting = moment().diff(moment(entry.waitingSince), 'days')
  breakdown.waitTimeScore = Math.min(daysWaiting * 2, 20)
  if (daysWaiting >= 5) {
    reasons.push(`Waiting ${daysWaiting} days`)
  } else if (daysWaiting >= 3) {
    reasons.push(`Waiting ${daysWaiting} days`)
  }

  // Score 7: Forms completed bonus
  if (entry.hasCompletedForms) {
    breakdown.formsReadyScore = 15
    reasons.push('Forms completed')
  }

  // Score 8: Deposit paid bonus
  if (entry.deposit && entry.deposit > 0) {
    breakdown.depositScore = 10
    reasons.push(`$${entry.deposit} deposit paid`)
  }

  // Score 9: Availability match (bonus if well within window)
  if (slotMinutes >= availStartMinutes && slotMinutes < availEndMinutes) {
    // Calculate how centered the slot is within availability window
    const centerOfAvailability = (availStartMinutes + availEndMinutes) / 2
    const distanceFromCenter = Math.abs(slotMinutes - centerOfAvailability)
    const maxDistance = (availEndMinutes - availStartMinutes) / 2
    const proximityScore = Math.round((1 - distanceFromCenter / maxDistance) * 15)
    breakdown.availabilityScore = Math.max(5, proximityScore)
    if (proximityScore >= 10) {
      reasons.push('Ideal timing')
    }
  }

  // Score 10: Response speed bonus (fast responders get priority)
  if (entry.averageResponseTimeMinutes !== undefined &&
      entry.totalResponses !== undefined &&
      entry.totalResponses > 0) {
    if (entry.averageResponseTimeMinutes < 5) {
      breakdown.responseSpeedBonus = 15
      reasons.push('Very responsive')
    } else if (entry.averageResponseTimeMinutes < 15) {
      breakdown.responseSpeedBonus = 10
      reasons.push('Quick responder')
    } else if (entry.averageResponseTimeMinutes < 30) {
      breakdown.responseSpeedBonus = 5
    }
  }

  // Score 11: Offer count penalty
  // Reduce score if offered many times without booking
  if (entry.offerCount > 0) {
    const declinedOffers = entry.declinedOffers || 0
    const penaltyPerDecline = 5
    breakdown.offerCountPenalty = -Math.min(declinedOffers * penaltyPerDecline, 25)

    if (entry.offerCount >= 3 && entry.acceptedOffers === 0) {
      reasons.push(`${entry.offerCount} offers, none accepted`)
    }
  }

  // ==========================================================================
  // CALCULATE TOTAL SCORE
  // ==========================================================================

  // Sum all component scores
  const rawScore =
    breakdown.tierScore +
    breakdown.priorityScore +
    breakdown.serviceMatchScore +
    breakdown.durationFitScore +
    breakdown.practitionerMatchScore +
    breakdown.waitTimeScore +
    breakdown.formsReadyScore +
    breakdown.depositScore +
    breakdown.availabilityScore +
    breakdown.responseSpeedBonus +
    breakdown.offerCountPenalty

  // Apply tier multiplier to raw score
  breakdown.baseScore = rawScore
  breakdown.totalScore = Math.round(rawScore * breakdown.tierMultiplier)

  return {
    score: breakdown.totalScore,
    breakdown,
    reasons,
    eligible,
    ineligibilityReasons
  }
}

// =============================================================================
// CORE MATCHING FUNCTION
// =============================================================================

/**
 * Find matching waitlist patients for a cancelled/available slot
 *
 * @param slot - The cancelled/available slot to match against
 * @param waitlistEntries - Array of waitlist entries to evaluate
 * @param settings - Waitlist settings for scoring configuration
 * @param options - Optional parameters (limit, includeIneligible)
 * @returns Array of WaitlistMatch objects sorted by score
 */
export async function findMatchingWaitlistPatients(
  slot: CancelledSlot,
  waitlistEntries: WaitlistEntry[],
  settings: WaitlistSettings,
  options?: { limit?: number; includeIneligible?: boolean }
): Promise<WaitlistMatch[]> {
  const limit = options?.limit || 10
  const includeIneligible = options?.includeIneligible || false

  console.log(`[Waitlist] Finding matches for slot: ${slot.practitionerName} on ${moment(slot.date).format('MMM D')} at ${moment(slot.startTime).format('h:mm A')}`)

  if (!waitlistEntries || waitlistEntries.length === 0) {
    console.log('[Waitlist] No waitlist entries to match against')
    return []
  }

  const matches: WaitlistMatch[] = []

  for (const entry of waitlistEntries) {
    // Skip if already sent an offer for this slot (idempotency)
    if (hasOfferBeenSent(entry.id, slot.date, slot.startTime)) {
      console.log(`[Waitlist] Skipping ${entry.name} - offer already sent for this slot`)
      continue
    }

    const { score, breakdown, reasons, eligible, ineligibilityReasons } = calculateMatchScore(entry, slot, settings)

    // Only include if eligible, or if includeIneligible is true
    if (eligible || includeIneligible) {
      matches.push({
        entry,
        score,
        matchReasons: reasons,
        scoreBreakdown: breakdown,
        isEligible: eligible,
        ineligibilityReasons
      })
    }
  }

  // Sort by eligibility first, then by score (highest first)
  matches.sort((a, b) => {
    // Eligible entries come first
    if (a.isEligible && !b.isEligible) return -1
    if (!a.isEligible && b.isEligible) return 1
    // Then sort by score
    return b.score - a.score
  })

  // Apply weighted selection if configured
  if (settings.offerSequence === 'tier_weighted' && matches.length > 1) {
    const eligibleMatches = matches.filter(m => m.isEligible)
    if (eligibleMatches.length > 1) {
      const reorderedMatches = applyTierWeightedSelection(eligibleMatches, settings.tierWeights)
      const ineligibleMatches = matches.filter(m => !m.isEligible)
      matches.length = 0
      matches.push(...reorderedMatches, ...ineligibleMatches)
    }
  }

  const result = matches.slice(0, limit)
  console.log(`[Waitlist] Found ${result.length} matches (${result.filter(m => m.isEligible).length} eligible)`)

  return result
}

/**
 * Apply tier-weighted selection to reorder matches
 * Higher tier patients have proportionally higher chance of being selected first
 */
function applyTierWeightedSelection(
  matches: WaitlistMatch[],
  weights: TierWeights
): WaitlistMatch[] {
  const result: WaitlistMatch[] = []
  const remaining = [...matches]

  while (remaining.length > 0) {
    // Calculate total weight of remaining entries
    let totalWeight = 0
    const entryWeights: number[] = []

    for (const match of remaining) {
      // Combine tier weight with score for weighted selection
      const weight = weights[match.entry.tier] * (match.score / 100)
      entryWeights.push(weight)
      totalWeight += weight
    }

    // Weighted random selection
    let random = Math.random() * totalWeight
    let selectedIndex = 0

    for (let i = 0; i < entryWeights.length; i++) {
      random -= entryWeights[i]
      if (random <= 0) {
        selectedIndex = i
        break
      }
    }

    // Move selected to result
    result.push(remaining[selectedIndex])
    remaining.splice(selectedIndex, 1)
  }

  return result
}

// =============================================================================
// OFFER MANAGEMENT
// =============================================================================

/**
 * Create a waitlist offer for a specific entry and slot
 *
 * @param entry - The waitlist entry to create an offer for
 * @param slot - The available slot
 * @param practitionerName - Name of the practitioner
 * @param serviceName - Name of the service
 * @param settings - Waitlist settings
 * @param cascadeLevel - Level in the cascade chain (0 = first offer)
 * @param previousOfferId - ID of the previous offer if cascading
 * @returns The created offer or null if creation failed
 */
export async function createWaitlistOffer(
  entry: WaitlistEntry,
  slot: AvailableSlot | CancelledSlot,
  practitionerName: string,
  serviceName: string,
  settings: WaitlistSettings,
  cascadeLevel: number = 0,
  previousOfferId?: string
): Promise<WaitlistOffer | null> {
  // Check idempotency - prevent duplicate offers
  if (hasOfferBeenSent(entry.id, slot.date, slot.startTime)) {
    console.log(`[Waitlist] Offer already sent to ${entry.name} for this slot - skipping (idempotency)`)
    return null
  }

  // Try to acquire slot lock
  const lock = acquireSlotLock(
    slot.practitionerId,
    slot.date,
    slot.startTime,
    slot.endTime,
    'pending', // Will update with actual offer ID
    settings.offerExpiryMinutes
  )

  if (!lock) {
    console.log(`[Waitlist] Cannot create offer - slot is already locked`)
    return null
  }

  // Generate secure offer token and ID
  const offerId = generateOfferId()
  const offerToken = generateOfferToken()

  // Determine communication channel
  let sentVia: OfferChannel = 'sms'
  if (settings.smsEnabled && settings.emailEnabled) {
    sentVia = 'both'
  } else if (settings.emailEnabled) {
    sentVia = 'email'
  }

  const offer: WaitlistOffer = {
    id: offerId,
    waitlistEntryId: entry.id,
    patientId: entry.id, // In production, this would be a separate patient ID
    patientName: entry.name,
    patientPhone: entry.phone,
    patientEmail: entry.email,
    appointmentSlot: {
      practitionerId: slot.practitionerId,
      practitionerName: practitionerName,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      serviceName: serviceName,
      duration: slot.duration ?? moment(slot.endTime).diff(moment(slot.startTime), 'minutes')
    },
    offerToken,
    expiresAt: moment().add(settings.offerExpiryMinutes, 'minutes').toDate(),
    status: 'pending',
    sentAt: new Date(),
    sentVia,
    cascadeLevel,
    previousOfferId
  }

  // Update lock with actual offer ID
  lock.offerId = offerId

  // Store offer
  offersStore.set(offerId, offer)
  offersByToken.set(offerToken, offerId)

  // Track by entry
  const entryOffers = offersByEntry.get(entry.id) || []
  entryOffers.push(offerId)
  offersByEntry.set(entry.id, entryOffers)

  // Mark as sent for idempotency
  markOfferAsSent(entry.id, slot.date, slot.startTime)

  console.log(`[Waitlist] Created offer ${offerId} for ${entry.name}, expires at ${offer.expiresAt}`)

  return offer
}

/**
 * Get an offer by its secure token
 */
export function getOfferByToken(token: string): WaitlistOffer | null {
  const offerId = offersByToken.get(token)
  if (!offerId) return null
  return offersStore.get(offerId) || null
}

/**
 * Get an offer by ID
 */
export function getOfferById(offerId: string): WaitlistOffer | null {
  return offersStore.get(offerId) || null
}

/**
 * Get all offers for an entry
 */
export function getOffersByEntryId(entryId: string): WaitlistOffer[] {
  const offerIds = offersByEntry.get(entryId) || []
  return offerIds.map(id => offersStore.get(id)!).filter(Boolean)
}

/**
 * Get all pending offers
 */
export function getPendingOffers(): WaitlistOffer[] {
  return Array.from(offersStore.values()).filter(o => o.status === 'pending')
}

// =============================================================================
// OFFER RESPONSE HANDLING
// =============================================================================

/**
 * Handle a patient's response to a waitlist offer
 *
 * @param token - The secure offer token
 * @param action - 'accept' or 'decline'
 * @param appointmentCreator - Optional function to create the appointment
 * @returns Result with success status, appointment (if accepted), and any errors
 */
export async function handleOfferResponse(
  token: string,
  action: 'accept' | 'decline',
  appointmentCreator?: (offer: WaitlistOffer) => Promise<Appointment | null>
): Promise<OfferResponseResult> {
  // Find offer by token
  const offer = getOfferByToken(token)

  if (!offer) {
    console.log(`[Waitlist] Invalid offer token: ${token}`)
    return { success: false, error: 'Invalid or expired offer link' }
  }

  // Check if offer is still valid
  if (offer.status !== 'pending') {
    console.log(`[Waitlist] Offer ${offer.id} is no longer pending (status: ${offer.status})`)
    return { success: false, error: `This offer has already been ${offer.status}` }
  }

  // Check if offer has expired
  if (moment().isAfter(moment(offer.expiresAt))) {
    offer.status = 'expired'
    offer.responseAction = 'expired'
    // Release the slot lock
    const slot = offer.appointmentSlot
    releaseSlotLock(slot.practitionerId, slot.date, slot.startTime, offer.id)
    console.log(`[Waitlist] Offer ${offer.id} has expired`)
    return { success: false, error: 'This offer has expired' }
  }

  // Check if slot is still available (lock still valid)
  const slot = offer.appointmentSlot
  const lock = getSlotLock(slot.practitionerId, slot.date, slot.startTime)

  if (!lock || lock.offerId !== offer.id) {
    console.log(`[Waitlist] Slot is no longer available for offer ${offer.id}`)
    offer.status = 'superseded'
    return { success: false, error: 'This slot is no longer available' }
  }

  // Handle the response
  offer.respondedAt = new Date()

  if (action === 'accept') {
    // Create the appointment
    let appointment: Appointment | null = null

    if (appointmentCreator) {
      try {
        appointment = await appointmentCreator(offer)
      } catch (error) {
        console.error(`[Waitlist] Failed to create appointment:`, error)
        return { success: false, error: 'Failed to create appointment' }
      }
    }

    if (!appointment) {
      // Create a mock appointment if no creator provided
      appointment = createAppointmentFromOffer(offer)
    }

    offer.status = 'accepted'
    offer.responseAction = 'accepted'

    // Release the lock (appointment created successfully)
    releaseSlotLock(slot.practitionerId, slot.date, slot.startTime, offer.id)

    console.log(`[Waitlist] Offer ${offer.id} accepted by ${offer.patientName}`)

    return { success: true, appointment }
  } else {
    // Decline
    offer.status = 'declined'
    offer.responseAction = 'declined'

    // Release the lock so others can book
    releaseSlotLock(slot.practitionerId, slot.date, slot.startTime, offer.id)

    console.log(`[Waitlist] Offer ${offer.id} declined by ${offer.patientName}`)

    return { success: true }
  }
}

/**
 * Create an appointment from an accepted offer
 * (Simplified implementation - in production would integrate with appointment service)
 */
function createAppointmentFromOffer(offer: WaitlistOffer): Appointment {
  const slot = offer.appointmentSlot

  return {
    id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    patientId: offer.patientId,
    patientName: offer.patientName,
    serviceName: slot.serviceName,
    serviceCategory: 'aesthetics', // Would be determined from service lookup
    practitionerId: slot.practitionerId,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: 'scheduled',
    color: '#8B5CF6', // Purple for waitlist bookings
    duration: slot.duration,
    phone: offer.patientPhone,
    email: offer.patientEmail,
    createdAt: new Date(),
    updatedAt: new Date(),
    roomId: slot.roomId,
    bookingType: 'from_waitlist'
  }
}

// =============================================================================
// CASCADE OFFERS
// =============================================================================

/**
 * Cascade an offer to the next patient in the waitlist
 * Called when an offer is declined or expires
 *
 * @param originalOfferId - ID of the declined/expired offer
 * @param waitlistEntries - Current waitlist entries
 * @param settings - Waitlist settings
 * @returns The new offer or null if no eligible patients
 */
export async function cascadeOfferToNext(
  originalOfferId: string,
  waitlistEntries: WaitlistEntry[],
  settings: WaitlistSettings
): Promise<WaitlistOffer | null> {
  const originalOffer = getOfferById(originalOfferId)

  if (!originalOffer) {
    console.log(`[Waitlist] Cannot cascade - original offer ${originalOfferId} not found`)
    return null
  }

  // Check if we've exceeded max offers per slot
  const cascadeLevel = originalOffer.cascadeLevel + 1
  if (cascadeLevel >= settings.maxOffersPerSlot) {
    console.log(`[Waitlist] Max cascade level (${settings.maxOffersPerSlot}) reached for slot`)
    return null
  }

  // Mark original as superseded
  originalOffer.status = 'superseded'

  // Construct a CancelledSlot from the original offer
  const slot: CancelledSlot = {
    appointmentId: 'cascade',
    practitionerId: originalOffer.appointmentSlot.practitionerId,
    practitionerName: originalOffer.appointmentSlot.practitionerName,
    date: originalOffer.appointmentSlot.date,
    startTime: originalOffer.appointmentSlot.startTime,
    endTime: originalOffer.appointmentSlot.endTime,
    duration: originalOffer.appointmentSlot.duration,
    serviceName: originalOffer.appointmentSlot.serviceName,
    serviceCategory: 'aesthetics',
    roomId: originalOffer.appointmentSlot.roomId,
    cancelledAt: new Date()
  }

  // Find the next best match
  const matches = await findMatchingWaitlistPatients(slot, waitlistEntries, settings, { limit: 1 })

  if (matches.length === 0 || !matches[0].isEligible) {
    console.log(`[Waitlist] No eligible patients for cascade`)
    return null
  }

  const nextEntry = matches[0].entry

  // Create new offer
  const newOffer = await createWaitlistOffer(
    nextEntry,
    slot,
    originalOffer.appointmentSlot.practitionerName,
    originalOffer.appointmentSlot.serviceName,
    settings,
    cascadeLevel,
    originalOfferId
  )

  if (newOffer) {
    originalOffer.supersededById = newOffer.id
    console.log(`[Waitlist] Cascaded offer to ${nextEntry.name} (level ${cascadeLevel})`)
  }

  return newOffer
}

// =============================================================================
// CLEANUP FUNCTIONS
// =============================================================================

/**
 * Expire old offers that have passed their expiry time
 * Returns the number of offers expired
 */
export async function expireOldOffers(): Promise<number> {
  const now = moment()
  let expiredCount = 0

  for (const [offerId, offer] of Array.from(offersStore)) {
    if (offer.status === 'pending' && moment(offer.expiresAt).isBefore(now)) {
      offer.status = 'expired'
      offer.responseAction = 'expired'

      // Release the slot lock
      const slot = offer.appointmentSlot
      releaseSlotLock(slot.practitionerId, slot.date, slot.startTime, offerId)

      expiredCount++
      console.log(`[Waitlist] Expired offer ${offerId} for ${offer.patientName}`)
    }
  }

  if (expiredCount > 0) {
    console.log(`[Waitlist] Expired ${expiredCount} old offers`)
  }

  return expiredCount
}

/**
 * Clean up expired waitlist entries
 * Returns the number of entries cleaned up and the entries themselves
 */
export async function cleanupExpiredEntries(
  entries: WaitlistEntry[],
  daysOld: number
): Promise<{ cleanedCount: number; cleanedEntries: WaitlistEntry[] }> {
  const cutoffDate = moment().subtract(daysOld, 'days')
  const cleanedEntries: WaitlistEntry[] = []

  for (const entry of entries) {
    if (entry.status === 'active' && moment(entry.waitingSince).isBefore(cutoffDate)) {
      entry.status = 'expired'
      entry.removedAt = new Date()
      entry.removedReason = `Auto-expired after ${daysOld} days on waitlist`
      cleanedEntries.push(entry)
    }
  }

  if (cleanedEntries.length > 0) {
    console.log(`[Waitlist] Cleaned up ${cleanedEntries.length} expired entries (older than ${daysOld} days)`)
  }

  return { cleanedCount: cleanedEntries.length, cleanedEntries }
}

/**
 * Clean up expired slot locks
 * Called periodically to remove stale locks
 */
export function cleanupExpiredLocks(): number {
  const now = moment()
  let cleanedCount = 0

  for (const [slotKey, lock] of Array.from(slotLocks)) {
    if (moment(lock.expiresAt).isBefore(now)) {
      slotLocks.delete(slotKey)
      cleanedCount++
    }
  }

  if (cleanedCount > 0) {
    console.log(`[Waitlist] Cleaned up ${cleanedCount} expired slot locks`)
  }

  return cleanedCount
}

// =============================================================================
// STATISTICS & REPORTING
// =============================================================================

/**
 * Get waitlist statistics for reporting
 */
export function getWaitlistStats(entries: WaitlistEntry[]): {
  total: number
  byStatus: Record<WaitlistEntryStatus, number>
  byTier: Record<WaitlistTier, number>
  byPriority: Record<WaitlistPriority, number>
  averageWaitDays: number
  pendingOffers: number
  acceptanceRate: number
} {
  const stats = {
    total: entries.length,
    byStatus: {
      active: 0,
      offered: 0,
      booked: 0,
      removed: 0,
      expired: 0
    } as Record<WaitlistEntryStatus, number>,
    byTier: {
      platinum: 0,
      gold: 0,
      silver: 0
    } as Record<WaitlistTier, number>,
    byPriority: {
      high: 0,
      medium: 0,
      low: 0
    } as Record<WaitlistPriority, number>,
    averageWaitDays: 0,
    pendingOffers: 0,
    acceptanceRate: 0
  }

  let totalWaitDays = 0
  let totalOffers = 0
  let acceptedOffers = 0

  for (const entry of entries) {
    stats.byStatus[entry.status]++
    stats.byTier[entry.tier]++
    stats.byPriority[entry.priority]++

    const waitDays = moment().diff(moment(entry.waitingSince), 'days')
    totalWaitDays += waitDays

    totalOffers += entry.offerCount
    acceptedOffers += entry.acceptedOffers || 0
  }

  stats.averageWaitDays = entries.length > 0 ? Math.round(totalWaitDays / entries.length) : 0
  stats.acceptanceRate = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 0

  // Count pending offers
  for (const offer of Array.from(offersStore.values())) {
    if (offer.status === 'pending') {
      stats.pendingOffers++
    }
  }

  return stats
}

// =============================================================================
// SMS TEMPLATES FOR WAITLIST
// =============================================================================

export const waitlistSmsTemplates = {
  /**
   * Template for offering a slot to a waitlist patient
   */
  slotOffer: (
    patientName: string,
    serviceName: string,
    date: string,
    time: string,
    practitionerName: string,
    expiryMinutes: number,
    offerLink: string
  ) =>
    `Hi ${patientName}! Great news - a ${serviceName} slot opened up on ${date} at ${time} with ${practitionerName}. ` +
    `Book now: ${offerLink} (expires in ${expiryMinutes} min)`,

  /**
   * Template for confirming an accepted offer
   */
  slotOfferAccepted: (
    patientName: string,
    serviceName: string,
    date: string,
    time: string,
    practitionerName: string
  ) =>
    `Confirmed! Your ${serviceName} appointment with ${practitionerName} is booked for ${date} at ${time}. ` +
    `We look forward to seeing you!`,

  /**
   * Template for notifying about an expired offer
   */
  slotOfferExpired: (patientName: string) =>
    `Hi ${patientName}, the slot offer has expired. Don't worry - we'll notify you when another opening becomes available!`,

  /**
   * Template for confirming waitlist addition
   */
  waitlistConfirmation: (patientName: string, serviceName: string, position: number) =>
    `Hi ${patientName}! You're now on our waitlist for ${serviceName} (position #${position}). ` +
    `We'll text you when a slot opens up. Reply STOP to opt out.`,

  /**
   * Template for periodic waitlist reminder
   */
  waitlistReminder: (patientName: string, serviceName: string, daysOnList: number) =>
    `Hi ${patientName}, you've been on our waitlist for ${serviceName} for ${daysOnList} days. ` +
    `Still interested? Reply YES to stay on the list or REMOVE to opt out.`,

  /**
   * Template for VIP tier upgrade notification
   */
  tierUpgrade: (patientName: string, newTier: WaitlistTier) =>
    `Hi ${patientName}! Great news - you've been upgraded to ${getTierDisplayName(newTier)} status! ` +
    `You'll now get priority access to cancelled appointment slots.`
}

// =============================================================================
// CONVERSION UTILITIES
// =============================================================================

/**
 * Convert a basic WaitlistPatient to a full WaitlistEntry
 */
export function toWaitlistEntry(
  patient: WaitlistPatient,
  patientHistory?: Patient
): WaitlistEntry {
  const tier = patientHistory
    ? calculateTierFromHistory(patientHistory)
    : 'silver'

  return {
    ...patient,
    status: 'active',
    tier,
    offerCount: 0,
    acceptedOffers: 0,
    declinedOffers: 0
  }
}

/**
 * Convert a cancelled appointment to a CancelledSlot
 */
export function toCancelledSlot(
  appointment: Appointment,
  practitionerName: string
): CancelledSlot {
  return {
    appointmentId: appointment.id,
    practitionerId: appointment.practitionerId,
    practitionerName,
    date: appointment.startTime,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    duration: appointment.duration,
    serviceName: appointment.serviceName,
    serviceCategory: appointment.serviceCategory,
    roomId: appointment.roomId,
    cancelledAt: appointment.cancelledAt || new Date()
  }
}

/**
 * Build the offer URL for SMS/email
 */
export function buildOfferUrl(baseUrl: string, offerToken: string): string {
  return `${baseUrl}/waitlist/offer/${offerToken}`
}

// =============================================================================
// STORE ACCESS (for testing and debugging)
// =============================================================================

export function getOffersStore(): Map<string, WaitlistOffer> {
  return offersStore
}

export function getSlotLocksStore(): Map<string, SlotLock> {
  return slotLocks
}

export function getSentOfferKeys(): Set<string> {
  return sentOfferKeys
}

/**
 * Clear all stores (for testing)
 */
export function clearAllStores(): void {
  offersStore.clear()
  offersByToken.clear()
  offersByEntry.clear()
  slotLocks.clear()
  sentOfferKeys.clear()
  console.log('[Waitlist] Cleared all stores')
}
