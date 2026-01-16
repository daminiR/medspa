'use client'

import { useState, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import {
  Users,
  Calendar,
  Search,
  Filter,
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
  Eye,
  RefreshCw
} from 'lucide-react'
import moment from 'moment'
import {
  getAllGroupBookings,
  GroupBooking,
  GroupBookingStatus,
  checkInGroup,
  cancelGroupBooking
} from '@/lib/data'

type FilterStatus = 'all' | GroupBookingStatus
type DateFilter = 'all' | 'today' | 'week' | 'month' | 'past'

export default function GroupBookingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
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
    } else if (dateFilter === 'month') {
      const monthEnd = new Date(today)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      result = result.filter(g => {
        const groupDate = new Date(g.date)
        return groupDate >= today && groupDate <= monthEnd
      })
    } else if (dateFilter === 'past') {
      result = result.filter(g => new Date(g.date) < today)
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

    return result
  }, [groups, statusFilter, dateFilter, searchQuery])

  const handleCheckInAll = (groupId: string) => {
    const result = checkInGroup(groupId)
    if (result.success) {
      refreshGroups()
    }
  }

  const handleCancelGroup = (groupId: string) => {
    if (confirm('Cancel this entire group booking?')) {
      const result = cancelGroupBooking(groupId, 'Cancelled by staff')
      if (result.success) {
        refreshGroups()
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
        alert(`SMS sent to ${result.totalSent} participants`)
      } else {
        alert('Failed to send SMS: ' + result.error)
      }
    } catch (error) {
      alert('Error sending SMS')
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
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
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
      return d >= today && d <= todayEnd
    })

    const upcomingGroups = groups.filter(g => new Date(g.date) > todayEnd && g.status !== 'cancelled')
    const totalParticipants = groups.reduce((sum, g) => sum + g.participants.length, 0)
    const totalRevenue = groups.filter(g => g.status !== 'cancelled').reduce((sum, g) => sum + g.totalDiscountedPrice, 0)

    return {
      todayCount: todayGroups.length,
      upcomingCount: upcomingGroups.length,
      totalParticipants,
      totalRevenue
    }
  }, [groups])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600" />
            Group Bookings
          </h1>
          <p className="mt-1 text-gray-500">Manage bridal parties, couples spa days, and group appointments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Guests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups, coordinators, or participants..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="partially_confirmed">Partially Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="past">Past</option>
            </select>

            {/* Refresh */}
            <button
              onClick={refreshGroups}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Groups List */}
        <div className="space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No group bookings found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create a group booking from the calendar to get started'}
              </p>
            </div>
          ) : (
            filteredGroups.map(group => (
              <div
                key={group.id}
                className={`bg-white rounded-xl shadow-sm border transition-all ${
                  expandedGroup === group.id ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-gray-200'
                }`}
              >
                {/* Group Header */}
                <button
                  onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Users className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{group.name}</h3>
                          {getStatusBadge(group.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {moment(group.date).format('ddd, MMM D, YYYY')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {group.participants.length} guests
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            ${group.totalDiscountedPrice.toFixed(2)}
                          </span>
                          {group.discountPercent > 0 && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Percent className="h-3.5 w-3.5" />
                              {group.discountPercent}% off
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedGroup === group.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedGroup === group.id && (
                  <div className="border-t border-gray-200 p-4">
                    {/* Quick Actions */}
                    {group.status !== 'cancelled' && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button
                          onClick={() => handleCheckInAll(group.id)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Check In All
                        </button>
                        <button
                          onClick={() => handleSendSMS(group.id, 'reminder')}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Send className="h-4 w-4" />
                          Send Reminder
                        </button>
                        <button
                          onClick={() => handleCancelGroup(group.id)}
                          className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel Group
                        </button>
                      </div>
                    )}

                    {/* Coordinator Info */}
                    <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-indigo-900 mb-2">Coordinator</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{group.coordinatorName}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            {group.coordinatorPhone && (
                              <a href={`tel:${group.coordinatorPhone}`} className="flex items-center gap-1 hover:text-indigo-600">
                                <Phone className="h-3.5 w-3.5" />
                                {group.coordinatorPhone}
                              </a>
                            )}
                            {group.coordinatorEmail && (
                              <a href={`mailto:${group.coordinatorEmail}`} className="flex items-center gap-1 hover:text-indigo-600">
                                <Mail className="h-3.5 w-3.5" />
                                {group.coordinatorEmail}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-500">Payment Mode</p>
                          <p className="font-medium text-gray-900">
                            {group.paymentMode === 'individual' ? 'Individual' :
                              group.paymentMode === 'coordinator' ? 'Coordinator Pays' : 'Split Evenly'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Participants Table */}
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Participants</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-medium text-gray-500">#</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-500">Name</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-500">Service</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-500">Time</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-500">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.participants.map((participant, index) => (
                            <tr key={participant.patientId} className="border-b border-gray-100">
                              <td className="py-2 px-3">
                                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium flex items-center justify-center">
                                  {index + 1}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{participant.patientName}</span>
                                  {participant.patientId === group.coordinatorPatientId && (
                                    <span className="text-xs bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded">
                                      Coordinator
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">{participant.serviceName}</td>
                              <td className="py-2 px-3 text-gray-600">
                                {moment(participant.startTime).format('h:mm A')}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  participant.status === 'arrived' ? 'bg-green-100 text-green-700' :
                                  participant.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {participant.status}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right">
                                ${(participant.servicePrice * (1 - group.discountPercent / 100)).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50">
                            <td colSpan={5} className="py-2 px-3 text-right font-medium">Total</td>
                            <td className="py-2 px-3 text-right font-bold">${group.totalDiscountedPrice.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Notes */}
                    {group.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{group.notes}</p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="mt-4 text-xs text-gray-400 flex gap-4">
                      <span>Created: {moment(group.createdAt).format('MMM D, YYYY h:mm A')}</span>
                      <span>Updated: {moment(group.updatedAt).format('MMM D, YYYY h:mm A')}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
