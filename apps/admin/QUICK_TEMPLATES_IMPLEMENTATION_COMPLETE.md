# Quick Treatment Templates - Complete Implementation Guide

## Summary

Added one-tap quick templates for common injection patterns to the InteractiveFaceChart component. This feature allows practitioners to quickly select and apply common treatment patterns like "Forehead 5×5", "Crow's Feet", "11 Lines", and "Masseter" with a single tap.

## Files Modified

**File:** `/Users/daminirijhwani/medical-spa-platform/apps/admin/src/components/charting/InteractiveFaceChart.tsx`

## Changes Required

### 1. Add Speed Templates Constant (After Line 185)

**Location:** After `QUICK_VOLUME_PRESETS` constant, before the `MAIN COMPONENT` comment

**Code to Add:**

```typescript
// Speed templates for one-tap common injection patterns (for speed charting)
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

const SPEED_TEMPLATES: SpeedTemplate[] = [
  {
    id: 'forehead-5x5',
    name: 'Forehead 5×5',
    emoji: '👁',
    zones: ['zone-forehead'],
    defaultUnits: 5,
    description: '5 units per point',
    type: 'neurotoxin'
  },
  {
    id: 'crows-feet',
    name: "Crow's Feet",
    emoji: '🦶',
    zones: ['zone-crows-l', 'zone-crows-r'],
    defaultUnits: 12,
    description: 'Both sides',
    type: 'neurotoxin'
  },
  {
    id: 'glabella',
    name: '11 Lines',
    emoji: '🔷',
    zones: ['zone-glabella'],
    defaultUnits: 20,
    description: 'Glabella area',
    type: 'neurotoxin'
  },
  {
    id: 'masseter',
    name: 'Masseter',
    emoji: '💪',
    zones: ['zone-masseter-l', 'zone-masseter-r'],
    defaultUnits: 25,
    description: 'Both sides',
    type: 'neurotoxin'
  },
  {
    id: 'full-upper-face',
    name: 'Full Upper Face',
    emoji: '✨',
    zones: ['zone-forehead', 'zone-glabella', 'zone-crows-l', 'zone-crows-r'],
    defaultUnits: 10,
    description: 'Forehead, glabella, crows feet',
    type: 'neurotoxin'
  },
  {
    id: 'lip-enhancement',
    name: 'Lip Enhancement',
    emoji: '💋',
    zones: ['zone-lip-upper', 'zone-lip-lower'],
    defaultVolume: 0.5,
    defaultUnits: 0.5,
    description: 'Both lips',
    type: 'filler'
  },
  {
    id: 'cheek-augmentation',
    name: 'Cheek Augmentation',
    emoji: '✨',
    zones: ['zone-cheek-l', 'zone-cheek-r'],
    defaultVolume: 1.0,
    defaultUnits: 1.0,
    description: 'Both cheeks',
    type: 'filler'
  }
]
```

### 2. Add Handler Function (After Line 624, After `applyBatchUnits` Function)

**Location:** In the "MULTI-SELECT MODE HANDLERS" section, after the `applyBatchUnits` callback

