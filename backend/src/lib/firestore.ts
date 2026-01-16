/**
 * Firestore Library
 *
 * Provides Firestore Admin SDK initialization and helper functions for real-time sync.
 * This is a HYBRID approach - PostgreSQL remains the source of truth,
 * Firestore is used only for real-time updates to clients.
 *
 * Collections Structure:
 * - /appointments/{id} - appointment real-time status
 * - /messages/{conversationId}/items/{messageId} - chat messages
 * - /waitingRoom/{locationId}/queue/{patientId} - waiting room queue
 * - /notifications/{userId}/items/{notificationId} - user notifications
 */

import { config } from '../config';

// ===================
// Types
// ===================

export interface FirestoreAppointment {
  id: string;
  patientId: string;
  patientName: string;
  practitionerId: string;
  practitionerName: string;
  serviceName: string;
  serviceCategory: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: string;
  locationId?: string;
  roomId?: string;
  updatedAt: string; // ISO string
}

export interface FirestoreMessage {
  id: string;
  conversationId: string;
  direction: 'inbound' | 'outbound';
  body: string;
  channel: 'sms' | 'email' | 'portal';
  status: string;
  senderName?: string;
  senderId?: string;
  mediaUrls?: string[];
  createdAt: string; // ISO string
}

export interface FirestoreWaitingRoomEntry {
  patientId: string;
  patientName: string;
  appointmentId?: string;
  checkInTime: string; // ISO string
  status: 'waiting' | 'in_progress' | 'completed' | 'no_show';
  estimatedWaitMinutes?: number;
  priority?: number;
  notes?: string;
  updatedAt: string; // ISO string
}

export interface FirestoreNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string; // ISO string
}

// ===================
// Firebase Admin Initialization
// ===================

let firebaseAdmin: typeof import('firebase-admin') | null = null;
let firestoreDb: FirebaseFirestore.Firestore | null = null;

/**
 * Get or initialize Firebase Admin SDK
 * Uses GOOGLE_APPLICATION_CREDENTIALS environment variable if available,
 * otherwise falls back to config-based credentials or application default
 */
async function getFirebaseAdmin(): Promise<typeof import('firebase-admin')> {
  if (!firebaseAdmin) {
    const admin = await import('firebase-admin');

    // Initialize only once
    if (admin.apps.length === 0) {
      // Check for GOOGLE_APPLICATION_CREDENTIALS (service account JSON file path)
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Use service account file
        admin.initializeApp({
          projectId: config.firebaseProjectId,
          credential: admin.credential.applicationDefault(),
        });
      } else if (config.firebaseClientEmail && config.firebasePrivateKey) {
        // Use config-based credentials
        admin.initializeApp({
          projectId: config.firebaseProjectId,
          credential: admin.credential.cert({
            projectId: config.firebaseProjectId,
            clientEmail: config.firebaseClientEmail,
            privateKey: config.firebasePrivateKey,
          }),
        });
      } else {
        // Fall back to application default credentials (for Cloud Run, GCE, etc.)
        admin.initializeApp({
          projectId: config.firebaseProjectId,
          credential: admin.credential.applicationDefault(),
        });
      }
    }

    firebaseAdmin = admin;
  }

  return firebaseAdmin;
}

/**
 * Get Firestore database instance
 */
async function getFirestore(): Promise<FirebaseFirestore.Firestore> {
  if (!firestoreDb) {
    const admin = await getFirebaseAdmin();
    firestoreDb = admin.firestore();

    // Set Firestore settings
    firestoreDb.settings({
      ignoreUndefinedProperties: true,
    });
  }

  return firestoreDb;
}

// ===================
// Collection References
// ===================

const COLLECTIONS = {
  APPOINTMENTS: 'appointments',
  MESSAGES: 'messages',
  WAITING_ROOM: 'waitingRoom',
  NOTIFICATIONS: 'notifications',
} as const;

// ===================
// Helper Functions
// ===================

/**
 * Sync appointment status changes to Firestore
 * Called when appointment is created, updated, or status changes
 */
