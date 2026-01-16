/**
 * Calendar Export API Endpoint
 *
 * GET /api/appointment/export?appointmentId=X
 *
 * Generates and serves an RFC 5545 compliant .ics file for the specified appointment.
 *
 * Security:
 * - Validates appointment ID
 * - Sanitizes all user input before ICS generation
 *
 * Headers:
 * - Content-Type: text/calendar; charset=utf-8
 * - Content-Disposition: attachment; filename="appointment-{id}.ics"
 *
 * Test Cases:
 * 1. Valid appointment ID - returns .ics file
 * 2. Missing appointment ID - returns 400 error
 * 3. Invalid appointment ID - returns 404 error
 * 4. Appointment without practitioner - returns 404 error
 */

import { NextRequest, NextResponse } from 'next/server'
import { appointments, practitioners, locations } from '@/lib/data'
import { generateICS, ICSAppointmentData } from '@/lib/ics-generator'

export async function GET(request: NextRequest) {
  try {
    // Extract appointment ID from query params
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    // Validate appointment ID is provided
    if (!appointmentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: appointmentId'
        },
        { status: 400 }
      )
    }

    // Sanitize appointment ID (prevent injection)
    const sanitizedId = appointmentId.replace(/[^a-zA-Z0-9-_]/g, '')
    if (sanitizedId !== appointmentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid appointment ID format'
        },
        { status: 400 }
      )
    }

    // Find the appointment
    const appointment = appointments.find(apt => apt.id === sanitizedId)

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Appointment not found'
        },
        { status: 404 }
      )
    }

    // Find the practitioner
    const practitioner = practitioners.find(p => p.id === appointment.practitionerId)

    if (!practitioner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Practitioner not found for this appointment'
        },
        { status: 404 }
      )
    }

    // Find the location (optional)
    const location = appointment.locationId
      ? locations.find(l => l.id === appointment.locationId)
      : locations[0] // Default to first location if not specified

    // Prepare ICS data
    const icsData: ICSAppointmentData = {
      appointment,
      practitioner,
      location,
      // These would typically come from environment or clinic settings
      clinicName: process.env.CLINIC_NAME || 'Medical Spa',
      clinicPhone: process.env.CLINIC_PHONE || '(555) 0100',
      clinicEmail: process.env.CLINIC_EMAIL || 'appointments@medicalspa.com'
    }

    // Generate ICS content
    const icsContent = generateICS(icsData)

    // Create response with proper headers for file download
    const response = new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="appointment-${sanitizedId}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    return response
  } catch (error) {
    console.error('Calendar export error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate calendar file'
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint for generating ICS data without file download
 * Useful for client-side generation or preview
 *
 * Body: { appointmentId: string }
 * Returns: { success: boolean, icsContent?: string, calendarLinks?: object }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId } = body

    // Validate appointment ID is provided
    if (!appointmentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: appointmentId'
        },
        { status: 400 }
      )
    }

    // Sanitize appointment ID
    const sanitizedId = String(appointmentId).replace(/[^a-zA-Z0-9-_]/g, '')

    // Find the appointment
    const appointment = appointments.find(apt => apt.id === sanitizedId)

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Appointment not found'
        },
        { status: 404 }
      )
    }

    // Find the practitioner
    const practitioner = practitioners.find(p => p.id === appointment.practitionerId)

    if (!practitioner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Practitioner not found'
        },
        { status: 404 }
      )
    }

    // Find the location
    const location = appointment.locationId
      ? locations.find(l => l.id === appointment.locationId)
      : locations[0]

    // Import calendar link generators
    const {
      generateICS,
      generateGoogleCalendarLink,
      generateOutlookCalendarLink,
      generateYahooCalendarLink
    } = await import('@/lib/ics-generator')

    const icsData: ICSAppointmentData = {
      appointment,
      practitioner,
      location
    }

    // Generate all calendar data
    const icsContent = generateICS(icsData)
    const googleLink = generateGoogleCalendarLink(icsData)
    const outlookLink = generateOutlookCalendarLink(icsData)
    const yahooLink = generateYahooCalendarLink(icsData)

    return NextResponse.json({
      success: true,
      icsContent,
      calendarLinks: {
        google: googleLink,
        outlook: outlookLink,
        yahoo: yahooLink,
        ics: `/api/appointment/export?appointmentId=${sanitizedId}`
      }
    })
  } catch (error) {
    console.error('Calendar data generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate calendar data'
      },
      { status: 500 }
    )
  }
}
