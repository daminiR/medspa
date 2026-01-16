# InjectionMap Component

## Overview

The `InjectionMap` component is a unified container that manages injection point charting across multiple view modes and body areas. It seamlessly integrates 2D diagrams and 3D models for face and body treatments.

## Features

- **Multi-View Support**: Toggle between 2D and 3D rendering modes
- **Body Area Selection**: Switch between Face, Torso, and Full Body views
- **Gender-Specific Diagrams**: Male/Female anatomical accuracy for 2D views
- **Real-Time Totals**: Live calculation of units, volume, sites, and estimated costs
- **Unified State Management**: Single component manages all injection point types
- **Responsive Design**: Optimized for desktop and tablet workflows
- **Smart Defaults**: Pre-populate from previous treatments
- **Read-Only Mode**: View historical records without editing

## Architecture

```
InjectionMap (Container)
├── Header
│   ├── Patient Info
│   └── Control Bar
│       ├── 2D/3D Toggle
│       ├── Body Part Selector
│       ├── Gender Toggle (2D only)
│       └── Action Buttons
├── Chart Area
│   ├── 2D Views
│   │   ├── InteractiveFaceChart (Face)
│   │   ├── TorsoChart2D (Coming Soon)
│   │   └── BodyChart2D (Coming Soon)
│   └── 3D Views
│       ├── FaceChart3D (Face)
│       └── BodyChart3D (Torso/Full Body)
└── TotalsPanel (Floating)
    ├── Collapsed Summary
    └── Expanded Details
```

## Usage

### Basic Implementation

```tsx
import { InjectionMap } from '@/components/charting'
import { useState } from 'react'

function ChartingPage() {
  const [injectionPoints2D, setInjectionPoints2D] = useState(new Map())
  const [injectionPoints3DFace, setInjectionPoints3DFace] = useState(new Map())
  const [injectionPoints3DBody, setInjectionPoints3DBody] = useState(new Map())

  return (
    <InjectionMap
      patientId="PT-001"
      patientName="Sarah Johnson"
      patientGender="female"
      productType="neurotoxin"
      injectionPoints2D={injectionPoints2D}
      onInjectionPoints2DChange={setInjectionPoints2D}
      injectionPoints3DFace={injectionPoints3DFace}
      onInjectionPoints3DFaceChange={setInjectionPoints3DFace}
      injectionPoints3DBody={injectionPoints3DBody}
      onInjectionPoints3DBodyChange={setInjectionPoints3DBody}
      onSave={handleSave}
    />
  )
}
```

### With All Features

