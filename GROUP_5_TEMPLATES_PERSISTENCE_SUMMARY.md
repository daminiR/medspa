# Group 5: Templates & Persistence - Consolidated Summary

## Overview
This document consolidates the implementation of **quick treatment templates**, **mobile template selection UI**, **auto-save functionality**, and **undo/redo state management** for the charting system.

---

## 1. TREATMENT TEMPLATES

### Template Type Definition
```typescript
export interface TreatmentTemplate {
  id: string
  name: string
  description: string
  productType: 'neurotoxin' | 'filler'
  totalUnits?: number
  zones: Array<{
    zoneId: string
    units?: number
    volume?: number
    depth: string
    technique: string
    needleGauge: string
  }>
  products: string[]
  isCustom?: boolean
  createdAt?: Date
}
```

### Common Treatment Templates
```typescript
// File: src/contexts/ChartingSettingsContext.tsx

const DEFAULT_TREATMENT_TEMPLATES: TreatmentTemplate[] = [
  // NEUROTOXIN TEMPLATES
  {
    id: 'baby-botox',
    name: 'Baby Botox',
    description: 'Light preventative treatment',
    productType: 'neurotoxin',
    totalUnits: 25,
    zones: [
      {
        zoneId: 'forehead',
        units: 10,
        depth: 'intradermal',
        technique: 'linear-threading',
        needleGauge: '32g'
      },
      {
        zoneId: 'glabella',
        units: 15,
        depth: 'intramuscular',
        technique: 'serial-puncture',
        needleGauge: '32g'
      }
    ],
    products: ['botox-50u']
  },
  {
    id: 'lip-flip',
    name: 'Lip Flip',
    description: 'Upper lip flip only',
    productType: 'neurotoxin',
    totalUnits: 4,
    zones: [
      {
        zoneId: 'lip-upper-left',
        units: 2,
        depth: 'intradermal',
        technique: 'serial-puncture',
        needleGauge: '32g'
      },
      {
        zoneId: 'lip-upper-right',
        units: 2,
        depth: 'intradermal',
        technique: 'serial-puncture',
        needleGauge: '32g'
      }
    ],
    products: ['botox-50u']
  },
  {
    id: 'crows-feet-only',
    name: "Crow's Feet Only",
    description: "Just crow's feet treatment",
    productType: 'neurotoxin',
    totalUnits: 24,
    zones: [
      {
        zoneId: 'crows-feet-left',
        units: 12,
        depth: 'intradermal',
        technique: 'fan-pattern',
        needleGauge: '32g'
      },
      {
        zoneId: 'crows-feet-right',
        units: 12,
        depth: 'intradermal',
        technique: 'fan-pattern',
        needleGauge: '32g'
      }
    ],
    products: ['botox-50u']
  },
  {
    id: 'full-face-neurotoxin',
    name: 'Full Face',
    description: 'Upper face comprehensive treatment',
    productType: 'neurotoxin',
    totalUnits: 64,
    zones: [
      { zoneId: 'forehead', units: 20, depth: 'intradermal', technique: 'linear-threading', needleGauge: '32g' },
      { zoneId: 'glabella', units: 20, depth: 'intramuscular', technique: 'serial-puncture', needleGauge: '32g' },
      { zoneId: 'crows-feet-left', units: 12, depth: 'intradermal', technique: 'fan-pattern', needleGauge: '32g' },
      { zoneId: 'crows-feet-right', units: 12, depth: 'intradermal', technique: 'fan-pattern', needleGauge: '32g' }
    ],
    products: ['botox-50u']
  },

  // FILLER TEMPLATES
  {
    id: 'lips-natural',
    name: 'Natural Lips',
    description: 'Subtle lip enhancement',
    productType: 'filler',
    zones: [
      { zoneId: 'lip-upper-left', volume: 0.3, depth: 'submucosal', technique: 'linear-threading', needleGauge: '27g' },
      { zoneId: 'lip-upper-right', volume: 0.3, depth: 'submucosal', technique: 'linear-threading', needleGauge: '27g' },
      { zoneId: 'lip-lower-left', volume: 0.2, depth: 'submucosal', technique: 'linear-threading', needleGauge: '27g' },
      { zoneId: 'lip-lower-right', volume: 0.2, depth: 'submucosal', technique: 'linear-threading', needleGauge: '27g' }
    ],
    products: ['juvederm-volbella']
  },
  {
    id: 'cheek-volumization',
    name: 'Cheek Volumization',
    description: 'Mid-face volume restoration',
    productType: 'filler',
    zones: [
      { zoneId: 'cheek-left', volume: 1.0, depth: 'supraperiosteal', technique: 'bolus', needleGauge: '25g' },
      { zoneId: 'cheek-right', volume: 1.0, depth: 'supraperiosteal', technique: 'bolus', needleGauge: '25g' }
    ],
    products: ['juvederm-voluma']
  }
]
```

