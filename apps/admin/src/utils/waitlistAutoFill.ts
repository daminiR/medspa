// src/utils/waitlistAutoFill.ts
// Waitlist Auto-Fill: Automatically suggest waitlist patients when appointments are cancelled

import { Appointment } from '@/lib/data'
import { WaitlistPatient } from '@/lib/data/waitlist'
import moment from 'moment'

export interface WaitlistMatch {
	patient: WaitlistPatient
	score: number
	matchReasons: string[]
}

export interface AutoFillSuggestion {
	cancelledAppointment: Appointment
	matches: WaitlistMatch[]
	topMatch: WaitlistMatch | null
}

/**
 * Calculate a match score for a waitlist patient against an open slot
 * Higher score = better match
 */
function calculateMatchScore(
	patient: WaitlistPatient,
	cancelledAppointment: Appointment
): { score: number; reasons: string[] } {
	let score = 0
	const reasons: string[] = []

	// Priority bonus (base score)
	if (patient.priority === 'high') {
		score += 30
		reasons.push('High priority')
	} else if (patient.priority === 'medium') {
		score += 20
	} else {
		score += 10
	}

	// Service match (exact match is best)
	const patientService = patient.requestedService.toLowerCase()
	const cancelledService = cancelledAppointment.serviceName.toLowerCase()

	if (patientService === cancelledService) {
		score += 25
		reasons.push('Exact service match')
	} else if (patientService.includes(cancelledService) || cancelledService.includes(patientService)) {
		score += 15
		reasons.push('Similar service')
	}

	// Duration fits (patient needs less or equal time)
	if (patient.serviceDuration <= cancelledAppointment.duration) {
		score += 20
		reasons.push('Duration fits')
	} else {
		// Penalize if patient needs more time than available
		score -= 10
	}

	// Practitioner preference match
	if (patient.practitionerId === cancelledAppointment.practitionerId) {
		score += 20
		reasons.push('Preferred practitioner')
	}

	// Waiting time bonus (longer wait = higher priority)
	const daysWaiting = moment().diff(moment(patient.waitingSince), 'days')
	score += Math.min(daysWaiting * 2, 15) // Cap at 15 points
	if (daysWaiting >= 3) {
		reasons.push(`Waiting ${daysWaiting} days`)
	}

	// Forms completed bonus
	if (patient.hasCompletedForms) {
		score += 10
		reasons.push('Forms ready')
	}

	// Deposit paid bonus
	if (patient.deposit && patient.deposit > 0) {
		score += 5
		reasons.push('Deposit paid')
	}

	// Availability check (is the cancelled slot time within patient's availability?)
	const slotTime = moment(cancelledAppointment.startTime)
	const slotHour = slotTime.hour()
	const availStart = moment(patient.availabilityStart).hour()
	const availEnd = moment(patient.availabilityEnd).hour()

	if (slotHour >= availStart && slotHour < availEnd) {
		score += 15
		reasons.push('Within availability')
	} else {
		score -= 15 // Penalize if outside their preferred hours
	}

	return { score, reasons }
}

/**
 * Find matching waitlist patients for a cancelled appointment
 */
export function findMatchingWaitlistPatients(
	cancelledAppointment: Appointment,
	waitlistPatients: WaitlistPatient[]
): WaitlistMatch[] {
	if (!waitlistPatients || waitlistPatients.length === 0) {
		return []
	}

	const matches: WaitlistMatch[] = []

	for (const patient of waitlistPatients) {
		const { score, reasons } = calculateMatchScore(patient, cancelledAppointment)

		// Only include patients with positive scores
		if (score > 0) {
			matches.push({
				patient,
				score,
				matchReasons: reasons
			})
		}
	}

	// Sort by score (highest first)
	matches.sort((a, b) => b.score - a.score)

	return matches
}

/**
 * Create an auto-fill suggestion for a cancelled appointment
 */
export function createAutoFillSuggestion(
	cancelledAppointment: Appointment,
	waitlistPatients: WaitlistPatient[]
): AutoFillSuggestion {
	const matches = findMatchingWaitlistPatients(cancelledAppointment, waitlistPatients)

	return {
		cancelledAppointment,
		matches,
		topMatch: matches.length > 0 ? matches[0] : null
	}
}

/**
 * Format the auto-fill suggestion message for display
 */
export function formatAutoFillMessage(suggestion: AutoFillSuggestion): string {
	if (!suggestion.topMatch) {
		return ''
	}

	const { patient, matchReasons } = suggestion.topMatch
	const time = moment(suggestion.cancelledAppointment.startTime).format('h:mm A')
	const reasonsText = matchReasons.slice(0, 2).join(', ')

	return `📋 ${patient.name} is on waitlist for ${patient.requestedService} (${patient.serviceDuration}min). ${reasonsText}`
}

/**
 * Check if a waitlist patient is a good match (score threshold)
 */
export function isGoodMatch(match: WaitlistMatch): boolean {
	return match.score >= 50 // Minimum score for a "good" match
}
