# Smart Defaults - Visual Guide & User Experience

## Feature Overview

The Smart Defaults system provides first-time users with a **zero-configuration** setup while giving advanced users **full customization control** with easy reset capabilities.

---

## 🎯 Key Benefits

### For New Users
- ✅ Works immediately - no setup required
- ✅ Best practice settings pre-configured
- ✅ Green "Default" badge = confidence
- ✅ No overwhelming configuration screens

### For Advanced Users
- ✅ Full customization freedom
- ✅ Clear "Customized" indicators
- ✅ One-click reset to defaults
- ✅ Know exactly what's been changed

---

## 📱 User Interface States

### State 1: Using Defaults (Collapsed)
```
┌─────────────────────────────────────────────────────────┐
│  >  Pre-Arrival Message              ✓ Default    📱SMS  │
│     Send 15 minutes before appointment              🟢ON │
└─────────────────────────────────────────────────────────┘
```
**Visual Elements:**
- Collapse arrow (>)
- Message title
- Green badge with checkmark: "✓ Default"
- Channel badge: "📱 SMS"
- Green toggle: ON

**Meaning:**
- Settings match recommended defaults
- No customization has been applied
- Working state - ready to use

---

### State 2: Using Defaults (Expanded)
```
┌─────────────────────────────────────────────────────────┐
│  ⌄  Pre-Arrival Message              ✓ Default    📱SMS  │
│     Send patients a check-in link...                🟢ON │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ✓  Using Recommended Settings                     │  │
│  │                                                    │  │
│  │    This message is configured with our            │  │
│  │    recommended default settings that work         │  │
│  │    well for most medical spas.                    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  Send Timing                                              │
│  Send [15▼] minutes before appointment                   │
│                                                           │
│  Message Template                                         │
│  Hi {firstName}! Your appointment...                      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```
**Visual Elements:**
- Expand arrow (⌄)
- Green success banner at top
- Settings and controls below
- All values match defaults

**User Action:**
- Expand card to view/edit
- See confirmation they're using best practices
- Optionally customize settings

---

### State 3: Customized (Collapsed)
```
┌─────────────────────────────────────────────────────────┐
│  >  Pre-Arrival Message            Customized     📱SMS  │
│     Send 30 minutes before appointment              🟢ON │
└─────────────────────────────────────────────────────────┘
```
**Visual Elements:**
- Collapse arrow (>)
- Blue badge: "Customized" (no icon)
- Modified summary text (30 vs 15 minutes)
- Toggle reflects current state

**Meaning:**
- User has modified this message
- Settings differ from defaults
- Still functional, just customized

---

### State 4: Customized (Expanded)
```
┌─────────────────────────────────────────────────────────┐
│  ⌄  Pre-Arrival Message            Customized     📱SMS  │
│     Send patients a check-in link...                🟢ON │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ↻  Reset to Recommended Settings                 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  Send Timing                                              │
│  Send [30▼] minutes before appointment                   │
│         ^---- CHANGED FROM DEFAULT (15)                  │
│                                                           │
│  Message Template                                         │
│  Hey {firstName}! Don't forget about...                   │
│         ^---- CHANGED FROM DEFAULT                       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```
**Visual Elements:**
- Expand arrow (⌄)
- Gray "Reset to Recommended Settings" button at top
- Modified values visible
- No green success banner

**User Actions:**
- Click "Reset" button to restore defaults
- Continue customizing
- Save changes

---

## 🔄 User Flows

### Flow 1: First-Time Setup (Zero Config)

1. **Open Settings Page**
   ```
   User: Navigate to Settings → Automated Messages
   System: Load defaults from hook
   Result: All messages show "Default" badges
   ```

2. **View Messages**
   ```
   User: See list of automated messages
   Display: All show green "Default" badges
   Status: ✓ Ready to use - no action needed
   ```

3. **Optional: Inspect Defaults**
   ```
   User: Expand a message card
   Display: Green "Using Recommended Settings" banner
   Display: Pre-filled settings (timing, text, channels)
   Status: ✓ System is working with best practices
   ```

