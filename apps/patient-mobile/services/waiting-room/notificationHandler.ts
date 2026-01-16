/**
 * Waiting Room Notification Handler
 * Handles push notifications for room ready alerts
 */

import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class WaitingRoomNotificationHandler {
  /**
   * Schedule a local notification for testing
   */
  static async scheduleTestNotification(appointmentId: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Room is Ready!',
        body: 'Please proceed to Suite 3. Your provider will see you shortly.',
        data: {
          type: 'room_ready',
          appointmentId,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
  }

  /**
   * Handle notification received while app is in foreground
   */
  static setupNotificationReceivedListener() {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data;
        
        if (data.type === 'room_ready') {
          // Show in-app alert or toast
          console.log('Room ready notification received:', data);
        }
      }
    );

    return () => subscription.remove();
  }

  /**
   * Handle notification tapped by user
   */
  static setupNotificationResponseListener() {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        
        if (data.type === 'room_ready' && data.appointmentId) {
          // Navigate to waiting status screen
          router.push({
            pathname: '/waiting-room/status',
            params: { appointmentId: data.appointmentId }
          });
        }
      }
    );

    return () => subscription.remove();
  }

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  /**
   * Get push notification token
   */
  static async getPushToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { data: token } = await Notifications.getExpoPushTokenAsync();
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Initialize all notification listeners
   */
  static initializeListeners() {
    const receivedCleanup = this.setupNotificationReceivedListener();
    const responseCleanup = this.setupNotificationResponseListener();

    // Return cleanup function
    return () => {
      receivedCleanup();
      responseCleanup();
    };
  }
}

// Export singleton instance
export const notificationHandler = WaitingRoomNotificationHandler;
