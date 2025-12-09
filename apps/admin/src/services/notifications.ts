// Notification Service for Desktop Alerts

import { websocketService, WebSocketEvent } from './websocket'
import toast from 'react-hot-toast'

export interface Notification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
}

class NotificationService {
  private notifications: Notification[] = []
  private listeners: Set<(notifications: Notification[]) => void> = new Set()
  private soundEnabled: boolean = true
  private desktopEnabled: boolean = false

  constructor() {
    this.init()
  }

  private async init() {
    // Request permission for desktop notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        this.desktopEnabled = permission === 'granted'
      } else {
        this.desktopEnabled = Notification.permission === 'granted'
      }
    }

    // Subscribe to important WebSocket events
    this.subscribeToEvents()
  }

  private subscribeToEvents() {
    // Treatment ready for payment
    websocketService.on('treatment.ready_for_payment', (data) => {
      this.notify({
        type: 'success',
        title: 'Treatment Complete',
        message: `${data.patientName} is ready for checkout in ${data.roomNumber}`,
        action: {
          label: 'Process Payment',
          onClick: () => {
            // Navigate to payment or open payment modal
            console.log('Navigate to payment for', data.patientId)
          }
        }
      })
    })

    // Treatment documentation complete
    websocketService.on('treatment.documentation_received', (data) => {
      this.notify({
        type: 'info',
        title: 'Documentation Received',
        message: `${data.providerName} completed documentation for ${data.patientName}`,
      })
    })

    // Provider needs assistance
    websocketService.on('provider.needs_assistance' as WebSocketEvent, (data) => {
      this.notify({
        type: 'warning',
        title: 'Provider Assistance Needed',
        message: `${data.providerName} in ${data.roomNumber} needs help`,
        persistent: true,
        action: {
          label: 'Acknowledge',
          onClick: () => {
            console.log('Assistance acknowledged for', data.providerId)
          }
        }
      })
    })

    // Sync errors
    websocketService.on('treatment.sync_conflict', (data) => {
      this.notify({
        type: 'error',
        title: 'Sync Error',
        message: `Failed to sync treatment data for ${data.patientName}`,
        persistent: true
      })
    })

    // Inventory low stock (from auto-deduction)
    websocketService.on('inventory.auto_deducted', (data) => {
      if (data.lowStock) {
        this.notify({
          type: 'warning',
          title: 'Low Stock Alert',
          message: `${data.productName} is below reorder point (${data.remaining} ${data.unit} remaining)`,
        })
      }
    })
  }

  notify(notification: Omit<Notification, 'id' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
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

    const message = (
      <div className="flex flex-col gap-1">
        <strong className="text-sm font-semibold">{notification.title}</strong>
        <span className="text-xs">{notification.message}</span>
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            {notification.action.label} →
          </button>
        )}
      </div>
    )

    switch (notification.type) {
      case 'success':
        toast.success(message, options)
        break
      case 'error':
        toast.error(message, options)
        break
      case 'warning':
        toast(message, { ...options, icon: '⚠️' })
        break
      default:
        toast(message, options)
    }
  }

  private showDesktopNotification(notification: Notification) {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    
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
        console.log('Could not play notification sound:', err)
      })
    } catch (error) {
      console.log('Audio playback not supported')
    }
  }

  getNotifications() {
    return this.notifications
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
      // Add read timestamp or flag
      this.notifyListeners()
    }
  }

  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.add(callback)
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
    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          this.desktopEnabled = permission === 'granted'
        })
      }
    }
  }

  getSettings() {
    return {
      soundEnabled: this.soundEnabled,
      desktopEnabled: this.desktopEnabled,
      notificationCount: this.notifications.length
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// React Hook for Notifications
import { useEffect, useState } from 'react'

export function useNotifications() {
  const [notifications, setNotifications] = useState(notificationService.getNotifications())
  const [settings, setSettings] = useState(notificationService.getSettings())

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications)
      setSettings(notificationService.getSettings())
    })

    return unsubscribe
  }, [])

  return {
    notifications,
    settings,
    clearNotification: (id: string) => notificationService.clearNotification(id),
    clearAll: () => notificationService.clearAll(),
    setSoundEnabled: (enabled: boolean) => notificationService.setSoundEnabled(enabled),
    setDesktopEnabled: (enabled: boolean) => notificationService.setDesktopEnabled(enabled),
    notify: (notification: Omit<Notification, 'id' | 'timestamp'>) => notificationService.notify(notification)
  }
}