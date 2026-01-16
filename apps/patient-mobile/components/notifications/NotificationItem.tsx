/**
 * NotificationItem Component
 *
 * Displays a single notification with:
 * - Icon based on type
 * - Title and body
 * - Relative timestamp
 * - Unread indicator
 * - Swipe to delete
 * - Tap to view/navigate
 * - Mark as read/unread action
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@medical-spa/types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onMarkAsRead: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
}

export default function NotificationItem({
  notification,
  onPress,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'appointment_reminder':
      case 'appointment_confirmed':
      case 'appointment_cancelled':
      case 'appointment_rescheduled':
        return { icon: 'calendar', color: '#667eea' };

      case 'new_message':
        return { icon: 'chatbubble', color: '#10b981' };

      case 'points_earned':
      case 'reward_available':
        return { icon: 'star', color: '#f59e0b' };

      case 'referral_signup':
        return { icon: 'gift', color: '#ec4899' };

      case 'promotion':
        return { icon: 'pricetag', color: '#f97316' };

      case 'system':
      default:
        return { icon: 'information-circle', color: '#6b7280' };
    }
  };

  const getNotificationTypeLabel = () => {
    switch (notification.type) {
      case 'appointment_reminder':
      case 'appointment_confirmed':
      case 'appointment_cancelled':
      case 'appointment_rescheduled':
        return 'Appointment';

      case 'new_message':
        return 'Message';

      case 'points_earned':
      case 'reward_available':
        return 'Rewards';

      case 'referral_signup':
        return 'Referral';

      case 'promotion':
        return 'Promotion';

      case 'payment_received':
        return 'Payment';

      case 'system':
        return 'System';

      default:
        return 'Notification';
    }
  };

  const { icon, color } = getNotificationIcon();
  const typeLabel = getNotificationTypeLabel();
  const timestamp = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(notification),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.read && styles.containerUnread,
      ]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      {/* Icon Background */}
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {notification.title}
            </Text>
            {!notification.read && (
              <View style={styles.unreadBadge}>
                <View style={styles.unreadDot} />
              </View>
            )}
          </View>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>

        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.type, { color }]}>
            {typeLabel}
          </Text>

          <View style={styles.actions}>
            {!notification.read && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onMarkAsRead(notification)}
              >
                <Text style={styles.actionButtonText}>Mark as read</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  containerUnread: {
    backgroundColor: '#f0f4ff',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  unreadBadge: {
    marginLeft: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  body: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#667eea',
  },
});
