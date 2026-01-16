import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoogleWalletButton } from '../../components/wallet/GoogleWalletButton';
import { addToGoogleWallet, AppointmentData } from '../../services/wallet/googleWallet';
import { InlineWalletButton } from '../../components/wallet/AppleWalletButton';
import { type AppointmentDetails } from '../../services/wallet/appleWallet';

type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

interface Appointment {
  id: string;
  service: string;
  provider: string;
  date: Date;
  duration: number;
  location: string;
  price: number;
  status: AppointmentStatus;
  canReschedule: boolean;
  canCancel: boolean;
}

// Mock data
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    service: 'Botox - Full Face',
    provider: 'Dr. Sarah Chen',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    duration: 45,
    location: 'Beverly Hills',
    price: 450,
    status: 'upcoming',
    canReschedule: true,
    canCancel: true,
  },
  {
    id: '2',
    service: 'HydraFacial',
    provider: 'Emma Wilson',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    duration: 60,
    location: 'Beverly Hills',
    price: 250,
    status: 'upcoming',
    canReschedule: true,
    canCancel: true,
  },
  {
    id: '3',
    service: 'Lip Filler',
    provider: 'Dr. Sarah Chen',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    duration: 30,
    location: 'Beverly Hills',
    price: 650,
    status: 'completed',
    canReschedule: false,
    canCancel: false,
  },
  {
    id: '4',
    service: 'Chemical Peel',
    provider: 'Lisa Park',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    duration: 45,
    location: 'Beverly Hills',
    price: 200,
    status: 'completed',
    canReschedule: false,
    canCancel: false,
  },
];

type FilterTab = 'upcoming' | 'past' | 'all';

/**
 * Converts internal Appointment type to AppointmentData for Google Wallet integration
 */
function toWalletAppointmentData(appointment: Appointment): AppointmentData {
  return {
    id: appointment.id,
    service: appointment.service,
    provider: appointment.provider,
    date: appointment.date,
    duration: appointment.duration,
    location: appointment.location,
    price: appointment.price,
    status: appointment.status,
  };
}

/**
 * Converts internal Appointment type to AppointmentDetails for Apple Wallet integration
 */
function toAppleWalletAppointmentDetails(appointment: Appointment): AppointmentDetails {
  return {
    id: appointment.id,
    service: appointment.service,
    provider: appointment.provider,
    date: appointment.date,
    duration: appointment.duration,
    location: appointment.location,
    locationAddress: '123 Luxury Ave, Beverly Hills, CA 90210', // Default address
    price: appointment.price,
  };
}

