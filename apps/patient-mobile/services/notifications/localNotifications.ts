/**
 * Local Notifications Service
 *
 * Handles scheduling local notifications for:
 * - Appointment reminders (24h, 2h, custom)
 * - Birthday notifications
 * - Membership renewal reminders
 * - Review requests (2 days after appointment)
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNotificationPreferences } from './pushNotifications';

// Notification ID prefixes for easy management
const NOTIFICATION_PREFIXES = {
  appointment: 'apt_',
  review: 'review_',
  birthday: 'bday_',
  membership: 'membership_',
  custom: 'custom_',
} as const;

/**
 * Schedule appointment reminder
 * Can be scheduled for multiple times before appointment
 */
export async function scheduleAppointmentReminder(
  appointmentId: string,
  serviceName: string,
  appointmentDate: Date,
  hoursBefore: number = 24,
  providerName?: string,
  locationName?: string
): Promise<string | null> {
  try {
    const preferences = await getNotificationPreferences();

    // Check if appointment reminders are enabled
    if (!preferences.enabled || !preferences.appointmentReminders) {
      return null;
    }

    // Check specific reminder preference
    if (hoursBefore === 24 && !preferences.appointmentReminder24h) {
      return null;
    }
    if (hoursBefore === 2 && !preferences.appointmentReminder2h) {
      return null;
    }

    // Calculate trigger time
    const triggerDate = new Date(
      appointmentDate.getTime() - hoursBefore * 60 * 60 * 1000
    );

    // Don't schedule if trigger time is in the past
    if (triggerDate < new Date()) {
      return null;
    }

    // Generate title and body
    let title: string;
    let body: string;

    if (hoursBefore === 24) {
      title = 'Appointment Tomorrow';
      body = `Your ${serviceName} is tomorrow at ${formatTime(appointmentDate)}${
        locationName ? ` at ${locationName}` : ''
      }`;
    } else if (hoursBefore === 2) {
      title = 'Appointment Soon';
      body = `See you soon! Your ${serviceName} starts at ${formatTime(
        appointmentDate
      )}`;
    } else {
      title = 'Upcoming Appointment';
      body = `Your ${serviceName} is in ${hoursBefore} hours at ${formatTime(
        appointmentDate
      )}`;
    }

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'appointment_reminder',
          appointmentId,
          serviceName,
          appointmentDate: appointmentDate.toISOString(),
          providerName,
          locationName,
          hoursBefore,
        },
        sound: preferences.sound ? 'default' : undefined,
        badge: 1,
        categoryIdentifier: 'appointment',
        vibrate: preferences.vibration ? [0, 250, 250, 250] : [],
      },
      trigger: {
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'appointments' : undefined,
      },
    });

    // Store mapping for easy cancellation
    await storeScheduledNotification(
      NOTIFICATION_PREFIXES.appointment + appointmentId + `_${hoursBefore}h`,
      notificationId
    );

    return notificationId;
  } catch (error) {
    console.error('Error scheduling appointment reminder:', error);
    return null;
  }
}

/**
 * Cancel all scheduled reminders for an appointment
 */
export async function cancelAppointmentReminders(
  appointmentId: string
): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    const appointmentNotifications = scheduled.filter(
      (notification) => notification.content.data?.appointmentId === appointmentId
    );

    for (const notification of appointmentNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error canceling appointment reminders:', error);
  }
}

/**
 * Schedule a custom reminder notification
 */
export async function scheduleCustomReminder(
  reminderId: string,
  title: string,
  body: string,
  triggerDate: Date,
  data?: Record<string, any>
): Promise<string | null> {
  try {
    const preferences = await getNotificationPreferences();

    if (!preferences.enabled) {
      return null;
    }

    // Don't schedule if trigger time is in the past
    if (triggerDate < new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'system',
          reminderId,
          ...data,
        },
        sound: preferences.sound ? 'default' : undefined,
        badge: 1,
        vibrate: preferences.vibration ? [0, 250, 250, 250] : [],
      },
      trigger: {
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'system' : undefined,
      },
    });

    await storeScheduledNotification(
      NOTIFICATION_PREFIXES.custom + reminderId,
      notificationId
    );

    return notificationId;
  } catch (error) {
    console.error('Error scheduling custom reminder:', error);
    return null;
  }
}

/**
 * Schedule review reminder (typically 2 days after appointment)
 */
