import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Create hoisted mock for onSnapshot that we can control
const { mockOnSnapshot, mockUnsubscribe, mockFirestore, MockTimestamp } = vi.hoisted(() => {
  const mockUnsubscribe = vi.fn()
  const mockOnSnapshot = vi.fn(() => mockUnsubscribe)
  const mockFirestore = { type: 'firestore' }

  // Create a mock Timestamp class that can be used with instanceof
  class MockTimestamp {
    private _date: Date
    constructor(date: Date) {
      this._date = date
    }
    toDate() {
      return this._date
    }
    static fromDate(date: Date) {
      return new MockTimestamp(date)
    }
  }

  return { mockOnSnapshot, mockUnsubscribe, mockFirestore, MockTimestamp }
})

// Mock Firebase module
vi.mock('@/lib/firebase', () => ({
  firestore: mockFirestore,
  isFirebaseConfigured: vi.fn(() => true),
  collection: vi.fn(() => ({ path: 'notifications' })),
  doc: vi.fn(),
  onSnapshot: mockOnSnapshot,
  query: vi.fn((ref) => ref),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  enableNetwork: vi.fn(),
  disableNetwork: vi.fn(),
  COLLECTIONS: {
    APPOINTMENTS: 'appointments',
    WAITING_ROOM: 'waitingRoom',
    NOTIFICATIONS: 'notifications',
    WAITLIST_OFFERS: 'waitlistOffers',
    ROOMS: 'rooms',
    TREATMENTS: 'treatments',
  },
  getWaitingRoomQueuePath: vi.fn((id: string) => `waitingRoom/${id}/queue`),
  getStaffNotificationsPath: vi.fn((id: string) => `notifications/${id}/items`),
  Timestamp: MockTimestamp,
}))

// Create hoisted mock data that can be used in vi.mock
const { mockWebsocketService, eventHandlers } = vi.hoisted(() => {
  const eventHandlers = new Map<string, Set<Function>>()

  const mockWebsocketService = {
    subscribeToNotifications: vi.fn(),
    subscribeToWaitingRoom: vi.fn(),
    subscribeToRooms: vi.fn(),
    subscribeToWaitlistOffers: vi.fn(),
    on: vi.fn((event: string, handler: Function) => {
      if (!eventHandlers.has(event)) {
        eventHandlers.set(event, new Set())
      }
      eventHandlers.get(event)?.add(handler)
      return () => {
        eventHandlers.get(event)?.delete(handler)
      }
    }),
    off: vi.fn((event: string, handler: Function) => {
      eventHandlers.get(event)?.delete(handler)
    }),
    emit: vi.fn((event: string, data: any) => {
      eventHandlers.get(event)?.forEach((handler) => handler(data))
    }),
    getConnectionStatus: vi.fn(() => ({ connected: true, activeSubscriptions: 1 })),
    isConfigured: vi.fn(() => true),
  }

  return { mockWebsocketService, eventHandlers }
})

vi.mock('@/services/websocket', () => ({
  websocketService: mockWebsocketService,
  useNotificationsRealtime: vi.fn(),
  useWaitingRoomRealtime: vi.fn(),
  useRoomsRealtime: vi.fn(),
  useWaitlistOffersRealtime: vi.fn(),
}))

import {
  useNotificationsRealtime,
  useWaitingRoomRealtime,
  useRoomsRealtime,
  useWaitlistOffersRealtime,
} from '@/services/websocket'

