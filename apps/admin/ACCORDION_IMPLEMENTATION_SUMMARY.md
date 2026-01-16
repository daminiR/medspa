# Accordion Implementation Summary

## Overview
Updated the automated messages template editor cards to be collapsed by default with accordion behavior (only one card expanded at a time).

## Changes Made

### 1. MessageCard Component (`/src/app/settings/automated-messages/components/MessageCard.tsx`)

**New Props:**
- `id?: string` - Unique identifier for the card (required for accordion behavior)
- `isExpanded?: boolean` - Controlled expansion state
- `onExpand?: (id: string) => void` - Callback when user clicks to expand/collapse
- `summary?: string` - Custom summary text shown when collapsed (auto-generated if not provided)

**Key Features:**
- **Default Collapsed:** All cards are collapsed by default (`isExpanded` defaults to `false`)
- **Summary Display:** When collapsed, shows a summary instead of the full description
- **Channel Icons:** Only displayed when collapsed (hidden when expanded)
- **Clickable Header:** Entire card header is clickable to expand/collapse
- **Accordion Support:** Works with parent component to ensure only one card is expanded at a time

**Auto-Generated Summary:**
If no custom `summary` is provided, the component automatically generates one based on enabled channels:
- `"SMS enabled"`
- `"Email enabled"`
- `"SMS + Email enabled"`
- `"No channels enabled"`

### 2. Updated Tab Files

All tab files now include:

1. **Accordion State Management:**
```typescript
const [expandedCard, setExpandedCard] = useState<string | null>(null);
```

2. **Updated MessageCard Usage:**
```typescript
<MessageCard
  id="unique-card-id"
  title="Card Title"
  description="Full description"
  enabled={enabled}
  onToggle={handleToggle}
  channels={{ sms: true, email: false }}
  isExpanded={expandedCard === 'unique-card-id'}
  onExpand={setExpandedCard}
  summary="Custom summary shown when collapsed"
>
  {/* Card content */}
</MessageCard>
```

#### Updated Files:

**✓ CheckInTab.tsx** - 4 cards with accordion behavior:
- `pre-arrival` - "Send {X} minutes before appointment"
- `patient-waiting` - "Internal staff notification"
- `provider-ready` - "Sent when provider is ready"
- `check-in-confirmation` - "Sent immediately after check-in"

**✓ WaitlistTab.tsx** - 2 cards with accordion behavior:
- `added-to-waitlist` - "Sent when added to waitlist"
- `opening-available` - "Sent when slot becomes available"

**✓ SaleClosedTab.tsx** - 4 cards with accordion behavior:
- `thank-you-email` - "Sent immediately after checkout"
- `thank-you-sms` - "Sent immediately after checkout"
- `review-request` - "Sent {X} {hours/days} after checkout"
- `post-care` - "Sent when treatment performed" / "Sent for all sales"

**✓ AppointmentBookedTab.tsx** - 3 cards with accordion behavior:
- `email-confirmation` - "Detailed confirmation with all appointment info"
- `sms-confirmation` - "Includes confirmation request" / "Brief confirmation via SMS"
- `form-request` - "Sent with secure links to patient forms"

### 3. Behavior

**Accordion Pattern:**
- Clicking any collapsed card expands it and collapses all others
- Clicking an expanded card collapses it (all cards become collapsed)
- Only one card can be expanded at a time per tab

**State Persistence:**
- The last expanded card is remembered within each tab session
- Switching between tabs resets the accordion state (no cards expanded)

**Summary Display:**
- Each card shows a meaningful summary when collapsed
- Summaries reflect the current configuration (e.g., timing, enabled channels)
- Channel badges (SMS/Email) are shown next to the summary

## Testing Checklist

- [x] MessageCard component updated with accordion props
- [x] All cards default to collapsed state
- [x] Clicking a card expands it
- [x] Expanding one card collapses others (accordion behavior)
- [x] Summaries display correctly when collapsed
- [x] Channel badges visible when collapsed, hidden when expanded
- [x] Custom summaries with dynamic values work correctly
- [x] Toggle switches work without expanding the card
- [x] CheckInTab updated
- [x] WaitlistTab updated
- [x] SaleClosedTab updated
- [x] AppointmentBookedTab updated

## Files Modified

1. `/src/app/settings/automated-messages/components/MessageCard.tsx`
2. `/src/app/settings/automated-messages/tabs/CheckInTab.tsx`
3. `/src/app/settings/automated-messages/tabs/WaitlistTab.tsx`
4. `/src/app/settings/automated-messages/tabs/SaleClosedTab.tsx`
5. `/src/app/settings/automated-messages/tabs/AppointmentBookedTab.tsx`

## Files Pending Updates

The following tab files still need to be updated with accordion behavior:
- `/src/app/settings/automated-messages/tabs/FormSubmittedTab.tsx`
- `/src/app/settings/automated-messages/tabs/AppointmentCanceledTab.tsx`
- `/src/app/settings/automated-messages/tabs/GiftCardsTab.tsx`
- `/src/app/settings/automated-messages/tabs/MembershipsTab.tsx`

## Usage Example

```typescript
// In your tab component
export function MyTab() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <MessageCard
        id="card-1"
        title="Message Type 1"
        description="Sent when event occurs"
        enabled={enabled1}
        onToggle={setEnabled1}
        channels={{ sms: true, email: false }}
        isExpanded={expandedCard === 'card-1'}
        onExpand={setExpandedCard}
        summary="SMS sent immediately"
      >
        {/* Card content */}
      </MessageCard>

      <MessageCard
        id="card-2"
        title="Message Type 2"
        description="Sent as a follow-up"
        enabled={enabled2}
        onToggle={setEnabled2}
        channels={{ sms: false, email: true }}
        isExpanded={expandedCard === 'card-2'}
        onExpand={setExpandedCard}
        summary="Email sent 24 hours later"
      >
        {/* Card content */}
      </MessageCard>
    </div>
  );
}
```

## Notes

- The implementation maintains backward compatibility - cards without `id`, `isExpanded`, and `onExpand` props will still work but won't have accordion behavior
- The `defaultExpanded` prop is now ignored when using controlled accordion behavior
- The accordion state is scoped to each tab, so switching tabs doesn't affect other tabs' state
