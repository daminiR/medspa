/**
 * Push Notification Service
 * Uses Firebase Cloud Messaging (FCM) for push notifications
 * HIPAA-compliant: No PHI in notification payloads
 */

import * as admin from 'firebase-admin';
import { NotificationPayload, PatientDocument } from './types';

/**
 * Send push notification to a patient
 * @param patientId - The patient's ID
 * @param notification - The notification payload (HIPAA-compliant)
 * @returns Promise resolving to success status
 */
export async function sendPushNotification(
  patientId: string,
  notification: NotificationPayload
): Promise<{ success: boolean; failedTokens: string[] }> {
  const db = admin.firestore();
  const failedTokens: string[] = [];

  try {
    // Get patient's FCM tokens
    const patientDoc = await db.collection('patients').doc(patientId).get();

    if (!patientDoc.exists) {
      console.log(`Patient ${patientId} not found`);
      return { success: false, failedTokens: [] };
    }

    const patient = patientDoc.data() as PatientDocument;

    // Check if push notifications are enabled
    if (patient.notificationPreferences?.pushEnabled === false) {
      console.log(`Push notifications disabled for patient ${patientId}`);
      return { success: true, failedTokens: [] };
    }

    const fcmTokens = patient.fcmTokens || [];

    if (fcmTokens.length === 0) {
      console.log(`No FCM tokens for patient ${patientId}`);
      return { success: true, failedTokens: [] };
    }

    // Build FCM message
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data
        ? Object.fromEntries(
            Object.entries(notification.data).map(([k, v]) => [k, String(v)])
          )
        : undefined,
      tokens: fcmTokens,
      android: {
        priority: 'high',
        notification: {
          channelId: 'medspa_notifications',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body,
            },
            badge: 1,
            sound: 'default',
          },
        },
      },
    };

    // Send multicast message
    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(
      `Sent notification to ${patientId}: ${response.successCount} success, ${response.failureCount} failed`
    );

    // Track failed tokens for cleanup
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          // Remove invalid or unregistered tokens
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            failedTokens.push(fcmTokens[idx]);
          }
          console.error(
            `Failed to send to token ${idx}: ${resp.error?.message}`
          );
        }
      });

      // Clean up invalid tokens
      if (failedTokens.length > 0) {
        await cleanupInvalidTokens(patientId, failedTokens);
      }
    }

    return {
      success: response.successCount > 0,
      failedTokens,
    };
  } catch (error) {
    console.error(`Error sending notification to ${patientId}:`, error);
    return { success: false, failedTokens };
  }
}

/**
 * Remove invalid FCM tokens from patient document
 */
async function cleanupInvalidTokens(
  patientId: string,
  invalidTokens: string[]
): Promise<void> {
  const db = admin.firestore();

  try {
    await db
      .collection('patients')
      .doc(patientId)
      .update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
      });
    console.log(`Cleaned up ${invalidTokens.length} invalid tokens for ${patientId}`);
  } catch (error) {
    console.error(`Error cleaning up tokens for ${patientId}:`, error);
  }
}

/**
 * Send notification to multiple patients
 * @param patientIds - Array of patient IDs
 * @param notification - The notification payload
 */
export async function sendBulkNotification(
  patientIds: string[],
  notification: NotificationPayload
): Promise<{ totalSuccess: number; totalFailed: number }> {
  let totalSuccess = 0;
  let totalFailed = 0;

  // Process in batches of 10 to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < patientIds.length; i += batchSize) {
    const batch = patientIds.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((patientId) => sendPushNotification(patientId, notification))
    );

    results.forEach((result) => {
      if (result.success) {
        totalSuccess++;
      } else {
        totalFailed++;
      }
    });
  }

  return { totalSuccess, totalFailed };
}

/**
 * Log notification for audit trail
 */
export async function logNotification(
  patientId: string,
  notificationType: string,
  success: boolean,
  metadata?: Record<string, unknown>
): Promise<void> {
  const db = admin.firestore();

  try {
    await db.collection('notificationLogs').add({
      patientId,
      notificationType,
      success,
      metadata: metadata || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}
