import { NextRequest, NextResponse } from 'next/server'
import { handleIncomingSMS, parseAppointmentResponse, sendSMS } from '@/lib/twilio'
import { aiAssistant } from '@/lib/ai-assistant'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const body = Object.fromEntries(formData)

    // Parse incoming SMS
    const incomingMessage = handleIncomingSMS(body)

    // Check for "HERE" message (Virtual Waiting Room check-in)
    const messageBody = incomingMessage.body.trim().toUpperCase()
    if (messageBody.includes('HERE')) {
      // Import appointments and update function
      const { appointments, updateAppointmentWaitingRoomStatus } = await import('@/lib/data')

      // Find today's appointment for this phone number
      const normalizedPhone = incomingMessage.from.replace(/\D/g, '')
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todaysAppointment = appointments.find(apt => {
        const aptDate = new Date(apt.startTime)
        aptDate.setHours(0, 0, 0, 0)
        const aptPhone = apt.phone?.replace(/\D/g, '') || ''

        return (
          aptDate.getTime() === today.getTime() &&
          aptPhone.includes(normalizedPhone.slice(-10)) && // Match last 10 digits
          (apt.status === 'scheduled' || apt.status === 'confirmed') &&
          (!apt.waitingRoomStatus || apt.waitingRoomStatus === 'not_arrived')
        )
      })

      if (todaysAppointment) {
        // Check in the patient
        updateAppointmentWaitingRoomStatus(
          todaysAppointment.id,
          'in_car',
          {
            arrivalTime: new Date(),
            priority: 0
          }
        )

        const firstName = todaysAppointment.patientName.split(' ')[0]
        const time = new Date(todaysAppointment.startTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        })

        const replyMessage = `Thanks ${firstName}! We know you're here for your ${time} appointment. We'll text you when your room is ready. Please wait in your car.`
        await sendSMS(incomingMessage.from, replyMessage)

        console.log(`Virtual Waiting Room: ${todaysAppointment.patientName} checked in`)
        return new NextResponse(null, { status: 200 })
      } else {
        const replyMessage = "We couldn't find an appointment for today with this number. Please call us at 555-0100 if you need help."
        await sendSMS(incomingMessage.from, replyMessage)
        return new NextResponse(null, { status: 200 })
      }
    }

    // First, try basic response parsing for simple commands
    const basicResponse = parseAppointmentResponse(incomingMessage.body)
    
    // Get patient ID from phone number (in production, query database)
    const patientId = await getPatientIdByPhone(incomingMessage.from)
    
    // Process with AI for intelligent response
    const aiAnalysis = await aiAssistant.processMessage(
      incomingMessage.body,
      patientId || 'unknown',
      'sms'
    )
    
    // Determine response strategy
    let replyMessage = ''
    let requiresStaffNotification = false
    
    // If it's a simple confirmation/reschedule, handle immediately
    if (basicResponse.action !== 'unknown' && aiAnalysis.intent.confidence > 0.8) {
      switch (basicResponse.action) {
        case 'confirm':
          replyMessage = aiAnalysis.suggestedResponses[0] || 'Thank you for confirming your appointment. See you soon!'
          await updateAppointmentStatus(patientId, 'confirmed')
          break
          
        case 'reschedule':
          replyMessage = aiAnalysis.suggestedResponses[0] || 'To reschedule, please call us at 555-0100 or visit our online booking.'
          requiresStaffNotification = true
          break
          
        case 'cancel':
          replyMessage = 'Your appointment has been cancelled. Please call 555-0100 if you\'d like to rebook.'
          await updateAppointmentStatus(patientId, 'cancelled')
          requiresStaffNotification = true
          break
      }
    } 
    // For complex messages, use AI suggestions
    else {
      // Check urgency and human intervention needs
      if (aiAnalysis.urgency === 'high' || aiAnalysis.requiresHuman) {
        requiresStaffNotification = true
        
        // Send acknowledgment if urgent
        if (aiAnalysis.urgency === 'high') {
          replyMessage = 'We\'ve received your message and will respond immediately. If this is an emergency, please call 555-0100 or 911.'
        } else {
          replyMessage = aiAnalysis.suggestedResponses[0] || 'Thank you for your message. A team member will respond shortly.'
        }
      }
      // Auto-respond for low-urgency, high-confidence intents
      else if (aiAnalysis.intent.confidence > 0.85 && aiAnalysis.urgency === 'low') {
        replyMessage = aiAnalysis.suggestedResponses[0] || ''
      }
      // Default to manual review
      else {
        requiresStaffNotification = true
        replyMessage = 'Thank you for your message. A team member will respond during business hours.'
      }
    }
    
    // Create comprehensive message log
    const messageLog = {
      from: incomingMessage.from,
      to: incomingMessage.to,
      body: incomingMessage.body,
      messageSid: incomingMessage.messageSid,
      hasMedia: incomingMessage.hasMedia,
      mediaUrl: incomingMessage.mediaUrl,
      receivedAt: incomingMessage.receivedAt,
      patientId,
      aiAnalysis: {
        intent: aiAnalysis.intent.type,
        confidence: aiAnalysis.intent.confidence,
        urgency: aiAnalysis.urgency,
        requiresHuman: aiAnalysis.requiresHuman,
        suggestedActions: aiAnalysis.suggestedActions
      },
      responseAction: basicResponse.action,
      autoReplySent: !!replyMessage,
      autoReplyMessage: replyMessage
    }
    
    // Save to database
    await saveMessageLog(messageLog)
    
    // Create staff notification if needed
    if (requiresStaffNotification) {
      await createStaffNotification({
        type: aiAnalysis.urgency === 'high' ? 'urgent' : 'normal',
        patientId,
        patientPhone: incomingMessage.from,
        message: incomingMessage.body,
        intent: aiAnalysis.intent,
        suggestedResponses: aiAnalysis.suggestedResponses,
        suggestedActions: aiAnalysis.suggestedActions
      })
    }
    
    // Send auto-reply if determined
    if (replyMessage) {
      await sendSMS(incomingMessage.from, replyMessage)
    }
    
    // Twilio expects a 200 response
    return new NextResponse(null, { status: 200 })
  } catch (error: any) {
    console.error('Webhook Error:', error)
    // Still return 200 to prevent Twilio retries
    return new NextResponse(null, { status: 200 })
  }
}

// Helper functions (in production, these would be in a service/repository)
async function getPatientIdByPhone(phone: string): Promise<string | null> {
  // TODO: Query database to find patient by phone number
  // For now, return mock data
  const mockPatients = {
    '+15551234567': 'p1',
    '+15552345678': 'p2',
    '+15553456789': 'p3'
  }
  return mockPatients[phone] || null
}

async function updateAppointmentStatus(patientId: string, status: string): Promise<void> {
  // TODO: Update appointment status in database
  console.log(`Updating appointment for patient ${patientId} to ${status}`)
}

async function saveMessageLog(messageLog: any): Promise<void> {
  // TODO: Save message to database
  console.log('Saving message log:', messageLog)
}

async function createStaffNotification(notification: any): Promise<void> {
  // TODO: Create notification for staff dashboard
  // Could use WebSocket, push notification, or database flag
  console.log('Creating staff notification:', notification)
  
  // If urgent, could also trigger additional alerts
  if (notification.type === 'urgent') {
    // Send email/SMS to on-call staff
    // Trigger dashboard alert
    // Log to incident tracking
  }
}