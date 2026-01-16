/**
 * Firestore Sync Service
 *
 * Service to sync PostgreSQL changes to Firestore for real-time client updates.
 * This is a HYBRID approach - PostgreSQL remains the source of truth,
 * Firestore is used only for real-time updates to clients.
 *
 * This service is called from:
 * - Route handlers after successful database operations
 * - Webhook handlers for external updates
 * - Cron jobs for batch synchronization
 *
 * Error Handling:
 * - All sync operations are non-blocking (fire-and-forget)
 * - Errors are logged but do not affect the main PostgreSQL operations
 * - Failed syncs can be retried via batch sync methods
 */

import {
  syncAppointmentToFirestore,
  syncMessageToFirestore,
  syncWaitingRoomQueue,
  syncWaitingRoomEntry,
  syncNotification,
  deleteFromFirestore,
  deleteWaitingRoomEntry,
  deleteNotification,
  deleteMessage,
  batchSyncAppointments,
  batchSyncNotifications,
  FirestoreAppointment,
  FirestoreMessage,
  FirestoreWaitingRoomEntry,
  FirestoreNotification,
} from '../lib/firestore';
import { config } from '../config';

// ===================
// Types
// ===================

export type ChangeType = 'created' | 'updated' | 'deleted';

export interface AppointmentData {
  id: string;
  patientId: string;
  patientName: string;
  practitionerId: string;
  practitionerName: string;
  serviceName: string;
  serviceCategory: string;
  startTime: Date | string;
  endTime: Date | string;
  status: string;
  locationId?: string;
  roomId?: string;
}

export interface MessageData {
  id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  channel: 'sms' | 'email' | 'portal';
  status: string;
  senderName?: string;
  senderId?: string;
  mediaUrls?: string[];
  createdAt: Date | string;
}

export interface WaitingRoomData {
  patientId: string;
  patientName: string;
  appointmentId?: string;
  checkInTime: Date | string;
  status: 'waiting' | 'in_progress' | 'completed' | 'no_show';
  estimatedWaitMinutes?: number;
  priority?: number;
  notes?: string;
}

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt?: Date | string;
}

// ===================
// Helper Functions
// ===================

function toISOString(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString();
}

function generateNotificationId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ===================
// Appointment Sync
// ===================

/**
 * Handle appointment change events
 * Called after appointment is created, updated, or deleted in PostgreSQL
 */
export async function onAppointmentChange(
  appointment: AppointmentData,
  changeType: ChangeType
): Promise<void> {
  try {
    if (changeType === 'deleted') {
      // Remove from Firestore
      await deleteFromFirestore('APPOINTMENTS', appointment.id);

      if (config.nodeEnv === 'development') {
        console.log(`[FirestoreSync] Deleted appointment ${appointment.id}`);
      }
      return;
    }

    // Transform to Firestore format
    const firestoreAppointment: FirestoreAppointment = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      practitionerId: appointment.practitionerId,
      practitionerName: appointment.practitionerName,
      serviceName: appointment.serviceName,
      serviceCategory: appointment.serviceCategory,
      startTime: toISOString(appointment.startTime),
      endTime: toISOString(appointment.endTime),
      status: appointment.status,
      locationId: appointment.locationId,
      roomId: appointment.roomId,
      updatedAt: new Date().toISOString(),
    };

    await syncAppointmentToFirestore(firestoreAppointment);

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Synced appointment ${appointment.id} (${changeType})`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error syncing appointment:', error);
    // Don't throw - this should not break the main flow
  }
}

/**
 * Handle appointment status change
 * Convenience method for status-only updates
 */
export async function onAppointmentStatusChange(
  appointmentId: string,
  newStatus: string,
  previousStatus: string
): Promise<void> {
  try {
    // For status changes, we just need to update the status field
    // This is a lightweight update that doesn't need full appointment data
    const { getFirestore } = await import('../lib/firestore');
    const db = await getFirestore();

    await db.collection('appointments').doc(appointmentId).update({
      status: newStatus,
      previousStatus,
      statusUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Updated appointment ${appointmentId} status: ${previousStatus} -> ${newStatus}`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error updating appointment status:', error);
  }
}

// ===================
// Message Sync
// ===================

/**
 * Handle new message sent event
 * Called after message is saved to PostgreSQL
 */
