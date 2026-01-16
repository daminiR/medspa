/**
 * Remote Notifications Handler
 *
 * Handles incoming push notifications from the backend (FCM):
 * - Appointment confirmations/changes
 * - New messages
 * - Promotional offers
 * - Referral rewards
 * - Before/after photos ready
 * - Custom analytics and logging
 * - Deep linking to appropriate screens
 */

import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationType } from '@/types/notifications';
import { notificationsApiService } from '@/services/api/notifications';

// FCM message types
interface FCMMessage {
  messageId: string;
  data?: Record<string, any>;
  notification?: {
    title?: string;
    body?: string;
    imageUrl?: string;
  };
  sentTime?: number;
}

interface RemoteNotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  badge?: number;
  imageUrl?: string;
  // FCM-specific fields
  notificationId?: string;
  collapseKey?: string;
  priority?: 'high' | 'normal';
}

// Deep link configuration
const DEEP_LINK_PREFIX = Linking.createURL('/');
const APP_SCHEME = 'luxemedspa';

/**
 * Handle incoming remote notification (when app is in foreground)
 * This is called when a push notification is received while the app is active
 */
export async function handleRemoteNotificationReceived(
  notification: Notifications.Notification
): Promise<void> {
  try {
    const { data } = notification.request.content;
    const type = data?.type as NotificationType;
    const notificationId = data?.notificationId || notification.request.identifier;

    // Log notification analytics
    await logNotificationEvent('received', type, data);

    // Report to backend for analytics
    if (notificationId) {
      await notificationsApiService.reportNotificationReceived(notificationId, {
        type,
        receivedInForeground: true,
      });
    }

    // Update badge count
    await updateNotificationBadge();

    // Trigger any special handling based on notification type
    await handleNotificationType(type, data as Record<string, any>);

    console.log('Remote notification received:', type, notificationId);
  } catch (error) {
    console.error('Error handling remote notification:', error);
  }
}

/**
 * Handle FCM data-only message
 * Called when FCM sends a data-only message (no notification payload)
 */
export async function handleFCMDataMessage(message: FCMMessage): Promise<void> {
  try {
    const { data, messageId } = message;
    const type = data?.type as NotificationType;

    // Log the data message
    console.log('FCM data message received:', messageId, type);

    // Report to backend
    if (data?.notificationId) {
      await notificationsApiService.reportNotificationReceived(data.notificationId, {
        type,
        isDataOnly: true,
      });
    }

    // Handle silent updates based on type
    if (type) {
      await handleNotificationType(type, data || {});
    }
  } catch (error) {
    console.error('Error handling FCM data message:', error);
  }
}

/**
 * Handle notification tap (user opened notification)
 * Routes user to appropriate screen based on notification data
 */
export async function handleRemoteNotificationPressed(
  response: Notifications.NotificationResponse
): Promise<void> {
  try {
    const { data } = response.notification.request.content;
    const type = data?.type as NotificationType;
    const notificationId = data?.notificationId || response.notification.request.identifier;
    const actionIdentifier = response.actionIdentifier;

    // Log notification analytics
    await logNotificationEvent('tapped', type, data);

    // Report to backend for analytics
    if (notificationId) {
      await notificationsApiService.reportNotificationOpened(notificationId, {
        type,
        action: actionIdentifier,
      });

      // Mark notification as read in backend
      await notificationsApiService.markNotificationRead(notificationId);
    }

    // Clear badge if navigating
    await clearNotificationBadge();

    // Handle notification action if present
    if (actionIdentifier && actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
      await handleNotificationAction(actionIdentifier, type, data as Record<string, any>);
      return;
    }

    // Route to appropriate screen
    await routeToNotificationTarget(type, data as Record<string, any>);

    console.log('Remote notification tapped:', type, notificationId);
  } catch (error) {
    console.error('Error handling remote notification press:', error);
    // Fallback to dashboard
    router.push('/(tabs)/dashboard');
  }
}

/**
 * Handle notification action buttons
 */
