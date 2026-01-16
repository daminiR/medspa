import * as Crypto from 'expo-crypto';

/**
 * Referral Code Generator
 * Generates unique, memorable referral codes
 */

export interface CodeGenerationOptions {
  firstName?: string;
  userId?: string;
  prefix?: string;
  length?: number;
  format?: 'UPPERCASE' | 'LOWERCASE' | 'MIXED';
}

const DEFAULT_PREFIX = 'LUXE';
const DEFAULT_LENGTH = 6; // Length of random suffix
const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters (0, O, 1, I)

/**
 * Generate a unique referral code
 * Format: PREFIX-NAME-RANDOM (e.g., "LUXE-SARAH-X7K2")
 */
export async function generateReferralCode(options: CodeGenerationOptions = {}): Promise<string> {
  const {
    firstName = '',
    userId = '',
    prefix = DEFAULT_PREFIX,
    length = DEFAULT_LENGTH,
    format = 'UPPERCASE',
  } = options;

  // Clean and format the first name
  const cleanName = firstName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 8);

  // Generate random suffix
  const randomSuffix = await generateRandomString(length);

  // Build code
  let code = '';
  
  if (prefix) {
    code += prefix;
  }

  if (cleanName) {
    code += `-${cleanName}`;
  }

  code += `-${randomSuffix}`;

  // Apply format
  return applyFormat(code, format);
}

/**
 * Generate cryptographically secure random string
 */
async function generateRandomString(length: number): Promise<string> {
  // Generate random bytes
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  
  // Convert bytes to characters from our character set
  let result = '';
  for (let i = 0; i < length; i++) {
    const index = randomBytes[i] % CHARACTERS.length;
    result += CHARACTERS[index];
  }
  
  return result;
}

/**
 * Apply format to code
 */
function applyFormat(code: string, format: 'UPPERCASE' | 'LOWERCASE' | 'MIXED'): string {
  switch (format) {
    case 'UPPERCASE':
      return code.toUpperCase();
    case 'LOWERCASE':
      return code.toLowerCase();
    case 'MIXED':
      // Keep as generated (already uppercase by default)
      return code;
    default:
      return code;
  }
}

/**
 * Validate referral code format
 */
export function isValidCodeFormat(code: string): boolean {
  // Must be 8-20 characters
  if (code.length < 8 || code.length > 20) {
    return false;
  }

  // Must contain only alphanumeric and hyphens
  if (!/^[A-Z0-9-]+$/i.test(code)) {
    return false;
  }

  // Must have at least 2 segments
  const segments = code.split('-');
  if (segments.length < 2) {
    return false;
  }

  return true;
}

/**
 * Generate a short code for quick sharing (e.g., "SARAH25")
 */
export async function generateShortCode(options: CodeGenerationOptions = {}): Promise<string> {
  const { firstName = '', userId = '' } = options;
  
  const cleanName = firstName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 6);

  const randomSuffix = await generateRandomString(2);
  
  return `${cleanName}${randomSuffix}`;
}

/**
 * Check if code is unique (would need to call API)
 */
export async function isCodeUnique(code: string): Promise<boolean> {
  // TODO: Implement API call to check uniqueness
  // For now, return true
  return true;
}

/**
 * Generate QR code data URL
 */
export function generateQRCodeUrl(shareUrl: string): string {
  // Using a QR code generation service
  const encodedUrl = encodeURIComponent(shareUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`;
}

/**
 * Generate code with uniqueness check and retry
 */
export async function generateUniqueReferralCode(
  options: CodeGenerationOptions = {},
  maxRetries: number = 5
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const code = await generateReferralCode(options);
    const isUnique = await isCodeUnique(code);
    
    if (isUnique) {
      return code;
    }
  }
  
  throw new Error('Failed to generate unique referral code after maximum retries');
}
