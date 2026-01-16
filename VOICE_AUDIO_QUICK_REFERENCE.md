# Voice & Audio Features - Quick Reference Card

## Voice Commands Supported

### Decimal Numbers
```
"point two"           → 0.2
"point five"          → 0.5
"zero point one"      → 0.1
```

### Fractions
```
"half"                → 0.5
"quarter"             → 0.25
"third"               → 0.33
"half a unit"         → 0.5
```

### Complex Numbers
```
"two and a half"      → 2.5
"five and a half"     → 5.5
```

### Quantity Phrases
```
"five units each"     → 5
"ten units each"      → 10
```

### Action Commands
```
"apply"   → Apply batch units
"done"    → Apply batch units
"clear"   → Clear selections
"cancel"  → Clear selections
```

### Original Patterns
```
"five units"          → 5
"ten"                 → 10
"0.2"                 → 0.2
```

---

## Audio Feedback Events

| Event | Audio Response |
|-------|----------------|
| Select zone | "Glabella" (zone name) |
| Apply batch | "5 units applied to 3 zones" |
| Voice parsed | "Got it, 0.2 units" |
| Total update | "Total: 15 units" |

---

## Implementation Checklist

### 1. Voice Parsing (Line ~688)
- [ ] Replace `parseVoiceCommand` function with enhanced version
- [ ] Verify all dependencies in useCallback array
- [ ] Test voice patterns

### 2. Transcript UI (Line ~1078)
- [ ] Verify listening indicator displays
- [ ] Verify error indicator displays
- [ ] Check Mic/MicOff icons imported

### 3. Audio Feedback
- [ ] Add `Volume2`, `VolumeX` imports
- [ ] Add `audioFeedback` state
- [ ] Add `speak` helper function (Line ~326)
- [ ] Integrate into `handleMultiSelectZone`
- [ ] Integrate into `applyBatchUnits`
- [ ] Integrate into `parseVoiceCommand`
- [ ] Add totals announcement useEffect
- [ ] Add toggle button in toolbar

---

## Code Locations

| Feature | File | Line |
|---------|------|------|
| Voice parsing | InteractiveFaceChart.tsx | ~688 |
| Transcript UI | InteractiveFaceChart.tsx | ~1078 |
| Audio state | InteractiveFaceChart.tsx | ~240 |
| Speak helper | InteractiveFaceChart.tsx | ~326 |
| Audio toggle | InteractiveFaceChart.tsx | ~977-1018 |

---

## Key Functions

### parseVoiceCommand (Enhanced)
```typescript
const parseVoiceCommand = useCallback((transcript: string) => {
  const normalized = transcript.toLowerCase().trim()

  // 1. Check action commands
  // 2. Check "X and a half" pattern
  // 3. Check "half a unit" pattern
  // 4. Check fraction words
  // 5. Check numeric pattern
  // 6. Check "point X" pattern
  // 7. Check "X units each" pattern
  // 8. Check word numbers
  // 9. Apply or show error
}, [dependencies])
```

### speak (Audio Helper)
```typescript
const speak = useCallback((text: string) => {
  if (!audioFeedback) return
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.2
  utterance.pitch = 1
  utterance.volume = 0.7

  window.speechSynthesis.speak(utterance)
}, [audioFeedback])
```

---

## Testing Commands

### Basic Decimals
```bash
✓ "point two"
✓ "point five"
✓ "zero point one"
```

### Fractions
```bash
✓ "half a unit"
✓ "quarter"
✓ "half"
```

### Complex
```bash
✓ "two and a half"
✓ "five and a half"
```

### Actions
```bash
✓ "apply"
✓ "clear"
```

---

## Browser Support

| Browser | Voice | Audio | Notes |
|---------|-------|-------|-------|
| Chrome 90+ | ✅ | ✅ | Recommended |
| Edge 90+ | ✅ | ✅ | Recommended |
| Safari 14.1+ | ✅ | ✅ | Limited voice API |
| Firefox | ❌ | ✅ | No voice recognition |

---

## Troubleshooting

### Voice not working
1. Check microphone permission
2. Use Chrome or Edge
3. Check browser console for errors

### Audio not working
1. Check speaker/volume
2. Verify toggle is ON (green)
3. Check browser speech synthesis support

### "Couldn't parse" error
- Rephrase command
- Try exact pattern from list above
- Check microphone clarity

---

## Performance Tips

- Voice patterns checked in order of frequency
- Audio rate 1.2x for faster response
- 1-second delay on totals to avoid overlap
- Speech cancelled before new utterance

---

**Quick Start:** Replace `parseVoiceCommand` → Add audio state & helper → Add toggle button → Test

**Time to Implement:** 15-20 minutes
**Time to Test:** 10 minutes
**Total:** ~30 minutes
