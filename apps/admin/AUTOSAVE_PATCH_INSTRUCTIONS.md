# Auto-Save Implementation for InteractiveFaceChart

## Problem
The Next.js dev server is preventing direct edits to the file. You need to stop the dev server, apply these changes, then restart it.

## Instructions

### Step 1: Stop the Next.js dev server
```bash
# Press Ctrl+C in the terminal running the dev server
# Or run: pkill -f "next dev"
```

### Step 2: Apply the changes below to `src/components/charting/InteractiveFaceChart.tsx`

#### Change 1: Add auto-save state (around line 252, after `containerRef`)
```typescript
  const chartRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const autoSaveKey = 'charting-autosave-draft'
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get active items from settings
```

#### Change 2: Update clearAll function (around line 505-518)
Find this code:
```typescript
  // Clear all
  const clearAll = useCallback(() => {
    onInjectionPointsChange(new Map())
    setFreehandPoints(new Map())
    setSelectedZone(null)
    setSelectedFreehandPoint(null)
    setMultiSelectedZones(new Set())
    setMultiSelectedFreehand(new Set())
    setQuickEdit({ isOpen: false, zoneId: null, position: { x: 0, y: 0 } })
    toast.success('Cleared all', { duration: 1000 })
  }, [onInjectionPointsChange, setFreehandPoints, triggerHaptic])
```

Replace with:
```typescript
  // Clear all
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
  }, [onInjectionPointsChange, setFreehandPoints, triggerHaptic, autoSaveKey])
```

#### Change 3: Add AUTO-SAVE HANDLERS section (insert after clearAll function, before MULTI-SELECT section)

Insert this entire section between the `clearAll` function and the `// MULTI-SELECT MODE HANDLERS` comment:

```typescript
  // ==========================================================================
  // AUTO-SAVE HANDLERS
  // ==========================================================================

  // Debounced save to localStorage
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

  // Trigger save on changes
  useEffect(() => {
    if (!readOnly && (injectionPoints.size > 0 || freehandPoints.size > 0)) {
      saveToLocalStorage()
    }
  }, [injectionPoints, freehandPoints, readOnly, saveToLocalStorage])

  // Load saved data on mount
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])
```

#### Change 4: Add visual indicator in the toolbar (around line 995, after the "Templates" button)

Find this code in the toolbar section:
```typescript
            {/* Templates */}
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Templates
            </button>
```

Add this AFTER the Templates button:
```typescript
            {/* Auto-save indicator */}
            {autoSaveStatus === 'saved' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs">
                <Check className="w-3 h-3" />
                Saved
              </div>
            )}
            {autoSaveStatus === 'saving' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                <Clock className="w-3 h-3 animate-spin" />
                Saving...
              </div>
            )}
```

### Step 3: Restart the dev server
```bash
npm run dev
# or
yarn dev
```

## Features Implemented

1. **Auto-save after 1 second of inactivity** - Prevents data loss from browser crashes or accidental navigation
2. **Visual indicators** - Shows "Saving..." and "Saved" status in the toolbar
3. **Restore prompt on mount** - If unsaved work exists from the last hour, prompts user to restore or discard
4. **Context validation** - Only restores if product type and gender match current charting session
5. **Clear on explicit user action** - Auto-save is cleared when user clicks "Clear All"
6. **Both point types supported** - Saves and restores both zone-based and freehand injection points

## Testing

1. Start charting some injection points
2. Wait 1 second - you should see "Saving..." then "Saved"
3. Refresh the page
4. You should see a toast prompt asking to restore or discard
5. Click "Restore" to verify all points are restored correctly
6. Click "Clear All" to verify auto-save is cleared

## Troubleshooting

If you see TypeScript errors:
- Make sure all the icons (Check, Clock) are imported from 'lucide-react' (they already should be)
- Verify the state types match (autoSaveStatus should be 'saved' | 'saving' | 'idle')

If auto-save doesn't trigger:
- Check browser console for errors
- Verify localStorage is enabled in your browser
- Check that readOnly prop is false
