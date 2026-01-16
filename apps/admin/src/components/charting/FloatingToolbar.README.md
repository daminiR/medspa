# FloatingToolbar Component

A Procreate/GoodNotes-style floating toolbar for charting tools in the Medical Spa Platform.

## Overview

The `FloatingToolbar` component provides a floating, draggable, auto-hiding toolbar that contains:
- **Product selector** - Quick access to injectable products (Botox, fillers, etc.)
- **Dosage quick-picks** - Preset dosage values (units or ml)
- **Color picker** - Annotation and drawing color selection

## Features

### 1. Auto-Hide Behavior
- Automatically fades to 30% opacity after 3 seconds of inactivity
- Reappears to full opacity on hover or touch
- Timer resets on any interaction
- Configurable delay via `autoHideDelay` prop

### 2. Draggable Positioning
- Click and drag the header bar to reposition
- Touch-friendly for tablet use
- Constrained to viewport bounds
- Smooth animation transitions

### 3. Collapsible
- Toggle between expanded and collapsed states
- Minimizes toolbar footprint when not in use
- Preserves position when collapsed

### 4. Touch-Optimized
- Minimum button size: 48px × 48px (WCAG AA compliance)
- Works with Apple Pencil on iPad
- Supports touch gestures for drag operations

### 5. Responsive Design
- Works on mobile, tablet, and desktop
- Adapts to different screen sizes
- Grid layout for product/dosage selection

## Installation

The component is already included in the charting module:

```tsx
import { FloatingToolbar } from '@/components/charting'
```

## Props

```tsx
interface FloatingToolbarProps {
  // Product selection
  products: Array<{
    id: string
    name: string
    brand: string
    type: 'neurotoxin' | 'filler' | 'biostimulator' | 'skin-booster'
    color?: string
  }>
  selectedProductId?: string
  onProductSelect: (productId: string) => void

  // Dosage quick-picks
  dosageType: 'units' | 'ml'
  dosageOptions: number[]
  selectedDosage?: number
  onDosageSelect: (dosage: number) => void

  // Color picker
  colorOptions: string[] // Array of hex colors
  selectedColor?: string
  onColorSelect: (color: string) => void

  // Toolbar behavior
  autoHideDelay?: number // ms before auto-hiding (default: 3000)
  initialPosition?: { x: number; y: number }
  minPosition?: { x: number; y: number }
  maxPosition?: { x: number; y: number }
  onClose?: () => void
}
```

## Basic Usage

```tsx
import { useState } from 'react'
import { FloatingToolbar } from '@/components/charting'

function ChartingPage() {
  const [selectedProduct, setSelectedProduct] = useState<string>()
  const [selectedDosage, setSelectedDosage] = useState<number>()
  const [selectedColor, setSelectedColor] = useState('#9333EA')

  return (
    <div>
      {/* Your charting canvas/content */}

      <FloatingToolbar
        products={[
          { id: '1', name: 'Cosmetic', brand: 'Botox', type: 'neurotoxin' },
          { id: '2', name: 'Ultra Plus', brand: 'Juvederm', type: 'filler' }
        ]}
        selectedProductId={selectedProduct}
        onProductSelect={setSelectedProduct}
        dosageType="units"
        dosageOptions={[1, 2, 4, 5, 10, 15, 20, 25]}
        selectedDosage={selectedDosage}
        onDosageSelect={setSelectedDosage}
        colorOptions={[
          '#9333EA', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6'
        ]}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
        autoHideDelay={3000}
        initialPosition={{ x: 20, y: 100 }}
        onClose={() => console.log('Toolbar closed')}
      />
    </div>
  )
}
```

## Advanced Usage

### Integration with Inventory System

```tsx
import { useInventory } from '@/hooks/useInventory'

function ChartingPageAdvanced() {
  const { products } = useInventory()

  // Filter for injectable products
  const injectableProducts = products
    .filter(p => p.injectableDetails && p.isActive)
    .map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      type: p.injectableDetails.type,
      color: p.color
    }))

  return (
    <FloatingToolbar
      products={injectableProducts}
      // ... other props
    />
  )
}
```

### Dynamic Dosage Options

