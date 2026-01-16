/**
 * Check-In Card Component
 * Shows on dashboard when patient has an appointment today
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface CheckInCardProps {
  appointmentId: string;
  service: string;
  provider: string;
  time: Date;
  canCheckIn: boolean;
  isCheckedIn?: boolean;
  waitingStatus?: 'in_car' | 'room_ready' | 'checked_in';
}

export default function CheckInCard({
  appointmentId,
  service,
  provider,
  time,
  canCheckIn,
  isCheckedIn = false,
  waitingStatus,
}: CheckInCardProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeUntilAppointment = () => {
    const now = new Date();
    const diffMs = time.getTime() - now.getTime();
    const diffInMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffInMinutes < 0) {
      return 'Now';
    } else if (diffInMinutes < 60) {
      return 'In ' + diffInMinutes + ' min';
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const mins = diffInMinutes % 60;
      return 'In ' + hours + 'h ' + mins + 'm';
    }
  };

  const handlePress = () => {
    if (isCheckedIn) {
      router.push({
        pathname: '/waiting-room/status',
        params: { appointmentId }
      });
    } else {
      router.push({
        pathname: '/waiting-room/check-in',
        params: { appointmentId }
      });
    }
  };

  const getStatusInfo = () => {
    if (waitingStatus === 'room_ready') {
      return {
        text: 'Room Ready!',
        icon: 'flash',
        colors: ['#F59E0B', '#D97706'],
      };
    }
    if (isCheckedIn) {
      return {
        text: 'View Status',
        icon: 'time-outline',
        colors: ['#3B82F6', '#2563EB'],
      };
    }
    if (canCheckIn) {
      return {
        text: 'Check In',
        icon: 'checkmark-circle',
        colors: ['#10B981', '#059669'],
      };
    }
    return {
      text: 'Check in soon',
      icon: 'time-outline',
      colors: ['#6B7280', '#4B5563'],
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Animated.View entering={FadeInDown}>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.9}
        disabled={!canCheckIn && !isCheckedIn}
      >
        <LinearGradient
          colors={statusInfo.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>
                  {isCheckedIn ? 'Checked In' : 'Todays Appointment'}
                </Text>
                <Text style={styles.timeText}>{getTimeUntilAppointment()}</Text>
              </View>
            </View>

            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Ionicons name="medkit-outline" size={16} color="#FFFFFF" />
                <Text style={styles.detailText}>{service}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={16} color="#FFFFFF" />
                <Text style={styles.detailText}>{provider}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                <Text style={styles.detailText}>{formatTime(time)}</Text>
              </View>
            </View>

            <View style={styles.actionButton}>
              <Text style={styles.actionText}>{statusInfo.text}</Text>
              <Ionicons name={statusInfo.icon as any} size={20} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  gradient: {
    padding: 20,
  },
  content: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 10,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 4,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
