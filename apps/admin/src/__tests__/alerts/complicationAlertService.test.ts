/**
 * Complication Alert Service Tests
 *
 * Tests the emergency/complication provider routing system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  handleComplicationAlert,
  isEmergency,
  acknowledgeAlert,
  resolveAlert,
  getAlertById,
  getPendingAlerts,
  type ComplicationAlert
} from '@/services/alerts/complicationAlertService'
import { getNotifications } from '@/lib/notifications/notificationStore'

describe('Complication Alert Service', () => {
  describe('isEmergency', () => {
    it('should detect emergency keywords', () => {
      expect(isEmergency(['allergic', 'reaction'])).toBe(true)
      expect(isEmergency(['vision', 'blurry'])).toBe(true)
      expect(isEmergency(['cant breathe'])).toBe(true)
      expect(isEmergency(['911'])).toBe(true)
      expect(isEmergency(['severe pain'])).toBe(true)
    })

    it('should not flag normal complication keywords as emergency', () => {
      expect(isEmergency(['bruising'])).toBe(false)
      expect(isEmergency(['swelling'])).toBe(false)
      expect(isEmergency(['redness'])).toBe(false)
      expect(isEmergency(['bump'])).toBe(false)
    })

    it('should be case insensitive', () => {
      expect(isEmergency(['ALLERGIC'])).toBe(true)
      expect(isEmergency(['Vision Loss'])).toBe(true)
    })
  })

  describe('handleComplicationAlert', () => {
    it('should create notification and tracking for complication', async () => {
      const alert: ComplicationAlert = {
        patientId: 'test-patient-1',
        patientName: 'Test Patient',
        patientPhone: '+15551234567',
        message: 'I have bruising after my treatment',
        keywords: ['bruising'],
        urgency: 'high'
      }

      const result = await handleComplicationAlert(alert)

      // Should return alerts and complication log
      expect(result.alerts).toBeDefined()
      expect(result.alerts.length).toBeGreaterThan(0)
      expect(result.complicationLog).toBeDefined()
      expect(result.complicationLog.patientId).toBe('test-patient-1')
      expect(result.complicationLog.keywords).toContain('bruising')
    })

    it('should create notification in shared store', async () => {
      const initialCount = getNotifications().length

      const alert: ComplicationAlert = {
        patientId: 'test-patient-2',
        patientName: 'Test Patient 2',
        patientPhone: '+15559876543',
        message: 'Swelling after filler',
        keywords: ['swelling'],
        urgency: 'high'
      }

      await handleComplicationAlert(alert)

      // Notification should be added to shared store
      const newCount = getNotifications().length
      expect(newCount).toBeGreaterThan(initialCount)

      // Check notification has complication metadata
      const notifications = getNotifications()
      const complicationNotif = notifications.find(n =>
        n.data?.patientId === 'test-patient-2' &&
        n.data?.isComplication === true
      )
      expect(complicationNotif).toBeDefined()
    })

    it('should escalate to manager for emergency keywords', async () => {
      const alert: ComplicationAlert = {
        patientId: 'test-patient-3',
        patientName: 'Emergency Patient',
        patientPhone: '+15551112222',
        message: 'I cant breathe properly after treatment',
        keywords: ['cant breathe'],
        urgency: 'critical'
      }

      const result = await handleComplicationAlert(alert)

      // Should have manager alert for emergency
      const managerAlert = result.alerts.find(a => a.recipientType === 'manager')
      expect(managerAlert).toBeDefined()
      expect(managerAlert?.escalationReason).toBe('emergency')
      expect(result.complicationLog.isEmergency).toBe(true)
    })

    it('should link tracking to notification ID', async () => {
      const alert: ComplicationAlert = {
        patientId: 'test-patient-4',
        patientName: 'Linked Patient',
        patientPhone: '+15553334444',
        message: 'Pain after procedure',
        keywords: ['pain'],
        urgency: 'medium'
      }

      const result = await handleComplicationAlert(alert)

      // Each alert tracking should have a notification ID
      for (const alertTracking of result.alerts) {
        expect(alertTracking.notificationId).toBeDefined()
        expect(alertTracking.notificationId).toMatch(/^notif-/)
      }
    })
  })

  describe('Alert Tracking', () => {
    it('should acknowledge alert with user info', async () => {
      const alert: ComplicationAlert = {
        patientId: 'test-patient-5',
        patientName: 'Ack Test',
        patientPhone: '+15555556666',
        message: 'Minor redness',
        keywords: ['redness'],
        urgency: 'low'
      }

      const result = await handleComplicationAlert(alert)
      const alertId = result.alerts[0].id

      // Acknowledge the alert
      const ackResult = acknowledgeAlert(alertId, 'Dr. Smith')
      expect(ackResult).toBe(true)

      // Verify acknowledgment
      const tracking = getAlertById(alertId)
      expect(tracking?.acknowledged).toBe(true)
      expect(tracking?.acknowledgedBy).toBe('Dr. Smith')
      expect(tracking?.acknowledgedAt).toBeDefined()
    })

    it('should resolve alert with resolution text', async () => {
      const alert: ComplicationAlert = {
        patientId: 'test-patient-6',
        patientName: 'Resolve Test',
        patientPhone: '+15557778888',
        message: 'Small bump',
        keywords: ['bump'],
        urgency: 'medium'
      }

      const result = await handleComplicationAlert(alert)
      const alertId = result.alerts[0].id

      // Resolve the alert
      const resolveResult = resolveAlert(alertId, 'Patient reassured, bump is normal post-filler')
      expect(resolveResult).toBe(true)

      // Verify resolution
      const tracking = getAlertById(alertId)
      expect(tracking?.resolved).toBe(true)
      expect(tracking?.resolution).toBe('Patient reassured, bump is normal post-filler')
      expect(tracking?.resolvedAt).toBeDefined()
    })

    it('should track pending alerts for escalation', async () => {
      const initialPending = getPendingAlerts().length

      const alert: ComplicationAlert = {
        patientId: 'test-patient-7',
        patientName: 'Pending Test',
        patientPhone: '+15559990000',
        message: 'Asymmetry concern',
        keywords: ['asymmetry'],
        urgency: 'high'
      }

      await handleComplicationAlert(alert)

      // Should have new pending alert
      const newPending = getPendingAlerts().length
      expect(newPending).toBeGreaterThan(initialPending)
    })
  })
})
