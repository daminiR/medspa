import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GroupCard } from '@/components/groups';
import { groupService } from '@/services/groupService';
import { GroupBooking } from '@medical-spa/types';

type FilterType = 'all' | 'coordinator' | 'participant';

export default function GroupsListScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchCode, setSearchCode] = useState('');
  const [groups, setGroups] = useState<GroupBooking[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock current patient ID - in production, get from auth store
  const currentPatientId = 'p1';

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await groupService.getMyGroups(currentPatientId);
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load groups');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const handleJoinByCode = () => {
    const code = searchCode.trim().toUpperCase();
    if (code) {
      router.push(`/groups/join/${code}` as any);
      setSearchCode('');
    }
  };

  const filteredGroups = groups.filter((group) => {
    if (filter === 'coordinator') {
      return group.coordinatorPatientId === currentPatientId;
    }
    if (filter === 'participant') {
      return group.coordinatorPatientId !== currentPatientId;
    }
    return true;
  });

  const coordinatorCount = groups.filter(
    (g) => g.coordinatorPatientId === currentPatientId
  ).length;
  const participantCount = groups.filter(
    (g) => g.coordinatorPatientId !== currentPatientId
  ).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Group Bookings</Text>
          <Text style={styles.headerSubtitle}>
            Coordinate spa days with friends
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/groups/create' as any)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Join by Code Card */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <LinearGradient
            colors={['#F5F3FF', '#EDE9FE']}
            style={styles.joinCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.joinHeader}>
              <Ionicons name="key" size={20} color="#8B5CF6" />
              <Text style={styles.joinTitle}>Have a booking code?</Text>
            </View>
            <Text style={styles.joinSubtitle}>
              Enter the code shared by your group coordinator
            </Text>
            <View style={styles.joinInputRow}>
              <TextInput
                style={styles.joinInput}
                placeholder="Enter code (e.g., SARAH2)"
                placeholderTextColor="#9CA3AF"
                value={searchCode}
                onChangeText={(text) => setSearchCode(text.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[styles.joinButton, !searchCode.trim() && styles.joinButtonDisabled]}
                onPress={handleJoinByCode}
                disabled={!searchCode.trim()}
              >
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Ionicons
              name="people"
              size={16}
              color={filter === 'all' ? '#8B5CF6' : '#6B7280'}
            />
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All ({groups.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'coordinator' && styles.filterTabActive]}
            onPress={() => setFilter('coordinator')}
          >
            <Ionicons
              name="star"
              size={16}
              color={filter === 'coordinator' ? '#8B5CF6' : '#6B7280'}
            />
            <Text
              style={[
                styles.filterTabText,
                filter === 'coordinator' && styles.filterTabTextActive,
              ]}
            >
              Organizing ({coordinatorCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'participant' && styles.filterTabActive]}
            onPress={() => setFilter('participant')}
          >
            <Ionicons
              name="person"
              size={16}
              color={filter === 'participant' ? '#8B5CF6' : '#6B7280'}
            />
            <Text
              style={[
                styles.filterTabText,
                filter === 'participant' && styles.filterTabTextActive,
              ]}
            >
              Joined ({participantCount})
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Groups List */}
        {filteredGroups.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyStateTitle}>No Group Bookings</Text>
            <Text style={styles.emptyStateText}>
              {filter === 'coordinator'
                ? "You haven't created any group bookings yet."
                : filter === 'participant'
                ? "You haven't joined any group bookings yet."
                : "You don't have any group bookings yet."}
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push('/groups/create' as any)}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.emptyStateButtonText}>Create a Group</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.groupsList}>
            {filteredGroups.map((group, index) => (
              <Animated.View
                key={group.id}
                entering={FadeInDown.duration(400).delay(200 + index * 100)}
              >
                <GroupCard group={group} currentPatientId={currentPatientId} />
              </Animated.View>
            ))}
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  joinCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  joinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  joinTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  joinSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  joinInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  joinInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 1,
  },
  joinButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#8B5CF6',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#8B5CF6',
  },
  groupsList: {
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
