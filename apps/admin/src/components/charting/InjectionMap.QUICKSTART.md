# InjectionMap Quick Start Guide

## 5-Minute Setup

### Step 1: Import the Component

```tsx
import { InjectionMap } from '@/components/charting'
```

### Step 2: Set Up State

```tsx
import { useState } from 'react'
import type { InjectionPoint as InjectionPoint2D } from '@/components/charting/InteractiveFaceChart'
import type { InjectionPoint3D } from '@/components/charting/FaceChart3D'

function MyChartingPage() {
  // Required state
  const [injectionPoints2D, setInjectionPoints2D] = useState<Map<string, InjectionPoint2D>>(new Map())
  const [injectionPoints3DFace, setInjectionPoints3DFace] = useState<Map<string, InjectionPoint3D>>(new Map())
  const [injectionPoints3DBody, setInjectionPoints3DBody] = useState<Map<string, InjectionPoint3D>>(new Map())

  // Optional: Freehand points for 2D mode
  const [freehandPoints, setFreehandPoints] = useState(new Map())
}
```

### Step 3: Add the Component

```tsx
<InjectionMap
  // Patient info (required)
  patientId="PT-001"
  patientName="Jane Doe"
  patientGender="female"

  // Product info (required)
  productType="neurotoxin"

  // State management (required)
  injectionPoints2D={injectionPoints2D}
  onInjectionPoints2DChange={setInjectionPoints2D}
  injectionPoints3DFace={injectionPoints3DFace}
  onInjectionPoints3DFaceChange={setInjectionPoints3DFace}
  injectionPoints3DBody={injectionPoints3DBody}
  onInjectionPoints3DBodyChange={setInjectionPoints3DBody}

  // Optional callbacks
  onSave={() => console.log('Saving...')}
/>
```

## Complete Minimal Example

```tsx
'use client'

import { useState } from 'react'
import { InjectionMap } from '@/components/charting'

export default function ChartingPage() {
  const [points2D, setPoints2D] = useState(new Map())
  const [points3DFace, setPoints3DFace] = useState(new Map())
  const [points3DBody, setPoints3DBody] = useState(new Map())

  return (
    <div className="p-6">
      <InjectionMap
        patientId="PT-001"
        patientName="Jane Doe"
        patientGender="female"
        productType="neurotoxin"
        injectionPoints2D={points2D}
        onInjectionPoints2DChange={setPoints2D}
        injectionPoints3DFace={points3DFace}
        onInjectionPoints3DFaceChange={setPoints3DFace}
        injectionPoints3DBody={points3DBody}
        onInjectionPoints3DBodyChange={setPoints3DBody}
      />
    </div>
  )
}
```

## Common Scenarios

### Scenario 1: Neurotoxin Treatment (Botox)

```tsx
<InjectionMap
  productType="neurotoxin"
  selectedProductId="botox-50u"
  // ... other required props
/>
```

### Scenario 2: Filler Treatment

```tsx
<InjectionMap
  productType="filler"
  selectedProductId="juvederm-1ml"
  // ... other required props
/>
```

### Scenario 3: With Save Handler

```tsx
const handleSave = async () => {
  const data = {
    patientId: 'PT-001',
    injectionPoints2D: Array.from(points2D.entries()),
    injectionPoints3DFace: Array.from(points3DFace.entries())
  }

  await fetch('/api/charting/save', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

<InjectionMap
  onSave={handleSave}
  // ... other props
/>
```

### Scenario 4: Read-Only View (History)

```tsx
<InjectionMap
  readOnly={true}
  injectionPoints2D={historicalPoints}
  // ... other props
/>
```

### Scenario 5: With Previous Treatment Defaults

```tsx
<InjectionMap
  patientLastTreatment={previousTreatmentMap}
  // ... other props
/>
```

## Features at a Glance

| Feature | How to Access |
|---------|--------------|
| **2D/3D Toggle** | Click "2D" or "3D" button in header |
| **Body Area** | Click "Face", "Torso", or "Full Body" |
| **Gender** | Click "Male" or "Female" (2D face only) |
| **Add Point** | Click on diagram/model |
| **View Totals** | Floating panel at bottom-right |
| **Clear All** | Click "Clear All" button |
| **Save** | Click "Save Map" button |

## View Modes

### 2D Mode (Default)
- **Face**: Interactive diagram with predefined zones
- **Torso**: Coming soon
- **Full Body**: Coming soon

### 3D Mode
- **Face**: Interactive 3D head model
- **Torso/Body**: Interactive 3D body model

## Props Cheat Sheet

### Required Props
```tsx
patientId: string
patientName: string
productType: 'neurotoxin' | 'filler'
injectionPoints2D: Map<string, InjectionPoint2D>
onInjectionPoints2DChange: (points) => void
injectionPoints3DFace: Map<string, InjectionPoint3D>
onInjectionPoints3DFaceChange: (points) => void
injectionPoints3DBody: Map<string, InjectionPoint3D>
onInjectionPoints3DBodyChange: (points) => void
```

### Commonly Used Optional Props
```tsx
patientGender?: 'male' | 'female'  // default: 'female'
selectedProductId?: string
freehandPoints?: Map<string, FreehandPoint>
onFreehandPointsChange?: (points) => void
onSave?: () => void
readOnly?: boolean  // default: false
initialViewMode?: '2d' | '3d'  // default: '2d'
initialBodyPart?: 'face' | 'torso' | 'full-body'  // default: 'face'
```

## Troubleshooting

### Issue: Component not rendering
**Solution**: Ensure all required props are provided

### Issue: 3D model not loading
**Solution**: Check that GLB files exist in `/public/models/` directory

### Issue: Points not saving
**Solution**: Implement the `onSave` callback handler

### Issue: TypeScript errors
**Solution**: Import types from the correct locations:
```tsx
import type { InjectionPoint as InjectionPoint2D } from '@/components/charting/InteractiveFaceChart'
import type { InjectionPoint3D } from '@/components/charting/FaceChart3D'
```

## Next Steps

1. ✅ Import and add component to your page
2. 📖 Read full documentation: `InjectionMap.README.md`
3. 💡 Check example usage: `InjectionMap.example.tsx`
4. 🎨 Customize styling if needed
5. 🧪 Test with real patient data

## Need More Help?

- **Full Documentation**: See `InjectionMap.README.md`
- **Example Code**: See `InjectionMap.example.tsx`
- **Component Source**: See `InjectionMap.tsx`

---

**Ready to chart? Copy the minimal example above and start building!**
