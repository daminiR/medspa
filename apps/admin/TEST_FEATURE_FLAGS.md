# Feature Flag Testing Guide

## Overview
The automated messages page now supports feature-based tab visibility. Tabs are shown or hidden based on feature flags stored in localStorage.

## What Was Implemented

### 1. Feature Detection (Mock)
Added three feature flags stored in localStorage:
- `hasMemberships`: boolean
- `hasGiftCards`: boolean
- `hasWaitlist`: boolean

### 2. Tab Visibility Rules

**Always Visible (Default):**
- Appointment Booked
- Appointment Canceled
- Check-In
- Sale Closed

**Conditionally Visible (Based on Feature Flags):**
- Memberships (requires `hasMemberships: true`)
- Gift Cards (requires `hasGiftCards: true`)
- Waitlist (requires `hasWaitlist: true`)

**Always Available (No Flag Needed):**
- Form Submitted (shown in Advanced Mode only)

### 3. "+" Add Type Button
- Appears when there are available (disabled) features
- Opens a modal to enable/disable feature flags
- Features can be toggled on/off with visual feedback
- Disabled features will not show their tabs

## How to Test

### Initial State
1. Navigate to `/settings/automated-messages`
2. You should see 4 tabs by default (Simple Mode):
   - Appointment Booked ✓
   - Appointment Canceled ✓
   - Check-In ✓

3. Switch to Advanced Mode to see Sale Closed

### Testing Feature Flags

#### Enable Waitlist
1. Click the "+ Add Type" button
2. Click on "Waitlist" in the modal
3. Toggle should turn purple/on
4. Click "Done"
5. Waitlist tab should now appear (in Advanced Mode)

#### Enable Gift Cards
1. Click "+ Add Type" again
2. Toggle "Gift Cards" on
3. Gift Cards tab appears (in Advanced Mode)

#### Enable Memberships
1. Click "+ Add Type"
2. Toggle "Memberships" on
3. Memberships tab appears (in Advanced Mode)

#### Disable a Feature
1. Click "+ Add Type"
2. Click on an enabled feature (e.g., Waitlist)
3. Toggle turns gray/off
4. That tab disappears immediately

### Manual localStorage Testing

Open browser console and run:

```javascript
// Check current feature flags
JSON.parse(localStorage.getItem('featureFlags'))

// Enable all features
localStorage.setItem('featureFlags', JSON.stringify({
  hasMemberships: true,
  hasGiftCards: true,
  hasWaitlist: true
}))
// Refresh page

// Disable all features
localStorage.setItem('featureFlags', JSON.stringify({
  hasMemberships: false,
  hasGiftCards: false,
  hasWaitlist: false
}))
// Refresh page

// Mixed state
localStorage.setItem('featureFlags', JSON.stringify({
  hasMemberships: true,
  hasGiftCards: false,
  hasWaitlist: true
}))
// Refresh page
```

### View Mode Testing

**Simple Mode:**
- Shows: Appointment Booked, Appointment Canceled, Check-In
- Hides: All other tabs regardless of feature flags
- "+ Add Type" button should NOT appear in Simple Mode

**Advanced Mode:**
- Shows: All default tabs + enabled feature tabs
- Form Submitted always appears
- "+ Add Type" appears if any features are disabled

## Expected Behavior

### Tab Switching
- If you're on a tab and switch modes, and that tab isn't visible in the new mode, you should be automatically switched to the first available tab
- If you disable a feature while viewing its tab, you should switch to the first available tab

### Persistence
- Feature flags persist across page refreshes
- View mode (Simple/Advanced) persists across refreshes
- Active tab does NOT persist (always starts at first visible tab)

### Modal Behavior
- Modal shows only features that CAN be enabled/disabled
- Form Submitted never appears in modal (no flag needed)
- Default tabs never appear in modal (always visible)
- When all features are enabled, modal shows "All available message types are enabled"

## Files Modified

- `/src/app/settings/automated-messages/page.tsx` - Main implementation

## Key Functions

- `getFeatureFlags()` - Reads feature flags from localStorage
- `saveFeatureFlags(flags)` - Saves feature flags to localStorage
- `isTabVisible(tab)` - Determines if a tab should be shown
- `toggleFeature(featureKey)` - Toggles a feature flag on/off

## Debug Tips

1. If tabs aren't appearing:
   - Check localStorage: `localStorage.getItem('featureFlags')`
   - Verify you're in Advanced Mode for optional tabs
   - Check browser console for errors

2. If "+ Add Type" button doesn't appear:
   - You must be in Advanced Mode (it's hidden in Simple Mode)
   - All features might already be enabled

3. To reset completely:
   ```javascript
   localStorage.removeItem('featureFlags')
   localStorage.removeItem('automatedMessagesViewMode')
   location.reload()
   ```
