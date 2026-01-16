/**
 * GET /api/settings/phone-numbers - List all provisioned phone numbers, search available
 * POST /api/settings/phone-numbers - Provision a new phone number
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  searchAvailableNumbers,
  provisionPhoneNumber,
  getProvisionedNumbers,
  validateAreaCode,
  validatePhoneNumberFormat,
  seedMockData,
} from '@/lib/twilio-phone-numbers'
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response'

// Initialize mock data on first load
(async () => {
  try {
    const existing = await getProvisionedNumbers()
    if (!existing || existing.length === 0) {
      seedMockData()
    }
  } catch (e) {
    seedMockData()
  }
})()

// Validation schemas
const SearchPhoneNumbersSchema = z.object({
  areaCode: z.string().min(3).max(3),
  limit: z.number().int().min(1).max(50).optional(),
  smsCapable: z.boolean().optional(),
  voiceCapable: z.boolean().optional(),
})

const ProvisionPhoneNumberSchema = z.object({
  phoneNumber: z.string().min(10),
  locationId: z.string().min(1),
  locationName: z.string().min(1),
  purpose: z.enum(['sms', 'voice', 'both', 'customer_support']),
  smsEnabled: z.boolean().optional(),
  voiceEnabled: z.boolean().optional(),
  displayName: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
})

/**
 * GET handler - List provisioned numbers or search available
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Search for available numbers
    if (action === 'search') {
      const areaCode = searchParams.get('areaCode')
      const limit = searchParams.get('limit')

      if (!areaCode) {
        return NextResponse.json(
          apiError(
            ErrorCodes.MISSING_REQUIRED_FIELD,
            'Area code is required for search'
          ),
          { status: 400 }
        )
      }

      // Validate area code format
      if (!validateAreaCode(areaCode)) {
        return NextResponse.json(
          apiError(
            ErrorCodes.INVALID_INPUT,
            'Invalid area code format. Use 3-digit format (e.g., 415)'
          ),
          { status: 400 }
        )
      }

      console.log(`[API] Searching available numbers for area code: ${areaCode}`)

      const startTime = Date.now()
      const available = await searchAvailableNumbers(
        areaCode,
        limit ? parseInt(limit) : 5
      )
      const searchTime = Date.now() - startTime

      return NextResponse.json(
        apiSuccess({
          numbers: available,
          areaCode,
          totalAvailable: available.length,
          searchTime,
        })
      )
    }

    // Get all provisioned numbers (default)
    console.log('[API] Fetching all provisioned phone numbers')
    const provisioned = await getProvisionedNumbers()

    // Filter out released numbers by default
    const activeNumbers = provisioned.filter(n => n.status !== 'released')

    return NextResponse.json(
      apiSuccess({
        numbers: activeNumbers,
        total: activeNumbers.length,
      })
    )
  } catch (error: any) {
    console.error('[API] Phone numbers GET error:', error)
    return NextResponse.json(
      apiError(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to fetch phone numbers'
      ),
      { status: 500 }
    )
  }
}

/**
 * POST handler - Provision a new phone number
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validation = ProvisionPhoneNumberSchema.safeParse(body)
    if (!validation.success) {
      console.error('[API] Validation error:', validation.error.issues)
      return NextResponse.json(
        apiError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid request data',
          {
            issues: validation.error.issues.map(i => ({
              field: i.path.join('.'),
              message: i.message,
            })),
          }
        ),
        { status: 400 }
      )
    }

    const {
      phoneNumber,
      locationId,
      locationName,
      purpose,
      smsEnabled,
      voiceEnabled,
      displayName,
      webhookUrl,
      tags,
    } = validation.data

    // Validate phone number format
    if (!validatePhoneNumberFormat(phoneNumber)) {
      return NextResponse.json(
        apiError(
          ErrorCodes.INVALID_INPUT,
          'Phone number must be in E.164 format (e.g., +14155551234)'
        ),
        { status: 400 }
      )
    }

    console.log(`[API] Provisioning phone number: ${phoneNumber} for location: ${locationId}`)

    // Provision the number
    const provisioned = await provisionPhoneNumber(
      phoneNumber,
      locationId,
      locationName,
      purpose,
      displayName,
      webhookUrl,
      tags
    )

    return NextResponse.json(
      apiSuccess(provisioned),
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[API] Phone numbers POST error:', error)
    return NextResponse.json(
      apiError(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to provision phone number'
      ),
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler - CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
