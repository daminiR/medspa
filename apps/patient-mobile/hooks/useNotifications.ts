/**
 * useNotifications Hook
 *
 * React hook for managing push notifications in the app.
 * Handles:
 * - Permission requests
 * - Notification listeners
 * - Foreground/background/terminated states
 * - Backend sync for preferences and token management
 * - Cleanup on unmount
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@/store/auth';
import {
  registerForPushNotifications,
  registerPushTokenWithBackend,
  unregisterPushToken,
  configureNotificationHandler,
  handleNotificationReceived,
  handleNotificationPressed,
  handleTokenRefresh,
  clearBadgeCount,
  getNotificationPreferences,
  syncPreferencesFromBackend,
  shouldSyncPreferences,
} from '@/services/notifications/pushNotifications';
import { handleRemoteNotificationReceived, handleRemoteNotificationPressed } from '@/services/notifications/remoteNotifications';

export interface UseNotificationsReturn {
  isRegistered: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  permissionStatus: Notifications.PermissionStatus | null;
  requestPermissions: () => Promise<boolean>;
  clearBadge: () => Promise<void>;
  syncPreferences: () => Promise<void>;
  unregister: () => Promise<boolean>;
}

export function useNotifications(): UseNotificationsReturn {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);

  const { user, session, isAuthenticated } = useAuthStore();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const tokenRefreshListener = useRef<Notifications.Subscription>();
  const appStateListener = useRef<any>();

  /**
   * Initialize notifications on mount
   */
  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);

        // Configure notification handler
        configureNotificationHandler();

        // Check current permission status
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);

        // If authenticated and permissions granted, register for push
        if (isAuthenticated && status === 'granted') {
          await registerNotifications();

          // Sync preferences from backend on app launch
          const shouldSync = await shouldSyncPreferences();
          if (shouldSync) {
            await syncPreferencesFromBackend();
          }
        }

        // Set up notification listeners
        setupListeners();

        // Set up token refresh listener
        setupTokenRefreshListener();

        // Set up app state listener
        setupAppStateListener();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();

    // Cleanup on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      if (tokenRefreshListener.current) {
        Notifications.removeNotificationSubscription(tokenRefreshListener.current);
      }
      if (appStateListener.current) {
        appStateListener.current.remove();
      }
    };
  }, [isAuthenticated]);

  /**
   * Register for push notifications
   */
  async function registerNotifications(): Promise<void> {
    try {
      const result = await registerForPushNotifications();

      if (result.success && result.token) {
        setIsRegistered(true);

        // Register token with backend if user is authenticated
        if (user && session) {
          await registerPushTokenWithBackend(result.token, user.id, session.token);
        }
      } else {
        console.warn('Failed to register for push notifications:', result.error);
      }
    } catch (error) {
      console.error('Error in registerNotifications:', error);
    }
  }

  /**
   * Set up notification listeners
   */
  function setupListeners() {
    // Listener for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        // Use remote notification handler for better analytics
        handleRemoteNotificationReceived(notification);
      }
    );

    // Listener for user tapping on notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // Use remote notification handler for better deep linking
        handleRemoteNotificationPressed(response);
      }
    );
  }

  /**
   * Set up token refresh listener
   * Handles cases where the push token changes (reinstall, device restore, etc.)
   */
  function setupTokenRefreshListener() {
    // Listen for token updates
    tokenRefreshListener.current = Notifications.addPushTokenListener(
      async (tokenData) => {
        const newToken = tokenData.data;
        console.log('Push token refreshed:', newToken);
        await handleTokenRefresh(newToken);
      }
    );
  }

  /**
   * Set up app state listener to clear badge when app becomes active
   */
  function setupAppStateListener() {
    appStateListener.current = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          // Clear badge when app becomes active
          const preferences = await getNotificationPreferences();
          if (preferences.badge) {
            await clearBadgeCount();
          }
        }
      }
    );
  }

  /**
   * Request notification permissions
   */
  async function requestPermissions(): Promise<boolean> {
    try {
      setIsLoading(true);

      const result = await registerForPushNotifications();

      if (result.success) {
        setIsRegistered(true);
        setPermissionStatus('granted');

        // Token is now automatically registered with backend in registerForPushNotifications
        // No need to call registerPushTokenWithBackend separately

        return true;
      } else {
        setPermissionStatus('denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Clear badge count
   */
  async function clearBadge(): Promise<void> {
    await clearBadgeCount();
  }

  /**
   * Sync preferences from backend
   */
  const syncPreferences = useCallback(async (): Promise<void> => {
    try {
      setIsSyncing(true);
      await syncPreferencesFromBackend();
    } catch (error) {
      console.error('Error syncing preferences:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  /**
   * Unregister push notifications (on logout)
   */
  const unregister = useCallback(async (): Promise<boolean> => {
    try {
      const success = await unregisterPushToken();
      if (success) {
        setIsRegistered(false);
      }
      return success;
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
      return false;
    }
  }, []);

  return {
    isRegistered,
    isLoading,
    isSyncing,
    permissionStatus,
    requestPermissions,
    clearBadge,
    syncPreferences,
    unregister,
  };
}

/**
 * Hook for handling notification when app is opened from terminated state
 * Uses the remote notification handler for proper deep linking and analytics
 */
export function useLastNotificationResponse() {
  useEffect(() => {
    // Get the notification response that opened the app
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        // Use remote notification handler for consistent behavior
        handleRemoteNotificationPressed(response);
      }
    });
  }, []);
}
