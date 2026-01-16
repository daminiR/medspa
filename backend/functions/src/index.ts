/**
 * Cloud Functions for Medical Spa Platform
 * Event-driven notifications and scheduled reminders
 *
 * HIPAA Compliance Note:
 * All notification messages are generic and contain no PHI.
 * Patient-specific details are only accessible within the app.
 */

import * as admin from 'firebase-admin';
import {
  onDocumentCreated,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';

import { sendPushNotification, logNotification } from './notifications';
import { scheduleAppointmentReminders, cancelAppointmentReminders } from './tasks';
import { notificationMessages, functionConfig } from './config';
import {
  AppointmentDocument,
  MessageDocument,
  WaitingRoomEntry,
  NotificationPayload,
} from './types';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Set global function configuration
setGlobalOptions({
  region: functionConfig.region,
  maxInstances: functionConfig.maxInstances,
});

// Re-export HTTP functions from reminders module
export { sendScheduledReminder, triggerManualReminder } from './reminders';

/**
 * Trigger: Appointment Created
 * - Sends confirmation push notification
 * - Schedules 24h and 2h reminder tasks
 */
export const onAppointmentCreated = onDocumentCreated(
  'appointments/{appointmentId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data in appointment created event');
      return;
    }

    const appointment = {
      id: event.params.appointmentId,
      ...snapshot.data(),
    } as AppointmentDocument;

    console.log(`New appointment created: ${appointment.id}`);

    try {
      // Step 1: Send confirmation notification (generic, no PHI)
      const confirmationNotification: NotificationPayload = {
        ...notificationMessages.appointmentConfirmed,
        data: {
          type: 'appointment_confirmed',
          appointmentId: appointment.id,
          actionUrl: `/appointments/${appointment.id}`,
        },
      };

      const notificationResult = await sendPushNotification(
        appointment.patientId,
        confirmationNotification
      );

      await logNotification(
        appointment.patientId,
        'appointment_confirmed',
        notificationResult.success,
        { appointmentId: appointment.id }
      );

      // Step 2: Schedule reminder tasks for 24h and 2h before appointment
      const { scheduled, failed } = await scheduleAppointmentReminders(appointment);

      console.log(
        `Appointment ${appointment.id}: Scheduled ${scheduled.length} reminders, ${failed.length} failed`
      );

      // Step 3: Update appointment document with scheduled reminders
      await admin
        .firestore()
        .collection('appointments')
        .doc(appointment.id)
        .update({
          'reminders.scheduled': scheduled,
          'reminders.confirmationSent': admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error(`Error processing new appointment ${appointment.id}:`, error);
      throw error; // Rethrow to mark function as failed
    }
  }
);

/**
 * Trigger: Appointment Updated (status changes)
 * - Handles cancellation notifications
 * - Handles rescheduling (cancel old reminders, schedule new ones)
 */
export const onAppointmentUpdated = onDocumentUpdated(
  'appointments/{appointmentId}',
  async (event) => {
    const beforeData = event.data?.before.data() as AppointmentDocument | undefined;
    const afterData = event.data?.after.data() as AppointmentDocument | undefined;

    if (!beforeData || !afterData) {
      console.log('Missing data in appointment update event');
      return;
    }

    const appointmentId = event.params.appointmentId;

    // Check if appointment was cancelled
    if (beforeData.status !== 'cancelled' && afterData.status === 'cancelled') {
      console.log(`Appointment ${appointmentId} was cancelled`);

      try {
        // Send cancellation notification
        const cancellationNotification: NotificationPayload = {
          ...notificationMessages.appointmentCancelled,
          data: {
            type: 'appointment_cancelled',
            appointmentId,
            actionUrl: '/appointments',
          },
        };

        const result = await sendPushNotification(
          afterData.patientId,
          cancellationNotification
        );

        await logNotification(
          afterData.patientId,
          'appointment_cancelled',
          result.success,
          { appointmentId }
        );

        // Cancel any scheduled reminders
        const cancelledCount = await cancelAppointmentReminders(appointmentId);
        console.log(`Cancelled ${cancelledCount} reminder tasks for ${appointmentId}`);
      } catch (error) {
        console.error(`Error handling cancellation for ${appointmentId}:`, error);
        throw error;
      }

      return;
    }

    // Check if appointment time was changed (reschedule reminders)
    const beforeTime = beforeData.startTime?.toMillis?.() || 0;
    const afterTime = afterData.startTime?.toMillis?.() || 0;

    if (beforeTime !== afterTime && afterData.status !== 'cancelled') {
      console.log(
        `Appointment ${appointmentId} time changed, rescheduling reminders`
      );

      try {
        // Cancel existing reminders
        await cancelAppointmentReminders(appointmentId);

        // Schedule new reminders with updated time
        const appointment: AppointmentDocument = {
          id: appointmentId,
          ...afterData,
        };

        const { scheduled } = await scheduleAppointmentReminders(appointment);

        // Update appointment with new scheduled reminders
        await admin
          .firestore()
          .collection('appointments')
          .doc(appointmentId)
          .update({
            'reminders.scheduled': scheduled,
            'reminders.rescheduledAt': admin.firestore.FieldValue.serverTimestamp(),
          });

        console.log(`Rescheduled ${scheduled.length} reminders for ${appointmentId}`);
      } catch (error) {
        console.error(`Error rescheduling reminders for ${appointmentId}:`, error);
        throw error;
      }
    }
  }
);

