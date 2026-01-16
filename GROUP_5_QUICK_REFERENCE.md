# Group 5: Quick Reference - Templates & Persistence

## ONE-PAGE CHEAT SHEET

### TREATMENT TEMPLATES (6 Total)

#### Neurotoxin Templates (4)
```
1. Baby Botox - 25u (forehead 10u + glabella 15u)
2. Lip Flip - 4u (upper lip left 2u + right 2u)
3. Crow's Feet Only - 24u (left 12u + right 12u)
4. Full Face - 64u (forehead 20u + glabella 20u + crow's feet 24u)
```

#### Filler Templates (2)
```
1. Natural Lips - 1.0ml (upper 0.6ml + lower 0.4ml)
2. Cheek Volumization - 2.0ml (left 1.0ml + right 1.0ml)
```

---

### AUTO-SAVE BEHAVIOR

```
User adds point → Wait 1s → Save to localStorage → Show "Saved ✓" → Hide after 2s
Page load → Check localStorage → Recent data? → Show restore prompt → User chooses
User clicks "Clear All" → Clear localStorage → Remove auto-save
```

**Storage Key**: `'charting-autosave-draft'`
**Debounce**: 1 second
**Expiry**: 1 hour
**Context**: Product type + gender must match

---

### UNDO/REDO

**Keyboard Shortcuts:**
- `Cmd+Z` or `Ctrl+Z` - Undo
- `Cmd+Shift+Z` or `Ctrl+Shift+Z` - Redo

**History:**
- Tracks last 20 states
- Clears future on new action
- Works for all operations (add, edit, delete, template, copy, clear)

**Visual:**
```
[Undo Button] [Redo Button] | [Templates] [Copy Last] [Clear]
   ↩️ grayed      ↪️ active
```

---

### CODE LOCATIONS

#### Templates
- **Definitions**: `src/contexts/ChartingSettingsContext.tsx` (line ~340)
- **Application**: `src/components/charting/InteractiveFaceChart.tsx` (applyTemplate function)

#### Auto-Save
- **State**: Line ~253-256 (InteractiveFaceChart.tsx)
- **Logic**: Line ~520-670 (AUTO-SAVE HANDLERS section)
- **Clear**: Line ~514-516 (in clearAll function)
- **UI**: Line ~998-1010 (status indicator in toolbar)

#### Undo/Redo
- **State**: Line ~261-263 (after auto-save state)
- **Handlers**: Line ~327-360 (UNDO/REDO HANDLERS section)
- **Integration**: 7 functions (search for `pushToHistory`)
- **Keyboard**: Line ~921 (Cmd+Z handler)
- **UI**: Toolbar buttons before Templates button

---

### INTEGRATION POINTS

**Functions that need `pushToHistory(newPoints)` call:**
```typescript
1. handleZoneClick          // When adding new point
2. updateInjectionPoint     // When editing point
3. removeInjectionPoint     // When deleting point
4. applyTemplate            // When applying template
5. copyLastTreatment        // When copying previous
6. clearAll                 // When clearing all
7. applyBatchUnits          // When batch editing
```

**Pattern:**
```typescript
const newPoints = new Map(...)
pushToHistory(newPoints)     // ← ADD THIS
onInjectionPointsChange(newPoints)
```

---

### VISUAL COMPONENTS

#### Template Card (Mobile)
```tsx
┌────────────────────────┐
│ Baby Botox             │
│ Light preventative     │
│ treatment              │
│                   25u  │
└────────────────────────┘
```

#### Auto-Save Indicator
```tsx
┌─────────────┐        ┌─────────────┐
│ ⏱️ Saving... │   →   │ ✓ Saved     │   →   [hidden after 2s]
└─────────────┘        └─────────────┘
```

#### Undo/Redo Buttons
```tsx
┌───┬───┐
│ ↩️ │ ↪️ │  (disabled = grayed out, enabled = hover effect)
└───┴───┘
```

---

### MOBILE OPTIMIZATIONS

1. **Touch Targets**: Minimum 44px height
2. **Horizontal Scroll**: Swipeable template carousel
3. **Active States**: `active:scale-95` for tactile feedback
4. **Line Clamping**: Prevents text overflow on small screens
5. **Sticky Templates**: Panel accessible while charting

---

### STORAGE FORMAT

```json
{
  "injectionPoints": [
    {
      "zoneId": "forehead",
      "id": "ip-123...",
      "units": 20,
      "productId": "botox-50u",
      "timestamp": "2026-01-07T12:34:56.789Z"
    }
  ],
  "freehandPoints": [...],
  "timestamp": 1704631496000,
  "productType": "neurotoxin",
  "gender": "female"
}
```

---

### ERROR HANDLING

**Auto-Save:**
- Try/catch on localStorage write
- Graceful fallback if quota exceeded
- Console error logging

**Restore:**
- Validates timestamp (< 1 hour)
- Validates context (product type + gender)
- Clears stale data automatically

**Undo/Redo:**
- Bounds checking on history array
- Toast notifications for user feedback
- Disabled state when unavailable

---

### DEPENDENCIES

**New Icons:**
- `RotateCcw` (lucide-react) - Undo/redo buttons
- `Clock` (lucide-react) - Auto-save "Saving..." indicator
- `Check` (lucide-react) - Auto-save "Saved" indicator
- `Zap` (lucide-react) - Templates icon (already exists)
- `Save` (lucide-react) - Save template button

**No new npm packages required** - all features use built-in React hooks and browser localStorage.

---

### TESTING COMMANDS

```bash
# Test auto-save
1. Add injection points
2. Wait 1 second
3. See "Saved ✓" indicator
4. Refresh page
5. See restore prompt
6. Click "Restore"

# Test undo/redo
1. Add 5 injection points
2. Press Cmd+Z 3 times
3. See 3 points removed
4. Press Cmd+Shift+Z 2 times
5. See 2 points restored

# Test templates
1. Click "Templates" button
2. Scroll template carousel
3. Click "Baby Botox"
4. See forehead + glabella filled
5. Verify 25u total
```

---

### COMMON ISSUES & FIXES

**Issue**: Auto-save not working
**Fix**: Check if `readOnly` prop is false, verify localStorage is enabled

**Issue**: Undo button always disabled
**Fix**: Ensure `pushToHistory()` is called BEFORE `onInjectionPointsChange()`

**Issue**: Templates not showing
**Fix**: Verify `productType` matches template's productType (neurotoxin vs filler)

**Issue**: Restore prompt not appearing
**Fix**: Check timestamp is < 1 hour old, product type and gender match

---

### FILES TO REVIEW

1. `/Users/daminirijhwani/medical-spa-platform/apps/admin/src/components/charting/InteractiveFaceChart.tsx` (main file)
2. `/Users/daminirijhwani/medical-spa-platform/apps/admin/src/contexts/ChartingSettingsContext.tsx` (templates)
3. `/Users/daminirijhwani/medical-spa-platform/GROUP_5_TEMPLATES_PERSISTENCE_SUMMARY.md` (detailed docs)
