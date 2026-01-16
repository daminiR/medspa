# TimelineConfigurator - Implementation Guide

## Quick Start

### Installation
The component is already part of the project. No additional dependencies needed beyond what's in `package.json`.

### Basic Import

```tsx
import { TimelineConfigurator } from '@/app/settings/automated-messages/components';
// or
import TimelineConfigurator from '@/app/settings/automated-messages/components/TimelineConfigurator';
```

### Minimal Example

```tsx
'use client';

import { useState } from 'react';
import { TimelineConfigurator, ReminderPoint } from '@/app/settings/automated-messages/components';

export default function MyPage() {
  const [reminders, setReminders] = useState<ReminderPoint[]>([
    {
      id: '1',
      timing: { value: 1, unit: 'days' },
      enabled: true,
      messageType: 'reminder',
    },
  ]);

  return <TimelineConfigurator reminders={reminders} />;
}
```

## Full Implementation

### Complete Example with All Features

```tsx
'use client';

import { useState } from 'react';
import {
  TimelineConfigurator,
  ReminderPoint,
  MessageType,
  TimeUnit,
  validateTiming,
  findDuplicateTimings,
  DEFAULT_REMINDER_FLOWS,
} from '@/app/settings/automated-messages/components';

export default function AutomatedMessagesPage() {
  // State
  const [reminders, setReminders] = useState<ReminderPoint[]>(
    DEFAULT_REMINDER_FLOWS.medspa.reminders || []
  );

  // Add new reminder
  const handleAddReminder = () => {
    const newReminder: ReminderPoint = {
      id: `reminder-${Date.now()}`,
      timing: { value: 1, unit: 'days' },
      enabled: true,
      messageType: 'reminder',
      label: 'New Reminder',
    };

    // Validate before adding
    const validation = validateTiming(newReminder.timing);
    if (validation) {
      alert(validation);
      return;
    }

    setReminders([...reminders, newReminder]);
  };

  // Remove reminder
  const handleRemoveReminder = (id: string) => {
    if (confirm('Remove this message?')) {
      setReminders(reminders.filter((r) => r.id !== id));
    }
  };

  // Toggle enabled state
  const handleToggleReminder = (id: string) => {
    setReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  // Update reminder
  const handleUpdateReminder = (id: string, updates: Partial<ReminderPoint>) => {
    // Validate timing if it's being updated
    if (updates.timing) {
      const validation = validateTiming(updates.timing);
      if (validation) {
        alert(validation);
        return;
      }
    }

    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  // Check for duplicates
  const duplicates = findDuplicateTimings(reminders);

  return (
    <div className="p-8">
      {duplicates.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm">
            Warning: You have messages scheduled at the same time. This may cause confusion.
          </p>
        </div>
      )}

      <TimelineConfigurator
        reminders={reminders}
        onAddReminder={handleAddReminder}
        onRemoveReminder={handleRemoveReminder}
        onToggleReminder={handleToggleReminder}
        onUpdateReminder={handleUpdateReminder}
      />

      {/* Save button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => console.log('Saving...', reminders)}
          className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
```

## Integration Patterns

### 1. With Settings Page

```tsx
// src/app/settings/automated-messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { TimelineConfigurator, ReminderPoint } from './components';

export default function AutomatedMessagesSettings() {
  const [reminders, setReminders] = useState<ReminderPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load from API
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings/automated-messages');
        const data = await response.json();
        setReminders(data.reminders || []);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Save to API
  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings/automated-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminders }),
      });
      alert('Settings saved!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Automated Messages</h1>

        <TimelineConfigurator
          reminders={reminders}
          onAddReminder={() => {/* ... */}}
          onRemoveReminder={(id) => {/* ... */}}
          onToggleReminder={(id) => {/* ... */}}
        />

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 2. With Service-Specific Flows

```tsx
// Different message flows for different service types
const [selectedService, setSelectedService] = useState('botox');
const [remindersByService, setRemindersByService] = useState({
  botox: [...DEFAULT_REMINDER_FLOWS.medspa.reminders],
  facial: [...DEFAULT_REMINDER_FLOWS.basic.reminders],
  laser: [...DEFAULT_REMINDER_FLOWS.medspa.reminders],
});

