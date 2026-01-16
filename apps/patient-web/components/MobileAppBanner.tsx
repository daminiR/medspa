'use client';

import { useState, useEffect } from 'react';
import { X, Smartphone, Apple, Play } from 'lucide-react';
import Cookies from 'js-cookie';

const COOKIE_NAME = 'mobile_banner_dismissed';
const DISMISS_DURATION_DAYS = 7;

interface DeviceInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return { isMobile: false, isIOS: false, isAndroid: false };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);

  return { isMobile, isIOS, isAndroid };
}

export function MobileAppBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
  });

  useEffect(() => {
    const info = getDeviceInfo();
    setDeviceInfo(info);

    // Only show on mobile devices
    if (!info.isMobile) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed
    const isDismissed = Cookies.get(COOKIE_NAME);
    if (!isDismissed) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    Cookies.set(COOKIE_NAME, 'true', { expires: DISMISS_DURATION_DAYS });
  };

  const handleAppStoreClick = () => {
    // Track analytics event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'app_store_click', {
        platform: deviceInfo.isIOS ? 'ios' : 'android',
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] animate-fade-in"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] safe-bottom"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-banner-title"
      >
        <div className="bg-white rounded-t-3xl shadow-2xl animate-slide-up">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
          </div>

          <div className="px-6 pb-8">
            {/* Close button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={handleDismiss}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Dismiss banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              
              <h2 id="mobile-banner-title" className="text-xl font-bold text-gray-900 mb-2">
                Get the Luxe Spa App
              </h2>
              <p className="text-gray-600 text-sm max-w-xs mx-auto">
                Book appointments, track your results, and message your care team - all with the best mobile experience.
              </p>
            </div>

            {/* App store buttons */}
            <div className="space-y-3">
              {deviceInfo.isIOS ? (
                <a
                  href="https://apps.apple.com/app/luxe-medical-spa/id123456789"
                  onClick={handleAppStoreClick}
                  className="flex items-center justify-center w-full px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Apple className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="text-xs opacity-75">Download on the</div>
                    <div className="text-lg font-semibold -mt-0.5">App Store</div>
                  </div>
                </a>
              ) : deviceInfo.isAndroid ? (
                <a
                  href="https://play.google.com/store/apps/details?id=com.luxemedspa.patient"
                  onClick={handleAppStoreClick}
                  className="flex items-center justify-center w-full px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Play className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="text-xs opacity-75">Get it on</div>
                    <div className="text-lg font-semibold -mt-0.5">Google Play</div>
                  </div>
                </a>
              ) : (
                <>
                  <a
                    href="https://apps.apple.com/app/luxe-medical-spa/id123456789"
                    onClick={handleAppStoreClick}
                    className="flex items-center justify-center w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Apple className="w-5 h-5 mr-2" />
                    <span className="font-medium">App Store</span>
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.luxemedspa.patient"
                    onClick={handleAppStoreClick}
                    className="flex items-center justify-center w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    <span className="font-medium">Google Play</span>
                  </a>
                </>
              )}

              {/* Continue in browser option */}
              <button
                onClick={handleDismiss}
                className="w-full py-3 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
              >
                Continue in browser
              </button>
            </div>

            {/* Features list */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Face ID Login
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Push Notifications
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Offline Mode
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Type declaration for Google Analytics
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default MobileAppBanner;
