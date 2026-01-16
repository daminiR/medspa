/**
 * Patient Reply Processor Service
 * Intelligent processing of incoming SMS patient replies
 *
 * Responsibilities:
 * - Parse confirmation/reschedule/opt-out replies
 * - Match replies to conversations and appointments
 * - Update appointment status
 * - Trigger reschedule flows
 * - Detect and handle opt-outs (STOP, UNSUBSCRIBE)
 * - Send automatic responses
 * - Log for compliance
 *
 * @module services/messaging/reply-processor
 */

import { sendSMS, formatPhoneNumber } from '@/lib/twilio'
import { appointments, practitioners, services } from '@/lib/data'
import type { Appointment } from '@/lib/data'

// ============================================================================
// TYPES
// ============================================================================

export interface ProcessReplyResult {
  success: boolean
  action: 'confirm' | 'reschedule' | 'optout' | 'unrecognized' | 'error'
  appointmentId?: string
  appointmentStatus?: string
  autoReplyMessage?: string
  requiresStaffAttention: boolean
  staffNotificationMessage?: string
  logs: string[]
}

export interface OptOutDetection {
  isOptOut: boolean
  keyword?: string
  confidence?: 'high' | 'medium' | 'low'
}

// ============================================================================
// OPT-OUT KEYWORDS
// ============================================================================

const OPT_OUT_KEYWORDS = {
  high_confidence: [
    'STOP',
    'UNSUBSCRIBE',
    'STOP ALL',
    'QUIT',
    'CANCEL ALL',
  ],
  medium_confidence: [
    'REMOVE',
    'OFF',
    'NO MORE',
    'DONT TEXT',
    "DON'T TEXT",
  ],
}

// ============================================================================
// CORE REPLY PROCESSOR
// ============================================================================

/**
 * Main entry point for processing patient SMS replies
 */
export async function processPatientReply(
  from: string,
  body: string,
  messageSid: string,
  requestId: string
): Promise<ProcessReplyResult> {
  const logs: string[] = []
  const logFn = (msg: string) => {
    console.log(`[${requestId}] ${msg}`)
    logs.push(msg)
  }

  try {
    logFn('=== PROCESSING PATIENT REPLY ===')
    logFn(`Phone: ${from}`)
    logFn(`Message: "${body.substring(0, 100)}"`)
    logFn(`Twilio SID: ${messageSid}`)

    // Step 1: Detect opt-out
    logFn('Step 1: Checking for opt-out keywords...')
    const optOutDetection = detectOptOut(body)

    if (optOutDetection.isOptOut) {
      logFn(`Opt-out detected! Keyword: ${optOutDetection.keyword}, Confidence: ${optOutDetection.confidence}`)
      const result = await handleOptOut(from, optOutDetection.keyword || 'UNKNOWN', requestId, logs)
      result.logs = logs
      return result
    }

    logFn('No opt-out keywords detected')

    // Step 2: Find associated appointment
    logFn('Step 2: Finding associated appointment...')
    const appointment = findAppointmentByPhone(from)

    if (!appointment) {
      logFn('No appointment found for this phone number')
      const result = {
        success: false,
        action: 'unrecognized' as const,
        autoReplyMessage: 'We couldn\'t find an upcoming appointment for this number. Please call us at 555-0100 for assistance.',
        requiresStaffAttention: true,
        staffNotificationMessage: `SMS from ${from}: "${body.substring(0, 100)}" - No associated appointment found`,
        logs,
      }
      logFn(`Result: ${JSON.stringify(result, null, 2)}`)
      return result
    }

    logFn(`Found appointment: ${appointment.id} for ${appointment.patientName} on ${appointment.startTime.toISOString()}`)

    // Step 3: Parse reply intent
    logFn('Step 3: Parsing reply intent...')
    const intent = parseReplyIntent(body)

    logFn(`Parsed intent: ${intent.type}, confidence: ${intent.confidence}`)

    // Handle based on intent
    switch (intent.type) {
      case 'confirm':
        logFn('Processing CONFIRM action')
        return await handleConfirmation(appointment, from, messageSid, requestId, logs)

      case 'reschedule':
        logFn('Processing RESCHEDULE action')
        return await handleRescheduleIntent(appointment, from, requestId, logs)

      case 'unknown':
        logFn('Intent not recognized - needs staff attention')
        return {
          success: false,
          action: 'unrecognized' as const,
          autoReplyMessage: 'Thank you for your message. A team member will respond shortly.',
          requiresStaffAttention: true,
          staffNotificationMessage: `SMS from ${appointment.patientName} (${from}): "${body}"`,
          logs,
        }

      default:
        logFn(`Unexpected intent type: ${intent.type}`)
        return {
          success: false,
          action: 'error' as const,
          requiresStaffAttention: true,
          logs,
        }
    }

  } catch (error: any) {
    console.error(`[${requestId}] ERROR processing reply:`, error)
    logFn(`ERROR: ${error.message}`)

    return {
      success: false,
      action: 'error' as const,
      requiresStaffAttention: true,
      staffNotificationMessage: `Error processing SMS from ${from}: ${error.message}`,
      logs,
    }
  }
}

