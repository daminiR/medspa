/**
 * Reminder Handler
 * HTTP function that Cloud Tasks calls when a reminder is due
 * Validates appointment and sends push notification via FCM
 */

import * as admin from 'firebase-admin';
import { onRequest, HttpsError } from 'firebase-functions/v2/https';
import { sendPushNotification, logNotification } from './notifications';
import { notificationMessages, functionConfig } from './config';
import {
  ReminderTaskPayload,
  AppointmentDocument,
  NotificationPayload,
} from './types';

/**
 * Validate that the request is from Cloud Tasks
 */
function validateCloudTasksRequest(req: { headers: { [key: string]: string | string[] | undefined } }): boolean {
  // Check for Cloud Tasks headers
  const taskName = req.headers['x-cloudtasks-taskname'];
  const queueName = req.headers['x-cloudtasks-queuename'];

  // In production, also validate the OIDC token
  // The Cloud Tasks client automatically adds these headers

  return !!(taskName && queueName);
}

/**
 * Get the notification message based on reminder type
 */
function getReminderNotification(
  reminderType: string,
  appointmentId: string
): NotificationPayload {
  switch (reminderType) {
    case '24h':
      return {
        ...notificationMessages.reminder24h,
        data: {
          type: 'appointment_reminder_24h',
          appointmentId,
          actionUrl: `/appointments/${appointmentId}`,
        },
      };
    case '2h':
      return {
        ...notificationMessages.reminder2h,
        data: {
          type: 'appointment_reminder_2h',
          appointmentId,
          actionUrl: `/appointments/${appointmentId}`,
        },
      };
    case 'prep':
      return {
        ...notificationMessages.reminderPrep,
        data: {
          type: 'appointment_prep',
          appointmentId,
          actionUrl: `/appointments/${appointmentId}/prep`,
        },
      };
    default:
      return {
        title: 'Appointment Reminder',
        body: 'You have an upcoming appointment. Open the app for details.',
        data: {
          type: 'appointment_reminder',
          appointmentId,
        },
      };
  }
}

/**
 * HTTP function handler for scheduled reminders
 * Called by Cloud Tasks when a reminder is due
 */
export const sendScheduledReminder = onRequest(
  {
    region: functionConfig.region,
    timeoutSeconds: functionConfig.timeoutSeconds,
    memory: functionConfig.memory,
    maxInstances: functionConfig.maxInstances,
  },
  async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Validate this is a Cloud Tasks request (in production)
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && !validateCloudTasksRequest(req)) {
      console.warn('Invalid Cloud Tasks request');
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Parse the request body
    let payload: ReminderTaskPayload;
    try {
      payload = req.body as ReminderTaskPayload;

      if (!payload.appointmentId || !payload.patientId || !payload.reminderType) {
        throw new Error('Missing required fields');
      }
    } catch (error) {
      console.error('Invalid request body:', error);
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const { appointmentId, patientId, reminderType } = payload;

    console.log(
      `Processing ${reminderType} reminder for appointment ${appointmentId}`
    );

    const db = admin.firestore();

    try {
      // Step 1: Validate appointment still exists
      const appointmentDoc = await db
        .collection('appointments')
        .doc(appointmentId)
        .get();

      if (!appointmentDoc.exists) {
        console.log(`Appointment ${appointmentId} no longer exists, skipping reminder`);
        await logNotification(patientId, `reminder_${reminderType}`, false, {
          reason: 'appointment_not_found',
          appointmentId,
        });
        res.status(200).json({ status: 'skipped', reason: 'appointment_not_found' });
        return;
      }

      const appointment = appointmentDoc.data() as AppointmentDocument;

      // Step 2: Check if appointment is cancelled or completed
      if (
        appointment.status === 'cancelled' ||
        appointment.status === 'completed' ||
        appointment.status === 'no_show'
      ) {
        console.log(
          `Appointment ${appointmentId} is ${appointment.status}, skipping reminder`
        );
        await logNotification(patientId, `reminder_${reminderType}`, false, {
          reason: `appointment_${appointment.status}`,
          appointmentId,
        });
        res.status(200).json({
          status: 'skipped',
          reason: `appointment_${appointment.status}`,
        });
        return;
      }

      // Step 3: Verify appointment time is still in the future
      const now = new Date();
      const appointmentTime = appointment.startTime.toDate();

      if (appointmentTime <= now) {
        console.log(
          `Appointment ${appointmentId} time has passed, skipping reminder`
        );
        await logNotification(patientId, `reminder_${reminderType}`, false, {
          reason: 'appointment_time_passed',
          appointmentId,
        });
        res.status(200).json({ status: 'skipped', reason: 'appointment_time_passed' });
        return;
      }

      // Step 4: Build and send the notification
      const notification = getReminderNotification(reminderType, appointmentId);
      const result = await sendPushNotification(patientId, notification);

      // Step 5: Log the result
      await logNotification(patientId, `reminder_${reminderType}`, result.success, {
        appointmentId,
        failedTokens: result.failedTokens,
      });

      // Step 6: Update appointment with reminder sent timestamp
      await db
        .collection('appointments')
        .doc(appointmentId)
        .update({
          [`reminders.${reminderType}Sent`]: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        `Successfully sent ${reminderType} reminder for appointment ${appointmentId}`
      );

      res.status(200).json({
        status: 'sent',
        success: result.success,
        failedTokens: result.failedTokens.length,
      });
    } catch (error) {
      console.error(
        `Error processing reminder for appointment ${appointmentId}:`,
        error
      );

      await logNotification(patientId, `reminder_${reminderType}`, false, {
        reason: 'processing_error',
        appointmentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Return 500 so Cloud Tasks will retry
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Manual trigger for sending a reminder (for testing/admin use)
 * Requires authentication
 */
export const triggerManualReminder = onRequest(
  {
    region: functionConfig.region,
    timeoutSeconds: functionConfig.timeoutSeconds,
    memory: functionConfig.memory,
  },
  async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Verify admin authentication (implement based on your auth system)
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Parse request
    const { appointmentId, reminderType } = req.body as {
      appointmentId: string;
      reminderType: string;
    };

    if (!appointmentId || !reminderType) {
      res.status(400).json({ error: 'Missing appointmentId or reminderType' });
      return;
    }

    const db = admin.firestore();

    try {
      // Get appointment
      const appointmentDoc = await db
        .collection('appointments')
        .doc(appointmentId)
        .get();

      if (!appointmentDoc.exists) {
        res.status(404).json({ error: 'Appointment not found' });
        return;
      }

      const appointment = appointmentDoc.data() as AppointmentDocument;

      // Send notification
      const notification = getReminderNotification(reminderType, appointmentId);
      const result = await sendPushNotification(appointment.patientId, notification);

      await logNotification(
        appointment.patientId,
        `manual_reminder_${reminderType}`,
        result.success,
        { appointmentId, triggeredBy: 'admin' }
      );

      res.status(200).json({
        status: 'sent',
        success: result.success,
        patientId: appointment.patientId,
      });
    } catch (error) {
      console.error('Error triggering manual reminder:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);
