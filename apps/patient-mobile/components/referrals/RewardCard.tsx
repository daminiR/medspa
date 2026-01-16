import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Reward {
  id: string;
  title: string;
  description: string;
  amount: number;
  code: string;
  type: 'credit' | 'discount' | 'service';
  expiresAt: Date;
  status: 'active' | 'redeemed' | 'expired';
  redeemedAt?: Date;
}

interface RewardCardProps {
  reward: Reward;
  onRedeem: () => void;
}

export default function RewardCard({ reward, onRedeem }: RewardCardProps) {
  const isActive = reward.status === 'active';
  const isExpiringSoon = isActive && new Date(reward.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTypeIcon = () => {
    switch (reward.type) {
      case 'credit':
        return 'wallet';
      case 'discount':
        return 'pricetag';
      case 'service':
        return 'sparkles';
      default:
        return 'gift';
    }
  };

  const getTypeColor = () => {
    switch (reward.type) {
      case 'credit':
        return '#8B5CF6';
      case 'discount':
        return '#F59E0B';
      case 'service':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  if (!isActive) {
    return (
      <View style={[styles.card, styles.cardInactive]}>
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={getTypeIcon() as any} size={24} color="#9CA3AF" />
          </View>
          <View style={styles.content}>
            <Text style={styles.titleInactive}>{reward.title}</Text>
            <Text style={styles.descriptionInactive}>{reward.description}</Text>
            {reward.redeemedAt && (
              <Text style={styles.redeemedText}>
                Redeemed {formatDate(reward.redeemedAt)}
              </Text>
            )}
          </View>
          <View style={styles.amountContainerInactive}>
            <Text style={styles.amountInactive}>${reward.amount}</Text>
          </View>
        </View>
      </View>
    );
  }

  const typeColor = getTypeColor();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onRedeem}
    >
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF']}
        style={styles.cardGradient}
      >
        {isExpiringSoon && (
          <View style={styles.urgentBadge}>
            <Ionicons name="time" size={12} color="#F59E0B" />
            <Text style={styles.urgentText}>Expiring Soon</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: typeColor + '15' }]}>
            <Ionicons name={getTypeIcon() as any} size={24} color={typeColor} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{reward.title}</Text>
            <Text style={styles.description}>{reward.description}</Text>
            <View style={styles.footer}>
              <View style={styles.codeContainer}>
                <Ionicons name="ticket" size={14} color="#6B7280" />
                <Text style={styles.code}>{reward.code}</Text>
              </View>
              <Text style={styles.expires}>
                Expires {formatDate(reward.expiresAt)}
              </Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Value</Text>
            <Text style={styles.amount}>${reward.amount}</Text>
            <View style={styles.redeemButton}>
              <Text style={styles.redeemButtonText}>Use</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  urgentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  titleInactive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  descriptionInactive: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
    lineHeight: 18,
  },
  footer: {
    gap: 6,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  code: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  expires: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  redeemedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountContainerInactive: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  amountInactive: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  redeemButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  redeemButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