return (
  <>
    {/* Service selector */}
    <div className="mb-6">
      <select
        value={selectedService}
        onChange={(e) => setSelectedService(e.target.value)}
        className="border rounded-lg px-4 py-2"
      >
        <option value="botox">Botox</option>
        <option value="facial">Facials</option>
        <option value="laser">Laser Treatments</option>
      </select>
    </div>

    {/* Timeline for selected service */}
    <TimelineConfigurator
      reminders={remindersByService[selectedService]}
      onUpdateReminder={(id, updates) => {
        setRemindersByService({
          ...remindersByService,
          [selectedService]: remindersByService[selectedService].map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        });
      }}
    />
  </>
);
```

### 3. With Template Presets

```tsx
import { DEFAULT_REMINDER_FLOWS } from '@/app/settings/automated-messages/components';

function TemplateSelector() {
  const [reminders, setReminders] = useState<ReminderPoint[]>([]);

  const loadTemplate = (templateKey: keyof typeof DEFAULT_REMINDER_FLOWS) => {
    const template = DEFAULT_REMINDER_FLOWS[templateKey];
    if (template.reminders) {
      setReminders(template.reminders);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => loadTemplate('basic')}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Basic Flow
        </button>
        <button
          onClick={() => loadTemplate('medspa')}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Medical Spa Flow
        </button>
        <button
          onClick={() => loadTemplate('minimal')}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Minimal Flow
        </button>
      </div>

      {/* Timeline */}
      <TimelineConfigurator reminders={reminders} />
    </div>
  );
}
```

## API Integration

### Sample API Route

```typescript
// app/api/settings/automated-messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ReminderPoint } from '@/app/settings/automated-messages/components/types';

// GET - Load settings
export async function GET(request: NextRequest) {
  try {
    // Load from database
    const settings = await db.automatedMessages.findFirst();

    return NextResponse.json({
      success: true,
      reminders: settings?.reminders || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

// POST - Save settings
export async function POST(request: NextRequest) {
  try {
    const { reminders } = await request.json();

    // Validate
    if (!Array.isArray(reminders)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reminders format' },
        { status: 400 }
      );
    }

    // Save to database
    await db.automatedMessages.upsert({
      where: { id: 'default' },
      create: { reminders },
      update: { reminders },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
```

## Testing

### Unit Test Example

```typescript
// __tests__/TimelineConfigurator.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import TimelineConfigurator from '@/app/settings/automated-messages/components/TimelineConfigurator';
import { ReminderPoint } from '@/app/settings/automated-messages/components/types';

describe('TimelineConfigurator', () => {
  const mockReminders: ReminderPoint[] = [
    {
      id: '1',
      timing: { value: 7, unit: 'days' },
      enabled: true,
      messageType: 'confirmation',
    },
  ];

  it('renders reminders correctly', () => {
    render(<TimelineConfigurator reminders={mockReminders} />);
    expect(screen.getByText(/7 days before/i)).toBeInTheDocument();
  });

  it('calls onToggleReminder when toggle clicked', () => {
    const handleToggle = jest.fn();
    render(
      <TimelineConfigurator
        reminders={mockReminders}
        onToggleReminder={handleToggle}
      />
    );

    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);
    expect(handleToggle).toHaveBeenCalledWith('1');
  });

  it('shows empty state when no reminders', () => {
    render(<TimelineConfigurator reminders={[]} />);
    expect(screen.getByText(/No messages configured/i)).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

**1. Component not displaying**
- Check that reminders array is not undefined
- Ensure parent has appropriate width
- Verify lucide-react icons are installed

**2. Sorting not working**
- Reminders are automatically sorted by timing
- No manual sorting needed
- Check timing values are valid numbers

**3. Toggle not working**
- Ensure `onToggleReminder` callback is provided
- Check that state is being updated correctly
- Verify event handlers are not being prevented

**4. Styling issues**
- Component uses Tailwind CSS
- Ensure Tailwind is configured in your project
- Check that parent doesn't have conflicting styles

## Performance

The component is optimized for:
- Up to 20 reminder points (typical use case)
- Automatic memoization of sorted reminders
- Minimal re-renders

For very large lists (>50 items), consider implementing virtualization.

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Accessibility

- Keyboard navigation: ✅ Supported
- Screen readers: ✅ ARIA labels present
- Focus management: ✅ Clear focus states
- Color contrast: ✅ WCAG AA compliant

## Files Reference

```
src/app/settings/automated-messages/components/
├── TimelineConfigurator.tsx       # Main component
├── TimelineConfigurator.example.tsx
├── types.ts                       # Type definitions
├── index.ts                       # Barrel export
├── README.md                      # Usage guide
├── VISUAL_GUIDE.md               # Visual reference
└── IMPLEMENTATION.md             # This file
```
