/**
 * Shared automated message configs store
 * Moved out of route.ts to comply with Next.js 15 requirements
 */

import type { AutomatedMessageConfig, EventType } from '@/types/messaging';

// Default configurations (using valid EventType values)
export const DEFAULT_AUTOMATED_MESSAGE_CONFIGS: Record<string, AutomatedMessageConfig> = {
  appointment_booked: {
    id: 'appointment_booked',
    eventType: 'appointment_booked' as EventType,
    enabled: true,
    channels: ['sms', 'email'],
    timing: { type: 'immediate' },
    triggers: { onlineBookings: true, staffBookings: true },
    template: {
      subject: 'Appointment Confirmation',
      body: 'Hi {{firstName}}, your {{serviceName}} appointment is confirmed for {{date}} at {{time}}.',
      variables: ['firstName', 'serviceName', 'date', 'time'],
    },
  },
  appointment_canceled: {
    id: 'appointment_canceled',
    eventType: 'appointment_canceled' as EventType,
    enabled: true,
    channels: ['sms', 'email'],
    timing: { type: 'immediate' },
    triggers: { onlineBookings: true, staffBookings: true },
    template: {
      subject: 'Appointment Canceled',
      body: 'Hi {{firstName}}, your {{serviceName}} appointment on {{date}} at {{time}} has been canceled.',
      variables: ['firstName', 'serviceName', 'date', 'time'],
    },
  },
  appointment_rescheduled: {
    id: 'appointment_rescheduled',
    eventType: 'appointment_rescheduled' as EventType,
    enabled: true,
    channels: ['sms', 'email'],
    timing: { type: 'immediate' },
    triggers: { onlineBookings: true, staffBookings: true },
    template: {
      subject: 'Appointment Rescheduled',
      body: 'Hi {{firstName}}, your {{serviceName}} appointment has been rescheduled to {{newDate}} at {{newTime}}.',
      variables: ['firstName', 'serviceName', 'newDate', 'newTime'],
    },
  },
  waitlist_added: {
    id: 'waitlist_added',
    eventType: 'waitlist_added' as EventType,
    enabled: true,
    channels: ['sms', 'email'],
    timing: { type: 'immediate' },
    triggers: { onlineBookings: true, staffBookings: true },
    template: {
      subject: 'Added to Waitlist',
      body: 'Hi {{firstName}}, you have been added to the waitlist for {{serviceName}}. We will contact you when an opening becomes available.',
      variables: ['firstName', 'serviceName'],
    },
  },
  waitlist_opening: {
    id: 'waitlist_opening',
    eventType: 'waitlist_opening' as EventType,
    enabled: true,
    channels: ['sms', 'email'],
    timing: { type: 'immediate' },
    triggers: { onlineBookings: true, staffBookings: true },
    template: {
      subject: 'Opening Available for {{serviceName}}',
      body: 'Hi {{firstName}}, great news! An opening for {{serviceName}} is available on {{availableDate}}. Reply to book now!',
      variables: ['firstName', 'serviceName', 'availableDate'],
    },
    confirmationRequest: {
      enabled: false,
      setStatusUnconfirmed: false,
    },
  },
};

// In-memory store (in production, this would be a database)
export let automatedMessageConfigs: Record<string, AutomatedMessageConfig> = { ...DEFAULT_AUTOMATED_MESSAGE_CONFIGS };
