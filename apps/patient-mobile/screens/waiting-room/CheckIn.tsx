/**
 * Check-In Screen
 * Main check-in interface for patients when they arrive at clinic
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CheckInButton from '@/components/waiting-room/CheckInButton';
import { checkInService } from '@/services/waiting-room/checkInService';
import { CheckInResponse } from '@/types/waiting-room';

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const appointmentId = params.appointmentId as string;
  
  const [loading, setLoading] = useState(false);

  // Mock appointment data - replace with actual data from API/store
  const appointment = {
    id: appointmentId,
    service: 'Botox - Full Face',
    provider: 'Dr. Sarah Chen',
    date: new Date(),
    duration: 45,
    location: 'Beverly Hills Medical Spa',
    address: '123 Rodeo Drive, Beverly Hills, CA 90210',
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);

      const response: CheckInResponse = await checkInService.checkIn({
        appointmentId: appointment.id,
      });

      if (response.success) {
        Alert.alert(
          'Checked In Successfully!',
          response.message,
          [
            {
              text: 'View Status',
              onPress: () => router.replace({
                pathname: '/waiting-room/status',
                params: { appointmentId: appointment.id }
              }),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Check-In Failed',
        error.message || 'Unable to check in. Please try again or see the front desk.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const openDirections = () => {
    // Open maps app with clinic address
    Alert.alert('Directions', 'Opening maps app...');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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
        <Text style={styles.headerTitle}>Check-In</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <Ionicons name="location" size={48} color="#8B5CF6" />
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          <Text style={styles.welcomeSubtitle}>
            Ready to check in for your appointment?
          </Text>
        </View>

        {/* Appointment Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appointment Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="medkit-outline" size={20} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{appointment.service}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Provider</Text>
              <Text style={styles.detailValue}>{appointment.provider}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Scheduled Time</Text>
              <Text style={styles.detailValue}>{formatTime(appointment.date)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="hourglass-outline" size={20} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{appointment.duration} minutes</Text>
            </View>
          </View>
        </View>

        {/* Location Card */}
        <View style={styles.card}>
          <View style={styles.locationHeader}>
            <Text style={styles.cardTitle}>Location</Text>
            <TouchableOpacity onPress={openDirections} style={styles.directionsButton}>
              <Ionicons name="navigate" size={16} color="#8B5CF6" />
              <Text style={styles.directionsText}>Directions</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.locationName}>{appointment.location}</Text>
          <Text style={styles.locationAddress}>{appointment.address}</Text>
        </View>

        {/* Check-In Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.instructionsTitle}>Before You Check In</Text>
          <Text style={styles.instructionsText}>
            • Make sure you're at the clinic location{'\n'}
            • Have your ID ready{'\n'}
            • Review any pre-appointment forms{'\n'}
            • Arrive 10-15 minutes early
          </Text>
        </View>

        {/* Check-In Button */}
        <View style={styles.buttonContainer}>
          <CheckInButton
            onPress={handleCheckIn}
            loading={loading}
            label="I'm Here!"
          />
          
          <Text style={styles.smsHint}>
            Or text "HERE" to (555) 123-4567
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  directionsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
    marginLeft: 4,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  smsHint: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
});
