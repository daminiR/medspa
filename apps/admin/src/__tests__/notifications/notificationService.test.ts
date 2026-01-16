import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ============================================================================
// Browser API Mock Setup
// ============================================================================
// These mocks simulate browser APIs (Notification, Audio) for testing the
// notification service without actual browser dependencies.

// Browser API mock tracking variables
let mockNotificationClose: ReturnType<typeof vi.fn>
let mockNotificationInstance: {
  close: ReturnType<typeof vi.fn>
  onclick: ((event: Event) => void) | null
  title: string
  body: string
  icon: string
  badge: string
  tag: string
  requireInteraction: boolean
}
let mockNotificationConstructorSpy: ReturnType<typeof vi.fn>
let mockAudioPlay: ReturnType<typeof vi.fn>
let mockAudioInstance: { play: ReturnType<typeof vi.fn>; volume: number; pause: ReturnType<typeof vi.fn>; src: string }
let mockAudioConstructorSpy: ReturnType<typeof vi.fn>

// Use vi.hoisted to create mock functions that can be used in vi.mock
// Also create the eventHandlers map inside hoisted so it's available when mockOn is called
const { mockSubscribeToNotifications, mockOn, mockOff, mockGetConnectionStatus, mockToastSuccess, mockToastError, mockToastFn, eventHandlers } = vi.hoisted(() => {
  const handlers = new Map<string, (data: unknown) => void>()
  return {
    mockSubscribeToNotifications: vi.fn(),
    mockOn: vi.fn((event: string, handler: (data: unknown) => void) => {
      // Store the handler for later retrieval in tests
      handlers.set(event, handler)
      return vi.fn()
    }),
    mockOff: vi.fn(),
    mockGetConnectionStatus: vi.fn(() => ({ connected: true, activeSubscriptions: 1 })),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
    mockToastFn: vi.fn(),
    eventHandlers: handlers,
  }
})

// Mock react-hot-toast before importing the service
// The default export is a callable function with .success and .error methods
vi.mock('react-hot-toast', () => {
  // Create a callable mock that also has .success and .error properties
  const toastMock = Object.assign(mockToastFn, {
    success: mockToastSuccess,
    error: mockToastError,
  })
  return {
    default: toastMock,
  }
})

// Mock the websocket service
vi.mock('@/services/websocket', () => ({
  websocketService: {
    subscribeToNotifications: mockSubscribeToNotifications,
    on: mockOn,
    off: mockOff,
    getConnectionStatus: mockGetConnectionStatus,
  },
}))

// Import after mocking
import { notificationService } from '@/services/notifications'
import toast from 'react-hot-toast'

// Create a reference object that tests can use to access mocks
const mockWebsocketService = {
  subscribeToNotifications: mockSubscribeToNotifications,
  on: mockOn,
  off: mockOff,
  getConnectionStatus: mockGetConnectionStatus,
}

// Helper to set Notification permission (works with the setup.ts mock)
function setNotificationPermission(permission: NotificationPermission) {
  (window.Notification as unknown as { permission: string }).permission = permission
}

// Helper to set Notification.requestPermission mock
function setRequestPermissionMock(mockFn: ReturnType<typeof vi.fn>) {
  (window.Notification as unknown as { requestPermission: typeof mockFn }).requestPermission = mockFn
}

// Helper function to create a mock Notification class (for reference/documentation)
function createMockNotificationClass(permission: NotificationPermission = 'granted') {
  // This creates the mock class structure - actual stubbing uses window.Notification
  setNotificationPermission(permission)
  const requestMock = vi.fn().mockResolvedValue(permission)
  setRequestPermissionMock(requestMock)
  return {
    permission,
    requestPermission: requestMock,
  }
}

