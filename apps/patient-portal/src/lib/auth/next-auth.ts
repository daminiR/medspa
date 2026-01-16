/**
 * NextAuth 5 Configuration for Patient Portal
 * Supports Google and Apple OAuth providers in mock mode
 */

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import type { OAuthProvider, AuthUser } from '@/types/auth';

/**
 * NextAuth configuration with Google and Apple providers
 * Uses mock credentials for development - replace with real credentials in production
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-google-secret',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID || 'mock-apple-client-id',
      clientSecret: process.env.APPLE_CLIENT_SECRET || 'mock-apple-secret',
    }),
  ],

  // Custom pages for authentication flow
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/dashboard',
  },

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Callbacks for customizing the authentication flow
  callbacks: {
    /**
     * Called when a user attempts to sign in
     * In mock mode, always allow sign in
     */
    async signIn({ user, account }) {
      // Mock mode: always allow sign in
      // In production, add validation logic here
      console.log('[NextAuth] Sign in attempt:', {
        userId: user?.id,
        provider: account?.provider,
        email: user?.email,
      });

      // Validate email exists
      if (!user?.email) {
        console.warn('[NextAuth] Sign in rejected: No email provided');
        return false;
      }

      return true;
    },

    /**
     * Called when a JWT is created or updated
     * Adds custom claims to the token
     */
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id;
        token.provider = account.provider as OAuthProvider;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000; // 1 hour default

        console.log('[NextAuth] JWT created for user:', user.email);
        return token;
      }

      // Return previous token if the access token has not expired yet
      const expiresAt = token.accessTokenExpires as number | undefined;
      if (expiresAt && Date.now() < expiresAt) {
        return token;
      }

      // Access token has expired, try to refresh it
      // In mock mode, just extend the expiration
      console.log('[NextAuth] Refreshing access token');
      return {
        ...token,
        accessTokenExpires: Date.now() + 3600 * 1000, // Extend by 1 hour
      };
    },

    /**
     * Called whenever a session is checked
     * Adds custom fields to the session object
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string) || 'mock-user-id';
        session.user.provider = token.provider as OAuthProvider;
        session.accessToken = token.accessToken as string;

        // Handle token errors
        if (token.error) {
          session.error = token.error as string;
        }
      }

      return session;
    },

    /**
     * Called when a redirect is needed
     * Ensures redirects stay within the app
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },

  // Event handlers for logging and analytics
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('[NextAuth] User signed in:', {
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });
    },
    async signOut(message) {
      console.log('[NextAuth] User signed out');
    },
    async createUser({ user }) {
      console.log('[NextAuth] New user created:', user.email);
    },
    async linkAccount({ user, account }) {
      console.log('[NextAuth] Account linked:', {
        email: user.email,
        provider: account.provider,
      });
    },
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Trust host for secure cookies
  trustHost: true,

  // Secret for signing tokens
  secret: process.env.NEXTAUTH_SECRET || 'mock-secret-for-development-only',
});

/**
 * Helper function to get the current session server-side
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Helper function to check if user is authenticated server-side
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Helper function to get the current user server-side
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (session?.user) {
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name,
      image: session.user.image,
      provider: session.user.provider,
    };
  }
  return null;
}
