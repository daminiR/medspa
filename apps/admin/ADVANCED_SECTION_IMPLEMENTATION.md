# Advanced Section Implementation

## Summary
Successfully implemented expandable "Advanced" sections in automated message settings to hide power-user features by default, improving UI simplicity for most users.

## Changes Made

### 1. Created Reusable AdvancedSection Component
**File**: `/src/app/settings/automated-messages/components/AdvancedSection.tsx`

- Expandable/collapsible section with "Advanced options" toggle button
- Shows chevron icon (down/up) to indicate expand/collapse state
- Default collapsed state (can be customized via `defaultExpanded` prop)
- Smooth transition when expanding/collapsing
- Purple-themed button to match app design

**Usage**:
```tsx
<AdvancedSection defaultExpanded={false}>
  {/* Advanced content here */}
</AdvancedSection>
```

### 2. Updated AppointmentBookedTab
**File**: `/src/app/settings/automated-messages/tabs/AppointmentBookedTab.tsx`

**Added**:
- Imported `BookingSourceToggle` and `AdvancedSection` components
- Added state for booking source settings (online/staff bookings)
- Created new "Advanced Options" section at the bottom (before Save button)
- Wrapped `BookingSourceToggle` inside `AdvancedSection`

**Features Hidden**:
- Booking Source Toggle (controls which types of bookings trigger messages)
  - Online bookings toggle
  - Staff-made bookings toggle

### 3. Updated WaitlistTab
**File**: `/src/app/settings/automated-messages/tabs/WaitlistTab.tsx`

**Modified**:
- Imported `AdvancedSection` component
- Wrapped entire "Auto-Offer Settings" section inside `AdvancedSection`
- Maintained all functionality and styling within the advanced section

**Features Hidden**:
- Auto-Offer Settings (complete section)
  - Response time limit configuration
  - Maximum offers per slot
  - Auto-skip to next patient option
  - Auto-offer summary explanation

### 4. Updated Component Index
**File**: `/src/app/settings/automated-messages/components/index.ts`

- Added export for `AdvancedSection` component

## User Experience

### Default View (Collapsed)
- Users see a simple "Advanced options ▼" link at the bottom of settings
- Main settings are visible and uncluttered
- Perfect for users who don't need power features

### Expanded View
- Click "Advanced options ▲" to reveal hidden settings
- All advanced features expand smoothly
- Click again to collapse and hide

## Benefits

1. **Cleaner UI**: Main settings page is less overwhelming
2. **Progressive Disclosure**: Power users can find advanced features when needed
3. **Consistent Pattern**: Same component used in both tabs for consistency
4. **Accessible**: Clear labeling and keyboard-accessible controls
5. **Flexible**: Easy to add more advanced sections in the future

## Testing Recommendations

1. Navigate to Settings → Automated Messages
2. Check AppointmentBookedTab:
   - Scroll to bottom, verify "Advanced options" link is visible
   - Click to expand, verify Booking Source Toggle appears
   - Click to collapse, verify section hides
3. Check WaitlistTab:
   - Scroll to Auto-Offer Settings area
   - Verify "Advanced options" link is visible
   - Click to expand, verify all auto-offer settings appear
   - Toggle auto-offer on/off while expanded
   - Click to collapse, verify section hides
4. Verify all settings still function correctly when expanded
5. Check that Save buttons work as expected

## Files Modified

1. `/src/app/settings/automated-messages/components/AdvancedSection.tsx` (NEW)
2. `/src/app/settings/automated-messages/components/index.ts` (UPDATED)
3. `/src/app/settings/automated-messages/tabs/AppointmentBookedTab.tsx` (UPDATED)
4. `/src/app/settings/automated-messages/tabs/WaitlistTab.tsx` (UPDATED)

## Technical Details

- **Component Type**: Client-side React component ('use client')
- **State Management**: Local useState for expand/collapse
- **Styling**: Tailwind CSS classes (consistent with app styling)
- **Icons**: Lucide React icons (ChevronDown, ChevronUp)
- **Accessibility**: Semantic HTML with clear button labels
