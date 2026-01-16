# AppointmentBookedTab - Testing & Usage Guide

## How to Access

### Navigation Path
```
1. Start the development server: npm run dev
2. Navigate to: http://localhost:3000/settings
3. Look for "Automated Messages" in the Settings menu
4. Click to open: /settings/automated-messages
5. Select the "Appointment Booked" tab
```

### Direct URL
```
http://localhost:3000/settings/automated-messages
```

## What to Test

### 1. Confirmation Section
**Test Email Confirmation:**
- [ ] Click toggle - should turn on/off (purple when on)
- [ ] Click chevron to expand card
- [ ] Verify expandable content shows
- [ ] Click "Edit Email Template" link (placeholder for now)
- [ ] Email badge should show in header

**Test SMS Confirmation:**
- [ ] Click toggle - should work
- [ ] Expand card
- [ ] Verify SMS preview text displays
- [ ] Check character count shows (156/160)
- [ ] Click "Edit SMS Template" link
- [ ] SMS badge should show in header

**Test Form Request:**
- [ ] Toggle should be OFF by default
- [ ] Turn it ON - expand to see content
- [ ] Verify blue info banner displays
- [ ] Check both Email + SMS badges show
- [ ] Verify list of forms displays

### 2. Internal Notifications
**Test Online Booking Notification:**
- [ ] Toggle should be ON by default
- [ ] Blue bell icon visible
- [ ] Description text clear
- [ ] Toggle switch works smoothly

**Test Staff Booking Notification:**
- [ ] Toggle should be OFF by default
- [ ] Icon grayed out when disabled
- [ ] Icon colored when enabled
- [ ] Toggle works

**Test Recipients Box:**
- [ ] Box hidden when both notifications OFF
- [ ] Box appears when any notification ON
- [ ] Users icon and text visible
- [ ] "Configure" link present

### 3. Message Timeline (TimelineConfigurator)
**Visual Elements:**
- [ ] Gradient line visible (gray to pink)
- [ ] 4 reminder dots display
- [ ] 3 reminders active (colored)
- [ ] 1 reminder inactive (gray)
- [ ] Appointment marker at end (pink)
- [ ] All icons render correctly

**Timeline Interaction:**
- [ ] Click "Add Message" button
- [ ] New reminder appears in timeline
- [ ] Timeline re-sorts by time
- [ ] New reminder defaults to 12 hours

**Toggle Reminders:**
- [ ] Click toggle on active reminder
- [ ] Dot should gray out
- [ ] Active indicator disappears
- [ ] Toggle back on - colors return

**Remove Reminders:**
- [ ] Click trash icon
- [ ] Reminder removed from list
- [ ] Timeline updates immediately
- [ ] Footer counts update

**Footer Stats:**
- [ ] Shows correct active count
- [ ] Shows correct total count
- [ ] Updates when toggling
- [ ] Updates when adding/removing

### 4. Confirmation Request
**Reply C to Confirm:**
- [ ] Toggle should be ON by default
- [ ] Description explains functionality
- [ ] Toggle works smoothly

**Set Status Unconfirmed:**
- [ ] Checkbox visible when toggle ON
- [ ] Checkbox hidden when toggle OFF
- [ ] Checkbox checked by default
- [ ] Click to uncheck works
- [ ] Nested indentation correct

**Info Box:**
- [ ] Green box visible when enabled
- [ ] Checkmark icon displays
- [ ] Text explains auto-updates
- [ ] Box hidden when disabled

### 5. Same-Day Reminder
- [ ] Toggle ON by default
- [ ] Clock icon visible
- [ ] Description mentions 9 AM
- [ ] Toggle works
- [ ] Icon color changes with state

### 6. Action Buttons
**Cancel Button:**
- [ ] Gray styling
- [ ] Hover effect works
- [ ] Click does nothing (mock)

**Save Changes Button:**
- [ ] Purple styling
- [ ] Checkmark icon visible
- [ ] Hover effect works
- [ ] Click does nothing (mock)

## Visual Testing

