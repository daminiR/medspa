# Command Palette Integration Guide

Complete guide for integrating the Command Palette into your Medical Spa application.

## Quick Start (5 minutes)

### 1. Import the hook and component

```tsx
import { useCommandPalette } from '@/hooks/useCommandPalette'
import CommandPalette from '@/components/messaging/CommandPalette'
```

### 2. Use the hook in your component

```tsx
function MessagesPage() {
  const {
    isOpen,
    close,
    executeCommand,
    recentCommands
  } = useCommandPalette()

  // Your page code...
}
```

### 3. Add the CommandPalette component

```tsx
return (
  <div>
    {/* Your page content */}

    <CommandPalette
      isOpen={isOpen}
      onClose={close}
      onCommand={executeCommand}
      recentCommands={recentCommands}
    />
  </div>
)
```

**That's it!** The command palette will now open with `Cmd+K` / `Ctrl+K`.

---

## Full Integration Example

Here's a complete example integrating the command palette into the Messages page:

```tsx
'use client'

import { useState } from 'react'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import CommandPalette from '@/components/messaging/CommandPalette'

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)

  // Command Palette hook
  const {
    isOpen,
    close,
    executeCommand,
    recentCommands
  } = useCommandPalette()

  // Handle command execution
  const handleCommand = (command: string, payload?: any) => {
    switch (command) {
      case 'close-conversation':
        if (selectedConversation) {
          // Close the conversation
          console.log('Closing conversation:', selectedConversation)
          // Add your close logic here
        }
        break

      case 'snooze':
        if (selectedConversation) {
          // Snooze the conversation
          console.log('Snoozing conversation:', selectedConversation)
          // Add your snooze logic here
        }
        break

      case 'assign':
        setShowAssignModal(true)
        break

      case 'add-tag':
        setShowTagModal(true)
        break

      case 'send-close':
        // Send message and close
        console.log('Send and close')
        // Add your logic here
        break

      case 'goto-conversation':
        // Focus search or show conversation picker
        document.getElementById('conversation-search')?.focus()
        break

      case 'goto-patient':
        if (selectedConversation) {
          // Navigate to patient profile
          // window.location.href = `/patients/${patientId}`
        }
        break

      case 'insert-quick-reply':
        // Show quick reply picker
        console.log('Showing quick replies')
        break

      case 'search-conversations':
        document.getElementById('conversation-search')?.focus()
        break

      case 'view-shortcuts':
        // Show shortcuts modal
        console.log('Showing shortcuts help')
        break

      default:
        console.warn('Unknown command:', command)
    }

    // Execute the command (tracks in recent)
    executeCommand(command, payload)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your page content */}
      <div className="p-6">
        <h1>Messages</h1>
        {/* ... rest of your page ... */}
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isOpen}
        onClose={close}
        onCommand={handleCommand}
        recentCommands={recentCommands}
      />

      {/* Other modals */}
      {showAssignModal && (
        <AssignModal onClose={() => setShowAssignModal(false)} />
      )}
      {showTagModal && (
        <TagModal onClose={() => setShowTagModal(false)} />
      )}
    </div>
  )
}
```

---

## Advanced Usage

### Custom Commands

You can extend the command palette with your own commands by modifying `CommandPalette.tsx`:

```tsx
// In CommandPalette.tsx, add to allCommands array:
{
  id: 'my-custom-command',
  name: 'My Custom Action',
  description: 'Does something custom',
  category: 'actions',
  icon: <MyIcon className="h-4 w-4" />,
  shortcut: '⌘M',
  action: () => onCommand('my-custom-command'),
  keywords: ['custom', 'special', 'my']
}
```

### Context-Aware Commands

Show different commands based on context:

```tsx
function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const { executeCommand, ...paletteProps } = useCommandPalette()

  const handleCommand = (command: string, payload?: any) => {
    // Only allow certain commands if a conversation is selected
    if (!selectedConversation && ['close-conversation', 'assign', 'add-tag'].includes(command)) {
      alert('Please select a conversation first')
      return
    }

    // Execute command
    executeCommand(command, payload)
  }

  // ...
}
```

### Programmatically Opening the Palette

```tsx
const { open } = useCommandPalette()

// Open from a button
<button onClick={open}>
  Open Commands
</button>

// Open from another keyboard shortcut
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === '?' && e.shiftKey) { // Shift + ?
      open()
    }
  }
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [open])
```

### Clearing Recent Commands

```tsx
const { clearRecent, recentCommands } = useCommandPalette()

// Show clear button if there are recent commands
{recentCommands.length > 0 && (
  <button onClick={clearRecent}>
    Clear Recent Commands
  </button>
)}
```

---

## Individual Keyboard Shortcuts