export async function syncAppointmentToFirestore(
  appointment: FirestoreAppointment
): Promise<void> {
  try {
    const db = await getFirestore();
    const docRef = db.collection(COLLECTIONS.APPOINTMENTS).doc(appointment.id);

    await docRef.set(
      {
        ...appointment,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    if (config.nodeEnv === 'development') {
      console.log(`[Firestore] Synced appointment ${appointment.id} to Firestore`);
    }
  } catch (error) {
    console.error('[Firestore] Error syncing appointment:', error);
    // Don't throw - Firestore sync should not break the main flow
    // PostgreSQL is the source of truth
  }
}

/**
 * Sync new message to Firestore
 * Messages are stored in a subcollection under the conversation
 */
export async function syncMessageToFirestore(
  conversationId: string,
  message: FirestoreMessage
): Promise<void> {
  try {
    const db = await getFirestore();
    const docRef = db
      .collection(COLLECTIONS.MESSAGES)
      .doc(conversationId)
      .collection('items')
      .doc(message.id);

    await docRef.set({
      ...message,
      conversationId,
    });

    // Also update the conversation's last message metadata
    const conversationRef = db.collection(COLLECTIONS.MESSAGES).doc(conversationId);
    await conversationRef.set(
      {
        lastMessageId: message.id,
        lastMessageAt: message.createdAt,
        lastMessagePreview: message.body.substring(0, 100),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    if (config.nodeEnv === 'development') {
      console.log(`[Firestore] Synced message ${message.id} to conversation ${conversationId}`);
    }
  } catch (error) {
    console.error('[Firestore] Error syncing message:', error);
  }
}

/**
 * Sync waiting room queue to Firestore
 * Queue is stored per location with patient entries as subcollection
 */
export async function syncWaitingRoomQueue(
  locationId: string,
  queue: FirestoreWaitingRoomEntry[]
): Promise<void> {
  try {
    const db = await getFirestore();
    const locationRef = db.collection(COLLECTIONS.WAITING_ROOM).doc(locationId);

    // Use a batch to update all entries atomically
    const batch = db.batch();

    // Update location metadata
    batch.set(
      locationRef,
      {
        queueLength: queue.length,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Update each queue entry
    for (const entry of queue) {
      const entryRef = locationRef.collection('queue').doc(entry.patientId);
      batch.set(entryRef, {
        ...entry,
        locationId,
      });
    }

    await batch.commit();

    if (config.nodeEnv === 'development') {
      console.log(`[Firestore] Synced waiting room queue for location ${locationId} (${queue.length} entries)`);
    }
  } catch (error) {
    console.error('[Firestore] Error syncing waiting room queue:', error);
  }
}

/**
 * Sync single waiting room entry
 * Use this for individual patient status updates
 */
export async function syncWaitingRoomEntry(
  locationId: string,
  entry: FirestoreWaitingRoomEntry
): Promise<void> {
  try {
    const db = await getFirestore();
    const entryRef = db
      .collection(COLLECTIONS.WAITING_ROOM)
      .doc(locationId)
      .collection('queue')
      .doc(entry.patientId);

    await entryRef.set({
      ...entry,
      locationId,
      updatedAt: new Date().toISOString(),
    });

    if (config.nodeEnv === 'development') {
      console.log(`[Firestore] Synced waiting room entry for patient ${entry.patientId}`);
    }
  } catch (error) {
    console.error('[Firestore] Error syncing waiting room entry:', error);
  }
}

/**
 * Add notification to user's notification feed
 */
export async function syncNotification(
  userId: string,
  notification: FirestoreNotification
): Promise<void> {
  try {
    const db = await getFirestore();
    const notificationRef = db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .doc(userId)
      .collection('items')
      .doc(notification.id);

    await notificationRef.set({
      ...notification,
      userId,
    });

    // Update user's unread count
    const userRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc(userId);
    const admin = await getFirebaseAdmin();
    await userRef.set(
      {
        unreadCount: admin.firestore.FieldValue.increment(1),
        lastNotificationAt: notification.createdAt,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    if (config.nodeEnv === 'development') {
      console.log(`[Firestore] Synced notification ${notification.id} for user ${userId}`);
    }
  } catch (error) {
    console.error('[Firestore] Error syncing notification:', error);
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<void> {
  try {
    const db = await getFirestore();
    const notificationRef = db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .doc(userId)
      .collection('items')
      .doc(notificationId);

    await notificationRef.update({
      read: true,
      readAt: new Date().toISOString(),
    });

    // Decrement unread count
    const userRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc(userId);
    const admin = await getFirebaseAdmin();
    await userRef.update({
      unreadCount: admin.firestore.FieldValue.increment(-1),
    });

    if (config.nodeEnv === 'development') {
      console.log(`[Firestore] Marked notification ${notificationId} as read for user ${userId}`);
    }
  } catch (error) {
    console.error('[Firestore] Error marking notification as read:', error);
  }
}

/**
 * Delete document from Firestore
 * Used when data is deleted from PostgreSQL
 */
export async function deleteFromFirestore(
  collection: keyof typeof COLLECTIONS,
  docId: string
): Promise<void> {
  try {
    const db = await getFirestore();
    const collectionName = COLLECTIONS[collection];
    const docRef = db.collection(collectionName).doc(docId);

    await docRef.delete();

    if (config.nodeEnv === 'development') {
      console.log(`[Firestore] Deleted document ${docId} from ${collectionName}`);
    }
  } catch (error) {
    console.error('[Firestore] Error deleting document:', error);
  }
}

/**
 * Delete waiting room entry from Firestore
 */
export async function deleteWaitingRoomEntry(
  locationId: string,
  patientId: string
): Promise<void> {
  try {
    const db = await getFirestore();
    const entryRef = db
      .collection(COLLECTIONS.WAITING_ROOM)
      .doc(locationId)
      .collection('queue')
      .doc(patientId);

    await entryRef.delete();

    if (config.nodeEnv === 'development') {
      console.log(`[Firestore] Deleted waiting room entry for patient ${patientId} at location ${locationId}`);
    }
  } catch (error) {
    console.error('[Firestore] Error deleting waiting room entry:', error);
  }
}

/**
 * Delete notification from Firestore
 */
export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  try {
    const db = await getFirestore();
    const notificationRef = db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .doc(userId)
      .collection('items')
      .doc(notificationId);

    // Check if notification was unread before deleting
    const doc = await notificationRef.get();
    const wasUnread = doc.exists && !doc.data()?.read;

    await notificationRef.delete();

    // Decrement unread count if needed
    if (wasUnread) {
      const userRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc(userId);
      const admin = await getFirebaseAdmin();
      await userRef.update({
        unreadCount: admin.firestore.FieldValue.increment(-1),
      });
    }

    if (config.nodeEnv === 'development') {
      console.log(`[Firestore] Deleted notification ${notificationId} for user ${userId}`);
    }
  } catch (error) {
    console.error('[Firestore] Error deleting notification:', error);
  }
}

/**
 * Delete message from Firestore
 */
export async function deleteMessage(
  conversationId: string,
  messageId: string
): Promise<void> {
  try {
    const db = await getFirestore();
    const messageRef = db
      .collection(COLLECTIONS.MESSAGES)
      .doc(conversationId)
      .collection('items')
      .doc(messageId);

    await messageRef.delete();

    if (config.nodeEnv === 'development') {
      console.log(`[Firestore] Deleted message ${messageId} from conversation ${conversationId}`);
    }
  } catch (error) {
    console.error('[Firestore] Error deleting message:', error);
  }
}

// ===================
// Batch Operations
// ===================

/**
 * Batch sync multiple appointments
 * Useful for initial data load or bulk updates
 */
export async function batchSyncAppointments(
  appointments: FirestoreAppointment[]
): Promise<void> {
  try {
    if (appointments.length === 0) return;

    const db = await getFirestore();
    const batch = db.batch();

    for (const appointment of appointments) {
      const docRef = db.collection(COLLECTIONS.APPOINTMENTS).doc(appointment.id);
      batch.set(docRef, {
        ...appointment,
        updatedAt: new Date().toISOString(),
      });
    }

    await batch.commit();

    if (config.nodeEnv === 'development') {
      console.log(`[Firestore] Batch synced ${appointments.length} appointments`);
    }
  } catch (error) {
    console.error('[Firestore] Error batch syncing appointments:', error);
  }
}

/**
 * Batch sync multiple notifications
 */
export async function batchSyncNotifications(
  userId: string,
  notifications: FirestoreNotification[]
): Promise<void> {
  try {
    if (notifications.length === 0) return;

    const db = await getFirestore();
    const batch = db.batch();

    for (const notification of notifications) {
      const docRef = db
        .collection(COLLECTIONS.NOTIFICATIONS)
        .doc(userId)
        .collection('items')
        .doc(notification.id);
      batch.set(docRef, {
        ...notification,
        userId,
      });
    }

    await batch.commit();

    if (config.nodeEnv === 'development') {
      console.log(`[Firestore] Batch synced ${notifications.length} notifications for user ${userId}`);
    }
  } catch (error) {
    console.error('[Firestore] Error batch syncing notifications:', error);
  }
}

// ===================
// Exports
// ===================

export {
  getFirebaseAdmin,
  getFirestore,
  COLLECTIONS,
};

export default {
  syncAppointmentToFirestore,
  syncMessageToFirestore,
  syncWaitingRoomQueue,
  syncWaitingRoomEntry,
  syncNotification,
  markNotificationRead,
  deleteFromFirestore,
  deleteWaitingRoomEntry,
  deleteNotification,
  deleteMessage,
  batchSyncAppointments,
  batchSyncNotifications,
};
