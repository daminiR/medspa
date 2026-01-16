/**
 * Waitlist Patient Data
 * Centralized mock data for waitlist patients - can be imported by both client and server code
 */

export interface WaitlistPatient {
  id: string
  name: string
  phone: string
  email: string
  requestedService: string
  serviceCategory: string
  serviceDuration: number
  preferredPractitioner?: string
  practitionerId?: string
  availabilityStart: Date
  availabilityEnd: Date
  waitingSince: Date
  priority: 'high' | 'medium' | 'low'
  notes?: string
  hasCompletedForms: boolean
  deposit?: number
  tier?: 'platinum' | 'gold' | 'silver'
  pendingOffer?: boolean
  offerStatus?: 'pending' | 'accepted' | 'declined' | 'expired'
  lastOfferAt?: Date
  offerCount?: number
}

// Mock waitlist data - exported for use across the app
export const mockWaitlistPatients: WaitlistPatient[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    phone: '(555) 123-4567',
    email: 'emma.t@example.com',
    requestedService: 'Botox Treatment',
    serviceCategory: 'injectables',
    serviceDuration: 30,
    preferredPractitioner: 'Dr. Sarah Johnson',
    practitionerId: '1',
    availabilityStart: new Date(2023, 7, 17, 9, 0),
    availabilityEnd: new Date(2023, 7, 17, 17, 0),
    waitingSince: new Date(2023, 7, 16, 14, 30),
    priority: 'high',
    notes: 'Prefers afternoon appointments',
    hasCompletedForms: true,
    deposit: 100,
    tier: 'platinum',
    pendingOffer: true,
    offerStatus: 'pending',
    lastOfferAt: new Date(2023, 7, 17, 10, 30),
    offerCount: 1
  },
  {
    id: '2',
    name: 'Michael Chen',
    phone: '(555) 234-5678',
    email: 'mchen@example.com',
    requestedService: 'Chemical Peel',
    serviceCategory: 'facial',
    serviceDuration: 60,
    availabilityStart: new Date(2023, 7, 17, 10, 0),
    availabilityEnd: new Date(2023, 7, 17, 14, 0),
    waitingSince: new Date(2023, 7, 17, 8, 0),
    priority: 'medium',
    hasCompletedForms: false,
    tier: 'gold',
    offerCount: 0
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    phone: '(555) 345-6789',
    email: 'sophia.r@example.com',
    requestedService: 'Lip Filler',
    serviceCategory: 'injectables',
    serviceDuration: 45,
    preferredPractitioner: 'Dr. Emily Wilson',
    practitionerId: '2',
    availabilityStart: new Date(2023, 7, 17, 11, 0),
    availabilityEnd: new Date(2023, 7, 17, 16, 0),
    waitingSince: new Date(2023, 7, 15, 10, 0),
    priority: 'high',
    notes: 'First time patient - needs consultation',
    hasCompletedForms: true,
    deposit: 150,
    tier: 'silver',
    offerStatus: 'declined',
    lastOfferAt: new Date(2023, 7, 16, 14, 0),
    offerCount: 2
  }
]
