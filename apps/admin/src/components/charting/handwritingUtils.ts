// =============================================================================
// HANDWRITING INPUT UTILITIES
// =============================================================================

/**
 * Detect if device supports Apple Scribble (iPad with iPadOS 14+)
 */
export function detectScribbleSupport(): boolean {
  if (typeof window === 'undefined') return false

  const ua = navigator.userAgent
  const isIPad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  // Scribble was introduced in iPadOS 14
  const iosVersion = ua.match(/OS (\d+)_/)
  const majorVersion = iosVersion ? parseInt(iosVersion[1], 10) : 0

  return isIPad && majorVersion >= 14
}

/**
 * Parse handwritten input with common OCR error corrections
 * Handles: digits, decimals, fractions, and common mistakes
 */
export function parseHandwrittenInput(text: string): number | null {
  if (!text || text.trim() === '') return null

  let cleaned = text.trim().toLowerCase()

  // Handle common OCR mistakes
  cleaned = cleaned
    .replace(/o/gi, '0')  // Letter O → Zero
    .replace(/l/gi, '1')  // Letter l → One
    .replace(/s/gi, '5')  // Letter S → Five
    .replace(/z/gi, '2')  // Letter Z → Two
    .replace(/[,\s]/g, '.') // Comma or space → decimal point

  // Handle fractions
  const fractionMatch = cleaned.match(/^(\d+)\/(\d+)$/)
  if (fractionMatch) {
    const numerator = parseFloat(fractionMatch[1])
    const denominator = parseFloat(fractionMatch[2])
    if (denominator !== 0) {
      return numerator / denominator
    }
  }

  // Handle decimals without leading zero: ".2" → "0.2"
  if (cleaned.startsWith('.')) {
    cleaned = '0' + cleaned
  }

  // Try to parse as number
  const parsed = parseFloat(cleaned)
  if (!isNaN(parsed) && isFinite(parsed)) {
    return parsed
  }

  // TODO: Integrate Gemini for fuzzy handwriting interpretation
  // e.g., "pt two" → 0.2, "half" → 0.5, "point five" → 0.5
  // This would allow natural language input like "two units" → 2

  return null
}