async function handleNotificationAction(
  actionId: string,
  type: NotificationType,
  data: Record<string, any>
): Promise<void> {
  switch (actionId) {
    case 'CONFIRM_APPOINTMENT':
      // Navigate to appointment confirmation
      if (data.appointmentId) {
        router.push(`/appointment/${data.appointmentId}/confirm` as any);
      }
      break;

    case 'RESCHEDULE_APPOINTMENT':
      // Navigate to reschedule flow
      if (data.appointmentId) {
        router.push(`/appointment/${data.appointmentId}/reschedule` as any);
      }
      break;

    case 'REPLY_MESSAGE':
      // Navigate to message thread
      if (data.threadId) {
        router.push(`/messages/${data.threadId}` as any);
      }
      break;

    case 'VIEW_REWARDS':
      router.push('/rewards' as any);
      break;

    case 'BOOK_NOW':
      // Navigate to booking with pre-filled service if available
      if (data.serviceId) {
        router.push(`/booking?service=${data.serviceId}` as any);
      } else {
        router.push('/booking' as any);
      }
      break;

    case 'DISMISS':
      // Just dismiss, no navigation needed
      break;

    default:
      // Default to routing based on notification type
      await routeToNotificationTarget(type, data);
  }
}

/**
 * Route user to appropriate screen based on notification type
 * Supports deep linking to specific content
 */
async function routeToNotificationTarget(
  type: NotificationType,
  data: Record<string, any>
): Promise<void> {
  // Check for explicit deep link URL in notification data
  if (data?.deepLink) {
    await handleDeepLink(data.deepLink);
    return;
  }

  switch (type) {
    case 'appointment_reminder':
    case 'appointment_confirmed':
      if (data?.appointmentId) {
        // Navigate to specific appointment detail
        router.push(`/appointment/${data.appointmentId}` as any);
      } else {
        router.push('/(tabs)/appointments');
      }
      break;

    case 'appointment_cancelled':
      // Navigate to appointments list with option to rebook
      if (data?.serviceId) {
        router.push(`/booking?service=${data.serviceId}&rebook=true` as any);
      } else {
        router.push('/(tabs)/appointments');
      }
      break;

    case 'appointment_rescheduled':
      if (data?.appointmentId) {
        router.push(`/appointment/${data.appointmentId}` as any);
      } else {
        router.push('/(tabs)/appointments');
      }
      break;

    case 'new_message':
      if (data?.threadId) {
        // Navigate to specific message thread
        router.push(`/messages/${data.threadId}` as any);
      } else if (data?.conversationId) {
        router.push(`/messages/${data.conversationId}` as any);
      } else {
        router.push('/(tabs)/messages');
      }
      break;

    case 'points_earned':
      // Navigate to rewards/points history
      router.push('/rewards' as any);
      break;

    case 'reward_available':
      if (data?.rewardId) {
        router.push(`/rewards/${data.rewardId}` as any);
      } else {
        router.push('/rewards' as any);
      }
      break;

    case 'referral_signup':
      if (data?.referralId) {
        router.push(`/referrals?highlight=${data.referralId}` as any);
      } else {
        router.push('/referrals' as any);
      }
      break;

    case 'promotion':
      if (data?.promotionId) {
        router.push(`/promotions/${data.promotionId}` as any);
      } else if (data?.serviceId) {
        router.push(`/booking?service=${data.serviceId}` as any);
      } else {
        router.push('/(tabs)/dashboard');
      }
      break;

    case 'system':
      if (data?.url) {
        await handleDeepLink(data.url);
      } else if (data?.action === 'update_required') {
        // Could open app store
        router.push('/settings' as any);
      } else {
        router.push('/(tabs)/dashboard');
      }
      break;

    default:
      router.push('/(tabs)/dashboard');
  }
}

/**
 * Handle deep link URL
 * Supports both internal routes and external URLs
 */
async function handleDeepLink(url: string): Promise<void> {
  try {
    // Check if it's an internal deep link
    if (url.startsWith(APP_SCHEME + '://') || url.startsWith(DEEP_LINK_PREFIX)) {
      // Extract the path from the deep link
      const path = url
        .replace(APP_SCHEME + '://', '')
        .replace(DEEP_LINK_PREFIX, '');

      if (path) {
        router.push(`/${path}` as any);
        return;
      }
    }

    // Check if it's a relative path
    if (url.startsWith('/')) {
      router.push(url as any);
      return;
    }

    // External URL - open in browser
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return;
      }
    }

    // Fallback to dashboard
    router.push('/(tabs)/dashboard');
  } catch (error) {
    console.error('Error handling deep link:', error);
    router.push('/(tabs)/dashboard');
  }
}

/**
 * Handle special processing for notification type
 */
