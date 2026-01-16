import { NextRequest, NextResponse } from 'next/server'
import { handleIncomingSMS, parseAppointmentResponse, sendSMS, formatPhoneNumber } from '@/lib/twilio'
import { aiAssistant } from '@/lib/ai-assistant'
// Proactive AI Processing
import { processIncomingMessage } from '@/services/ai/gemini-messaging-service'
import { storeAIResponse } from '@/lib/firestore/ai-responses'
import { appointments, services, practitioners } from '@/lib/data'
import { handleCheckInFormValidation } from '@/services/forms/formService'

// Emergency/Complication Routing
import { handleComplicationAlert, type ComplicationAlert } from '@/services/alerts/complicationAlertService'
import { generateComplicationResponse, generateUrgentAcknowledgment } from '@/services/alerts/complicationResponder'
import { findRecentTreatment, findPatientIdByPhone as lookupPatientByPhone } from '@/lib/data/treatmentLookup'
import {
  WaitlistOffer,
  WaitlistEntry,
  waitlistOffers,
  waitlistEntries,
  findPendingOfferByPhone,
  findWaitlistEntriesByPhone,
  isSlotStillAvailable,
  getWaitlistPosition,
  removeFromWaitlist
} from '@/lib/waitlist-offers'
import {
  createStaffNotification as createNotification,
  createWaitlistNotification,
  createCheckInNotification,
} from '@/lib/notifications/notificationStore'

// Reschedule Intelligence imports
import {
  createRescheduleConversation,
  getRescheduleConversation,
  getOfferedSlot,
  confirmReschedule,
  cancelRescheduleConversation,
  formatSlotsForSMS,
  normalizePhoneNumber,
  OfferedSlot
} from '@/lib/conversationState'
import {
  findUpcomingAppointmentByPhone,
  getNextAvailableSlots,
  rescheduleAppointment,
  isLateReschedule as checkLateReschedule,
  getPractitionerById,
  getWaitingRoomQueue
} from '@/lib/data'
import {
  parseRescheduleResponse,
  sendRescheduleSlotOfferSMS,
  sendRescheduleConfirmedSMS,
  sendRescheduleNoAppointmentSMS,
  sendRescheduleNoAvailabilitySMS,
  sendRescheduleInvalidSelectionSMS,
  sendRescheduleSlotTakenSMS
} from '@/lib/twilio'

// ============================================================================
// WAITLIST OFFER RESPONSE TYPES
// ============================================================================

interface SMSResponse {
  type: 'waitlist_accept' | 'waitlist_decline' | 'waitlist_remove' | 'waitlist_status' | 'unknown'
  action: string
  success: boolean
  message: string
  staffNotification?: string
}

// ============================================================================
// WAITLIST RESPONSE PARSING UTILITIES
// ============================================================================

type WaitlistResponseType = 'accept' | 'decline' | 'remove' | 'status' | 'unknown'

function parseWaitlistResponse(messageBody: string): { type: WaitlistResponseType; confidence: number } {
  const normalized = messageBody.trim().toUpperCase()

  // YES/ACCEPT responses
  const acceptPatterns = ['YES', 'Y', 'ACCEPT', 'BOOK', 'CONFIRM', 'OK', 'OKAY', 'SURE', 'ABSOLUTELY', 'BOOK IT', 'YES PLEASE', 'TAKE IT', 'I WANT IT']
  if (acceptPatterns.some(pattern => normalized === pattern || normalized.startsWith(pattern + ' '))) {
    return { type: 'accept', confidence: 0.95 }
  }

  // NO/DECLINE responses
  const declinePatterns = ['NO', 'N', 'DECLINE', 'PASS', 'SKIP', 'NOT NOW', 'CANT', "CAN'T", 'UNABLE', 'NO THANKS', 'NO THANK YOU', 'NEXT TIME']
  if (declinePatterns.some(pattern => normalized === pattern || normalized.startsWith(pattern + ' '))) {
    return { type: 'decline', confidence: 0.95 }
  }

  // REMOVE/STOP responses
  const removePatterns = ['REMOVE', 'STOP', 'UNSUBSCRIBE', 'STOP WAITLIST', 'REMOVE WAITLIST', 'CANCEL WAITLIST', 'TAKE ME OFF', 'OFF WAITLIST', 'DELETE']
  if (removePatterns.some(pattern => normalized === pattern || normalized.includes(pattern))) {
    return { type: 'remove', confidence: 0.95 }
  }

  // STATUS/POSITION inquiry
  const statusPatterns = ['POSITION', 'STATUS', 'WHERE AM I', 'WAITLIST STATUS', 'MY POSITION', 'HOW LONG', 'WAIT TIME', 'ESTIMATE']
  if (statusPatterns.some(pattern => normalized === pattern || normalized.includes(pattern))) {
    return { type: 'status', confidence: 0.90 }
  }

  return { type: 'unknown', confidence: 0 }
}

