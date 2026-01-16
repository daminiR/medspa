/**
 * Credit Card Validation Utilities
 *
 * Implements the Luhn algorithm (mod-10) and card-specific validation rules
 * for secure card number validation.
 */

export interface CardTypeInfo {
  pattern: RegExp;
  length: number | number[];
  cvvLength: number | number[];
  displayName: string;
}

/**
 * Mapping of card brands to their validation rules
 */
export const CARD_TYPES: Record<string, CardTypeInfo> = {
  visa: {
    pattern: /^4[0-9]{12}(?:[0-9]{3})?(?:[0-9]{3})?$/,
    length: [13, 16, 19],
    cvvLength: 3,
    displayName: 'Visa'
  },
  mastercard: {
    pattern: /^(5[1-5][0-9]{14}|2(?:22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)[0-9]{12})$/,
    length: 16,
    cvvLength: 3,
    displayName: 'Mastercard'
  },
  amex: {
    pattern: /^3[47][0-9]{13}$/,
    length: 15,
    cvvLength: 4,
    displayName: 'American Express'
  },
  discover: {
    pattern: /^6(?:011|5[0-9]{2}|4[4-9][0-9]|22(?:12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[01][0-9]|92[0-5]))[0-9]{12}$/,
    length: 16,
    cvvLength: 3,
    displayName: 'Discover'
  }
};

/**
 * Validates a credit card number using the Luhn algorithm (mod-10)
 * @param cardNumber - Card number with or without spaces/dashes
 * @returns true if the card number passes Luhn validation
 */
export function luhnCheck(cardNumber: string): boolean {
  // Remove all non-digit characters
  const cleaned = cardNumber.replace(/\D/g, '');

  // Card must be numeric and between 13-19 digits
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let isEvenPosition = false;

  // Process digits from right to left
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    // Double every second digit from the right
    if (isEvenPosition) {
      digit *= 2;
      // If doubled digit is greater than 9, subtract 9
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEvenPosition = !isEvenPosition;
  }

  // Valid if sum is divisible by 10
  return sum % 10 === 0;
}

/**
 * Detects card type based on card number prefix
 * @param cardNumber - Card number (can include spaces)
 * @returns Card type string or null if not recognized
 */
export function detectCardType(cardNumber: string): string | null {
  const cleaned = cardNumber.replace(/\D/g, '');

  // Need at least 1 digit to detect
  if (cleaned.length === 0) {
    return null;
  }

  // Quick prefix check for common card types
  if (cleaned.startsWith('4')) {
    return 'visa';
  }
  if (/^5[1-5]/.test(cleaned) || /^2(?:22[1-9]|2[3-9]|[3-6]|7[0-1]|720)/.test(cleaned)) {
    return 'mastercard';
  }
  if (/^3[47]/.test(cleaned)) {
    return 'amex';
  }
  if (/^6(?:011|5|4[4-9]|22)/.test(cleaned)) {
    return 'discover';
  }

  return null;
}

/**
 * Validates card number against specific card type rules
 */
export function validateCardByType(cardNumber: string, cardType: string): {
  isValid: boolean;
  error?: string;
} {
  const cleaned = cardNumber.replace(/\D/g, '');
  const typeInfo = CARD_TYPES[cardType];

  if (!typeInfo) {
    return { isValid: false, error: 'Unknown card type' };
  }

  // Check length
  const validLengths = Array.isArray(typeInfo.length)
    ? typeInfo.length
    : [typeInfo.length];

  if (!validLengths.includes(cleaned.length)) {
    return {
      isValid: false,
      error: `${typeInfo.displayName} must be ${validLengths.join(' or ')} digits`
    };
  }

  // Check Luhn
  if (!luhnCheck(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid card number'
    };
  }

  return { isValid: true };
}

/**
 * Validates CVV based on card type
 */
export function validateCVV(cvv: string, cardType: string): boolean {
  const cleaned = cvv.replace(/\D/g, '');
  const typeInfo = CARD_TYPES[cardType];

  if (!typeInfo) {
    // Default to 3-4 digits for unknown types
    return /^\d{3,4}$/.test(cleaned);
  }

  const validLengths = Array.isArray(typeInfo.cvvLength)
    ? typeInfo.cvvLength
    : [typeInfo.cvvLength];

  return validLengths.includes(cleaned.length);
}

/**
 * Validates expiry date (hasn't expired)
 */
export function validateExpiry(month: number, year: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Year in the past
  if (year < currentYear) return false;

  // Same year but month has passed
  if (year === currentYear && month < currentMonth) return false;

  // Max 10 years in future
  if (year > currentYear + 10) return false;

  // Invalid month
  if (month < 1 || month > 12) return false;

  return true;
}

/**
 * Formats card number with spaces (groups of 4)
 */
export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ').substring(0, 19) : '';
}

/**
 * Gets the expected card number length for display
 */
export function getExpectedLength(cardType: string | null): number {
  if (!cardType || !CARD_TYPES[cardType]) {
    return 16; // Default
  }

  const lengths = CARD_TYPES[cardType].length;
  return Array.isArray(lengths) ? lengths[lengths.length - 1] : lengths;
}

export interface CardValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Comprehensive card validation function
 */
export function validateCardPayment(cardData: {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string | number;
  expiryYear: string | number;
  cvv: string;
}): CardValidationResult {
  const errors: Record<string, string> = {};

  // Card number validation
  const cleaned = cardData.cardNumber.replace(/\D/g, '');
  const detectedType = detectCardType(cleaned);

  if (!cleaned) {
    errors.cardNumber = 'Card number is required';
  } else if (!/^\d{13,19}$/.test(cleaned)) {
    errors.cardNumber = 'Card number must be 13-19 digits';
  } else if (!luhnCheck(cleaned)) {
    errors.cardNumber = 'Invalid card number';
  } else if (detectedType) {
    const validation = validateCardByType(cleaned, detectedType);
    if (!validation.isValid && validation.error) {
      errors.cardNumber = validation.error;
    }
  }

  // Cardholder name validation
  if (!cardData.cardholderName?.trim()) {
    errors.cardholderName = 'Cardholder name is required';
  } else if (cardData.cardholderName.trim().length < 2) {
    errors.cardholderName = 'Name must be at least 2 characters';
  }

  // Expiry validation
  const month = typeof cardData.expiryMonth === 'string'
    ? parseInt(cardData.expiryMonth, 10)
    : cardData.expiryMonth;
  const year = typeof cardData.expiryYear === 'string'
    ? parseInt(cardData.expiryYear, 10)
    : cardData.expiryYear;

  if (!month) {
    errors.expiryMonth = 'Month is required';
  }
  if (!year) {
    errors.expiryYear = 'Year is required';
  }
  if (month && year && !validateExpiry(month, year)) {
    errors.expiry = 'Card has expired or date is invalid';
  }

  // CVV validation
  const cvvCleaned = cardData.cvv.replace(/\D/g, '');
  if (!cvvCleaned) {
    errors.cvv = 'CVV is required';
  } else if (detectedType) {
    if (!validateCVV(cvvCleaned, detectedType)) {
      const typeInfo = CARD_TYPES[detectedType];
      const expectedLength = Array.isArray(typeInfo.cvvLength)
        ? typeInfo.cvvLength.join(' or ')
        : typeInfo.cvvLength;
      errors.cvv = `${typeInfo.displayName} CVV must be ${expectedLength} digits`;
    }
  } else if (!/^\d{3,4}$/.test(cvvCleaned)) {
    errors.cvv = 'CVV must be 3-4 digits';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
