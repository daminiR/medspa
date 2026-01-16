# Auto-Save Visual Implementation Guide

## File Structure Overview

```
InteractiveFaceChart.tsx
│
├── Imports (lines 1-46) ✓ No changes needed
│
├── Types (lines 48-106) ✓ No changes needed
│
├── Constants (lines 108-183) ✓ No changes needed
│
├── Main Component (starts line 189)
│   │
│   ├── State declarations (lines 217-244) ✓ No changes needed
│   │
│   ├── Refs (lines 250-251)
│   │   ├── chartRef
│   │   ├── containerRef
│   │   └── ⭐ ADD AUTO-SAVE STATE HERE (3 lines)
│   │
│   ├── Active items (lines 254-259) ✓ No changes needed
│   │
│   ├── Totals calculation (lines 262-300) ✓ No changes needed
│   │
│   ├── 📍 HANDLERS SECTION (lines 302-515)
│   │   ├── handleZoneClick
│   │   ├── getSmartDefaults
│   │   ├── updateInjectionPoint
│   │   ├── removeInjectionPoint
│   │   ├── quickAdjustUnits
│   │   ├── setExactUnits
│   │   ├── applyTemplate
│   │   ├── copyLastTreatment
│   │   └── clearAll ⭐ MODIFY THIS (add 2 lines + update dependencies)
│   │
│   ├── ⭐ ADD NEW SECTION: AUTO-SAVE HANDLERS (~150 lines)
│   │   ├── saveToLocalStorage (debounced save function)
│   │   ├── useEffect: trigger save on changes
│   │   ├── useEffect: load and restore on mount
│   │   └── useEffect: cleanup on unmount
│   │
│   ├── 📍 MULTI-SELECT HANDLERS (lines 520+) ✓ No changes needed
│   │
│   ├── 📍 VOICE INPUT HANDLERS ✓ No changes needed
│   │
│   ├── 📍 FREEHAND HANDLERS ✓ No changes needed
│   │
│   ├── 📍 KEYBOARD SHORTCUTS ✓ No changes needed
│   │
│   └── 📍 RENDER (JSX)
│       │
│       └── Toolbar section (around line 930-1012)
│           ├── Face Injection Map header
│           ├── Product type badge
│           ├── Drawing mode toggle
│           ├── Templates button
│           ├── ⭐ ADD AUTO-SAVE INDICATORS HERE (15 lines)
│           ├── Copy Last button
│           ├── Keyboard help
│           └── Clear button
│
└── Sub-components (QuickEditPanel, FreehandQuickEditPanel) ✓ No changes needed
```

## Change Locations Detail

### Change 1: Add State Variables (after line 251)
```
LINE 250: const chartRef = useRef<HTMLDivElement>(null)
LINE 251: const containerRef = useRef<HTMLDivElement>(null)
LINE 252:
LINE 253: ⭐ // Auto-save state
LINE 254: ⭐ const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
LINE 255: ⭐ const autoSaveKey = 'charting-autosave-draft'
LINE 256: ⭐ const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
LINE 257:
LINE 258: // Get active items from settings
```

### Change 2: Modify clearAll Function (around line 505-518)
```
LINE 513:   setQuickEdit({ isOpen: false, zoneId: null, position: { x: 0, y: 0 } })
LINE 514: ⭐ // Clear auto-save when user explicitly clears all
LINE 515: ⭐ localStorage.removeItem(autoSaveKey)
LINE 516: ⭐ setAutoSaveStatus('idle')
LINE 517:   toast.success('Cleared all', { duration: 1000 })
LINE 518: }, [onInjectionPointsChange, setFreehandPoints, triggerHaptic, ⭐autoSaveKey])
```

