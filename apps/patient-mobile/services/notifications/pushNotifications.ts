/**
 * Push Notifications Service
 *
 * Handles all push notification functionality:
 * - Registration and permissions
 * - Scheduling local notifications
 * - Handling incoming notifications
 * - Managing notification preferences
 * - Backend API integration for token management
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  NotificationType,
  NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
  ScheduledNotification,
} from '@/types/notifications';
import { notificationsApiService } from '@/services/api/notifications';
import { tokenStorage } from '@/services/api/client';

// Storage keys
const PUSH_TOKEN_KEY = 'expo_push_token';
const PREVIOUS_PUSH_TOKEN_KEY = 'previous_push_token';
const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';
const NOTIFICATION_PROMPT_SHOWN_KEY = 'notification_prompt_shown';
const PREFERENCES_SYNCED_KEY = 'notification_preferences_synced';

// API configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.luxemedspa.com';

/**
 * Configure notification handler
 * This determines how notifications are shown when app is in foreground
 */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const preferences = await getNotificationPreferences();
      
      // Check quiet hours
      if (preferences.quietHoursEnabled && isInQuietHours(preferences)) {
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: true,
        };
      }

      return {
        shouldShowAlert: true,
        shouldPlaySound: preferences.sound,
        shouldSetBadge: preferences.badge,
      };
    },
  });
}

/**
 * Register for push notifications and get push token
 * Handles token acquisition, storage, and backend registration
 */
export async function registerForPushNotifications(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
  tokenRefreshed?: boolean;
}> {
  try {
    // Check if device is physical (push notifications don't work on simulator)
    if (!Device.isDevice) {
      return {
        success: false,
        error: 'Push notifications only work on physical devices',
      };
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Permission denied
    if (finalStatus !== 'granted') {
      return {
        success: false,
        error: 'Permission to receive notifications was denied',
      };
    }

    // Get push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    const token = tokenData.data;

    // Check if token has changed (token refresh scenario)
    const previousToken = await AsyncStorage.getItem(PREVIOUS_PUSH_TOKEN_KEY);
    const tokenRefreshed = previousToken !== null && previousToken !== token;

    // Store current token as previous for next comparison
    await AsyncStorage.setItem(PREVIOUS_PUSH_TOKEN_KEY, token);

    // Store token locally
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

    // Configure notification channels for Android
    if (Platform.OS === 'android') {
      await configureAndroidChannels();
    }

    // Register token with backend if user is authenticated
    const accessToken = await tokenStorage.getAccessToken();
    if (accessToken) {
      await registerTokenWithBackendApi(token, tokenRefreshed);
    }

    return {
      success: true,
      token,
      tokenRefreshed,
    };
  } catch (error: any) {
    console.error('Error registering for push notifications:', error);
    return {
      success: false,
      error: error.message || 'Failed to register for push notifications',
    };
  }
}

/**
 * Register push token with backend API
 * Called automatically after token acquisition and on token refresh
 */
async function registerTokenWithBackendApi(
  token: string,
  isRefresh: boolean = false
): Promise<boolean> {
  try {
    const platform = Platform.OS as 'ios' | 'android';
    const appVersion = Application.nativeApplicationVersion || '1.0.0';

    const response = await notificationsApiService.registerPushToken({
      token,
      platform,
      deviceModel: Device.modelName || undefined,
      deviceOS: `${Platform.OS} ${Device.osVersion}`,
      appVersion,
    });

    if (response.success) {
      console.log(
        isRefresh
          ? 'Push token refreshed and registered with backend'
          : 'Push token registered with backend'
      );
      return true;
    } else {
      console.error('Failed to register push token with backend:', response.error);
      return false;
    }
  } catch (error) {
    console.error('Error registering push token with backend:', error);
    return false;
  }
}

/**
 * Unregister push token from backend
 * Should be called on logout to stop receiving push notifications
 */
export async function unregisterPushToken(): Promise<boolean> {
  try {
    const response = await notificationsApiService.unregisterPushToken();

    if (response.success) {
      // Clear stored tokens
      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
      await AsyncStorage.removeItem(PREVIOUS_PUSH_TOKEN_KEY);
      await AsyncStorage.removeItem(PREFERENCES_SYNCED_KEY);

      console.log('Push token unregistered from backend');
      return true;
    } else {
      console.error('Failed to unregister push token:', response.error);
      return false;
    }
  } catch (error) {
    console.error('Error unregistering push token:', error);
    return false;
  }
}

/**
 * Handle token refresh
 * Called when the push token changes (e.g., app reinstall, device restore)
 */
export async function handleTokenRefresh(newToken: string): Promise<void> {
  try {
    const previousToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);

    if (previousToken !== newToken) {
      console.log('Push token refreshed, updating backend...');
      await AsyncStorage.setItem(PREVIOUS_PUSH_TOKEN_KEY, previousToken || '');
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, newToken);

      // Register new token with backend
      const accessToken = await tokenStorage.getAccessToken();
      if (accessToken) {
        await registerTokenWithBackendApi(newToken, true);
      }
    }
  } catch (error) {
    console.error('Error handling token refresh:', error);
  }
}

