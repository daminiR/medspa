/**
 * Escalation Service
 *
 * Automatically escalates unacknowledged alerts to managers
 * after a configurable timeout period.
 */

import {
  getPendingAlerts,
  markAlertEscalated,
  getAlertById,
  type StaffAlert
} from './complicationAlertService'
import { logComplicationReport } from '@/lib/data/complicationLogs'

// ============================================
// CONFIGURATION
// ============================================

/**
 * Escalation configuration
 */
export interface EscalationConfig {
  /** Time in minutes before escalating to manager (default: 30) */
  escalationThresholdMinutes: number
  /** Time in minutes for critical alerts (default: 15) */
  criticalEscalationMinutes: number
  /** Whether to send additional notifications on escalation */
  sendEscalationNotifications: boolean
}

const DEFAULT_CONFIG: EscalationConfig = {
  escalationThresholdMinutes: 30,
  criticalEscalationMinutes: 15,
  sendEscalationNotifications: true
}

// ============================================
// IN-MEMORY TRACKING
// ============================================

/**
 * Track escalation history
 */
interface EscalationRecord {
  alertId: string
  escalatedAt: Date
  reason: string
  escalatedTo: string
  originalProviderId: string
  elapsedMinutes: number
}

const escalationHistory: EscalationRecord[] = []

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Check all pending alerts and escalate if needed
 * This is the main function called by the cron job
 */
export async function checkAndEscalateAlerts(
  config: Partial<EscalationConfig> = {}
): Promise<EscalationResult> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const now = new Date()
  const pendingAlerts = getPendingAlerts()

  const result: EscalationResult = {
    checkedAt: now,
    totalPending: pendingAlerts.length,
    escalated: [],
    skipped: []
  }

  for (const alert of pendingAlerts) {
    const elapsedMs = now.getTime() - alert.createdAt.getTime()
    const elapsedMinutes = elapsedMs / (1000 * 60)

    // Determine threshold based on alert type (emergency/urgent get shorter threshold)
    const threshold = alert.type === 'emergency' || alert.type === 'urgent'
      ? mergedConfig.criticalEscalationMinutes
      : mergedConfig.escalationThresholdMinutes

    if (elapsedMinutes >= threshold) {
      // Escalate this alert
      const escalation = await escalateAlert(alert, elapsedMinutes, mergedConfig)
      if (escalation) {
        result.escalated.push(escalation)
      }
    } else {
      result.skipped.push({
        alertId: alert.id,
        elapsedMinutes: Math.round(elapsedMinutes),
        thresholdMinutes: threshold,
        remainingMinutes: Math.round(threshold - elapsedMinutes)
      })
    }
  }

  console.log('[ESCALATION] Check completed:', {
    totalPending: result.totalPending,
    escalated: result.escalated.length,
    skipped: result.skipped.length
  })

  return result
}

/**
 * Escalate a single alert to manager
 */
async function escalateAlert(
  alert: StaffAlert,
  elapsedMinutes: number,
  config: EscalationConfig
): Promise<EscalationRecord | null> {
  // Mark as escalated in the alert system
  const marked = markAlertEscalated(alert.id)
  if (!marked) {
    console.error('[ESCALATION] Failed to mark alert as escalated:', alert.id)
    return null
  }

  const record: EscalationRecord = {
    alertId: alert.id,
    escalatedAt: new Date(),
    reason: `No response for ${Math.round(elapsedMinutes)} minutes`,
    escalatedTo: 'manager',
    originalProviderId: alert.recipientId,
    elapsedMinutes: Math.round(elapsedMinutes)
  }

  escalationHistory.push(record)

  // In production: Send notification to manager
  if (config.sendEscalationNotifications) {
    await sendEscalationNotification(alert, record)
  }

  console.log('[ESCALATION] Alert escalated:', {
    alertId: alert.id,
    patientName: alert.patientName,
    originalProvider: alert.recipientId,
    elapsedMinutes: Math.round(elapsedMinutes)
  })

  return record
}

/**
 * Send escalation notification to manager
 */
async function sendEscalationNotification(
  alert: StaffAlert,
  record: EscalationRecord
): Promise<void> {
  // In production: This would send push notification, email, or SMS to manager
  console.log('[ESCALATION NOTIFICATION] Sending to manager:', {
    title: `ESCALATION: No response to patient concern`,
    message: `Alert for ${alert.patientName} sent ${record.elapsedMinutes} min ago with no response.`,
    originalAlert: alert.id,
    priority: 'critical',
    actionUrl: `/messages?patient=${alert.patientId}`
  })

  // TODO: Integrate with actual notification service
  // await notificationService.sendToManager({
  //   type: 'escalation',
  //   title: `ESCALATION: No response to ${alert.patientName}`,
  //   message: `Alert sent ${record.elapsedMinutes} min ago. Patient concern: "${alert.message.slice(0, 100)}..."`,
  //   priority: 'critical',
  //   actionUrl: alert.actionUrl
  // })
}

// ============================================
// RESULT TYPES
// ============================================

export interface EscalationResult {
  checkedAt: Date
  totalPending: number
  escalated: EscalationRecord[]
  skipped: Array<{
    alertId: string
    elapsedMinutes: number
    thresholdMinutes: number
    remainingMinutes: number
  }>
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get escalation history
 */
export function getEscalationHistory(): EscalationRecord[] {
  return [...escalationHistory].sort((a, b) =>
    b.escalatedAt.getTime() - a.escalatedAt.getTime()
  )
}

/**
 * Get escalation statistics
 */
export function getEscalationStats(): {
  totalEscalations: number
  last24Hours: number
  last7Days: number
  averageResponseTime: number | null
  byProvider: Record<string, number>
} {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const byProvider: Record<string, number> = {}
  let totalResponseTime = 0
  let responseCount = 0

  for (const record of escalationHistory) {
    // Count by provider
    byProvider[record.originalProviderId] = (byProvider[record.originalProviderId] || 0) + 1

    // Track response times
    totalResponseTime += record.elapsedMinutes
    responseCount++
  }

  return {
    totalEscalations: escalationHistory.length,
    last24Hours: escalationHistory.filter(r => r.escalatedAt >= oneDayAgo).length,
    last7Days: escalationHistory.filter(r => r.escalatedAt >= oneWeekAgo).length,
    averageResponseTime: responseCount > 0 ? Math.round(totalResponseTime / responseCount) : null,
    byProvider
  }
}

/**
 * Clear escalation history (for testing)
 */
export function clearEscalationHistory(): void {
  escalationHistory.length = 0
}
