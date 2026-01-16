/**
 * @vitest-environment node
 */
import { parseRescheduleResponse } from '@/lib/twilio'

describe('parseRescheduleResponse', () => {
  describe('Reschedule Intent Detection', () => {
    it('should detect "R" as reschedule intent', () => {
      const result = parseRescheduleResponse('R')
      expect(result.action).toBe('reschedule_intent')
      expect(result.slotNumber).toBeUndefined()
    })

    it('should detect "r" (lowercase) as reschedule intent', () => {
      const result = parseRescheduleResponse('r')
      expect(result.action).toBe('reschedule_intent')
    })

    it('should detect "RESCHEDULE" as reschedule intent', () => {
      const result = parseRescheduleResponse('RESCHEDULE')
      expect(result.action).toBe('reschedule_intent')
    })

    it('should detect "reschedule" (lowercase) as reschedule intent', () => {
      const result = parseRescheduleResponse('reschedule')
      expect(result.action).toBe('reschedule_intent')
    })

    it('should detect "CHANGE" as reschedule intent', () => {
      const result = parseRescheduleResponse('CHANGE')
      expect(result.action).toBe('reschedule_intent')
    })

    it('should detect "MOVE" as reschedule intent', () => {
      const result = parseRescheduleResponse('MOVE')
      expect(result.action).toBe('reschedule_intent')
    })

    it('should handle whitespace around reschedule keywords', () => {
      expect(parseRescheduleResponse('  R  ').action).toBe('reschedule_intent')
      expect(parseRescheduleResponse(' reschedule ').action).toBe('reschedule_intent')
    })
  })

  describe('Slot Selection Detection', () => {
    it('should detect single digit 1-5 as slot selection', () => {
      for (let i = 1; i <= 5; i++) {
        const result = parseRescheduleResponse(String(i))
        expect(result.action).toBe('slot_selection')
        expect(result.slotNumber).toBe(i)
      }
    })

    it('should handle whitespace around numbers', () => {
      const result = parseRescheduleResponse('  3  ')
      expect(result.action).toBe('slot_selection')
      expect(result.slotNumber).toBe(3)
    })

    it('should not detect 0 as valid slot selection', () => {
      const result = parseRescheduleResponse('0')
      expect(result.action).toBe('unknown')
      expect(result.slotNumber).toBeUndefined()
    })

    it('should not detect numbers > 5 as slot selection', () => {
      const result6 = parseRescheduleResponse('6')
      expect(result6.action).toBe('unknown')

      const result9 = parseRescheduleResponse('9')
      expect(result9.action).toBe('unknown')
    })

    it('should not detect multi-digit numbers', () => {
      const result = parseRescheduleResponse('12')
      expect(result.action).toBe('unknown')
    })
  })

  describe('Call Request Detection', () => {
    it('should detect "CALL" as call request', () => {
      const result = parseRescheduleResponse('CALL')
      expect(result.action).toBe('call_request')
    })

    it('should detect "call" (lowercase) as call request', () => {
      const result = parseRescheduleResponse('call')
      expect(result.action).toBe('call_request')
    })

    it('should detect "PHONE" as call request', () => {
      const result = parseRescheduleResponse('PHONE')
      expect(result.action).toBe('call_request')
    })

    it('should detect "HELP" as call request', () => {
      const result = parseRescheduleResponse('HELP')
      expect(result.action).toBe('call_request')
    })

    it('should detect "STAFF" as call request', () => {
      const result = parseRescheduleResponse('STAFF')
      expect(result.action).toBe('call_request')
    })
  })

  describe('Unknown Responses', () => {
    it('should return unknown for random text', () => {
      const result = parseRescheduleResponse('hello there')
      expect(result.action).toBe('unknown')
      expect(result.slotNumber).toBeUndefined()
    })

    it('should return unknown for empty string', () => {
      const result = parseRescheduleResponse('')
      expect(result.action).toBe('unknown')
    })

    it('should return unknown for whitespace only', () => {
      const result = parseRescheduleResponse('   ')
      expect(result.action).toBe('unknown')
    })

    it('should return unknown for partial matches', () => {
      // "RE" is not a complete match for reschedule
      const result = parseRescheduleResponse('RE')
      expect(result.action).toBe('unknown')
    })

    it('should return unknown for sentences containing keywords', () => {
      // Should not match embedded keywords
      const result = parseRescheduleResponse('I want to reschedule please')
      expect(result.action).toBe('unknown')
    })
  })

  describe('Original Message Preservation', () => {
    it('should preserve original message in response', () => {
      const original = '  R  '
      const result = parseRescheduleResponse(original)
      expect(result.originalMessage).toBe(original)
    })

    it('should preserve original message for slot selection', () => {
      const original = '2'
      const result = parseRescheduleResponse(original)
      expect(result.originalMessage).toBe(original)
    })

    it('should preserve original message for unknown', () => {
      const original = 'random text'
      const result = parseRescheduleResponse(original)
      expect(result.originalMessage).toBe(original)
    })
  })

  describe('Edge Cases', () => {
    it('should handle mixed case', () => {
      expect(parseRescheduleResponse('ReScHeDuLe').action).toBe('reschedule_intent')
      expect(parseRescheduleResponse('CaLl').action).toBe('call_request')
    })

    it('should not match numbers within text', () => {
      const result = parseRescheduleResponse('option 3')
      expect(result.action).toBe('unknown')
    })

    it('should handle special characters', () => {
      expect(parseRescheduleResponse('R!').action).toBe('unknown')
      expect(parseRescheduleResponse('3.').action).toBe('unknown')
    })
  })
})
