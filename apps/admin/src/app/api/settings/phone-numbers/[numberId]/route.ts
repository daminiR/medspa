/**
 * GET /api/settings/phone-numbers/[numberId] - Get phone number details
 * PUT /api/settings/phone-numbers/[numberId] - Update phone number settings
 * DELETE /api/settings/phone-numbers/[numberId] - Release phone number
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getProvisionedNumber,
  updateProvisionedNumber,
  releasePhoneNumber,
} from '@/lib/twilio-phone-numbers'
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response'

// Validation schemas
const UpdatePhoneNumberSchema = z.object({
  displayName: z.string().optional(),
  smsEnabled: z.boolean().optional(),
  voiceEnabled: z.boolean().optional(),
  locationId: z.string().optional(),
  locationName: z.string().optional(),
  assignedTo: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional()
    .nullable(),
  tags: z.array(z.string()).optional(),
  webhookUrl: z.string().url().optional(),
  purpose: z.enum(['sms', 'voice', 'both', 'customer_support']).optional(),
})

const ReleasePhoneNumberSchema = z.object({
  reason: z.string().optional(),
  immediate: z.boolean().optional(),
})

/**
 * GET handler - Get phone number details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ numberId: string }> }
) {
  try {
    const { numberId } = await params

    console.log(`[API] Fetching phone number details: ${numberId}`)

    const number = await getProvisionedNumber(numberId)
    if (!number) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Phone number not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(apiSuccess(number))
  } catch (error: any) {
    console.error('[API] Phone number GET error:', error)
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch phone number'),
      { status: 500 }
    )
  }
}

/**
 * PUT handler - Update phone number settings
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ numberId: string }> }
) {
  try {
    const { numberId } = await params
    const body = await request.json()

    // Validate request
    const validation = UpdatePhoneNumberSchema.safeParse(body)
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

    console.log(`[API] Updating phone number: ${numberId}`, validation.data)

    // Check if number exists
    const existing = await getProvisionedNumber(numberId)
    if (!existing) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Phone number not found'),
        { status: 404 }
      )
    }

    // Cannot update released numbers
    if (existing.status === 'released') {
      return NextResponse.json(
        apiError(
          ErrorCodes.INVALID_INPUT,
          'Cannot update a released phone number'
        ),
        { status: 400 }
      )
    }

    // Apply updates
    const updated = await updateProvisionedNumber(numberId, validation.data)

    if (!updated) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Phone number not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(apiSuccess(updated))
  } catch (error: any) {
    console.error('[API] Phone number PUT error:', error)
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'Failed to update phone number'),
      { status: 500 }
    )
  }
}

/**
 * DELETE handler - Release phone number
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ numberId: string }> }
) {
  try {
    const { numberId } = await params

    // Get optional reason from query or body
    let reason: string | undefined
    const { searchParams } = new URL(request.url)
    reason = searchParams.get('reason') || undefined

    // Try to get from body as well
    if (!reason) {
      try {
        const body = await request.json()
        if (body.reason) {
          reason = body.reason
        }
      } catch {
        // No body, that's fine
      }
    }

    console.log(`[API] Releasing phone number: ${numberId}`, { reason })

    // Check if number exists
    const existing = await getProvisionedNumber(numberId)
    if (!existing) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Phone number not found'),
        { status: 404 }
      )
    }

    // Cannot release already released numbers
    if (existing.status === 'released') {
      return NextResponse.json(
        apiError(
          ErrorCodes.INVALID_INPUT,
          'This phone number has already been released'
        ),
        { status: 400 }
      )
    }

    // Release the number
    const released = await releasePhoneNumber(numberId, reason)

    if (!released) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Phone number not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      apiSuccess({
        id: released.id,
        phoneNumber: released.phoneNumber,
        status: released.status,
        releasedAt: released.releasedAt,
      })
    )
  } catch (error: any) {
    console.error('[API] Phone number DELETE error:', error)
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'Failed to release phone number'),
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
