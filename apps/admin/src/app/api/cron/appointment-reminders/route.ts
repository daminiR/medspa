import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, smsTemplates, formatPhoneNumber } from '@/lib/twilio'
import { addHours, addDays, isWithinInterval } from 'date-fns'

// This would be called by a cron job service like Vercel Cron or a separate scheduler
// In production, you'd query your database for appointments
export async function GET(request: NextRequest) {
  try {
    // Verify this is an authorized cron request (in production, check a secret)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    interface ReminderResult {
      appointmentId: string
      patientId: string
      success: boolean
      messageId?: string
    }

    const results: {
      '48hr': ReminderResult[]
      '24hr': ReminderResult[]
      '2hr': ReminderResult[]
      postTreatment: ReminderResult[]
      noShow: ReminderResult[]
    } = {
      '48hr': [],
      '24hr': [],
      '2hr': [],
      postTreatment: [],
      noShow: []
    }

    // Mock appointment data - in production, query your database
    const appointments = [
      {
        id: 'apt-1',
        patientId: 'p1',
        patientName: 'Sarah Johnson',
        patientPhone: '+15551234567',
        patientEmail: 'sarah@email.com',
        appointmentDate: addDays(now, 2), // 2 days from now
        service: 'Botox',
        provider: 'Dr. Smith',
        duration: 30,
        smsOptIn: true,
        remindersSent: {
          confirmation: true,
          '48hr': false,
          '24hr': false,
          '2hr': false
        }
      },
      {
        id: 'apt-2',
        patientId: 'p2',
        patientName: 'Michael Chen',
        patientPhone: '+15552345678',
        patientEmail: 'michael@email.com',
        appointmentDate: addDays(now, 1), // Tomorrow
        service: 'Filler',
        provider: 'Dr. Johnson',
        duration: 45,
        smsOptIn: true,
        remindersSent: {
          confirmation: true,
          '48hr': true,
          '24hr': false,
          '2hr': false
        }
      },
      {
        id: 'apt-3',
        patientId: 'p3',
        patientName: 'Emily Rodriguez',
        patientPhone: '+15553456789',
        patientEmail: 'emily@email.com',
        appointmentDate: addHours(now, 2), // 2 hours from now
        service: 'Chemical Peel',
        provider: 'Sarah RN',
        duration: 60,
        smsOptIn: true,
        remindersSent: {
          confirmation: true,
          '48hr': true,
          '24hr': true,
          '2hr': false
        }
      }
    ]

    // Check each appointment for needed reminders
    for (const apt of appointments) {
      if (!apt.smsOptIn || !apt.patientPhone) continue

      const timeUntilAppointment = apt.appointmentDate.getTime() - now.getTime()
      const hoursUntil = timeUntilAppointment / (1000 * 60 * 60)

      // 48-hour reminder
      if (hoursUntil <= 48 && hoursUntil > 47 && !apt.remindersSent['48hr']) {
        const message = smsTemplates.appointmentReminder48hr(
          apt.patientName.split(' ')[0],
          apt.appointmentDate.toLocaleDateString(),
          apt.appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          apt.service
        )
        
        const result = await sendSMS(formatPhoneNumber(apt.patientPhone), message)
        results['48hr'].push({
          appointmentId: apt.id,
          patientId: apt.patientId,
          success: result?.success || false,
          messageId: result?.messageId
        })
        
        // Update database to mark reminder as sent
        // await updateAppointmentReminder(apt.id, '48hr')
      }

      // 24-hour reminder
      if (hoursUntil <= 24 && hoursUntil > 23 && !apt.remindersSent['24hr']) {
        const message = smsTemplates.appointmentReminder24hr(
          apt.patientName.split(' ')[0],
          apt.appointmentDate.toLocaleDateString(),
          apt.appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        )
        
        const result = await sendSMS(formatPhoneNumber(apt.patientPhone), message)
        results['24hr'].push({
          appointmentId: apt.id,
          patientId: apt.patientId,
          success: result?.success || false,
          messageId: result?.messageId
        })
      }

      // 2-hour reminder
      if (hoursUntil <= 2 && hoursUntil > 1.5 && !apt.remindersSent['2hr']) {
        const message = smsTemplates.appointmentReminder2hr(
          apt.patientName.split(' ')[0],
          apt.appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        )
        
        const result = await sendSMS(formatPhoneNumber(apt.patientPhone), message)
        results['2hr'].push({
          appointmentId: apt.id,
          patientId: apt.patientId,
          success: result?.success || false,
          messageId: result?.messageId
        })
      }
    }

    // Check for no-shows (appointments that were 1 hour ago with no arrival)
    const noShowAppointments = appointments.filter(apt => {
      const hoursSince = (now.getTime() - apt.appointmentDate.getTime()) / (1000 * 60 * 60)
      return hoursSince >= 1 && hoursSince <= 2 // && !apt.arrived && !apt.noShowMessageSent
    })

    for (const apt of noShowAppointments) {
      if (!apt.smsOptIn || !apt.patientPhone) continue
      
      const message = smsTemplates.noShowFollowUp(apt.patientName.split(' ')[0])
      const result = await sendSMS(formatPhoneNumber(apt.patientPhone), message)
      
      results.noShow.push({
        appointmentId: apt.id,
        patientId: apt.patientId,
        success: result?.success || false,
        messageId: result?.messageId
      })
    }

    // Check for post-treatment follow-ups (24 hours after appointment)
    const postTreatmentAppointments = appointments.filter(apt => {
      const hoursSince = (now.getTime() - apt.appointmentDate.getTime()) / (1000 * 60 * 60)
      return hoursSince >= 24 && hoursSince <= 25 // && apt.completed && !apt.postTreatmentMessageSent
    })

    for (const apt of postTreatmentAppointments) {
      if (!apt.smsOptIn || !apt.patientPhone) continue
      
      const message = smsTemplates.postTreatmentFollowUp(
        apt.patientName.split(' ')[0],
        apt.service
      )
      const result = await sendSMS(formatPhoneNumber(apt.patientPhone), message)
      
      results.postTreatment.push({
        appointmentId: apt.id,
        patientId: apt.patientId,
        success: result?.success || false,
        messageId: result?.messageId
      })
    }

    // Calculate summary
    const summary = {
      totalSent: Object.values(results).flat().filter(r => r.success).length,
      totalFailed: Object.values(results).flat().filter(r => !r.success).length,
      byType: {
        '48hr': results['48hr'].filter(r => r.success).length,
        '24hr': results['24hr'].filter(r => r.success).length,
        '2hr': results['2hr'].filter(r => r.success).length,
        noShow: results.noShow.filter(r => r.success).length,
        postTreatment: results.postTreatment.filter(r => r.success).length,
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      summary,
      results
    })
    
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Manual trigger endpoint for testing
export async function POST(request: NextRequest) {
  // In production, ensure this is properly secured
  const body = await request.json()
  const { appointmentId, reminderType } = body

  if (!appointmentId || !reminderType) {
    return NextResponse.json(
      { error: 'appointmentId and reminderType required' },
      { status: 400 }
    )
  }

  // Mock appointment lookup - in production, query database
  const appointment = {
    id: appointmentId,
    patientName: 'Test Patient',
    patientPhone: '+15551234567',
    appointmentDate: new Date(),
    service: 'Botox',
    smsOptIn: true
  }

  if (!appointment.smsOptIn || !appointment.patientPhone) {
    return NextResponse.json(
      { error: 'Patient has not opted in to SMS or no phone number' },
      { status: 400 }
    )
  }

  let message = ''
  
  switch (reminderType) {
    case 'confirmation':
      message = smsTemplates.appointmentConfirmation(
        appointment.patientName,
        appointment.appointmentDate.toLocaleDateString(),
        appointment.appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        appointment.service
      )
      break
    case '48hr':
      message = smsTemplates.appointmentReminder48hr(
        appointment.patientName,
        appointment.appointmentDate.toLocaleDateString(),
        appointment.appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        appointment.service
      )
      break
    case '24hr':
      message = smsTemplates.appointmentReminder24hr(
        appointment.patientName,
        appointment.appointmentDate.toLocaleDateString(),
        appointment.appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      )
      break
    case '2hr':
      message = smsTemplates.appointmentReminder2hr(
        appointment.patientName,
        appointment.appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      )
      break
    default:
      return NextResponse.json(
        { error: 'Invalid reminder type' },
        { status: 400 }
      )
  }

  const result = await sendSMS(formatPhoneNumber(appointment.patientPhone), message)
  
  return NextResponse.json({
    success: result?.success || false,
    messageId: result?.messageId,
    error: result?.error
  })
}