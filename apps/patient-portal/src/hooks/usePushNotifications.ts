'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getToken, onMessage, Messaging } from 'firebase/messaging';
import {
  getFirebaseMessaging,
  getVapidKey,
  isFirebaseConfigured,
  firebaseConfig,
} from '@/lib/firebase';

// Storage keys for notification preferences
const NOTIFICATION_TOKEN_KEY = 'fcm-token';
const NOTIFICATION_DISMISSED_KEY = 'notification-prompt-dismissed';
const NOTIFICATION_DISMISSED_UNTIL_KEY = 'notification-prompt-dismissed-until';

// Types for notification permission
export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface PushNotificationState {
  permission: NotificationPermission;
  token: string | null;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UsePushNotificationsReturn extends PushNotificationState {
  requestPermission: () => Promise<boolean>;
  getToken: () => Promise<string | null>;
  subscribeToNotifications: () => Promise<boolean>;
  unsubscribeFromNotifications: () => Promise<boolean>;
  shouldShowPrompt: boolean;
  dismissPrompt: () => void;
  dismissPromptForDays: (days: number) => void;
}

/**
 * Hook for managing push notifications via Firebase Cloud Messaging
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const [state, setState] = useState<PushNotificationState>({
    permission: 'default',
    token: null,
    isSupported: false,
    isLoading: true,
    error: null,
  });

  const [isPromptDismissed, setIsPromptDismissed] = useState(false);
  const messagingRef = useRef<Messaging | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Check browser support and current permission on mount
  useEffect(() => {
    const initialize = async () => {
      // Check if running in browser
      if (typeof window === 'undefined') {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Check if Notification API is supported
      if (!('Notification' in window)) {
        setState((prev) => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          error: 'Notifications are not supported in this browser',
        }));
        return;
      }

      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        setState((prev) => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          error: 'Service workers are not supported in this browser',
        }));
        return;
      }

      // Check if Firebase is configured
      if (!isFirebaseConfigured()) {
        setState((prev) => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          error: 'Firebase is not configured',
        }));
        return;
      }

      // Get current permission status
      const currentPermission = Notification.permission as NotificationPermission;

      // Check for existing token in localStorage
      let savedToken: string | null = null;
      try {
        savedToken = localStorage.getItem(NOTIFICATION_TOKEN_KEY);
      } catch {
        // localStorage not available
      }

      setState((prev) => ({
        ...prev,
        isSupported: true,
        permission: currentPermission,
        token: savedToken,
        isLoading: false,
      }));

      // Check if prompt was dismissed
      checkPromptDismissed();

      // If already granted, try to get/refresh the token
      if (currentPermission === 'granted' && savedToken) {
        initializeMessaging();
      }
    };

    initialize();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  /**
   * Check if the notification prompt was dismissed by the user
   */
  const checkPromptDismissed = useCallback(() => {
    try {
      const dismissedUntil = localStorage.getItem(NOTIFICATION_DISMISSED_UNTIL_KEY);
      if (dismissedUntil) {
        const dismissedDate = new Date(dismissedUntil);
        if (dismissedDate > new Date()) {
          setIsPromptDismissed(true);
          return;
        } else {
          // Clear expired dismissal
          localStorage.removeItem(NOTIFICATION_DISMISSED_KEY);
          localStorage.removeItem(NOTIFICATION_DISMISSED_UNTIL_KEY);
        }
      }

      // Check session dismissal
      const sessionDismissed = sessionStorage.getItem(NOTIFICATION_DISMISSED_KEY);
      if (sessionDismissed === 'true') {
        setIsPromptDismissed(true);
      }
    } catch {
      // Storage not available
    }
  }, []);

  /**
   * Initialize Firebase Messaging and set up message listener
   */
  const initializeMessaging = useCallback(async () => {
    try {
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        return;
      }

      messagingRef.current = messaging;

      // Register the Firebase messaging service worker
      await registerFirebaseServiceWorker();

      // Set up foreground message handler
      unsubscribeRef.current = onMessage(messaging, (payload) => {
        console.log('[Push] Foreground message received:', payload);
        handleForegroundMessage(payload);
      });
    } catch (error) {
      console.error('[Push] Error initializing messaging:', error);
    }
  }, []);

  /**
   * Register the Firebase messaging service worker
   */
  const registerFirebaseServiceWorker = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/' }
      );

      // Send Firebase config to the service worker
      if (registration.active) {
        registration.active.postMessage({
          type: 'FIREBASE_CONFIG',
          config: firebaseConfig,
        });
      } else if (registration.installing) {
        registration.installing.addEventListener('statechange', (e) => {
          if ((e.target as ServiceWorker).state === 'activated') {
            registration.active?.postMessage({
              type: 'FIREBASE_CONFIG',
              config: firebaseConfig,
            });
          }
        });
      }

      return registration;
    } catch (error) {
      console.error('[Push] Error registering service worker:', error);
      throw error;
    }
  }, []);

  /**
   * Handle foreground messages (when app is open)
   */
  const handleForegroundMessage = useCallback((payload: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => {
    // Show a browser notification for foreground messages
    const { notification, data } = payload;

    if (notification && Notification.permission === 'granted') {
      new Notification(notification.title || 'Glow MedSpa', {
        body: notification.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: data?.tag || 'glow-medspa-foreground',
        data: data,
      });
    }

    // Dispatch custom event for the app to handle
    window.dispatchEvent(
      new CustomEvent('push-notification', { detail: payload })
    );
  }, []);

  /**
   * Request notification permission from the user
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      return false;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const permission = await Notification.requestPermission();

      setState((prev) => ({
        ...prev,
        permission: permission as NotificationPermission,
        isLoading: false,
      }));

      if (permission === 'granted') {
        await initializeMessaging();
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to request permission';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [state.isSupported, initializeMessaging]);

  /**
   * Get the FCM token for the current device
   */
  const getFCMToken = useCallback(async (): Promise<string | null> => {
    if (!state.isSupported || state.permission !== 'granted') {
      return null;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const messaging = messagingRef.current || (await getFirebaseMessaging());
      if (!messaging) {
        throw new Error('Messaging not available');
      }

      const vapidKey = getVapidKey();
      if (!vapidKey) {
        throw new Error('VAPID key not configured');
      }

      // Get the service worker registration
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (!registration) {
        throw new Error('Service worker not registered');
      }

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        // Save token to localStorage
        try {
          localStorage.setItem(NOTIFICATION_TOKEN_KEY, token);
        } catch {
          // localStorage not available
        }

        setState((prev) => ({
          ...prev,
          token,
          isLoading: false,
        }));

        return token;
      }

      throw new Error('Failed to get FCM token');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get token';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [state.isSupported, state.permission]);

  /**
   * Subscribe to notifications (request permission + get token + register with backend)
   */
  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    try {
      // Request permission if not already granted
      if (state.permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          return false;
        }
      }

      // Get the FCM token
      const token = await getFCMToken();
      if (!token) {
        return false;
      }

      // Register the token with the backend
      await registerTokenWithBackend(token);

      return true;
    } catch (error) {
      console.error('[Push] Error subscribing to notifications:', error);
      return false;
    }
  }, [state.permission, requestPermission, getFCMToken]);

  /**
   * Register the FCM token with the backend
   */
  const registerTokenWithBackend = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform: 'web',
          deviceInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register token with backend');
      }
    } catch (error) {
      console.error('[Push] Error registering token with backend:', error);
      // Don't throw - we still want notifications to work locally
    }
  }, []);

  /**
   * Unsubscribe from notifications
   */
  const unsubscribeFromNotifications = useCallback(async (): Promise<boolean> => {
    try {
      // Remove token from localStorage
      try {
        localStorage.removeItem(NOTIFICATION_TOKEN_KEY);
      } catch {
        // localStorage not available
      }

      // Unregister token from backend
      if (state.token) {
        await unregisterTokenFromBackend(state.token);
      }

      setState((prev) => ({
        ...prev,
        token: null,
      }));

      return true;
    } catch (error) {
      console.error('[Push] Error unsubscribing from notifications:', error);
      return false;
    }
  }, [state.token]);

  /**
   * Unregister the FCM token from the backend
   */
  const unregisterTokenFromBackend = useCallback(async (token: string) => {
    try {
      await fetch('/api/notifications/unregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error('[Push] Error unregistering token from backend:', error);
    }
  }, []);

  /**
   * Dismiss the notification prompt for this session
   */
  const dismissPrompt = useCallback(() => {
    try {
      sessionStorage.setItem(NOTIFICATION_DISMISSED_KEY, 'true');
      setIsPromptDismissed(true);
    } catch {
      // Storage not available
    }
  }, []);

  /**
   * Dismiss the notification prompt for N days
   */
  const dismissPromptForDays = useCallback((days: number) => {
    try {
      const dismissUntil = new Date();
      dismissUntil.setDate(dismissUntil.getDate() + days);
      localStorage.setItem(NOTIFICATION_DISMISSED_KEY, 'true');
      localStorage.setItem(
        NOTIFICATION_DISMISSED_UNTIL_KEY,
        dismissUntil.toISOString()
      );
      setIsPromptDismissed(true);
    } catch {
      // Storage not available
    }
  }, []);

  // Determine if we should show the notification prompt
  const shouldShowPrompt =
    state.isSupported &&
    state.permission === 'default' &&
    !isPromptDismissed &&
    !state.isLoading;

  return {
    ...state,
    requestPermission,
    getToken: getFCMToken,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    shouldShowPrompt,
    dismissPrompt,
    dismissPromptForDays,
  };
}

export default usePushNotifications;
