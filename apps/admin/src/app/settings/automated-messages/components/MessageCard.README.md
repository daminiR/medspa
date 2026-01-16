# MessageCard Component

A reusable, collapsible card component for displaying automated message configurations in the settings interface.

## Features

- **Collapsible**: Expand/collapse to show/hide configuration content
- **Toggle Switch**: Enable/disable messages with a toggle in the header
- **Channel Indicators**: Display SMS and/or Email channel icons
- **Flexible Content**: Pass any content as children for the expanded state
- **Consistent Styling**: Matches existing Tailwind patterns from the codebase

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | Yes | - | The main title of the message configuration |
| `description` | `string` | Yes | - | Brief description shown in the header |
| `enabled` | `boolean` | Yes | - | Current enabled state of the message |
| `onToggle` | `(enabled: boolean) => void` | Yes | - | Callback when toggle switch is changed |
| `channels` | `{ sms?: boolean; email?: boolean }` | No | `{ sms: true, email: false }` | Which channels are enabled for this message |
| `children` | `React.ReactNode` | No | - | Content to display when card is expanded |
| `defaultExpanded` | `boolean` | No | `false` | Whether card should be expanded by default |

## Usage Example

```tsx
import { MessageCard } from './components/MessageCard';

function AutomatedMessagesPage() {
  const [reminderEnabled, setReminderEnabled] = useState(true);

  return (
    <MessageCard
      title="Appointment Reminder"
      description="Sent 24 hours before appointment"
      enabled={reminderEnabled}
      onToggle={setReminderEnabled}
      channels={{ sms: true, email: false }}
      defaultExpanded={true}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMS Template
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={3}
            defaultValue="Your appointment is tomorrow at {{time}}..."
          />
        </div>
      </div>
    </MessageCard>
  );
}
```

## Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ [▼] Message Title                     [SMS] [Email]  [Toggle]│
│     Brief description                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Expanded content area (children)                           │
│  - Can contain forms, inputs, settings                      │
│  - Only shown when expanded                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Channel Icons

- **SMS**: Blue background with MessageSquare icon
- **Email**: Purple background with Mail icon

Both channels can be enabled simultaneously, or individually.

## Styling

The component uses Tailwind CSS classes and follows the existing pattern established in:
- `/src/components/ui/Card.tsx` - Base card structure
- `/src/app/settings/quick-replies/page.tsx` - Collapsible category pattern
- `/src/app/settings/prep-reminders/page.tsx` - Treatment card pattern

## State Management

The component manages its own `isExpanded` state internally. The `enabled` state is controlled by the parent component through the `onToggle` callback.

## Accessibility

- Toggle switch has proper `aria-label` for screen readers
- Expand/collapse button has descriptive labels
- Channel indicators have `title` tooltips
