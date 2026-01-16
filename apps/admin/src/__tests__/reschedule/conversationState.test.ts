/**
 * @vitest-environment node
 */
import {
  createRescheduleConversation,
  getRescheduleConversation,
  getOfferedSlot,
  confirmReschedule,
  cancelRescheduleConversation,
  hasActiveReschedule,
  normalizePhoneNumber,
  formatSlotsForSMS,
  clearAllConversations,
  OfferedSlot
} from '@/lib/conversationState'

describe('Reschedule Conversation State Manager', () => {
  // Clear state before each test
  beforeEach(() => {
    clearAllConversations()
  })

  describe('normalizePhoneNumber', () => {
    it('should strip formatting from phone numbers', () => {
      expect(normalizePhoneNumber('(555) 123-4567')).toBe('5551234567')
      expect(normalizePhoneNumber('555-123-4567')).toBe('5551234567')
      expect(normalizePhoneNumber('5551234567')).toBe('5551234567')
    })

    it('should handle US country code', () => {
      expect(normalizePhoneNumber('+15551234567')).toBe('5551234567')
      expect(normalizePhoneNumber('15551234567')).toBe('5551234567')
    })

    it('should handle various input formats', () => {
      expect(normalizePhoneNumber('+1 (555) 123-4567')).toBe('5551234567')
      expect(normalizePhoneNumber('1-555-123-4567')).toBe('5551234567')
    })
  })

  describe('createRescheduleConversation', () => {
    const mockAppointment = {
      id: 'apt-123',
      patientId: 'p-1',
      patientName: 'John Doe',
      startTime: '2024-01-15T10:00:00Z',
      serviceName: 'Botox',
      practitionerId: 'prac-1',
      practitionerName: 'Dr. Smith'
    }

    const mockSlots: OfferedSlot[] = [
      { index: 1, startTime: '2024-01-16T09:00:00Z', endTime: '2024-01-16T09:30:00Z', providerId: 'prac-1', providerName: 'Dr. Smith' },
      { index: 2, startTime: '2024-01-16T10:00:00Z', endTime: '2024-01-16T10:30:00Z', providerId: 'prac-1', providerName: 'Dr. Smith' },
      { index: 3, startTime: '2024-01-17T14:00:00Z', endTime: '2024-01-17T14:30:00Z', providerId: 'prac-1', providerName: 'Dr. Smith' }
    ]

    it('should create a conversation with correct data', () => {
      const conversation = createRescheduleConversation(
        '(555) 123-4567',
        mockAppointment,
        mockSlots
      )

      expect(conversation.phoneNumber).toBe('5551234567')
      expect(conversation.appointmentId).toBe('apt-123')
      expect(conversation.patientName).toBe('John Doe')
      expect(conversation.serviceName).toBe('Botox')
      expect(conversation.offeredSlots).toHaveLength(3)
      expect(conversation.status).toBe('pending_selection')
    })

    it('should set expiration time correctly', () => {
      const beforeCreate = Date.now()
      const conversation = createRescheduleConversation(
        '5551234567',
        mockAppointment,
        mockSlots,
        60000 // 1 minute timeout
      )
      const afterCreate = Date.now()

      const expiresAt = conversation.expiresAt.getTime()
      expect(expiresAt).toBeGreaterThanOrEqual(beforeCreate + 60000)
      expect(expiresAt).toBeLessThanOrEqual(afterCreate + 60000 + 100) // small buffer
    })

    it('should be retrievable after creation', () => {
      createRescheduleConversation('5551234567', mockAppointment, mockSlots)

      const retrieved = getRescheduleConversation('5551234567')
      expect(retrieved).not.toBeNull()
      expect(retrieved?.appointmentId).toBe('apt-123')
    })

    it('should normalize phone number for storage and retrieval', () => {
      createRescheduleConversation('(555) 123-4567', mockAppointment, mockSlots)

      // Should be retrievable with different formats
      expect(getRescheduleConversation('5551234567')).not.toBeNull()
      expect(getRescheduleConversation('+15551234567')).not.toBeNull()
      expect(getRescheduleConversation('(555) 123-4567')).not.toBeNull()
    })
  })

  describe('getRescheduleConversation', () => {
    it('should return null for non-existent conversation', () => {
      expect(getRescheduleConversation('5559999999')).toBeNull()
    })

    it('should return null for expired conversation', async () => {
      const mockAppointment = {
        id: 'apt-123',
        patientId: 'p-1',
        patientName: 'John Doe',
        startTime: '2024-01-15T10:00:00Z',
        serviceName: 'Botox',
        practitionerId: 'prac-1',
        practitionerName: 'Dr. Smith'
      }

      // Create with very short timeout
      createRescheduleConversation(
        '5551234567',
        mockAppointment,
        [{ index: 1, startTime: '2024-01-16T09:00:00Z', endTime: '2024-01-16T09:30:00Z', providerId: 'prac-1', providerName: 'Dr. Smith' }],
        50 // 50ms timeout
      )

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(getRescheduleConversation('5551234567')).toBeNull()
    })
  })

  describe('getOfferedSlot', () => {
    beforeEach(() => {
      const mockAppointment = {
        id: 'apt-123',
        patientId: 'p-1',
        patientName: 'John Doe',
        startTime: '2024-01-15T10:00:00Z',
        serviceName: 'Botox',
        practitionerId: 'prac-1',
        practitionerName: 'Dr. Smith'
      }

      const mockSlots: OfferedSlot[] = [
        { index: 1, startTime: '2024-01-16T09:00:00Z', endTime: '2024-01-16T09:30:00Z', providerId: 'prac-1', providerName: 'Dr. Smith' },
        { index: 2, startTime: '2024-01-16T10:00:00Z', endTime: '2024-01-16T10:30:00Z', providerId: 'prac-1', providerName: 'Dr. Smith' },
        { index: 3, startTime: '2024-01-17T14:00:00Z', endTime: '2024-01-17T14:30:00Z', providerId: 'prac-1', providerName: 'Dr. Smith' }
      ]

      createRescheduleConversation('5551234567', mockAppointment, mockSlots)
    })

    it('should return correct slot for valid selection', () => {
      const slot1 = getOfferedSlot('5551234567', 1)
      expect(slot1?.index).toBe(1)
      expect(slot1?.startTime).toBe('2024-01-16T09:00:00Z')

      const slot2 = getOfferedSlot('5551234567', 2)
      expect(slot2?.index).toBe(2)

      const slot3 = getOfferedSlot('5551234567', 3)
      expect(slot3?.index).toBe(3)
    })

    it('should return null for invalid selection', () => {
      expect(getOfferedSlot('5551234567', 0)).toBeNull()
      expect(getOfferedSlot('5551234567', 4)).toBeNull()
      expect(getOfferedSlot('5551234567', 5)).toBeNull()
    })

    it('should return null for non-existent conversation', () => {
      expect(getOfferedSlot('5559999999', 1)).toBeNull()
    })
  })

  describe('confirmReschedule', () => {
    it('should mark conversation as confirmed', () => {
      const mockAppointment = {
        id: 'apt-123',
        patientId: 'p-1',
        patientName: 'John Doe',
        startTime: '2024-01-15T10:00:00Z',
        serviceName: 'Botox',
        practitionerId: 'prac-1',
        practitionerName: 'Dr. Smith'
      }

      createRescheduleConversation('5551234567', mockAppointment, [])

      const result = confirmReschedule('5551234567')
      expect(result).toBe(true)

      // Should no longer be retrievable as active
      expect(getRescheduleConversation('5551234567')).toBeNull()
    })

    it('should return false for non-existent conversation', () => {
      expect(confirmReschedule('5559999999')).toBe(false)
    })
  })

  describe('cancelRescheduleConversation', () => {
    it('should cancel and remove conversation', () => {
      const mockAppointment = {
        id: 'apt-123',
        patientId: 'p-1',
        patientName: 'John Doe',
        startTime: '2024-01-15T10:00:00Z',
        serviceName: 'Botox',
        practitionerId: 'prac-1',
        practitionerName: 'Dr. Smith'
      }

      createRescheduleConversation('5551234567', mockAppointment, [])

      const result = cancelRescheduleConversation('5551234567')
      expect(result).toBe(true)

      expect(getRescheduleConversation('5551234567')).toBeNull()
      expect(hasActiveReschedule('5551234567')).toBe(false)
    })
  })

  describe('hasActiveReschedule', () => {
    it('should return true for active conversation', () => {
      const mockAppointment = {
        id: 'apt-123',
        patientId: 'p-1',
        patientName: 'John Doe',
        startTime: '2024-01-15T10:00:00Z',
        serviceName: 'Botox',
        practitionerId: 'prac-1',
        practitionerName: 'Dr. Smith'
      }

      createRescheduleConversation('5551234567', mockAppointment, [])

      expect(hasActiveReschedule('5551234567')).toBe(true)
      expect(hasActiveReschedule('+15551234567')).toBe(true)
    })

    it('should return false for no conversation', () => {
      expect(hasActiveReschedule('5559999999')).toBe(false)
    })
  })

  describe('formatSlotsForSMS', () => {
    it('should format slots for SMS display', () => {
      const slots: OfferedSlot[] = [
        { index: 1, startTime: '2024-01-16T14:00:00Z', endTime: '2024-01-16T14:30:00Z', providerId: 'prac-1', providerName: 'Dr. Smith' },
        { index: 2, startTime: '2024-01-17T09:00:00Z', endTime: '2024-01-17T09:30:00Z', providerId: 'prac-1', providerName: 'Dr. Smith' }
      ]

      const formatted = formatSlotsForSMS(slots)

      // Should contain numbered entries
      expect(formatted).toContain('1.')
      expect(formatted).toContain('2.')
      // Should contain newlines between slots
      expect(formatted.split('\n')).toHaveLength(2)
    })

    it('should handle empty slots array', () => {
      const formatted = formatSlotsForSMS([])
      expect(formatted).toBe('')
    })
  })
})
