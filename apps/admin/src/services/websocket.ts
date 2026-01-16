'use client'

// Real-time Service using Firestore Listeners
// Replaces the previous mock WebSocket service with actual Firestore onSnapshot listeners

import {
  firestore,
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  isFirebaseConfigured,
  COLLECTIONS,
  getWaitingRoomQueuePath,
  getStaffNotificationsPath,
  Unsubscribe,
  Timestamp
} from '@/lib/firebase'

export type WebSocketEvent =
  // From Provider Tablet
  | 'treatment.started'
  | 'treatment.photo_captured'
  | 'treatment.zone_documented'
  | 'treatment.product_used'
  | 'treatment.notes_updated'
  | 'treatment.completed'
  | 'provider.status_changed'
  | 'provider.break_started'
  | 'provider.break_ended'

  // To Admin Portal
  | 'treatment.status_changed'
  | 'treatment.documentation_received'
  | 'treatment.ready_for_payment'
  | 'treatment.sync_conflict'
  | 'provider.activity_update'
  | 'inventory.auto_deducted'

  // Waiting Room Events
  | 'waitingRoom.queue_updated'
  | 'waitingRoom.patient_checked_in'
  | 'waitingRoom.patient_called'

  // Appointment Events
  | 'appointment.created'
  | 'appointment.updated'
  | 'appointment.cancelled'
  | 'appointment.status_changed'

  // Notification Events
  | 'notification.received'
  | 'notification.read'

  // Real-time Update Events (internal)
  | 'rooms.updated'
  | 'waitlistOffers.updated'
  | 'connection.established'
  | 'connection.error'

export interface WebSocketMessage {
  event: WebSocketEvent
  timestamp: Date
  data: any
  providerId?: string
  roomNumber?: string
  patientId?: string
}

export interface TreatmentUpdate {
  treatmentId: string
  patientId: string
  patientName: string
  providerId: string
  providerName: string
  roomNumber: string
  status: string
  documentation?: {
    zones?: number
    photos?: number
    products?: number
    notes?: boolean
  }
  currentActivity?: {
    type: string
    detail?: string
  }
}

export interface ProviderUpdate {
  providerId: string
  providerName: string
  status: 'available' | 'with-patient' | 'documenting' | 'break' | 'offline'
  currentRoom?: string
  currentPatient?: string
  lastActivity: Date
}

export interface WaitingRoomEntry {
  id: string
  appointmentId: string
  patientId: string
  patientName: string
  scheduledTime: Date
  arrivalTime: Date
  status: 'in_car' | 'room_ready' | 'checked_in'
  priority: number
  practitionerName: string
  serviceName: string
  position: number
}

export interface RoomUpdate {
  id: string
  number: string
  status: 'empty' | 'waiting' | 'just-started' | 'in-progress' | 'almost-done' | 'ready'
  patient?: {
    id: string
    name: string
    phone?: string
  }
  provider?: {
    id: string
    name: string
  }
  treatment?: {
    type: string
    startTime: Date
    estimatedDuration: number
    totalAmount: number
    currentActivity?: string
  }
}

class RealTimeService {
  private listeners: Map<WebSocketEvent | '*', Set<(data: any) => void>> = new Map()
  private firestoreUnsubscribes: Map<string, Unsubscribe> = new Map()
  private isConnected: boolean = false
  private currentLocationId: string = 'default'
  private currentStaffUserId: string = ''

  constructor() {
    // Auto-connect when service is instantiated
    if (typeof window !== 'undefined') {
      this.connect()
    }
  }

  connect() {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured. Real-time updates disabled.')
      console.info('Set NEXT_PUBLIC_FIREBASE_* environment variables to enable real-time features.')
      this.isConnected = false
      return
    }

    if (!firestore) {
      console.warn('Firestore not available (server-side rendering).')
      return
    }

    this.isConnected = true
    this.emit('connection.established', { timestamp: new Date() })

    // Start listening to collections
    this.subscribeToAppointments()

