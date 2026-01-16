# Canvas Library Comparison for Medical Spa Charting

## Overview

This document compares canvas/drawing libraries for the charting feature, specifically evaluating support for:
- Stylus (Apple Pencil) drawing
- Touch gestures (pinch-zoom, pan) while drawing
- Various tool types needed for medical charting

---

## Current Problem

The current implementation uses `react-sketch-canvas` for the Brush tool. This library has a **known bug** (GitHub issue #128) where touch events cannot pass through to the parent for zoom/pan when `allowOnlyPointerType="pen"` is set. This means:
- Stylus can draw ✅
- Two-finger zoom does NOT work while brush is active ❌

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

### Konva / react-konva
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

## Recommendation

### Best Choice: **Konva / react-konva**

**Why:**
1. **FREE** (MIT license, no watermark)
2. **Native pinch-zoom** while drawing works out of the box
3. **All your tools supported**:
   - Freehand brush via Line tool
   - Shapes (Circle, Rect, etc.)
   - Arrows (Konva.Arrow)
   - Text (Konva.Text)
   - Lines for cannula paths
   - Points for injection dots
4. **Mature and well-documented**
5. **Native React support** via react-konva
6. **High performance**

### Alternative: **js-draw**

If brush/freehand is the primary use case and you want the best stylus experience, js-draw is excellent. However, you'd need to build shapes, arrows, and other tools custom.

---

## Migration Path

To migrate from react-sketch-canvas to Konva:

1. Install: `npm install konva react-konva`
2. Replace SmoothBrushTool's ReactSketchCanvas with Konva Stage/Layer
3. Implement freehand drawing using Konva.Line
4. Touch gestures (zoom/pan) work automatically
5. Other tools (Arrow, Shape, Text) can use built-in Konva components

---

## References

- [Konva.js Documentation](https://konvajs.org/docs/index.html)
- [react-konva GitHub](https://github.com/konvajs/react-konva)
- [Konva Free Drawing Demo](https://konvajs.org/docs/sandbox/Free_Drawing.html)
- [js-draw GitHub](https://github.com/personalizedrefrigerator/js-draw)
- [tldraw Pricing](https://tldraw.dev/pricing)
- [react-sketch-canvas Issue #128](https://github.com/vinothpandian/react-sketch-canvas/issues/128)
