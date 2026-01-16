# Smart Defaults - Debugging & Verification Guide

## Quick Verification Checklist

Run through this checklist to verify the smart defaults feature is working correctly:

### ✅ Pre-Flight Checks

1. **Files Modified**
   - [ ] `/src/hooks/useAutomatedMessages.ts` - Added `isUsingDefaults()` function
   - [ ] `/src/app/settings/automated-messages/components/MessageCard.tsx` - Added badges and reset button
   - [ ] `/src/app/settings/automated-messages/tabs/CheckInTab.tsx` - Integrated hook and handlers

2. **No TypeScript Errors**
   ```bash
   npx tsc --noEmit | grep "automated-messages"
   ```
   Expected: No errors in automated-messages files

3. **Dev Server Running**
   ```bash
   npm run dev
   ```
   Expected: Server starts on port 3001

---

## 🔍 Manual Testing Steps

### Test 1: Fresh Start (Defaults Load Correctly)

**Objective:** Verify defaults load automatically on first visit

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run: `localStorage.removeItem('automatedMessageSettings')`
4. Navigate to: `http://localhost:3001/settings/automated-messages`
5. Click "Check-In" tab
6. Observe all message cards

**Expected Results:**
- ✅ All cards show green "Default" badges
- ✅ No JavaScript errors in console
- ✅ Cards have correct summary text
- ✅ Toggle switches show correct states

**Debug Console Commands:**
```javascript
// Check if settings loaded
JSON.parse(localStorage.getItem('automatedMessageSettings'))

// Should show object with all event types
// Each should have: id, enabled, channels, timing, template, etc.
```

---

### Test 2: Expansion Shows Success Banner

**Objective:** Verify success banner displays when using defaults

**Steps:**
1. Ensure using defaults (from Test 1)
2. Click on "Pre-Arrival Message" card to expand
3. Look at top of expanded content

**Expected Results:**
- ✅ Card expands smoothly
- ✅ Green success banner appears at top
- ✅ Banner shows checkmark icon
- ✅ Text: "Using Recommended Settings"
- ✅ Description text visible
- ✅ NO reset button visible

**Debug Console:**
```javascript
// Check isUsingDefaults returns true
const settings = JSON.parse(localStorage.getItem('automatedMessageSettings'));
const defaults = /* copy from hook's getDefaultSettings() */;
JSON.stringify(settings.check_in_reminder) === JSON.stringify(defaults.check_in_reminder);
// Should return: true
```

---

### Test 3: Customization Detection

**Objective:** Verify badge changes when settings are modified

**Steps:**
1. With "Pre-Arrival Message" expanded (from Test 2)
2. Find the "Send Timing" section
3. Change minutes from "15" to "30"
4. Click somewhere else to trigger blur/change
5. Observe card header

**Expected Results:**
- ✅ Badge changes from green "Default" to blue "Customized"
- ✅ Success banner disappears
- ✅ "Reset to Recommended Settings" button appears
- ✅ Summary text updates (if collapsed and re-expanded)

**Debug Console:**
```javascript
// Check settings were saved
const settings = JSON.parse(localStorage.getItem('automatedMessageSettings'));
console.log(settings.check_in_reminder.timing);
// Should show modified value

// Check isUsingDefaults returns false
const defaults = /* get defaults */;
JSON.stringify(settings.check_in_reminder) === JSON.stringify(defaults.check_in_reminder);
// Should return: false
```

---

### Test 4: Reset Functionality

**Objective:** Verify reset restores defaults and updates UI

**Steps:**
1. With customized "Pre-Arrival Message" (from Test 3)
2. Ensure card is expanded
3. Click "Reset to Recommended Settings" button
4. Observe changes

**Expected Results:**
- ✅ Badge immediately changes to green "Default"
- ✅ Success banner reappears
- ✅ Reset button disappears
- ✅ Timing value resets to "15"
- ✅ Any other changes revert to defaults

