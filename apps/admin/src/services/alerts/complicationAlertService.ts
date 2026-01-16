/**
 * Complication Alert Service
 *
 * Routes complication reports to the specific provider who performed
 * the treatment, with escalation for emergencies.
 *
 * INTEGRATION: Uses shared notificationStore for UI notifications,
 * while maintaining internal tracking for escalation/acknowledge/resolve.
 */

import {
  findRecentTreatment,
  isWithinCriticalPeriod,
  getActivePractitioners,
  type RecentTreatment
} from '@/lib/data/treatmentLookup'
import { logComplicationReport, type ComplicationLog } from '@/lib/data/complicationLogs'
import {
  createStaffNotification,
  type StoredNotification
} from '@/lib/notifications/notificationStore'
import type { NotificationPriority } from '@/types/notifications'

// ============================================
// TYPES
// ============================================

export type ComplicationUrgency = 'critical' | 'high' | 'medium' | 'low'

export interface ComplicationAlert {
  patientId: string
  patientName: string
  patientPhone: string
  message: string
  keywords: string[]
  urgency: ComplicationUrgency
  treatment?: RecentTreatment
}

/**
 * Internal tracking for complication-specific state
 * (escalation, acknowledgment, resolution)
 * Linked to StoredNotification via notificationId
 */
export interface ComplicationAlertTracking {
  id: string
  notificationId: string // Links to StoredNotification
  type: 'complication' | 'emergency' | 'urgent' | 'general'
  recipientId: string
  recipientType: 'provider' | 'manager' | 'all_staff'
  patientId: string
  patientName: string
  patientPhone: string
  treatmentId?: string
  treatmentName?: string
  treatmentDaysSince?: number
  keywords: string[]
  requiresCallback: boolean
  createdAt: Date
  // Acknowledgment tracking (unique to complications)
  acknowledged: boolean
  acknowledgedAt?: Date
  acknowledgedBy?: string
  // Escalation tracking (unique to complications)
  escalated: boolean
  escalatedAt?: Date
  escalationReason?: 'emergency' | 'no_response' | 'no_provider'
  // Resolution tracking (unique to complications)
  resolved: boolean
  resolvedAt?: Date
  resolution?: string
}

// Keep StaffAlert as alias for backwards compatibility
export type StaffAlert = ComplicationAlertTracking

// ============================================
// IN-MEMORY TRACKING (Complication-specific state)
// ============================================

const complicationTracking: Map<string, ComplicationAlertTracking> = new Map()

