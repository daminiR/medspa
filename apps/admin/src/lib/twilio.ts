import twilio from 'twilio'

// Twilio configuration
export const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
}

// Initialize Twilio client
export const twilioClient = twilioConfig.accountSid && twilioConfig.authToken 
  ? twilio(twilioConfig.accountSid, twilioConfig.authToken)
  : null

// SMS Templates for Medical Spa
export const smsTemplates = {
  appointmentConfirmation: (patientName: string, date: string, time: string, service: string) => 
    `Hi ${patientName}, your ${service} appointment is confirmed for ${date} at ${time}. Reply C to confirm or R to reschedule. - [Clinic Name]`,
  
  appointmentReminder48hr: (patientName: string, date: string, time: string, service: string) => 
    `Hi ${patientName}, reminder: You have a ${service} appointment on ${date} at ${time}. Reply C to confirm. Call us at 555-0100 to reschedule.`,
  
  appointmentReminder24hr: (patientName: string, date: string, time: string) => 
    `Reminder: Your appointment is tomorrow at ${time}. Please arrive with a clean face. Avoid alcohol & blood thinners 24hrs before. See you soon!`,
  
  appointmentReminder2hr: (patientName: string, time: string) => 
    `Hi ${patientName}, see you soon at ${time} today! If you're running late, please call us at 555-0100.`,
  
  noShowFollowUp: (patientName: string) => 
    `Hi ${patientName}, we missed you at your appointment today. Please call us at 555-0100 to reschedule. We hope everything is okay!`,
  
  postTreatmentFollowUp: (patientName: string, treatment: string) => 
    `Hi ${patientName}, how are you feeling after your ${treatment} treatment? If you have any concerns, please don't hesitate to call us at 555-0100.`,
  
  treatmentInstructions: {
    botox: `Post-Botox care: No lying down for 4hrs, avoid exercise for 24hrs, no rubbing the area. Results visible in 3-7 days, full effect at 2 weeks.`,
    filler: `Post-Filler care: Apply ice for swelling, avoid exercise for 24hrs, sleep elevated. Swelling/bruising normal for 3-5 days.`,
    chemical_peel: `Post-Peel care: Keep skin moisturized, use gentle cleanser, apply SPF 30+, avoid direct sun. Peeling normal for 3-7 days.`,
    microneedling: `Post-Microneedling care: No makeup for 24hrs, gentle skincare only, apply SPF daily. Redness normal for 2-3 days.`,
    laser: `Post-Laser care: Apply ice if needed, use gentle products, SPF 30+ daily, avoid sun exposure. Redness may last 3-5 days.`,
  },
  
  birthdayGreeting: (patientName: string) => 
    `Happy Birthday ${patientName}! 🎉 Enjoy 20% off any treatment this month. Call 555-0100 to book. - [Clinic Name]`,
  
  membershipReminder: (patientName: string, credits: number) => 
    `Hi ${patientName}, you have ${credits} treatment credits remaining this month. Book now to use them: [booking link]`,
  
  reviewRequest: (patientName: string) => 
    `Hi ${patientName}, thank you for choosing us! We'd love your feedback. Please leave a review: [review link]`,
  
  packageExpiring: (patientName: string, packageName: string, daysLeft: number) =>
    `Hi ${patientName}, your ${packageName} package expires in ${daysLeft} days. Book your remaining sessions: [booking link]`,

  // Express Booking templates
  expressBookingInvite: (patientName: string, serviceName: string, date: string, time: string, link: string, expiryMinutes: number) =>
    `Hi ${patientName}! Complete your ${serviceName} booking for ${date} at ${time}. Tap to confirm: ${link} (expires in ${expiryMinutes} min)`,

  expressBookingConfirmed: (patientName: string, serviceName: string, date: string, time: string) =>
    `Confirmed! Your ${serviceName} appointment is booked for ${date} at ${time}. We look forward to seeing you!`,

  expressBookingExpired: (patientName: string) =>
    `Hi ${patientName}, your booking link has expired. Please call us at 555-0100 to reschedule.`,
}