export async function onMessageSent(
  conversationId: string,
  message: MessageData
): Promise<void> {
  try {
    const firestoreMessage: FirestoreMessage = {
      id: message.id,
      conversationId,
      direction: message.direction,
      body: message.body,
      channel: message.channel,
      status: message.status,
      senderName: message.senderName,
      senderId: message.senderId,
      mediaUrls: message.mediaUrls,
      createdAt: toISOString(message.createdAt),
    };

    await syncMessageToFirestore(conversationId, firestoreMessage);

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Synced message ${message.id} to conversation ${conversationId}`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error syncing message:', error);
  }
}

/**
 * Handle message status update (delivered, read, failed, etc.)
 */
export async function onMessageStatusChange(
  conversationId: string,
  messageId: string,
  newStatus: string
): Promise<void> {
  try {
    const { getFirestore } = await import('../lib/firestore');
    const db = await getFirestore();

    await db
      .collection('messages')
      .doc(conversationId)
      .collection('items')
      .doc(messageId)
      .update({
        status: newStatus,
        statusUpdatedAt: new Date().toISOString(),
      });

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Updated message ${messageId} status to ${newStatus}`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error updating message status:', error);
  }
}

/**
 * Handle message deletion
 */
export async function onMessageDeleted(
  conversationId: string,
  messageId: string
): Promise<void> {
  try {
    await deleteMessage(conversationId, messageId);

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Deleted message ${messageId} from conversation ${conversationId}`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error deleting message:', error);
  }
}

// ===================
// Waiting Room Sync
// ===================

/**
 * Handle waiting room update event
 * Called when patient checks in, status changes, or leaves
 */
export async function onWaitingRoomUpdate(
  locationId: string,
  patientId: string,
  status: 'waiting' | 'in_progress' | 'completed' | 'no_show' | 'removed',
  data?: Partial<WaitingRoomData>
): Promise<void> {
  try {
    if (status === 'removed') {
      // Remove patient from waiting room
      await deleteWaitingRoomEntry(locationId, patientId);

      if (config.nodeEnv === 'development') {
        console.log(`[FirestoreSync] Removed patient ${patientId} from waiting room at location ${locationId}`);
      }
      return;
    }

    // Update or add patient to waiting room
    const entry: FirestoreWaitingRoomEntry = {
      patientId,
      patientName: data?.patientName || 'Unknown',
      appointmentId: data?.appointmentId,
      checkInTime: data?.checkInTime ? toISOString(data.checkInTime) : new Date().toISOString(),
      status,
      estimatedWaitMinutes: data?.estimatedWaitMinutes,
      priority: data?.priority,
      notes: data?.notes,
      updatedAt: new Date().toISOString(),
    };

    await syncWaitingRoomEntry(locationId, entry);

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Updated waiting room entry for patient ${patientId} at location ${locationId}`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error updating waiting room:', error);
  }
}

/**
 * Handle full waiting room queue sync
 * Called for initial load or full refresh
 */
export async function syncFullWaitingRoomQueue(
  locationId: string,
  queue: WaitingRoomData[]
): Promise<void> {
  try {
    const firestoreQueue: FirestoreWaitingRoomEntry[] = queue.map(entry => ({
      patientId: entry.patientId,
      patientName: entry.patientName,
      appointmentId: entry.appointmentId,
      checkInTime: toISOString(entry.checkInTime),
      status: entry.status,
      estimatedWaitMinutes: entry.estimatedWaitMinutes,
      priority: entry.priority,
      notes: entry.notes,
      updatedAt: new Date().toISOString(),
    }));

    await syncWaitingRoomQueue(locationId, firestoreQueue);

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Full sync of waiting room queue at location ${locationId} (${queue.length} entries)`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error syncing full waiting room queue:', error);
  }
}

// ===================
// Notification Sync
// ===================

/**
 * Handle notification created event
 * Called when a new notification is created for a user
 */
export async function onNotificationCreated(
  userId: string,
  notification: NotificationData
): Promise<void> {
  try {
    const firestoreNotification: FirestoreNotification = {
      id: notification.id || generateNotificationId(),
      userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      read: false,
      createdAt: notification.createdAt
        ? toISOString(notification.createdAt)
        : new Date().toISOString(),
    };

    await syncNotification(userId, firestoreNotification);

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Created notification ${firestoreNotification.id} for user ${userId}`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error creating notification:', error);
  }
}

/**
 * Handle notification read event
 */
