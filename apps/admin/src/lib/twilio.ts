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

  // TODO: Add calendar link to SMS confirmations
  // When implementing, add a new template like:
  // appointmentConfirmationWithCalendar: (patientName: string, date: string, time: string, service: string, calendarLink: string) =>
  //   `Hi ${patientName}, your ${service} appointment is confirmed for ${date} at ${time}. ` +
  //   `Add to calendar: ${calendarLink} | Reply C to confirm or R to reschedule.`
  // Example calendarLink: "https://spa.com/cal/{appointmentId}" - short link that redirects to calendar export

  expressBookingExpired: (patientName: string) =>
    `Hi ${patientName}, your booking link has expired. Please call us at 555-0100 to reschedule.`,

  // Group Booking Templates
  groupBookingConfirmation: (
    patientName: string,
    groupName: string,
    date: string,
    time: string,
    serviceName: string,
    totalParticipants: number
  ) =>
    `Hi ${patientName}! Your ${serviceName} is confirmed as part of "${groupName}" (${totalParticipants} guests) on ${date} at ${time}. Reply C to confirm. Call 555-0100 to reschedule.`,

  groupBookingCoordinatorConfirmation: (
    coordinatorName: string,
    groupName: string,
    date: string,
    participantCount: number,
    totalPrice: string,
    discountPercent: number
  ) =>
    `Hi ${coordinatorName}! "${groupName}" is confirmed for ${date} with ${participantCount} guests. Total: $${totalPrice} (${discountPercent}% group discount applied!). Call 555-0100 for any changes.`,

  groupBookingReminder: (
    patientName: string,
    groupName: string,
    date: string,
    time: string
  ) =>
    `Reminder: Your appointment as part of "${groupName}" is tomorrow at ${time}. Please arrive 10 min early. See you soon!`,

  groupBookingCoordinatorReminder: (
    coordinatorName: string,
    groupName: string,
    date: string,
    participantCount: number
  ) =>
    `Hi ${coordinatorName}! Reminder: "${groupName}" is scheduled for tomorrow with ${participantCount} guests. Please ensure everyone is informed. See you soon!`,

  groupCheckInRequest: (
    patientName: string,
    groupName: string
  ) =>
    `Hi ${patientName}! Arriving for "${groupName}"? Reply HERE when you arrive and we'll get you checked in with your group!`,

  groupBookingCancellation: (
    patientName: string,
    groupName: string,
    date: string
  ) =>
    `Hi ${patientName}, your "${groupName}" booking on ${date} has been cancelled. Call 555-0100 to rebook.`,

  groupBookingModification: (
    patientName: string,
    groupName: string,
    changeDescription: string
  ) =>
    `Hi ${patientName}! Your "${groupName}" booking has been updated: ${changeDescription}. Call 555-0100 with questions.`,

  // ============================================================================
  // WAITLIST SMS TEMPLATES
  // ============================================================================

  /**
   * When a slot opens up for a waitlisted patient
   * Includes one-click accept via YES reply and secure web link
   */
  waitlistSlotAvailable: (
    patientName: string,
    service: string,
    practitioner: string,
    date: string,
    time: string,
    expiryTime: string,
    offerLink: string
  ) =>
    `Hi ${patientName}! ${service} slot open with ${practitioner} on ${date} at ${time}. Reply YES to book or NO to skip. Expires in ${expiryTime}. Or tap: ${offerLink}`,

  /**
   * Confirmation after patient accepts waitlist offer
   */
  waitlistOfferAccepted: (
    patientName: string,
    service: string,
    date: string,
    time: string,
    calendarLink: string
  ) =>
    `Confirmed! ${patientName}, your ${service} is booked for ${date} at ${time}. You've been removed from the waitlist. Add to calendar: ${calendarLink}`,

  /**
   * After patient declines the waitlist offer
   */
  waitlistOfferDeclined: (patientName: string, service: string) =>
    `Thanks for letting us know, ${patientName}. You're still on the waitlist for ${service}. We'll text you when another slot opens!`,

  /**
   * When a waitlist offer expires without response
   */
  waitlistOfferExpired: (patientName: string, service: string) =>
    `Hi ${patientName}, the ${service} slot has expired. Don't worry - you're still on the waitlist and we'll notify you of the next opening!`,

  /**
   * Periodic check-in for patients on waitlist (7 days)
   */
  waitlistReminder: (
    patientName: string,
    service: string,
    daysWaiting: number
  ) =>
    `Hi ${patientName}! You've been on our waitlist for ${service} for ${daysWaiting} days. We're working to find you a spot! Reply REMOVE to be taken off the list.`,

  /**
   * Confirmation when patient is added to waitlist
   */
  waitlistAdded: (
    patientName: string,
    service: string,
    practitioner?: string
  ) =>
    practitioner
      ? `Welcome to our waitlist, ${patientName}! You're waiting for ${service} with ${practitioner}. We'll text you when a slot opens. Reply REMOVE anytime to opt out.`
      : `Welcome to our waitlist, ${patientName}! You're waiting for ${service}. We'll text you when a slot opens. Reply REMOVE anytime to opt out.`,

  /**
   * Confirmation when patient is removed from waitlist
   */
  waitlistRemoved: (patientName: string, service: string) =>
    `Hi ${patientName}, you've been removed from the ${service} waitlist. To book a regular appointment, call 555-0100 or visit our website.`,

  /**
   * Optional transparency update on waitlist position
   */
  waitlistPositionUpdate: (
    patientName: string,
    service: string,
    position: number
  ) =>
    `Hi ${patientName}! Update: You're now #${position} in line for ${service}. We'll text you as soon as a slot opens!`,

  /**
   * When patient replies YES but slot was already taken (race condition)
   */
  waitlistSlotTaken: (patientName: string, service: string) =>
    `We're so sorry, ${patientName}! That ${service} slot was just filled. You're still on our waitlist with priority, and we'll notify you as soon as another opening becomes available.`,

  /**
   * When patient asks for waitlist status
   */
  waitlistStatus: (
    patientName: string,
    position: number,
    total: number,
    services: string,
    estimatedWait: string
  ) =>
    `Hi ${patientName}! You're #${position} of ${total} on our waitlist for: ${services}. ${estimatedWait}. We'll text you when an opening matches your preferences. Reply REMOVE to leave the waitlist.`,

  /**
   * When no pending offer exists for a YES response
   */
  waitlistNoPendingOffer: () =>
    `We don't have a pending appointment offer for you at this time. If you received an offer, it may have expired. Reply STATUS to check your waitlist position.`,

  /**
   * When patient not found on waitlist
   */
  waitlistNotFound: () =>
    `We don't have you on our waitlist. To join, please call us at 555-0100 or ask at your next visit.`,

  // ============================================================================
  // RESCHEDULE INTELLIGENCE SMS TEMPLATES
  // ============================================================================

  /**
   * When patient initiates reschedule - offer available slots
   * Slots are numbered 1-5 for easy selection
   */
  rescheduleSlotOffer: (
    patientName: string,
    serviceName: string,
    providerName: string,
    slotsText: string,
    expiryMinutes: number = 10
  ) =>
    `Hi ${patientName}! Let's reschedule your ${serviceName} with ${providerName}.\n\nAvailable times:\n${slotsText}\n\nReply with a number (1-5) to select, or CALL to speak with staff. Expires in ${expiryMinutes} min.`,

  /**
   * Reschedule confirmation after patient selects a slot
   */
  rescheduleConfirmed: (
    patientName: string,
    serviceName: string,
    oldDate: string,
    newDate: string,
    newTime: string,
    providerName: string
  ) =>
    `Done! Your ${serviceName} has been rescheduled from ${oldDate} to ${newDate} at ${newTime} with ${providerName}. See you then!`,

  /**
   * When no upcoming appointment found for reschedule request
   */
  rescheduleNoAppointment: (patientName: string) =>
    `Hi ${patientName}, we couldn't find an upcoming appointment to reschedule. Please call us at 555-0100 for help.`,

  /**
   * When no availability found for the provider
   */
  rescheduleNoAvailability: (patientName: string, serviceName: string) =>
    `Hi ${patientName}, we couldn't find available times to reschedule your ${serviceName} in the next 2 weeks. Please call us at 555-0100 and we'll help find a time.`,

  /**
   * When patient sends invalid selection (not 1-5)
   */
  rescheduleInvalidSelection: (patientName: string, maxOption: number) =>
    `Hi ${patientName}, please reply with a number between 1 and ${maxOption} to select a time, or CALL to speak with staff.`,

  /**
   * When reschedule offer has expired
   */
  rescheduleExpired: (patientName: string) =>
    `Hi ${patientName}, your reschedule options have expired. Reply R to get new available times, or call us at 555-0100.`,

  /**
   * When selected slot is no longer available (race condition)
   */
  rescheduleSlotTaken: (patientName: string) =>
    `Sorry ${patientName}, that time was just booked! Reply R to see updated availability.`,

  /**
   * Late reschedule warning (within 24 hours)
   */
  rescheduleLateWarning: (
    patientName: string,
    feeAmount: string,
    originalTime: string
  ) =>
    `Hi ${patientName}, since your appointment at ${originalTime} is within 24 hours, a $${feeAmount} late reschedule fee may apply. Reply YES to proceed or CALL to discuss.`,

  // ============================================================================
  // FORM AUTOMATION SMS TEMPLATES
  // ============================================================================

  /**
   * Initial form request when appointment is booked
   */
  formsRequired: (
    patientName: string,
    serviceName: string,
    formNames: string[],
    formsLink: string,
    estimatedTime: string
  ) => {
    const formList = formNames.join(', ');
    return `Hi ${patientName}! Please complete these forms before your ${serviceName} appointment: ${formList}. ` +
      `Takes ${estimatedTime}. Tap to complete: ${formsLink}. Questions? Reply to this text.`;
  },

  /**
   * 72-hour form reminder (gentle)
   */
  formReminder72hr: (
    patientName: string,
    serviceName: string,
    formNames: string[],
    formsLink: string
  ) => {
    const firstName = patientName.split(' ')[0];
    const formList = formNames.join(', ');
    return `Hi ${firstName}! Just a reminder to complete your forms before your ${serviceName} appointment: ${formList}. ` +
      `Tap here: ${formsLink}`;
  },

  /**
   * 24-hour form reminder (urgent)
   */
  formReminder24hr: (
    patientName: string,
    serviceName: string,
    appointmentTime: string,
    formNames: string[],
    formsLink: string
  ) => {
    const firstName = patientName.split(' ')[0];
    const formList = formNames.join(', ');
    return `Reminder: Your ${serviceName} is tomorrow at ${appointmentTime}! Please complete: ${formList}. ` +
      `This helps us prepare for your visit: ${formsLink}`;
  },

  /**
   * Check-in with incomplete forms
   */
  checkInIncomplete: (
    patientName: string,
    appointmentTime: string,
    formNames: string[],
    formsLink: string,
    queueInfo?: { position: number; waitingCount: number }
  ) => {
    const firstName = patientName.split(' ')[0];
    const formList = formNames.join(', ');
    let queueText = '';
    if (queueInfo && queueInfo.position > 0) {
      if (queueInfo.position === 1) {
        queueText = " You're next in line!";
      } else {
        const estimatedWait = (queueInfo.position - 1) * 10;
        queueText = ` You're #${queueInfo.position} of ${queueInfo.waitingCount} (~${estimatedWait} min wait).`;
      }
    }
    return `Thanks ${firstName}! Before your ${appointmentTime} appointment, please complete: ${formList}. ` +
      `Tap here: ${formsLink}.${queueText} We'll text when your room is ready!`;
  },

  /**
   * Check-in with all forms complete
   */
  checkInComplete: (
    patientName: string,
    appointmentTime: string,
    queueInfo?: { position: number; waitingCount: number }
  ) => {
    const firstName = patientName.split(' ')[0];
    let queueText = '';
    if (queueInfo && queueInfo.position > 0) {
      if (queueInfo.position === 1) {
        queueText = " You're next in line!";
      } else {
        const estimatedWait = (queueInfo.position - 1) * 10;
        queueText = ` You're #${queueInfo.position} of ${queueInfo.waitingCount} (~${estimatedWait} min wait).`;
      }
    }
    return `Thanks ${firstName}! All forms complete. We know you're here for your ${appointmentTime} appointment.${queueText} ` +
      `We'll text you when your room is ready. Please wait in your car.`;
  },

  /**
   * Aftercare instructions sent post-treatment
   */
  aftercareInstructions: (
    patientName: string,
    serviceName: string,
    aftercareLink: string
  ) => {
    const firstName = patientName.split(' ')[0];
    return `Hi ${firstName}! Here are your ${serviceName} aftercare instructions: ${aftercareLink}. ` +
      `Questions? Reply to this text or call us at 555-0100.`;
  },
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
  } else if (['HERE', 'ARRIVED', 'IM HERE', "I'M HERE"].includes(normalizedBody)) {
    return { action: 'checkin' }
  }

  return { action: 'unknown', originalMessage: messageBody }
}

