/**
 * Forms List Screen
 *
 * Displays all available forms for the patient to complete,
 * organized by status (pending, in-progress, completed).
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formService } from '@/services/forms/formService';
import type { FormAssignment, PatientFormRequirements } from '@medical-spa/types';

type TabType = 'pending' | 'completed';

export default function FormsListScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [requirements, setRequirements] = useState<PatientFormRequirements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadForms = useCallback(async () => {
    try {
      setError(null);
      const data = await formService.getPatientFormRequirements('current-patient-id');
      setRequirements(data);
    } catch (err) {
      setError('Failed to load forms. Please try again.');
      console.error('Error loading forms:', err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadForms();
      setIsLoading(false);
    };
    load();
  }, [loadForms]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadForms();
    setIsRefreshing(false);
  }, [loadForms]);

  const handleFormPress = useCallback((form: FormAssignment) => {
    router.push('/forms/' + form.formId);
  }, [router]);

  const handleHistoryPress = useCallback(() => {
    router.push('/forms/history');
  }, [router]);

  const pendingForms = useMemo(() => {
    if (!requirements) return [];
    return [...requirements.requiredForms, ...requirements.optionalForms]
      .filter((f) => f.status === 'pending' || f.status === 'in_progress');
  }, [requirements]);

  const completedForms = useMemo(() => {
    if (!requirements) return [];
    return requirements.completedForms;
  }, [requirements]);

  const displayedForms = activeTab === 'pending' ? pendingForms : completedForms;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading forms...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header Stats */}
      {requirements && (
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{requirements.totalCompleted}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{requirements.totalRequired - requirements.totalCompleted}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.statValuePrimary]}>
                  {Math.round(requirements.completionPercentage)}%
                </Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${requirements.completionPercentage}%` },
                ]}
              />
            </View>

            {/* Upcoming Appointment */}
            {requirements.upcomingAppointment && (
              <View style={styles.appointmentInfo}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.appointmentText}>
                  {requirements.allRequiredComplete
                    ? 'All forms complete for your appointment'
                    : 'Complete forms before ' + new Date(requirements.upcomingAppointment.date).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending ({pendingForms.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed ({completedForms.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.historyButton} onPress={handleHistoryPress}>
          <Ionicons name="time-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Forms List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#8B5CF6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && displayedForms.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={activeTab === 'pending' ? 'checkmark-done-circle-outline' : 'document-outline'}
              size={64}
              color="#D1D5DB"
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending' ? 'All caught up!' : 'No completed forms'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'pending'
                ? "You've completed all required forms."
                : 'Completed forms will appear here.'}
            </Text>
          </View>
        )}

        {displayedForms.map((form) => (
          <FormCard
            key={form.id}
            form={form}
            onPress={() => handleFormPress(form)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Form Card Component
interface FormCardProps {
  form: FormAssignment;
  onPress: () => void;
}

const FormCard: React.FC<FormCardProps> = ({ form, onPress }) => {
  const statusConfig = useMemo(() => {
    switch (form.status) {
      case 'pending':
        return {
          color: '#F59E0B',
          bgColor: '#FFFBEB',
          icon: 'document-outline' as const,
          label: 'Not Started',
        };
      case 'in_progress':
        return {
          color: '#8B5CF6',
          bgColor: '#F3E8FF',
          icon: 'create-outline' as const,
          label: 'In Progress',
        };
      case 'completed':
        return {
          color: '#22C55E',
          bgColor: '#F0FDF4',
          icon: 'checkmark-circle' as const,
          label: 'Completed',
        };
      default:
        return {
          color: '#6B7280',
          bgColor: '#F3F4F6',
          icon: 'document-outline' as const,
          label: form.status,
        };
    }
  }, [form.status]);

  const priorityConfig = useMemo(() => {
    switch (form.priority) {
      case 'critical':
        return { color: '#EF4444', label: 'Required' };
      case 'high':
        return { color: '#F59E0B', label: 'Important' };
      default:
        return null;
    }
  }, [form.priority]);

  // Get form details from mock data
  const formDetails = formService.getFormDetailsSync(form.formId);

  return (
    <TouchableOpacity
      style={styles.formCard}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={'Open ' + (formDetails?.name || 'form')}
    >
      {/* Icon */}
      <View style={[styles.formIcon, { backgroundColor: statusConfig.bgColor }]}>
        <Ionicons name={statusConfig.icon} size={24} color={statusConfig.color} />
      </View>

      {/* Content */}
      <View style={styles.formContent}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle} numberOfLines={1}>
            {formDetails?.name || 'Form'}
          </Text>
          {priorityConfig && (
            <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
                {priorityConfig.label}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.formDescription} numberOfLines={2}>
          {formDetails?.description || 'Please complete this form'}
        </Text>

        <View style={styles.formMeta}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>

          {formDetails?.schema?.metadata?.estimatedMinutes && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#9CA3AF" />
              <Text style={styles.metaText}>
                ~{formDetails.schema.metadata.estimatedMinutes} min
              </Text>
            </View>
          )}

          {form.dueDate && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
              <Text style={styles.metaText}>
                Due {new Date(form.dueDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  statsContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statValuePrimary: {
    color: '#8B5CF6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  appointmentText: {
    fontSize: 13,
    color: '#6B7280',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  historyButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  formCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  formIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formContent: {
    flex: 1,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  formDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  formMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
