# Messaging Components

## AISuggestions Component

A polished React component that generates AI-powered reply suggestions based on patient messages, similar to Mango Mint's smart replies.

### Features

- **Context-Aware Suggestions**: Analyzes message content to generate appropriate replies
- **3 Smart Suggestions**: Always shows 3 contextually relevant reply options
- **Regenerate Button**: Users can refresh suggestions with the regenerate button
- **Loading States**: Visual feedback during suggestion generation
- **Category Detection**:
  - **Appointment-related**: Handles confirmation, rescheduling, directions
  - **Post-Care**: Addresses pain, swelling, redness with reassurance and guidance
  - **Payment/Price**: Offers help with cost inquiries and payment options
  - **Questions**: Suggests follow-up and professional handling
  - **Gratitude**: Warm, appreciative responses
  - **Confirmations**: Positive affirmation messages

### Props

```typescript
interface AISuggestionsProps {
  lastMessage: string    // The patient's last message to analyze
  onSelect: (suggestion: string) => void  // Callback when user selects a suggestion
}
```

### Usage

```jsx
import { AISuggestions } from '@/components/messaging/AISuggestions'
import { useState } from 'react'

export default function MessagesPage() {
  const [lastPatientMessage, setLastPatientMessage] = useState('')
  const [messageText, setMessageText] = useState('')

  const handleSelectSuggestion = (suggestion: string) => {
    setMessageText(suggestion)
  }

  return (
    <div>
      {/* ... message display ... */}

      <AISuggestions
        lastMessage={lastPatientMessage}
        onSelect={handleSelectSuggestion}
      />

      {/* ... message input and send button ... */}
    </div>
  )
}
```

### Integration with Messages Page

The component can be easily integrated into the existing messages page. Add it above the quick replies section or in place of it:

```jsx
<div className="mt-3">
  <AISuggestions
    lastMessage={currentMessages[currentMessages.length - 1]?.text || ''}
    onSelect={(suggestion) => setMessageText(suggestion)}
  />

  {/* Existing quick replies section below */}
</div>
```

### Styling

- Uses Tailwind CSS for all styling
- Blue gradient background (blue-50 to indigo-50) for polished appearance
- Smooth hover effects and transitions
- Responsive design that works on all screen sizes
- Lucide React icons for consistent iconography

### Message Analysis Categories

The component detects these patterns and responds accordingly:

1. **Appointment Queries** - Words like "appointment", "confirm", "reschedule", "tomorrow", "time"
2. **Post-Care Concerns** - Words like "pain", "swelling", "redness", "tight", "discomfort"
3. **Pricing Questions** - Words like "cost", "price", "payment", "insurance"
4. **General Questions** - Messages ending with "?"
5. **Thank You Messages** - Words like "thank", "thanks", "appreciate"
6. **Confirmations** - Words like "yes", "confirm", "sounds good", "ok"

### Customization

To customize suggestions, modify the `generateSuggestions()` function:

```typescript
const generateSuggestions = (message: string): string[] => {
  const lowerMessage = message.toLowerCase()

  // Add your own detection patterns
  const isCustomCategory = /your-pattern/i.test(message)

  if (isCustomCategory) {
    return [
      'Your custom suggestion 1',
      'Your custom suggestion 2',
      'Your custom suggestion 3'
    ]
  }

  // ... rest of function
}
```

### Future Enhancements

- Integration with actual AI API (OpenAI, Claude, etc.)
- Patient history context to personalize suggestions
- Learning from user selections to improve future suggestions
- Multi-language support
- Custom suggestion templates per provider
- Analytics on suggestion usage rates

---

## SnoozeModal Component

A modal component for snoozing conversations, inspired by Intercom's snooze feature. Allows users to temporarily hide conversations that will automatically reopen at a specified time or when the patient sends a new message.

### Features

- **Quick Snooze Options**: Pre-defined snooze times for common use cases
  - Later today (4 hours from now)
  - Tomorrow morning (9 AM)
  - Tomorrow afternoon (2 PM)
  - Next week (Monday 9 AM)
  - After appointment (if patient has an upcoming appointment)
- **Custom Date/Time**: Manual date and time picker for custom snooze times
- **Smart Reopening**: Conversation reopens when timer expires or patient sends a message
- **Clean Modal Design**: Follows existing modal patterns in the application
- **Validation**: Ensures selected time is in the future

### Props

```typescript
interface SnoozeModalProps {
  isOpen: boolean
  onClose: () => void
  onSnooze: (until: Date) => void
  nextAppointment?: { date: Date; service: string }
}
```

### Usage

```jsx
import { SnoozeModal } from '@/components/messaging'
import { useState } from 'react'

export default function MessagesPage() {
  const [showSnoozeModal, setShowSnoozeModal] = useState(false)
  const [snoozedUntil, setSnoozedUntil] = useState<Date | null>(null)

  const handleSnooze = (until: Date) => {
    setSnoozedUntil(until)
    console.log(`Conversation snoozed until: ${until}`)
    // TODO: Update conversation status in backend
  }

  return (
    <div>
      <button onClick={() => setShowSnoozeModal(true)}>
        Snooze Conversation
      </button>

      <SnoozeModal
        isOpen={showSnoozeModal}
        onClose={() => setShowSnoozeModal(false)}
        onSnooze={handleSnooze}
        nextAppointment={{
          date: new Date('2026-01-15T14:00:00'),
          service: 'Botox Follow-up'
        }}
      />
    </div>
  )
}
```

### Integration Example

Add snooze functionality to the conversation header:

```jsx
import { Clock } from 'lucide-react'

// In your conversation header
<div className="flex items-center space-x-2">
  <button
    onClick={() => setShowSnoozeModal(true)}
    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
    title="Snooze conversation"
  >
    <Clock className="h-5 w-5 text-gray-600" />
  </button>
</div>
```

### Styling

- Uses Tailwind CSS for all styling
- Follows existing modal patterns (backdrop, centered modal, header/content/footer layout)
- Purple accent color matching the application theme
- Hover effects on quick options
- Visual feedback for selected custom date/time option
- Info box with blue background for user guidance

### Quick Options

The component provides these pre-configured snooze times:

1. **Later today**: 4 hours from current time
2. **Tomorrow morning**: Next day at 9:00 AM
3. **Tomorrow afternoon**: Next day at 2:00 PM
4. **Next week**: Next Monday at 9:00 AM
5. **After appointment**: Only shown if `nextAppointment` prop is provided

### Custom Date/Time

Users can select a custom snooze time by:
1. Selecting a date from the date picker (future dates only)
2. Selecting a time from the time picker
3. The "Snooze" button appears when both fields are filled

### Behavior

The modal automatically reopens conversations when:
- The snooze timer expires
- The patient sends a new message (implemented in backend logic)

### Validation

- Custom date must be today or in the future
- Custom time combined with date must be in the future
- Alert shown if user tries to snooze to a past time

### Accessibility

- Backdrop click closes the modal
- Close (X) button in header
- Cancel button in footer
- Keyboard navigation supported through native HTML inputs

