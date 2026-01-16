# ConfirmationRequestConfig Component

A comprehensive configuration component for managing appointment confirmation requests via SMS. This component helps reduce no-shows by enabling patients to confirm or reschedule appointments through simple SMS replies.

## Features

- **Toggle Confirmation Requests**: Enable/disable the entire confirmation request feature
- **Unconfirmed Status**: Optionally set appointments to "Unconfirmed" until patient responds
- **Follow-up Reminders**: Automatically send follow-up messages if patient doesn't respond
- **Configurable Timing**: Set custom delay for follow-up messages (in hours)
- **SMS Previews**: Shows example SMS messages for both initial and follow-up
- **Best Practices Info**: Displays helpful tips and statistics

## Props

```typescript
interface ConfirmationRequestConfigProps {
  enabled: boolean              // Whether confirmation requests are enabled
  setUnconfirmed: boolean        // Set appointment status to "Unconfirmed" until confirmed
  followUpEnabled: boolean       // Enable automatic follow-up if no response
  followUpHours: number          // Hours to wait before sending follow-up
  onChange: (config: {
    enabled: boolean
    setUnconfirmed: boolean
    followUpEnabled: boolean
    followUpHours: number
  }) => void                     // Callback when configuration changes
}
```

## Usage

### Basic Usage

```tsx
import { useState } from 'react'
import { ConfirmationRequestConfig } from '@/app/settings/automated-messages/components'

export default function MySettings() {
  const [config, setConfig] = useState({
    enabled: true,
    setUnconfirmed: true,
    followUpEnabled: true,
    followUpHours: 24
  })

  return (
    <ConfirmationRequestConfig
      enabled={config.enabled}
      setUnconfirmed={config.setUnconfirmed}
      followUpEnabled={config.followUpEnabled}
      followUpHours={config.followUpHours}
      onChange={setConfig}
    />
  )
}
```

### Integration with Form State

```tsx
import { useState } from 'react'
import { ConfirmationRequestConfig } from '@/app/settings/automated-messages/components'

export default function AppointmentSettings() {
  const [settings, setSettings] = useState({
    confirmationRequest: {
      enabled: true,
      setUnconfirmed: true,
      followUpEnabled: true,
      followUpHours: 24
    },
    // ... other settings
  })

  const handleConfirmationChange = (config) => {
    setSettings(prev => ({
      ...prev,
      confirmationRequest: config
    }))

    // Save to backend
    saveSettings({ confirmationRequest: config })
  }

  return (
    <div className="space-y-6">
      <ConfirmationRequestConfig
        {...settings.confirmationRequest}
        onChange={handleConfirmationChange}
      />
      {/* Other settings components */}
    </div>
  )
}
```

## Visual States

### Enabled State
When enabled, all controls are active and visible:
- Main toggle switch is ON (amber color)
- Description box shows benefits
- Set Unconfirmed checkbox is clickable
- Follow-up settings are accessible
- Example SMS messages are displayed
- Best practices information is shown

### Disabled State
When disabled, controls are greyed out:
- Main toggle switch is OFF (grey)
- All sub-controls are disabled with opacity
- Interactive elements are not clickable (pointer-events-none)

### Follow-up Enabled
When follow-up is enabled, additional controls appear:
- Number input for setting delay hours
- Example follow-up SMS message
- Validation (min: 1, max: 72 hours)

## Component Sections

### 1. Header
- Title and description
- Main enable/disable toggle switch
- Icon: MessageSquare (amber)

### 2. Benefits Description
- Green alert box
- Explains "Reply C to confirm, R to reschedule"
- Shows 50% no-show reduction statistic

### 3. Set Unconfirmed Checkbox
- Optional feature to mark appointments as unconfirmed
- Grey box with hover effect
- Explains automatic status update behavior

### 4. Follow-up Configuration
- Toggle for enabling follow-up messages
- Number input for delay in hours (1-72)
- Disabled when main toggle is off
- Shows only when follow-up is enabled

### 5. SMS Preview
- Shows example initial confirmation message
- Shows example follow-up message (when enabled)
- Blue information box
- Dynamic content based on followUpHours

### 6. Best Practices
- Amber information box
- Bullet list of tips:
  - Response time statistics
  - Follow-up recommendations
  - Unconfirmed appointment handling

## Styling

The component uses Tailwind CSS with the following color scheme:
- **Primary**: Amber (`amber-600` for buttons, toggles)
- **Success**: Green (`green-600` for benefits)
- **Info**: Blue (`blue-600` for examples)
- **Warning**: Amber (`amber-600` for best practices)
- **Neutral**: Gray (`gray-50` to `gray-900`)

### Key Design Elements
- Rounded corners (`rounded-lg`)
- Consistent spacing (`gap-3`, `gap-4`)
- Hover states on interactive elements
- Disabled state styling with opacity
- Focus rings for accessibility

## Accessibility

- Proper ARIA labels on toggle switches
- Semantic HTML structure
- Keyboard navigation support
- Focus indicators on interactive elements
- Disabled states properly implemented
- Screen reader friendly descriptions

## Recommended Configuration

```typescript
// Aggressive no-show prevention
{
  enabled: true,
  setUnconfirmed: true,
  followUpEnabled: true,
  followUpHours: 24  // Follow up after 1 day
}

// Basic confirmation only
{
  enabled: true,
  setUnconfirmed: false,
  followUpEnabled: false,
  followUpHours: 24
}

// Multiple follow-ups (combine with timeline)
{
  enabled: true,
  setUnconfirmed: true,
  followUpEnabled: true,
  followUpHours: 48  // Follow up after 2 days
}
```

## SMS Message Format

### Initial Confirmation
```
Your appointment at Luxe Medical Spa is confirmed for Tuesday, Jan 9 at 2:00 PM with Dr. Sarah Johnson. Reply C to confirm, R to reschedule.
```

### Follow-up Message
```
Reminder: Please confirm your appointment on Tuesday, Jan 9 at 2:00 PM. Reply C to confirm or R to reschedule. Call us at (555) 123-4567 if you have questions.
```

## Integration Points

This component is designed to work with:
- Appointment booking system
- SMS messaging service (Twilio, etc.)
- Status management (Confirmed/Unconfirmed)
- Automated message scheduling
- Patient communication preferences

## Related Components

- `TimelineConfigurator` - For scheduling multiple reminders
- `MessageCard` - For individual message configuration
- `InternalNotificationConfig` - For staff notifications

## File Location

```
/apps/admin/src/app/settings/automated-messages/components/ConfirmationRequestConfig.tsx
```

## Dependencies

- React (hooks: no state, pure controlled component)
- lucide-react icons: `MessageSquare`, `CheckCircle`, `Clock`, `AlertCircle`
- Tailwind CSS for styling

## Testing

Example test scenarios:
1. Toggle main switch on/off
2. Check/uncheck setUnconfirmed
3. Toggle follow-up on/off
4. Change follow-up hours (valid/invalid)
5. Verify disabled state behavior
6. Test onChange callback
7. Verify SMS preview updates

## Browser Support

Works in all modern browsers that support:
- CSS Grid & Flexbox
- CSS transitions
- ES6+ JavaScript
- React 18+
