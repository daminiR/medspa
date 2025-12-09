// Utility functions for laying out overlapping appointments

import { Appointment } from '@/lib/data'
import moment from 'moment'

interface LayoutPosition {
	left: string
	width: string
	zIndex: number
}

export interface AppointmentWithLayout extends Appointment {
	layoutPosition?: LayoutPosition
}

/**
 * Calculate layout positions for overlapping appointments
 * This creates a side-by-side layout for appointments that overlap in time
 */
export function calculateAppointmentLayouts(appointments: Appointment[]): AppointmentWithLayout[] {
	// Sort appointments by start time
	const sortedAppointments = [...appointments].sort((a, b) => 
		moment(a.startTime).valueOf() - moment(b.startTime).valueOf()
	)

	// Track which appointments overlap with each other
	const overlappingGroups: Appointment[][] = []
	const processedIds = new Set<string>()

	sortedAppointments.forEach(apt => {
		if (processedIds.has(apt.id)) return

		// Find all appointments that overlap with this one
		const overlappingWithCurrent = [apt]
		processedIds.add(apt.id)

		sortedAppointments.forEach(other => {
			if (processedIds.has(other.id)) return
			if (other.id === apt.id) return

			// Check if appointments overlap
			const aptStart = moment(apt.startTime)
			const aptEnd = moment(apt.endTime)
			const otherStart = moment(other.startTime)
			const otherEnd = moment(other.endTime)

			if (
				(otherStart.isSameOrAfter(aptStart) && otherStart.isBefore(aptEnd)) ||
				(otherEnd.isAfter(aptStart) && otherEnd.isSameOrBefore(aptEnd)) ||
				(otherStart.isSameOrBefore(aptStart) && otherEnd.isSameOrAfter(aptEnd))
			) {
				overlappingWithCurrent.push(other)
				processedIds.add(other.id)
			}
		})

		if (overlappingWithCurrent.length > 1) {
			overlappingGroups.push(overlappingWithCurrent)
		}
	})

	// Create a map of appointment layouts
	const layoutMap = new Map<string, LayoutPosition>()

	// Process overlapping groups
	overlappingGroups.forEach((group, groupIndex) => {
		const groupSize = group.length
		
		// Enhanced layout with better visual separation
		if (groupSize === 2) {
			// For 2 appointments: side by side with clear separation
			group.forEach((apt, index) => {
				layoutMap.set(apt.id, {
					left: index === 0 ? '2%' : '51%',
					width: '47%',
					zIndex: 20 + index
				})
			})
		} else if (groupSize === 3) {
			// For 3 appointments: evenly distributed
			const positions = ['2%', '34%', '66%']
			group.forEach((apt, index) => {
				layoutMap.set(apt.id, {
					left: positions[index],
					width: '31%',
					zIndex: 20 + index
				})
			})
		} else {
			// For 4+ appointments: use calculated layout
			const baseWidth = 100 / groupSize
			const gap = 3 // 3% gap between appointments
			const adjustedWidth = baseWidth - gap

			group.forEach((apt, index) => {
				layoutMap.set(apt.id, {
					left: `${index * baseWidth + 2}%`,
					width: `${adjustedWidth}%`,
					zIndex: 20 + index
				})
			})
		}
	})

	// Apply layouts to appointments
	return appointments.map(apt => ({
		...apt,
		layoutPosition: layoutMap.get(apt.id) || {
			left: '4px',
			width: 'calc(100% - 8px)',
			zIndex: 10
		}
	}))
}

/**
 * Check if two appointments are in the same overlapping group
 */
export function areAppointmentsInSameGroup(apt1: Appointment, apt2: Appointment): boolean {
	const start1 = moment(apt1.startTime)
	const end1 = moment(apt1.endTime)
	const start2 = moment(apt2.startTime)
	const end2 = moment(apt2.endTime)

	return (
		(start2.isSameOrAfter(start1) && start2.isBefore(end1)) ||
		(end2.isAfter(start1) && end2.isSameOrBefore(end1)) ||
		(start1.isSameOrAfter(start2) && start1.isBefore(end2)) ||
		(end1.isAfter(start2) && end1.isSameOrBefore(end2))
	)
}