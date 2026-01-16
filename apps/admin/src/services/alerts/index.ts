/**
 * Alert Services - Emergency/Complication Provider Routing
 *
 * This module provides intelligent routing of patient complications
 * to the specific provider who performed the treatment.
 *
 * INTEGRATION: Uses shared notificationStore for UI notifications,
 * while maintaining internal tracking for escalation/acknowledge/resolve.
 *
 * Features:
 * - Treatment lookup to identify responsible provider
 * - Provider-specific alerts for complications
 * - Auto-response with treatment-specific aftercare tips
 * - 30-minute escalation to manager if no response
 * - Medical record logging for compliance
 * - Integration with shared notification system (appears in notification bell)
 *
 * Usage:
 * ```typescript
 * import { handleComplicationAlert, generateComplicationResponse } from '@/services/alerts'
 *
 * // When complication detected in SMS webhook:
 * const treatment = findRecentTreatment(patientId)
 * await handleComplicationAlert({
 *   patientId,
 *   patientName,
 *   patientPhone,
 *   message: incomingMessage.body,
 *   keywords: analysis.keywords,
 *   urgency: 'high',
 *   treatment
 * })
 *
 * const autoResponse = generateComplicationResponse(treatment, keywords)
 * await sendSMS(patientPhone, autoResponse)
 * ```
 */

// Core alert service
export {
  handleComplicationAlert,
  isEmergency,
  getUnacknowledgedAlerts,
  acknowledgeAlert,
  resolveAlert,
  getAlertById,
  getPendingAlerts,
  markAlertEscalated,
  getTrackingByNotificationId,
  type ComplicationAlert,
  type ComplicationAlertTracking,
  type StaffAlert, // Alias for backwards compatibility
  type ComplicationUrgency
} from './complicationAlertService'

// Auto-response generator
export {
  generateComplicationResponse,
  generateUrgentAcknowledgment,
  getAftercareTipsForTreatment,
  generateFollowUpMessage
} from './complicationResponder'

// Escalation service
export {
  checkAndEscalateAlerts,
  getEscalationHistory,
  getEscalationStats,
  clearEscalationHistory,
  type EscalationConfig,
  type EscalationResult
} from './escalationService'
