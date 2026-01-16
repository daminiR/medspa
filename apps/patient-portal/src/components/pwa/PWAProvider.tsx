'use client';

import { useEffect } from 'react';
import { useServiceWorker } from '@/hooks/usePWA';
import { InstallPrompt, OfflineIndicator } from '@/components/pwa';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const { registerServiceWorker } = useServiceWorker();

  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();
  }, [registerServiceWorker]);

  return (
    <>
      <OfflineIndicator />
      {children}
      <InstallPrompt />
    </>
  );
}

export default PWAProvider;
