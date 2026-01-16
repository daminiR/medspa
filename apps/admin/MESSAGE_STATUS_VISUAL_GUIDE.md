# Message Delivery Status - Visual Guide

## Status Icons Reference

### 1. Queued (Gray)
```
⏰ Queued
```
- **Icon**: Clock
- **Color**: Gray (#6B7280)
- **Background**: Light gray (#F9FAFB)
- **Meaning**: Message is queued and waiting to be sent

### 2. Sending (Animated Gray)
```
⟳ Sending...
```
- **Icon**: Loader2 (spinning)
- **Color**: Gray (#6B7280)
- **Background**: Light gray (#F9FAFB)
- **Animation**: Continuous rotation
- **Meaning**: Message is currently being sent

### 3. Sent (Gray)
```
✓ Sent
```
- **Icon**: Single checkmark
- **Color**: Gray (#6B7280)
- **Background**: Light gray (#F9FAFB)
- **Meaning**: Message has been sent but delivery not confirmed

### 4. Delivered (Blue)
```
✓✓ Delivered
```
- **Icon**: Double checkmark
- **Color**: Blue (#2563EB)
- **Background**: Light blue (#EFF6FF)
- **Meaning**: Message delivered to recipient's device

### 5. Read (Green)
```
✓✓ Read (filled)
```
- **Icon**: Double checkmark (filled)
- **Color**: Green (#16A34A)
- **Background**: Light green (#F0FDF4)
- **Meaning**: Recipient has opened/read the message

### 6. Failed (Red)
```
✕ Failed  ⚠️  ⟲
```
- **Icon**: X mark
- **Color**: Red (#DC2626)
- **Background**: Light red (#FEF2F2)
- **Additional**: Alert icon for error details + Retry button
- **Meaning**: Message delivery failed

## Message Thread Layout

```
┌─────────────────────────────────────────────────────┐
│  Message Bubble (Outbound - Clinic)                 │
│  ┌─────────────────────────────────────┐            │
│  │ Your lip filler looks beautiful!    │     [CS]   │
│  │ Apply ice for swelling...           │            │
│  └─────────────────────────────────────┘            │
│           ✓✓ Delivered  📱 2:30 PM                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Message Bubble (Failed - Clinic)                   │
│  ┌─────────────────────────────────────┐            │
│  │ That's completely normal! The       │     [CS]   │
│  │ swelling should subside...          │            │
│  └─────────────────────────────────────┘            │
│           ✕ Failed  ⚠️  ⟲  2:35 PM                   │
└─────────────────────────────────────────────────────┘
          ▲        ▲   ▲
          │        │   └─ Retry Button (click to resend)
          │        └───── Error Info (hover for details)
          └────────────── Failed Status Icon
```

## Status Flow Diagram

```
User sends message
       │
       ▼
┌─────────────┐
│   SENDING   │ ← Gray spinner (animated)
│   (⟳)       │
└─────────────┘
       │
       │ (2 seconds - simulated delivery)
       ▼
┌─────────────┐
│  DELIVERED  │ ← Blue double checkmark
│   (✓✓)      │
└─────────────┘
       │
       │ (when patient opens message - future feature)
       ▼
┌─────────────┐
│    READ     │ ← Green filled double checkmark
│   (✓✓)      │
└─────────────┘

OR if delivery fails:
       │
       ▼
┌─────────────┐
│   FAILED    │ ← Red X with retry button
│    (✕)      │
└─────────────┘
       │
       │ (user clicks retry)
       ▼
┌─────────────┐
│   SENDING   │ ← Back to sending state
│   (⟳)       │
└─────────────┘
```

## Interactive Features

### Hover Behaviors

1. **Hover over any status badge**:
   ```
   ┌───────────────────────┐
   │ Dec 15, 14:35:22      │ ← Tooltip with exact timestamp
   └───────────────────────┘
            ▲
      (on hover)
   ```

2. **Hover over error icon** (failed messages only):
   ```
   ┌────────────────────────────────┐
   │ Message delivery failed:       │
   │ Invalid phone number           │ ← Error details tooltip
   └────────────────────────────────┘
                ▲
      (on hover over ⚠️)
   ```

### Click Actions

1. **Retry button** (⟲):
   - Only visible on failed messages
   - Changes status from 'failed' → 'sending'
   - Attempts delivery again
   - Updates to 'delivered' on success

## Color Scheme

### Status Colors
- **Gray states** (queued, sending, sent): Professional, neutral
- **Blue (delivered)**: Positive confirmation, matches brand
- **Green (read)**: Success, completion
- **Red (failed)**: Error, requires attention

### Consistency
All status colors match the existing design system:
- Uses Tailwind CSS color palette
- Consistent with other UI components
- Accessible color contrast (WCAG AA compliant)

## Real-World Example

### Normal Message Flow (Christina Lee conversation)
```
10:00 AM - Sent: "Your lip filler looks beautiful! Apply ice..."
           Status: ⟳ Sending... (gray, animated)

10:00 AM - (2 seconds later)
           Status: ✓✓ Delivered (blue)

2:30 PM  - Patient replies: "Thank you! Quick question"

2:35 PM  - Sent: "That's completely normal! The swelling..."
           Status: ⟳ Sending...

2:35 PM  - (delivery failed)
           Status: ✕ Failed ⚠️ ⟲ (red, with retry button)

2:36 PM  - Staff clicks retry button
           Status: ⟳ Sending...

2:36 PM  - (2 seconds later)
           Status: ✓✓ Delivered (blue)
```

## Accessibility Features

1. **Icon Labels**: All icons have accessible labels for screen readers
2. **Color + Icons**: Status uses both color AND icons (not just color)
3. **Tooltips**: Additional context available on hover
4. **Button Labels**: Retry button has "Retry sending message" tooltip
5. **Keyboard Navigation**: All interactive elements are keyboard accessible

## Technical Notes

- Status updates happen in real-time (React state updates)
- No page refresh needed
- Status persists across component re-renders
- Timestamps show in user's local timezone
- Failed messages stay visible until successfully retried or deleted
