/**
 * Appointment Reminders Service
 * Automated reminder system for Luxe Medical Spa
 */

import { messagingService } from './core';
import { TEMPLATES, generateMessage } from './templates';
import { aiEngine } from './ai-engine';

// Reminder types and timing
export enum ReminderType {
  CONFIRMATION = 'confirmation',      // Immediate after booking
  REMINDER_48HR = 'reminder_48hr',    // 48 hours before
  REMINDER_24HR = 'reminder_24hr',    // 24 hours before  
  REMINDER_2HR = 'reminder_2hr',      // 2 hours before
  FOLLOWUP_24HR = 'followup_24hr',    // 24 hours after
  FOLLOWUP_3DAY = 'followup_3day',    // 3 days after
  FOLLOWUP_1WEEK = 'followup_1week',  // 1 week after
  FOLLOWUP_2WEEK = 'followup_2week',  // 2 weeks after
  NO_SHOW = 'no_show',                // 1 hour after missed
}

// Appointment data structure
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  service: string;
  provider: string;
  date: Date;
  time: string;
  duration: number; // minutes
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  smsOptIn: boolean;
  emailOptIn: boolean;
  reminders: {
    confirmation?: Date;
    reminder48hr?: Date;
    reminder24hr?: Date;
    reminder2hr?: Date;
    followup24hr?: Date;
    followup3day?: Date;
    followup1week?: Date;
    followup2week?: Date;
  };
  notes?: string;
  treatmentType?: string;
}

// Service configuration
export interface ReminderConfig {
  enabled: boolean;
  sendConfirmation: boolean;
  send48hrReminder: boolean;
  send24hrReminder: boolean;
  send2hrReminder: boolean;
  sendFollowUps: boolean;
  businessHours: {
    start: string; // "09:00"
    end: string;   // "18:00"
  };
  quietHours: {
    start: string; // "21:00"
    end: string;   // "08:00"
  };
  timezone: string; // "America/New_York"
}

const defaultConfig: ReminderConfig = {
  enabled: true,
  sendConfirmation: true,
  send48hrReminder: true,
  send24hrReminder: true,
  send2hrReminder: true,
  sendFollowUps: true,
  businessHours: {
    start: '09:00',
    end: '18:00',
  },
  quietHours: {
    start: '21:00',
    end: '08:00',
  },
  timezone: 'America/New_York',
};

/**
 * Appointment Reminders Service
 */
export class AppointmentRemindersService {
  private static instance: AppointmentRemindersService;
  private config: ReminderConfig;
  
  private constructor(config: ReminderConfig = defaultConfig) {
    this.config = config;
  }
  
  static getInstance(config?: ReminderConfig): AppointmentRemindersService {
    if (!AppointmentRemindersService.instance) {
      AppointmentRemindersService.instance = new AppointmentRemindersService(config);
    }
    return AppointmentRemindersService.instance;
  }
  
  /**
   * Send appointment confirmation
   */
  async sendConfirmation(appointment: Appointment): Promise<void> {
    if (!this.config.sendConfirmation || !appointment.smsOptIn) {
      return;
    }
    
    try {
      const message = generateMessage('appointment_confirmation', {
        patientFirstName: appointment.patientName.split(' ')[0],
        appointmentDate: this.formatDate(appointment.date),
        appointmentTime: appointment.time,
        providerName: appointment.provider,
        serviceName: appointment.service,
      });
      
      if (message.success && message.message) {
        await messagingService.sendSMS({
          to: appointment.patientPhone,
          body: message.message,
          patientId: appointment.patientId,
          metadata: {
            type: 'appointment_confirmation',
            appointmentId: appointment.id,
          },
        });
        
        // Mark as sent
        await this.markReminderSent(appointment.id, 'confirmation');
      }
    } catch (error) {
      console.error('Error sending confirmation:', error);
    }
  }
  
  /**
   * Process all pending reminders (called by cron)
   */
  async processReminders(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }
    
