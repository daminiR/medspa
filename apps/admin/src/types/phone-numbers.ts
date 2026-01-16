/**
 * Phone Number Management Types
 * Defines types for Twilio phone number provisioning and location management
 */

/**
 * Phone number status
 */
export type PhoneNumberStatus = 'available' | 'provisioned' | 'active' | 'inactive' | 'released' | 'failed'

/**
 * Available phone number from search
 */
export interface AvailablePhoneNumber {
  /** E.164 formatted number (e.g., "+14155552671") */
  phoneNumber: string
  /** Friendly number format (e.g., "(415) 555-2671") */
  friendlyName: string
  /** Area code */
  areaCode: string
  /** ISO country code (e.g., "US") */
  countryCode: string
  /** LATA (Local Access and Transport Area) code */
  lata?: string
  /** Rate center */
  rateCenter?: string
  /** Whether SMS capability is available */
  capabilities: {
    sms: boolean
    voice: boolean
    mms: boolean
  }
  /** Cost per month in USD (string with 2 decimals) */
  cost: string
  /** Unique identifier for provisioning */
  id?: string
}

/**
 * Provisioned phone number owned by clinic
 */
export interface ProvisionedPhoneNumber {
  /** Unique identifier (Twilio SID) */
  id: string
  /** E.164 formatted number */
  phoneNumber: string
  /** Friendly name format */
  friendlyName: string
  /** Area code */
  areaCode: string
  /** Current status */
  status: PhoneNumberStatus
  /** Location/clinic assigned to */
  locationId: string
  /** Location name */
  locationName: string
  /** Assigned staff member (if any) */
  assignedTo?: {
    id: string
    name: string
  }
  /** Purpose/use case */
  purpose: 'sms' | 'voice' | 'both' | 'customer_support'
  /** Twilio SID for API calls */
  sid: string
  /** Whether SMS is enabled */
  smsEnabled: boolean
  /** Whether voice is enabled */
  voiceEnabled: boolean
  /** Account cost per month (USD string) */
  monthlyRate: string
  /** When number was provisioned */
  provisionedAt: Date
  /** When number is released (null if still active) */
  releasedAt?: Date
  /** Custom display name for UI */
  displayName?: string
  /** Tags for categorization */
  tags?: string[]
  /** Webhook URL for incoming messages */
  webhookUrl?: string
}

/**
 * Request to search for available phone numbers
 */
export interface SearchPhoneNumbersRequest {
  /** Area code (3 digits, US only for now) */
  areaCode: string
  /** Limit number of results */
  limit?: number
  /** SMS capability required */
  smsCapable?: boolean
  /** Voice capability required */
  voiceCapable?: boolean
  /** Exclude these numbers */
  exclude?: string[]
}

/**
 * Response with available phone numbers
 */
export interface SearchPhoneNumbersResponse {
  success: boolean
  data?: {
    numbers: AvailablePhoneNumber[]
    areaCode: string
    totalAvailable: number
    searchTime: number // ms
  }
  error?: string
}

/**
 * Request to provision a phone number
 */
export interface ProvisionPhoneNumberRequest {
  /** Phone number to provision (E.164 format) */
  phoneNumber: string
  /** Location/clinic to assign to */
  locationId: string
  /** Location name */
  locationName: string
  /** Purpose of the number */
  purpose: 'sms' | 'voice' | 'both' | 'customer_support'
  /** Enable SMS capability */
  smsEnabled?: boolean
  /** Enable voice capability */
  voiceEnabled?: boolean
  /** Display name for UI */
  displayName?: string
  /** Webhook URL for incoming messages */
  webhookUrl?: string
  /** Tags */
  tags?: string[]
}

/**
 * Response from provisioning
 */
export interface ProvisionPhoneNumberResponse {
  success: boolean
  data?: ProvisionedPhoneNumber
  error?: string
}

/**
 * Request to update a phone number
 */
export interface UpdatePhoneNumberRequest {
  /** New display name */
  displayName?: string
  /** Enable/disable SMS */
  smsEnabled?: boolean
  /** Enable/disable voice */
  voiceEnabled?: boolean
  /** Reassign to location */
  locationId?: string
  /** Assign to staff member */
  assignedTo?: string
  /** Update tags */
  tags?: string[]
  /** Update webhook URL */
  webhookUrl?: string
  /** Update purpose */
  purpose?: 'sms' | 'voice' | 'both' | 'customer_support'
}

/**
 * Response from updating
 */
export interface UpdatePhoneNumberResponse {
  success: boolean
  data?: ProvisionedPhoneNumber
  error?: string
}

/**
 * Request to release a phone number
 */
export interface ReleasePhoneNumberRequest {
  /** Reason for release */
  reason?: string
  /** Whether to immediately stop accepting messages */
  immediate?: boolean
}

/**
 * Response from releasing
 */
export interface ReleasePhoneNumberResponse {
  success: boolean
  data?: {
    id: string
    phoneNumber: string
    status: 'released'
    releasedAt: Date
  }
  error?: string
}

/**
 * Location phone number assignment
 */
export interface LocationPhoneNumbers {
  /** Location ID */
  locationId: string
  /** Location name */
  locationName: string
  /** Primary phone number */
  primaryNumber?: ProvisionedPhoneNumber
  /** All assigned numbers */
  numbers: ProvisionedPhoneNumber[]
  /** Total assigned */
  count: number
}

/**
 * Phone number import batch
 */
export interface PhoneNumberImport {
  /** Numbers to import (E.164 format) */
  phoneNumbers: string[]
  /** Location to assign to */
  locationId: string
  /** Batch display name */
  batchName?: string
  /** Tags to apply to all */
  tags?: string[]
}

/**
 * Mock Twilio phone number data structure
 */
export interface TwilioPhoneNumberData {
  sid: string
  accountSid: string
  friendlyName: string
  phoneNumber: string
  localNumberFormat?: string
  internationalFormat?: string
  addressRequirements: 'none' | 'any' | 'local' | 'foreign'
  beta: boolean
  capabilities: {
    voice: boolean
    sms: boolean
    mms: boolean
    fax: boolean
  }
  dateCreated: Date
  dateUpdated: Date
  dateReleased?: Date
  subresourceUris?: Record<string, string>
}
