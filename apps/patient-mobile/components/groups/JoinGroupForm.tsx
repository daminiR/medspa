import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupBooking } from '@medical-spa/types';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

const AVAILABLE_SERVICES: Service[] = [
  { id: 'botox', name: 'Botox', price: 350, duration: 30 },
  { id: 'fillers', name: 'Dermal Fillers', price: 550, duration: 45 },
  { id: 'hydrafacial', name: 'HydraFacial', price: 200, duration: 60 },
  { id: 'microneedling', name: 'Microneedling', price: 350, duration: 45 },
  { id: 'chemical-peel', name: 'Chemical Peel', price: 150, duration: 30 },
  { id: 'lip-filler', name: 'Lip Filler', price: 450, duration: 30 },
];

interface JoinGroupFormProps {
  group: GroupBooking | null;
  isLoading: boolean;
  error: string | null;
  onJoin: (serviceId: string, notes?: string) => void;
}

export default function JoinGroupForm({ group, isLoading, error, onJoin }: JoinGroupFormProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');

  const handleJoin = () => {
    if (selectedService) {
      onJoin(selectedService, specialRequests.trim() || undefined);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDiscountText = () => {
    if (!group) return '';
    if (group.discountPercent > 0) {
      return `${group.discountPercent}% group discount applied`;
    }
    return 'No group discount yet';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading group details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
        </View>
        <Text style={styles.errorTitle}>Unable to Join Group</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Ionicons name="help-circle" size={48} color="#9CA3AF" />
        </View>
        <Text style={styles.errorTitle}>Group Not Found</Text>
        <Text style={styles.errorText}>
          This booking code is invalid or has expired.
        </Text>
      </View>
    );
  }

  const isGroupFull = group.maxParticipants && group.participants.length >= group.maxParticipants;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Group Info Card */}
      <View style={styles.groupCard}>
        <View style={styles.groupHeader}>
          <Ionicons name="people" size={24} color="#8B5CF6" />
          <Text style={styles.groupName}>{group.name}</Text>
        </View>

        <View style={styles.groupDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{formatDate(group.date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              Coordinator: {group.coordinatorName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {group.participants.length} members
              {group.maxParticipants && ` (max ${group.maxParticipants})`}
            </Text>
          </View>

          {group.discountPercent > 0 && (
            <View style={styles.discountBanner}>
              <Ionicons name="pricetag" size={16} color="#10B981" />
              <Text style={styles.discountText}>{getDiscountText()}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Group Full Warning */}
      {isGroupFull && (
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={20} color="#F59E0B" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Group is Full</Text>
            <Text style={styles.warningText}>
              This group has reached its maximum capacity. Contact the coordinator for assistance.
            </Text>
          </View>
        </View>
      )}

      {/* Service Selection */}
      {!isGroupFull && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Your Service</Text>
            <Text style={styles.sectionSubtitle}>
              Choose the treatment you&apos;d like to book
            </Text>

            <View style={styles.serviceGrid}>
              {AVAILABLE_SERVICES.map((service) => {
                const isSelected = selectedService === service.id;
                return (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceCard,
                      isSelected && styles.serviceCardSelected,
                    ]}
                    onPress={() => setSelectedService(service.id)}
                  >
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
                      </View>
                    )}
                    <Text style={[styles.serviceName, isSelected && styles.serviceNameSelected]}>
                      {service.name}
                    </Text>
                    <Text style={[styles.servicePrice, isSelected && styles.servicePriceSelected]}>
                      ${service.price}
                    </Text>
                    <View style={styles.serviceMeta}>
                      <Ionicons
                        name="time-outline"
                        size={12}
                        color={isSelected ? '#8B5CF6' : '#9CA3AF'}
                      />
                      <Text
                        style={[styles.serviceDuration, isSelected && styles.serviceDurationSelected]}
                      >
                        {service.duration} min
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Special Requests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Any preferences or special requirements?"
              placeholderTextColor="#9CA3AF"
              value={specialRequests}
              onChangeText={setSpecialRequests}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.charCount}>{specialRequests.length}/200</Text>
          </View>

          {/* Join Button */}
          <TouchableOpacity
            style={[styles.joinButton, !selectedService && styles.joinButtonDisabled]}
            onPress={handleJoin}
            disabled={!selectedService}
          >
            <Text style={styles.joinButtonText}>Join Group</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.infoNoteText}>
              You&apos;ll be added to the group and can coordinate with other members before your appointment.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  groupDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  discountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  serviceCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceNameSelected: {
    color: '#8B5CF6',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  servicePriceSelected: {
    color: '#8B5CF6',
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDuration: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  serviceDurationSelected: {
    color: '#8B5CF6',
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  charCount: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  joinButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
});