// Send SMS function
export async function sendSMS(to: string, body: string, mediaUrl?: string) {
  if (!twilioClient) {
    console.error('Twilio client not initialized. Check environment variables.')
    console.error('Config check:', {
      hasAccountSid: !!twilioConfig.accountSid,
      hasAuthToken: !!twilioConfig.authToken && twilioConfig.authToken !== 'your_auth_token_here',
      authTokenValue: twilioConfig.authToken === 'your_auth_token_here' ? 'NOT SET - using placeholder' : 'configured',
    })
    return {
      success: false,
      error: 'Twilio not configured. Please add your TWILIO_AUTH_TOKEN to .env.local'
    }
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      to,
      from: twilioConfig.phoneNumber,
      ...(mediaUrl && { mediaUrl: [mediaUrl] })
    })
    
    return {
      success: true,
      messageId: message.sid,
      status: message.status,
      dateCreated: message.dateCreated,
    }
  } catch (error: any) {
    console.error('Error sending SMS:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Send bulk SMS
export async function sendBulkSMS(recipients: Array<{ to: string; body: string }>) {
  if (!twilioClient) {
    console.error('Twilio client not initialized')
    return []
  }

  const results = await Promise.allSettled(
    recipients.map(({ to, body }) => sendSMS(to, body))
  )

  return results.map((result, index) => ({
    to: recipients[index].to,
    ...(result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }),
  }))
}

// Format phone number for Twilio (E.164 format)
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Add country code if not present (assuming US/Canada)
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }
  
  // Return as-is if already in correct format or international
  return phone.startsWith('+') ? phone : `+${cleaned}`
}

// Validate phone number
export async function validatePhoneNumber(phone: string) {
  if (!twilioClient) {
    return { valid: false, error: 'Twilio not configured' }
  }

  // For development/trial, skip validation and just format
  // In production, use Lookups API
  if (process.env.NODE_ENV === 'development') {
    const formatted = formatPhoneNumber(phone);
    return {
      valid: true,
      formatted: formatted,
      countryCode: 'US',
      nationalFormat: formatted,
    }
  }

  try {
    const phoneNumber = await twilioClient.lookups.v2
      .phoneNumbers(formatPhoneNumber(phone))
      .fetch()
    
    return {
      valid: phoneNumber.valid,
      formatted: phoneNumber.phoneNumber,
      countryCode: phoneNumber.countryCode,
      nationalFormat: phoneNumber.nationalFormat,
    }
  } catch (error: any) {
    // If lookup fails, still try to format and send
    console.warn('Phone validation failed, using basic formatting:', error.message)
    const formatted = formatPhoneNumber(phone);
    return {
      valid: true, // Assume valid to allow sending
      formatted: formatted,
      error: error.message,
    }
  }
}

// Schedule SMS (would integrate with a job queue in production)
export async function scheduleSMS(
  to: string, 
  body: string, 
  scheduledTime: Date,
  appointmentId?: string
) {
  // In production, this would integrate with a job queue like Bull or Agenda
  // For now, we'll just calculate the delay and use setTimeout (not recommended for production)
  
  const delay = scheduledTime.getTime() - Date.now()
  
  if (delay <= 0) {
    // Send immediately if scheduled time is in the past
    return sendSMS(to, body)
  }
  
  // Store scheduled messages in database in production
  // For demo purposes, we'll just schedule with setTimeout
  setTimeout(async () => {
    await sendSMS(to, body)
    // Update appointment reminder status in database
  }, delay)
  
  return {
    success: true,
    scheduledFor: scheduledTime,
    appointmentId,
  }
}

// Get message status
export async function getMessageStatus(messageSid: string) {
  if (!twilioClient) {
    return null
  }

  try {
    const message = await twilioClient.messages(messageSid).fetch()
    return {
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
    }
  } catch (error: any) {
    console.error('Error fetching message status:', error)
    return null
  }
}

// Handle incoming SMS webhook
export function handleIncomingSMS(body: any) {
  const { From, To, Body, MessageSid, NumMedia, MediaUrl0 } = body
  
  return {
    from: From,
    to: To,
    body: Body,
    messageSid: MessageSid,
    hasMedia: NumMedia > 0,
    mediaUrl: MediaUrl0,
    receivedAt: new Date(),
  }
}

// Parse appointment confirmation responses
export function parseAppointmentResponse(messageBody: string) {
  const normalizedBody = messageBody.trim().toUpperCase()
  
  if (['C', 'CONFIRM', 'YES', 'Y'].includes(normalizedBody)) {
    return { action: 'confirm' }
  } else if (['R', 'RESCHEDULE', 'CHANGE'].includes(normalizedBody)) {
    return { action: 'reschedule' }
  } else if (['CANCEL', 'NO', 'N'].includes(normalizedBody)) {
    return { action: 'cancel' }
  }
  
  return { action: 'unknown', originalMessage: messageBody }
}