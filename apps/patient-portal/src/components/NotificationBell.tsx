'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationBellProps {
  className?: string;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

/**
 * Notification Bell Component
 * Displays a bell icon with badge for unread notifications
 * Links to the notifications page
 */
export function NotificationBell({ className }: NotificationBellProps) {
  const { permission, isSupported } = usePushNotifications();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Listen for new push notifications
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePushNotification = (event: CustomEvent) => {
      const { notification, data } = event.detail;

      // Add to notifications list
      const newNotification: Notification = {
        id: data?.id || `notification-${Date.now()}`,
        title: notification?.title || 'New Notification',
        body: notification?.body || '',
        type: data?.type || 'general',
        read: false,
        createdAt: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setHasNewNotification(true);

      // Reset animation after 2 seconds
      setTimeout(() => setHasNewNotification(false), 2000);
    };

    // Listen for room ready events
    const handleRoomReady = () => {
      setUnreadCount((prev) => prev + 1);
      setHasNewNotification(true);
      setTimeout(() => setHasNewNotification(false), 2000);
    };

    window.addEventListener('push-notification', handlePushNotification as EventListener);
    window.addEventListener('room-ready', handleRoomReady);

    return () => {
      window.removeEventListener('push-notification', handlePushNotification as EventListener);
      window.removeEventListener('room-ready', handleRoomReady);
    };
  }, []);

  // Load initial unread count from localStorage or API
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        // Try to load from localStorage first
        const savedCount = localStorage.getItem('notification-unread-count');
        if (savedCount) {
          setUnreadCount(parseInt(savedCount, 10));
        }

        // Could also fetch from API here
        // const response = await fetch('/api/notifications/unread-count');
        // const data = await response.json();
        // setUnreadCount(data.count);
      } catch {
        // Ignore errors
      }
    };

    loadUnreadCount();
  }, []);

  // Save unread count to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('notification-unread-count', unreadCount.toString());
    } catch {
      // localStorage not available
    }
  }, [unreadCount]);

  // Mark notifications as read when navigating to notifications page
  const handleClick = () => {
    // Don't reset count here - let the notifications page handle it
  };

  // Don't render if notifications aren't supported
  if (!isSupported) {
    return null;
  }

  return (
    <Link
      href="/notifications"
      className={cn(
        'relative inline-flex items-center justify-center rounded-full p-2 transition-colors',
        'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
        className
      )}
      onClick={handleClick}
      aria-label={
        unreadCount > 0
          ? `Notifications (${unreadCount} unread)`
          : 'Notifications'
      }
    >
      {/* Bell Icon */}
      {hasNewNotification ? (
        <BellRing
          className={cn(
            'h-6 w-6 transition-transform',
            'animate-[ring_0.5s_ease-in-out]'
          )}
        />
      ) : (
        <Bell className="h-6 w-6" />
      )}

      {/* Badge */}
      {unreadCount > 0 && (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 flex items-center justify-center',
            'min-w-[18px] h-[18px] px-1 rounded-full',
            'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
            'text-xs font-medium',
            hasNewNotification && 'animate-bounce'
          )}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {/* Dot indicator for permission granted but no unread */}
      {unreadCount === 0 && permission === 'granted' && (
        <span
          className={cn(
            'absolute right-1 top-1 h-2 w-2 rounded-full',
            'bg-green-500'
          )}
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

/**
 * Hook to manage notification badge count
 * Can be used to mark notifications as read
 */
export function useNotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  const markAsRead = (notificationId?: string) => {
    if (notificationId) {
      // Mark specific notification as read
      // Would call API here
    } else {
      // Mark all as read
      setUnreadCount(0);
      try {
        localStorage.setItem('notification-unread-count', '0');
      } catch {
        // Ignore
      }
    }
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
    try {
      localStorage.setItem('notification-unread-count', '0');
    } catch {
      // Ignore
    }
  };

  const incrementCount = () => {
    setUnreadCount((prev) => {
      const newCount = prev + 1;
      try {
        localStorage.setItem('notification-unread-count', newCount.toString());
      } catch {
        // Ignore
      }
      return newCount;
    });
  };

  return {
    unreadCount,
    markAsRead,
    markAllAsRead,
    incrementCount,
  };
}

export default NotificationBell;
