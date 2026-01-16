# TorsoChart Component

A 2D interactive torso injection mapping view for tracking body treatments (neurotoxins/fillers).

## Features

- SVG-based torso outline (front view)
- Clickable injection zones (chest, abdomen, sides/flanks, back)
- Same interaction pattern as InteractiveFaceChart
- Multi-select mode for batch charting
- Touch-optimized for tablet use
- Quick edit popover for adjusting values
- Real-time totals calculation
- Haptic feedback on mobile devices

## Usage

```tsx
import { TorsoChart } from '@/components/charting/TorsoChart'
import { InjectionPoint } from '@/components/charting/InteractiveFaceChart'
import { useState } from 'react'

function MyChartingComponent() {
  const [injectionPoints, setInjectionPoints] = useState<Map<string, InjectionPoint>>(new Map())

  return (
    <TorsoChart
      productType="neurotoxin" // or 'filler'
      gender="female" // or 'male'
      injectionPoints={injectionPoints}
      onInjectionPointsChange={setInjectionPoints}
      selectedProductId="prod-botox" // Optional: ID of the selected product
      readOnly={false} // Optional: Set to true to disable editing
    />
  )
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `productType` | `'neurotoxin' \| 'filler'` | Yes | Type of product being charted |
| `gender` | `'male' \| 'female'` | Yes | Patient gender for display |
| `injectionPoints` | `Map<string, InjectionPoint>` | Yes | Map of zone IDs to injection points |
| `onInjectionPointsChange` | `(points: Map<string, InjectionPoint>) => void` | Yes | Callback when injection points change |
| `freehandPoints` | `Map<string, FreehandPoint>` | No | Map of freehand injection points (future feature) |
| `onFreehandPointsChange` | `(points: Map<string, FreehandPoint>) => void` | No | Callback when freehand points change |
| `selectedProductId` | `string` | No | ID of the currently selected product preset |
| `readOnly` | `boolean` | No | If true, disables all editing interactions. Default: `false` |

## Zone IDs

The following zone IDs are available for body/torso treatments:

### Chest/Pectoral
- `zone-chest-upper` - Upper chest area
- `zone-chest-left` - Left pectoral
- `zone-chest-right` - Right pectoral

### Abdomen
- `zone-abdomen-upper` - Upper abdomen
- `zone-abdomen-mid` - Mid abdomen
- `zone-abdomen-lower` - Lower abdomen

### Flanks (Sides)
- `zone-flank-left-upper` - Left upper flank
- `zone-flank-left-mid` - Left mid flank
- `zone-flank-left-lower` - Left lower flank
- `zone-flank-right-upper` - Right upper flank
- `zone-flank-right-mid` - Right mid flank
- `zone-flank-right-lower` - Right lower flank

### Back (for future back view)
- `zone-back-upper` - Upper back
- `zone-back-mid` - Mid back
- `zone-back-lower` - Lower back

## Interaction Patterns

### Single Tap Mode (Default)
1. Tap an empty zone to add an injection point with smart defaults
2. Tap an existing injection point to open quick edit popover
3. Use quick edit to adjust units/volume or remove the point

### Multi-Select Mode
1. Click "Multi-Select" button in the toolbar
2. Tap multiple zones to select them (they will highlight and animate)
3. Use the batch panel at the bottom to set units/volume for all selected zones
4. Click "Apply to Selected Zones" to apply the values

### Quick Edit Features
- Increment/decrement buttons (±5 units or ±0.1ml)
- Direct number input
- Quick preset buttons for common values
- Remove point button

## Styling

The component uses Tailwind CSS and matches the styling of InteractiveFaceChart:
- Purple theme for neurotoxins
- Pink theme for fillers
- Gray tones for neutral UI elements
- Animated rings for selected/active zones
- Touch-optimized hit targets (44x44px minimum)

## Integration with ChartingSettingsContext

The component automatically:
- Fetches active body zones from `ChartingSettingsContext`
- Uses zone default values (units, depth, technique, gauge)
- Filters to only show `category: 'body'` zones
- Applies product-specific settings

## Future Enhancements

- [ ] Back view toggle
- [ ] Freehand mode (tap anywhere to place custom points)
- [ ] Zone highlighting on hover with anatomical names
- [ ] Export/import of treatment maps
- [ ] Integration with before/after photos
- [ ] Voice input for quick charting
- [ ] Undo/redo history

## Notes

- Requires `ChartingSettingsContext` to be available in the component tree
- Zone positions are defined as percentages for responsive scaling
- Haptic feedback requires a compatible mobile device
- The component is fully touch-optimized for tablet charting workflows