export async function scheduleReviewReminder(
  appointmentId: string,
  appointmentDate: Date,
  serviceName?: string
): Promise<string | null> {
  try {
    const preferences = await getNotificationPreferences();

    if (!preferences.enabled) {
      return null;
    }

    // Schedule 2 days after appointment
    const reviewDate = new Date(
      appointmentDate.getTime() + 2 * 24 * 60 * 60 * 1000
    );

    // Don't schedule if review date is in the past
    if (reviewDate < new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'How Was Your Visit?',
        body: `We would love to hear about your ${
          serviceName || 'appointment'
        } experience!`,
        data: {
          type: 'system',
          action: 'review_request',
          appointmentId,
          serviceName,
        },
        sound: preferences.sound ? 'default' : undefined,
        badge: 1,
        vibrate: preferences.vibration ? [0, 250, 250, 250] : [],
      },
      trigger: {
        date: reviewDate,
        channelId: Platform.OS === 'android' ? 'system' : undefined,
      },
    });

    await storeScheduledNotification(
      NOTIFICATION_PREFIXES.review + appointmentId,
      notificationId
    );

    return notificationId;
  } catch (error) {
    console.error('Error scheduling review reminder:', error);
    return null;
  }
}

/**
 * Schedule birthday notification
 */
export async function scheduleBirthdayNotification(
  userId: string,
  userName: string,
  birthDate: Date
): Promise<string | null> {
  try {
    const preferences = await getNotificationPreferences();

    if (!preferences.enabled) {
      return null;
    }

    // Set reminder for 9 AM on birthday
    const nextBirthday = getNextBirthdayDate(birthDate);
    const reminderDate = new Date(nextBirthday);
    reminderDate.setHours(9, 0, 0, 0);

    // Don't schedule if date is in the past
    if (reminderDate < new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "It's Your Birthday!",
        body: `Happy birthday, ${userName}! Enjoy a special treat on us!`,
        data: {
          type: 'promotion',
          action: 'birthday_offer',
          userId,
        },
        sound: preferences.sound ? 'default' : undefined,
        badge: 1,
        vibrate: preferences.vibration ? [0, 250, 250, 250] : [],
      },
      trigger: {
        date: reminderDate,
        channelId: Platform.OS === 'android' ? 'promotions' : undefined,
      },
    });

    await storeScheduledNotification(
      NOTIFICATION_PREFIXES.birthday + userId,
      notificationId
    );

    return notificationId;
  } catch (error) {
    console.error('Error scheduling birthday notification:', error);
    return null;
  }
}

/**
 * Schedule membership renewal reminder
 */
export async function scheduleMembershipRenewalReminder(
  membershipId: string,
  renewalDate: Date,
  membershipName?: string
): Promise<string | null> {
  try {
    const preferences = await getNotificationPreferences();

    if (!preferences.enabled) {
      return null;
    }

    // Schedule 7 days before renewal
    const reminderDate = new Date(
      renewalDate.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    // Don't schedule if reminder date is in the past
    if (reminderDate < new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Membership Renewal Coming Soon',
        body: `Your ${
          membershipName || 'membership'
        } will renew in 7 days. Review benefits and manage your membership.`,
        data: {
          type: 'system',
          action: 'membership_renewal',
          membershipId,
          membershipName,
        },
        sound: preferences.sound ? 'default' : undefined,
        badge: 1,
        vibrate: preferences.vibration ? [0, 250, 250, 250] : [],
      },
      trigger: {
        date: reminderDate,
        channelId: Platform.OS === 'android' ? 'system' : undefined,
      },
    });

    await storeScheduledNotification(
      NOTIFICATION_PREFIXES.membership + membershipId,
      notificationId
    );

    return notificationId;
  } catch (error) {
    console.error('Error scheduling membership renewal reminder:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification by ID
 */
export async function cancelScheduledNotification(
  notificationId: string
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<
  Array<{
    id: string;
    type: string;
    scheduledDate: Date;
    title: string;
    body: string;
  }>
> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();

    return notifications.map((notification) => ({
      id: notification.identifier,
      type: notification.content.data?.type || 'unknown',
      scheduledDate: (notification.trigger as any)?.date || new Date(),
      title: notification.content.title || '',
      body: notification.content.body || '',
    }));
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Clear all scheduled notifications
 */
export async function clearAllScheduledNotifications(): Promise<void> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of notifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error clearing all notifications:', error);
  }
}

/**
 * Helper: Format time for display
 */
function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Helper: Get next birthday date
 */
function getNextBirthdayDate(birthDate: Date): Date {
  const today = new Date();
  let birthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  // If birthday has already passed this year, schedule for next year
  if (birthday < today) {
    birthday = new Date(
      today.getFullYear() + 1,
      birthDate.getMonth(),
      birthDate.getDate()
    );
  }

  return birthday;
}

/**
 * Helper: Store scheduled notification mapping
 */
async function storeScheduledNotification(
  key: string,
  notificationId: string
): Promise<void> {
  try {
    // Could persist this to AsyncStorage for recovery
    // For now, just logging for debugging
    console.log(`Scheduled notification: ${key} -> ${notificationId}`);
  } catch (error) {
    console.error('Error storing notification mapping:', error);
  }
}
