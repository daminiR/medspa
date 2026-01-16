# MessageThread Component

A professional messaging interface component for medical spa patient communications, inspired by Intercom and Front patterns.

## Location
`/Users/daminirijhwani/medical-spa-platform/apps/admin/src/components/messaging/MessageThread.tsx`

## Overview

The MessageThread component provides a complete conversation view for messaging with patients. It includes a header with patient information and actions, a collapsible appointment info strip, a scrollable message stream, and comprehensive message display with delivery status.

## Features

### 1. Header Bar
- **Patient Avatar**: Gradient avatar with initials
- **Patient Name & Channel Badge**: Shows active communication channel (SMS Active, Email, Portal)
- **Action Buttons**:
  - Call: Initiates phone call
  - Calendar: Links to calendar view
  - More Menu: Access to snooze and close options

### 2. Patient Info Strip (Collapsible)
- Shows last appointment info
- Shows next appointment info
- Quick action: Send Reminder button
- Collapse/expand toggle for space optimization

### 3. Message Stream
- **Date Separators**: Automatically groups messages by date
- **Message Bubbles**:
  - Patient messages: Left-aligned, white background, light border
  - Clinic messages: Right-aligned, gradient purple/indigo background
- **Avatars**: Next to each message for visual clarity
- **Timestamps**: Below each message with time
- **Delivery Status**: For sent messages (queued/sending/sent/delivered/read/failed)
- **Message Type Badges**: Shows if message is Automated, Manual, or System
- **Typing Indicator**: Animated dots when patient is typing
- **Auto-scroll**: Automatically scrolls to bottom on new messages

### 4. Empty State
- Professional empty state when no conversation is selected
- Clear messaging to guide user

## Props

```typescript
interface MessageThreadProps {
  conversation: Conversation | null
  messages: Message[]
  onSendMessage: (text: string) => void
  onCloseConversation: () => void
  onSnoozeConversation: (duration: string) => void
  isTyping?: boolean
}
```

### Conversation Type
```typescript
interface Conversation {
  id: string | number
  patientId: string
  patientName: string
  patientPhone: string
  lastMessage?: string
  lastMessageAt?: Date
  unreadCount: number
  status: 'active' | 'resolved' | 'waiting' | 'urgent'
  channel: 'sms' | 'email' | 'portal'
  assignedTo?: string
  tags: string[]
  metadata: Record<string, any>
}
```

### Message Type
```typescript
interface Message {
  id: string | number
  sender: 'clinic' | 'patient'
  text: string
  time: Date
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  channel: 'sms' | 'email' | 'portal'
  type?: 'automated' | 'manual' | 'system'
}
```

## Usage

### Basic Example

```typescript
import { MessageThread } from '@/components/messaging'

function MessagesPage() {
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])

  const handleSendMessage = (text: string) => {
    // Send message via API
    console.log('Sending:', text)
  }

  const handleCloseConversation = () => {
    // Close conversation
    setConversation(null)
  }

  const handleSnoozeConversation = (duration: string) => {
    // Snooze for duration
    console.log('Snoozing for:', duration)
  }

  return (
    <MessageThread
      conversation={conversation}
      messages={messages}
      onSendMessage={handleSendMessage}
      onCloseConversation={handleCloseConversation}
      onSnoozeConversation={handleSnoozeConversation}
      isTyping={false}
    />
  )
}
```

### With Appointment Data

```typescript
const conversation = {
  id: 'conv-1',
  patientId: 'p-1',
  patientName: 'Sarah Johnson',
  patientPhone: '+1 (555) 123-4567',
  lastMessage: 'Thank you!',
  lastMessageAt: new Date(),
  unreadCount: 0,
  status: 'active',
  channel: 'sms',
  tags: [],
  metadata: {
    lastAppointment: 'Botox - 2 days ago',
    nextAppointment: 'Follow-up - Next Tuesday 2:00 PM'
  }
}

const messages = [
  {
    id: 1,
    sender: 'clinic',
    text: 'Hi Sarah! Your appointment is confirmed.',
    time: new Date(),
    status: 'delivered',
    channel: 'sms',
    type: 'automated'
  },
  {
    id: 2,
    sender: 'patient',
    text: 'Thank you!',
    time: new Date(),
    status: 'delivered',
    channel: 'sms'
  }
]
```

## Styling

The component uses Tailwind CSS with the following design patterns:

- **Gradient Theme**: Purple/Indigo gradients for clinic messages and avatars
- **Professional Spacing**: Consistent padding and margins
- **Shadow Effects**: Subtle shadows for depth
- **Responsive Design**: Works on various screen sizes
- **Color Coding**:
  - Green: SMS channel badge
  - Blue: Email channel badge, appointment info
  - Purple: Portal channel badge, automated messages
  - Gray: System messages

## Dependencies

- `date-fns`: For date formatting
- `lucide-react`: For icons
- `@/components/messaging/MessageStatus`: For delivery status indicators

## Auto-scroll Behavior

The component automatically scrolls to the bottom when:
- New messages are added to the array
- The messages array length changes
- Using smooth scroll for better UX

## Snooze Options

The more menu provides three snooze durations:
- 1 hour
- 4 hours
- Until tomorrow

These are passed to the `onSnoozeConversation` callback as strings: `'1h'`, `'4h'`, `'tomorrow'`

## Channel Badges

The component displays different badges based on the communication channel:

| Channel | Badge Color | Icon | Label |
|---------|------------|------|-------|
| SMS | Green | MessageCircle | SMS Active |
| Email | Blue | Mail | Email |
| Portal | Purple | MessageCircle | Portal |

## Message Status Flow

Messages from the clinic show delivery status:

1. **queued**: Message is queued for sending
2. **sending**: Currently being sent
3. **sent**: Successfully sent to carrier
4. **delivered**: Delivered to patient's device
5. **read**: Patient has read the message
6. **failed**: Message failed to send (shows error icon)

## Accessibility

- Semantic HTML structure
- ARIA labels on action buttons
- Keyboard navigation support
- Screen reader friendly

## Performance

- Uses React refs for scroll management
- Memoized getInitials function
- Efficient re-rendering with proper key props
- Click-outside detection with cleanup

## Integration with Existing System

This component integrates seamlessly with:
- `MessageStatus` component for delivery indicators
- Existing messaging types from `/src/services/messaging/core.ts`
- Patient types from `/src/types/patient.ts`
- Matches design patterns from `/src/app/messages/page.tsx`

## Future Enhancements

Potential additions (not currently implemented):
- Message search within thread
- Message reactions/emoji
- File attachments preview
- Voice message support
- Message editing
- Message deletion
- Thread archiving
- AI-powered suggestions integration
- Quick replies integration
- Template insertion

## Notes

- This is a display component - it does not handle message sending logic
- Message sending should be implemented in the parent component
- The component is optimized for medical spa workflows
- Follows HIPAA-compliant messaging patterns
- Professional appearance suitable for healthcare settings

## Example Files

See `MessageThread.example.tsx` for a complete working example with mock data and integration patterns.
