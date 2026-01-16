# Drag-to-Create Implementation - Code Snippets

All code snippets ready to copy-paste into InteractiveFaceChart.tsx

---

## SNIPPET 1: State Variables
**Location:** After line 325 (after `hoveredFreehandPoint` state)

```typescript
  // Drag-to-create state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
  const [dragStartTime, setDragStartTime] = useState<number>(0)
  const [showNotePopup, setShowNotePopup] = useState(false)
  const [notePopupPos, setNotePopupPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [notePopupPointId, setNotePopupPointId] = useState<string | null>(null)
  const [tempNoteValue, setTempNoteValue] = useState('')
  const noteInputRef = useRef<HTMLInputElement | null>(null)
```

---

## SNIPPET 2: Constants
**Location:** After ZONE_POSITIONS (around line 240)

```typescript
// Drag-to-create thresholds
const TAP_TIME_THRESHOLD = 200 // milliseconds
const TAP_MOVE_THRESHOLD = 10 // pixels
```

---

## SNIPPET 3: Pointer Event Handlers
**Location:** Replace the entire `handleFreehandClick` function (around line 1412)

```typescript
  // ==========================================================================
  // DRAG-TO-CREATE HANDLERS
  // ==========================================================================

  // Handle mouse/touch down on the face image for freehand mode
  const handleFreehandPointerDown = useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (readOnly || drawingMode !== 'freehand') return

    const container = imageContainerRef.current
    if (!container) return

    // Get position from mouse or touch
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

    // Record start position and time
    setDragStartPos({ x: clientX, y: clientY })
    setDragStartTime(Date.now())
    setIsDragging(false)
  }, [readOnly, drawingMode])

  // Handle mouse/touch move
  const handleFreehandPointerMove = useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (readOnly || drawingMode !== 'freehand' || !dragStartPos) return

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

    // Calculate distance moved
    const deltaX = Math.abs(clientX - dragStartPos.x)
    const deltaY = Math.abs(clientY - dragStartPos.y)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // If moved more than threshold, consider it a drag
    if (distance > TAP_MOVE_THRESHOLD) {
      setIsDragging(true)
    }
  }, [readOnly, drawingMode, dragStartPos])

  // Handle mouse/touch up - create point or do nothing based on drag detection
  const handleFreehandPointerUp = useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (readOnly || drawingMode !== 'freehand' || !dragStartPos) return

    const container = imageContainerRef.current
    if (!container) return

    const clientX = 'changedTouches' in event ? event.changedTouches[0].clientX : event.clientX
    const clientY = 'changedTouches' in event ? event.changedTouches[0].clientY : event.clientY

    const elapsed = Date.now() - dragStartTime
    const deltaX = Math.abs(clientX - dragStartPos.x)
    const deltaY = Math.abs(clientY - dragStartPos.y)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Determine if this was a tap or drag
    const isTap = elapsed < TAP_TIME_THRESHOLD && distance < TAP_MOVE_THRESHOLD

    // Reset drag state
    setDragStartPos(null)
    setDragStartTime(0)
    setIsDragging(false)

    // Only create point on drag (not tap)
    if (!isTap) {
      // Get final position relative to the container
      const rect = container.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width) * 100
      const y = ((clientY - rect.top) / rect.height) * 100

      // Ensure position is within bounds
      if (x < 0 || x > 100 || y < 0 || y > 100) return

      // Get default values
      const defaultDepth = activeDepths[0]?.id || ''
      const defaultTechnique = activeTechniques[0]?.id || ''
      const defaultGauge = activeGauges[0]?.id || ''

      // Create new freehand point
      const pointId = `fp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newPoint: FreehandPoint = {
        id: pointId,
        x,
        y,
        customName: `Point ${freehandPoints.size + 1}`,
        units: productType === 'neurotoxin' ? 0 : undefined,
        volume: productType === 'filler' ? 0 : undefined,
        depthId: defaultDepth,
        techniqueId: defaultTechnique,
        needleGaugeId: defaultGauge,
        productId: selectedProductId || activeProducts[0]?.id,
        timestamp: new Date()
      }

      const newPoints = new Map(freehandPoints)
      newPoints.set(pointId, newPoint)
      setFreehandPoints(newPoints)
      setSelectedFreehandPoint(pointId)

      // Haptic feedback for drag creation
      triggerHaptic('medium')

      // Show note popup at the point location
      setNotePopupPointId(pointId)
      setNotePopupPos({
        x: clientX - rect.left,
        y: clientY - rect.top
      })
      setTempNoteValue('')
      setShowNotePopup(true)

      toast.success('Custom point created', { duration: 1500, icon: '✓' })
    }
  }, [readOnly, drawingMode, dragStartPos, dragStartTime, freehandPoints, setFreehandPoints, productType, selectedProductId, activeProducts, activeDepths, activeTechniques, activeGauges, triggerHaptic])

  // Handle note popup save
  const handleSaveNote = useCallback(() => {
    if (!notePopupPointId) return

    const point = freehandPoints.get(notePopupPointId)
    if (!point) return

    // Update the point with the note
    const updatedPoint: FreehandPoint = {
      ...point,
      notes: tempNoteValue || undefined
    }

    const newPoints = new Map(freehandPoints)
    newPoints.set(notePopupPointId, updatedPoint)
    setFreehandPoints(newPoints)

    // Close popup
    setShowNotePopup(false)
    setNotePopupPointId(null)
    setTempNoteValue('')

    if (tempNoteValue) {
      toast.success('Note saved', { duration: 1000 })
    }
  }, [notePopupPointId, freehandPoints, tempNoteValue, setFreehandPoints])

  // Handle note popup unit preset buttons
  const handleUnitPreset = useCallback((value: number) => {
    if (!notePopupPointId) return

    const point = freehandPoints.get(notePopupPointId)
    if (!point) return

    // Update the point with the preset value
    const updatedPoint: FreehandPoint = {
      ...point,
      units: productType === 'neurotoxin' ? value : undefined,
      volume: productType === 'filler' ? value : undefined
    }

    const newPoints = new Map(freehandPoints)
    newPoints.set(notePopupPointId, updatedPoint)
    setFreehandPoints(newPoints)

    triggerHaptic('light')
  }, [notePopupPointId, freehandPoints, productType, setFreehandPoints, triggerHaptic])

  // Auto-focus input when popup opens
  useEffect(() => {
    if (showNotePopup && noteInputRef.current) {
      setTimeout(() => {
        noteInputRef.current?.focus()
      }, 100)
    }
  }, [showNotePopup])