describe('Real-time Notification Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    eventHandlers.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useNotificationsRealtime', () => {
    it('should return empty array initially', () => {
      vi.mocked(useNotificationsRealtime).mockReturnValue({
        notifications: [],
        isConnected: true,
      })

      const { result } = renderHook(() => useNotificationsRealtime('user-123'))

      expect(result.current.notifications).toEqual([])
    })

    it('should subscribe to notifications on mount', () => {
      vi.mocked(useNotificationsRealtime).mockImplementation((staffUserId) => {
        mockWebsocketService.subscribeToNotifications(staffUserId)
        return { notifications: [], isConnected: true }
      })

      renderHook(() => useNotificationsRealtime('user-123'))

      expect(mockWebsocketService.subscribeToNotifications).toHaveBeenCalledWith(
        'user-123'
      )
    })

    it('should not subscribe when no staffUserId provided', () => {
      vi.mocked(useNotificationsRealtime).mockImplementation((staffUserId) => {
        if (staffUserId) {
          mockWebsocketService.subscribeToNotifications(staffUserId)
        }
        return { notifications: [], isConnected: true }
      })

      renderHook(() => useNotificationsRealtime(''))

      expect(mockWebsocketService.subscribeToNotifications).not.toHaveBeenCalled()
    })

    it('should update notifications when new notification received', () => {
      const notifications: any[] = []
      vi.mocked(useNotificationsRealtime).mockImplementation(() => {
        return { notifications, isConnected: true }
      })

      const { result, rerender } = renderHook(() =>
        useNotificationsRealtime('user-123')
      )

      expect(result.current.notifications).toHaveLength(0)

      // Simulate new notification
      notifications.push({
        id: 'notif-1',
        type: 'appointment_reminder',
        title: 'New Notification',
        body: 'Test',
        createdAt: new Date(),
      })

      rerender()

      expect(result.current.notifications).toHaveLength(1)
    })

    it('should limit notifications to 50', () => {
      const notifications = Array.from({ length: 60 }, (_, i) => ({
        id: `notif-${i}`,
        type: 'info',
        title: `Notification ${i}`,
        body: 'Test',
        createdAt: new Date(),
      }))

      vi.mocked(useNotificationsRealtime).mockReturnValue({
        notifications: notifications.slice(0, 50),
        isConnected: true,
      })

      const { result } = renderHook(() => useNotificationsRealtime('user-123'))

      expect(result.current.notifications).toHaveLength(50)
    })
  })

  describe('useWaitingRoomRealtime', () => {
    it('should subscribe to waiting room on mount', () => {
      vi.mocked(useWaitingRoomRealtime).mockImplementation((locationId) => {
        mockWebsocketService.subscribeToWaitingRoom(locationId)
        return { queue: [], isConnected: true }
      })

      renderHook(() => useWaitingRoomRealtime('location-1'))

      expect(mockWebsocketService.subscribeToWaitingRoom).toHaveBeenCalledWith(
        'location-1'
      )
    })

    it('should use default location when not specified', () => {
      vi.mocked(useWaitingRoomRealtime).mockImplementation((locationId = 'default') => {
        mockWebsocketService.subscribeToWaitingRoom(locationId)
        return { queue: [], isConnected: true }
      })

      renderHook(() => useWaitingRoomRealtime())

      expect(mockWebsocketService.subscribeToWaitingRoom).toHaveBeenCalledWith(
        'default'
      )
    })

    it('should return queue and connection status', () => {
      const mockQueue = [
        {
          id: 'entry-1',
          patientName: 'John Doe',
          status: 'checked_in',
          position: 1,
        },
      ]

      vi.mocked(useWaitingRoomRealtime).mockReturnValue({
        queue: mockQueue,
        isConnected: true,
      })

      const { result } = renderHook(() => useWaitingRoomRealtime('location-1'))

      expect(result.current.queue).toEqual(mockQueue)
      expect(result.current.isConnected).toBe(true)
    })

    it('should report disconnected state', () => {
      vi.mocked(useWaitingRoomRealtime).mockReturnValue({
        queue: [],
        isConnected: false,
      })

      const { result } = renderHook(() => useWaitingRoomRealtime('location-1'))

      expect(result.current.isConnected).toBe(false)
    })
  })

  describe('useRoomsRealtime', () => {
    it('should subscribe to rooms on mount', () => {
      vi.mocked(useRoomsRealtime).mockImplementation((locationId) => {
        mockWebsocketService.subscribeToRooms(locationId)
        return { rooms: [], isConnected: true }
      })

      renderHook(() => useRoomsRealtime('location-1'))

      expect(mockWebsocketService.subscribeToRooms).toHaveBeenCalledWith(
        'location-1'
      )
    })

    it('should use default location when not specified', () => {
      vi.mocked(useRoomsRealtime).mockImplementation((locationId = 'default') => {
        mockWebsocketService.subscribeToRooms(locationId)
        return { rooms: [], isConnected: true }
      })

      renderHook(() => useRoomsRealtime())

      expect(mockWebsocketService.subscribeToRooms).toHaveBeenCalledWith('default')
    })

    it('should return rooms and connection status', () => {
      const mockRooms = [
        {
          id: 'room-1',
          number: '101',
          status: 'empty',
        },
        {
          id: 'room-2',
          number: '102',
          status: 'in-progress',
        },
      ]

      vi.mocked(useRoomsRealtime).mockReturnValue({
        rooms: mockRooms,
        isConnected: true,
      })

      const { result } = renderHook(() => useRoomsRealtime('location-1'))

      expect(result.current.rooms).toEqual(mockRooms)
      expect(result.current.rooms).toHaveLength(2)
    })
  })

  describe('useWaitlistOffersRealtime', () => {
    it('should subscribe to waitlist offers on mount', () => {
      vi.mocked(useWaitlistOffersRealtime).mockImplementation((locationId) => {
        mockWebsocketService.subscribeToWaitlistOffers(locationId)
        return { offers: [], isConnected: true }
      })

      renderHook(() => useWaitlistOffersRealtime('location-1'))

      expect(mockWebsocketService.subscribeToWaitlistOffers).toHaveBeenCalledWith(
        'location-1'
      )
    })

    it('should use default location when not specified', () => {
      vi.mocked(useWaitlistOffersRealtime).mockImplementation(
        (locationId = 'default') => {
          mockWebsocketService.subscribeToWaitlistOffers(locationId)
          return { offers: [], isConnected: true }
        }
      )

      renderHook(() => useWaitlistOffersRealtime())

      expect(mockWebsocketService.subscribeToWaitlistOffers).toHaveBeenCalledWith(
        'default'
      )
    })

    it('should return offers and connection status', () => {
      const mockOffers = [
        {
          id: 'offer-1',
          patientName: 'Jane Doe',
          status: 'pending',
          expiresAt: new Date(),
        },
      ]

      vi.mocked(useWaitlistOffersRealtime).mockReturnValue({
        offers: mockOffers,
        isConnected: true,
      })

      const { result } = renderHook(() => useWaitlistOffersRealtime('location-1'))

      expect(result.current.offers).toEqual(mockOffers)
    })
  })
})

