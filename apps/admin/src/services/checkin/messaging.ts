/**
 * Check-In Process Messaging Service
 * Handles all check-in related SMS communications
 */

import { messagingService, MessageStatus } from '@/services/messaging/core';
import { replaceVariables } from '@/services/messaging/templates';

// Check-in message types
export enum CheckInMessageType {
  PRE_ARRIVAL_15MIN = 'pre_arrival_15min',
  CUSTOM_INSTRUCTIONS = 'custom_instructions',
  WAITING_NOTIFICATION_STAFF = 'waiting_notification_staff',
  PROVIDER_READY = 'provider_ready',
  CHECKIN_CONFIRMATION = 'checkin_confirmation',
}

// Check-in data structures
export interface CheckInAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  providerName: string;
  serviceName: string;
  scheduledTime: Date;
  appointmentAddress?: string;
  parkingInstructions?: string;
  directionsLink?: string;
  specialInstructions?: string;
  estimatedDuration?: number;
  roomNumber?: string;
}

export interface CheckInNotification {
  appointmentId: string;
  patientPhone: string;
  patientName: string;
  messageType: CheckInMessageType;
  sentAt?: Date;
  deliveredAt?: Date;
  status?: 'queued' | 'sent' | 'delivered' | 'failed';
  messageId?: string;
  errorMessage?: string;
}

// Check-in message templates
const CHECKIN_TEMPLATES = {
  [CheckInMessageType.PRE_ARRIVAL_15MIN]: {
    template: 'Hi {{patientFirstName}}! You have your {{serviceName}} appointment in 15 minutes at {{appointmentAddress}}. Check in here: {{checkInLink}} or text HERE when you arrive. {{parkingInfo}}',
    variables: ['patientFirstName', 'serviceName', 'appointmentAddress', 'checkInLink', 'parkingInfo'],
  },
  [CheckInMessageType.CUSTOM_INSTRUCTIONS]: {
    template: 'Hi {{patientFirstName}}, here are your arrival instructions: {{instructions}}',
    variables: ['patientFirstName', 'instructions'],
  },
  [CheckInMessageType.WAITING_NOTIFICATION_STAFF]: {
    template: 'New arrival! {{patientName}} has checked in and is waiting. Service: {{serviceName}} | Room: {{roomNumber}}',
    variables: ['patientName', 'serviceName', 'roomNumber'],
  },
  [CheckInMessageType.PROVIDER_READY]: {
    template: 'Hi {{patientFirstName}}! {{providerName}} is ready for you. Please head to {{roomNumber}} now.',
    variables: ['patientFirstName', 'providerName', 'roomNumber'],
  },
  [CheckInMessageType.CHECKIN_CONFIRMATION]: {
    template: 'You\'re all set, {{patientFirstName}}! Checked in for {{serviceName}} with {{providerName}}. We\'ll let you know when your room is ready.',
    variables: ['patientFirstName', 'serviceName', 'providerName'],
  },
};

/**
 * Check-In Messaging Service
 * Manages all communications during the check-in process
 */
export class CheckInMessagingService {
  private static instance: CheckInMessagingService;
  private checkInHistory: Map<string, CheckInNotification[]> = new Map();

  private constructor() {}

  static getInstance(): CheckInMessagingService {
    if (!CheckInMessagingService.instance) {
      CheckInMessagingService.instance = new CheckInMessagingService();
    }
    return CheckInMessagingService.instance;
  }

  /**
   * Send 15-minute pre-arrival reminder with check-in link
   * Called 15 minutes before scheduled appointment
   */
  async sendPreArrivalReminder(appointment: CheckInAppointment): Promise<MessageStatus> {
    try {
      const template = CHECKIN_TEMPLATES[CheckInMessageType.PRE_ARRIVAL_15MIN];

      // Build check-in link (mobile-friendly URL)
      const checkInLink = `${process.env.NEXT_PUBLIC_BASE_URL}/check-in?apt=${appointment.id}`;

      // Build parking info
      let parkingInfo = '';
      if (appointment.parkingInstructions) {
        parkingInfo = `Parking: ${appointment.parkingInstructions}`;
      }

      const messageBody = replaceVariables(template.template, {
        patientFirstName: appointment.patientName.split(' ')[0],
        serviceName: appointment.serviceName,
        appointmentAddress: appointment.appointmentAddress || 'Luxe Medical Spa',
        checkInLink,
        parkingInfo,
      });

      console.log(`[CheckIn] Sending 15-min pre-arrival reminder to ${appointment.patientPhone}`);
      console.log(`[CheckIn] Message: ${messageBody}`);

      const result = await messagingService.sendSMS({
        to: appointment.patientPhone,
        body: messageBody,
        patientId: appointment.patientId,
        metadata: {
          type: 'checkin_pre_arrival_15min',
          appointmentId: appointment.id,
          checkInLink,
        },
      });

      // Record notification
      await this.recordNotification(appointment.id, appointment.patientPhone, appointment.patientName, CheckInMessageType.PRE_ARRIVAL_15MIN, result);

      return result;
    } catch (error: any) {
      console.error('[CheckIn] Error sending pre-arrival reminder:', error);
      throw new Error(`Failed to send pre-arrival reminder: ${error.message}`);
    }
  }

