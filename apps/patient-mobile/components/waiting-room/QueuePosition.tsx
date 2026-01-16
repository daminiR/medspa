/**
 * Queue Position Component
 * Visual indicator showing patient's position in queue
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface QueuePositionProps {
  position: number;
  totalWaiting: number;
}

export default function QueuePosition({ position, totalWaiting }: QueuePositionProps) {
  // Show up to 5 circles (people ahead + patient + people behind)
  const circles = [];
  const maxCircles = Math.min(5, totalWaiting);
  
  for (let i = 1; i <= maxCircles; i++) {
    const isCurrentPatient = i === position;
    const isPassed = i < position;
    
    circles.push(
      <View
        key={i}
        style={[
          styles.circle,
          isCurrentPatient && styles.currentCircle,
          isPassed && styles.passedCircle,
        ]}
      >
        {isCurrentPatient ? (
          <Ionicons name="person" size={20} color="#FFFFFF" />
        ) : isPassed ? (
          <Ionicons name="checkmark" size={16} color="#10B981" />
        ) : (
          <Text style={styles.circleNumber}>{i}</Text>
        )}
      </View>
    );
    
    if (i < maxCircles) {
      circles.push(
        <View
          key={`line-${i}`}
          style={[styles.line, i < position && styles.passedLine]}
        />
      );
    }
  }

  return (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.container}>
      <Text style={styles.title}>Your Position in Queue</Text>
      
      <View style={styles.queueVisualization}>
        {circles}
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Your Position</Text>
          <Text style={styles.infoValue}>#{position}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Total Waiting</Text>
          <Text style={styles.infoValue}>{totalWaiting}</Text>
        </View>
      </View>
      
      {position === 1 && (
        <Animated.View entering={FadeIn.delay(500)} style={styles.nextBadge}>
          <Ionicons name="flash" size={16} color="#F59E0B" />
          <Text style={styles.nextText}>You're next!</Text>
        </Animated.View>
      )}
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  queueVisualization: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentCircle: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    transform: [{ scale: 1.15 }],
  },
  passedCircle: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  circleNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  line: {
    width: 24,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  passedLine: {
    backgroundColor: '#10B981',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  nextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  nextText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 6,
  },
});