    console.log('Real-time service connected to Firestore')
  }

  // Subscribe to appointments collection
  private subscribeToAppointments() {
    if (!firestore) return

    const unsubKey = 'appointments'

    // Unsubscribe from existing listener if any
    this.firestoreUnsubscribes.get(unsubKey)?.()

    try {
      const appointmentsRef = collection(firestore, COLLECTIONS.APPOINTMENTS)
      const appointmentsQuery = query(
        appointmentsRef,
        orderBy('updatedAt', 'desc')
      )

      const unsubscribe = onSnapshot(
        appointmentsQuery,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data()
            const appointmentData = {
              id: change.doc.id,
              ...data,
              // Convert Firestore Timestamps to Dates
              scheduledTime: data.scheduledTime instanceof Timestamp
                ? data.scheduledTime.toDate()
                : new Date(data.scheduledTime),
              createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(data.createdAt),
              updatedAt: data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate()
                : new Date(data.updatedAt)
            }

            if (change.type === 'added') {
              this.emit('appointment.created', appointmentData)
            } else if (change.type === 'modified') {
              this.emit('appointment.updated', appointmentData)

              // Check for status changes
              if (data.status) {
                this.emit('appointment.status_changed', {
                  ...appointmentData,
                  newStatus: data.status
                })
              }

              // Check for treatment-related updates
              if (data.treatmentStatus === 'ready-payment') {
                this.emit('treatment.ready_for_payment', appointmentData)
              }
            } else if (change.type === 'removed') {
              this.emit('appointment.cancelled', appointmentData)
            }
          })
        },
        (error) => {
          console.error('Error listening to appointments:', error)
          this.emit('connection.error', { error, timestamp: new Date() })
        }
      )

      this.firestoreUnsubscribes.set(unsubKey, unsubscribe)
    } catch (error) {
      console.error('Failed to subscribe to appointments:', error)
    }
  }

  // Subscribe to waiting room queue for a specific location
  subscribeToWaitingRoom(locationId: string = 'default') {
    if (!firestore) return

    this.currentLocationId = locationId
    const unsubKey = `waitingRoom_${locationId}`

    // Unsubscribe from existing listener if any
    this.firestoreUnsubscribes.get(unsubKey)?.()

    try {
      const queueRef = collection(firestore, getWaitingRoomQueuePath(locationId))
      const queueQuery = query(
        queueRef,
        orderBy('position', 'asc')
      )

      const unsubscribe = onSnapshot(
        queueQuery,
        (snapshot) => {
          const queue: WaitingRoomEntry[] = []

          snapshot.forEach((doc) => {
            const data = doc.data()
            queue.push({
              id: doc.id,
              appointmentId: data.appointmentId,
              patientId: data.patientId,
              patientName: data.patientName,
              scheduledTime: data.scheduledTime instanceof Timestamp
                ? data.scheduledTime.toDate()
                : new Date(data.scheduledTime),
              arrivalTime: data.arrivalTime instanceof Timestamp
                ? data.arrivalTime.toDate()
                : new Date(data.arrivalTime),
              status: data.status,
              priority: data.priority || 0,
              practitionerName: data.practitionerName,
              serviceName: data.serviceName,
              position: data.position
            })
          })

          this.emit('waitingRoom.queue_updated', { queue, locationId })

          // Emit individual changes
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data()
            if (change.type === 'added' && data.status === 'checked_in') {
              this.emit('waitingRoom.patient_checked_in', {
                id: change.doc.id,
                ...data
              })
            }
            if (change.type === 'modified' && data.status === 'room_ready') {
              this.emit('waitingRoom.patient_called', {
                id: change.doc.id,
                ...data
              })
            }
          })
        },
        (error) => {
          console.error('Error listening to waiting room:', error)
        }
      )

      this.firestoreUnsubscribes.set(unsubKey, unsubscribe)
    } catch (error) {
      console.error('Failed to subscribe to waiting room:', error)
    }
  }

  // Subscribe to staff notifications
  subscribeToNotifications(staffUserId: string, maxNotifications: number = 50) {
    if (!firestore || !staffUserId) return

    this.currentStaffUserId = staffUserId
    const unsubKey = `notifications_${staffUserId}`

    // Unsubscribe from existing listener if any
    this.firestoreUnsubscribes.get(unsubKey)?.()

    try {
      const notificationsRef = collection(firestore, getStaffNotificationsPath(staffUserId))
      // Cost optimization: limit to recent unread notifications
      const notificationsQuery = query(
        notificationsRef,
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(maxNotifications)
      )

      const unsubscribe = onSnapshot(
        notificationsQuery,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data()
            const notification = {
              id: change.doc.id,
              ...data,
              createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(data.createdAt)
            }

            if (change.type === 'added') {
              this.emit('notification.received', notification)

              // Map notification types to specific events
              if (data.type === 'treatment_ready') {
                this.emit('treatment.ready_for_payment', notification)
              } else if (data.type === 'documentation_complete') {
                this.emit('treatment.documentation_received', notification)
              } else if (data.type === 'sync_error') {
                this.emit('treatment.sync_conflict', notification)
              } else if (data.type === 'low_stock') {
                this.emit('inventory.auto_deducted', { ...notification, lowStock: true })
              }
            } else if (change.type === 'modified' && data.read) {
              this.emit('notification.read', notification)
            }
          })
        },
        (error) => {
          console.error('Error listening to notifications:', error)
        }
      )

      this.firestoreUnsubscribes.set(unsubKey, unsubscribe)
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error)
    }
  }

  // Subscribe to rooms/treatments for Command Center
  subscribeToRooms(locationId: string = 'default') {
    if (!firestore) return

    const unsubKey = `rooms_${locationId}`

    // Unsubscribe from existing listener if any
    this.firestoreUnsubscribes.get(unsubKey)?.()

    try {
      const roomsRef = collection(firestore, COLLECTIONS.ROOMS)
      const roomsQuery = query(
        roomsRef,
        where('locationId', '==', locationId)
      )

      const unsubscribe = onSnapshot(
        roomsQuery,
        (snapshot) => {
          const rooms: RoomUpdate[] = []

          snapshot.forEach((doc) => {
            const data = doc.data()
            rooms.push({
              id: doc.id,
              number: data.number,
              status: data.status,
              patient: data.patient,
              provider: data.provider,
              treatment: data.treatment ? {
                ...data.treatment,
                startTime: data.treatment.startTime instanceof Timestamp
                  ? data.treatment.startTime.toDate()
                  : new Date(data.treatment.startTime)
              } : undefined
            })
          })

          this.emit('rooms.updated', { rooms, locationId })

          // Emit treatment status changes
          snapshot.docChanges().forEach((change) => {
            const data = change.doc.data()
            if (change.type === 'modified') {
              if (data.status === 'ready') {
                this.emit('treatment.ready_for_payment', {
                  roomId: change.doc.id,
                  roomNumber: data.number,
                  patient: data.patient,
                  treatment: data.treatment
                })
              }
              this.emit('treatment.status_changed', {
                roomId: change.doc.id,
                roomNumber: data.number,
                status: data.status,
                patient: data.patient
              })
            }
          })
        },
        (error) => {
          console.error('Error listening to rooms:', error)
        }
      )

      this.firestoreUnsubscribes.set(unsubKey, unsubscribe)
    } catch (error) {
      console.error('Failed to subscribe to rooms:', error)
    }
  }

  // Subscribe to waitlist offers
  subscribeToWaitlistOffers(locationId: string = 'default') {
    if (!firestore) return

    const unsubKey = `waitlistOffers_${locationId}`

    // Unsubscribe from existing listener if any
    this.firestoreUnsubscribes.get(unsubKey)?.()

    try {
      const offersRef = collection(firestore, COLLECTIONS.WAITLIST_OFFERS)
      const offersQuery = query(
        offersRef,
        where('locationId', '==', locationId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(
        offersQuery,
        (snapshot) => {
          const offers: any[] = []

          snapshot.forEach((doc) => {
            const data = doc.data()
            offers.push({
              id: doc.id,
              ...data,
              expiresAt: data.expiresAt instanceof Timestamp
                ? data.expiresAt.toDate()
                : new Date(data.expiresAt),
              sentAt: data.sentAt instanceof Timestamp
                ? data.sentAt.toDate()
                : new Date(data.sentAt),
              respondedAt: data.respondedAt instanceof Timestamp
                ? data.respondedAt.toDate()
                : data.respondedAt ? new Date(data.respondedAt) : undefined
            })
          })

          this.emit('waitlistOffers.updated', { offers, locationId })
        },
        (error) => {
          console.error('Error listening to waitlist offers:', error)
        }
      )

      this.firestoreUnsubscribes.set(unsubKey, unsubscribe)
    } catch (error) {
      console.error('Failed to subscribe to waitlist offers:', error)
    }
  }

  // Event handling - compatible with existing interface
  on(event: WebSocketEvent | '*', callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  off(event: WebSocketEvent, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback)
  }

  emit(event: WebSocketEvent | string, data: any) {
    const message: WebSocketMessage = {
      event: event as WebSocketEvent,
      timestamp: new Date(),
      data
    }

    // Notify specific event listeners
    const listeners = this.listeners.get(event as WebSocketEvent)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error)
        }
      })
    }

    // Also emit to wildcard listeners
    const wildcardListeners = this.listeners.get('*')
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => {
        try {
          callback(message)
        } catch (error) {
          console.error('Error in wildcard listener:', error)
        }
      })
    }
  }

  // Legacy compatibility methods
  subscribe(pattern: string) {
    // Parse pattern to determine what to subscribe to
    if (pattern.includes('waitingRoom')) {
      const locationMatch = pattern.match(/waitingRoom\/([^/]+)/)
      const locationId = locationMatch ? locationMatch[1] : 'default'
      this.subscribeToWaitingRoom(locationId)
    } else if (pattern.includes('notifications')) {
      const userMatch = pattern.match(/notifications\/([^/]+)/)
      const userId = userMatch ? userMatch[1] : ''
      if (userId) {
        this.subscribeToNotifications(userId)
      }
    } else if (pattern.includes('rooms')) {
      const locationMatch = pattern.match(/rooms\/([^/]+)/)
      const locationId = locationMatch ? locationMatch[1] : 'default'
      this.subscribeToRooms(locationId)
    } else if (pattern.includes('waitlistOffers')) {
      const locationMatch = pattern.match(/waitlistOffers\/([^/]+)/)
      const locationId = locationMatch ? locationMatch[1] : 'default'
      this.subscribeToWaitlistOffers(locationId)
    }
  }

  unsubscribe(pattern: string) {
    // Find and remove the matching subscription
    const keysToRemove = Array.from(this.firestoreUnsubscribes.keys())
      .filter(key => pattern.includes(key.split('_')[0]))

    keysToRemove.forEach(key => {
      this.firestoreUnsubscribes.get(key)?.()
      this.firestoreUnsubscribes.delete(key)
    })
  }

  // Unsubscribe from a specific Firestore listener by exact key
  unsubscribeByKey(key: string) {
    const unsubscribe = this.firestoreUnsubscribes.get(key)
    if (unsubscribe) {
      unsubscribe()
      this.firestoreUnsubscribes.delete(key)
    }
  }

  disconnect() {
    // Unsubscribe from all Firestore listeners
    this.firestoreUnsubscribes.forEach((unsubscribe) => {
      unsubscribe()
    })
    this.firestoreUnsubscribes.clear()

    this.isConnected = false
    this.listeners.clear()

    console.log('Real-time service disconnected')
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: 0,
      queueLength: 0,
      activeSubscriptions: this.firestoreUnsubscribes.size
    }
  }

  // Check if Firebase is configured
  isConfigured(): boolean {
    return isFirebaseConfigured()
  }
}

