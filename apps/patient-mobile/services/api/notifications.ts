/**
 * Notifications API Service
 * Handles all notification-related API calls to the backend
 */

import { apiClient, ApiResponse } from './client';
import { NotificationPreferences } from '@/types/notifications';

// Types
export interface PushTokenRegistration {
  token: string;
  platform: 'ios' | 'android';
  deviceModel?: string;
  deviceOS?: string;
  appVersion?: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export interface BackendNotificationPreferences {
  enabled: boolean;
  appointmentReminders: boolean;
  appointmentReminder24h: boolean;
  appointmentReminder2h: boolean;
  appointmentChanges: boolean;
  messages: boolean;
  rewards: boolean;
  promotions: boolean;
  system: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

/**
 * Notifications API Service
 */
class NotificationsApiService {
  /**
   * Register push token with backend
   * Called when a new push token is acquired or when token refreshes
   */
  async registerPushToken(
    registration: PushTokenRegistration
  ): Promise<ApiResponse<{ success: boolean; deviceId: string }>> {
    return apiClient.post('/api/notifications/register-token', registration);
  }

  /**
   * Unregister push token from backend
   * Called on logout to stop receiving push notifications
   */
  async unregisterPushToken(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete('/api/notifications/unregister');
  }

  /**
   * Get notification preferences from backend
   * Called on app launch to sync preferences
   */
  async getNotificationPreferences(): Promise<ApiResponse<BackendNotificationPreferences>> {
    return apiClient.get('/api/notifications/preferences');
  }

  /**
   * Update notification preferences on backend
   * Called when user changes any preference setting
   */
  async updateNotificationPreferences(
    preferences: Partial<BackendNotificationPreferences>
  ): Promise<ApiResponse<BackendNotificationPreferences>> {
    return apiClient.patch('/api/notifications/preferences', preferences);
  }

  /**
   * Get list of notifications for the user
   * Supports pagination
   */
  async getNotifications(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<NotificationListResponse>> {
    return apiClient.get(`/api/notifications?page=${page}&limit=${limit}`);
  }

  /**
   * Mark a specific notification as read
   */
  async markNotificationRead(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.patch(`/api/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<ApiResponse<{ success: boolean; count: number }>> {
    return apiClient.patch('/api/notifications/read-all');
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete(`/api/notifications/${notificationId}`);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get('/api/notifications/unread-count');
  }

  /**
   * Register device for FCM (Firebase Cloud Messaging)
   * This is called in addition to registerPushToken for FCM-specific registration
   */
  async registerFcmToken(
    fcmToken: string,
    platform: 'ios' | 'android'
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/api/notifications/fcm/register', {
      fcmToken,
      platform,
    });
  }

  /**
   * Report notification received (for analytics)
   */
  async reportNotificationReceived(
    notificationId: string,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/api/notifications/analytics/received', {
      notificationId,
      receivedAt: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Report notification opened (for analytics)
   */
  async reportNotificationOpened(
    notificationId: string,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/api/notifications/analytics/opened', {
      notificationId,
      openedAt: new Date().toISOString(),
      ...metadata,
    });
  }

  /**
   * Update quiet hours settings
   */
  async updateQuietHours(
    enabled: boolean,
    start?: string,
    end?: string
  ): Promise<ApiResponse<BackendNotificationPreferences>> {
    return apiClient.patch('/api/notifications/preferences', {
      quietHoursEnabled: enabled,
      ...(start && { quietHoursStart: start }),
      ...(end && { quietHoursEnd: end }),
    });
  }

  /**
   * Test push notification (development only)
   */
  async sendTestNotification(): Promise<ApiResponse<{ success: boolean; messageId: string }>> {
    return apiClient.post('/api/notifications/test');
  }
}

export const notificationsApiService = new NotificationsApiService();
export default notificationsApiService;