// ============================================================================
// WAITLIST OFFER MANAGEMENT FUNCTIONS (imported from @/lib/waitlist-offers)
// ============================================================================

function bookAppointmentFromWaitlist(offer: WaitlistOffer): { success: boolean; appointmentId?: string; error?: string } {
  // Optimistic locking check - in production, this would be a database transaction
  const currentOffer = waitlistOffers.get(offer.id)
  if (!currentOffer || currentOffer.version !== offer.version) {
    return { success: false, error: 'Concurrent modification detected' }
  }

  // Double-check slot availability (race condition protection)
  if (!isSlotStillAvailable(offer.practitionerId, offer.slotStartTime, offer.slotEndTime)) {
    offer.status = 'slot_taken'
    offer.respondedAt = new Date()
    waitlistOffers.set(offer.id, { ...offer, version: offer.version + 1 })
    return { success: false, error: 'Slot no longer available' }
  }

  // Create the appointment
  const appointmentId = `apt-waitlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const practitioner = practitioners.find(p => p.id === offer.practitionerId)
  const service = services.find(s => s.name.toLowerCase() === offer.serviceName.toLowerCase())

  const newAppointment = {
    id: appointmentId,
    patientId: `p-waitlist-${Date.now()}`,
    patientName: offer.patientName,
    serviceName: offer.serviceName,
    serviceCategory: service?.category || 'aesthetics' as const,
    practitionerId: offer.practitionerId,
    startTime: offer.slotStartTime,
    endTime: offer.slotEndTime,
    status: 'confirmed' as const,
    color: '#10b981',
    duration: Math.round((offer.slotEndTime.getTime() - offer.slotStartTime.getTime()) / 60000),
    phone: offer.patientPhone,
    createdAt: new Date(),
    updatedAt: new Date(),
    bookingType: 'from_waitlist' as const,
    smsConfirmedAt: new Date()
  }

  appointments.push(newAppointment)

  // Update offer status
  offer.status = 'accepted'
  offer.respondedAt = new Date()
  waitlistOffers.set(offer.id, { ...offer, version: offer.version + 1 })

  return { success: true, appointmentId }
}

function cascadeOfferToNextPatient(
  serviceId: string,
  practitionerId: string,
  startTime: Date,
  endTime: Date,
  excludePhone?: string
): WaitlistEntry | null {
  // Find next matching patient on waitlist
  const matchingEntries = Array.from(waitlistEntries.values())
    .filter(entry => {
      if (entry.status !== 'active') return false
      if (excludePhone && entry.patientPhone.replace(/\D/g, '').slice(-10) === excludePhone.replace(/\D/g, '').slice(-10)) return false

      // Match by service (fuzzy match)
      const serviceMatch = entry.serviceName.toLowerCase().includes(serviceId.toLowerCase()) ||
                          serviceId.toLowerCase().includes(entry.serviceName.toLowerCase())

      // Match by practitioner preference (or any if no preference)
      const practitionerMatch = !entry.preferredPractitionerId || entry.preferredPractitionerId === practitionerId

      return serviceMatch && practitionerMatch
    })
    .sort((a, b) => a.position - b.position)

  if (matchingEntries.length === 0) return null

  const nextPatient = matchingEntries[0]

  // Create new offer for this patient
  const offerId = `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const offer: WaitlistOffer = {
    id: offerId,
    waitlistEntryId: nextPatient.id,
    patientPhone: nextPatient.patientPhone,
    patientName: nextPatient.patientName,
    serviceId: serviceId,
    serviceName: nextPatient.serviceName,
    practitionerId: practitionerId,
    slotStartTime: startTime,
    slotEndTime: endTime,
    offeredAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min expiry
    status: 'pending',
    version: 1
  }

  waitlistOffers.set(offerId, offer)

  return nextPatient
}

