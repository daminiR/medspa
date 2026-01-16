# After-Hours Auto-Responder - Test Plan

## Features Implemented

### 1. Auto-Responder Toggle
- **Location**: Top-right of "After-Hours Auto-Responder" section
- **Functionality**: Master switch to enable/disable the auto-responder
- **States**:
  - ON (purple): Auto-responder enabled
  - OFF (gray): Auto-responder disabled

### 2. Out of Office Quick Toggle
- **Location**: Next to the auto-responder toggle
- **Functionality**: Manual override to activate auto-responder 24/7
- **States**:
  - "Out of Office" (orange): Always send auto-responses
  - "In Office" (gray): Use normal business hours logic
- **Toast Notification**: Shows confirmation when toggled

### 3. Business Hours Configuration
- **Location**: "Default Sender Settings" section
- **Fields**:
  - Business Hours Start (time picker)
  - Business Hours End (time picker)
- **Usage**: Defines when auto-responder should NOT be active

### 4. Auto-Reply Message Template
- **Location**: Within the auto-responder section (when enabled)
- **Features**:
  - Customizable textarea for message content
  - Character counter (160 chars = 1 SMS segment)
  - Warning for multi-segment messages
  - Placeholder text for guidance

### 5. Message Preview
- **Location**: Below message template (toggle with "Preview" button)
- **Features**:
  - iPhone-style message bubble preview
  - Shows clinic name and phone number
  - Displays actual message content
  - "Active Now" badge when auto-responder is currently active
  - Real-time preview updates as you type

### 6. Quick Templates
- **Location**: Below preview section
- **Templates Provided**:
  1. **Standard After-Hours**: Basic message with emergency contact
  2. **Friendly Casual**: More casual and approachable tone
  3. **Professional Detailed**: Includes business hours and clinic details

## Testing Instructions

### Test 1: Enable/Disable Auto-Responder
1. Navigate to `/settings/sms`
2. Scroll to "After-Hours Auto-Responder" section
3. Click the toggle on the right
4. **Expected**: Section content should show/hide
5. **Expected**: "Save Changes" button should activate

### Test 2: Out of Office Mode
1. Click the "In Office" button
2. **Expected**: Button changes to "Out of Office" (orange)
3. **Expected**: Warning banner appears explaining OOO mode
4. **Expected**: Toast notification shows success message
5. Click again to toggle back
6. **Expected**: Returns to "In Office" state

### Test 3: Business Hours Logic
1. Set business hours to 9:00 AM - 6:00 PM
2. Check the status text below the description
3. **Expected**: Shows "(Currently within business hours)" or "(Currently after hours - auto-responder active)"
4. The status should update based on current time

### Test 4: Message Template Editing
1. Edit the message in the textarea
2. **Expected**: Character counter updates in real-time
3. Type more than 160 characters
4. **Expected**: Warning shows segment count
5. **Expected**: "Save Changes" button activates

### Test 5: Preview Functionality
1. Click "Preview" button
2. **Expected**: iPhone-style message preview appears
3. **Expected**: Shows clinic initials in avatar
4. **Expected**: Displays clinic name and phone number
5. **Expected**: Shows message content exactly as entered
6. Edit the message
7. **Expected**: Preview updates immediately
8. Click "Hide" button
9. **Expected**: Preview collapses

### Test 6: Active Status Indicator
1. When auto-responder is enabled and it's after hours (or OOO mode)
2. Show preview
3. **Expected**: "Active Now" green badge appears in preview header

### Test 7: Quick Templates
1. Click "Standard After-Hours" template
2. **Expected**: Message textarea updates with template content
3. **Expected**: "Save Changes" button activates
4. Try other templates
5. **Expected**: Each template loads correctly

### Test 8: Disabled State
1. Turn off auto-responder toggle
2. **Expected**: All controls disappear
3. **Expected**: Gray box appears saying "Auto-responder is currently disabled"

### Test 9: Save Functionality
1. Make any changes
2. **Expected**: "Save Changes" button becomes active (purple)
3. Click "Save Changes"
4. **Expected**: Toast notification shows "SMS settings saved successfully"
5. **Expected**: Button becomes disabled again

## Edge Cases to Test

### Edge Case 1: Character Limits
- Test with exactly 160 characters
- Test with 161 characters (should show "2 SMS segments")
- Test with 320+ characters

### Edge Case 2: Business Hours Validation
- Set start time after end time
- Set identical start/end times
- Test at exact boundary times (e.g., 9:00:00 AM)

### Edge Case 3: OOO + Auto-Responder OFF
- Turn off auto-responder
- Enable OOO mode
- **Expected**: OOO button should still toggle but have no effect (or be disabled)

### Edge Case 4: Empty Message
- Clear all message content
- **Expected**: Preview should handle empty state gracefully
- **Expected**: Consider validation before save

## Visual Checks

- [ ] Toggle animations are smooth
- [ ] OOO button color transitions properly
- [ ] Preview bubble looks like an iPhone message
- [ ] Character counter is visible and readable
- [ ] Template buttons have hover states
- [ ] Disabled toggle is clearly different from enabled
- [ ] All icons render correctly (Moon, Sun, Eye, etc.)
- [ ] Responsive design works on mobile

## Accessibility Checks

- [ ] All buttons have clear labels
- [ ] Toggle states are visually distinct
- [ ] Color contrast meets WCAG guidelines
- [ ] Keyboard navigation works
- [ ] Screen reader announces toggle states

## Performance

- [ ] Character counter updates smoothly (no lag)
- [ ] Preview renders quickly
- [ ] Toggle animations don't cause jank
- [ ] No console errors or warnings

## Known Limitations

1. Mock data only - no backend persistence yet
2. Business hours don't account for:
   - Different hours per day of week
   - Holidays
   - Time zones
3. No history of when auto-responder was active
4. No logs of sent auto-responses
5. Character counter is simplified (doesn't account for Unicode)

## Future Enhancements

1. Schedule-based auto-responder (e.g., "Out Dec 24-26")
2. Different messages for different times/days
3. Smart detection of emergency keywords
4. Analytics on auto-response engagement
5. A/B testing different message templates
6. Integration with calendar for automatic OOO mode
