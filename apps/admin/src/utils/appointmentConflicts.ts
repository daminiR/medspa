// src/utils/appointmentConflicts.ts

import { Appointment, practitioners } from '@/lib/data'
import moment from 'moment'

interface TimeSlot {
	startTime: Date
	endTime: Date
}

/**
 * Check if two time slots overlap
 */
export function timeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
	const start1 = moment(slot1.startTime)
	const end1 = moment(slot1.endTime)
	const start2 = moment(slot2.startTime)
	const end2 = moment(slot2.endTime)

	// Check if slot1 starts during slot2
	if (start1.isSameOrAfter(start2) && start1.isBefore(end2)) return true

	// Check if slot1 ends during slot2
	if (end1.isAfter(start2) && end1.isSameOrBefore(end2)) return true

	// Check if slot1 completely contains slot2
	if (start1.isSameOrBefore(start2) && end1.isSameOrAfter(end2)) return true

	// Check if slot2 completely contains slot1
	if (start2.isSameOrBefore(start1) && end2.isSameOrAfter(end1)) return true

	return false
}

/**
 * Find conflicts for a proposed appointment
 */
export function findAppointmentConflicts(
	proposedAppointment: {
		practitionerId: string
		startTime: Date
		endTime: Date
		roomId?: string
		postTreatmentTime?: number // minutes for post-treatment buffer
		serviceName?: string
	},
	existingAppointments: Appointment[],
	excludeAppointmentId?: string // For when editing an existing appointment
): Appointment[] {
	return existingAppointments.filter(apt => {
		// Skip if it's the same appointment (for editing)
		if (excludeAppointmentId && apt.id === excludeAppointmentId) return false

		// Skip cancelled appointments
		if (apt.status === 'cancelled') return false

		// If post-treatment time is specified, extend the end time for conflict checking
		let effectiveEndTime = proposedAppointment.endTime
		if (proposedAppointment.postTreatmentTime) {
			effectiveEndTime = new Date(proposedAppointment.endTime)
			effectiveEndTime.setMinutes(effectiveEndTime.getMinutes() + proposedAppointment.postTreatmentTime)
		}

		// Also consider existing appointment's post-treatment time
		let existingEffectiveEndTime = apt.endTime
		if (apt.postTreatmentTime) {
			existingEffectiveEndTime = new Date(apt.endTime)
			existingEffectiveEndTime.setMinutes(existingEffectiveEndTime.getMinutes() + apt.postTreatmentTime)
		}

		// Check for time overlap first
		const hasTimeOverlap = timeSlotsOverlap(
			{ startTime: proposedAppointment.startTime, endTime: effectiveEndTime },
			{ startTime: apt.startTime, endTime: existingEffectiveEndTime }
		)

		// No time overlap, no conflict
		if (!hasTimeOverlap) return false

		// Check if it's the same practitioner
		if (apt.practitionerId === proposedAppointment.practitionerId) {
			// Get practitioner's stagger settings
			const practitioner = practitioners.find(p => p.id === proposedAppointment.practitionerId)
			const hasStaggerBooking = practitioner?.staggerOnlineBooking && practitioner.staggerOnlineBooking > 0
			
			// If practitioner has stagger booking enabled and appointments are in different rooms, allow overlap
			if (hasStaggerBooking && proposedAppointment.roomId && apt.roomId && proposedAppointment.roomId !== apt.roomId) {
				return false // No conflict - different rooms with stagger booking enabled
			}
			
			// Otherwise, same practitioner + time overlap = conflict
			return true
		}

		// If there's time overlap and both appointments have the same room, that's also a conflict
		if (proposedAppointment.roomId && apt.roomId && apt.roomId === proposedAppointment.roomId) return true

		return false
	})
}

/**
 * Check if a proposed appointment has conflicts
 */
export function hasConflicts(
	proposedAppointment: {
		practitionerId: string
		startTime: Date
		endTime: Date
	},
	existingAppointments: Appointment[]
): boolean {
	return findAppointmentConflicts(proposedAppointment, existingAppointments).length > 0
}

/**
 * Get a user-friendly conflict message
 */
export function getConflictMessage(conflicts: Appointment[], proposedRoom?: string): string {
	if (conflicts.length === 0) return ''

	if (conflicts.length === 1) {
		const conflict = conflicts[0]
		const time = moment(conflict.startTime).format('h:mm A')
		
		// Check if it's a room conflict
		if (proposedRoom && conflict.roomId === proposedRoom) {
			return `Room is already booked at ${time} for ${conflict.patientName}`
		}
		
		return `This time slot conflicts with ${conflict.patientName}'s appointment at ${time}`
	}

	// Check if any conflicts are room conflicts
	const roomConflicts = conflicts.filter(c => proposedRoom && c.roomId === proposedRoom)
	if (roomConflicts.length > 0) {
		return `This time slot has ${conflicts.length} conflicts (including ${roomConflicts.length} room conflict${roomConflicts.length > 1 ? 's' : ''})`
	}

	return `This time slot conflicts with ${conflicts.length} existing appointments`
}

/**
 * Check if a time slot is available for a practitioner
 */
export function isTimeSlotAvailable(
	practitionerId: string,
	startTime: Date,
	duration: number, // in minutes
	existingAppointments: Appointment[],
	roomId?: string,
	postTreatmentTime?: number // minutes for post-treatment buffer
): { available: boolean; conflicts: Appointment[]; message: string } {
	const endTime = new Date(startTime)
	endTime.setMinutes(endTime.getMinutes() + duration)

	const conflicts = findAppointmentConflicts(
		{ practitionerId, startTime, endTime, roomId, postTreatmentTime },
		existingAppointments
	)

	return {
		available: conflicts.length === 0,
		conflicts,
		message: getConflictMessage(conflicts, roomId)
	}
}

/**
 * Check if a room is available for a time slot
 */
export function isRoomAvailable(
	roomId: string,
	startTime: Date,
	endTime: Date,
	existingAppointments: Appointment[],
	excludeAppointmentId?: string,
	postTreatmentTime?: number
): { available: boolean; conflicts: Appointment[]; message: string } {
	const conflicts = existingAppointments.filter(apt => {
		// Skip if it's the same appointment (for editing)
		if (excludeAppointmentId && apt.id === excludeAppointmentId) return false

		// Skip if different room
		if (apt.roomId !== roomId) return false

		// Skip cancelled appointments
		if (apt.status === 'cancelled') return false

		// Consider post-treatment time for both appointments
		let effectiveEndTime = endTime
		if (postTreatmentTime) {
			effectiveEndTime = new Date(endTime)
			effectiveEndTime.setMinutes(effectiveEndTime.getMinutes() + postTreatmentTime)
		}

		let existingEffectiveEndTime = apt.endTime
		if (apt.postTreatmentTime) {
			existingEffectiveEndTime = new Date(apt.endTime)
			existingEffectiveEndTime.setMinutes(existingEffectiveEndTime.getMinutes() + apt.postTreatmentTime)
		}

		// Check for time overlap
		return timeSlotsOverlap(
			{ startTime, endTime: effectiveEndTime },
			{ startTime: apt.startTime, endTime: existingEffectiveEndTime }
		)
	})

	return {
		available: conflicts.length === 0,
		conflicts,
		message: conflicts.length > 0 ? 
			`Room is already booked during this time for ${conflicts.map(c => c.patientName).join(', ')}` : ''
	}
}
