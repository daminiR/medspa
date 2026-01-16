# Voice Parser Enhancement Guide

## Overview
This guide explains how to enhance the `parseVoiceCommand` function in `InteractiveFaceChart.tsx` to support more natural speech patterns for voice input.

## File Location
`/Users/daminirijhwani/medical-spa-platform/apps/admin/src/components/charting/InteractiveFaceChart.tsx`

## Changes Required

### 1. Stop the Next.js Dev Server (if running)
The file is being watched by Next.js dev server. To make edits:
```bash
# Find and stop the dev server
ps aux | grep "next dev" | grep -v grep
# Or just Ctrl+C in the terminal running `npm run dev`
```

### 2. Locate the Function
Find the `parseVoiceCommand` function (around line 684-748)

### 3. Replace the Entire Function
Replace the existing `parseVoiceCommand` useCallback with the enhanced version below.

## Enhanced parseVoiceCommand Function

```typescript
  // Parse voice command for units/volume with natural speech patterns
  const parseVoiceCommand = useCallback((transcript: string) => {
    // Normalize transcript
    const normalized = transcript.toLowerCase().trim()

    // Check for action commands first
    if (normalized.includes('apply') || normalized.includes('done')) {
      applyBatchUnits()
      return
    }
    if (normalized.includes('clear') || normalized.includes('cancel')) {
      setMultiSelectedZones(new Set())
      setMultiSelectedFreehand(new Set())
      setShowBatchPanel(false)
      toast.success('Cleared selections', { duration: 1500 })
      return
    }

    // Word to number mapping
    const wordToNum: Record<string, number> = {
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'fifteen': 15, 'twenty': 20, 'twenty-five': 25, 'twentyfive': 25,
      'thirty': 30, 'forty': 40, 'fifty': 50
    }

    // Fraction words mapping
    const fractionWords: Record<string, number> = {
      'half': 0.5,
      'quarter': 0.25,
      'third': 0.33
    }

    let value: number | null = null

    // Check for "X and a half" pattern (e.g., "two and a half" = 2.5)
    const andAHalfMatch = normalized.match(/(one|two|three|four|five|six|seven|eight|nine|ten)\s+and\s+a\s+half/i)
    if (andAHalfMatch) {
      const base = wordToNum[andAHalfMatch[1].toLowerCase()]
      if (base !== undefined) {
        value = base + 0.5
      }
    }

    // Check for "half a unit" pattern
    if (!value && normalized.match(/half\s+a\s+(unit|ml)/i)) {
      value = 0.5
    }

    // Check for fraction words alone (e.g., "quarter" = 0.25, "half" = 0.5)
    if (!value) {
      for (const [word, num] of Object.entries(fractionWords)) {
        if (normalized === word || normalized === `${word} unit` || normalized === `${word} units`) {
          value = num
          break
        }
      }
    }

    // Try numeric pattern first (e.g., "0.2", "5", "10.5")
    if (!value) {
      const numMatch = normalized.match(/(\d+\.?\d*)\s*(units?|ml)?/i)
      if (numMatch) {
        value = parseFloat(numMatch[1])
      }
    }

    // Try "point X" pattern (e.g., "point two" = 0.2, "zero point one" = 0.1)
    if (!value) {
      // "zero point X" or just "point X"
      const pointMatch = normalized.match(/(zero\s+)?point\s+(\w+)/i)
      if (pointMatch) {
        const afterPoint = wordToNum[pointMatch[2]] || parseInt(pointMatch[2])
        if (afterPoint !== undefined) {
          value = afterPoint / 10 // "point two" = 0.2, "point five" = 0.5
        }
      }
    }

    // Try "X units each" pattern (e.g., "five units each" = 5)
    if (!value) {
      const eachMatch = normalized.match(/(one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|forty|fifty|\d+)\s+units?\s+each/i)
      if (eachMatch) {
        const num = wordToNum[eachMatch[1]] || parseInt(eachMatch[1])
        if (num !== undefined) {
          value = num
        }
      }
    }

    // Try word numbers (e.g., "five", "ten", "twenty")
    if (!value) {
      for (const [word, num] of Object.entries(wordToNum)) {
        if (normalized.includes(word)) {
          value = num
          break
        }
      }
    }

    if (value !== null && value > 0) {
      setBatchUnits(value)
      toast.success(`Set to ${value} ${productType === 'neurotoxin' ? 'units' : 'ml'}`, {
        duration: 2000,
        icon: '🎤'
      })

      // If we have selections, auto-apply
      if (multiSelectedZones.size > 0 || multiSelectedFreehand.size > 0) {
        // Small delay so user sees the value before applying
        setTimeout(() => {
          applyBatchUnits()
        }, 500)
      }
    } else {
      toast.error(`Couldn't parse: "${transcript}"`, { duration: 2000 })
    }
  }, [productType, multiSelectedZones, multiSelectedFreehand, applyBatchUnits, setMultiSelectedZones, setMultiSelectedFreehand, setShowBatchPanel])
