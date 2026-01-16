'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Calendar,
  MessageSquare,
  AlertTriangle,
  CreditCard,
  Gift,
  Megaphone,
  FileText,
  ListChecks,
  UserCheck,
  ClipboardList,
  Clock,
  ChevronLeft,
  Loader2
} from 'lucide-react'
import { useNotifications, Notification, NotificationType } from '@/hooks/useNotifications'

type FilterType = 'all' | 'unread' | NotificationType

const typeIcons: Record<NotificationType, typeof Calendar> = {
  appointment: Calendar,
  message: MessageSquare,
  alert: AlertTriangle,
  system: Bell,
  appointment_reminder: Calendar,
  appointment_confirmation: UserCheck,
  appointment_cancelled: Calendar,
  appointment_rescheduled: Calendar,
  message_received: MessageSquare,
  treatment_followup: ClipboardList,
  billing_reminder: CreditCard,
  payment_received: CreditCard,
  membership_renewal: Gift,
  marketing_promotion: Megaphone,
  system_alert: AlertTriangle,
  waitlist_offer: ListChecks,
  form_required: FileText
}

const typeColors: Record<NotificationType, string> = {
  appointment: 'bg-blue-100 text-blue-600',
  message: 'bg-green-100 text-green-600',
  alert: 'bg-amber-100 text-amber-600',
  system: 'bg-purple-100 text-purple-600',
  appointment_reminder: 'bg-blue-100 text-blue-600',
  appointment_confirmation: 'bg-emerald-100 text-emerald-600',
  appointment_cancelled: 'bg-red-100 text-red-600',
  appointment_rescheduled: 'bg-orange-100 text-orange-600',
  message_received: 'bg-green-100 text-green-600',
  treatment_followup: 'bg-teal-100 text-teal-600',
  billing_reminder: 'bg-amber-100 text-amber-600',
  payment_received: 'bg-emerald-100 text-emerald-600',
  membership_renewal: 'bg-pink-100 text-pink-600',
  marketing_promotion: 'bg-violet-100 text-violet-600',
  system_alert: 'bg-red-100 text-red-600',
  waitlist_offer: 'bg-cyan-100 text-cyan-600',
  form_required: 'bg-indigo-100 text-indigo-600'
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function groupNotificationsByDate(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'Older': []
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  notifications.forEach(notification => {
    const notifDate = new Date(notification.createdAt)
    const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate())

    if (notifDay.getTime() === today.getTime()) {
      groups['Today'].push(notification)
    } else if (notifDay.getTime() === yesterday.getTime()) {
      groups['Yesterday'].push(notification)
    } else if (notifDay.getTime() > weekAgo.getTime()) {
      groups['This Week'].push(notification)
    } else {
      groups['Older'].push(notification)
    }
  })

  return groups
}

export default function NotificationsPage() {
  const router = useRouter()
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications()

  const [filter, setFilter] = useState<FilterType>('all')
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications
    if (filter === 'unread') return notifications.filter(n => !n.read)
    return notifications.filter(n => n.type === filter)
  }, [notifications, filter])

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications)
  }, [filteredNotifications])

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true)
    await markAllAsRead()
    setIsMarkingAll(false)
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500">{unreadCount} unread</p>
                )}
              </div>
            </div>
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll || unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMarkingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              Mark all as read
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                filter === 'unread'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button
              onClick={() => setFilter('appointment')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                filter === 'appointment'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setFilter('message')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                filter === 'message'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setFilter('alert')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                filter === 'alert'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Alerts
            </button>
            <button
              onClick={() => setFilter('system')}
              className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                filter === 'system'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              System
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">No notifications</h2>
            <p className="text-sm text-gray-500">
              {filter === 'unread'
                ? "You're all caught up!"
                : 'No notifications to display'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([group, items]) => {
              if (items.length === 0) return null

              return (
                <div key={group}>
                  <h2 className="text-sm font-medium text-gray-500 mb-3">{group}</h2>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                    {items.map(notification => {
                      const Icon = typeIcons[notification.type] || Bell
                      const colorClasses = typeColors[notification.type] || 'bg-gray-100 text-gray-600'

                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`relative px-4 py-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                            !notification.read ? 'bg-purple-50/30' : ''
                          }`}
                        >
                          <div className="flex gap-4">
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
                              <Icon className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                                    {notification.body}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{formatTimeAgo(new Date(notification.createdAt))}</span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                  {!notification.read && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        markAsRead(notification.id)
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                      title="Mark as read"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteNotification(notification.id)
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Unread indicator */}
                            {!notification.read && (
                              <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
