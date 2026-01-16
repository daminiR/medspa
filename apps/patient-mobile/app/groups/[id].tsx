import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ParticipantList,
  PaymentSplitView,
  GroupChat,
  InviteShareSheet,
} from '@/components/groups';
import { groupService } from '@/services/groupService';
import { GroupBooking } from '@medical-spa/types';

export default function GroupDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<GroupBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareSheet, setShowShareSheet] = useState(false);

  // Mock current patient ID
  const currentPatientId = 'p1';

  useEffect(() => {
    if (id) {
      loadGroup();
    }
  }, [id]);

  const loadGroup = async () => {
    setLoading(true);
    try {
      const data = await groupService.getGroupBooking(id as string);
      setGroup(data);
    } catch (error) {
      console.error('Error loading group:', error);
      Alert.alert('Error', 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!group) return;

    try {
      const result = await groupService.sendChatMessage({
        groupBookingId: group.id,
        senderId: currentPatientId,
        message,
      });

      if (result) {
        // Reload group to get updated messages
        await loadGroup();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleLeaveGroup = () => {
    if (!group) return;

    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              // In production, call API to leave group
              Alert.alert('Success', 'You have left the group');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  const handleCancelGroup = () => {
    if (!group) return;

    Alert.alert(
      'Cancel Group',
      'Are you sure you want to cancel this entire group booking? All participants will be notified.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancel Group',
          style: 'destructive',
          onPress: async () => {
            try {
              // In production, call API to cancel group
              Alert.alert('Success', 'Group booking cancelled');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel group');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading group details...</Text>
        </View>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Group Not Found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isCoordinator = group.coordinatorPatientId === currentPatientId;
  const isParticipant = group.participants.some((p) => p.patientId === currentPatientId);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={styles.headerSubtitle}>{formatDate(group.date)}</Text>
        </View>
        <TouchableOpacity style={styles.shareHeaderButton} onPress={() => setShowShareSheet(true)}>
          <Ionicons name="share-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Type Banner */}
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.eventBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.eventBannerContent}>
            <View style={styles.eventTypeIcon}>
              <Ionicons name="sparkles" size={24} color="#8B5CF6" />
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventType}>{group.eventType || 'Group Event'}</Text>
              {group.eventDate && (
                <Text style={styles.eventDate}>
                  Event Date: {formatDate(group.eventDate)}
                </Text>
              )}
            </View>
          </View>

          {isCoordinator && (
            <View style={styles.coordinatorBadge}>
              <Ionicons name="star" size={16} color="#FCD34D" />
              <Text style={styles.coordinatorText}>Coordinator</Text>
            </View>
          )}
        </LinearGradient>

        {/* Booking Code Card */}
        <View style={styles.codeCard}>
          <View style={styles.codeCardHeader}>
            <Ionicons name="key" size={20} color="#8B5CF6" />
            <Text style={styles.codeCardTitle}>Booking Code</Text>
          </View>
          <Text style={styles.bookingCode}>{group.bookingCode}</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => setShowShareSheet(true)}
          >
            <Ionicons name="share-social" size={18} color="#8B5CF6" />
            <Text style={styles.shareButtonText}>Share Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>{group.participants.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.statValue}>
              {group.participants.filter((p) => p.status === 'confirmed').length}
            </Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="pricetag" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{group.discountPercent}%</Text>
            <Text style={styles.statLabel}>Discount</Text>
          </View>
        </View>

        {/* Participants */}
        <ParticipantList participants={group.participants} coordinatorId={group.coordinatorPatientId} />

        {/* Payment Breakdown */}
        <PaymentSplitView group={group} />

        {/* Group Chat */}
        <GroupChat
          messages={group.messages || []}
          currentUserId={currentPatientId}
          onSendMessage={handleSendMessage}
        />

        {/* Actions */}
        {isCoordinator ? (
          <View style={styles.actionsSection}>
            <Text style={styles.actionsTitle}>Coordinator Actions</Text>
            <TouchableOpacity style={styles.actionButtonDanger} onPress={handleCancelGroup}>
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.actionButtonDangerText}>Cancel Group Booking</Text>
            </TouchableOpacity>
          </View>
        ) : (
          isParticipant && (
            <View style={styles.actionsSection}>
              <Text style={styles.actionsTitle}>Participant Actions</Text>
              <TouchableOpacity style={styles.actionButtonSecondary} onPress={handleLeaveGroup}>
                <Ionicons name="exit-outline" size={20} color="#6B7280" />
                <Text style={styles.actionButtonSecondaryText}>Leave Group</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </ScrollView>

      {/* Share Sheet Modal */}
      <Modal
        visible={showShareSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowShareSheet(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowShareSheet(false)}
          />
          <InviteShareSheet
            bookingCode={group.bookingCode}
            groupName={group.name}
            eventDate={group.date}
            onClose={() => setShowShareSheet(false)}
          />
        </View>
      </Modal>
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
  backButtonHeader: {
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
    color: '#9CA3AF',
    marginTop: 2,
  },
  shareHeaderButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventBanner: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  eventBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  eventTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  coordinatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coordinatorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  codeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  codeCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  bookingCode: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 4,
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  actionButtonDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonDangerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
