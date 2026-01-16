/**
 * Waiting Room / Check-In Service
 * Handles all API interactions for virtual waiting room functionality
 */

import { 
  CheckInRequest, 
  CheckInResponse, 
  QueueStatusResponse, 
  PatientQueueStatus,
} from '../types/waiting-room';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class WaitingRoomService {
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
   */
  async pollQueueStatus(
    appointmentId: string,
    callback: (status: PatientQueueStatus) => void,
    intervalMs: number = 10000
  ): Promise<() => void> {
    // Initial fetch
    try {
      const status = await this.getPatientQueueStatus(appointmentId);
      callback(status);
    } catch (error) {
      console.error('Initial poll error:', error);
    }

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
   * Generate QR code data for check-in
   */
  generateQRCodeData(appointmentId: string): string {
    return JSON.stringify({
      type: 'check-in',
      appointmentId,
      timestamp: Date.now(),
    });
  }
}

export const waitingRoomService = new WaitingRoomService();
