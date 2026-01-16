/**
 * Waiting Room / Check-In Service
 * Handles all API interactions for virtual waiting room functionality
 * Includes Firestore real-time listener for instant status updates
 */

import {
  CheckInRequest,
  CheckInResponse,
  QueueStatusResponse,
  PatientQueueStatus,
  WaitingRoomStatus,
} from './types';
import { doc, onSnapshot, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { getFirestoreDb, isFirebaseConfigured } from '@/lib/firebase';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class CheckInService {
  /**
   * Check in a patient for their appointment
   */
  async checkIn(request: CheckInRequest): Promise<CheckInResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/waiting-room/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Check-in failed');
      }

      // Convert date strings to Date objects
      if (data.appointment?.scheduledTime) {
        data.appointment.scheduledTime = new Date(data.appointment.scheduledTime);
      }

      return data;
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  }

  /**
   * Get the current waiting room queue status
   */
  async getQueueStatus(): Promise<QueueStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/waiting-room/queue`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch queue status');
      }

      // Convert date strings to Date objects
      if (data.queue && Array.isArray(data.queue)) {
        data.queue = data.queue.map((entry: any) => ({
          ...entry,
          scheduledTime: new Date(entry.scheduledTime),
          arrivalTime: new Date(entry.arrivalTime),
          roomReadyNotifiedAt: entry.roomReadyNotifiedAt 
            ? new Date(entry.roomReadyNotifiedAt) 
            : undefined,
        }));
      }

      return data;
    } catch (error) {
      console.error('Queue status error:', error);
      throw error;
    }
  }

  /**
   * Get the patient's position in the waiting room queue
   */
  async getPatientQueueStatus(appointmentId: string): Promise<PatientQueueStatus> {
    try {
      const queueResponse = await this.getQueueStatus();
      
      if (!queueResponse.success) {
        throw new Error('Failed to fetch queue status');
      }

      // Find patient's entry in the queue
      const queueEntry = queueResponse.queue.find(
        (entry) => entry.appointmentId === appointmentId
      );

      if (!queueEntry) {
        return {
          isInQueue: false,
        };
      }

      return {
        isInQueue: true,
        position: queueEntry.position,
        estimatedWaitMinutes: queueEntry.estimatedWaitMinutes,
        status: queueEntry.status,
        roomReadyNotifiedAt: queueEntry.roomReadyNotifiedAt,
        queueEntry,
      };
    } catch (error) {
      console.error('Patient queue status error:', error);
      throw error;
    }
  }

  /**
   * Check if a patient can check in (within check-in window)
   * Can check in: 2 hours before to 30 minutes after appointment
   */
  canCheckIn(appointmentDate: Date): boolean {
    const now = new Date();
    const diffInMinutes = (appointmentDate.getTime() - now.getTime()) / (1000 * 60);
    
    // Can check in if appointment is:
    // - Within 2 hours before appointment
    // - Up to 30 minutes after scheduled time
    return diffInMinutes <= 120 && diffInMinutes >= -30;
  }

  /**
   * Check if appointment is today
   */
  isAppointmentToday(appointmentDate: Date): boolean {
    const now = new Date();
    const aptDate = new Date(appointmentDate);
    
    return (
      aptDate.getDate() === now.getDate() &&
      aptDate.getMonth() === now.getMonth() &&
      aptDate.getFullYear() === now.getFullYear()
    );
  }

  /**
   * Poll for queue updates (call repeatedly to get real-time updates)
   * Returns a cleanup function to stop polling
   * @deprecated Use subscribeToQueueStatus for real-time Firestore updates
   */
  pollQueueStatus(
    appointmentId: string,
    callback: (status: PatientQueueStatus) => void,
    intervalMs: number = 10000
  ): () => void {
    // Initial fetch
    this.getPatientQueueStatus(appointmentId)
      .then(callback)
      .catch((error) => console.error('Initial poll error:', error));

    // Set up polling interval
    const intervalId = setInterval(async () => {
      try {
        const status = await this.getPatientQueueStatus(appointmentId);
        callback(status);
      } catch (error) {
        console.error('Poll error:', error);
      }
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  /**
   * Subscribe to real-time queue status updates via Firestore
   * Replaces polling with instant push updates
   * Falls back to polling if Firestore is not configured
   */
  subscribeToQueueStatus(
    locationId: string,
    patientId: string,
    callback: (status: PatientQueueStatus) => void,
    onError?: (error: Error) => void
  ): () => void {
    // Check if Firebase/Firestore is configured
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, falling back to polling');
      // Fall back to polling with 10s interval
      return this.pollQueueStatusByPatient(patientId, callback);
    }

    let unsubscribe: Unsubscribe | null = null;
    let previousStatus: WaitingRoomStatus | null = null;

    try {
      const db = getFirestoreDb();

      // Listen to the patient's queue document
      // Document path: /waitingRoom/{locationId}/queue/{patientId}
      const queueDocRef = doc(db, 'waitingRoom', locationId, 'queue', patientId);

      unsubscribe = onSnapshot(
        queueDocRef,
        (docSnapshot: DocumentSnapshot<DocumentData>) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as DocumentData;

            const status: PatientQueueStatus = {
              isInQueue: true,
              position: data.position,
              estimatedWaitMinutes: data.estimatedWaitMinutes,
              status: data.status as WaitingRoomStatus,
              roomReadyNotifiedAt: data.roomReadyNotifiedAt?.toDate(),
              queueEntry: {
                appointmentId: data.appointmentId,
                patientId: data.patientId,
                patientName: data.patientName,
                phone: data.phone,
                practitionerId: data.practitionerId,
                practitionerName: data.practitionerName,
                serviceName: data.serviceName,
                scheduledTime: data.scheduledTime?.toDate() || new Date(),
                arrivalTime: data.arrivalTime?.toDate() || new Date(),
                status: data.status as WaitingRoomStatus,
                priority: data.priority || 0,
                estimatedWaitMinutes: data.estimatedWaitMinutes,
                position: data.position,
                roomReadyNotifiedAt: data.roomReadyNotifiedAt?.toDate(),
              },
            };

            // Trigger push notification if status changed to 'room_ready'
            if (
              previousStatus !== 'room_ready' &&
              data.status === 'room_ready'
            ) {
              this.triggerRoomReadyNotification(status);
            }

            previousStatus = data.status;
            callback(status);
          } else {
            // Patient not in queue
            callback({ isInQueue: false });
          }
        },
        (error: Error) => {
          console.error('Firestore subscription error:', error);
          if (onError) {
            onError(error);
          }
          // Fall back to polling on error
          unsubscribe = null;
          this.pollQueueStatusByPatient(patientId, callback);
        }
      );
    } catch (error) {
      console.error('Error setting up Firestore listener:', error);
      // Fall back to polling
      return this.pollQueueStatusByPatient(patientId, callback);
    }

    // Return cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  /**
   * Poll for queue updates by patient ID (alternative to appointment ID)
   * Used as fallback when Firestore is not available
   */
  private pollQueueStatusByPatient(
    patientId: string,
    callback: (status: PatientQueueStatus) => void,
    intervalMs: number = 10000
  ): () => void {
    const fetchStatus = async () => {
      try {
        const queueResponse = await this.getQueueStatus();
        if (queueResponse.success) {
          const queueEntry = queueResponse.queue.find(
            (entry) => entry.patientId === patientId
          );

          if (queueEntry) {
            callback({
              isInQueue: true,
              position: queueEntry.position,
              estimatedWaitMinutes: queueEntry.estimatedWaitMinutes,
              status: queueEntry.status,
              roomReadyNotifiedAt: queueEntry.roomReadyNotifiedAt,
              queueEntry,
            });
          } else {
            callback({ isInQueue: false });
          }
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    };

    // Initial fetch
    fetchStatus();

    // Set up polling interval
    const intervalId = setInterval(fetchStatus, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  /**
   * Trigger a push notification when room is ready
   */
  private async triggerRoomReadyNotification(status: PatientQueueStatus) {
    // Show browser notification if permission granted
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        // Note: vibrate is supported by service worker notifications but not standard web Notifications
        const notificationOptions: NotificationOptions = {
          body: `Please proceed to ${status.queueEntry?.practitionerName || 'your provider'}.`,
          icon: '/icons/icon-192x192.png',
          tag: 'room-ready',
          requireInteraction: true,
        };

        const notification = new Notification('Your Room is Ready!', notificationOptions);

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }

    // Dispatch custom event for the app to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('room-ready', { detail: status })
      );
    }
  }

  /**
   * Get time until appointment
   */
  getTimeUntilAppointment(appointmentDate: Date): string {
    const now = new Date();
    const diffMs = appointmentDate.getTime() - now.getTime();
    const diffInMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffInMinutes < 0) {
      return 'Now';
    } else if (diffInMinutes < 60) {
      return `In ${diffInMinutes} min`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const mins = diffInMinutes % 60;
      return `In ${hours}h ${mins}m`;
    }
  }
}

export const checkInService = new CheckInService();
