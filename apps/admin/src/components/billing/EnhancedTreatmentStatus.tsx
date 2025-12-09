'use client'

import { useState, useEffect } from 'react'
import {
  Clock,
  User,
  MapPin,
  Activity,
  Camera,
  FileText,
  Syringe,
  CheckCircle,
  AlertCircle,
  WifiOff,
  Wifi,
  Package,
  Eye,
  ChevronRight,
  Sparkles,
  Loader2,
  PauseCircle,
  PlayCircle,
  Image,
  DollarSign
} from 'lucide-react'

type TreatmentStatus = 
  | 'waiting'          // Checked in, not in room
  | 'in-room'         // Provider opened chart
  | 'preparing'       // Setting up treatment
  | 'documenting'     // Active documentation
  | 'photos-before'   // Taking before photos
  | 'treating'        // Performing treatment
  | 'photos-after'    // Taking after photos
  | 'reviewing'       // Provider final review
  | 'ready-payment'   // Complete, ready for checkout
  | 'processing'      // Payment in progress
  | 'complete'        // Checked out

interface ProviderActivity {
  providerId: string
  providerName: string
  providerAvatar?: string
  currentRoom: string | null
  currentPatient: string | null
  status: 'available' | 'with-patient' | 'documenting' | 'break' | 'offline'
  activeMinutes: number
  patientsSeenToday: number
  lastActivityTime: Date
  connectionStatus: 'connected' | 'disconnected' | 'syncing'
}

interface TreatmentSession {
  id: string
  patientId: string
  patientName: string
  providerId: string
  providerName: string
  roomNumber: string
  appointmentTime: string
  status: TreatmentStatus
  startTime?: Date
  
  // Real-time documentation progress
  documentation?: {
    zones: number
    photos: number
    products: number
    notes: boolean
  }
  
  // Current activity details
  currentActivity?: {
    type: 'injection' | 'photo' | 'notes' | 'review'
    detail?: string
    startedAt: Date
  }
  
  // Sync status
  syncStatus: 'synced' | 'syncing' | 'pending' | 'error'
  lastSyncTime?: Date
}

// Mock data - in real app, this would come from WebSocket
const mockTreatmentSessions: TreatmentSession[] = [
  {
    id: '1',
    patientId: 'P1',
    patientName: 'Sarah Johnson',
    providerId: 'PR1',
    providerName: 'Dr. Smith',
    roomNumber: 'Room 1',
    appointmentTime: '2:00 PM',
    status: 'treating',
    startTime: new Date(Date.now() - 15 * 60000),
    documentation: {
      zones: 3,
      photos: 2,
      products: 1,
      notes: true
    },
    currentActivity: {
      type: 'injection',
      detail: 'Forehead - 20 units',
      startedAt: new Date()
    },
    syncStatus: 'synced',
    lastSyncTime: new Date()
  },
  {
    id: '2',
    patientId: 'P2',
    patientName: 'Michael Chen',
    providerId: 'PR2',
    providerName: 'Nurse Jessica',
    roomNumber: 'Room 2',
    appointmentTime: '2:00 PM',
    status: 'photos-after',
    startTime: new Date(Date.now() - 25 * 60000),
    documentation: {
      zones: 5,
      photos: 3,
      products: 2,
      notes: true
    },
    currentActivity: {
      type: 'photo',
      detail: 'After photos - Right angle',
      startedAt: new Date()
    },
    syncStatus: 'syncing',
    lastSyncTime: new Date()
  },
  {
    id: '3',
    patientId: 'P3',
    patientName: 'Emma Wilson',
    providerId: 'PR3',
    providerName: 'Dr. Jones',
    roomNumber: 'Room 3',
    appointmentTime: '2:15 PM',
    status: 'ready-payment',
    startTime: new Date(Date.now() - 35 * 60000),
    documentation: {
      zones: 8,
      photos: 6,
      products: 3,
      notes: true
    },
    syncStatus: 'synced',
    lastSyncTime: new Date()
  }
]

