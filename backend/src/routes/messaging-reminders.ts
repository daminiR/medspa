/**
 * Messaging Reminders API Routes
 *
 * Automated appointment reminder system with 10 reminder types:
 * 1. confirmation - Sent immediately after booking
 * 2. prep_reminder - 3 days before (configurable) with treatment-specific instructions
 * 3. reminder_48hr - 48 hours before
 * 4. reminder_24hr - 24 hours before
 * 5. reminder_2hr - 2 hours before
 * 6. followup_24hr - 24 hours after treatment
 * 7. followup_3day - 3 days after
 * 8. followup_1week - 1 week after
 * 9. followup_2week - 2 weeks after
 * 10. no_show - 1 hour after missed appointment
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, requirePermission } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { sendSMS } from '../lib/sms';
import { prisma } from '../lib/prisma';
import type { Prisma } from '@prisma/client';

const reminders = new Hono();

// ===================
// Types
// ===================

export type ReminderType =
  | 'confirmation'
  | 'prep_reminder'
  | 'reminder_48hr'
  | 'reminder_24hr'
  | 'reminder_2hr'
  | 'followup_24hr'
  | 'followup_3day'
  | 'followup_1week'
  | 'followup_2week'
  | 'no_show';

export interface ReminderSettings {
  enabled: boolean;
  sendConfirmation: boolean;
  sendPrepReminder: boolean;
  prepReminderDays: number; // Default 3
  send48hrReminder: boolean;
  send24hrReminder: boolean;
  send2hrReminder: boolean;
  sendFollowUps: boolean;
  businessHours: { start: string; end: string }; // "09:00", "18:00"
  quietHours: { start: string; end: string }; // "21:00", "08:00"
  timezone: string; // "America/New_York"
}

export interface SentReminder {
  id: string;
  appointmentId: string;
  patientId: string;
  patientPhone: string;
  reminderType: ReminderType;
  messageBody: string;
  messageSid?: string;
  status: 'sent' | 'delivered' | 'failed';
  sentAt: Date;
  deliveredAt?: Date;
  failedReason?: string;
}

export interface PendingReminder {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  service: string;
  treatmentType?: string;
  appointmentDate: Date;
  reminderType: ReminderType;
  scheduledFor: Date;
  status: 'pending' | 'skipped' | 'sent';
}

// ===================
// Treatment Prep & Aftercare
// ===================

const TREATMENT_PREP: Record<string, string> = {
  'botox': 'Avoid alcohol and blood thinners 24hrs before. Come with a clean face.',
  'filler': 'Avoid alcohol, blood thinners, and fish oil 48hrs before. No aspirin.',
  'chemical_peel': 'No retinol or exfoliants 5 days before. Come makeup-free.',
  'microneedling': 'No retinol 3 days before. Stop any actives. Come makeup-free.',
  'laser': 'No sun exposure 2 weeks before. Stop retinol. Shave treatment area.',
  'hydrafacial': 'No exfoliation 48hrs before. Come makeup-free.',
  'prp': 'Stay hydrated. No blood thinners 1 week before. Eat before appointment.',
};

const TREATMENT_AFTERCARE: Record<string, string> = {
  'botox': 'No lying down 4hrs, avoid exercise 24hrs, dont rub injection sites.',
  'filler': 'Apply ice if needed, avoid exercise 24hrs, sleep elevated tonight.',
  'chemical_peel': 'Moisturize frequently, gentle cleanser only, SPF 30+ required.',
  'microneedling': 'No makeup 24hrs, gentle skincare only, SPF required daily.',
  'laser': 'Apply ice if needed, gentle products only, SPF 30+ required, avoid sun.',
  'hydrafacial': 'Avoid makeup 6hrs, no exfoliation 48hrs, stay hydrated.',
  'prp': 'Avoid washing treated area 24hrs, no heavy exercise 48hrs.',
};

// ===================
// Validation Schemas
// ===================

const reminderSettingsSchema = z.object({
  enabled: z.boolean(),
  sendConfirmation: z.boolean(),
  sendPrepReminder: z.boolean(),
  prepReminderDays: z.number().int().min(1).max(7),
  send48hrReminder: z.boolean(),
  send24hrReminder: z.boolean(),
  send2hrReminder: z.boolean(),
  sendFollowUps: z.boolean(),
  businessHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  quietHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  timezone: z.string(),
});

const sendReminderSchema = z.object({
  appointmentId: z.string(),
  reminderType: z.enum([
    'confirmation',
    'prep_reminder',
    'reminder_48hr',
    'reminder_24hr',
    'reminder_2hr',
    'followup_24hr',
    'followup_3day',
    'followup_1week',
    'followup_2week',
    'no_show',
  ]),
});

const listPendingSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reminderType: z.string().optional(),
});

const listHistorySchema = z.object({
  appointmentId: z.string().optional(),
  patientId: z.string().optional(),
  reminderType: z.string().optional(),
  status: z.enum(['sent', 'delivered', 'failed']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ===================
// Helper Functions
// ===================

/**
 * Get or create default reminder settings
 */
