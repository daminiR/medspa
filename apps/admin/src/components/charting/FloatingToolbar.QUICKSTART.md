# FloatingToolbar - Quick Start Guide

## 5-Minute Integration

### 1. Import the Component

```tsx
import { FloatingToolbar } from '@/components/charting'
```

### 2. Add State

```tsx
const [selectedProduct, setSelectedProduct] = useState<string>()
const [selectedDosage, setSelectedDosage] = useState<number>()
const [selectedColor, setSelectedColor] = useState('#9333EA')
```

### 3. Render It

```tsx
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
  colorOptions={['#9333EA', '#EC4899', '#EF4444', '#10B981', '#3B82F6', '#F59E0B']}
  selectedColor={selectedColor}
  onColorSelect={setSelectedColor}
/>
```

## Common Configurations

### Neurotoxin (Botox/Dysport)
```tsx
dosageType="units"
dosageOptions={[1, 2, 4, 5, 10, 15, 20, 25]}
```

### Filler (Juvederm/Restylane)
```tsx
dosageType="ml"
dosageOptions={[0.1, 0.2, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0]}
```

### Standard Color Palette
```tsx
colorOptions={[
  '#9333EA', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#84CC16'  // Lime
]}
```

## Props Cheat Sheet

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `products` | `Product[]` | ✅ | - | Array of injectable products |
| `onProductSelect` | `(id: string) => void` | ✅ | - | Product selection handler |
| `dosageType` | `'units' \| 'ml'` | ✅ | - | Type of dosage measurement |
| `dosageOptions` | `number[]` | ✅ | - | Array of dosage quick-picks |
| `onDosageSelect` | `(dosage: number) => void` | ✅ | - | Dosage selection handler |
| `colorOptions` | `string[]` | ✅ | - | Array of hex color codes |
| `onColorSelect` | `(color: string) => void` | ✅ | - | Color selection handler |
| `selectedProductId` | `string` | ❌ | - | Currently selected product |
| `selectedDosage` | `number` | ❌ | - | Currently selected dosage |
| `selectedColor` | `string` | ❌ | - | Currently selected color |
| `autoHideDelay` | `number` | ❌ | `3000` | Auto-hide delay in ms |
| `initialPosition` | `{x, y}` | ❌ | `{x:20, y:100}` | Starting position |
| `onClose` | `() => void` | ❌ | - | Close button handler |

## Product Interface

```typescript
{
  id: string
  name: string
  brand: string
  type: 'neurotoxin' | 'filler' | 'biostimulator' | 'skin-booster'
}
```

## Features

- ✅ **Auto-Hide**: Fades after 3 seconds
- ✅ **Draggable**: Click header to move
- ✅ **Collapsible**: Minimize to header only
- ✅ **Touch-Optimized**: 48px buttons for WCAG AA
- ✅ **Responsive**: Works on mobile, tablet, desktop

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Drag | Reposition toolbar |
| Hover | Show hidden toolbar |
| Click | Select item |

## Tips

1. **Position**: Place in bottom-right for right-handed users
2. **Colors**: Use 6-12 colors for best UX
3. **Dosages**: Provide 8 common values
4. **Products**: Show 2-6 products at once
5. **Auto-Hide**: 3-5 seconds works best

## Troubleshooting

### Toolbar not showing?
- Check that arrays aren't empty
- Verify position is in viewport

### Can't drag?
- Ensure parent has proper pointer-events
- Check for conflicting event listeners

### Auto-hide not working?
- Verify autoHideDelay > 0
- Check browser console for errors

## Full Example

```tsx
'use client'

import { useState } from 'react'
import { FloatingToolbar } from '@/components/charting'

export default function ChartingPage() {
  // State
  const [selectedProduct, setSelectedProduct] = useState<string>()
  const [selectedDosage, setSelectedDosage] = useState<number>()
  const [selectedColor, setSelectedColor] = useState('#9333EA')

  // Products
  const products = [
    { id: 'botox', name: 'Cosmetic', brand: 'Botox', type: 'neurotoxin' as const },
    { id: 'dysport', name: 'Dysport', brand: 'Dysport', type: 'neurotoxin' as const },
    { id: 'juv-ultra', name: 'Ultra Plus', brand: 'Juvederm', type: 'filler' as const },
    { id: 'rest-lyft', name: 'Lyft', brand: 'Restylane', type: 'filler' as const }
  ]

  return (
    <div className="relative">
      {/* Your charting canvas here */}

      <FloatingToolbar
        products={products}
        selectedProductId={selectedProduct}
        onProductSelect={(id) => {
          setSelectedProduct(id)
          console.log('Product selected:', id)
        }}
        dosageType="units"
        dosageOptions={[1, 2, 4, 5, 10, 15, 20, 25]}
        selectedDosage={selectedDosage}
        onDosageSelect={(dosage) => {
          setSelectedDosage(dosage)
          console.log('Dosage selected:', dosage)
        }}
        colorOptions={[
          '#9333EA', '#EC4899', '#EF4444',
          '#F59E0B', '#10B981', '#3B82F6'
        ]}
        selectedColor={selectedColor}
        onColorSelect={(color) => {
          setSelectedColor(color)
          console.log('Color selected:', color)
        }}
        autoHideDelay={3000}
        initialPosition={{ x: 20, y: 100 }}
        onClose={() => console.log('Toolbar closed')}
      />
    </div>
  )
}
```

## Next Steps

1. ✅ Copy the example above
2. ✅ Customize products array
3. ✅ Adjust dosage options
4. ✅ Test on tablet/mobile
5. ✅ Connect to your charting logic

## Documentation

- **Full Docs**: `FloatingToolbar.README.md`
- **Examples**: `FloatingToolbar.example.tsx`
- **Stories**: `FloatingToolbar.stories.tsx`
- **Tests**: `__tests__/FloatingToolbar.test.tsx`
