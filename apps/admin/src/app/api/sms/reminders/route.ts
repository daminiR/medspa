import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, smsTemplates, formatPhoneNumber, scheduleSMS } from '@/lib/twilio'

// This would run on a cron job in production
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, appointments } = body

    if (!type || !appointments || !Array.isArray(appointments)) {
      return NextResponse.json(
        { error: 'Invalid request. Type and appointments array required.' },
        { status: 400 }
      )
    }

    const results = []
    
    for (const appointment of appointments) {
      const { 
        patientName, 
        patientPhone, 
        appointmentDate, 
        appointmentTime, 
        service,
        appointmentId,
        patientId 
      } = appointment

      if (!patientPhone) {
        results.push({
          appointmentId,
          success: false,
          error: 'No phone number for patient'
        })
        continue
      }

      let message = ''
      
      switch (type) {
        case 'confirmation':
          message = smsTemplates.appointmentConfirmation(
            patientName, 
            appointmentDate, 
            appointmentTime, 
            service
          )
          break
          
        case 'reminder_48hr':
          message = smsTemplates.appointmentReminder48hr(
            patientName, 
            appointmentDate, 
            appointmentTime, 
            service
          )
          break
          
        case 'reminder_24hr':
          message = smsTemplates.appointmentReminder24hr(
            patientName, 
            appointmentDate, 
            appointmentTime
          )
          break
          
        case 'reminder_2hr':
          message = smsTemplates.appointmentReminder2hr(
            patientName, 
            appointmentTime
          )
          break
          
        case 'no_show':
          message = smsTemplates.noShowFollowUp(patientName)
          break
          
        case 'post_treatment':
          message = smsTemplates.postTreatmentFollowUp(patientName, service)
          break
          
        default:
          results.push({
            appointmentId,
            success: false,
            error: 'Invalid reminder type'
          })
          continue
      }

      const result = await sendSMS(formatPhoneNumber(patientPhone), message)
      
      results.push({
        appointmentId,
        patientId,
        success: result?.success || false,
        messageId: result?.messageId,
        error: result?.error
      })

      // Log reminder sent in database
      if (result?.success) {
        // TODO: Update appointment reminder status in database
      }
    }

    return NextResponse.json({
      success: true,
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      results
    })
    
  } catch (error: any) {
    console.error('Reminder API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to check which appointments need reminders
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reminderType = searchParams.get('type')
  
  // In production, this would query the database for appointments
  // that need reminders based on the type and timing
  
  const mockAppointments = [
    {
      appointmentId: '1',
      patientId: 'p1',
      patientName: 'Sarah Johnson',
      patientPhone: '555-123-4567',
      appointmentDate: '2024-01-15',
      appointmentTime: '2:00 PM',
      service: 'Botox',
      remindersSent: {
        confirmation: true,
        reminder_48hr: false,
        reminder_24hr: false,
        reminder_2hr: false
      }
    }
  ]
  
  // Filter appointments based on reminder type and timing
  type ReminderKey = keyof typeof mockAppointments[0]['remindersSent']
  const appointmentsNeedingReminders = mockAppointments.filter(apt => {
    if (reminderType && !apt.remindersSent[reminderType as ReminderKey]) {
      // Check timing logic here
      return true
    }
    return false
  })
  
  return NextResponse.json({
    type: reminderType,
    appointments: appointmentsNeedingReminders
  })
}