export default function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('upcoming');
  const [walletLoadingId, setWalletLoadingId] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const filteredAppointments = MOCK_APPOINTMENTS.filter(apt => {
    if (activeFilter === 'upcoming') return apt.status === 'upcoming';
    if (activeFilter === 'past') return apt.status === 'completed' || apt.status === 'cancelled';
    return true;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'upcoming': return '#8B5CF6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
    }
  };

  const handleReschedule = (appointmentId: string) => {
    router.push({
      pathname: '/reschedule/[id]',
      params: { id: appointmentId },
    });
  };

  const handleCancel = (appointmentId: string) => {
    // Show confirmation modal
    router.push({
      pathname: '/cancel/[id]',
      params: { id: appointmentId },
    });
  };

  /**
   * Handles adding an appointment to Google Wallet (Android only)
   * Apple Wallet is handled by the InlineWalletButton component
   */
  const handleAddToGoogleWallet = async (appointment: Appointment) => {
    setWalletLoadingId(appointment.id);
    try {
      const walletData = toWalletAppointmentData(appointment);
      const result = await addToGoogleWallet(appointment.id, walletData);
      if (result.success) {
        Alert.alert(
          'Success',
          'Your appointment has been added to Google Wallet!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Unable to Add',
          result.error || 'Could not add to Google Wallet. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setWalletLoadingId(null);
    }
  };

  /**
   * Handles success callback for Apple Wallet button
   */
  const handleAppleWalletSuccess = useCallback(() => {
    Alert.alert(
      'Added to Wallet',
      'Your appointment pass has been added to Apple Wallet.',
      [{ text: 'Great!' }]
    );
  }, []);

  /**
   * Handles error callback for Apple Wallet button
   */
  const handleAppleWalletError = useCallback((error: string) => {
    console.error('Apple Wallet error:', error);
  }, []);

  /**
   * Renders the wallet button based on platform
   */
  const renderWalletButton = (appointment: Appointment) => {
    if (Platform.OS === 'android') {
      // Show Google Wallet styled button on Android
      return (
        <GoogleWalletButton
          appointmentId={appointment.id}
          appointmentData={toWalletAppointmentData(appointment)}
          variant="outline"
          size="small"
          style={styles.googleWalletButton}
          onSuccess={() => {
            Alert.alert(
              'Added to Wallet',
              'Your appointment pass has been added to Google Wallet.',
              [{ text: 'Great!' }]
            );
          }}
          onError={(error) => {
            console.error('Wallet error:', error);
          }}
        />
      );
    }

    // iOS - Show Apple Wallet button using InlineWalletButton component
    return (
      <InlineWalletButton
        appointmentId={appointment.id}
        appointmentDetails={toAppleWalletAppointmentDetails(appointment)}
        onSuccess={handleAppleWalletSuccess}
        onError={handleAppleWalletError}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Appointments</Text>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push('/booking')}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.bookButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.bookButtonText}>Book</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['upcoming', 'past', 'all'] as FilterTab[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterTabText, activeFilter === filter && styles.filterTabTextActive]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Appointments List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
      >
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment, index) => (
            <Animated.View
              key={appointment.id}
              entering={FadeInRight.duration(400).delay(index * 100)}
            >
              <TouchableOpacity
                style={styles.appointmentCard}
                onPress={() => router.push(`/appointment/${appointment.id}`)}
                activeOpacity={0.7}
              >
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '15' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(appointment.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Text>
                </View>

                {/* Appointment Details */}
                <View style={styles.appointmentHeader}>
                  <Text style={styles.serviceName}>{appointment.service}</Text>
                  <Text style={styles.price}>${appointment.price}</Text>
                </View>

                <View style={styles.appointmentMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={styles.metaText}>{formatDate(appointment.date)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text style={styles.metaText}>{formatTime(appointment.date)}</Text>
                  </View>
                </View>

                <View style={styles.appointmentMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="person-outline" size={16} color="#6B7280" />
                    <Text style={styles.metaText}>{appointment.provider}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.metaText}>{appointment.location}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                {appointment.status === 'upcoming' && (
                  <View style={styles.actionButtons}>
                    {/* Platform-specific wallet button */}
                    {renderWalletButton(appointment)}

                    {appointment.canReschedule && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleReschedule(appointment.id)}
                      >
                        <Ionicons name="calendar-outline" size={18} color="#8B5CF6" />
                        <Text style={styles.actionButtonText}>Reschedule</Text>
                      </TouchableOpacity>
                    )}

                    {appointment.canCancel && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => handleCancel(appointment.id)}
                      >
                        <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                        <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {appointment.status === 'completed' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => router.push(`/booking?rebook=${appointment.id}`)}
                    >
                      <Ionicons name="refresh-outline" size={18} color="#8B5CF6" />
                      <Text style={styles.actionButtonText}>Book Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => router.push(`/review/${appointment.id}`)}
                    >
                      <Ionicons name="star-outline" size={18} color="#8B5CF6" />
                      <Text style={styles.actionButtonText}>Leave Review</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyStateTitle}>
              {activeFilter === 'upcoming' ? 'No upcoming appointments' : 'No appointments found'}
            </Text>
            <Text style={styles.emptyStateText}>
              {activeFilter === 'upcoming'
                ? 'Book your next treatment to get started'
                : 'Your appointment history will appear here'}
            </Text>
            {activeFilter === 'upcoming' && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/booking')}
              >
                <Text style={styles.emptyStateButtonText}>Book Now</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  bookButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#8B5CF6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  appointmentCard: {
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  appointmentMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
  },
  cancelButtonText: {
    color: '#EF4444',
  },
  googleWalletButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
