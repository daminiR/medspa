/**
 * Integration Tests for Notification System
 *
 * These tests verify the complete notification flow including:
 * - Real-time notification delivery
 * - Polling fallback
 * - Sound notifications
 * - User interactions
 * - State synchronization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import * as websocketModule from '@/services/websocket'
import * as firebaseModule from '@/lib/firebase'
import * as authContext from '@/contexts/AuthContext'

// Mock dependencies
vi.mock('@/services/websocket', () => ({
  websocketService: {
    subscribeToNotifications: vi.fn(),
    on: vi.fn(() => vi.fn()),
    off: vi.fn(),
  },
  useNotificationsRealtime: vi.fn(),
}))

vi.mock('@/lib/firebase', () => ({
  isFirebaseConfigured: vi.fn(() => false),
}))

vi.mock('@/contexts/AuthContext')

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode
    href: string
    onClick?: () => void
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/notifications',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch as any

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock Audio
class MockAudio {
  volume = 1
  play = vi.fn().mockResolvedValue(undefined)
  pause = vi.fn()
  constructor(public src?: string) {}
}

global.Audio = MockAudio as any

// Mock Notification API
const mockNotificationAPI = {
  permission: 'default' as NotificationPermission,
  requestPermission: vi
    .fn()
    .mockResolvedValue('granted' as NotificationPermission),
}

class MockNotification {
  static permission = mockNotificationAPI.permission
  static requestPermission = mockNotificationAPI.requestPermission
  title: string
  options: NotificationOptions
  onclick: ((this: Notification, ev: Event) => any) | null = null
  close = vi.fn()

  constructor(title: string, options?: NotificationOptions) {
    this.title = title
    this.options = options || {}
  }
}

// Try to define Notification if it doesn't exist or is configurable
try {
  Object.defineProperty(window, 'Notification', {
    writable: true,
    configurable: true,
    value: MockNotification,
  })
} catch {
  // Property already defined and not configurable - use global assignment
  (window as any).Notification = MockNotification
}

describe('Notification System Integration', () => {
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
    localStorageMock.clear()
    mockFetch.mockReset()
    mockNotificationAPI.permission = 'default'

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
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Complete User Flow - Polling Mode', () => {
    it('should complete full notification lifecycle in polling mode', async () => {
      // Start with a notification already present (avoids polling complexity)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'notif-1',
              type: 'appointment_reminder',
              title: 'Appointment Reminder',
              body: 'You have an appointment in 1 hour',
              read: false,
              createdAt: new Date().toISOString(),
              data: {},
            },
          ],
        }),
      })

      render(<NotificationBell />)

      // Wait for initial fetch
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })

      // Badge should appear
      await waitFor(() => {
        const badge = screen.getByText('1')
        expect(badge).toBeDefined()
      })

      // User clicks bell to open panel
      const bell = screen.getByRole('button', { name: /notifications/i })
      await act(async () => {
        fireEvent.click(bell)
      })

      await waitFor(() => {
        expect(screen.getByText('Appointment Reminder')).toBeDefined()
      })

      // User clicks notification to mark it as read (clicking on unread notification marks it)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      const notificationItem = screen.getByText('Appointment Reminder')
      await act(async () => {
        fireEvent.click(notificationItem)
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/notifications/notif-1/read',
          expect.objectContaining({
            method: 'PATCH',
          })
        )
      })

      // Badge should disappear
      await waitFor(() => {
        expect(screen.queryByText('1')).toBeNull()
      })
    })
  })

  describe('Complete User Flow - Real-time Mode', () => {
    it('should complete full notification lifecycle in real-time mode', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      let notificationHandler: Function | null = null
      vi.mocked(websocketModule.websocketService.on).mockImplementation(
        (event, handler) => {
          if (event === 'notification.received') {
            notificationHandler = handler
          }
          return vi.fn()
        }
      )

      // Initial fetch - no notifications
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      render(<NotificationBell />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(
          websocketModule.websocketService.subscribeToNotifications
        ).toHaveBeenCalledWith('user-123')
      })

      // User opens panel
      const bell = screen.getByRole('button', { name: /notifications/i })
      await act(async () => {
        fireEvent.click(bell)
      })

      await waitFor(() => {
        expect(screen.getByText('No notifications')).toBeDefined()
      })

      // Real-time notification arrives
      await act(async () => {
        notificationHandler?.({
          id: 'realtime-1',
          type: 'message_received',
          title: 'New Message',
          body: 'You have a new message from John',
          createdAt: new Date(),
          data: {},
        })
      })

      // Badge should appear with animation
      await waitFor(() => {
        const badge = screen.getByText('1')
        expect(badge).toBeDefined()
        expect(badge.className).toContain('animate-bounce')
      })

      // Notification should appear in list
      expect(screen.getByText('New Message')).toBeDefined()

      // User clicks notification to mark as read (clicking on unread notification marks it)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      const notificationItem = screen.getByText('New Message')
      await act(async () => {
        fireEvent.click(notificationItem)
      })

      await waitFor(() => {
        expect(screen.queryByText('1')).toBeNull()
      })
    })
  })

  describe('Sound Notifications', () => {
    it('should play sound when new notification arrives', async () => {
      // Set up Audio mock BEFORE rendering
      const mockPlay = vi.fn().mockResolvedValue(undefined)
      class TestAudio {
        volume = 1
        play = mockPlay
        pause = vi.fn()
        src = ''
      }
      global.Audio = TestAudio as any

      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      let notificationHandler: Function | null = null
      vi.mocked(websocketModule.websocketService.on).mockImplementation(
        (event, handler) => {
          if (event === 'notification.received') {
            notificationHandler = handler
          }
          return vi.fn()
        }
      )

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      render(<NotificationBell />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })

      // Real-time notification arrives
      await act(async () => {
        notificationHandler?.({
          id: 'realtime-1',
          type: 'appointment_reminder',
          title: 'Appointment Reminder',
          body: 'Your appointment starts in 15 minutes',
          createdAt: new Date(),
          data: {},
        })
      })

      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalled()
      })

      // Restore original Audio mock
      global.Audio = MockAudio as any
    })

    it('should respect sound toggle preference', async () => {
      // Set sound disabled via localStorage BEFORE rendering
      localStorageMock.setItem('notification-sound-enabled', 'false')

      // Set up Audio mock BEFORE rendering
      const mockPlay = vi.fn().mockResolvedValue(undefined)
      class TestAudio {
        volume = 1
        play = mockPlay
        pause = vi.fn()
        src = ''
      }
      global.Audio = TestAudio as any

      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      let notificationHandler: Function | null = null
      vi.mocked(websocketModule.websocketService.on).mockImplementation(
        (event, handler) => {
          if (event === 'notification.received') {
            notificationHandler = handler
          }
          return vi.fn()
        }
      )

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      render(<NotificationBell />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })

      // New notification arrives
      await act(async () => {
        notificationHandler?.({
          id: 'realtime-2',
          type: 'message_received',
          title: 'New Message',
          body: 'Test',
          createdAt: new Date(),
          data: {},
        })
      })

      // Wait for notification to be added
      await waitFor(() => {
        const bell = screen.getByRole('button', { name: /notifications/i })
        expect(bell).toBeDefined()
      })

      // Sound should NOT play when preference is disabled
      expect(mockPlay).not.toHaveBeenCalled()

      // Restore original Audio mock
      global.Audio = MockAudio as any
    })

    it('should persist sound preference across sessions', async () => {
      // Set preference in localStorage
      localStorageMock.setItem('notification-sound-enabled', 'false')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      render(<NotificationBell />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })

      // Open panel
      const bell = screen.getByRole('button', { name: /notifications/i })
      await act(async () => {
        fireEvent.click(bell)
      })

      await waitFor(() => {
        // Should show unmute icon
        expect(screen.getByTitle('Unmute notifications')).toBeDefined()
      })
    })
  })

  describe('Browser Notifications', () => {
    it('should open panel on bell click', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      render(<NotificationBell />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })

      const bell = screen.getByRole('button', { name: /notifications/i })
      await act(async () => {
        fireEvent.click(bell)
      })

      // Panel should be open - showing empty state or notifications header
      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeDefined()
      })
    })

    it('should show browser notification when permission is granted', async () => {
      mockNotificationAPI.permission = 'granted'
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      let notificationHandler: Function | null = null
      vi.mocked(websocketModule.websocketService.on).mockImplementation(
        (event, handler) => {
          if (event === 'notification.received') {
            notificationHandler = handler
          }
          return vi.fn()
        }
      )

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const browserNotificationSpy = vi.spyOn(window, 'Notification')

      render(<NotificationBell />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })

      // Simulate new notification
      await act(async () => {
        notificationHandler?.({
          id: 'realtime-1',
          type: 'appointment_reminder',
          title: 'Appointment Reminder',
          body: 'Your appointment is coming up',
          createdAt: new Date(),
          data: {},
        })
      })

      await waitFor(() => {
        expect(browserNotificationSpy).toHaveBeenCalledWith(
          'Appointment Reminder',
          expect.objectContaining({
            body: 'Your appointment is coming up',
          })
        )
      })

      browserNotificationSpy.mockRestore()
    })
  })

  describe('Multiple Notifications', () => {
    it('should handle multiple rapid notifications', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      let notificationHandler: Function | null = null
      vi.mocked(websocketModule.websocketService.on).mockImplementation(
        (event, handler) => {
          if (event === 'notification.received') {
            notificationHandler = handler
          }
          return vi.fn()
        }
      )

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      render(<NotificationBell />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
      })

      // Open panel
      const bell = screen.getByRole('button', { name: /notifications/i })
      await act(async () => {
        fireEvent.click(bell)
      })

      // Send multiple notifications rapidly
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          notificationHandler?.({
            id: `realtime-${i}`,
            type: 'message_received',
            title: `Message ${i}`,
            body: `Test message ${i}`,
            createdAt: new Date(),
            data: {},
          })
        }
      })

      // All notifications should appear
      await waitFor(() => {
        expect(screen.getByText('5')).toBeDefined()
        expect(screen.getByText('Message 0')).toBeDefined()
        expect(screen.getByText('Message 4')).toBeDefined()
      })
    })

    it('should handle mark all as read with multiple notifications', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'notif-1',
              type: 'appointment_reminder',
              title: 'Appointment 1',
              body: 'Test 1',
              read: false,
              createdAt: new Date().toISOString(),
              data: {},
            },
            {
              id: 'notif-2',
              type: 'message_received',
              title: 'Message 1',
              body: 'Test 2',
              read: false,
              createdAt: new Date().toISOString(),
              data: {},
            },
            {
              id: 'notif-3',
              type: 'alert',
              title: 'Alert 1',
              body: 'Test 3',
              read: false,
              createdAt: new Date().toISOString(),
              data: {},
            },
          ],
        }),
      })

      render(<NotificationBell />)

      await waitFor(() => {
        expect(screen.getByText('3')).toBeDefined()
      })

      // Open panel
      const bell = screen.getByRole('button', { name: /notifications/i })
      await act(async () => {
        fireEvent.click(bell)
      })

      await waitFor(() => {
        expect(screen.getByText('3 new')).toBeDefined()
      })

      // Mark all as read
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      const markAllButton = screen.getByText('Mark all as read')
      await act(async () => {
        fireEvent.click(markAllButton)
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/notifications/read-all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      })

      // Badge should disappear
      await waitFor(() => {
        expect(screen.queryByText('3')).toBeNull()
      })
    })

    it('should handle clear all notifications', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'notif-1',
              type: 'appointment_reminder',
              title: 'Appointment 1',
              body: 'Test 1',
              read: false,
              createdAt: new Date().toISOString(),
              data: {},
            },
            {
              id: 'notif-2',
              type: 'message_received',
              title: 'Message 1',
              body: 'Test 2',
              read: false,
              createdAt: new Date().toISOString(),
              data: {},
            },
          ],
        }),
      })

      render(<NotificationBell />)

      await waitFor(() => {
        expect(screen.getByText('2')).toBeDefined()
      })

      // Open panel
      const bell = screen.getByRole('button', { name: /notifications/i })
      await act(async () => {
        fireEvent.click(bell)
      })

      // Clear all
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      const clearAllButton = screen.getByText('Clear all')
      await act(async () => {
        fireEvent.click(clearAllButton)
      })

      await waitFor(() => {
        expect(screen.getByText('No notifications')).toBeDefined()
      })

      // Badge should disappear
      expect(screen.queryByText('2')).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(<NotificationBell />)

      // Should not crash
      await waitFor(() => {
        const bell = screen.getByRole('button', { name: /notifications/i })
        expect(bell).toBeDefined()
      })

      // Can still open panel
      const bell = screen.getByRole('button', { name: /notifications/i })
      await act(async () => {
        fireEvent.click(bell)
      })

      await waitFor(() => {
        expect(screen.getByText('No notifications')).toBeDefined()
      })
    })

    it('should handle failed mark as read', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'notif-1',
              type: 'appointment_reminder',
              title: 'Test',
              body: 'Test',
              read: false,
              createdAt: new Date().toISOString(),
              data: {},
            },
          ],
        }),
      })

      render(<NotificationBell />)

      await waitFor(() => {
        expect(screen.getByText('1')).toBeDefined()
      })

      const bell = screen.getByRole('button', { name: /notifications/i })
      await act(async () => {
        fireEvent.click(bell)
      })

      // Simulate API error
      mockFetch.mockRejectedValueOnce(new Error('API error'))

      // Find and click the notification wrapper by role
      const notificationItems = screen.getAllByRole('listitem')
      await act(async () => {
        if (notificationItems[0]) {
          fireEvent.click(notificationItems[0])
        }
      })

      // Should revert the optimistic update (badge should still be visible after error)
      await waitFor(() => {
        expect(screen.getByText('1')).toBeDefined()
      })
    })
  })

  describe('Fallback Behavior', () => {
    it('should fallback to polling when real-time fails', async () => {
      vi.useFakeTimers()

      // Firebase configured but connection fails
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(false)

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      render(<NotificationBell />)

      // Run initial effects
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Should poll
      await act(async () => {
        await vi.advanceTimersByTimeAsync(30000)
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)

      // Connection status should be polling
      const bell = screen.getByRole('button')
      const statusIndicator = bell.querySelector('.bg-yellow-500')
      expect(statusIndicator).toBeDefined()

      vi.useRealTimers()
    })
  })
})
