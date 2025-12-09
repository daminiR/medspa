import { describe, it, expect } from '@jest/globals'
import moment from 'moment'
import { getShiftBlockStyle, getAppointmentStyle } from '@/utils/calendarHelpers'

describe('Calendar Time Alignment', () => {
  const timeSlotHeight = 60 // 60px per hour
  const calendarStartHour = 8 // 8 AM

  describe('Time Label Formatting', () => {
    it('should format hours correctly in 12-hour format', () => {
      const testCases = [
        { hour: 8, expected: '8:00 AM' },
        { hour: 11, expected: '11:00 AM' },
        { hour: 12, expected: '12:00 PM' },
        { hour: 13, expected: '1:00 PM' },
        { hour: 19, expected: '7:00 PM' },
        { hour: 20, expected: '8:00 PM' }
      ]

      testCases.forEach(({ hour, expected }) => {
        const formatted = moment().hour(hour).minute(0).format('h:mm A')
        expect(formatted).toBe(expected)
      })
    })
  })

  describe('Shift Block Positioning', () => {
    it('should calculate correct position for 11am-7pm shift', () => {
      const shift = {
        startAt: new Date(2023, 7, 17, 11, 0), // 11:00 AM
        endAt: new Date(2023, 7, 17, 19, 0)    // 7:00 PM (19:00)
      }

      const style = getShiftBlockStyle(shift, timeSlotHeight, 1, calendarStartHour)

      // Top offset: (11 - 8) * 60 = 180px
      expect(style.top).toBe('180px')
      
      // Height: (19 - 11) * 60 = 480px (8 hours)
      expect(style.height).toBe('480px')
    })

    it('should handle shifts starting before calendar start hour', () => {
      const shift = {
        startAt: new Date(2023, 7, 17, 6, 0), // 6:00 AM
        endAt: new Date(2023, 7, 17, 10, 0)   // 10:00 AM
      }

      const style = getShiftBlockStyle(shift, timeSlotHeight, 1, calendarStartHour)

      // Top offset: (6 - 8) * 60 = -120px (should be negative)
      expect(style.top).toBe('-120px')
      
      // Height: (10 - 6) * 60 = 240px (4 hours)
      expect(style.height).toBe('240px')
    })

    it('should handle old shift format', () => {
      const shift = {
        startHour: 11,
        startMinute: 0,
        endHour: 19,
        endMinute: 0
      }

      const style = getShiftBlockStyle(shift, timeSlotHeight, 1, calendarStartHour)

      expect(style.top).toBe('180px')
      expect(style.height).toBe('480px')
    })
  })

  describe('Appointment Positioning', () => {
    it('should align appointments with shift blocks', () => {
      const appointment = {
        id: 'test-1',
        startTime: new Date(2023, 7, 17, 11, 0), // 11:00 AM
        endTime: new Date(2023, 7, 17, 12, 0),   // 12:00 PM
        duration: 60, // 1 hour
        color: '#8B5CF6',
        patientId: 'p1',
        patientName: 'Test Patient',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        status: 'scheduled' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const style = getAppointmentStyle(appointment, timeSlotHeight, calendarStartHour)

      // Should start at same position as 11am shift
      expect(style.top).toBe('180px')
      
      // Height for 1 hour
      expect(style.height).toBe('60px')
    })

    it('should handle appointments with minutes', () => {
      const appointment = {
        id: 'test-2',
        startTime: new Date(2023, 7, 17, 14, 30), // 2:30 PM
        endTime: new Date(2023, 7, 17, 15, 15),   // 3:15 PM
        duration: 45, // 45 minutes
        color: '#8B5CF6',
        patientId: 'p1',
        patientName: 'Test Patient',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        status: 'scheduled' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const style = getAppointmentStyle(appointment, timeSlotHeight, calendarStartHour)

      // Top offset: (14.5 - 8) * 60 = 390px
      expect(style.top).toBe('390px')
      
      // Height: 45/60 * 60 = 45px
      expect(style.height).toBe('45px')
    })
  })

  describe('Grid and Element Alignment', () => {
    it('should have consistent hour calculations', () => {
      // Test that grid lines, shifts, and appointments all use same calculation
      const testHour = 11
      const testMinute = 0

      // Grid line position (what TimeColumn shows)
      const gridPosition = (testHour - calendarStartHour) * timeSlotHeight

      // Shift position
      const shift = {
        startAt: new Date(2023, 7, 17, testHour, testMinute),
        endAt: new Date(2023, 7, 17, testHour + 1, testMinute)
      }
      const shiftStyle = getShiftBlockStyle(shift, timeSlotHeight, 1, calendarStartHour)
      const shiftPosition = parseInt(shiftStyle.top!)

      // Appointment position
      const appointment = {
        id: 'test-3',
        startTime: new Date(2023, 7, 17, testHour, testMinute),
        endTime: new Date(2023, 7, 17, testHour + 1, testMinute),
        duration: 60,
        color: '#8B5CF6',
        patientId: 'p1',
        patientName: 'Test Patient',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics' as const,
        practitionerId: '1',
        status: 'scheduled' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const appointmentStyle = getAppointmentStyle(appointment, timeSlotHeight, calendarStartHour)
      const appointmentPosition = parseInt(appointmentStyle.top!)

      // All should be at the same position
      expect(gridPosition).toBe(180) // (11-8) * 60
      expect(shiftPosition).toBe(180)
      expect(appointmentPosition).toBe(180)
    })
  })
})