// Note: removeFromWaitlist and getWaitlistPosition are imported from @/lib/waitlist-offers

// ============================================================================
// WAITLIST RESPONSE HANDLERS
// ============================================================================

async function handleWaitlistAccept(phone: string, patientId: string | null): Promise<SMSResponse> {
  const offer = findPendingOfferByPhone(phone)

  if (!offer) {
    return {
      type: 'waitlist_accept',
      action: 'no_pending_offer',
      success: false,
      message: "We don't have a pending appointment offer for you at this time. If you received an offer, it may have expired. Reply STATUS to check your waitlist position."
    }
  }

  // Check if offer is expired
  if (new Date() >= offer.expiresAt) {
    offer.status = 'expired'
    waitlistOffers.set(offer.id, offer)

    return {
      type: 'waitlist_accept',
      action: 'offer_expired',
      success: false,
      message: "Sorry, that appointment offer has expired. You're still on our waitlist and we'll notify you when another slot opens up."
    }
  }

  // Attempt to book the appointment
  const bookingResult = bookAppointmentFromWaitlist(offer)

  if (bookingResult.success) {
    // Remove from waitlist
    const entry = waitlistEntries.get(offer.waitlistEntryId)
    if (entry) {
      entry.status = 'booked'
      waitlistEntries.set(entry.id, entry)
    }

    const timeStr = offer.slotStartTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const dateStr = offer.slotStartTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const practitioner = practitioners.find(p => p.id === offer.practitionerId)

    return {
      type: 'waitlist_accept',
      action: 'booked_successfully',
      success: true,
      message: `Great news! Your ${offer.serviceName} appointment is confirmed for ${dateStr} at ${timeStr}${practitioner ? ` with ${practitioner.name}` : ''}. We'll send you a reminder before your appointment. See you soon!`,
      staffNotification: `WAITLIST BOOKING: ${offer.patientName} accepted offer and is now booked for ${offer.serviceName} on ${dateStr} at ${timeStr}. Phone: ${offer.patientPhone}`
    }
  } else {
    // Slot was taken (race condition)
    if (bookingResult.error === 'Slot no longer available') {
      // Cascade to next patient
      cascadeOfferToNextPatient(
        offer.serviceId,
        offer.practitionerId,
        offer.slotStartTime,
        offer.slotEndTime,
        phone
      )

      return {
        type: 'waitlist_accept',
        action: 'slot_taken',
        success: false,
        message: "We're so sorry! That appointment slot was just filled by another patient. You're still on our waitlist with priority, and we'll notify you as soon as another opening becomes available.",
        staffNotification: `WAITLIST CONFLICT: ${offer.patientName} tried to accept offer but slot was already taken. Patient remains on waitlist.`
      }
    }

    return {
      type: 'waitlist_accept',
      action: 'booking_failed',
      success: false,
      message: "We encountered an issue booking your appointment. Please call us at 555-0100 to complete your booking.",
      staffNotification: `WAITLIST ERROR: Failed to book appointment for ${offer.patientName}. Error: ${bookingResult.error}`
    }
  }
}

