# Canvas Library Comparison for Medical Spa Charting

## Overview

This document compares canvas/drawing libraries for the charting feature, specifically evaluating support for:
- Stylus (Apple Pencil) drawing
- Touch gestures (pinch-zoom, pan) while drawing
- Various tool types needed for medical charting

---

## Migration Completed: react-sketch-canvas to Konva

**Status:** COMPLETE (January 2025)

The `SmoothBrushTool` component has been fully migrated from `react-sketch-canvas` to `Konva` / `react-konva`. This resolves the critical zoom/pan passthrough issue.

### What Was Changed

| Aspect | Before (react-sketch-canvas) | After (Konva) |
|--------|------------------------------|---------------|
| **Library** | `react-sketch-canvas` | `konva` + `react-konva` |
| **Drawing Surface** | `<ReactSketchCanvas>` | `<Stage>` + `<Layer>` + `<Line>` |
| **Stroke Storage** | Library-managed paths | Custom `KonvaStroke[]` state |
| **Pointer Events** | `allowOnlyPointerType="pen"` | Manual `evt.pointerType === 'pen'` check |
| **Multi-touch Detection** | N/A (broken) | Native touch event listeners |
| **Export Format** | `CanvasPath[]` (native) | Compatible `CanvasPath[]` (converted) |

### Key Files Modified

- `/src/components/charting/SmoothBrushTool.tsx` - Complete rewrite using Konva

### New Dependencies

```bash
npm install konva react-konva
```

---

## How Stylus Detection Works Now

The migration uses the **PointerEvent API** for clean stylus vs. touch discrimination:

```typescript
const handlePointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
  const evt = e.evt;

  // Only allow drawing with pen (stylus)
  if (evt.pointerType !== 'pen') {
    return; // Ignore touch and mouse
  }

  // Start drawing...
};
```

### PointerEvent.pointerType Values

| Value | Device | Behavior |
|-------|--------|----------|
| `"pen"` | Apple Pencil / stylus | DRAWS on canvas |
| `"touch"` | Finger touch | IGNORED - allows zoom/pan |
| `"mouse"` | Mouse pointer | IGNORED for consistency |

### Pressure Support

Apple Pencil pressure is captured via `evt.pressure` (range 0-1):

```typescript
const pressure = evt.pressure || 0.5;
// Stored in originalPoints for potential pressure-sensitive rendering
```

---

## How Zoom/Pan Passthrough Works

The critical fix for two-finger zoom/pan involves two mechanisms:

### 1. Multi-Touch Detection (Native Events)

Native touch event listeners detect when multiple fingers touch the screen:

```typescript
useEffect(() => {
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length >= 2) {
      // Multi-touch detected - disable drawing
      setIsMultiTouchActive(true);
      isDrawingRef.current = false;
      setCurrentStroke(null);
    }
  };

  // Listeners attached with { passive: true } to allow gesture propagation
  container.addEventListener('touchstart', handleTouchStart, { passive: true });
}, []);
```

### 2. Pointer Events Passthrough

When multi-touch is active, the component disables its pointer events:

```typescript
<div
  style={{
    // CRITICAL: Only capture events when NOT in multi-touch mode
    pointerEvents: isMultiTouchActive ? 'none' : 'auto',
    touchAction: 'manipulation',
  }}
>
```

### Event Flow During Zoom/Pan

```
User performs two-finger pinch
    |
    v
touchstart fires (passive listener)
    |
    v
touchCountRef.current >= 2
    |
    v
setIsMultiTouchActive(true)
    |
    v
pointerEvents: 'none' applied to brush container
    |
    v
Touch events pass through to parent FaceChartWithZoom
    |
    v
Parent handles zoom/pan transformation
```

### Debounced Reset

After multi-touch ends, there's a 150ms delay before re-enabling drawing:

```typescript
const handleTouchEnd = (e: TouchEvent) => {
  if (e.touches.length <= 1) {
    setTimeout(() => {
      setIsMultiTouchActive(false);
    }, 150);
  }
};
```