```tsx
const dosageOptions = useMemo(() => {
  if (productType === 'neurotoxin') {
    // Units for neurotoxins (1-25 units)
    return [1, 2, 4, 5, 10, 15, 20, 25]
  } else {
    // ml for fillers (0.1-2.0 ml)
    return [0.1, 0.2, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0]
  }
}, [productType])
```

### Synchronized Color with Drawing Tools

```tsx
const [drawingColor, setDrawingColor] = useState('#9333EA')

const handleColorSelect = (color: string) => {
  setDrawingColor(color)

  // Update canvas drawing tool color
  if (canvasRef.current) {
    canvasRef.current.setStrokeStyle(color)
  }

  // Update annotation marker color
  if (annotationTool) {
    annotationTool.setColor(color)
  }
}
```

## Design Patterns

### Procreate-Style Floating UI
The toolbar follows design patterns from professional drawing apps:
- Minimal, unobtrusive footprint
- Auto-hiding to maximize canvas space
- Drag-to-reposition for left/right-handed use
- Quick access to common tools

### Touch-First Design
- 48px minimum touch targets (WCAG AA)
- Generous spacing between buttons
- Visual feedback on selection (scale + ring)
- Drag handle clearly indicated

### Visual Hierarchy
- Product selector: 2-column grid (most important)
- Dosage quick-picks: 4-column grid (frequent use)
- Color picker: 6-column grid (visual selection)

## Styling

The component uses Tailwind CSS with the following color scheme:

- **Primary gradient**: `from-purple-600 to-pink-600`
- **Selected state**: Ring + scale transform
- **Hover states**: Subtle background changes
- **Auto-hide opacity**: 30% when inactive

### Customizing Colors

To match your brand, update the gradient in the header:

```tsx
// In FloatingToolbar.tsx, line 193
className="bg-gradient-to-r from-purple-600 to-pink-600"

// Change to your brand colors:
className="bg-gradient-to-r from-blue-600 to-cyan-600"
```

## Accessibility

- **Keyboard navigation**: All buttons are focusable
- **Touch targets**: Minimum 48px × 48px (WCAG AA)
- **Color indicators**: Selected state uses both color and checkmark
- **Aria labels**: All color buttons have descriptive labels
- **Visual feedback**: Scale and ring effects on selection

## Performance

- **Minimal re-renders**: Uses `useCallback` for event handlers
- **Efficient state updates**: Only updates affected components
- **Auto-hide timer**: Cleaned up on unmount
- **Touch events**: Properly handled with `preventDefault()`

## Browser Support

- Chrome/Edge: Full support
- Safari: Full support (including iPad)
- Firefox: Full support
- Mobile browsers: Full support

## Known Limitations

1. **SSR**: Component must be client-side only (`'use client'`)
2. **Position persistence**: Position resets on page reload (add localStorage if needed)
3. **Multiple toolbars**: Not designed for multiple instances on same page

## Future Enhancements

Potential features to add:

1. **Position persistence** - Save position to localStorage
2. **Keyboard shortcuts** - Quick product/dosage selection
3. **Custom button layouts** - User-configurable toolbar
4. **More tools** - Eraser, undo/redo, layer controls
5. **Responsive scaling** - Adjust size based on screen size
6. **Themes** - Light/dark mode support

## Troubleshooting

### Toolbar not appearing
- Check that `products`, `dosageOptions`, and `colorOptions` are not empty
- Verify `initialPosition` is within viewport bounds

### Dragging not working
- Ensure parent container doesn't have `pointer-events: none`
- Check for conflicting event listeners on parent elements

### Auto-hide not working
- Verify `autoHideDelay` is set to a positive number
- Check browser console for timer cleanup issues

### Touch events not responding on iPad
- Ensure `touchAction: 'none'` is set on the toolbar div
- Check that Apple Pencil is enabled in iPad settings

## Testing

See `FloatingToolbar.example.tsx` for a complete working example.

To test:

1. Open the example page
2. Try dragging the toolbar around
3. Select different products, dosages, and colors
4. Wait 3 seconds to see auto-hide behavior
5. Hover to see it reappear
6. Collapse and expand using the header buttons

## Related Components

- **InteractiveFaceChart** - 2D face charting with annotations
- **FaceChart3D** - 3D face model with injection points
- **BodyChart3D** - 3D body charting
- **InjectorPlaybook** - Save and apply injection protocols

## Support

For questions or issues, contact the development team or open an issue in the repository.
