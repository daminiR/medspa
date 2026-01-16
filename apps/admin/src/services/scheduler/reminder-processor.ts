/**
 * Reminder Processor Service
 * Processes due reminders and triggers message sending
 * Handles timeline-based reminders: 7d, 3d, 1d, 2hr before appointment
 */

import { messageScheduler, ReminderSchedule, ReminderTiming } from './message-scheduler';
import { messagingService } from '../messaging/core';
import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export interface AppointmentForReminder {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: Date;
  appointmentTime: string;
  service: string;
  provider: string;
  timezone: string;
  smsOptIn: boolean;
  remindersSent?: Record<string, boolean>;
}

export interface ProcessingResult {
  timestamp: Date;
  totalProcessed: number;
  remindersSent: number;
  remindersFailed: number;
  errors: Array<{
    appointmentId: string;
    error: string;
  }>;
  byType: {
    '7d': number;
    '3d': number;
    '1d': number;
    '2hr': number;
    total: number;
  };
}

// Validation schema for appointments
const AppointmentForReminderSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  patientPhone: z.string(),
  appointmentDate: z.instanceof(Date),
  appointmentTime: z.string(),
  service: z.string(),
  provider: z.string(),
  timezone: z.string().default('America/New_York'),
  smsOptIn: z.boolean().default(true),
  remindersSent: z.record(z.string(), z.boolean()).optional(),
});

// ============================================================================
// REMINDER PROCESSOR CLASS
// ============================================================================

export class ReminderProcessorService {
  private static instance: ReminderProcessorService;
  private processedAppointments: Set<string> = new Set();
  private reminderTimings = {
    '7d': { hoursBeforeAppointment: 24 * 7, hoursAfterLastCheck: 12 },
    '3d': { hoursBeforeAppointment: 24 * 3, hoursAfterLastCheck: 12 },
    '1d': { hoursBeforeAppointment: 24, hoursAfterLastCheck: 2 },
    '2hr': { hoursBeforeAppointment: 2, hoursAfterLastCheck: 0.5 },
  };

  private constructor() {
    console.log('[ReminderProcessor] Initialized');
  }

  static getInstance(): ReminderProcessorService {
    if (!ReminderProcessorService.instance) {
      ReminderProcessorService.instance = new ReminderProcessorService();
    }
    return ReminderProcessorService.instance;
  }

  // ============================================================================
  // PUBLIC METHODS - MAIN PROCESSING
  // ============================================================================

  /**
   * Main processing method called by cron job
   * Fetches upcoming appointments and schedules due reminders
   */
  async processAllReminders(appointments: AppointmentForReminder[]): Promise<ProcessingResult> {
    const startTime = new Date();

    console.log(`[ReminderProcessor] Starting reminder processing for ${appointments.length} appointments`, {
      timestamp: startTime.toISOString(),
    });

    const result: ProcessingResult = {
      timestamp: startTime,
      totalProcessed: 0,
      remindersSent: 0,
      remindersFailed: 0,
      errors: [],
      byType: {
        '7d': 0,
        '3d': 0,
        '1d': 0,
        '2hr': 0,
        total: 0,
      },
    };

    for (const appointment of appointments) {
      try {
        // Validate appointment
        const validated = AppointmentForReminderSchema.parse(appointment);

        // Check SMS opt-in
        if (!validated.smsOptIn) {
          console.log(
            `[ReminderProcessor] Skipping ${validated.id} - patient opted out of SMS`
          );
          continue;
        }

        result.totalProcessed++;

        // Process reminders for this appointment
        const remindersForAppointment = await this.processAppointmentReminders(validated);

        result.remindersSent += remindersForAppointment.sent;
        result.remindersFailed += remindersForAppointment.failed;
        result.byType['7d'] += remindersForAppointment.byType['7d'];
        result.byType['3d'] += remindersForAppointment.byType['3d'];
        result.byType['1d'] += remindersForAppointment.byType['1d'];
        result.byType['2hr'] += remindersForAppointment.byType['2hr'];
        result.byType.total += remindersForAppointment.byType.total;
      } catch (error: any) {
        console.error(
          `[ReminderProcessor] Error processing appointment ${appointment.id}:`,
          error
        );
        result.errors.push({
          appointmentId: appointment.id,
          error: error.message,
        });
      }
    }

    const duration = new Date().getTime() - startTime.getTime();
    console.log(`[ReminderProcessor] Processing complete in ${duration}ms`, {
      ...result,
      duration,
    });

    return result;
  }

