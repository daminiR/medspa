'use client'

import { useState, useMemo } from 'react'
import {
  X,
  Users,
  Calendar,
  Search,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Percent,
  Plus
} from 'lucide-react'
import moment from 'moment'
import {
  getAllGroupBookings,
  GroupBooking,
  GroupBookingStatus,
  checkInGroup,
  cancelGroupBooking
} from '@/lib/data'

interface GroupsPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  onCreateGroup: () => void
  showToast: (message: string) => void
}

type FilterStatus = 'all' | GroupBookingStatus
type DateFilter = 'all' | 'today' | 'week' | 'upcoming'

export default function GroupsPanel({
  isOpen,
  onClose,
  selectedDate,
  onCreateGroup,
  showToast
}: GroupsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('upcoming')
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [groups, setGroups] = useState<GroupBooking[]>(() => getAllGroupBookings())

  const refreshGroups = () => {
    setGroups(getAllGroupBookings())
  }

  const filteredGroups = useMemo(() => {
    let result = [...groups]

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(g => g.status === statusFilter)
    }

    // Date filter
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dateFilter === 'today') {
      result = result.filter(g => {
        const groupDate = new Date(g.date)
        groupDate.setHours(0, 0, 0, 0)
        return groupDate.getTime() === today.getTime()
      })
    } else if (dateFilter === 'week') {
      const weekEnd = new Date(today)
      weekEnd.setDate(weekEnd.getDate() + 7)
      result = result.filter(g => {
        const groupDate = new Date(g.date)
        return groupDate >= today && groupDate <= weekEnd
      })
    } else if (dateFilter === 'upcoming') {
      result = result.filter(g => new Date(g.date) >= today && g.status !== 'cancelled')
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(g =>
        g.name.toLowerCase().includes(query) ||
        g.coordinatorName.toLowerCase().includes(query) ||
        g.participants.some(p => p.patientName.toLowerCase().includes(query))
      )
    }

    // Sort by date
    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return result
  }, [groups, statusFilter, dateFilter, searchQuery])

  const handleCheckInAll = (groupId: string) => {
    const result = checkInGroup(groupId)
    if (result.success) {
      refreshGroups()
      showToast('✓ All participants checked in')
    }
  }

  const handleCancelGroup = (groupId: string) => {
    if (confirm('Cancel this entire group booking?')) {
      const result = cancelGroupBooking(groupId, 'Cancelled by staff')
      if (result.success) {
        refreshGroups()
        showToast('Group booking cancelled')
      }
    }
  }

  const handleSendSMS = async (groupId: string, type: 'confirmation' | 'reminder') => {
    try {
      const response = await fetch('/api/sms/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, type })
      })
      const result = await response.json()
      if (result.success) {
        showToast(`SMS sent to ${result.totalSent} participants`)
      } else {
        showToast('Failed to send SMS: ' + result.error)
      }
    } catch {
      showToast('Error sending SMS')
    }
  }

  const getStatusBadge = (status: GroupBookingStatus) => {
    const styles: Record<GroupBookingStatus, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <AlertCircle className="h-3 w-3" /> },
      confirmed: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="h-3 w-3" /> },
      partially_confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Clock className="h-3 w-3" /> },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle className="h-3 w-3" /> }
    }
    const style = styles[status]
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {status.replace('_', ' ')}
      </span>
    )
  }

  // Stats
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    const todayGroups = groups.filter(g => {
      const d = new Date(g.date)
      return d >= today && d <= todayEnd && g.status !== 'cancelled'
    })

    const upcomingGroups = groups.filter(g => new Date(g.date) > todayEnd && g.status !== 'cancelled')

    return {
      todayCount: todayGroups.length,
      upcomingCount: upcomingGroups.length
    }
  }, [groups])

  return (
    <div className={`fixed right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-2xl transform transition-transform duration-300 z-40 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Group Bookings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-indigo-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-medium">
                {stats.todayCount}
              </span>
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-medium">
                {stats.upcomingCount}
              </span>
              <span className="text-gray-600">Upcoming</span>
            </div>
          </div>
        </div>

        {/* Create Button + Filters */}
        <div className="p-3 border-b space-y-2">
          <button
            onClick={onCreateGroup}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="h-4 w-4" />
            New Group Booking
          </button>

          <div className="flex gap-2">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No group bookings found</p>
              <p className="text-gray-400 text-xs mt-1">
                {searchQuery || dateFilter !== 'upcoming' ? 'Try adjusting filters' : 'Create one to get started'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredGroups.map(group => (
                <div key={group.id} className="hover:bg-gray-50">
                  {/* Group Header - Clickable */}
                  <button
                    onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                    className="w-full text-left p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">{group.name}</h3>
                          {getStatusBadge(group.status)}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {moment(group.date).format('MMM D')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {group.participants.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${group.totalDiscountedPrice.toFixed(0)}
                          </span>
                          {group.discountPercent > 0 && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Percent className="h-3 w-3" />
                              {group.discountPercent}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-2">
                        {expandedGroup === group.id ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedGroup === group.id && (
                    <div className="px-3 pb-3 space-y-3">
                      {/* Quick Actions */}
                      {group.status !== 'cancelled' && (
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => handleCheckInAll(group.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Check In All
                          </button>
                          <button
                            onClick={() => handleSendSMS(group.id, 'reminder')}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 flex items-center gap-1"
                          >
                            <Send className="h-3 w-3" />
                            Remind
                          </button>
                          <button
                            onClick={() => handleCancelGroup(group.id)}
                            className="px-2 py-1 border border-red-300 text-red-600 rounded text-xs font-medium hover:bg-red-50 flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Coordinator */}
                      <div className="bg-indigo-50 rounded-lg p-2">
                        <p className="text-xs text-indigo-600 font-medium mb-1">Coordinator</p>
                        <p className="font-medium text-gray-900 text-sm">{group.coordinatorName}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                          {group.coordinatorPhone && (
                            <a href={`tel:${group.coordinatorPhone}`} className="flex items-center gap-1 hover:text-indigo-600">
                              <Phone className="h-3 w-3" />
                              {group.coordinatorPhone}
                            </a>
                          )}
                          {group.coordinatorEmail && (
                            <a href={`mailto:${group.coordinatorEmail}`} className="flex items-center gap-1 hover:text-indigo-600">
                              <Mail className="h-3 w-3" />
                              Email
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Participants */}
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1.5">Participants</p>
                        <div className="space-y-1">
                          {group.participants.map((p, idx) => (
                            <div key={p.patientId} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1.5">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium">
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="font-medium">{p.patientName}</span>
                                  {p.patientId === group.coordinatorPatientId && (
                                    <span className="ml-1 text-indigo-600">(coord)</span>
                                  )}
                                  <span className="text-gray-500 ml-1">· {p.serviceName}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">{moment(p.startTime).format('h:mm A')}</span>
                                <span className={`px-1.5 py-0.5 rounded text-xs ${
                                  p.status === 'arrived' ? 'bg-green-100 text-green-700' :
                                  p.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {p.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      {group.notes && (
                        <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                          {group.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
