import moment from 'moment'
import { Appointment, Break } from '@/lib/data'
import { Shift, AvailableSlot, ContinuousSlotBlock, TimeAdjustmentResult } from '@/types/calendar'

// Helper function to calculate appointment position and height
export const getAppointmentStyle = (appointment: Appointment, timeSlotHeight: number, calendarStartHour: number = 8) => {
	const startHour = appointment.startTime.getHours()
	const startMinutes = appointment.startTime.getMinutes()
	const duration = appointment.duration

	const topOffset = ((startHour - calendarStartHour) * 60 + startMinutes) / 60 * timeSlotHeight
	const height = (duration / 60) * timeSlotHeight

	return {
		top: `${topOffset}px`,
		height: `${height}px`,
		backgroundColor: appointment.color,
	}
}

// Updated helper function for shift block styling that handles new Shift format
export const getShiftBlockStyle = (shift: any, timeSlotHeight: number, opacity: number = 1, calendarStartHour: number = 8) => {
	let startHour, startMinute, endHour, endMinute

	// Handle new format (with startAt/endAt Date objects)
	if (shift.startAt && shift.endAt) {
		startHour = shift.startAt.getHours()
		startMinute = shift.startAt.getMinutes()
		endHour = shift.endAt.getHours()
		endMinute = shift.endAt.getMinutes()
	}
	// Handle old format (with separate hour/minute fields)
	else if (shift.startHour !== undefined) {
		startHour = shift.startHour
		startMinute = shift.startMinute || 0
		endHour = shift.endHour
		endMinute = shift.endMinute || 0
	} else {
		console.warn('Unknown shift format:', shift)
		return {}
	}

	const startMinutes = startHour * 60 + startMinute
	const endMinutes = endHour * 60 + endMinute
	const duration = endMinutes - startMinutes

	const topOffset = ((startHour - calendarStartHour) * 60 + startMinute) / 60 * timeSlotHeight
	const height = (duration / 60) * timeSlotHeight

	return {
		top: `${topOffset}px`,
		height: `${height}px`,
		backgroundColor: '#8B5CF6',
		opacity: opacity
	}
}

// Helper function for break styling
export const getBreakStyle = (breakItem: Break, timeSlotHeight: number, calendarStartHour: number = 8) => {
	const startHour = breakItem.startTime.getHours()
	const startMinutes = breakItem.startTime.getMinutes()
	const duration = breakItem.duration

	const topOffset = ((startHour - calendarStartHour) * 60 + startMinutes) / 60 * timeSlotHeight
	const height = (duration / 60) * timeSlotHeight

	return {
		top: `${topOffset}px`,
		height: `${height}px`,
		backgroundColor: '#6B7280', // Consistent gray color for all breaks
	}
}

// Calculate continuous block style
export const getContinuousBlockStyle = (block: ContinuousSlotBlock, timeSlotHeight: number) => {
	const startHour = block.startTime.getHours()
	const startMinutes = block.startTime.getMinutes()
	const endHour = block.endTime.getHours()
	const endMinutes = block.endTime.getMinutes()

	const startTotalMinutes = (startHour - 8) * 60 + startMinutes
	const endTotalMinutes = (endHour - 8) * 60 + endMinutes
	const duration = endTotalMinutes - startTotalMinutes

	const topOffset = startTotalMinutes * (timeSlotHeight / 60)
	const height = duration * (timeSlotHeight / 60)

	return {
		top: `${topOffset}px`,
		height: `${height}px`
	}
}

// Get week dates for week view
export const getWeekDates = (date: Date, showWeekends: boolean) => {
	const week = []
	const startOfWeek = moment(date).startOf('week')
	
	if (showWeekends) {
		// Show all 7 days (Sunday through Saturday)
		for (let i = 0; i < 7; i++) {
			week.push(moment(startOfWeek).add(i, 'days').toDate())
		}
	} else {
		// Show only weekdays (Monday through Friday)
		for (let i = 0; i < 7; i++) {
			const day = moment(startOfWeek).add(i, 'days')
			const dayOfWeek = day.day() // 0 = Sunday, 6 = Saturday
			if (dayOfWeek !== 0 && dayOfWeek !== 6) {
				week.push(day.toDate())
			}
		}
	}
	return week
}

