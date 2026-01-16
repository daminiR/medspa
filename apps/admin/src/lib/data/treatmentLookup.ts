/**
 * Treatment Lookup Service
 *
 * Finds recent treatments for a patient to identify the provider
 * responsible for potential complications.
 */

import { appointments, practitioners, type Appointment, type Practitioner } from '@/lib/data'

export interface RecentTreatment {
  appointmentId: string
  serviceName: string
  serviceCategory: string
  practitionerId: string
  practitionerName: string
  practitionerPhone?: string
  practitionerEmail?: string
  date: Date
  daysSince: number
  patientId: string
  patientName: string
}

export interface TreatmentLookupOptions {
  daysBack?: number
  serviceCategory?: string
  status?: Appointment['status'][]
}

/**
 * Find the most recent completed treatment for a patient
 * Used to identify which provider to alert for complications
 */
export function findRecentTreatment(
  patientId: string,
  options: TreatmentLookupOptions = {}
): RecentTreatment | null {
  const {
    daysBack = 14,
    status = ['completed', 'in_progress']
  } = options

  const now = new Date()
  const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

  // Find recent appointments for this patient
  const recentAppointments = appointments
    .filter(apt =>
      apt.patientId === patientId &&
      status.includes(apt.status) &&
      new Date(apt.endTime) >= cutoff &&
      new Date(apt.endTime) <= now
    )
    .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())

  if (recentAppointments.length === 0) return null

  const apt = recentAppointments[0]
  const practitioner = practitioners.find(p => p.id === apt.practitionerId)

  return {
    appointmentId: apt.id,
    serviceName: apt.serviceName,
    serviceCategory: apt.serviceCategory,
    practitionerId: apt.practitionerId,
    practitionerName: practitioner?.name || 'Unknown Provider',
    practitionerPhone: practitioner?.phone,
    practitionerEmail: practitioner?.email,
    date: new Date(apt.endTime),
    daysSince: Math.floor((now.getTime() - new Date(apt.endTime).getTime()) / (1000 * 60 * 60 * 24)),
    patientId: apt.patientId,
    patientName: apt.patientName
  }
}

/**
 * Find all recent treatments for a patient (for context)
 */
export function findAllRecentTreatments(
  patientId: string,
  options: TreatmentLookupOptions = {}
): RecentTreatment[] {
  const {
    daysBack = 30,
    status = ['completed', 'in_progress']
  } = options

  const now = new Date()
  const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

  return appointments
    .filter(apt =>
      apt.patientId === patientId &&
      status.includes(apt.status) &&
      new Date(apt.endTime) >= cutoff &&
      new Date(apt.endTime) <= now
    )
    .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
    .map(apt => {
      const practitioner = practitioners.find(p => p.id === apt.practitionerId)
      return {
        appointmentId: apt.id,
        serviceName: apt.serviceName,
        serviceCategory: apt.serviceCategory,
        practitionerId: apt.practitionerId,
        practitionerName: practitioner?.name || 'Unknown Provider',
        practitionerPhone: practitioner?.phone,
        practitionerEmail: practitioner?.email,
        date: new Date(apt.endTime),
        daysSince: Math.floor((now.getTime() - new Date(apt.endTime).getTime()) / (1000 * 60 * 60 * 24)),
        patientId: apt.patientId,
        patientName: apt.patientName
      }
    })
}

/**
 * Check if treatment is within critical complication period
 * Most complications occur within 48-72 hours of treatment
 */
export function isWithinCriticalPeriod(treatment: RecentTreatment): boolean {
  return treatment.daysSince <= 3
}

/**
 * Check if treatment is within extended monitoring period
 * Some complications can occur up to 2 weeks post-treatment
 */
export function isWithinMonitoringPeriod(treatment: RecentTreatment): boolean {
  return treatment.daysSince <= 14
}

/**
 * Get the practitioner details by ID
 */
export function getPractitionerById(practitionerId: string): Practitioner | undefined {
  return practitioners.find(p => p.id === practitionerId)
}

/**
 * Get all active practitioners (for fallback alerts)
 */
export function getActivePractitioners(): Practitioner[] {
  return practitioners.filter(p => p.status === 'active')
}

/**
 * Find patient ID by phone number
 * Useful when receiving SMS and need to look up patient
 */
export function findPatientIdByPhone(phone: string): string | null {
  // Normalize phone number (remove non-digits)
  const normalizedPhone = phone.replace(/\D/g, '')

  // Search in appointments for matching phone
  const matchingAppointment = appointments.find(apt => {
    const aptPhone = apt.phone?.replace(/\D/g, '')
    return aptPhone && (
      aptPhone === normalizedPhone ||
      aptPhone.endsWith(normalizedPhone) ||
      normalizedPhone.endsWith(aptPhone)
    )
  })

  return matchingAppointment?.patientId || null
}

/**
 * Get treatment type category for aftercare matching
 */
export function getTreatmentCategory(serviceName: string): string {
  const serviceNameLower = serviceName.toLowerCase()

  // Injectable treatments
  if (serviceNameLower.includes('botox') || serviceNameLower.includes('dysport') || serviceNameLower.includes('xeomin')) {
    return 'neurotoxin'
  }
  if (serviceNameLower.includes('filler') || serviceNameLower.includes('juvederm') || serviceNameLower.includes('restylane')) {
    return 'filler'
  }

  // Skin treatments
  if (serviceNameLower.includes('peel') || serviceNameLower.includes('chemical')) {
    return 'chemical_peel'
  }
  if (serviceNameLower.includes('microneedling') || serviceNameLower.includes('prp')) {
    return 'microneedling'
  }
  if (serviceNameLower.includes('laser')) {
    return 'laser'
  }

  // Body treatments
  if (serviceNameLower.includes('coolsculpting') || serviceNameLower.includes('sculpting')) {
    return 'body_contouring'
  }

  return 'general'
}
