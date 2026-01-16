/**
 * useCommandPalette Hook
 *
 * Custom React hook for managing command palette state and recent commands.
 * Provides a simple API for integrating the command palette into any page.
 *
 * @example
 * ```tsx
 * function MyPage() {
 *   const {
 *     isOpen,
 *     open,
 *     close,
 *     executeCommand,
 *     recentCommands
 *   } = useCommandPalette()
 *
 *   return (
 *     <div>
 *       <button onClick={open}>Open Commands</button>
 *       <CommandPalette
 *         isOpen={isOpen}
 *         onClose={close}
 *         onCommand={executeCommand}
 *         recentCommands={recentCommands}
 *       />
 *     </div>
 *   )
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import type { UseCommandPaletteReturn } from '@/components/messaging/CommandPalette.types'

const RECENT_COMMANDS_KEY = 'command-palette-recent'
const MAX_RECENT_COMMANDS = 5

/**
 * Hook for managing command palette state
 */
export function useCommandPalette(): UseCommandPaletteReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [recentCommands, setRecentCommands] = useState<string[]>([])

  // Load recent commands from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_COMMANDS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setRecentCommands(parsed.slice(0, MAX_RECENT_COMMANDS))
        }
      }
    } catch (error) {
      console.error('Failed to load recent commands:', error)
    }
  }, [])

  // Save recent commands to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(recentCommands))
    } catch (error) {
      console.error('Failed to save recent commands:', error)
    }
  }, [recentCommands])

  // Listen for keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const addToRecent = useCallback((commandId: string) => {
    setRecentCommands(prev => {
      // Remove if already exists, then add to front
      const filtered = prev.filter(id => id !== commandId)
      const updated = [commandId, ...filtered]
      // Keep only max allowed
      return updated.slice(0, MAX_RECENT_COMMANDS)
    })
  }, [])

  const clearRecent = useCallback(() => {
    setRecentCommands([])
    try {
      localStorage.removeItem(RECENT_COMMANDS_KEY)
    } catch (error) {
      console.error('Failed to clear recent commands:', error)
    }
  }, [])

  const executeCommand = useCallback((commandId: string, payload?: any) => {
    // Add to recent commands
    addToRecent(commandId)

    // Log execution (in production, this could trigger analytics)
    console.log('[Command Palette] Executing:', commandId, payload)

    // Close the palette after execution
    close()
  }, [addToRecent, close])

  return {
    isOpen,
    open,
    close,
    toggle,
    executeCommand,
    recentCommands,
    addToRecent,
    clearRecent
  }
}

/**
 * Hook for tracking command palette analytics
 * This is a stub that can be expanded for production analytics
 */
export function useCommandPaletteAnalytics() {
  const trackCommandExecution = useCallback((commandId: string) => {
    // In production, send to analytics service
    // e.g., analytics.track('command_executed', { commandId })
    console.log('[Analytics] Command executed:', commandId)
  }, [])

  const trackCommandPaletteOpened = useCallback(() => {
    console.log('[Analytics] Command palette opened')
  }, [])

  const trackCommandSearch = useCallback((query: string) => {
    console.log('[Analytics] Command search:', query)
  }, [])

  return {
    trackCommandExecution,
    trackCommandPaletteOpened,
    trackCommandSearch
  }
}

export default useCommandPalette
