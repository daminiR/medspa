/**
 * Type definitions for automated message timeline configuration
 *
 * These types are used by the TimelineConfigurator component and
 * can be imported throughout the application for type safety.
 */

/**
 * Time unit for scheduling messages
 */
export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks';

/**
 * Type of automated message
 */
export type MessageType =
  | 'confirmation'        // Booking confirmation
  | 'reminder'            // Standard appointment reminder
  | 'prep_instructions'   // Pre-visit preparation instructions
  | 'follow_up'           // Post-appointment follow-up
  | 'custom';             // Custom message

/**
 * Timing configuration for when a message should be sent
 * relative to the appointment time
 */
export interface ReminderTiming {
  /** Numeric value (e.g., 7 for "7 days") */
  value: number;
  /** Time unit (e.g., "days") */
  unit: TimeUnit;
}

/**
 * A single point on the message timeline
 * representing one automated message to be sent
 */
export interface ReminderPoint {
  /** Unique identifier for this reminder */
  id: string;

  /** When this message should be sent relative to appointment */
  timing: ReminderTiming;

  /** Whether this message is currently active */
  enabled: boolean;

  /** Type/category of this message */
  messageType: MessageType;

  /** Optional custom label (overrides default message type label) */
  label?: string;

  /** Optional message template content */
  template?: string;

  /** Optional delivery channels (if not using global settings) */
  channels?: Array<'sms' | 'email' | 'push'>;

  /** Optional target service types (if message is service-specific) */
  serviceTypes?: string[];
}

/**
 * Complete configuration for an automated message flow
 */
export interface MessageFlowConfiguration {
  /** Unique identifier for this flow */
  id: string;

  /** Name of this message flow */
  name: string;

  /** Description of when/how this flow is used */
  description?: string;

  /** All reminder points in this flow */
  reminders: ReminderPoint[];

  /** Whether this flow is currently active globally */
  enabled: boolean;

  /** Optional: Service types this flow applies to */
  applicableServiceTypes?: string[];

  /** Optional: Provider IDs this flow applies to */
  applicableProviders?: string[];

  /** Created timestamp */
  createdAt?: Date | string;

  /** Last updated timestamp */
  updatedAt?: Date | string;
}

/**
 * Settings for message delivery
 */
export interface MessageDeliverySettings {
  /** Default channels to use for messages */
  defaultChannels: Array<'sms' | 'email' | 'push'>;

  /** Whether to respect patient quiet hours */
  respectQuietHours: boolean;

  /** Default time of day to send messages (HH:MM format) */
  defaultSendTime: string;

  /** Whether to send messages on weekends */
  sendOnWeekends: boolean;

  /** Timezone for scheduling */
  timezone: string;
}

/**
 * Helper type for creating a new reminder (without id)
 */
export type NewReminderPoint = Omit<ReminderPoint, 'id'>;

/**
 * Helper type for updating a reminder (all fields optional except id)
 */
export type ReminderPointUpdate = Partial<ReminderPoint> & { id: string };

/**
 * Helper function to convert timing to total minutes
 * Useful for sorting and comparing timings
 */
export function timingToMinutes(timing: ReminderTiming): number {
  const multipliers: Record<TimeUnit, number> = {
    minutes: 1,
    hours: 60,
    days: 60 * 24,
    weeks: 60 * 24 * 7,
  };
  return timing.value * multipliers[timing.unit];
}

/**
 * Helper function to format timing as human-readable string
 */
export function formatTiming(timing: ReminderTiming): string {
  const { value, unit } = timing;

  if (value === 0) {
    return 'At appointment time';
  }

  if (value === 1) {
    // Singular form
    const singularUnit = unit.slice(0, -1);
    return `1 ${singularUnit} before`;
  }

  return `${value} ${unit} before`;
}

/**
 * Helper function to validate timing
 * Returns error message if invalid, null if valid
 */
export function validateTiming(timing: ReminderTiming): string | null {
  if (timing.value < 0) {
    return 'Timing value must be positive';
  }

  if (timing.value > 365 && timing.unit === 'days') {
    return 'Cannot schedule more than 365 days in advance';
  }

  if (timing.value > 52 && timing.unit === 'weeks') {
    return 'Cannot schedule more than 52 weeks in advance';
  }

  return null;
}

/**
 * Helper function to sort reminders by timing (furthest to closest)
 */
export function sortRemindersByTiming(reminders: ReminderPoint[]): ReminderPoint[] {
  return [...reminders].sort((a, b) => {
    const aMinutes = timingToMinutes(a.timing);
    const bMinutes = timingToMinutes(b.timing);
    return bMinutes - aMinutes; // Descending order (furthest first)
  });
}

/**
 * Helper function to check if two timings are equal
 */
export function timingsEqual(a: ReminderTiming, b: ReminderTiming): boolean {
  return timingToMinutes(a) === timingToMinutes(b);
}

/**
 * Helper function to find duplicate timings in a reminder list
 * Returns array of duplicate timing values in minutes
 */
export function findDuplicateTimings(reminders: ReminderPoint[]): number[] {
  const timingCounts = new Map<number, number>();

  reminders.forEach((reminder) => {
    const minutes = timingToMinutes(reminder.timing);
    timingCounts.set(minutes, (timingCounts.get(minutes) || 0) + 1);
  });

  return Array.from(timingCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([minutes, _]) => minutes);
}

/**
 * Default reminder configurations for common use cases
 */
export const DEFAULT_REMINDER_FLOWS: Record<string, Partial<MessageFlowConfiguration>> = {
  basic: {
    name: 'Basic Reminder Flow',
    description: 'Simple confirmation and reminder flow',
    reminders: [
      {
        id: 'conf-1',
        timing: { value: 7, unit: 'days' },
        enabled: true,
        messageType: 'confirmation',
        label: 'Booking Confirmation',
      },
      {
        id: 'rem-1',
        timing: { value: 1, unit: 'days' },
        enabled: true,
        messageType: 'reminder',
        label: '24-Hour Reminder',
      },
    ],
  },
  medspa: {
    name: 'Medical Spa Flow',
    description: 'Complete flow for medical spa appointments',
    reminders: [
      {
        id: 'conf-1',
        timing: { value: 7, unit: 'days' },
        enabled: true,
        messageType: 'confirmation',
        label: 'Booking Confirmation',
      },
      {
        id: 'prep-1',
        timing: { value: 3, unit: 'days' },
        enabled: true,
        messageType: 'prep_instructions',
        label: 'Pre-Treatment Instructions',
      },
      {
        id: 'rem-1',
        timing: { value: 1, unit: 'days' },
        enabled: true,
        messageType: 'reminder',
        label: '24-Hour Reminder',
      },
      {
        id: 'rem-2',
        timing: { value: 2, unit: 'hours' },
        enabled: false,
        messageType: 'reminder',
        label: '2-Hour Check-in',
      },
    ],
  },
  minimal: {
    name: 'Minimal Flow',
    description: 'Single reminder only',
    reminders: [
      {
        id: 'rem-1',
        timing: { value: 1, unit: 'days' },
        enabled: true,
        messageType: 'reminder',
        label: '24-Hour Reminder',
      },
    ],
  },
};
