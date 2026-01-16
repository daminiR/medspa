'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { websocketService } from '@/services/websocket'
import { isFirebaseConfigured } from '@/lib/firebase'
import type {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  ConnectionStatus,
  UseNotificationsOptions,
  UseNotificationsReturn,
  NotificationApiResponse,
  NotificationData,
} from '@/types/notifications'
import {
  mapNotificationType,
  getNotificationActionUrl,
} from '@/types/notifications'

// Re-export types for backwards compatibility
export type { Notification, NotificationType }
export type { NotificationChannel, NotificationPriority, ConnectionStatus }
export type { UseNotificationsOptions, UseNotificationsReturn }

const SOUND_PREFERENCE_KEY = 'notification-sound-enabled'

// Helper to generate action URL
// Uses original backend type first for specific URLs, falls back to mapped type
function generateActionUrl(type: string, data?: NotificationData): string {
  // First try custom action URL from data
  if (data?.actionUrl) {
    return data.actionUrl
  }

  // Import the NOTIFICATION_ACTION_URLS from types to check for specific URL
  // by original type (e.g., 'billing_reminder' -> '/billing')
  const typeAsNotificationType = type as Parameters<typeof getNotificationActionUrl>[0]

  // Try original type first, then mapped type
  return getNotificationActionUrl(typeAsNotificationType, data)
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    staffUserId = '',
    enableRealtime = true,
    pollingInterval = 30000
  } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'polling'>('polling')
  const processedIdsRef = useRef<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Use ref for soundEnabled to avoid re-running the real-time subscription effect
  const soundEnabledRef = useRef(soundEnabled)

  // Check if Firebase real-time is available
  const isRealtimeAvailable = enableRealtime && isFirebaseConfigured() && !!staffUserId

  // Keep soundEnabledRef in sync with soundEnabled state
  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  // Load sound preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SOUND_PREFERENCE_KEY)
      if (stored !== null) {
        setSoundEnabled(stored === 'true')
      }
      // Preload notification sound
      audioRef.current = new Audio('/sounds/notification.mp3')
      audioRef.current.volume = 0.5
    }
  }, [])

  // Subscribe to real-time notifications via Firestore
  useEffect(() => {
    if (!isRealtimeAvailable) {
      setConnectionStatus('polling')
      return
    }

    // Subscribe to Firestore notifications
    websocketService.subscribeToNotifications(staffUserId)
    setConnectionStatus('connected')

    const handleNewNotification = (data: any) => {
      // Prevent duplicate processing
      if (processedIdsRef.current.has(data.id)) return
      processedIdsRef.current.add(data.id)

      const newNotification: Notification = {
        id: data.id,
        type: mapNotificationType(data.type),
        title: data.title,
        body: data.body,
        read: false,
        createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
        actionUrl: generateActionUrl(data.type, data.data),
        data: data.data,
        channel: data.channel || 'in_app',
        priority: data.priority || 'normal',
      }

      setNotifications(prev => {
        // Check if notification already exists
        if (prev.some(n => n.id === newNotification.id)) return prev
        return [newNotification, ...prev]
      })

      // Play sound if enabled (use ref to avoid stale closure)
      if (soundEnabledRef.current && audioRef.current) {
        audioRef.current.play().catch(() => {
          // Ignore audio play errors (e.g., user hasn't interacted with page yet)
        })
      }

      // Show browser notification if permission granted
      if (typeof window !== 'undefined' && Notification.permission === 'granted') {
        new window.Notification(newNotification.title, {
          body: newNotification.body,
          icon: '/icons/notification-icon.png',
          tag: newNotification.id,
        })
      }
    }

    const unsubscribe = websocketService.on('notification.received', handleNewNotification)

    return () => {
      unsubscribe()
      setConnectionStatus('disconnected')
    }
  }, [isRealtimeAvailable, staffUserId])

  // Fetch notifications from backend API (initial load + fallback polling)
  useEffect(() => {
    let isFirstFetch = true

    const fetchNotifications = async () => {
      // Only set loading on initial fetch, not on polling
      if (isFirstFetch) {
        setIsLoading(true)
      }
      try {
        const response = await fetch('/api/notifications?limit=50&sortOrder=desc')

        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.statusText}`)
        }

        const data = await response.json()

        // Transform backend notifications to frontend format
        const transformedNotifications: Notification[] = data.items.map((item: any) => ({
          id: item.id,
          type: mapNotificationType(item.type),
          title: item.title,
          body: item.body,
          read: item.read,
          createdAt: new Date(item.createdAt),
          actionUrl: generateActionUrl(item.type, item.data),
          data: item.data,
          readAt: item.readAt ? new Date(item.readAt) : null,
          channel: item.channel,
          priority: item.priority,
          expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
        }))

        // Track processed IDs to prevent duplicates with real-time
        // Limit the Set size to prevent memory growth (keep last 200 IDs)
        const MAX_PROCESSED_IDS = 200
        if (processedIdsRef.current.size > MAX_PROCESSED_IDS) {
          const idsArray = Array.from(processedIdsRef.current)
          processedIdsRef.current = new Set(idsArray.slice(-MAX_PROCESSED_IDS))
        }
        transformedNotifications.forEach(n => processedIdsRef.current.add(n.id))

        setNotifications(prev => {
          // Merge with any real-time notifications that arrived before fetch completed
          // Keep real-time notifications that aren't in the fetched set
          const merged = [
            ...prev.filter(n => !transformedNotifications.some(t => t.id === n.id)),
            ...transformedNotifications
          ]
          // Sort by createdAt descending
          return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        })
      } catch (error) {
        console.error('Error fetching notifications:', error)
        // Keep existing notifications on error
      } finally {
        if (isFirstFetch) {
          setIsLoading(false)
          isFirstFetch = false
        }
      }
    }

    fetchNotifications()

    // Only poll if real-time is not available
    if (!isRealtimeAvailable) {
      const interval = setInterval(() => {
        fetchNotifications()
      }, pollingInterval)

      return () => clearInterval(interval)
    }
  }, [isRealtimeAvailable, pollingInterval])

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    // Optimistically update UI
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true, readAt: new Date() } : n))
    )

    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`)
      }

      // Backend response contains updated notification, but we already updated optimistically
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Revert optimistic update on error
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: false, readAt: null } : n))
      )
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    // Store previous state for rollback
    const previousNotifications = notifications.map(n => ({ ...n }))

    // Optimistically update UI
    const now = new Date()
    setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: now })))

    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      // Rollback to previous state on error
      setNotifications(previousNotifications)
    }
  }, [notifications])

  // Clear all notifications (delete all)
  const clearAll = useCallback(async () => {
    // Store current notifications for potential rollback
    const previousNotifications = [...notifications]

    // Don't do anything if there are no notifications
    if (previousNotifications.length === 0) {
      return
    }

    // Optimistically clear UI
    setNotifications([])

    try {
      // Delete all notifications one by one
      // Note: Backend doesn't have a bulk delete endpoint, so we batch delete
      const deletePromises = previousNotifications.map(notification =>
        fetch(`/api/notifications/${notification.id}`, {
          method: 'DELETE',
        })
      )

      const results = await Promise.allSettled(deletePromises)

      // Check if any deletions failed
      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        console.error(`Failed to delete ${failures.length} notifications`)
        // If all deletions failed, revert the optimistic update
        if (failures.length === previousNotifications.length) {
          setNotifications(previousNotifications)
        }
      }
    } catch (error) {
      console.error('Error clearing notifications:', error)
      // Revert optimistic update on error
      setNotifications(previousNotifications)
    }
  }, [notifications])

  // Delete single notification
  const deleteNotification = useCallback(async (id: string) => {
    // Store deleted notification for potential rollback
    const deletedNotification = notifications.find(n => n.id === id)

    // Optimistically remove from UI
    setNotifications(prev => prev.filter(n => n.id !== id))

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      // Restore deleted notification on error
      if (deletedNotification) {
        setNotifications(prev => {
          // Insert back in the correct position based on createdAt
          const updated = [...prev, deletedNotification]
          return updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        })
      }
    }
  }, [notifications])

  // Toggle sound preference
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem(SOUND_PREFERENCE_KEY, String(newValue))
      }
      return newValue
    })
  }, [])

  // Add a new notification (useful for real-time updates)
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      read: false
    }

    // Add to processed IDs to prevent duplicates
    processedIdsRef.current.add(newNotification.id)

    setNotifications(prev => [newNotification, ...prev])

    // Play sound if enabled (use ref to get current value)
    if (soundEnabledRef.current && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      })
    }
  }, [])

  return {
    notifications,
    isLoading,
    unreadCount,
    soundEnabled,
    isRealtime: isRealtimeAvailable,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    toggleSound,
    addNotification
  }
}
