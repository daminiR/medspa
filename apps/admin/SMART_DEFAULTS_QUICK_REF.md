# Smart Defaults - Quick Reference Card

## 🎯 One-Page Implementation Guide

### What It Does
✅ Loads sensible defaults automatically (zero config)
✅ Shows green "Default" badge when using recommended settings
✅ Shows blue "Customized" badge when user makes changes
✅ Provides one-click "Reset to Defaults" button

---

## 📋 Files Modified

```
/src/hooks/useAutomatedMessages.ts           (Added isUsingDefaults)
/src/components/MessageCard.tsx              (Added badges & reset)
/src/tabs/CheckInTab.tsx                     (Example integration)
```

---

## 🔧 Quick Integration (Copy & Paste)

### Step 1: Import Hook
```typescript
import { useAutomatedMessages } from '@/hooks/useAutomatedMessages'
```

### Step 2: Use Hook
```typescript
const {
  getSettings,
  updateSettings,
  resetToDefaults,
  isUsingDefaults,
  isLoading
} = useAutomatedMessages()

// Get settings for your event type
const settings = getSettings('your_event_type')
```

### Step 3: Create Reset Handler
```typescript
const handleReset = () => {
  resetToDefaults('your_event_type')

  // Update your local state
  const defaults = getSettings('your_event_type')
  if (defaults) {
    setYourState(defaults.someProperty)
  }
}
```

### Step 4: Connect to MessageCard
```typescript
<MessageCard
  title="Your Message Title"
  description="Your description"
  enabled={enabled}
  onToggle={setEnabled}
  channels={{ sms: true, email: false }}
  isUsingDefaults={isUsingDefaults('your_event_type')}
  onResetToDefaults={handleReset}
>
  {/* Your settings content */}
</MessageCard>
```

---

## 🎨 Visual States

### Using Defaults
```
[Card Header]
✓ Default    (green badge)

[Expanded Content]
┌──────────────────────────────────┐
│ ✓ Using Recommended Settings     │
│   This message is configured...  │
└──────────────────────────────────┘
```

### Customized
```
[Card Header]
Customized    (blue badge)

[Expanded Content]
┌──────────────────────────────────┐
│ ↻ Reset to Recommended Settings  │ ← Button
└──────────────────────────────────┘
```

---

## 🧪 Quick Test

```javascript
// In browser console:

// 1. Clear settings
localStorage.removeItem('automatedMessageSettings')

// 2. Refresh page

// 3. Check - should see green "Default" badges

// 4. Modify a setting

// 5. Check - should see blue "Customized" badge

// 6. Click reset button

// 7. Check - should see green "Default" badge again
```

---

## 📊 Hook API

```typescript
useAutomatedMessages() returns {
  // Data
  settings: Record<string, AutomatedMessageConfig>

  // State
  isLoading: boolean
  error: string | null

  // Actions
  getSettings: (eventType) => AutomatedMessageConfig | null
  updateSettings: (eventType, config) => void
  resetToDefaults: (eventType) => void
  getAllSettings: () => Record<string, AutomatedMessageConfig>
  resetAllToDefaults: () => void
  isUsingDefaults: (eventType) => boolean  ← NEW
}
```

---

## 🎯 Event Types

Available event types for `getSettings()`, `resetToDefaults()`, and `isUsingDefaults()`:

```typescript
'appointment_booked'
'appointment_canceled'
'appointment_rescheduled'
'form_submitted'
'waitlist_added'
'waitlist_opening'
'check_in_reminder'
'patient_waiting'
'provider_ready'
'sale_closed'
'gift_card_purchased'
'gift_card_received'
'membership_started'
'membership_renewal_reminder'
'membership_renewed'
'membership_canceled'
```

---

## 🐛 Quick Debug

### Badge not showing?
```typescript
// Check hook is called
const { isUsingDefaults } = useAutomatedMessages()

// Check props passed to MessageCard
isUsingDefaults={isUsingDefaults('event_type')}
onResetToDefaults={handleReset}
```

### Reset not working?
```typescript
// Add logging
const handleReset = () => {
  console.log('Reset clicked')
  resetToDefaults('event_type')
  console.log('Settings:', getSettings('event_type'))
}
```

### Always shows "Customized"?
```javascript
// Check in console
const current = getSettings('event_type')
const defaults = /* get from hook's getDefaultSettings() */
console.log('Match?', JSON.stringify(current) === JSON.stringify(defaults))
```

---

## ✅ Checklist

Before committing:
- [ ] Hook imported and used
- [ ] Reset handler created
- [ ] MessageCard props connected
- [ ] Local state updated after reset
- [ ] Tested: defaults load
- [ ] Tested: customization detected
- [ ] Tested: reset works
- [ ] No console errors

---

## 📖 Full Documentation

For detailed info, see:
- `SMART_DEFAULTS_IMPLEMENTATION.md` - Technical details
- `SMART_DEFAULTS_VISUAL_GUIDE.md` - UI/UX specs
- `SMART_DEFAULTS_DEBUG_GUIDE.md` - Testing procedures
- `SMART_DEFAULTS_SUMMARY.md` - Executive overview

---

## 💡 Tips

1. **First-time users:** Everything works with defaults, zero config needed
2. **Power users:** Customize freely, easy to reset
3. **Support:** "Using defaults?" = Check for green badge
4. **Debugging:** Compare JSON.stringify() of current vs defaults

---

**Status:** ✅ Production Ready
**Pattern:** Apply to all automated message tabs
**Time to integrate:** ~15 minutes per tab
