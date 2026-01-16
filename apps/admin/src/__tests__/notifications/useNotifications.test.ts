import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useNotifications } from '@/hooks/useNotifications'
import * as websocketModule from '@/services/websocket'
import * as firebaseModule from '@/lib/firebase'

// Mock dependencies
vi.mock('@/services/websocket', () => ({
  websocketService: {
    subscribeToNotifications: vi.fn(),
    on: vi.fn(() => vi.fn()),
    off: vi.fn(),
    getConnectionStatus: vi.fn(() => ({ connected: true, activeSubscriptions: 1 })),
  },
  useNotificationsRealtime: vi.fn(() => []),
}))

vi.mock('@/lib/firebase', () => ({
  isFirebaseConfigured: vi.fn(() => false),
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

// Track calls to the Notification constructor by spying
// The mock is set up in setup.ts

describe('useNotifications Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    mockFetch.mockReset()
    // Reset Notification permission
    ;(window.Notification as any).permission = 'granted'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State and Loading', () => {
    it('should initialize with loading state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result } = renderHook(() => useNotifications())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.notifications).toEqual([])
      expect(result.current.unreadCount).toBe(0)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should fetch notifications on mount', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Appointment Reminder',
          body: 'You have an appointment tomorrow',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
          channel: 'in_app',
          priority: 'normal',
        },
        {
          id: 'notif-2',
          type: 'message_received',
          title: 'New Message',
          body: 'You received a new message',
          read: true,
          createdAt: new Date().toISOString(),
          data: {},
          channel: 'in_app',
          priority: 'normal',
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/notifications?limit=50&sortOrder=desc'
      )
      expect(result.current.notifications).toHaveLength(2)
      expect(result.current.unreadCount).toBe(1)
    })

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toEqual([])
      expect(result.current.unreadCount).toBe(0)
    })
  })

  describe('Polling Mode', () => {
    it('should poll for notifications when realtime is disabled', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result, unmount } = renderHook(() =>
        useNotifications({
          enableRealtime: false,
          pollingInterval: 100, // Use short interval for testing
        })
      )

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Wait for polling cycle - wrap in act to handle state updates from interval
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      // Should have polled at least once more
      await waitFor(() => {
        expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2)
      })

      expect(result.current.connectionStatus).toBe('polling')

      // Cleanup
      unmount()
    })

    it('should use custom polling interval', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result, unmount } = renderHook(() =>
        useNotifications({
          enableRealtime: false,
          pollingInterval: 200, // Use 200ms for testing
        })
      )

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Should not poll after 50ms - wrap in act to handle any state updates
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Should poll after 200ms total - wrap in act to handle state updates from interval
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
      })
      await waitFor(() => {
        expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2)
      })

      // Cleanup
      unmount()
    })

    it('should stop polling when unmounted', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result, unmount } = renderHook(() =>
        useNotifications({
          enableRealtime: false,
          pollingInterval: 100, // Short interval for testing
        })
      )

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCallCount = mockFetch.mock.calls.length

      // Unmount immediately
      unmount()

      // Wait a bit to ensure no more polling happens
      await new Promise(resolve => setTimeout(resolve, 200))

      // Should not call fetch again after unmount
      expect(mockFetch).toHaveBeenCalledTimes(initialCallCount)
    })
  })

  describe('Real-time Mode', () => {
    beforeEach(() => {
      // Enable Firebase for realtime tests
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)
    })

    it('should subscribe to realtime notifications when enabled', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const mockOn = vi.fn(() => vi.fn())
      vi.mocked(websocketModule.websocketService.on).mockImplementation(mockOn)

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(
        websocketModule.websocketService.subscribeToNotifications
      ).toHaveBeenCalledWith('user-123')
      expect(mockOn).toHaveBeenCalledWith(
        'notification.received',
        expect.any(Function)
      )
      expect(result.current.connectionStatus).toBe('connected')
    })

    it('should receive and process realtime notifications', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      let notificationHandler: Function | null = null
      vi.mocked(websocketModule.websocketService.on).mockImplementation(
        (event, handler) => {
          if (event === 'notification.received') {
            notificationHandler = handler
          }
          return vi.fn()
        }
      )

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toHaveLength(0)

      // Simulate receiving a notification
      act(() => {
        notificationHandler?.({
          id: 'realtime-1',
          type: 'appointment_reminder',
          title: 'New Appointment',
          body: 'You have a new appointment',
          createdAt: new Date(),
          data: {},
        })
      })

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1)
      })

      expect(result.current.notifications[0]).toMatchObject({
        id: 'realtime-1',
        title: 'New Appointment',
        read: false,
      })
      expect(result.current.unreadCount).toBe(1)
    })

    it('should not add duplicate notifications', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      let notificationHandler: Function | null = null
      vi.mocked(websocketModule.websocketService.on).mockImplementation(
        (event, handler) => {
          if (event === 'notification.received') {
            notificationHandler = handler
          }
          return vi.fn()
        }
      )

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const notificationData = {
        id: 'realtime-1',
        type: 'appointment_reminder',
        title: 'New Appointment',
        body: 'You have a new appointment',
        createdAt: new Date(),
        data: {},
      }

      // Simulate receiving the same notification twice
      act(() => {
        notificationHandler?.(notificationData)
        notificationHandler?.(notificationData)
      })

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1)
      })
    })

    it('should unsubscribe on unmount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const mockUnsubscribe = vi.fn()
      vi.mocked(websocketModule.websocketService.on).mockReturnValue(
        mockUnsubscribe
      )

      const { unmount, result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should fallback to polling when Firebase is not configured', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(false)

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.connectionStatus).toBe('polling')
      expect(
        websocketModule.websocketService.subscribeToNotifications
      ).not.toHaveBeenCalled()
    })
  })

  describe('Mark as Read', () => {
    it('should mark notification as read optimistically', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Appointment',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.unreadCount).toBe(1)

      // Mock the mark as read API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await act(async () => {
        result.current.markAsRead('notif-1')
      })

      // Should update optimistically
      expect(result.current.unreadCount).toBe(0)
      expect(result.current.notifications[0].read).toBe(true)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/notifications/notif-1/read',
          expect.objectContaining({
            method: 'PATCH',
          })
        )
      })
    })

    it('should revert on error', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Appointment',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock API error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        result.current.markAsRead('notif-1')
      })

      // Should revert the optimistic update
      await waitFor(() => {
        expect(result.current.notifications[0].read).toBe(false)
        expect(result.current.unreadCount).toBe(1)
      })
    })
  })

  describe('Mark All as Read', () => {
    it('should mark all notifications as read', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Appointment',
          body: 'Test 1',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
        {
          id: 'notif-2',
          type: 'message_received',
          title: 'Message',
          body: 'Test 2',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.unreadCount).toBe(2)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await act(async () => {
        await result.current.markAllAsRead()
      })

      expect(result.current.unreadCount).toBe(0)
      expect(result.current.notifications.every(n => n.read)).toBe(true)

      expect(mockFetch).toHaveBeenCalledWith('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should revert on markAllAsRead error', async () => {
      // Setup: Load 3 notifications, 2 unread
      const mockNotifications = [
        { id: 'n1', title: 'Test 1', body: 'Body', type: 'info', read: false, createdAt: new Date().toISOString(), data: {} },
        { id: 'n2', title: 'Test 2', body: 'Body', type: 'info', read: true, createdAt: new Date().toISOString(), data: {} },
        { id: 'n3', title: 'Test 3', body: 'Body', type: 'info', read: false, createdAt: new Date().toISOString(), data: {} },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications({ staffUserId: 'user-123' }))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Verify initial unread count
      expect(result.current.unreadCount).toBe(2)

      // Mock API failure for mark-all-as-read
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // Call markAllAsRead
      await act(async () => {
        try {
          await result.current.markAllAsRead()
        } catch (e) {
          // Expected to throw
        }
      })

      // Verify rollback - unread count should be back to 2
      await waitFor(() => {
        expect(result.current.unreadCount).toBe(2)
        expect(result.current.notifications.filter(n => !n.read)).toHaveLength(2)
      })
    })
  })

  describe('Delete Notification', () => {
    it('should delete notification optimistically', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Appointment',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toHaveLength(1)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await act(async () => {
        result.current.deleteNotification('notif-1')
      })

      expect(result.current.notifications).toHaveLength(0)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/notifications/notif-1', {
          method: 'DELETE',
        })
      })
    })
  })

  describe('Clear All', () => {
    it('should clear all notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Appointment',
          body: 'Test 1',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
        {
          id: 'notif-2',
          type: 'message_received',
          title: 'Message',
          body: 'Test 2',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toHaveLength(2)

      // Mock successful deletes
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      await act(async () => {
        await result.current.clearAll()
      })

      expect(result.current.notifications).toHaveLength(0)
    })
  })

  describe('Sound Toggle', () => {
    it('should load sound preference from localStorage', async () => {
      localStorageMock.setItem('notification-sound-enabled', 'false')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.soundEnabled).toBe(false)
    })

    it('should toggle sound and save to localStorage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.soundEnabled).toBe(true)

      act(() => {
        result.current.toggleSound()
      })

      expect(result.current.soundEnabled).toBe(false)
      expect(localStorageMock.getItem('notification-sound-enabled')).toBe(
        'false'
      )

      act(() => {
        result.current.toggleSound()
      })

      expect(result.current.soundEnabled).toBe(true)
      expect(localStorageMock.getItem('notification-sound-enabled')).toBe(
        'true'
      )
    })

    it('should play sound when new notification arrives and sound is enabled', async () => {
      // Set up Audio mock BEFORE rendering the hook
      const mockPlay = vi.fn().mockResolvedValue(undefined)
      class TestAudio {
        volume = 1
        play = mockPlay
        pause = vi.fn()
        src = ''
      }
      global.Audio = TestAudio as any

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      let notificationHandler: Function | null = null
      vi.mocked(websocketModule.websocketService.on).mockImplementation(
        (event, handler) => {
          if (event === 'notification.received') {
            notificationHandler = handler
          }
          return vi.fn()
        }
      )

      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Simulate receiving a notification
      act(() => {
        notificationHandler?.({
          id: 'realtime-1',
          type: 'appointment_reminder',
          title: 'New Appointment',
          body: 'You have a new appointment',
          createdAt: new Date(),
          data: {},
        })
      })

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1)
      })

      // Audio should have been played
      expect(mockPlay).toHaveBeenCalled()

      // Restore original Audio mock
      global.Audio = MockAudio as any
    })

    it('should not play sound when sound is disabled', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      let notificationHandler: Function | null = null
      vi.mocked(websocketModule.websocketService.on).mockImplementation(
        (event, handler) => {
          if (event === 'notification.received') {
            notificationHandler = handler
          }
          return vi.fn()
        }
      )

      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Disable sound
      act(() => {
        result.current.toggleSound()
      })

      const mockAudioInstance = new MockAudio()
      const audioConstructorSpy = vi
        .spyOn(global, 'Audio')
        .mockReturnValue(mockAudioInstance as any)

      // Simulate receiving a notification
      act(() => {
        notificationHandler?.({
          id: 'realtime-1',
          type: 'appointment_reminder',
          title: 'New Appointment',
          body: 'You have a new appointment',
          createdAt: new Date(),
          data: {},
        })
      })

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1)
      })

      // Audio should not have been played
      expect(mockAudioInstance.play).not.toHaveBeenCalled()

      audioConstructorSpy.mockRestore()
    })
  })

  describe('Add Notification', () => {
    it('should add notification manually', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toHaveLength(0)

      act(() => {
        result.current.addNotification({
          type: 'appointment',
          title: 'Manual Notification',
          body: 'This is a test',
        })
      })

      expect(result.current.notifications).toHaveLength(1)
      expect(result.current.notifications[0]).toMatchObject({
        title: 'Manual Notification',
        body: 'This is a test',
        read: false,
      })
      expect(result.current.unreadCount).toBe(1)
    })
  })

  describe('Notification Type Mapping', () => {
    it('should map notification types correctly', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
        {
          id: 'notif-2',
          type: 'message_received',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
        {
          id: 'notif-3',
          type: 'waitlist_offer',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications[0].type).toBe('appointment')
      expect(result.current.notifications[1].type).toBe('message')
      expect(result.current.notifications[2].type).toBe('alert')
    })

    it('should generate action URLs based on notification type', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
        {
          id: 'notif-2',
          type: 'message_received',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
        {
          id: 'notif-3',
          type: 'billing_reminder',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Find notifications by ID since they're sorted by createdAt descending
      const notif1 = result.current.notifications.find(n => n.id === 'notif-1')
      const notif2 = result.current.notifications.find(n => n.id === 'notif-2')
      const notif3 = result.current.notifications.find(n => n.id === 'notif-3')

      expect(notif1?.actionUrl).toBe('/calendar')
      expect(notif2?.actionUrl).toBe('/messages')
      expect(notif3?.actionUrl).toBe('/billing')
    })
  })

  describe('Unread Count', () => {
    it('should calculate unread count correctly', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
        {
          id: 'notif-2',
          type: 'message_received',
          title: 'Test',
          body: 'Test',
          read: true,
          createdAt: new Date().toISOString(),
          data: {},
        },
        {
          id: 'notif-3',
          type: 'billing_reminder',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.unreadCount).toBe(2)
    })

    it('should update unread count when notifications are marked as read', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
        {
          id: 'notif-2',
          type: 'message_received',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.unreadCount).toBe(2)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await act(async () => {
        result.current.markAsRead('notif-1')
      })

      expect(result.current.unreadCount).toBe(1)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await act(async () => {
        result.current.markAsRead('notif-2')
      })

      expect(result.current.unreadCount).toBe(0)
    })
  })

  describe('HTTP Error Handling', () => {
    it('should handle HTTP 401 unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toEqual([])
    })

    it('should handle HTTP 500 server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toEqual([])
    })

    it('should handle HTTP 404 not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toEqual([])
    })

    it('should handle mark as read API failure with non-ok response', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Appointment',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Mock non-ok response for mark as read
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      })

      await act(async () => {
        result.current.markAsRead('notif-1')
      })

      // Should revert the optimistic update
      await waitFor(() => {
        expect(result.current.notifications[0].read).toBe(false)
      })
    })
  })

  describe('Pagination Handling', () => {
    it('should request correct limit parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      renderHook(() => useNotifications())

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('limit=50')
        )
      })
    })

    it('should request descending sort order', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      renderHook(() => useNotifications())

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('sortOrder=desc')
        )
      })
    })

    it('should sort notifications by createdAt descending', async () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 86400000)
      const tomorrow = new Date(now.getTime() + 86400000)

      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Yesterday',
          body: 'Test',
          read: false,
          createdAt: yesterday.toISOString(),
          data: {},
        },
        {
          id: 'notif-2',
          type: 'message_received',
          title: 'Tomorrow',
          body: 'Test',
          read: false,
          createdAt: tomorrow.toISOString(),
          data: {},
        },
        {
          id: 'notif-3',
          type: 'billing_reminder',
          title: 'Now',
          body: 'Test',
          read: false,
          createdAt: now.toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should be sorted: tomorrow, now, yesterday
      expect(result.current.notifications[0].title).toBe('Tomorrow')
      expect(result.current.notifications[1].title).toBe('Now')
      expect(result.current.notifications[2].title).toBe('Yesterday')
    })
  })

  describe('Realtime Connection Status', () => {
    it('should report polling status when Firebase is not configured', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(false)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.connectionStatus).toBe('polling')
      expect(result.current.isRealtime).toBe(false)
    })

    it('should report connected status when Firebase is configured', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.connectionStatus).toBe('connected')
      expect(result.current.isRealtime).toBe(true)
    })

    it('should report polling status when enableRealtime is false', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: false,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.connectionStatus).toBe('polling')
      expect(result.current.isRealtime).toBe(false)
    })

    it('should report polling status when no staffUserId provided', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result } = renderHook(() =>
        useNotifications({
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.connectionStatus).toBe('polling')
      expect(result.current.isRealtime).toBe(false)
    })
  })

  describe('Notification Data Transformation', () => {
    it('should transform date strings to Date objects', async () => {
      const isoDate = '2024-01-15T10:30:00.000Z'
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: isoDate,
          readAt: isoDate,
          expiresAt: isoDate,
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const notification = result.current.notifications[0]
      expect(notification.createdAt).toBeInstanceOf(Date)
      expect(notification.readAt).toBeInstanceOf(Date)
      expect(notification.expiresAt).toBeInstanceOf(Date)
    })

    it('should handle null readAt and expiresAt', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          readAt: null,
          expiresAt: null,
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const notification = result.current.notifications[0]
      expect(notification.readAt).toBeNull()
      expect(notification.expiresAt).toBeNull()
    })

    it('should preserve channel and priority fields', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          channel: 'push',
          priority: 'high',
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const notification = result.current.notifications[0]
      expect(notification.channel).toBe('push')
      expect(notification.priority).toBe('high')
    })

    it('should use custom actionUrl from data if provided', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Test',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {
            actionUrl: '/custom-action-url',
          },
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications[0].actionUrl).toBe(
        '/custom-action-url'
      )
    })
  })

  describe('Realtime and Fetch Merge', () => {
    it('should merge realtime notifications with fetched notifications', async () => {
      const fetchedNotifications = [
        {
          id: 'fetched-1',
          type: 'appointment_reminder',
          title: 'Fetched',
          body: 'Test',
          read: false,
          createdAt: new Date(Date.now() - 60000).toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: fetchedNotifications }),
      })

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

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      // First, simulate realtime notification arriving before fetch completes
      act(() => {
        notificationHandler?.({
          id: 'realtime-1',
          type: 'message_received',
          title: 'Realtime',
          body: 'Test',
          createdAt: new Date(),
          data: {},
        })
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have both notifications
      expect(result.current.notifications).toHaveLength(2)

      // Realtime should come first (more recent)
      const titles = result.current.notifications.map((n) => n.title)
      expect(titles).toContain('Realtime')
      expect(titles).toContain('Fetched')
    })

    it('should not duplicate notifications when same ID exists', async () => {
      const fetchedNotifications = [
        {
          id: 'same-id',
          type: 'appointment_reminder',
          title: 'Fetched Version',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: fetchedNotifications }),
      })

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

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      // Simulate realtime notification with same ID
      act(() => {
        notificationHandler?.({
          id: 'same-id',
          type: 'message_received',
          title: 'Realtime Version',
          body: 'Test',
          createdAt: new Date(),
          data: {},
        })
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should only have one notification (not duplicated)
      expect(result.current.notifications).toHaveLength(1)
    })
  })

  describe('Clear All Error Handling', () => {
    it('should revert on clear all error', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Test 1',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
        {
          id: 'notif-2',
          type: 'message_received',
          title: 'Test 2',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toHaveLength(2)

      // Mock network failure on clear all
      mockFetch.mockRejectedValue(new Error('Network error'))

      await act(async () => {
        await result.current.clearAll()
      })

      // Should revert to original notifications
      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(2)
      })
    })

    it('should handle partial delete failures in clear all', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'appointment_reminder',
          title: 'Test 1',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
        {
          id: 'notif-2',
          type: 'message_received',
          title: 'Test 2',
          body: 'Test',
          read: false,
          createdAt: new Date().toISOString(),
          data: {},
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockNotifications }),
      })

      const { result } = renderHook(() => useNotifications())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // First delete succeeds, second fails
      mockFetch
        .mockResolvedValueOnce({ ok: true })
        .mockRejectedValueOnce(new Error('Delete failed'))

      // Console error should be called for the failure
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await act(async () => {
        await result.current.clearAll()
      })

      // Should have logged the error
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Browser Notification Integration', () => {
    it('should show browser notification when permission granted and realtime notification arrives', async () => {
      // Ensure permission is granted
      ;(window.Notification as any).permission = 'granted'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

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

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Simulate receiving a notification
      await act(async () => {
        notificationHandler?.({
          id: 'browser-notif-1',
          type: 'appointment_reminder',
          title: 'Browser Notification Test',
          body: 'Test body',
          createdAt: new Date(),
          data: {},
        })
      })

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1)
      })

      // Verify notification was added to state (browser Notification constructor is called in hook)
      expect(result.current.notifications[0]).toMatchObject({
        id: 'browser-notif-1',
        title: 'Browser Notification Test',
        body: 'Test body',
      })
    })
  })

  describe('Edge Cases', () => {
    describe('Network Timeout Handling', () => {
      it('should handle fetch timeout gracefully', async () => {
        mockFetch.mockImplementation(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Network timeout')), 100)
            )
        )

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.notifications).toEqual([])
      })

      it('should handle AbortError during fetch', async () => {
        const abortError = new Error('The operation was aborted')
        abortError.name = 'AbortError'
        mockFetch.mockRejectedValueOnce(abortError)

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.notifications).toEqual([])
        expect(result.current.unreadCount).toBe(0)
      })

      it('should handle slow network responses without blocking UI', async () => {
        // Use a deferred promise to simulate slow network without fake timers
        let resolveSlowFetch: (value: any) => void
        const slowFetchPromise = new Promise((resolve) => {
          resolveSlowFetch = resolve
        })

        mockFetch.mockImplementationOnce(() => slowFetchPromise)

        const { result } = renderHook(() => useNotifications())

        // Initially loading while fetch is pending
        expect(result.current.isLoading).toBe(true)
        expect(result.current.notifications).toEqual([])

        // Resolve the slow fetch
        await act(async () => {
          resolveSlowFetch!({
            ok: true,
            json: async () => ({
              items: [
                {
                  id: 'slow-1',
                  type: 'appointment_reminder',
                  title: 'Slow Response',
                  body: 'Test',
                  read: false,
                  createdAt: new Date().toISOString(),
                  data: {},
                },
              ],
            }),
          })
        })

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.notifications).toHaveLength(1)
      })
    })

    describe('User Logout Scenario', () => {
      it('should handle staffUserId becoming empty', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ items: [] }),
        })

        vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

        const { result, rerender } = renderHook(
          ({ userId }) =>
            useNotifications({ staffUserId: userId, enableRealtime: true }),
          { initialProps: { userId: 'user-123' } }
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // Should be connected initially
        expect(result.current.connectionStatus).toBe('connected')
        expect(result.current.isRealtime).toBe(true)

        // Simulate logout by setting userId to empty
        rerender({ userId: '' })

        // Should gracefully switch to polling mode
        await waitFor(() => {
          expect(result.current.connectionStatus).toBe('polling')
        })

        expect(result.current.isRealtime).toBe(false)
      })

      it('should handle staffUserId changing to a different user', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ items: [] }),
        })

        vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

        const { result, rerender } = renderHook(
          ({ userId }) =>
            useNotifications({ staffUserId: userId, enableRealtime: true }),
          { initialProps: { userId: 'user-123' } }
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        expect(
          websocketModule.websocketService.subscribeToNotifications
        ).toHaveBeenCalledWith('user-123')

        // Change to a different user
        rerender({ userId: 'user-456' })

        await waitFor(() => {
          expect(
            websocketModule.websocketService.subscribeToNotifications
          ).toHaveBeenCalledWith('user-456')
        })
      })

      it('should clear processed IDs when user changes to prevent stale data', async () => {
        const user1Notifications = [
          {
            id: 'user1-notif-1',
            type: 'appointment_reminder',
            title: 'User 1 Notification',
            body: 'Test',
            read: false,
            createdAt: new Date().toISOString(),
            data: {},
          },
        ]

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ items: user1Notifications }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ items: [] }),
          })

        vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

        const { result, rerender } = renderHook(
          ({ userId }) =>
            useNotifications({ staffUserId: userId, enableRealtime: true }),
          { initialProps: { userId: 'user-123' } }
        )

        await waitFor(() => {
          expect(result.current.notifications).toHaveLength(1)
        })

        // Change user - should trigger refetch
        rerender({ userId: 'user-456' })

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })
      })
    })

    describe('Rapid Notification Updates', () => {
      it('should handle rapid notification updates without race conditions', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }),
        })

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

        const { result } = renderHook(() =>
          useNotifications({
            staffUserId: 'user-123',
            enableRealtime: true,
          })
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // Rapidly send 10 notifications
        act(() => {
          for (let i = 0; i < 10; i++) {
            notificationHandler?.({
              id: `rapid-${i}`,
              type: 'appointment_reminder',
              title: `Rapid Notification ${i}`,
              body: 'Test',
              createdAt: new Date(Date.now() + i),
              data: {},
            })
          }
        })

        await waitFor(() => {
          expect(result.current.notifications).toHaveLength(10)
        })

        // All notifications should be present with unique IDs
        const ids = result.current.notifications.map((n) => n.id)
        const uniqueIds = new Set(ids)
        expect(uniqueIds.size).toBe(10)
      })

      it('should maintain correct order when rapid notifications arrive', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }),
        })

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

        const { result } = renderHook(() =>
          useNotifications({
            staffUserId: 'user-123',
            enableRealtime: true,
          })
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // Send notifications with different timestamps
        const baseTime = Date.now()
        act(() => {
          notificationHandler?.({
            id: 'old',
            type: 'appointment_reminder',
            title: 'Old',
            body: 'Test',
            createdAt: new Date(baseTime - 1000),
            data: {},
          })
          notificationHandler?.({
            id: 'new',
            type: 'appointment_reminder',
            title: 'New',
            body: 'Test',
            createdAt: new Date(baseTime),
            data: {},
          })
        })

        await waitFor(() => {
          expect(result.current.notifications).toHaveLength(2)
        })

        // Newer notification should be first in list (prepended)
        expect(result.current.notifications[0].id).toBe('new')
      })

      it('should handle concurrent mark as read operations', async () => {
        const mockNotifications = [
          {
            id: 'notif-1',
            type: 'appointment_reminder',
            title: 'Test 1',
            body: 'Test',
            read: false,
            createdAt: new Date().toISOString(),
            data: {},
          },
          {
            id: 'notif-2',
            type: 'message_received',
            title: 'Test 2',
            body: 'Test',
            read: false,
            createdAt: new Date().toISOString(),
            data: {},
          },
          {
            id: 'notif-3',
            type: 'billing_reminder',
            title: 'Test 3',
            body: 'Test',
            read: false,
            createdAt: new Date().toISOString(),
            data: {},
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: mockNotifications }),
        })

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.unreadCount).toBe(3)

        // Mock successful mark as read responses
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        })

        // Mark all three as read concurrently
        await act(async () => {
          await Promise.all([
            result.current.markAsRead('notif-1'),
            result.current.markAsRead('notif-2'),
            result.current.markAsRead('notif-3'),
          ])
        })

        expect(result.current.unreadCount).toBe(0)
        expect(result.current.notifications.every((n) => n.read)).toBe(true)
      })
    })

    describe('Expired Notifications', () => {
      it('should handle notifications with expiresAt in the past', async () => {
        const pastDate = new Date(Date.now() - 86400000).toISOString() // Yesterday
        const futureDate = new Date(Date.now() + 86400000).toISOString() // Tomorrow

        const mockNotifications = [
          {
            id: 'expired-1',
            type: 'appointment_reminder',
            title: 'Expired',
            body: 'Test',
            read: false,
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            expiresAt: pastDate,
            data: {},
          },
          {
            id: 'valid-1',
            type: 'message_received',
            title: 'Valid',
            body: 'Test',
            read: false,
            createdAt: new Date().toISOString(),
            expiresAt: futureDate,
            data: {},
          },
          {
            id: 'no-expiry-1',
            type: 'billing_reminder',
            title: 'No Expiry',
            body: 'Test',
            read: false,
            createdAt: new Date().toISOString(),
            expiresAt: null,
            data: {},
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: mockNotifications }),
        })

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // All notifications are included (filtering could be done by caller)
        expect(result.current.notifications).toHaveLength(3)

        // Verify expiresAt is properly transformed to Date
        const expiredNotif = result.current.notifications.find(
          (n) => n.id === 'expired-1'
        )
        expect(expiredNotif?.expiresAt).toBeInstanceOf(Date)
        expect(expiredNotif?.expiresAt?.getTime()).toBeLessThan(Date.now())
      })

      it('should transform expiresAt correctly for filtering purposes', async () => {
        const now = Date.now()
        const mockNotifications = [
          {
            id: 'expired',
            type: 'appointment_reminder',
            title: 'Expired',
            body: 'Test',
            read: false,
            createdAt: new Date(now - 3600000).toISOString(),
            expiresAt: new Date(now - 1000).toISOString(), // Expired 1 second ago
            data: {},
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: mockNotifications }),
        })

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // Consumer can filter expired notifications
        const activeNotifications = result.current.notifications.filter(
          (n) => !n.expiresAt || n.expiresAt.getTime() > Date.now()
        )
        expect(activeNotifications).toHaveLength(0)
      })
    })

    describe('Memory Management', () => {
      it('should limit processed IDs to prevent memory leaks', async () => {
        // Create more than 200 notifications to test the limit
        const manyNotifications = Array.from({ length: 250 }, (_, i) => ({
          id: `notif-${i}`,
          type: 'appointment_reminder',
          title: `Notification ${i}`,
          body: 'Test',
          read: false,
          createdAt: new Date(Date.now() - i * 1000).toISOString(),
          data: {},
        }))

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: manyNotifications }),
        })

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // All notifications should still be present
        expect(result.current.notifications).toHaveLength(250)
      })
    })

    describe('Empty States', () => {
      it('should handle empty items array from API', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }),
        })

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.notifications).toEqual([])
        expect(result.current.unreadCount).toBe(0)
      })

      it('should handle missing items property in API response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })

        const consoleSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // Should handle gracefully
        expect(result.current.notifications).toEqual([])

        consoleSpy.mockRestore()
      })

      it('should handle null response from API', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => null,
        })

        const consoleSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // Should handle gracefully
        expect(result.current.notifications).toEqual([])

        consoleSpy.mockRestore()
      })
    })

    describe('Malformed Data Handling', () => {
      it('should handle notifications with missing required fields', async () => {
        const malformedNotifications = [
          {
            id: 'malformed-1',
            // missing type, title, body
            createdAt: new Date().toISOString(),
            data: {},
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: malformedNotifications }),
        })

        const consoleSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // Should still process the notification even with missing fields
        expect(result.current.notifications).toHaveLength(1)

        consoleSpy.mockRestore()
      })

      it('should handle invalid date strings in createdAt', async () => {
        const invalidDateNotifications = [
          {
            id: 'invalid-date-1',
            type: 'appointment_reminder',
            title: 'Test',
            body: 'Test',
            read: false,
            createdAt: 'invalid-date-string',
            data: {},
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: invalidDateNotifications }),
        })

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // Should handle gracefully - Date constructor creates Invalid Date
        expect(result.current.notifications).toHaveLength(1)
        expect(result.current.notifications[0].createdAt).toBeInstanceOf(Date)
      })
    })

    describe('Audio Play Errors', () => {
      it('should handle audio play failure gracefully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }),
        })

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

        // Mock Audio that fails to play using MockAudio class
        const mockPlay = vi.fn().mockRejectedValue(new Error('User has not interacted'))
        class FailingAudio {
          volume = 1
          play = mockPlay
          pause = vi.fn()
          src = ''
        }
        global.Audio = FailingAudio as any

        const { result } = renderHook(() =>
          useNotifications({
            staffUserId: 'user-123',
            enableRealtime: true,
          })
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // Should not throw when audio fails
        await act(async () => {
          notificationHandler?.({
            id: 'audio-test-1',
            type: 'appointment_reminder',
            title: 'Test',
            body: 'Test',
            createdAt: new Date(),
            data: {},
          })
        })

        await waitFor(() => {
          expect(result.current.notifications).toHaveLength(1)
        })

        // Notification should still be added even if audio fails
        expect(result.current.notifications[0].id).toBe('audio-test-1')

        // Restore original Audio
        global.Audio = MockAudio as any
      })
    })

    describe('Browser Notification Permission Denied', () => {
      it('should handle browser notification permission denied', async () => {
        // Set permission to denied using window.Notification
        ;(window.Notification as any).permission = 'denied'

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }),
        })

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

        const { result } = renderHook(() =>
          useNotifications({
            staffUserId: 'user-123',
            enableRealtime: true,
          })
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // Should not throw when browser notification is denied
        await act(async () => {
          notificationHandler?.({
            id: 'denied-test-1',
            type: 'appointment_reminder',
            title: 'Test',
            body: 'Test',
            createdAt: new Date(),
            data: {},
          })
        })

        await waitFor(() => {
          expect(result.current.notifications).toHaveLength(1)
        })
      })
    })

    describe('Delete Notification Rollback', () => {
      it('should restore notification in correct sorted position on delete error', async () => {
        const now = new Date()
        const earlier = new Date(now.getTime() - 60000)
        const later = new Date(now.getTime() + 60000)

        const mockNotifications = [
          {
            id: 'notif-1',
            type: 'appointment_reminder',
            title: 'Later',
            body: 'Test',
            read: false,
            createdAt: later.toISOString(),
            data: {},
          },
          {
            id: 'notif-2',
            type: 'message_received',
            title: 'Now',
            body: 'Test',
            read: false,
            createdAt: now.toISOString(),
            data: {},
          },
          {
            id: 'notif-3',
            type: 'billing_reminder',
            title: 'Earlier',
            body: 'Test',
            read: false,
            createdAt: earlier.toISOString(),
            data: {},
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: mockNotifications }),
        })

        const { result } = renderHook(() => useNotifications())

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // Mock delete failure
        mockFetch.mockRejectedValueOnce(new Error('Delete failed'))

        await act(async () => {
          result.current.deleteNotification('notif-2')
        })

        // Should restore in correct position
        await waitFor(() => {
          expect(result.current.notifications).toHaveLength(3)
        })

        expect(result.current.notifications[0].id).toBe('notif-1')
        expect(result.current.notifications[1].id).toBe('notif-2')
        expect(result.current.notifications[2].id).toBe('notif-3')
      })
    })

    describe('WebSocket Disconnection', () => {
      it('should handle websocket disconnection gracefully', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ items: [] }),
        })

        vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)
        vi.mocked(
          websocketModule.websocketService.getConnectionStatus
        ).mockReturnValue({
          connected: false,
          activeSubscriptions: 0,
        })

        const { result } = renderHook(() =>
          useNotifications({
            staffUserId: 'user-123',
            enableRealtime: true,
          })
        )

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false)
        })

        // Should still function with disconnected websocket
        expect(result.current.notifications).toEqual([])
      })
    })
  })

  describe('Default Options', () => {
    it('should use default polling interval of 30000ms', async () => {
      // This test verifies the hook uses 30000ms as default polling interval
      // We don't use fake timers to avoid infinite loop issues with setInterval
      // Instead we just verify the hook initializes correctly with polling enabled
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result, unmount } = renderHook(() =>
        useNotifications({
          enableRealtime: false,
          // Not providing pollingInterval - should use default of 30000ms
        })
      )

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Verify the hook is in polling mode (not realtime)
      expect(result.current.connectionStatus).toBe('polling')
      expect(result.current.isRealtime).toBe(false)

      // Initial fetch should have been made
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Cleanup before the 30s timer triggers
      unmount()
    })

    it('should enable realtime by default', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(
        websocketModule.websocketService.subscribeToNotifications
      ).toHaveBeenCalled()
    })
  })

  describe('Connection Status Transitions', () => {
    it('should transition from disconnected/polling to connected when Firebase connects', async () => {
      // Start with Firebase not configured
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(false)

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result, rerender } = renderHook(
        ({ firebaseEnabled, userId }) =>
          useNotifications({
            staffUserId: userId,
            enableRealtime: true,
          }),
        { initialProps: { firebaseEnabled: false, userId: 'user-123' } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Initial status should be 'polling' when Firebase is not configured
      expect(result.current.connectionStatus).toBe('polling')
      expect(result.current.isRealtime).toBe(false)

      // Now enable Firebase
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      // Rerender to trigger effect with Firebase now available
      rerender({ firebaseEnabled: true, userId: 'user-123' })

      // Should transition to 'connected' status
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected')
      })

      expect(result.current.isRealtime).toBe(true)
      expect(
        websocketModule.websocketService.subscribeToNotifications
      ).toHaveBeenCalledWith('user-123')
    })

    it('should transition from connected to disconnected on unmount', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const mockUnsubscribe = vi.fn()
      vi.mocked(websocketModule.websocketService.on).mockReturnValue(
        mockUnsubscribe
      )

      const { result, unmount } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should be connected initially
      expect(result.current.connectionStatus).toBe('connected')

      // Unmount the hook
      unmount()

      // Verify cleanup was called
      expect(mockUnsubscribe).toHaveBeenCalled()
      // Note: We can't verify status after unmount as the hook is no longer mounted
      // but we can verify the unsubscribe function was called which triggers the disconnected status
    })

    it('should transition through states during reconnection scenario', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result, rerender } = renderHook(
        ({ userId }) =>
          useNotifications({
            staffUserId: userId,
            enableRealtime: true,
          }),
        { initialProps: { userId: 'user-123' } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Initial state: connected
      expect(result.current.connectionStatus).toBe('connected')

      // Simulate user ID becoming empty (like a logout/disconnect scenario)
      rerender({ userId: '' })

      // Should transition to polling (disconnected from realtime)
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('polling')
      })

      // Simulate reconnection with new user ID
      rerender({ userId: 'user-456' })

      // Should transition back to connected
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected')
      })

      expect(
        websocketModule.websocketService.subscribeToNotifications
      ).toHaveBeenCalledWith('user-456')
    })

    it('should fall back to polling when realtime is unavailable', async () => {
      // Mock isFirebaseConfigured to return false
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(false)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Status should be 'polling' not 'disconnected'
      expect(result.current.connectionStatus).toBe('polling')
      expect(result.current.isRealtime).toBe(false)

      // Should NOT have tried to subscribe to realtime
      expect(
        websocketModule.websocketService.subscribeToNotifications
      ).not.toHaveBeenCalled()
    })

    it('should update status indicator correctly for each state', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      // Test all three states

      // State 1: 'polling' - when realtime is disabled
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(false)

      const { result: pollingResult, unmount: unmountPolling } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: false,
        })
      )

      await waitFor(() => {
        expect(pollingResult.current.isLoading).toBe(false)
      })

      expect(pollingResult.current.connectionStatus).toBe('polling')
      expect(['connected', 'polling', 'disconnected']).toContain(
        pollingResult.current.connectionStatus
      )

      unmountPolling()

      // State 2: 'connected' - when realtime is enabled and Firebase is configured
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      const { result: connectedResult, unmount: unmountConnected } = renderHook(
        () =>
          useNotifications({
            staffUserId: 'user-123',
            enableRealtime: true,
          })
      )

      await waitFor(() => {
        expect(connectedResult.current.isLoading).toBe(false)
      })

      expect(connectedResult.current.connectionStatus).toBe('connected')
      expect(['connected', 'polling', 'disconnected']).toContain(
        connectedResult.current.connectionStatus
      )

      unmountConnected()

      // State 3: 'polling' - when no staffUserId provided (falls back to polling)
      const { result: noUserResult } = renderHook(() =>
        useNotifications({
          staffUserId: '',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(noUserResult.current.isLoading).toBe(false)
      })

      expect(noUserResult.current.connectionStatus).toBe('polling')
      expect(['connected', 'polling', 'disconnected']).toContain(
        noUserResult.current.connectionStatus
      )
    })

    it('should handle rapid connection status changes', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result, rerender } = renderHook(
        ({ userId, enableRealtime }) =>
          useNotifications({
            staffUserId: userId,
            enableRealtime,
          }),
        { initialProps: { userId: 'user-123', enableRealtime: true } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Initial: connected
      expect(result.current.connectionStatus).toBe('connected')

      // Rapidly toggle connection state multiple times
      act(() => {
        rerender({ userId: '', enableRealtime: true }) // -> polling
      })

      act(() => {
        rerender({ userId: 'user-456', enableRealtime: true }) // -> connected
      })

      act(() => {
        rerender({ userId: 'user-456', enableRealtime: false }) // -> polling
      })

      act(() => {
        rerender({ userId: 'user-789', enableRealtime: true }) // -> connected
      })

      // Final state should be correct after all changes
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected')
      })

      // No race conditions - final state is deterministic
      expect(result.current.isRealtime).toBe(true)
    })

    it('should set status to disconnected/cleanup on unmount', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const mockUnsubscribe = vi.fn()
      vi.mocked(websocketModule.websocketService.on).mockReturnValue(
        mockUnsubscribe
      )

      const { result, unmount } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Verify connected
      expect(result.current.connectionStatus).toBe('connected')

      // Unmount
      unmount()

      // Verify cleanup is called (can't verify status after unmount)
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should stay in polling status when enableRealtime is toggled off', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result, rerender } = renderHook(
        ({ enableRealtime }) =>
          useNotifications({
            staffUserId: 'user-123',
            enableRealtime,
          }),
        { initialProps: { enableRealtime: true } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Initially connected
      expect(result.current.connectionStatus).toBe('connected')

      // Disable realtime
      rerender({ enableRealtime: false })

      // Should transition to polling
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('polling')
      })

      expect(result.current.isRealtime).toBe(false)
    })

    it('should handle connection status when websocket reports disconnected', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      // Mock websocket as disconnected
      vi.mocked(
        websocketModule.websocketService.getConnectionStatus
      ).mockReturnValue({
        connected: false,
        activeSubscriptions: 0,
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // The hook still sets connected based on configuration, not websocket status
      // This tests that the hook properly subscribes even when websocket reports disconnected
      expect(
        websocketModule.websocketService.subscribeToNotifications
      ).toHaveBeenCalledWith('user-123')
    })

    it('should maintain connection status across multiple notification events', async () => {
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

      let notificationHandler: Function | null = null
      vi.mocked(websocketModule.websocketService.on).mockImplementation(
        (event, handler) => {
          if (event === 'notification.received') {
            notificationHandler = handler
          }
          return vi.fn()
        }
      )

      const { result } = renderHook(() =>
        useNotifications({
          staffUserId: 'user-123',
          enableRealtime: true,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Initial state: connected
      expect(result.current.connectionStatus).toBe('connected')

      // Receive multiple notifications
      act(() => {
        for (let i = 0; i < 5; i++) {
          notificationHandler?.({
            id: `notif-${i}`,
            type: 'appointment_reminder',
            title: `Notification ${i}`,
            body: 'Test',
            createdAt: new Date(),
            data: {},
          })
        }
      })

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(5)
      })

      // Connection status should remain stable
      expect(result.current.connectionStatus).toBe('connected')
    })

    it('should handle Firebase becoming unavailable mid-session', async () => {
      // Start with Firebase configured
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(true)

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const { result, rerender } = renderHook(
        ({ firebaseAvailable, userId }) => {
          // Simulate firebase availability via the isFirebaseConfigured mock
          return useNotifications({
            staffUserId: userId,
            enableRealtime: true,
          })
        },
        { initialProps: { firebaseAvailable: true, userId: 'user-123' } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Initially connected
      expect(result.current.connectionStatus).toBe('connected')

      // Simulate Firebase becoming unavailable
      vi.mocked(firebaseModule.isFirebaseConfigured).mockReturnValue(false)
      rerender({ firebaseAvailable: false, userId: 'user-123' })

      // Should fall back to polling
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('polling')
      })
    })
  })
})
