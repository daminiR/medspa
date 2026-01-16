'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  Activity,
  Camera,
  AlertCircle,
  Timer,
  TrendingUp,
  User,
  Phone,
  ChevronRight,
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useRoomsRealtime, RoomUpdate, websocketService } from '@/services/websocket'

type RoomStatus = 'empty' | 'waiting' | 'just-started' | 'in-progress' | 'almost-done' | 'ready'

interface Room {
  id: string
  number: string
  status: RoomStatus
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
    estimatedDuration: number // minutes
    totalAmount: number
    currentActivity?: string
  }
}

interface MoneyMetrics {
  readyToCollect: number
  inTreatment: number
  collected: number
  dailyGoal: number
}

// Default mock rooms for fallback when Firestore is not connected
const defaultMockRooms: Room[] = [
  {
    id: '1',
    number: 'Room 1',
    status: 'ready',
    patient: { id: 'p1', name: 'Emma Wilson' },
    provider: { id: 'dr1', name: 'Dr. Smith' },
    treatment: {
      type: 'Botox',
      startTime: new Date(Date.now() - 45 * 60000),
      estimatedDuration: 30,
      totalAmount: 650,
      currentActivity: 'Complete'
    }
  },
  {
    id: '2',
    number: 'Room 2',
    status: 'almost-done',
    patient: { id: 'p2', name: 'Sarah Chen' },
    provider: { id: 'dr2', name: 'Dr. Park' },
    treatment: {
      type: 'Lip Filler',
      startTime: new Date(Date.now() - 35 * 60000),
      estimatedDuration: 45,
      totalAmount: 1200,
      currentActivity: 'Taking after photos'
    }
  },
  {
    id: '3',
    number: 'Room 3',
    status: 'in-progress',
    patient: { id: 'p3', name: 'Mike Jones' },
    provider: { id: 'dr1', name: 'Dr. Smith' },
    treatment: {
      type: 'Laser + PRP',
      startTime: new Date(Date.now() - 20 * 60000),
      estimatedDuration: 60,
      totalAmount: 2400,
      currentActivity: 'Laser treatment'
    }
  },
  {
    id: '4',
    number: 'Room 4',
    status: 'just-started',
    patient: { id: 'p4', name: 'Lisa Park' },
    provider: { id: 'nr1', name: 'Nurse Kim' },
    treatment: {
      type: 'Consultation',
      startTime: new Date(Date.now() - 5 * 60000),
      estimatedDuration: 30,
      totalAmount: 0,
      currentActivity: 'Discussing options'
    }
  },
  {
    id: '5',
    number: 'Room 5',
    status: 'empty'
  },
  {
    id: '6',
    number: 'Room 6',
    status: 'waiting',
    patient: { id: 'p5', name: 'Jennifer Wu' },
    treatment: {
      type: 'Chemical Peel',
      startTime: new Date(Date.now() + 15 * 60000),
      estimatedDuration: 45,
      totalAmount: 350
    }
  }
]

// Convert RoomUpdate from Firestore to Room format
function convertToRoom(roomUpdate: RoomUpdate): Room {
  return {
    id: roomUpdate.id,
    number: roomUpdate.number,
    status: roomUpdate.status,
    patient: roomUpdate.patient,
    provider: roomUpdate.provider,
    treatment: roomUpdate.treatment
  }
}