// ============================================================================
// GROUP SMS FUNCTIONS
// ============================================================================

export interface GroupSMSRecipient {
  patientId: string
  patientName: string
  phone: string
  isCoordinator: boolean
  serviceName?: string
  startTime?: Date
}

export interface GroupSMSOptions {
  groupId: string
  groupName: string
  date: Date
  totalParticipants: number
  totalPrice?: number
  discountPercent?: number
  recipients: GroupSMSRecipient[]
}

/**
 * Send confirmation SMS to all group booking participants
 */
export async function sendGroupConfirmationSMS(options: GroupSMSOptions) {
  const { groupName, date, totalParticipants, totalPrice, discountPercent, recipients } = options
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const results: Array<{ patientId: string; patientName: string; success: boolean; error?: string }> = []

  for (const recipient of recipients) {
    if (!recipient.phone) {
      results.push({ patientId: recipient.patientId, patientName: recipient.patientName, success: false, error: 'No phone number' })
      continue
    }

    let message: string

    if (recipient.isCoordinator && totalPrice !== undefined && discountPercent !== undefined) {
      message = smsTemplates.groupBookingCoordinatorConfirmation(
        recipient.patientName,
        groupName,
        dateStr,
        totalParticipants,
        totalPrice.toFixed(2),
        discountPercent
      )
    } else {
      const timeStr = recipient.startTime
        ? recipient.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : ''
      message = smsTemplates.groupBookingConfirmation(
        recipient.patientName,
        groupName,
        dateStr,
        timeStr,
        recipient.serviceName || 'appointment',
        totalParticipants
      )
    }

    const result = await sendSMS(formatPhoneNumber(recipient.phone), message)
    results.push({
      patientId: recipient.patientId,
      patientName: recipient.patientName,
      success: result.success,
      error: result.error
    })
  }

  return {
    totalSent: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    results
  }
}

