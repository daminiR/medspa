/**
 * Message Scheduler Service
 * Core scheduling logic for timed messages and reminders
 * Handles scheduling, timezone conversion, and message lifecycle
 */

import { messagingService } from '../messaging/core';
import { remindersService } from '../messaging/reminders';
import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export enum ScheduleFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export interface ScheduledMessage {
  id: string;
  patientId: string;
  phone: string;
  patientName: string;
  body: string;
  scheduledTime: Date;
  frequency?: ScheduleFrequency;
  timezone?: string; // IANA timezone (e.g., 'America/New_York')
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'sent' | 'failed' | 'cancelled' | 'scheduled';
  sentAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
  appointmentId?: string;
}

export interface ReminderSchedule {
  appointmentId: string;
  patientId: string;
  patientPhone: string;
  patientName: string;
  appointmentDate: Date;
  appointmentTime: string;
  service: string;
  provider: string;
  timezone: string;
  reminders: ReminderTiming[];
  enabled: boolean;
}

export interface ReminderTiming {
  type: '7d' | '3d' | '1d' | '2hr' | 'prep' | 'custom';
  hoursBeforeAppointment: number;
  sent: boolean;
  sentAt?: Date;
  message?: string;
}

// Validation schemas
const ScheduledMessageSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  phone: z.string(),
  patientName: z.string(),
  body: z.string().min(1).max(1600),
  scheduledTime: z.instanceof(Date),
  frequency: z.nativeEnum(ScheduleFrequency).optional(),
  timezone: z.string().optional().default('UTC'),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
  status: z.enum(['pending', 'sent', 'failed', 'cancelled', 'scheduled']),
  sentAt: z.instanceof(Date).optional(),
  failureReason: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  appointmentId: z.string().optional(),
});

// ============================================================================
// SCHEDULER SERVICE CLASS
// ============================================================================

