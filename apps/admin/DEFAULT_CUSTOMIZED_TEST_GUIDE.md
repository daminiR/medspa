# Default vs Customized Tracking - Test Guide

## Testing Overview

This guide provides step-by-step test scenarios to verify the default/customized tracking feature works correctly.

## Test Environment Setup

### Prerequisites
1. Navigate to Settings > Automated Messages
2. Select the "Check-In" tab (already has the feature implemented)
3. Clear localStorage to start fresh (optional):
   ```javascript
   localStorage.removeItem('automatedMessageSettings')
   ```
4. Refresh the page

## Test Scenario 1: Initial Load - Default State

### Expected Behavior
All message cards should show "Default" badge when first loaded.

### Steps
1. Load the Automated Messages page
2. Navigate to the Check-In tab
3. Observe the collapsed message cards

### ✓ Pass Criteria
- [ ] All cards show green "Default" badge
- [ ] Badge appears next to the card title
- [ ] Badge has checkmark icon
- [ ] Badge text is "Default"
- [ ] No reset button visible

### Visual Verification
```
▶  Pre-Arrival Message              [Default ✓]  [SMS] ON
   Send 15 minutes before appointment
```

## Test Scenario 2: Expand Card - Default State

### Expected Behavior
When expanding a default card, the badge disappears and a success banner appears.

### Steps
1. Click on the "Pre-Arrival Message" card to expand it
2. Observe the expanded content

### ✓ Pass Criteria
- [ ] Badge is no longer visible in header
- [ ] Green success banner appears at top
- [ ] Banner says "Using Recommended Settings"
- [ ] Banner includes explanation text
- [ ] No reset button visible
- [ ] Message editor shows default template

### Visual Verification
```
▼  Pre-Arrival Message                         [SMS] ON
   Send patients a check-in link...

   ┌────────────────────────────────────────┐
   │ ✓ Using Recommended Settings           │
   │ This message is configured with our    │
   │ recommended default settings...        │
   └────────────────────────────────────────┘

   [Message Editor with default content]
```

## Test Scenario 3: Modify Template

### Expected Behavior
After modifying the template, the card should show "Customized" badge and reset button.

### Steps
1. Keep the "Pre-Arrival Message" card expanded
2. Modify the message template (change any text)
3. Observe the changes

### ✓ Pass Criteria
- [ ] Success banner disappears immediately
- [ ] Reset button appears at top
- [ ] Button says "Reset to Recommended Settings"
- [ ] Button has rotate icon
- [ ] Modified template is visible in editor

### Visual Verification
```
▼  Pre-Arrival Message                         [SMS] ON
   Send patients a check-in link...

   [ ↻ Reset to Recommended Settings ]
   ─────────────────────────────────────────

   [Message Editor with modified content]
```

## Test Scenario 4: Collapse Modified Card

### Expected Behavior
After collapsing, the card should show "Customized" badge instead of "Default".

### Steps
1. Collapse the "Pre-Arrival Message" card
2. Observe the collapsed state

### ✓ Pass Criteria
- [ ] Badge now shows "Customized"
- [ ] Badge is blue (not green)
- [ ] Badge has no icon
- [ ] Badge text is "Customized"
- [ ] Summary text may show modified values

### Visual Verification
```
▶  Pre-Arrival Message          [Customized]  [SMS] ON
   Send 30 minutes before appointment (modified!)
```

## Test Scenario 5: Reset to Defaults

### Expected Behavior
Clicking reset should restore defaults and change badge back to "Default".

### Steps
1. Expand the "Pre-Arrival Message" card again
2. Click "Reset to Recommended Settings" button
3. Observe the changes

### ✓ Pass Criteria
- [ ] Reset button disappears
- [ ] Success banner reappears
- [ ] Template reverts to default content
- [ ] All settings restore to defaults
- [ ] Collapse the card
- [ ] Badge shows "Default" (green) again

### Visual Verification (After Reset)
```
▶  Pre-Arrival Message              [Default ✓]  [SMS] ON
   Send 15 minutes before appointment (back to default!)
```

## Test Scenario 6: Persistence Across Refreshes

### Expected Behavior
Customizations should persist after page reload.

### Steps
1. Expand "Pre-Arrival Message" card
2. Modify the template
3. Collapse the card (shows "Customized")
4. Refresh the browser page
5. Navigate back to Check-In tab
6. Observe the card state

### ✓ Pass Criteria
- [ ] Card still shows "Customized" badge after refresh
- [ ] Expand card - modifications are preserved
- [ ] Reset button is still available
- [ ] Settings persist correctly

## Test Scenario 7: Multiple Cards - Independent Tracking

### Expected Behavior
Each card should track its own default/customized state independently.

### Steps
1. Modify "Pre-Arrival Message" (becomes Customized)
2. Leave "Patient Waiting Notification" unchanged (stays Default)
3. Modify "Provider Ready Notification" (becomes Customized)
4. Observe all three cards

### ✓ Pass Criteria
- [ ] Pre-Arrival shows "Customized" badge (blue)
- [ ] Patient Waiting shows "Default" badge (green)
- [ ] Provider Ready shows "Customized" badge (blue)
- [ ] Each card maintains independent state
- [ ] Can reset one card without affecting others

### Visual Verification
```
▶  Pre-Arrival Message          [Customized]  [SMS] ON
▶  Patient Waiting              [Default ✓]   [Email] ON
▶  Provider Ready               [Customized]  [SMS] ON
```

