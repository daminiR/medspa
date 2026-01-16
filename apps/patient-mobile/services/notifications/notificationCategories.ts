/**
 * Notification Categories
 *
 * Defines notification categories with actions for iOS and Android.
 * Allows users to take actions directly from notifications.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Set up notification categories
 * Categories allow users to interact with notifications (e.g., Confirm, Cancel)
 */
export async function setupNotificationCategories(): Promise<void> {
  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync('appointment', [
      {
        identifier: 'confirm',
        buttonTitle: 'Confirm',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'reschedule',
        buttonTitle: 'Reschedule',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'cancel',
        buttonTitle: 'Cancel',
        options: {
          isDestructive: true,
          opensAppToForeground: true,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('message', [
      {
        identifier: 'reply',
        buttonTitle: 'Reply',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'mark_read',
        buttonTitle: 'Mark as Read',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('promotion', [
      {
        identifier: 'view',
        buttonTitle: 'View Offer',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('reward', [
      {
        identifier: 'view',
        buttonTitle: 'View Reward',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'share',
        buttonTitle: 'Share',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  }
}

/**
 * Handle notification action response
 */
export async function handleNotificationAction(
  actionIdentifier: string,
  notification: Notifications.Notification
): Promise<void> {
  const { data } = notification.request.content;

  switch (actionIdentifier) {
    case 'confirm':
      // Handle appointment confirmation
      console.log('Confirming appointment:', data.appointmentId);
      // TODO: API call to confirm appointment
      break;

    case 'reschedule':
      // Handle appointment reschedule
      console.log('Rescheduling appointment:', data.appointmentId);
      // Will open app to reschedule screen
      break;

    case 'cancel':
      // Handle appointment cancellation
      console.log('Canceling appointment:', data.appointmentId);
      // TODO: API call to cancel appointment
      break;

    case 'reply':
      // Handle message reply
      console.log('Replying to message:', data.messageId);
      // Will open app to message thread
      break;

    case 'mark_read':
      // Handle mark as read
      console.log('Marking message as read:', data.messageId);
      // TODO: API call to mark message as read
      break;

    case 'view':
      // Handle view action (promotion/reward)
      console.log('Viewing:', data);
      // Will open app to relevant screen
      break;

    case 'dismiss':
      // Handle dismiss action
      console.log('Dismissing notification');
      break;

    case 'share':
      // Handle share action
      console.log('Sharing:', data);
      // Will open app to share screen
      break;

    default:
      console.log('Unknown action:', actionIdentifier);
  }
}