```tsx
<InjectionMap
  // Patient Info
  patientId={patient.id}
  patientName={patient.name}
  patientGender={patient.gender}

  // Product Selection
  productType={productType}
  selectedProductId={selectedProduct?.id}

  // 2D State Management
  injectionPoints2D={injectionPoints2D}
  onInjectionPoints2DChange={setInjectionPoints2D}
  freehandPoints={freehandPoints}
  onFreehandPointsChange={setFreehandPoints}

  // 3D State Management
  injectionPoints3DFace={injectionPoints3DFace}
  onInjectionPoints3DFaceChange={setInjectionPoints3DFace}
  injectionPoints3DBody={injectionPoints3DBody}
  onInjectionPoints3DBodyChange={setInjectionPoints3DBody}

  // Smart Defaults
  patientLastTreatment={previousTreatment}

  // Callbacks
  onSave={handleSave}
  onReset={handleReset}

  // UI State
  initialViewMode="2d"
  initialBodyPart="face"
  readOnly={false}
/>
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `patientId` | `string` | Unique patient identifier |
| `patientName` | `string` | Patient's full name for display |
| `productType` | `'neurotoxin' \| 'filler'` | Type of injectable being charted |
| `injectionPoints2D` | `Map<string, InjectionPoint2D>` | 2D injection points state |
| `onInjectionPoints2DChange` | `(points) => void` | 2D points update callback |
| `injectionPoints3DFace` | `Map<string, InjectionPoint3D>` | 3D face points state |
| `onInjectionPoints3DFaceChange` | `(points) => void` | 3D face points update callback |
| `injectionPoints3DBody` | `Map<string, InjectionPoint3D>` | 3D body points state |
| `onInjectionPoints3DBodyChange` | `(points) => void` | 3D body points update callback |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `patientGender` | `'male' \| 'female'` | `'female'` | Patient gender for diagram selection |
| `selectedProductId` | `string` | - | Currently selected product for costing |
| `freehandPoints` | `Map<string, FreehandPoint>` | - | Custom/freehand injection points |
| `onFreehandPointsChange` | `(points) => void` | - | Freehand points update callback |
| `patientLastTreatment` | `Map<string, InjectionPoint2D>` | - | Previous treatment for defaults |
| `onSave` | `() => void` | - | Save button callback |
| `onReset` | `() => void` | - | Reset/clear callback |
| `readOnly` | `boolean` | `false` | Disable editing |
| `initialViewMode` | `'2d' \| '3d'` | `'2d'` | Starting view mode |
| `initialBodyPart` | `'face' \| 'torso' \| 'full-body'` | `'face'` | Starting body area |

## Type Definitions

### InjectionPoint2D

```typescript
interface InjectionPoint2D {
  id: string
  zoneId: string
  units?: number
  volume?: number
  depthId: string
  techniqueId: string
  needleGaugeId: string
  productId?: string
  notes?: string
  timestamp: Date
}
```

### InjectionPoint3D

```typescript
interface InjectionPoint3D {
  id: string
  position: THREE.Vector3
  screenPosition?: { x: number; y: number }
  zoneId?: string
  customName?: string
  units?: number
  volume?: number
  depthId: string
  techniqueId: string
  needleGaugeId: string
  notes?: string
  timestamp: Date
  productType: 'neurotoxin' | 'filler'
}
```

### FreehandPoint

```typescript
interface FreehandPoint {
  id: string
  x: number // percentage 0-100
  y: number // percentage 0-100
  customName?: string
  units?: number
  volume?: number
  depthId: string
  techniqueId: string
  needleGaugeId: string
  productId?: string
  notes?: string
  timestamp: Date
}
```

## State Management Best Practices

### Custom Hook Pattern

Create a custom hook to manage all injection map state:

```tsx
function useInjectionMapState() {
  const [injectionPoints2D, setInjectionPoints2D] = useState(new Map())
  const [freehandPoints, setFreehandPoints] = useState(new Map())
  const [injectionPoints3DFace, setInjectionPoints3DFace] = useState(new Map())
  const [injectionPoints3DBody, setInjectionPoints3DBody] = useState(new Map())

  const clearAll = () => {
    setInjectionPoints2D(new Map())
    setFreehandPoints(new Map())
    setInjectionPoints3DFace(new Map())
    setInjectionPoints3DBody(new Map())
  }

  const hasAnyPoints = () => {
    return (
      injectionPoints2D.size > 0 ||
      freehandPoints.size > 0 ||
      injectionPoints3DFace.size > 0 ||
      injectionPoints3DBody.size > 0
    )
  }

  return {
    injectionPoints2D,
    setInjectionPoints2D,
    freehandPoints,
    setFreehandPoints,
    injectionPoints3DFace,
    setInjectionPoints3DFace,
    injectionPoints3DBody,
    setInjectionPoints3DBody,
    clearAll,
    hasAnyPoints
  }
}
```

### Context Pattern

For complex applications with multiple charting views:

```tsx
interface InjectionMapContextType {
  injectionPoints2D: Map<string, InjectionPoint2D>
  injectionPoints3DFace: Map<string, InjectionPoint3D>
  injectionPoints3DBody: Map<string, InjectionPoint3D>
  updatePoints2D: (points: Map<string, InjectionPoint2D>) => void
  updatePoints3DFace: (points: Map<string, InjectionPoint3D>) => void
  updatePoints3DBody: (points: Map<string, InjectionPoint3D>) => void
  clearAll: () => void
}

const InjectionMapContext = createContext<InjectionMapContextType | null>(null)
```

## Data Persistence

### Saving to Backend

```tsx
const handleSave = async () => {
  const chartData = {
    patientId: patient.id,
    treatmentDate: new Date().toISOString(),
    productType,
    selectedProductId,
    injectionPoints2D: Array.from(injectionPoints2D.entries()),
    freehandPoints: Array.from(freehandPoints.entries()),
    injectionPoints3DFace: Array.from(injectionPoints3DFace.entries()).map(([id, point]) => ({
      id,
      ...point,
      position: {
        x: point.position.x,
        y: point.position.y,
        z: point.position.z
      }
    })),
    injectionPoints3DBody: Array.from(injectionPoints3DBody.entries()).map(([id, point]) => ({
      id,
      ...point,
      position: {
        x: point.position.x,
        y: point.position.y,
        z: point.position.z
      }
    }))
  }

  try {
    const response = await fetch('/api/charting/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chartData)
    })

    if (response.ok) {
      toast.success('Treatment chart saved successfully')
    } else {
      throw new Error('Failed to save')
    }
  } catch (error) {
    toast.error('Failed to save treatment chart')
    console.error(error)
  }
}
```

### Auto-Save Implementation

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    // Auto-save after 2 seconds of inactivity
    saveToLocalStorage()
  }, 2000)

  return () => clearTimeout(timer)
}, [injectionPoints2D, injectionPoints3DFace, injectionPoints3DBody])

const saveToLocalStorage = () => {
  const data = {
    patientId: patient.id,
    timestamp: Date.now(),
    injectionPoints2D: Array.from(injectionPoints2D.entries()),
    injectionPoints3DFace: Array.from(injectionPoints3DFace.entries()),
    injectionPoints3DBody: Array.from(injectionPoints3DBody.entries())
  }
  localStorage.setItem('charting-autosave', JSON.stringify(data))
}
```

## Totals Calculation

The component automatically calculates:

