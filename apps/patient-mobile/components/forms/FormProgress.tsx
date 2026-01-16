/**
 * FormProgress Component
 *
 * Visual progress indicator showing form completion status.
 * Supports section-by-section navigation and overall progress.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface FormSectionProgress {
  id: string;
  title: string;
  totalFields: number;
  completedFields: number;
  hasErrors: boolean;
  isActive: boolean;
}

export interface FormProgressProps {
  sections: FormSectionProgress[];
  currentSectionIndex: number;
  overallProgress: number;
  onSectionPress?: (sectionIndex: number) => void;
  showSectionList?: boolean;
  variant?: 'compact' | 'detailed' | 'minimal';
  estimatedMinutes?: number;
  testID?: string;
}

export const FormProgress: React.FC<FormProgressProps> = ({
  sections,
  currentSectionIndex,
  overallProgress,
  onSectionPress,
  showSectionList = true,
  variant = 'compact',
  estimatedMinutes,
  testID,
}) => {
  const progressWidth = useMemo(() => {
    const clamped = Math.min(100, Math.max(0, overallProgress));
    return clamped + '%';
  }, [overallProgress]);

  const getSectionStatus = useCallback(
    (section: FormSectionProgress, index: number): 'completed' | 'active' | 'pending' | 'error' => {
      if (section.hasErrors) return 'error';
      if (section.completedFields === section.totalFields && section.totalFields > 0)
        return 'completed';
      if (index === currentSectionIndex) return 'active';
      return 'pending';
    },
    [currentSectionIndex]
  );

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed':
        return '#22C55E';
      case 'active':
        return '#8B5CF6';
      case 'error':
        return '#EF4444';
      default:
        return '#D1D5DB';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'active':
        return 'ellipse';
      case 'error':
        return 'alert-circle';
      default:
        return 'ellipse-outline';
    }
  }, []);

  const completedSections = useMemo(() => {
    return sections.filter(
      (s) => s.completedFields === s.totalFields && s.totalFields > 0
    ).length;
  }, [sections]);

  if (variant === 'minimal') {
    return (
      <View style={styles.minimalContainer} testID={testID}>
        <View style={styles.minimalProgressBar}>
          <Animated.View
            style={[
              styles.minimalProgressFill,
              { width: progressWidth as any },
            ]}
          />
        </View>
        <Text style={styles.minimalText}>{Math.round(overallProgress)}%</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {/* Overall Progress */}
      <View style={styles.overallProgressContainer}>
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Form Progress</Text>
            <Text style={styles.progressSubtitle}>
              {completedSections} of {sections.length} sections complete
            </Text>
          </View>
          <View style={styles.progressPercentage}>
            <Text style={styles.percentageText}>{Math.round(overallProgress)}%</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth as any }]}
            />
          </View>
        </View>

        {estimatedMinutes !== undefined && overallProgress < 100 && (
          <View style={styles.estimateContainer}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.estimateText}>
              ~{Math.max(1, Math.round(estimatedMinutes * (1 - overallProgress / 100)))} min remaining
            </Text>
          </View>
        )}
      </View>

      {/* Section List */}
      {showSectionList && variant === 'detailed' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sectionList}
          contentContainerStyle={styles.sectionListContent}
        >
          {sections.map((section, index) => {
            const status = getSectionStatus(section, index);
            const statusColor = getStatusColor(status);
            const isClickable = onSectionPress !== undefined;

            return (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.sectionItem,
                  status === 'active' && styles.sectionItemActive,
                  status === 'completed' && styles.sectionItemCompleted,
                  status === 'error' && styles.sectionItemError,
                ]}
                onPress={() => isClickable && onSectionPress?.(index)}
                disabled={!isClickable}
                accessibilityLabel={section.title + ', ' + status}
                accessibilityRole="button"
              >
                <View style={styles.sectionIconContainer}>
                  <Ionicons
                    name={getStatusIcon(status) as any}
                    size={20}
                    color={statusColor}
                  />
                  {status === 'active' && (
                    <View style={[styles.activeIndicator, { backgroundColor: statusColor }]} />
                  )}
                </View>

                <View style={styles.sectionInfo}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      status === 'active' && styles.sectionTitleActive,
                      status === 'completed' && styles.sectionTitleCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {section.title}
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    {section.completedFields}/{section.totalFields} fields
                  </Text>
                </View>

                {/* Mini progress for each section */}
                <View style={styles.sectionProgress}>
                  <View
                    style={[
                      styles.sectionProgressFill,
                      {
                        width: ((section.completedFields / Math.max(1, section.totalFields)) * 100) + '%',
                        backgroundColor: statusColor,
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Compact Section Dots */}
      {showSectionList && variant === 'compact' && (
        <View style={styles.dotsContainer}>
          {sections.map((section, index) => {
            const status = getSectionStatus(section, index);
            const statusColor = getStatusColor(status);

            return (
              <TouchableOpacity
                key={section.id}
                style={styles.dotWrapper}
                onPress={() => onSectionPress?.(index)}
                disabled={!onSectionPress}
                accessibilityLabel={'Section ' + (index + 1) + ': ' + section.title}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: statusColor },
                    status === 'active' && styles.dotActive,
                  ]}
                />
                {index < sections.length - 1 && (
                  <View
                    style={[
                      styles.dotConnector,
                      status === 'completed' && styles.dotConnectorComplete,
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  minimalProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  minimalProgressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  minimalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 36,
    textAlign: 'right',
  },
  overallProgressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  progressSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressPercentage: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  estimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  estimateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionList: {
    marginTop: 4,
  },
  sectionListContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  sectionItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionItemActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#8B5CF6',
  },
  sectionItemCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#22C55E',
  },
  sectionItemError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  sectionIconContainer: {
    marginBottom: 8,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionInfo: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 2,
  },
  sectionTitleActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  sectionTitleCompleted: {
    color: '#16A34A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sectionProgress: {
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sectionProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  dotWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotConnector: {
    width: 24,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  dotConnectorComplete: {
    backgroundColor: '#22C55E',
  },
});

export default FormProgress;