/**
 * Trigger: New Message Created
 * - Sends push notification to recipient
 * - Message content is NOT included (HIPAA compliance)
 */
export const onMessageCreated = onDocumentCreated(
  'messages/{conversationId}/items/{messageId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data in message created event');
      return;
    }

    const message = snapshot.data() as MessageDocument;
    const { conversationId, messageId } = event.params;

    console.log(`New message in conversation ${conversationId}: ${messageId}`);

    // Only notify for messages to patients (not from patients)
    if (message.recipientType !== 'patient') {
      console.log('Message recipient is not a patient, skipping notification');
      return;
    }

    try {
      // Send generic notification (no message content - HIPAA compliance)
      const messageNotification: NotificationPayload = {
        ...notificationMessages.newMessage,
        data: {
          type: 'new_message',
          conversationId,
          actionUrl: `/messages/${conversationId}`,
        },
      };

      const result = await sendPushNotification(
        message.recipientId,
        messageNotification
      );

      await logNotification(
        message.recipientId,
        'new_message',
        result.success,
        { conversationId, messageId }
      );

      // Update message with notification sent timestamp
      await admin
        .firestore()
        .collection('messages')
        .doc(conversationId)
        .collection('items')
        .doc(messageId)
        .update({
          notificationSent: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error(`Error sending message notification:`, error);
      throw error;
    }
  }
);

/**
 * Trigger: Waiting Room Status Update
 * - Notifies patient when their room is ready
 */
export const onWaitingRoomReady = onDocumentUpdated(
  'waitingRoom/{locationId}/queue/{patientId}',
  async (event) => {
    const beforeData = event.data?.before.data() as WaitingRoomEntry | undefined;
    const afterData = event.data?.after.data() as WaitingRoomEntry | undefined;

    if (!beforeData || !afterData) {
      console.log('Missing data in waiting room update event');
      return;
    }

    const { locationId, patientId } = event.params;

    // Check if status changed to 'ready'
    if (beforeData.status !== 'ready' && afterData.status === 'ready') {
      console.log(`Room ready for patient ${patientId} at location ${locationId}`);

      try {
        // Send "Your room is ready" notification
        const roomReadyNotification: NotificationPayload = {
          ...notificationMessages.roomReady,
          data: {
            type: 'room_ready',
            appointmentId: afterData.appointmentId,
            actionUrl: `/check-in/${afterData.appointmentId}`,
          },
        };

        const result = await sendPushNotification(patientId, roomReadyNotification);

        await logNotification(patientId, 'room_ready', result.success, {
          locationId,
          appointmentId: afterData.appointmentId,
          roomNumber: afterData.roomNumber,
        });

        // Update waiting room entry with notification timestamp
        await admin
          .firestore()
          .collection('waitingRoom')
          .doc(locationId)
          .collection('queue')
          .doc(patientId)
          .update({
            roomReadyNotificationSent: admin.firestore.FieldValue.serverTimestamp(),
          });
      } catch (error) {
        console.error(`Error sending room ready notification:`, error);
        throw error;
      }
    }
  }
);

/**
 * Trigger: Check-In Enabled
 * - Notifies patient when mobile check-in becomes available (typically 24h before)
 */
export const onCheckInAvailable = onDocumentUpdated(
  'appointments/{appointmentId}',
  async (event) => {
    const beforeData = event.data?.before.data() as AppointmentDocument & {
      checkInEnabled?: boolean;
    } | undefined;
    const afterData = event.data?.after.data() as AppointmentDocument & {
      checkInEnabled?: boolean;
    } | undefined;

    if (!beforeData || !afterData) {
      return;
    }

    const appointmentId = event.params.appointmentId;

    // Check if check-in was just enabled
    if (!beforeData.checkInEnabled && afterData.checkInEnabled) {
      console.log(`Check-in enabled for appointment ${appointmentId}`);

      try {
        const checkInNotification: NotificationPayload = {
          ...notificationMessages.checkInReminder,
          data: {
            type: 'check_in_available',
            appointmentId,
            actionUrl: `/check-in/${appointmentId}`,
          },
        };

        const result = await sendPushNotification(
          afterData.patientId,
          checkInNotification
        );

        await logNotification(
          afterData.patientId,
          'check_in_available',
          result.success,
          { appointmentId }
        );
      } catch (error) {
        console.error(`Error sending check-in notification:`, error);
        // Don't throw - this is a non-critical notification
      }
    }
  }
);
