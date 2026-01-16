import { detectScribbleSupport, parseHandwrittenInput } from '../handwritingUtils'

describe('handwritingUtils', () => {
  describe('parseHandwrittenInput', () => {
    test('handles empty input', () => {
      expect(parseHandwrittenInput('')).toBeNull()
      expect(parseHandwrittenInput('   ')).toBeNull()
    })

    test('handles regular numbers', () => {
      expect(parseHandwrittenInput('5')).toBe(5)
      expect(parseHandwrittenInput('10')).toBe(10)
      expect(parseHandwrittenInput('0.5')).toBe(0.5)
    })

    test('handles OCR mistakes - letter O to zero', () => {
      expect(parseHandwrittenInput('O')).toBe(0)
      expect(parseHandwrittenInput('1O')).toBe(10)
    })

    test('handles OCR mistakes - letter l to one', () => {
      expect(parseHandwrittenInput('l')).toBe(1)
      expect(parseHandwrittenInput('l0')).toBe(10)
    })

    test('handles OCR mistakes - letter S to five', () => {
      expect(parseHandwrittenInput('S')).toBe(5)
      expect(parseHandwrittenInput('1S')).toBe(15)
    })

    test('handles OCR mistakes - letter Z to two', () => {
      expect(parseHandwrittenInput('Z')).toBe(2)
      expect(parseHandwrittenInput('ZO')).toBe(20)
    })

    test('handles decimals without leading zero', () => {
      expect(parseHandwrittenInput('.2')).toBe(0.2)
      expect(parseHandwrittenInput('.5')).toBe(0.5)
    })

    test('handles comma as decimal separator', () => {
      expect(parseHandwrittenInput('0,2')).toBe(0.2)
      expect(parseHandwrittenInput('1,5')).toBe(1.5)
    })

    test('handles fractions', () => {
      expect(parseHandwrittenInput('1/2')).toBe(0.5)
      expect(parseHandwrittenInput('1/4')).toBe(0.25)
      expect(parseHandwrittenInput('3/4')).toBe(0.75)
    })

    test('handles invalid fractions', () => {
      expect(parseHandwrittenInput('1/0')).toBeNull()
    })

    test('handles invalid input', () => {
      expect(parseHandwrittenInput('abc')).toBeNull()
      expect(parseHandwrittenInput('--')).toBeNull()
    })

    test('handles mixed cases', () => {
      expect(parseHandwrittenInput('O.S')).toBe(0.5)
      expect(parseHandwrittenInput('l.Z')).toBe(1.2)
    })
  })

  describe('detectScribbleSupport', () => {
    const originalNavigator = global.navigator
    const originalWindow = global.window

    afterEach(() => {
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true
      })
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true
      })
    })

    test('returns false when window is undefined', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      })
      expect(detectScribbleSupport()).toBe(false)
    })

    test('returns true for iPad with iOS 14+', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'iPad OS 14_0',
          platform: 'iPad',
          maxTouchPoints: 5
        },
        writable: true
      })
      expect(detectScribbleSupport()).toBe(true)
    })

    test('returns false for iPad with iOS 13', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'iPad OS 13_0',
          platform: 'iPad',
          maxTouchPoints: 5
        },
        writable: true
      })
      expect(detectScribbleSupport()).toBe(false)
    })

    test('returns false for non-iPad devices', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'iPhone OS 14_0',
          platform: 'iPhone',
          maxTouchPoints: 5
        },
        writable: true
      })
      expect(detectScribbleSupport()).toBe(false)
    })
  })
})
