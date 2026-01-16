# ConfirmationRequestConfig - Visual Layout Guide

## Component Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────┐  Confirmation Request                              ╭─────╮    │
│  │ 💬  │  Request patients to confirm their appointments     │ ON  │    │
│  │Amber│  via SMS reply                                      ╰─────╯    │
│  └─────┘                                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ✓  Reduce No-Shows by 50%                            [Green Box] │  │
│  │                                                                   │  │
│  │    Patients reply C to confirm or R to reschedule. This simple   │  │
│  │    confirmation system significantly reduces missed appointments │  │
│  │    and keeps your schedule full.                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ☐  Set appointment status to "Unconfirmed" until confirmed      │  │
│  │                                                      [Grey Box]   │  │
│  │    New appointments will be marked as "Unconfirmed" until the    │  │
│  │    patient replies with "C". Status automatically updates to     │  │
│  │    "Confirmed" when they respond.                                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 🕐  Send follow-up if no response                    ╭─────╮     │  │
│  │     Automatically send a reminder if patient         │ ON  │     │  │
│  │     hasn't confirmed                                 ╰─────╯     │  │
│  │     ─────────────────────────────────────────────────────────    │  │
│  │     Follow-up delay (hours)                                      │  │
│  │     ┌────┐  hours after initial message                          │  │
│  │     │ 24 │                                                        │  │
│  │     └────┘                                                        │  │
│  │     Recommended: 24-48 hours. Follow-up will only be sent if     │  │
│  │     patient hasn't confirmed.                                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 💬  Example SMS                                      [Blue Box]  │  │
│  │                                                                   │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │ Your appointment at Luxe Medical Spa is confirmed for     │ │  │
│  │  │ Tuesday, Jan 9 at 2:00 PM with Dr. Sarah Johnson. Reply  │ │  │
│  │  │ C to confirm, R to reschedule.                            │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                                                                   │  │
│  │  Follow-up (24h later):                                          │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │ Reminder: Please confirm your appointment on Tuesday,     │ │  │
│  │  │ Jan 9 at 2:00 PM. Reply C to confirm or R to reschedule.  │ │  │
│  │  │ Call us at (555) 123-4567 if you have questions.          │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ⚠  Best Practices                                   [Amber Box]  │  │
│  │                                                                   │  │
│  │    • Most patients confirm within 2-4 hours of receiving the     │  │
│  │      message                                                      │  │
│  │    • Enable follow-up to capture patients who forget to respond  │  │
│  │      initially                                                    │  │
│  │    • Unconfirmed appointments can be flagged for phone call      │  │
│  │      follow-up                                                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Color Scheme

### When ENABLED (ON)

- **Header Icon**: Amber background (`bg-amber-100`) with amber icon (`text-amber-600`)
- **Toggle**: Amber background (`bg-amber-600`) with white slider
- **Benefits Box**: Green background (`bg-green-50`) with green border and text
- **Checkbox Section**: Grey background (`bg-gray-50`) with hover effect
- **Follow-up Section**: Grey background with amber toggle
- **SMS Preview**: Blue background (`bg-blue-50`) with blue border
- **Best Practices**: Amber background (`bg-amber-50`) with amber border

### When DISABLED (OFF)

- **Header Icon**: Grey background (`bg-gray-100`) with grey icon (`text-gray-400`)
- **Toggle**: Grey background (`bg-gray-300`) with white slider
- **All Sections**: 50% opacity (`opacity-50`) and no pointer events

## Interactive Elements

### 1. Main Toggle Switch (Top Right)
```
Disabled: ○────        (Grey background)
Enabled:  ────○        (Amber background)
```

### 2. Checkbox (Set Unconfirmed)
```
Unchecked: ☐  Set appointment status to "Unconfirmed"...
Checked:   ☑  Set appointment status to "Unconfirmed"...
```

### 3. Follow-up Toggle (Nested)
```
Disabled: ○────        (Small, grey)
Enabled:  ────○        (Small, amber)
```

### 4. Number Input (Follow-up Hours)
```
┌────────┐
│   24   │  ← hours after initial message
└────────┘
   ↑↓
```

## Responsive Behavior

- Mobile (< 640px): Single column, stacked elements
- Tablet (640px - 1024px): Standard layout with wrapped text
- Desktop (> 1024px): Full layout as shown above

## Spacing

- **Outer padding**: `p-6` (24px)
- **Section gaps**: `space-y-4` (16px between sections)
- **Internal gaps**: `gap-2`, `gap-3`, `gap-4` (8px, 12px, 16px)
- **Border radius**: `rounded-lg` (8px)

## Icons Used

| Icon | Name | Color | Location |
|------|------|-------|----------|
| 💬 | MessageSquare | Amber | Header |
| ✓ | CheckCircle | Green | Benefits box |
| ⏰ | Clock | Grey | Follow-up section |
| ⚠ | AlertCircle | Amber | Best practices |

## Typography

- **Component Title**: `text-lg font-semibold` (18px, semi-bold)
- **Subtitle**: `text-sm text-gray-500` (14px, grey)
- **Section Titles**: `font-medium text-gray-900` (medium, dark)
- **Body Text**: `text-sm text-gray-500` (14px, grey)
- **SMS Preview**: `text-sm font-mono` (14px, monospace)
- **Helper Text**: `text-xs text-gray-500` (12px, light grey)

## State Transitions

All interactive elements use smooth transitions:
```css
transition-colors  /* Color changes on hover/focus */
transition-transform  /* Toggle switch movement */
hover:bg-gray-100  /* Hover states */
focus:ring-2  /* Focus indicators */
```

## Accessibility Features

- ✓ ARIA labels on all toggles
- ✓ Proper semantic HTML (`label`, `button`, `input`)
- ✓ Keyboard navigation support
- ✓ Focus visible indicators
- ✓ Disabled states properly marked
- ✓ Color contrast meets WCAG AA standards

## Example Screenshot Placeholders

### Enabled State
![Enabled](./screenshots/confirmation-request-enabled.png)

### Disabled State
![Disabled](./screenshots/confirmation-request-disabled.png)

### Follow-up Enabled
![Follow-up](./screenshots/confirmation-request-followup.png)

### Mobile View
![Mobile](./screenshots/confirmation-request-mobile.png)
