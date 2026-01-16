# Drag-to-Create Visual Flow Diagram

## User Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERACTION                             │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ Touch/Click on Face Chart
                               │ (Freehand Mode)
                               ▼
                    ┌─────────────────────┐
                    │   POINTER DOWN      │
                    │  handleFreehand     │
                    │   PointerDown()     │
                    └──────────┬──────────┘
                               │
                               │ Record: start position (x, y)
                               │         start time
                               │         isDragging = false
                               ▼
                    ┌─────────────────────┐
                    │   POINTER MOVE      │◄────┐
                    │  handleFreehand     │     │ User continues
                    │   PointerMove()     │     │ dragging
                    └──────────┬──────────┘     │
                               │                │
                               │ Calculate distance moved
                               │                │
                      ┌────────▼─────────┐      │
                      │ Distance > 10px? │──────┘ No (keep tracking)
                      └────────┬─────────┘
                               │ Yes
                               │ isDragging = true
                               │ Show preview circle
                               ▼
                    ┌─────────────────────┐
                    │   POINTER UP        │
                    │  handleFreehand     │
                    │   PointerUp()       │
                    └──────────┬──────────┘
                               │
                               │ Calculate:
                               │  - elapsed time
                               │  - total distance
                               ▼
              ┌────────────────────────────┐
              │ Time < 200ms AND           │
              │ Distance < 10px?           │
              └────────┬───────────┬───────┘
                       │           │
                  Yes  │           │  No
                 (TAP) │           │  (DRAG)
                       │           │
                       ▼           ▼
              ┌─────────────┐   ┌──────────────────┐
              │ Do Nothing  │   │ Create Freehand  │
              │             │   │ Point at (x, y)  │
              │ (Allows     │   │                  │
              │  selecting  │   │ - Generate ID    │
              │  existing   │   │ - Set position   │
              │  zones)     │   │ - Default values │
              └─────────────┘   └────────┬─────────┘
                                         │
                                         │ Haptic feedback
                                         │ Select point
                                         │ Calculate popup position
                                         ▼
                              ┌────────────────────┐
                              │  SHOW NOTE POPUP   │
                              │                    │
                              │ - Auto-focus input │
                              │ - Preset buttons   │
                              │ - Note text field  │
                              └────────┬───────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
           ┌────────────────┐  ┌─────────────┐  ┌──────────────┐
           │ Click Preset   │  │ Type Note   │  │ Press Enter  │
           │ Unit Button    │  │ in Input    │  │ or Click X   │
           │                │  │             │  │              │
           │ Update point   │  │ Update temp │  │ Save & Close │
           │ dosage         │  │ value       │  │              │
           └────────┬───────┘  └──────┬──────┘  └──────┬───────┘
                    │                 │                 │
                    └─────────────────┴─────────────────┘
                                      │
                                      ▼
                           ┌────────────────────┐
                           │   POINT SAVED      │
                           │                    │
                           │ - With dosage      │
                           │ - With note (opt)  │
                           │ - Ready to use     │
                           └────────────────────┘
```

---

## Gesture Detection Algorithm

```
┌──────────────────────────────────────────────────────────────┐
│                    GESTURE DETECTION                          │
└──────────────────────────────────────────────────────────────┘

Start Position: (x₀, y₀) at time t₀

Current Position: (x₁, y₁) at time t₁

Distance = √[(x₁ - x₀)² + (y₁ - y₀)²]

Elapsed = t₁ - t₀


IF (Elapsed < 200ms) AND (Distance < 10px):
    ┌─────┐
    │ TAP │ → No point created
    └─────┘

ELSE:
    ┌──────┐
    │ DRAG │ → Create point at (x₁, y₁)
    └──────┘


┌────────────────────────────────────────┐
│  Threshold Values (Can be tuned)       │
├────────────────────────────────────────┤
│  TAP_TIME_THRESHOLD    = 200ms         │
│  TAP_MOVE_THRESHOLD    = 10px          │
└────────────────────────────────────────┘
```

---

## State Transitions

```
IDLE STATE
   │
   │ User touches face chart (freehand mode)
   ▼
