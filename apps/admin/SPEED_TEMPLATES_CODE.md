# Speed Templates - Code Changes for InteractiveFaceChart.tsx

## STEP 1: Add Speed Templates Constant (after line 185, after QUICK_VOLUME_PRESETS)

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

## STEP 2: Add Handler Function (after applyBatchUnits function, around line 625)

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

## STEP 3: Add Speed Templates UI Panel

### Option A: Add in Right Panel (around line 1489, before Empty State)

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

### Option B: Add as Toolbar Button Toggle (in the top toolbar around line 982)

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
  {selectionMode === 'multi' ? 'Speed Mode' : 'Speed Mode OFF'}
</button>
```

## STEP 4: Add Multi-Select Mode Indicator in Face Chart

Add visual indicator when in multi-select mode (around line 1100, in the zone rendering loop):

```typescript
// Inside the zone rendering - add multi-select ring
const isMultiSelected = selectionMode === 'multi' && multiSelectedZones.has(zone.id)

// Update the className for the visual point
className={`
  relative w-5 h-5 rounded-full transition-all duration-200
  ${isMultiSelected
    ? 'bg-purple-600 ring-4 ring-purple-400 scale-125'
    : hasInjection
      ? /* ...existing code */
      : /* ...existing code */
  }
`}
```

## Usage

1. User clicks "Speed Mode" or enters multi-select mode
2. Quick template buttons appear in right panel
3. User taps a template button (e.g., "Forehead 5×5")
4. Zones are pre-selected with default units
5. User can adjust units or tap "Apply"
6. Or user can speak the units with voice input
