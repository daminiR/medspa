# Simple Mode vs Advanced Mode - Testing Checklist

## Implementation Summary
Added Simple/Advanced Mode toggle to automated messages settings page.

## Features Implemented

### 1. Toggle UI
- ✅ Toggle at top of page with "Simple Mode" and "Advanced Mode" buttons
- ✅ Uses Sparkles icon for Simple Mode
- ✅ Uses Settings icon for Advanced Mode
- ✅ Visual feedback showing active mode (purple background)
- ✅ Smooth transitions between modes

### 2. Simple Mode Behavior
**Visible Tabs (3 tabs):**
- ✅ Appointment Booked
- ✅ Appointment Canceled
- ✅ Check-In

**Hidden Tabs (5 tabs):**
- ✅ Form Submitted
- ✅ Waitlist
- ✅ Sale Closed
- ✅ Gift Cards
- ✅ Memberships

### 3. Advanced Mode Behavior
- ✅ Shows all 8 tabs (all tabs visible)
- ✅ No restrictions

### 4. LocalStorage Persistence
- ✅ Preference saved to localStorage key: `automatedMessagesViewMode`
- ✅ Loads saved preference on page mount
- ✅ Defaults to "simple" mode for new users

### 5. Tab Reset Logic
- ✅ When switching from Advanced → Simple, if current tab is hidden, automatically switches to first visible tab
- ✅ Prevents showing content for hidden tabs

### 6. Visual Indicators
- ✅ Help text below toggle: "Simple Mode: Showing essential message types only. Switch to Advanced Mode for more options."
- ✅ Only shows in Simple Mode

## Manual Testing Steps

1. **Initial Load Test**
   - Open page for first time
   - Should default to Simple Mode
   - Should show 3 tabs only
   - Check localStorage has `automatedMessagesViewMode: "simple"`

2. **Toggle Test**
   - Click "Advanced Mode"
   - Should show all 8 tabs
   - Check localStorage updated to "advanced"
   - Click "Simple Mode"
   - Should hide 5 tabs again

3. **Tab Reset Test**
   - Switch to Advanced Mode
   - Click on "Gift Cards" tab
   - Switch to Simple Mode
   - Should automatically switch to "Appointment Booked" tab

4. **Persistence Test**
   - Set to Advanced Mode
   - Refresh page
   - Should still be in Advanced Mode
   - Set to Simple Mode
   - Refresh page
   - Should still be in Simple Mode

5. **Visual Feedback Test**
   - Active mode button should have purple background
   - Inactive mode button should be gray
   - Help text should only show in Simple Mode

## Browser Console Tests

```javascript
// Test 1: Check localStorage
localStorage.getItem('automatedMessagesViewMode')

// Test 2: Force Simple Mode
localStorage.setItem('automatedMessagesViewMode', 'simple')
location.reload()

// Test 3: Force Advanced Mode
localStorage.setItem('automatedMessagesViewMode', 'advanced')
location.reload()

// Test 4: Clear preference
localStorage.removeItem('automatedMessagesViewMode')
location.reload()
```

## Expected Results

### Simple Mode
- Only 3 tabs visible: Appointment Booked, Appointment Canceled, Check-In
- Purple help text visible
- Sparkles button highlighted

### Advanced Mode
- All 8 tabs visible
- No help text
- Settings button highlighted

## File Changes
- `/src/app/settings/automated-messages/page.tsx` - Main implementation
- Imports CheckInTab component (was previously not used)
- Added localStorage persistence
- Added view mode state management
- Added tab filtering logic
- Added mode toggle UI

## Notes
- Default mode is "simple" for new users (better UX)
- Advanced users can easily switch to see all options
- Preference persists across sessions
- Smooth transitions and visual feedback
