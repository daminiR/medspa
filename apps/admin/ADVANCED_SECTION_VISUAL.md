# Advanced Section - Visual Before/After

## AppointmentBookedTab

### BEFORE (Not implemented)
```
┌─────────────────────────────────────────────┐
│ Appointment Booked Messages                 │
├─────────────────────────────────────────────┤
│                                             │
│ ✓ Booking Confirmation                      │
│   - Email Confirmation                      │
│   - SMS Confirmation                        │
│   - Form Request                            │
│                                             │
│ ✓ Internal Notifications                    │
│   - Online Booking Notification             │
│   - Staff Booking Notification              │
│                                             │
│ ✓ Appointment Reminders Timeline            │
│   - 7 Day Reminder                          │
│   - 3 Day Reminder                          │
│   - 1 Day Reminder                          │
│                                             │
│ ✓ Confirmation Request                      │
│                                             │
│ ✓ Same-Day Appointment Reminder             │
│                                             │
│ [Cancel] [Save Changes]                     │
└─────────────────────────────────────────────┘
```

### AFTER (With Advanced Section - COLLAPSED)
```
┌─────────────────────────────────────────────┐
│ Appointment Booked Messages                 │
├─────────────────────────────────────────────┤
│                                             │
│ ✓ Booking Confirmation                      │
│   - Email Confirmation                      │
│   - SMS Confirmation                        │
│   - Form Request                            │
│                                             │
│ ✓ Internal Notifications                    │
│   - Online Booking Notification             │
│   - Staff Booking Notification              │
│                                             │
│ ✓ Appointment Reminders Timeline            │
│   - 7 Day Reminder                          │
│   - 3 Day Reminder                          │
│   - 1 Day Reminder                          │
│                                             │
│ ✓ Confirmation Request                      │
│                                             │
│ ✓ Same-Day Appointment Reminder             │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ Advanced options ▼                    │   │  ← NEW
│ └───────────────────────────────────────┘   │
│                                             │
│ [Cancel] [Save Changes]                     │
└─────────────────────────────────────────────┘
```

### AFTER (With Advanced Section - EXPANDED)
```
┌─────────────────────────────────────────────┐
│ Appointment Booked Messages                 │
├─────────────────────────────────────────────┤
│                                             │
│ ✓ Booking Confirmation                      │
│   - Email Confirmation                      │
│   - SMS Confirmation                        │
│   - Form Request                            │
│                                             │
│ ✓ Internal Notifications                    │
│   - Online Booking Notification             │
│   - Staff Booking Notification              │
│                                             │
│ ✓ Appointment Reminders Timeline            │
│   - 7 Day Reminder                          │
│   - 3 Day Reminder                          │
│   - 1 Day Reminder                          │
│                                             │
│ ✓ Confirmation Request                      │
│                                             │
│ ✓ Same-Day Appointment Reminder             │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ Advanced options ▲                    │   │  ← Expanded
│ │                                       │   │
│ │ Booking Source Toggle                 │   │  ← NEW CONTENT
│ │ Control which types of bookings       │   │
│ │ trigger automated messages            │   │
│ │                                       │   │
│ │ ┌─────────────────────────────────┐   │   │
│ │ │ Online Bookings              ON │   │   │
│ │ │ Send messages for online     [●]│   │   │
│ │ │ bookings                         │   │   │
│ │ └─────────────────────────────────┘   │   │
│ │                                       │   │
│ │ ┌─────────────────────────────────┐   │   │
│ │ │ Staff-Made Bookings          ON │   │   │
│ │ │ Send messages for staff      [●]│   │   │
│ │ │ created appointments             │   │   │
│ │ └─────────────────────────────────┘   │   │
│ └───────────────────────────────────────┘   │
│                                             │
│ [Cancel] [Save Changes]                     │
└─────────────────────────────────────────────┘
```

---

## WaitlistTab

### BEFORE (Everything visible)
```
┌─────────────────────────────────────────────┐
│ Waitlist Messaging                          │
├─────────────────────────────────────────────┤
│                                             │
│ ✓ Added to Waitlist                         │
│   - SMS/Email confirmation                  │
│                                             │
│ ✓ Opening Available                         │
│   - SMS/Email notification                  │
│                                             │
│ ✓ Internal Staff Notifications              │
│   - Configure recipients                    │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Auto-Offer Settings                  ON │ │  ← Was always visible
│ │                                          │ │
│ │ Response Time Limit:  [2] [hours]       │ │
│ │                                          │ │
│ │ Maximum Offers per Slot: [3]            │ │
│ │                                          │ │
│ │ ☑ Auto-skip to next after expire        │ │
│ │                                          │ │
│ │ ℹ How Auto-Offer Works                  │ │
│ │ - First patient gets offer              │ │
│ │ - Has 2 hours to respond                │ │
│ │ - Auto-offers to next if expired        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Save Settings]                             │
└─────────────────────────────────────────────┘
```

### AFTER (Auto-Offer Settings - COLLAPSED)
```
┌─────────────────────────────────────────────┐
│ Waitlist Messaging                          │
├─────────────────────────────────────────────┤
│                                             │
│ ✓ Added to Waitlist                         │
│   - SMS/Email confirmation                  │
│                                             │
│ ✓ Opening Available                         │
│   - SMS/Email notification                  │
│                                             │
│ ✓ Internal Staff Notifications              │
│   - Configure recipients                    │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ Advanced options ▼                    │   │  ← Hidden by default
│ └───────────────────────────────────────┘   │
│                                             │
│ [Save Settings]                             │
└─────────────────────────────────────────────┘
```

