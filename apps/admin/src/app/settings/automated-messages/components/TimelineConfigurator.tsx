'use client';

import React, { useMemo } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Bell,
  CheckCircle2,
  Circle,
} from 'lucide-react';

// Types
export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks';

export type MessageType =
  | 'confirmation'
  | 'reminder'
  | 'prep_instructions'
  | 'follow_up'
  | 'custom';

export interface ReminderTiming {
  value: number;
  unit: TimeUnit;
}

export interface ReminderPoint {
  id: string;
  timing: ReminderTiming;
  enabled: boolean;
  messageType: MessageType;
  label?: string;
}

export interface TimelineConfiguratorProps {
  reminders: ReminderPoint[];
  onAddReminder?: () => void;
  onRemoveReminder?: (id: string) => void;
  onToggleReminder?: (id: string) => void;
  onUpdateReminder?: (id: string, updates: Partial<ReminderPoint>) => void;
  className?: string;
}

// Helper function to convert timing to minutes for sorting
const timingToMinutes = (timing: ReminderTiming): number => {
  const multipliers: Record<TimeUnit, number> = {
    minutes: 1,
    hours: 60,
    days: 60 * 24,
    weeks: 60 * 24 * 7,
  };
  return timing.value * multipliers[timing.unit];
};

// Helper function to format timing display
const formatTiming = (timing: ReminderTiming): string => {
  const { value, unit } = timing;
  if (value === 0) return 'At appointment time';
  if (value === 1) {
    const singularUnit = unit.slice(0, -1); // Remove 's' for singular
    return `1 ${singularUnit} before`;
  }
  return `${value} ${unit} before`;
};

// Message type configurations
const messageTypeConfig: Record<MessageType, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  label: string;
}> = {
  confirmation: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Confirmation',
  },
  reminder: {
    icon: <Bell className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Reminder',
  },
  prep_instructions: {
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Prep Instructions',
  },
  follow_up: {
    icon: <Mail className="h-4 w-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Follow-up',
  },
  custom: {
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'Custom Message',
  },
};

export const TimelineConfigurator: React.FC<TimelineConfiguratorProps> = ({
  reminders,
  onAddReminder,
  onRemoveReminder,
  onToggleReminder,
  onUpdateReminder,
  className = '',
}) => {
  // Sort reminders by timing (furthest to closest)
  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      const aMinutes = timingToMinutes(a.timing);
      const bMinutes = timingToMinutes(b.timing);
      return bMinutes - aMinutes; // Descending order (furthest first)
    });
  }, [reminders]);

  return (
    <div className={`bg-white rounded-xl border shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Message Timeline</h3>
            <p className="text-sm text-gray-500 mt-1">
              Configure when automated messages are sent before appointments
            </p>
          </div>
          {onAddReminder && (
            <button
              onClick={onAddReminder}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Message
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        {sortedReminders.length === 0 ? (
          <div className="text-center py-12">
            <Circle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No messages configured</p>
            {onAddReminder && (
              <button
                onClick={onAddReminder}
                className="mt-4 text-pink-600 hover:text-pink-700 text-sm font-medium"
              >
                Add your first message
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[21px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-pink-500" />

            {/* Timeline points */}
            <div className="space-y-6">
              {sortedReminders.map((reminder, index) => {
                const config = messageTypeConfig[reminder.messageType];
                const isLast = index === sortedReminders.length - 1;

                return (
                  <div key={reminder.id} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={`h-11 w-11 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-all ${
                          reminder.enabled
                            ? `${config.bgColor} ${config.color}`
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {config.icon}
                      </div>
                      {reminder.enabled && (
                        <div className={`absolute -top-0.5 -right-0.5 h-3 w-3 ${config.bgColor} rounded-full border-2 border-white`} />
                      )}
                    </div>

                    {/* Content card */}
                    <div className="flex-1 pb-2">
                      <div
                        className={`rounded-lg border-2 transition-all ${
                          reminder.enabled
                            ? 'border-gray-200 bg-white shadow-sm'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="p-4">
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                    reminder.enabled
                                      ? `${config.bgColor} ${config.color}`
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {config.label}
                                </span>
                                {reminder.enabled && (
                                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 bg-green-600 rounded-full animate-pulse" />
                                    Active
                                  </span>
                                )}
                              </div>
                              <h4 className="font-medium text-gray-900">
                                {reminder.label || config.label}
                              </h4>
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>{formatTiming(reminder.timing)}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {onToggleReminder && (
                                <label
                                  className="relative inline-flex items-center cursor-pointer"
                                  title={reminder.enabled ? 'Disable message' : 'Enable message'}
                                >
                                  <input
                                    type="checkbox"
                                    checked={reminder.enabled}
                                    onChange={() => onToggleReminder(reminder.id)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                                </label>
                              )}
                              {onRemoveReminder && (
                                <button
                                  onClick={() => onRemoveReminder(reminder.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove message"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Appointment marker (at the end of timeline) */}
              <div className="relative flex gap-4">
                {/* Appointment dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="h-11 w-11 rounded-full border-4 border-white bg-pink-600 shadow-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Appointment card */}
                <div className="flex-1">
                  <div className="rounded-lg border-2 border-pink-200 bg-pink-50 shadow-sm">
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-pink-900">Appointment Time</h4>
                      </div>
                      <p className="text-sm text-pink-700 mt-1">
                        Patient arrives for scheduled service
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      {sortedReminders.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t rounded-b-xl">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <span className="text-gray-600">
                <strong>{sortedReminders.filter(r => r.enabled).length}</strong> active messages
              </span>
              <span className="text-gray-600">
                <strong>{sortedReminders.length}</strong> total configured
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Messages are sent via SMS and Email based on patient preferences
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineConfigurator;