export function CommandCenterView() {
  // Use real-time Firestore listener for room updates
  const { rooms: realtimeRooms, isConnected } = useRoomsRealtime('default')

  // Local state for rooms (will be synced with real-time updates or use mock data)
  const [rooms, setRooms] = useState<Room[]>(defaultMockRooms)
  const [waitingCount] = useState(3)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [liveSync, setLiveSync] = useState(true)

  // Sync real-time rooms with local state
  useEffect(() => {
    if (isConnected && realtimeRooms.length > 0) {
      setRooms(realtimeRooms.map(convertToRoom))
    }
  }, [realtimeRooms, isConnected])

  // Listen for treatment status changes for real-time updates
  useEffect(() => {
    if (!liveSync) return

    const unsubscribe = websocketService.on('treatment.status_changed', (data) => {
      setRooms(prev => prev.map(room => {
        if (room.id === data.roomId) {
          return { ...room, status: data.status }
        }
        return room
      }))
    })

    return () => {
      unsubscribe()
    }
  }, [liveSync])

  // Listen for treatment ready for payment events
  useEffect(() => {
    const unsubscribe = websocketService.on('treatment.ready_for_payment', (data) => {
      if (data.roomId) {
        setRooms(prev => prev.map(room => {
          if (room.id === data.roomId) {
            return { ...room, status: 'ready' as RoomStatus }
          }
          return room
        }))
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const metrics: MoneyMetrics = {
    readyToCollect: rooms.filter(r => r.status === 'ready').reduce((sum, r) => sum + (r.treatment?.totalAmount || 0), 0),
    inTreatment: rooms.filter(r => ['in-progress', 'almost-done', 'just-started'].includes(r.status)).reduce((sum, r) => sum + (r.treatment?.totalAmount || 0), 0),
    collected: 12340,
    dailyGoal: 20000
  }

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'ready': return 'bg-green-500 animate-pulse'
      case 'almost-done': return 'bg-yellow-500'
      case 'in-progress': return 'bg-orange-500'
      case 'just-started': return 'bg-blue-500'
      case 'waiting': return 'bg-purple-500'
      case 'empty': return 'bg-gray-300'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: RoomStatus) => {
    switch (status) {
      case 'ready': return 'READY'
      case 'almost-done': return 'ALMOST DONE'
      case 'in-progress': return 'IN PROGRESS'
      case 'just-started': return 'JUST STARTED'
      case 'waiting': return 'WAITING'
      case 'empty': return 'EMPTY'
      default: return status
    }
  }

  const getElapsedTime = (startTime: Date) => {
    const minutes = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000)
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getProgressPercentage = (room: Room) => {
    if (!room.treatment) return 0
    const elapsed = (Date.now() - new Date(room.treatment.startTime).getTime()) / 60000
    return Math.min(100, (elapsed / room.treatment.estimatedDuration) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Top Money Bar */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg text-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wide opacity-90">Ready to Collect</span>
            </div>
            <div className="text-3xl font-bold">
              ${metrics.readyToCollect.toLocaleString()}
            </div>
            {metrics.readyToCollect > 0 && (
              <div className="text-xs mt-1 opacity-75 animate-pulse">Click to checkout</div>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wide opacity-90">In Treatment</span>
            </div>
            <div className="text-3xl font-bold">
              ${metrics.inTreatment.toLocaleString()}
            </div>
            <div className="text-xs mt-1 opacity-75">Coming soon</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wide opacity-90">Collected Today</span>
            </div>
            <div className="text-3xl font-bold">
              ${metrics.collected.toLocaleString()}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wide opacity-90">Daily Goal</span>
            </div>
            <div className="text-3xl font-bold">
              {Math.round((metrics.collected / metrics.dailyGoal) * 100)}%
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, (metrics.collected / metrics.dailyGoal) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">In Treatment: <strong>4</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600">Waiting: <strong>{waitingCount}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Avg Wait: <strong>12 min</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && liveSync ? (
            <>
              <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-sm text-green-600 font-medium">Live Sync</span>
            </>
          ) : isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-600">Paused</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Offline</span>
            </>
          )}
          <button
            onClick={() => setLiveSync(!liveSync)}
            className="ml-2 text-xs text-gray-500 hover:text-gray-700"
          >
            {liveSync ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => (
          <div
            key={room.id}
            onClick={() => room.status !== 'empty' && setSelectedRoom(room)}
            className={`relative bg-white rounded-xl shadow-lg border-2 transition-all ${
              room.status === 'ready'
                ? 'border-green-500 shadow-green-200 hover:shadow-green-300 cursor-pointer transform hover:scale-[1.02]'
                : room.status === 'empty'
                ? 'border-gray-200 opacity-60'
                : 'border-gray-200 hover:border-gray-300 cursor-pointer hover:shadow-xl'
            }`}
          >
            {/* Room Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">{room.number}</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(room.status)}`}>
                  {getStatusText(room.status)}
                </div>
              </div>
            </div>

            {/* Room Content */}
            {room.status !== 'empty' && room.patient && (
              <div className="p-4 space-y-3">
                {/* Patient Info */}
                <div>
                  <p className="text-lg font-semibold text-gray-900">{room.patient.name}</p>
                  <p className="text-sm text-purple-600 font-medium">{room.treatment?.type}</p>
                </div>

                {/* Time & Progress */}
                {room.treatment && room.status !== 'waiting' && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {getElapsedTime(room.treatment.startTime)}
                      </span>
                      <span className="text-gray-500">
                        Est: {room.treatment.estimatedDuration} min
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          room.status === 'ready' ? 'bg-green-500' :
                          room.status === 'almost-done' ? 'bg-yellow-500' :
                          room.status === 'in-progress' ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${getProgressPercentage(room)}%` }}
                      />
                    </div>
                  </>
                )}

                {/* Current Activity */}
                {room.treatment?.currentActivity && room.status !== 'ready' && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                    <Activity className="w-3 h-3" />
                    {room.treatment.currentActivity}
                  </div>
                )}

                {/* Provider */}
                {room.provider && (
                  <div className="text-xs text-gray-500">
                    <User className="w-3 h-3 inline mr-1" />
                    {room.provider.name}
                  </div>
                )}

                {/* Amount */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-xl font-bold text-gray-900">
                      ${room.treatment?.totalAmount.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {room.status === 'ready' && (
                  <button className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    CHECKOUT NOW
                  </button>
                )}
              </div>
            )}

            {/* Empty Room */}
            {room.status === 'empty' && (
              <div className="p-8 text-center text-gray-400">
                <div className="text-sm">Available</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Waiting List Sidebar */}
      <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">Next Up</h3>
          <span className="text-sm text-gray-600">{waitingCount} waiting</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div>
              <p className="font-medium text-gray-900">David Park</p>
              <p className="text-xs text-gray-600">2:30 PM - Dysport - Dr. Smith</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Rachel Kim</p>
              <p className="text-xs text-gray-600">2:45 PM - Facial - Nurse Kim</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Tom Wilson</p>
              <p className="text-xs text-gray-600">3:00 PM - Consultation - Dr. Park</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Quick Room Details Modal */}
      {selectedRoom && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedRoom.number}</h3>
                <p className="text-sm text-gray-600">{selectedRoom.patient?.name}</p>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                X
              </button>
            </div>

            {selectedRoom.patient?.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Phone className="w-4 h-4" />
                <span>{selectedRoom.patient.phone}</span>
              </div>
            )}

            {selectedRoom.treatment && (
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium">{selectedRoom.treatment.type}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Provider</span>
                  <span className="font-medium">{selectedRoom.provider?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Started</span>
                  <span className="font-medium">{new Date(selectedRoom.treatment.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{getElapsedTime(selectedRoom.treatment.startTime)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Total</span>
                  <span className="text-2xl font-bold text-gray-900">${selectedRoom.treatment.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            {selectedRoom.status === 'ready' && (
              <button className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-blue-700">
                Process Payment
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