    const now = new Date();
    
    // Check if we're in quiet hours
    if (this.isQuietHours(now)) {
      console.log('Skipping reminders during quiet hours');
      return;
    }
    
    try {
      // Get appointments needing reminders
      const appointments = await this.getAppointmentsNeedingReminders();
      
      for (const appointment of appointments) {
        await this.processAppointmentReminders(appointment, now);
      }
      
      // Process follow-ups for completed appointments
      const completedAppointments = await this.getCompletedAppointmentsNeedingFollowup();
      
      for (const appointment of completedAppointments) {
        await this.processFollowUpReminders(appointment, now);
      }
      
      // Process no-show reminders
      const noShows = await this.getNoShowAppointments();
      
      for (const appointment of noShows) {
        await this.sendNoShowFollowUp(appointment);
      }
      
    } catch (error) {
      console.error('Error processing reminders:', error);
    }
  }
  
  /**
   * Send 48-hour reminder
   */
  async send48HourReminder(appointment: Appointment): Promise<void> {
    if (!this.config.send48hrReminder || !appointment.smsOptIn) {
      return;
    }
    
    const message = generateMessage('appointment_reminder_48hr', {
      patientFirstName: appointment.patientName.split(' ')[0],
      serviceName: appointment.service,
      appointmentDate: this.formatDate(appointment.date),
      appointmentTime: appointment.time,
    });
    
    if (message.success && message.message) {
      await messagingService.sendSMS({
        to: appointment.patientPhone,
        body: message.message,
        patientId: appointment.patientId,
        metadata: {
          type: 'reminder_48hr',
          appointmentId: appointment.id,
        },
      });
      
      await this.markReminderSent(appointment.id, 'reminder48hr');
    }
  }
  
  /**
   * Send 24-hour reminder with pre-treatment instructions
   */
  async send24HourReminder(appointment: Appointment): Promise<void> {
    if (!this.config.send24hrReminder || !appointment.smsOptIn) {
      return;
    }
    
    const message = generateMessage('appointment_reminder_24hr', {
      patientFirstName: appointment.patientName.split(' ')[0],
      serviceName: appointment.service,
      appointmentTime: appointment.time,
    });
    
    if (message.success && message.message) {
      await messagingService.sendSMS({
        to: appointment.patientPhone,
        body: message.message,
        patientId: appointment.patientId,
        metadata: {
          type: 'reminder_24hr',
          appointmentId: appointment.id,
        },
      });
      
      await this.markReminderSent(appointment.id, 'reminder24hr');
      
      // Send treatment-specific instructions if applicable
      await this.sendPreTreatmentInstructions(appointment);
    }
  }
  
  /**
   * Send 2-hour reminder
   */
  async send2HourReminder(appointment: Appointment): Promise<void> {
    if (!this.config.send2hrReminder || !appointment.smsOptIn) {
      return;
    }
    
    const message = generateMessage('appointment_reminder_2hr', {
      patientFirstName: appointment.patientName.split(' ')[0],
      serviceName: appointment.service,
      appointmentTime: appointment.time,
      clinicAddress: '123 Main St, Suite 100', // From config
    });
    
    if (message.success && message.message) {
      await messagingService.sendSMS({
        to: appointment.patientPhone,
        body: message.message,
        patientId: appointment.patientId,
        metadata: {
          type: 'reminder_2hr',
          appointmentId: appointment.id,
        },
      });
      
      await this.markReminderSent(appointment.id, 'reminder2hr');
    }
  }
  
  /**
   * Send post-treatment follow-ups
   */
  async sendPostTreatmentFollowUp(
    appointment: Appointment,
    type: 'followup_24hr' | 'followup_3day' | 'followup_1week' | 'followup_2week'
  ): Promise<void> {
    if (!this.config.sendFollowUps || !appointment.smsOptIn) {
      return;
    }
    
    const templateMap = {
      followup_24hr: 'treatment_followup_24hr',
      followup_3day: 'treatment_followup_3day',
      followup_1week: 'treatment_followup_1week',
      followup_2week: 'treatment_followup_2week',
    };
    
    const templateId = templateMap[type];
    const aftercareReminder = this.getAftercareReminder(appointment.treatmentType);
    
    const message = generateMessage(templateId, {
      patientFirstName: appointment.patientName.split(' ')[0],
      treatment: appointment.service,
      aftercareReminder,
      clinicPhone: '555-0100',
      bookingUrl: 'luxemedspa.com/book',
    });
    
    if (message.success && message.message) {
      await messagingService.sendSMS({
        to: appointment.patientPhone,
        body: message.message,
        patientId: appointment.patientId,
        metadata: {
          type,
          appointmentId: appointment.id,
        },
      });
      
      await this.markReminderSent(appointment.id, type);
    }
  }
  
  /**
   * Send no-show follow-up
   */
  async sendNoShowFollowUp(appointment: Appointment): Promise<void> {
    if (!appointment.smsOptIn) {
      return;
    }
    
    const message = generateMessage('appointment_noshow', {
      patientFirstName: appointment.patientName.split(' ')[0],
      serviceName: appointment.service,
      clinicPhone: '555-0100',
    });
    
    if (message.success && message.message) {
      await messagingService.sendSMS({
        to: appointment.patientPhone,
        body: message.message,
        patientId: appointment.patientId,
        metadata: {
          type: 'no_show',
          appointmentId: appointment.id,
        },
      });
      
      await this.markReminderSent(appointment.id, 'noshow');
    }
  }
  
  /**
   * Send treatment-specific aftercare instructions
   */
  async sendAftercareInstructions(appointment: Appointment): Promise<void> {
    if (!appointment.treatmentType || !appointment.smsOptIn) {
      return;
    }
    
    const aftercareTemplates: Record<string, string> = {
      'botox': 'aftercare_botox',
      'filler': 'aftercare_filler',
      'chemical_peel': 'aftercare_chemical_peel',
      'microneedling': 'aftercare_microneedling',
      'laser': 'aftercare_laser',
    };
    
    const templateId = aftercareTemplates[appointment.treatmentType.toLowerCase()];
    
    if (templateId) {
      const template = TEMPLATES[templateId];
      
      await messagingService.sendSMS({
        to: appointment.patientPhone,
        body: template.body,
        patientId: appointment.patientId,
        metadata: {
          type: 'aftercare_instructions',
          appointmentId: appointment.id,
          treatment: appointment.treatmentType,
        },
      });
    }
  }
  
  // Helper methods
  
  private async processAppointmentReminders(appointment: Appointment, now: Date): Promise<void> {
    const appointmentTime = new Date(appointment.date);
    const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // 48-hour reminder
    if (hoursUntilAppointment <= 48 && hoursUntilAppointment > 47 && !appointment.reminders.reminder48hr) {
      await this.send48HourReminder(appointment);
    }
    
    // 24-hour reminder
    if (hoursUntilAppointment <= 24 && hoursUntilAppointment > 23 && !appointment.reminders.reminder24hr) {
      await this.send24HourReminder(appointment);
    }
    
    // 2-hour reminder
    if (hoursUntilAppointment <= 2 && hoursUntilAppointment > 1.5 && !appointment.reminders.reminder2hr) {
      await this.send2HourReminder(appointment);
    }
  }
  
  private async processFollowUpReminders(appointment: Appointment, now: Date): Promise<void> {
    const treatmentTime = new Date(appointment.date);
    const hoursSinceTreatment = (now.getTime() - treatmentTime.getTime()) / (1000 * 60 * 60);
    const daysSinceTreatment = hoursSinceTreatment / 24;
    
    // 24-hour follow-up
    if (hoursSinceTreatment >= 24 && hoursSinceTreatment < 25 && !appointment.reminders.followup24hr) {
      await this.sendPostTreatmentFollowUp(appointment, 'followup_24hr');
    }
    
    // 3-day follow-up
    if (daysSinceTreatment >= 3 && daysSinceTreatment < 3.5 && !appointment.reminders.followup3day) {
      await this.sendPostTreatmentFollowUp(appointment, 'followup_3day');
    }
    
    // 1-week follow-up
    if (daysSinceTreatment >= 7 && daysSinceTreatment < 7.5 && !appointment.reminders.followup1week) {
      await this.sendPostTreatmentFollowUp(appointment, 'followup_1week');
    }
    
    // 2-week follow-up
    if (daysSinceTreatment >= 14 && daysSinceTreatment < 14.5 && !appointment.reminders.followup2week) {
      await this.sendPostTreatmentFollowUp(appointment, 'followup_2week');
    }
  }
  
  private async sendPreTreatmentInstructions(appointment: Appointment): Promise<void> {
    // Send treatment-specific pre-care instructions
    const instructions: Record<string, string> = {
      'botox': 'Avoid alcohol, aspirin, and anti-inflammatory medications 24hrs before',
      'filler': 'Avoid blood thinners and alcohol 48hrs before',
      'chemical_peel': 'Stop retinoids 3 days before, arrive makeup-free',
      'microneedling': 'No sun exposure 24hrs before, arrive with clean skin',
      'laser': 'Avoid sun exposure, no self-tanner for 2 weeks before',
    };
    
    const treatmentLower = appointment.treatmentType?.toLowerCase() || appointment.service.toLowerCase();
    const instruction = Object.entries(instructions).find(([key]) => 
      treatmentLower.includes(key)
    )?.[1];
    
    if (instruction) {
      await messagingService.sendSMS({
        to: appointment.patientPhone,
        body: `Pre-treatment reminder: ${instruction}. See you tomorrow!`,
        patientId: appointment.patientId,
        metadata: {
          type: 'pre_treatment_instructions',
          appointmentId: appointment.id,
        },
      });
    }
  }
  
  private getAftercareReminder(treatmentType?: string): string {
    if (!treatmentType) return 'follow aftercare instructions';
    
    const reminders: Record<string, string> = {
      'botox': 'no lying down for 4 hours',
      'filler': 'ice for swelling, avoid exercise 24hrs',
      'chemical_peel': 'keep skin moisturized, use SPF',
      'microneedling': 'no makeup for 24hrs',
      'laser': 'apply ice if needed, avoid sun',
    };
    
    const treatmentLower = treatmentType.toLowerCase();
    return Object.entries(reminders).find(([key]) => 
      treatmentLower.includes(key)
    )?.[1] || 'follow aftercare instructions';
  }
  
  private isQuietHours(date: Date): boolean {
    const hours = date.getHours();
    const startHour = parseInt(this.config.quietHours.start.split(':')[0]);
    const endHour = parseInt(this.config.quietHours.end.split(':')[0]);
    
    if (startHour > endHour) {
      // Quiet hours span midnight (e.g., 21:00 - 08:00)
      return hours >= startHour || hours < endHour;
    } else {
      // Quiet hours within same day
      return hours >= startHour && hours < endHour;
    }
  }
  
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }
  
  // Database methods (mock implementations)
  
  private async getAppointmentsNeedingReminders(): Promise<Appointment[]> {
    // In production, query database for upcoming appointments
    return [];
  }
  
  private async getCompletedAppointmentsNeedingFollowup(): Promise<Appointment[]> {
    // In production, query database for completed appointments
    return [];
  }
  
  private async getNoShowAppointments(): Promise<Appointment[]> {
    // In production, query database for no-show appointments
    return [];
  }
  
  private async markReminderSent(appointmentId: string, reminderType: string): Promise<void> {
    // In production, update database to mark reminder as sent
    console.log(`Marked ${reminderType} sent for appointment ${appointmentId}`);
  }
}

// Export singleton instance
export const remindersService = AppointmentRemindersService.getInstance();