While the command palette provides a searchable interface, you can also add direct keyboard shortcuts:

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if user is typing in an input
    const isTyping = ['INPUT', 'TEXTAREA'].includes(
      (e.target as HTMLElement).tagName
    )

    if (isTyping) return

    // Close conversation - Cmd+Shift+C
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
      e.preventDefault()
      executeCommand('close-conversation')
    }

    // Snooze - Cmd+S
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      executeCommand('snooze')
    }

    // Assign - A
    if (e.key === 'a') {
      e.preventDefault()
      executeCommand('assign')
    }

    // Add tag - T
    if (e.key === 't') {
      e.preventDefault()
      executeCommand('add-tag')
    }

    // Send & Close - Cmd+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      executeCommand('send-close')
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [executeCommand])
```

---

## Styling Customization

### Changing Colors

The command palette uses Tailwind classes. To change the primary color from indigo to your brand color:

```tsx
// Find in CommandPalette.tsx and replace:
'bg-indigo-50'     → 'bg-blue-50'
'text-indigo-600'  → 'text-blue-600'
'ring-indigo-500'  → 'ring-blue-500'
// etc.
```

### Adjusting Size

```tsx
// In CommandPalette.tsx, find:
<div className="... max-w-2xl ...">

// Change to:
<div className="... max-w-3xl ...">  // Wider
<div className="... max-w-xl ...">   // Narrower
```

### Animation Speed

```tsx
// Find the animation classes:
className="... duration-200 ..."

// Change to:
className="... duration-300 ..."  // Slower
className="... duration-100 ..."  // Faster
```

---

## Testing

### Manual Testing Checklist

- [ ] Command palette opens with `Cmd+K` / `Ctrl+K`
- [ ] Command palette closes with `Esc`
- [ ] Backdrop click closes the palette
- [ ] Arrow keys navigate commands
- [ ] Enter executes selected command
- [ ] Search filters commands correctly
- [ ] Recent commands appear at the top
- [ ] Keyboard shortcuts display correctly
- [ ] All commands execute their actions
- [ ] Mobile responsive (if applicable)

### Unit Tests (Example with Jest/Vitest)

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import CommandPalette from './CommandPalette'

describe('CommandPalette', () => {
  it('renders when open', () => {
    const onClose = jest.fn()
    const onCommand = jest.fn()

    render(
      <CommandPalette
        isOpen={true}
        onClose={onClose}
        onCommand={onCommand}
      />
    )

    expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument()
  })

  it('closes on Escape key', () => {
    const onClose = jest.fn()
    const onCommand = jest.fn()

    render(
      <CommandPalette
        isOpen={true}
        onClose={onClose}
        onCommand={onCommand}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('filters commands by search', () => {
    const onClose = jest.fn()
    const onCommand = jest.fn()

    render(
      <CommandPalette
        isOpen={true}
        onClose={onClose}
        onCommand={onCommand}
      />
    )

    const input = screen.getByPlaceholderText(/type a command/i)
    fireEvent.change(input, { target: { value: 'close' } })

    expect(screen.getByText(/close conversation/i)).toBeInTheDocument()
  })
})
```

---

## Performance Optimization

### Lazy Loading

For large applications, you can lazy load the command palette:

```tsx
import { lazy, Suspense } from 'react'

const CommandPalette = lazy(() => import('@/components/messaging/CommandPalette'))

function MyPage() {
  const { isOpen, ...rest } = useCommandPalette()

  return (
    <div>
      {/* Page content */}

      {isOpen && (
        <Suspense fallback={null}>
          <CommandPalette isOpen={isOpen} {...rest} />
        </Suspense>
      )}
    </div>
  )
}
```

### Memoization

The component already uses `useMemo` for filtering, but you can further optimize:

```tsx
const handleCommand = useCallback((command: string, payload?: any) => {
  // Your command logic
}, [/* dependencies */])
```

---

## Troubleshooting

### Command palette won't open

1. Check that `useCommandPalette` hook is being called
2. Verify no other component is capturing `Cmd+K`
3. Check browser console for errors
4. Ensure `isOpen` state is being updated

### Keyboard shortcuts not working

1. Check if user is typing in an input field
2. Verify keyboard event listeners are attached
3. Test on different browsers
4. Check for conflicting shortcuts

### Styling looks broken

1. Verify Tailwind CSS is properly configured
2. Check for CSS conflicts
3. Ensure lucide-react icons are installed
4. Clear browser cache

### Recent commands not persisting

1. Check browser's localStorage is enabled
2. Verify localStorage quota is not exceeded
3. Check for incognito/private browsing mode
4. Look for errors in browser console

---

## Support & Resources

- **Component File**: `/src/components/messaging/CommandPalette.tsx`
- **Hook File**: `/src/hooks/useCommandPalette.ts`
- **Types File**: `/src/components/messaging/CommandPalette.types.ts`
- **Demo File**: `/src/components/messaging/CommandPalette.demo.tsx`
- **Documentation**: `/src/components/messaging/CommandPalette.README.md`

---

## Migration from Manual Implementation

If you have existing keyboard shortcuts, here's how to migrate:

### Before (Manual)

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      // Open some search modal
    }
    if (e.key === 'Escape') {
      // Close modal
    }
    // ... many more shortcuts
  }
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [])
```

### After (Command Palette)

```tsx
const { isOpen, close, executeCommand, recentCommands } = useCommandPalette()

// That's it! Cmd+K is handled automatically
```

---

*Last updated: January 2026*
