import { Shift, ShiftFormData } from '@/types/shifts'
import moment from 'moment'

export const generateShiftsFromForm = (formData: ShiftFormData): Shift[] => {
	const shifts: Shift[] = []
	const seriesId = formData.repeat !== 'no-repeat' ? `series-${Date.now()}` : undefined

	const startDate = new Date(formData.date)
	startDate.setHours(formData.startTime.hour, formData.startTime.minute, 0, 0)

	const endDate = new Date(formData.date)
	endDate.setHours(formData.endTime.hour, formData.endTime.minute, 0, 0)

	// Create the first shift
	shifts.push({
		id: `shift-${Date.now()}`,
		practitionerId: formData.practitionerId,
		startAt: new Date(startDate),
		endAt: new Date(endDate),
		repeat: formData.repeat,
		repeatUntil: formData.repeatUntil,
		seriesId,
		room: formData.room,
		bookingOptions: formData.bookingOptions,
		tags: formData.tags,
		notes: formData.notes,
		createdBy: 'Current User', // In a real app, this would come from auth context
		createdAt: new Date()
	})

	// Generate recurring shifts
	if (formData.repeat !== 'no-repeat' && formData.repeatUntil) {
		const interval = formData.repeat === 'weekly' ? 7 : 14
		let currentDate = moment(startDate).add(interval, 'days')
		const untilDate = moment(formData.repeatUntil)

		while (currentDate.isSameOrBefore(untilDate)) {
			const shiftStart = currentDate.clone().toDate()
			const shiftEnd = currentDate.clone().hours(formData.endTime.hour).minutes(formData.endTime.minute).toDate()

			shifts.push({
				id: `shift-${Date.now()}-${shifts.length}`,
				practitionerId: formData.practitionerId,
				startAt: shiftStart,
				endAt: shiftEnd,
				repeat: formData.repeat,
				repeatUntil: formData.repeatUntil,
				seriesId,
				room: formData.room,
				bookingOptions: formData.bookingOptions,
				tags: formData.tags,
				notes: formData.notes,
				createdBy: 'Current User', // In a real app, this would come from auth context
				createdAt: new Date()
			})

			currentDate.add(interval, 'days')
		}
	}

	return shifts
}

export const getShiftStyle = (shift: Shift, timeSlotHeight: number) => {
	const startHour = shift.startAt.getHours()
	const startMinutes = shift.startAt.getMinutes()
	const endHour = shift.endAt.getHours()
	const endMinutes = shift.endAt.getMinutes()

	const startTotalMinutes = (startHour - 8) * 60 + startMinutes
	const endTotalMinutes = (endHour - 8) * 60 + endMinutes
	const duration = endTotalMinutes - startTotalMinutes

	const topOffset = startTotalMinutes * (timeSlotHeight / 60)
	const height = duration * (timeSlotHeight / 60)

	return {
		top: `${topOffset}px`,
		height: `${height}px`,
		backgroundColor: '#9333EA'
	}
}

export const validateShiftTimes = (startTime: { hour: number; minute: number }, endTime: { hour: number; minute: number }): boolean => {
	const startMinutes = startTime.hour * 60 + startTime.minute
	const endMinutes = endTime.hour * 60 + endTime.minute
	return endMinutes > startMinutes
}

export const formatShiftTime = (shift: Shift): string => {
	const startTime = moment(shift.startAt).format('h:mm A')
	const endTime = moment(shift.endAt).format('h:mm A')
	return `${startTime} - ${endTime}`
}
