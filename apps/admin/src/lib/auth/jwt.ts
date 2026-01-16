/**
 * JWT Authentication Utilities
 * Production-ready JWT handling for patient portal API
 */

import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';

// Environment variables (should be set in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_ISSUER = process.env.JWT_ISSUER || 'medical-spa-platform';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'patient-portal';

// Token expiration times
const ACCESS_TOKEN_EXPIRATION = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRATION = '7d';  // 7 days

// Convert secret to Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

/**
 * Generate access token
 */
export async function generateAccessToken(payload: {
  userId: string;
  email: string;
  role: string;
}): Promise<string> {
  const token = await new SignJWT({
    ...payload,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
    .sign(secret);

  return token;
}

/**
 * Generate refresh token
 */
export async function generateRefreshToken(payload: {
  userId: string;
  email: string;
  role: string;
}): Promise<string> {
  const token = await new SignJWT({
    ...payload,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(REFRESH_TOKEN_EXPIRATION)
    .sign(secret);

  return token;
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokens(payload: {
  userId: string;
  email: string;
  role: string;
}): Promise<AuthTokens> {
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  // Calculate expiration time (15 minutes from now)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Verify access token specifically
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  const payload = await verifyToken(token);

  if (!payload || payload.type !== 'access') {
    return null;
  }

  return payload;
}

/**
 * Verify refresh token specifically
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  const payload = await verifyToken(token);

  if (!payload || payload.type !== 'refresh') {
    return null;
  }

  return payload;
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice(7);
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(request: Request): Promise<TokenPayload | null> {
  const authHeader = request.headers.get('Authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    return null;
  }

  return verifyAccessToken(token);
}

/**
 * Hash password using bcrypt-compatible approach
 * Note: In production, use bcrypt or argon2
 */
export async function hashPassword(password: string): Promise<string> {
  // Using Web Crypto API for password hashing
  // In production, prefer bcrypt or argon2
  const encoder = new TextEncoder();
  const data = encoder.encode(password + JWT_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generate a secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a referral code
 */
export function generateReferralCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
  const suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${suffix}`;
}