- **Total Units** (for neurotoxins)
- **Total Volume** (for fillers)
- **Total Sites** (number of injection points)
- **Estimated Cost** (if product pricing is configured)
- **Regional Breakdown** (for 2D face view only)

### Cost Calculation Logic

```typescript
// Per unit pricing (neurotoxin)
if (product.pricePerUnit && units) {
  cost = product.pricePerUnit * units
}

// Per ml pricing (filler)
if (product.pricePerMl && volume) {
  cost = product.pricePerMl * volume
}
```

## View Modes

### 2D Mode

**Face View:**
- Uses `InteractiveFaceChart` component
- Supports predefined anatomical zones
- Supports freehand placement
- Gender-specific diagrams (male/female)
- Zone-based regional breakdown
- Tooltips and quick-edit bubbles

**Torso/Body Views:**
- Placeholder UI (coming soon)
- Will support similar zone-based approach

### 3D Mode

**Face View:**
- Uses `FaceChart3D` component
- Click on 3D mesh to place injection points
- Rotate/zoom/pan camera controls
- Real-time marker rendering
- Depth perception for accuracy

**Body View:**
- Uses `BodyChart3D` component
- Supports torso and full-body models
- Same interaction paradigm as face

## Keyboard Shortcuts

The underlying chart components support keyboard shortcuts:

| Key | Action |
|-----|--------|
| `Ctrl/Cmd + S` | Save chart |
| `Ctrl/Cmd + Z` | Undo last action |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Delete` | Remove selected point |
| `Escape` | Clear selection |
| `Space` | Toggle 2D/3D mode |
| `1-5` | Quick unit presets |

## Mobile/Tablet Support

- Touch-optimized controls
- Haptic feedback (vibration)
- Simplified UI for smaller screens
- Voice input support (in InteractiveFaceChart)
- Scribble/Handwriting support (iPad)

## Performance Considerations

### 3D Model Loading

3D components are dynamically imported to reduce initial bundle size:

```tsx
const FaceChart3D = dynamic(() => import('./FaceChart3D'), { ssr: false })
```

### State Management

Use `Map` instead of arrays for O(1) lookup performance:

```tsx
// Fast lookup by ID
const point = injectionPoints2D.get(pointId)

// Fast existence check
if (injectionPoints2D.has(pointId)) { ... }
```

### Memoization

The component uses `useMemo` for expensive calculations:

```tsx
const totals = useMemo(() => {
  // Calculate totals only when points change
}, [injectionPoints2D, injectionPoints3DFace, injectionPoints3DBody])
```

## Styling and Theming

### Color Scheme

```css
/* Neurotoxin (Purple) */
--neurotoxin-primary: #8B5CF6
--neurotoxin-light: #C4B5FD
--neurotoxin-dark: #6D28D9

/* Filler (Pink) */
--filler-primary: #EC4899
--filler-light: #F9A8D4
--filler-dark: #BE185D
```

### Customization

The component uses Tailwind CSS classes. Override with custom classes:

```tsx
<InjectionMap
  className="custom-injection-map"
  // ... other props
/>
```

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management
- Screen reader announcements for actions
- High contrast mode support

## Error Handling

The component gracefully handles:

- Missing 3D models (shows loading state)
- Invalid injection point data
- Network failures during save
- Browser compatibility issues

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (2D only on iOS)
- **Mobile**: 2D charts fully supported, 3D requires WebGL

## Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { InjectionMap } from './InjectionMap'

test('toggles between 2D and 3D mode', () => {
  const { container } = render(<InjectionMap {...requiredProps} />)
  const toggle3D = screen.getByText('3D')
  fireEvent.click(toggle3D)
  expect(container.querySelector('.face-chart-3d')).toBeInTheDocument()
})
```

### Integration Tests

Test the full workflow:
1. Load patient data
2. Select product
3. Add injection points
4. Calculate totals
5. Save data

## Troubleshooting

### 3D Model Not Loading

- Check that GLB files exist in `/public/models/`
- Verify WebGL is supported in browser
- Check browser console for errors

### Points Not Saving

- Verify `onSave` callback is provided
- Check network requests in DevTools
- Ensure data format matches API schema

### Performance Issues

- Limit number of injection points (<100 recommended)
- Use production build (not development)
- Check for memory leaks in DevTools

## Future Enhancements

- [ ] 2D Torso/Body chart implementation
- [ ] PDF export with anatomical diagrams
- [ ] Multi-session comparison view
- [ ] AR preview mode (mobile)
- [ ] AI-suggested injection patterns
- [ ] Video recording during treatment
- [ ] Real-time collaboration (multi-user)

## Related Components

- `InteractiveFaceChart` - 2D face charting
- `FaceChart3D` - 3D face model
- `BodyChart3D` - 3D body model
- `TotalsPanel` - Summary statistics
- `InjectionTechniqueSelector` - Technique configuration

## Support

For questions or issues, contact the development team or refer to:
- Main documentation: `/docs/SYSTEM_WORKFLOWS.html`
- Component docs: `/docs/components/charting/`
- API reference: `/docs/API_DOCUMENTATION.md`
