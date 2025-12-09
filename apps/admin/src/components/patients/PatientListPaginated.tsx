'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import debounce from 'lodash.debounce'
import { 
  Search, 
  Plus, 
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle, 
  Phone, 
  Mail,
  Calendar,
  DollarSign,
  User,
  Loader2
} from 'lucide-react'
import { PatientListItem, PatientStatus } from '@/types/patient'
import { format } from 'date-fns'

interface PatientListPaginatedProps {
  loadPatients: (page: number, pageSize: number, query: string, filters: any) => Promise<{
    results: PatientListItem[]
    total: number
    pages: number
  }>
  onPatientSelect?: (patient: PatientListItem) => void
  onNewPatient?: () => void
}

export default function PatientListPaginated({ 
  loadPatients,
  onPatientSelect,
  onNewPatient 
}: PatientListPaginatedProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<PatientStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'balance'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [patients, setPatients] = useState<PatientListItem[]>([])
  const [totalPatients, setTotalPatients] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      setDebouncedQuery(query)
      setCurrentPage(1) // Reset to first page on new search
    }, 300),
    []
  )
  
  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchQuery, debouncedSearch])
  
  // Load data when filters change
  useEffect(() => {
    loadData()
  }, [currentPage, pageSize, debouncedQuery, filterStatus, sortBy, sortOrder])
  
  const loadData = async () => {
    setIsLoading(true)
    try {
      const filters = {
        status: filterStatus,
        sortBy,
        sortOrder
      }
      
      const result = await loadPatients(currentPage, pageSize, debouncedQuery, filters)
      setPatients(result.results)
      setTotalPatients(result.total)
      setTotalPages(result.pages)
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
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

  // Calculate page range to show
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 7
    const halfRange = Math.floor(maxPagesToShow / 2)
    
    let startPage = Math.max(currentPage - halfRange, 1)
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages)
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(endPage - maxPagesToShow + 1, 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading patients...
                </span>
              ) : (
                `${totalPatients.toLocaleString()} total patients`
              )}
            </p>
          </div>
          
          <button
            onClick={onNewPatient}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Patient
          </button>
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
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as PatientStatus | 'all')
              setCurrentPage(1)
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deceased">Deceased</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as 'name' | 'lastVisit' | 'balance')
              setCurrentPage(1)
            }}
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

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-500">Loading patients...</p>
              </div>
            </div>
          ) : patients.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No patients found</h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Try adjusting your search or filters'
                    : 'Click "New Patient" to add your first patient'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => onPatientSelect?.(patient)}
                  className="bg-white p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-200 group"
                >
                <div className="flex items-start justify-between">
                  {/* Left Section - Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {patient.lastName}, {patient.firstName}
                        {patient.preferredName && (
                          <span className="text-gray-500 font-normal ml-1">
                            ({patient.preferredName})
                          </span>
                        )}
                      </h3>
                      {patient.hasAlerts && (
                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={`px-1.5 py-0.5 text-xs rounded font-medium ${getStatusBadge(patient.status)}`}>
                        {patient.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        #{patient.patientNumber}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{patient.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Visit & Financial Info */}
                  <div className="flex items-center gap-8 text-xs">
                    <div className="text-gray-600">
                      <span className="text-gray-500">Last Visit: </span>
                      <span className="font-medium">
                        {patient.lastVisit 
                          ? format(new Date(patient.lastVisit), 'MM/dd/yy')
                          : 'Never'
                        }
                      </span>
                    </div>
                    
                    {patient.upcomingAppointment && (
                      <div className="text-purple-600 font-medium">
                        Next: {format(new Date(patient.upcomingAppointment), 'MM/dd')}
                      </div>
                    )}
                    
                    {patient.balance > 0 && (
                      <div className="text-red-600 font-medium">
                        ${patient.balance.toFixed(2)}
                      </div>
                    )}
                    
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="bg-white border-t px-6 py-4">
          <div className="flex items-center justify-center gap-8">
            {/* Results count */}
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalPatients)}</span> of <span className="font-medium">{totalPatients.toLocaleString()}</span> patients
            </div>
            
            {/* Pagination controls */}
            <div className="flex items-center gap-1">
              {/* First page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              
              {/* Previous page */}
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1 mx-2">
                {currentPage > 4 && totalPages > 7 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      1
                    </button>
                    <span className="px-2 text-gray-400">•••</span>
                  </>
                )}
                
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                {currentPage < totalPages - 3 && totalPages > 7 && (
                  <>
                    <span className="px-2 text-gray-400">•••</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              {/* Next page */}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {/* Last page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}