async function handleWaitlistDecline(phone: string): Promise<SMSResponse> {
  const offer = findPendingOfferByPhone(phone)

  if (!offer) {
    return {
      type: 'waitlist_decline',
      action: 'no_pending_offer',
      success: false,
      message: "We don't have a pending appointment offer for you. Reply STATUS to check your waitlist position."
    }
  }

  // Mark offer as declined
  offer.status = 'declined'
  offer.respondedAt = new Date()
  waitlistOffers.set(offer.id, { ...offer, version: offer.version + 1 })

  // Cascade to next patient immediately
  const nextPatient = cascadeOfferToNextPatient(
    offer.serviceId,
    offer.practitionerId,
    offer.slotStartTime,
    offer.slotEndTime,
    phone
  )

  // Send offer SMS to next patient (in production)
  if (nextPatient) {
    const timeStr = offer.slotStartTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const dateStr = offer.slotStartTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    // Note: In production, you would send this SMS
    // await sendSMS(formatPhoneNumber(nextPatient.patientPhone),
    //   `Hi ${nextPatient.patientName}! Great news - a ${offer.serviceName} appointment just opened up for ${dateStr} at ${timeStr}. Reply YES to book or NO to pass. This offer expires in 30 minutes.`
    // )
  }

  return {
    type: 'waitlist_decline',
    action: 'declined_kept_on_list',
    success: true,
    message: "No problem! You're still on our waitlist for future openings. We'll reach out when another slot becomes available. Reply REMOVE if you'd like to be taken off the waitlist.",
    staffNotification: nextPatient
      ? `WAITLIST: ${offer.patientName} declined offer. Cascaded to next patient: ${nextPatient.patientName}`
      : `WAITLIST: ${offer.patientName} declined offer. No other matching patients on waitlist.`
  }
}

async function handleWaitlistRemove(phone: string): Promise<SMSResponse> {
  const result = removeFromWaitlist(phone, 'patient requested')

  if (result.removed === 0) {
    return {
      type: 'waitlist_remove',
      action: 'not_on_waitlist',
      success: false,
      message: "We don't have any active waitlist entries for this phone number. If you'd like to join our waitlist, please call us at 555-0100."
    }
  }

  // Log for compliance
  console.log(`[HIPAA COMPLIANCE LOG] Waitlist removal requested by patient. Phone: ${phone.slice(-4)}. Entries removed: ${result.removed}. Reason: patient requested. Timestamp: ${new Date().toISOString()}`)

  const servicesRemoved = result.entries.map(e => e.serviceName).join(', ')

  return {
    type: 'waitlist_remove',
    action: 'removed_from_waitlist',
    success: true,
    message: `You've been removed from our waitlist for: ${servicesRemoved}. If you change your mind, please call us at 555-0100 to be added back. Thank you!`,
    staffNotification: `WAITLIST REMOVAL: Patient at ${phone.slice(-4)} requested removal from waitlist. ${result.removed} entries removed for: ${servicesRemoved}`
  }
}