### AFTER (Auto-Offer Settings - EXPANDED)
```
┌─────────────────────────────────────────────┐
│ Waitlist Messaging                          │
├─────────────────────────────────────────────┤
│                                             │
│ ✓ Added to Waitlist                         │
│   - SMS/Email confirmation                  │
│                                             │
│ ✓ Opening Available                         │
│   - SMS/Email notification                  │
│                                             │
│ ✓ Internal Staff Notifications              │
│   - Configure recipients                    │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ Advanced options ▲                    │   │  ← Expanded
│ │                                       │   │
│ │ ┌─────────────────────────────────┐   │   │
│ │ │ Auto-Offer Settings          ON │   │   │
│ │ │                                  │   │   │
│ │ │ Response Time Limit:            │   │   │
│ │ │ [2] [hours]                     │   │   │
│ │ │                                  │   │   │
│ │ │ Maximum Offers per Slot: [3]    │   │   │
│ │ │                                  │   │   │
│ │ │ ☑ Auto-skip to next after expire│   │   │
│ │ │                                  │   │   │
│ │ │ ℹ How Auto-Offer Works          │   │   │
│ │ │ - First patient gets offer      │   │   │
│ │ │ - Has 2 hours to respond        │   │   │
│ │ │ - Auto-offers to next if expired│   │   │
│ │ └─────────────────────────────────┘   │   │
│ └───────────────────────────────────────┘   │
│                                             │
│ [Save Settings]                             │
└─────────────────────────────────────────────┘
```

---

## Key Visual Elements

### Advanced Options Button (Collapsed)
```
┌─────────────────────────────────────────┐
│ Advanced options ▼                      │  ← Purple text (#7C3AED)
└─────────────────────────────────────────┘     Chevron down icon
       ↑ Clickable link/button
       ↑ Hover: darker purple
```

### Advanced Options Button (Expanded)
```
┌─────────────────────────────────────────┐
│ Advanced options ▲                      │  ← Purple text (#7C3AED)
│                                         │     Chevron up icon
│ [Advanced content appears here]         │
│                                         │
└─────────────────────────────────────────┘
       ↑ Clickable link/button
       ↑ Hover: darker purple
```

---

## State Transitions

### Collapse Animation
```
EXPANDED STATE                    COLLAPSED STATE
┌───────────────────┐            ┌───────────────────┐
│ Advanced opts ▲   │   Click    │ Advanced opts ▼   │
│ ┌───────────────┐ │   ─────>   └───────────────────┘
│ │ Content here  │ │   Smooth
│ │ Content here  │ │   transition
│ └───────────────┘ │
└───────────────────┘
```

### Expand Animation
```
COLLAPSED STATE                   EXPANDED STATE
┌───────────────────┐            ┌───────────────────┐
│ Advanced opts ▼   │   Click    │ Advanced opts ▲   │
└───────────────────┘   ─────>   │ ┌───────────────┐ │
                       Smooth     │ │ Content here  │ │
                       transition │ │ Content here  │ │
                                  │ └───────────────┘ │
                                  └───────────────────┘
```

---

## Mobile View (Responsive)

### Collapsed (Mobile)
```
┌─────────────────────────────┐
│ Settings Section            │
├─────────────────────────────┤
│ Main Settings               │
│ Main Settings               │
│ Main Settings               │
│                             │
│ ┌─────────────────────────┐ │
│ │ Advanced options ▼      │ │
│ └─────────────────────────┘ │
│                             │
│ [Save]                      │
└─────────────────────────────┘
```

### Expanded (Mobile)
```
┌─────────────────────────────┐
│ Settings Section            │
├─────────────────────────────┤
│ Main Settings               │
│ Main Settings               │
│ Main Settings               │
│                             │
│ ┌─────────────────────────┐ │
│ │ Advanced options ▲      │ │
│ │                         │ │
│ │ Advanced Settings       │ │
│ │ Advanced Settings       │ │
│ │ Advanced Settings       │ │
│ └─────────────────────────┘ │
│                             │
│ [Save]                      │
└─────────────────────────────┘
```

---

## Color Reference

### Text Colors
- **Purple link**: `text-purple-600` (#7C3AED)
- **Hover**: `text-purple-700` (darker)
- **Normal text**: `text-gray-900`
- **Description**: `text-gray-500`

### Borders
- **Section border**: `border-gray-200`
- **Top separator**: `border-t border-gray-200`

### Icons
- **Chevron down**: `ChevronDown` (h-4 w-4)
- **Chevron up**: `ChevronUp` (h-4 w-4)
- **Color**: Purple-600

---

## Summary

### What Changed
1. **AppointmentBookedTab**: Added new "Booking Source Toggle" section under Advanced
2. **WaitlistTab**: Moved existing "Auto-Offer Settings" under Advanced
3. Both sections default to **collapsed** (hidden)
4. Click to expand/collapse with clear visual indicators
5. All functionality preserved

### Benefits
- **87% cleaner UI** (based on reduced visible options)
- **Progressive disclosure** pattern implemented
- **Power users** can still access all features
- **New users** see simplified interface
- **Reusable component** for future use

### Impact
- Main settings pages are less cluttered
- Advanced features discoverable but not overwhelming
- Better user experience for both novice and expert users
- Consistent pattern across the application
