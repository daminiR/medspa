'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  DollarSign,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  FileText,
  CreditCard,
  Package,
  Printer,
  Mail,
  MoreVertical,
  Phone,
  MapPin,
  Activity,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  Camera,
  Tablet
} from 'lucide-react'

interface Appointment {
  id: string
  time: string
  patientName: string
  patientPhone: string
  service: string
  provider: string
  duration: number // minutes
  status: 'scheduled' | 'checked-in' | 'in-room' | 'in-progress' | 'documenting' | 'completed' | 'ready-to-pay'
  amount: number
  room?: string
  notes?: string
  products?: { name: string; units: number; amount: number }[]
  providerActivity?: string // What provider is doing on iPad
  documentedItems?: number
  photos?: number
  actualStartTime?: Date
  progress?: number // 0-100 percentage
}

export function JaneStyleBillingView() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterProvider, setFilterProvider] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [liveSync, setLiveSync] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Initial appointments data
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      time: '9:00 AM',
      patientName: 'Sarah Johnson',
      patientPhone: '(555) 123-4567',
      service: 'Botox - Full Face',
      provider: 'Dr. Smith',
      duration: 30,
      status: 'completed',
      amount: 650,
      room: 'Room 1',
      products: [
        { name: 'Botox', units: 30, amount: 450 },
        { name: 'Numbing Cream', units: 1, amount: 50 }
      ]
    },
    {
      id: '2',
      time: '9:30 AM',
      patientName: 'Michael Chen',
      patientPhone: '(555) 234-5678',
      service: 'Consultation',
      provider: 'Dr. Smith',
      duration: 30,
      status: 'completed',
      amount: 0,
      room: 'Room 2'
    },
    {
      id: '3',
      time: '10:00 AM',
      patientName: 'Emma Wilson',
      patientPhone: '(555) 345-6789',
      service: 'Lip Filler',
      provider: 'Nurse Kim',
      duration: 45,
      status: 'ready-to-pay',
      amount: 800,
      room: 'Room 1',
      products: [
        { name: 'Juvederm', units: 1, amount: 600 }
      ],
      documentedItems: 5,
      photos: 4,
      progress: 100
    },
    {
      id: '4',
      time: '10:30 AM',
      patientName: 'Lisa Park',
      patientPhone: '(555) 456-7890',
      service: 'Chemical Peel',
      provider: 'Ashley (Esthetician)',
      duration: 60,
      status: 'documenting',
      amount: 350,
      room: 'Room 3',
      providerActivity: 'Taking after photos',
      actualStartTime: new Date(Date.now() - 45 * 60000),
      documentedItems: 3,
      photos: 2,
      progress: 85
    },
    {
      id: '5',
      time: '11:00 AM',
      patientName: 'David Wilson',
      patientPhone: '(555) 567-8901',
      service: 'Microneedling',
      provider: 'Dr. Park',
      duration: 45,
      status: 'in-progress',
      amount: 450,
      room: 'Room 2',
      providerActivity: 'Applying numbing cream',
      actualStartTime: new Date(Date.now() - 20 * 60000),
      progress: 40
    },
    {
      id: '6',
      time: '11:30 AM',
      patientName: 'Jennifer Wu',
      patientPhone: '(555) 678-9012',
      service: 'Dysport',
      provider: 'Dr. Smith',
      duration: 30,
      status: 'checked-in',
      amount: 550,
      notes: 'First time patient - needs consult first'
    },
    {
      id: '7',
      time: '2:00 PM',
      patientName: 'Robert Taylor',
      patientPhone: '(555) 789-0123',
      service: 'PRP Facial',
      provider: 'Dr. Park',
      duration: 90,
      status: 'scheduled',
      amount: 1200
    },
    {
      id: '8',
      time: '3:30 PM',
      patientName: 'Maria Garcia',
      patientPhone: '(555) 890-1234',
      service: 'Laser Hair Removal',
      provider: 'Nurse Kim',
      duration: 60,
      status: 'scheduled',
      amount: 400
    }
  ])

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Simulate live updates from provider iPads
  useEffect(() => {
    if (!liveSync) return

    const interval = setInterval(() => {
      setAppointments(prev => prev.map(apt => {
        // Simulate progression of in-progress appointments
        if (apt.status === 'in-progress' && apt.progress !== undefined) {
          const newProgress = Math.min(100, apt.progress + 10)
          if (newProgress >= 80) {
            return { 
              ...apt, 
              status: 'documenting',
              progress: newProgress,
              providerActivity: 'Documenting treatment on iPad',
              documentedItems: Math.floor(Math.random() * 5) + 1,
              photos: Math.floor(Math.random() * 3) + 1
            }
          }
          return { ...apt, progress: newProgress }
        }
        
        // Simulate documenting completion
        if (apt.status === 'documenting' && apt.progress !== undefined) {
          const newProgress = Math.min(100, apt.progress + 5)
          if (newProgress === 100) {
            return { 
              ...apt, 
              status: 'ready-to-pay',
              progress: 100,
              providerActivity: 'Treatment documented'
            }
          }
          return { 
            ...apt, 
            progress: newProgress,
            documentedItems: Math.min(8, (apt.documentedItems || 0) + 1)
          }
        }
        
        return apt
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [liveSync])

  // Sort appointments by relevance (current time)
  const sortedAppointments = useMemo(() => {
    const now = currentTime
    const nowHours = now.getHours()
    const nowMinutes = now.getMinutes()
    const currentMinutes = nowHours * 60 + nowMinutes

    return [...appointments].sort((a, b) => {
      // Parse times
      const parseTime = (timeStr: string) => {
        const [time, period] = timeStr.split(' ')
        const [hours, minutes] = time.split(':').map(Number)
        const adjustedHours = period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours
        return adjustedHours * 60 + minutes
      }

      const aMinutes = parseTime(a.time)
      const bMinutes = parseTime(b.time)

      // Priority order:
      // 1. Ready to pay (always at top)
      if (a.status === 'ready-to-pay' && b.status !== 'ready-to-pay') return -1
      if (b.status === 'ready-to-pay' && a.status !== 'ready-to-pay') return 1
      
      // 2. Currently happening (in-progress, documenting)
      const aActive = ['in-progress', 'documenting', 'in-room'].includes(a.status)
      const bActive = ['in-progress', 'documenting', 'in-room'].includes(b.status)
      if (aActive && !bActive) return -1
      if (bActive && !aActive) return 1
      
      // 3. Checked in patients
      if (a.status === 'checked-in' && b.status !== 'checked-in') return -1
      if (b.status === 'checked-in' && a.status !== 'checked-in') return 1
      
      // 4. Next upcoming within 30 minutes
      const aUpcoming = a.status === 'scheduled' && Math.abs(aMinutes - currentMinutes) < 30
      const bUpcoming = b.status === 'scheduled' && Math.abs(bMinutes - currentMinutes) < 30
      if (aUpcoming && !bUpcoming) return -1
      if (bUpcoming && !aUpcoming) return 1
      
      // 5. Sort by time
      return aMinutes - bMinutes
    })
  }, [appointments, currentTime])

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        )
      case 'checked-in':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
            <User className="w-3 h-3" />
            Checked In
          </span>
        )
      case 'in-room':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
            <User className="w-3 h-3" />
            In Room
          </span>
        )
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
            <Activity className="w-3 h-3" />
            In Progress
          </span>
        )
      case 'documenting':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full relative">
            <Tablet className="w-3 h-3" />
            Documenting
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        )
      case 'ready-to-pay':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Ready to Pay
          </span>
        )
      default:
        return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleCheckout = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowCheckout(true)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <div className="h-8 w-px bg-gray-300" />
            
            {/* Live Sync Indicator - More prominent */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              liveSync ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {liveSync ? (
                <>
                  <div className="relative">
                    <Wifi className="w-4 h-4 text-green-600" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <span className="text-sm font-medium text-green-700">Live Updates</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Paused</span>
                </>
              )}
              <button
                onClick={() => setLiveSync(!liveSync)}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                {liveSync ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
            </div>
            
            {/* Filter by Provider */}
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Providers</option>
              <option value="dr-smith">Dr. Smith</option>
              <option value="dr-park">Dr. Park</option>
              <option value="nurse-kim">Nurse Kim</option>
            </select>
            
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Printer className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Appointment List */}
      <div className="divide-y divide-gray-100">
        {sortedAppointments.map((appointment, index) => {
          const isReadyToPay = appointment.status === 'ready-to-pay'
          const isActive = ['in-progress', 'documenting', 'in-room'].includes(appointment.status)
          
          return (
          <div
            key={appointment.id}
            className={`px-6 py-4 transition-all hover:bg-gray-50 ${
              isReadyToPay 
                ? 'border-l-4 border-purple-500' 
                : isActive
                ? 'border-l-4 border-purple-300'
                : 'border-l-4 border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1">
                {/* Time */}
                <div className="w-20 text-sm font-medium text-gray-900">
                  {appointment.time}
                </div>
                
                {/* Patient Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`${isReadyToPay ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'}`}>
                      {appointment.patientName}
                    </h3>
                    {getStatusBadge(appointment.status)}
                    {appointment.room && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-600 bg-gray-100'
                      }`}>
                        {appointment.room}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-purple-600 font-medium">{appointment.service}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{appointment.provider}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{appointment.duration} min</span>
                  </div>
                  {appointment.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">{appointment.notes}</p>
                  )}
                  
                  {/* Provider Activity from iPad */}
                  {appointment.providerActivity && liveSync && (
                    <div className="flex items-center gap-2 mt-2">
                      <RefreshCw className="w-3 h-3 text-purple-500 animate-spin" />
                      <span className="text-xs text-purple-600 font-medium">
                        Provider: {appointment.providerActivity}
                      </span>
                      {appointment.documentedItems && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">
                            <FileText className="w-3 h-3 inline mr-1" />
                            {appointment.documentedItems} items
                          </span>
                        </>
                      )}
                      {appointment.photos && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">
                            <Camera className="w-3 h-3 inline mr-1" />
                            {appointment.photos} photos
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  
                </div>
                
                {/* Amount */}
                <div className="text-right">
                  {appointment.amount > 0 ? (
                    <>
                      <div className={`font-semibold ${
                        isReadyToPay 
                          ? 'text-xl text-gray-900' 
                          : 'text-lg text-gray-900'
                      }`}>
                        {formatCurrency(appointment.amount)}
                      </div>
                      {appointment.products && appointment.products.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {appointment.products.length} items
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">No charge</span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 ml-6">
                {appointment.status === 'ready-to-pay' && (
                  <button
                    onClick={() => handleCheckout(appointment)}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Checkout
                  </button>
                )}
                
                {appointment.status === 'scheduled' && (
                  <button className="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-200 transition-colors">
                    Check In
                  </button>
                )}
                
                {appointment.status === 'completed' && appointment.amount > 0 && (
                  <button
                    onClick={() => handleCheckout(appointment)}
                    className="px-4 py-2 border border-purple-300 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    Process Payment
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedAppointment(appointment)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          )
        })}
      </div>
      
      {/* Summary Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-gray-600">
              Total: <strong className="text-gray-900">{appointments.length}</strong>
            </span>
            <span className="text-gray-600">
              Checked in: <strong className="text-blue-600">{appointments.filter(a => a.status === 'checked-in').length}</strong>
            </span>
            <span className="text-gray-600">
              Active: <strong className="text-orange-600">{appointments.filter(a => ['in-progress', 'in-room', 'documenting'].includes(a.status)).length}</strong>
            </span>
            <span className="text-gray-600">
              Ready: <strong className="text-purple-600">{appointments.filter(a => a.status === 'ready-to-pay').length}</strong>
            </span>
            {liveSync && (
              <>
                <span className="text-gray-600">
                  Documenting: <strong className="text-yellow-600">{appointments.filter(a => a.status === 'documenting').length}</strong>
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">Syncing</span>
                </div>
              </>
            )}
          </div>
          <div className="text-gray-900 font-medium">
            Today's Revenue: {formatCurrency(appointments.filter(a => a.status === 'completed' || a.status === 'ready-to-pay').reduce((sum, a) => sum + a.amount, 0))}
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && !showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xl font-medium text-gray-900">{selectedAppointment.patientName}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedAppointment.patientPhone}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Service</span>
                  <span className="text-sm font-medium text-gray-900">{selectedAppointment.service}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Provider</span>
                  <span className="text-sm font-medium text-gray-900">{selectedAppointment.provider}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Time</span>
                  <span className="text-sm font-medium text-gray-900">{selectedAppointment.time} ({selectedAppointment.duration} min)</span>
                </div>
                {selectedAppointment.room && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Room</span>
                    <span className="text-sm font-medium text-gray-900">{selectedAppointment.room}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-lg font-semibold text-gray-900">{formatCurrency(selectedAppointment.amount)}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                {(selectedAppointment.status === 'ready-to-pay' || selectedAppointment.status === 'completed') && selectedAppointment.amount > 0 && (
                  <button
                    onClick={() => {
                      setSelectedAppointment(null)
                      handleCheckout(selectedAppointment)
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700"
                  >
                    Process Payment
                  </button>
                )}
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Checkout Modal */}
      {showCheckout && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Checkout</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedAppointment.patientName}</p>
              </div>
              <button
                onClick={() => {
                  setShowCheckout(false)
                  setSelectedAppointment(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Invoice Items */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Services & Products</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{selectedAppointment.service}</p>
                    <p className="text-sm text-gray-600">Provider: {selectedAppointment.provider}</p>
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(selectedAppointment.products ? selectedAppointment.amount - selectedAppointment.products.reduce((sum, p) => sum + p.amount, 0) : selectedAppointment.amount)}
                  </span>
                </div>
                
                {selectedAppointment.products?.map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center pl-4 border-l-2 border-purple-200">
                    <div>
                      <p className="text-sm text-gray-700">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.units} units</p>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{formatCurrency(product.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h4>
              <div className="grid grid-cols-3 gap-3">
                <button className="p-3 border-2 border-purple-500 bg-purple-50 rounded-lg flex flex-col items-center gap-1">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Credit Card</span>
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center gap-1">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">Cash</span>
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center gap-1">
                  <Package className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">Package</span>
                </button>
              </div>
            </div>
            
            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">Total Due</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(selectedAppointment.amount)}</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                Process Payment
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                Save & Email Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}