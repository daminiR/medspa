# Message Delivery Status - Test Checklist

## Pre-Testing Setup
- [ ] Start development server: `npm run dev`
- [ ] Navigate to: http://localhost:3000/messages (or http://localhost:3001/messages)
- [ ] Open browser console (F12) to monitor for errors

## Test 1: View Failed Message
**Location**: Christina Lee conversation (ID: 9)

- [ ] Select "Christina Lee" from conversation list
- [ ] Scroll down to view all messages
- [ ] Verify last clinic message shows:
  - Red X icon
  - "Failed" text in red
  - Alert icon (⚠️) for error details
  - Retry button (⟲ circular arrow icon)
- [ ] Hover over status badge → Should show timestamp tooltip
- [ ] No console errors

**Expected Result**:
```
Message: "That's completely normal! The swelling should subside within 24-48 hours. Keep applying ice."
Status: ✕ Failed (red) with retry button
```

## Test 2: Retry Failed Message
**Continue from Test 1**

- [ ] Click the retry button (⟲)
- [ ] Status immediately changes to "Sending..." with animated spinner
- [ ] Wait 2 seconds
- [ ] Status changes to "Delivered" with blue double checkmark
- [ ] No console errors

**Expected Flow**:
```
Initial:  ✕ Failed (red)
Click:    ⟳ Sending... (gray, animated)
After 2s: ✓✓ Delivered (blue)
```

## Test 3: Send New Message
**Use any open conversation**

- [ ] Select any conversation from the list
- [ ] Type a test message in the composer
- [ ] Click "Send" button (or press Enter)
- [ ] Message appears immediately at bottom
- [ ] Status shows "Sending..." with animated spinner (gray)
- [ ] Wait 2 seconds
- [ ] Status changes to "Delivered" with blue double checkmark
- [ ] No console errors

**Expected Flow**:
```
Send:     Message appears with ⟳ Sending... (gray, animated)
After 2s: Status changes to ✓✓ Delivered (blue)
```

## Test 4: Multiple Messages
**Send several messages in succession**

- [ ] Select a conversation
- [ ] Send 3 messages quickly (one after another)
- [ ] All messages show "Sending..." initially
- [ ] Each transitions to "Delivered" after 2 seconds
- [ ] Transitions happen independently for each message
- [ ] No console errors

**Expected Result**: Each message transitions independently at 2-second intervals

## Test 5: Status Persistence
**Verify status survives UI changes**

- [ ] Send a new message
- [ ] While it's in "Sending..." state, switch to another conversation
- [ ] Switch back to the original conversation
- [ ] Verify status has updated to "Delivered" (if 2 seconds elapsed)
- [ ] No console errors

**Expected Result**: Status updates persist across conversation switches

## Test 6: Timestamp Tooltips
**Test hover tooltips on all status types**

For delivered message:
- [ ] Hover over "Delivered" status badge
- [ ] Tooltip appears with exact timestamp (e.g., "Dec 15, 14:35:22")

For sending message:
- [ ] Send new message
- [ ] Hover over "Sending..." status while animated
- [ ] Tooltip shows current time

For failed message:
- [ ] View Christina Lee conversation
- [ ] Hover over "Failed" status
- [ ] Tooltip shows timestamp when it failed

**Expected Result**: All status badges show timestamp tooltips on hover

## Test 7: Visual Consistency
**Check all status types display correctly**

Find or create messages with each status:
- [ ] Sending: Gray animated spinner + "Sending..."
- [ ] Delivered: Blue double checkmark + "Delivered"
- [ ] Failed: Red X + "Failed" + alert icon + retry button

**Expected Result**: All statuses use correct colors, icons, and styling

## Test 8: Accessibility
**Test keyboard navigation and screen reader compatibility**

- [ ] Tab through messages page
- [ ] Retry button is keyboard accessible (Tab to focus, Enter to activate)
- [ ] Status icons have proper aria-labels
- [ ] All interactive elements can be reached via keyboard

**Expected Result**: Full keyboard accessibility

## Test 9: Message Type Indicators
**Verify automated vs manual message styling**

- [ ] All test messages should show as "manual" type
- [ ] Manual messages: Regular clinic avatar (CS)
- [ ] Manual messages: Purple gradient bubble
- [ ] Status displays correctly for both types

**Expected Result**: Manual messages display with correct styling

## Test 10: Edge Cases

### Empty conversation
- [ ] Select conversation with no messages
- [ ] Send first message
- [ ] Status transitions work correctly

### Very long message
- [ ] Send a very long message (200+ characters)
- [ ] Status displays correctly without layout issues

### Rapid clicking retry
- [ ] View failed message
- [ ] Click retry multiple times quickly
- [ ] No duplicate messages created
- [ ] Status updates correctly

**Expected Result**: All edge cases handled gracefully

## Console Checks

During all tests, verify NO errors of these types:
- [ ] No TypeScript errors
- [ ] No React rendering errors
- [ ] No "Cannot read property" errors
- [ ] No infinite loop warnings
- [ ] No memory leak warnings

## Performance Checks

- [ ] Message list scrolls smoothly
- [ ] Status updates don't cause lag
- [ ] No visible jank during transitions
- [ ] Timeouts clean up properly (no memory leaks)

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

**Expected Result**: Works identically across browsers

## Final Verification

- [ ] All tests passed
- [ ] No console errors
- [ ] Visual design matches existing components
- [ ] Status icons are intuitive and clear
- [ ] Retry functionality works reliably
- [ ] Timestamps display correctly

## Known Issues / Future Work

1. **Read Status**: Currently not implemented, requires webhook integration
2. **Real API**: Using mock setTimeout, needs actual SMS provider integration
3. **Error Messages**: Not displaying specific error reasons yet
4. **Bulk Retry**: No batch retry for multiple failed messages
5. **Network Errors**: Not simulating network failure scenarios

## Success Criteria

✅ All status types display with correct icons and colors
✅ Messages start in 'sending' state when sent
✅ Automatic transition to 'delivered' after 2 seconds
✅ Failed messages show retry button
✅ Retry functionality works correctly
✅ No console errors during any test
✅ Timestamps display on hover
✅ Visual design matches existing components
