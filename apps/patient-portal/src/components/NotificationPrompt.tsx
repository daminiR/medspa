'use client';

import { useEffect, useState } from 'react';
import { Bell, X, MessageSquare, Calendar, Gift } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationPromptProps {
  className?: string;
}

/**
 * Notification Prompt Component
 * Banner/modal asking user to enable push notifications
 * Shows benefits and provides easy enable/dismiss options
 */
export function NotificationPrompt({ className }: NotificationPromptProps) {
  const {
    shouldShowPrompt,
    subscribeToNotifications,
    dismissPrompt,
    dismissPromptForDays,
    isLoading,
    permission,
  } = usePushNotifications();

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Show with animation after a short delay
  useEffect(() => {
    if (shouldShowPrompt) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Trigger animation after visibility is set
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      }, 3000); // Wait 3 seconds before showing

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [shouldShowPrompt]);

  // Handle enabling notifications
  const handleEnable = async () => {
    setIsSubscribing(true);
    try {
      const success = await subscribeToNotifications();
      if (success) {
        handleClose();
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  // Handle dismiss (close for this session)
  const handleDismiss = () => {
    dismissPrompt();
    handleClose();
  };

  // Handle "Not now" (close for 7 days)
  const handleNotNow = () => {
    dismissPromptForDays(7);
    handleClose();
  };

  // Close with animation
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  // Don't render if not visible or permission already decided
  if (!isVisible || permission !== 'default') {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-out',
        isAnimating ? 'translate-y-0' : 'translate-y-full',
        className
      )}
    >
      <div className="mx-4 mb-4 md:mx-auto md:max-w-lg">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-1 shadow-2xl">
          <div className="relative rounded-xl bg-white p-4">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-4 pr-8">
              {/* Bell Icon */}
              <div className="flex-shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
                  <Bell className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Stay Updated
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Get appointment reminders, messages from your provider, and exclusive offers.
                </p>
              </div>
            </div>

            {/* Benefits list */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 rounded-lg bg-purple-50 p-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-xs text-center text-gray-600">
                  Appointment Reminders
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-pink-50 p-2">
                <MessageSquare className="h-5 w-5 text-pink-600" />
                <span className="text-xs text-center text-gray-600">
                  Provider Messages
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-purple-50 p-2">
                <Gift className="h-5 w-5 text-purple-600" />
                <span className="text-xs text-center text-gray-600">
                  Exclusive Offers
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={handleNotNow}
                className="flex-1"
                disabled={isSubscribing}
              >
                Not Now
              </Button>
              <Button
                onClick={handleEnable}
                disabled={isLoading || isSubscribing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubscribing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Enabling...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Enable Notifications
                  </span>
                )}
              </Button>
            </div>

            {/* Privacy note */}
            <p className="mt-3 text-center text-xs text-gray-400">
              You can change this anytime in your settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationPrompt;