// ============================================================================
// OPT-OUT HANDLING
// ============================================================================

/**
 * Detect opt-out keywords in message
 */
function detectOptOut(body: string): OptOutDetection {
  const normalized = body.trim().toUpperCase()

  // Check high confidence keywords
  for (const keyword of OPT_OUT_KEYWORDS.high_confidence) {
    if (normalized === keyword || normalized.startsWith(keyword + ' ') || normalized.includes(' ' + keyword)) {
      return {
        isOptOut: true,
        keyword,
        confidence: 'high',
      }
    }
  }

  // Check medium confidence keywords
  for (const keyword of OPT_OUT_KEYWORDS.medium_confidence) {
    if (normalized.includes(keyword)) {
      return {
        isOptOut: true,
        keyword,
        confidence: 'medium',
      }
    }
  }

  return { isOptOut: false }
}

/**
 * Handle opt-out request
 */
async function handleOptOut(
  from: string,
  keyword: string,
  requestId: string,
  logs: string[]
): Promise<ProcessReplyResult> {
  const logFn = (msg: string) => {
    console.log(`[${requestId}] ${msg}`)
    logs.push(msg)
  }

  try {
    logFn(`Processing opt-out: keyword "${keyword}"`)

    // Log opt-out for compliance (TCPA)
    logFn(`[COMPLIANCE LOG] Patient at ${from.slice(-4)} opted out with keyword: ${keyword}`)

    const autoReplyMessage =
      'You have been unsubscribed from our text messages. You will no longer receive SMS from us. ' +
      'Reply HELP for more options or call us at 555-0100.'

    const staffNotificationMessage =
      `OPTOUT ALERT: Patient at ${from.slice(-4)} sent opt-out keyword: "${keyword}". ` +
      `Phone: ${from}. Timestamp: ${new Date().toISOString()}`

    // Send confirmation to patient
    logFn('Sending opt-out confirmation SMS...')
    await sendSMS(from, autoReplyMessage)
    logFn('Opt-out confirmation sent')

    return {
      success: true,
      action: 'optout' as const,
      autoReplyMessage,
      requiresStaffAttention: true,
      staffNotificationMessage,
      logs,
    }

  } catch (error: any) {
    logFn(`ERROR in handleOptOut: ${error.message}`)

    return {
      success: false,
      action: 'error' as const,
      requiresStaffAttention: true,
      staffNotificationMessage: `Error processing opt-out for ${from}: ${error.message}`,
      logs,
    }
  }
}

// ============================================================================
// CONFIRMATION HANDLING
// ============================================================================

interface ReplyIntent {
  type: 'confirm' | 'reschedule' | 'unknown'
  confidence: number
}

/**
 * Parse the intent from the patient's message
 */
function parseReplyIntent(body: string): ReplyIntent {
  const normalized = body.trim().toUpperCase()

  // Confirmation keywords
  const confirmKeywords = ['C', 'CONFIRM', 'YES', 'Y', 'OK', 'OKAY']
  if (confirmKeywords.includes(normalized)) {
    return { type: 'confirm', confidence: 0.95 }
  }

  // Reschedule keywords
  const rescheduleKeywords = ['R', 'RESCHEDULE', 'CHANGE', 'MOVE', 'MODIFY']
  if (rescheduleKeywords.includes(normalized)) {
    return { type: 'reschedule', confidence: 0.95 }
  }

  // Unknown
  return { type: 'unknown', confidence: 0 }
}

/**
 * Handle appointment confirmation
 */
