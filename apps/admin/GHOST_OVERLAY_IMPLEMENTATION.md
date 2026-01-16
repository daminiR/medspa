# Ghost Overlay Feature Implementation Guide

## Overview
This document describes the implementation of the "Ghost Overlay" feature for the Interactive Face Chart component. This premium feature, inspired by RxPhoto, helps practitioners align photos consistently during charting sessions.

## Files to Modify

### File: `/Users/daminirijhwani/medical-spa-platform/apps/admin/src/components/charting/InteractiveFaceChart.tsx`

## Changes Required

### 1. Update Interface Props (Line 97-108)

**Current:**
```typescript
interface InteractiveFaceChartProps {
  productType: 'neurotoxin' | 'filler'
  gender: 'male' | 'female'
  injectionPoints: Map<string, InjectionPoint>
  onInjectionPointsChange: (points: Map<string, InjectionPoint>) => void
  freehandPoints?: Map<string, FreehandPoint>
  onFreehandPointsChange?: (points: Map<string, FreehandPoint>) => void
  onSave?: () => void
  selectedProductId?: string
  patientLastTreatment?: Map<string, InjectionPoint> // For smart defaults
  readOnly?: boolean
}
```

**Add this prop:**
```typescript
  previousPhotoUrl?: string // URL of patient's previous treatment photo for ghost overlay
```

**After line 107:**
```typescript
interface InteractiveFaceChartProps {
  productType: 'neurotoxin' | 'filler'
  gender: 'male' | 'female'
  injectionPoints: Map<string, InjectionPoint>
  onInjectionPointsChange: (points: Map<string, InjectionPoint>) => void
  freehandPoints?: Map<string, FreehandPoint>
  onFreehandPointsChange?: (points: Map<string, FreehandPoint>) => void
  onSave?: () => void
  selectedProductId?: string
  patientLastTreatment?: Map<string, InjectionPoint> // For smart defaults
  previousPhotoUrl?: string // URL of patient's previous treatment photo for ghost overlay
  readOnly?: boolean
}
```

---

### 2. Update Function Parameters (Line 191-202)

**Current:**
```typescript
export function InteractiveFaceChart({
  productType,
  gender,
  injectionPoints,
  onInjectionPointsChange,
  freehandPoints: externalFreehandPoints,
  onFreehandPointsChange,
  onSave,
  selectedProductId,
  patientLastTreatment,
  readOnly = false
}: InteractiveFaceChartProps) {
```

**Add previousPhotoUrl to destructuring:**
```typescript
export function InteractiveFaceChart({
  productType,
  gender,
  injectionPoints,
  onInjectionPointsChange,
  freehandPoints: externalFreehandPoints,
  onFreehandPointsChange,
  onSave,
  selectedProductId,
  patientLastTreatment,
  previousPhotoUrl,
  readOnly = false
}: InteractiveFaceChartProps) {
```

---

### 3. Add Ghost Overlay State (After Line 249)

**Add these two state variables after the freehand mode state:**

```typescript
  // Ghost overlay state (for photo alignment)
  const [showGhostOverlay, setShowGhostOverlay] = useState(false)
  const [ghostOpacity, setGhostOpacity] = useState(0.3)
```

**Location:** Right after this line:
```typescript
  const [hoveredFreehandPoint, setHoveredFreehandPoint] = useState<string | null>(null)
```

---

### 4. Add Eye Icon Import (Line 14)

**Current imports from lucide-react:**
```typescript
import {
  Plus,
  Minus,
  Layers,
  Target,
  Syringe,
  Zap,
  RotateCcw,
  Save,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Info,
  FileText,
  Clock,
  Sparkles,
  Droplets,
  History,
  Copy,
  Keyboard,
  Settings2,
  Pencil,
  CircleDot,
  MapPin,
  Mic,
  MicOff,
  MousePointer2,
  PointerIcon,
  CheckSquare,
  Volume2,
  VolumeX
} from 'lucide-react'
```

**Add Eye icon:**
```typescript
import {
  Plus,
  Minus,
  Layers,
  Target,
  Syringe,
  Zap,
  RotateCcw,
  Save,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Info,
  FileText,
  Clock,
  Sparkles,
  Droplets,
  History,
  Copy,
  Keyboard,
  Settings2,
  Pencil,
  CircleDot,
  MapPin,
  Mic,
  MicOff,
  MousePointer2,
  PointerIcon,
  CheckSquare,
  Volume2,
  VolumeX,
  Eye  // ADD THIS
} from 'lucide-react'
```

---

### 5. Add Ghost Overlay Toggle Button (In Toolbar, After Line 1047)

**Location:** In the toolbar, after the "Copy Last" button and before "Keyboard Help"

