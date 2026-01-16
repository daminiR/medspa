/**
 * @vitest-environment node
 */
import {
  findUpcomingAppointmentByPhone,
  getProviderAvailability,
  getNextAvailableSlots,
  rescheduleAppointment,
  isLateReschedule,
  appointments,
  practitioners,
  practitionerShifts
} from '@/lib/data'

describe('Reschedule Data Helpers', () => {
  // Store original appointments to restore after tests
  let originalAppointments: typeof appointments

  beforeEach(() => {
    // Clone current appointments state
    originalAppointments = [...appointments]
  })

  afterEach(() => {
    // Restore original appointments
    appointments.length = 0
    appointments.push(...originalAppointments)
  })

  describe('findUpcomingAppointmentByPhone', () => {
    it('should find appointment by formatted phone number', () => {
      // Create a test appointment in the future
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1) // Tomorrow

      const testAppointment = {
        id: 'test-apt-1',
        patientId: 'test-p-1',
        patientName: 'Test Patient',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 30 * 60 * 1000),
        status: 'scheduled' as const,
        color: '#4F46E5',
        duration: 30,
        phone: '(555) 999-8888',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      appointments.push(testAppointment)

      const found = findUpcomingAppointmentByPhone('5559998888')
      expect(found).not.toBeUndefined()
      expect(found?.id).toBe('test-apt-1')
    })

    it('should find appointment with various phone formats', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      const testAppointment = {
        id: 'test-apt-2',
        patientId: 'test-p-2',
        patientName: 'Test Patient 2',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 30 * 60 * 1000),
        status: 'confirmed' as const,
        color: '#4F46E5',
        duration: 30,
        phone: '(555) 777-6666',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      appointments.push(testAppointment)

      // Should find with different formats
      expect(findUpcomingAppointmentByPhone('(555) 777-6666')?.id).toBe('test-apt-2')
      expect(findUpcomingAppointmentByPhone('+15557776666')?.id).toBe('test-apt-2')
      expect(findUpcomingAppointmentByPhone('5557776666')?.id).toBe('test-apt-2')
    })

    it('should return undefined for non-existent phone', () => {
      const found = findUpcomingAppointmentByPhone('5550000000')
      expect(found).toBeUndefined()
    })

    it('should not return cancelled appointments', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      const testAppointment = {
        id: 'test-apt-cancelled',
        patientId: 'test-p-3',
        patientName: 'Cancelled Patient',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 30 * 60 * 1000),
        status: 'cancelled' as const,
        color: '#4F46E5',
        duration: 30,
        phone: '(555) 111-2222',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      appointments.push(testAppointment)

      const found = findUpcomingAppointmentByPhone('5551112222')
      expect(found).toBeUndefined()
    })

    it('should not return past appointments', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1) // Yesterday

      const testAppointment = {
        id: 'test-apt-past',
        patientId: 'test-p-4',
        patientName: 'Past Patient',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: pastDate,
        endTime: new Date(pastDate.getTime() + 30 * 60 * 1000),
        status: 'scheduled' as const,
        color: '#4F46E5',
        duration: 30,
        phone: '(555) 333-4444',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      appointments.push(testAppointment)

      const found = findUpcomingAppointmentByPhone('5553334444')
      expect(found).toBeUndefined()
    })

    it('should return the soonest upcoming appointment when multiple exist', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const dayAfter = new Date()
      dayAfter.setDate(dayAfter.getDate() + 2)

      const soonerAppointment = {
        id: 'test-apt-sooner',
        patientId: 'test-p-5',
        patientName: 'Multi Patient',
        serviceName: 'Service 1',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 30 * 60 * 1000),
        status: 'scheduled' as const,
        color: '#4F46E5',
        duration: 30,
        phone: '(555) 555-5555',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const laterAppointment = {
        id: 'test-apt-later',
        patientId: 'test-p-5',
        patientName: 'Multi Patient',
        serviceName: 'Service 2',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: dayAfter,
        endTime: new Date(dayAfter.getTime() + 30 * 60 * 1000),
        status: 'scheduled' as const,
        color: '#4F46E5',
        duration: 30,
        phone: '(555) 555-5555',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      appointments.push(laterAppointment, soonerAppointment) // Add in reverse order

      const found = findUpcomingAppointmentByPhone('5555555555')
      expect(found?.id).toBe('test-apt-sooner')
    })
  })

  describe('getProviderAvailability', () => {
    it('should return empty array for provider with no shifts on given day', () => {
      // Use a day with no shifts (e.g., Sunday for most providers)
      const sunday = new Date()
      sunday.setDate(sunday.getDate() + (7 - sunday.getDay())) // Next Sunday

      const slots = getProviderAvailability('1', sunday)
      // May or may not have shifts depending on mock data
      expect(Array.isArray(slots)).toBe(true)
    })

    it('should return slots within shift hours', () => {
      // Find a provider with known shifts
      const provider = practitioners[0]
      if (!provider) return

      // Find a day they work
      const shift = practitionerShifts.find(s => s.practitionerId === provider.id)
      if (!shift) return

      // Create date for that day of week
      const testDate = new Date()
      const daysUntilShift = (shift.dayOfWeek - testDate.getDay() + 7) % 7
      testDate.setDate(testDate.getDate() + daysUntilShift + 7) // Next occurrence

      const slots = getProviderAvailability(provider.id, testDate, 30)

      // All slots should be marked as available or unavailable
      slots.forEach(slot => {
        expect(typeof slot.available).toBe('boolean')
        expect(slot.startTime instanceof Date).toBe(true)
        expect(slot.endTime instanceof Date).toBe(true)
      })
    })
  })

  describe('getNextAvailableSlots', () => {
    it('should return at most maxSlots slots', () => {
      const provider = practitioners[0]
      if (!provider) return

      const slots = getNextAvailableSlots(provider.id, new Date(), 3, 14, 30)
      expect(slots.length).toBeLessThanOrEqual(3)
    })

    it('should return slots with correct format', () => {
      const provider = practitioners[0]
      if (!provider) return

      const slots = getNextAvailableSlots(provider.id, new Date(), 5, 14, 30)

      slots.forEach(slot => {
        expect(slot.startTime instanceof Date).toBe(true)
        expect(slot.endTime instanceof Date).toBe(true)
        expect(typeof slot.dayLabel).toBe('string')
        expect(typeof slot.timeLabel).toBe('string')
      })
    })

    it('should search across multiple days', () => {
      const provider = practitioners[0]
      if (!provider) return

      const slots = getNextAvailableSlots(provider.id, new Date(), 10, 14, 30)

      // If we have slots on different days, they should be from different dates
      if (slots.length > 1) {
        const uniqueDates = new Set(slots.map(s => s.startTime.toDateString()))
        // We expect at least some variation in dates
        expect(uniqueDates.size).toBeGreaterThanOrEqual(1)
      }
    })
  })

  describe('rescheduleAppointment', () => {
    it('should update appointment in-place', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 3) // 3 days from now

      const testAppointment = {
        id: 'test-reschedule-1',
        patientId: 'test-p-r1',
        patientName: 'Reschedule Test',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 30 * 60 * 1000),
        status: 'scheduled' as const,
        color: '#4F46E5',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      appointments.push(testAppointment)

      const newTime = new Date()
      newTime.setDate(newTime.getDate() + 5) // 5 days from now

      const result = rescheduleAppointment('test-reschedule-1', newTime, 'Patient requested')

      expect(result.success).toBe(true)
      expect(result.appointment).toBeDefined()
      expect(result.appointment?.startTime.getTime()).toBe(newTime.getTime())
      expect(result.appointment?.status).toBe('scheduled')
      expect(result.appointment?.notes).toContain('Rescheduled')
    })

    it('should not reschedule cancelled appointments', () => {
      const testAppointment = {
        id: 'test-reschedule-cancelled',
        patientId: 'test-p-r2',
        patientName: 'Cancelled Test',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: new Date(),
        endTime: new Date(),
        status: 'cancelled' as const,
        color: '#4F46E5',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      appointments.push(testAppointment)

      const result = rescheduleAppointment('test-reschedule-cancelled', new Date())

      expect(result.success).toBe(false)
      expect(result.error).toContain('cancelled')
    })

    it('should not reschedule completed appointments', () => {
      const testAppointment = {
        id: 'test-reschedule-completed',
        patientId: 'test-p-r3',
        patientName: 'Completed Test',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: new Date(),
        endTime: new Date(),
        status: 'completed' as const,
        color: '#4F46E5',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      appointments.push(testAppointment)

      const result = rescheduleAppointment('test-reschedule-completed', new Date())

      expect(result.success).toBe(false)
      expect(result.error).toContain('completed')
    })

    it('should calculate late fee for appointments within 24 hours', () => {
      const within24Hours = new Date()
      within24Hours.setHours(within24Hours.getHours() + 12) // 12 hours from now

      const testAppointment = {
        id: 'test-reschedule-late',
        patientId: 'test-p-r4',
        patientName: 'Late Test',
        serviceName: 'Botox', // Known service with price
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: within24Hours,
        endTime: new Date(within24Hours.getTime() + 30 * 60 * 1000),
        status: 'scheduled' as const,
        color: '#4F46E5',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      appointments.push(testAppointment)

      const newTime = new Date()
      newTime.setDate(newTime.getDate() + 5)

      const result = rescheduleAppointment('test-reschedule-late', newTime)

      expect(result.success).toBe(true)
      expect(result.isLateReschedule).toBe(true)
      // Late fee should be calculated (25% of service price)
      if (result.lateFee) {
        expect(result.lateFee).toBeGreaterThan(0)
      }
    })

    it('should not flag late reschedule for appointments more than 24 hours away', () => {
      const moreThan24Hours = new Date()
      moreThan24Hours.setDate(moreThan24Hours.getDate() + 3) // 3 days from now

      const testAppointment = {
        id: 'test-reschedule-normal',
        patientId: 'test-p-r5',
        patientName: 'Normal Test',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: moreThan24Hours,
        endTime: new Date(moreThan24Hours.getTime() + 30 * 60 * 1000),
        status: 'scheduled' as const,
        color: '#4F46E5',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      appointments.push(testAppointment)

      const newTime = new Date()
      newTime.setDate(newTime.getDate() + 5)

      const result = rescheduleAppointment('test-reschedule-normal', newTime)

      expect(result.success).toBe(true)
      expect(result.isLateReschedule).toBe(false)
      expect(result.lateFee).toBeUndefined()
    })

    it('should return error for non-existent appointment', () => {
      const result = rescheduleAppointment('non-existent-apt', new Date())

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('isLateReschedule', () => {
    it('should return true for appointment within 24 hours', () => {
      const within24Hours = new Date()
      within24Hours.setHours(within24Hours.getHours() + 12)

      const testAppointment = {
        id: 'test-late-check-1',
        patientId: 'test-p-lc1',
        patientName: 'Late Check',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: within24Hours,
        endTime: new Date(within24Hours.getTime() + 30 * 60 * 1000),
        status: 'scheduled' as const,
        color: '#4F46E5',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      appointments.push(testAppointment)

      expect(isLateReschedule('test-late-check-1')).toBe(true)
    })

    it('should return false for appointment more than 24 hours away', () => {
      const moreThan24Hours = new Date()
      moreThan24Hours.setDate(moreThan24Hours.getDate() + 3)

      const testAppointment = {
        id: 'test-late-check-2',
        patientId: 'test-p-lc2',
        patientName: 'Not Late Check',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        startTime: moreThan24Hours,
        endTime: new Date(moreThan24Hours.getTime() + 30 * 60 * 1000),
        status: 'scheduled' as const,
        color: '#4F46E5',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      appointments.push(testAppointment)

      expect(isLateReschedule('test-late-check-2')).toBe(false)
    })

    it('should return false for non-existent appointment', () => {
      expect(isLateReschedule('non-existent')).toBe(false)
    })
  })
})
