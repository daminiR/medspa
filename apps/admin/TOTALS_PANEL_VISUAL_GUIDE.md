# Totals Panel Visual Guide

## Panel Location
- **Position:** Fixed at bottom-right of screen
- **Coordinates:** `bottom-4 right-4`
- **Z-index:** 50 (appears above most elements)
- **Min Width:** 280px

## Collapsed State
```
┌─────────────────────────────┐
│ TREATMENT TOTAL          ›  │  ← Purple/Pink background
├─────────────────────────────┤
│ 45u                         │  ← Large bold number (4xl)
│ 8 injection sites           │  ← Small gray text
└─────────────────────────────┘
```

## Expanded State (Neurotoxin Example)
```
┌─────────────────────────────┐
│ TREATMENT TOTAL          ⌄  │  ← Clickable header
├─────────────────────────────┤
│ 45u                         │  ← Total units (purple)
│ 8 injection sites           │
├─────────────────────────────┤
│ ESTIMATED COST              │
│ $450.00                     │  ← If pricing available
├─────────────────────────────┤
│ BY REGION                   │
│                             │
│ Upper Face         20u      │  ← Forehead, glabella
│ Periorbital        15u      │  ← Crows feet, tear troughs
│ Lower Face         10u      │  ← Lips, chin, jaw
│ ─────────────────────────   │
│ 📍 Custom Points   2 sites  │  ← Freehand points
└─────────────────────────────┘
```

## Expanded State (Filler Example)
```
┌─────────────────────────────┐
│ TREATMENT TOTAL          ⌄  │  ← Clickable header
├─────────────────────────────┤
│ 3.5ml                       │  ← Total volume (pink)
│ 6 injection sites           │
├─────────────────────────────┤
│ ESTIMATED COST              │
│ $2,100.00                   │
├─────────────────────────────┤
│ BY REGION                   │
│                             │
│ Mid Face           2.0ml    │  ← Cheeks, nasolabial
│ Lower Face         1.5ml    │  ← Lips, marionette
└─────────────────────────────┘
```

## Color Scheme

### Neurotoxin (Purple Theme)
- **Header Background:** `bg-purple-50` with `hover:bg-purple-100`
- **Total Display Background:** `bg-purple-50`
- **Total Number:** `text-purple-600`
- **Region Values:** `text-purple-600`

### Filler (Pink Theme)
- **Header Background:** `bg-pink-50` with `hover:bg-pink-100`
- **Total Display Background:** `bg-pink-50`
- **Total Number:** `text-pink-600`
- **Region Values:** `text-pink-600`

## Interactive Elements

### Header Button
- Click to toggle expanded/collapsed state
- Chevron icon changes: `⌄` (expanded) / `›` (collapsed)
- Smooth transitions on hover

### Dynamic Visibility
- Panel only appears when `injectionPoints.size > 0` OR `freehandPoints.size > 0`
- Automatically hides when all points are removed

## Real-Time Updates

The panel updates immediately when:
1. New injection point added → Total increases, region updated
2. Point modified (units/volume changed) → Total recalculates
3. Point removed → Total decreases, region updated
4. Switch between zones → Region breakdown updates

## Region Display Logic

Regions only show if they have injection sites:
- If no Upper Face sites → Upper Face row hidden
- If no Periorbital sites → Periorbital row hidden
- If no Mid Face sites → Mid Face row hidden
- If no Lower Face sites → Lower Face row hidden
- If no Custom Points → Custom Points row hidden

## Typography

### Header
- Text: `text-xs uppercase tracking-wide font-medium text-gray-500`

### Main Total
- Number: `text-4xl font-bold` (purple/pink)
- Label: `text-sm text-gray-600`

### Cost
- Label: `text-xs uppercase tracking-wide text-gray-500`
- Amount: `text-2xl font-semibold text-gray-900`

### Region Breakdown
- Section Title: `text-xs uppercase tracking-wide font-medium text-gray-500`
- Region Names: `text-sm text-gray-700`
- Values: `text-sm font-semibold` (purple/pink)

### Custom Points
- Icon: MapPin (blue, 12px)
- Label: `text-sm text-gray-700`
- Count: `text-xs text-gray-500`

## Spacing & Layout

- **Outer Padding:** `px-4 py-3` on each section
- **Section Spacing:** `space-y-3` between sections
- **Row Spacing:** `space-y-2` in region list
- **Borders:** `border-b border-gray-100` between sections
- **Border Radius:** `rounded-xl` on container

## Shadow & Depth
- **Shadow:** `shadow-lg` for prominent floating effect
- **Border:** `border border-gray-200`
- **Background:** `bg-white`

## Accessibility

- Header button is fully keyboard accessible
- Clear visual hierarchy
- High contrast text
- Semantic HTML structure
- Descriptive labels

## Responsive Behavior

- Fixed positioning keeps it visible during scroll
- Minimum width ensures readability
- Stacks vertically on narrow screens
- Z-index ensures visibility above other content
