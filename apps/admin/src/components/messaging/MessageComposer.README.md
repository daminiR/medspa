# MessageComposer Component

A professional message composition component for medical spa messaging systems, inspired by Intercom, Front, and Mangomint patterns.

## Features

### 1. AI Suggestions Bar
- Displays 2-3 AI-generated reply suggestions based on the last message
- Clickable chips that populate the input field
- Dismiss button to hide suggestions
- Smart contextual suggestions

### 2. Quick Replies Section
- **Category Pills**: Appointment, Post-Care, General, Reminders
- **Scrollable Row**: Up to 6 quick reply chips per category
- **Click to Populate**: Single click adds reply to input
- **Manage Link**: Direct link to settings for customization

### 3. Composer Input Area
- **Multi-line Textarea**: Auto-resizes up to 120px height
- **Smart Placeholder**: Shows patient name when available
- **Character Counter**: Integrated SMS character counter showing segments
- **Keyboard Hints**: Visual indicators for shortcuts

### 4. Action Buttons
- **Left Side**:
  - Attachment button for file uploads
  - Forms button to open forms panel
- **Right Side**:
  - Primary "Send" button with gradient styling
  - Secondary "Send & Close" button

### 5. Forms Panel (Expandable)
- **Category Tabs**: Consent Forms and Post-Care Instructions
- **Form Cards**: Grid layout with:
  - Form name and description
  - Metadata (completion time, validity period)
  - Preview button
  - Send button
  - "Sent today" badge for recently sent forms

### 6. Form Preview Modal
- Full-screen modal with form details
- Shows sections/instructions
- Metadata display (completion time, validity, requirements)
- Send to patient directly from preview

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line in message |
| `Cmd/Ctrl + Enter` | Send and close conversation |
| `\` or `#` | Jump to quick replies section |

## Usage

```tsx
import MessageComposer from '@/components/messaging/MessageComposer'

function MessagingInterface() {
  const [messageText, setMessageText] = useState('')

  const quickReplies = {
    appointment: [
      'Your appointment is confirmed!',
      'We can reschedule your appointment.'
    ],
    postCare: [
      'That\'s completely normal.',
      'Apply ice if needed.'
    ],
    general: [
      'Thank you for your message!',
      'We\'re here to help!'
    ]
  }

  const handleSend = () => {
    // Send message logic
    console.log('Sending:', messageText)
    setMessageText('')
  }

  const handleSendAndClose = () => {
    // Send and close logic
    console.log('Sending and closing:', messageText)
    setMessageText('')
  }

  const handleAttach = () => {
    // File attachment logic
    console.log('Opening file picker')
  }

  return (
    <MessageComposer
      value={messageText}
      onChange={setMessageText}
      onSend={handleSend}
      onSendAndClose={handleSendAndClose}
      onAttach={handleAttach}
      quickReplies={quickReplies}
      aiSuggestions={[
        'Your appointment is confirmed for tomorrow at 2:00 PM.',
        'That\'s a great question! Let me check with our team.'
      ]}
      disabled={false}
      patientName="Sarah Johnson"
    />
  )
}
```

## Props

### MessageComposerProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | Yes | Current message text value |
| `onChange` | `(value: string) => void` | Yes | Callback when message text changes |
| `onSend` | `() => void` | Yes | Callback when Send button is clicked or Enter is pressed |
| `onSendAndClose` | `() => void` | Yes | Callback when Send & Close button is clicked or Cmd+Enter is pressed |
| `onAttach` | `() => void` | Yes | Callback when Attachment button is clicked |
| `quickReplies` | `Record<string, string[]>` | Yes | Quick reply templates organized by category |
| `aiSuggestions` | `string[]` | No | AI-generated reply suggestions (optional) |
| `disabled` | `boolean` | No | Disable all inputs and buttons (default: false) |
| `patientName` | `string` | No | Patient name to show in placeholder |

## Form Templates

The component includes built-in form templates for:

### Consent Forms
- Botox Consent Form
- Dermal Filler Consent
- New Patient Intake

### Post-Care Instructions
- Botox Post-Care
- Filler Post-Care
- Chemical Peel Aftercare

Each form includes:
- Name and description
- Estimated completion time
- Validity period
- Required fields
- Preview content (sections/instructions)
- SMS message template

## Styling

The component uses Tailwind CSS with the following color scheme:
- Primary gradient: `from-indigo-600 to-purple-600`
- Secondary: Gray shades
- Hover states: Indigo tints
- Disabled state: 50% opacity

## Accessibility

- All buttons have descriptive titles
- Keyboard navigation supported
- Focus states clearly visible
- ARIA labels on interactive elements

## Integration with Existing Components

The MessageComposer integrates seamlessly with:
- **SMSCharacterCounter**: Shows character count and segment information
- **Quick Replies Hook**: Can be connected to backend via `useQuickReplies` hook
- **Forms System**: Uses centralized form tracking from `@/lib/data/patientForms`

## Example Implementation

See `MessageComposer.example.tsx` for a complete working example.

## Dependencies

- `react`: Core React functionality
- `lucide-react`: Icon library
- `@/components/messaging/SMSCharacterCounter`: Character counting component

## Future Enhancements

- [ ] Real-time AI suggestions from backend
- [ ] Rich text formatting support
- [ ] Emoji picker
- [ ] Mention system (@patient, @provider)
- [ ] Template variables ({{firstName}}, {{appointmentTime}})
- [ ] Draft saving
- [ ] Message scheduling
- [ ] Attachment preview
- [ ] Voice message recording

## Notes

- The component is designed to be HIPAA-compliant
- All form data should be encrypted in transit and at rest
- SMS character counting follows industry standards (160 chars ASCII, 70 chars Unicode)
- Auto-resize textarea prevents layout shifts
- Form preview modal is fully accessible and mobile-responsive

## Support

For issues or feature requests, please contact the development team.
