# WaitlistTab - Quick Reference

## At a Glance

### File Location
`/src/app/settings/automated-messages/tabs/WaitlistTab.tsx`

### Lines of Code
659 lines

### Visible Toggles by Default
**3 main toggles:**
1. Added to Waitlist (MessageCard)
2. Opening Available (MessageCard)
3. Staff Notifications (MessageCard)

### Hidden by Default
- Auto-Offer Timing (in Advanced section)
- Max Offers setting (in nested Advanced section)

---

## Component Structure

```typescript
WaitlistTab
├── State Management
│   ├── masterEnabled (boolean) - Master on/off switch
│   ├── expandedCard (string | null) - Which card is expanded
│   └── settings (WaitlistMessageSettings) - All notification settings
│
├── UI Sections
│   ├── Header (lines 145-206)
│   │   ├── Master toggle
│   │   ├── Summary dashboard (NEW)
│   │   └── Warning banner if disabled
│   │
│   ├── Content Wrapper (lines 208-644)
│   │   ├── Added to Waitlist Card (lines 210-309)
│   │   ├── Opening Available Card (lines 311-431)
│   │   ├── Staff Notifications Card (lines 433-521) ← CHANGED
│   │   └── Advanced Section (lines 523-643)
│   │       └── Nested Advanced Section (lines 593-621) ← NEW
│   │
│   └── Save Button (lines 646-656)
```

---

## Key Props & State

### Master Toggle
```typescript
const [masterEnabled, setMasterEnabled] = useState(true);
```
- Controls entire page enable/disable
- When OFF: content becomes opaque and unclickable

### Expanded Card (Accordion Pattern)
```typescript
const [expandedCard, setExpandedCard] = useState<string | null>(null);
```
- Only one card can be expanded at a time
- Possible values:
  - `'added-to-waitlist'`
  - `'opening-available'`
  - `'internal-notifications'`
  - `null` (all collapsed)

### Settings Object
```typescript
interface WaitlistMessageSettings {
  addedToWaitlist: {
    enabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    smsTemplate: MessageTemplate;
    emailTemplate: MessageTemplate;
  };
  openingAvailable: {
    enabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    smsTemplate: MessageTemplate;
    emailTemplate: MessageTemplate;
    includeBookingLink: boolean;
  };
  internalNotification: {
    enabled: boolean;
    recipients: string[];
    notifyOnMatch: boolean;
  };
  autoOffer: {
    enabled: boolean;
    offerDuration: number;
    offerUnit: 'minutes' | 'hours';
    maxOffers: number;
    skipToNextAfterExpire: boolean;
  };
}
```

---

## Summary Dashboard Logic

**Location:** Lines 174-194

**When Shown:** Only when `masterEnabled === true`

**Status Indicators:**
```typescript
// Green dot if enabled, gray if disabled
settings.addedToWaitlist.enabled ? 'bg-green-500' : 'bg-gray-300'
settings.openingAvailable.enabled ? 'bg-green-500' : 'bg-gray-300'
settings.internalNotification.enabled ? 'bg-green-500' : 'bg-gray-300'
```

**Benefits:**
- Real-time status updates
- No need to expand cards to check settings
- Visual feedback with colored dots

---

## Component Dependencies

### Imported Components
```typescript
import { MessageCard } from '../components/MessageCard';
import MessageEditor, { MessageTemplate } from '../components/MessageEditor';
import { InternalNotificationConfig } from '../components/InternalNotificationConfig';
import TestSendButton from '../components/TestSendButton';
import { AdvancedSection } from '../components/AdvancedSection';
```

### Icons Used
```typescript
import {
  Clock,          // Header icon
  Mail,           // Email indicators
  MessageSquare,  // SMS indicators
  Bell,           // Notification icon
  Settings2,      // Advanced settings icon
  AlertCircle,    // Info/help icon
  X,              // Remove button
  Users           // Staff notifications (not used after change)
} from 'lucide-react';
```

---

## Changes from Original

### What Changed
1. ✅ Added summary dashboard at top
2. ✅ Collapsed Internal Notifications by default
3. ✅ Auto-offer already in Advanced section (no change needed)
4. ✅ Moved Max Offers to nested Advanced section
5. ✅ Simplified descriptions

### What Stayed the Same
- All functionality preserved
- Same state management
- Same save behavior
- Same validation logic
- Message template editing unchanged

---

## User Flow Examples