async function handleConfirmation(
  appointment: Appointment,
  from: string,
  messageSid: string,
  requestId: string,
  logs: string[]
): Promise<ProcessReplyResult> {
  const logFn = (msg: string) => {
    console.log(`[${requestId}] ${msg}`)
    logs.push(msg)
  }

  try {
    logFn(`Confirming appointment: ${appointment.id}`)
    logFn(`Patient: ${appointment.patientName}`)
    logFn(`Appointment: ${appointment.serviceName} on ${appointment.startTime.toISOString()}`)

    // Update appointment status to confirmed
    logFn('Updating appointment status to "confirmed"...')
    const updatedAppointment = updateAppointmentStatus(appointment.id, 'confirmed')

    if (!updatedAppointment) {
      logFn('Failed to update appointment status')
      return {
        success: false,
        action: 'error' as const,
        appointmentId: appointment.id,
        requiresStaffAttention: true,
        staffNotificationMessage: `Failed to confirm appointment ${appointment.id} for ${appointment.patientName}`,
        logs,
      }
    }

    logFn('Appointment status updated successfully')

    const firstName = appointment.patientName.split(' ')[0]
    const appointmentDate = new Date(appointment.startTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    const appointmentTime = new Date(appointment.startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    const autoReplyMessage =
      `Thanks ${firstName}! Your ${appointment.serviceName} appointment is confirmed for ` +
      `${appointmentDate} at ${appointmentTime}. We look forward to seeing you!`

    // Send confirmation message
    logFn('Sending confirmation SMS...')
    await sendSMS(from, autoReplyMessage)
    logFn('Confirmation SMS sent')

    return {
      success: true,
      action: 'confirm' as const,
      appointmentId: appointment.id,
      appointmentStatus: 'confirmed',
      autoReplyMessage,
      requiresStaffAttention: false,
      logs,
    }

  } catch (error: any) {
    logFn(`ERROR in handleConfirmation: ${error.message}`)

    return {
      success: false,
      action: 'error' as const,
      appointmentId: appointment.id,
      requiresStaffAttention: true,
      staffNotificationMessage: `Error confirming appointment ${appointment.id}: ${error.message}`,
      logs,
    }
  }
}

// ============================================================================
// RESCHEDULE HANDLING
// ============================================================================

/**
 * Handle reschedule intent
 */
async function handleRescheduleIntent(
  appointment: Appointment,
  from: string,
  requestId: string,
  logs: string[]
): Promise<ProcessReplyResult> {
  const logFn = (msg: string) => {
    console.log(`[${requestId}] ${msg}`)
    logs.push(msg)
  }

  try {
    logFn(`Handling reschedule request for appointment: ${appointment.id}`)
    logFn(`Patient: ${appointment.patientName}`)
    logFn(`Current appointment: ${appointment.serviceName} on ${appointment.startTime.toISOString()}`)

    // In a full implementation, this would:
    // 1. Trigger a reschedule conversation state
    // 2. Offer available slots
    // 3. Wait for patient selection
    //
    // For now, we'll create a placeholder response and flag for staff

    const firstName = appointment.patientName.split(' ')[0]
    const practitioner = practitioners.find(p => p.id === appointment.practitionerId)

    const autoReplyMessage =
      `Hi ${firstName}! Let's reschedule your ${appointment.serviceName}. ` +
      `Please call us at 555-0100 and we'll find you a new time. ` +
      `We look forward to seeing you!`

    const staffNotificationMessage =
      `RESCHEDULE REQUEST: ${appointment.patientName} (${from}) wants to reschedule ` +
      `their ${appointment.serviceName} appointment from ` +
      `${new Date(appointment.startTime).toLocaleDateString()} at ` +
      `${new Date(appointment.startTime).toLocaleTimeString()}. ` +
      `Currently scheduled with ${practitioner?.name || 'unknown provider'}.`

    logFn('Sending reschedule acknowledgment SMS...')
    await sendSMS(from, autoReplyMessage)
    logFn('Reschedule SMS sent')

    return {
      success: true,
      action: 'reschedule' as const,
      appointmentId: appointment.id,
      autoReplyMessage,
      requiresStaffAttention: true,
      staffNotificationMessage,
      logs,
    }

  } catch (error: any) {
    logFn(`ERROR in handleRescheduleIntent: ${error.message}`)

    return {
      success: false,
      action: 'error' as const,
      appointmentId: appointment.id,
      requiresStaffAttention: true,
      staffNotificationMessage: `Error processing reschedule request for ${appointment.id}: ${error.message}`,
      logs,
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find appointment by patient phone number
 * Looks for upcoming, scheduled, or confirmed appointments
 */
function findAppointmentByPhone(phone: string): Appointment | null {
  const normalized = phone.replace(/\D/g, '')
  const now = new Date()

  // Find first upcoming appointment matching this phone
  const appointment = appointments.find(apt => {
    // Skip completed, cancelled, or no-show appointments
    if (['completed', 'cancelled', 'no_show'].includes(apt.status)) {
      return false
    }

    // Match phone number (last 10 digits)
    const aptPhone = apt.phone?.replace(/\D/g, '') || ''
    const phoneMatches = aptPhone.endsWith(normalized.slice(-10)) || normalized.endsWith(aptPhone.slice(-10))

    if (!phoneMatches) {
      return false
    }

    // Ensure appointment is in the future
    const aptTime = new Date(apt.startTime)
    if (aptTime < now) {
      return false
    }

    return true
  })

  return appointment || null
}

/**
 * Update appointment status
 * In production, this would update the database
 */
function updateAppointmentStatus(appointmentId: string, newStatus: string): Appointment | null {
  const appointment = appointments.find(apt => apt.id === appointmentId)

  if (!appointment) {
    return null
  }

  // Update the appointment status
  // Note: In production, this would update the database
  appointment.status = newStatus as any

  console.log(`[UPDATE] Appointment ${appointmentId} status updated to: ${newStatus}`)

  return appointment
}

/**
 * Format appointment details for logging
 */
function formatAppointmentDetails(appointment: Appointment): string {
  return `${appointment.patientName} - ${appointment.serviceName} on ${new Date(appointment.startTime).toISOString()}`
}
