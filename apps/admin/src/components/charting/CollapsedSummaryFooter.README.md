# CollapsedSummaryFooter Component

A minimal footer component that displays treatment totals in a collapsed state with the ability to expand for full details.

## Location
`/src/components/charting/CollapsedSummaryFooter.tsx`

## Features

- **Collapsed State**: Single line showing treatment summary (e.g., "12u Botox | 2ml Juvederm | $560")
- **Expandable**: Tap to expand and see full treatment breakdown
- **Fixed Positioning**: Stays at the bottom of the screen (44px collapsed height)
- **Smooth Animations**: Slide-in animation when expanding
- **Product Type Colors**: Purple theme for neurotoxins, pink theme for fillers
- **Responsive**: Works on all screen sizes

## Props

```typescript
interface TreatmentSummary {
  productName: string           // e.g., "Botox", "Juvederm"
  productType: 'neurotoxin' | 'filler'
  totalUnits?: number           // For neurotoxins
  totalVolume?: number          // For fillers (in ml)
  totalCost: number             // Cost in dollars
}

interface CollapsedSummaryFooterProps {
  treatments: TreatmentSummary[]
  isExpanded: boolean
  onToggleExpanded: () => void
}
```

## Usage

### Basic Implementation

```tsx
import { CollapsedSummaryFooter } from '@/components/charting/CollapsedSummaryFooter'
import { useState } from 'react'

function ChartingPage() {
  const [isFooterExpanded, setIsFooterExpanded] = useState(false)

  const treatments = [
    {
      productName: 'Botox',
      productType: 'neurotoxin',
      totalUnits: 12,
      totalCost: 168
    },
    {
      productName: 'Juvederm',
      productType: 'filler',
      totalVolume: 2.0,
      totalCost: 1300
    }
  ]

  return (
    <div className="pb-24"> {/* Add padding to prevent overlap */}
      {/* Your page content */}

      <CollapsedSummaryFooter
        treatments={treatments}
        isExpanded={isFooterExpanded}
        onToggleExpanded={() => setIsFooterExpanded(!isFooterExpanded)}
      />
    </div>
  )
}
```

### Integration with Injection Points

```tsx
const treatments = useMemo(() => {
  const treatmentMap = new Map<string, TreatmentSummary>()

  injectionPoints.forEach((point) => {
    const product = getProductById(point.productId)
    if (!product) return

    const existing = treatmentMap.get(product.id) || {
      productName: product.name,
      productType: product.type,
      totalUnits: 0,
      totalVolume: 0,
      totalCost: 0
    }

    if (product.type === 'neurotoxin') {
      existing.totalUnits! += point.units || 0
      existing.totalCost += (point.units || 0) * product.unitPrice
    } else {
      existing.totalVolume! += point.volume || 0
      existing.totalCost += (point.volume || 0) * product.unitPrice
    }

    treatmentMap.set(product.id, existing)
  })

  return Array.from(treatmentMap.values())
}, [injectionPoints])
```

## Visual States

### Collapsed (Default)
```
┌─────────────────────────────────────────────┐
│ 💉  12u Botox | 2ml Juvederm | $1,468   ⌃  │
└─────────────────────────────────────────────┘
```
Height: 44px

### Expanded
```
┌─────────────────────────────────────────────┐
│ 💉  Treatment Summary                    ⌄  │
├─────────────────────────────────────────────┤
│ ● Botox (Neurotoxin)               12u      │
│                                    $168.00   │
│                                              │
│ ● Juvederm (Dermal Filler)         2.0ml    │
│                                    $1,300.00 │
│                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 💲 Total Treatment Cost                     │
│    12u + 2.0ml                    $1,468.00 │
└─────────────────────────────────────────────┘
```
Height: Dynamic (max-height: 256px with scroll)

## Styling

The component uses:
- **Purple colors** (`bg-purple-50`, `text-purple-600`) for neurotoxin products
- **Pink colors** (`bg-pink-50`, `text-pink-600`) for filler products
- **Gradient backgrounds** for headers and totals
- **Fixed positioning** at the bottom of the screen
- **Z-index 50** to stay above most content

## Important Notes

1. **Page Padding**: Add `pb-24` (or similar) to your page content wrapper to prevent the footer from overlapping content:
   ```tsx
   <div className="pb-24">
     {/* Content */}
   </div>
   ```

2. **Empty State**: The component returns `null` if no treatments are provided.

3. **Animations**: Uses Tailwind's `animate-in` utility for smooth slide-in effects.

4. **Accessibility**: The toggle button is keyboard accessible and uses semantic HTML.

5. **Responsiveness**: The component is responsive but designed primarily for tablet/desktop charting workflows.

## Example File

See `CollapsedSummaryFooter.example.tsx` for a complete working example with mock data.

## Related Components

- **TotalsPanel.tsx** - Alternative totals display (floating panel on the right)
- **EnhancedChartingView.tsx** - Main charting interface
- **InjectableBilling.tsx** - Full billing interface for treatments

## Future Enhancements

Potential improvements:
- Quick actions (add payment, print, etc.)
- Treatment history toggle
- Quick edit mode
- Print/export summary
- Estimated time to complete
