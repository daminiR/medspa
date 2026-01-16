import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import * as useNotificationsHook from '@/hooks/useNotifications'
import * as authContext from '@/contexts/AuthContext'

// Mock the hooks
vi.mock('@/hooks/useNotifications')
vi.mock('@/contexts/AuthContext')
vi.mock('@/components/notifications/NotificationPanel', () => ({
  NotificationPanel: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="notification-panel">
      <button onClick={onClose}>Close Panel</button>
    </div>
  ),
}))

// Mock Notification API
const mockNotificationAPI = {
  permission: 'default' as NotificationPermission,
  requestPermission: vi.fn().mockResolvedValue('granted' as NotificationPermission),
}

Object.defineProperty(window, 'Notification', {
  writable: true,
  value: mockNotificationAPI,
})

describe('NotificationBell Component', () => {
  const mockUseNotifications = {
    notifications: [],
    isLoading: false,
    unreadCount: 0,
    soundEnabled: true,
    isRealtime: false,
    connectionStatus: 'polling' as const,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    clearAll: vi.fn(),
    deleteNotification: vi.fn(),
    toggleSound: vi.fn(),
    addNotification: vi.fn(),
  }

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    permissions: ['*'],
    locationIds: ['loc-001'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue(
      mockUseNotifications
    )
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      isLocked: false,
      sessionId: 'test-session-123',
      login: vi.fn(),
      logout: vi.fn(),
      lockScreen: vi.fn(),
      unlockWithPIN: vi.fn(),
      refreshSession: vi.fn(),
      hasPermission: vi.fn().mockReturnValue(true),
      hasRole: vi.fn().mockReturnValue(true),
      extendSession: vi.fn(),
    })
    mockNotificationAPI.permission = 'default'
  })

  describe('Rendering', () => {
    it('should render notification bell button', () => {
      render(<NotificationBell />)
      const bell = screen.getByRole('button', { name: /notifications/i })
      expect(bell).toBeDefined()
    })

    it('should display unread count badge when there are unread notifications', () => {
      vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 5,
      })

      render(<NotificationBell />)

      const badge = screen.getByText('5')
      expect(badge).toBeDefined()
      expect(badge.className).toContain('bg-red-500')
    })

    it('should display 99+ for counts over 99', () => {
      vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 150,
      })

      render(<NotificationBell />)

      const badge = screen.getByText('99+')
      expect(badge).toBeDefined()
    })

    it('should not display badge when there are no unread notifications', () => {
      render(<NotificationBell />)

      const badge = screen.queryByText('0')
      expect(badge).toBeNull()
    })

    it('should display connection status indicator - connected', () => {
      vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
        ...mockUseNotifications,
        connectionStatus: 'connected',
      })

      render(<NotificationBell />)

      const statusIndicator = screen
        .getByRole('button')
        .querySelector('.bg-green-500')
      expect(statusIndicator).toBeDefined()
    })

    it('should display connection status indicator - polling', () => {
      vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
        ...mockUseNotifications,
        connectionStatus: 'polling',
      })

      render(<NotificationBell />)

      const statusIndicator = screen
        .getByRole('button')
        .querySelector('.bg-yellow-500')
      expect(statusIndicator).toBeDefined()
    })

    it('should display connection status indicator - disconnected', () => {
      vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
        ...mockUseNotifications,
        connectionStatus: 'disconnected',
      })

      render(<NotificationBell />)

      const statusIndicator = screen
        .getByRole('button')
        .querySelector('.bg-gray-400')
      expect(statusIndicator).toBeDefined()
    })
  })

  describe('Badge Animation', () => {
    it('should animate badge when new notification arrives', async () => {
      const { rerender } = render(<NotificationBell />)

      // Simulate new notification
      vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 1,
      })

      rerender(<NotificationBell />)

      await waitFor(() => {
        const badge = screen.getByText('1')
        expect(badge.className).toContain('animate-bounce')
      })

      // Animation should stop after 1 second
      await waitFor(
        () => {
          const badge = screen.getByText('1')
          expect(badge.className).not.toContain('animate-bounce')
        },
        { timeout: 1500 }
      )
    })

    it('should not animate when count decreases', async () => {
      vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 5,
      })

      const { rerender } = render(<NotificationBell />)

      // Decrease count
      vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 4,
      })

      rerender(<NotificationBell />)

      const badge = screen.getByText('4')
      expect(badge.className).not.toContain('animate-bounce')
    })
  })

  describe('Click Handling', () => {
    it('should open panel when bell is clicked', async () => {
      render(<NotificationBell />)

      const bell = screen.getByRole('button', { name: /notifications/i })
      fireEvent.click(bell)

      await waitFor(() => {
        const panel = screen.getByTestId('notification-panel')
        expect(panel).toBeDefined()
      })

      expect(bell.getAttribute('aria-expanded')).toBe('true')
    })

    it('should close panel when bell is clicked again', async () => {
      render(<NotificationBell />)

      const bell = screen.getByRole('button', { name: /notifications/i })

      // Open panel
      fireEvent.click(bell)
      await waitFor(() => {
        expect(screen.getByTestId('notification-panel')).toBeDefined()
      })

      // Close panel
      fireEvent.click(bell)
      await waitFor(() => {
        expect(screen.queryByTestId('notification-panel')).toBeNull()
      })

      expect(bell.getAttribute('aria-expanded')).toBe('false')
    })

    it('should request notification permission on first click', async () => {
      render(<NotificationBell />)

      const bell = screen.getByRole('button', { name: /notifications/i })
      fireEvent.click(bell)

      await waitFor(() => {
        expect(mockNotificationAPI.requestPermission).toHaveBeenCalled()
      })
    })

    it('should not request permission if already granted', async () => {
      mockNotificationAPI.permission = 'granted'

      render(<NotificationBell />)

      const bell = screen.getByRole('button', { name: /notifications/i })
      fireEvent.click(bell)

      expect(mockNotificationAPI.requestPermission).not.toHaveBeenCalled()
    })

    it('should not request permission if denied', async () => {
      mockNotificationAPI.permission = 'denied'

      render(<NotificationBell />)

      const bell = screen.getByRole('button', { name: /notifications/i })
      fireEvent.click(bell)

      expect(mockNotificationAPI.requestPermission).not.toHaveBeenCalled()
    })
  })

  describe('Panel Closing', () => {
    it('should close panel when clicking outside', async () => {
      render(
        <div>
          <NotificationBell />
          <div data-testid="outside">Outside element</div>
        </div>
      )

      const bell = screen.getByRole('button', { name: /notifications/i })

      // Open panel
      fireEvent.click(bell)
      await waitFor(() => {
        expect(screen.getByTestId('notification-panel')).toBeDefined()
      })

      // Click outside
      const outside = screen.getByTestId('outside')
      fireEvent.mouseDown(outside)

      await waitFor(() => {
        expect(screen.queryByTestId('notification-panel')).toBeNull()
      })
    })

    it('should not close panel when clicking inside panel', async () => {
      render(<NotificationBell />)

      const bell = screen.getByRole('button', { name: /notifications/i })

      // Open panel
      fireEvent.click(bell)
      await waitFor(() => {
        expect(screen.getByTestId('notification-panel')).toBeDefined()
      })

      // Click inside panel
      const panel = screen.getByTestId('notification-panel')
      fireEvent.mouseDown(panel)

      // Panel should still be open
      expect(screen.getByTestId('notification-panel')).toBeDefined()
    })

    it('should close panel when pressing Escape key', async () => {
      render(<NotificationBell />)

      const bell = screen.getByRole('button', { name: /notifications/i })

      // Open panel
      fireEvent.click(bell)
      await waitFor(() => {
        expect(screen.getByTestId('notification-panel')).toBeDefined()
      })

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByTestId('notification-panel')).toBeNull()
      })
    })

    it('should close panel when panel calls onClose', async () => {
      render(<NotificationBell />)

      const bell = screen.getByRole('button', { name: /notifications/i })

      // Open panel
      fireEvent.click(bell)
      await waitFor(() => {
        expect(screen.getByTestId('notification-panel')).toBeDefined()
      })

      // Click close button in panel
      const closeButton = screen.getByText('Close Panel')
      fireEvent.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByTestId('notification-panel')).toBeNull()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria attributes', () => {
      vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 3,
        isRealtime: true,
      })

      render(<NotificationBell />)

      const bell = screen.getByRole('button')
      expect(bell.getAttribute('aria-label')).toContain('3 unread')
      expect(bell.getAttribute('aria-label')).toContain('live')
      expect(bell.getAttribute('aria-expanded')).toBe('false')
      expect(bell.getAttribute('aria-haspopup')).toBe('true')
    })

    it('should update aria-expanded when panel opens', async () => {
      render(<NotificationBell />)

      const bell = screen.getByRole('button')
      expect(bell.getAttribute('aria-expanded')).toBe('false')

      fireEvent.click(bell)

      await waitFor(() => {
        expect(bell.getAttribute('aria-expanded')).toBe('true')
      })
    })

    it('should have focus styles', () => {
      render(<NotificationBell />)

      const bell = screen.getByRole('button')
      expect(bell.className).toContain('focus:outline-none')
      expect(bell.className).toContain('focus:ring-2')
      expect(bell.className).toContain('focus:ring-purple-500')
    })

    it('should have title attribute for connection status', () => {
      vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
        ...mockUseNotifications,
        connectionStatus: 'connected',
      })

      render(<NotificationBell />)

      const bell = screen.getByRole('button')
      expect(bell.getAttribute('title')).toBe('Real-time updates active')
    })
  })

  describe('Integration with useNotifications', () => {
    it('should pass staffUserId to useNotifications hook', () => {
      render(<NotificationBell />)

      expect(useNotificationsHook.useNotifications).toHaveBeenCalledWith({
        staffUserId: 'user-123',
        enableRealtime: true,
      })
    })

    it('should handle missing user gracefully', () => {
      vi.mocked(authContext.useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isLocked: false,
        sessionId: null,
        login: vi.fn(),
        logout: vi.fn(),
        lockScreen: vi.fn(),
        unlockWithPIN: vi.fn(),
        refreshSession: vi.fn(),
        hasPermission: vi.fn().mockReturnValue(false),
        hasRole: vi.fn().mockReturnValue(false),
        extendSession: vi.fn(),
      })

      render(<NotificationBell />)

      expect(useNotificationsHook.useNotifications).toHaveBeenCalledWith({
        staffUserId: '',
        enableRealtime: true,
      })
    })
  })

  describe('Visual States', () => {
    it('should apply hover styles', () => {
      render(<NotificationBell />)

      const bell = screen.getByRole('button')
      expect(bell.className).toContain('hover:text-gray-500')
    })

    it('should have transition animations', () => {
      render(<NotificationBell />)

      const bell = screen.getByRole('button')
      expect(bell.className).toContain('transition-colors')
    })

    it('should position badge correctly', () => {
      vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 1,
      })

      render(<NotificationBell />)

      const badge = screen.getByText('1')
      expect(badge.className).toContain('absolute')
      expect(badge.className).toContain('-top-0.5')
      expect(badge.className).toContain('-right-0.5')
    })

    it('should position connection status indicator correctly', () => {
      render(<NotificationBell />)

      const statusIndicator = screen
        .getByRole('button')
        .querySelector('.w-2.h-2.rounded-full')
      expect(statusIndicator?.className).toContain('absolute')
      expect(statusIndicator?.className).toContain('-bottom-0.5')
      expect(statusIndicator?.className).toContain('-right-0.5')
    })
  })

  describe('Multiple Click Scenarios', () => {
    it('should handle rapid clicking', async () => {
      render(<NotificationBell />)

      const bell = screen.getByRole('button')

      // Click multiple times rapidly
      fireEvent.click(bell)
      fireEvent.click(bell)
      fireEvent.click(bell)

      await waitFor(() => {
        // Panel should be closed after odd number of clicks
        expect(screen.queryByTestId('notification-panel')).toBeNull()
      })
    })
  })

  describe('Cleanup', () => {
    it('should remove event listeners when panel is closed', async () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { unmount } = render(<NotificationBell />)

      const bell = screen.getByRole('button')
      fireEvent.click(bell)

      await waitFor(() => {
        expect(screen.getByTestId('notification-panel')).toBeDefined()
      })

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalled()

      removeEventListenerSpy.mockRestore()
    })

    it('should clear animation timer on unmount', async () => {
      vi.useFakeTimers()

      const { unmount } = render(<NotificationBell />)

      // Simulate new notification
      vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 1,
      })

      unmount()

      // Should not cause errors when timer fires
      vi.advanceTimersByTime(1000)

      vi.useRealTimers()
    })
  })
})