### Template Application Logic
```typescript
// File: src/components/charting/InteractiveFaceChart.tsx

const applyTemplate = useCallback((template: TreatmentTemplate) => {
  const newPoints = new Map<string, InjectionPoint>()

  template.zones.forEach(tz => {
    newPoints.set(tz.zoneId, {
      id: `ip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      zoneId: tz.zoneId,
      units: tz.units,
      volume: tz.volume,
      depthId: tz.depth,
      techniqueId: tz.technique,
      needleGaugeId: tz.needleGauge,
      productId: template.products[0],
      timestamp: new Date()
    })
  })

  pushToHistory(newPoints) // Undo/redo support
  onInjectionPointsChange(newPoints)
  setShowTemplates(false)
  toast.success(`Applied "${template.name}"`, { icon: '⚡' })
}, [onInjectionPointsChange, pushToHistory])
```

---

## 2. MOBILE TEMPLATE SELECTION UI

### Template Carousel Panel
```tsx
{/* Templates Panel - Mobile-Optimized */}
{showTemplates && activeTemplates.length > 0 && (
  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-b border-purple-100">
    <div className="px-4 pt-3 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-purple-900 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Quick Templates
        </p>
        {injectionPoints.size > 0 && (
          <button
            onClick={saveCurrentAsTemplate}
            className="text-xs px-2.5 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-1 min-h-[44px] touch-manipulation"
          >
            <Save className="w-3 h-3" />
            <span>Save Current</span>
          </button>
        )}
      </div>

      {/* Horizontal Scroll Carousel */}
      <div className="overflow-x-auto -mx-4 px-4 pb-2">
        <div className="flex gap-2 min-w-max">
          {activeTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => applyTemplate(template)}
              className="flex-shrink-0 w-40 p-3 bg-white rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all shadow-sm min-h-[88px] touch-manipulation active:scale-95"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="text-sm font-semibold text-gray-900 line-clamp-1">
                  {template.name}
                </span>
                <span className="text-xs text-gray-600 line-clamp-2">
                  {template.description}
                </span>
                {template.totalUnits && (
                  <span className="text-xs font-medium text-purple-600">
                    {template.totalUnits}u
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      {customTemplates.length > 0 && (
        <div className="mt-2 pt-2 border-t border-purple-200">
          <p className="text-xs font-medium text-purple-800 mb-2">Custom Templates</p>
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
            {customTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="flex-shrink-0 w-40 p-2.5 bg-purple-100 rounded-lg border border-purple-300 hover:bg-purple-200 transition-colors min-h-[70px] touch-manipulation"
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs font-semibold text-gray-900 line-clamp-1">
                    {template.name}
                  </span>
                  <span className="text-xs text-gray-600">
                    {template.totalUnits}u total
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)}
```

### Mobile-Friendly Features
- **Touch targets**: Minimum 44px height for buttons
- **Horizontal scroll**: Swipeable carousel for templates
- **Active states**: Visual feedback with `active:scale-95`
- **Line clamping**: Prevents text overflow
- **Sticky positioning**: Templates accessible while charting

---

## 3. AUTO-SAVE FUNCTIONALITY

### State Variables
```typescript
// File: src/components/charting/InteractiveFaceChart.tsx

// Auto-save state
const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
const autoSaveKey = 'charting-autosave-draft'
const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
```

### Debounced Save Function
```typescript
const saveToLocalStorage = useCallback(() => {
  if (readOnly) return

  // Clear existing timeout
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current)
  }

  // Set saving status
  setAutoSaveStatus('saving')

  // Debounce save by 1 second
  saveTimeoutRef.current = setTimeout(() => {
    try {
      // Convert Maps to arrays for JSON serialization
      const data = {
        injectionPoints: Array.from(injectionPoints.entries()).map(([zoneId, point]) => ({
          zoneId,
          ...point,
          timestamp: point.timestamp.toISOString()
        })),
        freehandPoints: Array.from(freehandPoints.entries()).map(([pointId, point]) => ({
          pointId,
          ...point,
          timestamp: point.timestamp.toISOString()
        })),
        timestamp: Date.now(),
        productType,
        gender
      }

      localStorage.setItem(autoSaveKey, JSON.stringify(data))
      setAutoSaveStatus('saved')

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setAutoSaveStatus('idle')
      }, 2000)
    } catch (e) {
      console.error('Failed to auto-save chart data:', e)
      setAutoSaveStatus('idle')
    }
  }, 1000)
}, [injectionPoints, freehandPoints, readOnly, autoSaveKey, productType, gender])
```

### Trigger Save on Changes
```typescript
useEffect(() => {
  if (!readOnly && (injectionPoints.size > 0 || freehandPoints.size > 0)) {
    saveToLocalStorage()
  }
}, [injectionPoints, freehandPoints, readOnly, saveToLocalStorage])
```

### Restore Prompt on Mount
```typescript
useEffect(() => {
  if (readOnly) return

  const saved = localStorage.getItem(autoSaveKey)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      // Only restore if recent (within last hour) and matches current context
      const hourAgo = Date.now() - 3600000
      if (data.timestamp > hourAgo && data.productType === productType && data.gender === gender) {
        // Show restore prompt
        toast((t) => (
          <div className="flex flex-col gap-2">
            <p className="font-medium text-gray-900">Restore unsaved chart?</p>
            <p className="text-sm text-gray-600">
              From {new Date(data.timestamp).toLocaleTimeString()}
            </p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => {
                  // Restore injection points
                  const restoredInjectionPoints = new Map(
                    data.injectionPoints.map((item: any) => [
                      item.zoneId,
                      {
                        ...item,
                        timestamp: new Date(item.timestamp)
                      }
                    ])
                  )
                  onInjectionPointsChange(restoredInjectionPoints)

                  // Restore freehand points
                  const restoredFreehandPoints = new Map(
                    data.freehandPoints.map((item: any) => [
                      item.pointId,
                      {
                        ...item,
                        timestamp: new Date(item.timestamp)
                      }
                    ])
                  )
                  setFreehandPoints(restoredFreehandPoints)

                  toast.dismiss(t.id)
                  toast.success('Chart restored', { icon: '✓' })
                }}
                className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                Restore
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem(autoSaveKey)
                  toast.dismiss(t.id)
                  toast('Discarded auto-save', { icon: 'ℹ️' })
                }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        ), {
          duration: 10000,
          position: 'top-center'
        })
      } else {
        // Remove stale data
        localStorage.removeItem(autoSaveKey)
      }
    } catch (e) {
      console.error('Failed to parse saved chart data:', e)
      localStorage.removeItem(autoSaveKey)
    }
  }
}, []) // Only run on mount
```

### Clear Auto-Save on "Clear All"
```typescript
const clearAll = useCallback(() => {
  onInjectionPointsChange(new Map())
  setFreehandPoints(new Map())
  setSelectedZone(null)
  setSelectedFreehandPoint(null)
  setMultiSelectedZones(new Set())
  setMultiSelectedFreehand(new Set())
  setQuickEdit({ isOpen: false, zoneId: null, position: { x: 0, y: 0 } })

  // Clear auto-save when user explicitly clears all
  localStorage.removeItem(autoSaveKey)
  setAutoSaveStatus('idle')

  toast.success('Cleared all', { duration: 1000 })
}, [onInjectionPointsChange, setFreehandPoints, autoSaveKey])
```

### Visual Status Indicator
```tsx
{/* Auto-Save Status */}
{autoSaveStatus !== 'idle' && (
  <div className="flex items-center gap-1.5 text-xs">
    {autoSaveStatus === 'saving' && (
      <>
        <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
        <span className="text-blue-600 font-medium">Saving...</span>
      </>
    )}
    {autoSaveStatus === 'saved' && (
      <>
        <Check className="w-3.5 h-3.5 text-green-600" />
        <span className="text-green-600 font-medium">Saved</span>
      </>
    )}
  </div>
)}
```

### Cleanup on Unmount
```typescript
useEffect(() => {
  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
  }
}, [])
```

---

## 4. UNDO/REDO FUNCTIONALITY

### State Variables
```typescript
// Undo/Redo state
const [history, setHistory] = useState<Array<Map<string, InjectionPoint>>>([])
const [historyIndex, setHistoryIndex] = useState(-1)
```

### Push to History
```typescript
const pushToHistory = useCallback((points: Map<string, InjectionPoint>) => {
  setHistory(prev => {
    // Remove any future states if we're not at the end
    const newHistory = prev.slice(0, historyIndex + 1)
    newHistory.push(new Map(points))
    // Keep only last 20 states
    if (newHistory.length > 20) newHistory.shift()
    return newHistory
  })
  setHistoryIndex(prev => Math.min(prev + 1, 19))
}, [historyIndex])
```

### Undo Handler
```typescript
const undo = useCallback(() => {
  if (historyIndex > 0) {
    setHistoryIndex(prev => prev - 1)
    onInjectionPointsChange(history[historyIndex - 1])
    toast.success('Undone', { duration: 1000, icon: '↩️' })
  }
}, [historyIndex, history, onInjectionPointsChange])
```

### Redo Handler
```typescript
const redo = useCallback(() => {
  if (historyIndex < history.length - 1) {
    setHistoryIndex(prev => prev + 1)
    onInjectionPointsChange(history[historyIndex + 1])
    toast.success('Redone', { duration: 1000, icon: '↪️' })
  }
}, [historyIndex, history, onInjectionPointsChange])
```

### Keyboard Shortcuts
```typescript
useEffect(() => {
  if (readOnly) return

  const handleKeyDown = (e: KeyboardEvent) => {
    // Global shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            redo()
          } else {
            undo()
          }
          break
        // ... other shortcuts
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [undo, redo, readOnly])
```

### Toolbar Buttons
```tsx
{/* Undo/Redo */}
<div className="flex items-center gap-1 border-r border-gray-200 pr-2">
  <button
    onClick={undo}
    disabled={historyIndex <= 0}
    className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    title="Undo (Ctrl+Z)"
  >
    <RotateCcw className="w-4 h-4" />
  </button>
  <button
    onClick={redo}
    disabled={historyIndex >= history.length - 1}
    className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    title="Redo (Ctrl+Shift+Z)"
  >
    <RotateCcw className="w-4 h-4 scale-x-[-1]" />
  </button>
</div>
```

### Integration Points
**Add `pushToHistory(newPoints)` before `onInjectionPointsChange(newPoints)` in:**

1. `handleZoneClick` - When adding new injection point
2. `updateInjectionPoint` - When editing existing point
3. `removeInjectionPoint` - When deleting point
4. `applyTemplate` - When applying template
5. `copyLastTreatment` - When copying previous treatment
6. `clearAll` - When clearing all points
7. `applyBatchUnits` - When batch editing units

### Keyboard Help Display
```tsx
{showKeyboardHelp && (
  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs">
    <div className="flex flex-wrap gap-4">
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">↑</kbd> +5 units</span>
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">↓</kbd> -5 units</span>
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Del</kbd> Remove</span>
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Esc</kbd> Deselect</span>
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">⌘Z</kbd> Undo</span>
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">⌘⇧Z</kbd> Redo</span>
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">⌘S</kbd> Save</span>
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">⌘D</kbd> Copy Last</span>
    </div>
  </div>
)}
```

---

## 5. HELPER FUNCTIONS

### Convert Map to Array for Storage
```typescript
const serializeInjectionPoints = (points: Map<string, InjectionPoint>) => {
  return Array.from(points.entries()).map(([zoneId, point]) => ({
    zoneId,
    ...point,
    timestamp: point.timestamp.toISOString()
  }))
}
```

### Restore Map from Array
```typescript
const deserializeInjectionPoints = (data: any[]) => {
  return new Map(
    data.map((item) => [
      item.zoneId,
      {
        ...item,
        timestamp: new Date(item.timestamp)
      }
    ])
  )
}
```

### Check if Template Applies to Current Product
```typescript
const activeTemplates = useMemo(() => {
  return templates.filter(t => t.productType === productType)
}, [templates, productType])
```

---

## IMPLEMENTATION FILES

### Modified Files:
1. **`/Users/daminirijhwani/medical-spa-platform/apps/admin/src/components/charting/InteractiveFaceChart.tsx`**
   - Added auto-save state (3 lines)
   - Added undo/redo state (2 lines)
   - Added auto-save handlers (~150 lines)
   - Added undo/redo handlers (~35 lines)
   - Updated `clearAll` to clear localStorage
   - Added `pushToHistory` calls to 7 functions
   - Added keyboard shortcuts for undo/redo
   - Added toolbar buttons for undo/redo
   - Added auto-save status indicator

2. **`/Users/daminirijhwani/medical-spa-platform/apps/admin/src/contexts/ChartingSettingsContext.tsx`**
   - Added 3 new template definitions (Baby Botox, Lip Flip, Crow's Feet Only)

### Total Changes:
- **Lines added**: ~200
- **Lines modified**: ~15
- **Functions updated**: 8

---

## TESTING CHECKLIST

### Templates
- [ ] Templates dropdown shows all templates for current product type
- [ ] Template cards scroll horizontally on mobile
- [ ] Clicking template applies all zones correctly
- [ ] Template shows total units for neurotoxin
- [ ] Custom templates appear in separate section
- [ ] "Save Current" button creates new custom template

### Auto-Save
- [ ] Adding injection points triggers "Saving..." indicator
- [ ] Status changes to "Saved ✓" after 1 second
- [ ] Refreshing page shows restore prompt if data < 1 hour old
- [ ] Restore prompt shows correct timestamp
- [ ] "Restore" button restores all points correctly
- [ ] "Discard" button clears localStorage
- [ ] Changing product type doesn't restore incompatible data
- [ ] "Clear All" button clears localStorage

### Undo/Redo
- [ ] Cmd+Z undoes last action
- [ ] Cmd+Shift+Z redoes undone action
- [ ] Undo button disabled when no history
- [ ] Redo button disabled when at end of history
- [ ] History limited to 20 states
- [ ] Making new change clears redo history
- [ ] Toast notifications show for undo/redo
- [ ] Keyboard help shows undo/redo shortcuts

---

## PERFORMANCE NOTES

- **Debouncing**: Auto-save uses 1-second debounce to prevent excessive writes
- **Memory**: Undo/redo limited to 20 states to prevent memory bloat
- **Storage**: localStorage has ~5-10MB limit (sufficient for charting data)
- **Serialization**: Maps converted to arrays for JSON compatibility

---

## FUTURE ENHANCEMENTS

1. **Patient-specific auto-save keys** (use patient ID)
2. **Multiple draft sessions per patient**
3. **Server-side sync via API**
4. **Version history with timestamps**
5. **Conflict resolution for concurrent edits**
6. **Export unsaved work as JSON**
7. **Auto-clear on official save to server**
8. **Template sharing between practitioners**
9. **Template analytics** (most used templates)
10. **Template tags/categories** for better organization
