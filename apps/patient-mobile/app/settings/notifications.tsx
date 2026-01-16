/**
 * Notification Settings Screen
 *
 * Allows users to configure all notification preferences:
 * - Enable/disable notification types
 * - Set quiet hours
 * - Configure reminder timing
 * - Sound and vibration settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/services/notifications/pushNotifications';
import { NotificationPreferences } from '@/types/notifications';

export default function NotificationSettingsScreen() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    const prefs = await getNotificationPreferences();
    setPreferences(prefs);
    setIsLoading(false);
  }

  async function updatePreference(updates: Partial<NotificationPreferences>) {
    if (!preferences) return;

    const updated = { ...preferences, ...updates };
    setPreferences(updated);
    await updateNotificationPreferences(updates);
  }

  async function handleMasterToggle(enabled: boolean) {
    if (!enabled) {
      // Warn user about disabling all notifications
      Alert.alert(
        'Disable All Notifications?',
        'You will no longer receive appointment reminders, messages, or other important updates.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => updatePreference({ enabled }),
          },
        ]
      );
    } else {
      // Check if system permissions are granted
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Notifications.openSettingsAsync(),
            },
          ]
        );
      } else {
        updatePreference({ enabled });
      }
    }
  }

  if (isLoading || !preferences) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Notifications',
            headerShown: true,
            headerBackTitle: 'Back',
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Master toggle */}
        <View style={styles.section}>
          <View style={styles.masterToggleContainer}>
            <View style={styles.masterToggleInfo}>
              <Text style={styles.masterToggleTitle}>Enable Notifications</Text>
              <Text style={styles.masterToggleDescription}>
                Receive important updates about your appointments and treatments
              </Text>
            </View>
            <Switch
              value={preferences.enabled}
              onValueChange={handleMasterToggle}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={preferences.enabled ? '#667eea' : '#f4f4f5'}
            />
          </View>
        </View>

        {/* Appointment reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Reminders</Text>

          <SettingRow
            icon="calendar"
            label="Appointment Reminders"
            description="Get notified before your appointments"
            value={preferences.appointmentReminders}
            onValueChange={(value) => updatePreference({ appointmentReminders: value })}
            disabled={!preferences.enabled}
          />

          {preferences.appointmentReminders && (
            <>
              <SettingRow
                icon="time"
                label="24 Hours Before"
                description="Day before reminder"
                value={preferences.appointmentReminder24h}
                onValueChange={(value) => updatePreference({ appointmentReminder24h: value })}
                disabled={!preferences.enabled}
                indent
              />

              <SettingRow
                icon="time"
                label="2 Hours Before"
                description="Same day reminder"
                value={preferences.appointmentReminder2h}
                onValueChange={(value) => updatePreference({ appointmentReminder2h: value })}
                disabled={!preferences.enabled}
                indent
              />
            </>
          )}

          <SettingRow
            icon="sync"
            label="Appointment Changes"
            description="Confirmations, cancellations, and reschedules"
            value={preferences.appointmentChanges}
            onValueChange={(value) => updatePreference({ appointmentChanges: value })}
            disabled={!preferences.enabled}
          />
        </View>

        {/* Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Messages</Text>

          <SettingRow
            icon="chatbubble"
            label="New Messages"
            description="Get notified when you receive messages"
            value={preferences.messages}
            onValueChange={(value) => updatePreference({ messages: value })}
            disabled={!preferences.enabled}
          />
        </View>

        {/* Rewards & Points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rewards & Points</Text>

          <SettingRow
            icon="star"
            label="Rewards Updates"
            description="Points earned, rewards available, and referral bonuses"
            value={preferences.rewards}
            onValueChange={(value) => updatePreference({ rewards: value })}
            disabled={!preferences.enabled}
          />
        </View>

        {/* Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promotions</Text>

          <SettingRow
            icon="gift"
            label="Special Offers"
            description="Exclusive deals and seasonal promotions"
            value={preferences.promotions}
            onValueChange={(value) => updatePreference({ promotions: value })}
            disabled={!preferences.enabled}
          />
        </View>

        {/* System */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System</Text>

          <SettingRow
            icon="information-circle"
            label="System Notifications"
            description="Important updates and announcements"
            value={preferences.system}
            onValueChange={(value) => updatePreference({ system: value })}
            disabled={!preferences.enabled}
          />
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>

          <SettingRow
            icon="moon"
            label="Enable Quiet Hours"
            description="Silence notifications during specific hours"
            value={preferences.quietHoursEnabled}
            onValueChange={(value) => updatePreference({ quietHoursEnabled: value })}
            disabled={!preferences.enabled}
          />

          {preferences.quietHoursEnabled && (
            <View style={styles.quietHoursContainer}>
              <View style={styles.quietHoursRow}>
                <Text style={styles.quietHoursLabel}>From</Text>
                <TouchableOpacity style={styles.timeButton}>
                  <Text style={styles.timeButtonText}>{preferences.quietHoursStart}</Text>
                  <Ionicons name="chevron-down" size={20} color="#999999" />
                </TouchableOpacity>
              </View>

              <View style={styles.quietHoursRow}>
                <Text style={styles.quietHoursLabel}>To</Text>
                <TouchableOpacity style={styles.timeButton}>
                  <Text style={styles.timeButtonText}>{preferences.quietHoursEnd}</Text>
                  <Ionicons name="chevron-down" size={20} color="#999999" />
                </TouchableOpacity>
              </View>

              <Text style={styles.quietHoursNote}>
                Default: 10:00 PM to 8:00 AM. Notifications will still appear in your notification center.
              </Text>
            </View>
          )}
        </View>

        {/* Sound & Vibration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound & Vibration</Text>

          <SettingRow
            icon="volume-high"
            label="Sound"
            description="Play sound for notifications"
            value={preferences.sound}
            onValueChange={(value) => updatePreference({ sound: value })}
            disabled={!preferences.enabled}
          />

          <SettingRow
            icon="phone-portrait"
            label="Vibration"
            description="Vibrate for notifications"
            value={preferences.vibration}
            onValueChange={(value) => updatePreference({ vibration: value })}
            disabled={!preferences.enabled}
          />

          <SettingRow
            icon="notifications"
            label="Badge Count"
            description="Show unread count on app icon"
            value={preferences.badge}
            onValueChange={(value) => updatePreference({ badge: value })}
            disabled={!preferences.enabled}
          />
        </View>

        {/* System Settings Link */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.systemSettingsButton}
            onPress={() => Notifications.openSettingsAsync()}
          >
            <Ionicons name="settings" size={20} color="#667eea" />
            <Text style={styles.systemSettingsText}>
              Open {Platform.OS === 'ios' ? 'iOS' : 'Android'} Settings
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  indent?: boolean;
}

function SettingRow({
  icon,
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  indent = false,
}: SettingRowProps) {
  return (
    <View style={[styles.settingRow, indent && styles.settingRowIndent]}>
      <View style={styles.settingIconContainer}>
        <Ionicons
          name={icon}
          size={20}
          color={disabled ? '#d1d5db' : '#667eea'}
        />
      </View>

      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, disabled && styles.settingLabelDisabled]}>
          {label}
        </Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
        thumbColor={value ? '#667eea' : '#f4f4f5'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999999',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  masterToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  masterToggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  masterToggleTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  masterToggleDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingRowIndent: {
    paddingLeft: 20,
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  settingLabelDisabled: {
    color: '#d1d5db',
  },
  settingDescription: {
    fontSize: 13,
    color: '#999999',
    lineHeight: 18,
  },
  quietHoursContainer: {
    paddingLeft: 44,
    paddingVertical: 12,
  },
  quietHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quietHoursLabel: {
    fontSize: 15,
    color: '#666666',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginRight: 8,
  },
  quietHoursNote: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 16,
    marginTop: 4,
  },
  systemSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  systemSettingsText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#667eea',
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 32,
  },
});
