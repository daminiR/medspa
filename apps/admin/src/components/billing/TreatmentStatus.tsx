'use client'

import { useState, useEffect } from 'react'
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Tablet,
  User,
  Calendar,
  Activity,
  Camera,
  FileText,
  DollarSign,
  RefreshCw
} from 'lucide-react'

interface Treatment {
  id: string
  patientName: string
  patientId?: string
  providerName: string
  appointmentTime: string
  service: string
  status: 'waiting' | 'in-room' | 'documenting' | 'documented' | 'checked-out'
  room?: string
  startTime?: string
  documentedItems?: number
  photos?: number
  estimatedCost?: number
}

interface TreatmentStatusProps {
  onProcessPayment?: (treatment: Treatment) => void
}

export function TreatmentStatus({ onProcessPayment }: TreatmentStatusProps = {}) {
  // Mock data showing MULTIPLE concurrent treatments (realistic spa scenario)
  const [treatments, setTreatments] = useState<Treatment[]>([
    // Room 1 - Dr. Smith's patients
    {
      id: '1',
      patientName: 'Sarah Johnson',
      patientId: 'patient-1',
      providerName: 'Dr. Smith',
      appointmentTime: '2:00 PM',
      service: 'Botox - Full Face',
      status: 'documenting',
      room: 'Room 1',
      startTime: '2:05 PM',
      documentedItems: 3,
      photos: 2,
      estimatedCost: 600
    },
    // Room 2 - Nurse Jessica's patients
    {
      id: '2', 
      patientName: 'Michael Chen',
      providerName: 'Nurse Jessica',
      appointmentTime: '2:00 PM',
      service: 'Lip Filler',
      status: 'in-room',
      room: 'Room 2',
      startTime: '2:10 PM'
    },
    // Room 3 - Dr. Jones's patients
    {
      id: '3',
      patientName: 'Emma Wilson',
      patientId: 'patient-3',
      providerName: 'Dr. Jones',
      appointmentTime: '2:15 PM', 
      service: 'Microneedling + Botox',
      status: 'documented',
      room: 'Room 3',
      documentedItems: 5,
      photos: 4,
      estimatedCost: 850
    },
    // Room 4 - Nurse Ashley's patients
    {
      id: '4',
      patientName: 'Lisa Martinez',
      providerName: 'Nurse Ashley',
      appointmentTime: '2:00 PM',
      service: 'Chemical Peel',
      status: 'in-room',
      room: 'Room 4',
      startTime: '2:00 PM'
    },
    // Waiting area
    {
      id: '5',
      patientName: 'David Park',
      providerName: 'Dr. Smith',
      appointmentTime: '2:30 PM',
      service: 'Dysport',
      status: 'waiting'
    },
    {
      id: '6',
      patientName: 'Jennifer Wu',
      providerName: 'Nurse Jessica',
      appointmentTime: '2:30 PM',
      service: 'Cheek Filler',
      status: 'waiting'
    },
    // Just checked out
    {
      id: '7',
      patientName: 'Robert Taylor',
      providerName: 'Dr. Jones',
      appointmentTime: '1:30 PM',
      service: 'Botox Touch-up',
      status: 'checked-out',
      documentedItems: 2,
      photos: 2
    }
  ])
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTreatments(prev => {
        const updated = [...prev]
        // Simulate status changes
        const inRoom = updated.find(t => t.status === 'in-room')
        if (inRoom && Math.random() > 0.7) {
          inRoom.status = 'documenting'
          inRoom.documentedItems = Math.floor(Math.random() * 5) + 1
        }
        return updated
      })
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])
  
  const getStatusColor = (status: Treatment['status']) => {
    switch (status) {
      case 'waiting':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'in-room':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'documenting':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'documented':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'checked-out':
        return 'bg-gray-50 text-gray-500 border-gray-100'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  const getStatusIcon = (status: Treatment['status']) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-4 h-4" />
      case 'in-room':
        return <User className="w-4 h-4" />
      case 'documenting':
        return <Tablet className="w-4 h-4" />
      case 'documented':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Live Treatment Status</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time updates from provider tablets</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Live sync
            </span>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {treatments.map((treatment) => (
          <div key={treatment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Time */}
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{treatment.appointmentTime}</p>
                  {treatment.room && (
                    <p className="text-xs text-gray-500">{treatment.room}</p>
                  )}
                </div>
                
                {/* Patient & Provider */}
                <div>
                  <p className="font-medium text-gray-900">{treatment.patientName}</p>
                  <p className="text-sm text-gray-600">{treatment.service}</p>
                  <p className="text-xs text-gray-500">{treatment.providerName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Documentation Progress */}
                {treatment.status === 'documenting' && (
                  <div className="flex items-center gap-3 text-sm">
                    {treatment.documentedItems && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <FileText className="w-4 h-4" />
                        {treatment.documentedItems} items
                      </span>
                    )}
                    {treatment.photos && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <Camera className="w-4 h-4" />
                        {treatment.photos} photos
                      </span>
                    )}
                  </div>
                )}
                
                {/* Status Badge */}
                <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium border ${getStatusColor(treatment.status)}`}>
                  {getStatusIcon(treatment.status)}
                  <span className="capitalize">{treatment.status.replace('-', ' ')}</span>
                </div>
                
                {/* Action Buttons */}
                {treatment.status === 'documented' && (
                  <button 
                    onClick={() => onProcessPayment?.(treatment)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Process Payment
                  </button>
                )}
              </div>
            </div>
            
            {/* Progress Bar for Documenting */}
            {treatment.status === 'documenting' && (
              <div className="mt-3">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">Provider is documenting treatment on tablet...</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-6 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            Waiting
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            In Room
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            Documenting
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            Ready for Payment
          </span>
        </div>
      </div>
    </div>
  )
}