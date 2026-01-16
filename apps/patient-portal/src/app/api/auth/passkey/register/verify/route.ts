import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/passkey/register/verify
 *
 * Verify WebAuthn registration response (mock implementation).
 * In production, this would:
 * 1. Retrieve and verify the challenge from storage
 * 2. Verify the attestation response
 * 3. Store the credential public key
 * 4. Create the user account
 * 5. Generate a real JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, credential } = body;

    if (!email || !credential) {
      return NextResponse.json(
        { message: 'Email and credential are required' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Retrieve stored challenge: const stored = await getChallenge(email);
    // 2. Verify the attestation using @simplewebauthn/server:
    //    const verification = await verifyRegistrationResponse({
    //      response: credential,
    //      expectedChallenge: stored.challenge,
    //      expectedOrigin: 'https://portal.glowmedspa.com',
    //      expectedRPID: 'glowmedspa.com',
    //    });
    // 3. If verified, store the credential:
    //    await storeCredential(userId, verification.registrationInfo);

    // Mock: Always succeed and return mock user data
    const nameParts = email.split('@')[0].split('.');
    const firstName =
      nameParts[0]?.charAt(0).toUpperCase() + (nameParts[0]?.slice(1) || '') ||
      'Sarah';
    const lastName =
      nameParts[1]?.charAt(0).toUpperCase() + (nameParts[1]?.slice(1) || '') ||
      'Johnson';

    const mockUser = {
      id: `user-${Date.now()}`,
      email,
      firstName,
      lastName,
      phone: body.phone || undefined,
      membershipTier: 'standard' as const,
      membershipCredits: 0,
      createdAt: new Date().toISOString(),
    };

    // Generate mock token (in production, use proper JWT signing)
    const mockToken = `mock-jwt-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;

    // Generate mock recovery codes
    const mockRecoveryCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    return NextResponse.json({
      success: true,
      user: mockUser,
      token: mockToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      recoveryCodes: mockRecoveryCodes,
    });
  } catch (error) {
    console.error('Registration verify error:', error);
    return NextResponse.json(
      { message: 'Failed to verify registration' },
      { status: 500 }
    );
  }
}
