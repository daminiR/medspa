'use client'

import React, { useState, useMemo } from 'react'
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronRight, 
  AlertCircle, 
  Phone, 
  Mail,
  Calendar,
  DollarSign,
  User,
  MoreVertical,
  Download,
  Upload
} from 'lucide-react'
import { PatientListItem, PatientStatus } from '@/types/patient'
import { format } from 'date-fns'

interface PatientListProps {
  patients: PatientListItem[]
  onPatientSelect?: (patient: PatientListItem) => void
  onNewPatient?: () => void
}

export default function PatientList({ 
  patients, 
  onPatientSelect,
  onNewPatient 
}: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<PatientStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'balance'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filter and sort patients
  const filteredPatients = useMemo(() => {
    let filtered = patients

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(patient => 
        patient.firstName.toLowerCase().includes(query) ||
        patient.lastName.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phone.includes(searchQuery) ||
        patient.patientNumber.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(patient => patient.status === filterStatus)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
          break
        case 'lastVisit':
          const dateA = a.lastVisit ? new Date(a.lastVisit).getTime() : 0
          const dateB = b.lastVisit ? new Date(b.lastVisit).getTime() : 0
          comparison = dateB - dateA
          break
        case 'balance':
          comparison = b.balance - a.balance
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [patients, searchQuery, filterStatus, sortBy, sortOrder])

  // Get status badge style
  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-600'
      case 'deceased':
        return 'bg-gray-200 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // Format phone number
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPatients.length} of {patients.length} patients
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Upload className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={onNewPatient}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Patient
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or patient number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PatientStatus | 'all')}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deceased">Deceased</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'lastVisit' | 'balance')}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="name">Sort by Name</option>
            <option value="lastVisit">Sort by Last Visit</option>
            <option value="balance">Sort by Balance</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No patients found</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Click "New Patient" to add your first patient'
                }
              </p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => onPatientSelect?.(patient)}
                className="bg-white rounded-lg p-4 hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-purple-300"
              >
                <div className="flex items-start justify-between">
                  {/* Left Section - Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {patient.lastName}, {patient.firstName}
                          {patient.preferredName && (
                            <span className="text-gray-500 font-normal ml-1">
                              ({patient.preferredName})
                            </span>
                          )}
                        </h3>
                        {patient.hasAlerts && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(patient.status)}`}>
                        {patient.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        #{patient.patientNumber}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{patient.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Visit & Financial Info */}
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Last Visit</p>
                      <p className="font-medium text-gray-900">
                        {patient.lastVisit 
                          ? format(new Date(patient.lastVisit), 'MMM d, yyyy')
                          : 'Never'
                        }
                      </p>
                    </div>
                    
                    {patient.upcomingAppointment && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Next Appointment</p>
                        <p className="font-medium text-purple-600 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(patient.upcomingAppointment), 'MMM d')}
                        </p>
                      </div>
                    )}
                    
                    {patient.balance > 0 && (
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Balance</p>
                        <p className="font-medium text-red-600 flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          {patient.balance.toFixed(2)}
                        </p>
                      </div>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle menu actions
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                    
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-white border-t px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-gray-600">
              Active: <strong className="text-green-600">{patients.filter(p => p.status === 'active').length}</strong>
            </span>
            <span className="text-gray-600">
              With Alerts: <strong className="text-red-600">{patients.filter(p => p.hasAlerts).length}</strong>
            </span>
            <span className="text-gray-600">
              Outstanding Balance: <strong className="text-orange-600">
                ${patients.reduce((sum, p) => sum + p.balance, 0).toFixed(2)}
              </strong>
            </span>
          </div>
          <span className="text-gray-500">
            Last updated: {format(new Date(), 'h:mm a')}
          </span>
        </div>
      </div>
    </div>
  )
}