/**
 * Mock Twilio Phone Number Management Service
 * Simulates Twilio API for phone number provisioning and management
 * In production, this would call the real Twilio API
 */

import {
  AvailablePhoneNumber,
  ProvisionedPhoneNumber,
  PhoneNumberStatus,
} from '@/types/phone-numbers'

/**
 * In-memory store for provisioned phone numbers (mock database)
 * In production, this would be in a real database
 */
let provisionedNumbers: ProvisionedPhoneNumber[] = []

/**
 * Mock available phone numbers by area code
 * Simulates Twilio's available numbers API
 */
const mockAvailableNumbers: Record<string, AvailablePhoneNumber[]> = {
  '415': [ // San Francisco area
    {
      phoneNumber: '+14155551234',
      friendlyName: '(415) 555-1234',
      areaCode: '415',
      countryCode: 'US',
      lata: '686',
      rateCenter: 'SFRNCSCO',
      capabilities: { sms: true, voice: true, mms: true },
      cost: '1.00',
    },
    {
      phoneNumber: '+14155555678',
      friendlyName: '(415) 555-5678',
      areaCode: '415',
      countryCode: 'US',
      lata: '686',
      rateCenter: 'SFRNCSCO',
      capabilities: { sms: true, voice: true, mms: true },
      cost: '1.00',
    },
    {
      phoneNumber: '+14155559999',
      friendlyName: '(415) 555-9999',
      areaCode: '415',
      countryCode: 'US',
      lata: '686',
      rateCenter: 'SFRNCSCO',
      capabilities: { sms: true, voice: true, mms: true },
      cost: '1.00',
    },
  ],
  '212': [ // New York area
    {
      phoneNumber: '+12125550101',
      friendlyName: '(212) 555-0101',
      areaCode: '212',
      countryCode: 'US',
      lata: '227',
      rateCenter: 'NWYRCYZN',
      capabilities: { sms: true, voice: true, mms: true },
      cost: '1.00',
    },
    {
      phoneNumber: '+12125550202',
      friendlyName: '(212) 555-0202',
      areaCode: '212',
      countryCode: 'US',
      lata: '227',
      rateCenter: 'NWYRCYZN',
      capabilities: { sms: true, voice: true, mms: true },
      cost: '1.00',
    },
  ],
  '323': [ // Los Angeles area
    {
      phoneNumber: '+13235551001',
      friendlyName: '(323) 555-1001',
      areaCode: '323',
      countryCode: 'US',
      lata: '626',
      rateCenter: 'LOSANGELCA',
      capabilities: { sms: true, voice: true, mms: true },
      cost: '1.00',
    },
    {
      phoneNumber: '+13235552002',
      friendlyName: '(323) 555-2002',
      areaCode: '323',
      countryCode: 'US',
      lata: '626',
      rateCenter: 'LOSANGELCA',
      capabilities: { sms: true, voice: true, mms: true },
      cost: '1.00',
    },
  ],
  '305': [ // Miami area
    {
      phoneNumber: '+13055551234',
      friendlyName: '(305) 555-1234',
      areaCode: '305',
      countryCode: 'US',
      lata: '350',
      rateCenter: 'MIAMI',
      capabilities: { sms: true, voice: true, mms: true },
      cost: '1.00',
    },
  ],
}

/**
 * Generate mock Twilio SID
 */
function generateSID(): string {
  return 'PN' + Math.random().toString(36).substring(2, 15).toUpperCase()
}

/**
 * Extract area code from E.164 number
 */
function extractAreaCode(phoneNumber: string): string {
  // E.164 format: +1NXXNXXXXXX for US
  // Area code is at positions 2-4
  const cleaned = phoneNumber.replace(/\D/g, '')
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return cleaned.substring(1, 4)
  }
  return cleaned.substring(0, 3)
}

/**
 * Search for available phone numbers by area code
 */