/**
 * Send reminder SMS to all group booking participants
 */
export async function sendGroupReminderSMS(options: GroupSMSOptions) {
  const { groupName, date, totalParticipants, recipients } = options
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const results: Array<{ patientId: string; patientName: string; success: boolean; error?: string }> = []

  for (const recipient of recipients) {
    if (!recipient.phone) {
      results.push({ patientId: recipient.patientId, patientName: recipient.patientName, success: false, error: 'No phone number' })
      continue
    }

    let message: string

    if (recipient.isCoordinator) {
      message = smsTemplates.groupBookingCoordinatorReminder(
        recipient.patientName,
        groupName,
        dateStr,
        totalParticipants
      )
    } else {
      const timeStr = recipient.startTime
        ? recipient.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : ''
      message = smsTemplates.groupBookingReminder(
        recipient.patientName,
        groupName,
        dateStr,
        timeStr
      )
    }

    const result = await sendSMS(formatPhoneNumber(recipient.phone), message)
    results.push({
      patientId: recipient.patientId,
      patientName: recipient.patientName,
      success: result.success,
      error: result.error
    })
  }

  return {
    totalSent: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    results
  }
}

/**
 * Send check-in request SMS to all group booking participants
 */
export async function sendGroupCheckInRequestSMS(options: Pick<GroupSMSOptions, 'groupName' | 'recipients'>) {
  const { groupName, recipients } = options

  const results: Array<{ patientId: string; patientName: string; success: boolean; error?: string }> = []

  for (const recipient of recipients) {
    if (!recipient.phone) {
      results.push({ patientId: recipient.patientId, patientName: recipient.patientName, success: false, error: 'No phone number' })
      continue
    }

    const message = smsTemplates.groupCheckInRequest(recipient.patientName, groupName)
    const result = await sendSMS(formatPhoneNumber(recipient.phone), message)
    results.push({
      patientId: recipient.patientId,
      patientName: recipient.patientName,
      success: result.success,
      error: result.error
    })
  }

  return {
    totalSent: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    results
  }
}