**Add this button:**
```typescript
            {/* Ghost Overlay Toggle (only show if previousPhotoUrl exists) */}
            {previousPhotoUrl && (
              <button
                onClick={() => setShowGhostOverlay(!showGhostOverlay)}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 transition-colors ${
                  showGhostOverlay
                    ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title={showGhostOverlay ? 'Hide ghost overlay' : 'Show previous photo overlay for alignment'}
              >
                <Eye className="w-4 h-4" />
                Ghost Overlay
              </button>
            )}
```

---

### 6. Add Opacity Slider (After Freehand Mode Instructions, After Line 1119)

**Add this conditional block after the Freehand Mode Instructions section:**

```typescript
        {/* Ghost Overlay Controls */}
        {showGhostOverlay && previousPhotoUrl && (
          <div className="px-4 py-3 bg-purple-50 border-b border-purple-100 flex items-center gap-4">
            <Eye className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Ghost Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={ghostOpacity}
              onChange={(e) => setGhostOpacity(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <span className="text-sm text-purple-700 font-medium w-12">
              {Math.round(ghostOpacity * 100)}%
            </span>
          </div>
        )}
```

---

### 7. Add Ghost Image Overlay (In Face Image Container, After Line 1173)

**Location:** Inside the face image container div, right after the main face chart Image component

**Current code (around line 1166-1173):**
```typescript
            <Image
              src={`/images/face-chart-${gender}.png`}
              alt={`${gender} face chart for injection mapping`}
              fill
              className="object-contain"
              style={{ opacity: 0.85 }}
              priority
            />
```

**Add this RIGHT AFTER the Image component (before the Zone Points Overlay div):**

```typescript
            {/* Ghost Overlay - Previous Photo for Alignment */}
            {showGhostOverlay && previousPhotoUrl && (
              <div className="absolute inset-0 pointer-events-none z-10">
                <Image
                  src={previousPhotoUrl}
                  alt="Previous treatment photo for alignment"
                  fill
                  className="object-contain"
                  style={{
                    opacity: ghostOpacity,
                    mixBlendMode: 'normal'
                  }}
                />
                {/* Ghost Overlay Indicator */}
                <div className="absolute top-2 right-2 px-3 py-1 bg-purple-600/90 text-white text-xs rounded-full shadow-lg flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  Ghost: {Math.round(ghostOpacity * 100)}%
                </div>
              </div>
            )}
```

---

## How It Works

1. **Props**: The component now accepts an optional `previousPhotoUrl` prop containing the URL of the patient's last treatment photo.

2. **State Management**:
   - `showGhostOverlay`: Boolean to toggle the ghost overlay on/off
   - `ghostOpacity`: Number (0.1 to 0.5) controlling the opacity of the ghost image

3. **UI Controls**:
   - **Toggle Button**: Shows in the toolbar when `previousPhotoUrl` is provided. Clicking toggles the ghost overlay on/off.
   - **Opacity Slider**: Appears below the toolbar when ghost overlay is active, allowing practitioners to adjust transparency from 10% to 50%.

4. **Rendering**:
   - The previous photo is rendered as an absolutely positioned overlay behind the injection points
   - The photo uses `pointer-events-none` to ensure it doesn't interfere with clicking zones
   - A small badge in the top-right shows the current opacity percentage

## Benefits

This feature helps practitioners:
- **Consistent Photos**: Line up patient's features exactly the same as previous sessions
- **Treatment Planning**: See where they injected last time while planning current treatment
- **Before/After**: Compare current state to previous treatment for better results

## Usage Example

```typescript
<InteractiveFaceChart
  productType="neurotoxin"
  gender="female"
  injectionPoints={injectionPoints}
  onInjectionPointsChange={setInjectionPoints}
  previousPhotoUrl="/patient-photos/jane-doe-2024-11-15-frontal.jpg"  // Enable ghost overlay
  patientLastTreatment={lastTreatmentPoints}
/>
```

## Testing

To test the feature:
1. Pass a `previousPhotoUrl` prop to the component
2. Verify the "Ghost Overlay" button appears in the toolbar
3. Click the button to enable the overlay
4. Verify the previous photo appears semi-transparent behind the face chart
5. Adjust the opacity slider and verify the transparency changes
6. Verify all injection point clicks still work correctly with overlay active

## Notes

- The ghost image has `z-index: 10` to ensure it appears behind injection points (which have higher z-index values)
- Default opacity is 30% (0.3) which provides good balance between visibility and transparency
- The opacity range is limited to 10%-50% to ensure the base diagram remains visible
- The feature gracefully degrades if no `previousPhotoUrl` is provided (button doesn't show)