TRACKING STATE
   │
   │ dragStartPos = (x, y)
   │ dragStartTime = now
   │ isDragging = false
   │
   │ ┌─────────────────────────────┐
   │ │  User moves pointer         │
   │ └─────────────────────────────┘
   │
   │ Movement > 10px?
   ▼
DRAGGING STATE
   │
   │ isDragging = true
   │ Show preview circle
   │ Update cursor to "grabbing"
   │
   │ ┌─────────────────────────────┐
   │ │  User releases pointer      │
   │ └─────────────────────────────┘
   │
   │ Was it a tap or drag?
   │
   ├─── TAP ─────► Back to IDLE (no action)
   │
   └─── DRAG ───► POPUP STATE
                     │
                     │ Show note popup
                     │ Auto-focus input
                     │ Wait for user interaction
                     │
                     │ User saves or cancels
                     ▼
                  IDLE STATE
```

---

## Component Hierarchy

```
<InteractiveFaceChart>
  │
  ├─ State Variables
  │   ├─ isDragging
  │   ├─ dragStartPos
  │   ├─ dragStartTime
  │   ├─ showNotePopup
  │   ├─ notePopupPos
  │   ├─ notePopupPointId
  │   └─ tempNoteValue
  │
  ├─ Event Handlers
  │   ├─ handleFreehandPointerDown  (mouse/touch start)
  │   ├─ handleFreehandPointerMove  (mouse/touch move)
  │   ├─ handleFreehandPointerUp    (mouse/touch end)
  │   ├─ handleSaveNote             (save popup data)
  │   └─ handleUnitPreset           (click preset button)
  │
  └─ UI Components
      │
      ├─ <div imageContainerRef>  ◄── Attach event handlers here
      │   │
      │   ├─ onMouseDown/Move/Up
      │   └─ onTouchStart/Move/End
      │
      ├─ Drag Visual Indicator (when isDragging)
      │   └─ Dashed circle at dragStartPos
      │
      ├─ Freehand Points Overlay
      │   └─ Render all created points
      │
      └─ Note Popup (when showNotePopup)
          │
          ├─ Header with PenTool icon
          ├─ Unit Preset Buttons (4 buttons)
          ├─ Note Input (auto-focused)
          ├─ Done Button
          └─ Keyboard hints
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
└─────────────────────────────────────────────────────────────────┘

User Drags
    │
    ▼
handleFreehandPointerUp()
    │
    │ Creates FreehandPoint object:
    │
    │   {
    │     id: "fp-1234567890-abc123",
    │     x: 45.2,        // % from left
    │     y: 32.8,        // % from top
    │     customName: "Point 3",
    │     units: 0,       // or undefined
    │     volume: 0,      // or undefined
    │     depthId: "depth-subdermal",
    │     techniqueId: "technique-linear",
    │     needleGaugeId: "gauge-30",
    │     productId: "prod-123",
    │     notes: undefined,
    │     timestamp: Date
    │   }
    │
    ▼
Add to freehandPoints Map
    │
    ▼
Trigger State Updates:
    │
    ├─ setFreehandPoints(newPoints)
    ├─ setSelectedFreehandPoint(pointId)
    ├─ setShowNotePopup(true)
    ├─ setNotePopupPointId(pointId)
    └─ setNotePopupPos({ x, y })
        │
        ▼
    React Re-renders:
        │
        ├─ Point appears on face chart
        ├─ Note popup appears at point
        └─ Input auto-focuses
            │
            ▼
        User Interacts:
            │
            ├─ Clicks preset → handleUnitPreset()
            │                      │
            │                      └─ Updates point.units/volume
            │
            └─ Types note → Updates tempNoteValue
                           │
                           ▼
                       Press Enter / Click Done
                           │
                           ▼
                       handleSaveNote()
                           │
                           └─ Updates point.notes
                              Closes popup
                              Point is finalized
```

---

## Visual States

```
┌─────────────────────────────────────────────────────────────────┐
│                      VISUAL STATES                               │
└─────────────────────────────────────────────────────────────────┘

