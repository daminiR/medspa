'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const metaMatches = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

        // Support both Ctrl and Meta (Cmd on Mac)
        const modifierMatches = shortcut.metaKey
          ? (event.metaKey || event.ctrlKey) && shiftMatches && altMatches
          : ctrlMatches && metaMatches && shiftMatches && altMatches;

        if (keyMatches && modifierMatches) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Default app shortcuts
 */
export function useAppShortcuts() {
  const router = useRouter();

  useKeyboardShortcuts([
    {
      key: 'k',
      metaKey: true,
      action: () => router.push('/booking'),
    },
    {
      key: 'b',
      metaKey: true,
      action: () => router.push('/booking'),
    },
    {
      key: '/',
      metaKey: true,
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      },
    },
  ]);
}

export default useKeyboardShortcuts;
