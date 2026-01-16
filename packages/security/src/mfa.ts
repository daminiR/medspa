/**
 * Multi-Factor Authentication (MFA) Module
 *
 * Implements TOTP (Time-based One-Time Password) for MFA
 * - RFC 6238 compliant
 * - 30-second time window
 * - 6-digit codes
 *
 * HIPAA 2025 Update: MFA is now REQUIRED (no longer "addressable")
 */

import { authenticator } from 'otplib';
import crypto from 'crypto';

// Configure TOTP settings
authenticator.options = {
  digits: 6,
  step: 30, // 30 seconds
  window: 1, // Allow 1 step before/after for clock drift
};

/**
 * Generate a new MFA secret for a user
 *
 * @returns Base32-encoded secret (to be stored securely)
 */
export function generateMFASecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate a QR code URL for authenticator apps
 *
 * @param secret - The user's MFA secret
 * @param email - User's email address
 * @param issuer - App name (default: "MedicalSpa")
 * @returns otpauth:// URL for QR code generation
 */
export function generateMFASetupUrl(
  secret: string,
  email: string,
  issuer: string = 'MedicalSpa'
): string {
  return authenticator.keyuri(email, issuer, secret);
}

/**
 * Verify a TOTP token
 *
 * @param secret - The user's stored MFA secret
 * @param token - The 6-digit code from the authenticator app
 * @returns true if valid, false otherwise
 */
export function verifyMFAToken(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

/**
 * Generate backup codes for MFA recovery
 *
 * @param count - Number of backup codes to generate (default 10)
 * @returns Array of backup codes (store hashed, show once to user)
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format: XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }

  return codes;
}

/**
 * Hash a backup code for storage
 * (Store hashed version, never plain text)
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
}

/**
 * Verify a backup code
 *
 * @param code - The backup code entered by user
 * @param hashedCodes - Array of hashed backup codes
 * @returns Index of matched code, or -1 if not found
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): number {
  const hashedInput = hashBackupCode(code);
  return hashedCodes.findIndex(hashed => hashed === hashedInput);
}

/**
 * MFA Setup Flow
 *
 * 1. Call generateMFASecret() and store temporarily (not in DB yet)
 * 2. Call generateMFASetupUrl() to get QR code URL
 * 3. Show QR code to user, ask them to scan with authenticator app
 * 4. Ask user to enter a code from their app
 * 5. Call verifyMFAToken() to validate
 * 6. If valid, save the secret to the database (encrypted!)
 * 7. Generate and show backup codes, save hashed versions
 */

export interface MFASetupResult {
  secret: string;
  qrUrl: string;
  backupCodes: string[];
  hashedBackupCodes: string[];
}

/**
 * Create complete MFA setup data
 *
 * @param email - User's email
 * @param issuer - App name
 * @returns Setup data including secret, QR URL, and backup codes
 */
export function createMFASetup(
  email: string,
  issuer: string = 'MedicalSpa'
): MFASetupResult {
  const secret = generateMFASecret();
  const qrUrl = generateMFASetupUrl(secret, email, issuer);
  const backupCodes = generateBackupCodes();
  const hashedBackupCodes = backupCodes.map(hashBackupCode);

  return {
    secret,
    qrUrl,
    backupCodes, // Show these once to user, then discard
    hashedBackupCodes, // Store these in the database
  };
}

/**
 * Validate MFA is properly configured
 */
export function isMFAConfigured(user: { mfaSecret?: string | null }): boolean {
  return Boolean(user.mfaSecret && user.mfaSecret.length > 0);
}

/**
 * Check if user needs MFA based on role
 * (All healthcare staff should require MFA)
 */
export function requiresMFA(role: string): boolean {
  const rolesRequiringMFA = [
    'admin',
    'medical_director',
    'physician',
    'nurse_practitioner',
    'registered_nurse',
    'aesthetician',
    'laser_technician',
    'injection_specialist',
    'office_manager',
    'billing_specialist',
  ];

  return rolesRequiringMFA.includes(role);
}
