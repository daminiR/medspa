/**
 * Notifications Service - Main Export
 *
 * Central export file for all notification-related functionality.
 * Includes push notification management, backend sync, and local scheduling.
 */

// Push notification core functions
export {
  configureNotificationHandler,
  registerForPushNotifications,
  registerPushTokenWithBackend,
  unregisterPushToken,
  handleTokenRefresh,
  scheduleAppointmentReminder,
  cancelScheduledNotification,
  cancelAppointmentNotifications,
  handleNotificationReceived,
  handleNotificationPressed,
  getNotificationPreferences,
  updateNotificationPreferences,
  syncPreferencesFromBackend,
  updateQuietHours,
  shouldSyncPreferences,
  hasShownNotificationPrompt,
  markNotificationPromptShown,
  getPushToken,
  clearBadgeCount,
  getScheduledNotifications,
} from './pushNotifications';

// Notification categories and actions
export {
  setupNotificationCategories,
  handleNotificationAction,
} from './notificationCategories';

// Local notification scheduling
export {
  scheduleAppointmentReminder as scheduleAppointmentReminderLocal,
  scheduleCustomReminder,
  scheduleReviewReminder,
  scheduleBirthdayNotification,
  scheduleMembershipRenewalReminder,
  cancelScheduledNotification as cancelLocalNotification,
  getScheduledNotifications as getLocalScheduledNotifications,
  clearAllScheduledNotifications,
} from './localNotifications';

// Remote/FCM notification handling
export {
  handleRemoteNotificationReceived,
  handleRemoteNotificationPressed,
  handleFCMDataMessage,
  showRichNotification,
  getNotificationAnalytics,
  clearNotificationLogs,
} from './remoteNotifications';

// Notification templates
export {
  notificationTemplates,
  getNotificationTemplate,
  quickNotifications,
} from './templates';
