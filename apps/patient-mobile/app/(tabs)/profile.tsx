import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';

interface SettingItem {
  id: string;
  icon: string;
  label: string;
  value?: string;
  hasArrow?: boolean;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, isBiometricAvailable, biometricType } = useAuthStore();

  const [notifications, setNotifications] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const accountSettings: SettingItem[] = [
    {
      id: 'personal',
      icon: 'person-outline',
      label: 'Personal Information',
      hasArrow: true,
      onPress: () => router.push('/settings/personal'),
    },
    {
      id: 'referrals',
      icon: 'gift-outline',
      label: 'Referral Program',
      value: '$75 earned',
      hasArrow: true,
      onPress: () => router.push('/referrals/program'),
    },
    {
      id: 'security',
      icon: 'shield-checkmark-outline',
      label: 'Security & Login',
      value: biometricEnabled ? 'Face ID enabled' : 'Password only',
      hasArrow: true,
      onPress: () => router.push('/settings/security'),
    },
    {
      id: 'payment',
      icon: 'card-outline',
      label: 'Payment Methods',
      hasArrow: true,
      onPress: () => router.push('/payments/PaymentMethods'),
    },
    {
      id: 'insurance',
      icon: 'medical-outline',
      label: 'HSA/FSA Accounts',
      hasArrow: true,
      onPress: () => router.push('/settings/insurance'),
    },
  ];

  const preferenceSettings: SettingItem[] = [
    {
      id: 'notifications',
      icon: 'notifications-outline',
      label: 'Push Notifications',
      isToggle: true,
      toggleValue: notifications,
      onToggle: setNotifications,
    },
    {
      id: 'biometric',
      icon: biometricType === 'facial' ? 'scan-outline' : 'finger-print-outline',
      label: biometricType === 'facial' ? 'Face ID Login' : 'Touch ID Login',
      isToggle: true,
      toggleValue: biometricEnabled,
      onToggle: setBiometricEnabled,
    },
    {
      id: 'marketing',
      icon: 'mail-outline',
      label: 'Marketing Emails',
      isToggle: true,
      toggleValue: marketingEmails,
      onToggle: setMarketingEmails,
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: 'help',
      icon: 'help-circle-outline',
      label: 'Help Center',
      hasArrow: true,
      onPress: () => router.push('/help'),
    },
    {
      id: 'contact',
      icon: 'chatbubble-outline',
      label: 'Contact Us',
      hasArrow: true,
      onPress: () => router.push('/contact'),
    },
    {
      id: 'privacy',
      icon: 'document-text-outline',
      label: 'Privacy Policy',
      hasArrow: true,
      onPress: () => router.push('/privacy'),
    },
    {
      id: 'terms',
      icon: 'document-outline',
      label: 'Terms of Service',
      hasArrow: true,
      onPress: () => router.push('/terms'),
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.isToggle}
    >
      <View style={[styles.settingIcon, item.danger && styles.dangerIcon]}>
        <Ionicons
          name={item.icon as any}
          size={20}
          color={item.danger ? '#EF4444' : '#8B5CF6'}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, item.danger && styles.dangerLabel]}>
          {item.label}
        </Text>
        {item.value && (
          <Text style={styles.settingValue}>{item.value}</Text>
        )}
      </View>
      {item.isToggle ? (
        <Switch
          value={item.toggleValue}
          onValueChange={item.onToggle}
          trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
          thumbColor={item.toggleValue ? '#8B5CF6' : '#F3F4F6'}
        />
      ) : item.hasArrow ? (
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/settings/personal')}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => router.push('/settings/personal')}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.avatarText}>
                  {user?.fullName?.split(' ').map(n => n[0]).join('') || 'G'}
                </Text>
              </LinearGradient>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.fullName || 'Guest User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'Not signed in'}</Text>
              <View style={styles.memberSince}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.memberSinceText}>Member since 2024</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </Animated.View>

        {/* Membership Status */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <TouchableOpacity onPress={() => router.push('/membership')}>
            <LinearGradient
              colors={['#FDF4FF', '#FAF5FF']}
              style={styles.membershipCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.membershipIcon}>
                <Ionicons name="star" size={24} color="#8B5CF6" />
              </View>
              <View style={styles.membershipContent}>
                <Text style={styles.membershipTitle}>Gold Member</Text>
                <Text style={styles.membershipSubtitle}>2,450 points • $324 saved</Text>
              </View>
              <View style={styles.membershipAction}>
                <Text style={styles.membershipActionText}>View Benefits</Text>
                <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Account Settings */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsGroup}>
            {accountSettings.map(renderSettingItem)}
          </View>
        </Animated.View>

        {/* Preferences */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsGroup}>
            {preferenceSettings.map(renderSettingItem)}
          </View>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsGroup}>
            {supportSettings.map(renderSettingItem)}
          </View>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* App Version */}
        <Animated.View entering={FadeInDown.duration(600).delay(700)}>
          <Text style={styles.version}>Version 1.0.0 (1)</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  memberSinceText: {
    fontSize: 12,
    color: '#6B7280',
  },
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  membershipIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipContent: {
    flex: 1,
  },
  membershipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  membershipSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  membershipAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  membershipActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIcon: {
    backgroundColor: '#FEF2F2',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  dangerLabel: {
    color: '#EF4444',
  },
  settingValue: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 16,
  },
});