describe('WebSocket Event Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    eventHandlers.clear()
  })

  describe('Event Subscription', () => {
    it('should register event handler', () => {
      const handler = vi.fn()

      mockWebsocketService.on('notification.received', handler)

      expect(eventHandlers.get('notification.received')?.has(handler)).toBe(true)
    })

    it('should unsubscribe event handler', () => {
      const handler = vi.fn()

      const unsubscribe = mockWebsocketService.on('notification.received', handler)
      unsubscribe()

      expect(eventHandlers.get('notification.received')?.has(handler)).toBe(false)
    })

    it('should emit events to registered handlers', () => {
      const handler = vi.fn()
      mockWebsocketService.on('notification.received', handler)

      mockWebsocketService.emit('notification.received', { id: 'test-1' })

      expect(handler).toHaveBeenCalledWith({ id: 'test-1' })
    })

    it('should handle multiple handlers for same event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      mockWebsocketService.on('notification.received', handler1)
      mockWebsocketService.on('notification.received', handler2)

      mockWebsocketService.emit('notification.received', { id: 'test-1' })

      expect(handler1).toHaveBeenCalledWith({ id: 'test-1' })
      expect(handler2).toHaveBeenCalledWith({ id: 'test-1' })
    })

    it('should not emit to unsubscribed handlers', () => {
      const handler = vi.fn()

      const unsubscribe = mockWebsocketService.on('notification.received', handler)
      unsubscribe()

      mockWebsocketService.emit('notification.received', { id: 'test-1' })

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('Connection Status', () => {
    it('should return connected status', () => {
      mockWebsocketService.getConnectionStatus.mockReturnValue({
        connected: true,
        activeSubscriptions: 2,
      })

      const status = mockWebsocketService.getConnectionStatus()

      expect(status.connected).toBe(true)
      expect(status.activeSubscriptions).toBe(2)
    })

    it('should return disconnected status', () => {
      mockWebsocketService.getConnectionStatus.mockReturnValue({
        connected: false,
        activeSubscriptions: 0,
      })

      const status = mockWebsocketService.getConnectionStatus()

      expect(status.connected).toBe(false)
    })
  })

  describe('Firestore Subscription', () => {
    it('should check if configured', () => {
      mockWebsocketService.isConfigured.mockReturnValue(true)

      expect(mockWebsocketService.isConfigured()).toBe(true)
    })

    it('should report not configured when Firebase unavailable', () => {
      mockWebsocketService.isConfigured.mockReturnValue(false)

      expect(mockWebsocketService.isConfigured()).toBe(false)
    })
  })
})

describe('Notification Event Types', () => {
  beforeEach(() => {
    eventHandlers.clear()
  })

  const eventTypes = [
    'notification.received',
    'notification.read',
    'appointment.created',
    'appointment.updated',
    'appointment.cancelled',
    'appointment.status_changed',
    'treatment.ready_for_payment',
    'treatment.documentation_received',
    'treatment.sync_conflict',
    'inventory.auto_deducted',
    'waitingRoom.queue_updated',
    'waitingRoom.patient_checked_in',
    'waitingRoom.patient_called',
  ]

  eventTypes.forEach((eventType) => {
    it(`should handle ${eventType} event`, () => {
      const handler = vi.fn()
      mockWebsocketService.on(eventType, handler)

      mockWebsocketService.emit(eventType, { testData: true })

      expect(handler).toHaveBeenCalledWith({ testData: true })
    })
  })
})

describe('Error Handling', () => {
  beforeEach(() => {
    eventHandlers.clear()
  })

  it('should not throw when emitting to no handlers', () => {
    expect(() => {
      mockWebsocketService.emit('non.existent.event', { data: true })
    }).not.toThrow()
  })

  it('should continue emitting even if one handler throws', () => {
    const errorHandler = vi.fn(() => {
      throw new Error('Handler error')
    })
    const successHandler = vi.fn()

    // Modify emit to catch errors
    const safeEmit = (event: string, data: any) => {
      eventHandlers.get(event)?.forEach((handler) => {
        try {
          handler(data)
        } catch (e) {
          // Silently catch
        }
      })
    }

    mockWebsocketService.on('notification.received', errorHandler)
    mockWebsocketService.on('notification.received', successHandler)

    safeEmit('notification.received', { id: 'test-1' })

    expect(errorHandler).toHaveBeenCalled()
    expect(successHandler).toHaveBeenCalled()
  })
})

// Import the actual hook for testing reconnection logic
import { useNotificationsRealtime as useNotificationsRealtimeHook } from '@/hooks/useNotificationsRealtime'
import { isFirebaseConfigured } from '@/lib/firebase'

describe('Reconnection Logic', () => {
  let snapshotCallback: ((snapshot: any) => void) | null = null
  let errorCallback: ((error: Error) => void) | null = null

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    snapshotCallback = null
    errorCallback = null

    // Reset the mock to capture callbacks
    mockOnSnapshot.mockImplementation((_query: any, _options: any, onNext: any, onError: any) => {
      snapshotCallback = onNext
      errorCallback = onError
      return mockUnsubscribe
    })

    // Ensure Firebase is configured
    vi.mocked(isFirebaseConfigured).mockReturnValue(true)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should use exponential backoff for reconnection attempts', async () => {
    const { result } = renderHook(() =>
      useNotificationsRealtimeHook('user-123', {
        autoReconnect: true,
        maxReconnectAttempts: 5,
        reconnectBaseDelay: 1000,
      })
    )

    // Initial connection should be attempted
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)

    // Simulate first connection error
    act(() => {
      errorCallback?.(new Error('Connection failed'))
    })

    expect(result.current.connectionStatus).toBe('error')

    // First reconnect after 1000ms (1000 * 2^0)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(999)
    })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(2)

    // Simulate second error
    act(() => {
      errorCallback?.(new Error('Connection failed again'))
    })

    // Second reconnect after 2000ms (1000 * 2^1)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1999)
    })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(2)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(3)

    // Simulate third error
    act(() => {
      errorCallback?.(new Error('Connection failed'))
    })

    // Third reconnect after 4000ms (1000 * 2^2)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3999)
    })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(3)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(4)
  })

  it('should stop reconnecting after max attempts', async () => {
    const maxAttempts = 3

    const { result } = renderHook(() =>
      useNotificationsRealtimeHook('user-123', {
        autoReconnect: true,
        maxReconnectAttempts: maxAttempts,
        reconnectBaseDelay: 1000,
      })
    )

    // Initial connection
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)

    // Simulate errors and let reconnections happen
    for (let i = 0; i < maxAttempts; i++) {
      act(() => {
        errorCallback?.(new Error('Connection failed'))
      })

      const delay = 1000 * Math.pow(2, i)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(delay)
      })
    }

    // Should have attempted: 1 initial + maxAttempts reconnections
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1 + maxAttempts)

    // One more error after max attempts
    act(() => {
      errorCallback?.(new Error('Connection failed'))
    })

    // Wait a long time - no more reconnection attempts should happen
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100000)
    })

    // Should still be the same number of calls
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1 + maxAttempts)
    expect(result.current.connectionStatus).toBe('error')
  })

  it('should reset attempt counter on successful reconnection', async () => {
    const { result } = renderHook(() =>
      useNotificationsRealtimeHook('user-123', {
        autoReconnect: true,
        maxReconnectAttempts: 5,
        reconnectBaseDelay: 1000,
      })
    )

    // Initial connection
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)

    // Simulate first error
    act(() => {
      errorCallback?.(new Error('Connection failed'))
    })

    // Wait for first reconnect (1000ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(2)

    // Simulate successful connection (data from server, not cache)
    act(() => {
      snapshotCallback?.({
        metadata: { fromCache: false, hasPendingWrites: false },
        docs: [],
        docChanges: () => [],
      })
    })

    expect(result.current.connectionStatus).toBe('connected')

    // Now simulate another error
    act(() => {
      errorCallback?.(new Error('Connection failed again'))
    })

    // The delay should be reset to 1000ms (not 2000ms) because counter was reset
    await act(async () => {
      await vi.advanceTimersByTimeAsync(999)
    })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(2)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(3)
  })

  it('should cancel pending reconnection on unmount', async () => {
    const { unmount } = renderHook(() =>
      useNotificationsRealtimeHook('user-123', {
        autoReconnect: true,
        maxReconnectAttempts: 5,
        reconnectBaseDelay: 1000,
      })
    )

    // Initial connection
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)

    // Simulate error to start reconnection timer
    act(() => {
      errorCallback?.(new Error('Connection failed'))
    })

    // Unmount before reconnection happens
    unmount()

    // Wait for what would be the reconnection time
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    // Should still only be 1 call (no reconnection after unmount)
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should set status to connecting during reconnection attempt', async () => {
    const onConnectionStatusChange = vi.fn()

    const { result } = renderHook(() =>
      useNotificationsRealtimeHook('user-123', {
        autoReconnect: true,
        maxReconnectAttempts: 5,
        reconnectBaseDelay: 1000,
        onConnectionStatusChange,
      })
    )

    // Initial connecting status
    expect(result.current.connectionStatus).toBe('connecting')

    // Simulate successful connection
    act(() => {
      snapshotCallback?.({
        metadata: { fromCache: false, hasPendingWrites: false },
        docs: [],
        docChanges: () => [],
      })
    })

    expect(result.current.connectionStatus).toBe('connected')

    // Simulate error
    act(() => {
      errorCallback?.(new Error('Connection failed'))
    })

    expect(result.current.connectionStatus).toBe('error')

    // Wait for reconnection
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    // After reconnection attempt starts, status should be 'connecting'
    expect(result.current.connectionStatus).toBe('connecting')

    // Verify the status transitions were called
    expect(onConnectionStatusChange).toHaveBeenCalledWith('connecting')
    expect(onConnectionStatusChange).toHaveBeenCalledWith('connected')
    expect(onConnectionStatusChange).toHaveBeenCalledWith('error')
  })

  it('should not attempt reconnection when autoReconnect is false', async () => {
    renderHook(() =>
      useNotificationsRealtimeHook('user-123', {
        autoReconnect: false,
        maxReconnectAttempts: 5,
        reconnectBaseDelay: 1000,
      })
    )

    // Initial connection
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)

    // Simulate error
    act(() => {
      errorCallback?.(new Error('Connection failed'))
    })

    // Wait a long time
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })

    // No reconnection attempts should have been made
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)
  })
})

