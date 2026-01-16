# Keyboard Shortcuts Update for InteractiveFaceChart.tsx

## Summary
Enhanced keyboard shortcuts for speed charting in the Interactive Face Chart component.

## Changes Made

### New Speed Charting Shortcuts
Add these shortcuts after the zone point shortcuts and before the global shortcuts in the `handleKeyDown` function:

```typescript
// Speed charting shortcuts (multi-select mode)
switch (e.key.toLowerCase()) {
  case 'm':
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      toggleSelectionMode()
    }
    break
  case 'v':
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      if (voiceInput.isListening) {
        stopVoiceInput()
      } else {
        startVoiceInput()
      }
    }
    break
  case 'enter':
    if (selectionMode === 'multi' && (multiSelectedZones.size > 0 || multiSelectedFreehand.size > 0)) {
      e.preventDefault()
      applyBatchUnits()
    }
    break
  case 'escape':
    if (selectionMode === 'multi') {
      e.preventDefault()
      setMultiSelectedZones(new Set())
      setMultiSelectedFreehand(new Set())
      setSelectionMode('single')
      setShowBatchPanel(false)
    }
    break
}

// Number keys for quick batch unit setting (1-9)
if (selectionMode === 'multi' && !e.ctrlKey && !e.metaKey && !e.altKey) {
  const num = parseInt(e.key)
  if (num >= 1 && num <= 9) {
    e.preventDefault()
    // For neurotoxins: 1=5, 2=10, 3=15, 4=20, 5=25, 6=30, 7=35, 8=40, 9=45
    // For fillers: 1=0.1, 2=0.2, 3=0.3, 4=0.4, 5=0.5, 6=0.6, 7=0.7, 8=0.8, 9=0.9
    const quickValue = productType === 'neurotoxin' ? num * 5 : num / 10
    setBatchUnits(quickValue)
    toast.success(`Batch units set to ${quickValue}${productType === 'neurotoxin' ? 'u' : 'ml'}`, {
      duration: 1500,
      icon: '⚡'
    })
  }
}
```

### Updated Dependencies
Update the useEffect dependency array to include:
```typescript
}, [
  selectedZone,
  selectedFreehandPoint,
  injectionPoints,
  freehandPoints,
  productType,
  quickAdjustUnits,
  quickAdjustFreehandUnits,
  removeInjectionPoint,
  removeFreehandPoint,
  onSave,
  copyLastTreatment,
  readOnly,
  // NEW DEPENDENCIES:
  selectionMode,
  multiSelectedZones,
  multiSelectedFreehand,
  voiceInput.isListening,
  toggleSelectionMode,
  startVoiceInput,
  stopVoiceInput,
  applyBatchUnits,
  setBatchUnits
])
```

### Update Keyboard Help Section
Update the keyboard help display (around line 1076-1085) to include new shortcuts:

```typescript
{showKeyboardHelp && (
  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs">
    <div className="flex flex-wrap gap-4">
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">↑</kbd> +5 units</span>
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">↓</kbd> -5 units</span>
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Del</kbd> Remove</span>
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Esc</kbd> Deselect</span>
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">⌘S</kbd> Save</span>
      <span><kbd className="px-1.5 py-0.5 bg-gray-200 rounded">⌘D</kbd> Copy Last</span>
      {/* NEW SHORTCUTS */}
      <span className="text-purple-600 font-medium">Speed Mode:</span>
      <span><kbd className="px-1.5 py-0.5 bg-purple-100 rounded">M</kbd> Multi-select</span>
      <span><kbd className="px-1.5 py-0.5 bg-purple-100 rounded">V</kbd> Voice</span>
      <span><kbd className="px-1.5 py-0.5 bg-purple-100 rounded">1-9</kbd> Quick units</span>
      <span><kbd className="px-1.5 py-0.5 bg-purple-100 rounded">Enter</kbd> Apply batch</span>
    </div>
  </div>
)}
```

## Keyboard Shortcuts Added

| Key | Function | Description |
|-----|----------|-------------|
| `M` | Toggle multi-select mode | Enter/exit speed charting mode |
| `V` | Toggle voice input | Start/stop voice recognition for batch units |
| `Enter` | Apply batch units | When in multi-select with selections |
| `Escape` | Clear & exit multi-select | Clears selections and returns to single mode |
| `1-9` | Quick set batch units | Number keys set batch values (neurotoxin: 5-45u, filler: 0.1-0.9ml) |

## Location in File
- Insert the new keyboard handling code at approximately line 933 (after zone shortcuts, before global shortcuts)
- Update the useEffect dependencies at approximately line 957
- Update the keyboard help UI at approximately line 1076-1085

## Testing
1. Press `M` to enter multi-select mode
2. Click zones to select multiple
3. Press `3` to set 15 units (neurotoxin) or 0.3ml (filler)
4. Press `Enter` to apply to all selected zones
5. Press `Esc` to clear selections and exit multi-select mode
6. Press `V` to test voice input toggle
