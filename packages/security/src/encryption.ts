/**
 * HIPAA-Compliant Encryption Module
 *
 * Uses AES-256-GCM for encrypting Protected Health Information (PHI)
 * - AES-256: NIST-approved, HIPAA-compliant encryption standard
 * - GCM mode: Provides both confidentiality and authenticity
 * - Each encryption uses a unique IV (Initialization Vector)
 * - AuthTag prevents tampering with encrypted data
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment
 * Must be a 64-character hex string (32 bytes)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a string value
 *
 * @param plaintext - The value to encrypt
 * @returns Encrypted string in format: iv:authTag:encrypted
 *
 * @example
 * const encrypted = encryptPHI('123-45-6789'); // SSN
 * // Returns: "a1b2c3...:d4e5f6...:g7h8i9..."
 */
export function encryptPHI(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an encrypted value
 *
 * @param ciphertext - The encrypted value (iv:authTag:encrypted format)
 * @returns Decrypted plaintext string
 * @throws Error if decryption fails (tampered data, wrong key, etc.)
 */
export function decryptPHI(ciphertext: string): string {
  if (!ciphertext) return ciphertext;

  // Check if this is actually encrypted (contains our format)
  if (!ciphertext.includes(':')) {
    // Not encrypted, return as-is (for backward compatibility)
    return ciphertext;
  }

  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, authTagHex, encrypted] = parts;

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypt multiple fields in an object
 *
 * @param data - Object with fields to encrypt
 * @param fieldsToEncrypt - Array of field names to encrypt
 * @returns Object with specified fields encrypted
 */
export function encryptFields<T extends Record<string, unknown>>(
  data: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const result = { ...data };

  for (const field of fieldsToEncrypt) {
    const value = result[field];
    if (typeof value === 'string' && value) {
      result[field] = encryptPHI(value) as T[keyof T];
    }
  }

  return result;
}

/**
 * Decrypt multiple fields in an object
 *
 * @param data - Object with encrypted fields
 * @param fieldsToDecrypt - Array of field names to decrypt
 * @returns Object with specified fields decrypted
 */
export function decryptFields<T extends Record<string, unknown>>(
  data: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const result = { ...data };

  for (const field of fieldsToDecrypt) {
    const value = result[field];
    if (typeof value === 'string' && value) {
      try {
        result[field] = decryptPHI(value) as T[keyof T];
      } catch {
        // Field wasn't encrypted, leave as-is
      }
    }
  }

  return result;
}

/**
 * Generate a new encryption key
 * Call this once to generate a key, then store it securely
 *
 * @returns 64-character hex string (32 bytes)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Hash a value (one-way, for comparison)
 * Use for things like API keys, tokens, etc.
 *
 * @param value - Value to hash
 * @returns SHA-256 hash as hex string
 */
export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Generate a secure random token
 *
 * @param length - Number of bytes (default 32 = 64 hex chars)
 * @returns Random hex string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Compare two strings in constant time (prevents timing attacks)
 */
export function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    // Compare against self to maintain constant time
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

// PHI fields that should be encrypted in patient records
export const PHI_FIELDS = [
  'ssn',
  'socialSecurityNumber',
  'driversLicense',
  'insurancePolicyNumber',
  'medicalRecordNumber',
  'accountNumber',
  // Note: Names, DOB, phone, email are typically not encrypted
  // as they're needed for search/display, but are protected by access controls
] as const;
