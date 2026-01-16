import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppointmentDetail {
  id: string;
  service: string;
  provider: string;
  providerRole: string;
  date: Date;
  duration: number;
  location: string;
  address: string;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  canReschedule: boolean;
  canCancel: boolean;
  notes?: string;
  prepInstructions?: string[];
}

// Mock appointment data - in real app, fetch based on id
const getAppointmentById = (id: string): AppointmentDetail | null => {
  const mockAppointments: Record<string, AppointmentDetail> = {
    '1': {
      id: '1',
      service: 'Botox - Full Face',
      provider: 'Dr. Sarah Chen',
      providerRole: 'Medical Director',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      duration: 45,
      location: 'Beverly Hills',
      address: '123 Rodeo Drive, Beverly Hills, CA 90210',
      price: 450,
      status: 'upcoming',
      canReschedule: true,
      canCancel: true,
      prepInstructions: [
        'Avoid blood thinners 7 days before',
        'No alcohol 24 hours before',
        'Arrive with clean skin, no makeup',
      ],
    },
    '2': {
      id: '2',
      service: 'Hydrafacial',
      provider: 'Emma Wilson',
      providerRole: 'Aesthetician',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: 60,
      location: 'West Hollywood',
      address: '456 Sunset Blvd, West Hollywood, CA 90069',
      price: 250,
      status: 'upcoming',
      canReschedule: true,
      canCancel: true,
      prepInstructions: [
        'No retinoids 3 days before',
        'Stay hydrated',
      ],
    },
  };
  return mockAppointments[id] || null;
};

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const appointment = getAppointmentById(id || '1');

  if (!appointment) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#6b21a8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointment Not Found</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Appointment not found</Text>
        </View>
      </View>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleReschedule = () => {
    Alert.alert(
      'Reschedule Appointment',
      'Would you like to reschedule this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reschedule',
          onPress: () => {
            router.push('/booking');
          }
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment? This action cannot be undone.',
      [
        { text: 'Keep Appointment', style: 'cancel' },
        {
          text: 'Cancel Appointment',
          style: 'destructive',
          onPress: () => {
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert('Cancelled', 'Your appointment has been cancelled.');
              router.back();
            }, 1000);
          }
        },
      ]
    );
  };

  const handleAddToCalendar = () => {
    Alert.alert('Add to Calendar', 'Appointment added to your calendar!');
  };

  const handleGetDirections = () => {
    Alert.alert('Directions', 'Opening Maps...');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#6b21a8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.statusContainer}>
          <LinearGradient
            colors={
              appointment.status === 'upcoming'
                ? ['#7c3aed', '#a855f7']
                : appointment.status === 'completed'
                ? ['#10b981', '#34d399']
                : ['#ef4444', '#f87171']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statusBadge}
          >
            <Ionicons
              name={
                appointment.status === 'upcoming'
                  ? 'time-outline'
                  : appointment.status === 'completed'
                  ? 'checkmark-circle-outline'
                  : 'close-circle-outline'
              }
              size={16}
              color="white"
            />
            <Text style={styles.statusText}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.serviceName}>{appointment.service}</Text>
          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerInitials}>
                {appointment.provider.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View>
              <Text style={styles.providerName}>{appointment.provider}</Text>
              <Text style={styles.providerRole}>{appointment.providerRole}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#6b21a8" />
            <Text style={styles.infoText}>{formatDate(appointment.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#6b21a8" />
            <Text style={styles.infoText}>
              {formatTime(appointment.date)} ({appointment.duration} minutes)
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#6b21a8" />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoText}>{appointment.location}</Text>
              <Text style={styles.addressText}>{appointment.address}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
            <Ionicons name="navigate-outline" size={16} color="#6b21a8" />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
          <View style={styles.priceRow}>
            <Text style={styles.sectionTitle}>Estimated Total</Text>
            <Text style={styles.priceText}>${appointment.price}</Text>
          </View>
        </Animated.View>

        {appointment.prepInstructions && appointment.prepInstructions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>Preparation Instructions</Text>
            {appointment.prepInstructions.map((instruction, index) => (
              <View key={index} style={styles.instructionRow}>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {appointment.status === 'upcoming' && (
          <Animated.View entering={FadeInDown.delay(700)} style={styles.actionsSection}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleAddToCalendar}>
              <Ionicons name="calendar" size={20} color="#6b21a8" />
              <Text style={styles.secondaryButtonText}>Add to Calendar</Text>
            </TouchableOpacity>

            {appointment.canReschedule && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleReschedule}>
                <Ionicons name="refresh" size={20} color="#6b21a8" />
                <Text style={styles.secondaryButtonText}>Reschedule</Text>
              </TouchableOpacity>
            )}

            {appointment.canCancel && (
              <TouchableOpacity
                style={[styles.secondaryButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Ionicons name="close-circle" size={20} color="#ef4444" />
                <Text style={[styles.secondaryButtonText, styles.cancelButtonText]}>
                  {isLoading ? 'Cancelling...' : 'Cancel Appointment'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  serviceName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInitials: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  providerRole: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
  },
  directionsText: {
    color: '#6b21a8',
    fontWeight: '600',
    fontSize: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6b21a8',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  actionsSection: {
    marginTop: 24,
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#6b21a8',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  cancelButtonText: {
    color: '#ef4444',
  },
});
