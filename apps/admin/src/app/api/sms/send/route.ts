import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, formatPhoneNumber, validatePhoneNumber } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, message, patientId, appointmentId, type } = body

    // Validate required fields
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Validate phone number
    const validation = await validatePhoneNumber(to)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid phone number', details: validation.error },
        { status: 400 }
      )
    }

    // Send SMS
    const result = await sendSMS(validation.formatted!, message)

    if (!result?.success) {
      return NextResponse.json(
        { error: 'Failed to send SMS', details: result?.error },
        { status: 500 }
      )
    }

    // Log message in database (in production)
    const messageLog = {
      id: result.messageId,
      to: validation.formatted,
      message,
      patientId,
      appointmentId,
      type: type || 'manual',
      status: result.status,
      sentAt: result.dateCreated,
    }

    // TODO: Save messageLog to database

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      status: result.status,
    })
  } catch (error: any) {
    console.error('SMS API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}