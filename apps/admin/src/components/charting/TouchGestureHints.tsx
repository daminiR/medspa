'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, HelpCircle } from 'lucide-react';

const STORAGE_KEY = 'hasSeenGestureHints';

interface GestureHint {
  icon: string;
  gesture: string;
  description: string;
}

const GESTURES: GestureHint[] = [
  { icon: '☝️', gesture: 'Tap / Pencil', description: 'Place injection point' },
  { icon: '🤏', gesture: 'Pinch', description: 'Zoom in/out' },
  { icon: '✌️', gesture: 'Two-finger drag', description: 'Pan around' },
  { icon: '👆', gesture: 'Tap point', description: 'Edit or delete' },
  { icon: '👆⏱', gesture: 'Hold point', description: 'Drag to move' },
];

interface TouchGestureHintsProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
}

export function TouchGestureHints({
  isOpen,
  onClose,
  onDontShowAgain,
}: TouchGestureHintsProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      onDontShowAgain();
    }
    onClose();
  }, [dontShowAgain, onClose, onDontShowAgain]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Touch Gestures</h2>
          <button
            onClick={handleClose}
            className="
              px-4 py-1.5 rounded-lg text-sm font-medium
              bg-purple-600 hover:bg-purple-700 text-white
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
            "
          >
            Got it
          </button>
        </div>

        {/* Gesture List */}
        <div className="space-y-4">
          {GESTURES.map((gesture, index) => (
            <div
              key={index}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center text-2xl flex-shrink-0">
                {gesture.icon}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium text-sm">{gesture.gesture}</div>
                <div className="text-gray-400 text-sm">{gesture.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Don't show again checkbox */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="sr-only peer"
              />
              <div className="
                w-5 h-5 rounded border-2 border-gray-500
                peer-checked:bg-purple-600 peer-checked:border-purple-600
                transition-colors duration-200
                group-hover:border-gray-400
                flex items-center justify-center
              ">
                {dontShowAgain && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
              Don&apos;t show again
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage touch gesture hints visibility
 * - Checks localStorage for 'hasSeenGestureHints'
 * - Only shows on touch devices
 * - Provides manual trigger for help button
 */
export function useTouchGestureHints() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  // Track touch device status in state to avoid hydration mismatch
  const [isTouchDeviceState, setIsTouchDeviceState] = useState(false);

  // Check if device supports touch (only call on client)
  const checkIsTouchDevice = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - msMaxTouchPoints is IE-specific
      navigator.msMaxTouchPoints > 0
    );
  }, []);

  // Detect touch device on mount (client-side only)
  useEffect(() => {
    setIsTouchDeviceState(checkIsTouchDevice());
  }, [checkIsTouchDevice]);

  // Check localStorage and show hints for first-time users on touch devices
  useEffect(() => {
    if (hasCheckedStorage) return;
    if (!isTouchDeviceState) return;

    const hasSeenHints = localStorage.getItem(STORAGE_KEY) === 'true';

    if (!hasSeenHints) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }

    setHasCheckedStorage(true);
  }, [hasCheckedStorage, isTouchDeviceState]);

  const close = useCallback(() => {
    setIsOpen(false);
    setHasCheckedStorage(true);
  }, []);

  const dontShowAgain = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
    setHasCheckedStorage(true);
  }, []);

  const showHints = useCallback(() => {
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    close,
    dontShowAgain,
    showHints,
    isTouchDevice: isTouchDeviceState,
  };
}

/**
 * Help button to manually trigger gesture hints
 */
interface GestureHelpButtonProps {
  onClick: () => void;
  className?: string;
}

export function GestureHelpButton({ onClick, className = '' }: GestureHelpButtonProps) {
  return (
    <button
      onClick={onClick}
      title="Touch Gestures Help"
      className={`
        w-10 h-10 rounded-full flex items-center justify-center
        bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200
        text-gray-600 hover:text-gray-900 hover:bg-white
        transition-all duration-200 ease-in-out
        hover:shadow-xl transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        ${className}
      `}
    >
      <HelpCircle className="w-5 h-5" />
    </button>
  );
}

export default TouchGestureHints;
