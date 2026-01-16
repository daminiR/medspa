# AppointmentBookedTab - Visual Structure Guide

## Component Hierarchy

```
AppointmentBookedTab
├── Header Banner (gradient purple/pink)
│   └── Overview text
│
├── 1. Confirmation Section
│   ├── MessageCard: Email Confirmation
│   │   ├── Toggle (ON)
│   │   ├── Email icon & channel badge
│   │   └── Expandable content
│   │       ├── Bulleted list of included items
│   │       └── "Edit Email Template" link
│   │
│   ├── MessageCard: SMS Confirmation
│   │   ├── Toggle (ON)
│   │   ├── SMS icon & channel badge
│   │   └── Expandable content
│   │       ├── SMS Preview box (gray background)
│   │       ├── Character count
│   │       └── "Edit SMS Template" link
│   │
│   └── MessageCard: Form Request
│       ├── Toggle (OFF)
│       ├── Both email & SMS channel badges
│       └── Expandable content
│           ├── Bulleted list of forms
│           └── Blue info banner
│
├── 2. Internal Notifications Section
│   ├── Online Booking Notification
│   │   ├── Bell icon (blue)
│   │   ├── Title & description
│   │   └── Toggle switch (ON)
│   │
│   ├── Staff Booking Notification
│   │   ├── Bell icon (blue)
│   │   ├── Title & description
│   │   └── Toggle switch (OFF)
│   │
│   └── Notification Recipients Info Box (conditional)
│       └── Shows when any notification is enabled
│
├── 3. Reminders Section (TimelineConfigurator)
│   ├── Header with "Add Message" button
│   ├── Visual Timeline
│   │   ├── Vertical gradient line (gray → pink)
│   │   ├── Reminder: 7 days (enabled) ●━━━
│   │   ├── Reminder: 3 days (enabled) ●━━━
│   │   ├── Reminder: 1 day (enabled)  ●━━━
│   │   ├── Reminder: 2 hours (disabled) ○━━━
│   │   └── Appointment Marker (pink) ●
│   └── Footer stats (active count)
│
├── 4. Confirmation Request Section
│   ├── Enable "Reply C to Confirm"
│   │   ├── Title & description
│   │   └── Toggle (ON)
│   │
│   ├── Set status to "Unconfirmed" (conditional)
│   │   └── Checkbox (ON) - only visible when reply-to-confirm enabled
│   │
│   └── Green info box (conditional)
│       └── Explains automatic status updates
│
├── 5. Same-Day Reminder
│   ├── Clock icon
│   ├── Title & description
│   └── Toggle (ON)
│
└── Action Buttons
    ├── Cancel (gray)
    └── Save Changes (purple)
```

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🎨 HEADER (gradient purple/pink)                       │
│ ✓ Appointment Booked Messages                          │
│ Description text...                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 📧 CONFIRMATION SECTION                                 │
├─────────────────────────────────────────────────────────┤
│ ▼ Email Confirmation                       [=== ON]    │
│   Includes: appointment details, location...            │
│                                                         │
│ ▼ SMS Confirmation                         [=== ON]    │
│   Preview: "Your appointment at..."                    │
│   156/160 characters                                    │
│                                                         │
│ ▼ Form Request                             [=== OFF]   │
│   ⓘ Forms sent immediately after booking               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 👥 INTERNAL NOTIFICATIONS                              │
├─────────────────────────────────────────────────────────┤
│ 🔔 Online Booking Notification             [=== ON]    │
│ 🔔 Staff Booking Notification              [=== OFF]   │
│                                                         │
│ ⓘ Recipients: Assigned provider + front desk           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ⏰ MESSAGE TIMELINE                  [+ Add Message]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ●━━━━ 7 days before      [Reminder]     [ON] [🗑]   │
│  │                                                      │
│  ●━━━━ 3 days before      [Reminder]     [ON] [🗑]   │
│  │                                                      │
│  ●━━━━ 1 day before       [Reminder]     [ON] [🗑]   │
│  │                                                      │
│  ○━━━━ 2 hours before     [Reminder]    [OFF] [🗑]   │
│  │                                                      │
│  ●     APPOINTMENT TIME                                 │
│                                                         │
│ Active: 3 messages | Total: 4 configured               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 💬 CONFIRMATION REQUEST                                 │
├─────────────────────────────────────────────────────────┤
│ Enable "Reply C to Confirm"                [=== ON]    │
│   Reply C to confirm, R to reschedule                  │
│                                                         │
│   ☑ Set status to "Unconfirmed"                       │
│       Updates automatically when patient replies        │
│                                                         │
│ ✓ Status updates to "Confirmed" on reply "C"          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🕐 SAME-DAY REMINDER                       [=== ON]    │
│ Sends at 9:00 AM for same-day bookings                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                             [Cancel] [Save Changes ✓]  │
└─────────────────────────────────────────────────────────┘
```

## Color Coding

### Section Colors
- **Confirmation:** Green (#10B981) - ✓
- **Internal:** Blue (#3B82F6) - 🔔
- **Reminders:** Purple/Pink gradient - ⏰
- **Request:** Amber (#F59E0B) - 💬
- **Same-day:** Pink (#EC4899) - 🕐

### Status Colors
- **Enabled/Active:** Purple (#9333EA)
- **Disabled:** Gray (#6B7280)
- **Success:** Green (#10B981)
- **Warning:** Amber (#F59E0B)
- **Info:** Blue (#3B82F6)

## Interactive Elements

### Toggle Switches
```
[================= ON ]  ← Purple background
[OFF =================]  ← Gray background
```

### Expandable Cards
```
▼ Card Title (expanded)
  Content visible...

▶ Card Title (collapsed)
```

### Timeline Dots
```
● Enabled/Active    (colored with background)
○ Disabled          (gray outline)
```

### Buttons
```
[+ Add Message]      ← Pink button
[Edit Template →]    ← Text link (purple)
[Cancel]            ← Gray button
[Save Changes ✓]    ← Purple button
```

## State Flow

### Confirmation Request
```
Reply-to-confirm: OFF
  └── Checkbox hidden

Reply-to-confirm: ON
  ├── Checkbox visible
  ├── If checked:
  │   ├── New appointments = "Unconfirmed"
  │   └── Reply "C" → "Confirmed"
  └── If unchecked:
      └── New appointments = "Confirmed"
```

### Internal Notifications
```
No notifications enabled
  └── Recipients box hidden

Any notification enabled
  └── Recipients box visible
      ├── Shows who gets notified
      └── Link to configure
```

### Timeline Reminders
```
Add reminder
  └── New reminder added with defaults
      └── 12 hours before
      └── Enabled by default

Remove reminder
  └── Confirmation (if needed)
      └── Removed from list

Toggle reminder
  ├── ON: Shows in timeline (colored)
  └── OFF: Shows in timeline (grayed)
```

## Responsive Behavior

### Desktop (>768px)
- Full width cards
- Side-by-side layouts where appropriate
- Expanded timeline with full details

### Tablet (481-768px)
- Stacked cards
- Full width buttons
- Compact timeline

### Mobile (<480px)
- Single column
- Full width everything
- Condensed text
- Stacked toggle switches

## Accessibility Features

- ✅ All toggles have labels
- ✅ Proper ARIA attributes
- ✅ Keyboard navigation support
- ✅ Focus indicators (purple ring)
- ✅ Color contrast meets WCAG AA
- ✅ Screen reader friendly text
- ✅ Semantic HTML structure

---

**Quick Reference:**
- 5 major sections ✓
- All toggles functional ✓
- Timeline configurator ✓
- Conditional rendering ✓
- Professional styling ✓
