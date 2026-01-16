'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2, CheckCircle } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'logging-out' | 'complete'>('logging-out');

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear all client-side storage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          
          // Clear any cookies (for client-accessible cookies)
          document.cookie.split(';').forEach((cookie) => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          });
        }

        // Simulate signOut process (replace with actual next-auth signOut when configured)
        // import { signOut } from 'next-auth/react';
        // await signOut({ redirect: false });

        // Short delay to show completion status
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStatus('complete');

        // Redirect to login after showing success
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if there's an error
        router.push('/auth/login');
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
        {status === 'logging-out' ? (
          <>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Signing Out</h1>
            <p className="text-gray-600">
              Please wait while we securely sign you out...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Signed Out</h1>
            <p className="text-gray-600">
              You have been successfully signed out. Redirecting to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
