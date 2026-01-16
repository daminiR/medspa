import { NextRequest, NextResponse } from 'next/server';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';

/**
 * POST /api/auth/passkey/register/options
 *
 * Generate WebAuthn registration options (mock implementation).
 * In production, this would:
 * 1. Look up existing user or create a new pending registration
 * 2. Generate a cryptographically secure challenge
 * 3. Store the challenge with a short TTL for verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, phone } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { message: 'Email and full name are required' },
        { status: 400 }
      );
    }

    // Generate a mock user ID (in production, use crypto.randomUUID() server-side)
    const mockUserId = Buffer.from(`user-${Date.now()}-${email}`).toString(
      'base64url'
    );

    // Generate a mock challenge (in production, use crypto.randomBytes(32))
    const mockChallenge = Buffer.from(
      `challenge-${Date.now()}-${Math.random()}`
    ).toString('base64url');

    // Mock RP (Relying Party) configuration
    const rpId =
      process.env.NEXT_PUBLIC_RP_ID ||
      (process.env.NODE_ENV === 'development' ? 'localhost' : 'glowmedspa.com');

    // Build registration options following WebAuthn spec
    const registrationOptions: PublicKeyCredentialCreationOptionsJSON = {
      challenge: mockChallenge,
      rp: {
        name: 'Glow MedSpa Patient Portal',
        id: rpId,
      },
      user: {
        id: mockUserId,
        name: email,
        displayName: fullName,
      },
      pubKeyCredParams: [
        // ES256 - preferred for platform authenticators
        { alg: -7, type: 'public-key' },
        // RS256 - fallback for older authenticators
        { alg: -257, type: 'public-key' },
      ],
      authenticatorSelection: {
        // Prefer platform authenticator (Touch ID, Face ID, Windows Hello)
        authenticatorAttachment: 'platform',
        // Require user verification (biometric or PIN)
        userVerification: 'required',
        // Require resident key for username-less authentication
        residentKey: 'required',
        requireResidentKey: true,
      },
      timeout: 60000, // 60 seconds
      attestation: 'none', // We don't need attestation for mock
      excludeCredentials: [], // In production, list existing credentials to prevent duplicates
    };

    // In production, store this challenge in Redis/database with TTL
    // await storeChallenge(email, mockChallenge, 60);

    return NextResponse.json(registrationOptions);
  } catch (error) {
    console.error('Registration options error:', error);
    return NextResponse.json(
      { message: 'Failed to generate registration options' },
      { status: 500 }
    );
  }
}
