# InternalNotificationConfig Component

A reusable component for configuring internal staff notifications in the Medical Spa Admin Platform. This component allows administrators to enable/disable internal notifications and manage a list of recipient email addresses.

## Features

- **Toggle Switch**: Enable or disable internal staff notifications
- **Email Management**: Add and remove email recipients
- **Tag-Style Display**: Visual email tags with easy removal
- **Multi-Input Support**:
  - Add emails by pressing Enter
  - Add emails by typing comma
  - Add emails via "Add" button
- **Email Validation**: Real-time validation of email format
- **Duplicate Detection**: Prevents adding the same email twice
- **Accessible**: ARIA labels and keyboard navigation support
- **Visual Feedback**: Clear states for enabled/disabled and errors
- **Tailwind CSS**: Fully styled with Tailwind classes

## Usage

```tsx
import { InternalNotificationConfig } from './components/InternalNotificationConfig'

function MySettingsPage() {
  const [config, setConfig] = useState({
    enabled: true,
    recipients: ['admin@clinic.com', 'manager@clinic.com']
  })

  return (
    <InternalNotificationConfig
      enabled={config.enabled}
      recipients={config.recipients}
      onChange={setConfig}
    />
  )
}
```

## Props

### `enabled: boolean` (required)
Whether internal notifications are enabled. Controls the toggle switch state and disables email input when `false`.

### `recipients: string[]` (required)
Array of recipient email addresses. Displayed as removable tags when populated.

### `onChange: (config: { enabled: boolean; recipients: string[] }) => void` (required)
Callback function called when configuration changes (toggle or email list changes).

## Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Users Icon] Internal Staff Notifications    [Toggle]      │
│  Send notification copies to staff members...                │
├─────────────────────────────────────────────────────────────┤
│  [Mail Icon] Staff-Only Notifications                        │
│  These notifications are sent to staff members only...       │
├─────────────────────────────────────────────────────────────┤
│  Recipient Email Addresses                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [Mail] admin@clinic.com [×]  [Mail] manager@... [×]  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┬──────────────┐ │
│  │ Enter email address and press Enter...  │  [+] Add     │ │
│  └─────────────────────────────────────────┴──────────────┘ │
│  Enter email addresses separated by commas...                │
├─────────────────────────────────────────────────────────────┤
│  [Users] 2 recipients configured                             │
└─────────────────────────────────────────────────────────────┘
```

## Behavior

### Toggle Switch
- Click to enable/disable internal notifications
- When disabled:
  - Email input and tags become semi-transparent
  - Email input is disabled
  - Add button is disabled
  - Recipients count is hidden

### Adding Emails
1. Type email address in input field
2. Press Enter, type comma, or click "Add" button
3. Email is validated and added to recipients list
4. Input is cleared for next email

### Removing Emails
- Click the [×] button on any email tag to remove it

### Validation
- Emails must match format: `text@domain.ext`
- Duplicate emails are rejected with error message
- Invalid format shows error message below input

### Keyboard Support
- **Enter**: Add current email
- **Comma (,)**: Add current email
- **Tab**: Focus next element (adds email on blur)

## Styling

All styling uses Tailwind CSS classes:
- **Primary color**: Blue (`blue-600`, `blue-100`, etc.)
- **Toggle states**: Blue when enabled, gray when disabled
- **Email tags**: Blue background with rounded-full style
- **Errors**: Red border and text
- **Disabled state**: Reduced opacity with pointer-events-none

## Icons Used

From `lucide-react`:
- `Mail`: Email indicators
- `Users`: Staff/recipients indicators
- `X`: Remove email button
- `Plus`: Add email button

## Error States

### Invalid Email Format
```
Input: "notanemail"
Error: "Please enter a valid email address"
```

### Duplicate Email
```
Input: "admin@clinic.com" (already in list)
Error: "This email is already in the list"
```

## Integration Example

### With Backend API

```tsx
import { InternalNotificationConfig } from './components'
import { useState, useEffect } from 'react'

function AutomatedMessagesSettings() {
  const [config, setConfig] = useState({
    enabled: false,
    recipients: []
  })
  const [loading, setLoading] = useState(true)

  // Load configuration from backend
  useEffect(() => {
    fetch('/api/settings/internal-notifications')
      .then(res => res.json())
      .then(data => {
        setConfig(data)
        setLoading(false)
      })
  }, [])

  // Save configuration
  const handleSave = async () => {
    await fetch('/api/settings/internal-notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <InternalNotificationConfig
        enabled={config.enabled}
        recipients={config.recipients}
        onChange={setConfig}
      />
      <button onClick={handleSave}>Save Changes</button>
    </div>
  )
}
```

### With Form Validation

```tsx
import { InternalNotificationConfig } from './components'
import { z } from 'zod'

const schema = z.object({
  enabled: z.boolean(),
  recipients: z.array(z.string().email()).min(1, 'At least one recipient required')
})

function ValidatedSettings() {
  const [config, setConfig] = useState({ enabled: true, recipients: [] })
  const [errors, setErrors] = useState<string[]>([])

  const handleChange = (newConfig) => {
    setConfig(newConfig)
    const result = schema.safeParse(newConfig)
    if (!result.success) {
      setErrors(result.error.issues.map(i => i.message))
    } else {
      setErrors([])
    }
  }

  return (
    <div>
      <InternalNotificationConfig
        enabled={config.enabled}
        recipients={config.recipients}
        onChange={handleChange}
      />
      {errors.map(error => (
        <p key={error} className="text-red-600">{error}</p>
      ))}
    </div>
  )
}
```

## Accessibility

- **ARIA Labels**: Toggle button has descriptive aria-label
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Focus States**: Clear focus indicators on interactive elements
- **Screen Reader Support**: Proper semantic HTML structure

## Testing Checklist

- [ ] Toggle switch enables/disables correctly
- [ ] Email validation works for valid/invalid formats
- [ ] Duplicate detection prevents adding same email twice
- [ ] Enter key adds email
- [ ] Comma key adds email
- [ ] Blur event adds email
- [ ] Add button works when enabled
- [ ] Remove button deletes correct email
- [ ] Disabled state prevents interaction
- [ ] Recipients count updates correctly
- [ ] Error messages display properly
- [ ] Keyboard navigation works

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Related Components

- `MessageEditor`: For editing notification message templates
- `TimelineConfigurator`: For scheduling notification timing
- `TestSendButton`: For testing notification delivery

## File Location

```
/apps/admin/src/app/settings/automated-messages/components/
├── InternalNotificationConfig.tsx           # Main component
├── InternalNotificationConfig.example.tsx   # Usage example
├── InternalNotificationConfig.README.md     # This file
└── index.ts                                 # Barrel export
```

## Version History

- **v1.0.0** (2026-01-08): Initial implementation
  - Toggle switch for enable/disable
  - Tag-style email management
  - Multi-input support (Enter, comma, button)
  - Email validation and duplicate detection
  - Full Tailwind CSS styling
