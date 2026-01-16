/**
 * Complication Logs - Medical Record Logging
 *
 * Tracks all patient-reported complications for:
 * - Medical record compliance
 * - Provider accountability
 * - Quality improvement
 */

export interface ComplicationLog {
  id: string
  patientId: string
  patientName: string
  patientPhone: string
  reportedAt: Date
  message: string
  keywords: string[]
  urgency: 'critical' | 'high' | 'medium' | 'low'
  relatedTreatmentId?: string
  relatedTreatmentType?: string
  alertedProviderId?: string
  alertedProviderName?: string
  alertIds: string[]
  isEmergency: boolean
  isCriticalPeriod: boolean
  resolvedAt?: Date
  resolution?: string
  resolvedBy?: string
  notes?: string
  followUpScheduled?: boolean
  followUpDate?: Date
  resolved: boolean
}

export interface CreateComplicationLogData {
  patientId: string
  patientName: string
  patientPhone: string
  reportedAt: Date
  message: string
  keywords: string[]
  urgency: 'critical' | 'high' | 'medium' | 'low'
  relatedTreatmentId?: string
  relatedTreatmentType?: string
  alertedProviderId?: string
  alertedProviderName?: string
  alertIds: string[]
  isEmergency: boolean
  isCriticalPeriod: boolean
  resolved: boolean
}

// ============================================
// IN-MEMORY STORAGE (Replace with database in production)
// ============================================

const complicationLogs: Map<string, ComplicationLog> = new Map()

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Generate a unique log ID
 */
function generateLogId(): string {
  return `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Log a new complication report
 */
export function logComplicationReport(data: CreateComplicationLogData): ComplicationLog {
  const log: ComplicationLog = {
    id: generateLogId(),
    ...data
  }

  complicationLogs.set(log.id, log)

  // In production: Save to database, sync to EMR
  console.log('[MEDICAL RECORD] Complication logged:', {
    id: log.id,
    patientId: log.patientId,
    patientName: log.patientName,
    treatment: log.relatedTreatmentType,
    urgency: log.urgency,
    isEmergency: log.isEmergency
  })

  return log
}

/**
 * Get complication history for a patient
 */
export function getPatientComplicationHistory(patientId: string): ComplicationLog[] {
  return Array.from(complicationLogs.values())
    .filter(log => log.patientId === patientId)
    .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime())
}

/**
 * Get complication history for a provider
 */
export function getProviderComplicationHistory(providerId: string): ComplicationLog[] {
  return Array.from(complicationLogs.values())
    .filter(log => log.alertedProviderId === providerId)
    .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime())
}

/**
 * Get unresolved complications
 */
export function getUnresolvedComplications(): ComplicationLog[] {
  return Array.from(complicationLogs.values())
    .filter(log => !log.resolved)
    .sort((a, b) => {
      // Sort by urgency first
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      if (urgencyDiff !== 0) return urgencyDiff
      // Then by date (oldest first for unresolved)
      return a.reportedAt.getTime() - b.reportedAt.getTime()
    })
}

/**
 * Resolve a complication
 */
export function resolveComplication(
  logId: string,
  resolution: string,
  resolvedBy: string
): ComplicationLog | null {
  const log = complicationLogs.get(logId)
  if (!log) return null

  log.resolved = true
  log.resolvedAt = new Date()
  log.resolution = resolution
  log.resolvedBy = resolvedBy
  complicationLogs.set(logId, log)

  console.log('[MEDICAL RECORD] Complication resolved:', {
    id: log.id,
    patientName: log.patientName,
    resolution,
    resolvedBy
  })

  return log
}

/**
 * Add notes to a complication log
 */
export function addComplicationNotes(logId: string, notes: string): ComplicationLog | null {
  const log = complicationLogs.get(logId)
  if (!log) return null

  log.notes = log.notes ? `${log.notes}\n\n${notes}` : notes
  complicationLogs.set(logId, log)

  return log
}

/**
 * Schedule follow-up for a complication
 */
export function scheduleFollowUp(logId: string, followUpDate: Date): ComplicationLog | null {
  const log = complicationLogs.get(logId)
  if (!log) return null

  log.followUpScheduled = true
  log.followUpDate = followUpDate
  complicationLogs.set(logId, log)

  console.log('[MEDICAL RECORD] Follow-up scheduled:', {
    id: log.id,
    patientName: log.patientName,
    followUpDate
  })

  return log
}

/**
 * Get a complication log by ID
 */
export function getComplicationById(logId: string): ComplicationLog | undefined {
  return complicationLogs.get(logId)
}

/**
 * Get all complication logs (for reporting)
 */
export function getAllComplicationLogs(): ComplicationLog[] {
  return Array.from(complicationLogs.values())
    .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime())
}

/**
 * Get complications by treatment type (for quality analysis)
 */
export function getComplicationsByTreatmentType(treatmentType: string): ComplicationLog[] {
  return Array.from(complicationLogs.values())
    .filter(log =>
      log.relatedTreatmentType?.toLowerCase().includes(treatmentType.toLowerCase())
    )
    .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime())
}

/**
 * Get complication statistics (for reporting)
 */
export function getComplicationStats(): {
  total: number
  resolved: number
  unresolved: number
  emergencies: number
  byUrgency: Record<string, number>
  byTreatmentType: Record<string, number>
} {
  const logs = Array.from(complicationLogs.values())

  const byUrgency: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 }
  const byTreatmentType: Record<string, number> = {}

  for (const log of logs) {
    byUrgency[log.urgency] = (byUrgency[log.urgency] || 0) + 1

    if (log.relatedTreatmentType) {
      byTreatmentType[log.relatedTreatmentType] =
        (byTreatmentType[log.relatedTreatmentType] || 0) + 1
    }
  }

  return {
    total: logs.length,
    resolved: logs.filter(l => l.resolved).length,
    unresolved: logs.filter(l => !l.resolved).length,
    emergencies: logs.filter(l => l.isEmergency).length,
    byUrgency,
    byTreatmentType
  }
}
