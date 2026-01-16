# Default vs Customized Visual Indicators - Implementation Status

## Overview
Adding visual indicators to show when MessageCard templates are using default settings vs customized settings.

## Current State Analysis

### ✅ Already Implemented
1. **MessageCard Component** (`/src/app/settings/automated-messages/components/MessageCard.tsx`)
   - Has `isUsingDefaults` prop
   - Has `onResetToDefaults` prop
   - Shows "Default" badge (green) when collapsed and using defaults
   - Shows "Customized" badge (blue) when collapsed and not using defaults
   - Shows "Reset to Recommended Settings" button when expanded and customized
   - Shows success message when using defaults

2. **useAutomatedMessages Hook** (`/src/hooks/useAutomatedMessages.ts`)
   - Provides `isUsingDefaults(eventType)` function that performs deep comparison
   - Provides `resetToDefaults(eventType)` function to reset specific message types
   - Provides `getSettings(eventType)` to get current settings
   - Tracks all modifications in localStorage

3. **CheckInTab Already Uses Pattern** (`/src/app/settings/automated-messages/tabs/CheckInTab.tsx`)
   - Imports and uses `useAutomatedMessages` hook
   - Passes `isUsingDefaults` and `onResetToDefaults` to each MessageCard
   - Implements reset handlers for each card

## Tasks Remaining

### ❌ AppointmentBookedTab Needs Integration
The AppointmentBookedTab does NOT use the hook and tracking yet. It needs:
1. Import `useAutomatedMessages` hook
2. Track modifications to confirmation settings
3. Pass `isUsingDefaults` prop to each MessageCard
4. Implement reset handlers for each card
5. Update state when templates are modified

## Implementation Plan

### Step 1: Integrate Hook into AppointmentBookedTab
- Import `useAutomatedMessages`
- Use hook to check if using defaults
- Pass props to MessageCards

### Step 2: Track Template Modifications
- When user modifies any template, it should automatically become "Customized"
- Badge should update in real-time
- Reset button should appear when expanded

### Step 3: Implement Reset Functionality
- Each MessageCard should have its own reset handler
- Reset should restore all settings to defaults
- Badge should change back to "Default" after reset

### Step 4: Test Badge Behavior
- Badge shows "Default" when using recommended settings
- Badge changes to "Customized" when user modifies any field
- Reset button restores to defaults
- Badge updates immediately when templates modified

## Files to Modify
1. `/src/app/settings/automated-messages/tabs/AppointmentBookedTab.tsx` - Add hook integration
2. `/src/app/settings/automated-messages/tabs/AppointmentCanceledTab.tsx` - Verify integration
3. `/src/app/settings/automated-messages/tabs/SaleClosedTab.tsx` - Verify integration
4. `/src/app/settings/automated-messages/tabs/GiftCardsTab.tsx` - Verify integration
5. `/src/app/settings/automated-messages/tabs/MembershipsTab.tsx` - Verify integration
6. `/src/app/settings/automated-messages/tabs/WaitlistTab.tsx` - Verify integration
7. `/src/app/settings/automated-messages/tabs/FormSubmittedTab.tsx` - Verify integration

## Testing Checklist
- [ ] Badge shows "Default" on initial load
- [ ] Badge changes to "Customized" when template modified
- [ ] Reset button appears when card expanded and customized
- [ ] Reset button restores all settings to defaults
- [ ] Badge changes back to "Default" after reset
- [ ] Settings persist across page refreshes
- [ ] Multiple cards can be tracked independently
