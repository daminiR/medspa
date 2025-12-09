'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Calendar, Edit, XCircle, UserX, CheckCircle, Clock, 
  Bell, Mail, FileText, FileCheck, Shield, DollarSign, 
  AlertCircle, MessageSquare, Camera, Clipboard, CalendarPlus,
  Filter, Search, RefreshCw, ChevronDown, ChevronRight
} from 'lucide-react'
import { 
  HistoryEvent, 
  HistoryEventCategory, 
  EVENT_CONFIG,
  CATEGORY_CONFIG 
} from '@/types/appointmentHistory'
import {
  generateMockHistory,
  filterEventsByCategory,
  searchEvents,
  groupEventsByDate,
  getRelativeTime,
  formatEventDescription
} from '@/utils/appointmentHistory'

interface AppointmentHistoryProps {
  appointmentId: string
  onEventClick?: (event: HistoryEvent) => void
}

const iconMap = {
  Calendar, Edit, XCircle, UserX, CheckCircle, Clock,
  Bell, Mail, FileText, FileCheck, Shield, DollarSign,
  AlertCircle, MessageSquare, Camera, Clipboard, CalendarPlus
}

export default function AppointmentHistory({ 
  appointmentId, 
  onEventClick 
}: AppointmentHistoryProps) {
  const [events, setEvents] = useState<HistoryEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<HistoryEventCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set())

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true)
      // In real implementation, fetch from API
      const history = generateMockHistory(appointmentId)
      setEvents(history)
      setIsLoading(false)
    }
    loadHistory()
  }, [appointmentId])

  // Filter and group events
  const filteredAndGroupedEvents = useMemo(() => {
    let filtered = events
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filterEventsByCategory(filtered, selectedCategories)
    }
    
    // Apply search
    if (searchTerm) {
      filtered = searchEvents(filtered, searchTerm)
    }
    
    // Sort by newest first
    filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    
    // Group by date
    return groupEventsByDate(filtered)
  }, [events, selectedCategories, searchTerm])

  const toggleCategory = (category: HistoryEventCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleDateCollapse = (date: string) => {
    setCollapsedDates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(date)) {
        newSet.delete(date)
      } else {
        newSet.add(date)
      }
      return newSet
    })
  }

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap]
    return Icon || Calendar
  }

  const refresh = () => {
    // In real implementation, refetch from API
    const history = generateMockHistory(appointmentId)
    setEvents(history)
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading history...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Appointment History
          </h3>
          <button
            onClick={refresh}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            title="Refresh history"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCategories.length > 0 
                ? 'bg-purple-50 border-purple-300 text-purple-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filter
            {selectedCategories.length > 0 && (
              <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded-full text-xs">
                {selectedCategories.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {isFilterOpen && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Filter by Category
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(CATEGORY_CONFIG) as [HistoryEventCategory, any][]).map(([category, config]) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="max-h-[600px] overflow-y-auto">
        {Object.entries(filteredAndGroupedEvents).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No history found</p>
          </div>
        ) : (
          Object.entries(filteredAndGroupedEvents).map(([date, dateEvents]) => {
            const isCollapsed = collapsedDates.has(date)
            
            return (
              <div key={date} className="border-b border-gray-100 last:border-0">
                {/* Date Header */}
                <button
                  onClick={() => toggleDateCollapse(date)}
                  className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-gray-700">{date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {dateEvents.length} event{dateEvents.length > 1 ? 's' : ''}
                    </span>
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Events for this date */}
                {!isCollapsed && (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200" />
                    
                    {dateEvents.map((event, index) => {
                      const config = EVENT_CONFIG[event.type]
                      const Icon = getIcon(config.icon)
                      const isLast = index === dateEvents.length - 1
                      
                      return (
                        <div
                          key={event.id}
                          className={`relative pl-16 pr-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !isLast ? 'border-b border-gray-100' : ''
                          }`}
                          onClick={() => onEventClick?.(event)}
                        >
                          {/* Icon */}
                          <div className={`absolute left-4 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                            config.color === 'green' ? 'bg-green-100' :
                            config.color === 'blue' ? 'bg-blue-100' :
                            config.color === 'red' ? 'bg-red-100' :
                            config.color === 'orange' ? 'bg-orange-100' :
                            config.color === 'yellow' ? 'bg-yellow-100' :
                            config.color === 'purple' ? 'bg-purple-100' :
                            config.color === 'gray' ? 'bg-gray-100' :
                            config.color === 'indigo' ? 'bg-indigo-100' :
                            config.color === 'pink' ? 'bg-pink-100' :
                            'bg-gray-100'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              config.color === 'green' ? 'text-green-600' :
                              config.color === 'blue' ? 'text-blue-600' :
                              config.color === 'red' ? 'text-red-600' :
                              config.color === 'orange' ? 'text-orange-600' :
                              config.color === 'yellow' ? 'text-yellow-600' :
                              config.color === 'purple' ? 'text-purple-600' :
                              config.color === 'gray' ? 'text-gray-600' :
                              config.color === 'indigo' ? 'text-indigo-600' :
                              config.color === 'pink' ? 'text-pink-600' :
                              'text-gray-600'
                            }`} />
                          </div>

                          {/* Content */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 text-sm">
                                  {config.label}
                                </span>
                                {event.isImportant && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                                    Important
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {formatEventDescription(event)}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500">
                                  by {event.userName}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {getRelativeTime(new Date(event.timestamp))}
                                </span>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            {event.metadata && (
                              <div className="flex items-center gap-1 ml-4">
                                {event.metadata.emailId && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      console.log('Resend email:', event.metadata?.emailId)
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded text-xs text-gray-600"
                                    title="Resend email"
                                  >
                                    <Mail className="h-3 w-3" />
                                  </button>
                                )}
                                {event.metadata.formId && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      console.log('View form:', event.metadata?.formId)
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded text-xs text-gray-600"
                                    title="View form"
                                  >
                                    <FileText className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Summary Stats */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-semibold text-gray-900">
              {events.length}
            </p>
            <p className="text-xs text-gray-500">Total Events</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-green-600">
              {events.filter(e => e.type === 'completed').length}
            </p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-blue-600">
              {events.filter(e => e.category === 'communication').length}
            </p>
            <p className="text-xs text-gray-500">Communications</p>
          </div>
        </div>
      </div>
    </div>
  )
}