'use client';

/**
 * Application Providers
 * Wraps the app with all necessary context providers:
 * - AuthProvider for WebAuthn/Passkey authentication
 * - NextAuth SessionProvider for legacy authentication (optional)
 * - TanStack Query for data fetching
 * - PWA Provider for progressive web app features
 * - SessionInitializer for restoring sessions on app load
 */

import * as React from 'react';
import { useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PWAProvider } from '@/components/pwa';
import { AuthProvider, useAuthStore } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';
import { NotificationPrompt } from '@/components/NotificationPrompt';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * SessionInitializer Component
 *
 * Attempts to restore an existing session on app load by:
 * 1. Trying to refresh the access token using the httpOnly refresh cookie
 * 2. If successful, fetching the current user data
 * 3. Updating the auth store with the restored session
 *
 * This runs inside AuthProvider since it needs access to the auth store.
 * Shows a loading spinner until session initialization is complete.
 */
function SessionInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const setPasskeyAuth = useAuthStore((state) => state.setPasskeyAuth);

  useEffect(() => {
    const initSession = async () => {
      try {
        // Attempt silent refresh to restore session from httpOnly cookie
        const refreshed = await apiClient.refreshToken();

        if (refreshed) {
          // If refresh succeeded, fetch user data
          const apiUser = await apiClient.getCurrentUser();

          // Convert PatientUser to User type expected by auth store
          const user = {
            id: apiUser.id,
            email: apiUser.email,
            firstName: apiUser.firstName,
            lastName: apiUser.lastName,
            phone: apiUser.phone,
            avatarUrl: apiUser.avatarUrl,
          };

          // Create a session object with the access token
          const session = {
            token: apiClient.getAccessToken() || '',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default 24h expiry
          };

          // Update auth store with restored user and session
          setPasskeyAuth(user, session);
        }
      } catch (error) {
        // No valid session - user will need to log in
        // This is expected for new visitors or expired sessions
        console.log('No active session to restore');
      } finally {
        setIsInitialized(true);
      }
    };

    initSession();
  }, [setPasskeyAuth]);

  // Show loading state while initializing session
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <SessionInitializer>
          <QueryClientProvider client={queryClient}>
            <PWAProvider>
              {children}
              {/* Push notification permission prompt */}
              <NotificationPrompt />
            </PWAProvider>
          </QueryClientProvider>
        </SessionInitializer>
      </AuthProvider>
    </SessionProvider>
  );
}