async function getSettings(): Promise<ReminderSettings> {
  let settings = await prisma.reminderSettings.findFirst();

  if (!settings) {
    // Create default settings
    settings = await prisma.reminderSettings.create({
      data: {
        enabled: true,
        sendConfirmation: true,
        sendPrepReminder: true,
        prepReminderDays: 3,
        send48hrReminder: true,
        send24hrReminder: true,
        send2hrReminder: true,
        sendFollowUps: true,
        businessHoursStart: '09:00',
        businessHoursEnd: '18:00',
        quietHoursStart: '21:00',
        quietHoursEnd: '08:00',
        timezone: 'America/New_York',
      },
    });
  }

  return {
    enabled: settings.enabled,
    sendConfirmation: settings.sendConfirmation,
    sendPrepReminder: settings.sendPrepReminder,
    prepReminderDays: settings.prepReminderDays,
    send48hrReminder: settings.send48hrReminder,
    send24hrReminder: settings.send24hrReminder,
    send2hrReminder: settings.send2hrReminder,
    sendFollowUps: settings.sendFollowUps,
    businessHours: {
      start: settings.businessHoursStart,
      end: settings.businessHoursEnd,
    },
    quietHours: {
      start: settings.quietHoursStart,
      end: settings.quietHoursEnd,
    },
    timezone: settings.timezone,
  };
}

/**
 * Check if current time is within quiet hours
 */
function isQuietHours(now: Date, quietHours: { start: string; end: string }): boolean {
  const hour = now.getHours();
  const startHour = parseInt(quietHours.start.split(':')[0]);
  const endHour = parseInt(quietHours.end.split(':')[0]);

  if (startHour > endHour) {
    // Spans midnight: 21:00 - 08:00
    return hour >= startHour || hour < endHour;
  }
  return hour >= startHour && hour < endHour;
}

/**
 * Get treatment-specific prep instructions
 */
function getTreatmentPrep(serviceName: string): string | null {
  const serviceLower = serviceName.toLowerCase();
  for (const [treatment, instructions] of Object.entries(TREATMENT_PREP)) {
    if (serviceLower.includes(treatment)) {
      return instructions;
    }
  }
  return null;
}

/**
 * Get treatment-specific aftercare instructions
 */
function getTreatmentAftercare(serviceName: string): string | null {
  const serviceLower = serviceName.toLowerCase();
  for (const [treatment, instructions] of Object.entries(TREATMENT_AFTERCARE)) {
    if (serviceLower.includes(treatment)) {
      return instructions;
    }
  }
  return null;
}

/**
 * Generate reminder message
 */
