'use client';

import React, { useState } from 'react';
import TimelineConfigurator, {
  ReminderPoint,
  MessageType,
  TimeUnit,
} from './TimelineConfigurator';

/**
 * Example usage of TimelineConfigurator component
 *
 * This demonstrates how to integrate the timeline configurator
 * into a settings page with full CRUD operations.
 */
export default function TimelineConfiguratorExample() {
  // Example initial state
  const [reminders, setReminders] = useState<ReminderPoint[]>([
    {
      id: '1',
      timing: { value: 7, unit: 'days' },
      enabled: true,
      messageType: 'confirmation',
      label: 'Initial Confirmation',
    },
    {
      id: '2',
      timing: { value: 3, unit: 'days' },
      enabled: true,
      messageType: 'prep_instructions',
      label: 'Pre-Visit Preparation',
    },
    {
      id: '3',
      timing: { value: 1, unit: 'days' },
      enabled: true,
      messageType: 'reminder',
      label: '24-Hour Reminder',
    },
    {
      id: '4',
      timing: { value: 2, unit: 'hours' },
      enabled: false,
      messageType: 'reminder',
      label: '2-Hour Reminder',
    },
  ]);

  // Handler to add a new reminder
  const handleAddReminder = () => {
    const newReminder: ReminderPoint = {
      id: `reminder-${Date.now()}`,
      timing: { value: 1, unit: 'days' },
      enabled: true,
      messageType: 'reminder',
      label: 'New Reminder',
    };
    setReminders([...reminders, newReminder]);
  };

  // Handler to remove a reminder
  const handleRemoveReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  // Handler to toggle reminder enabled state
  const handleToggleReminder = (id: string) => {
    setReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  // Handler to update reminder properties
  const handleUpdateReminder = (id: string, updates: Partial<ReminderPoint>) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Timeline Configurator Example
          </h1>
          <p className="text-gray-600 mt-2">
            This is a demonstration of the TimelineConfigurator component showing
            automated message scheduling before appointments.
          </p>
        </div>

        <TimelineConfigurator
          reminders={reminders}
          onAddReminder={handleAddReminder}
          onRemoveReminder={handleRemoveReminder}
          onToggleReminder={handleToggleReminder}
          onUpdateReminder={handleUpdateReminder}
        />

        {/* State viewer for development */}
        <div className="mt-8 bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Current State (for development)
          </h3>
          <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(reminders, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
