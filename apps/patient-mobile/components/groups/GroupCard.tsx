import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GroupBooking } from '@medical-spa/types';

const { width } = Dimensions.get('window');

interface GroupCardProps {
  group: GroupBooking;
  currentPatientId: string;
}

export default function GroupCard({ group, currentPatientId }: GroupCardProps) {
  const isCoordinator = group.coordinatorPatientId === currentPatientId;
  const confirmedCount = group.participants.filter(p => p.status === 'confirmed').length;
  const totalCount = group.participants.length;
  const hasDiscount = group.discountPercent > 0;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getEventTypeIcon = () => {
    switch (group.eventType) {
      case 'bridal':
        return 'flower';
      case 'corporate':
        return 'briefcase';
      case 'friends':
        return 'people';
      case 'family':
        return 'home';
      default:
        return 'people-circle';
    }
  };

  const getEventTypeColor = () => {
    switch (group.eventType) {
      case 'bridal':
        return ['#FDF2F8', '#FCE7F3'];
      case 'corporate':
        return ['#EFF6FF', '#DBEAFE'];
      case 'friends':
        return ['#F0FDF4', '#DCFCE7'];
      case 'family':
        return ['#FEF3C7', '#FDE68A'];
      default:
        return ['#F3F4F6', '#E5E7EB'];
    }
  };

  const getStatusColor = () => {
    switch (group.status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'partially_confirmed':
        return '#3B82F6';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (group.status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'partially_confirmed':
        return 'Partial';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/groups/${group.id}` as any)}
      activeOpacity={0.7}
    >
      {/* Event Type Banner */}
      <LinearGradient
        colors={getEventTypeColor()}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.eventTypeIcon}>
              <Ionicons name={getEventTypeIcon() as any} size={20} color="#8B5CF6" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.groupName} numberOfLines={1}>
                {group.name}
              </Text>
              <Text style={styles.eventDate}>{formatDate(group.date)}</Text>
            </View>
          </View>

          {isCoordinator && (
            <View style={styles.coordinatorBadge}>
              <Ionicons name="star" size={14} color="#FCD34D" />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Card Body */}
      <View style={styles.body}>
        {/* Participants Row */}
        <View style={styles.row}>
          <View style={styles.iconLabel}>
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text style={styles.label}>
              {confirmedCount}/{totalCount} confirmed
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Booking Code */}
        <View style={styles.row}>
          <View style={styles.iconLabel}>
            <Ionicons name="key-outline" size={16} color="#6B7280" />
            <Text style={styles.codeText}>{group.bookingCode}</Text>
          </View>

          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Ionicons name="pricetag" size={14} color="#10B981" />
              <Text style={styles.discountText}>{group.discountPercent}% off</Text>
            </View>
          )}
        </View>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Total Price</Text>
            {hasDiscount ? (
              <View style={styles.priceContainer}>
                <Text style={styles.originalPrice}>${group.totalOriginalPrice}</Text>
                <Text style={styles.discountedPrice}>${group.totalDiscountedPrice}</Text>
              </View>
            ) : (
              <Text style={styles.price}>${group.totalOriginalPrice}</Text>
            )}
          </View>

          {group.lastMessageAt && (
            <View style={styles.newMessageBadge}>
              <Ionicons name="chatbubble" size={14} color="#8B5CF6" />
            </View>
          )}
        </View>
      </View>

      {/* Chevron */}
      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  coordinatorBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 16,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  codeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 1,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  newMessageBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
});