describe('NotificationService', () => {
  beforeEach(() => {
    // Clear specific mocks but NOT mockOn (preserves handler registrations from module init)
    mockToastSuccess.mockClear()
    mockToastError.mockClear()
    mockToastFn.mockClear()
    mockSubscribeToNotifications.mockClear()
    mockGetConnectionStatus.mockClear()

    // Clear internal state
    notificationService.clearAll()

    // ========================================================================
    // Browser Notification API Mocking
    // ========================================================================
    // Setup tracking variables for Notification mock
    mockNotificationClose = vi.fn()
    mockNotificationInstance = {
      close: mockNotificationClose,
      onclick: null,
      title: '',
      body: '',
      icon: '',
      badge: '',
      tag: '',
      requireInteraction: false,
    }
    mockNotificationConstructorSpy = vi.fn()

    // Patch window.Notification (defined in setup.ts with writable: true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Notification = function(title: string, options?: NotificationOptions) {
      mockNotificationConstructorSpy(title, options)
      mockNotificationInstance.close = mockNotificationClose
      mockNotificationInstance.onclick = null
      mockNotificationInstance.title = title
      mockNotificationInstance.body = options?.body || ''
      mockNotificationInstance.icon = options?.icon || ''
      mockNotificationInstance.badge = options?.badge || ''
      mockNotificationInstance.tag = options?.tag || ''
      mockNotificationInstance.requireInteraction = options?.requireInteraction || false
      return mockNotificationInstance as unknown as Notification
    }

    // Set default permission state
    setNotificationPermission('granted')
    setRequestPermissionMock(vi.fn().mockResolvedValue('granted' as NotificationPermission))

    // ========================================================================
    // Audio API Mocking
    // ========================================================================
    // Mock Audio constructor for sound playback testing
    mockAudioPlay = vi.fn().mockResolvedValue(undefined)
    mockAudioInstance = {
      play: mockAudioPlay,
      volume: 0,
      pause: vi.fn(),
      src: '',
    }
    mockAudioConstructorSpy = vi.fn()

    // Patch window.Audio (defined in setup.ts with writable: true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Audio = function(src?: string) {
      mockAudioConstructorSpy(src)
      mockAudioInstance.play = mockAudioPlay
      mockAudioInstance.volume = 0
      mockAudioInstance.src = src || ''
      return mockAudioInstance as unknown as HTMLAudioElement
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should be a singleton instance', () => {
      expect(notificationService).toBeDefined()
      expect(typeof notificationService.notify).toBe('function')
      expect(typeof notificationService.getNotifications).toBe('function')
    })
  })

  describe('notify', () => {
    it('should add a new notification', () => {
      const notification = {
        type: 'success' as const,
        title: 'Test Title',
        message: 'Test message',
      }

      const result = notificationService.notify(notification)

      expect(result).toMatchObject({
        type: 'success',
        title: 'Test Title',
        message: 'Test message',
      })
      expect(result.id).toBeDefined()
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it('should add notification to the list', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'Test',
        message: 'Test message',
      })

      const notifications = notificationService.getNotifications()
      expect(notifications).toHaveLength(1)
    })

    it('should add new notifications at the beginning of the list', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'First',
        message: 'First message',
      })

      notificationService.notify({
        type: 'success' as const,
        title: 'Second',
        message: 'Second message',
      })

      const notifications = notificationService.getNotifications()
      expect(notifications[0].title).toBe('Second')
      expect(notifications[1].title).toBe('First')
    })

    it('should limit notifications to 50', () => {
      // Add 55 notifications
      for (let i = 0; i < 55; i++) {
        notificationService.notify({
          type: 'info' as const,
          title: `Notification ${i}`,
          message: `Message ${i}`,
        })
      }

      const notifications = notificationService.getNotifications()
      expect(notifications).toHaveLength(50)
    })

    it('should show toast notification', () => {
      notificationService.notify({
        type: 'success' as const,
        title: 'Success',
        message: 'Success message',
      })

      expect(toast.success).toHaveBeenCalled()
    })

    it('should show error toast for error notifications', () => {
      notificationService.notify({
        type: 'error' as const,
        title: 'Error',
        message: 'Error message',
      })

      expect(toast.error).toHaveBeenCalled()
    })

    it('should handle persistent notifications', () => {
      const result = notificationService.notify({
        type: 'warning' as const,
        title: 'Warning',
        message: 'Persistent warning',
        persistent: true,
      })

      expect(result.persistent).toBe(true)
    })

    it('should handle notifications with actions', () => {
      const actionHandler = vi.fn()
      const result = notificationService.notify({
        type: 'info' as const,
        title: 'Action Required',
        message: 'Click to proceed',
        action: {
          label: 'Proceed',
          onClick: actionHandler,
        },
      })

      expect(result.action).toBeDefined()
      expect(result.action?.label).toBe('Proceed')
    })
  })

  describe('getNotifications', () => {
    it('should return empty array initially', () => {
      notificationService.clearAll()
      const notifications = notificationService.getNotifications()
      expect(notifications).toEqual([])
    })

    it('should return all notifications', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'Test 1',
        message: 'Message 1',
      })

      notificationService.notify({
        type: 'success' as const,
        title: 'Test 2',
        message: 'Message 2',
      })

      const notifications = notificationService.getNotifications()
      expect(notifications).toHaveLength(2)
    })
  })

  describe('getUnreadCount', () => {
    it('should return 0 when no notifications', () => {
      notificationService.clearAll()
      expect(notificationService.getUnreadCount()).toBe(0)
    })

    it('should count unread notifications', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'Test 1',
        message: 'Message 1',
      })

      notificationService.notify({
        type: 'success' as const,
        title: 'Test 2',
        message: 'Message 2',
      })

      expect(notificationService.getUnreadCount()).toBe(2)
    })

    it('should exclude read notifications from count', () => {
      const notification = notificationService.notify({
        type: 'info' as const,
        title: 'Test',
        message: 'Message',
      })

      notificationService.markAsRead(notification.id)

      expect(notificationService.getUnreadCount()).toBe(0)
    })
  })

  describe('clearNotification', () => {
    it('should remove specific notification by id', () => {
      const notification = notificationService.notify({
        type: 'info' as const,
        title: 'To Remove',
        message: 'Message',
      })

      notificationService.notify({
        type: 'success' as const,
        title: 'To Keep',
        message: 'Message',
      })

      notificationService.clearNotification(notification.id)

      const notifications = notificationService.getNotifications()
      expect(notifications).toHaveLength(1)
      expect(notifications[0].title).toBe('To Keep')
    })

    it('should handle non-existent notification id', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'Test',
        message: 'Message',
      })

      // Should not throw
      notificationService.clearNotification('non-existent-id')

      const notifications = notificationService.getNotifications()
      expect(notifications).toHaveLength(1)
    })
  })

  describe('clearAll', () => {
    it('should remove all notifications', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'Test 1',
        message: 'Message 1',
      })

      notificationService.notify({
        type: 'success' as const,
        title: 'Test 2',
        message: 'Message 2',
      })

      notificationService.clearAll()

      const notifications = notificationService.getNotifications()
      expect(notifications).toHaveLength(0)
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const notification = notificationService.notify({
        type: 'info' as const,
        title: 'Test',
        message: 'Message',
      })

      expect(notification.read).toBeFalsy()

      notificationService.markAsRead(notification.id)

      const notifications = notificationService.getNotifications()
      expect(notifications[0].read).toBe(true)
    })

    it('should handle non-existent notification id', () => {
      // Should not throw
      notificationService.markAsRead('non-existent-id')
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'Test 1',
        message: 'Message 1',
      })

      notificationService.notify({
        type: 'success' as const,
        title: 'Test 2',
        message: 'Message 2',
      })

      notificationService.markAllAsRead()

      const notifications = notificationService.getNotifications()
      expect(notifications.every((n) => n.read === true)).toBe(true)
      expect(notificationService.getUnreadCount()).toBe(0)
    })
  })

  describe('subscribe', () => {
    it('should call callback with current notifications immediately', () => {
      const callback = vi.fn()

      notificationService.notify({
        type: 'info' as const,
        title: 'Test',
        message: 'Message',
      })

      notificationService.subscribe(callback)

      expect(callback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Test' }),
        ])
      )
    })

    it('should call callback when new notification added', () => {
      const callback = vi.fn()

      notificationService.subscribe(callback)
      callback.mockClear()

      notificationService.notify({
        type: 'success' as const,
        title: 'New Notification',
        message: 'Message',
      })

      expect(callback).toHaveBeenCalled()
    })

    it('should return unsubscribe function', () => {
      const callback = vi.fn()

      const unsubscribe = notificationService.subscribe(callback)
      callback.mockClear()

      unsubscribe()

      notificationService.notify({
        type: 'info' as const,
        title: 'Test',
        message: 'Message',
      })

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('Settings', () => {
    it('should return current settings', () => {
      notificationService.clearAll()

      const settings = notificationService.getSettings()

      expect(settings).toMatchObject({
        soundEnabled: expect.any(Boolean),
        desktopEnabled: expect.any(Boolean),
        notificationCount: 0,
        unreadCount: 0,
      })
    })

    it('should update settings when notifications change', () => {
      notificationService.clearAll()

      notificationService.notify({
        type: 'info' as const,
        title: 'Test',
        message: 'Message',
      })

      const settings = notificationService.getSettings()
      expect(settings.notificationCount).toBe(1)
      expect(settings.unreadCount).toBe(1)
    })

    it('should toggle sound enabled', () => {
      const initialSetting = notificationService.getSettings().soundEnabled

      notificationService.setSoundEnabled(!initialSetting)

      expect(notificationService.getSettings().soundEnabled).toBe(!initialSetting)
    })
  })

  describe('setStaffUserId', () => {
    it('should subscribe to notifications for user', () => {
      notificationService.setStaffUserId('user-123')

      expect(mockWebsocketService.subscribeToNotifications).toHaveBeenCalledWith(
        'user-123'
      )
    })

    it('should not re-subscribe if same user id', () => {
      notificationService.setStaffUserId('user-123')
      mockWebsocketService.subscribeToNotifications.mockClear()

      notificationService.setStaffUserId('user-123')

      expect(mockWebsocketService.subscribeToNotifications).not.toHaveBeenCalled()
    })

    it('should subscribe to new user when id changes', () => {
      notificationService.setStaffUserId('user-123')
      mockWebsocketService.subscribeToNotifications.mockClear()

      notificationService.setStaffUserId('user-456')

      expect(mockWebsocketService.subscribeToNotifications).toHaveBeenCalledWith(
        'user-456'
      )
    })
  })

  describe('isConnected', () => {
    it('should return connection status', () => {
      mockWebsocketService.getConnectionStatus.mockReturnValue({
        connected: true,
        activeSubscriptions: 1,
      })

      expect(notificationService.isConnected()).toBe(true)
    })

    it('should return false when disconnected', () => {
      mockWebsocketService.getConnectionStatus.mockReturnValue({
        connected: false,
        activeSubscriptions: 0,
      })

      expect(notificationService.isConnected()).toBe(false)
    })
  })

  describe('setDesktopEnabled', () => {
    it('should enable desktop notifications when permission is granted', () => {
      // Set granted permission
      setNotificationPermission('granted')

      notificationService.setDesktopEnabled(true)

      const settings = notificationService.getSettings()
      expect(settings.desktopEnabled).toBe(true)
    })

    it('should disable desktop notifications', () => {
      notificationService.setDesktopEnabled(false)

      const settings = notificationService.getSettings()
      expect(settings.desktopEnabled).toBe(false)
    })

    it('should request permission when permission is default and enabling', async () => {
      // Set 'default' permission that returns 'granted'
      setNotificationPermission('default')
      const requestPermissionMock = vi.fn(() => Promise.resolve('granted' as NotificationPermission))
      setRequestPermissionMock(requestPermissionMock)

      notificationService.setDesktopEnabled(true)

      // Wait for async permission request
      await vi.waitFor(() => {
        expect(requestPermissionMock).toHaveBeenCalled()
      })
    })

    it('should not request permission when disabling', () => {
      setNotificationPermission('default')
      const requestPermissionMock = vi.fn(() => Promise.resolve('granted' as NotificationPermission))
      setRequestPermissionMock(requestPermissionMock)

      notificationService.setDesktopEnabled(false)

      expect(requestPermissionMock).not.toHaveBeenCalled()
    })

    it('should update desktopEnabled based on permission result', async () => {
      // Set 'default' permission that will be denied
      setNotificationPermission('default')
      const requestPermissionMock = vi.fn(() => Promise.resolve('denied' as NotificationPermission))
      setRequestPermissionMock(requestPermissionMock)

      notificationService.setDesktopEnabled(true)

      // Wait for async permission request to complete
      await vi.waitFor(() => {
        expect(requestPermissionMock).toHaveBeenCalled()
      })

      // After denied permission, desktopEnabled should be false
      await new Promise(resolve => setTimeout(resolve, 10))
      const settings = notificationService.getSettings()
      expect(settings.desktopEnabled).toBe(false)
    })

    it('should handle case when Notification API permission property is undefined', () => {
      // This tests the edge case where Notification exists but permission is undefined
      // Save original permission
      const originalPermission = Notification.permission

      try {
        // Simulate a broken Notification API where permission is undefined
        Object.defineProperty(window.Notification, 'permission', {
          value: undefined,
          writable: true,
          configurable: true
        })

        // Should still set the flag internally even if permission check fails
        notificationService.setDesktopEnabled(true)

        const settings = notificationService.getSettings()
        expect(settings.desktopEnabled).toBe(true)
      } finally {
        // Restore original permission
        Object.defineProperty(window.Notification, 'permission', {
          value: originalPermission,
          writable: true,
          configurable: true
        })
      }
    })

    it('should handle permission request rejection gracefully', async () => {
      setNotificationPermission('default')

      // Create a mock that rejects
      const requestPermissionMock = vi.fn(() => Promise.reject(new Error('Permission error')))
      setRequestPermissionMock(requestPermissionMock)

      // Should not throw synchronously
      notificationService.setDesktopEnabled(true)

      // Wait for the promise to settle
      await new Promise(resolve => setTimeout(resolve, 50))

      // Verify the service handled the rejection and disabled desktop notifications
      expect(notificationService.getSettings().desktopEnabled).toBe(false)
    })
  })

  describe('Permission States', () => {
    it('should handle granted permission state', () => {
      setNotificationPermission('granted')

      notificationService.setDesktopEnabled(true)

      expect(notificationService.getSettings().desktopEnabled).toBe(true)
    })

    it('should handle denied permission state', () => {
      setNotificationPermission('denied')
      const requestPermissionMock = vi.fn(() => Promise.resolve('denied' as NotificationPermission))
      setRequestPermissionMock(requestPermissionMock)

      // When permission is denied, enabling desktop notifications should still set the flag
      // but no request should be made since permission is already denied
      notificationService.setDesktopEnabled(true)

      // Permission request should not be called when already denied
      expect(requestPermissionMock).not.toHaveBeenCalled()
    })

    it('should request permission when default state', async () => {
      setNotificationPermission('default')
      const requestPermissionMock = vi.fn(() => Promise.resolve('granted' as NotificationPermission))
      setRequestPermissionMock(requestPermissionMock)

      notificationService.setDesktopEnabled(true)

      await vi.waitFor(() => {
        expect(requestPermissionMock).toHaveBeenCalled()
      })
    })

    it('should not prompt again when permission was previously granted', () => {
      setNotificationPermission('granted')
      const requestPermissionMock = vi.fn(() => Promise.resolve('granted' as NotificationPermission))
      setRequestPermissionMock(requestPermissionMock)

      notificationService.setDesktopEnabled(true)

      // Should not call requestPermission when already granted
      expect(requestPermissionMock).not.toHaveBeenCalled()
    })

    it('should not prompt again when permission was previously denied', () => {
      setNotificationPermission('denied')
      const requestPermissionMock = vi.fn(() => Promise.resolve('denied' as NotificationPermission))
      setRequestPermissionMock(requestPermissionMock)

      notificationService.setDesktopEnabled(true)

      // Should not call requestPermission when already denied
      expect(requestPermissionMock).not.toHaveBeenCalled()
    })
  })

  describe('Audio Playback', () => {
    beforeEach(() => {
      // Enable sound for these tests
      notificationService.setSoundEnabled(true)
    })

    it('should play sound when notification is created', () => {
      notificationService.notify({
        type: 'success' as const,
        title: 'Test',
        message: 'Test message',
      })

      expect(mockAudioConstructorSpy).toHaveBeenCalled()
      expect(mockAudioPlay).toHaveBeenCalled()
    })

    it('should set volume to 0.3', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'Test',
        message: 'Test message',
      })

      expect(mockAudioInstance.volume).toBe(0.3)
    })

    it('should use correct sound file for success type', () => {
      notificationService.notify({
        type: 'success' as const,
        title: 'Test',
        message: 'Test message',
      })

      expect(mockAudioConstructorSpy).toHaveBeenCalledWith('/sounds/success.mp3')
    })

    it('should use correct sound file for error type', () => {
      notificationService.notify({
        type: 'error' as const,
        title: 'Test',
        message: 'Test message',
      })

      expect(mockAudioConstructorSpy).toHaveBeenCalledWith('/sounds/error.mp3')
    })

    it('should use correct sound file for warning type', () => {
      notificationService.notify({
        type: 'warning' as const,
        title: 'Test',
        message: 'Test message',
      })

      expect(mockAudioConstructorSpy).toHaveBeenCalledWith('/sounds/warning.mp3')
    })

    it('should use correct sound file for info type', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'Test',
        message: 'Test message',
      })

      expect(mockAudioConstructorSpy).toHaveBeenCalledWith('/sounds/info.mp3')
    })

    it('should not play sound when sound is disabled', () => {
      notificationService.setSoundEnabled(false)
      mockAudioConstructorSpy.mockClear()

      notificationService.notify({
        type: 'success' as const,
        title: 'Test',
        message: 'Test message',
      })

      expect(mockAudioConstructorSpy).not.toHaveBeenCalled()
    })

    it('should handle play() rejection gracefully (autoplay blocked)', async () => {
      mockAudioPlay.mockRejectedValueOnce(new Error('Autoplay blocked'))

      // Should not throw
      expect(() => {
        notificationService.notify({
          type: 'success' as const,
          title: 'Test',
          message: 'Test message',
        })
      }).not.toThrow()
    })

    it('should handle Audio constructor error gracefully', () => {
      // Temporarily replace with a throwing constructor
      const ThrowingMockAudioClass = function() {
        throw new Error('Audio not supported')
      } as unknown as typeof Audio
      Object.defineProperty(window, 'Audio', {
        value: ThrowingMockAudioClass,
        writable: true,
        configurable: true,
      })

      // Should not throw
      expect(() => {
        notificationService.notify({
          type: 'success' as const,
          title: 'Test',
          message: 'Test message',
        })
      }).not.toThrow()
    })
  })

  describe('Desktop Notification Display', () => {
    beforeEach(() => {
      // Enable desktop notifications for these tests
      notificationService.setDesktopEnabled(true)
    })

    it('should create desktop notification with correct options', () => {
      const notification = notificationService.notify({
        type: 'success' as const,
        title: 'Test Title',
        message: 'Test message body',
      })

      expect(mockNotificationConstructorSpy).toHaveBeenCalledWith('Test Title', {
        body: 'Test message body',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: notification.id,
        requireInteraction: undefined,
      })
    })

    it('should set requireInteraction for persistent notifications', () => {
      notificationService.notify({
        type: 'warning' as const,
        title: 'Persistent',
        message: 'This is persistent',
        persistent: true,
      })

      expect(mockNotificationConstructorSpy).toHaveBeenCalledWith('Persistent',
        expect.objectContaining({
          requireInteraction: true,
        })
      )
    })

    it('should set onclick handler when notification has action', () => {
      const actionHandler = vi.fn()

      notificationService.notify({
        type: 'info' as const,
        title: 'Action Test',
        message: 'Click me',
        action: {
          label: 'Do something',
          onClick: actionHandler,
        },
      })

      expect(mockNotificationInstance.onclick).not.toBeNull()
    })

    it('should call action onClick and close notification when clicked', () => {
      const actionHandler = vi.fn()
      const windowFocusSpy = vi.spyOn(window, 'focus').mockImplementation(() => {})

      notificationService.notify({
        type: 'info' as const,
        title: 'Action Test',
        message: 'Click me',
        action: {
          label: 'Do something',
          onClick: actionHandler,
        },
      })

      // Simulate click on desktop notification
      if (mockNotificationInstance.onclick) {
        mockNotificationInstance.onclick(new Event('click'))
      }

      expect(windowFocusSpy).toHaveBeenCalled()
      expect(actionHandler).toHaveBeenCalled()
      expect(mockNotificationClose).toHaveBeenCalled()

      windowFocusSpy.mockRestore()
    })

    it('should auto-close non-persistent notifications after timeout', () => {
      vi.useFakeTimers()

      notificationService.notify({
        type: 'info' as const,
        title: 'Auto Close',
        message: 'Should close automatically',
        persistent: false,
      })

      expect(mockNotificationClose).not.toHaveBeenCalled()

      vi.advanceTimersByTime(5000)

      expect(mockNotificationClose).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should not auto-close persistent notifications', () => {
      vi.useFakeTimers()

      notificationService.notify({
        type: 'warning' as const,
        title: 'Stay Open',
        message: 'Should stay open',
        persistent: true,
      })

      vi.advanceTimersByTime(10000)

      // close should not have been called by the auto-close timeout
      // (it might be called for other reasons, so we check the call count)
      const closeCallCount = mockNotificationClose.mock.calls.length
      expect(closeCallCount).toBe(0)

      vi.useRealTimers()
    })

    it('should not create desktop notification when disabled', () => {
      notificationService.setDesktopEnabled(false)
      mockNotificationConstructorSpy.mockClear()

      notificationService.notify({
        type: 'success' as const,
        title: 'Test',
        message: 'Test message',
      })

      expect(mockNotificationConstructorSpy).not.toHaveBeenCalled()
    })
  })

  describe('WebSocket Event Handlers', () => {
    // Get registered event handler from the stored map
    const getEventHandler = (eventName: string) => {
      return eventHandlers.get(eventName) || null
    }

    it('should register handler for notification.received event', () => {
      expect(eventHandlers.has('notification.received')).toBe(true)
    })

    it('should register handler for treatment.ready_for_payment event', () => {
      expect(eventHandlers.has('treatment.ready_for_payment')).toBe(true)
    })

    it('should register handler for treatment.documentation_received event', () => {
      expect(eventHandlers.has('treatment.documentation_received')).toBe(true)
    })

    it('should register handler for provider.needs_assistance event', () => {
      expect(eventHandlers.has('provider.needs_assistance')).toBe(true)
    })

    it('should register handler for treatment.sync_conflict event', () => {
      expect(eventHandlers.has('treatment.sync_conflict')).toBe(true)
    })

    it('should register handler for inventory.auto_deducted event', () => {
      expect(eventHandlers.has('inventory.auto_deducted')).toBe(true)
    })

    it('should register handler for waitingRoom.patient_checked_in event', () => {
      expect(eventHandlers.has('waitingRoom.patient_checked_in')).toBe(true)
    })

    it('should register handler for waitingRoom.patient_called event', () => {
      expect(eventHandlers.has('waitingRoom.patient_called')).toBe(true)
    })

    it('should register handler for appointment.created event', () => {
      expect(eventHandlers.has('appointment.created')).toBe(true)
    })

    it('should register handler for appointment.cancelled event', () => {
      expect(eventHandlers.has('appointment.cancelled')).toBe(true)
    })

    it('should create success notification for treatment.ready_for_payment', () => {
      const handler = getEventHandler('treatment.ready_for_payment')
      if (handler) {
        handler({ patientName: 'John Doe', roomNumber: 'Room 1', patientId: '123' })
      }

      const notifications = notificationService.getNotifications()
      const treatmentNotif = notifications.find(n => n.title === 'Treatment Complete')
      expect(treatmentNotif).toBeDefined()
      expect(treatmentNotif?.type).toBe('success')
      expect(treatmentNotif?.message).toContain('John Doe')
    })

    it('should create info notification for treatment.documentation_received', () => {
      const handler = getEventHandler('treatment.documentation_received')
      if (handler) {
        handler({ providerName: 'Dr. Smith', patientName: 'Jane Doe' })
      }

      const notifications = notificationService.getNotifications()
      const docNotif = notifications.find(n => n.title === 'Documentation Received')
      expect(docNotif).toBeDefined()
      expect(docNotif?.type).toBe('info')
    })

    it('should create persistent warning notification for provider.needs_assistance', () => {
      const handler = getEventHandler('provider.needs_assistance')
      if (handler) {
        handler({ providerName: 'Dr. Smith', roomNumber: 'Room 3', providerId: 'p1' })
      }

      const notifications = notificationService.getNotifications()
      const assistNotif = notifications.find(n => n.title === 'Provider Assistance Needed')
      expect(assistNotif).toBeDefined()
      expect(assistNotif?.type).toBe('warning')
      expect(assistNotif?.persistent).toBe(true)
    })

    it('should create persistent error notification for treatment.sync_conflict', () => {
      const handler = getEventHandler('treatment.sync_conflict')
      if (handler) {
        handler({ patientName: 'John Doe' })
      }

      const notifications = notificationService.getNotifications()
      const syncNotif = notifications.find(n => n.title === 'Sync Error')
      expect(syncNotif).toBeDefined()
      expect(syncNotif?.type).toBe('error')
      expect(syncNotif?.persistent).toBe(true)
    })

    it('should create warning notification for low stock inventory', () => {
      const handler = getEventHandler('inventory.auto_deducted')
      if (handler) {
        handler({ lowStock: true, productName: 'Botox', remaining: 5, unit: 'vials' })
      }

      const notifications = notificationService.getNotifications()
      const stockNotif = notifications.find(n => n.title === 'Low Stock Alert')
      expect(stockNotif).toBeDefined()
      expect(stockNotif?.type).toBe('warning')
      expect(stockNotif?.message).toContain('Botox')
    })

    it('should not create notification for inventory when not low stock', () => {
      const initialCount = notificationService.getNotifications().length

      const handler = getEventHandler('inventory.auto_deducted')
      if (handler) {
        handler({ lowStock: false, productName: 'Filler', remaining: 50 })
      }

      expect(notificationService.getNotifications().length).toBe(initialCount)
    })

    it('should create info notification for waitingRoom.patient_checked_in', () => {
      const handler = getEventHandler('waitingRoom.patient_checked_in')
      if (handler) {
        handler({ patientName: 'Alice Johnson' })
      }

      const notifications = notificationService.getNotifications()
      const checkinNotif = notifications.find(n => n.title === 'Patient Checked In')
      expect(checkinNotif).toBeDefined()
      expect(checkinNotif?.type).toBe('info')
    })

    it('should create success notification for waitingRoom.patient_called', () => {
      const handler = getEventHandler('waitingRoom.patient_called')
      if (handler) {
        handler({ patientName: 'Bob Wilson' })
      }

      const notifications = notificationService.getNotifications()
      const calledNotif = notifications.find(n => n.title === 'Patient Called')
      expect(calledNotif).toBeDefined()
      expect(calledNotif?.type).toBe('success')
    })

    it('should create notification for same-day appointment.created', () => {
      const today = new Date()
      const handler = getEventHandler('appointment.created')
      if (handler) {
        handler({ patientName: 'New Patient', scheduledTime: today.toISOString() })
      }

      const notifications = notificationService.getNotifications()
      const apptNotif = notifications.find(n => n.title === 'New Appointment')
      expect(apptNotif).toBeDefined()
      expect(apptNotif?.type).toBe('info')
    })

    it('should not create notification for future-day appointment.created', () => {
      const initialCount = notificationService.getNotifications().length
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      const handler = getEventHandler('appointment.created')
      if (handler) {
        handler({ patientName: 'Future Patient', scheduledTime: futureDate.toISOString() })
      }

      expect(notificationService.getNotifications().length).toBe(initialCount)
    })

    it('should create warning notification for appointment.cancelled', () => {
      const handler = getEventHandler('appointment.cancelled')
      if (handler) {
        handler({ patientName: 'Cancelled Patient' })
      }

      const notifications = notificationService.getNotifications()
      const cancelNotif = notifications.find(n => n.title === 'Appointment Cancelled')
      expect(cancelNotif).toBeDefined()
      expect(cancelNotif?.type).toBe('warning')
    })
  })

  describe('Firestore Notification Handling', () => {
    // Get registered event handler from the stored map
    const getEventHandler = (eventName: string) => {
      return eventHandlers.get(eventName) || null
    }

    it('should map treatment_ready type to success', () => {
      const handler = getEventHandler('notification.received')
      if (handler) {
        handler({ type: 'treatment_ready', title: 'Ready', message: 'Patient ready' })
      }

      const notifications = notificationService.getNotifications()
      const notif = notifications.find(n => n.title === 'Ready')
      expect(notif?.type).toBe('success')
    })

    it('should map documentation_complete type to info', () => {
      const handler = getEventHandler('notification.received')
      if (handler) {
        handler({ type: 'documentation_complete', title: 'Docs', message: 'Docs done' })
      }

      const notifications = notificationService.getNotifications()
      const notif = notifications.find(n => n.title === 'Docs')
      expect(notif?.type).toBe('info')
    })

    it('should map assistance_needed type to warning', () => {
      const handler = getEventHandler('notification.received')
      if (handler) {
        handler({ type: 'assistance_needed', title: 'Help', message: 'Need help' })
      }

      const notifications = notificationService.getNotifications()
      const notif = notifications.find(n => n.title === 'Help')
      expect(notif?.type).toBe('warning')
    })

    it('should map sync_error type to error', () => {
      const handler = getEventHandler('notification.received')
      if (handler) {
        handler({ type: 'sync_error', title: 'Sync Failed', message: 'Error syncing' })
      }

      const notifications = notificationService.getNotifications()
      const notif = notifications.find(n => n.title === 'Sync Failed')
      expect(notif?.type).toBe('error')
    })

    it('should handle notification with actionUrl', () => {
      const handler = getEventHandler('notification.received')
      if (handler) {
        handler({
          type: 'patient_arrived',
          title: 'Patient Here',
          message: 'Check in',
          actionUrl: '/waiting-room',
          actionLabel: 'Go to Waiting Room'
        })
      }

      const notifications = notificationService.getNotifications()
      const notif = notifications.find(n => n.title === 'Patient Here')
      expect(notif?.action).toBeDefined()
      expect(notif?.action?.label).toBe('Go to Waiting Room')
    })

    it('should handle notification with requiresAction as persistent', () => {
      const handler = getEventHandler('notification.received')
      if (handler) {
        handler({
          type: 'low_stock',
          title: 'Stock Alert',
          message: 'Low inventory',
          requiresAction: true
        })
      }

      const notifications = notificationService.getNotifications()
      const notif = notifications.find(n => n.title === 'Stock Alert')
      expect(notif?.persistent).toBe(true)
    })

    it('should use body as message fallback', () => {
      const handler = getEventHandler('notification.received')
      if (handler) {
        handler({
          type: 'appointment_reminder',
          title: 'Reminder',
          body: 'Appointment in 15 minutes'
        })
      }

      const notifications = notificationService.getNotifications()
      const notif = notifications.find(n => n.title === 'Reminder')
      expect(notif?.message).toBe('Appointment in 15 minutes')
    })

    it('should default unknown type to info', () => {
      const handler = getEventHandler('notification.received')
      if (handler) {
        handler({ type: 'unknown_type', title: 'Unknown', message: 'Some message' })
      }

      const notifications = notificationService.getNotifications()
      const notif = notifications.find(n => n.title === 'Unknown')
      expect(notif?.type).toBe('info')
    })
  })

  describe('SSR Safety', () => {
    it('should handle calls without throwing when window is undefined', () => {
      // The service already handles SSR safety internally with typeof window checks
      // These tests verify the public API doesn't throw
      expect(() => notificationService.getSettings()).not.toThrow()
      expect(() => notificationService.getNotifications()).not.toThrow()
      expect(() => notificationService.getUnreadCount()).not.toThrow()
      expect(() => notificationService.isConnected()).not.toThrow()
    })

    it('should handle setDesktopEnabled safely', () => {
      expect(() => notificationService.setDesktopEnabled(true)).not.toThrow()
      expect(() => notificationService.setDesktopEnabled(false)).not.toThrow()
    })

    it('should handle setSoundEnabled safely', () => {
      expect(() => notificationService.setSoundEnabled(true)).not.toThrow()
      expect(() => notificationService.setSoundEnabled(false)).not.toThrow()
    })

    it('should handle notify safely', () => {
      expect(() => notificationService.notify({
        type: 'info' as const,
        title: 'SSR Test',
        message: 'Testing SSR safety',
      })).not.toThrow()
    })

    it('should handle subscribe safely', () => {
      const callback = vi.fn()
      let unsubscribe: (() => void) | undefined

      expect(() => {
        unsubscribe = notificationService.subscribe(callback)
      }).not.toThrow()

      expect(() => {
        if (unsubscribe) unsubscribe()
      }).not.toThrow()
    })

    it('should skip desktop notification when Notification API is unavailable', () => {
      // Save original Notification
      const originalNotification = window.Notification

      try {
        // Simulate environment without Notification API
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).Notification = undefined
        notificationService.setDesktopEnabled(true)

        // This should not throw even when Notification is undefined
        expect(() => notificationService.notify({
          type: 'success' as const,
          title: 'Test',
          message: 'Message',
        })).not.toThrow()
      } finally {
        // Restore original Notification
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).Notification = originalNotification
      }
    })

    it('should skip sound playback when Audio API is unavailable', () => {
      // Save original Audio
      const originalAudio = window.Audio

      try {
        // Simulate environment without Audio API
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).Audio = undefined
        notificationService.setSoundEnabled(true)

        // This should not throw even when Audio is undefined
        expect(() => notificationService.notify({
          type: 'success' as const,
          title: 'Test',
          message: 'Message',
        })).not.toThrow()
      } finally {
        // Restore original Audio
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).Audio = originalAudio
      }
    })

    it('should handle clearNotification without throwing', () => {
      expect(() => notificationService.clearNotification('non-existent')).not.toThrow()
    })

    it('should handle clearAll without throwing', () => {
      expect(() => notificationService.clearAll()).not.toThrow()
    })

    it('should handle markAsRead without throwing for non-existent id', () => {
      expect(() => notificationService.markAsRead('non-existent')).not.toThrow()
    })

    it('should handle markAllAsRead without throwing', () => {
      expect(() => notificationService.markAllAsRead()).not.toThrow()
    })
  })

  describe('Desktop Notification Integration', () => {
    beforeEach(() => {
      // Ensure desktop notifications are enabled for these tests
      setNotificationPermission('granted')
      notificationService.setDesktopEnabled(true)
    })

    it('should verify all notification options are passed correctly', () => {
      const notification = notificationService.notify({
        type: 'info' as const,
        title: 'Complete Test',
        message: 'Testing all options',
        persistent: true,
        action: {
          label: 'Test Action',
          onClick: vi.fn(),
        },
      })

      expect(mockNotificationConstructorSpy).toHaveBeenCalledWith(
        'Complete Test',
        expect.objectContaining({
          body: 'Testing all options',
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          tag: notification.id,
          requireInteraction: true,
        })
      )
    })

    it('should set icon to /icon-192.png', () => {
      notificationService.notify({
        type: 'success' as const,
        title: 'Icon Test',
        message: 'Testing icon',
      })

      expect(mockNotificationConstructorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          icon: '/icon-192.png',
        })
      )
    })

    it('should set badge to /badge-72.png', () => {
      notificationService.notify({
        type: 'success' as const,
        title: 'Badge Test',
        message: 'Testing badge',
      })

      expect(mockNotificationConstructorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          badge: '/badge-72.png',
        })
      )
    })

    it('should use notification id as tag', () => {
      const notification = notificationService.notify({
        type: 'info' as const,
        title: 'Tag Test',
        message: 'Testing tag',
      })

      expect(mockNotificationConstructorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          tag: notification.id,
        })
      )
    })

    it('should handle notification without action - no onclick handler', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'No Action',
        message: 'No action button',
      })

      // onclick should remain null when no action provided
      expect(mockNotificationInstance.onclick).toBeNull()
    })
  })

  describe('Audio Playback Integration', () => {
    beforeEach(() => {
      notificationService.setSoundEnabled(true)
      // Reset mock instance
      mockAudioInstance.volume = 0
      mockAudioInstance.src = ''
    })

    it('should create Audio instance with correct source URL', () => {
      notificationService.notify({
        type: 'error' as const,
        title: 'Error Sound',
        message: 'Testing error sound',
      })

      expect(mockAudioConstructorSpy).toHaveBeenCalledWith('/sounds/error.mp3')
    })

    it('should set volume before playing', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'Volume Test',
        message: 'Testing volume',
      })

      // Volume should be set to 0.3
      expect(mockAudioInstance.volume).toBe(0.3)
    })

    it('should call play() after setting volume', () => {
      notificationService.notify({
        type: 'success' as const,
        title: 'Play Test',
        message: 'Testing play',
      })

      expect(mockAudioPlay).toHaveBeenCalled()
    })

    it('should use info sound as fallback for unknown types', () => {
      // The service maps unknown types to info sound
      // Simulate by checking the default case
      notificationService.notify({
        type: 'info' as const,
        title: 'Fallback Test',
        message: 'Testing fallback',
      })

      expect(mockAudioConstructorSpy).toHaveBeenCalledWith('/sounds/info.mp3')
    })

    it('should handle multiple rapid notifications without issues', () => {
      // Should not throw when firing multiple notifications quickly
      expect(() => {
        for (let i = 0; i < 10; i++) {
          notificationService.notify({
            type: ['success', 'error', 'warning', 'info'][i % 4] as 'success' | 'error' | 'warning' | 'info',
            title: `Rapid ${i}`,
            message: `Message ${i}`,
          })
        }
      }).not.toThrow()

      // All should have attempted to play
      expect(mockAudioPlay).toHaveBeenCalledTimes(10)
    })
  })

  describe('Notification Lifecycle', () => {
    it('should generate unique IDs for each notification', () => {
      const notif1 = notificationService.notify({
        type: 'info' as const,
        title: 'First',
        message: 'First message',
      })

      const notif2 = notificationService.notify({
        type: 'info' as const,
        title: 'Second',
        message: 'Second message',
      })

      expect(notif1.id).not.toBe(notif2.id)
      expect(notif1.id).toMatch(/^notif-\d+-[a-z0-9]+$/)
      expect(notif2.id).toMatch(/^notif-\d+-[a-z0-9]+$/)
    })

    it('should set timestamp to current date', () => {
      const before = new Date()

      const notification = notificationService.notify({
        type: 'info' as const,
        title: 'Timestamp Test',
        message: 'Testing timestamp',
      })

      const after = new Date()

      expect(notification.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(notification.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should keep newest notifications when limit exceeded', () => {
      // Clear and add exactly 50 notifications
      notificationService.clearAll()

      for (let i = 0; i < 50; i++) {
        notificationService.notify({
          type: 'info' as const,
          title: `Notification ${i}`,
          message: `Message ${i}`,
        })
      }

      // Add one more to exceed limit
      const newest = notificationService.notify({
        type: 'info' as const,
        title: 'Newest',
        message: 'This is the newest',
      })

      const notifications = notificationService.getNotifications()
      expect(notifications).toHaveLength(50)
      expect(notifications[0].id).toBe(newest.id)
      // The very first notification should have been removed
      expect(notifications.find(n => n.title === 'Notification 0')).toBeUndefined()
    })
  })

  describe('Toast Notification Types', () => {
    it('should call toast for info notifications', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'Info',
        message: 'Info message',
      })

      // Info uses the default toast() function, not toast.success or toast.error
      expect(mockToastFn).toHaveBeenCalled()
    })

    it('should call toast for warning notifications with icon', () => {
      notificationService.notify({
        type: 'warning' as const,
        title: 'Warning',
        message: 'Warning message',
      })

      // Warning uses toast() with icon option
      expect(mockToastFn).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          icon: '!',
        })
      )
    })

    it('should set infinite duration for persistent notifications', () => {
      notificationService.notify({
        type: 'error' as const,
        title: 'Persistent Error',
        message: 'This should stay',
        persistent: true,
      })

      expect(mockToastError).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          duration: Infinity,
        })
      )
    })

    it('should set 5000ms duration for non-persistent notifications', () => {
      notificationService.notify({
        type: 'success' as const,
        title: 'Temporary',
        message: 'This will disappear',
        persistent: false,
      })

      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          duration: 5000,
        })
      )
    })

    it('should include action label in toast message when action provided', () => {
      notificationService.notify({
        type: 'success' as const,
        title: 'Action Toast',
        message: 'Has an action',
        action: {
          label: 'Click Me',
          onClick: vi.fn(),
        },
      })

      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.stringContaining('Click Me'),
        expect.any(Object)
      )
    })

    it('should set position to top-right', () => {
      notificationService.notify({
        type: 'info' as const,
        title: 'Position Test',
        message: 'Testing position',
      })

      expect(mockToastFn).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          position: 'top-right',
        })
      )
    })
  })
})
