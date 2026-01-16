# Notification System Tests

This directory contains comprehensive integration tests for the notification system, covering both polling and real-time modes.

## Test Files

### 1. `useNotifications.test.ts`
Tests for the core `useNotifications` hook functionality.

**Coverage:**
- Initial state and loading
- Polling mode (with custom intervals)
- Real-time mode (Firebase/Firestore integration)
- Mark as read (with optimistic updates and error handling)
- Mark all as read
- Delete notification
- Clear all notifications
- Sound toggle (localStorage persistence)
- Add notification manually
- Notification type mapping
- Action URL generation
- Unread count calculation
- Duplicate notification prevention

**Key Features Tested:**
- Polling fallback when real-time is unavailable
- Optimistic UI updates with rollback on error
- Sound preferences persisting across sessions
- Real-time notification delivery via websocket
- Duplicate detection and filtering

### 2. `NotificationBell.test.tsx`
Tests for the `NotificationBell` component (the bell icon in the header).

**Coverage:**
- Badge rendering and count display
- Badge animation on new notifications
- Connection status indicator (connected/polling/disconnected)
- Panel open/close functionality
- Click handling
- Browser notification permission requests
- Click outside to close
- Escape key to close
- Accessibility (ARIA attributes, focus management)
- Integration with useNotifications hook

**Key Features Tested:**
- Badge animates (bounces) when new notification arrives
- Badge shows "99+" for counts over 99
- Connection status indicator changes color based on connection state
- Clicking bell opens/closes panel
- Clicking outside panel closes it
- Pressing Escape closes panel
- Proper ARIA labels for screen readers

### 3. `NotificationPanel.test.tsx`
Tests for the `NotificationPanel` component (the dropdown panel).

**Coverage:**
- Panel rendering and layout
- Notification list display
- Loading state
- Empty state
- Sound toggle button
- Mark all as read button (with loading state)
- Clear all button (with loading state)
- Individual notification actions (mark as read, delete)
- Footer link to notifications page
- Button disabled states
- Hover effects
- Large notification lists

**Key Features Tested:**
- Displays unread count badge
- Shows loading spinner while fetching
- Shows empty state when no notifications
- Sound toggle updates icon and calls toggleSound
- Mark all as read shows loading state and disables button
- Clear all shows loading state and disables button
- Individual notifications can be marked as read or deleted
- "View all notifications" link closes panel

### 4. `integration.test.tsx`
End-to-end integration tests for complete user flows.

**Coverage:**
- Complete user flow in polling mode
- Complete user flow in real-time mode
- Sound notifications (play sound, respect toggle)
- Browser notification integration
- Multiple rapid notifications
- Mark all as read with multiple notifications
- Clear all notifications
- Error handling (network errors, failed API calls)
- Fallback behavior (real-time to polling)

**Key Features Tested:**
- User opens panel, new notification arrives via polling, marks as read
- User receives real-time notification, badge animates, notification appears
- Sound plays when new notification arrives (if enabled)
- Sound toggle persists across sessions
- Browser notification shown (if permission granted)
- Multiple notifications handled correctly
- Network errors don't crash the app
- Optimistic updates revert on error
- Falls back to polling when real-time unavailable

## Running Tests

### Run all notification tests:
```bash
npm test -- src/__tests__/notifications/
```

### Run specific test file:
```bash
npm test -- src/__tests__/notifications/useNotifications.test.ts
```

### Run tests in watch mode:
```bash
npm test -- --watch src/__tests__/notifications/
```

### Run tests with UI:
```bash
npm run test:ui
```

### Run tests with coverage:
```bash
npm run test:coverage
```

## Test Patterns

### Mocking Strategy

1. **Fetch API**: Mocked globally to simulate API responses
2. **WebSocket/Firebase**: Mocked to control real-time notification delivery
3. **localStorage**: Mocked to test preference persistence
4. **Audio**: Mocked to verify sound notifications
5. **Browser Notification API**: Mocked to test permission requests and notifications
6. **Next.js Link**: Mocked to avoid routing in tests

### Common Test Utilities

```typescript
// Mock fetch response
mockFetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ items: [...] }),
})

// Mock real-time notification
notificationHandler?.({
  id: 'notif-1',
  type: 'appointment_reminder',
  title: 'Test',
  body: 'Test',
  createdAt: new Date(),
  data: {},
})

// Fast-forward time (polling)
vi.useFakeTimers()
act(() => {
  vi.advanceTimersByTime(30000) // 30 seconds
})
vi.useRealTimers()

// Wait for async updates
await waitFor(() => {
  expect(screen.getByText('Expected text')).toBeDefined()
})
```

### Testing Optimistic Updates

Many operations (mark as read, delete, etc.) use optimistic updates for better UX:

