'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { NotificationPanel } from './NotificationPanel'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/contexts/AuthContext'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Get current user from auth context
  const { user } = useAuth()

  // Pass staffUserId for real-time notifications
  // All notification state is managed here and passed to NotificationPanel
  const {
    notifications,
    isLoading,
    unreadCount,
    isRealtime,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    soundEnabled,
    toggleSound
  } = useNotifications({
    staffUserId: user?.id || '',
    enableRealtime: true,
  })
  const previousCountRef = useRef(unreadCount)

  // Animate badge when new notification arrives
  useEffect(() => {
    if (unreadCount > previousCountRef.current) {
      setHasNewNotification(true)
      const timer = setTimeout(() => setHasNewNotification(false), 1000)
      return () => clearTimeout(timer)
    }
    previousCountRef.current = unreadCount
  }, [unreadCount])

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close panel on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // Request permission when user interacts with the bell
        // We'll do this on first click instead of auto-requesting
      }
    }
  }, [])

  const handleBellClick = async () => {
    // Request notification permission on first click if not granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleBellClick}
        className="p-2 text-gray-400 hover:text-gray-500 relative focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}${isRealtime ? ' (live)' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={connectionStatus === 'connected' ? 'Real-time updates active' : connectionStatus === 'polling' ? 'Polling for updates' : 'Disconnected'}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-red-500 rounded-full transition-transform ${
              hasNewNotification ? 'animate-bounce' : ''
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {/* Connection status indicator */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${
            connectionStatus === 'connected'
              ? 'bg-green-500'
              : connectionStatus === 'polling'
              ? 'bg-yellow-500'
              : 'bg-gray-400'
          }`}
          title={connectionStatus === 'connected' ? 'Live' : connectionStatus === 'polling' ? 'Polling' : 'Offline'}
        />
      </button>

      {isOpen && (
        <div ref={panelRef} className="absolute right-0 mt-2 z-50">
          <NotificationPanel
            onClose={() => setIsOpen(false)}
            notifications={notifications}
            isLoading={isLoading}
            isRealtime={isRealtime}
            connectionStatus={connectionStatus}
            markAsRead={markAsRead}
            markAllAsRead={markAllAsRead}
            clearAll={clearAll}
            deleteNotification={deleteNotification}
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
          />
        </div>
      )}
    </div>
  )
}