### Scenario 1: Quick Status Check
1. Open page
2. Look at summary dashboard
3. See all 3 notifications are ON
**Time:** 2 seconds

### Scenario 2: Edit "Added to Waitlist" Message
1. Open page
2. Click "Added to Waitlist" card to expand
3. Edit SMS template
4. Click "Save Settings"
**Clicks:** 2

### Scenario 3: Add Staff Email Recipient
1. Open page
2. Click "Staff Notifications" card to expand
3. Type email address
4. Click "Add" or press Enter
5. Click "Save Settings"
**Clicks:** 3

### Scenario 4: Change Auto-Offer Timing
1. Open page
2. Click "Advanced options" (bottom)
3. Change response time from 2 to 4 hours
4. Scroll up and click "Save Settings"
**Clicks:** 2

### Scenario 5: Change Max Offers (Rare)
1. Open page
2. Click "Advanced options" (main)
3. Scroll down to nested "Advanced options"
4. Click nested "Advanced options"
5. Change max offers from 3 to 5
6. Scroll up and click "Save Settings"
**Clicks:** 3

---

## Testing Scenarios

### Visual Tests
```bash
# 1. Default state - 3 cards visible, all collapsed
# 2. Summary shows correct ON/OFF status
# 3. Master toggle disabled grays out content
# 4. Only one card expands at a time (accordion)
# 5. Advanced section collapsed by default
# 6. Nested advanced section double-collapsed
```

### Functional Tests
```bash
# 1. Toggle each message type ON/OFF
# 2. Add/remove staff email recipients
# 3. Edit message templates
# 4. Test send buttons work
# 5. Auto-offer timing saves correctly
# 6. Max offers setting saves correctly
# 7. Master toggle disables all notifications
```

### Edge Cases
```bash
# 1. Master OFF + try to click cards (should be disabled)
# 2. Add invalid email to staff notifications (should error)
# 3. Set response time to 0 (should validate min=1)
# 4. Set max offers to 100 (should validate max=10)
```

---

## Development Notes

### State Updates
All updates follow this pattern:
```typescript
const updateSomething = (key: string, value: any) => {
  setSettings({
    ...settings,
    something: {
      ...settings.something,
      [key]: value
    }
  });
};
```

### Accordion Pattern
```typescript
// MessageCard handles expand/collapse
<MessageCard
  isExpanded={expandedCard === 'card-id'}
  onExpand={setExpandedCard}
  // ... other props
/>
```

### Advanced Section Pattern
```typescript
<AdvancedSection defaultExpanded={false}>
  {/* Content hidden until user clicks "Advanced options" */}
</AdvancedSection>
```

### Nested Advanced Pattern (NEW)
```typescript
<AdvancedSection defaultExpanded={false}>
  {/* First level advanced content */}

  <AdvancedSection defaultExpanded={false}>
    {/* Second level (edge case) content */}
  </AdvancedSection>
</AdvancedSection>
```

---

## Future Enhancements (Not Implemented)

### Could Add Later:
- [ ] Preset templates dropdown
- [ ] Preview panel for messages
- [ ] A/B testing for message effectiveness
- [ ] Analytics on response rates
- [ ] Bulk edit for multiple message types
- [ ] Import/export settings
- [ ] Notification scheduling (time of day rules)

---

## Troubleshooting

### Issue: Cards not collapsing
**Solution:** Check that `expandedCard` state is being set correctly and `onExpand` prop is passed.

### Issue: Summary not updating
**Solution:** Verify that summary is reading from `settings` state object, not hardcoded values.

### Issue: Advanced section not hiding
**Solution:** Check `defaultExpanded={false}` is set on `<AdvancedSection>` component.

### Issue: Max Offers setting not saving
**Solution:** Ensure nested `AdvancedSection` is inside the auto-offer update handler scope.

---

## Related Files

- `MessageCard.tsx` - Collapsible card component
- `MessageEditor.tsx` - Template editor with variables
- `TestSendButton.tsx` - Test message sending
- `AdvancedSection.tsx` - Collapsible advanced options
- `InternalNotificationConfig.tsx` - Original component (now unused in WaitlistTab)

---

## Performance Considerations

- Component only re-renders when state changes
- Accordion pattern ensures only one expanded card at a time
- Message templates stored in state, not re-computed
- No API calls on this page (frontend only)

---

## Accessibility

- All toggles have labels
- Keyboard navigation supported
- Focus management for expanded/collapsed states
- Color indicators include text labels (not color alone)
- ARIA labels on buttons