export async function searchAvailableNumbers(
  areaCode: string,
  limit: number = 5
): Promise<AvailablePhoneNumber[]> {
  console.log(`[Twilio Mock] Searching available numbers for area code: ${areaCode}`)

  // Get numbers for area code or return empty
  const available = mockAvailableNumbers[areaCode] || []

  // Filter based on limit
  const results = available.slice(0, limit)

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  return results
}

/**
 * Provision a phone number
 */
export async function provisionPhoneNumber(
  phoneNumber: string,
  locationId: string,
  locationName: string,
  purpose: string = 'sms',
  displayName?: string,
  webhookUrl?: string,
  tags?: string[]
): Promise<ProvisionedPhoneNumber> {
  console.log(`[Twilio Mock] Provisioning number: ${phoneNumber} for location: ${locationId}`)

  const areaCode = extractAreaCode(phoneNumber)
  const sid = generateSID()
  const now = new Date()

  const provisioned: ProvisionedPhoneNumber = {
    id: sid,
    phoneNumber,
    friendlyName: `(${areaCode.substring(0, 3)}) ${phoneNumber.substring(-7, -4)}-${phoneNumber.substring(-4)}`,
    areaCode,
    status: 'active',
    locationId,
    locationName,
    purpose: purpose as 'sms' | 'voice' | 'both' | 'customer_support',
    sid,
    smsEnabled: purpose === 'sms' || purpose === 'both',
    voiceEnabled: purpose === 'voice' || purpose === 'both',
    monthlyRate: '1.00',
    provisionedAt: now,
    displayName: displayName || `${locationName} - ${phoneNumber}`,
    tags,
    webhookUrl,
  }

  // Store in mock database
  provisionedNumbers.push(provisioned)

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  console.log(`[Twilio Mock] Successfully provisioned: ${phoneNumber} with SID: ${sid}`)
  return provisioned
}

/**
 * Get all provisioned numbers
 */
export async function getProvisionedNumbers(): Promise<ProvisionedPhoneNumber[]> {
  console.log('[Twilio Mock] Fetching all provisioned numbers')
  await new Promise(resolve => setTimeout(resolve, 200))
  return provisionedNumbers
}

/**
 * Get provisioned numbers for a location
 */
export async function getLocationPhoneNumbers(
  locationId: string
): Promise<ProvisionedPhoneNumber[]> {
  console.log(`[Twilio Mock] Fetching numbers for location: ${locationId}`)
  await new Promise(resolve => setTimeout(resolve, 200))
  return provisionedNumbers.filter(n => n.locationId === locationId && n.status !== 'released')
}

/**
 * Get a single provisioned number
 */
export async function getProvisionedNumber(id: string): Promise<ProvisionedPhoneNumber | null> {
  console.log(`[Twilio Mock] Fetching number: ${id}`)
  await new Promise(resolve => setTimeout(resolve, 100))
  const number = provisionedNumbers.find(n => n.id === id)
  return number || null
}

/**
 * Update a provisioned number
 */
export async function updateProvisionedNumber(
  id: string,
  updates: {
    displayName?: string
    smsEnabled?: boolean
    voiceEnabled?: boolean
    locationId?: string
    locationName?: string
    assignedTo?: { id: string; name: string } | null
    tags?: string[]
    webhookUrl?: string
    purpose?: string
  }
): Promise<ProvisionedPhoneNumber | null> {
  console.log(`[Twilio Mock] Updating number: ${id}`, updates)

  const index = provisionedNumbers.findIndex(n => n.id === id)
  if (index === -1) return null

  const number = provisionedNumbers[index]

  // Apply updates
  if (updates.displayName !== undefined) number.displayName = updates.displayName
  if (updates.smsEnabled !== undefined) number.smsEnabled = updates.smsEnabled
  if (updates.voiceEnabled !== undefined) number.voiceEnabled = updates.voiceEnabled
  if (updates.locationId !== undefined) number.locationId = updates.locationId
  if (updates.locationName !== undefined) number.locationName = updates.locationName
  if (updates.assignedTo !== undefined) number.assignedTo = updates.assignedTo || undefined
  if (updates.tags !== undefined) number.tags = updates.tags
  if (updates.webhookUrl !== undefined) number.webhookUrl = updates.webhookUrl
  if (updates.purpose !== undefined)
    number.purpose = updates.purpose as 'sms' | 'voice' | 'both' | 'customer_support'

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  console.log(`[Twilio Mock] Updated number: ${id}`)
  return provisionedNumbers[index]
}

