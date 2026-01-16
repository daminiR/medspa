'use client';

import { useEffect, useState } from 'react';
import { useOnlineStatus } from '@/hooks/usePWA';

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowReconnected(false);
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else if (wasOffline) {
      setShowReconnected(true);
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });

      const hideTimer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          setShowReconnected(false);
        }, 300);
      }, 3000);

      return () => clearTimeout(hideTimer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setShowReconnected(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-out ${
        isAnimating ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {showReconnected ? (
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-3 shadow-lg">
          <div className="mx-auto flex max-w-lg items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium text-white">
              Back online! Connection restored.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 shadow-lg">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                  />
                </svg>
                <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                </span>
              </div>
              <span className="text-sm font-medium text-white">
                You are offline
              </span>
            </div>
            <span className="text-xs text-white/80">
              Some features may be limited
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfflineIndicator;
