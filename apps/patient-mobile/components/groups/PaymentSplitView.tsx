import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GroupBooking, GroupBookingParticipant } from '@medical-spa/types';

interface PaymentSplitViewProps {
  group: GroupBooking;
}

export default function PaymentSplitView({ group }: PaymentSplitViewProps) {
  const getPaymentModeLabel = () => {
    switch (group.paymentMode) {
      case 'individual':
        return 'Each person pays individually';
      case 'coordinator':
        return 'Coordinator pays for everyone';
      case 'split':
        return 'Cost split evenly among all';
      default:
        return 'Individual payment';
    }
  };

  const getSplitAmount = () => {
    if (group.paymentMode === 'split') {
      return Math.round(group.totalDiscountedPrice / group.participants.length);
    }
    return 0;
  };

  const paidCount = group.participants.filter(p => p.paymentStatus === 'paid').length;
  const pendingCount = group.participants.filter(p => p.paymentStatus === 'pending').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="wallet" size={20} color="#8B5CF6" />
        <Text style={styles.title}>Payment Breakdown</Text>
      </View>

      {/* Payment Mode */}
      <View style={styles.paymentMode}>
        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
        <Text style={styles.paymentModeText}>{getPaymentModeLabel()}</Text>
      </View>

      {/* Price Summary */}
      <LinearGradient
        colors={['#F5F3FF', '#EDE9FE']}
        style={styles.summaryCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {group.discountPercent > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Original Total</Text>
            <Text style={styles.originalPrice}>${group.totalOriginalPrice}</Text>
          </View>
        )}

        {group.discountPercent > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.discountLabel}>
              <Ionicons name="pricetag" size={14} color="#10B981" />
              <Text style={styles.discountLabelText}>
                Group Discount ({group.discountPercent}%)
              </Text>
            </View>
            <Text style={styles.discountAmount}>-${group.totalDiscountAmount}</Text>
          </View>
        )}

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>${group.totalDiscountedPrice}</Text>
        </View>

        {group.paymentMode === 'split' && (
          <View style={[styles.summaryRow, styles.perPersonRow]}>
            <Text style={styles.perPersonLabel}>Per Person</Text>
            <Text style={styles.perPersonPrice}>${getSplitAmount()}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Payment Status */}
      <View style={styles.statusSection}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusCount}>{paidCount}</Text>
            <Text style={styles.statusLabel}>Paid</Text>
          </View>

          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.statusCount}>{pendingCount}</Text>
            <Text style={styles.statusLabel}>Pending</Text>
          </View>

          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#6B7280' }]} />
            <Text style={styles.statusCount}>{group.participants.length}</Text>
            <Text style={styles.statusLabel}>Total</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(paidCount / group.participants.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {paidCount} of {group.participants.length} participants have paid
        </Text>
      </View>

      {/* Individual Breakdown (if individual payment) */}
      {group.paymentMode === 'individual' && (
        <View style={styles.individualBreakdown}>
          <Text style={styles.breakdownTitle}>Individual Payments</Text>
          {group.participants.map((participant) => (
            <View key={participant.patientId} style={styles.participantPayment}>
              <View style={styles.participantPaymentLeft}>
                <Text style={styles.participantPaymentName} numberOfLines={1}>
                  {participant.patientName}
                </Text>
                <Text style={styles.participantPaymentService}>{participant.serviceName}</Text>
              </View>
              <View style={styles.participantPaymentRight}>
                <Text style={styles.participantPaymentPrice}>${participant.servicePrice}</Text>
                <View
                  style={[
                    styles.participantPaymentStatus,
                    {
                      backgroundColor:
                        participant.paymentStatus === 'paid' ? '#D1FAE5' : '#FEF3C7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.participantPaymentStatusText,
                      {
                        color: participant.paymentStatus === 'paid' ? '#10B981' : '#F59E0B',
                      },
                    ]}
                  >
                    {participant.paymentStatus}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Deposit Info (if applicable) */}
      {group.depositRequired && (
        <View style={styles.depositInfo}>
          <Ionicons
            name={group.depositPaid ? 'checkmark-circle' : 'alert-circle'}
            size={16}
            color={group.depositPaid ? '#10B981' : '#F59E0B'}
          />
          <Text style={styles.depositText}>
            Deposit: ${group.depositAmount} {group.depositPaid ? '(Paid)' : '(Pending)'}
          </Text>
        </View>
      )}
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
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  paymentMode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  paymentModeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discountLabelText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  discountAmount: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  perPersonRow: {
    marginTop: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: -16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  perPersonLabel: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  perPersonPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  statusSection: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  statusCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  individualBreakdown: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  participantPayment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  participantPaymentLeft: {
    flex: 1,
    marginRight: 12,
  },
  participantPaymentName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  participantPaymentService: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  participantPaymentRight: {
    alignItems: 'flex-end',
  },
  participantPaymentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  participantPaymentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  participantPaymentStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  depositInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
  },
  depositText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
});