// Export singleton instance
export const websocketService = new RealTimeService()

// React Hook for real-time updates
import { useEffect, useState, useCallback, useRef } from 'react'

export function useWebSocket(event: WebSocketEvent | WebSocketEvent[], handler: (data: any) => void) {
  const [connectionStatus, setConnectionStatus] = useState(websocketService.getConnectionStatus())
  // Store handler in a ref to avoid re-subscriptions when handler reference changes
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const events = Array.isArray(event) ? event : [event]
    const unsubscribes: (() => void)[] = []

    events.forEach(e => {
      const unsub = websocketService.on(e, (data) => handlerRef.current(data))
      unsubscribes.push(unsub)
    })

    // Listen for connection status changes
    const statusUnsub = websocketService.on('*', () => {
      setConnectionStatus(websocketService.getConnectionStatus())
    })
    unsubscribes.push(statusUnsub)

    return () => {
      unsubscribes.forEach(unsub => unsub())
    }
  }, [event]) // Removed handler from dependencies - using ref instead

  return connectionStatus
}

// Hook for waiting room real-time updates
export function useWaitingRoomRealtime(locationId: string = 'default') {
  const [queue, setQueue] = useState<WaitingRoomEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if Firebase is configured before subscribing
    if (!websocketService.isConfigured()) {
      setIsConnected(false)
      return
    }

    // Subscribe to waiting room updates
    websocketService.subscribeToWaitingRoom(locationId)
    setIsConnected(websocketService.getConnectionStatus().connected)

    const unsubscribe = websocketService.on('waitingRoom.queue_updated', (data) => {
      if (data.locationId === locationId) {
        setQueue(data.queue)
      }
    })

    return () => {
      unsubscribe()
      // Also unsubscribe from Firestore listener
      websocketService.unsubscribeByKey(`waitingRoom_${locationId}`)
    }
  }, [locationId])

  return { queue, isConnected }
}

