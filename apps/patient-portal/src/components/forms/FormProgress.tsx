'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertCircle } from 'lucide-react';

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
  onSectionPress?: (index: number) => void;
  variant?: 'compact' | 'detailed';
  estimatedMinutes?: number;
}

export const FormProgress: React.FC<FormProgressProps> = ({
  sections,
  currentSectionIndex,
  overallProgress,
  onSectionPress,
  variant = 'compact',
  estimatedMinutes,
}) => {
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Section {currentSectionIndex + 1} of {sections.length}
          </span>
          <span className="font-medium text-purple-600">{Math.round(overallProgress)}% complete</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        {estimatedMinutes && overallProgress < 100 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>About {Math.ceil(estimatedMinutes * (1 - overallProgress / 100))} min remaining</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Form Progress</h3>
        <span className="text-sm font-medium text-purple-600">{Math.round(overallProgress)}%</span>
      </div>
      
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => {
          const isComplete = section.completedFields === section.totalFields && section.totalFields > 0;
          const isActive = index === currentSectionIndex;
          const isPast = index < currentSectionIndex;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionPress?.(index)}
              disabled={!onSectionPress}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                isActive && 'bg-purple-50 border border-purple-200',
                !isActive && 'hover:bg-gray-50',
                !onSectionPress && 'cursor-default'
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0',
                  isComplete && 'bg-green-500 text-white',
                  !isComplete && isActive && 'bg-purple-500 text-white',
                  !isComplete && !isActive && isPast && 'bg-gray-300 text-white',
                  !isComplete && !isActive && !isPast && 'bg-gray-200 text-gray-500',
                  section.hasErrors && 'bg-red-500 text-white'
                )}
              >
                {section.hasErrors ? (
                  <AlertCircle className="w-4 h-4" />
                ) : isComplete ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm truncate',
                    isActive ? 'font-semibold text-purple-700' : 'text-gray-700'
                  )}
                >
                  {section.title}
                </p>
                <p className="text-xs text-gray-500">
                  {section.completedFields}/{section.totalFields} fields
                </p>
              </div>
              {isComplete && !section.hasErrors && (
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {estimatedMinutes && overallProgress < 100 && (
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 pt-2 border-t">
          <Clock className="w-3 h-3" />
          <span>About {Math.ceil(estimatedMinutes * (1 - overallProgress / 100))} min remaining</span>
        </div>
      )}
    </div>
  );
};

export default FormProgress;