// Emergency keywords that require immediate escalation
const EMERGENCY_KEYWORDS = [
  'allergic', 'allergic reaction', 'anaphylaxis',
  'cant breathe', 'breathing', 'difficulty breathing',
  'chest pain', 'heart',
  'vision', 'vision loss', 'blind', 'cant see',
  '911', 'emergency', 'er', 'hospital',
  'severe', 'severe pain', 'excruciating',
  'numbness', 'paralysis', 'stroke',
  'fever', 'infection'
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a unique tracking ID
 */
function generateTrackingId(): string {
  return `comp-track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if keywords indicate a true emergency
 */
export function isEmergency(keywords: string[]): boolean {
  const keywordsLower = keywords.map(k => k.toLowerCase())
  return EMERGENCY_KEYWORDS.some(ek =>
    keywordsLower.some(k => k.includes(ek) || ek.includes(k))
  )
}

/**
 * Map urgency level to notification priority
 */
function mapUrgencyToPriority(
  urgency: ComplicationUrgency,
  isCriticalPeriod: boolean,
  hasEmergencyKeywords: boolean
): NotificationPriority {
  if (hasEmergencyKeywords || urgency === 'critical') return 'urgent'
  if (isCriticalPeriod || urgency === 'high') return 'high'
  if (urgency === 'medium') return 'normal'
  return 'low'
}

/**
 * Map priority to notification store type
 */
function mapPriorityToNotificationType(priority: NotificationPriority): 'urgent' | 'normal' | 'info' {
  if (priority === 'urgent' || priority === 'high') return 'urgent'
  if (priority === 'normal') return 'normal'
  return 'info'
}

// ============================================
// ALERT CREATION FUNCTIONS
// ============================================

/**
 * Create a complication notification using the shared notification store
 * AND create internal tracking for escalation/acknowledgment
 */
async function createComplicationNotification(params: {
  alert: ComplicationAlert
  treatment: RecentTreatment | null
  recipientId: string
  recipientType: 'provider' | 'manager' | 'all_staff'
  alertType: 'complication' | 'emergency' | 'urgent' | 'general'
  isEscalation?: boolean
  escalationReason?: 'emergency' | 'no_response' | 'no_provider'
}): Promise<ComplicationAlertTracking> {
  const { alert, treatment, recipientId, recipientType, alertType, isEscalation, escalationReason } = params

  const isCriticalPeriod = treatment && isWithinCriticalPeriod(treatment)
  const hasEmergencyKeywords = isEmergency(alert.keywords)
  const priority = mapUrgencyToPriority(alert.urgency, isCriticalPeriod || false, hasEmergencyKeywords)

  // Build notification title
  let title: string
  if (hasEmergencyKeywords) {
    title = `EMERGENCY: Patient ${alert.patientName}`
  } else if (isEscalation) {
    title = `ESCALATION: Patient Concern - ${alert.patientName}`
  } else {
    title = `PATIENT CONCERN: ${alert.patientName}`
  }

  // Build notification body with treatment context
  let body: string
  if (treatment) {
    body = `Re: ${treatment.serviceName} (${treatment.daysSince} day${treatment.daysSince !== 1 ? 's' : ''} ago)\n\n"${alert.message}"`
  } else {
    body = `Patient message:\n\n"${alert.message}"`
  }

  // Create the shared notification (appears in notification bell)
  const notification = await createStaffNotification({
    type: mapPriorityToNotificationType(priority),
    patientId: alert.patientId,
    patientPhone: alert.patientPhone,
    message: body,
    intent: alertType,
    suggestedActions: ['Call patient', 'Review treatment record'],
    metadata: {
      // Complication-specific metadata
      isComplication: true,
      complicationType: alertType,
      treatmentId: treatment?.appointmentId,
      treatmentName: treatment?.serviceName,
      treatmentDaysSince: treatment?.daysSince,
      providerId: treatment?.practitionerId,
      providerName: treatment?.practitionerName,
      keywords: alert.keywords,
      requiresCallback: true,
      isEmergency: hasEmergencyKeywords,
      isCriticalPeriod: isCriticalPeriod || false,
      recipientType,
      recipientId,
    }
  })

  // Create internal tracking for escalation/acknowledgment
  const tracking: ComplicationAlertTracking = {
    id: generateTrackingId(),
    notificationId: notification.id,
    type: alertType,
    recipientId,
    recipientType,
    patientId: alert.patientId,
    patientName: alert.patientName,
    patientPhone: alert.patientPhone,
    treatmentId: treatment?.appointmentId,
    treatmentName: treatment?.serviceName,
    treatmentDaysSince: treatment?.daysSince,
    keywords: alert.keywords,
    requiresCallback: true,
    createdAt: new Date(),
    acknowledged: false,
    escalated: isEscalation || false,
    escalatedAt: isEscalation ? new Date() : undefined,
    escalationReason,
    resolved: false
  }

  // Store tracking
  complicationTracking.set(tracking.id, tracking)

  console.log('[COMPLICATION] Created notification + tracking:', {
    trackingId: tracking.id,
    notificationId: notification.id,
    type: alertType,
    recipientType,
    patientName: alert.patientName,
    priority
  })

  return tracking
}

/**
 * Create alert for specific provider who did the treatment
 */
async function createProviderAlert(
  alert: ComplicationAlert,
  treatment: RecentTreatment,
  isEscalation: boolean = false
): Promise<ComplicationAlertTracking> {
  return createComplicationNotification({
    alert,
    treatment,
    recipientId: treatment.practitionerId,
    recipientType: 'provider',
    alertType: isEmergency(alert.keywords) ? 'emergency' : 'complication',
    isEscalation
  })
}

/**
 * Create alert for manager/on-call (emergency escalation)
 */
async function createManagerAlert(
  alert: ComplicationAlert,
  treatment: RecentTreatment | null,
  reason: 'emergency' | 'no_response' | 'no_provider'
): Promise<ComplicationAlertTracking> {
  return createComplicationNotification({
    alert,
    treatment,
    recipientId: 'manager',
    recipientType: 'manager',
    alertType: reason === 'emergency' ? 'emergency' : 'urgent',
    isEscalation: true,
    escalationReason: reason
  })
}

/**
 * Create alerts for all active staff (fallback when no specific provider)
 */
async function createAllStaffAlert(
  alert: ComplicationAlert
): Promise<ComplicationAlertTracking[]> {
  const activePractitioners = getActivePractitioners()
  const trackings: ComplicationAlertTracking[] = []

  // Create one notification that goes to all staff
  const tracking = await createComplicationNotification({
    alert,
    treatment: null,
    recipientId: 'staff-all',
    recipientType: 'all_staff',
    alertType: 'general',
    isEscalation: false,
    escalationReason: 'no_provider'
  })

  trackings.push(tracking)

  console.log(`[COMPLICATION] Created all-staff alert (no specific provider found)`)

  return trackings
}

// ============================================
// MAIN HANDLER
// ============================================

/**
 * Handle a complication alert - the main entry point
 *
 * Flow:
 * 1. Find recent treatment for the patient
 * 2. If emergency keywords -> alert manager immediately
 * 3. If treatment found -> alert specific provider
 * 4. If no treatment found -> alert all staff
 * 5. Log to medical record
 */
export async function handleComplicationAlert(
  alert: ComplicationAlert
): Promise<{ alerts: ComplicationAlertTracking[]; complicationLog: ComplicationLog }> {
  const alerts: ComplicationAlertTracking[] = []

  // 1. Find recent treatment
  const treatment = alert.treatment || findRecentTreatment(alert.patientId)

  // 2. Check for emergency keywords
  const hasEmergencyKeywords = isEmergency(alert.keywords)

  // 3. Determine severity
  const isCriticalPeriod = treatment && isWithinCriticalPeriod(treatment)

  // 4. Create appropriate alerts
  if (treatment) {
    // Alert the specific provider who did the treatment
    const providerAlert = await createProviderAlert(alert, treatment)
    alerts.push(providerAlert)
  } else {
    // No recent treatment found - alert all staff
    const allStaffAlerts = await createAllStaffAlert(alert)
    alerts.push(...allStaffAlerts)
  }

  // 5. For emergencies, also alert manager
  if (hasEmergencyKeywords) {
    const managerAlert = await createManagerAlert(alert, treatment, 'emergency')
    alerts.push(managerAlert)
  }

  // 6. Log to medical record
  const complicationLog = logComplicationReport({
    patientId: alert.patientId,
    patientName: alert.patientName,
    patientPhone: alert.patientPhone,
    reportedAt: new Date(),
    message: alert.message,
    keywords: alert.keywords,
    urgency: alert.urgency,
    relatedTreatmentId: treatment?.appointmentId,
    relatedTreatmentType: treatment?.serviceName,
    alertedProviderId: treatment?.practitionerId,
    alertedProviderName: treatment?.practitionerName,
    alertIds: alerts.map(a => a.id),
    isEmergency: hasEmergencyKeywords,
    isCriticalPeriod: isCriticalPeriod || false,
    resolved: false
  })

  console.log(`[COMPLICATION] Handled alert for patient ${alert.patientId}:`, {
    hasRecentTreatment: !!treatment,
    isEmergency: hasEmergencyKeywords,
    isCriticalPeriod,
    alertCount: alerts.length,
    complicationLogId: complicationLog.id
  })

  return { alerts, complicationLog }
}

// ============================================
// TRACKING MANAGEMENT (Unique to Complications)
// ============================================

/**
 * Get all unacknowledged alerts for a provider
 */
export function getUnacknowledgedAlerts(providerId: string): ComplicationAlertTracking[] {
  return Array.from(complicationTracking.values())
    .filter(tracking =>
      !tracking.acknowledged &&
      (tracking.recipientId === providerId || tracking.recipientType === 'all_staff')
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/**
 * Acknowledge an alert (unique to complications - tracks WHO acknowledged)
 */
export function acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
  const tracking = complicationTracking.get(alertId)
  if (!tracking) return false

  tracking.acknowledged = true
  tracking.acknowledgedAt = new Date()
  tracking.acknowledgedBy = acknowledgedBy
  complicationTracking.set(alertId, tracking)

  console.log(`[COMPLICATION] Alert ${alertId} acknowledged by ${acknowledgedBy}`)
  return true
}

/**
 * Resolve an alert (unique to complications - includes resolution text)
 */
export function resolveAlert(alertId: string, resolution: string): boolean {
  const tracking = complicationTracking.get(alertId)
  if (!tracking) return false

  tracking.resolved = true
  tracking.resolvedAt = new Date()
  tracking.resolution = resolution
  complicationTracking.set(alertId, tracking)

  console.log(`[COMPLICATION] Alert ${alertId} resolved: ${resolution}`)
  return true
}

/**
 * Get alert by ID
 */
export function getAlertById(alertId: string): ComplicationAlertTracking | undefined {
  return complicationTracking.get(alertId)
}

/**
 * Get all pending alerts (for escalation service)
 */
export function getPendingAlerts(): ComplicationAlertTracking[] {
  return Array.from(complicationTracking.values())
    .filter(tracking => !tracking.acknowledged && !tracking.resolved && !tracking.escalated)
}

/**
 * Mark alert as escalated
 */
export function markAlertEscalated(alertId: string): boolean {
  const tracking = complicationTracking.get(alertId)
  if (!tracking) return false

  tracking.escalated = true
  tracking.escalatedAt = new Date()
  complicationTracking.set(alertId, tracking)

  return true
}

/**
 * Get tracking by notification ID (to link back from notification)
 */
export function getTrackingByNotificationId(notificationId: string): ComplicationAlertTracking | undefined {
  return Array.from(complicationTracking.values())
    .find(tracking => tracking.notificationId === notificationId)
}