async function handleWaitlistStatus(phone: string): Promise<SMSResponse> {
  const positionInfo = getWaitlistPosition(phone)

  if (!positionInfo) {
    return {
      type: 'waitlist_status',
      action: 'not_on_waitlist',
      success: false,
      message: "We don't have you on our waitlist. To join, please call us at 555-0100 or ask at your next visit."
    }
  }

  const entries = findWaitlistEntriesByPhone(phone)
  const servicesWaiting = entries.map(e => e.serviceName).join(', ')

  return {
    type: 'waitlist_status',
    action: 'status_provided',
    success: true,
    message: `You're #${positionInfo.position} of ${positionInfo.total} on our waitlist for: ${servicesWaiting}. ${positionInfo.estimatedWait}. We'll text you when an opening matches your preferences. Reply REMOVE to leave the waitlist.`
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const body = Object.fromEntries(formData)

    // Parse incoming SMS
    const incomingMessage = handleIncomingSMS(body)

    // ============================================================================
    // PROACTIVE AI PROCESSING (runs in background, doesn't block response)
    // ============================================================================
    // Generate AI suggestions immediately and store in Firestore for real-time UI
    const messageId = body.MessageSid?.toString() || `sms-${Date.now()}`
    const conversationId = `conv-${incomingMessage.from.replace(/\D/g, '').slice(-10)}`

    // Fire and forget - don't await, let it run in parallel
    triggerProactiveAIProcessing(messageId, incomingMessage.from, incomingMessage.body, conversationId)
      .catch(err => console.error('[Proactive AI] Background processing error:', err))

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

        // Get queue position after check-in
        const queue = getWaitingRoomQueue()
        const waitingPatients = queue.filter(q => q.status === 'in_car')
        const queuePosition = waitingPatients.findIndex(
          q => q.appointmentId === todaysAppointment.id
        ) + 1
        const queueInfo = queuePosition > 0
          ? { position: queuePosition, waitingCount: waitingPatients.length }
          : undefined

        // Validate forms for check-in (with queue position)
        const formValidation = await handleCheckInFormValidation(
          todaysAppointment.patientId || todaysAppointment.id,
          todaysAppointment.patientName,
          incomingMessage.from,
          todaysAppointment.serviceName,
          time,
          queueInfo
        )

        // Send appropriate message based on form completion status
        await sendSMS(incomingMessage.from, formValidation.message)

        // Create check-in notification (with or without incomplete forms)
        await createCheckInNotification({
          patientId: todaysAppointment.patientId || todaysAppointment.id,
          patientName: todaysAppointment.patientName,
          appointmentTime: time,
          hasIncompleteForms: !formValidation.formsComplete,
          incompleteForms: formValidation.incompleteForms
        })

        if (!formValidation.formsComplete) {
          console.log(`Virtual Waiting Room: ${todaysAppointment.patientName} checked in (forms incomplete: ${formValidation.incompleteForms.length})`)
        } else {
          console.log(`Virtual Waiting Room: ${todaysAppointment.patientName} checked in (all forms complete)`)
        }

        return new NextResponse(null, { status: 200 })
      } else {
        const replyMessage = "We couldn't find an appointment for today with this number. Please call us at 555-0100 if you need help."
        await sendSMS(incomingMessage.from, replyMessage)
        return new NextResponse(null, { status: 200 })
      }
    }

    // ========================================================================
    // WAITLIST OFFER RESPONSE HANDLING
    // Check for waitlist-related responses BEFORE AI intent detection
    // This ensures fast response within Twilio's 30-second timeout
    // ========================================================================
    const waitlistResponse = parseWaitlistResponse(incomingMessage.body)

    if (waitlistResponse.type !== 'unknown' && waitlistResponse.confidence >= 0.90) {
      let result: SMSResponse
      const patientId = await getPatientIdByPhone(incomingMessage.from)

      switch (waitlistResponse.type) {
        case 'accept':
          result = await handleWaitlistAccept(incomingMessage.from, patientId)
          break

        case 'decline':
          result = await handleWaitlistDecline(incomingMessage.from)
          break

        case 'remove':
          result = await handleWaitlistRemove(incomingMessage.from)
          break

        case 'status':
          result = await handleWaitlistStatus(incomingMessage.from)
          break

        default:
          result = {
            type: 'unknown',
            action: 'unrecognized',
            success: false,
            message: ''
          }
      }

      // If we got a valid waitlist response, handle it
      if (result.type !== 'unknown') {
        // Log the interaction for HIPAA compliance
        const waitlistLog = {
          timestamp: new Date().toISOString(),
          phone: incomingMessage.from.slice(-4), // Only log last 4 digits
          messageSid: incomingMessage.messageSid,
          responseType: result.type,
          action: result.action,
          success: result.success,
          patientId: patientId || 'unknown'
        }
        console.log('[HIPAA WAITLIST LOG]', JSON.stringify(waitlistLog))

        // Send the reply to patient
        if (result.message) {
          await sendSMS(incomingMessage.from, result.message)
        }

        // Send staff notification if needed
        if (result.staffNotification) {
          await createStaffNotificationFromWebhook({
            type: result.type === 'waitlist_accept' && result.success ? 'urgent' : 'normal',
            patientId: patientId || 'unknown',
            patientPhone: incomingMessage.from,
            message: result.staffNotification,
            intent: result.type,
            suggestedActions: [result.action]
          })
        }

        // Save message log
        await saveMessageLog({
          from: incomingMessage.from,
          to: incomingMessage.to,
          body: incomingMessage.body,
          messageSid: incomingMessage.messageSid,
          hasMedia: incomingMessage.hasMedia,
          mediaUrl: incomingMessage.mediaUrl,
          receivedAt: incomingMessage.receivedAt,
          patientId,
          waitlistResponse: {
            type: result.type,
            action: result.action,
            success: result.success
          },
          autoReplySent: !!result.message,
          autoReplyMessage: result.message
        })

        return new NextResponse(null, { status: 200 })
      }
    }

    // ========================================================================
    // RESCHEDULE INTELLIGENCE: Check for active reschedule conversation first
    // ========================================================================
    const rescheduleConversation = getRescheduleConversation(incomingMessage.from)
    const rescheduleResponse = parseRescheduleResponse(incomingMessage.body)

    // Handle slot selection if patient has an active reschedule conversation
    if (rescheduleConversation && rescheduleResponse.action === 'slot_selection') {
      const selectedSlot = getOfferedSlot(incomingMessage.from, rescheduleResponse.slotNumber!)

      if (!selectedSlot) {
        // Invalid selection - number out of range
        await sendRescheduleInvalidSelectionSMS(
          { name: rescheduleConversation.patientName, phone: incomingMessage.from },
          rescheduleConversation.offeredSlots.length
        )
        return new NextResponse(null, { status: 200 })
      }

      // Verify slot is still available (race condition check)
      const currentAvailability = getNextAvailableSlots(
        rescheduleConversation.providerId,
        new Date(),
        10,
        14,
        30
      )
      const slotStillAvailable = currentAvailability.some(
        slot => slot.startTime.getTime() === new Date(selectedSlot.startTime).getTime()
      )

      if (!slotStillAvailable) {
        // Slot was taken - cancel conversation and prompt to try again
        cancelRescheduleConversation(incomingMessage.from)
        await sendRescheduleSlotTakenSMS(
          { name: rescheduleConversation.patientName, phone: incomingMessage.from }
        )
        return new NextResponse(null, { status: 200 })
      }

      // Process the reschedule: Update appointment in-place (matching API pattern)
      const newStartTime = new Date(selectedSlot.startTime)

      // Use the new rescheduleAppointment function that updates in-place
      const rescheduleResult = rescheduleAppointment(
        rescheduleConversation.appointmentId,
        newStartTime,
        'Rescheduled via SMS'
      )

      if (!rescheduleResult.success || !rescheduleResult.appointment) {
        cancelRescheduleConversation(incomingMessage.from)
        await sendRescheduleNoAppointmentSMS(
          { name: rescheduleConversation.patientName, phone: incomingMessage.from }
        )
        return new NextResponse(null, { status: 200 })
      }

      // Mark conversation as confirmed
      confirmReschedule(incomingMessage.from)

      // Format dates for SMS
      const oldDate = new Date(rescheduleConversation.originalStartTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const newDate = newStartTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      const newTime = newStartTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

      // Send confirmation
      await sendRescheduleConfirmedSMS(
        { name: rescheduleConversation.patientName, phone: incomingMessage.from },
        rescheduleConversation.serviceName,
        oldDate,
        newDate,
        newTime,
        rescheduleConversation.providerName
      )

      // Log the successful reschedule
      await saveMessageLog({
        from: incomingMessage.from,
        to: incomingMessage.to,
        body: incomingMessage.body,
        messageSid: incomingMessage.messageSid,
        receivedAt: incomingMessage.receivedAt,
        rescheduleAction: {
          type: 'slot_selected',
          appointmentId: rescheduleConversation.appointmentId,
          selectedSlot: rescheduleResponse.slotNumber,
          lateFee: rescheduleResult.lateFee,
          isLateReschedule: rescheduleResult.isLateReschedule,
          success: true
        },
        autoReplySent: true,
        autoReplyMessage: 'Reschedule confirmation sent'
      })

      return new NextResponse(null, { status: 200 })
    }

    // Handle CALL request during active reschedule
    if (rescheduleConversation && rescheduleResponse.action === 'call_request') {
      cancelRescheduleConversation(incomingMessage.from)
      await sendSMS(
        incomingMessage.from,
        `No problem! Please call us at 555-0100 and we'll help reschedule your ${rescheduleConversation.serviceName}.`
      )
      return new NextResponse(null, { status: 200 })
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
          if (patientId) await updateAppointmentStatus(patientId, 'confirmed')
          break

        case 'reschedule':
          // RESCHEDULE INTELLIGENCE: Smart self-service reschedule flow
          const upcomingAppointment = findUpcomingAppointmentByPhone(incomingMessage.from)

          if (!upcomingAppointment) {
            // No appointment found - fall back to call
            await sendRescheduleNoAppointmentSMS({
              name: 'there', // Generic since we don't have patient name
              phone: incomingMessage.from
            })
            requiresStaffNotification = true
            break
          }

          // Get provider's available slots
          const practitioner = getPractitionerById(upcomingAppointment.practitionerId)
          const availableSlots = getNextAvailableSlots(
            upcomingAppointment.practitionerId,
            new Date(),
            5, // Offer 5 slots
            14, // Search 14 days ahead
            upcomingAppointment.duration || 30
          )

          if (availableSlots.length === 0) {
            // No availability - fall back to call
            await sendRescheduleNoAvailabilitySMS({
              name: upcomingAppointment.patientName.split(' ')[0], // First name
              phone: incomingMessage.from
            }, upcomingAppointment.serviceName)
            requiresStaffNotification = true
            break
          }

          // Create offered slots with indices
          const offeredSlots: OfferedSlot[] = availableSlots.map((slot, index) => ({
            index: index + 1,
            startTime: slot.startTime.toISOString(),
            endTime: slot.endTime.toISOString(),
            providerId: upcomingAppointment.practitionerId,
            providerName: practitioner?.name || 'Provider'
          }))

          // Create reschedule conversation
          createRescheduleConversation(
            incomingMessage.from,
            {
              id: upcomingAppointment.id,
              patientId: upcomingAppointment.patientId,
              patientName: upcomingAppointment.patientName,
              startTime: upcomingAppointment.startTime.toISOString(),
              serviceName: upcomingAppointment.serviceName,
              practitionerId: upcomingAppointment.practitionerId,
              practitionerName: practitioner?.name || 'Provider'
            },
            offeredSlots
          )

          // Format slots for SMS display
          const slotsText = formatSlotsForSMS(offeredSlots)

          // Send slot offer (10 min expiry to reduce race conditions with concurrent bookings)
          await sendRescheduleSlotOfferSMS(
            {
              name: upcomingAppointment.patientName.split(' ')[0],
              phone: incomingMessage.from
            },
            upcomingAppointment.serviceName,
            practitioner?.name || 'your provider',
            slotsText,
            10 // 10 minute expiry
          )

          // Log the reschedule initiation
          await saveMessageLog({
            from: incomingMessage.from,
            to: incomingMessage.to,
            body: incomingMessage.body,
            messageSid: incomingMessage.messageSid,
            receivedAt: incomingMessage.receivedAt,
            rescheduleAction: {
              type: 'initiated',
              appointmentId: upcomingAppointment.id,
              slotsOffered: availableSlots.length,
              success: true
            },
            autoReplySent: true,
            autoReplyMessage: 'Reschedule slots offered'
          })

          // Don't need generic reply - we sent the slot offer
          replyMessage = ''
          break

        case 'cancel':
          replyMessage = 'Your appointment has been cancelled. Please call 555-0100 if you\'d like to rebook.'
          if (patientId) await updateAppointmentStatus(patientId, 'cancelled')
          requiresStaffNotification = true
          break
      }
    } 
    // For complex messages, use AI suggestions
    else {
      // Check urgency and human intervention needs
      if (aiAnalysis.urgency === 'high' || aiAnalysis.requiresHuman) {
        // Check if this is a complication or side effect report
        const complicationKeywords = ['bruising', 'swelling', 'pain', 'redness', 'bump', 'lump',
          'asymmetry', 'drooping', 'infection', 'bleeding', 'numbness', 'allergic', 'reaction']

        // Extract keywords from message for complication detection
        const messageLower = incomingMessage.body.toLowerCase()
        const detectedKeywords = complicationKeywords.filter(k => messageLower.includes(k))

        // Import IntentType for comparison
        const { IntentType } = await import('@/lib/ai-assistant')

        const isComplication =
          aiAnalysis.intent?.type === IntentType.POST_TREATMENT_CONCERN ||
          aiAnalysis.intent?.type === IntentType.SIDE_EFFECT_REPORT ||
          detectedKeywords.length > 0

        if (isComplication && patientId) {
          // Use the new complication-specific handler
          const treatment = findRecentTreatment(patientId)

          const complicationAlert: ComplicationAlert = {
            patientId: patientId,
            patientName: 'Patient', // We may not have the name readily available
            patientPhone: incomingMessage.from,
            message: incomingMessage.body,
            keywords: detectedKeywords,
            urgency: 'high', // SMS webhook uses 'high' as max urgency
            treatment: treatment || undefined
          }

          // Handle the complication alert (notifies provider, logs to medical record)
          await handleComplicationAlert(complicationAlert)

          // Generate and send aftercare-aware auto-response
          replyMessage = generateComplicationResponse(treatment, detectedKeywords)
          requiresStaffNotification = false // Already handled by complication system

          console.log('[SMS WEBHOOK] Complication handled via new routing:', {
            patientId,
            hasRecentTreatment: !!treatment,
            keywords: detectedKeywords
          })
        } else {
          // Regular HIGH urgency (not complication) - use existing staff alert
          requiresStaffNotification = true

          // Send acknowledgment if urgent
          if (aiAnalysis.urgency === 'high') {
            replyMessage = generateUrgentAcknowledgment()
          } else {
            replyMessage = aiAnalysis.suggestedResponses[0] || 'Thank you for your message. A team member will respond shortly.'
          }
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
      await createStaffNotificationFromWebhook({
        type: aiAnalysis.urgency === 'high' ? 'urgent' : 'normal',
        patientId: patientId || 'unknown',
        patientPhone: incomingMessage.from,
        message: incomingMessage.body,
        intent: aiAnalysis.intent?.toString(),
        suggestedActions: aiAnalysis.suggestedActions?.map(a => typeof a === 'string' ? a : a.label || String(a))
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
  const mockPatients: Record<string, string> = {
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

async function createStaffNotificationFromWebhook(notification: {
  type: 'urgent' | 'normal'
  patientId: string
  patientPhone: string
  message: string
  intent?: string
  suggestedActions?: string[]
}): Promise<void> {
  // Create real notification in the notification store
  await createNotification({
    type: notification.type,
    patientId: notification.patientId,
    patientPhone: notification.patientPhone,
    message: notification.message,
    intent: notification.intent,
    suggestedActions: notification.suggestedActions,
  })

  console.log('[SMS Webhook] Staff notification created:', {
    type: notification.type,
    patientId: notification.patientId,
    urgent: notification.type === 'urgent',
  })
}

// ============================================================================
// PROACTIVE AI PROCESSING
// ============================================================================

/**
 * Trigger proactive AI processing in the background.
 * This runs independently of the main webhook flow to pre-generate
 * AI response suggestions for staff to review in the messaging UI.
 */
async function triggerProactiveAIProcessing(
  messageId: string,
  phoneNumber: string,
  messageText: string,
  conversationId: string
): Promise<void> {
  const startTime = Date.now()

  try {
    // Process message with Gemini AI
    const result = await processIncomingMessage(
      messageId,
      phoneNumber,
      messageText,
      [] // Recent messages could be loaded from conversation history
    )

    // Store in Firestore for real-time UI updates
    await storeAIResponse(conversationId, result)

    const processingTime = Date.now() - startTime
    console.log(`[Proactive AI] Processed message in ${processingTime}ms:`, {
      messageId,
      conversationId,
      intent: result.analysis.intent,
      urgency: result.analysis.urgency,
      responseCount: result.responses.length,
      topConfidence: result.responses[0]?.confidence || 0,
    })

  } catch (error) {
    console.error('[Proactive AI] Processing failed:', {
      messageId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    // Don't throw - this is background processing, shouldn't affect main flow
  }
}