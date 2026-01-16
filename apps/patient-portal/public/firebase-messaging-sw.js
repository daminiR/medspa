/**
 * Firebase Messaging Service Worker
 * Handles background push notifications for the Patient Portal
 */

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (these must be provided during build or via postMessage)
// For security, only non-sensitive config is included here
let firebaseConfig = null;

// Initialize Firebase when config is received
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;
    initializeFirebase();
  }
});

// Try to initialize with default config from environment (injected at build time)
function initializeFirebase() {
  if (!firebaseConfig) {
    // Fallback: try to get config from IndexedDB or skip initialization
    console.log('[Firebase SW] Waiting for config...');
    return;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log('[Firebase SW] Received background message:', payload);
      handlePushNotification(payload);
    });

    console.log('[Firebase SW] Firebase initialized successfully');
  } catch (error) {
    console.error('[Firebase SW] Error initializing Firebase:', error);
  }
}

/**
 * Handle push notifications received in the background
 */
function handlePushNotification(payload) {
  const { notification, data } = payload;

  // Determine notification type for deep linking
  const notificationType = data?.type || 'general';
  const deepLink = getDeepLink(notificationType, data);

  const notificationTitle = notification?.title || 'Glow MedSpa';
  const notificationOptions = {
    body: notification?.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    tag: data?.tag || `glow-medspa-${notificationType}-${Date.now()}`,
    renotify: true,
    requireInteraction: shouldRequireInteraction(notificationType),
    data: {
      url: deepLink,
      type: notificationType,
      ...data,
    },
    actions: getNotificationActions(notificationType),
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
}

/**
 * Get the deep link URL based on notification type
 */
function getDeepLink(type, data) {
  const baseUrl = self.location.origin;

  switch (type) {
    case 'appointment_reminder':
      return data?.appointmentId
        ? `${baseUrl}/appointments/${data.appointmentId}`
        : `${baseUrl}/appointments`;

    case 'room_ready':
    case 'waiting_room':
      return data?.appointmentId
        ? `${baseUrl}/check-in/${data.appointmentId}`
        : `${baseUrl}/check-in`;

    case 'message':
    case 'new_message':
      return data?.conversationId
        ? `${baseUrl}/messages/${data.conversationId}`
        : `${baseUrl}/messages`;

    case 'rewards':
    case 'points_earned':
      return `${baseUrl}/rewards`;

    case 'referral':
    case 'referral_complete':
      return `${baseUrl}/referrals`;

    case 'form_reminder':
    case 'intake_form':
      return data?.formId
        ? `${baseUrl}/forms/${data.formId}`
        : `${baseUrl}/forms`;

    case 'appointment_confirmed':
    case 'appointment_cancelled':
    case 'appointment_rescheduled':
      return data?.appointmentId
        ? `${baseUrl}/appointments/${data.appointmentId}`
        : `${baseUrl}/appointments`;

    case 'payment':
    case 'invoice':
      return `${baseUrl}/profile/payment-methods`;

    case 'photo':
    case 'new_photo':
      return `${baseUrl}/photos`;

    case 'group':
    case 'group_invite':
      return data?.groupId
        ? `${baseUrl}/groups/${data.groupId}`
        : `${baseUrl}/groups`;

    default:
      return data?.url || `${baseUrl}/dashboard`;
  }
}

/**
 * Get notification actions based on type
 */
function getNotificationActions(type) {
  switch (type) {
    case 'appointment_reminder':
      return [
        { action: 'view', title: 'View Details' },
        { action: 'check_in', title: 'Check In' },
      ];

    case 'room_ready':
      return [
        { action: 'open', title: 'I\'m Ready' },
      ];

    case 'message':
    case 'new_message':
      return [
        { action: 'reply', title: 'Reply' },
        { action: 'view', title: 'View' },
      ];

    case 'form_reminder':
      return [
        { action: 'complete', title: 'Complete Form' },
        { action: 'later', title: 'Later' },
      ];

    default:
      return [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' },
      ];
  }
}

/**
 * Determine if notification should require user interaction
 */
function shouldRequireInteraction(type) {
  // These notification types are important and should stay visible
  const importantTypes = [
    'room_ready',
    'appointment_reminder',
    'form_reminder',
  ];

  return importantTypes.includes(type);
}

/**
 * Handle notification click events
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Firebase SW] Notification clicked:', event.action);

  event.notification.close();

  // Handle dismiss action
  if (event.action === 'dismiss' || event.action === 'later') {
    return;
  }

  // Get the target URL
  let targetUrl = event.notification.data?.url || '/dashboard';

  // Handle special actions
  if (event.action === 'check_in' && event.notification.data?.appointmentId) {
    targetUrl = `${self.location.origin}/check-in/${event.notification.data.appointmentId}`;
  } else if (event.action === 'reply' && event.notification.data?.conversationId) {
    targetUrl = `${self.location.origin}/messages/${event.notification.data.conversationId}?reply=true`;
  } else if (event.action === 'complete' && event.notification.data?.formId) {
    targetUrl = `${self.location.origin}/forms/${event.notification.data.formId}`;
  }

  // Open or focus the appropriate window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to find an existing window and navigate it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.navigate(targetUrl).then(() => client.focus());
          }
        }

        // Open a new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

/**
 * Handle notification close events (for analytics)
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[Firebase SW] Notification closed:', event.notification.tag);

  // Track notification dismissal for analytics (if needed)
  const data = event.notification.data;
  if (data?.type) {
    // Could send analytics event here
    console.log('[Firebase SW] Notification dismissed:', data.type);
  }
});

/**
 * Handle push events directly (fallback for when Firebase SDK doesn't catch it)
 */
self.addEventListener('push', (event) => {
  console.log('[Firebase SW] Push event received');

  if (!event.data) {
    console.log('[Firebase SW] Push event has no data');
    return;
  }

  try {
    const payload = event.data.json();

    // If this is an FCM message, it might have already been handled
    // by onBackgroundMessage, but we handle it here as a fallback
    if (payload.notification || payload.data) {
      event.waitUntil(handlePushNotification(payload));
    }
  } catch (error) {
    // Try to handle as text if not JSON
    console.log('[Firebase SW] Push data (text):', event.data.text());
  }
});

console.log('[Firebase SW] Service worker loaded');
