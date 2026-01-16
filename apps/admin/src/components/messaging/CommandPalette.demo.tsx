/**
 * COMMAND PALETTE DEMO PAGE
 *
 * This is a standalone demo to test the CommandPalette component.
 * You can create a test page at /app/demo/command-palette/page.tsx
 * and import this component to see it in action.
 */

'use client'

import { useState, useEffect } from 'react'
import CommandPalette from './CommandPalette'
import { Command, Keyboard, CheckCheck, Clock, UserPlus, Tag, Send, ArrowRight, User, MessageSquare } from 'lucide-react'

export default function CommandPaletteDemo() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [executionLog, setExecutionLog] = useState<Array<{ command: string; timestamp: Date }>>([])

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleCommand = (commandName: string) => {
    // Log execution
    setExecutionLog(prev => [
      { command: commandName, timestamp: new Date() },
      ...prev.slice(0, 9) // Keep last 10
    ])

    // Simulate command execution
    console.log('Executing command:', commandName)

    // Close the palette after command execution
    setIsCommandPaletteOpen(false)
  }

  // Define commands for the demo
  const commands = [
    {
      id: 'close-conversation',
      name: 'Close conversation',
      icon: <CheckCheck className="h-4 w-4" />,
      action: () => handleCommand('Close conversation'),
      shortcut: 'C',
    },
    {
      id: 'snooze-conversation',
      name: 'Snooze conversation',
      icon: <Clock className="h-4 w-4" />,
      action: () => handleCommand('Snooze conversation'),
      shortcut: 'S',
    },
    {
      id: 'assign-to',
      name: 'Assign to...',
      icon: <UserPlus className="h-4 w-4" />,
      action: () => handleCommand('Assign to...'),
      shortcut: 'A',
    },
    {
      id: 'add-tag',
      name: 'Add tag',
      icon: <Tag className="h-4 w-4" />,
      action: () => handleCommand('Add tag'),
      shortcut: 'T',
    },
    {
      id: 'send-close',
      name: 'Send & Close',
      icon: <Send className="h-4 w-4" />,
      action: () => handleCommand('Send & Close'),
      shortcut: 'Enter',
    },
    {
      id: 'go-to-conversation',
      name: 'Go to conversation',
      icon: <ArrowRight className="h-4 w-4" />,
      action: () => handleCommand('Go to conversation'),
      shortcut: '/',
    },
    {
      id: 'go-to-patient',
      name: 'Go to patient profile',
      icon: <User className="h-4 w-4" />,
      action: () => handleCommand('Go to patient profile'),
    },
    {
      id: 'insert-quick-reply',
      name: 'Insert quick reply',
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => handleCommand('Insert quick reply'),
      shortcut: '\\',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Command className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Command Palette Demo</h1>
          <p className="text-lg text-gray-600">
            Intercom-style command palette for keyboard shortcuts
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Keyboard className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">How to Use</h2>
              <p className="text-gray-600">
                Press the keyboard shortcut or click the button below to open the command palette.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Keyboard Shortcut */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Keyboard Shortcut</h3>
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-sm font-mono text-sm font-semibold">
                  ⌘K
                </kbd>
                <span className="text-gray-500">or</span>
                <kbd className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-sm font-mono text-sm font-semibold">
                  Ctrl+K
                </kbd>
              </div>
            </div>

            {/* Manual Trigger */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Manual Trigger</h3>
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
              >
                Open Command Palette
              </button>
            </div>
          </div>

          {/* Available Commands */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Commands</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Close conversation', shortcut: '⌘⇧C', category: 'Actions' },
                { name: 'Snooze conversation', shortcut: '⌘S', category: 'Actions' },
                { name: 'Assign to...', shortcut: 'A', category: 'Actions' },
                { name: 'Add tag', shortcut: 'T', category: 'Actions' },
                { name: 'Send & Close', shortcut: '⌘↵', category: 'Actions' },
                { name: 'Go to conversation', shortcut: '/', category: 'Navigation' },
                { name: 'Go to patient profile', shortcut: '', category: 'Navigation' },
                { name: 'Insert quick reply', shortcut: '\\', category: 'Quick Replies' },
              ].map((cmd, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">{cmd.name}</div>
                    <div className="text-xs text-gray-500">{cmd.category}</div>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Execution Log */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Execution Log</h2>
          {executionLog.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Command className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No commands executed yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Try opening the command palette and selecting a command
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {executionLog.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{entry.command}</div>
                      <div className="text-xs text-gray-500">
                        {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {executionLog.length > 0 && (
            <button
              onClick={() => {
                setExecutionLog([])
              }}
              className="mt-4 w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Log
            </button>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Keyboard First',
              description: 'Navigate entirely with your keyboard for maximum efficiency',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              title: 'Smart Search',
              description: 'Filter commands in real-time with intelligent keyword matching',
              color: 'from-purple-500 to-pink-500'
            },
            {
              title: 'Recent Commands',
              description: 'Quickly access your most frequently used actions',
              color: 'from-orange-500 to-red-500'
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg mb-3`} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
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
