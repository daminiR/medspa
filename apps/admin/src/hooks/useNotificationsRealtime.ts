'use client'

/**
 * Real-time Firestore Notifications Hook
 *
 * This hook provides real-time notification updates via Firestore onSnapshot listeners.
 *
 * Features:
 * - Real-time updates via Firestore onSnapshot
 * - Cost optimization with limit() and unread filter
 * - Proper cleanup on unmount
 * - Reconnection strategy with exponential backoff
 * - Connection status tracking
 * - Deduplication to prevent duplicate notifications
 * - Merge strategy for combining real-time and existing notifications
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  firestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  enableNetwork,
  disableNetwork,
  isFirebaseConfigured,
  getStaffNotificationsPath,
  Timestamp,
  Unsubscribe
} from '@/lib/firebase'

export interface RealtimeNotification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  createdAt: Date
  data?: Record<string, unknown>
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  channel?: 'push' | 'email' | 'sms' | 'in_app'
  actionUrl?: string
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error'

export interface UseNotificationsRealtimeOptions {
  /** Maximum number of notifications to fetch (default: 50) */
  maxNotifications?: number
  /** Whether to only fetch unread notifications (default: true for cost optimization) */
  unreadOnly?: boolean
  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean
  /** Maximum reconnection attempts (default: 5) */
  maxReconnectAttempts?: number
  /** Base delay for exponential backoff in ms (default: 1000) */
  reconnectBaseDelay?: number
  /** Callback when a new notification arrives */
  onNewNotification?: (notification: RealtimeNotification) => void
  /** Callback when connection status changes */
  onConnectionStatusChange?: (status: ConnectionStatus) => void
}

export interface UseNotificationsRealtimeReturn {
  /** Array of notifications */
  notifications: RealtimeNotification[]
  /** Current connection status */
  connectionStatus: ConnectionStatus
  /** Whether the listener is actively connected */
  isConnected: boolean
  /** Whether Firebase is configured */
  isConfigured: boolean
  /** Number of unread notifications */
  unreadCount: number
  /** Error message if any */
  error: string | null
  /** Manually reconnect to Firestore */
  reconnect: () => void
  /** Manually disconnect from Firestore */
  disconnect: () => void
  /** Clear all notifications from local state */
  clearLocalNotifications: () => void
  /** Mark a notification as read locally (optimistic update) */
  markAsReadLocally: (notificationId: string) => void
}

// Default options
const DEFAULT_OPTIONS: Required<Omit<UseNotificationsRealtimeOptions, 'onNewNotification' | 'onConnectionStatusChange'>> = {
  maxNotifications: 50,
  unreadOnly: true,
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectBaseDelay: 1000,
}

