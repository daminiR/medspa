'use client';

/**
 * FormProgress Component (Web)
 * Visual progress indicator for form completion.
 */

import React, { useMemo } from 'react';

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
}

export const FormProgress: React.FC<FormProgressProps> = ({
  sections,
  currentSectionIndex,
  overallProgress,
  onSectionPress,
  showSectionList = true,
  variant = 'compact',
  estimatedMinutes,
}) => {
  const completedSections = useMemo(() => {
    return sections.filter(
      (s) => s.completedFields === s.totalFields && s.totalFields > 0
    ).length;
  }, [sections]);

  const getSectionStatus = (section: FormSectionProgress, index: number) => {
    if (section.hasErrors) return 'error';
    if (section.completedFields === section.totalFields && section.totalFields > 0) return 'completed';
    if (index === currentSectionIndex) return 'active';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-purple-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: overallProgress + '%' }}
          />
        </div>
        <span className="text-sm font-medium text-gray-600">{Math.round(overallProgress)}%</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Form Progress</h3>
          <p className="text-sm text-gray-500">{completedSections} of {sections.length} sections complete</p>
        </div>
        <div className="bg-purple-100 px-3 py-1 rounded-full">
          <span className="text-sm font-bold text-purple-600">{Math.round(overallProgress)}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-300"
          style={{ width: overallProgress + '%' }}
        />
      </div>

      {/* Time Estimate */}
      {estimatedMinutes !== undefined && overallProgress < 100 && (
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>~{Math.max(1, Math.round(estimatedMinutes * (1 - overallProgress / 100)))} min remaining</span>
        </div>
      )}

      {/* Section Dots */}
      {showSectionList && variant === 'compact' && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {sections.map((section, index) => {
            const status = getSectionStatus(section, index);
            return (
              <button
                key={section.id}
                onClick={() => onSectionPress?.(index)}
                disabled={!onSectionPress}
                className={`relative group ${onSectionPress ? 'cursor-pointer' : ''}`}
                title={section.title}
              >
                <div className={`w-3 h-3 rounded-full transition-all ${getStatusColor(status)} ${status === 'active' ? 'w-4 h-4' : ''}`} />
                {index < sections.length - 1 && (
                  <div className={`absolute top-1/2 left-full w-4 h-0.5 -translate-y-1/2 ${status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FormProgress;