### Change 3: Add AUTO-SAVE HANDLERS Section (after line 518, before MULTI-SELECT)
```
LINE 518: }, [onInjectionPointsChange, setFreehandPoints, triggerHaptic, autoSaveKey])
LINE 519:
LINE 520: ⭐ // ========================================================================
LINE 521: ⭐ // AUTO-SAVE HANDLERS
LINE 522: ⭐ // ========================================================================
LINE 523: ⭐
LINE 524: ⭐ // Debounced save to localStorage
LINE 525: ⭐ const saveToLocalStorage = useCallback(() => {
...
⭐ [~150 lines of auto-save code]
...
LINE 670:
LINE 671: // ==========================================================================
LINE 672: // MULTI-SELECT MODE HANDLERS (Speed Charting)
LINE 673: // ==========================================================================
```

### Change 4: Add Visual Indicators (in toolbar, around line 995)
```
LINE 994:     <Zap className="w-4 h-4" />
LINE 995:     Templates
LINE 996:   </button>
LINE 997:
LINE 998: ⭐ {/* Auto-save indicator */}
LINE 999: ⭐ {autoSaveStatus === 'saved' && (
LINE1000: ⭐   <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs">
LINE1001: ⭐     <Check className="w-3 h-3" />
LINE1002: ⭐     Saved
LINE1003: ⭐   </div>
LINE1004: ⭐ )}
LINE1005: ⭐ {autoSaveStatus === 'saving' && (
LINE1006: ⭐   <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
LINE1007: ⭐     <Clock className="w-3 h-3 animate-spin" />
LINE1008: ⭐     Saving...
LINE1009: ⭐   </div>
LINE1010: ⭐ )}
LINE1011:
LINE1012:   {/* Copy Last */}
```

## Visual Flow Diagram

```
User adds injection point
         │
         ├─> onInjectionPointsChange(newMap)
         │
         ├─> injectionPoints state updates
         │
         ├─> useEffect detects change
         │
         ├─> saveToLocalStorage() called
         │
         ├─> setAutoSaveStatus('saving') ─────> [UI shows "Saving..."]
         │
         ├─> Wait 1 second (debounce)
         │
         ├─> localStorage.setItem(key, data)
         │
         ├─> setAutoSaveStatus('saved') ──────> [UI shows "Saved" ✓]
         │
         └─> After 2 seconds ──────────────────> [Indicator hides]


User refreshes page
         │
         ├─> Component mounts
         │
         ├─> useEffect (restore) runs
         │
         ├─> localStorage.getItem(key)
         │
         ├─> Check timestamp (< 1 hour?)
         │
         ├─> Check context (product type, gender match?)
         │
         ├─> Show toast with Restore/Discard buttons
         │
         ├─ User clicks "Restore"
         │  ├─> onInjectionPointsChange(restoredMap)
         │  ├─> setFreehandPoints(restoredMap)
         │  └─> toast.success("Chart restored")
         │
         └─ User clicks "Discard"
            └─> localStorage.removeItem(key)
```

## Color Coding Legend

- ⭐ = Lines to add/modify
- ✓ = No changes needed
- 📍 = Existing section (reference point)

## Summary of Changes

| Location | Type | Lines | Description |
|----------|------|-------|-------------|
| After line 251 | Add | 4 | Auto-save state variables |
| Line 514-515 | Add | 3 | Clear localStorage in clearAll |
| Line 518 | Modify | 1 | Update dependencies array |
| After line 518 | Add | ~150 | Auto-save handlers section |
| After line 996 | Add | 15 | Visual status indicators |

**Total new lines**: ~172
**Modified lines**: 1
**Total changes**: 5 locations

## Icons Required

Already imported in the file:
- `Check` - for "Saved" indicator ✓
- `Clock` - for "Saving..." indicator ⏰

## Dependencies Update

The `clearAll` function dependencies change from:
```typescript
[onInjectionPointsChange, setFreehandPoints, triggerHaptic]
```

To:
```typescript
[onInjectionPointsChange, setFreehandPoints, triggerHaptic, autoSaveKey]
```

## File Size Impact

- **Before**: ~1976 lines
- **After**: ~2148 lines
- **Increase**: ~172 lines (~8.7%)

## Estimated Application Time

- **Read/understand**: 5 minutes
- **Apply changes**: 5-10 minutes
- **Test**: 5 minutes
- **Total**: 15-20 minutes
