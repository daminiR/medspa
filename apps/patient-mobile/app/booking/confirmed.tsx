/**
 * Booking Confirmed Screen
 *
 * Displayed after successfully booking an appointment.
 * Shows appointment details and provides quick actions including:
 * - Add to Apple Wallet (iOS) / Google Wallet (Android)
 * - Add to Calendar
 * - Share
 *
 * Features:
 * - Animated success feedback
 * - Platform-specific wallet integration
 * - Deep linking support via URL params
 */

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  BounceIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

// Wallet integrations
import {
  addToAppleWallet,
  isAppleWalletAvailable,
  type AppointmentDetails,
} from '../../services/wallet/appleWallet';
import {
  addToGoogleWallet,
  type AppointmentData,
} from '../../services/wallet/googleWallet';

// Wallet button components
import { AppleWalletBadge } from '../../components/wallet/AppleWalletButton';
import { GoogleWalletButton } from '../../components/wallet/GoogleWalletButton';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a unique ID for new appointments
 */
function generateAppointmentId(): string {
  return 'new-' + Date.now().toString();
}

// ============================================================================
// Component
// ============================================================================

export default function BookingConfirmedScreen() {
  const insets = useSafeAreaInsets();
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletAdded, setWalletAdded] = useState(false);
  const [generatedId] = useState(() => generateAppointmentId());

  // Get URL params from booking flow
  const params = useLocalSearchParams<{
    appointmentId?: string;
    serviceName?: string;
    date?: string;
    time?: string;
    provider?: string;
    duration?: string;
    price?: string;
    location?: string;
  }>();

  // Play success haptic on mount
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  /**
   * Creates appointment details object for Apple Wallet integration.
   * Parses URL params into the required AppointmentDetails format.
   */
  const getAppleWalletAppointmentDetails = useCallback((): AppointmentDetails => {
    const appointmentDate = params.date ? new Date(params.date) : new Date();

    // Parse time if available and set it on the date
    if (params.time) {
      const timeParts = params.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const meridiem = timeParts[3].toUpperCase();

        if (meridiem === 'PM' && hours !== 12) {
          hours += 12;
        } else if (meridiem === 'AM' && hours === 12) {
          hours = 0;
        }

        appointmentDate.setHours(hours, minutes, 0, 0);
      }
    }

    return {
      id: params.appointmentId || generatedId,
      service: params.serviceName || 'Treatment',
      provider: params.provider || 'First Available',
      date: appointmentDate,
      duration: parseInt(params.duration || '60', 10),
      location: params.location || 'Beverly Hills',
      locationAddress: '123 Luxury Ave, Beverly Hills, CA 90210',
      locationPhone: '(310) 555-0123',
      price: parseFloat(params.price || '0'),
    };
  }, [params, generatedId]);

  /**
   * Creates appointment data object for Google Wallet integration.
   * Converts params to the AppointmentData format.
   */
  const getGoogleWalletAppointmentData = useCallback((): AppointmentData => {
    const appointmentDate = params.date ? new Date(params.date) : new Date();

    // Parse time
    if (params.time) {
      const timeParts = params.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const meridiem = timeParts[3].toUpperCase();

        if (meridiem === 'PM' && hours !== 12) {
          hours += 12;
        } else if (meridiem === 'AM' && hours === 12) {
          hours = 0;
        }

        appointmentDate.setHours(hours, minutes, 0, 0);
      }
    }

    return {
      id: params.appointmentId || generatedId,
      service: params.serviceName || 'Treatment',
      provider: params.provider || 'First Available',
      date: appointmentDate,
      duration: parseInt(params.duration || '60', 10),
      location: params.location || 'Beverly Hills',
      locationAddress: '123 Luxury Ave, Beverly Hills, CA 90210',
      price: parseFloat(params.price || '0'),
      status: 'upcoming',
    };
  }, [params, generatedId]);

  /**
   * Handles adding the appointment to Apple Wallet (iOS).
   * Called from the quick action icon button.
   */
  const handleAddToAppleWallet = useCallback(async () => {
    if (walletLoading || walletAdded) return;

    if (!isAppleWalletAvailable()) {
      Alert.alert(
        'Not Available',
        'Apple Wallet is not available on this device.',
        [{ text: 'OK' }]
      );
      return;
    }

    setWalletLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const appointmentDetails = getAppleWalletAppointmentDetails();
      const result = await addToAppleWallet(
        appointmentDetails.id,
        appointmentDetails
      );

      if (result.success) {
        setWalletAdded(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Alert.alert(
          'Added to Wallet',
          'Your appointment pass has been added to Apple Wallet. You can use the QR code for easy check-in!',
          [{ text: 'Great!' }]
        );
      } else {
        throw new Error(result.error || 'Failed to add to wallet');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage = error instanceof Error
        ? error.message
        : 'Something went wrong. Please try again.';

      Alert.alert(
        'Unable to Add',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setWalletLoading(false);
    }
  }, [walletLoading, walletAdded, getAppleWalletAppointmentDetails]);

  /**
   * Handles adding the appointment to Google Wallet (Android).
   * Called from the quick action icon button.
   */
  const handleAddToGoogleWallet = useCallback(async () => {
    if (walletLoading || walletAdded) return;

    setWalletLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const appointmentData = getGoogleWalletAppointmentData();
      const result = await addToGoogleWallet(
        appointmentData.id,
        appointmentData
      );

      if (result.success) {
        setWalletAdded(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Alert.alert(
          'Added to Wallet',
          'Your appointment pass has been added to Google Wallet!',
          [{ text: 'Great!' }]
        );
      } else {
        throw new Error(result.error || 'Failed to add to wallet');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage = error instanceof Error
        ? error.message
        : 'Something went wrong. Please try again.';

      Alert.alert(
        'Unable to Add',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setWalletLoading(false);
    }
  }, [walletLoading, walletAdded, getGoogleWalletAppointmentData]);

  /**
   * Platform-specific wallet handler for quick action button.
   */
  const handleAddToWallet = useCallback(async () => {
    if (Platform.OS === 'ios') {
      await handleAddToAppleWallet();
    } else {
      await handleAddToGoogleWallet();
    }
  }, [handleAddToAppleWallet, handleAddToGoogleWallet]);

  /**
   * Handles adding to device calendar.
   * TODO: Implement calendar integration.
   */
  const handleAddToCalendar = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Add to device calendar using expo-calendar
    Alert.alert(
      'Coming Soon',
      'Calendar integration will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Handles sharing appointment details.
   */
  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const serviceName = params.serviceName || 'treatment';
      await Share.share({
        message: 'I just booked a ' + serviceName + ' at Luxe MedSpa! So excited!',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  /**
   * Formats date for display.
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Soon';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Renders the wallet icon button content based on state.
   */
  const renderWalletQuickActionContent = () => {
    if (walletLoading) {
      return (
        <>
          <View style={styles.quickActionIcon}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionText}>Adding...</Text>
        </>
      );
    }

    if (walletAdded) {
      return (
        <>
          <View style={[styles.quickActionIcon, styles.quickActionIconSuccess]}>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.quickActionText}>Added!</Text>
        </>
      );
    }

    return (
      <>
        <View style={styles.quickActionIcon}>
          <Ionicons
            name={Platform.OS === 'ios' ? 'wallet' : 'card'}
            size={24}
            color="#FFFFFF"
          />
        </View>
        <Text style={styles.quickActionText}>
          {Platform.OS === 'ios' ? 'Apple Wallet' : 'Google Wallet'}
        </Text>
      </>
    );
  };

  /**
   * Renders the full wallet button based on platform.
   * Shows Apple Wallet badge on iOS, Google Wallet button on Android.
   */
  const renderFullWalletButton = () => {
    if (walletAdded) {
      return null; // Don't show if already added
    }

    const appointmentId = params.appointmentId || generatedId;

    if (Platform.OS === 'ios') {
      return (
        <AppleWalletBadge
          appointmentId={appointmentId}
          appointmentDetails={getAppleWalletAppointmentDetails()}
          onSuccess={() => {
            setWalletAdded(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          onError={(error) => {
            console.error('Apple Wallet error:', error);
          }}
          style={styles.walletButton}
        />
      );
    }

    // Android - Google Wallet
    return (
      <GoogleWalletButton
        appointmentId={appointmentId}
        appointmentData={getGoogleWalletAppointmentData()}
        variant="primary"
        size="medium"
        onSuccess={() => {
          setWalletAdded(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        onError={(error) => {
          console.error('Google Wallet error:', error);
        }}
        style={styles.walletButton}
      />
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <Animated.View entering={BounceIn.duration(800)} style={styles.successIcon}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color="#8B5CF6" />
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <Text style={styles.title}>You're Booked!</Text>
          <Text style={styles.subtitle}>
            Your appointment has been confirmed
          </Text>
        </Animated.View>

        {/* Appointment Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)} style={styles.appointmentCard}>
          <View style={styles.appointmentRow}>
            <View style={styles.appointmentIcon}>
              <Ionicons name="sparkles" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentLabel}>Service</Text>
              <Text style={styles.appointmentValue}>{params.serviceName || 'Treatment'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.appointmentRow}>
            <View style={styles.appointmentIcon}>
              <Ionicons name="calendar" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentLabel}>Date & Time</Text>
              <Text style={styles.appointmentValue}>
                {formatDate(params.date)} at {params.time || '2:00 PM'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.appointmentRow}>
            <View style={styles.appointmentIcon}>
              <Ionicons name="person" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentLabel}>Provider</Text>
              <Text style={styles.appointmentValue}>
                {params.provider || 'First Available'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.appointmentRow}>
            <View style={styles.appointmentIcon}>
              <Ionicons name="location" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentLabel}>Location</Text>
              <Text style={styles.appointmentValue}>{params.location || 'Beverly Hills'}</Text>
              <Text style={styles.appointmentAddress}>123 Luxury Ave</Text>
            </View>
          </View>

          {/* Full Wallet Button in Card */}
          {!walletAdded && (
            <>
              <View style={styles.divider} />
              <View style={styles.walletButtonContainer}>
                {renderFullWalletButton()}
              </View>
            </>
          )}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.duration(600).delay(700)} style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, walletAdded && styles.quickActionDisabled]}
            onPress={handleAddToWallet}
            disabled={walletLoading || walletAdded}
            activeOpacity={0.7}
          >
            {renderWalletQuickActionContent()}
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={handleAddToCalendar}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionText}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={handleShare}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.quickActionText}>Share</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Wallet Tip */}
        {!walletAdded && (
          <Animated.View entering={FadeIn.duration(400).delay(850)} style={styles.walletTip}>
            <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.walletTipText}>
              {Platform.OS === 'ios'
                ? 'Add to Apple Wallet for easy check-in with QR code'
                : 'Add to Google Wallet for easy check-in'}
            </Text>
          </Animated.View>
        )}

        {/* Reminder Note */}
        <Animated.View entering={FadeIn.duration(400).delay(900)} style={styles.reminderNote}>
          <Ionicons name="notifications-outline" size={18} color="rgba(255,255,255,0.7)" />
          <Text style={styles.reminderText}>
            We'll send you a reminder 24 hours before your appointment
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <Animated.View
        entering={FadeInDown.duration(600).delay(1000)}
        style={[styles.bottomAction, { paddingBottom: insets.bottom + 16 }]}
      >
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => router.replace('/(tabs)/dashboard')}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.push('/(tabs)/appointments')}
        >
          <Text style={styles.viewButtonText}>View All Appointments</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  appointmentCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  appointmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  appointmentValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  appointmentAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  walletButtonContainer: {
    alignItems: 'center',
    paddingTop: 4,
  },
  walletButton: {
    alignSelf: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
    minWidth: 70,
  },
  quickActionDisabled: {
    opacity: 0.7,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIconSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.4)',
  },
  quickActionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 80,
  },
  walletTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  walletTipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  reminderNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
  },
  reminderText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
    backgroundColor: 'transparent',
  },
  doneButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  viewButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
});