async function handleNotificationType(
  type: NotificationType,
  data: Record<string, any>
): Promise<void> {
  switch (type) {
    case 'appointment_reminder':
    case 'appointment_confirmed':
    case 'appointment_cancelled':
    case 'appointment_rescheduled':
      // Could update local appointment data
      // Emit event to refresh appointments
      console.log('Appointment notification:', data.appointmentId);
      break;

    case 'new_message':
      // Could update message preview or add to unread count
      console.log('New message from:', data.senderName);
      break;

    case 'referral_signup':
      // Play success sound or animation
      console.log('Referral earned:', data.bonusPoints, 'points');
      break;

    case 'promotion':
      // Show promotional content
      console.log('Promotion available:', data.promotionId);
      break;

    default:
      break;
  }
}

/**
 * Update app badge with unread notification count
 */
async function updateNotificationBadge(): Promise<void> {
  try {
    const badgeCount = await AsyncStorage.getItem('notification_badge_count');
    const currentCount = badgeCount ? parseInt(badgeCount) : 0;
    const newCount = currentCount + 1;

    await AsyncStorage.setItem(
      'notification_badge_count',
      newCount.toString()
    );

    await Notifications.setBadgeCountAsync(newCount);
  } catch (error) {
    console.error('Error updating badge count:', error);
  }
}

/**
 * Clear notification badge
 */
async function clearNotificationBadge(): Promise<void> {
  try {
    await AsyncStorage.setItem('notification_badge_count', '0');
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing badge:', error);
  }
}

/**
 * Log notification events for analytics
 */
async function logNotificationEvent(
  event: 'received' | 'tapped' | 'dismissed',
  type: NotificationType,
  data?: Record<string, any>
): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      event,
      type,
      timestamp,
      data: data || {},
    };

    // Store in local analytics
    const logsJson = await AsyncStorage.getItem('notification_logs');
    const logs = logsJson ? JSON.parse(logsJson) : [];
    logs.push(logEntry);

    // Keep only last 100 logs
    const recentLogs = logs.slice(-100);
    await AsyncStorage.setItem('notification_logs', JSON.stringify(recentLogs));

    // TODO: Send to backend analytics service
    console.log('Notification event logged:', event, type);
  } catch (error) {
    console.error('Error logging notification event:', error);
  }
}

/**
 * Process notification deep link
 */
export async function processNotificationDeepLink(
  url: string
): Promise<void> {
  try {
    // Parse URL and extract route information
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Route based on URL path
    if (pathname.includes('/appointment/')) {
      const appointmentId = pathname.split('/').pop();
      router.push(`/(tabs)/appointments`);
    } else if (pathname.includes('/messages/')) {
      const threadId = pathname.split('/').pop();
      router.push(`/(tabs)/messages`);
    } else if (pathname.includes('/booking/')) {
      const serviceId = pathname.split('/').pop();
      router.push(`/booking/${serviceId}`);
    } else {
      // Default to dashboard
      router.push('/(tabs)/dashboard');
    }
  } catch (error) {
    console.error('Error processing deep link:', error);
    router.push('/(tabs)/dashboard');
  }
}

/**
 * Show rich notification with image
 */
export async function showRichNotification(
  title: string,
  body: string,
  imageUrl?: string,
  data?: Record<string, any>
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        imageUrl,
        sound: 'default',
        badge: 1,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error showing rich notification:', error);
    return null;
  }
}

/**
 * Get notification analytics
 */
export async function getNotificationAnalytics(): Promise<{
  totalReceived: number;
  totalTapped: number;
  byType: Record<string, number>;
  lastEvent?: {
    event: string;
    type: string;
    timestamp: string;
  };
}> {
  try {
    const logsJson = await AsyncStorage.getItem('notification_logs');
    const logs = logsJson ? JSON.parse(logsJson) : [];

    const analytics = {
      totalReceived: logs.filter((l: any) => l.event === 'received').length,
      totalTapped: logs.filter((l: any) => l.event === 'tapped').length,
      byType: {} as Record<string, number>,
      lastEvent: logs[logs.length - 1],
    };

    logs.forEach((log: any) => {
      analytics.byType[log.type] = (analytics.byType[log.type] || 0) + 1;
    });

    return analytics;
  } catch (error) {
    console.error('Error getting notification analytics:', error);
    return {
      totalReceived: 0,
      totalTapped: 0,
      byType: {},
    };
  }
}

/**
 * Clear notification logs
 */
export async function clearNotificationLogs(): Promise<void> {
  try {
    await AsyncStorage.removeItem('notification_logs');
  } catch (error) {
    console.error('Error clearing notification logs:', error);
  }
}