### Colors
- [ ] Purple primary (#9333EA) used consistently
- [ ] Green for confirmations (#10B981)
- [ ] Blue for notifications (#3B82F6)
- [ ] Amber for warnings (#F59E0B)
- [ ] Gray for disabled (#6B7280)

### Typography
- [ ] Headers are bold and clear
- [ ] Body text readable
- [ ] Icon sizes consistent
- [ ] Proper spacing throughout

### Layout
- [ ] Cards have proper shadows
- [ ] Borders consistent
- [ ] Padding uniform
- [ ] Rounded corners consistent
- [ ] No overlapping elements

### Responsive (resize browser)
**Desktop (>768px):**
- [ ] Full width layout
- [ ] All cards visible
- [ ] Timeline expands properly

**Tablet (481-768px):**
- [ ] Cards stack nicely
- [ ] Text remains readable
- [ ] Buttons full width

**Mobile (<480px):**
- [ ] Single column layout
- [ ] Toggle switches work
- [ ] Timeline readable
- [ ] No horizontal scroll

## State Testing

### Initial State
```javascript
// Expected defaults when page loads:
- Email confirmation: ON
- SMS confirmation: ON
- Form request: OFF
- Online booking notification: ON
- Staff booking notification: OFF
- 7-day reminder: ON
- 3-day reminder: ON
- 1-day reminder: ON
- 2-hour reminder: OFF
- Reply-to-confirm: ON
- Set unconfirmed: ON (checked)
- Same-day reminder: ON
```

### State Changes
**Toggle any switch:**
- [ ] State updates immediately
- [ ] UI reflects change instantly
- [ ] Dependent UI updates (conditional rendering)
- [ ] No console errors

**Add reminder:**
- [ ] New reminder appears
- [ ] Unique ID assigned
- [ ] Default values set
- [ ] Timeline resorts

**Remove reminder:**
- [ ] Removed from state
- [ ] UI updates immediately
- [ ] Counts update

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Performance

- [ ] Page loads quickly
- [ ] No lag when toggling
- [ ] Timeline renders smoothly
- [ ] No memory leaks (dev tools)
- [ ] No unnecessary re-renders

## Accessibility

### Keyboard Navigation
- [ ] Tab through all toggles
- [ ] Space/Enter activates toggles
- [ ] Focus indicators visible
- [ ] Logical tab order

### Screen Reader
- [ ] Toggle labels announced
- [ ] States announced (on/off)
- [ ] Headings hierarchical
- [ ] Descriptions clear

### Visual
- [ ] Color contrast sufficient
- [ ] Text size readable
- [ ] Icons meaningful
- [ ] No color-only indicators

## Console Checks

**Open DevTools Console:**
- [ ] No errors
- [ ] No warnings
- [ ] No 404s for assets
- [ ] No TypeScript errors

## Known Limitations (By Design)

1. **Save button doesn't persist** - Mock state only
2. **Edit template links** - Placeholders for future implementation
3. **Configure recipients** - Placeholder link
4. **No backend integration** - All state in-memory
5. **Build error** - Unrelated InteractiveFaceChart issue exists

## Common Issues & Solutions

### Toggle doesn't work
- Check browser console for errors
- Verify React state hooks initialized
- Ensure proper event handlers

### Timeline doesn't display
- Check reminders array has data
- Verify TimelineConfigurator imported
- Check for TypeScript errors

### Cards don't expand
- Verify MessageCard component working
- Check defaultExpanded prop
- Ensure children content present

### Styles look wrong
- Verify Tailwind CSS loaded
- Check for conflicting CSS
- Clear browser cache

## Next Steps

After testing is complete:

1. **Backend Integration:**
   - Connect to API endpoints
   - Save settings to database
   - Load saved settings on mount

2. **Template Editing:**
   - Build template editor modal
   - Add template preview
   - Support token insertion

3. **Testing Suite:**
   - Add Jest/React Testing Library tests
   - Add Cypress E2E tests
   - Test state management

4. **Documentation:**
   - User guide for staff
   - Admin documentation
   - API documentation

## Support

For issues or questions:
- Check component file: `AppointmentBookedTab.tsx`
- Review components: `MessageCard.tsx`, `TimelineConfigurator.tsx`
- Check parent page: `page.tsx`
- Review documentation files in repo

---

**Testing Status:** Ready for manual testing
**Last Updated:** January 8, 2026
