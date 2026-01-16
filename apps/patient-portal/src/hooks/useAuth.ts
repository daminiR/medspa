'use client';

/**
 * useAuth Hook
 *
 * Primary authentication hook that provides access to auth state and actions.
 * This is a re-export of the useAuth hook from AuthContext for convenience.
 */

import { useAuth as useAuthFromContext } from '@/contexts/AuthContext';

export { useAuth, useAuthContext, type User, type Session } from '@/contexts/AuthContext';
export default useAuthFromContext;
