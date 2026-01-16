/**
 * Waiting Status Screen
 * Shows patient's position in queue and estimated wait time
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import QueuePosition from '@/components/waiting-room/QueuePosition';
import EstimatedWait from '@/components/waiting-room/EstimatedWait';
import { checkInService } from '@/services/waiting-room/checkInService';
import { PatientQueueStatus } from '@/types/waiting-room';

export default function WaitingStatusScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const appointmentId = params.appointmentId as string;
  
  const [queueStatus, setQueueStatus] = useState<PatientQueueStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock appointment data
  const appointment = {
    id: appointmentId,
    service: 'Botox - Full Face',
    provider: 'Dr. Sarah Chen',
    date: new Date(),
    duration: 45,
    location: 'Beverly Hills Medical Spa',
    roomNumber: 'Suite 3',
  };

  const fetchQueueStatus = useCallback(async () => {
    try {
      const status = await checkInService.getPatientQueueStatus(appointmentId);
      setQueueStatus(status);

      // Check if room is ready
      if (status.status === 'room_ready' && !status.roomReadyNotifiedAt) {
        Alert.alert(
          'Your Room is Ready!',
          `Please proceed to ${appointment.roomNumber}. Your provider will see you shortly.`,
          [{ text: 'Got It!' }]
        );
      }
    } catch (error) {
      console.error('Error fetching queue status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchQueueStatus();

    // Set up polling for real-time updates (every 10 seconds)
    const cleanup = checkInService.pollQueueStatus(
      appointmentId,
      (status) => {
        setQueueStatus(status);

        // Notify when room is ready
        if (status.status === 'room_ready' && status.roomReadyNotifiedAt) {
          const timeSinceNotification = Date.now() - status.roomReadyNotifiedAt.getTime();
          // Only show alert if notification was sent in last 5 seconds
          if (timeSinceNotification < 5000) {
            Alert.alert(
              'Your Room is Ready!',
              `Please proceed to ${appointment.roomNumber}. Your provider will see you shortly.`,
              [{ text: 'Got It!' }]
            );
          }
        }
      },
      10000 // Poll every 10 seconds
    );

    return () => {
      cleanup.then((cleanupFn) => cleanupFn());
    };
  }, [appointmentId, fetchQueueStatus]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchQueueStatus();
  }, [fetchQueueStatus]);

  const getStatusInfo = () => {
    if (!queueStatus || !queueStatus.isInQueue) {
      return {
        icon: 'checkmark-circle',
        iconColor: '#10B981',
        title: 'Checked In',
        subtitle: "We'll call you when your room is ready",
      };
    }

    switch (queueStatus.status) {
      case 'in_car':
        return {
          icon: 'hourglass-outline',
          iconColor: '#3B82F6',
          title: 'In Waiting Room',
          subtitle: 'Please wait to be called',
        };
      case 'room_ready':
        return {
          icon: 'flash',
          iconColor: '#F59E0B',
          title: 'Room Ready!',
          subtitle: `Please proceed to ${appointment.roomNumber}`,
        };
      case 'checked_in':
        return {
          icon: 'checkmark-done',
          iconColor: '#10B981',
          title: 'Checked In',
          subtitle: 'Your provider will see you shortly',
        };
      default:
        return {
          icon: 'time-outline',
          iconColor: '#6B7280',
          title: 'Waiting',
          subtitle: 'Please wait to be called',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#8B5CF6', '#6D28D9']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Waiting Room</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Card */}
        <Animated.View entering={FadeInDown} style={styles.statusCard}>
          <View style={[styles.statusIconContainer, { backgroundColor: `${statusInfo.iconColor}15` }]}>
            <Ionicons name={statusInfo.icon as any} size={48} color={statusInfo.iconColor} />
          </View>
          <Text style={styles.statusTitle}>{statusInfo.title}</Text>
          <Text style={styles.statusSubtitle}>{statusInfo.subtitle}</Text>
        </Animated.View>

        {/* Appointment Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Appointment</Text>
          <View style={styles.appointmentRow}>
            <Ionicons name="medkit-outline" size={20} color="#8B5CF6" />
            <Text style={styles.appointmentText}>{appointment.service}</Text>
          </View>
          <View style={styles.appointmentRow}>
            <Ionicons name="person-outline" size={20} color="#8B5CF6" />
            <Text style={styles.appointmentText}>{appointment.provider}</Text>
          </View>
        </View>

        {/* Queue Position */}
        {queueStatus?.isInQueue && queueStatus.position && (
          <QueuePosition
            position={queueStatus.position}
            totalWaiting={queueStatus.position + 2} // Mock total
          />
        )}

        {/* Estimated Wait Time */}
        {queueStatus?.estimatedWaitMinutes !== undefined && (
          <EstimatedWait
            estimatedMinutes={queueStatus.estimatedWaitMinutes}
            scheduledTime={appointment.date}
          />
        )}

        {/* Help Section */}
        <View style={styles.helpCard}>
          <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
          <Text style={styles.helpTitle}>Need Assistance?</Text>
          <Text style={styles.helpText}>
            If you need to reschedule or have questions, please speak with the
            front desk staff.
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="call-outline" size={18} color="#8B5CF6" />
            <Text style={styles.helpButtonText}>Call Front Desk</Text>
          </TouchableOpacity>
        </View>

        {/* Auto-Update Notice */}
        <View style={styles.autoUpdateNotice}>
          <Ionicons name="sync-outline" size={16} color="#9CA3AF" />
          <Text style={styles.autoUpdateText}>
            Status updates automatically every 10 seconds
          </Text>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statusIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 12,
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  helpButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 8,
  },
  autoUpdateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  autoUpdateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 6,
  },
});
