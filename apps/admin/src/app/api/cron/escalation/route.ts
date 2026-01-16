/**
 * Escalation Cron Job
 *
 * Checks for unacknowledged complication alerts and escalates
 * to managers if no response within threshold time.
 *
 * Recommended schedule: Every 5 minutes
 * vercel.json cron schedule: "0/5 * * * *" (every 5 minutes)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  checkAndEscalateAlerts,
  getEscalationStats,
  type EscalationResult
} from '@/services/alerts/escalationService'
import { getPendingAlerts } from '@/services/alerts/complicationAlertService'
import { getUnresolvedComplications } from '@/lib/data/complicationLogs'

/**
 * GET handler - called by cron scheduler
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is an authorized cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[ESCALATION CRON] Unauthorized request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[ESCALATION CRON] Starting escalation check...')

    // Run the escalation check
    const result = await checkAndEscalateAlerts({
      escalationThresholdMinutes: 30,
      criticalEscalationMinutes: 15,
      sendEscalationNotifications: true
    })

    // Get additional stats
    const stats = getEscalationStats()
    const pendingAlerts = getPendingAlerts()
    const unresolvedComplications = getUnresolvedComplications()

    const response = {
      success: true,
      timestamp: result.checkedAt.toISOString(),
      summary: {
        totalPending: result.totalPending,
        escalated: result.escalated.length,
        skipped: result.skipped.length,
        unresolvedComplications: unresolvedComplications.length
      },
      escalations: result.escalated.map(e => ({
        alertId: e.alertId,
        escalatedAt: e.escalatedAt.toISOString(),
        reason: e.reason,
        elapsedMinutes: e.elapsedMinutes
      })),
      pendingAlerts: pendingAlerts.map(a => ({
        id: a.id,
        type: a.type,
        recipientType: a.recipientType,
        patientName: a.patientName,
        createdAt: a.createdAt.toISOString(),
        treatmentName: a.treatmentName
      })),
      stats: {
        totalEscalations: stats.totalEscalations,
        last24Hours: stats.last24Hours,
        last7Days: stats.last7Days,
        averageResponseTime: stats.averageResponseTime
      }
    }

    console.log('[ESCALATION CRON] Completed:', {
      escalated: result.escalated.length,
      pending: result.totalPending
    })

    return NextResponse.json(response, { status: 200 })

  } catch (error: any) {
    console.error('[ESCALATION CRON] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Escalation check failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST handler - for manual triggering or testing
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse optional config from body
    let config = {}
    try {
      const body = await request.json()
      config = {
        escalationThresholdMinutes: body.thresholdMinutes,
        criticalEscalationMinutes: body.criticalMinutes,
        sendEscalationNotifications: body.sendNotifications ?? true
      }
    } catch {
      // Use defaults if no body
    }

    console.log('[ESCALATION CRON] Manual trigger with config:', config)

    const result = await checkAndEscalateAlerts(config)

    return NextResponse.json({
      success: true,
      message: 'Manual escalation check completed',
      result: {
        checkedAt: result.checkedAt.toISOString(),
        totalPending: result.totalPending,
        escalated: result.escalated.length,
        skipped: result.skipped.length
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error('[ESCALATION CRON] Manual trigger error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Manual escalation check failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}