/**
 * Send cancellation SMS to all group booking participants
 */
export async function sendGroupCancellationSMS(options: Pick<GroupSMSOptions, 'groupName' | 'date' | 'recipients'>) {
  const { groupName, date, recipients } = options
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const results: Array<{ patientId: string; patientName: string; success: boolean; error?: string }> = []

  for (const recipient of recipients) {
    if (!recipient.phone) {
      results.push({ patientId: recipient.patientId, patientName: recipient.patientName, success: false, error: 'No phone number' })
      continue
    }

    const message = smsTemplates.groupBookingCancellation(recipient.patientName, groupName, dateStr)
    const result = await sendSMS(formatPhoneNumber(recipient.phone), message)
    results.push({
      patientId: recipient.patientId,
      patientName: recipient.patientName,
      success: result.success,
      error: result.error
    })
  }

  return {
    totalSent: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    results
  }
}

/**
 * Send modification SMS to all group booking participants
 */
export async function sendGroupModificationSMS(
  options: Pick<GroupSMSOptions, 'groupName' | 'recipients'> & { changeDescription: string }
) {
  const { groupName, recipients, changeDescription } = options

  const results: Array<{ patientId: string; patientName: string; success: boolean; error?: string }> = []

  for (const recipient of recipients) {
    if (!recipient.phone) {
      results.push({ patientId: recipient.patientId, patientName: recipient.patientName, success: false, error: 'No phone number' })
      continue
    }

    const message = smsTemplates.groupBookingModification(recipient.patientName, groupName, changeDescription)
    const result = await sendSMS(formatPhoneNumber(recipient.phone), message)
    results.push({
      patientId: recipient.patientId,
      patientName: recipient.patientName,
      success: result.success,
      error: result.error
    })
  }

  return {
    totalSent: results.filter(r => r.success).length,
    totalFailed: results.filter(r => !r.success).length,
    results
  }
}