// Hook for rooms/Command Center real-time updates
export function useRoomsRealtime(locationId: string = 'default') {
  const [rooms, setRooms] = useState<RoomUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if Firebase is configured before subscribing
    if (!websocketService.isConfigured()) {
      setIsConnected(false)
      return
    }

    // Subscribe to rooms updates
    websocketService.subscribeToRooms(locationId)
    setIsConnected(websocketService.getConnectionStatus().connected)

    const unsubscribe = websocketService.on('rooms.updated', (data) => {
      if (data.locationId === locationId) {
        setRooms(data.rooms)
      }
    })

    return () => {
      unsubscribe()
      // Also unsubscribe from Firestore listener
      websocketService.unsubscribeByKey(`rooms_${locationId}`)
    }
  }, [locationId])

  return { rooms, isConnected }
}

// Hook for waitlist offers real-time updates
export function useWaitlistOffersRealtime(locationId: string = 'default') {
  const [offers, setOffers] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if Firebase is configured before subscribing
    if (!websocketService.isConfigured()) {
      setIsConnected(false)
      return
    }

    // Subscribe to waitlist offers updates
    websocketService.subscribeToWaitlistOffers(locationId)
    setIsConnected(websocketService.getConnectionStatus().connected)

    const unsubscribe = websocketService.on('waitlistOffers.updated', (data) => {
      if (data.locationId === locationId) {
        setOffers(data.offers)
      }
    })

    return () => {
      unsubscribe()
      // Also unsubscribe from Firestore listener
      websocketService.unsubscribeByKey(`waitlistOffers_${locationId}`)
    }
  }, [locationId])

  return { offers, isConnected }
}