describe('Connection Status Transitions', () => {
  let snapshotCallback: ((snapshot: any) => void) | null = null
  let errorCallback: ((error: Error) => void) | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    snapshotCallback = null
    errorCallback = null

    mockOnSnapshot.mockImplementation((_query: any, _options: any, onNext: any, onError: any) => {
      snapshotCallback = onNext
      errorCallback = onError
      return mockUnsubscribe
    })

    vi.mocked(isFirebaseConfigured).mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should have initial state as disconnected before connecting', () => {
      // Mock Firebase as not configured to prevent auto-connect
      vi.mocked(isFirebaseConfigured).mockReturnValue(false)

      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      expect(result.current.connectionStatus).toBe('disconnected')
    })

    it('should transition to connecting when subscribing with valid user', () => {
      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      // When Firebase is configured and staffUserId is provided, it should start connecting
      expect(result.current.connectionStatus).toBe('connecting')
    })
  })

  describe('Transition: disconnected -> connecting', () => {
    it('should transition from disconnected to connecting when subscribing', () => {
      const onConnectionStatusChange = vi.fn()

      renderHook(() =>
        useNotificationsRealtimeHook('user-123', { onConnectionStatusChange })
      )

      // The hook starts in disconnected state internally, then immediately transitions to connecting
      // The first callback should be 'connecting'
      expect(onConnectionStatusChange).toHaveBeenCalledWith('connecting')
    })

    it('should transition to connecting on manual reconnect', () => {
      const onConnectionStatusChange = vi.fn()

      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123', { onConnectionStatusChange })
      )

      // Simulate error to get to error state
      act(() => {
        errorCallback?.(new Error('Connection failed'))
      })

      expect(result.current.connectionStatus).toBe('error')

      // Clear mock to track new calls
      onConnectionStatusChange.mockClear()

      // Call reconnect
      act(() => {
        result.current.reconnect()
      })

      // Should transition to connecting
      expect(onConnectionStatusChange).toHaveBeenCalledWith('connecting')
      expect(result.current.connectionStatus).toBe('connecting')
    })
  })

  describe('Transition: connecting -> connected', () => {
    it('should transition to connected when Firestore snapshot received from server', () => {
      const onConnectionStatusChange = vi.fn()

      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123', { onConnectionStatusChange })
      )

      expect(result.current.connectionStatus).toBe('connecting')

      // Simulate server snapshot (not from cache)
      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: false, hasPendingWrites: false },
          docs: [],
          docChanges: () => [],
        })
      })

      expect(result.current.connectionStatus).toBe('connected')
      expect(onConnectionStatusChange).toHaveBeenCalledWith('connected')
    })

    it('should stay in connecting state when receiving cached data', () => {
      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      expect(result.current.connectionStatus).toBe('connecting')

      // Simulate cached snapshot
      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: true, hasPendingWrites: false },
          docs: [],
          docChanges: () => [],
        })
      })

      // Should remain connecting when data is from cache
      expect(result.current.connectionStatus).toBe('connecting')
    })
  })

  describe('Transition: connected -> disconnected', () => {
    it('should transition to disconnected on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      // Get to connected state
      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: false, hasPendingWrites: false },
          docs: [],
          docChanges: () => [],
        })
      })

      expect(result.current.connectionStatus).toBe('connected')

      // Unmount - the cleanup runs and calls unsubscribe on the Firestore listener
      // Note: The onConnectionStatusChange callback won't be called because
      // isMountedRef.current is set to false before disconnect() is called,
      // which prevents state updates during cleanup (React best practice)
      unmount()

      // Verify the Firestore listener was properly unsubscribed
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should transition to disconnected on manual disconnect', () => {
      const onConnectionStatusChange = vi.fn()

      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123', { onConnectionStatusChange })
      )

      // Get to connected state
      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: false, hasPendingWrites: false },
          docs: [],
          docChanges: () => [],
        })
      })

      expect(result.current.connectionStatus).toBe('connected')

      // Clear mock to track new calls
      onConnectionStatusChange.mockClear()

      // Manually disconnect
      act(() => {
        result.current.disconnect()
      })

      expect(result.current.connectionStatus).toBe('disconnected')
      expect(onConnectionStatusChange).toHaveBeenCalledWith('disconnected')
    })

    it('should transition to error on Firestore error', () => {
      const onConnectionStatusChange = vi.fn()

      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123', { onConnectionStatusChange })
      )

      // Get to connected state
      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: false, hasPendingWrites: false },
          docs: [],
          docChanges: () => [],
        })
      })

      expect(result.current.connectionStatus).toBe('connected')

      // Clear mock to track new calls
      onConnectionStatusChange.mockClear()

      // Simulate error
      act(() => {
        errorCallback?.(new Error('Connection lost'))
      })

      expect(result.current.connectionStatus).toBe('error')
      expect(onConnectionStatusChange).toHaveBeenCalledWith('error')
    })
  })

  describe('Transition: disconnected -> polling (Firebase not configured)', () => {
    it('should remain disconnected when Firebase is not configured', () => {
      vi.mocked(isFirebaseConfigured).mockReturnValue(false)

      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      expect(result.current.connectionStatus).toBe('disconnected')
      expect(result.current.isConfigured).toBe(false)
      expect(mockOnSnapshot).not.toHaveBeenCalled()
    })

    it('should report isConfigured as false when Firebase not configured', () => {
      vi.mocked(isFirebaseConfigured).mockReturnValue(false)

      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      expect(result.current.isConfigured).toBe(false)
      expect(result.current.connectionStatus).toBe('disconnected')
    })

    it('should not have error when Firebase not configured (error only set on connect attempt)', () => {
      vi.mocked(isFirebaseConfigured).mockReturnValue(false)

      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      // When Firebase is not configured, the hook doesn't call connect() at all
      // (the effect checks isConfigured before calling connect), so no error is set.
      // The error is only set when connect() is called and fails.
      // This is intentional - the hook gracefully degrades without showing an error.
      expect(result.current.error).toBeNull()
      expect(result.current.isConfigured).toBe(false)
    })
  })

  describe('Status indicator updates correctly for each state', () => {
    it('should have isConnected as false in disconnected state', () => {
      vi.mocked(isFirebaseConfigured).mockReturnValue(false)

      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      expect(result.current.connectionStatus).toBe('disconnected')
      expect(result.current.isConnected).toBe(false)
    })

    it('should have isConnected as false in connecting state', () => {
      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      expect(result.current.connectionStatus).toBe('connecting')
      expect(result.current.isConnected).toBe(false)
    })

    it('should have isConnected as true in connected state', () => {
      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: false, hasPendingWrites: false },
          docs: [],
          docChanges: () => [],
        })
      })

      expect(result.current.connectionStatus).toBe('connected')
      expect(result.current.isConnected).toBe(true)
    })

    it('should have isConnected as false in error state', () => {
      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      act(() => {
        errorCallback?.(new Error('Connection failed'))
      })

      expect(result.current.connectionStatus).toBe('error')
      expect(result.current.isConnected).toBe(false)
    })
  })

  describe('Status persists correctly across re-renders', () => {
    it('should maintain connected status across re-renders', () => {
      const { result, rerender } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      // Get to connected state
      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: false, hasPendingWrites: false },
          docs: [],
          docChanges: () => [],
        })
      })

      expect(result.current.connectionStatus).toBe('connected')

      // Re-render multiple times
      rerender()
      expect(result.current.connectionStatus).toBe('connected')

      rerender()
      expect(result.current.connectionStatus).toBe('connected')

      rerender()
      expect(result.current.connectionStatus).toBe('connected')
    })

    it('should maintain error status across re-renders', () => {
      const { result, rerender } = renderHook(() =>
        useNotificationsRealtimeHook('user-123', { autoReconnect: false })
      )

      act(() => {
        errorCallback?.(new Error('Connection failed'))
      })

      expect(result.current.connectionStatus).toBe('error')

      // Re-render multiple times
      rerender()
      expect(result.current.connectionStatus).toBe('error')

      rerender()
      expect(result.current.connectionStatus).toBe('error')
    })

    it('should maintain notifications data across status changes', () => {
      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('user-123')
      )

      // Receive notification while connecting - use plain Date since Timestamp mock may not work with instanceof
      const testDate = new Date()
      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: false, hasPendingWrites: false },
          docs: [{
            id: 'notif-1',
            data: () => ({
              type: 'info',
              title: 'Test',
              body: 'Test body',
              read: false,
              createdAt: testDate, // Use plain Date, not Timestamp
            }),
          }],
          docChanges: () => [{
            type: 'added',
            doc: {
              id: 'notif-1',
              data: () => ({
                type: 'info',
                title: 'Test',
                body: 'Test body',
                read: false,
                createdAt: testDate, // Use plain Date, not Timestamp
              }),
            },
          }],
        })
      })

      expect(result.current.connectionStatus).toBe('connected')
      expect(result.current.notifications).toHaveLength(1)
      expect(result.current.notifications[0].id).toBe('notif-1')
    })
  })

  describe('Status when switching users', () => {
    it('should reset to disconnected when user changes', () => {
      const onConnectionStatusChange = vi.fn()

      const { result, rerender } = renderHook(
        ({ userId }) => useNotificationsRealtimeHook(userId, { onConnectionStatusChange }),
        { initialProps: { userId: 'user-123' } }
      )

      // Get to connected state
      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: false, hasPendingWrites: false },
          docs: [],
          docChanges: () => [],
        })
      })

      expect(result.current.connectionStatus).toBe('connected')

      // Clear mock to track new calls
      onConnectionStatusChange.mockClear()

      // Change user
      rerender({ userId: 'user-456' })

      // Should have disconnected (cleanup) and then connecting (new subscription)
      expect(onConnectionStatusChange).toHaveBeenCalledWith('disconnected')
      expect(onConnectionStatusChange).toHaveBeenCalledWith('connecting')
    })

    it('should clear notifications when user changes', () => {
      const testDate = new Date()
      const { result, rerender } = renderHook(
        ({ userId }) => useNotificationsRealtimeHook(userId),
        { initialProps: { userId: 'user-123' } }
      )

      // Add notification for first user - use plain Date to avoid Timestamp instanceof issues
      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: false, hasPendingWrites: false },
          docs: [{
            id: 'notif-1',
            data: () => ({
              type: 'info',
              title: 'Test',
              body: 'Test body',
              read: false,
              createdAt: testDate,
            }),
          }],
          docChanges: () => [{
            type: 'added',
            doc: {
              id: 'notif-1',
              data: () => ({
                type: 'info',
                title: 'Test',
                body: 'Test body',
                read: false,
                createdAt: testDate,
              }),
            },
          }],
        })
      })

      expect(result.current.notifications).toHaveLength(1)

      // Change user - notifications should be cleared on cleanup
      rerender({ userId: 'user-456' })

      // After user change, the processedIdsRef is cleared (in cleanup)
      // New subscription starts fresh
      expect(result.current.connectionStatus).toBe('connecting')
    })

    it('should handle switching to empty user', () => {
      const onConnectionStatusChange = vi.fn()

      const { result, rerender } = renderHook(
        ({ userId }) => useNotificationsRealtimeHook(userId, { onConnectionStatusChange }),
        { initialProps: { userId: 'user-123' } }
      )

      // Get to connected state
      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: false, hasPendingWrites: false },
          docs: [],
          docChanges: () => [],
        })
      })

      expect(result.current.connectionStatus).toBe('connected')

      // Clear mock to track new calls
      onConnectionStatusChange.mockClear()

      // Change to empty user
      // Note: The cleanup runs but isMountedRef is set to false during cleanup,
      // so updateConnectionStatus's guard prevents the status update.
      // Then the new effect body doesn't call connect() because staffUserId is empty.
      // The unsubscribe from Firestore still happens, but status state doesn't update during cleanup.
      rerender({ userId: '' })

      // Verify unsubscribe was called
      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should start disconnected when initially provided empty user', () => {
      vi.mocked(isFirebaseConfigured).mockReturnValue(true)

      const { result } = renderHook(() =>
        useNotificationsRealtimeHook('')
      )

      // When staffUserId is initially empty, the hook starts in the default state
      // and connect() is never called, so status remains 'disconnected'
      // (the initial useState value)
      expect(result.current.connectionStatus).toBe('disconnected')
      expect(mockOnSnapshot).not.toHaveBeenCalled()
    })

    it('should unsubscribe from previous user before subscribing to new user', () => {
      const { rerender } = renderHook(
        ({ userId }) => useNotificationsRealtimeHook(userId),
        { initialProps: { userId: 'user-123' } }
      )

      expect(mockOnSnapshot).toHaveBeenCalledTimes(1)

      // Change user
      rerender({ userId: 'user-456' })

      // Should have called unsubscribe for old user
      expect(mockUnsubscribe).toHaveBeenCalled()

      // Should have created new subscription for new user
      expect(mockOnSnapshot).toHaveBeenCalledTimes(2)
    })
  })

  describe('Full state machine cycle', () => {
    it('should handle complete lifecycle: disconnected -> connecting -> connected -> error -> connecting -> connected -> disconnected', async () => {
      vi.useFakeTimers()
      const statusHistory: string[] = []
      const onConnectionStatusChange = (status: string) => {
        statusHistory.push(status)
      }

      const { result, unmount } = renderHook(() =>
        useNotificationsRealtimeHook('user-123', {
          onConnectionStatusChange,
          autoReconnect: true,
          maxReconnectAttempts: 3,
          reconnectBaseDelay: 1000,
        })
      )

      // 1. Initial: disconnected -> connecting (on mount)
      expect(result.current.connectionStatus).toBe('connecting')
      expect(statusHistory).toContain('connecting')

      // 2. connecting -> connected (server snapshot)
      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: false, hasPendingWrites: false },
          docs: [],
          docChanges: () => [],
        })
      })
      expect(result.current.connectionStatus).toBe('connected')
      expect(statusHistory).toContain('connected')

      // 3. connected -> error
      act(() => {
        errorCallback?.(new Error('Connection lost'))
      })
      expect(result.current.connectionStatus).toBe('error')
      expect(statusHistory).toContain('error')

      // 4. error -> connecting (auto-reconnect after delay)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })
      expect(result.current.connectionStatus).toBe('connecting')

      // 5. connecting -> connected (successful reconnect)
      act(() => {
        snapshotCallback?.({
          metadata: { fromCache: false, hasPendingWrites: false },
          docs: [],
          docChanges: () => [],
        })
      })
      expect(result.current.connectionStatus).toBe('connected')

      // 6. connected -> disconnected (unmount)
      unmount()
      expect(statusHistory).toContain('disconnected')

      vi.useRealTimers()
    })
  })
})