export class MessageSchedulerService {
  private static instance: MessageSchedulerService;
  private scheduledMessages: Map<string, ScheduledMessage> = new Map();
  private reminderSchedules: Map<string, ReminderSchedule> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    console.log('[MessageScheduler] Initialized');
  }

  static getInstance(): MessageSchedulerService {
    if (!MessageSchedulerService.instance) {
      MessageSchedulerService.instance = new MessageSchedulerService();
    }
    return MessageSchedulerService.instance;
  }

  // ============================================================================
  // PUBLIC METHODS - MESSAGE SCHEDULING
  // ============================================================================

  /**
   * Schedule a message for future delivery
   * Supports timezone-aware scheduling
   */
  async scheduleMessage(message: Omit<ScheduledMessage, 'id' | 'retryCount' | 'status'> & { status?: never; retryCount?: never }): Promise<string> {
    const id = this.generateScheduleId();

    const scheduled: ScheduledMessage = {
      ...message,
      id,
      retryCount: 0,
      status: 'scheduled',
    };

    // Validate
    const validated = ScheduledMessageSchema.parse(scheduled);

    // Store in-memory (in production, would persist to database)
    this.scheduledMessages.set(id, validated);

    // Calculate delay with timezone support
    const delay = this.calculateDelay(validated.scheduledTime, validated.timezone);

    console.log(`[MessageScheduler] Scheduled message ${id}`, {
      patientId: validated.patientId,
      scheduledFor: validated.scheduledTime.toISOString(),
      delayMs: delay,
      timezone: validated.timezone,
    });

    // Set timer for sending
    if (delay > 0) {
      const timer = setTimeout(
        () => this.sendScheduledMessage(id),
        delay
      );
      this.timers.set(id, timer);
    } else {
      // Send immediately if scheduled time is past
      await this.sendScheduledMessage(id);
    }

    return id;
  }

  /**
   * Schedule appointment reminders with timeline
   * 7 days, 3 days, 1 day, 2 hours before
   */
  async scheduleAppointmentReminders(schedule: ReminderSchedule): Promise<void> {
    this.reminderSchedules.set(schedule.appointmentId, schedule);

    const now = new Date();
    const appointmentDate = new Date(schedule.appointmentDate);

    console.log(`[MessageScheduler] Scheduling appointment reminders for ${schedule.appointmentId}`, {
      patient: schedule.patientName,
      appointment: appointmentDate.toISOString(),
      timezone: schedule.timezone,
    });

    for (const reminder of schedule.reminders) {
      if (reminder.sent) continue;

      // Calculate scheduled time
      const scheduledTime = new Date(appointmentDate);
      scheduledTime.setHours(
        scheduledTime.getHours() - reminder.hoursBeforeAppointment
      );

      // Skip if reminder time is in the past
      if (scheduledTime < now) {
        console.log(`[MessageScheduler] Skipping past reminder for ${schedule.appointmentId}:${reminder.type}`);
        continue;
      }

      // Generate message based on reminder type
      const message = this.generateReminderMessage(schedule, reminder);

      // Schedule the reminder
      await this.scheduleMessage({
        patientId: schedule.patientId,
        phone: schedule.patientPhone,
        patientName: schedule.patientName,
        body: message,
        scheduledTime,
        timezone: schedule.timezone,
        maxRetries: 3,
        metadata: {
          type: 'appointment_reminder',
          reminderType: reminder.type,
          appointmentId: schedule.appointmentId,
        },
        appointmentId: schedule.appointmentId,
      });
    }
  }

  /**
   * Cancel a scheduled message
   */
  async cancelScheduledMessage(scheduleId: string): Promise<boolean> {
    const message = this.scheduledMessages.get(scheduleId);
    if (!message) {
      return false;
    }

    // Clear timer if exists
    const timer = this.timers.get(scheduleId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(scheduleId);
    }

    // Update status
    message.status = 'cancelled';
    this.scheduledMessages.set(scheduleId, message);

    console.log(`[MessageScheduler] Cancelled scheduled message ${scheduleId}`);
    return true;
  }

  /**
   * Get scheduled message status
   */
  getScheduledMessageStatus(scheduleId: string): ScheduledMessage | null {
    return this.scheduledMessages.get(scheduleId) || null;
  }

  /**
   * Get all pending scheduled messages
   */
  getPendingMessages(): ScheduledMessage[] {
    return Array.from(this.scheduledMessages.values()).filter(
      message => message.status === 'pending' || message.status === 'scheduled'
    );
  }

  // ============================================================================
  // PRIVATE METHODS - SCHEDULING LOGIC
  // ============================================================================

  /**
   * Send a scheduled message and handle retries
   */
  private async sendScheduledMessage(scheduleId: string): Promise<void> {
    const message = this.scheduledMessages.get(scheduleId);
    if (!message) {
      console.error(`[MessageScheduler] Message not found: ${scheduleId}`);
      return;
    }

    try {
      console.log(`[MessageScheduler] Sending scheduled message ${scheduleId}`, {
        patientId: message.patientId,
        phone: message.phone,
      });

      // Send via messaging service
      const result = await messagingService.sendSMS({
        to: message.phone,
        body: message.body,
        patientId: message.patientId,
        metadata: message.metadata,
      });

      if (result.status === 'sent' || result.status === 'queued') {
        // Mark as sent
        message.status = 'sent';
        message.sentAt = new Date();
        this.scheduledMessages.set(scheduleId, message);

        console.log(`[MessageScheduler] Message sent: ${scheduleId}`, {
          sid: result.sid,
          sentAt: message.sentAt.toISOString(),
        });

        // Handle recurring messages
        if (message.frequency && message.frequency !== ScheduleFrequency.ONCE) {
          await this.rescheduleRecurringMessage(message);
        }
      } else {
        throw new Error(`Failed to send: ${result.status}`);
      }
    } catch (error: any) {
      console.error(`[MessageScheduler] Error sending message ${scheduleId}:`, error);

      message.retryCount += 1;
      message.failureReason = error.message;

      if (message.retryCount < message.maxRetries) {
        // Retry with exponential backoff
        const backoffMs = Math.min(1000 * Math.pow(2, message.retryCount), 60000);
        message.status = 'pending';

        this.scheduledMessages.set(scheduleId, message);

        console.log(`[MessageScheduler] Retrying message ${scheduleId} in ${backoffMs}ms (attempt ${message.retryCount}/${message.maxRetries})`);

        const timer = setTimeout(
          () => this.sendScheduledMessage(scheduleId),
          backoffMs
        );
        this.timers.set(scheduleId, timer);
      } else {
        // Give up after max retries
        message.status = 'failed';
        this.scheduledMessages.set(scheduleId, message);

        console.error(
          `[MessageScheduler] Message failed after ${message.maxRetries} retries: ${scheduleId}`,
          { reason: message.failureReason }
        );
      }
    }
  }

  /**
   * Reschedule recurring messages
   */
  private async rescheduleRecurringMessage(message: ScheduledMessage): Promise<void> {
    if (!message.frequency || message.frequency === ScheduleFrequency.ONCE) {
      return;
    }

    const nextScheduledTime = new Date(message.scheduledTime);

    switch (message.frequency) {
      case ScheduleFrequency.DAILY:
        nextScheduledTime.setDate(nextScheduledTime.getDate() + 1);
        break;
      case ScheduleFrequency.WEEKLY:
        nextScheduledTime.setDate(nextScheduledTime.getDate() + 7);
        break;
      case ScheduleFrequency.MONTHLY:
        nextScheduledTime.setMonth(nextScheduledTime.getMonth() + 1);
        break;
    }

    console.log(`[MessageScheduler] Rescheduling recurring message`, {
      originalId: message.id,
      nextScheduledTime: nextScheduledTime.toISOString(),
      frequency: message.frequency,
    });

    // Schedule next occurrence (exclude id, status, retryCount as they're set by scheduleMessage)
    const { id: _id, status: _status, retryCount: _retryCount, ...messageWithoutManagedFields } = message;
    await this.scheduleMessage({
      ...messageWithoutManagedFields,
      scheduledTime: nextScheduledTime,
    });
  }

  /**
   * Calculate delay accounting for timezone
   * Returns milliseconds until the scheduled time in the patient's timezone
   */
  private calculateDelay(scheduledTime: Date, timezone: string = 'UTC'): number {
    try {
      // Get current time in the patient's timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const parts = formatter.formatToParts(new Date());
      const partsObj: Record<string, string> = {};

      for (const part of parts) {
        if (part.type !== 'literal') {
          partsObj[part.type] = part.value;
        }
      }

      const localNow = new Date(
        `${partsObj.year}-${partsObj.month}-${partsObj.day}T${partsObj.hour}:${partsObj.minute}:${partsObj.second}`
      );

      // Get scheduled time in the patient's timezone representation
      const scheduledInTimezone = new Date(
        scheduledTime.toLocaleString('en-US', { timeZone: timezone })
      );

      const delayMs = scheduledInTimezone.getTime() - localNow.getTime();

      console.log(`[MessageScheduler] Timezone calculation for ${timezone}:`, {
        scheduled: scheduledTime.toISOString(),
        localNow: localNow.toISOString(),
        scheduledInTimezone: scheduledInTimezone.toISOString(),
        delayMs,
      });

      return Math.max(0, delayMs);
    } catch (error) {
      console.error(`[MessageScheduler] Error calculating timezone delay for ${timezone}:`, error);
      // Fall back to simple UTC calculation
      return Math.max(0, scheduledTime.getTime() - new Date().getTime());
    }
  }

  /**
   * Generate reminder message based on type
   */
  private generateReminderMessage(schedule: ReminderSchedule, reminder: ReminderTiming): string {
    const firstName = schedule.patientName.split(' ')[0];
    const appointmentDate = schedule.appointmentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    switch (reminder.type) {
      case '7d':
        return `Hi ${firstName}, your ${schedule.service} appointment is coming up on ${appointmentDate} at ${schedule.appointmentTime}. Remember to follow pre-treatment instructions. See you soon!`;
      case '3d':
        return `Reminder: Your ${schedule.service} with ${schedule.provider} is on ${appointmentDate} at ${schedule.appointmentTime}. Please arrive 10 minutes early. Reply C to confirm.`;
      case '1d':
        return `Hi ${firstName}! Don't forget your ${schedule.service} appointment tomorrow at ${schedule.appointmentTime}. Avoid alcohol and blood thinners 24 hours before. See you then!`;
      case '2hr':
        return `Hi ${firstName}, see you in 2 hours for your ${schedule.service} at ${schedule.appointmentTime}! If running late, please call us.`;
      case 'prep':
        return `Pre-treatment prep reminder: Avoid aspirin and alcohol 24 hours before your ${schedule.service}. Arrive with clean skin. Call us with questions!`;
      case 'custom':
        return reminder.message || `Appointment reminder for ${schedule.appointmentDate.toISOString()}`;
      default:
        return `Appointment reminder for your ${schedule.service} on ${appointmentDate} at ${schedule.appointmentTime}`;
    }
  }

  /**
   * Generate unique schedule ID
   */
  private generateScheduleId(): string {
    return `sch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // ============================================================================
  // PUBLIC METHODS - QUEUE PROCESSING
  // ============================================================================

  /**
   * Process all due scheduled messages
   * Called by cron job to send messages whose scheduled time has arrived
   */
  async processDueMessages(): Promise<{ processed: number; sent: number; failed: number }> {
    const now = new Date();
    const pending = this.getPendingMessages();

    let processed = 0;
    let sent = 0;
    let failed = 0;

    console.log(`[MessageScheduler] Processing ${pending.length} pending messages`);

    for (const message of pending) {
      if (message.scheduledTime <= now) {
        processed++;
        try {
          await this.sendScheduledMessage(message.id);
          sent++;
        } catch (error) {
          failed++;
        }
      }
    }

    console.log(`[MessageScheduler] Processing complete`, {
      processed,
      sent,
      failed,
    });

    return { processed, sent, failed };
  }

  /**
   * Clean up old completed messages
   */
  async cleanupOldMessages(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let cleaned = 0;

    const entries = Array.from(this.scheduledMessages.entries());
    for (const [id, message] of entries) {
      if (
        (message.status === 'sent' || message.status === 'failed' || message.status === 'cancelled') &&
        message.sentAt &&
        message.sentAt < cutoffDate
      ) {
        this.scheduledMessages.delete(id);
        cleaned++;
      }
    }

    console.log(`[MessageScheduler] Cleaned up ${cleaned} old messages`);
    return cleaned;
  }

  /**
   * Get statistics on scheduled messages
   */
  getStats(): {
    total: number;
    pending: number;
    sent: number;
    failed: number;
    cancelled: number;
  } {
    let total = 0;
    let pending = 0;
    let sent = 0;
    let failed = 0;
    let cancelled = 0;

    const messages = Array.from(this.scheduledMessages.values());
    for (const message of messages) {
      total++;
      if (message.status === 'pending' || message.status === 'scheduled') {
        pending++;
      } else if (message.status === 'sent') {
        sent++;
      } else if (message.status === 'failed') {
        failed++;
      } else if (message.status === 'cancelled') {
        cancelled++;
      }
    }

    return {
      total,
      pending,
      sent,
      failed,
      cancelled,
    };
  }
}

// Export singleton instance
export const messageScheduler = MessageSchedulerService.getInstance();