  /**
   * Send custom arrival instructions (parking, directions, special instructions)
   * Can be triggered manually or automatically based on appointment details
   */
  async sendCustomInstructions(appointment: CheckInAppointment): Promise<MessageStatus> {
    try {
      // Build comprehensive instructions
      let instructions = '';
      const parts: string[] = [];

      if (appointment.directionsLink) {
        parts.push(`Directions: ${appointment.directionsLink}`);
      }

      if (appointment.parkingInstructions) {
        parts.push(`Parking: ${appointment.parkingInstructions}`);
      }

      if (appointment.specialInstructions) {
        parts.push(appointment.specialInstructions);
      }

      if (parts.length === 0) {
        console.log('[CheckIn] No custom instructions to send');
        throw new Error('No custom instructions provided');
      }

      instructions = parts.join(' | ');

      const template = CHECKIN_TEMPLATES[CheckInMessageType.CUSTOM_INSTRUCTIONS];
      const messageBody = replaceVariables(template.template, {
        patientFirstName: appointment.patientName.split(' ')[0],
        instructions,
      });

      console.log(`[CheckIn] Sending custom instructions to ${appointment.patientPhone}`);
      console.log(`[CheckIn] Instructions: ${instructions}`);

      const result = await messagingService.sendSMS({
        to: appointment.patientPhone,
        body: messageBody,
        patientId: appointment.patientId,
        metadata: {
          type: 'checkin_custom_instructions',
          appointmentId: appointment.id,
          instructions,
        },
      });

      await this.recordNotification(appointment.id, appointment.patientPhone, appointment.patientName, CheckInMessageType.CUSTOM_INSTRUCTIONS, result);

      return result;
    } catch (error: any) {
      console.error('[CheckIn] Error sending custom instructions:', error);
      throw new Error(`Failed to send custom instructions: ${error.message}`);
    }
  }

  /**
   * Notify staff that patient has checked in and is waiting
   * Typically sent to staff phone or internal notification system
   */
  async sendWaitingNotificationToStaff(
    appointment: CheckInAppointment,
    staffPhone: string,
    waitingMinutes: number = 0
  ): Promise<MessageStatus> {
    try {
      const template = CHECKIN_TEMPLATES[CheckInMessageType.WAITING_NOTIFICATION_STAFF];

      const messageBody = replaceVariables(template.template, {
        patientName: appointment.patientName,
        serviceName: appointment.serviceName,
        roomNumber: appointment.roomNumber || 'TBD',
      });

      const notificationWithWaitTime = waitingMinutes > 0
        ? `${messageBody} [Waiting ${waitingMinutes}m]`
        : messageBody;

      console.log(`[CheckIn] Notifying staff at ${staffPhone}`);
      console.log(`[CheckIn] Message: ${notificationWithWaitTime}`);

      const result = await messagingService.sendSMS({
        to: staffPhone,
        body: notificationWithWaitTime,
        metadata: {
          type: 'checkin_staff_notification',
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          waitingMinutes,
          internal: true,
        },
      });

      // Note: We don't record this as patient notification, it's staff-only
      return result;
    } catch (error: any) {
      console.error('[CheckIn] Error sending staff notification:', error);
      throw new Error(`Failed to send staff notification: ${error.message}`);
    }
  }

  /**
   * Notify patient that provider is ready and they should come in
   * Sent when treatment room is prepared and provider is available
   */
  async sendProviderReadyNotification(appointment: CheckInAppointment): Promise<MessageStatus> {
    try {
      const template = CHECKIN_TEMPLATES[CheckInMessageType.PROVIDER_READY];

      const messageBody = replaceVariables(template.template, {
        patientFirstName: appointment.patientName.split(' ')[0],
        providerName: appointment.providerName,
        roomNumber: appointment.roomNumber || 'the treatment room',
      });

      console.log(`[CheckIn] Notifying patient provider is ready: ${appointment.patientPhone}`);
      console.log(`[CheckIn] Message: ${messageBody}`);

      const result = await messagingService.sendSMS({
        to: appointment.patientPhone,
        body: messageBody,
        patientId: appointment.patientId,
        metadata: {
          type: 'checkin_provider_ready',
          appointmentId: appointment.id,
          roomNumber: appointment.roomNumber,
        },
      });

      await this.recordNotification(appointment.id, appointment.patientPhone, appointment.patientName, CheckInMessageType.PROVIDER_READY, result);

      return result;
    } catch (error: any) {
      console.error('[CheckIn] Error sending provider ready notification:', error);
      throw new Error(`Failed to send provider ready notification: ${error.message}`);
    }
  }