  /**
   * Process reminders for a single appointment
   * Checks all reminder timelines and schedules due ones
   */
  private async processAppointmentReminders(
    appointment: AppointmentForReminder
  ): Promise<{
    sent: number;
    failed: number;
    byType: Record<string, number>;
  }> {
    const now = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    console.log(`[ReminderProcessor] Processing appointment ${appointment.id}`, {
      patientName: appointment.patientName,
      appointmentDate: appointmentDate.toISOString(),
      hoursUntilAppointment: hoursUntilAppointment.toFixed(2),
    });

    const results = {
      sent: 0,
      failed: 0,
      byType: {
        '7d': 0,
        '3d': 0,
        '1d': 0,
        '2hr': 0,
      },
    };

    // Check each reminder type
    const reminderTypes = ['7d', '3d', '1d', '2hr'] as const;

    for (const type of reminderTypes) {
      const timing = this.reminderTimings[type];
      const remindersSent = appointment.remindersSent || {};

      // Skip if already sent
      if (remindersSent[type]) {
        console.log(`[ReminderProcessor] Reminder ${type} already sent for ${appointment.id}`);
        continue;
      }

      // Check if this reminder should be sent now
      if (this.shouldSendReminder(hoursUntilAppointment, timing.hoursBeforeAppointment)) {
        try {
          const scheduled = await this.scheduleReminder(appointment, type);

          if (scheduled) {
            results.sent++;
            results.byType[type]++;

            console.log(`[ReminderProcessor] Scheduled ${type} reminder for ${appointment.id}`, {
              patient: appointment.patientName,
              phone: this.maskPhone(appointment.patientPhone),
            });
          } else {
            results.failed++;
          }
        } catch (error: any) {
          results.failed++;
          console.error(
            `[ReminderProcessor] Error scheduling ${type} reminder for ${appointment.id}:`,
            error.message
          );
        }
      }
    }

    return results;
  }

  /**
   * Determine if a reminder should be sent based on timing
   */
  private shouldSendReminder(hoursUntilAppointment: number, reminderHours: number): boolean {
    // Send reminder within a window (within 1 hour of the ideal time)
    const window = 1;
    return (
      hoursUntilAppointment <= reminderHours + window &&
      hoursUntilAppointment > reminderHours - (24 - window) // Don't re-send multiple times
    );
  }

  /**
   * Schedule a single reminder
   */
  private async scheduleReminder(
    appointment: AppointmentForReminder,
    reminderType: '7d' | '3d' | '1d' | '2hr'
  ): Promise<boolean> {
    try {
      const timing = this.reminderTimings[reminderType];
      const scheduledTime = new Date(appointment.appointmentDate);

      // Calculate scheduled time by subtracting hours
      scheduledTime.setHours(
        scheduledTime.getHours() - timing.hoursBeforeAppointment
      );

      // Generate reminder schedule object
      const schedule: ReminderSchedule = {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientPhone: appointment.patientPhone,
        patientName: appointment.patientName,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        service: appointment.service,
        provider: appointment.provider,
        timezone: appointment.timezone,
        enabled: true,
        reminders: [
          {
            type: reminderType,
            hoursBeforeAppointment: timing.hoursBeforeAppointment,
            sent: false,
          },
        ],
      };

      // Schedule via message scheduler
      await messageScheduler.scheduleAppointmentReminders(schedule);

      return true;
    } catch (error) {
      console.error(`[ReminderProcessor] Error in scheduleReminder:`, error);
      return false;
    }
  }

