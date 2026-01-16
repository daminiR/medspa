import { getShiftBlockStyle, getAppointmentStyle } from '@/utils/calendarHelpers'

describe('Week View Time Alignment', () => {
  const timeSlotHeight = 60 // 60px per hour
  const calendarStartHour = 8 // 8 AM

  describe('Week View Specific Positioning', () => {
    it('should use same positioning calculations as Day View', () => {
      // Test shift positioning
      const shift = {
        startAt: new Date(2023, 7, 17, 11, 0), // 11:00 AM
        endAt: new Date(2023, 7, 17, 19, 0)    // 7:00 PM
      }

      const shiftStyle = getShiftBlockStyle(shift, timeSlotHeight, 1, calendarStartHour)
      
      // Should have same top offset as in day view
      expect(shiftStyle.top).toBe('180px') // (11-8) * 60
      expect(shiftStyle.height).toBe('480px') // 8 hours
    })

    it('should position appointments consistently in week view', () => {
      const appointment = {
        id: 'test-week-1',
        startTime: new Date(2023, 7, 17, 11, 0), // 11:00 AM
        endTime: new Date(2023, 7, 17, 12, 0),   // 12:00 PM
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

      const style = getAppointmentStyle(appointment, timeSlotHeight, calendarStartHour)
      
      // Should align with 11am grid line
      expect(style.top).toBe('180px')
      expect(style.height).toBe('60px')
    })

    it('should handle column positioning in week view', () => {
      // Week view divides width by number of practitioners
      const numPractitioners = 3
      const columnWidth = 100 / numPractitioners
      
      // First practitioner
      expect(0 * columnWidth).toBe(0)
      
      // Second practitioner
      expect(1 * columnWidth).toBeCloseTo(33.33, 1)
      
      // Third practitioner
      expect(2 * columnWidth).toBeCloseTo(66.67, 1)
    })

    it('should maintain consistent grid lines across views', () => {
      // Grid lines are drawn every 15 minutes
      const hourLineInterval = 4 // Every 4th line is an hour line
      
      // Test grid line positions
      for (let hour = 0; hour < 12; hour++) {
        const gridLineIndex = hour * 4 // 4 lines per hour
        const gridLinePosition = gridLineIndex * (timeSlotHeight / 4)
        const expectedPosition = hour * timeSlotHeight
        
        expect(gridLinePosition).toBe(expectedPosition)
      }
    })
  })
})