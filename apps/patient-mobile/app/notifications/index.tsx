/**
 * Notification Center Screen
 *
 * Displays:
 * - All notifications with unread badge
 * - Filter by type
 * - Mark as read/unread
 * - Delete notification
 * - Pull to refresh
 * - Tap to navigate to related content
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Notification, NotificationType } from '@medical-spa/types';
import NotificationItem from '@/components/notifications/NotificationItem';
import { getNotificationPreferences } from '@/services/notifications/pushNotifications';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | NotificationType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Notification type filters
  const filters: Array<{ id: 'all' | NotificationType; label: string; icon: string }> = [
    { id: 'all', label: 'All', icon: 'list' },
    { id: 'appointment_reminder', label: 'Appointments', icon: 'calendar' },
    { id: 'new_message', label: 'Messages', icon: 'chatbubble' },
    { id: 'promotion', label: 'Promotions', icon: 'gift' },
    { id: 'points_earned', label: 'Rewards', icon: 'star' },
  ];

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Apply filter when selected filter changes
  useEffect(() => {
    filterNotifications();
  }, [selectedFilter, notifications]);

  async function loadNotifications() {
    try {
      setIsLoading(true);
      // TODO: Fetch from backend when API is ready
      // const response = await api.get(endpoints.notifications.list);
      // setNotifications(response.data);

      // For now, use mock data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          userId: 'user123',
          type: 'appointment_reminder',
          title: 'Appointment Tomorrow',
          body: 'Your Botox appointment is tomorrow at 2:00 PM',
          read: false,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          data: {
            appointmentId: 'apt123',
            serviceName: 'Botox',
          },
        },
        {
          id: '2',
          userId: 'user123',
          type: 'new_message',
          title: 'New Message from Dr. Sarah Chen',
          body: 'How are you feeling after your treatment?',
          read: false,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          data: {
            threadId: 'thread123',
            senderId: 'provider123',
          },
        },
        {
          id: '3',
          userId: 'user123',
          type: 'promotion',
          title: 'Limited Time Offer',
          body: '$50 off HydraFacial this week only!',
          read: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          data: {
            promotionId: 'promo123',
            discount: 50,
          },
        },
        {
          id: '4',
          userId: 'user123',
          type: 'points_earned',
          title: 'Points Earned',
          body: 'You earned 150 points from your recent appointment!',
          read: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          data: {
            points: 150,
          },
        },
      ];

      setNotifications(mockNotifications);
      updateUnreadCount(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }

  function filterNotifications() {
    if (selectedFilter === 'all') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(
        notifications.filter((n) => n.type === selectedFilter)
      );
    }
  }

  function updateUnreadCount(notifs: Notification[]) {
    const count = notifs.filter((n) => !n.read).length;
    setUnreadCount(count);
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await loadNotifications();
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleMarkAsRead(notification: Notification) {
    try {
      const updated = {
        ...notification,
        read: true,
        readAt: new Date().toISOString(),
      };

      // TODO: Sync with backend
      // await api.patch(endpoints.notifications.markRead(notification.id));

      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? updated : n))
      );
      updateUnreadCount(
        notifications.map((n) => (n.id === notification.id ? updated : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async function handleDelete(notification: Notification) {
    try {
      // TODO: Sync with backend
      // await api.delete(endpoints.notifications.delete(notification.id));

      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      updateUnreadCount(
        notifications.filter((n) => n.id !== notification.id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  }

  async function handleDeleteAll() {
    Alert.alert('Delete All Notifications?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: () => {
          setNotifications([]);
          setUnreadCount(0);
        },
      },
    ]);
  }

  async function handleMarkAllAsRead() {
    try {
      const updated = notifications.map((n) => ({
        ...n,
        read: true,
        readAt: new Date().toISOString(),
      }));

      // TODO: Sync with backend
      // await api.patch(endpoints.notifications.markAllRead);

      setNotifications(updated);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerButton}>
              <Ionicons name="checkmark-done" size={20} color="#667eea" />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleDeleteAll} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={selectedFilter === item.id ? '#667eea' : '#999999'}
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === item.id && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
      <Text style={styles.emptyStateTitle}>No Notifications</Text>
      <Text style={styles.emptyStateDescription}>
        {selectedFilter !== 'all'
          ? 'No notifications in this category'
          : 'You are all caught up!'}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {filteredNotifications.length === 0 ? (
        <View style={styles.content}>
          {renderHeader()}
          {renderEmptyState()}
        </View>
      ) : (
        <Animated.View entering={FadeInDown} style={styles.content}>
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 50)}
              >
                <NotificationItem
                  notification={item}
                  onPress={() => handleMarkAsRead(item)}
                  onDelete={() => handleDelete(item)}
                  onMarkAsRead={() => handleMarkAsRead(item)}
                />
              </Animated.View>
            )}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#667eea"
              />
            }
            contentContainerStyle={styles.flatListContent}
            scrollIndicatorInsets={{ right: 1 }}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999999',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  filterContainer: {
    marginBottom: 4,
  },
  filterList: {
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: '#f0f4ff',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  filterButtonTextActive: {
    color: '#667eea',
  },
  flatListContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
  },
});