export function useNotificationsRealtime(
  staffUserId: string,
  options: UseNotificationsRealtimeOptions = {}
): UseNotificationsRealtimeReturn {
  const {
    maxNotifications = DEFAULT_OPTIONS.maxNotifications,
    unreadOnly = DEFAULT_OPTIONS.unreadOnly,
    autoReconnect = DEFAULT_OPTIONS.autoReconnect,
    maxReconnectAttempts = DEFAULT_OPTIONS.maxReconnectAttempts,
    reconnectBaseDelay = DEFAULT_OPTIONS.reconnectBaseDelay,
    onNewNotification,
    onConnectionStatusChange,
  } = options

  // State
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)

  // Refs for cleanup and tracking
  const unsubscribeRef = useRef<Unsubscribe | null>(null)
  const reconnectAttemptRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const processedIdsRef = useRef<Set<string>>(new Set())
  const isMountedRef = useRef(true)

  // Check if Firebase is configured
  const isConfigured = useMemo(() => isFirebaseConfigured(), [])

  // Update connection status with callback
  const updateConnectionStatus = useCallback((status: ConnectionStatus) => {
    if (!isMountedRef.current) return
    setConnectionStatus(status)
    onConnectionStatusChange?.(status)
  }, [onConnectionStatusChange])

  // Transform Firestore document to notification
  const transformDocument = useCallback((doc: any): RealtimeNotification => {
    const data = doc.data()
    return {
      id: doc.id,
      type: data.type || 'system',
      title: data.title || '',
      body: data.body || '',
      read: data.read ?? false,
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(data.createdAt || Date.now()),
      data: data.data,
      priority: data.priority || 'normal',
      channel: data.channel || 'in_app',
      actionUrl: data.actionUrl,
    }
  }, [])

  // Disconnect from Firestore
  const disconnect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    updateConnectionStatus('disconnected')
  }, [updateConnectionStatus])

  // Connect to Firestore
  const connect = useCallback(() => {
    if (!firestore || !staffUserId || !isConfigured) {
      setError('Firebase not configured or no user ID provided')
      updateConnectionStatus('disconnected')
      return
    }

    // Disconnect any existing listener
    disconnect()

    updateConnectionStatus('connecting')
    setError(null)

    try {
      const notificationsPath = getStaffNotificationsPath(staffUserId)
      const notificationsRef = collection(firestore, notificationsPath)

      // Build query with cost optimization:
      // - Filter by unread (if enabled) to reduce read costs
      // - Limit results to prevent unbounded reads
      // - Order by createdAt for most recent first
      const notificationsQuery = unreadOnly
        ? query(
            notificationsRef,
            where('read', '==', false),
            orderBy('createdAt', 'desc'),
            limit(maxNotifications)
          )
        : query(
            notificationsRef,
            orderBy('createdAt', 'desc'),
            limit(maxNotifications)
          )

      // Set up the onSnapshot listener
      const unsubscribe = onSnapshot(
        notificationsQuery,
        {
          // Include metadata changes for connection status
          includeMetadataChanges: true,
        },
        (snapshot) => {
          if (!isMountedRef.current) return

          // Check if data came from cache or server
          const fromCache = snapshot.metadata.fromCache
          const hasPendingWrites = snapshot.metadata.hasPendingWrites

          // Update connection status based on metadata
          if (fromCache && !hasPendingWrites) {
            // Data is from cache, might be offline
            updateConnectionStatus('connecting')
          } else {
            updateConnectionStatus('connected')
            // Reset reconnect attempts on successful connection
            reconnectAttemptRef.current = 0
          }

          // Process document changes
          const newNotifications: RealtimeNotification[] = []
          const updatedNotifications: RealtimeNotification[] = []
          const removedIds: Set<string> = new Set()

          snapshot.docChanges().forEach((change) => {
            const notification = transformDocument(change.doc)

            if (change.type === 'added') {
              // Deduplication check
              if (!processedIdsRef.current.has(notification.id)) {
                processedIdsRef.current.add(notification.id)
                newNotifications.push(notification)

                // Trigger callback for new notifications (not on initial load)
                if (processedIdsRef.current.size > snapshot.docs.length) {
                  onNewNotification?.(notification)
                }
              }
            } else if (change.type === 'modified') {
              updatedNotifications.push(notification)
            } else if (change.type === 'removed') {
              removedIds.add(notification.id)
              processedIdsRef.current.delete(notification.id)
            }
          })

          // Update state with merged notifications
          setNotifications((prev) => {
            // Remove deleted notifications
            let updated = prev.filter((n) => !removedIds.has(n.id))

            // Update modified notifications
            updated = updated.map((n) => {
              const modified = updatedNotifications.find((u) => u.id === n.id)
              return modified || n
            })

            // Add new notifications (avoiding duplicates)
            const existingIds = new Set(updated.map((n) => n.id))
            const trulyNew = newNotifications.filter((n) => !existingIds.has(n.id))

            // Merge and sort by createdAt descending
            const merged = [...trulyNew, ...updated]
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .slice(0, maxNotifications)

            return merged
          })
        },
        (err) => {
          if (!isMountedRef.current) return

          console.error('Firestore notification listener error:', err)
          setError(err.message || 'Failed to listen to notifications')
          updateConnectionStatus('error')

          // Auto-reconnect with exponential backoff
          if (autoReconnect && reconnectAttemptRef.current < maxReconnectAttempts) {
            const delay = reconnectBaseDelay * Math.pow(2, reconnectAttemptRef.current)
            reconnectAttemptRef.current++

            console.log(`Attempting reconnect in ${delay}ms (attempt ${reconnectAttemptRef.current}/${maxReconnectAttempts})`)

            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                connect()
              }
            }, delay)
          }
        }
      )

      unsubscribeRef.current = unsubscribe
    } catch (err: any) {
      console.error('Failed to set up notification listener:', err)
      setError(err.message || 'Failed to connect to notifications')
      updateConnectionStatus('error')
    }
  }, [
    staffUserId,
    isConfigured,
    maxNotifications,
    unreadOnly,
    autoReconnect,
    maxReconnectAttempts,
    reconnectBaseDelay,
    disconnect,
    transformDocument,
    updateConnectionStatus,
    onNewNotification,
  ])

  // Reconnect function for manual reconnection
  const reconnect = useCallback(() => {
    reconnectAttemptRef.current = 0
    connect()
  }, [connect])

  // Clear local notifications
  const clearLocalNotifications = useCallback(() => {
    setNotifications([])
    processedIdsRef.current.clear()
  }, [])

  // Mark notification as read locally (optimistic update)
  const markAsReadLocally = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
  }, [])

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    isMountedRef.current = true

    if (staffUserId && isConfigured) {
      connect()
    }

    return () => {
      isMountedRef.current = false
      disconnect()
      processedIdsRef.current.clear()
    }
  }, [staffUserId, isConfigured]) // Intentionally not including connect/disconnect to avoid loops

  // Derived state
  const isConnected = connectionStatus === 'connected'

  return {
    notifications,
    connectionStatus,
    isConnected,
    isConfigured,
    unreadCount,
    error,
    reconnect,
    disconnect,
    clearLocalNotifications,
    markAsReadLocally,
  }
}

export default useNotificationsRealtime