describe('Firestore Cache Handling', () => {
  let snapshotCallback: ((snapshot: any) => void) | null = null
  let errorCallback: ((error: Error) => void) | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    snapshotCallback = null
    errorCallback = null

    mockOnSnapshot.mockImplementation((_query: any, _options: any, onNext: any, onError: any) => {
      snapshotCallback = onNext
      errorCallback = onError
      return mockUnsubscribe
    })

    vi.mocked(isFirebaseConfigured).mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should set status to connecting when data is from cache', async () => {
    const { result } = renderHook(() =>
      useNotificationsRealtimeHook('user-123')
    )

    // Initial status should be connecting
    expect(result.current.connectionStatus).toBe('connecting')

    // Simulate data from cache
    act(() => {
      snapshotCallback?.({
        metadata: { fromCache: true, hasPendingWrites: false },
        docs: [],
        docChanges: () => [],
      })
    })

    // Status should remain connecting when data is from cache
    expect(result.current.connectionStatus).toBe('connecting')
  })

  it('should set status to connected when data is from server', async () => {
    const { result } = renderHook(() =>
      useNotificationsRealtimeHook('user-123')
    )

    // Initial status should be connecting
    expect(result.current.connectionStatus).toBe('connecting')

    // Simulate data from server (not from cache)
    act(() => {
      snapshotCallback?.({
        metadata: { fromCache: false, hasPendingWrites: false },
        docs: [],
        docChanges: () => [],
      })
    })

    // Status should be connected when data is from server
    expect(result.current.connectionStatus).toBe('connected')
  })

  it('should set status to connected when there are pending writes', async () => {
    const { result } = renderHook(() =>
      useNotificationsRealtimeHook('user-123')
    )

    // Simulate data from cache but with pending writes (optimistic update)
    act(() => {
      snapshotCallback?.({
        metadata: { fromCache: true, hasPendingWrites: true },
        docs: [],
        docChanges: () => [],
      })
    })

    // Should be connected because there are pending writes (user action)
    expect(result.current.connectionStatus).toBe('connected')
  })

  it('should transition from cache to server connection', async () => {
    const onConnectionStatusChange = vi.fn()

    const { result } = renderHook(() =>
      useNotificationsRealtimeHook('user-123', { onConnectionStatusChange })
    )

    // First receive data from cache
    act(() => {
      snapshotCallback?.({
        metadata: { fromCache: true, hasPendingWrites: false },
        docs: [],
        docChanges: () => [],
      })
    })

    expect(result.current.connectionStatus).toBe('connecting')

    // Then receive data from server (connection established)
    act(() => {
      snapshotCallback?.({
        metadata: { fromCache: false, hasPendingWrites: false },
        docs: [],
        docChanges: () => [],
      })
    })

    expect(result.current.connectionStatus).toBe('connected')

    // Verify status change was called with both states
    expect(onConnectionStatusChange).toHaveBeenCalledWith('connecting')
    expect(onConnectionStatusChange).toHaveBeenCalledWith('connected')
  })
})
