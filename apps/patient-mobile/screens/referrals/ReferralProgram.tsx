import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import ShareModal from '../../components/referrals/ShareModal';
import { referralService } from '../../services/referrals/referralService';
import { ReferralProgram as ReferralProgramType, Referral, ReferralStatus } from '@medical-spa/types';

const { width } = Dimensions.get('window');

export default function ReferralProgramScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [program, setProgram] = useState<ReferralProgramType | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [programData, referralsData] = await Promise.all([
        referralService.getReferralProgram(),
        referralService.getReferralHistory(),
      ]);
      setProgram(programData);
      setReferrals(referralsData);
    } catch (error) {
      console.error('Error loading referral data:', error);
      Alert.alert('Error', 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCopyCode = async () => {
    if (!program) return;
    await Clipboard.setStringAsync(program.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = async (method: string) => {
    try {
      await referralService.shareReferral({
        method: method as any,
        message: `Use my code ${program?.referralCode} for $25 off!`,
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const getStatusBadge = (status: ReferralStatus) => {
    const badges = {
      COMPLETED: { label: 'Completed', color: '#10B981', bg: '#D1FAE5' },
      FIRST_VISIT: { label: 'First Visit', color: '#F59E0B', bg: '#FEF3C7' },
      SIGNED_UP: { label: 'Signed Up', color: '#3B82F6', bg: '#DBEAFE' },
      PENDING: { label: 'Pending', color: '#6B7280', bg: '#F3F4F6' },
      EXPIRED: { label: 'Expired', color: '#EF4444', bg: '#FEE2E2' },
      CANCELLED: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' },
    };
    return badges[status] || badges.PENDING;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!program) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Referral Program</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Hero Section */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroDecor1} />
            <View style={styles.heroDecor2} />

            <View style={styles.heroHeader}>
              <Ionicons name="gift" size={32} color="#FFFFFF" />
              <Text style={styles.heroTitle}>Earn $25 Per Friend</Text>
            </View>

            <Text style={styles.heroSubtitle}>
              Share your code with friends. When they book their first service, you both get $25!
            </Text>

            <View style={styles.rewardBadges}>
              <View style={styles.rewardBadge}>
                <Ionicons name="heart" size={20} color="#EC4899" />
                <Text style={styles.rewardBadgeText}>You: $25</Text>
              </View>
              <Text style={styles.rewardPlus}>+</Text>
              <View style={styles.rewardBadge}>
                <Ionicons name="people" size={20} color="#10B981" />
                <Text style={styles.rewardBadgeText}>Friend: $25</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Referral Code */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.codeSection}
        >
          <Text style={styles.sectionLabel}>Your Referral Code</Text>
          <View style={styles.codeCard}>
            <View style={styles.codeContent}>
              <Text style={styles.codeText}>{program.referralCode}</Text>
              <TouchableOpacity
                onPress={handleCopyCode}
                style={styles.copyCodeButton}
              >
                <Ionicons
                  name={copiedCode ? 'checkmark-circle' : 'copy'}
                  size={24}
                  color={copiedCode ? '#10B981' : '#8B5CF6'}
                />
              </TouchableOpacity>
            </View>
            {copiedCode && (
              <Animated.Text entering={FadeIn} style={styles.copiedText}>
                Copied to clipboard!
              </Animated.Text>
            )}
          </View>
        </Animated.View>

        {/* Share Buttons */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.shareSection}
        >
          <TouchableOpacity
            style={styles.primaryShareButton}
            onPress={() => setShareModalVisible(true)}
          >
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
            <Text style={styles.primaryShareButtonText}>Share Your Code</Text>
          </TouchableOpacity>

          <View style={styles.quickShareButtons}>
            <TouchableOpacity
              style={styles.quickShareButton}
              onPress={() => {
                setShareModalVisible(true);
              }}
            >
              <Ionicons name="chatbubble" size={20} color="#10B981" />
              <Text style={styles.quickShareButtonText}>SMS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickShareButton}
              onPress={() => {
                setShareModalVisible(true);
              }}
            >
              <Ionicons name="mail" size={20} color="#3B82F6" />
              <Text style={styles.quickShareButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickShareButton}
              onPress={() => {
                setShareModalVisible(true);
              }}
            >
              <Ionicons name="logo-instagram" size={20} color="#E4405F" />
              <Text style={styles.quickShareButtonText}>Social</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          style={styles.statsSection}
        >
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="people" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{program.totalReferrals}</Text>
              <Text style={styles.statLabel}>Total Referrals</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="time" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{program.pendingReferrals}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{program.successfulReferrals}</Text>
              <Text style={styles.statLabel}>Successful</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="wallet" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>${program.totalEarnings}</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
          </View>
        </Animated.View>

        {/* Milestones */}
        {program.milestones && program.milestones.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(600).delay(500)}
            style={styles.milestonesSection}
          >
            <Text style={styles.sectionTitle}>Milestones</Text>
            {program.milestones.map((milestone, index) => (
              <View
                key={milestone.id}
                style={[
                  styles.milestoneCard,
                  milestone.achieved && styles.milestoneCardAchieved,
                ]}
              >
                <View style={styles.milestoneIcon}>
                  <Ionicons
                    name={milestone.achieved ? 'checkmark-circle' : (milestone.icon as any)}
                    size={28}
                    color={milestone.achieved ? '#10B981' : '#8B5CF6'}
                  />
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneDescription}>
                    {milestone.description}
                  </Text>
                  {milestone.achieved && milestone.achievedAt && (
                    <Text style={styles.milestoneAchievedDate}>
                      Achieved {formatDate(milestone.achievedAt)}
                    </Text>
                  )}
                </View>
                {milestone.achieved ? (
                  <View style={styles.milestoneBadge}>
                    <Ionicons name="trophy" size={16} color="#FCD34D" />
                  </View>
                ) : (
                  <View style={styles.milestoneProgress}>
                    <Text style={styles.milestoneProgressText}>
                      {program.totalReferrals}/{milestone.count}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </Animated.View>
        )}

        {/* Referral History */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(600)}
          style={styles.historySection}
        >
          <Text style={styles.sectionTitle}>Referral History</Text>
          {referrals.length > 0 ? (
            referrals.map((referral, index) => {
              const badge = getStatusBadge(referral.status);
              return (
                <View key={referral.id} style={styles.referralCard}>
                  <View style={styles.referralAvatar}>
                    <Text style={styles.referralAvatarText}>
                      {referral.refereeName
                        ? referral.refereeName
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                        : '?'}
                    </Text>
                  </View>
                  <View style={styles.referralContent}>
                    <Text style={styles.referralName}>
                      {referral.refereeName || referral.refereeEmail || 'Pending'}
                    </Text>
                    <Text style={styles.referralDate}>
                      Referred {formatDate(referral.createdAt)}
                    </Text>
                    {referral.firstAppointmentDate && (
                      <Text style={styles.referralAppointment}>
                        First visit: {formatDate(referral.firstAppointmentDate)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.referralStatus}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: badge.bg },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: badge.color }]}>
                        {badge.label}
                      </Text>
                    </View>
                    {referral.status === 'COMPLETED' && (
                      <Text style={styles.referralReward}>
                        +${referral.referrerReward}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyStateTitle}>No referrals yet</Text>
              <Text style={styles.emptyStateText}>
                Start sharing your code to earn rewards!
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Terms */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(700)}
          style={styles.termsSection}
        >
          <Text style={styles.termsTitle}>How it works</Text>
          <View style={styles.termItem}>
            <Ionicons name="share-social" size={20} color="#8B5CF6" />
            <Text style={styles.termText}>
              Share your unique referral code with friends
            </Text>
          </View>
          <View style={styles.termItem}>
            <Ionicons name="person-add" size={20} color="#8B5CF6" />
            <Text style={styles.termText}>
              They sign up and book their first service ($50 minimum)
            </Text>
          </View>
          <View style={styles.termItem}>
            <Ionicons name="gift" size={20} color="#8B5CF6" />
            <Text style={styles.termText}>
              You both get $25 in account credits!
            </Text>
          </View>

          <TouchableOpacity style={styles.termsLink}>
            <Text style={styles.termsLinkText}>View full terms & conditions</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Share Modal */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        referralCode={program.referralCode}
        shareUrl={program.shareUrl}
        onShare={handleShare}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecor1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    marginBottom: 20,
  },
  rewardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rewardBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  rewardPlus: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  codeSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  codeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 2,
  },
  copyCodeButton: {
    padding: 8,
  },
  copiedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10B981',
    marginTop: 12,
    textAlign: 'center',
  },
  shareSection: {
    marginBottom: 32,
  },
  primaryShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryShareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickShareButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickShareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickShareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  milestonesSection: {
    marginBottom: 32,
  },
  milestoneCard: {
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
  milestoneCardAchieved: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  milestoneAchievedDate: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '500',
  },
  milestoneBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneProgress: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  milestoneProgressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  historySection: {
    marginBottom: 32,
  },
  referralCard: {
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
  referralAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  referralAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  referralContent: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  referralDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  referralAppointment: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 2,
  },
  referralStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  referralReward: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  termsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  termText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  termsLink: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  termsLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center',
  },
});
