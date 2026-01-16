// Notification Service for Desktop Alerts
// Now connected to real Firestore notification events

import { websocketService, WebSocketEvent } from './websocket'
import toast from 'react-hot-toast'
import type {
  ToastNotification,
  CreateToastNotification,
  NotificationServiceSettings,
  RealtimeNotificationEvent,
} from '@/types/notifications'

// Re-export the toast notification type as Notification for backwards compatibility
export type Notification = ToastNotification

class NotificationService {
  private notifications: Notification[] = []
  private listeners: Set<(notifications: Notification[]) => void> = new Set()
  private soundEnabled: boolean = true
  private desktopEnabled: boolean = false
  private currentStaffUserId: string = ''
  private initialized: boolean = false

  constructor() {
    // Defer initialization to avoid issues with SSR
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private async init() {
    if (this.initialized) return
    this.initialized = true

    // Request permission for desktop notifications
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        this.desktopEnabled = permission === 'granted'
      } else {
        this.desktopEnabled = Notification.permission === 'granted'
      }
    }

    // Subscribe to Firestore notification events via the real-time service
    this.subscribeToEvents()
  }

  // Set the current staff user ID to listen for their notifications
  setStaffUserId(userId: string) {
    if (this.currentStaffUserId !== userId) {
      this.currentStaffUserId = userId
      // Subscribe to notifications for this user
      websocketService.subscribeToNotifications(userId)
    }
  }

  private subscribeToEvents() {
    // Listen for new notifications from Firestore
    websocketService.on('notification.received', (data) => {
      this.handleFirestoreNotification(data)
    })

    // Treatment ready for payment
    websocketService.on('treatment.ready_for_payment', (data) => {
      this.notify({
        type: 'success',
        title: 'Treatment Complete',
        message: `${data.patientName || 'Patient'} is ready for checkout${data.roomNumber ? ` in ${data.roomNumber}` : ''}`,
        action: {
          label: 'Process Payment',
          onClick: () => {
            // Navigate to payment or open payment modal
            console.log('Navigate to payment for', data.patientId)
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('openCheckout', { detail: data }))
            }
          }
        }
      })
    })

    // Treatment documentation complete
    websocketService.on('treatment.documentation_received', (data) => {
      this.notify({
        type: 'info',
        title: 'Documentation Received',
        message: `${data.providerName || 'Provider'} completed documentation for ${data.patientName || 'patient'}`,
      })
    })

    // Provider needs assistance
    websocketService.on('provider.needs_assistance' as WebSocketEvent, (data) => {
      this.notify({
        type: 'warning',
        title: 'Provider Assistance Needed',
        message: `${data.providerName || 'Provider'} in ${data.roomNumber || 'room'} needs help`,
        persistent: true,
        action: {
          label: 'Acknowledge',
          onClick: () => {
            console.log('Assistance acknowledged for', data.providerId)
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('acknowledgeAssistance', { detail: data }))
            }
          }
        }
      })
    })

    // Sync errors
    websocketService.on('treatment.sync_conflict', (data) => {
      this.notify({
        type: 'error',
        title: 'Sync Error',
        message: `Failed to sync treatment data${data.patientName ? ` for ${data.patientName}` : ''}`,
        persistent: true
      })
    })

    // Inventory low stock (from auto-deduction)
    websocketService.on('inventory.auto_deducted', (data) => {
      if (data.lowStock) {
        this.notify({
          type: 'warning',
          title: 'Low Stock Alert',
          message: `${data.productName || 'Product'} is below reorder point (${data.remaining || 0} ${data.unit || 'units'} remaining)`,
        })
      }
    })

    // Waiting room updates
    websocketService.on('waitingRoom.patient_checked_in', (data) => {
      this.notify({
        type: 'info',
        title: 'Patient Checked In',
        message: `${data.patientName || 'Patient'} has checked in for their appointment`,
      })
    })

    websocketService.on('waitingRoom.patient_called', (data) => {
      this.notify({
        type: 'success',
        title: 'Patient Called',
        message: `${data.patientName || 'Patient'} has been notified that their room is ready`,
      })
    })

    // Appointment updates
    websocketService.on('appointment.created', (data) => {
      // Only notify for same-day appointments
      const today = new Date()
      const appointmentDate = new Date(data.scheduledTime)
      if (appointmentDate.toDateString() === today.toDateString()) {
        this.notify({
          type: 'info',
          title: 'New Appointment',
          message: `${data.patientName || 'Patient'} booked for today at ${appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
        })
      }
    })

    websocketService.on('appointment.cancelled', (data) => {
      this.notify({
        type: 'warning',
        title: 'Appointment Cancelled',
        message: `${data.patientName || 'Patient'}'s appointment has been cancelled`,
      })
    })
  }

  // Handle notifications coming from Firestore
  private handleFirestoreNotification(data: RealtimeNotificationEvent) {
    // Map Firestore notification types to our toast notification format
    const typeMap: Record<string, ToastNotification['type']> = {
      'treatment_ready': 'success',
      'documentation_complete': 'info',
      'assistance_needed': 'warning',
      'sync_error': 'error',
      'low_stock': 'warning',
      'appointment_reminder': 'info',
      'patient_arrived': 'info'
    }

    const notification: CreateToastNotification = {
      type: typeMap[data.type] || 'info',
      title: data.title || 'Notification',
      message: data.message || data.body || '',
      persistent: data.persistent || data.requiresAction,
    }

    // Add action if the notification has one
    if (data.actionUrl || data.actionType) {
      notification.action = {
        label: data.actionLabel || 'View',
        onClick: () => {
          if (data.actionUrl && typeof window !== 'undefined') {
            window.location.href = data.actionUrl
          } else if (data.actionType) {
            window.dispatchEvent(new CustomEvent(data.actionType, { detail: data }))
          }
        }
      }
    }

    this.notify(notification)
  }

  notify(notification: CreateToastNotification): Notification {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    // Add to internal list
    this.notifications.unshift(newNotification)
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50)
    }

    // Notify listeners
    this.notifyListeners()

    // Show toast notification
    this.showToast(newNotification)

    // Show desktop notification if enabled
    if (this.desktopEnabled) {
      this.showDesktopNotification(newNotification)
    }

    // Play sound if enabled
    if (this.soundEnabled) {
      this.playNotificationSound(notification.type)
    }

    return newNotification
  }

  private showToast(notification: Notification) {
    const options = {
      duration: notification.persistent ? Infinity : 5000,
      position: 'top-right' as const,
    }

    const message = `${notification.title}: ${notification.message}${notification.action ? ` - ${notification.action.label}` : ''}`

    switch (notification.type) {
      case 'success':
        toast.success(message, options)
        break
      case 'error':
        toast.error(message, options)
        break
      case 'warning':
        toast(message, { ...options, icon: '!' })
        break
      default:
        toast(message, options)
    }
  }

  private showDesktopNotification(notification: Notification) {
    if (typeof window === 'undefined' || !('Notification' in window) || typeof Notification === 'undefined') return

    const desktopNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192.png', // Add your app icon
      badge: '/badge-72.png', // Add your badge icon
      tag: notification.id,
      requireInteraction: notification.persistent,
    })

    if (notification.action) {
      desktopNotif.onclick = () => {
        window.focus()
        notification.action?.onClick()
        desktopNotif.close()
      }
    }

    // Auto-close non-persistent notifications
    if (!notification.persistent) {
      setTimeout(() => desktopNotif.close(), 5000)
    }
  }

  private playNotificationSound(type: Notification['type']) {
    if (typeof window === 'undefined') return

    // Map notification types to sound files
    const sounds: Record<string, string> = {
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      warning: '/sounds/warning.mp3',
      info: '/sounds/info.mp3'
    }

    const soundUrl = sounds[type] || sounds.info

    // Play sound (you'll need to add these sound files to your public folder)
    try {
      const audio = new Audio(soundUrl)
      audio.volume = 0.3
      audio.play().catch(err => {
        // Silently fail - browser may block autoplay
        console.debug('Could not play notification sound:', err)
      })
    } catch (error) {
      console.debug('Audio playback not supported')
    }
  }

  getNotifications() {
    return this.notifications
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length
  }

  clearNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id)
    this.notifyListeners()
  }

  clearAll() {
    this.notifications = []
    this.notifyListeners()
  }

  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      this.notifyListeners()
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true)
    this.notifyListeners()
  }

  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.add(callback)
    // Immediately call with current notifications
    callback(this.notifications)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.notifications))
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled
  }

  setDesktopEnabled(enabled: boolean) {
    this.desktopEnabled = enabled
    if (enabled && typeof window !== 'undefined' && 'Notification' in window && typeof Notification !== 'undefined') {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
          .then(permission => {
            this.desktopEnabled = permission === 'granted'
          })
          .catch(() => {
            // Permission request failed - keep desktop notifications disabled
            this.desktopEnabled = false
          })
      }
    }
  }

  getSettings(): NotificationServiceSettings {
    return {
      soundEnabled: this.soundEnabled,
      desktopEnabled: this.desktopEnabled,
      notificationCount: this.notifications.length,
      unreadCount: this.getUnreadCount()
    }
  }

  // Check if the real-time service is connected
  isConnected() {
    return websocketService.getConnectionStatus().connected
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// React hook for notifications (can be used in components)
// Example usage:
// import { useNotifications } from '@/services/notifications'
//
// function MyComponent() {
//   const { notifications, unreadCount, clearNotification, markAsRead } = useNotifications()
//   ...
// }
