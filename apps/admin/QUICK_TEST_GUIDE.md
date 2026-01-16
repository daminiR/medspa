# Quick Test Guide - Feature Flags

## Quick Start Test (2 minutes)

### 1. Open the Page
Navigate to: `/settings/automated-messages`

### 2. Check Initial State
**Simple Mode (default):**
```
Should see: [Appointment Booked] [Appointment Canceled] [Check-In]
Should NOT see: + Add Type button
```

### 3. Switch to Advanced Mode
Click "Advanced Mode" button (top right)

**Should now see:**
```
[Appointment Booked] [Appointment Canceled] [Check-In] [Sale Closed]
[Form Submitted] [+ Add Type]
```

### 4. Enable a Feature
1. Click **"+ Add Type"** button
2. Modal opens
3. Click on **"Waitlist"** row
4. Toggle turns purple
5. Click **"Done"**
6. **Waitlist tab appears!**

### 5. Disable the Feature
1. Click **"+ Add Type"** again
2. Click **"Waitlist"** (now purple)
3. Toggle turns gray
4. Click **"Done"**
5. **Waitlist tab disappears!**

### 6. Verify Persistence
1. Enable Waitlist again
2. Refresh the page (F5)
3. Go to Advanced Mode
4. **Waitlist tab should still be there**

## Browser Console Tests

### View Current Flags
```javascript
JSON.parse(localStorage.getItem('featureFlags'))
```

### Enable All Features
```javascript
localStorage.setItem('featureFlags', JSON.stringify({
  hasMemberships: true,
  hasGiftCards: true,
  hasWaitlist: true
}))
location.reload()
```

### Expected Result
All 8 tabs visible in Advanced Mode:
1. Appointment Booked
2. Appointment Canceled
3. Check-In
4. Sale Closed
5. Form Submitted
6. Waitlist
7. Gift Cards
8. Memberships

**+ Add Type button disappears** (all features enabled)

### Disable All Features
```javascript
localStorage.setItem('featureFlags', JSON.stringify({
  hasMemberships: false,
  hasGiftCards: false,
  hasWaitlist: false
}))
location.reload()
```

### Expected Result
Back to 5 tabs in Advanced Mode (Waitlist, Gift Cards, Memberships hidden)

## Edge Cases to Test

### Test 1: Mode Switching While on Hidden Tab
1. Enable Waitlist
2. Switch to Advanced Mode
3. Click on Waitlist tab
4. Switch to Simple Mode
5. **Expected:** Auto-switches to first visible tab

### Test 2: Disable While Viewing Tab
1. Enable Gift Cards
2. Go to Gift Cards tab
3. Click + Add Type
4. Disable Gift Cards
5. Click Done
6. **Expected:** Auto-switches to first visible tab

### Test 3: All Features Enabled
1. Enable all three features
2. **Expected:** + Add Type button disappears
3. Click where button was
4. **Expected:** Nothing happens (button is gone)

### Test 4: Simple Mode (Features Ignored)
1. Enable all features
2. Switch to Simple Mode
3. **Expected:** Only 3 tabs (Appointment Booked, Canceled, Check-In)
4. **Expected:** No + Add Type button

## Visual Checklist

### Modal Appearance ✓
- [ ] Header says "Add Message Types"
- [ ] Close X button in top right
- [ ] Description text below header
- [ ] Each feature shows icon, title, description
- [ ] Toggle switches (purple = on, gray = off)
- [ ] "Done" button at bottom

### Toggle Behavior ✓
- [ ] Clicking row toggles the feature
- [ ] Toggle animates smoothly
- [ ] Background changes color when enabled (purple)
- [ ] Icon changes color (purple when on, gray when off)

### Tab Behavior ✓
- [ ] Tabs appear/disappear instantly
- [ ] Active tab auto-switches if hidden
- [ ] Tab order maintained
- [ ] No + Add Type in Simple Mode

## Pass/Fail Criteria

### PASS if:
- ✅ Default shows 3-4 tabs
- ✅ + Add Type appears only in Advanced Mode
- ✅ Modal opens and closes
- ✅ Toggles work
- ✅ Tabs appear/disappear based on toggles
- ✅ Changes persist after refresh
- ✅ Simple Mode shows only 3 tabs

### FAIL if:
- ❌ + Add Type shows in Simple Mode
- ❌ Toggles don't work
- ❌ Tabs don't appear/disappear
- ❌ Changes lost after refresh
- ❌ Crashes or errors in console
- ❌ Modal doesn't open/close

## Common Issues

### Issue: Tabs not appearing
**Fix:** Make sure you're in Advanced Mode

### Issue: + Add Type not showing
**Possible causes:**
1. You're in Simple Mode (switch to Advanced)
2. All features already enabled (check modal)

### Issue: Changes not persisting
**Fix:** Check browser localStorage is enabled

### Issue: Modal won't open
**Check:** Browser console for errors

## Reset Everything
```javascript
localStorage.clear()
location.reload()
```

This resets all settings back to defaults.
