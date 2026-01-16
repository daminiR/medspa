'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  MessageSquare,
  AlertTriangle,
  Bell,
  X,
  Clock,
  CreditCard,
  Gift,
  Megaphone,
  FileText,
  ListChecks,
  UserCheck,
  ClipboardList
} from 'lucide-react'
import type { Notification, NotificationType } from '@/types/notifications'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const typeIcons: Record<NotificationType, typeof Calendar> = {
  // Base types
  appointment: Calendar,
  message: MessageSquare,
  alert: AlertTriangle,
  system: Bell,
  // Appointment types
  appointment_reminder: Calendar,
  appointment_confirmation: UserCheck,
  appointment_cancelled: Calendar,
  appointment_rescheduled: Calendar,
  // Message types
  message_received: MessageSquare,
  // Treatment/clinical
  treatment_followup: ClipboardList,
  // Billing types
  billing_reminder: CreditCard,
  payment_received: CreditCard,
  // Membership
  membership_renewal: Gift,
  // Marketing
  marketing_promotion: Megaphone,
  // System
  system_alert: AlertTriangle,
  // Waitlist
  waitlist_offer: ListChecks,
  // Forms
  form_required: FileText
}

const typeColors: Record<NotificationType, string> = {
  // Base types
  appointment: 'bg-blue-100 text-blue-600',
  message: 'bg-green-100 text-green-600',
  alert: 'bg-amber-100 text-amber-600',
  system: 'bg-purple-100 text-purple-600',
  // Appointment types
  appointment_reminder: 'bg-blue-100 text-blue-600',
  appointment_confirmation: 'bg-emerald-100 text-emerald-600',
  appointment_cancelled: 'bg-red-100 text-red-600',
  appointment_rescheduled: 'bg-orange-100 text-orange-600',
  // Message types
  message_received: 'bg-green-100 text-green-600',
  // Treatment/clinical
  treatment_followup: 'bg-teal-100 text-teal-600',
  // Billing types
  billing_reminder: 'bg-amber-100 text-amber-600',
  payment_received: 'bg-emerald-100 text-emerald-600',
  // Membership
  membership_renewal: 'bg-pink-100 text-pink-600',
  // Marketing
  marketing_promotion: 'bg-violet-100 text-violet-600',
  // System
  system_alert: 'bg-red-100 text-red-600',
  // Waitlist
  waitlist_offer: 'bg-cyan-100 text-cyan-600',
  // Forms
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

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClose
}: NotificationItemProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const Icon = typeIcons[notification.type]
  const colorClasses = typeColors[notification.type]

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    // Small delay for visual feedback
    setTimeout(() => {
      onDelete(notification.id)
    }, 150)
  }

  return (
    <li
      className={`relative px-4 py-3 cursor-pointer transition-all duration-150 ${
        notification.read ? 'bg-white' : 'bg-purple-50/50'
      } ${isHovered ? 'bg-gray-50' : ''} ${isDeleting ? 'opacity-50 scale-95' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="listitem"
      aria-label={`${notification.read ? '' : 'Unread: '}${notification.title}. ${notification.body}`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${colorClasses}`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${notification.read ? 'text-gray-900' : 'font-medium text-gray-900'}`}>
                {notification.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {notification.body}
              </p>
            </div>

            {/* Unread indicator */}
            {!notification.read && (
              <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-purple-500 rounded-full" />
            )}
          </div>

          {/* Time */}
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(new Date(notification.createdAt))}</span>
          </div>
        </div>

        {/* Delete button - visible on hover */}
        <button
          onClick={handleDelete}
          onKeyDown={(e) => e.stopPropagation()}
          className={`absolute right-2 top-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all ${
            isHovered ? 'opacity-100' : 'opacity-0'
          } focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1`}
          title="Delete notification"
          aria-label={`Delete notification: ${notification.title}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </li>
  )
}
