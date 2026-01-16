# Advanced Section - Testing Guide

## Overview
This guide helps you test the new expandable "Advanced" sections in the Automated Messages settings.

## What Was Implemented

### 1. Reusable AdvancedSection Component
- Location: `/src/app/settings/automated-messages/components/AdvancedSection.tsx`
- Features:
  - Expandable/collapsible section with toggle button
  - "Advanced options ▼" label when collapsed
  - "Advanced options ▲" label when expanded
  - Default collapsed state (hidden by default)
  - Purple-themed button matching app design

### 2. AppointmentBookedTab Updates
- Location: `/src/app/settings/automated-messages/tabs/AppointmentBookedTab.tsx`
- What's Hidden: **Booking Source Toggle**
  - Controls which types of bookings trigger automated messages
  - Online bookings toggle
  - Staff-made bookings toggle

### 3. WaitlistTab Updates
- Location: `/src/app/settings/automated-messages/tabs/WaitlistTab.tsx`
- What's Hidden: **Auto-Offer Settings** (entire section)
  - Response time limit configuration
  - Maximum offers per slot
  - Auto-skip to next patient option
  - How auto-offer works explanation

## How to Test

### Test 1: AppointmentBookedTab - Booking Source Toggle

1. **Navigate to the page:**
   ```
   Settings → Automated Messages → Appointment Booked tab
   ```

2. **Initial State (Collapsed):**
   - Scroll to the bottom of the page (above the Save button)
   - You should see a white card with:
     - Purple text link: "Advanced options ▼"
     - No booking source toggles visible
   - ✅ Confirm: Advanced options are hidden by default

3. **Expand Advanced Section:**
   - Click "Advanced options ▼"
   - The section should expand to show:
     - Heading: "Booking Source Toggle"
     - Description: "Control which types of bookings trigger automated messages"
     - Two toggle cards:
       1. Online Bookings toggle
       2. Staff-Made Bookings toggle
   - The link text changes to: "Advanced options ▲"
   - ✅ Confirm: All content appears correctly

4. **Test Functionality:**
   - Toggle "Online Bookings" on/off
   - Toggle "Staff-Made Bookings" on/off
   - ✅ Confirm: Toggles work correctly

5. **Collapse Advanced Section:**
   - Click "Advanced options ▲"
   - Section should smoothly collapse
   - Only the purple link "Advanced options ▼" remains visible
   - ✅ Confirm: Content is hidden again

### Test 2: WaitlistTab - Auto-Offer Settings

1. **Navigate to the page:**
   ```
   Settings → Automated Messages → Waitlist tab
   ```

2. **Initial State (Collapsed):**
   - Scroll to the "Auto-Offer Settings" area
   - You should see a white card with:
     - Purple text link: "Advanced options ▼"
     - No auto-offer configuration visible
   - ✅ Confirm: Advanced options are hidden by default

3. **Expand Advanced Section:**
   - Click "Advanced options ▼"
   - The section should expand to show:
     - Heading: "Auto-Offer Settings" with enable/disable toggle
     - Response Time Limit input fields
     - Maximum Offers per Slot input
     - Auto-skip checkbox
     - Blue info box explaining how auto-offer works
   - The link text changes to: "Advanced options ▲"
   - ✅ Confirm: All content appears correctly

4. **Test Functionality:**
   - Toggle "Auto-Offer Settings" on/off (main toggle)
   - Change response time limit (number and unit)
   - Change maximum offers
   - Toggle auto-skip option
   - ✅ Confirm: All controls work correctly

5. **Collapse Advanced Section:**
   - Click "Advanced options ▲"
   - Section should smoothly collapse
   - Only the purple link "Advanced options ▼" remains visible
   - ✅ Confirm: Content is hidden again

### Test 3: State Persistence

1. **Test state during session:**
   - Expand an advanced section
   - Make some changes (toggle settings)
   - Collapse the section
   - Expand it again
   - ✅ Confirm: Changes are preserved

2. **Test navigation:**
   - Expand advanced section in AppointmentBooked tab
   - Switch to Waitlist tab
   - Switch back to AppointmentBooked tab
   - ✅ Confirm: Section returns to collapsed state (expected behavior)

### Test 4: Multiple Sections

1. **Test both tabs:**
   - Expand advanced section in AppointmentBooked tab
   - Verify it works
   - Navigate to Waitlist tab
   - Expand advanced section there
   - Verify it works independently
   - ✅ Confirm: Each section operates independently

## Visual Checklist

### Collapsed State
- [ ] Purple "Advanced options ▼" link visible
- [ ] No advanced content visible
- [ ] Clean, uncluttered UI
- [ ] Chevron down icon (▼) displayed

### Expanded State
- [ ] Purple "Advanced options ▲" link visible
- [ ] All advanced content visible
- [ ] Proper spacing and layout
- [ ] Chevron up icon (▲) displayed

### Interaction
- [ ] Click toggles expand/collapse
- [ ] Smooth transition (no jerky movement)
- [ ] Button has hover state (darker purple)
- [ ] All nested controls still functional

### Styling
- [ ] Matches app's purple theme (#7C3AED / purple-600)
- [ ] Consistent with other settings sections
- [ ] Border-top separator visible (collapsed state)
- [ ] Proper padding and margins

## Expected Behavior

### Default State
- Both advanced sections start **collapsed**
- Only power users who click "Advanced options" will discover these features
- Main settings page is cleaner and less overwhelming

### Expanded State
- Clicking toggles the section
- Content appears below the "Advanced options" button
- All functionality within the section works normally
- Settings can be modified as usual

### Persistence
- Section state (expanded/collapsed) is **not persisted** across page refreshes
- Always starts collapsed (by design)
- User preferences within the section **are persisted** when saved

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (if applicable)
- [ ] Mobile Chrome (if applicable)

## Accessibility Testing

- [ ] Button is keyboard accessible (Tab to focus)
- [ ] Enter/Space key toggles expand/collapse
- [ ] Screen reader announces button purpose
- [ ] Focus visible on the button
- [ ] Content within section is keyboard accessible

## Common Issues & Solutions

### Issue: Section doesn't expand
- **Check**: Is JavaScript enabled?
- **Check**: Are there console errors?
- **Solution**: Clear browser cache and reload

### Issue: Content looks broken when expanded
- **Check**: Browser window width
- **Solution**: Ensure responsive breakpoints work correctly

### Issue: Toggles within section don't work
- **Check**: Are there conflicting event handlers?
- **Solution**: Check browser console for errors

### Issue: Section re-expands after collapse
- **Check**: Is there competing state management?
- **Solution**: Verify useState is working correctly

## Success Criteria

✅ **Implementation is successful if:**

1. Advanced sections are hidden by default on both tabs
2. Clicking "Advanced options" reliably expands/collapses the section
3. All functionality within expanded sections works correctly
4. UI is clean and matches existing design patterns
5. No TypeScript or build errors
6. Works across different browsers
7. Keyboard accessible
8. Responsive on different screen sizes

## Next Steps

After testing, consider:
- Adding animation/transition for smooth expand/collapse
- Adding aria-labels for better accessibility
- Persisting expand/collapse state in user preferences (optional)
- Using this pattern for other advanced settings throughout the app
