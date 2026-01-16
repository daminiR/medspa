/**
 * Estimated Wait Time Component
 * Shows estimated wait time until appointment
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface EstimatedWaitProps {
  estimatedMinutes: number;
  scheduledTime: Date;
}

export default function EstimatedWait({ estimatedMinutes, scheduledTime }: EstimatedWaitProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getWaitColor = () => {
    if (estimatedMinutes <= 5) return '#10B981'; // Green - ready soon
    if (estimatedMinutes <= 15) return '#F59E0B'; // Orange - moderate wait
    return '#3B82F6'; // Blue - longer wait
  };

  const getWaitMessage = () => {
    if (estimatedMinutes <= 5) return "You'll be called soon!";
    if (estimatedMinutes <= 15) return 'Please stay nearby';
    return 'Feel free to relax';
  };

  return (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={24} color="#6B7280" />
        <Text style={styles.title}>Estimated Wait Time</Text>
      </View>

      <View style={styles.timeContainer}>
        <View style={[styles.timeBadge, { backgroundColor: getWaitColor() }]}>
          <Text style={styles.timeValue}>~{estimatedMinutes}</Text>
          <Text style={styles.timeUnit}>minutes</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={18} color="#6B7280" />
        <Text style={styles.infoText}>
          Scheduled for {formatTime(scheduledTime)}
        </Text>
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.message}>{getWaitMessage()}</Text>
      </View>

      <View style={styles.tipContainer}>
        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
        <Text style={styles.tipText}>
          Wait times are estimates and may vary
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeBadge: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 140,
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 40,
  },
  timeUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 15,
    color: '#6B7280',
    marginLeft: 8,
  },
  messageContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
});
