'use client'

import { useState } from 'react'
import { 
  Calendar,
  Clock,
  User,
  ChevronRight,
  Tablet,
  CheckCircle,
  Camera,
  FileText,
  Plus,
  Syringe,
  Activity,
  LogOut
} from 'lucide-react'

interface Appointment {
  id: string
  time: string
  patientName: string
  service: string
  duration: number
  status: 'upcoming' | 'in-progress' | 'completed'
  room?: string
}

export default function ProviderDashboard() {
  const [currentProvider] = useState({ name: 'Dr. Sarah Smith', id: 'PRV-001' })
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  
  // Mock appointments for today
  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      time: '9:00 AM',
      patientName: 'Jennifer Martinez',
      service: 'Botox Consultation',
      duration: 45,
      status: 'completed'
    },
    {
      id: '2',
      time: '10:00 AM',
      patientName: 'Michael Chen',
      service: 'Lip Filler',
      duration: 60,
      status: 'completed'
    },
    {
      id: '3',
      time: '11:30 AM',
      patientName: 'Sarah Johnson',
      service: 'Full Face Rejuvenation',
      duration: 90,
      status: 'completed'
    },
    {
      id: '4',
      time: '2:00 PM',
      patientName: 'Emma Wilson',
      service: 'Dysport - Forehead & Crow\'s Feet',
      duration: 45,
      status: 'in-progress',
      room: 'Room 2'
    },
    {
      id: '5',
      time: '3:00 PM',
      patientName: 'David Park',
      service: 'Cheek Filler Consultation',
      duration: 30,
      status: 'upcoming'
    },
    {
      id: '6',
      time: '3:30 PM',
      patientName: 'Lisa Thompson',
      service: 'Botox Touch-up',
      duration: 30,
      status: 'upcoming'
    }
  ])
  
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'upcoming':
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />
      case 'in-progress':
        return <Activity className="w-5 h-5" />
      case 'upcoming':
        return <Clock className="w-5 h-5" />
    }
  }
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header - Optimized for iPad */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Tablet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{currentProvider.name}</h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h2>
          
          {/* Appointment Grid - Touch Optimized */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => (
              <button
                key={appointment.id}
                onClick={() => setSelectedAppointment(appointment)}
                className={`p-6 rounded-xl border-2 text-left transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                  appointment.status === 'in-progress' 
                    ? 'border-blue-300 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                {/* Time & Status */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-lg font-semibold text-gray-900">{appointment.time}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1.5 ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    <span className="capitalize">{appointment.status.replace('-', ' ')}</span>
                  </div>
                </div>
                
                {/* Patient Info */}
                <div className="space-y-2">
                  <p className="text-xl font-medium text-gray-900">{appointment.patientName}</p>
                  <p className="text-gray-600">{appointment.service}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{appointment.duration} min</span>
                    {appointment.room && (
                      <span className="font-medium text-blue-600">{appointment.room}</span>
                    )}
                  </div>
                </div>
                
                {/* Action Button */}
                {appointment.status === 'upcoming' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-purple-600 font-medium">
                      <span>Start Treatment</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                )}
                
                {appointment.status === 'in-progress' && (
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <div className="flex items-center justify-between text-blue-600 font-medium">
                      <span>Continue Documenting</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                )}
                
                {appointment.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <FileText className="w-4 h-4" />
                        Documented
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Camera className="w-4 h-4" />
                        2 Photos
                      </span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Quick Actions - Big Touch Targets */}
          <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group">
                <Syringe className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">New Injectable</p>
              </button>
              <button className="p-6 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors group">
                <Camera className="w-8 h-8 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">Take Photo</p>
              </button>
              <button className="p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group">
                <FileText className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">View Charts</p>
              </button>
              <button className="p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group">
                <Plus className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-gray-900">Add Note</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}