// Mock provider data
const mockProviders: ProviderActivity[] = [
  {
    providerId: 'PR1',
    providerName: 'Dr. Smith',
    currentRoom: 'Room 1',
    currentPatient: 'Sarah Johnson',
    status: 'with-patient',
    activeMinutes: 245,
    patientsSeenToday: 7,
    lastActivityTime: new Date(),
    connectionStatus: 'connected'
  },
  {
    providerId: 'PR2',
    providerName: 'Nurse Jessica',
    currentRoom: 'Room 2',
    currentPatient: 'Michael Chen',
    status: 'documenting',
    activeMinutes: 180,
    patientsSeenToday: 5,
    lastActivityTime: new Date(),
    connectionStatus: 'connected'
  },
  {
    providerId: 'PR3',
    providerName: 'Dr. Jones',
    currentRoom: null,
    currentPatient: null,
    status: 'available',
    activeMinutes: 320,
    patientsSeenToday: 9,
    lastActivityTime: new Date(),
    connectionStatus: 'connected'
  }
]

export function EnhancedTreatmentStatus() {
  const [sessions, setSessions] = useState<TreatmentSession[]>(mockTreatmentSessions)
  const [providers, setProviders] = useState<ProviderActivity[]>(mockProviders)
  const [selectedSession, setSelectedSession] = useState<TreatmentSession | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setSessions(prev => prev.map(session => {
        // Simulate progress
        if (session.status === 'documenting' && Math.random() > 0.7) {
          return {
            ...session,
            documentation: {
              ...session.documentation!,
              zones: session.documentation!.zones + 1
            },
            lastSyncTime: new Date()
          }
        }
        if (session.status === 'treating' && Math.random() > 0.8) {
          return {
            ...session,
            status: 'photos-after',
            currentActivity: {
              type: 'photo',
              detail: 'Capturing after photos',
              startedAt: new Date()
            }
          }
        }
        return session
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const getStatusColor = (status: TreatmentStatus) => {
    switch (status) {
      case 'waiting': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'in-room': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'preparing': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'documenting': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'photos-before':
      case 'photos-after': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'treating': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'reviewing': return 'bg-pink-100 text-pink-700 border-pink-200'
      case 'ready-payment': return 'bg-green-100 text-green-700 border-green-200'
      case 'processing': return 'bg-teal-100 text-teal-700 border-teal-200'
      case 'complete': return 'bg-gray-100 text-gray-600 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: TreatmentStatus) => {
    switch (status) {
      case 'waiting': return <Clock className="w-4 h-4" />
      case 'in-room': return <User className="w-4 h-4" />
      case 'preparing': return <Activity className="w-4 h-4" />
      case 'documenting': return <FileText className="w-4 h-4" />
      case 'photos-before':
      case 'photos-after': return <Camera className="w-4 h-4" />
      case 'treating': return <Syringe className="w-4 h-4" />
      case 'reviewing': return <Eye className="w-4 h-4" />
      case 'ready-payment': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin" />
      case 'complete': return <CheckCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const formatStatusText = (status: TreatmentStatus) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getProviderStatusColor = (status: ProviderActivity['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'with-patient': return 'bg-blue-500'
      case 'documenting': return 'bg-purple-500'
      case 'break': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Provider Activity Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Provider Activity</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              {autoRefresh ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Paused</span>
                </>
              )}
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {autoRefresh ? (
                <PauseCircle className="w-4 h-4 text-gray-600" />
              ) : (
                <PlayCircle className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map(provider => (
            <div key={provider.providerId} className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getProviderStatusColor(provider.status)}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{provider.providerName}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {provider.currentRoom && (
                    <>
                      <MapPin className="w-3 h-3" />
                      <span>{provider.currentRoom}</span>
                    </>
                  )}
                  {provider.currentPatient && (
                    <>
                      <span>•</span>
                      <span className="truncate">{provider.currentPatient}</span>
                    </>
                  )}
                  {!provider.currentRoom && (
                    <span className="text-green-600">Available</span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs">
                <p className="font-medium text-gray-900">{provider.patientsSeenToday}</p>
                <p className="text-gray-500">patients</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Treatment Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map(session => (
          <div
            key={session.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedSession(session)}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{session.appointmentTime}</p>
                    {session.startTime && (
                      <span className="text-xs text-gray-400">
                        • {Math.floor((Date.now() - session.startTime.getTime()) / 60000)} min
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <p className="font-medium text-gray-900 text-sm">{session.roomNumber}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)} flex items-center gap-1`}>
                  {getStatusIcon(session.status)}
                  <span>{formatStatusText(session.status)}</span>
                </div>
              </div>
            </div>

            {/* Patient & Provider */}
            <div className="px-4 py-3">
              <p className="font-medium text-gray-900">{session.patientName}</p>
              <p className="text-sm text-gray-600 mt-1">{session.providerName}</p>
            </div>

            {/* Documentation Progress */}
            {session.documentation && (
              <div className="px-4 py-3 bg-gray-50">
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MapPin className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="font-medium text-gray-900">{session.documentation.zones}</p>
                    <p className="text-gray-500">zones</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Image className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="font-medium text-gray-900">{session.documentation.photos}</p>
                    <p className="text-gray-500">photos</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Package className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="font-medium text-gray-900">{session.documentation.products}</p>
                    <p className="text-gray-500">products</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      {session.documentation.notes ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className="font-medium text-gray-900">Notes</p>
                    <p className="text-gray-500">{session.documentation.notes ? 'Done' : 'Pending'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Current Activity */}
            {session.currentActivity && (
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-xs text-gray-600">
                      {session.currentActivity.type === 'injection' && 'Injecting'}
                      {session.currentActivity.type === 'photo' && 'Taking Photos'}
                      {session.currentActivity.type === 'notes' && 'Writing Notes'}
                      {session.currentActivity.type === 'review' && 'Reviewing'}
                    </p>
                  </div>
                  {session.currentActivity.detail && (
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                      {session.currentActivity.detail}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Sync Status */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {session.syncStatus === 'synced' && (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Synced</span>
                    </>
                  )}
                  {session.syncStatus === 'syncing' && (
                    <>
                      <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                      <span className="text-blue-600">Syncing...</span>
                    </>
                  )}
                  {session.syncStatus === 'pending' && (
                    <>
                      <Clock className="w-3 h-3 text-yellow-500" />
                      <span className="text-yellow-600">Pending</span>
                    </>
                  )}
                  {session.syncStatus === 'error' && (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-red-600">Error</span>
                    </>
                  )}
                </div>
                {session.lastSyncTime && (
                  <span className="text-gray-500">
                    {new Date(session.lastSyncTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            {session.status === 'ready-payment' && (
              <div className="px-4 py-3 border-t border-gray-100">
                <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Process Payment
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Waiting Patients */}
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center">
          <Clock className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-600">2 patients waiting</p>
          <p className="text-xs text-gray-500 mt-1">Average wait: 12 min</p>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Treatment Session Details
                </h3>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Patient</p>
                  <p className="font-medium">{selectedSession.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Provider</p>
                  <p className="font-medium">{selectedSession.providerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room</p>
                  <p className="font-medium">{selectedSession.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedSession.status)}`}>
                    {getStatusIcon(selectedSession.status)}
                    <span>{formatStatusText(selectedSession.status)}</span>
                  </div>
                </div>
              </div>
              
              {selectedSession.documentation && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Documentation Progress</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Injection Zones</span>
                      <span className="font-medium">{selectedSession.documentation.zones}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Photos Captured</span>
                      <span className="font-medium">{selectedSession.documentation.photos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Products Used</span>
                      <span className="font-medium">{selectedSession.documentation.products}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Clinical Notes</span>
                      <span className="font-medium">{selectedSession.documentation.notes ? 'Complete' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedSession.status === 'ready-payment' && (
                <button className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700">
                  Proceed to Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}