```

---

## SNIPPET 4: Update Face Image Container
**Location:** Around line 2137-2151

**FIND:**
```typescript
          <div
            ref={imageContainerRef}
            className={`relative w-full max-w-lg mx-auto transition-all duration-300 ${
              drawingMode === 'freehand' ? 'cursor-crosshair' : ''
            } ${
              selectionMode === 'multi'
                ? `ring-4 ${productType === 'neurotoxin' ? 'ring-purple-400 animate-glow-pulse' : 'ring-pink-400 animate-glow-pulse-pink'} ring-opacity-50 rounded-lg`
                : ''
            }`}
            style={{
              aspectRatio: gender === 'female' ? '546/888' : '585/847',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center'
            }}
            onClick={drawingMode === 'freehand' ? handleFreehandClick : undefined}
          >
```

**REPLACE WITH:**
```typescript
          <div
            ref={imageContainerRef}
            className={`relative w-full max-w-lg mx-auto transition-all duration-300 ${
              drawingMode === 'freehand'
                ? isDragging
                  ? 'cursor-grabbing'
                  : 'cursor-crosshair'
                : ''
            } ${
              selectionMode === 'multi'
                ? `ring-4 ${productType === 'neurotoxin' ? 'ring-purple-400 animate-glow-pulse' : 'ring-pink-400 animate-glow-pulse-pink'} ring-opacity-50 rounded-lg`
                : ''
            }`}
            style={{
              aspectRatio: gender === 'female' ? '546/888' : '585/847',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center'
            }}
            onMouseDown={drawingMode === 'freehand' ? handleFreehandPointerDown : undefined}
            onMouseMove={drawingMode === 'freehand' ? handleFreehandPointerMove : undefined}
            onMouseUp={drawingMode === 'freehand' ? handleFreehandPointerUp : undefined}
            onTouchStart={drawingMode === 'freehand' ? handleFreehandPointerDown : undefined}
            onTouchMove={drawingMode === 'freehand' ? handleFreehandPointerMove : undefined}
            onTouchEnd={drawingMode === 'freehand' ? handleFreehandPointerUp : undefined}
          >
