/**
 * Dev Test Notification Button Component
 *
 * Allows testing different notification types in development.
 * Remove or disable this in production.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import {
  scheduleAppointmentReminderLocal,
  scheduleCustomReminder,
  scheduleReviewReminder,
  scheduleBirthdayNotification,
} from '@/services/notifications';

interface DevTestNotificationButtonProps {
  visible?: boolean;
}

export default function DevTestNotificationButton({
  visible = __DEV__,
}: DevTestNotificationButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!visible) {
    return null;
  }

  const sendTestNotification = async (type: string) => {
    try {
      switch (type) {
        case 'appointment_reminder_24h':
          const apt24Date = new Date();
          apt24Date.setDate(apt24Date.getDate() + 1);
          apt24Date.setHours(14, 0, 0);

          await scheduleAppointmentReminderLocal(
            'test_apt_24h',
            'Botox Treatment',
            apt24Date,
            24,
            'Dr. Sarah Chen',
            'Downtown Location'
          );
          Alert.alert('Success', 'Appointment reminder scheduled for 24 hours before');
          break;

        case 'appointment_reminder_2h':
          const apt2Date = new Date();
          apt2Date.setHours(apt2Date.getHours() + 2);

          await scheduleAppointmentReminderLocal(
            'test_apt_2h',
            'HydraFacial',
            apt2Date,
            2
          );
          Alert.alert('Success', 'Appointment reminder scheduled for 2 hours from now');
          break;

        case 'appointment_reminder_now':
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Test: Appointment Tomorrow',
              body: 'Your Botox appointment is tomorrow at 2:00 PM at Downtown Location',
              data: {
                type: 'appointment_reminder',
                appointmentId: 'test_apt',
                serviceName: 'Botox',
              },
              badge: 1,
            },
            trigger: { seconds: 2 },
          });
          Alert.alert('Success', 'Test appointment notification sent in 2 seconds');
          break;

        case 'new_message':
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'New Message from Dr. Sarah Chen',
              body: 'How are you feeling after your treatment?',
              data: {
                type: 'new_message',
                threadId: 'test_thread',
                senderId: 'provider_1',
              },
              badge: 1,
            },
            trigger: { seconds: 2 },
          });
          Alert.alert('Success', 'Test message notification sent');
          break;

        case 'points_earned':
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Points Earned!',
              body: 'You earned 150 points from your recent appointment!',
              data: {
                type: 'points_earned',
                points: 150,
              },
              badge: 1,
            },
            trigger: { seconds: 2 },
          });
          Alert.alert('Success', 'Test points notification sent');
          break;

        case 'reward_available':
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'New Reward Available',
              body: 'Free HydraFacial is now available for 500 points!',
              data: {
                type: 'reward_available',
                rewardId: 'reward_1',
                rewardName: 'Free HydraFacial',
              },
              badge: 1,
            },
            trigger: { seconds: 2 },
          });
          Alert.alert('Success', 'Test reward notification sent');
          break;

        case 'promotion':
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Limited Time Offer',
              body: '50% off HydraFacial this week only!',
              data: {
                type: 'promotion',
                promotionId: 'promo_1',
                discount: 50,
              },
              badge: 1,
            },
            trigger: { seconds: 2 },
          });
          Alert.alert('Success', 'Test promotion notification sent');
          break;

        case 'referral_signup':
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Referral Successful!',
              body: 'Your friend John booked an appointment! You earned 75 bonus points.',
              data: {
                type: 'referral_signup',
                referralId: 'ref_1',
                bonusPoints: 75,
              },
              badge: 1,
            },
            trigger: { seconds: 2 },
          });
          Alert.alert('Success', 'Test referral notification sent');
          break;

        case 'review_request':
          const reviewDate = new Date();
          reviewDate.setDate(reviewDate.getDate() + 2);

          await scheduleReviewReminder(
            'test_apt_review',
            reviewDate,
            'Botox Treatment'
          );
          Alert.alert('Success', 'Review request scheduled for 2 days from now');
          break;

        case 'birthday':
          const birthDate = new Date('1990-06-15');
          await scheduleBirthdayNotification(
            'test_user_bday',
            'John Doe',
            birthDate
          );
          Alert.alert('Success', 'Birthday notification scheduled');
          break;

        case 'custom_reminder':
          const customDate = new Date();
          customDate.setMinutes(customDate.getMinutes() + 1);

          await scheduleCustomReminder(
            'test_custom_reminder',
            'Custom Test Reminder',
            'This is a test custom reminder',
            customDate,
            { customData: 'test' }
          );
          Alert.alert('Success', 'Custom reminder scheduled for 1 minute from now');
          break;

        default:
          Alert.alert('Error', 'Unknown notification type');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to send notification: ${error}`);
    }
  };

  const testButtons = [
    { label: 'Appointment (24h)', type: 'appointment_reminder_24h' },
    { label: 'Appointment (2h)', type: 'appointment_reminder_2h' },
    { label: 'Appointment (Now)', type: 'appointment_reminder_now' },
    { label: 'New Message', type: 'new_message' },
    { label: 'Points Earned', type: 'points_earned' },
    { label: 'Reward Available', type: 'reward_available' },
    { label: 'Promotion', type: 'promotion' },
    { label: 'Referral Signup', type: 'referral_signup' },
    { label: 'Review Request', type: 'review_request' },
    { label: 'Birthday', type: 'birthday' },
    { label: 'Custom Reminder', type: 'custom_reminder' },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#667eea"
        />
        <Text style={styles.toggleButtonText}>Dev: Test Notifications</Text>
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView style={styles.buttonsContainer}>
          <Text style={styles.subtitle}>Send Test Notification:</Text>
          {testButtons.map((button) => (
            <TouchableOpacity
              key={button.type}
              style={styles.testButton}
              onPress={() => sendTestNotification(button.type)}
            >
              <Ionicons name="notifications" size={16} color="#667eea" />
              <Text style={styles.testButtonText}>{button.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    maxWidth: 300,
    zIndex: 1000,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
  },
  buttonsContainer: {
    maxHeight: 400,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
    paddingHorizontal: 12,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    gap: 8,
  },
  testButtonText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1a1a',
  },
});