4. **Start Using**
   ```
   Result: Messages send automatically with defaults
   No configuration required
   Zero friction to get started
   ```

---

### Flow 2: Customization Journey

1. **Identify Need to Customize**
   ```
   User: "I want to send reminders 30 min before, not 15"
   Action: Expand "Pre-Arrival Message" card
   ```

2. **Make Changes**
   ```
   User: Change timing from 15 to 30 minutes
   System: Auto-save to localStorage
   System: Update badge to "Customized"
   ```

3. **Visual Feedback**
   ```
   Display: Blue "Customized" badge appears
   Display: "Reset" button available when expanded
   Status: Changes are active and saved
   ```

4. **Continue Using**
   ```
   Result: Messages now send 30 minutes before
   User: Confident their change is active
   ```

---

### Flow 3: Reset to Defaults

1. **Realize Customization Issues**
   ```
   User: "Hmm, 30 minutes is too early"
   Action: Expand the customized message
   ```

2. **Click Reset**
   ```
   User: Click "Reset to Recommended Settings"
   System: Restore default values (15 minutes)
   System: Update localStorage
   ```

3. **Immediate Feedback**
   ```
   Display: Badge changes to green "Default"
   Display: Success banner appears
   Display: Values reset to defaults
   ```

4. **Confirmation**
   ```
   Status: ✓ Back to recommended settings
   User: Confident they're using best practices again
   ```

---

## 🎨 Visual Design Specifications

### Color Palette

#### Default State (Green)
```
Badge Background:  bg-green-50   (#F0FDF4)
Badge Text:        text-green-700 (#15803D)
Badge Icon:        green-600      (#16A34A) ✓ CheckCircle2

Banner Background: bg-green-50   (#F0FDF4)
Banner Border:     border-green-200 (#BBF7D0)
Banner Icon:       green-600      (#16A34A) ✓ CheckCircle2
Banner Title:      green-900      (#14532D) - medium weight
Banner Text:       green-700      (#15803D) - small
```

#### Customized State (Blue)
```
Badge Background:  bg-blue-50    (#EFF6FF)
Badge Text:        text-blue-700 (#1D4ED8)

Button Background: bg-gray-50    (#F9FAFB)
Button Border:     border-gray-300 (#D1D5DB)
Button Text:       text-gray-700  (#374151)
Button Hover:      bg-gray-100    (#F3F4F6)
Button Icon:       ↻ RotateCcw
```

### Typography

```
Card Title:        text-lg font-medium
Badge Text:        text-xs font-medium
Banner Title:      text-sm font-medium
Banner Text:       text-xs
Button Text:       text-sm font-medium
```

### Spacing

```
Badge Padding:     px-2 py-1
Badge Gap:         gap-1.5
Banner Padding:    p-3
Banner Gap:        gap-3
Button Padding:    px-3 py-2
Button Gap:        gap-2
Section Margin:    mb-4 pb-4
```

### Icons

```
CheckCircle2:      h-3.5 w-3.5 (badge)
                   h-5 w-5 (banner)

RotateCcw:         h-4 w-4 (button)

ChevronRight:      h-5 w-5 (collapsed)
ChevronDown:       h-5 w-5 (expanded)

MessageSquare:     h-4 w-4 (SMS badge)
Mail:              h-4 w-4 (Email badge)
```

---

## 📊 State Transition Diagram

```
┌─────────────┐
│   Initial   │
│   Setup     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Using     │◄──────────────┐
│   Defaults  │               │
└──────┬──────┘               │
       │                      │
       │ User                 │ User clicks
       │ Modifies             │ "Reset"
       │ Setting              │
       ▼                      │
┌─────────────┐               │
│ Customized  │───────────────┘
│   State     │
└─────────────┘
```

**State Behaviors:**

- **Using Defaults**
  - Green badge
  - Success banner when expanded
  - No reset button needed
  - Deep comparison = TRUE

- **Customized**
  - Blue badge
  - Reset button when expanded
  - Modified values visible
  - Deep comparison = FALSE

