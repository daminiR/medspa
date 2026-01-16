'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Trash2, Volume2, VolumeX, Loader2, Bell, Wifi, WifiOff } from 'lucide-react'
import { NotificationItem } from './NotificationItem'
import type { Notification, ConnectionStatus } from '@/types/notifications'

interface NotificationPanelProps {
  onClose: () => void
  // Props passed from NotificationBell for shared real-time state
  notifications: Notification[]
  isLoading: boolean
  isRealtime: boolean
  connectionStatus: ConnectionStatus
  markAsRead: (id: string) => void
  markAllAsRead: () => Promise<void>
  clearAll: () => Promise<void>
  deleteNotification: (id: string) => void
  soundEnabled: boolean
  toggleSound: () => void
}

export function NotificationPanel({
  onClose,
  notifications,
  isLoading,
  isRealtime,
  connectionStatus,
  markAsRead,
  markAllAsRead,
  clearAll,
  deleteNotification,
  soundEnabled,
  toggleSound
}: NotificationPanelProps) {

  const [isClearing, setIsClearing] = useState(false)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true)
    await markAllAsRead()
    setIsMarkingAll(false)
  }

  const handleClearAll = async () => {
    setIsClearing(true)
    await clearAll()
    setIsClearing(false)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div
      className="w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      role="dialog"
      aria-label="Notifications panel"
      aria-modal="false"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {/* Connection status indicator */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                connectionStatus === 'connected'
                  ? 'bg-green-50 text-green-700'
                  : connectionStatus === 'polling'
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
              title={
                connectionStatus === 'connected'
                  ? 'Real-time updates active'
                  : connectionStatus === 'polling'
                  ? 'Polling for updates every 30s'
                  : 'Disconnected'
              }
            >
              {connectionStatus === 'connected' ? (
                <Wifi className="w-3 h-3" />
              ) : connectionStatus === 'polling' ? (
                <Loader2 className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <span>
                {connectionStatus === 'connected'
                  ? 'Live'
                  : connectionStatus === 'polling'
                  ? 'Polling'
                  : 'Offline'}
              </span>
            </div>
            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
              aria-label={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <button
          onClick={handleMarkAllAsRead}
          disabled={isMarkingAll || unreadCount === 0}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isMarkingAll ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          Mark all as read
        </button>
        <button
          onClick={handleClearAll}
          disabled={isClearing || notifications.length === 0}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isClearing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          Clear all
        </button>
      </div>

      {/* Notification list */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No notifications</p>
            <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100" role="list" aria-label="Notification list">
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                onClose={onClose}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <Link
          href="/notifications"
          onClick={onClose}
          className="block w-full text-center text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          View all notifications
        </Link>
      </div>
    </div>
  )
}