  /**
   * Send check-in confirmation
   * Sent immediately after patient checks in successfully
   */
  async sendCheckInConfirmation(appointment: CheckInAppointment): Promise<MessageStatus> {
    try {
      const template = CHECKIN_TEMPLATES[CheckInMessageType.CHECKIN_CONFIRMATION];

      const messageBody = replaceVariables(template.template, {
        patientFirstName: appointment.patientName.split(' ')[0],
        serviceName: appointment.serviceName,
        providerName: appointment.providerName,
      });

      console.log(`[CheckIn] Sending check-in confirmation to ${appointment.patientPhone}`);
      console.log(`[CheckIn] Message: ${messageBody}`);

      const result = await messagingService.sendSMS({
        to: appointment.patientPhone,
        body: messageBody,
        patientId: appointment.patientId,
        metadata: {
          type: 'checkin_confirmation',
          appointmentId: appointment.id,
        },
      });

      await this.recordNotification(appointment.id, appointment.patientPhone, appointment.patientName, CheckInMessageType.CHECKIN_CONFIRMATION, result);

      return result;
    } catch (error: any) {
      console.error('[CheckIn] Error sending check-in confirmation:', error);
      throw new Error(`Failed to send check-in confirmation: ${error.message}`);
    }
  }

  /**
   * Send comprehensive check-in reminder package
   * Includes pre-arrival notification, instructions, and confirmation
   */
  async sendCompleteCheckInPackage(
    appointment: CheckInAppointment,
    includeCustomInstructions: boolean = true
  ): Promise<{
    preArrival?: MessageStatus;
    customInstructions?: MessageStatus;
    confirmation?: MessageStatus;
  }> {
    try {
      console.log(`[CheckIn] Sending complete check-in package for appointment ${appointment.id}`);

      const results: any = {};

      // Send pre-arrival reminder
      try {
        results.preArrival = await this.sendPreArrivalReminder(appointment);
        console.log('[CheckIn] Pre-arrival reminder sent successfully');
      } catch (error) {
        console.error('[CheckIn] Pre-arrival reminder failed:', error);
      }

      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 500));

      // Send custom instructions if requested
      if (includeCustomInstructions && (appointment.parkingInstructions || appointment.specialInstructions || appointment.directionsLink)) {
        try {
          results.customInstructions = await this.sendCustomInstructions(appointment);
          console.log('[CheckIn] Custom instructions sent successfully');
        } catch (error) {
          console.error('[CheckIn] Custom instructions failed:', error);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Send confirmation
      try {
        results.confirmation = await this.sendCheckInConfirmation(appointment);
        console.log('[CheckIn] Check-in confirmation sent successfully');
      } catch (error) {
        console.error('[CheckIn] Check-in confirmation failed:', error);
      }

      return results;
    } catch (error: any) {
      console.error('[CheckIn] Error in complete check-in package:', error);
      throw error;
    }
  }

  /**
   * Get check-in notification history for an appointment
   */
  getNotificationHistory(appointmentId: string): CheckInNotification[] {
    return this.checkInHistory.get(appointmentId) || [];
  }

  /**
   * Get all check-in notifications for a patient
   */
  getPatientNotificationHistory(patientId: string): CheckInNotification[] {
    const allNotifications: CheckInNotification[] = [];
    this.checkInHistory.forEach(notifications => {
      allNotifications.push(...notifications);
    });
    return allNotifications;
  }

  /**
   * Clear notification history for an appointment
   */
  clearNotificationHistory(appointmentId: string): void {
    this.checkInHistory.delete(appointmentId);
  }

  // Private helper methods

  private async recordNotification(
    appointmentId: string,
    patientPhone: string,
    patientName: string,
    messageType: CheckInMessageType,
    messageStatus: MessageStatus
  ): Promise<void> {
    const notification: CheckInNotification = {
      appointmentId,
      patientPhone,
      patientName,
      messageType,
      sentAt: new Date(),
      status: messageStatus.status as any,
      messageId: messageStatus.sid,
    };

    // Get existing history or create new
    const history = this.checkInHistory.get(appointmentId) || [];
    history.push(notification);
    this.checkInHistory.set(appointmentId, history);

    console.log(`[CheckIn] Recorded notification: ${messageType} (${messageStatus.sid})`);
  }
}

// Export singleton instance
export const checkInMessagingService = CheckInMessagingService.getInstance();
