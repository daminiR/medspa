# TimelineConfigurator Component

A visual timeline component for displaying and managing automated message flows before appointments.

## Overview

The `TimelineConfigurator` component provides an intuitive visual representation of when automated messages (reminders, confirmations, prep instructions, etc.) are sent before an appointment. It displays a vertical timeline with the appointment at the bottom and all configured messages leading up to it.

## Features

- **Visual Timeline**: Vertical timeline showing message flow from furthest to closest to appointment
- **Multiple Message Types**: Supports confirmation, reminder, prep instructions, follow-up, and custom messages
- **Enable/Disable Toggle**: Each message can be individually enabled or disabled
- **Add/Remove Messages**: Full CRUD support for managing reminder points
- **Automatic Sorting**: Messages are automatically sorted by timing (furthest first)
- **Flexible Timing**: Supports minutes, hours, days, and weeks
- **Tailwind Styling**: Fully styled with Tailwind CSS
- **Lucide Icons**: Uses lucide-react for consistent iconography

## Props

```typescript
interface TimelineConfiguratorProps {
  reminders: ReminderPoint[];
  onAddReminder?: () => void;
  onRemoveReminder?: (id: string) => void;
  onToggleReminder?: (id: string) => void;
  onUpdateReminder?: (id: string, updates: Partial<ReminderPoint>) => void;
  className?: string;
}
```

### ReminderPoint Structure

```typescript
interface ReminderPoint {
  id: string;
  timing: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
  };
  enabled: boolean;
  messageType: 'confirmation' | 'reminder' | 'prep_instructions' | 'follow_up' | 'custom';
  label?: string;
}
```

## Usage

### Basic Example

```tsx
import TimelineConfigurator from '@/app/settings/automated-messages/components/TimelineConfigurator';

function MySettingsPage() {
  const [reminders, setReminders] = useState([
    {
      id: '1',
      timing: { value: 7, unit: 'days' },
      enabled: true,
      messageType: 'confirmation',
      label: 'Initial Confirmation',
    },
    {
      id: '2',
      timing: { value: 1, unit: 'days' },
      enabled: true,
      messageType: 'reminder',
      label: '24-Hour Reminder',
    },
  ]);

  return (
    <TimelineConfigurator
      reminders={reminders}
      onAddReminder={() => {/* Add new reminder */}}
      onRemoveReminder={(id) => {/* Remove reminder */}}
      onToggleReminder={(id) => {/* Toggle enabled state */}}
    />
  );
}
```

### With Full CRUD Operations

```tsx
const handleAddReminder = () => {
  const newReminder = {
    id: `reminder-${Date.now()}`,
    timing: { value: 1, unit: 'days' },
    enabled: true,
    messageType: 'reminder',
    label: 'New Reminder',
  };
  setReminders([...reminders, newReminder]);
};

const handleRemoveReminder = (id: string) => {
  setReminders(reminders.filter((r) => r.id !== id));
};

const handleToggleReminder = (id: string) => {
  setReminders(
    reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    )
  );
};

<TimelineConfigurator
  reminders={reminders}
  onAddReminder={handleAddReminder}
  onRemoveReminder={handleRemoveReminder}
  onToggleReminder={handleToggleReminder}
/>
```

### Read-Only Mode

If you omit the callback props, the component becomes read-only:

```tsx
<TimelineConfigurator reminders={reminders} />
```

## Message Types

The component supports five message types, each with distinct styling:

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `confirmation` | CheckCircle | Green | Booking confirmations |
| `reminder` | Bell | Blue | Appointment reminders |
| `prep_instructions` | MessageSquare | Purple | Pre-visit preparation |
| `follow_up` | Mail | Amber | Post-appointment follow-ups |
| `custom` | MessageSquare | Gray | Custom messages |

## Timing Examples

```typescript
// 7 days before
{ value: 7, unit: 'days' }

// 48 hours before
{ value: 48, unit: 'hours' }

// 2 hours before
{ value: 2, unit: 'hours' }

// Same day (0 value)
{ value: 0, unit: 'days' }
```

## Styling

The component uses a pink color scheme by default (matching the medical spa theme). You can customize via:

1. **Tailwind Classes**: Pass `className` prop to override container styles
2. **Message Type Colors**: Modify `messageTypeConfig` in the source
3. **Timeline Gradient**: Modify the vertical line gradient in the render

## Integration Points

This component is designed to integrate with:

- **Settings Pages**: `/settings/automated-messages`
- **Prep Reminders**: `/settings/prep-reminders`
- **SMS Settings**: `/settings/sms`
- **Notification Preferences**: Patient notification configuration

## Dependencies

- `react` - Component framework
- `lucide-react` - Icons (Plus, Trash2, Calendar, Clock, Mail, MessageSquare, Bell, CheckCircle2, Circle)
- Tailwind CSS - Styling

## File Location

```
/src/app/settings/automated-messages/components/
├── TimelineConfigurator.tsx          # Main component
├── TimelineConfigurator.example.tsx  # Usage example
└── README.md                          # This file
```

## Future Enhancements

Potential improvements for future iterations:

- **Drag & Drop**: Reorder reminders by dragging timeline points
- **Inline Editing**: Edit timing/message type directly in timeline
- **Message Preview**: Show actual message content on hover/click
- **Validation**: Prevent duplicate timings or conflicting messages
- **Templates**: Pre-configured message flows for different service types
- **Analytics**: Show delivery rates and engagement metrics

## See Also

- Prep Reminders Settings: `/src/app/settings/prep-reminders/page.tsx`
- SMS Reminders API: `/src/app/api/sms/reminders/route.ts`
- Notification Types: `/src/types/notifications.ts`