## Test Scenario 8: Deep Comparison - Non-Template Changes

### Expected Behavior
Changes to ANY setting (not just template) should make it "Customized".

### Steps
1. Reset "Pre-Arrival Message" to defaults
2. Verify badge shows "Default"
3. Expand the card
4. Change the timing (e.g., 15 minutes → 20 minutes)
5. DO NOT change the template
6. Collapse the card

### ✓ Pass Criteria
- [ ] Badge changes to "Customized" even though template unchanged
- [ ] Deep comparison detects timing change
- [ ] Reset button appears when expanded
- [ ] Reset restores timing to default (15 minutes)

## Test Scenario 9: Toggle Enable/Disable

### Expected Behavior
Toggling the enable/disable switch should also trigger customization detection.

### Steps
1. Reset card to defaults if needed
2. Toggle the ON/OFF switch
3. Observe badge state

### ✓ Pass Criteria
- [ ] Toggling enabled state changes badge to "Customized"
- [ ] Reset restores original enabled state
- [ ] Badge accurately reflects all state changes

## Test Scenario 10: Edge Cases

### Test 10A: Reset Already Default Card
**Steps:**
1. Find a card showing "Default" badge
2. Expand it
3. Verify no reset button shown
4. Modify template
5. Click reset immediately
6. Observe behavior

**✓ Pass Criteria:**
- [ ] Reset correctly restores to defaults
- [ ] No errors occur
- [ ] Badge updates properly

### Test 10B: Multiple Rapid Modifications
**Steps:**
1. Expand a card
2. Rapidly modify template multiple times
3. Collapse and expand repeatedly
4. Observe badge state

**✓ Pass Criteria:**
- [ ] Badge stays "Customized" throughout
- [ ] No flickering or incorrect states
- [ ] Reset works correctly after rapid changes

### Test 10C: Clear localStorage Mid-Session
**Steps:**
1. Customize several cards
2. Open browser console
3. Run: `localStorage.removeItem('automatedMessageSettings')`
4. Refresh the page

**✓ Pass Criteria:**
- [ ] All cards revert to "Default"
- [ ] No errors in console
- [ ] Settings initialize correctly

## Debugging Checklist

If badges aren't working correctly, check:

### 1. Hook Integration
```typescript
// Component should import and use the hook
import { useAutomatedMessages } from '@/hooks/useAutomatedMessages'

const {
  isUsingDefaults,
  resetToDefaults,
  getSettings
} = useAutomatedMessages()
```

### 2. Props Passed to MessageCard
```typescript
<MessageCard
  isUsingDefaults={isUsingDefaults('event_type')} // Must pass this
  onResetToDefaults={handleReset}                  // Must pass this
  // ... other props
/>
```

### 3. Reset Handler Implementation
```typescript
const handleReset = () => {
  resetToDefaults('event_type');
  const defaults = getSettings('event_type');
  if (defaults) {
    // Must update ALL state variables
    setEnabled(defaults.enabled);
    setTemplate(defaults.template);
    // etc...
  }
};
```

### 4. Settings Update on Change
```typescript
const handleTemplateChange = (newTemplate) => {
  setTemplate(newTemplate);

  // Must also update in hook for tracking
  updateSettings('event_type', {
    template: newTemplate
  });
};
```

## Console Debugging Commands

### Check if settings are stored
```javascript
JSON.parse(localStorage.getItem('automatedMessageSettings'))
```

### Check specific event settings
```javascript
const settings = JSON.parse(localStorage.getItem('automatedMessageSettings'))
console.log(settings.check_in_reminder)
```

### Force reset all settings
```javascript
localStorage.removeItem('automatedMessageSettings')
location.reload()
```

### Compare current vs default
```javascript
const current = JSON.parse(localStorage.getItem('automatedMessageSettings')).check_in_reminder
console.log('Current:', current)
// Compare manually with defaults in hook
```

## Common Issues and Solutions

### Issue: Badge always shows "Default" even after modifications
**Cause:** Not updating settings through the hook
**Solution:** Call `updateSettings()` when template changes

### Issue: Badge always shows "Customized" even after reset
**Cause:** Reset handler not updating all fields
**Solution:** Ensure ALL fields are updated in reset handler

### Issue: Reset button doesn't appear
**Cause:** Missing `onResetToDefaults` prop
**Solution:** Pass reset handler to MessageCard

### Issue: Settings don't persist
**Cause:** Hook not saving to localStorage
**Solution:** Verify hook is called correctly and localStorage is accessible

### Issue: Badge doesn't update immediately
**Cause:** State not triggering re-render
**Solution:** Ensure state updates cause component re-render

## Summary

### What Should Work
✅ Badges show correct state (Default/Customized)
✅ Badges update when template modified
✅ Reset button appears for customized cards
✅ Reset restores all settings to defaults
✅ Settings persist across page refreshes
✅ Multiple cards track independently
✅ Deep comparison detects all changes

### What to Test
1. Initial load - all default
2. Modify template - becomes customized
3. Reset - back to default
4. Persistence - survives refresh
5. Independence - multiple cards work separately
6. Deep changes - non-template changes detected
7. Edge cases - rapid changes, clear storage

### Quick Test Sequence
1. Load page → All "Default" ✓
2. Modify one card → That card "Customized" ✓
3. Reset that card → Back to "Default" ✓
4. Refresh page → State preserved ✓
5. Done! ✓

If all tests pass, the feature is working correctly!
