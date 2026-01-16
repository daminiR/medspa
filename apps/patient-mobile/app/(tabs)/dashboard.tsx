import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';
import ReferralCard from '@/components/referrals/ReferralCard';
import { referralService } from '@/services/referrals/referralService';
import { ReferralProgram } from '@medical-spa/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

// Mock data - will be replaced with API calls
const MOCK_UPCOMING_APPOINTMENTS = [
  {
    id: '1',
    service: 'Botox - Full Face',
    provider: 'Dr. Sarah Chen',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    duration: 45,
    location: 'Beverly Hills',
    price: 450,
    imageUrl: null,
  },
  {
    id: '2',
    service: 'HydraFacial',
    provider: 'Emma Wilson',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    duration: 60,
    location: 'Beverly Hills',
    price: 250,
    imageUrl: null,
  },
];

const QUICK_ACTIONS = [
  { id: 'book', icon: 'add-circle', label: 'Book Now', color: '#8B5CF6', route: '/booking' },
  { id: 'photos', icon: 'camera', label: 'Add Photo', color: '#EC4899', route: '/(tabs)/photos' },
  { id: 'rewards', icon: 'gift', label: 'Rewards', color: '#F59E0B', route: '/rewards' },
  { id: 'wallet', icon: 'wallet', label: 'Wallet', color: '#10B981', route: '/wallet' },
];

const MEMBERSHIP_DATA = {
  tier: 'Gold',
  points: 2450,
  nextTier: 'Platinum',
  pointsToNext: 550,
  savings: 324,
};

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [referralProgram, setReferralProgram] = useState<ReferralProgram | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    
    // Load referral program data
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const data = await referralService.getReferralProgram();
      setReferralProgram(data);
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Refresh data from API
    await Promise.all([
      new Promise(resolve => setTimeout(resolve, 1000)),
      loadReferralData(),
    ]);
    setRefreshing(false);
  }, []);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{user?.fullName || 'Guest'} ✨</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#374151" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Membership Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/membership')}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
              style={styles.membershipCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.membershipHeader}>
                <View style={styles.membershipTier}>
                  <Ionicons name="star" size={16} color="#FCD34D" />
                  <Text style={styles.tierText}>{MEMBERSHIP_DATA.tier} Member</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
              </View>

              <View style={styles.membershipPoints}>
                <Text style={styles.pointsValue}>{MEMBERSHIP_DATA.points.toLocaleString()}</Text>
                <Text style={styles.pointsLabel}>reward points</Text>
              </View>

              <View style={styles.membershipProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(MEMBERSHIP_DATA.points / (MEMBERSHIP_DATA.points + MEMBERSHIP_DATA.pointsToNext)) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {MEMBERSHIP_DATA.pointsToNext} pts to {MEMBERSHIP_DATA.nextTier}
                </Text>
              </View>

              <View style={styles.savingsContainer}>
                <Ionicons name="trending-up" size={16} color="#34D399" />
                <Text style={styles.savingsText}>
                  ${MEMBERSHIP_DATA.savings} saved this year
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Upcoming Appointments */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/appointments')}>
              <Text style={styles.seeAllLink}>See all</Text>
            </TouchableOpacity>
          </View>

          {MOCK_UPCOMING_APPOINTMENTS.length > 0 ? (
            MOCK_UPCOMING_APPOINTMENTS.map((appointment, index) => (
              <Animated.View
                key={appointment.id}
                entering={FadeInRight.duration(400).delay(400 + index * 100)}
              >
                <TouchableOpacity
                  style={styles.appointmentCard}
                  onPress={() => router.push(`/appointment/${appointment.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.appointmentDate}>
                    <Text style={styles.appointmentDateDay}>
                      {formatDate(appointment.date)}
                    </Text>
                    <Text style={styles.appointmentDateTime}>
                      {formatTime(appointment.date)}
                    </Text>
                  </View>

                  <View style={styles.appointmentDetails}>
                    <Text style={styles.appointmentService}>
                      {appointment.service}
                    </Text>
                    <View style={styles.appointmentMeta}>
                      <Ionicons name="person-outline" size={14} color="#6B7280" />
                      <Text style={styles.appointmentProvider}>
                        {appointment.provider}
                      </Text>
                    </View>
                    <View style={styles.appointmentMeta}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.appointmentDuration}>
                        {appointment.duration} min
                      </Text>
                      <Text style={styles.appointmentLocation}>
                        • {appointment.location}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.appointmentActions}>
                    <TouchableOpacity style={styles.walletButton}>
                      <Ionicons name="wallet-outline" size={18} color="#8B5CF6" />
                    </TouchableOpacity>
                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="calendar-outline" size={40} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyStateTitle}>No upcoming appointments</Text>
              <Text style={styles.emptyStateText}>
                Book your next treatment to start your journey
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/booking')}
              >
                <Text style={styles.emptyStateButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Promotions Banner */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)}>
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient
              colors={['#FDF2F8', '#FCE7F3']}
              style={styles.promoBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.promoContent}>
                <View style={styles.promoTag}>
                  <Text style={styles.promoTagText}>Limited Time</Text>
                </View>
                <Text style={styles.promoTitle}>20% Off HydraFacials</Text>
                <Text style={styles.promoSubtitle}>This week only • Ends Sunday</Text>
              </View>
              <Ionicons name="sparkles" size={40} color="#EC4899" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Referral Card */}
        {referralProgram && (
          <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.referralSection}>
            <ReferralCard
              onPress={() => router.push('/referrals/program' as any)}
              totalEarnings={referralProgram.totalEarnings}
              availableCredits={referralProgram.availableCredits}
              referrerReward={25}
              refereeReward={25}
            />
          </Animated.View>
        )}

        {/* Recent Treatment Photos */}
        <Animated.View entering={FadeInDown.duration(600).delay(700)} style={styles.photosSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Transformation</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/photos')}>
              <Text style={styles.seeAllLink}>View gallery</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photoPlaceholder}>
            <Ionicons name="images-outline" size={48} color="#D1D5DB" />
            <Text style={styles.photoPlaceholderText}>
              Track your progress with before & after photos
            </Text>
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={() => router.push('/(tabs)/photos')}
            >
              <Ionicons name="camera" size={16} color="#8B5CF6" />
              <Text style={styles.addPhotoButtonText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  membershipCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  membershipTier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  membershipPoints: {
    marginBottom: 12,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pointsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  membershipProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    width: (width - 48 - 36) / 4,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  appointmentsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentDate: {
    width: 70,
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  appointmentDateDay: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  appointmentDateTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  appointmentDetails: {
    flex: 1,
    paddingLeft: 16,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  appointmentProvider: {
    fontSize: 13,
    color: '#6B7280',
  },
  appointmentDuration: {
    fontSize: 13,
    color: '#6B7280',
  },
  appointmentLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  appointmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyStateIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  promoContent: {
    flex: 1,
  },
  promoTag: {
    backgroundColor: '#EC4899',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  promoTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  referralSection: {
    marginBottom: 24,
  },
  photosSection: {
    marginBottom: 24,
  },
  photoPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addPhotoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
});