// ============================================================================
// WAITLIST SMS FUNCTIONS
// ============================================================================

/**
 * WaitlistOffer represents a time-limited offer for a waitlisted patient
 */
export interface WaitlistOffer {
  id: string
  token: string
  patientId: string
  waitlistEntryId: string
  serviceName: string
  practitionerName: string
  appointmentDate: Date
  appointmentTime: string
  expiresAt: Date
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: Date
}

/**
 * Settings for waitlist SMS operations
 */
export interface WaitlistSMSSettings {
  domain: string
  expiryMinutes: number
  calendarLinkBase?: string
}

/**
 * SMS compliance log entry for HIPAA audit trail
 */
export interface SMSComplianceLog {
  id?: string
  phone: string
  message: string
  direction: 'inbound' | 'outbound'
  purpose: string
  twilioSid?: string
  timestamp: Date
  patientId?: string
  appointmentId?: string
  waitlistEntryId?: string
}

/**
 * Creates a secure link for accepting a waitlist offer via web
 * @param offerToken - Unique token for the waitlist offer
 * @param domain - The base domain for the link
 * @returns Full URL for the waitlist offer acceptance page
 */
export function createWaitlistOfferLink(offerToken: string, domain: string): string {
  // Ensure domain has protocol
  const normalizedDomain = domain.startsWith('http') ? domain : `https://${domain}`
  // Remove trailing slash if present
  const cleanDomain = normalizedDomain.replace(/\/$/, '')
  return `${cleanDomain}/waitlist/offer/${offerToken}`
}

/**
 * Formats the time remaining until an offer expires in a human-readable format
 * @param expiresAt - The expiration date/time
 * @returns Formatted string like "30 min" or "1 hr 15 min"
 */