```typescript
// 1. Trigger action
fireEvent.click(markAsReadButton)

// 2. Verify UI updates immediately (optimistic)
expect(notification.read).toBe(true)

// 3. Verify API call was made
await waitFor(() => {
  expect(mockFetch).toHaveBeenCalledWith(...)
})

// 4. Test rollback on error
mockFetch.mockRejectedValueOnce(new Error('API error'))
fireEvent.click(markAsReadButton)
await waitFor(() => {
  expect(notification.read).toBe(false) // Reverted
})
```

## Testing Real-time Notifications

To test real-time notifications:

```typescript
// 1. Enable Firebase
vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

// 2. Capture notification handler
let notificationHandler: Function | null = null
vi.mocked(websocketModule.websocketService.on).mockImplementation(
  (event, handler) => {
    if (event === 'notification.received') {
      notificationHandler = handler
    }
    return vi.fn()
  }
)

// 3. Render component
render(<NotificationBell />)

// 4. Simulate real-time notification
act(() => {
  notificationHandler?.({
    id: 'realtime-1',
    type: 'message_received',
    title: 'New Message',
    body: 'Test',
    createdAt: new Date(),
    data: {},
  })
})

// 5. Verify notification appears
await waitFor(() => {
  expect(screen.getByText('New Message')).toBeDefined()
})
```

## Edge Cases Covered

1. **Duplicate Notifications**: Same notification ID received multiple times
2. **Rapid Notifications**: Multiple notifications arriving in quick succession
3. **Network Errors**: API failures, connection drops
4. **Empty States**: No notifications, no unread notifications
5. **Large Counts**: Badge shows "99+" for counts over 99
6. **Long Lists**: 50+ notifications rendered correctly
7. **Permission Denied**: Browser notification permission denied
8. **Sound Disabled**: Audio doesn't play when sound is off
9. **Real-time Fallback**: Falls back to polling when Firebase unavailable
10. **Optimistic Update Failures**: Reverts UI when API call fails

## Mock Data Examples

### Notification Object
```typescript
{
  id: 'notif-1',
  type: 'appointment_reminder',
  title: 'Appointment Reminder',
  body: 'You have an appointment tomorrow',
  read: false,
  createdAt: new Date('2024-01-15T10:00:00'),
  actionUrl: '/calendar',
  data: {},
  channel: 'in_app',
  priority: 'normal',
}
```

### Notification Types
- `appointment_reminder` → Maps to 'appointment'
- `message_received` → Maps to 'message'
- `waitlist_offer` → Maps to 'alert'
- `billing_reminder` → Maps to 'alert'
- `system_alert` → Maps to 'system'

## Accessibility Testing

Tests verify:
- Proper ARIA attributes (`aria-label`, `aria-expanded`, `aria-haspopup`)
- Keyboard navigation (Escape key to close)
- Focus management
- Screen reader support
- Semantic HTML

## Performance Considerations

Tests verify:
- Debouncing of polling intervals
- Cleanup of event listeners on unmount
- Cleanup of timers on unmount
- No memory leaks from audio elements
- Efficient duplicate detection

## Future Test Additions

Potential areas for additional testing:
1. **Notification Priority**: High priority notifications styled differently
2. **Notification Expiration**: Expired notifications automatically removed
3. **Notification Categories**: Filter by category
4. **Notification Search**: Search/filter notifications
5. **Notification Snooze**: Snooze notifications for later
6. **Batch Operations**: Select multiple and mark as read/delete
7. **Notification Preferences**: Per-type notification settings
8. **Offline Support**: Queue notifications when offline
9. **Push Notifications**: FCM/web push integration
10. **Notification History**: Archive and retrieve old notifications

## Debugging Tests

### Enable verbose logging:
```bash
npm test -- --reporter=verbose src/__tests__/notifications/
```

### Debug specific test:
```typescript
it.only('should do something', async () => {
  // Only this test will run
})
```

### View test coverage:
```bash
npm run test:coverage
```

Coverage reports will be in `coverage/` directory.

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:
- No external dependencies (mocked)
- Deterministic (no real timers, no network calls)
- Fast execution (< 10 seconds for full suite)
- Proper cleanup (no side effects between tests)

## Troubleshooting

### Tests timing out
- Check for missing `await` on async operations
- Verify `waitFor` has appropriate timeout
- Ensure timers are advanced with `vi.advanceTimersByTime()`

### Tests failing intermittently
- Check for race conditions
- Ensure proper cleanup in `beforeEach`/`afterEach`
- Use `waitFor` instead of arbitrary timeouts

### Mocks not working
- Verify mock is called before component renders
- Check mock implementation matches expected interface
- Use `vi.clearAllMocks()` in `beforeEach`

### Audio/Notification API errors
- Ensure global mocks are defined before tests
- Check browser API availability guards in code
- Verify mock constructor/methods match real API

## Contributing

When adding new notification features:
1. Add unit tests for the feature
2. Add integration test for the user flow
3. Update this README with new test coverage
4. Ensure all existing tests still pass
5. Add edge case tests
6. Test error handling
7. Test accessibility
