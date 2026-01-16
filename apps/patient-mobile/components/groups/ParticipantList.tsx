import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupBookingParticipant } from '@medical-spa/types';

interface ParticipantListProps {
  participants: GroupBookingParticipant[];
  coordinatorId: string;
}

export default function ParticipantList({ participants, coordinatorId }: ParticipantListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#D1FAE5', text: '#10B981' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#F59E0B' };
      case 'cancelled':
        return { bg: '#FEE2E2', text: '#EF4444' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return { name: 'checkmark-circle', color: '#10B981' };
      case 'pending':
        return { name: 'time-outline', color: '#F59E0B' };
      case 'refunded':
        return { name: 'refresh', color: '#6B7280' };
      default:
        return { name: 'help-circle-outline', color: '#9CA3AF' };
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderParticipant = ({ item }: { item: GroupBookingParticipant }) => {
    const isCoordinator = item.patientId === coordinatorId;
    const statusColors = getStatusColor(item.status);
    const paymentIcon = getPaymentStatusIcon(item.paymentStatus);
    const initials = item.initials || item.patientName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <View style={styles.participantCard}>
        {/* Avatar & Info */}
        <View style={styles.participantHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.participantInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.participantName}>{item.patientName}</Text>
              {isCoordinator && (
                <View style={styles.coordinatorBadge}>
                  <Ionicons name="star" size={12} color="#FCD34D" />
                  <Text style={styles.coordinatorText}>Coordinator</Text>
                </View>
              )}
            </View>

            <Text style={styles.serviceName}>{item.serviceName}</Text>

            {/* Status & Payment Row */}
            <View style={styles.metaRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusText, { color: statusColors.text }]}>
                  {item.status}
                </Text>
              </View>

              <View style={styles.paymentStatus}>
                <Ionicons
                  name={paymentIcon.name as any}
                  size={14}
                  color={paymentIcon.color}
                />
                <Text style={[styles.paymentText, { color: paymentIcon.color }]}>
                  {item.paymentStatus}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{item.practitionerName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>${item.servicePrice}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={20} color="#8B5CF6" />
        <Text style={styles.title}>
          Participants ({participants.length})
        </Text>
      </View>

      <FlatList
        data={participants}
        renderItem={renderParticipant}
        keyExtractor={(item) => item.patientId}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  listContent: {
    gap: 12,
  },
  participantCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  participantHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  participantInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  coordinatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coordinatorText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
  },
  serviceName: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