**Code to Add:**

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

  // Auto-switch to multi-select mode if not already
  if (selectionMode !== 'multi') {
    setSelectionMode('multi')
  }

  // Provide feedback
  toast.success(`Selected ${template.name}`, { duration: 1500, icon: template.emoji })
}, [productType, selectionMode])
```

### 3. Add Speed Templates UI Panel (In Right Panel, Before Empty State)

**Location:** Around line 1489, after the "Quick Edit Panel" sections and before the "Empty State" section

**Code to Add:**

```typescript
{/* Speed Templates Panel (when in multi-select mode or batch panel shown) */}
{(selectionMode === 'multi' || showBatchPanel) && (
  <div className={`rounded-xl border-2 overflow-hidden ${
    productType === 'neurotoxin'
      ? 'border-purple-200 bg-white'
      : 'border-pink-200 bg-white'
  }`}>
    {/* Header */}
    <div className={`px-4 py-3 ${productType === 'neurotoxin' ? 'bg-purple-100' : 'bg-pink-100'}`}>
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <Zap className="w-4 h-4" />
        Quick Templates
      </h4>
      <p className="text-xs text-gray-600 mt-0.5">One-tap common patterns</p>
    </div>

    {/* Template Buttons */}
    <div className="p-4">
      <div className="grid grid-cols-2 gap-2">
        {SPEED_TEMPLATES
          .filter(t => t.type === productType || t.type === 'both')
          .map(template => (
            <button
              key={template.id}
              onClick={() => applySpeedTemplate(template)}
              className={`px-3 py-2.5 text-left rounded-lg border-2 transition-all ${
                multiSelectedZones.size > 0 &&
                template.zones.every(z => multiSelectedZones.has(z)) &&
                template.zones.length === multiSelectedZones.size
                  ? (productType === 'neurotoxin'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-pink-500 bg-pink-50')
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{template.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {template.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {template.description}
                  </p>
                  <p className={`text-xs font-medium mt-1 ${
                    productType === 'neurotoxin' ? 'text-purple-600' : 'text-pink-600'
                  }`}>
                    {productType === 'neurotoxin' ? template.defaultUnits : template.defaultVolume}
                    {productType === 'neurotoxin' ? 'u' : 'ml'}
                  </p>
                </div>
              </div>
            </button>
          ))}
      </div>

      {/* Batch Control Panel */}
      {multiSelectedZones.size > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Selected: {multiSelectedZones.size} zone{multiSelectedZones.size !== 1 ? 's' : ''}
          </p>

          {/* Units/Volume Input */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              value={batchUnits}
              onChange={(e) => setBatchUnits(parseFloat(e.target.value) || 0)}
              step={productType === 'neurotoxin' ? 5 : 0.1}
              min={0}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={productType === 'neurotoxin' ? 'Units' : 'Volume (ml)'}
            />
            <span className="text-xs text-gray-500 font-medium">
              {productType === 'neurotoxin' ? 'units' : 'ml'}
            </span>
          </div>

          {/* Apply Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={applyBatchUnits}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                productType === 'neurotoxin'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-pink-600 hover:bg-pink-700'
              }`}
            >
              <Check className="w-4 h-4 inline mr-1.5" />
              Apply to {multiSelectedZones.size} Zone{multiSelectedZones.size !== 1 ? 's' : ''}
            </button>

            {/* Voice Input Button */}
            <button
              onClick={voiceInput.isListening ? stopVoiceInput : startVoiceInput}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                voiceInput.isListening
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
              title={voiceInput.isListening ? 'Stop listening' : 'Voice input'}
            >
              {voiceInput.isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Voice Input Transcript */}
          {voiceInput.isListening && voiceInput.transcript && (
            <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                Heard: "{voiceInput.transcript}"
              </p>
            </div>
          )}

          {/* Clear Selection */}
          <button
            onClick={() => {
              setMultiSelectedZones(new Set())
              setShowBatchPanel(false)
            }}
            className="w-full mt-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  </div>
)}
```

### 4. OPTIONAL: Add Speed Mode Toggle Button in Toolbar

**Location:** In the toolbar section (around line 982), add after the "Templates" button

**Code to Add:**

```typescript
{/* Speed Mode Toggle */}
<button
  onClick={toggleSelectionMode}
  className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1.5 transition-colors ${
    selectionMode === 'multi'
      ? 'bg-purple-600 text-white'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  }`}
  title="Toggle speed charting mode"
>
  <Zap className="w-4 h-4" />
  {selectionMode === 'multi' ? 'Speed ON' : 'Speed Mode'}
</button>
```

## How It Works

### User Flow:

1. **Activate Speed Mode**
   - User either taps zones manually to enter multi-select mode, or
   - User clicks the "Speed Mode" button in the toolbar (optional enhancement)

2. **Quick Templates Panel Appears**
   - Panel shows in the right sidebar
   - Displays template buttons filtered by product type (neurotoxin vs filler)
   - Each button shows emoji, name, description, and default units

3. **One-Tap Template Application**
   - User taps a template button (e.g., "Forehead 5×5")
   - System pre-selects the relevant zones
   - Sets the default units/volume
   - Shows batch control panel

4. **Adjust & Apply**
   - User can adjust units via input field
   - Or use voice input to speak the dosage
   - Tap "Apply" button to create injection points
   - Or tap another template to change selection

5. **Visual Feedback**
   - Selected zones show purple/pink highlight on face chart
   - Active template button highlights
   - Toast notifications for user actions

### Features:

- **Neurotoxin Templates:**
  - Forehead 5×5 (5 units, 1 zone)
  - Crow's Feet (12 units, 2 zones)
  - 11 Lines / Glabella (20 units, 1 zone)
  - Masseter (25 units, 2 zones)
  - Full Upper Face (10 units, 4 zones)

- **Filler Templates:**
  - Lip Enhancement (0.5ml, 2 zones)
  - Cheek Augmentation (1.0ml, 2 zones)

- **Integration:**
  - Works with existing multi-select mode
  - Compatible with voice input
  - Uses existing batch apply functionality
  - Maintains all existing features (templates, keyboard shortcuts, etc.)

## Testing

1. Open charting page with neurotoxin treatment
2. Speed panel should NOT show initially
3. Click a zone to enter multi-select mode
4. Speed Templates panel appears in right sidebar
5. Click "Forehead 5×5" template
6. Forehead zone should be selected (purple highlight)
7. Batch panel shows "Selected: 1 zone" with 5 units
8. Adjust units to 10
9. Click "Apply to 1 Zone"
10. Injection point created with 10 units
11. Try "Crow's Feet" template
12. Both crow's feet zones selected with 12 units
13. Test voice input button
14. Speak "fifteen units"
15. Units should update to 15
16. Apply and verify

## Benefits

- **Speed:** One tap vs. multiple clicks per zone
- **Consistency:** Pre-defined patterns ensure consistent treatments
- **Flexibility:** Can still adjust units before applying
- **Voice Compatible:** Works with existing voice input feature
- **Safe:** Uses existing validated batch apply logic
- **Intuitive:** Clear visual feedback and familiar UI patterns

## Notes

- Templates are filtered by product type automatically
- Templates auto-enable multi-select mode if needed
- Panel only shows when relevant (multi-select or batch mode active)
- Existing keyboard shortcuts still work
- Compatible with freehand mode
- Works with existing template system
