import { NextRequest, NextResponse } from 'next/server';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';

/**
 * POST /api/auth/passkey/authenticate/options
 *
 * Generate WebAuthn authentication options (mock implementation).
 * In production, this would:
 * 1. Look up the user's registered credentials (if email provided)
 * 2. Generate a cryptographically secure challenge
 * 3. Store the challenge with a short TTL for verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Generate a mock challenge (in production, use crypto.randomBytes(32))
    const mockChallenge = Buffer.from(
      `auth-challenge-${Date.now()}-${Math.random()}`
    ).toString('base64url');

    // Mock RP (Relying Party) ID
    const rpId =
      process.env.NEXT_PUBLIC_RP_ID ||
      (process.env.NODE_ENV === 'development' ? 'localhost' : 'glowmedspa.com');

    // Build authentication options following WebAuthn spec
    const authenticationOptions: PublicKeyCredentialRequestOptionsJSON = {
      challenge: mockChallenge,
      timeout: 60000, // 60 seconds
      rpId,
      userVerification: 'required',
      // Empty allowCredentials enables "discoverable credentials" / resident keys
      // The authenticator will show all available passkeys for this RP
      allowCredentials: [],
    };

    // If email is provided, in production you would:
    // 1. Look up the user's credentials from the database
    // 2. Add them to allowCredentials to restrict which passkeys can be used
    //
    // const userCredentials = await getCredentialsForUser(email);
    // authenticationOptions.allowCredentials = userCredentials.map(cred => ({
    //   id: cred.credentialId,
    //   type: 'public-key',
    //   transports: cred.transports,
    // }));

    // In production, store this challenge in Redis/database with TTL
    // await storeChallenge(email || 'anonymous', mockChallenge, 60);

    return NextResponse.json(authenticationOptions);
  } catch (error) {
    console.error('Authentication options error:', error);
    return NextResponse.json(
      { message: 'Failed to generate authentication options' },
      { status: 500 }
    );
  }
}