**Debug Console:**
```javascript
// Check settings were reset
const settings = JSON.parse(localStorage.getItem('automatedMessageSettings'));
console.log(settings.check_in_reminder.timing);
// Should show default value (1 hour = 60 minutes for check_in_reminder)

// Verify deep equality
const defaults = /* get defaults */;
JSON.stringify(settings.check_in_reminder) === JSON.stringify(defaults.check_in_reminder);
// Should return: true
```

---

### Test 5: Persistence Across Refresh

**Objective:** Verify customizations persist after page reload

**Steps:**
1. Customize "Pre-Arrival Message" (change timing to 30)
2. Note the blue "Customized" badge
3. Press F5 to refresh the page
4. Navigate back to Check-In tab
5. Observe "Pre-Arrival Message" card

**Expected Results:**
- ✅ Blue "Customized" badge still showing
- ✅ Modified value (30 minutes) preserved
- ✅ No errors on page load

**Then:**
6. Expand card and click "Reset to Recommended Settings"
7. Refresh page again (F5)
8. Navigate back to Check-In tab

**Expected Results:**
- ✅ Green "Default" badge shows after refresh
- ✅ Default value (15 minutes) restored
- ✅ Persistence works both ways

---

### Test 6: Multiple Messages Independence

**Objective:** Verify each message tracks separately

**Steps:**
1. Reset all settings to defaults
2. Customize "Pre-Arrival Message" (change timing)
3. Keep "Patient Waiting Notification" at defaults
4. Observe both cards

**Expected Results:**
- ✅ "Pre-Arrival Message" shows blue "Customized"
- ✅ "Patient Waiting Notification" shows green "Default"
- ✅ Each message tracks independently
- ✅ Resetting one doesn't affect the other

---

### Test 7: Deep Comparison Accuracy

**Objective:** Verify deep comparison detects all changes

**Steps:**
1. Start with defaults
2. Test various modification types:
   - Change a number value (timing)
   - Change a string value (message template)
   - Toggle a boolean (enabled/disabled)
   - Change an array (channels)
3. Verify badge updates each time
4. Change values back to originals
5. Verify badge returns to "Default"

**Expected Results:**
- ✅ Any change triggers "Customized" badge
- ✅ Reverting to exact default restores "Default" badge
- ✅ Deep comparison works for nested objects
- ✅ No false positives or false negatives

---

## 🐛 Common Issues & Solutions

### Issue 1: Badges Not Showing

**Symptom:** No badges appear on cards

**Debug Steps:**
1. Check console for errors
2. Verify props are passed to MessageCard:
   ```typescript
   isUsingDefaults={isUsingDefaults('event_type')}
   onResetToDefaults={handleReset}
   ```
3. Check hook is imported and called
4. Verify hook returns non-null values

**Solution:**
- Ensure `useAutomatedMessages()` is called at component level
- Check that `isUsingDefaults` function exists in hook
- Verify MessageCard receives props

---

### Issue 2: Reset Button Not Working

**Symptom:** Clicking reset does nothing

**Debug Steps:**
1. Add console.log in reset handler:
   ```typescript
   const handleReset = () => {
     console.log('Reset clicked');
     resetToDefaults('event_type');
     console.log('Reset completed');
   }
   ```
2. Check if handler is called
3. Verify `resetToDefaults` function works
4. Check if state is updated after reset

**Solution:**
- Ensure handler is connected to button's onClick
- Verify `resetToDefaults` updates localStorage
- Update component state after reset
- Check if `getSettings()` returns updated values

---

### Issue 3: Deep Comparison Always False

**Symptom:** Badge always shows "Customized" even with defaults

**Debug Steps:**
1. Compare settings manually:
   ```javascript
   const current = settings.check_in_reminder;
   const defaults = getDefaultSettings().check_in_reminder;
   console.log('Current:', JSON.stringify(current, null, 2));
   console.log('Default:', JSON.stringify(defaults, null, 2));
   ```
2. Look for differences in:
   - Property names (typos)
   - Value types (string vs number)
   - Extra properties
   - Date objects (not JSON-serializable)

**Solution:**
- Ensure defaults match current settings structure
- Check for Date objects (convert to strings)
- Verify no extra properties added during save
- Use same serialization for both sides

---

### Issue 4: Settings Not Persisting

**Symptom:** Changes lost after refresh

