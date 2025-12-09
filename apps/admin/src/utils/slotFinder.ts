import moment from 'moment'
import { Service, Appointment, Break, Practitioner } from '@/lib/data'
import { AvailableSlot } from '@/types/calendar'
import { Shift } from '@/types/shifts'
import { checkServiceCapabilityMatch } from './capabilityMatcher'

// Find available slots for a service
export const findAvailableSlots = (
	service: Service,
	practitioner: Practitioner, // Changed from practitionerId to full practitioner object
	dates: Date[],
	appointments: Appointment[],
	breaks: Break[],
	shifts: Shift[]
): AvailableSlot[] => {
	const slots: AvailableSlot[] = []

	dates.forEach(date => {
		// Find shifts for this practitioner on this date
		const dayShifts = shifts.filter(s =>
			s.practitionerId === practitioner.id &&
			moment(s.startAt).isSame(date, 'day')
		)

		if (dayShifts.length === 0) return

		// Process each shift separately
		dayShifts.forEach(shift => {
			// NEW: Check capability/equipment compatibility
			const capabilityMatch = checkServiceCapabilityMatch(service, practitioner, shift)
			if (!capabilityMatch.canPerform) {
				return // Skip this shift if practitioner/equipment requirements not met
			}

			// Get busy periods (appointments + breaks)
			const dayAppointments = appointments.filter(apt =>
				apt.practitionerId === practitioner.id &&
				moment(apt.startTime).isSame(date, 'day')
			).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

			const dayBreaks = breaks.filter(brk =>
				brk.practitionerId === practitioner.id &&
				moment(brk.startTime).isSame(date, 'day')
			).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

			const busyPeriods = [...dayAppointments, ...dayBreaks].sort((a, b) =>
				a.startTime.getTime() - b.startTime.getTime()
			)

			// Use shift's actual start and end times
			const shiftStart = new Date(shift.startAt)
			const shiftEnd = new Date(shift.endAt)

			// Find gaps
			let currentTime = new Date(shiftStart)

			busyPeriods.forEach((period) => {
				const gap = period.startTime.getTime() - currentTime.getTime()
				const gapMinutes = gap / (1000 * 60)

				if (gapMinutes >= service.duration) {
					// Check every 15-minute interval in this gap
					const intervals = Math.floor(gapMinutes / 15)
					for (let i = 0; i < intervals; i++) {
						const slotStart = new Date(currentTime.getTime() + (i * 15 * 60 * 1000))
						const slotEnd = new Date(slotStart.getTime() + service.duration * 60 * 1000)

						// Make sure the slot still fits in the gap
						if (slotEnd <= period.startTime) {
							slots.push({
								practitionerId: practitioner.id,
								date: date,
								startTime: slotStart,
								endTime: slotEnd,
								duration: service.duration
							})
						}
					}
				}

				currentTime = new Date(period.endTime || period.startTime)
			})

			// Check end of day
			const endGap = shiftEnd.getTime() - currentTime.getTime()
			const endGapMinutes = endGap / (1000 * 60)

			if (endGapMinutes >= service.duration) {
				const intervals = Math.floor(endGapMinutes / 15)
				for (let i = 0; i < intervals; i++) {
					const slotStart = new Date(currentTime.getTime() + (i * 15 * 60 * 1000))
					const slotEnd = new Date(slotStart.getTime() + service.duration * 60 * 1000)

					if (slotEnd <= shiftEnd) {
						slots.push({
							practitionerId: practitioner.id,
							date: date,
							startTime: slotStart,
							endTime: slotEnd,
							duration: service.duration
						})
					}
				}
			}
		})
	})

	return slots
}
