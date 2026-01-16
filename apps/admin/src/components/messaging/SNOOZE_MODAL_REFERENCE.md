# SnoozeModal Component Reference

## Overview
A modal component for deferring conversations in the medical spa messaging system, inspired by Intercom's snooze feature.

## File Location
`/Users/daminirijhwani/medical-spa-platform/apps/admin/src/components/messaging/SnoozeModal.tsx`

## Visual Structure

```
┌─────────────────────────────────────────┐
│  Snooze Conversation              [X]   │  ← Header
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🕐  Later today                   │ │  ← Quick Options
│  │     4:30 PM                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🕐  Tomorrow morning              │ │
│  │     Wed, 9:00 AM                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🕐  Tomorrow afternoon            │ │
│  │     Wed, 2:00 PM                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📅  Next week                     │ │
│  │     Mon, Jan 13, 9:00 AM          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🔔  After appointment             │ │  ← Only if nextAppointment provided
│  │     Botox - Mon, Jan 15, 2:00 PM  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Custom date and time                   │
│  ┌────────────┐  ┌──────────────────┐ │  ← Custom Date/Time
│  │ Date       │  │ Time             │ │
│  │ 01/15/2026 │  │ 3:00 PM          │ │
│  └────────────┘  └──────────────────┘ │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ℹ️ Conversation will reopen     │   │  ← Info Box
│  │   automatically when:            │   │
│  │   • The snooze timer expires     │   │
│  │   • The patient sends a message  │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│                    [Cancel]  [Snooze]   │  ← Footer Actions
└─────────────────────────────────────────┘
```

## User Flow

### Scenario 1: Quick Snooze
1. User clicks "Snooze Conversation" button in messages
2. Modal opens showing quick options
3. User clicks "Tomorrow morning"
4. Modal closes immediately
5. Conversation is snoozed until tomorrow at 9 AM

### Scenario 2: Custom Snooze
1. User clicks "Snooze Conversation" button
2. Modal opens
3. User scrolls to custom date/time section
4. User selects date from date picker
5. User selects time from time picker
6. "Snooze" button appears in footer
7. User clicks "Snooze"
8. Modal closes
9. Conversation is snoozed until selected date/time

### Scenario 3: After Appointment
1. User has patient with upcoming appointment
2. Modal opens with "After appointment" option visible
3. User clicks "After appointment"
4. Modal closes
5. Conversation is snoozed until after the appointment time

## Props Interface

```typescript
interface SnoozeModalProps {
  isOpen: boolean                           // Controls modal visibility
  onClose: () => void                       // Called when user closes modal
  onSnooze: (until: Date) => void          // Called when snooze is confirmed
  nextAppointment?: {                       // Optional: Show "After appointment" option
    date: Date
    service: string
  }
}
```

## Quick Options Timestamps

| Option              | Calculation                          | Display Format        |
|---------------------|--------------------------------------|-----------------------|
| Later today         | Current time + 4 hours               | `h:mm a`              |
| Tomorrow morning    | Tomorrow at 9:00 AM                  | `E, h:mm a`           |
| Tomorrow afternoon  | Tomorrow at 2:00 PM                  | `E, h:mm a`           |
| Next week           | Next Monday at 9:00 AM               | `E, MMM d, h:mm a`    |
| After appointment   | Appointment date/time                | `E, MMM d, h:mm a`    |

## Styling Details

### Colors
- **Primary**: Purple-600 (#7C3AED) for actions and hover states
- **Border**: Gray-200 (#E5E7EB) for default borders
- **Hover Border**: Purple-300 (#C4B5FD) for interactive elements
- **Info Box**: Blue-50 (#EFF6FF) background with Blue-200 (#BFDBFE) border
- **Background**: White (#FFFFFF)
- **Backdrop**: Black with 25% opacity

### Interactive States
- **Quick Options**:
  - Default: White background, gray-200 border
  - Hover: Gray-50 background, purple-300 border
  - Icon container: Gray-100 → Purple-100 on hover

- **Custom Date/Time Section**:
  - Default: White background, gray-200 border
  - Active: Purple-50 background, purple-300 border

- **Buttons**:
  - Cancel: Gray-700 text, gray-100 hover background
  - Snooze: Purple-600 background, purple-700 hover background
  - Disabled: Gray-300 background, gray-500 text

### Spacing
- Modal width: 500px
- Padding: 16px (p-4)
- Quick option gaps: 8px (space-y-2)
- Grid gaps: 12px (gap-3)
- Footer button spacing: 8px (space-x-2)

## Integration Points

### Import
```typescript
import { SnoozeModal } from '@/components/messaging'
// or
import SnoozeModal from '@/components/messaging/SnoozeModal'
```

### State Management
```typescript
const [showSnoozeModal, setShowSnoozeModal] = useState(false)
const [snoozedConversations, setSnoozedConversations] = useState<{
  conversationId: string
  snoozedUntil: Date
}[]>([])
```

### Handler Example
```typescript
const handleSnooze = (until: Date) => {
  // Update conversation status
  setSnoozedConversations(prev => [...prev, {
    conversationId: currentConversation.id,
    snoozedUntil: until
  }])

  // Hide from inbox
  setConversations(prev =>
    prev.filter(c => c.id !== currentConversation.id)
  )

  // Schedule reopen (if using background jobs)
  scheduleConversationReopen(currentConversation.id, until)

  // Show confirmation toast
  showToast(`Conversation snoozed until ${format(until, 'PPp')}`)
}
```

## Backend Integration Notes

When implementing backend support, you'll need:

1. **Database Schema**:
   - `conversation_id`: Foreign key to conversations table
   - `snoozed_until`: Timestamp for when to reopen
   - `snoozed_by`: User ID who snoozed the conversation
   - `snoozed_at`: Timestamp when snoozed

2. **Background Job**:
   - Cron job that runs every minute
   - Checks for conversations where `snoozed_until <= NOW()`
   - Moves conversations back to active inbox
   - Sends notification to staff if configured

3. **Webhook/Real-time**:
   - When patient sends message to snoozed conversation
   - Immediately unsnoze and show in inbox
   - Notify staff member who snoozed it

4. **API Endpoints**:
   ```typescript
   POST /api/conversations/:id/snooze
   Body: { snoozedUntil: Date }

   DELETE /api/conversations/:id/snooze
   // Manually unsnooze
   ```

## Dependencies

- `react` - Core React library
- `date-fns` - Date manipulation and formatting
- `lucide-react` - Icons (Clock, Calendar, Bell, X)
- `tailwindcss` - Styling

## Related Components

- `MessageThread` - Main messaging interface
- `ConversationList` - List of conversations (will need snooze filter)
- `Navigation` - May want to add "Snoozed" view

## Future Enhancements

- [ ] Add "Snooze again" option when reopening
- [ ] Snooze templates (save custom snooze times)
- [ ] Recurring snooze patterns
- [ ] Team snooze (assign to specific team member when reopens)
- [ ] Snooze history/audit trail
- [ ] Bulk snooze multiple conversations
- [ ] Smart snooze suggestions based on conversation context