/**
 * Release a phone number
 */
export async function releasePhoneNumber(
  id: string,
  reason?: string
): Promise<ProvisionedPhoneNumber | null> {
  console.log(`[Twilio Mock] Releasing number: ${id}`, reason)

  const index = provisionedNumbers.findIndex(n => n.id === id)
  if (index === -1) return null

  const number = provisionedNumbers[index]
  number.status = 'released'
  number.releasedAt = new Date()

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400))

  console.log(`[Twilio Mock] Released number: ${id}`)
  return provisionedNumbers[index]
}

/**
 * Validate phone number format
 */
export function validatePhoneNumberFormat(phoneNumber: string): boolean {
  // E.164 format: +1NXXNXXXXXX
  const e164Regex = /^\+\d{1,15}$/
  return e164Regex.test(phoneNumber)
}

/**
 * Validate area code format
 */
export function validateAreaCode(areaCode: string): boolean {
  // US area codes are 3 digits, first digit 2-9, second digit 0-9, third digit 1-9
  const areaCodeRegex = /^[2-9]\d{2}$/
  return areaCodeRegex.test(areaCode)
}

/**
 * Format phone number for display
 */
export function formatPhoneNumberDisplay(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '')

  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `(${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
  }

  return phoneNumber
}

/**
 * Reset mock data (useful for testing)
 */
export function resetMockData(): void {
  provisionedNumbers = []
  console.log('[Twilio Mock] Reset all mock data')
}

/**
 * Seed mock data for testing/demo
 */
export function seedMockData(): void {
  const locations = [
    { id: 'loc-001', name: 'Downtown Clinic' },
    { id: 'loc-002', name: 'Westside Clinic' },
    { id: 'loc-003', name: 'Northgate Clinic' },
  ]

  provisionedNumbers = [
    {
      id: generateSID(),
      phoneNumber: '+14155551111',
      friendlyName: '(415) 555-1111',
      areaCode: '415',
      status: 'active',
      locationId: locations[0].id,
      locationName: locations[0].name,
      purpose: 'sms',
      sid: generateSID(),
      smsEnabled: true,
      voiceEnabled: false,
      monthlyRate: '1.00',
      provisionedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      displayName: 'Downtown - SMS Line',
      tags: ['appointments', 'reminders'],
    },
    {
      id: generateSID(),
      phoneNumber: '+14155552222',
      friendlyName: '(415) 555-2222',
      areaCode: '415',
      status: 'active',
      locationId: locations[0].id,
      locationName: locations[0].name,
      purpose: 'both',
      sid: generateSID(),
      smsEnabled: true,
      voiceEnabled: true,
      monthlyRate: '1.00',
      provisionedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      displayName: 'Downtown - Main Line',
      tags: ['main', 'customer_support'],
    },
    {
      id: generateSID(),
      phoneNumber: '+12125551111',
      friendlyName: '(212) 555-1111',
      areaCode: '212',
      status: 'active',
      locationId: locations[1].id,
      locationName: locations[1].name,
      purpose: 'sms',
      sid: generateSID(),
      smsEnabled: true,
      voiceEnabled: false,
      monthlyRate: '1.00',
      provisionedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      displayName: 'Westside - SMS',
      tags: ['appointments'],
    },
  ]

  console.log('[Twilio Mock] Seeded mock data with sample numbers')
}