// Calculate time slot height based on settings
export const getTimeSlotHeight = (timeSlotHeight: string) => {
	const heights = {
		small: 45,
		medium: 60,
		large: 75
	}
	return heights[timeSlotHeight as keyof typeof heights] || 60
}

// Updated helper function to check if time is within shift (handles new Shift format)
export const isWithinShift = (shift: Shift | null, hour: number, minute: number): boolean => {
	if (!shift) return false

	const timeInMinutes = hour * 60 + minute

	let shiftStartInMinutes, shiftEndInMinutes

	// Handle new format (with startAt/endAt)
	if (shift.startAt && shift.endAt) {
		shiftStartInMinutes = shift.startAt.getHours() * 60 + shift.startAt.getMinutes()
		shiftEndInMinutes = shift.endAt.getHours() * 60 + shift.endAt.getMinutes()
	}
	// Handle old format
	else if ((shift as any).startHour !== undefined) {
		const oldShift = shift as any
		shiftStartInMinutes = oldShift.startHour * 60 + (oldShift.startMinute || 0)
		shiftEndInMinutes = oldShift.endHour * 60 + (oldShift.endMinute || 0)
	} else {
		return false
	}

	return timeInMinutes >= shiftStartInMinutes && timeInMinutes <= shiftEndInMinutes
}

// Updated helper function to adjust time to fit within shift (handles new format)
export const adjustTimeToShift = (
	shift: Shift | null,
	startTime: { hour: number; minute: number },
	duration: number
): TimeAdjustmentResult => {
	if (!shift) return { startTime, duration, adjusted: false }

	let shiftStartMinutes, shiftEndMinutes, shiftStartHour, shiftStartMinute, shiftEndHour, shiftEndMinute

	// Handle new format (with startAt/endAt)
	if (shift.startAt && shift.endAt) {
		shiftStartHour = shift.startAt.getHours()
		shiftStartMinute = shift.startAt.getMinutes()
		shiftEndHour = shift.endAt.getHours()
		shiftEndMinute = shift.endAt.getMinutes()
		shiftStartMinutes = shiftStartHour * 60 + shiftStartMinute
		shiftEndMinutes = shiftEndHour * 60 + shiftEndMinute
	}
	// Handle old format
	else if ((shift as any).startHour !== undefined) {
		const oldShift = shift as any
		shiftStartHour = oldShift.startHour
		shiftStartMinute = oldShift.startMinute || 0
		shiftEndHour = oldShift.endHour
		shiftEndMinute = oldShift.endMinute || 0
		shiftStartMinutes = shiftStartHour * 60 + shiftStartMinute
		shiftEndMinutes = shiftEndHour * 60 + shiftEndMinute
	} else {
		return { startTime, duration, adjusted: false }
	}

	const startMinutes = startTime.hour * 60 + startTime.minute
	const endMinutes = startMinutes + duration

	let adjustedStartMinutes = startMinutes
	let adjustedDuration = duration
	let wasAdjusted = false

	// Adjust start time if before shift
	if (startMinutes < shiftStartMinutes) {
		adjustedStartMinutes = shiftStartMinutes
		wasAdjusted = true
	}

	// Adjust duration if end time is after shift
	if (adjustedStartMinutes + duration > shiftEndMinutes) {
		adjustedDuration = shiftEndMinutes - adjustedStartMinutes
		wasAdjusted = true
	}

	return {
		startTime: {
			hour: Math.floor(adjustedStartMinutes / 60),
			minute: adjustedStartMinutes % 60
		},
		duration: adjustedDuration,
		adjusted: wasAdjusted,
		shiftInfo: {
			start: `${shiftStartHour}:${shiftStartMinute.toString().padStart(2, '0')}`,
			end: `${shiftEndHour}:${shiftEndMinute.toString().padStart(2, '0')}`
		}
	}
}

