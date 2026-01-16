'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string;
  keysWindows?: string;
  description: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: Shortcut[];
}

interface ShortcutSectionProps {
  title: string;
  shortcuts: Shortcut[];
  isMac: boolean;
}

function ShortcutSection({ title, shortcuts, isMac }: ShortcutSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-gray-300 text-sm">{shortcut.description}</span>
            <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-semibold text-gray-200 bg-gray-700 border border-gray-600 rounded shadow-sm">
              {isMac ? shortcut.keys : (shortcut.keysWindows || shortcut.keys)}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const [isMac, setIsMac] = useState(true);

  // Detect platform on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(navigator.platform.toLowerCase().includes('mac'));
    }
  }, []);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Handle click outside
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  // Shortcut categories organized by function
  const shortcutCategories: ShortcutCategory[] = [
    {
      title: 'General',
      shortcuts: [
        { keys: '\u2318Z', keysWindows: 'Ctrl+Z', description: 'Undo' },
        { keys: '\u2318\u21E7Z', keysWindows: 'Ctrl+Shift+Z', description: 'Redo' },
        { keys: '\u2318S', keysWindows: 'Ctrl+S', description: 'Save' },
        { keys: '\u2318P', keysWindows: 'Ctrl+P', description: 'Print' },
      ],
    },
    {
      title: 'Quick Dosage',
      shortcuts: [
        { keys: '1', description: '5 units' },
        { keys: '2', description: '10 units' },
        { keys: '3', description: '15 units' },
        { keys: '4', description: '20 units' },
        { keys: '5', description: '25 units' },
      ],
    },
    {
      title: 'Navigation',
      shortcuts: [
        { keys: '?', description: 'Show shortcuts' },
        { keys: 'Esc', description: 'Deselect' },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-700"
        role="dialog"
        aria-labelledby="keyboard-shortcuts-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-purple-400" />
            </div>
            <h2
              id="keyboard-shortcuts-title"
              className="text-lg font-semibold text-white"
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto">
          {shortcutCategories.map((category) => (
            <ShortcutSection
              key={category.title}
              title={category.title}
              shortcuts={category.shortcuts}
              isMac={isMac}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-700 bg-gray-800/50">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-700 rounded">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}

// Floating help button component
interface KeyboardHelpButtonProps {
  onClick: () => void;
}

export function KeyboardHelpButton({ onClick }: KeyboardHelpButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        w-10 h-10 rounded-full flex items-center justify-center
        bg-white/90 backdrop-blur-sm
        shadow-lg hover:shadow-xl
        border border-gray-200
        text-gray-600 hover:text-gray-900 hover:bg-white
        transition-all duration-200
        transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
      "
      title="Keyboard Shortcuts (?)"
      aria-label="Show keyboard shortcuts"
    >
      <span className="text-lg font-semibold">?</span>
    </button>
  );
}

export default KeyboardShortcutsHelp;