function generateReminderMessage(
  appointment: any,
  reminderType: ReminderType,
  settings: ReminderSettings
): string {
  const firstName = appointment.patientName.split(' ')[0];
  const date = formatDate(appointment.startTime);
  const time = formatTime(appointment.startTime);
  const serviceName = appointment.serviceName;

  switch (reminderType) {
    case 'confirmation':
      return `Hi ${firstName}, your ${serviceName} appointment with ${appointment.practitionerName} on ${date} at ${time} is confirmed. See you then! - Luxe Medical Spa`;

    case 'prep_reminder': {
      const prep = getTreatmentPrep(serviceName);
      if (prep) {
        return `Hi ${firstName}, reminder: ${serviceName} appointment on ${date} at ${time}. PREP: ${prep} Questions? Call us! - Luxe Medical Spa`;
      }
      return `Hi ${firstName}, reminder: ${serviceName} appointment on ${date} at ${time}. Please arrive with clean skin, no makeup. - Luxe Medical Spa`;
    }

    case 'reminder_48hr':
      return `Hi ${firstName}, your ${serviceName} appointment is in 2 days on ${date} at ${time}. Reply CONFIRM to confirm or call to reschedule. - Luxe Medical Spa`;

    case 'reminder_24hr': {
      const prep = getTreatmentPrep(serviceName);
      if (prep) {
        return `Hi ${firstName}, your ${serviceName} appointment is tomorrow at ${time}. Reminder: ${prep} - Luxe Medical Spa`;
      }
      return `Hi ${firstName}, your ${serviceName} appointment is tomorrow at ${time}. We look forward to seeing you! - Luxe Medical Spa`;
    }

    case 'reminder_2hr':
      return `Hi ${firstName}, your ${serviceName} appointment is in 2 hours at ${time}. We're at 123 Main St, Suite 100. See you soon! - Luxe Medical Spa`;

    case 'followup_24hr': {
      const aftercare = getTreatmentAftercare(serviceName);
      if (aftercare) {
        return `Hi ${firstName}, hope you're feeling great after your ${serviceName}! Reminder: ${aftercare} Any concerns? Call us! - Luxe Medical Spa`;
      }
      return `Hi ${firstName}, hope you're feeling great after your ${serviceName}! Any questions or concerns? Feel free to call us. - Luxe Medical Spa`;
    }

    case 'followup_3day':
      return `Hi ${firstName}, checking in on your ${serviceName} results. How are you feeling? We'd love to hear from you! Reply or call us. - Luxe Medical Spa`;

    case 'followup_1week':
      return `Hi ${firstName}, it's been a week since your ${serviceName}! Hope you're loving the results. Ready to book your next treatment? Visit luxemedspa.com/book - Luxe Medical Spa`;

    case 'followup_2week':
      return `Hi ${firstName}, your ${serviceName} results should be fully visible now! We'd love to see you again. Book your next appointment at luxemedspa.com/book - Luxe Medical Spa`;

    case 'no_show':
      return `Hi ${firstName}, we missed you at your ${serviceName} appointment today. Life happens! Call us at 555-0100 to reschedule. - Luxe Medical Spa`;

    default:
      return `Hi ${firstName}, this is a reminder about your ${serviceName} appointment. - Luxe Medical Spa`;
  }
}

/**
 * Format date for messages
 */
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format time for messages
 */
function formatTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleTimeString('en-US', options);
}

/**
 * Check if patient has SMS opt-in
 */
async function hasPatientSMSOptIn(patientPhone: string): Promise<boolean> {
  const profile = await prisma.patientMessagingProfile.findFirst({
    where: { phone: patientPhone },
  });
  return profile?.smsConsent ?? false;
}

/**
 * Check if reminder already sent
 */
async function isReminderSent(appointmentId: string, reminderType: ReminderType): Promise<boolean> {
  const count = await prisma.sentReminder.count({
    where: {
      appointmentId,
      reminderType: reminderType.toUpperCase() as any,
    },
  });
  return count > 0;
}

/**
 * Send a reminder via SMS
 */