// Hook for staff notifications real-time updates
// NOTE: For a more robust implementation with reconnection and connection status,
// use the dedicated hook from '@/hooks/useNotificationsRealtime'
export function useNotificationsRealtime(staffUserId: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const processedIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!staffUserId) return

    // Check if Firebase is configured before subscribing
    if (!websocketService.isConfigured()) {
      setIsConnected(false)
      return
    }

    // Subscribe to notifications with cost-optimized limit
    websocketService.subscribeToNotifications(staffUserId, 50)
    setIsConnected(websocketService.getConnectionStatus().connected)

    const handleNotification = (notification: any) => {
      // Deduplication check
      if (processedIdsRef.current.has(notification.id)) return
      processedIdsRef.current.add(notification.id)

      setNotifications(prev => {
        // Avoid duplicates in state
        if (prev.some(n => n.id === notification.id)) return prev
        // Add new notification and limit to 50
        return [notification, ...prev].slice(0, 50)
      })
    }

    const unsubscribe = websocketService.on('notification.received', handleNotification)

    // Also listen for read events to update local state
    const unsubscribeRead = websocketService.on('notification.read', (notification: any) => {
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      )
    })

    return () => {
      unsubscribe()
      unsubscribeRead()
      // Clean up the Firestore subscription when component unmounts
      websocketService.unsubscribeByKey(`notifications_${staffUserId}`)
      processedIdsRef.current.clear()
    }
  }, [staffUserId])

  return { notifications, isConnected }
}

// Typed event emitter for specific use cases
export function emitTreatmentUpdate(update: TreatmentUpdate) {
  websocketService.emit('treatment.status_changed', update)
}

export function emitProviderUpdate(update: ProviderUpdate) {
  websocketService.emit('provider.activity_update', update)
}
