# Speed Templates Implementation Plan

## What I'm Adding

1. **Speed Templates Constant** - After QUICK_VOLUME_PRESETS, add SpeedTemplate interface and SPEED_TEMPLATES array with common patterns like:
   - Forehead 5×5
   - Crow's Feet (both sides)
   - 11 Lines (Glabella)
   - Masseter (both sides)
   - Full Upper Face
   - Lip Enhancement
   - Cheek Augmentation

2. **Handler Function** - Add `applySpeedTemplate` callback that:
   - Pre-selects the zones from the template
   - Sets the default units/volume
   - Opens the batch panel
   - Shows success toast

3. **UI Component** - Add Speed Templates panel that shows when in multi-select mode, displaying:
   - Quick template buttons with emoji + name
   - One-tap application
   - Filtered by product type (neurotoxin vs filler)

## Implementation Location

The component already has:
- `selectionMode` state (single vs multi)
- `multiSelectedZones` state
- `batchUnits` state
- `showBatchPanel` state
- `applyBatchUnits` function

I need to:
1. Add SPEED_TEMPLATES constant after line 183 (after QUICK_VOLUME_PRESETS)
2. Add applySpeedTemplate handler in the multi-select handlers section (around line 604)
3. Add UI rendering after the "Freehand Mode Instructions" section or in the right panel

## Code to Add

### 1. Constants (after line 183)
```typescript
// Speed templates for one-tap common injection patterns
interface SpeedTemplate {
  id: string
  name: string
  emoji: string
  zones: string[]
  defaultUnits: number
  defaultVolume?: number
  description: string
  type: 'neurotoxin' | 'filler' | 'both'
}

const SPEED_TEMPLATES: SpeedTemplate[] = [...]
```

### 2. Handler Function (around line 604, after applyBatchUnits)
```typescript
// Apply speed template - pre-select zones and set default units
const applySpeedTemplate = useCallback((template: SpeedTemplate) => {
  // Pre-select the zones
  setMultiSelectedZones(new Set(template.zones))

  // Set appropriate units/volume
  const value = productType === 'neurotoxin'
    ? template.defaultUnits
    : (template.defaultVolume || template.defaultUnits)
  setBatchUnits(value)

  // Show batch panel
  setShowBatchPanel(true)

  // Provide feedback
  toast.success(`Selected ${template.name}`, { duration: 1500, icon: template.emoji })
}, [productType])
```

### 3. UI Rendering (add in the right panel or as a floating panel)
- Show when `selectionMode === 'multi'` OR when `showBatchPanel`
- Filter templates by productType
- Display as compact buttons with emoji
