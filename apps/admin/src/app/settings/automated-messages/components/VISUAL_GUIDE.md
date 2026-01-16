# TimelineConfigurator - Visual Guide

This guide shows what the TimelineConfigurator component looks like and how it behaves.

## Component Appearance

### Full Timeline View

```
┌─────────────────────────────────────────────────────────────┐
│  Message Timeline                          [+ Add Message]   │
│  Configure when automated messages are sent before appts     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│    ●───────────────────────────────────────────────────      │
│    │   ┌──────────────────────────────────────┐              │
│    │   │ [Confirmation] ● Active              │              │
│    ▼   │ Initial Confirmation                 │ [Toggle] [×] │
│        │ ⏰ 7 days before                      │              │
│        └──────────────────────────────────────┘              │
│                                                               │
│    ●───────────────────────────────────────────────────      │
│    │   ┌──────────────────────────────────────┐              │
│    │   │ [Prep Instructions] ● Active         │              │
│    ▼   │ Pre-Visit Preparation                │ [Toggle] [×] │
│        │ ⏰ 3 days before                      │              │
│        └──────────────────────────────────────┘              │
│                                                               │
│    ●───────────────────────────────────────────────────      │
│    │   ┌──────────────────────────────────────┐              │
│    │   │ [Reminder] ● Active                  │              │
│    ▼   │ 24-Hour Reminder                     │ [Toggle] [×] │
│        │ ⏰ 1 day before                       │              │
│        └──────────────────────────────────────┘              │
│                                                               │
│    ●───────────────────────────────────────────────────      │
│    │   ┌──────────────────────────────────────┐              │
│    │   │ [Reminder] (disabled)                │              │
│    ▼   │ 2-Hour Reminder                      │ [Toggle] [×] │
│        │ ⏰ 2 hours before                     │              │
│        └──────────────────────────────────────┘              │
│                                                               │
│    📅──────────────────────────────────────────────────      │
│        ┌──────────────────────────────────────┐              │
│        │ Appointment Time                     │              │
│        │ Patient arrives for scheduled service│              │
│        └──────────────────────────────────────┘              │
├─────────────────────────────────────────────────────────────┤
│ 3 active messages  •  4 total configured                     │
│                     Messages sent via SMS and Email ──────── │
└─────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Message Types

1. **Confirmation** (Green)
   - Icon: ✓ CheckCircle
   - Badge: Light green background with dark green text
   - Used for: Booking confirmations

2. **Reminder** (Blue)
   - Icon: 🔔 Bell
   - Badge: Light blue background with dark blue text
   - Used for: Standard appointment reminders

3. **Prep Instructions** (Purple)
   - Icon: 💬 MessageSquare
   - Badge: Light purple background with dark purple text
   - Used for: Pre-visit preparation instructions

4. **Follow-up** (Amber)
   - Icon: ✉️ Mail
   - Badge: Light amber background with dark amber text
   - Used for: Post-appointment follow-ups

5. **Custom** (Gray)
   - Icon: 💬 MessageSquare
   - Badge: Light gray background with dark gray text
   - Used for: Custom messages

### States

**Enabled Message**
- Colored icon in colored circle
- White background card with shadow
- Active indicator (green dot + "Active" text)
- Toggle switch ON (pink)

**Disabled Message**
- Gray icon in gray circle
- Light gray background card
- No active indicator
- Toggle switch OFF (gray)

**Appointment Marker**
- Pink calendar icon in pink circle
- Pink card with pink background
- Always at bottom of timeline

## Interactive Elements

### Add Message Button
```
┌────────────────────┐
│ + Add Message      │  ← Pink button, top right
└────────────────────┘
```

### Toggle Switch
```
Enabled:  ┌──●─┐  (Pink background, white circle on right)
Disabled: ┌─●──┐  (Gray background, white circle on left)
```

### Delete Button
```
[×]  ← Trash icon, appears on hover, red when hovered
```

## Timeline Elements

### Vertical Line
- Gradient from gray (top) to pink (bottom)
- 2px width
- Connects all timeline dots
- Positioned behind the timeline points

### Timeline Dots
- 44px × 44px circles
- 4px white border for depth
- Icon centered inside
- Active indicator (small dot) appears top-right when enabled

### Cards
- Rounded corners (8px)
- 2px border
- Padding: 16px
- Shadow on enabled messages
- Hover effect: subtle scale/shadow increase (optional)

## Responsive Behavior

### Desktop (>768px)
- Full width cards
- Icons visible
- All text readable
- Toggle switches on right

### Tablet (768px - 1024px)
- Slightly narrower cards
- All features remain

### Mobile (<768px)
- Stack elements
- Smaller dots (36px)
- Compact cards
- Toggle switches might stack below

## Empty State

```
┌─────────────────────────────────────────────────────────────┐
│  Message Timeline                          [+ Add Message]   │
│  Configure when automated messages are sent before appts     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                         ○                                     │
│                                                               │
│               No messages configured                          │
│                                                               │
│               [Add your first message]                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Animation Ideas (Future Enhancement)

1. **Fade In**: New messages fade in when added
2. **Slide Out**: Messages slide left when removed
3. **Pulse**: Active indicator dot has subtle pulse animation
4. **Smooth Toggle**: Toggle switch animates smoothly
5. **Sort Animation**: Messages reorder smoothly when timing changes

## Accessibility

- ✓ Keyboard navigation supported
- ✓ Screen reader friendly labels
- ✓ ARIA attributes on interactive elements
- ✓ Clear focus states
- ✓ Sufficient color contrast
- ✓ Toggle switches have accessible labels

## Usage Context

This component typically appears on:
- `/settings/automated-messages` - Main automated messaging settings
- `/settings/prep-reminders` - Pre-visit preparation configuration
- `/settings/sms` - SMS notification settings
- Patient notification preference pages

## Example Configurations

### Basic Reminder Flow
```
7 days before:  Confirmation
1 day before:   Reminder
2 hours before: Final reminder
[Appointment]
```

### Medical Spa Flow
```
7 days before:  Booking confirmation
5 days before:  Prep instructions (for injectables)
3 days before:  What to expect
1 day before:   24-hour reminder
2 hours before: Final check-in reminder
[Appointment]
```

### Minimal Flow
```
1 day before:   Reminder
[Appointment]
```

### Complex Flow
```
14 days before: Booking confirmation
7 days before:  Pre-treatment instructions
5 days before:  What to bring reminder
3 days before:  Prep checklist
1 day before:   24-hour reminder
4 hours before: Check-in reminder
[Appointment]
```
