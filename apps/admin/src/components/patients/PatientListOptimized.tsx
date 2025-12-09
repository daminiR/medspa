'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import debounce from 'lodash.debounce'
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
  Upload,
  Loader2
} from 'lucide-react'
import { PatientListItem, PatientStatus } from '@/types/patient'
import { format } from 'date-fns'

interface PatientListOptimizedProps {
  // Instead of loading all patients, we use callbacks for data fetching
  loadPatients: (page: number, pageSize: number, query: string, filters: any) => Promise<{
    results: PatientListItem[]
    total: number
    pages: number
  }>
  onPatientSelect?: (patient: PatientListItem) => void
  onNewPatient?: () => void
}

export default function PatientListOptimized({ 
  loadPatients,
  onPatientSelect,
  onNewPatient 
}: PatientListOptimizedProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<PatientStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'balance'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Data management
  const [patients, setPatients] = useState<PatientListItem[]>([])
  const [totalPatients, setTotalPatients] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  
  const PAGE_SIZE = 50
  const listRef = useRef<List>(null)
  const infiniteLoaderRef = useRef<InfiniteLoader>(null)
  
  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      setDebouncedQuery(query)
      setCurrentPage(1) // Reset to first page on new search
      // Don't clear patients immediately - let loadInitialData handle it
    }, 300),
    []
  )
  
  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchQuery, debouncedSearch])
  
  // Load initial data - include a mounting check
  const isMountedRef = useRef(false)
  
  useEffect(() => {
    // Track if this is the initial mount
    if (!isMountedRef.current) {
      isMountedRef.current = true
    }
    
    loadInitialData()
  }, [debouncedQuery, filterStatus, sortBy, sortOrder])
  
  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      const filters = {
        status: filterStatus,
        sortBy,
        sortOrder
      }
      
      const result = await loadPatients(1, PAGE_SIZE, debouncedQuery, filters)
      setPatients(result.results)
      setTotalPatients(result.total)
      setHasMore(result.results.length < result.total)
      setCurrentPage(1)
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Load more data for infinite scroll
  const loadMoreItems = async (startIndex: number, stopIndex: number) => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    const nextPage = Math.floor(startIndex / PAGE_SIZE) + 1
    
    try {
      const filters = {
        status: filterStatus,
        sortBy,
        sortOrder
      }
      
      const result = await loadPatients(nextPage, PAGE_SIZE, debouncedQuery, filters)
      
      setPatients(prev => [...prev, ...result.results])
      setCurrentPage(nextPage)
      setHasMore((nextPage * PAGE_SIZE) < result.total)
    } catch (error) {
      console.error('Error loading more patients:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }
  
  // Check if item is loaded
  const isItemLoaded = (index: number) => {
    return index < patients.length
  }
  
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
  
  // Row renderer for virtual list
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const patient = patients[index]
    
    if (!patient) {
      return (
        <div style={style} className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )
    }
    
    return (
      <div style={style} className="px-4">
        <div
          onClick={() => onPatientSelect?.(patient)}
          className="bg-white rounded-lg p-4 hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-purple-300 mb-2"
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
                  <span className="truncate max-w-xs">{patient.email}</span>
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
      </div>
    )
  }
  
  // Calculate list height
  const [listHeight, setListHeight] = useState(600)
  
  useEffect(() => {
    const updateHeight = () => {
      // Calculate available height (window height minus header and footer)
      const height = window.innerHeight - 300 // Adjust based on your layout
      setListHeight(Math.max(400, height))
    }
    
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

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
          
          <div className="flex items-center gap-3">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Import patients"
            >
              <Upload className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export patients"
            >
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

      {/* Virtual List */}
      <div className="flex-1 overflow-hidden">
        {isLoading && patients.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading patients...</p>
            </div>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex items-center justify-center h-full">
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
          <InfiniteLoader
            ref={infiniteLoaderRef}
            isItemLoaded={isItemLoaded}
            itemCount={hasMore ? patients.length + 1 : patients.length}
            loadMoreItems={loadMoreItems}
          >
            {({ onItemsRendered, ref }) => (
              <List
                ref={(list) => {
                  ref(list)
                  // @ts-ignore
                  listRef.current = list
                }}
                height={listHeight}
                itemCount={hasMore ? patients.length + 1 : patients.length}
                itemSize={100} // Height of each row
                width="100%"
                onItemsRendered={onItemsRendered}
                className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                {Row}
              </List>
            )}
          </InfiniteLoader>
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-white border-t px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-gray-600">
              Showing: <strong>{Math.min(patients.length, totalPatients)}</strong> of <strong>{totalPatients.toLocaleString()}</strong>
            </span>
            {isLoadingMore && (
              <span className="flex items-center gap-2 text-purple-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading more...
              </span>
            )}
          </div>
          <span className="text-gray-500">
            Last updated: {format(new Date(), 'h:mm a')}
          </span>
        </div>
      </div>
    </div>
  )
}