async function sendReminder(
  appointment: any,
  reminderType: ReminderType,
  settings: ReminderSettings
): Promise<SentReminder> {
  const patientPhone = appointment.Patient?.phone;
  if (!patientPhone) {
    throw new Error('Patient has no phone number');
  }

  const hasOptIn = await hasPatientSMSOptIn(patientPhone);
  if (!hasOptIn) {
    throw new Error('Patient has not opted in to SMS');
  }

  const messageBody = generateReminderMessage(appointment, reminderType, settings);

  // Send via Twilio (or mock in dev)
  await sendSMS({
    to: patientPhone,
    body: messageBody,
  });

  const reminder = await prisma.sentReminder.create({
    data: {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      patientPhone: patientPhone,
      reminderType: reminderType.toUpperCase() as any,
      messageBody,
      status: 'sent',
    },
  });

  return {
    id: reminder.id,
    appointmentId: reminder.appointmentId,
    patientId: reminder.patientId,
    patientPhone: reminder.patientPhone,
    reminderType: reminder.reminderType.toLowerCase() as ReminderType,
    messageBody: reminder.messageBody,
    messageSid: reminder.messageSid ?? undefined,
    status: reminder.status.toLowerCase() as 'sent' | 'delivered' | 'failed',
    sentAt: reminder.sentAt,
    deliveredAt: reminder.deliveredAt ?? undefined,
    failedReason: reminder.failedReason ?? undefined,
  };
}

/**
 * Calculate pending reminders
 */
