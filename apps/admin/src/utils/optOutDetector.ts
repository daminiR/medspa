/**
 * Opt-Out Detection Utilities
 *
 * Detects opt-out keywords in messages for TCPA compliance.
 * Can be used both client-side and server-side.
 *
 * TCPA fines: $500-$1,500 per violation - detection is critical!
 */

// Standard opt-out keywords per TCPA regulations (carrier-recognized)
const OPT_OUT_KEYWORDS = [
  'STOP',
  'STOPALL',
  'END',
  'CANCEL',
  'UNSUBSCRIBE',
  'QUIT',
  'OPTOUT',
  'OPT OUT',
  'OPT-OUT',
  'REVOKE'
];

// Informal opt-out phrases (natural language patterns)
// These require human review before processing
const INFORMAL_OPT_OUT_PATTERNS = [
  'leave me alone',
  'stop texting',
  'stop messaging',
  'stop contacting',
  'don\'t text',
  'dont text',
  'don\'t message',
  'dont message',
  'don\'t contact',
  'dont contact',
  'remove me',
  'take me off',
  'off the list',
  'off your list',
  'no more texts',
  'no more messages',
  'not interested',
  'stop sending',
  'never text',
  'never message',
  'never contact',
  'do not text',
  'do not message',
  'do not contact',
  'please stop',
  'stop please',
  'i dont want',
  'i don\'t want',
  'delete my number',
  'remove my number',
  'go away',
  'enough',
  'stop it',
  'no thanks'
];

export type OptOutType = 'standard' | 'informal' | null;

/**
 * Detects if a message contains opt-out keywords (standard only)
 * Case-insensitive matching with word boundary support
 *
 * @param message - The message to analyze
 * @returns true if opt-out keyword is detected
 */
export function detectOptOutKeyword(message: string): boolean {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const normalizedMessage = message.toUpperCase().trim();

  // Check for exact word matches (word boundaries)
  return OPT_OUT_KEYWORDS.some(keyword => {
    // Create a regex pattern with word boundaries
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
    return pattern.test(normalizedMessage);
  });
}

/**
 * Detects informal opt-out phrases in natural language
 * These should trigger a review flag, not automatic opt-out
 *
 * @param message - The message to analyze
 * @returns true if informal opt-out pattern is detected
 */
export function detectInformalOptOut(message: string): boolean {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const normalizedMessage = message.toLowerCase().trim();

  return INFORMAL_OPT_OUT_PATTERNS.some(pattern =>
    normalizedMessage.includes(pattern.toLowerCase())
  );
}

/**
 * Comprehensive opt-out detection (standard + informal)
 * Returns the type of opt-out detected for appropriate handling
 *
 * @param message - The message to analyze
 * @returns Object with type ('standard' | 'informal' | null) and pattern
 */
export function detectAnyOptOut(message: string): {
  detected: boolean;
  type: OptOutType;
  pattern: string | null;
  requiresReview: boolean;
} {
  if (!message || typeof message !== 'string') {
    return { detected: false, type: null, pattern: null, requiresReview: false };
  }

  const normalizedUpper = message.toUpperCase().trim();
  const normalizedLower = message.toLowerCase().trim();

  // Check standard keywords first (these are carrier-recognized)
  const standardKeyword = OPT_OUT_KEYWORDS.find(keyword => {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
    return pattern.test(normalizedUpper);
  });

  if (standardKeyword) {
    return {
      detected: true,
      type: 'standard',
      pattern: standardKeyword,
      requiresReview: false // Standard keywords can be auto-processed
    };
  }

  // Check informal patterns (these need human review)
  const informalPattern = INFORMAL_OPT_OUT_PATTERNS.find(pattern =>
    normalizedLower.includes(pattern.toLowerCase())
  );

  if (informalPattern) {
    return {
      detected: true,
      type: 'informal',
      pattern: informalPattern,
      requiresReview: true // Informal patterns need human confirmation
    };
  }

  return { detected: false, type: null, pattern: null, requiresReview: false };
}

/**
 * Extracts opt-out information from a message (legacy - standard keywords only)
 *
 * @param message - The message to analyze
 * @returns Object with isOptOut flag and the detected keyword (if any)
 */
export function extractOptOutIntent(message: string): { isOptOut: boolean; keyword: string | null } {
  if (!message || typeof message !== 'string') {
    return { isOptOut: false, keyword: null };
  }

  const normalizedMessage = message.toUpperCase().trim();

  // Find which keyword was used
  const detectedKeyword = OPT_OUT_KEYWORDS.find(keyword => {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
    return pattern.test(normalizedMessage);
  });

  return {
    isOptOut: !!detectedKeyword,
    keyword: detectedKeyword || null
  };
}

/**
 * Enhanced opt-out extraction with type information
 *
 * @param message - The message to analyze
 * @returns Detailed opt-out information including type and review status
 */
export function extractOptOutDetails(message: string): {
  isOptOut: boolean;
  type: OptOutType;
  keyword: string | null;
  requiresReview: boolean;
  confidence: 'high' | 'medium' | 'low';
} {
  const result = detectAnyOptOut(message);

  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (result.type === 'standard') {
    confidence = 'high'; // Standard keywords are definitive
  } else if (result.type === 'informal') {
    // Some informal patterns are more clear than others
    const highConfidencePatterns = [
      'stop texting', 'stop messaging', 'unsubscribe', 'remove me',
      'take me off', 'do not text', 'do not message'
    ];
    const normalizedPattern = result.pattern?.toLowerCase() || '';
    confidence = highConfidencePatterns.some(p => normalizedPattern.includes(p))
      ? 'medium'
      : 'low';
  }

  return {
    isOptOut: result.detected,
    type: result.type,
    keyword: result.pattern,
    requiresReview: result.requiresReview,
    confidence
  };
}

/**
 * Gets all configured standard opt-out keywords
 * These are carrier-recognized keywords that Twilio also handles
 *
 * @returns Array of standard opt-out keywords
 */
export function getOptOutKeywords(): string[] {
  return [...OPT_OUT_KEYWORDS];
}

/**
 * Gets all configured informal opt-out patterns
 * Useful for documentation and training
 *
 * @returns Array of informal opt-out patterns
 */
export function getInformalOptOutPatterns(): string[] {
  return [...INFORMAL_OPT_OUT_PATTERNS];
}

/**
 * Gets all opt-out patterns (standard + informal)
 *
 * @returns Object with both keyword arrays
 */
export function getAllOptOutPatterns(): {
  standard: string[];
  informal: string[];
} {
  return {
    standard: [...OPT_OUT_KEYWORDS],
    informal: [...INFORMAL_OPT_OUT_PATTERNS]
  };
}

/**
 * Validates if a string matches opt-out pattern
 * More permissive version that doesn't require word boundaries
 *
 * @param message - The message to analyze
 * @returns true if message appears to be an opt-out request
 */
export function isOptOutMessage(message: string): boolean {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const normalized = message.toUpperCase().trim();

  // Check if entire message or first word is an opt-out keyword
  const firstWord = normalized.split(/[\s,.-]+/)[0];

  return OPT_OUT_KEYWORDS.includes(firstWord);
}

/**
 * Checks if message contains any opt-out language (standard or informal)
 * This is the most comprehensive check
 *
 * @param message - The message to analyze
 * @returns true if any opt-out language is detected
 */
export function containsOptOutLanguage(message: string): boolean {
  return detectOptOutKeyword(message) || detectInformalOptOut(message);
}
