import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

interface ReferralCardProps {
  onPress: () => void;
  totalEarnings?: number;
  availableCredits?: number;
  referrerReward?: number;
  refereeReward?: number;
}

export default function ReferralCard({
  onPress,
  totalEarnings = 0,
  availableCredits = 0,
  referrerReward = 25,
  refereeReward = 25,
}: ReferralCardProps) {
  return (
    <Animated.View entering={FadeIn.duration(600)}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decorative Elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="gift" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Referral Program</Text>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <View style={styles.rewardRow}>
              <View style={styles.rewardItem}>
                <View style={styles.iconBadge}>
                  <Ionicons name="heart" size={16} color="#EC4899" />
                </View>
                <Text style={styles.rewardLabel}>You Get</Text>
                <Text style={styles.rewardAmount}>${referrerReward}</Text>
              </View>

              <View style={styles.divider}>
                <Ionicons name="add" size={20} color="rgba(255,255,255,0.6)" />
              </View>

              <View style={styles.rewardItem}>
                <View style={styles.iconBadge}>
                  <Ionicons name="people" size={16} color="#10B981" />
                </View>
                <Text style={styles.rewardLabel}>Friend Gets</Text>
                <Text style={styles.rewardAmount}>${refereeReward}</Text>
              </View>
            </View>

            <Text style={styles.subtitle}>
              Per friend who books their first service
            </Text>
          </View>

          {/* Stats */}
          {totalEarnings > 0 && (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="trending-up" size={16} color="#34D399" />
                <Text style={styles.statText}>
                  ${totalEarnings} earned total
                </Text>
              </View>
              {availableCredits > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name="wallet" size={16} color="#FCD34D" />
                  <Text style={styles.statText}>
                    ${availableCredits} available
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* CTA */}
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaText}>Share Your Code</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </View>

          {/* Sparkles */}
          <View style={styles.sparkle1}>
            <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.6)" />
          </View>
          <View style={styles.sparkle2}>
            <Ionicons name="sparkles" size={12} color="rgba(255,255,255,0.4)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    marginBottom: 16,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  rewardItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  rewardAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sparkle1: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 80,
    right: 30,
  },
});
