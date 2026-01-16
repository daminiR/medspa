import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JoinGroupForm } from '@/components/groups';
import { groupService } from '@/services/groupService';
import { GroupBooking } from '@medical-spa/types';

export default function JoinGroupScreen() {
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code: string }>();
  const [group, setGroup] = useState<GroupBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock current user info
  const currentUser = {
    patientId: 'p10',
    patientName: 'New Member',
    patientEmail: 'newmember@email.com',
    patientPhone: '(555) 999-0000',
  };

  useEffect(() => {
    if (code) {
      loadGroup(code as string);
    }
  }, [code]);

  const loadGroup = async (bookingCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await groupService.getGroupBookingByCode(bookingCode);

      if (!data) {
        setError('Invalid booking code. Please check and try again.');
      } else if (data.status === 'cancelled') {
        setError('This group booking has been cancelled.');
      } else if (data.maxParticipants && data.participants.length >= data.maxParticipants) {
        setError('This group is full. Please contact the coordinator.');
      } else {
        setGroup(data);
      }
    } catch (err) {
      console.error('Error loading group:', err);
      setError('Failed to load group details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (serviceId: string, notes?: string) => {
    if (!group) return;

    try {
      const result = await groupService.joinGroupBooking({
        bookingCode: group.bookingCode,
        patientId: currentUser.patientId,
        serviceId,
        practitionerId: 'pr1',
        specialRequests: notes,
      });

      if (result) {
        Alert.alert(
          'Success!',
          `You've joined ${group.name}! Check your groups list to see details.`,
          [
            {
              text: 'View Group',
              onPress: () => router.replace(`/groups/${result.id}` as any),
            },
            {
              text: 'Go to Groups',
              onPress: () => router.replace('/groups'),
            },
          ]
        );
      }
    } catch (err) {
      console.error('Error joining group:', err);
      Alert.alert('Error', 'Failed to join group. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Join Group</Text>
          {code && (
            <Text style={styles.headerSubtitle}>Code: {code.toString().toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <JoinGroupForm
          group={group}
          isLoading={loading}
          error={error}
          onJoin={handleJoin}
        />
      </View>
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
    marginTop: 2,
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
});
