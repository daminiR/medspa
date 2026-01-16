/**
 * COMMAND PALETTE INTEGRATION EXAMPLE
 *
 * This file demonstrates how to integrate the CommandPalette component
 * into the Messages page or any other part of the application.
 */

'use client'

import { useState, useEffect } from 'react'
import CommandPalette from './CommandPalette'
import { CheckCheck, Clock, UserPlus, Tag, Send, ArrowRight, User, MessageSquare, Search, HelpCircle } from 'lucide-react'

export default function MessagesPageWithCommandPalette() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Listen for Cmd+K / Ctrl+K to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Define commands with actions
  const commands = [
    {
      id: 'close-conversation',
      name: 'Close conversation',
      icon: <CheckCheck className="h-4 w-4" />,
      action: () => {
        console.log('Closing conversation...')
        // Add your logic here
        setIsCommandPaletteOpen(false)
      },
      shortcut: 'C',
    },
    {
      id: 'snooze',
      name: 'Snooze conversation',
      icon: <Clock className="h-4 w-4" />,
      action: () => {
        console.log('Snoozing conversation...')
        // Could open a snooze duration picker
        setIsCommandPaletteOpen(false)
      },
      shortcut: 'S',
    },
    {
      id: 'assign',
      name: 'Assign to...',
      icon: <UserPlus className="h-4 w-4" />,
      action: () => {
        console.log('Opening assign dialog...')
        // Could open a team member picker modal
        setIsCommandPaletteOpen(false)
      },
      shortcut: 'A',
    },
    {
      id: 'add-tag',
      name: 'Add tag',
      icon: <Tag className="h-4 w-4" />,
      action: () => {
        console.log('Opening tag picker...')
        // Could open a tag selection modal
        setIsCommandPaletteOpen(false)
      },
      shortcut: 'T',
    },
    {
      id: 'send-close',
      name: 'Send & Close',
      icon: <Send className="h-4 w-4" />,
      action: () => {
        console.log('Sending message and closing...')
        // Add your logic here
        setIsCommandPaletteOpen(false)
      },
      shortcut: 'Enter',
    },
    {
      id: 'goto-conversation',
      name: 'Go to conversation',
      icon: <ArrowRight className="h-4 w-4" />,
      action: () => {
        console.log('Opening conversation search...')
        // Could focus the search input
        setIsCommandPaletteOpen(false)
      },
      shortcut: '/',
    },
    {
      id: 'goto-patient',
      name: 'Go to patient profile',
      icon: <User className="h-4 w-4" />,
      action: () => {
        console.log('Navigating to patient profile...')
        // window.location.href = '/patients/[id]'
        setIsCommandPaletteOpen(false)
      },
    },
    {
      id: 'insert-quick-reply',
      name: 'Insert quick reply',
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => {
        console.log('Opening quick reply picker...')
        // Could toggle the quick replies panel
        setIsCommandPaletteOpen(false)
      },
      shortcut: '\\',
    },
    {
      id: 'search-conversations',
      name: 'Search conversations',
      icon: <Search className="h-4 w-4" />,
      action: () => {
        console.log('Focusing search...')
        // Could focus the conversation search input
        setIsCommandPaletteOpen(false)
      },
    },
    {
      id: 'view-shortcuts',
      name: 'View all shortcuts',
      icon: <HelpCircle className="h-4 w-4" />,
      action: () => {
        console.log('Showing all shortcuts...')
        // Could open a shortcuts help modal
        setIsCommandPaletteOpen(false)
      },
      shortcut: '?',
    },
  ]

  return (
    <div>
      {/* Your existing messages page content */}
      <div className="p-4">
        <h1>Messages Page</h1>
        <p className="text-sm text-gray-600 mt-2">
          Press <kbd className="px-2 py-1 bg-gray-100 rounded border">⌘K</kbd> or{' '}
          <kbd className="px-2 py-1 bg-gray-100 rounded border">Ctrl+K</kbd> to open command palette
        </p>

        {/* Optional: Add a button to manually open command palette */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Open Command Palette
        </button>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />
    </div>
  )
}

/**
 * INTEGRATION STEPS:
 *
 * 1. Import the CommandPalette component in your messages page:
 *    import CommandPalette from '@/components/messaging/CommandPalette'
 *
 * 2. Add state to manage the command palette:
 *    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
 *    const [recentCommands, setRecentCommands] = useState<string[]>([])
 *
 * 3. Add the keyboard listener (Cmd+K / Ctrl+K):
 *    useEffect(() => {
 *      const handleKeyDown = (e: KeyboardEvent) => {
 *        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
 *          e.preventDefault()
 *          setIsCommandPaletteOpen(true)
 *        }
 *      }
 *      document.addEventListener('keydown', handleKeyDown)
 *      return () => document.removeEventListener('keydown', handleKeyDown)
 *    }, [])
 *
 * 4. Add the CommandPalette component to your JSX:
 *    <CommandPalette
 *      isOpen={isCommandPaletteOpen}
 *      onClose={() => setIsCommandPaletteOpen(false)}
 *      onCommand={handleCommand}
 *      recentCommands={recentCommands}
 *    />
 *
 * 5. Implement your command handler logic based on your app's needs
 *
 * ADDITIONAL KEYBOARD SHORTCUTS:
 *
 * You can also add individual keyboard shortcuts for quick actions:
 *
 * useEffect(() => {
 *   const handleKeyDown = (e: KeyboardEvent) => {
 *     // Command Palette
 *     if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
 *       e.preventDefault()
 *       setIsCommandPaletteOpen(true)
 *       return
 *     }
 *
 *     // Close conversation - Cmd+Shift+C
 *     if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
 *       e.preventDefault()
 *       handleCommand('close-conversation')
 *       return
 *     }
 *
 *     // Snooze - Cmd+S
 *     if ((e.metaKey || e.ctrlKey) && e.key === 's') {
 *       e.preventDefault()
 *       handleCommand('snooze')
 *       return
 *     }
 *
 *     // Assign - A (when not typing in input)
 *     if (e.key === 'a' && !isTyping) {
 *       e.preventDefault()
 *       handleCommand('assign')
 *       return
 *     }
 *
 *     // Add tag - T (when not typing in input)
 *     if (e.key === 't' && !isTyping) {
 *       e.preventDefault()
 *       handleCommand('add-tag')
 *       return
 *     }
 *
 *     // Send & Close - Cmd+Enter
 *     if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
 *       e.preventDefault()
 *       handleCommand('send-close')
 *       return
 *     }
 *
 *     // Quick reply - Backslash
 *     if (e.key === '\\' && !isTyping) {
 *       e.preventDefault()
 *       handleCommand('insert-quick-reply')
 *       return
 *     }
 *
 *     // Search conversations - Forward slash
 *     if (e.key === '/' && !isTyping) {
 *       e.preventDefault()
 *       handleCommand('search-conversations')
 *       return
 *     }
 *   }
 *
 *   document.addEventListener('keydown', handleKeyDown)
 *   return () => document.removeEventListener('keydown', handleKeyDown)
 * }, [isTyping])
 */
