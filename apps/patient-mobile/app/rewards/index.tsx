import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RewardCard from '../../components/referrals/RewardCard';
import * as Haptics from 'expo-haptics';

interface ReferralReward {
  id: string;
  title: string;
  description: string;
  amount: number;
  code: string;
  type: 'credit' | 'discount' | 'service';
  expiresAt: Date;
  status: 'active' | 'redeemed' | 'expired';
  redeemedAt?: Date;
  serviceId?: string;
  minPurchase?: number;
}

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [totalCredits, setTotalCredits] = useState(150);
  const [pendingCredits, setPendingCredits] = useState(75);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    // Mock rewards data
    setRewards([
      {
        id: '1',
        title: '$50 Referral Credit',
        description: 'Earned from Emily Johnson referral',
        amount: 50,
        code: 'REF-EMILY-001',
        type: 'credit',
        expiresAt: new Date('2025-03-15'),
        status: 'active',
      },
      {
        id: '2',
        title: '$25 Referral Credit',
        description: 'Earned from Jessica Martinez referral',
        amount: 25,
        code: 'REF-JESSICA-002',
        type: 'credit',
        expiresAt: new Date('2025-03-20'),
        status: 'active',
      },
      {
        id: '3',
        title: 'Milestone Bonus',
        description: '5 referrals milestone bonus',
        amount: 10,
        code: 'MILESTONE-5REF',
        type: 'credit',
        expiresAt: new Date('2025-04-01'),
        status: 'active',
      },
      {
        id: '4',
        title: '$50 Referral Credit',
        description: 'Earned from Amanda Smith referral',
        amount: 50,
        code: 'REF-AMANDA-003',
        type: 'credit',
        expiresAt: new Date('2024-12-15'),
        status: 'redeemed',
        redeemedAt: new Date('2024-12-10'),
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRewards();
    setRefreshing(false);
  };

  const handleRedeemReward = async (reward: ReferralReward) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Redeem Reward',
      `Use this code at checkout: ${reward.code}\n\nThis $${reward.amount} credit will be applied to your next purchase.`,
      [
        { text: 'Copy Code', onPress: () => copyRewardCode(reward.code) },
        { text: 'Book Now', onPress: () => router.push('/booking') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const copyRewardCode = async (code: string) => {
    // Copy to clipboard
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied!', `Code ${code} copied to clipboard`);
  };

  const activeRewards = rewards.filter(r => r.status === 'active');
  const redeemedRewards = rewards.filter(r => r.status === 'redeemed');

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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rewards</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Balance Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.balanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceDecor} />
            
            <View style={styles.balanceHeader}>
              <Ionicons name="wallet" size={32} color="#FFFFFF" />
              <Text style={styles.balanceLabel}>Available Credits</Text>
            </View>

            <Text style={styles.balanceAmount}>${totalCredits}</Text>
            
            {pendingCredits > 0 && (
              <View style={styles.pendingBadge}>
                <Ionicons name="time-outline" size={14} color="#FCD34D" />
                <Text style={styles.pendingText}>
                  +${pendingCredits} pending
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.useCreditsButton}
              onPress={() => router.push('/booking')}
            >
              <Text style={styles.useCreditsButtonText}>Book Appointment</Text>
              <Ionicons name="arrow-forward" size={18} color="#8B5CF6" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Active Rewards */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Active Rewards ({activeRewards.length})</Text>
          
          {activeRewards.length > 0 ? (
            activeRewards.map((reward, index) => (
              <Animated.View
                key={reward.id}
                entering={FadeInDown.duration(600).delay(300 + index * 100)}
              >
                <RewardCard
                  reward={reward}
                  onRedeem={() => handleRedeemReward(reward)}
                />
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No active rewards</Text>
              <Text style={styles.emptyStateText}>
                Refer friends to earn more rewards!
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/referrals')}
              >
                <Text style={styles.emptyStateButtonText}>View Referral Program</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Redeemed Rewards */}
        {redeemedRewards.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(600).delay(400)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Redeemed ({redeemedRewards.length})</Text>
            
            {redeemedRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                onRedeem={() => {}}
              />
            ))}
          </Animated.View>
        )}

        {/* Info Section */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(500)}
          style={styles.infoSection}
        >
          <Text style={styles.infoTitle}>How to use your rewards</Text>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>
              Credits automatically apply at checkout
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>
              Use multiple rewards in one transaction
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>
              Check expiration dates to maximize savings
            </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  balanceDecor: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  pendingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  useCreditsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
  },
  useCreditsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
