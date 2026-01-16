# ViewModeToggle Component

A clean, compact toggle component for switching between 2D and 3D charting modes with conditional sub-options.

## Location

```
/src/components/charting/ViewModeToggle.tsx
```

## Features

- ✅ Clean toggle between 2D and 3D views
- ✅ Conditional sub-options based on mode:
  - **2D Mode**: Face, Torso, Full Body buttons
  - **3D Mode**: Male, Female buttons
- ✅ Touch-friendly design (44px+ targets)
- ✅ Compact mode option for smaller spaces
- ✅ Tailwind CSS styling
- ✅ TypeScript with proper type exports
- ✅ Follows existing codebase patterns

## Usage

### Basic Usage

```tsx
import { ViewModeToggle, ViewMode, BodyArea2D, Gender } from '@/components/charting'

function MyChartingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('2d')
  const [bodyArea2D, setBodyArea2D] = useState<BodyArea2D>('face')
  const [gender, setGender] = useState<Gender>('female')

  return (
    <ViewModeToggle
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      bodyArea2D={bodyArea2D}
      onBodyArea2DChange={setBodyArea2D}
      gender={gender}
      onGenderChange={setGender}
    />
  )
}
```

### Compact Mode

For smaller UI spaces:

```tsx
<ViewModeToggle
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  bodyArea2D={bodyArea2D}
  onBodyArea2DChange={setBodyArea2D}
  gender={gender}
  onGenderChange={setGender}
  compact
/>
```

### With Existing Charting Page

```tsx
// In your charting page component
const [chartViewMode, setChartViewMode] = useState<'2d' | '3d'>('2d')
const [bodyArea2D, setBodyArea2D] = useState<BodyArea2D>('face')
const [gender, setGender] = useState<Gender>('female')

// Add to your toolbar or sidebar
<ViewModeToggle
  viewMode={chartViewMode}
  onViewModeChange={setChartViewMode}
  bodyArea2D={bodyArea2D}
  onBodyArea2DChange={setBodyArea2D}
  gender={gender}
  onGenderChange={setGender}
/>

// Then conditionally render your charting components
{chartViewMode === '2d' ? (
  bodyArea2D === 'face' ? (
    <InteractiveFaceChart {...props} />
  ) : (
    <Body2DChart area={bodyArea2D} {...props} />
  )
) : (
  <FaceChart3D gender={gender} {...props} />
)}
```

## Props

### ViewModeToggleProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `viewMode` | `'2d' \| '3d'` | Yes | - | Current view mode |
| `onViewModeChange` | `(mode: ViewMode) => void` | Yes | - | Callback when view mode changes |
| `bodyArea2D` | `'face' \| 'torso' \| 'full-body'` | No | `'face'` | Selected body area in 2D mode |
| `onBodyArea2DChange` | `(area: BodyArea2D) => void` | No | - | Callback when body area changes (2D only) |
| `gender` | `'male' \| 'female'` | No | `'female'` | Selected gender in 3D mode |
| `onGenderChange` | `(gender: Gender) => void` | No | - | Callback when gender changes (3D only) |
| `compact` | `boolean` | No | `false` | Use compact spacing |

## Type Exports

```tsx
export type ViewMode = '2d' | '3d'
export type BodyArea2D = 'face' | 'torso' | 'full-body'
export type Gender = 'male' | 'female'
```

## Styling

The component uses Tailwind CSS classes and follows the existing design patterns:

- **2D Mode Selected**: Purple accent (`text-purple-700`)
- **3D Male Selected**: Blue accent (`text-blue-700`)
- **3D Female Selected**: Pink accent (`text-pink-700`)
- **Touch Targets**: 44px minimum height for accessibility
- **Responsive**: Adjusts spacing based on `compact` prop

## Integration with Existing Components

### With FaceChart3D

```tsx
{chartViewMode === '3d' && (
  <FaceChart3D
    productType={productType}
    injectionPoints={injectionPoints3D}
    onInjectionPointsChange={setInjectionPoints3D}
  />
)}
```

### With InteractiveFaceChart (2D)

```tsx
{chartViewMode === '2d' && bodyArea2D === 'face' && (
  <InteractiveFaceChart
    productType={productType}
    injectionPoints={interactiveInjectionPoints}
    onInjectionPointsChange={setInteractiveInjectionPoints}
  />
)}
```

### With BodyChart3D

```tsx
{chartViewMode === '3d' && (
  <BodyChart3DLazy
    productType={productType}
    injectionPoints={injectionPointsBody3D}
    onInjectionPointsChange={setInjectionPointsBody3D}
  />
)}
```

## Example

See `ViewModeToggle.example.tsx` for a complete interactive example.

## Notes

- The component automatically shows/hides sub-options based on the active mode
- All callback props are optional - if not provided, those sub-options won't be rendered
- Follows accessibility best practices with proper button sizes and contrast
- Uses Lucide React icons for consistency with the rest of the codebase
