/**
 * Conversation State Manager for SMS-based multi-turn interactions
 *
 * Tracks pending reschedule conversations with offered slots, timeouts, and status.
 * Uses in-memory Map storage (future: Redis for production).
 */

export interface OfferedSlot {
  index: number // 1-5 for user selection
  startTime: string // ISO datetime
  endTime: string // ISO datetime
  providerId: string
  providerName: string
}

export interface RescheduleConversation {
  phoneNumber: string
  appointmentId: string
  patientId: string
  patientName: string
  originalStartTime: string
  serviceName: string
  providerId: string
  providerName: string
  offeredSlots: OfferedSlot[]
  status: 'pending_selection' | 'confirmed' | 'expired' | 'cancelled'
  createdAt: Date
  expiresAt: Date
}

// In-memory storage - replace with Redis in production
const rescheduleConversations = new Map<string, RescheduleConversation>()

// Default timeout: 10 minutes for slot selection (shorter to reduce race conditions)
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000

/**
 * Create a new reschedule conversation when patient initiates reschedule
 */
export function createRescheduleConversation(
  phoneNumber: string,
  appointment: {
    id: string
    patientId: string
    patientName: string
    startTime: string
    serviceName: string
    practitionerId: string
    practitionerName: string
  },
  offeredSlots: OfferedSlot[],
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): RescheduleConversation {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + timeoutMs)

  const conversation: RescheduleConversation = {
    phoneNumber: normalizePhoneNumber(phoneNumber),
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    originalStartTime: appointment.startTime,
    serviceName: appointment.serviceName,
    providerId: appointment.practitionerId,
    providerName: appointment.practitionerName,
    offeredSlots,
    status: 'pending_selection',
    createdAt: now,
    expiresAt
  }

  // Store by normalized phone number
  rescheduleConversations.set(conversation.phoneNumber, conversation)

  // Set auto-expiration timer
  setTimeout(() => {
    expireConversation(conversation.phoneNumber)
  }, timeoutMs)

  return conversation
}

/**
 * Get active reschedule conversation for a phone number
 */
export function getRescheduleConversation(phoneNumber: string): RescheduleConversation | null {
  const normalized = normalizePhoneNumber(phoneNumber)
  const conversation = rescheduleConversations.get(normalized)

  if (!conversation) {
    return null
  }

  // Check if expired
  if (conversation.status === 'pending_selection' && new Date() > conversation.expiresAt) {
    expireConversation(normalized)
    return null
  }

  // Only return pending conversations
  if (conversation.status !== 'pending_selection') {
    return null
  }

  return conversation
}

/**
 * Get offered slot by selection number (1-5)
 */
export function getOfferedSlot(phoneNumber: string, selection: number): OfferedSlot | null {
  const conversation = getRescheduleConversation(phoneNumber)
  if (!conversation) {
    return null
  }

  return conversation.offeredSlots.find(slot => slot.index === selection) || null
}

/**
 * Mark conversation as confirmed after successful booking
 */
export function confirmReschedule(phoneNumber: string): boolean {
  const normalized = normalizePhoneNumber(phoneNumber)
  const conversation = rescheduleConversations.get(normalized)

  if (!conversation || conversation.status !== 'pending_selection') {
    return false
  }

  conversation.status = 'confirmed'
  return true
}

/**
 * Cancel/clear a reschedule conversation
 */
export function cancelRescheduleConversation(phoneNumber: string): boolean {
  const normalized = normalizePhoneNumber(phoneNumber)
  const conversation = rescheduleConversations.get(normalized)

  if (!conversation) {
    return false
  }

  conversation.status = 'cancelled'
  rescheduleConversations.delete(normalized)
  return true
}

/**
 * Expire a conversation (called by timeout or manually)
 */
function expireConversation(phoneNumber: string): void {
  const conversation = rescheduleConversations.get(phoneNumber)
  if (conversation && conversation.status === 'pending_selection') {
    conversation.status = 'expired'
    rescheduleConversations.delete(phoneNumber)
  }
}

/**
 * Check if phone has an active reschedule conversation
 */
export function hasActiveReschedule(phoneNumber: string): boolean {
  return getRescheduleConversation(phoneNumber) !== null
}

/**
 * Normalize phone number to consistent format for lookups
 * Handles: (555) 123-4567, 555-123-4567, 5551234567, +15551234567
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Handle US country code
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1)
  }

  return digits
}

/**
 * Format slots for SMS display
 */
export function formatSlotsForSMS(slots: OfferedSlot[]): string {
  return slots.map(slot => {
    const date = new Date(slot.startTime)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${slot.index}. ${dayName} ${monthDay} @ ${time}`
  }).join('\n')
}

// For testing/debugging - get all active conversations
export function getAllActiveConversations(): RescheduleConversation[] {
  const active: RescheduleConversation[] = []
  rescheduleConversations.forEach(conv => {
    if (conv.status === 'pending_selection') {
      active.push(conv)
    }
  })
  return active
}

// Clear all conversations (for testing)
export function clearAllConversations(): void {
  rescheduleConversations.clear()
}
