'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Bell,
  BellOff,
  Calendar,
  Gift,
  MessageSquare,
  Clock,
  CheckCircle2,
  Settings,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'appointment' | 'message' | 'reward' | 'promotion' | 'general';
  read: boolean;
  createdAt: Date;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Load notifications from API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Mock data for now - replace with actual API call
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Appointment Reminder',
            body: 'Your Botox appointment is tomorrow at 2:00 PM with Dr. Smith',
            type: 'appointment',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
          {
            id: '2',
            title: 'New Message',
            body: 'Medical Spa Team sent you a message about your recent treatment',
            type: 'message',
            read: false,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          },
          {
            id: '3',
            title: 'Reward Unlocked!',
            body: 'You earned 250 points! Redeem for a free hydrafacial upgrade',
            type: 'reward',
            read: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          },
          {
            id: '4',
            title: 'Special Promotion',
            body: '20% off all injectable treatments this week - Book now!',
            type: 'promotion',
            read: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          },
          {
            id: '5',
            title: 'Appointment Confirmed',
            body: 'Your Hydrafacial appointment on Dec 22 at 10:30 AM is confirmed',
            type: 'appointment',
            read: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          },
        ];

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      // Update local state immediately
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      // Update unread count in localStorage
      const unreadCount = notifications.filter((n) => !n.read && n.id !== id).length;
      localStorage.setItem('notification-unread-count', unreadCount.toString());

      // Call API to mark as read
      // await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      localStorage.setItem('notification-unread-count', '0');
      // await fetch('/api/notifications/read-all', { method: 'POST' });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Group notifications by date
  const groupedNotifications = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const groups = {
      today: [] as Notification[],
      yesterday: [] as Notification[],
      thisWeek: [] as Notification[],
      older: [] as Notification[],
    };

    const filteredNotifications = filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

    filteredNotifications.forEach((notification) => {
      const notifDate = new Date(notification.createdAt);
      if (notifDate >= today) {
        groups.today.push(notification);
      } else if (notifDate >= yesterday) {
        groups.yesterday.push(notification);
      } else if (notifDate >= thisWeek) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  // Get icon for notification type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'reward':
        return <Gift className="w-5 h-5 text-green-600" />;
      case 'promotion':
        return <Gift className="w-5 h-5 text-pink-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const groups = groupedNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/settings/notifications">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-purple-600 hover:text-purple-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            <p className="text-sm text-gray-500">Loading notifications...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && notifications.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BellOff className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
            <p className="text-sm text-gray-600 text-center max-w-sm">
              When you receive notifications about appointments, messages, or rewards, they'll appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      {!isLoading && notifications.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groups).map(([groupName, groupNotifications]) => {
            if (groupNotifications.length === 0) return null;

            const groupLabels = {
              today: 'Today',
              yesterday: 'Yesterday',
              thisWeek: 'This Week',
              older: 'Older',
            };

            return (
              <div key={groupName}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {groupLabels[groupName as keyof typeof groupLabels]}
                </h2>
                <div className="space-y-3">
                  {groupNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={cn(
                        'transition-all hover:shadow-md cursor-pointer',
                        !notification.read && 'bg-purple-50 border-purple-200'
                      )}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                              notification.read ? 'bg-gray-100' : 'bg-purple-100'
                            )}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3
                                className={cn(
                                  'font-semibold',
                                  !notification.read && 'text-purple-900'
                                )}
                              >
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.body}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
