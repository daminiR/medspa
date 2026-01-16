# Multi-Select Visual Feedback Implementation

## File: src/components/charting/InteractiveFaceChart.tsx

### Change 1: Add isMultiSelected variable (around line 1163)

**Find this code:**
```typescript
                const point = injectionPoints.get(zone.id)
                const isSelected = selectedZone === zone.id
                const isHovered = hoveredZone === zone.id
                const hasInjection = point && (point.units || point.volume)

                return (
```

**Replace with:**
```typescript
                const point = injectionPoints.get(zone.id)
                const isSelected = selectedZone === zone.id
                const isHovered = hoveredZone === zone.id
                const hasInjection = point && (point.units || point.volume)
                const isMultiSelected = multiSelectedZones.has(zone.id)

                return (
```

---

### Change 2: Update onClick handler to support multi-select mode (around line 1173)

**Find this code:**
```typescript
                    onClick={(e) => {
                      if (drawingMode === 'zones') {
                        e.stopPropagation()
                        handleZoneClick(zone, e)
                      }
                    }}
```

**Replace with:**
```typescript
                    onClick={(e) => {
                      if (drawingMode === 'zones') {
                        e.stopPropagation()
                        if (selectionMode === 'multi') {
                          handleMultiSelectZone(zone.id)
                        } else {
                          handleZoneClick(zone, e)
                        }
                      }
                    }}
```

---

### Change 3: Update Visual Point className to show multi-select styling (around line 1186-1204)

**Find this code:**
```typescript
                    {/* Visual Point */}
                    <div
                      className={`
                        relative w-5 h-5 rounded-full transition-all duration-200
                        ${hasInjection
                          ? isSelected
                            ? productType === 'neurotoxin'
                              ? 'bg-purple-700 ring-4 ring-purple-300 scale-150'
                              : 'bg-pink-700 ring-4 ring-pink-300 scale-150'
                            : productType === 'neurotoxin'
                              ? 'bg-purple-600 shadow-lg shadow-purple-400/50 scale-125'
                              : 'bg-pink-600 shadow-lg shadow-pink-400/50 scale-125'
                          : isSelected
                            ? 'bg-gray-500 ring-2 ring-gray-300 scale-125'
                            : isHovered
                              ? 'bg-gray-400 scale-110'
                              : drawingMode === 'freehand'
                                ? 'bg-gray-200/60'
                                : 'bg-gray-300/80 hover:bg-gray-400'
                        }
                      `}
                    >
```

**Replace with:**
```typescript
                    {/* Visual Point */}
                    <div
                      className={`
                        relative w-5 h-5 rounded-full transition-all duration-200
                        ${isMultiSelected
                          ? productType === 'neurotoxin'
                            ? 'bg-purple-500 ring-2 ring-purple-400 ring-offset-2 ring-offset-white scale-125 shadow-lg shadow-purple-400/60'
                            : 'bg-pink-500 ring-2 ring-pink-400 ring-offset-2 ring-offset-white scale-125 shadow-lg shadow-pink-400/60'
                          : hasInjection
                            ? isSelected
                              ? productType === 'neurotoxin'
                                ? 'bg-purple-700 ring-4 ring-purple-300 scale-150'
                                : 'bg-pink-700 ring-4 ring-pink-300 scale-150'
                              : productType === 'neurotoxin'
                                ? 'bg-purple-600 shadow-lg shadow-purple-400/50 scale-125'
                                : 'bg-pink-600 shadow-lg shadow-pink-400/50 scale-125'
                            : isSelected
                              ? 'bg-gray-500 ring-2 ring-gray-300 scale-125'
                              : isHovered
                                ? 'bg-gray-400 scale-110'
                                : drawingMode === 'freehand'
                                  ? 'bg-gray-200/60'
                                  : 'bg-gray-300/80 hover:bg-gray-400'
                        }
                      `}
                    >
```

---

### Change 4: Add pulse animation for multi-selected zones (around line 1207-1217)

**Find this code:**
```typescript
                      {/* Animated rings for selected injection */}
                      {hasInjection && (
                        <>
                          <div className={`absolute inset-0 rounded-full animate-ping ${
                            productType === 'neurotoxin' ? 'bg-purple-400' : 'bg-pink-400'
                          } opacity-30`} />
                          <div className={`absolute inset-0 rounded-full animate-pulse ${
                            productType === 'neurotoxin' ? 'bg-purple-500' : 'bg-pink-500'
                          } opacity-40`} />
                        </>
                      )}
```

**Replace with:**
```typescript
                      {/* Animated rings for multi-selected zones */}
                      {isMultiSelected && (
                        <>
                          <div className={`absolute inset-0 rounded-full animate-ping ${
                            productType === 'neurotoxin' ? 'bg-purple-400' : 'bg-pink-400'
                          } opacity-40`} />
                        </>
                      )}

                      {/* Animated rings for selected injection */}
                      {hasInjection && !isMultiSelected && (
                        <>
                          <div className={`absolute inset-0 rounded-full animate-ping ${
                            productType === 'neurotoxin' ? 'bg-purple-400' : 'bg-pink-400'
                          } opacity-30`} />
                          <div className={`absolute inset-0 rounded-full animate-pulse ${
                            productType === 'neurotoxin' ? 'bg-purple-500' : 'bg-pink-500'
                          } opacity-40`} />
                        </>
                      )}
```

---

### Change 5: Add checkmark badge for multi-selected zones (around line 1217-1230, add after the closing </div> of the Visual Point)

**Find this code:**
```typescript
                    </div>

                    {/* Units Badge */}
                    {hasInjection && (
```

**Replace with:**
```typescript
                    </div>

                    {/* Multi-select checkmark badge */}
                    {isMultiSelected && (
                      <div className={`
                        absolute -top-2 -right-2 w-5 h-5 rounded-full
                        ${productType === 'neurotoxin'
                          ? 'bg-purple-600'
                          : 'bg-pink-600'
                        }
                        flex items-center justify-center shadow-lg z-20
                      `}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Units Badge */}
                    {hasInjection && !isMultiSelected && (
```

---

## Summary of Changes

1. **Added `isMultiSelected` constant** - Checks if the zone is in the `multiSelectedZones` Set
2. **Updated onClick handler** - Routes to `handleMultiSelectZone()` when in multi-select mode
3. **Updated visual styling** - Shows purple/pink with ring offset animation for multi-selected zones
4. **Added pulse animation** - Distinct pulsing animation for multi-selected zones
5. **Added checkmark badge** - Small checkmark icon in top-right corner of multi-selected zones
6. **Updated Units Badge** - Only shows when NOT multi-selected to avoid visual clutter

## Testing

After making these changes:
1. Enable multi-select mode (there should be a toggle somewhere in the UI)
2. Click on multiple zones on the face chart
3. You should see:
   - Zones with a purple/pink color and ring offset
   - Pulsing animation
   - Small checkmark badge in the corner
   - Clear visual distinction from single-select mode