/**
 * Configure Android notification channels
 */
async function configureAndroidChannels() {
  await Notifications.setNotificationChannelAsync('appointments', {
    name: 'Appointments',
    description: 'Appointment reminders and updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
    enableLights: true,
    lightColor: '#667eea',
    enableVibrate: true,
  });

  await Notifications.setNotificationChannelAsync('messages', {
    name: 'Messages',
    description: 'New messages from providers',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    enableVibrate: true,
  });

  await Notifications.setNotificationChannelAsync('rewards', {
    name: 'Rewards & Points',
    description: 'Points earned and rewards available',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('promotions', {
    name: 'Promotions',
    description: 'Special offers and promotions',
    importance: Notifications.AndroidImportance.LOW,
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('system', {
    name: 'System',
    description: 'Important system notifications',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

/**
 * Register push token with backend
 */
export async function registerPushTokenWithBackend(
  token: string,
  userId: string,
  sessionToken: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        userId,
        token,
        platform: Platform.OS,
        deviceModel: Device.modelName,
        deviceOS: `${Platform.OS} ${Device.osVersion}`,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error registering push token with backend:', error);
    return false;
  }
}

/**
 * Schedule appointment reminder notification
 */
export async function scheduleAppointmentReminder(
  appointmentId: string,
  serviceName: string,
  serviceType: string,
  startTime: Date,
  when: 'day_before' | '2_hours_before',
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
    if (when === 'day_before' && !preferences.appointmentReminder24h) {
      return null;
    }
    if (when === '2_hours_before' && !preferences.appointmentReminder2h) {
      return null;
    }

    // Calculate trigger time
    let triggerDate: Date;
    let title: string;
    let body: string;

    if (when === 'day_before') {
      triggerDate = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
      title = 'Appointment Tomorrow';
      body = `Your ${serviceName} is tomorrow at ${formatTime(startTime)}!`;
    } else {
      triggerDate = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);
      title = 'Appointment Soon';
      body = `See you soon! Your ${serviceName} starts at ${formatTime(startTime)}`;
    }

    // Don't schedule if trigger time is in the past
    if (triggerDate < new Date()) {
      return null;
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
          serviceType,
          startTime: startTime.toISOString(),
          providerName,
          locationName,
        },
        sound: preferences.sound ? 'default' : undefined,
        badge: 1,
        categoryIdentifier: 'appointment',
      },
      trigger: {
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'appointments' : undefined,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling appointment reminder:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications for an appointment
 */
export async function cancelAppointmentNotifications(appointmentId: string): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    const appointmentNotifications = scheduled.filter(
      (notification) => notification.content.data?.appointmentId === appointmentId
    );

    for (const notification of appointmentNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error canceling appointment notifications:', error);
  }
}

/**
 * Handle notification received (when app is in foreground)
 */
export function handleNotificationReceived(
  notification: Notifications.Notification
): void {
  const { type } = notification.request.content.data as { type?: NotificationType };

  // Update badge count
  updateBadgeCount();

  // Log for debugging
  console.log('Notification received:', type, notification.request.content);

  // Could trigger local state updates, sound effects, etc.
}

/**
 * Handle notification pressed (user tapped on notification)
 */
export async function handleNotificationPressed(
  response: Notifications.NotificationResponse
): Promise<void> {
  const { data } = response.notification.request.content;
  const type = data.type as NotificationType;

  try {
    switch (type) {
      case 'appointment_reminder':
      case 'appointment_confirmed':
      case 'appointment_cancelled':
      case 'appointment_rescheduled':
        if (data.appointmentId) {
          router.push(`/appointment/${data.appointmentId}`);
        } else {
          router.push('/(tabs)/appointments');
        }
        break;

      case 'new_message':
        if (data.threadId) {
          router.push(`/messages/${data.threadId}`);
        } else {
          router.push('/(tabs)/messages');
        }
        break;

      case 'points_earned':
      case 'reward_available':
        router.push('/(tabs)/membership');
        break;

      case 'referral_signup':
        router.push('/(tabs)/referrals');
        break;

      case 'promotion':
        if (data.promotionId) {
          router.push(`/promotions/${data.promotionId}`);
        } else {
          router.push('/(tabs)/dashboard');
        }
        break;

      case 'system':
        if (data.url) {
          router.push(data.url);
        }
        break;

      default:
        router.push('/(tabs)/dashboard');
    }
  } catch (error) {
    console.error('Error handling notification press:', error);
  }
}

/**
 * Get notification preferences
 * Retrieves from local storage, with optional backend sync
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const preferencesJson = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);

    if (preferencesJson) {
      return JSON.parse(preferencesJson);
    }

    return DEFAULT_NOTIFICATION_PREFERENCES;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

/**
 * Sync notification preferences from backend
 * Called on app launch to ensure local preferences match backend
 */
export async function syncPreferencesFromBackend(): Promise<NotificationPreferences> {
  try {
    const accessToken = await tokenStorage.getAccessToken();
    if (!accessToken) {
      // Not authenticated, return local preferences
      return getNotificationPreferences();
    }

    const response = await notificationsApiService.getNotificationPreferences();

    if (response.success && response.data) {
      // Update local storage with backend preferences
      await AsyncStorage.setItem(
        NOTIFICATION_PREFERENCES_KEY,
        JSON.stringify(response.data)
      );
      await AsyncStorage.setItem(PREFERENCES_SYNCED_KEY, new Date().toISOString());

      console.log('Notification preferences synced from backend');
      return response.data;
    } else {
      console.warn('Failed to sync preferences from backend:', response.error);
      return getNotificationPreferences();
    }
  } catch (error) {
    console.error('Error syncing preferences from backend:', error);
    return getNotificationPreferences();
  }
}

/**
 * Update notification preferences
 * Updates both local storage and backend
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  try {
    const current = await getNotificationPreferences();
    const updated = { ...current, ...preferences };

    // Update local storage first for immediate effect
    await AsyncStorage.setItem(
      NOTIFICATION_PREFERENCES_KEY,
      JSON.stringify(updated)
    );

    // Sync with backend if authenticated
    const accessToken = await tokenStorage.getAccessToken();
    if (accessToken) {
      const response = await notificationsApiService.updateNotificationPreferences(preferences);

      if (!response.success) {
        console.error('Failed to sync preferences to backend:', response.error);
        // Local update succeeded, but backend sync failed
        // This is acceptable - next sync will reconcile
        return true;
      }

      console.log('Notification preferences updated and synced to backend');
    }

    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}

/**
 * Update quiet hours settings
 * Convenience function for updating quiet hours specifically
 */
export async function updateQuietHours(
  enabled: boolean,
  start?: string,
  end?: string
): Promise<boolean> {
  const updates: Partial<NotificationPreferences> = {
    quietHoursEnabled: enabled,
  };

  if (start) updates.quietHoursStart = start;
  if (end) updates.quietHoursEnd = end;

  return updateNotificationPreferences(updates);
}

/**
 * Check if preferences have been synced recently
 */
export async function shouldSyncPreferences(): Promise<boolean> {
  try {
    const lastSync = await AsyncStorage.getItem(PREFERENCES_SYNCED_KEY);
    if (!lastSync) return true;

    const lastSyncDate = new Date(lastSync);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

    // Sync if more than 24 hours since last sync
    return hoursSinceSync > 24;
  } catch (error) {
    return true;
  }
}

/**
 * Check if notification prompt has been shown
 */
export async function hasShownNotificationPrompt(): Promise<boolean> {
  try {
    const shown = await AsyncStorage.getItem(NOTIFICATION_PROMPT_SHOWN_KEY);
    return shown === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Mark notification prompt as shown
 */
export async function markNotificationPromptShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PROMPT_SHOWN_KEY, 'true');
  } catch (error) {
    console.error('Error marking notification prompt as shown:', error);
  }
}

/**
 * Get current push token
 */
export async function getPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

/**
 * Check if current time is within quiet hours
 */
function isInQuietHours(preferences: NotificationPreferences): boolean {
  if (!preferences.quietHoursEnabled) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number);
  const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);

  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }

  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Update app badge count
 */
async function updateBadgeCount(): Promise<void> {
  try {
    const preferences = await getNotificationPreferences();
    
    if (!preferences.badge) {
      await Notifications.setBadgeCountAsync(0);
      return;
    }

    // Get count of unread items (would come from app state)
    // For now, just increment badge
    const current = await Notifications.getBadgeCountAsync();
    await Notifications.setBadgeCountAsync(current + 1);
  } catch (error) {
    console.error('Error updating badge count:', error);
  }
}

/**
 * Clear badge count
 */
export async function clearBadgeCount(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing badge count:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    
    return notifications.map((notification) => ({
      id: notification.identifier,
      type: notification.content.data?.type as NotificationType,
      scheduledFor: new Date((notification.trigger as any).date),
      title: notification.content.title || '',
      body: notification.content.body || '',
      data: notification.content.data,
    }));
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Format time for notification body
 */
function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
}
