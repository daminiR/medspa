# Default vs Customized Tracking - Implementation Guide

## Overview
This guide explains how to add visual indicators showing when message templates are using default vs customized settings.

## Current State

### ✅ Infrastructure Complete
1. **MessageCard Component** - Already has visual indicators built-in
2. **useAutomatedMessages Hook** - Already tracks defaults vs customizations
3. **CheckInTab** - Already implements the pattern correctly

### ❌ Tabs Need Integration
Most tabs still use local state and don't track defaults:
- AppointmentBookedTab ❌
- AppointmentCanceledTab ❌
- WaitlistTab ❌
- SaleClosedTab ❌
- GiftCardsTab ❌
- MembershipsTab ❌
- FormSubmittedTab ❌

## How It Works

### Visual Indicators in MessageCard

When collapsed, the MessageCard shows:
- **"Default" badge (green)** - Using recommended settings
- **"Customized" badge (blue)** - User has modified settings

When expanded and customized:
- **"Reset to Recommended Settings" button** - Restores defaults
- User can see what was changed

### Detection Logic

The `useAutomatedMessages` hook compares current settings with defaults using deep comparison:

```typescript
isUsingDefaults('appointment_booked')
// Returns true if current === default (deep comparison)
// Returns false if ANY field has been modified
```

## Implementation Pattern

### Step 1: Import the Hook

```typescript
import { useAutomatedMessages } from '@/hooks/useAutomatedMessages'
```

### Step 2: Use the Hook in Component

```typescript
export function YourTab() {
  const {
    getSettings,
    updateSettings,
    resetToDefaults,
    isUsingDefaults,
    isLoading
  } = useAutomatedMessages();

  // Get current settings
  const settings = getSettings('your_event_type');

  // Initialize state from settings
  const [enabled, setEnabled] = useState(settings?.enabled ?? true);
  const [template, setTemplate] = useState(settings?.template ?? defaultTemplate);

  // ...rest of component
}
```

### Step 3: Add Reset Handler

```typescript
const handleReset = () => {
  resetToDefaults('your_event_type');
  const defaults = getSettings('your_event_type');
  if (defaults) {
    setEnabled(defaults.enabled);
    setTemplate(defaults.template);
    // Reset other fields...
  }
};
```

### Step 4: Pass Props to MessageCard

```typescript
<MessageCard
  id="your-message"
  title="Your Message Title"
  description="Description"
  enabled={enabled}
  onToggle={setEnabled}
  channels={{ sms: true, email: false }}
  isExpanded={expandedCard === 'your-message'}
  onExpand={setExpandedCard}
  summary="Message summary"
  isUsingDefaults={isUsingDefaults('your_event_type')}
  onResetToDefaults={handleReset}
>
  {/* Your editor content */}
</MessageCard>
```

### Step 5: Track Modifications

When the user modifies any field, the hook automatically detects the change:

```typescript
// When template changes
const handleTemplateChange = (newTemplate: MessageTemplate) => {
  setTemplate(newTemplate);

  // Update in hook (this makes it "Customized")
  updateSettings('your_event_type', {
    template: newTemplate
  });
};
```

## Complete Example

Here's a complete example from CheckInTab:

```typescript
'use client';

import { useState } from 'react';
import { MessageCard } from '../components/MessageCard';
import { useAutomatedMessages } from '@/hooks/useAutomatedMessages';
import MessageEditor, { MessageTemplate } from '../components/MessageEditor';

export function CheckInTab() {
  // Use the hook
  const {
    getSettings,
    resetToDefaults,
    isUsingDefaults
  } = useAutomatedMessages();

  // Get current settings
  const checkInSettings = getSettings('check_in_reminder');

  // Initialize state from settings
  const [preArrivalEnabled, setPreArrivalEnabled] = useState(
    checkInSettings?.enabled ?? true
  );
  const [preArrivalTemplate, setPreArrivalTemplate] = useState<MessageTemplate>({
    body: checkInSettings?.template.body ?? 'Default message...',
    variables: checkInSettings?.template.variables ?? []
  });

  // Reset handler
  const handleReset = () => {
    resetToDefaults('check_in_reminder');
    const defaults = getSettings('check_in_reminder');
    if (defaults) {
      setPreArrivalEnabled(defaults.enabled);
      setPreArrivalTemplate({
        body: defaults.template.body,
        variables: defaults.template.variables,
      });
    }
  };

  return (
    <MessageCard
      id="pre-arrival"
      title="Pre-Arrival Message"
      description="Send check-in link before appointment"
      enabled={preArrivalEnabled}
      onToggle={setPreArrivalEnabled}
      channels={{ sms: true }}
      isUsingDefaults={isUsingDefaults('check_in_reminder')}
      onResetToDefaults={handleReset}
    >
      <MessageEditor
        template={preArrivalTemplate}
        onChange={setPreArrivalTemplate}
        messageType="sms"
      />
    </MessageCard>
  );
}
```

## Testing the Implementation

### Test Scenario 1: Initial Load
1. Load the page
2. Cards should show "Default" badge (green)
3. No reset button visible when collapsed

### Test Scenario 2: Modify Template
1. Expand a card
2. Modify the message template
3. Collapse the card
4. Badge should now show "Customized" (blue)

### Test Scenario 3: Reset to Defaults
1. Expand a customized card
2. Click "Reset to Recommended Settings" button
3. Template should revert to default
4. Badge should change back to "Default" (green)

### Test Scenario 4: Persistence
1. Modify a template
2. Refresh the page
3. Badge should still show "Customized"
4. Template should retain modifications

## Badge Behavior Summary

| State | Badge | Color | When Shown |
|-------|-------|-------|------------|
| Using defaults | "Default" | Green | When current settings match defaults exactly |
| Modified | "Customized" | Blue | When any field differs from defaults |
| Collapsed | Badge visible | - | Always show badge when collapsed |
| Expanded | Badge hidden | - | Badge removed when expanded to save space |

## Reset Button Behavior

| State | Button Visibility | When Clicked |
|-------|------------------|--------------|
| Using defaults | Hidden | N/A - button not shown |
| Customized & Collapsed | Hidden | N/A - only show when expanded |
| Customized & Expanded | Visible | Restores all fields to defaults |

## Notes

- The deep comparison in `isUsingDefaults()` checks ALL fields, not just the template
- Any modification to enabled state, channels, timing, etc. makes it "Customized"
- Reset button restores EVERYTHING, not just the template
- Settings are persisted to localStorage automatically
- Multiple cards on the same tab can have independent default/customized states

## Migration Checklist

For each tab that needs integration:

- [ ] Import `useAutomatedMessages` hook
- [ ] Call hook at component level
- [ ] Get settings using `getSettings(eventType)`
- [ ] Initialize state from settings
- [ ] Create reset handler using `resetToDefaults(eventType)`
- [ ] Pass `isUsingDefaults` prop to MessageCard
- [ ] Pass `onResetToDefaults` prop to MessageCard
- [ ] Update state when templates modified
- [ ] Test badge changes when modified
- [ ] Test reset button works correctly
- [ ] Test persistence across page refreshes