```

---

## SNIPPET 5: Drag Visual Indicator
**Location:** After Ghost Overlay section (around line 2178)

```typescript
            {/* Drag Creation Visual Indicator */}
            {drawingMode === 'freehand' && isDragging && dragStartPos && (
              <div
                className="absolute pointer-events-none z-40"
                style={{
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%'
                }}
              >
                <div
                  className={`
                    absolute rounded-full border-2 border-dashed animate-pulse
                    ${productType === 'neurotoxin' ? 'border-purple-500 bg-purple-200' : 'border-pink-500 bg-pink-200'}
                    opacity-50
                  `}
                  style={{
                    left: `${((dragStartPos.x - (imageContainerRef.current?.getBoundingClientRect().left || 0)) / (imageContainerRef.current?.getBoundingClientRect().width || 1)) * 100}%`,
                    top: `${((dragStartPos.y - (imageContainerRef.current?.getBoundingClientRect().top || 0)) / (imageContainerRef.current?.getBoundingClientRect().height || 1)) * 100}%`,
                    width: '20px',
                    height: '20px',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>
            )}
```

---

## SNIPPET 6: Note Popup UI
**Location:** After freehand points overlay (around line 2378, before "Hover Info Panel")

```typescript
            {/* Note Popup for Custom Points */}
            {showNotePopup && notePopupPointId && (
              <div
                className="absolute z-50 bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-4 min-w-[280px]"
                style={{
                  left: `${notePopupPos.x}px`,
                  top: `${notePopupPos.y}px`,
                  transform: 'translate(-50%, -120%)'
                }}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PenTool className={`w-4 h-4 ${productType === 'neurotoxin' ? 'text-purple-600' : 'text-pink-600'}`} />
                      <h4 className="font-semibold text-sm text-gray-900">Custom Point</h4>
                    </div>
                    <button
                      onClick={() => {
                        setShowNotePopup(false)
                        setNotePopupPointId(null)
                        setTempNoteValue('')
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Unit Preset Buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {productType === 'neurotoxin' ? 'Units' : 'Volume (ml)'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(productType === 'neurotoxin'
                        ? [5, 10, 15, 20]
                        : [0.25, 0.5, 0.75, 1.0]
                      ).map(value => {
                        const currentPoint = freehandPoints.get(notePopupPointId)
                        const currentValue = productType === 'neurotoxin'
                          ? currentPoint?.units
                          : currentPoint?.volume
                        const isSelected = currentValue === value

                        return (
                          <button
                            key={value}
                            onClick={() => handleUnitPreset(value)}
                            className={`
                              px-2 py-1.5 rounded-md text-sm font-medium transition-all
                              ${isSelected
                                ? productType === 'neurotoxin'
                                  ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                                  : 'bg-pink-600 text-white ring-2 ring-pink-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }
                            `}
                          >
                            {value}{productType === 'neurotoxin' ? 'u' : ''}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Note Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      Note (Optional)
                    </label>
                    <input
                      ref={noteInputRef}
                      type="text"
                      value={tempNoteValue}
                      onChange={(e) => setTempNoteValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveNote()
                        } else if (e.key === 'Escape') {
                          setShowNotePopup(false)
                          setNotePopupPointId(null)
                          setTempNoteValue('')
                        }
                      }}
                      placeholder="Add note or dosage..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveNote}
                      className={`
                        flex-1 px-4 py-2 rounded-md text-sm font-medium text-white
                        transition-colors flex items-center justify-center gap-2
                        ${productType === 'neurotoxin'
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-pink-600 hover:bg-pink-700'
                        }
                      `}
                    >
                      <Check className="w-4 h-4" />
                      Done
                    </button>
                  </div>

                  {/* Hint Text */}
                  <p className="text-xs text-gray-500 text-center">
                    Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">Enter</kbd> to save or <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">Esc</kbd> to cancel
                  </p>
                </div>

                {/* Pointer Arrow */}
                <div
                  className={`
                    absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full
                    w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent
                    ${productType === 'neurotoxin' ? 'border-t-gray-200' : 'border-t-gray-200'}
                  `}
                />
              </div>
            )}
```

---

## Quick Implementation Steps

1. **Stop Next.js dev server** (if running)
2. **Add Snippet 1** - State variables after line 325
3. **Add Snippet 2** - Constants after line 240
4. **Add Snippet 3** - Replace `handleFreehandClick` function (around line 1412)
5. **Apply Snippet 4** - Update face image container (around line 2137)
6. **Add Snippet 5** - Drag visual indicator (around line 2178)
7. **Add Snippet 6** - Note popup UI (around line 2378)
8. **Restart Next.js dev server**
9. **Test** in browser

---

## Verification

After implementation, check:
- [ ] No TypeScript errors
- [ ] File compiles successfully
- [ ] Dev server starts without errors
- [ ] Feature works in browser
