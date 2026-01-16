/**
 * NextAuth 5 Route Handlers
 * Handles all authentication API routes including:
 * - GET /api/auth/signin - Sign in page
 * - POST /api/auth/signin/:provider - Provider sign in
 * - GET /api/auth/callback/:provider - OAuth callback
 * - GET /api/auth/signout - Sign out page
 * - POST /api/auth/signout - Sign out action
 * - GET /api/auth/session - Get session
 * - GET /api/auth/csrf - Get CSRF token
 * - GET /api/auth/providers - List providers
 */

import { handlers } from '@/lib/auth/next-auth';

export const { GET, POST } = handlers;