export function formatOfferExpiryTime(expiresAt: Date): string {
  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()

  // If already expired
  if (diff <= 0) return 'expired'

  const minutes = Math.floor(diff / 60000)

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} hr`
  }

  return `${hours} hr ${remainingMinutes} min`
}

/**
 * Sends a waitlist offer SMS to a patient when a slot becomes available
 * @param patient - Patient information including name and phone
 * @param offer - The waitlist offer details
 * @param settings - Configuration including domain and expiry time
 * @returns Result object with success status, optional SID, and error message
 */
export async function sendWaitlistOffer(
  patient: { name: string; phone: string },
  offer: WaitlistOffer,
  settings: WaitlistSMSSettings
): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    // Format the date and time for display
    const dateStr = offer.appointmentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })

    // Create the offer link
    const offerLink = createWaitlistOfferLink(offer.token, settings.domain)

    // Calculate expiry time string
    const expiryTime = formatOfferExpiryTime(offer.expiresAt)

    // Generate the SMS message
    const message = smsTemplates.waitlistSlotAvailable(
      patient.name,
      offer.serviceName,
      offer.practitionerName,
      dateStr,
      offer.appointmentTime,
      expiryTime,
      offerLink
    )

    // Send the SMS
    const result = await sendSMS(formatPhoneNumber(patient.phone), message)

    // Log for compliance
    await logSMSForCompliance(
      patient.phone,
      message,
      'outbound',
      'waitlist_offer',
      result.success ? result.messageId : undefined
    )

    if (result.success) {
      return {
        success: true,
        sid: result.messageId
      }
    } else {
      return {
        success: false,
        error: result.error
      }
    }
  } catch (error: any) {
    console.error('Error sending waitlist offer SMS:', error)
    return {
      success: false,
      error: error.message || 'Unknown error sending waitlist offer SMS'
    }
  }
}

/**
 * Logs SMS messages for HIPAA compliance and audit trail
 * In production, this would write to a secure database
 * @param phone - The phone number involved
 * @param message - The SMS message content
 * @param direction - Whether the message was inbound or outbound
 * @param purpose - The business purpose of the message
 * @param twilioSid - Optional Twilio message SID for tracking
 */
export async function logSMSForCompliance(
  phone: string,
  message: string,
  direction: 'inbound' | 'outbound',
  purpose: string,
  twilioSid?: string
): Promise<void> {
  const logEntry: SMSComplianceLog = {
    phone: formatPhoneNumber(phone),
    message,
    direction,
    purpose,
    twilioSid,
    timestamp: new Date()
  }

  // In production, this would:
  // 1. Write to a secure, encrypted database table
  // 2. Include additional metadata (IP address, user agent for web, etc.)
  // 3. Be retained according to HIPAA retention policies (typically 6 years)
  // 4. Be included in audit reports

  // For now, we log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[SMS Compliance Log]', {
      timestamp: logEntry.timestamp.toISOString(),
      direction: logEntry.direction,
      purpose: logEntry.purpose,
      phone: logEntry.phone.slice(0, -4) + '****', // Mask phone for console
      twilioSid: logEntry.twilioSid,
      messageLength: logEntry.message.length
    })
  }

  // TODO: In production, implement actual database logging:
  // await db.smsComplianceLogs.create({ data: logEntry })
}

/**
 * Sends confirmation SMS after patient accepts a waitlist offer
 */
export async function sendWaitlistOfferAcceptedSMS(
  patient: { name: string; phone: string },
  service: string,
  date: Date,
  time: string,
  settings: WaitlistSMSSettings
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  // Generate calendar link (would typically include appointment ID)
  const calendarLink = settings.calendarLinkBase
    ? `${settings.calendarLinkBase}/calendar/add`
    : `${settings.domain}/calendar/add`

  const message = smsTemplates.waitlistOfferAccepted(
    patient.name,
    service,
    dateStr,
    time,
    calendarLink
  )

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'waitlist_offer_accepted',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Sends SMS after patient declines a waitlist offer
 */
export async function sendWaitlistOfferDeclinedSMS(
  patient: { name: string; phone: string },
  service: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.waitlistOfferDeclined(patient.name, service)

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'waitlist_offer_declined',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Sends SMS when a waitlist offer expires
 */
export async function sendWaitlistOfferExpiredSMS(
  patient: { name: string; phone: string },
  service: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.waitlistOfferExpired(patient.name, service)

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'waitlist_offer_expired',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Sends periodic reminder to patients on waitlist
 */
export async function sendWaitlistReminderSMS(
  patient: { name: string; phone: string },
  service: string,
  daysWaiting: number
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.waitlistReminder(patient.name, service, daysWaiting)

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'waitlist_reminder',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Sends confirmation when patient is added to waitlist
 */
export async function sendWaitlistAddedSMS(
  patient: { name: string; phone: string },
  service: string,
  practitioner?: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.waitlistAdded(patient.name, service, practitioner)

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'waitlist_added',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Sends confirmation when patient is removed from waitlist
 */
export async function sendWaitlistRemovedSMS(
  patient: { name: string; phone: string },
  service: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.waitlistRemoved(patient.name, service)

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'waitlist_removed',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Sends position update to patient on waitlist (optional transparency feature)
 */
export async function sendWaitlistPositionUpdateSMS(
  patient: { name: string; phone: string },
  service: string,
  position: number
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.waitlistPositionUpdate(patient.name, service, position)

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'waitlist_position_update',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Parses waitlist-specific SMS responses from patients
 */
export function parseWaitlistResponse(messageBody: string): {
  action: 'accept' | 'decline' | 'remove' | 'unknown'
  originalMessage: string
} {
  const normalizedBody = messageBody.trim().toUpperCase()

  if (['YES', 'Y', 'BOOK', 'CONFIRM', 'ACCEPT'].includes(normalizedBody)) {
    return { action: 'accept', originalMessage: messageBody }
  }

  if (['NO', 'N', 'SKIP', 'DECLINE', 'PASS'].includes(normalizedBody)) {
    return { action: 'decline', originalMessage: messageBody }
  }

  if (['REMOVE', 'STOP', 'CANCEL', 'UNSUBSCRIBE', 'OFF'].includes(normalizedBody)) {
    return { action: 'remove', originalMessage: messageBody }
  }

  return { action: 'unknown', originalMessage: messageBody }
}

// ============================================================================
// RESCHEDULE INTELLIGENCE SMS FUNCTIONS
// ============================================================================

/**
 * Parses reschedule-specific SMS responses
 * Handles: R/reschedule intent, numeric selection (1-5), CALL fallback
 */
export function parseRescheduleResponse(messageBody: string): {
  action: 'reschedule_intent' | 'slot_selection' | 'call_request' | 'unknown'
  slotNumber?: number
  originalMessage: string
} {
  const normalizedBody = messageBody.trim().toUpperCase()

  // Check for reschedule intent
  if (['R', 'RESCHEDULE', 'CHANGE', 'MOVE'].includes(normalizedBody)) {
    return { action: 'reschedule_intent', originalMessage: messageBody }
  }

  // Check for call request
  if (['CALL', 'PHONE', 'HELP', 'STAFF'].includes(normalizedBody)) {
    return { action: 'call_request', originalMessage: messageBody }
  }

  // Check for numeric slot selection (1-5)
  const numMatch = normalizedBody.match(/^(\d)$/)
  if (numMatch) {
    const num = parseInt(numMatch[1], 10)
    if (num >= 1 && num <= 5) {
      return { action: 'slot_selection', slotNumber: num, originalMessage: messageBody }
    }
  }

  return { action: 'unknown', originalMessage: messageBody }
}

/**
 * Sends slot offer SMS for reschedule
 */
export async function sendRescheduleSlotOfferSMS(
  patient: { name: string; phone: string },
  serviceName: string,
  providerName: string,
  slotsText: string,
  expiryMinutes: number = 30
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.rescheduleSlotOffer(
    patient.name,
    serviceName,
    providerName,
    slotsText,
    expiryMinutes
  )

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'reschedule_slot_offer',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Sends confirmation SMS after successful reschedule
 */
export async function sendRescheduleConfirmedSMS(
  patient: { name: string; phone: string },
  serviceName: string,
  oldDate: string,
  newDate: string,
  newTime: string,
  providerName: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.rescheduleConfirmed(
    patient.name,
    serviceName,
    oldDate,
    newDate,
    newTime,
    providerName
  )

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'reschedule_confirmed',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Sends SMS when no appointment found for reschedule
 */
export async function sendRescheduleNoAppointmentSMS(
  patient: { name: string; phone: string }
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.rescheduleNoAppointment(patient.name)

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'reschedule_no_appointment',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Sends SMS when no availability found
 */
export async function sendRescheduleNoAvailabilitySMS(
  patient: { name: string; phone: string },
  serviceName: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.rescheduleNoAvailability(patient.name, serviceName)

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'reschedule_no_availability',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Sends SMS for invalid slot selection
 */
export async function sendRescheduleInvalidSelectionSMS(
  patient: { name: string; phone: string },
  maxOption: number
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.rescheduleInvalidSelection(patient.name, maxOption)

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'reschedule_invalid_selection',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Sends SMS when reschedule offer has expired
 */
export async function sendRescheduleExpiredSMS(
  patient: { name: string; phone: string }
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.rescheduleExpired(patient.name)

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'reschedule_expired',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}

/**
 * Sends SMS when selected slot was taken (race condition)
 */
export async function sendRescheduleSlotTakenSMS(
  patient: { name: string; phone: string }
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const message = smsTemplates.rescheduleSlotTaken(patient.name)

  const result = await sendSMS(formatPhoneNumber(patient.phone), message)

  await logSMSForCompliance(
    patient.phone,
    message,
    'outbound',
    'reschedule_slot_taken',
    result.success ? result.messageId : undefined
  )

  return {
    success: result.success,
    sid: result.success ? result.messageId : undefined,
    error: result.error
  }
}