async function calculatePendingReminders(
  settings: ReminderSettings,
  now: Date = new Date()
): Promise<PendingReminder[]> {
  const pending: PendingReminder[] = [];

  if (!settings.enabled) {
    return pending;
  }

  // Get all appointments with patient data
  const appointments = await prisma.appointment.findMany({
    where: {
      status: {
        in: ['SCHEDULED', 'CONFIRMED', 'ARRIVED', 'COMPLETED', 'NO_SHOW'],
      },
    },
    include: {
      Patient: true,
    },
  });

  for (const apt of appointments) {
    if (!apt.Patient?.phone) continue;

    const hasOptIn = await hasPatientSMSOptIn(apt.Patient.phone);
    if (!hasOptIn) continue;

    const appointmentTime = apt.startTime.getTime();
    const nowTime = now.getTime();
    const hoursUntil = (appointmentTime - nowTime) / (1000 * 60 * 60);
    const daysUntil = hoursUntil / 24;

    // Pre-appointment reminders
    if (apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED' || apt.status === 'ARRIVED') {
      // Prep reminder (configurable days before)
      if (
        settings.sendPrepReminder &&
        daysUntil <= settings.prepReminderDays &&
        daysUntil > settings.prepReminderDays - 1 &&
        !(await isReminderSent(apt.id, 'prep_reminder'))
      ) {
        pending.push({
          appointmentId: apt.id,
          patientId: apt.patientId,
          patientName: apt.patientName,
          patientPhone: apt.Patient.phone,
          service: apt.serviceName,
          appointmentDate: apt.startTime,
          reminderType: 'prep_reminder',
          scheduledFor: new Date(nowTime + 1000 * 60 * 60),
          status: 'pending',
        });
      }

      // 48-hour reminder
      if (
        settings.send48hrReminder &&
        hoursUntil <= 48 &&
        hoursUntil > 47 &&
        !(await isReminderSent(apt.id, 'reminder_48hr'))
      ) {
        pending.push({
          appointmentId: apt.id,
          patientId: apt.patientId,
          patientName: apt.patientName,
          patientPhone: apt.Patient.phone,
          service: apt.serviceName,
          appointmentDate: apt.startTime,
          reminderType: 'reminder_48hr',
          scheduledFor: new Date(nowTime + 1000 * 60 * 60),
          status: 'pending',
        });
      }

      // 24-hour reminder
      if (
        settings.send24hrReminder &&
        hoursUntil <= 24 &&
        hoursUntil > 23 &&
        !(await isReminderSent(apt.id, 'reminder_24hr'))
      ) {
        pending.push({
          appointmentId: apt.id,
          patientId: apt.patientId,
          patientName: apt.patientName,
          patientPhone: apt.Patient.phone,
          service: apt.serviceName,
          appointmentDate: apt.startTime,
          reminderType: 'reminder_24hr',
          scheduledFor: new Date(nowTime + 1000 * 60 * 60),
          status: 'pending',
        });
      }

      // 2-hour reminder
      if (
        settings.send2hrReminder &&
        hoursUntil <= 2 &&
        hoursUntil > 1.5 &&
        !(await isReminderSent(apt.id, 'reminder_2hr'))
      ) {
        pending.push({
          appointmentId: apt.id,
          patientId: apt.patientId,
          patientName: apt.patientName,
          patientPhone: apt.Patient.phone,
          service: apt.serviceName,
          appointmentDate: apt.startTime,
          reminderType: 'reminder_2hr',
          scheduledFor: new Date(nowTime + 1000 * 60 * 30),
          status: 'pending',
        });
      }
    }

    // Post-appointment follow-ups
    if (apt.status === 'COMPLETED') {
      const hoursSince = (nowTime - appointmentTime) / (1000 * 60 * 60);
      const daysSince = hoursSince / 24;

      if (settings.sendFollowUps) {
        // 24-hour follow-up
        if (hoursSince >= 24 && hoursSince < 25 && !(await isReminderSent(apt.id, 'followup_24hr'))) {
          pending.push({
            appointmentId: apt.id,
            patientId: apt.patientId,
            patientName: apt.patientName,
            patientPhone: apt.Patient.phone,
            service: apt.serviceName,
            appointmentDate: apt.startTime,
            reminderType: 'followup_24hr',
            scheduledFor: new Date(nowTime + 1000 * 60 * 60),
            status: 'pending',
          });
        }

        // 3-day follow-up
        if (daysSince >= 3 && daysSince < 3.5 && !(await isReminderSent(apt.id, 'followup_3day'))) {
          pending.push({
            appointmentId: apt.id,
            patientId: apt.patientId,
            patientName: apt.patientName,
            patientPhone: apt.Patient.phone,
            service: apt.serviceName,
            appointmentDate: apt.startTime,
            reminderType: 'followup_3day',
            scheduledFor: new Date(nowTime + 1000 * 60 * 60),
            status: 'pending',
          });
        }

        // 1-week follow-up
        if (daysSince >= 7 && daysSince < 7.5 && !(await isReminderSent(apt.id, 'followup_1week'))) {
          pending.push({
            appointmentId: apt.id,
            patientId: apt.patientId,
            patientName: apt.patientName,
            patientPhone: apt.Patient.phone,
            service: apt.serviceName,
            appointmentDate: apt.startTime,
            reminderType: 'followup_1week',
            scheduledFor: new Date(nowTime + 1000 * 60 * 60),
            status: 'pending',
          });
        }

        // 2-week follow-up
        if (daysSince >= 14 && daysSince < 14.5 && !(await isReminderSent(apt.id, 'followup_2week'))) {
          pending.push({
            appointmentId: apt.id,
            patientId: apt.patientId,
            patientName: apt.patientName,
            patientPhone: apt.Patient.phone,
            service: apt.serviceName,
            appointmentDate: apt.startTime,
            reminderType: 'followup_2week',
            scheduledFor: new Date(nowTime + 1000 * 60 * 60),
            status: 'pending',
          });
        }
      }
    }

    // No-show follow-up
    if (apt.status === 'NO_SHOW') {
      const hoursSince = (nowTime - appointmentTime) / (1000 * 60 * 60);
      if (hoursSince >= 1 && hoursSince < 2 && !(await isReminderSent(apt.id, 'no_show'))) {
        pending.push({
          appointmentId: apt.id,
          patientId: apt.patientId,
          patientName: apt.patientName,
          patientPhone: apt.Patient.phone,
          service: apt.serviceName,
          appointmentDate: apt.startTime,
          reminderType: 'no_show',
          scheduledFor: new Date(nowTime + 1000 * 60 * 60),
          status: 'pending',
        });
      }
    }
  }

  return pending;
}

// ===================
// Routes
// ===================

/**
 * Get reminder settings
 * GET /api/reminders/settings
 */
