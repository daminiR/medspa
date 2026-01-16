/**
 * Form History Screen
 *
 * Displays previously submitted forms with the ability
 * to view details and download PDF copies.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formService } from '@/services/forms/formService';
import type { FormSubmission, FormCategory } from '@medical-spa/types';

// Category filter options
const CATEGORY_OPTIONS: { value: FormCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Forms' },
  { value: 'medical-intake', label: 'Medical Intake' },
  { value: 'consent', label: 'Consent Forms' },
  { value: 'hipaa', label: 'HIPAA' },
  { value: 'photography-release', label: 'Photo Release' },
  { value: 'payment-authorization', label: 'Payment Auth' },
];

export default function FormHistoryScreen() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FormCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setError(null);
      const response = await formService.getFormHistory('current-patient-id');
      setSubmissions(response.submissions);
    } catch (err) {
      setError('Failed to load form history.');
      console.error('Error loading form history:', err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadHistory();
      setIsLoading(false);
    };
    load();
  }, [loadHistory]);

  // Filter submissions by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredSubmissions(submissions);
    } else {
      // In a real app, you would have form metadata with categories
      setFilteredSubmissions(submissions);
    }
  }, [submissions, selectedCategory]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadHistory();
    setIsRefreshing(false);
  }, [loadHistory]);

  const handleViewPDF = useCallback((submission: FormSubmission) => {
    if (submission.pdfUrl) {
      // In a real app, open PDF viewer or browser
      Alert.alert('PDF Available', 'PDF would open: ' + submission.pdfUrl);
    } else {
      Alert.alert('PDF Not Available', 'PDF has not been generated for this submission.');
    }
  }, []);

  const handleDownloadPDF = useCallback(async (submission: FormSubmission) => {
    try {
      // In a real app, download the PDF
      Alert.alert('Download Started', 'Your PDF is being downloaded...');
    } catch (err) {
      Alert.alert('Download Failed', 'Failed to download PDF. Please try again.');
    }
  }, []);

  // Group submissions by month
  const groupedSubmissions = React.useMemo(() => {
    const groups: { [key: string]: FormSubmission[] } = {};
    
    filteredSubmissions.forEach((submission) => {
      const date = new Date(submission.submittedAt || submission.startedAt);
      const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(submission);
    });

    return Object.entries(groups).sort((a, b) => {
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  }, [filteredSubmissions]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORY_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterChip,
              selectedCategory === option.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(option.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === option.value && styles.filterChipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Submissions List */}
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
          </View>
        )}

        {!error && filteredSubmissions.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Form History</Text>
            <Text style={styles.emptyText}>
              Your submitted forms will appear here.
            </Text>
          </View>
        )}

        {groupedSubmissions.map(([month, monthSubmissions]) => (
          <View key={month} style={styles.monthGroup}>
            <Text style={styles.monthTitle}>{month}</Text>
            {monthSubmissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                onViewPDF={() => handleViewPDF(submission)}
                onDownload={() => handleDownloadPDF(submission)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Submission Card Component
interface SubmissionCardProps {
  submission: FormSubmission;
  onViewPDF: () => void;
  onDownload: () => void;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({
  submission,
  onViewPDF,
  onDownload,
}) => {
  // Get form details from mock data
  const formDetails = formService.getFormDetailsSync(submission.formId);
  const submittedDate = new Date(submission.submittedAt || submission.startedAt);

  return (
    <View style={styles.submissionCard}>
      <View style={styles.submissionHeader}>
        <View style={styles.submissionIcon}>
          <Ionicons name="document-text" size={20} color="#8B5CF6" />
        </View>
        <View style={styles.submissionInfo}>
          <Text style={styles.submissionTitle}>
            {formDetails?.name || 'Form'}
          </Text>
          <Text style={styles.submissionDate}>
            Submitted {submittedDate.toLocaleDateString()} at{' '}
            {submittedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
          <Text style={styles.statusText}>Completed</Text>
        </View>
      </View>

      {/* Signatures Info */}
      {submission.signatures.length > 0 && (
        <View style={styles.signatureInfo}>
          <Ionicons name="create-outline" size={14} color="#6B7280" />
          <Text style={styles.signatureText}>
            Signed on {new Date(submission.signatures[0].signedAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.submissionActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onViewPDF}
          accessibilityLabel="View PDF"
        >
          <Ionicons name="eye-outline" size={18} color="#6B7280" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onDownload}
          accessibilityLabel="Download PDF"
        >
          <Ionicons name="download-outline" size={18} color="#6B7280" />
          <Text style={styles.actionButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  filterContainer: {
    maxHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
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
  monthGroup: {
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  submissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  submissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  submissionInfo: {
    flex: 1,
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  submissionDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22C55E',
  },
  signatureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  signatureText: {
    fontSize: 13,
    color: '#6B7280',
  },
  submissionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
});