// Convert Y position to time
export const getTimeFromY = (y: number, calendarRect: DOMRect | null, timeSlotHeight: number, calendarStartHour: number = 8, calendarEndHour: number = 20, headerOffset: number = 0) => {
	if (!calendarRect) return { hour: calendarStartHour, minute: 0 }
	const relativeY = y - calendarRect.top - headerOffset
	
	// timeSlotHeight is the height of one hour (contains 4 15-minute slots)
	const hoursFromStart = relativeY / timeSlotHeight
	const totalMinutesFromStart = hoursFromStart * 60
	
	const hour = Math.floor(hoursFromStart) + calendarStartHour
	const minute = Math.floor((totalMinutesFromStart % 60) / 15) * 15 // Round to 15 min intervals
	
	return {
		hour: Math.min(calendarEndHour - 1, Math.max(calendarStartHour, hour)),
		minute: Math.min(45, minute)
	}
}

// Calculate drag selection position
export const getDragSelectionStyle = (
	dragStart: { time: { hour: number; minute: number } } | null,
	dragEnd: { time: { hour: number; minute: number } } | null,
	timeSlotHeight: number,
	calendarStartHour: number = 8
) => {
	if (!dragStart || !dragEnd) return {}

	const startTime = dragStart.time
	const endTime = dragEnd.time

	const startMinutes = (startTime.hour - calendarStartHour) * 60 + startTime.minute
	const endMinutes = (endTime.hour - calendarStartHour) * 60 + endTime.minute

	const top = Math.min(startMinutes, endMinutes) / 60 * timeSlotHeight
	const height = Math.abs(endMinutes - startMinutes) / 60 * timeSlotHeight

	return {
		top: `${top}px`,
		height: `${height}px`,
		left: '4px',
		right: '4px',
	}
}

// Merge consecutive slots into continuous blocks for better visualization
export const mergeSlotsIntoContinuousBlocks = (slots: AvailableSlot[]): ContinuousSlotBlock[] => {
	if (slots.length === 0) return []

	// Group slots by practitioner and date
	const grouped = slots.reduce((acc, slot) => {
		const key = `${slot.practitionerId}-${slot.date.toDateString()}`
		if (!acc[key]) {
			acc[key] = []
		}
		acc[key].push(slot)
		return acc
	}, {} as Record<string, AvailableSlot[]>)

	// Merge consecutive slots for each group
	const blocks: ContinuousSlotBlock[] = []

	Object.values(grouped).forEach(groupSlots => {
		// Sort slots by start time
		groupSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

		let currentBlock: ContinuousSlotBlock | null = null

		groupSlots.forEach(slot => {
			if (!currentBlock) {
				// Start a new block
				currentBlock = {
					practitionerId: slot.practitionerId,
					date: slot.date,
					startTime: slot.startTime,
					endTime: slot.endTime,
					slots: [slot]
				}
			} else {
				// Check if this slot is consecutive (within 15 minutes of the last slot's end)
				const timeDiff = slot.startTime.getTime() - currentBlock.endTime.getTime()
				if (timeDiff <= 15 * 60 * 1000) { // 15 minutes or less
					// Extend the current block
					currentBlock.endTime = slot.endTime
					currentBlock.slots.push(slot)
				} else {
					// Start a new block
					blocks.push(currentBlock)
					currentBlock = {
						practitionerId: slot.practitionerId,
						date: slot.date,
						startTime: slot.startTime,
						endTime: slot.endTime,
						slots: [slot]
					}
				}
			}
		})

		// Don't forget the last block
		if (currentBlock) {
			blocks.push(currentBlock)
		}
	})

	return blocks
}