reminders.get('/settings', authMiddleware, requirePermission('settings:read'), async (c) => {
  try {
    const settings = await getSettings();

    return c.json({
      success: true,
      settings,
    });
  } catch (error) {
    throw APIError.internal(`Failed to get settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

/**
 * Update reminder settings
 * PUT /api/reminders/settings
 */
reminders.put(
  '/settings',
  authMiddleware,
  requirePermission('settings:update'),
  zValidator('json', reminderSettingsSchema),
  async (c) => {
    const data = c.req.valid('json');

    try {
      let settings = await prisma.reminderSettings.findFirst();

      if (settings) {
        settings = await prisma.reminderSettings.update({
          where: { id: settings.id },
          data: {
            enabled: data.enabled,
            sendConfirmation: data.sendConfirmation,
            sendPrepReminder: data.sendPrepReminder,
            prepReminderDays: data.prepReminderDays,
            send48hrReminder: data.send48hrReminder,
            send24hrReminder: data.send24hrReminder,
            send2hrReminder: data.send2hrReminder,
            sendFollowUps: data.sendFollowUps,
            businessHoursStart: data.businessHours.start,
            businessHoursEnd: data.businessHours.end,
            quietHoursStart: data.quietHours.start,
            quietHoursEnd: data.quietHours.end,
            timezone: data.timezone,
          },
        });
      } else {
        settings = await prisma.reminderSettings.create({
          data: {
            enabled: data.enabled,
            sendConfirmation: data.sendConfirmation,
            sendPrepReminder: data.sendPrepReminder,
            prepReminderDays: data.prepReminderDays,
            send48hrReminder: data.send48hrReminder,
            send24hrReminder: data.send24hrReminder,
            send2hrReminder: data.send2hrReminder,
            sendFollowUps: data.sendFollowUps,
            businessHoursStart: data.businessHours.start,
            businessHoursEnd: data.businessHours.end,
            quietHoursStart: data.quietHours.start,
            quietHoursEnd: data.quietHours.end,
            timezone: data.timezone,
          },
        });
      }

      return c.json({
        success: true,
        message: 'Reminder settings updated successfully',
        settings: {
          enabled: settings.enabled,
          sendConfirmation: settings.sendConfirmation,
          sendPrepReminder: settings.sendPrepReminder,
          prepReminderDays: settings.prepReminderDays,
          send48hrReminder: settings.send48hrReminder,
          send24hrReminder: settings.send24hrReminder,
          send2hrReminder: settings.send2hrReminder,
          sendFollowUps: settings.sendFollowUps,
          businessHours: {
            start: settings.businessHoursStart,
            end: settings.businessHoursEnd,
          },
          quietHours: {
            start: settings.quietHoursStart,
            end: settings.quietHoursEnd,
          },
          timezone: settings.timezone,
        },
      });
    } catch (error) {
      throw APIError.internal(`Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

/**
 * Manually send a reminder
 * POST /api/reminders/send
 */
reminders.post(
  '/send',
  authMiddleware,
  requirePermission('messaging:send'),
  zValidator('json', sendReminderSchema),
  async (c) => {
    const { appointmentId, reminderType } = c.req.valid('json');

    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          Patient: true,
        },
      });

      if (!appointment) {
        throw APIError.notFound('Appointment');
      }

      const settings = await getSettings();
      const reminder = await sendReminder(appointment as any, reminderType, settings);

      return c.json({
        success: true,
        message: 'Reminder sent successfully',
        reminder: {
          ...reminder,
          sentAt: reminder.sentAt.toISOString(),
        },
      });
    } catch (error) {
      throw APIError.internal(`Failed to send reminder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

/**
 * Get pending reminders
 * GET /api/reminders/pending
 */
reminders.get(
  '/pending',
  authMiddleware,
  requirePermission('messaging:list'),
  zValidator('query', listPendingSchema),
  async (c) => {
    const query = c.req.valid('query');

    try {
      const settings = await getSettings();
      let pending = await calculatePendingReminders(settings);

      // Filter by reminder type
      if (query.reminderType) {
        pending = pending.filter((r) => r.reminderType === query.reminderType);
      }

      // Filter by date range
      if (query.startDate) {
        const start = new Date(query.startDate);
        pending = pending.filter((r) => r.appointmentDate >= start);
      }

      if (query.endDate) {
        const end = new Date(query.endDate);
        pending = pending.filter((r) => r.appointmentDate <= end);
      }

      return c.json({
        success: true,
        pending: pending.map((p) => ({
          ...p,
          appointmentDate: p.appointmentDate.toISOString(),
          scheduledFor: p.scheduledFor.toISOString(),
        })),
        total: pending.length,
      });
    } catch (error) {
      throw APIError.internal(`Failed to get pending reminders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

/**
 * Process due reminders (cron endpoint)
 * POST /api/reminders/process
 */
reminders.post('/process', async (c) => {
  // Verify CRON_SECRET
  const authHeader = c.req.header('Authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    throw APIError.unauthorized('Invalid cron secret');
  }

  try {
    const settings = await getSettings();

    if (!settings.enabled) {
      return c.json({
        success: true,
        message: 'Reminders are disabled',
        processed: 0,
      });
    }

    const now = new Date();

    // Check quiet hours
    if (isQuietHours(now, settings.quietHours)) {
      return c.json({
        success: true,
        message: 'Skipping - currently in quiet hours',
        processed: 0,
        quietHours: settings.quietHours,
      });
    }

    const pending = await calculatePendingReminders(settings, now);
    const summary: Record<ReminderType, number> = {
      confirmation: 0,
      prep_reminder: 0,
      reminder_48hr: 0,
      reminder_24hr: 0,
      reminder_2hr: 0,
      followup_24hr: 0,
      followup_3day: 0,
      followup_1week: 0,
      followup_2week: 0,
      no_show: 0,
    };

    const errors: Array<{ appointmentId: string; error: string }> = [];

    for (const item of pending) {
      try {
        const appointment = await prisma.appointment.findUnique({
          where: { id: item.appointmentId },
          include: {
            Patient: true,
          },
        });

        if (!appointment) continue;

        await sendReminder(appointment as any, item.reminderType, settings);
        summary[item.reminderType]++;
      } catch (error) {
        errors.push({
          appointmentId: item.appointmentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const totalProcessed = Object.values(summary).reduce((sum, count) => sum + count, 0);

    return c.json({
      success: true,
      message: `Processed ${totalProcessed} reminders`,
      processed: totalProcessed,
      summary,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    throw APIError.internal(`Failed to process reminders: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

/**
 * Get sent reminders history
 * GET /api/reminders/history
 */
reminders.get(
  '/history',
  authMiddleware,
  requirePermission('messaging:list'),
  zValidator('query', listHistorySchema),
  async (c) => {
    const query = c.req.valid('query');

    try {
      // Build where clause
      const where: Prisma.SentReminderWhereInput = {};

      if (query.appointmentId) {
        where.appointmentId = query.appointmentId;
      }

      if (query.patientId) {
        where.patientId = query.patientId;
      }

      if (query.reminderType) {
        where.reminderType = query.reminderType.toUpperCase() as any;
      }

      if (query.status) {
        where.status = query.status.toUpperCase() as any;
      }

      if (query.startDate || query.endDate) {
        where.sentAt = {};
        if (query.startDate) {
          where.sentAt.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          where.sentAt.lte = new Date(query.endDate);
        }
      }

      // Calculate pagination
      const offset = (query.page - 1) * query.limit;

      // Execute queries in parallel
      const [results, total] = await Promise.all([
        prisma.sentReminder.findMany({
          where,
          orderBy: { sentAt: 'desc' },
          skip: offset,
          take: query.limit,
        }),
        prisma.sentReminder.count({ where }),
      ]);

      return c.json({
        success: true,
        items: results.map((r) => ({
          id: r.id,
          appointmentId: r.appointmentId,
          patientId: r.patientId,
          patientPhone: r.patientPhone,
          reminderType: r.reminderType.toLowerCase(),
          messageBody: r.messageBody,
          messageSid: r.messageSid,
          status: r.status.toLowerCase(),
          sentAt: r.sentAt.toISOString(),
          deliveredAt: r.deliveredAt?.toISOString(),
          failedReason: r.failedReason,
        })),
        total,
        page: query.page,
        limit: query.limit,
        hasMore: offset + query.limit < total,
      });
    } catch (error) {
      throw APIError.internal(`Failed to get history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export default reminders;
