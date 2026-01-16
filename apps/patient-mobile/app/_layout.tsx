/**
 * Root Layout for Patient Mobile App
 *
 * Handles:
 * - Navigation structure (stack + tabs)
 * - Authentication state
 * - Theme configuration
 * - Splash screen
 * - Push notification listeners
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/store/auth';
import {
  configureNotificationHandler,
  registerForPushNotifications,
  registerPushTokenWithBackend,
  setupNotificationCategories,
  handleNotificationReceived,
  handleNotificationPressed,
  markNotificationPromptShown,
  hasShownNotificationPrompt,
} from '@/services/notifications';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoading, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    async function prepare() {
      try {
        // Check if user is authenticated (check secure store for session)
        await checkAuthStatus();
        
        // Initialize notifications
        await initializeNotifications();
      } catch (e) {
        console.warn('Error during app setup:', e);
      } finally {
        // Hide splash screen once ready
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Initialize push notifications
  async function initializeNotifications() {
    try {
      // Configure notification handler
      configureNotificationHandler();
      
      // Set up notification categories (iOS)
      await setupNotificationCategories();
      
      // Register for push notifications
      const { success, token } = await registerForPushNotifications();
      
      if (success && token) {
        // Register token with backend if user is logged in
        const user = useAuthStore.getState().user;
        if (user) {
          // TODO: Get session token from auth store
          // await registerPushTokenWithBackend(token, user.id, sessionToken);
        }
      }
      
      // Set up notification listeners
      const receivedSubscription =
        Notifications.addNotificationReceivedListener((notification) => {
          handleNotificationReceived(notification);
        });

      const responseSubscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          handleNotificationPressed(response);
        });

      // Cleanup
      return () => {
        receivedSubscription.remove();
        responseSubscription.remove();
      };
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        >
          {/* Auth screens - no header */}
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />

          {/* Main app with tabs */}
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />

          {/* Modal screens */}
          <Stack.Screen
            name="booking/[serviceId]"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />

          <Stack.Screen
            name="appointment/[id]"
            options={{
              presentation: 'card',
            }}
          />

          <Stack.Screen
            name="photo/[id]"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade',
            }}
          />

          {/* Notifications */}
          <Stack.Screen
            name="notifications"
            options={{
              headerShown: false,
            }}
          />

          {/* Settings */}
          <Stack.Screen
            name="settings"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