**Debug Steps:**
1. Check localStorage after changes:
   ```javascript
   localStorage.getItem('automatedMessageSettings')
   ```
2. Verify `updateSettings` is called
3. Check if `saveSettingsToStorage` runs
4. Look for localStorage errors in console

**Solution:**
- Ensure `updateSettings` calls `saveSettingsToStorage`
- Check localStorage quota (unlikely but possible)
- Verify no localStorage errors
- Test in incognito mode (to rule out extensions)

---

### Issue 5: Badge Not Updating After Change

**Symptom:** User changes setting, badge stays green

**Debug Steps:**
1. Check if `updateSettings` is called:
   ```typescript
   const handleChange = (value) => {
     console.log('Updating setting:', value);
     updateSettings('event_type', { /* changes */ });
   }
   ```
2. Verify state updates trigger re-render
3. Check if `isUsingDefaults` is called after update
4. Confirm deep comparison runs on new state

**Solution:**
- Ensure component re-renders after state change
- Call `updateSettings` immediately on change
- Verify `isUsingDefaults` uses latest settings
- Check React key props (no stale cache)

---

## 🔬 Advanced Debugging

### Enable Verbose Logging

Add this to the hook to debug:

```typescript
export function useAutomatedMessages(): UseAutomatedMessagesResult {
  // ... existing code ...

  // Add debug logging
  useEffect(() => {
    console.log('[useAutomatedMessages] Settings:', settings);
  }, [settings]);

  const isUsingDefaults = useCallback((eventType: EventType): boolean => {
    const current = settings[eventType];
    const defaults = getDefaultSettings()[eventType];
    const result = JSON.stringify(current) === JSON.stringify(defaults);

    console.log(`[isUsingDefaults] ${eventType}:`, result);
    console.log('Current:', current);
    console.log('Default:', defaults);

    return result;
  }, [settings]);

  // ... rest of hook ...
}
```

### Check Component Props

Add to MessageCard:

```typescript
export function MessageCard({ ... }: MessageCardProps) {
  console.log('[MessageCard]', {
    title,
    isUsingDefaults,
    hasResetHandler: !!onResetToDefaults
  });

  // ... rest of component ...
}
```

### Monitor localStorage Changes

```javascript
// Run in browser console
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  console.log('localStorage.setItem:', key, value);
  originalSetItem.apply(this, arguments);
};
```

---

## ✅ Verification Complete

Once all tests pass:

1. **Functionality**
   - [ ] Defaults load automatically
   - [ ] Badges display correctly
   - [ ] Customization detection works
   - [ ] Reset functionality works
   - [ ] Persistence works
   - [ ] Independent message tracking

2. **User Experience**
   - [ ] First-time setup requires zero config
   - [ ] Visual feedback is clear
   - [ ] Reset is obvious and works
   - [ ] No confusing states

3. **Code Quality**
   - [ ] No console errors
   - [ ] No TypeScript errors
   - [ ] Clean localStorage structure
   - [ ] Proper React patterns

4. **Performance**
   - [ ] No unnecessary re-renders
   - [ ] Fast load times
   - [ ] Smooth interactions
   - [ ] Efficient deep comparison

---

## 📝 Test Results Template

Use this template to document your testing:

```markdown
## Smart Defaults Testing - [Date]

**Tester:** [Name]
**Environment:** [Local / Staging / Production]
**Browser:** [Chrome / Firefox / Safari]

### Test Results

| Test | Status | Notes |
|------|--------|-------|
| 1. Defaults Load | ✅ / ❌ | |
| 2. Success Banner | ✅ / ❌ | |
| 3. Customization Detection | ✅ / ❌ | |
| 4. Reset Functionality | ✅ / ❌ | |
| 5. Persistence | ✅ / ❌ | |
| 6. Multiple Messages | ✅ / ❌ | |
| 7. Deep Comparison | ✅ / ❌ | |

### Issues Found
- [List any issues]

### Performance Notes
- [Any performance observations]

### Recommendations
- [Any suggestions]
```

---

**Ready to test!** Follow the manual testing steps above and debug any issues using the troubleshooting guide.