STATE 1: IDLE (Freehand Mode)
┌──────────────────────────────┐
│  Face Chart                  │
│                              │
│  Cursor: ┼ (crosshair)      │
│                              │
│  Hint: "Drag to create..."   │
└──────────────────────────────┘


STATE 2: DRAGGING
┌──────────────────────────────┐
│  Face Chart                  │
│                              │
│  Cursor: ✊ (grabbing)       │
│                              │
│     ⭕ ← Preview circle      │
│    (dashed, pulsing)         │
└──────────────────────────────┘


STATE 3: POINT CREATED + POPUP
┌──────────────────────────────┐
│  Face Chart                  │
│                              │
│  ┌──────────────────┐        │
│  │ 📝 Custom Point  │        │
│  │                  │        │
│  │ Units: [5][10]   │        │
│  │        [15][20]  │        │
│  │                  │        │
│  │ Note: [______]   │        │
│  │                  │        │
│  │    [✓ Done]      │        │
│  └────────┬─────────┘        │
│           │                  │
│           📍 ← New Point     │
│         (MapPin icon)        │
└──────────────────────────────┘


STATE 4: FINALIZED
┌──────────────────────────────┐
│  Face Chart                  │
│                              │
│           📍                 │
│          10u ← Dosage badge  │
│      (purple/pink)           │
│                              │
│  Click point to edit         │
└──────────────────────────────┘
```

---

## Touch vs Mouse Handling

```
┌────────────────────────────────────────────────────────────┐
│              UNIFIED TOUCH/MOUSE HANDLING                   │
└────────────────────────────────────────────────────────────┘

Event Type Normalization:

handleFreehandPointerDown(event):
    IF event has 'touches':
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
    ELSE:
        clientX = event.clientX
        clientY = event.clientY

handleFreehandPointerMove(event):
    IF event has 'touches':
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
    ELSE:
        clientX = event.clientX
        clientY = event.clientY

handleFreehandPointerUp(event):
    IF event has 'changedTouches':
        clientX = event.changedTouches[0].clientX
        clientY = event.changedTouches[0].clientY
    ELSE:
        clientX = event.clientX
        clientY = event.clientY


Benefits:
✓ Same logic for mouse and touch
✓ No code duplication
✓ Consistent behavior across devices
✓ Works with stylus (treated as touch)
```

---

## Error Handling

```
┌────────────────────────────────────────────────────────────┐
│                   ERROR PREVENTION                          │
└────────────────────────────────────────────────────────────┘

1. Bounds Checking:
   IF x < 0 OR x > 100 OR y < 0 OR y > 100:
       ↳ Don't create point (out of bounds)

2. Container Reference:
   IF !imageContainerRef.current:
       ↳ Early return (container not mounted)

3. Mode Checking:
   IF readOnly OR drawingMode !== 'freehand':
       ↳ Don't handle drag events

4. State Validation:
   IF !dragStartPos:
       ↳ Ignore move/up events (invalid state)

5. Point Validation:
   IF !notePopupPointId:
       ↳ Don't save note (no active point)

6. Null Safety:
   All callbacks check for null/undefined:
       const point = freehandPoints.get(pointId)
       if (!point) return
```

---

## Performance Considerations

```
┌────────────────────────────────────────────────────────────┐
│                  PERFORMANCE OPTIMIZATIONS                  │
└────────────────────────────────────────────────────────────┘

1. useCallback for all handlers
   ↳ Prevents unnecessary re-renders
   ↳ Stable function references

2. Minimal state updates during drag
   ↳ Only update isDragging when threshold crossed
   ↳ Don't update position on every move

3. Debounced calculations
   ↳ Distance calculation only on move (not continuous)

4. Conditional rendering
   ↳ Popup only renders when showNotePopup = true
   ↳ Preview circle only when isDragging = true

5. Event handler attachment
   ↳ Only attach when in freehand mode
   ↳ Use conditional event prop:
       onMouseDown={drawingMode === 'freehand' ? handler : undefined}
```

---

This implementation provides a robust, performant, and user-friendly
drag-to-create experience for custom injection points!