```

## Key Changes

### 1. **Added Action Commands** (Lines 7-17)
- "apply" or "done" → triggers `applyBatchUnits()`
- "clear" or "cancel" → clears all selections

### 2. **Added Fraction Words Support** (Lines 27-31)
```typescript
const fractionWords: Record<string, number> = {
  'half': 0.5,
  'quarter': 0.25,
  'third': 0.33
}
```

### 3. **Added "X and a half" Pattern** (Lines 35-42)
- "two and a half" → 2.5
- "five and a half" → 5.5

### 4. **Added "half a unit" Pattern** (Lines 44-47)
- "half a unit" → 0.5
- "half a ml" → 0.5

### 5. **Enhanced Fraction Words Recognition** (Lines 49-57)
- "quarter" → 0.25
- "half" → 0.5
- "third" → 0.33

### 6. **Enhanced "point X" Pattern** (Lines 67-76)
- Now handles "zero point one" → 0.1
- "point two" → 0.2
- "point five" → 0.5

### 7. **Added "X units each" Pattern** (Lines 78-86)
- "five units each" → 5
- "ten units each" → 10

### 8. **Updated Dependencies Array** (Line 119)
Added new dependencies:
- `setMultiSelectedZones`
- `setMultiSelectedFreehand`
- `setShowBatchPanel`

## Supported Voice Commands

### Numbers
- "point two" → 0.2
- "point five" → 0.5
- "zero point one" → 0.1
- "five units" → 5
- "ten units" → 10
- "0.2" → 0.2

### Fractions
- "half a unit" → 0.5
- "quarter" → 0.25
- "half" → 0.5
- "third" → 0.33

### Complex Patterns
- "two and a half" → 2.5
- "five and a half" → 5.5
- "five units each" → 5

### Actions
- "apply" or "done" → triggers batch apply
- "clear" or "cancel" → clears all selections

## Testing

After making the changes:

1. Restart the dev server:
```bash
npm run dev
```

2. Navigate to the charting page

3. Enter multi-select mode

4. Select multiple zones

5. Click the microphone icon

6. Try these voice commands:
   - "point two"
   - "half a unit"
   - "two and a half"
   - "ten units each"
   - "apply"
   - "clear"

## Notes

- The file has a Next.js dev server watching it, which auto-recompiles on changes
- Make sure to test all patterns after implementation
- The function is case-insensitive (everything is normalized to lowercase)
- Patterns are checked in priority order (action commands first, then specific patterns, then generic patterns)

## Files Created

1. `/Users/daminirijhwani/medical-spa-platform/apps/admin/VOICE_PARSER_ENHANCEMENT_GUIDE.md` - This guide
2. `/Users/daminirijhwani/medical-spa-platform/apps/admin/parseVoiceCommand_ENHANCED.ts` - Enhanced function code

## Implementation Steps

1. **STOP** the Next.js dev server (Ctrl+C in terminal)
2. **OPEN** `src/components/charting/InteractiveFaceChart.tsx`
3. **FIND** the `parseVoiceCommand` function (around line 684)
4. **REPLACE** the entire function with the enhanced version above
5. **SAVE** the file
6. **START** the dev server: `npm run dev`
7. **TEST** the new voice commands

---

**Last Updated:** January 7, 2026