export async function onNotificationRead(
  userId: string,
  notificationId: string
): Promise<void> {
  try {
    const { markNotificationRead } = await import('../lib/firestore');
    await markNotificationRead(userId, notificationId);

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Marked notification ${notificationId} as read for user ${userId}`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error marking notification as read:', error);
  }
}

/**
 * Handle notification deleted event
 */
export async function onNotificationDeleted(
  userId: string,
  notificationId: string
): Promise<void> {
  try {
    await deleteNotification(userId, notificationId);

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Deleted notification ${notificationId} for user ${userId}`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error deleting notification:', error);
  }
}

// ===================
// Batch Sync Methods
// ===================

/**
 * Batch sync appointments from PostgreSQL to Firestore
 * Useful for initial data load or recovery after sync failures
 */
export async function batchSyncAppointmentsFromDB(
  appointments: AppointmentData[]
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  try {
    const firestoreAppointments: FirestoreAppointment[] = appointments.map(apt => ({
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName,
      practitionerId: apt.practitionerId,
      practitionerName: apt.practitionerName,
      serviceName: apt.serviceName,
      serviceCategory: apt.serviceCategory,
      startTime: toISOString(apt.startTime),
      endTime: toISOString(apt.endTime),
      status: apt.status,
      locationId: apt.locationId,
      roomId: apt.roomId,
      updatedAt: new Date().toISOString(),
    }));

    await batchSyncAppointments(firestoreAppointments);
    synced = appointments.length;

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Batch synced ${synced} appointments`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error batch syncing appointments:', error);
    failed = appointments.length;
  }

  return { synced, failed };
}

/**
 * Batch sync notifications for a user
 */
export async function batchSyncUserNotifications(
  userId: string,
  notifications: NotificationData[]
): Promise<{ synced: number; failed: number }> {
  let synced = 0;
  let failed = 0;

  try {
    const firestoreNotifications: FirestoreNotification[] = notifications.map(notif => ({
      id: notif.id || generateNotificationId(),
      userId,
      type: notif.type,
      title: notif.title,
      body: notif.body,
      data: notif.data,
      read: false,
      createdAt: notif.createdAt
        ? toISOString(notif.createdAt)
        : new Date().toISOString(),
    }));

    await batchSyncNotifications(userId, firestoreNotifications);
    synced = notifications.length;

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Batch synced ${synced} notifications for user ${userId}`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error batch syncing notifications:', error);
    failed = notifications.length;
  }

  return { synced, failed };
}

// ===================
// Utility Functions
// ===================

/**
 * Clear all Firestore data for a location's waiting room
 * Useful for end-of-day cleanup or location reset
 */
export async function clearWaitingRoomForLocation(
  locationId: string
): Promise<void> {
  try {
    const { getFirestore } = await import('../lib/firestore');
    const db = await getFirestore();

    const queueRef = db
      .collection('waitingRoom')
      .doc(locationId)
      .collection('queue');

    const snapshot = await queueRef.get();
    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // Reset location metadata
    await db.collection('waitingRoom').doc(locationId).set({
      queueLength: 0,
      clearedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Cleared waiting room for location ${locationId}`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error clearing waiting room:', error);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(
  userId: string
): Promise<void> {
  try {
    const { getFirestore } = await import('../lib/firestore');
    const db = await getFirestore();

    const notificationsRef = db
      .collection('notifications')
      .doc(userId)
      .collection('items')
      .where('read', '==', false);

    const snapshot = await notificationsRef.get();
    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: new Date().toISOString(),
      });
    });

    await batch.commit();

    // Reset unread count
    await db.collection('notifications').doc(userId).update({
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    });

    if (config.nodeEnv === 'development') {
      console.log(`[FirestoreSync] Marked all notifications as read for user ${userId}`);
    }
  } catch (error) {
    console.error('[FirestoreSync] Error marking all notifications as read:', error);
  }
}

// ===================
// Exports
// ===================

export default {
  // Appointment sync
  onAppointmentChange,
  onAppointmentStatusChange,

  // Message sync
  onMessageSent,
  onMessageStatusChange,
  onMessageDeleted,

  // Waiting room sync
  onWaitingRoomUpdate,
  syncFullWaitingRoomQueue,

  // Notification sync
  onNotificationCreated,
  onNotificationRead,
  onNotificationDeleted,

  // Batch sync
  batchSyncAppointmentsFromDB,
  batchSyncUserNotifications,

  // Utilities
  clearWaitingRoomForLocation,
  markAllNotificationsRead,
};