This prevents accidental strokes immediately after a zoom gesture.

---

## Known Limitations

### 1. No Pressure-Variable Stroke Width

Currently, pressure is captured but not used for variable stroke width. All strokes use a uniform width based on the selected brush size. Pressure data is stored in `originalPoints` for potential future use.

### 2. Stroke Rendering Differences

Konva's `<Line>` component with `tension={0.5}` produces slightly different smoothing than react-sketch-canvas. The visual difference is minimal but noticeable on very fast strokes.

### 3. No Native SVG Export

Konva is canvas-based, not SVG-based. Export methods return:
- `exportImage()` - PNG/JPEG data URL from canvas
- `exportPaths()` - `CanvasPath[]` array (coordinates, not SVG)

If SVG output is required, paths would need to be converted to SVG path data manually.

### 4. Initial Touch Ignored on Tool Activation

When switching to the brush tool, the first touch may be briefly ignored while the multi-touch state resets. This is by design to prevent unintended marks.

### 5. Mouse Input Disabled

For consistency with the stylus-only medical charting workflow, mouse input is disabled. This may need to be configurable for desktop testing.

---

## Original Problem

The original implementation used `react-sketch-canvas` for the Brush tool. This library has a **known bug** (GitHub issue #128) where touch events cannot pass through to the parent for zoom/pan when `allowOnlyPointerType="pen"` is set. This meant:
- Stylus can draw (checkmark)
- Two-finger zoom does NOT work while brush is active (X)

This was a critical usability issue for medical practitioners using iPads with Apple Pencil.

---

## Feature Support by Library

| Feature | react-sketch-canvas | Konva | js-draw | tldraw | Fabric.js |
|---------|:------------------:|:-----:|:-------:|:------:|:---------:|
| **License** | MIT | MIT | MIT | Custom (watermark) | MIT |
| **Cost** | FREE | FREE | FREE | Free w/ watermark, paid to remove | FREE |
| **React Support** | Native | react-konva (native) | Wrapper needed | Native | Wrapper needed |
| **Stylus vs Touch Detection** | Yes | Yes | Yes (best) | Yes | Manual |
| **Pinch-Zoom While Drawing** | NO (bug) | YES | YES | YES | Manual |
| **Touch Pan** | NO | YES | YES | YES | Manual |
| **SVG Output** | Yes | Yes | Yes | Yes | Yes |
| **PNG/JPEG Export** | Yes | Yes | Yes | Yes | Yes |

---

## Tool Support by Library

These are the charting tools in the admin app and how well each library supports them:

| Tool | Description | react-sketch-canvas | Konva | js-draw | tldraw |
|------|-------------|:-------------------:|:-----:|:-------:|:------:|
| **Select** | Select & move elements | NO | YES (built-in) | YES | YES |
| **Zone** | Tap predefined face zones | Custom code | Custom code | Custom code | Custom code |
| **Draw** | Place injection points | NO | YES (Circle/dot) | Custom | YES |
| **Brush** | Freehand paint treatment areas | YES | YES (Line tool) | YES (best) | YES |
| **Text** | Add text labels | NO | YES (Konva.Text) | YES | YES |
| **Arrow** | Directional arrows for thread lifts | NO | YES (Konva.Arrow) | Custom | YES |
| **Shape** | Circles, rectangles, freeform | NO | YES (all shapes) | Limited | YES |
| **Measure** | Distance measurement | NO | Custom build | Custom build | Custom build |
| **Cannula** | Entry points + fanning paths | NO | YES (Lines + dots) | Custom | Custom |
| **Vein/Sketch** | Smooth strokes for vein mapping | YES | YES (Spline) | YES | YES |
| **Danger** | Anatomical overlay display | N/A (image overlay) | N/A | N/A | N/A |

---

## Stylus + Zoom Support (Critical Feature)

| Scenario | react-sketch-canvas | Konva | js-draw | tldraw |
|----------|:-------------------:|:-----:|:-------:|:------:|
| Stylus draws | YES | YES | YES | YES |
| Finger draws | YES (configurable) | YES | YES (configurable) | YES |
| **Two-finger zoom WHILE brush active** | **NO (BUG)** | YES | YES | YES |
| One-finger pan | NO | YES | YES | YES |
| Disable touch drawing (pen only) | YES | YES | YES (best) | YES |

---

## Library Details

### Konva / react-konva (SELECTED)
- **Website**: https://konvajs.org/
- **React**: https://github.com/konvajs/react-konva
- **License**: MIT (100% free)
- **Strengths**:
  - Native multi-touch support (pinch-zoom, rotation)
  - Built-in shapes: Rect, Circle, Ellipse, Line, Arrow, Text, Star, etc.
  - High performance (game engine heritage)
  - Layer-based rendering
  - Mature (10+ years)
  - Great documentation
- **Weaknesses**:
  - More setup work for freehand drawing
  - Need to build measurement tool custom

### js-draw
- **Website**: https://github.com/personalizedrefrigerator/js-draw
- **License**: MIT (100% free)
- **Strengths**:
  - First-class stylus + touchscreen support
  - Native pinch-zoom and rotation
  - Infinite canvas (10^-10 to 10^10 zoom)
  - Can disable touch drawing (pen only mode)
  - SVG-based output
  - Collaborative editing support
- **Weaknesses**:
  - Limited built-in shapes (mainly freehand)
  - Needs wrapper for React
  - Less mature than Konva

### tldraw
- **Website**: https://tldraw.dev/
- **License**: Custom - free with "Made with tldraw" watermark, paid to remove
- **Strengths**:
  - Full whiteboard SDK
  - All tools built-in
  - Zoom/pan with gestures
  - Embed rich content
- **Weaknesses**:
  - Requires watermark or paid license
  - May be overkill for medical charting
  - Less customizable

### Fabric.js
- **Website**: http://fabricjs.com/
- **License**: MIT (100% free)
- **Strengths**:
  - Object-oriented API
  - Rich feature set
  - Good for complex manipulation
- **Weaknesses**:
  - Heavier/larger bundle
  - Touch gestures require manual implementation
  - No native React support

---

## Architecture After Migration

### Component Structure

```
SmoothBrushTool (Konva-based)
├── containerRef (div) - Touch event listeners
│   └── Stage (Konva)
│       └── Layer
│           ├── Line (completed strokes)
│           └── Line (current stroke)
├── Zone Feedback UI (optional)
└── Zone Picker Dropdown (optional)
```

### State Management

```typescript
// All completed strokes
const [strokes, setStrokes] = useState<KonvaStroke[]>([]);

// Undo stack (strokes that were undone)
const [undoneStrokes, setUndoneStrokes] = useState<KonvaStroke[]>([]);

// Current stroke being drawn
const [currentStroke, setCurrentStroke] = useState<KonvaStroke | null>(null);

// Drawing state
const isDrawingRef = useRef(false);

// Multi-touch state for zoom/pan passthrough
const [isMultiTouchActive, setIsMultiTouchActive] = useState(false);
```

### KonvaStroke Interface

```typescript
interface KonvaStroke {
  id: string;
  points: number[];           // Flattened [x1, y1, x2, y2, ...]
  treatmentType: TreatmentAreaType;
  color: string;
  strokeWidth: number;
  originalPoints: BrushPoint[]; // With pressure for export
}
```

---

## References

- [Konva.js Documentation](https://konvajs.org/docs/index.html)
- [react-konva GitHub](https://github.com/konvajs/react-konva)
- [Konva Free Drawing Demo](https://konvajs.org/docs/sandbox/Free_Drawing.html)
- [js-draw GitHub](https://github.com/personalizedrefrigerator/js-draw)
- [tldraw Pricing](https://tldraw.dev/pricing)
- [react-sketch-canvas Issue #128](https://github.com/vinothpandian/react-sketch-canvas/issues/128)