  // ============================================================================
  // PUBLIC METHODS - SEND IMMEDIATE REMINDERS
  // ============================================================================

  /**
   * Send an immediate reminder (for testing or manual triggers)
   */
  async sendImmediateReminder(
    appointment: AppointmentForReminder,
    reminderType: '7d' | '3d' | '1d' | '2hr' | 'prep'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate
      const validated = AppointmentForReminderSchema.parse(appointment);

      if (!validated.smsOptIn) {
        return { success: false, error: 'Patient opted out of SMS' };
      }

      // Generate message
      const message = this.generateReminderMessage(validated, reminderType);

      if (!message) {
        return { success: false, error: 'Could not generate reminder message' };
      }

      // Send immediately
      const result = await messagingService.sendSMS({
        to: validated.patientPhone,
        body: message,
        patientId: validated.patientId,
        metadata: {
          type: 'appointment_reminder',
          reminderType,
          appointmentId: validated.id,
        },
      });

      if (result.status === 'sent' || result.status === 'queued') {
        console.log(
          `[ReminderProcessor] Sent immediate ${reminderType} reminder to ${validated.patientName}`
        );
        return { success: true };
      } else {
        return { success: false, error: `Failed to send: ${result.status}` };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Retry failed reminders
   */
  async retryFailedReminders(appointmentIds: string[]): Promise<{
    retried: number;
    successful: number;
    failed: number;
  }> {
    console.log(`[ReminderProcessor] Retrying ${appointmentIds.length} failed reminders`);

    let retried = 0;
    let successful = 0;
    let failed = 0;

    // In production, this would fetch appointments from database
    // For now, log the retry request
    for (const appointmentId of appointmentIds) {
      retried++;
      console.log(`[ReminderProcessor] Queued retry for ${appointmentId}`);
    }

    return {
      retried,
      successful,
      failed: retried - successful,
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Generate reminder message based on type
   */
  private generateReminderMessage(
    appointment: AppointmentForReminder,
    reminderType: string
  ): string | null {
    const firstName = appointment.patientName.split(' ')[0];
    const appointmentDate = appointment.appointmentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    switch (reminderType) {
      case '7d':
        return `Hi ${firstName}, your ${appointment.service} appointment is coming up on ${appointmentDate} at ${appointment.appointmentTime}. Remember to follow pre-treatment instructions. See you soon!`;

      case '3d':
        return `Reminder: Your ${appointment.service} with ${appointment.provider} is scheduled for ${appointmentDate} at ${appointment.appointmentTime}. Please arrive 10 minutes early. Reply C to confirm.`;

      case '1d':
        return `Hi ${firstName}! Don't forget your ${appointment.service} appointment tomorrow at ${appointment.appointmentTime}. Avoid alcohol and blood thinners 24 hours before. See you then!`;

      case '2hr':
        return `Hi ${firstName}, see you in 2 hours for your ${appointment.service} at ${appointment.appointmentTime}! If running late, please call us at 555-0100.`;

      case 'prep':
        return `Pre-treatment prep: Avoid aspirin & alcohol 24 hours before your ${appointment.service}. Arrive with clean skin. Questions? Call us at 555-0100!`;

      default:
        return null;
    }
  }

  /**
   * Mask phone number for logging
   */
  private maskPhone(phone: string): string {
    return phone.slice(0, -4) + '****';
  }

  // ============================================================================
  // PUBLIC METHODS - STATISTICS & MONITORING
  // ============================================================================

  /**
   * Get reminder processing statistics
   */
  getStatistics(): {
    processedAppointments: number;
    lastProcessedTime?: Date;
  } {
    return {
      processedAppointments: this.processedAppointments.size,
      lastProcessedTime: undefined, // Would track in production
    };
  }

  /**
   * Clear processing cache
   */
  clearProcessingCache(): void {
    this.processedAppointments.clear();
    console.log('[ReminderProcessor] Cleared processing cache');
  }
}

// Export singleton instance
export const reminderProcessor = ReminderProcessorService.getInstance();
