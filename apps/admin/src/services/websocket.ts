// WebSocket Service for Real-time Provider Integration

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

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private listeners: Map<WebSocketEvent, Set<(data: any) => void>> = new Map()
  private messageQueue: WebSocketMessage[] = []
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 1000

  constructor() {
    // Auto-connect when service is instantiated
    if (typeof window !== 'undefined') {
      this.connect()
    }
  }

  connect() {
    try {
      // In production, this would be your actual WebSocket server
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws'
      
      // For demo purposes, we'll simulate a connection
      this.simulateConnection()
      
      // Real implementation would be:
      // this.ws = new WebSocket(wsUrl)
      // this.setupEventHandlers()
      
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.scheduleReconnect()
    }
  }

  private simulateConnection() {
    // Simulate connection for demo
    this.isConnected = true
    this.reconnectAttempts = 0
    
    // Emit connection event
    this.emit('connection.established', { timestamp: new Date() })
    
    // Simulate periodic updates
    this.startSimulation()
  }

  private startSimulation() {
    // Simulate treatment updates every 5 seconds
    setInterval(() => {
      if (!this.isConnected) return
      
      const mockEvents = [
        {
          event: 'treatment.zone_documented' as WebSocketEvent,
          data: {
            treatmentId: 'T-001',
            zone: 'forehead',
            units: 20,
            providerId: 'PR1',
            roomNumber: 'Room 1'
          }
        },
        {
          event: 'treatment.photo_captured' as WebSocketEvent,
          data: {
            treatmentId: 'T-002',
            photoType: 'after',
            angle: 'front',
            providerId: 'PR2',
            roomNumber: 'Room 2'
          }
        },
        {
          event: 'treatment.status_changed' as WebSocketEvent,
          data: {
            treatmentId: 'T-003',
            oldStatus: 'documenting',
            newStatus: 'ready-payment',
            providerId: 'PR3'
          }
        }
      ]
      
      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)]
      this.handleMessage({
        ...randomEvent,
        timestamp: new Date(),
        providerId: randomEvent.data.providerId
      })
    }, 5000)
  }

  private setupEventHandlers() {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.isConnected = true
      this.reconnectAttempts = 0
      this.flushMessageQueue()
      this.emit('connection.established', { timestamp: new Date() })
    }

    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.isConnected = false
      this.emit('connection.lost', { timestamp: new Date() })
      this.scheduleReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.emit('connection.error', { error, timestamp: new Date() })
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage
        this.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.data)
        } catch (error) {
          console.error(`Error in WebSocket listener for ${message.event}:`, error)
        }
      })
    }
    
    // Also emit to wildcard listeners
    const wildcardListeners = this.listeners.get('*' as WebSocketEvent)
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => callback(message))
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.emit('connection.failed', { 
        attempts: this.reconnectAttempts,
        timestamp: new Date() 
      })
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        this.send(message)
      }
    }
  }

  on(event: WebSocketEvent | '*', callback: (data: any) => void) {
    if (!this.listeners.has(event as WebSocketEvent)) {
      this.listeners.set(event as WebSocketEvent, new Set())
    }
    this.listeners.get(event as WebSocketEvent)?.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event as WebSocketEvent)?.delete(callback)
    }
  }

  off(event: WebSocketEvent, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback)
  }

  emit(event: WebSocketEvent | 'connection.established' | 'connection.lost' | 'connection.error' | 'connection.failed', data: any) {
    this.handleMessage({
      event: event as WebSocketEvent,
      timestamp: new Date(),
      data
    })
  }

  send(message: WebSocketMessage) {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      // Queue message for later
      this.messageQueue.push(message)
      console.log('WebSocket not connected, message queued')
    }
  }

  subscribe(pattern: string) {
    // Subscribe to a pattern (e.g., '/treatments/room/*')
    // This would be implemented server-side
    this.send({
      event: 'subscribe' as any,
      timestamp: new Date(),
      data: { pattern }
    })
  }

  unsubscribe(pattern: string) {
    this.send({
      event: 'unsubscribe' as any,
      timestamp: new Date(),
      data: { pattern }
    })
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.isConnected = false
    this.listeners.clear()
    this.messageQueue = []
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      queueLength: this.messageQueue.length
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService()

// React Hook for WebSocket
import { useEffect, useState } from 'react'

export function useWebSocket(event: WebSocketEvent | WebSocketEvent[], handler: (data: any) => void) {
  const [connectionStatus, setConnectionStatus] = useState(websocketService.getConnectionStatus())
  
  useEffect(() => {
    const events = Array.isArray(event) ? event : [event]
    const unsubscribes: (() => void)[] = []
    
    events.forEach(e => {
      const unsub = websocketService.on(e, handler)
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
  }, [event, handler])
  
  return connectionStatus
}

// Typed event emitter for specific use cases
export function emitTreatmentUpdate(update: TreatmentUpdate) {
  websocketService.emit('treatment.status_changed', update)
}

export function emitProviderUpdate(update: ProviderUpdate) {
  websocketService.emit('provider.activity_update', update)
}