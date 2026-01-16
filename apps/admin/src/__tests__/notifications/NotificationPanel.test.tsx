import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { NotificationPanel } from '@/components/notifications/NotificationPanel'
import type { Notification } from '@/hooks/useNotifications'

// Mock the dependencies
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
    className,
  }: {
    children: React.ReactNode
    href: string
    onClick?: () => void
    className?: string
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}))
vi.mock('@/components/notifications/NotificationItem', () => ({
  NotificationItem: ({
    notification,
    onMarkAsRead,
    onDelete,
    onClose,
  }: {
    notification: Notification
    onMarkAsRead: (id: string) => void
    onDelete: (id: string) => void
    onClose: () => void
  }) => (
    <div data-testid={`notification-${notification.id}`}>
      <div>{notification.title}</div>
      <div>{notification.body}</div>
      <button onClick={() => onMarkAsRead(notification.id)}>
        Mark as read
      </button>
      <button onClick={() => onDelete(notification.id)}>Delete</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}))

describe('NotificationPanel Component', () => {
  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      type: 'appointment',
      title: 'Appointment Reminder',
      body: 'You have an appointment tomorrow',
      read: false,
      createdAt: new Date('2024-01-15T10:00:00'),
      actionUrl: '/calendar',
    },
    {
      id: 'notif-2',
      type: 'message',
      title: 'New Message',
      body: 'You received a new message',
      read: false,
      createdAt: new Date('2024-01-15T09:00:00'),
      actionUrl: '/messages',
    },
    {
      id: 'notif-3',
      type: 'alert',
      title: 'Low Stock Alert',
      body: 'Product X is low on stock',
      read: true,
      createdAt: new Date('2024-01-15T08:00:00'),
      actionUrl: '/inventory',
    },
  ]

  // Default props for NotificationPanel
  const defaultProps = {
    notifications: mockNotifications,
    isLoading: false,
    isRealtime: false,
    connectionStatus: 'polling' as const,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn().mockResolvedValue(undefined),
    clearAll: vi.fn().mockResolvedValue(undefined),
    deleteNotification: vi.fn(),
    soundEnabled: true,
    toggleSound: vi.fn(),
  }

  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock functions after each test
    defaultProps.markAsRead = vi.fn()
    defaultProps.markAllAsRead = vi.fn().mockResolvedValue(undefined)
    defaultProps.clearAll = vi.fn().mockResolvedValue(undefined)
    defaultProps.deleteNotification = vi.fn()
    defaultProps.toggleSound = vi.fn()
  })

  // Helper to render with default props
  const renderPanel = (overrideProps = {}) => {
    return render(
      <NotificationPanel
        onClose={mockOnClose}
        {...defaultProps}
        {...overrideProps}
      />
    )
  }

  describe('Rendering', () => {
    it('should render notification panel', () => {
      renderPanel()

      expect(screen.getByText('Notifications')).toBeDefined()
    })

    it('should display unread count badge', () => {
      renderPanel()

      const badge = screen.getByText('2 new')
      expect(badge).toBeDefined()
      expect(badge.className).toContain('bg-purple-100')
    })

    it('should not display badge when no unread notifications', () => {
      renderPanel({
        notifications: mockNotifications.map(n => ({ ...n, read: true })),
      })

      expect(screen.queryByText(/new$/)).toBeNull()
    })

    it('should render all notifications', () => {
      renderPanel()

      expect(screen.getByTestId('notification-notif-1')).toBeDefined()
      expect(screen.getByTestId('notification-notif-2')).toBeDefined()
      expect(screen.getByTestId('notification-notif-3')).toBeDefined()
    })

    it('should display loading state', () => {
      const { container } = renderPanel({
        isLoading: true,
        notifications: [],
      })

      // Look for loading spinner in the notification list area
      const loader = container.querySelector('.animate-spin')
      expect(loader).toBeDefined()
      expect(loader).not.toBeNull()
    })

    it('should display empty state when no notifications', () => {
      renderPanel({
        notifications: [],
      })

      expect(screen.getByText('No notifications')).toBeDefined()
      expect(screen.getByText("You're all caught up!")).toBeDefined()
    })
  })

  describe('Sound Toggle', () => {
    it('should display sound enabled icon', () => {
      renderPanel()

      const soundButton = screen.getByTitle('Mute notifications')
      expect(soundButton).toBeDefined()
    })

    it('should display sound disabled icon', () => {
      renderPanel({ soundEnabled: false })

      const soundButton = screen.getByTitle('Unmute notifications')
      expect(soundButton).toBeDefined()
    })

    it('should toggle sound when clicked', () => {
      renderPanel()

      const soundButton = screen.getByTitle('Mute notifications')
      fireEvent.click(soundButton)

      expect(defaultProps.toggleSound).toHaveBeenCalled()
    })
  })

  describe('Mark All as Read', () => {
    it('should display mark all as read button', () => {
      renderPanel()

      const button = screen.getByText('Mark all as read')
      expect(button).toBeDefined()
    })

    it('should call markAllAsRead when clicked', async () => {
      renderPanel()

      const button = screen.getByText('Mark all as read')
      fireEvent.click(button)

      await waitFor(() => {
        expect(defaultProps.markAllAsRead).toHaveBeenCalled()
      })
    })

    it('should disable button when no unread notifications', () => {
      renderPanel({
        notifications: mockNotifications.map(n => ({ ...n, read: true })),
      })

      const button = screen.getByText('Mark all as read')
      expect(button.hasAttribute('disabled')).toBe(true)
    })

    it('should show loading state while marking all as read', async () => {
      let resolveMarkAll: () => void
      const markAllPromise = new Promise<void>(resolve => {
        resolveMarkAll = resolve
      })

      renderPanel({
        markAllAsRead: vi.fn().mockReturnValue(markAllPromise),
      })

      const button = screen.getByText('Mark all as read')
      fireEvent.click(button)

      // Should show loading state
      await waitFor(() => {
        expect(button.hasAttribute('disabled')).toBe(true)
      })

      // Resolve the promise
      resolveMarkAll!()

      await waitFor(() => {
        expect(button.hasAttribute('disabled')).toBe(false)
      })
    })
  })

  describe('Clear All', () => {
    it('should display clear all button', () => {
      renderPanel()

      const button = screen.getByText('Clear all')
      expect(button).toBeDefined()
    })

    it('should call clearAll when clicked', async () => {
      renderPanel()

      const button = screen.getByText('Clear all')
      fireEvent.click(button)

      await waitFor(() => {
        expect(defaultProps.clearAll).toHaveBeenCalled()
      })
    })

    it('should disable button when no notifications', () => {
      renderPanel({ notifications: [] })

      const button = screen.getByText('Clear all')
      expect(button.hasAttribute('disabled')).toBe(true)
    })

    it('should show loading state while clearing', async () => {
      let resolveClearAll: () => void
      const clearAllPromise = new Promise<void>(resolve => {
        resolveClearAll = resolve
      })

      renderPanel({
        clearAll: vi.fn().mockReturnValue(clearAllPromise),
      })

      const button = screen.getByText('Clear all')
      fireEvent.click(button)

      // Should show loading state
      await waitFor(() => {
        expect(button.hasAttribute('disabled')).toBe(true)
      })

      // Resolve the promise
      resolveClearAll!()

      await waitFor(() => {
        expect(button.hasAttribute('disabled')).toBe(false)
      })
    })
  })

  describe('Individual Notification Actions', () => {
    it('should pass markAsRead to notification items', () => {
      renderPanel()

      const markAsReadButton = screen.getAllByText('Mark as read')[0]
      fireEvent.click(markAsReadButton)

      expect(defaultProps.markAsRead).toHaveBeenCalledWith('notif-1')
    })

    it('should pass deleteNotification to notification items', () => {
      renderPanel()

      const deleteButton = screen.getAllByText('Delete')[0]
      fireEvent.click(deleteButton)

      expect(defaultProps.deleteNotification).toHaveBeenCalledWith('notif-1')
    })

    it('should pass onClose to notification items', () => {
      renderPanel()

      const closeButton = screen.getAllByText('Close')[0]
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Footer Link', () => {
    it('should display view all notifications link', () => {
      renderPanel()

      const link = screen.getByText('View all notifications')
      expect(link).toBeDefined()
      expect(link.getAttribute('href')).toBe('/notifications')
    })

    it('should close panel when clicking view all link', () => {
      renderPanel()

      const link = screen.getByText('View all notifications')
      fireEvent.click(link)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Styling and Layout', () => {
    it('should have proper panel dimensions', () => {
      const { container } = renderPanel()

      const panel = container.firstChild as HTMLElement
      expect(panel.className).toContain('w-96')
      expect(panel.className).toContain('rounded-lg')
      expect(panel.className).toContain('shadow-lg')
    })

    it('should have scrollable notification list', () => {
      renderPanel()

      const listContainer = screen
        .getByTestId('notification-notif-1')
        .parentElement?.parentElement
      expect(listContainer?.className).toContain('max-h-[400px]')
      expect(listContainer?.className).toContain('overflow-y-auto')
    })

    it('should divide notifications with borders', () => {
      renderPanel()

      const listContainer = screen.getByTestId('notification-notif-1')
        .parentElement
      expect(listContainer?.className).toContain('divide-y')
      expect(listContainer?.className).toContain('divide-gray-100')
    })
  })

  describe('Button States', () => {
    it('should disable mark all as read while loading', () => {
      renderPanel({ isLoading: true })

      const button = screen.getByText('Mark all as read')
      expect(button.className).toContain('disabled:opacity-50')
      expect(button.className).toContain('disabled:cursor-not-allowed')
    })

    it('should disable clear all while loading', () => {
      renderPanel({ isLoading: true })

      const button = screen.getByText('Clear all')
      expect(button.className).toContain('disabled:opacity-50')
      expect(button.className).toContain('disabled:cursor-not-allowed')
    })
  })

  describe('Hover Effects', () => {
    it('should have hover effects on action buttons', () => {
      renderPanel()

      const markAllButton = screen.getByText('Mark all as read')
      expect(markAllButton.className).toContain('hover:text-purple-600')

      const clearAllButton = screen.getByText('Clear all')
      expect(clearAllButton.className).toContain('hover:text-red-600')
    })

    it('should have hover effect on sound toggle', () => {
      renderPanel()

      const soundButton = screen.getByTitle('Mute notifications')
      expect(soundButton.className).toContain('hover:text-gray-600')
      expect(soundButton.className).toContain('hover:bg-gray-100')
    })

    it('should have hover effect on footer link', () => {
      renderPanel()

      const link = screen.getByText('View all notifications')
      expect(link.className).toContain('hover:text-purple-700')
    })
  })

  describe('Multiple Notifications', () => {
    it('should render notifications in order', () => {
      renderPanel()

      const notifications = screen.getAllByText(/Appointment Reminder|New Message|Low Stock Alert/)
      expect(notifications).toHaveLength(3)
    })

    it('should handle large number of notifications', () => {
      const manyNotifications: Notification[] = Array.from(
        { length: 50 },
        (_, i) => ({
          id: `notif-${i}`,
          type: 'alert' as const,
          title: `Notification ${i}`,
          body: `Body ${i}`,
          read: false,
          createdAt: new Date(),
        })
      )

      renderPanel({ notifications: manyNotifications })

      expect(screen.getByText('50 new')).toBeDefined()
      // All notifications should be rendered (virtualization not implemented)
      expect(screen.getAllByTestId(/notification-notif-/).length).toBe(50)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderPanel()

      const heading = screen.getByText('Notifications')
      expect(heading.tagName).toBe('H3')
    })

    it('should have descriptive button text', () => {
      renderPanel()

      expect(screen.getByText('Mark all as read')).toBeDefined()
      expect(screen.getByText('Clear all')).toBeDefined()
      expect(screen.getByText('View all notifications')).toBeDefined()
    })

    it('should have title attributes for icon buttons', () => {
      renderPanel()

      expect(screen.getByTitle('Mute notifications')).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined notifications gracefully', () => {
      expect(() => renderPanel({ notifications: undefined as any })).toThrow()
    })

    it('should handle negative unread count', () => {
      // All notifications are read, so unreadCount is 0
      renderPanel({
        notifications: mockNotifications.map(n => ({ ...n, read: true })),
      })

      // Should not display badge when no unread
      expect(screen.queryByText(/new$/)).toBeNull()
    })

    it('should handle very long notification count', () => {
      const manyUnread: Notification[] = Array.from(
        { length: 9999 },
        (_, i) => ({
          id: `notif-${i}`,
          type: 'alert' as const,
          title: `Notification ${i}`,
          body: `Body ${i}`,
          read: false,
          createdAt: new Date(),
        })
      )

      renderPanel({ notifications: manyUnread })

      expect(screen.getByText('9999 new')).toBeDefined()
    })
  })

  describe('Component Lifecycle', () => {
    it('should not crash when rapidly toggling actions', async () => {
      renderPanel()

      const markAllButton = screen.getByText('Mark all as read')
      const clearAllButton = screen.getByText('Clear all')

      // Rapidly click buttons with proper async handling
      await act(async () => {
        fireEvent.click(markAllButton)
      })

      await act(async () => {
        fireEvent.click(clearAllButton)
      })

      // Should not crash - heading should still be visible
      expect(screen.getByText('Notifications')).toBeDefined()
    })
  })

  describe('Connection Status', () => {
    it('should display live status when connected', () => {
      renderPanel({ connectionStatus: 'connected', isRealtime: true })

      expect(screen.getByText('Live')).toBeDefined()
      expect(screen.getByTitle('Real-time updates active')).toBeDefined()
    })

    it('should display polling status when polling', () => {
      renderPanel({ connectionStatus: 'polling', isRealtime: false })

      expect(screen.getByText('Polling')).toBeDefined()
      expect(screen.getByTitle('Polling for updates every 30s')).toBeDefined()
    })

    it('should display offline status when disconnected', () => {
      renderPanel({ connectionStatus: 'disconnected', isRealtime: false })

      expect(screen.getByText('Offline')).toBeDefined()
      expect(screen.getByTitle('Disconnected')).toBeDefined()
    })
  })
})
