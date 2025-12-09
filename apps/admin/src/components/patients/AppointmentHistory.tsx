'use client'

import { useState } from 'react'
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  Search,
  Plus,
  Video,
  Phone,
  MessageSquare,
  FileText,
  Loader2
} from 'lucide-react'
import { format, isPast, isFuture, isToday } from 'date-fns'

interface Appointment {
  id: string
  date: string
  time: string
  duration: number
  service: string
  practitioner: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  type: 'in-person' | 'virtual'
  room?: string
  price: number
  paid: boolean
  notes?: string
}

interface AppointmentHistoryProps {
  patientId: string
}

// Mock data generator
const generateMockAppointments = (): Appointment[] => {
  const services = [
    'Botox Treatment', 'Dermal Fillers', 'Chemical Peel', 'Microneedling',
    'Laser Hair Removal', 'HydraFacial', 'Consultation', 'Follow-up',
    'IPL Photofacial', 'PRP Treatment', 'CoolSculpting', 'Skin Tightening'
  ]
  
  const practitioners = [
    'Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Emily Davis',
    'RN Jessica Martinez', 'PA Robert Wilson'
  ]
  
  const appointments: Appointment[] = []
  const today = new Date()
  
  // Generate past appointments
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 365) + 30
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)
    
    appointments.push({
      id: `apt-${i}`,
      date: date.toISOString(),
      time: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`,
      duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
      service: services[Math.floor(Math.random() * services.length)],
      practitioner: practitioners[Math.floor(Math.random() * practitioners.length)],
      status: Math.random() > 0.1 ? 'completed' : 'no-show',
      type: Math.random() > 0.9 ? 'virtual' : 'in-person',
      room: `Room ${Math.floor(Math.random() * 6) + 1}`,
      price: Math.floor(Math.random() * 500) + 100,
      paid: Math.random() > 0.2,
      notes: Math.random() > 0.7 ? 'Patient was very satisfied with results' : undefined
    })
  }
  
  // Generate upcoming appointments
  for (let i = 0; i < 3; i++) {
    const daysAhead = Math.floor(Math.random() * 60) + 1
    const date = new Date(today)
    date.setDate(date.getDate() + daysAhead)
    
    appointments.push({
      id: `apt-future-${i}`,
      date: date.toISOString(),
      time: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`,
      duration: [30, 45, 60][Math.floor(Math.random() * 3)],
      service: services[Math.floor(Math.random() * services.length)],
      practitioner: practitioners[Math.floor(Math.random() * practitioners.length)],
      status: Math.random() > 0.3 ? 'confirmed' : 'scheduled',
      type: Math.random() > 0.9 ? 'virtual' : 'in-person',
      room: `Room ${Math.floor(Math.random() * 6) + 1}`,
      price: Math.floor(Math.random() * 500) + 100,
      paid: false
    })
  }
  
  // Sort by date
  return appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function AppointmentHistory({ patientId }: AppointmentHistoryProps) {
  const [appointments] = useState<Appointment[]>(generateMockAppointments())
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  
  const filteredAppointments = appointments.filter(apt => {
    const date = new Date(apt.date)
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'upcoming' && isFuture(date)) ||
      (filter === 'past' && isPast(date))
    
    const matchesSearch = 
      apt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.practitioner.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })
  
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  
  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'confirmed': return CheckCircle
      case 'scheduled': return Clock
      case 'cancelled': return XCircle
      case 'no-show': return AlertCircle
      default: return Clock
    }
  }
  
  const upcomingAppointments = appointments.filter(apt => isFuture(new Date(apt.date)))
  const totalSpent = appointments
    .filter(apt => apt.status === 'completed' && apt.paid)
    .reduce((sum, apt) => sum + apt.price, 0)
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => apt.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {['all', 'upcoming', 'past'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption as typeof filter)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    filter === filterOption
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="h-4 w-4" />
            Book Appointment
          </button>
        </div>
      </div>
      
      {/* Appointment List */}
      <div className="space-y-3">
        {filteredAppointments.map((appointment) => {
          const date = new Date(appointment.date)
          const isPastAppointment = isPast(date)
          const StatusIcon = getStatusIcon(appointment.status)
          
          return (
            <div
              key={appointment.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedAppointment(appointment)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {/* Date Block */}
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center ${
                        isToday(date) ? 'bg-purple-100' : isPastAppointment ? 'bg-gray-100' : 'bg-blue-100'
                      }`}>
                        <span className="text-xs font-medium text-gray-600">
                          {format(date, 'MMM')}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {format(date, 'd')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(date, 'EEE')}
                      </p>
                    </div>
                    
                    {/* Appointment Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.service}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {appointment.time} ({appointment.duration} min)
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {appointment.practitioner}
                            </span>
                            {appointment.type === 'virtual' ? (
                              <span className="flex items-center gap-1">
                                <Video className="h-3.5 w-3.5" />
                                Virtual
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {appointment.room}
                              </span>
                            )}
                          </div>
                          
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              "{appointment.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status and Price */}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {appointment.status}
                    </span>
                    
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">${appointment.price}</p>
                      {appointment.paid ? (
                        <p className="text-xs text-green-600">Paid</p>
                      ) : isPastAppointment ? (
                        <p className="text-xs text-red-600">Unpaid</p>
                      ) : (
                        <p className="text-xs text-gray-500">Pending</p>
                      )}
                    </div>
                    
                    {!isPastAppointment && (
                      <div className="flex items-center gap-1 mt-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Phone className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <MessageSquare className="h-4 w-4 text-gray-600" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No appointments found</p>
        </div>
      )}
    </div>
  )
}