- **Reset Action**
  - Immediately returns to "Using Defaults"
  - Values revert to defaults
  - Visual feedback instant
  - localStorage updated

---

## 🧪 Testing Scenarios

### Scenario 1: New Installation
```
Given: User has never opened settings
When:  User navigates to Automated Messages
Then:  All cards show "Default" badge
And:   Settings are functional immediately
And:   No error states or missing values
```

### Scenario 2: Modification Detection
```
Given: A message using defaults
When:  User changes ANY setting
Then:  Badge updates to "Customized"
And:   Reset button becomes available
And:   Changes are saved to localStorage
```

### Scenario 3: Deep Comparison
```
Given: A message using defaults
When:  User changes a value then changes it back
Then:  Badge returns to "Default"
And:   Deep comparison recognizes equality
And:   No reset button appears
```

### Scenario 4: Persistence
```
Given: User has customized a message
When:  User refreshes the page
Then:  "Customized" badge persists
And:   Modified values are preserved
When:  User resets to defaults
And:   User refreshes the page
Then:  "Default" badge persists
```

### Scenario 5: Multiple Messages
```
Given: User customizes message A
When:  User expands message B (still using defaults)
Then:  Message A shows "Customized"
And:   Message B shows "Default"
And:   Each message tracks independently
```

---

## 💡 Implementation Notes

### localStorage Structure
```json
{
  "automatedMessageSettings": {
    "check_in_reminder": {
      "id": "check_in_reminder",
      "enabled": true,
      "channels": ["sms"],
      "timing": {
        "type": "before_appointment",
        "value": 1,
        "unit": "hours"
      },
      "template": {
        "body": "Hi {{patientName}}...",
        "variables": ["patientName", "checkInUrl"]
      }
    },
    // ... other event types
  }
}
```

### Deep Comparison Logic
```typescript
// Compares current vs default config
JSON.stringify(currentConfig) === JSON.stringify(defaultConfig)

// Catches:
// - Changed values
// - Added properties
// - Removed properties
// - Nested object changes
// - Array modifications
```

### Performance
- Settings loaded once on mount
- Deep comparison runs only when needed
- localStorage updated only on changes
- No unnecessary re-renders

---

## 🚀 Future Enhancements

### Possible Additions
1. **Export/Import Settings**
   - Export customizations as JSON
   - Import settings from another installation
   - Share configurations between locations

2. **Version History**
   - Track when settings were changed
   - View previous configurations
   - Rollback to specific point in time

3. **Default Presets**
   - Multiple default profiles
   - "Conservative" vs "Aggressive" reminder schedules
   - Industry-specific templates

4. **Diff Viewer**
   - Show exactly what's different from defaults
   - Highlight changed values
   - Side-by-side comparison

5. **Bulk Operations**
   - "Reset All to Defaults" button at page level
   - "Apply to Multiple" for similar messages
   - Template inheritance system

---

## ✅ Success Metrics

The Smart Defaults feature is successful when:

1. **New users** can start sending automated messages within 5 minutes
2. **Zero configuration** complaints from first-time users
3. **Advanced users** report easy customization
4. **Support tickets** reduced related to "settings not working"
5. **Reset feature** used when users get confused
6. **Visual clarity** - users understand default vs customized at a glance

---

## 📖 User Documentation

### Quick Start Guide

**For First-Time Users:**
1. Navigate to Settings → Automated Messages
2. See green "Default" badges on all messages
3. You're done! Messages will send automatically with recommended settings
4. (Optional) Expand cards to see what's configured

**For Customization:**
1. Expand the message you want to customize
2. Modify any settings (timing, text, channels)
3. Changes save automatically
4. Badge updates to blue "Customized"
5. To undo: Click "Reset to Recommended Settings"

**Understanding the Badges:**
- ✓ Green "Default" = Using recommended settings (you're good!)
- Blue "Customized" = You've modified this message (working as customized)

---

This feature provides the perfect balance of **simplicity for beginners** and **power for experts**, with clear visual feedback at every step.
