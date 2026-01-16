'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types for PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Storage keys
const INSTALL_DISMISSED_KEY = 'pwa-install-dismissed';
const INSTALL_DISMISSED_UNTIL_KEY = 'pwa-install-dismissed-until';
const DAYS_TO_WAIT_AFTER_DISMISS = 7;

// Hook for managing the PWA install prompt
export function useInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if running on mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
    };
    
    checkMobile();
  }, []);

  // Check if app is already installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if running in standalone mode (installed PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInStandalone);
    };
    
    checkInstalled();
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check if prompt was previously dismissed
  useEffect(() => {
    const checkDismissed = () => {
      try {
        const dismissedUntil = localStorage.getItem(INSTALL_DISMISSED_UNTIL_KEY);
        if (dismissedUntil) {
          const dismissedDate = new Date(dismissedUntil);
          if (dismissedDate > new Date()) {
            setIsDismissed(true);
            return;
          } else {
            // Clear expired dismissal
            localStorage.removeItem(INSTALL_DISMISSED_KEY);
            localStorage.removeItem(INSTALL_DISMISSED_UNTIL_KEY);
          }
        }
        
        // Check session dismissal
        const sessionDismissed = sessionStorage.getItem(INSTALL_DISMISSED_KEY);
        if (sessionDismissed === 'true') {
          setIsDismissed(true);
        }
      } catch (error) {
        console.error('Error checking dismissal status:', error);
      }
    };
    
    checkDismissed();
  }, []);

  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger the install prompt
  const promptInstall = useCallback(async () => {
    if (!installPromptEvent) {
      return { outcome: 'dismissed' as const, platform: '' };
    }

    try {
      await installPromptEvent.prompt();
      const { outcome, platform } = await installPromptEvent.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setInstallPromptEvent(null);
      
      return { outcome, platform };
    } catch (error) {
      console.error('Error prompting install:', error);
      return { outcome: 'dismissed' as const, platform: '' };
    }
  }, [installPromptEvent]);

  // Dismiss the install prompt for this session
  const dismissForSession = useCallback(() => {
    try {
      sessionStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
      setIsDismissed(true);
    } catch (error) {
      console.error('Error dismissing prompt:', error);
    }
  }, []);

  // Dismiss the install prompt for N days
  const dismissForDays = useCallback((days: number = DAYS_TO_WAIT_AFTER_DISMISS) => {
    try {
      const dismissUntil = new Date();
      dismissUntil.setDate(dismissUntil.getDate() + days);
      localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
      localStorage.setItem(INSTALL_DISMISSED_UNTIL_KEY, dismissUntil.toISOString());
      setIsDismissed(true);
    } catch (error) {
      console.error('Error dismissing prompt:', error);
    }
  }, []);

  // Show prompt only on mobile, when installable, not installed, and not dismissed
  const shouldShowPrompt = isMobile && isInstallable && !isInstalled && !isDismissed;

  return {
    isInstallable,
    isInstalled,
    isDismissed,
    isMobile,
    shouldShowPrompt,
    promptInstall,
    dismissForSession,
    dismissForDays,
  };
}

// Hook for tracking online/offline status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      // Track that we recovered from being offline
      setWasOffline(true);
      // Clear the "was offline" state after 5 seconds
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}

// Hook for managing service worker registration and updates
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Register the service worker
  const registerServiceWorker = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service workers not supported');
      return null;
    }

    try {
      // Use the custom service worker instead of next-pwa's default
      const reg = await navigator.serviceWorker.register('/custom-sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      setRegistration(reg);
      registrationRef.current = reg;
      setIsRegistered(true);

      console.log('Service worker registered:', reg.scope);

      // Check for updates on registration
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setHasUpdate(true);
            }
          });
        }
      });

      return reg;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }, []);

  // Check for updates manually
  const checkForUpdates = useCallback(async () => {
    const reg = registrationRef.current;
    if (!reg) return false;

    try {
      setIsUpdating(true);
      await reg.update();
      return true;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Apply the update (skip waiting)
  const applyUpdate = useCallback(() => {
    const reg = registrationRef.current;
    if (!reg || !reg.waiting) return;

    // Tell the waiting service worker to skip waiting
    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload the page to use the new service worker
    window.location.reload();
  }, []);

  // Get the current service worker version
  const getVersion = useCallback(async (): Promise<string | null> => {
    if (!navigator.serviceWorker.controller) return null;

    return new Promise((resolve) => {
      const channel = new MessageChannel();

      channel.port1.onmessage = (event) => {
        resolve(event.data?.version || null);
      };

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_VERSION' },
          [channel.port2]
        );
      } else {
        resolve(null);
      }

      // Timeout after 1 second
      setTimeout(() => resolve(null), 1000);
    });
  }, []);

  // Clear all caches
  const clearCaches = useCallback(async (): Promise<boolean> => {
    if (!navigator.serviceWorker.controller) {
      // No active service worker, clear caches directly
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      return true;
    }

    return new Promise((resolve) => {
      const channel = new MessageChannel();

      channel.port1.onmessage = (event) => {
        resolve(event.data?.success || false);
      };

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [channel.port2]
        );
      } else {
        resolve(false);
      }

      // Timeout after 5 seconds
      setTimeout(() => resolve(false), 5000);
    });
  }, []);

  // Listen for controller changes (new service worker activated)
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleControllerChange = () => {
      // New service worker took control
      setHasUpdate(false);
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Listen for messages from service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETED') {
        console.log('Background sync completed for:', event.data.url);
        // You could dispatch a custom event or update state here
        window.dispatchEvent(new CustomEvent('pwa-sync-completed', { detail: event.data }));
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return {
    isRegistered,
    isUpdating,
    hasUpdate,
    registration,
    registerServiceWorker,
    checkForUpdates,
    applyUpdate,
    getVersion,
    clearCaches,
  };
}

// Combined hook for easy PWA management
export function usePWA() {
  const installPrompt = useInstallPrompt();
  const onlineStatus = useOnlineStatus();
  const serviceWorker = useServiceWorker();

  return {
    ...installPrompt,
    ...onlineStatus,
    ...serviceWorker,
  };
}

export default usePWA;
