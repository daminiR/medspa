'use client'

import React, { useState, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import { 
  Calendar,
  Clock,
  Users,
  Download,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Activity,
  UserCheck,
  UserX,
  Timer,
  CalendarX,
  PhoneOff,
  BarChart3,
  PieChart
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns'

// Mock data generation
const generateAppointmentData = () => {
  const providers = ['Dr. Smith', 'Dr. Johnson', 'Sarah RN', 'Emily NP']
  const services = ['Botox', 'Filler', 'Chemical Peel', 'Microneedling', 'Laser', 'Consultation', 'Follow-up']
  const statuses = ['completed', 'no-show', 'cancelled', 'late-cancel']
  
  const appointments = []
  for (let i = 0; i < 500; i++) {
    const provider = providers[Math.floor(Math.random() * providers.length)]
    const service = services[Math.floor(Math.random() * services.length)]
    const status = Math.random() > 0.8 ? statuses[Math.floor(Math.random() * (statuses.length - 1)) + 1] : 'completed'
    const duration = [15, 30, 45, 60, 90][Math.floor(Math.random() * 5)]
    
    appointments.push({
      id: i + 1,
      provider,
      service,
      status,
      duration,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      isNewClient: Math.random() > 0.7,
      revenue: status === 'completed' ? Math.floor(Math.random() * 500) + 100 : 0
    })
  }
  
  return appointments
}

const calculateMetrics = (appointments: any[]) => {
  const total = appointments.length
  const completed = appointments.filter(a => a.status === 'completed').length
  const noShows = appointments.filter(a => a.status === 'no-show').length
  const cancelled = appointments.filter(a => a.status === 'cancelled').length
  const lateCancelled = appointments.filter(a => a.status === 'late-cancel').length
  const newClients = appointments.filter(a => a.isNewClient).length
  
  return {
    total,
    completed,
    noShows,
    cancelled,
    lateCancelled,
    newClients,
    completionRate: (completed / total) * 100,
    noShowRate: (noShows / total) * 100,
    cancellationRate: ((cancelled + lateCancelled) / total) * 100,
    newClientRate: (newClients / total) * 100,
    averageDuration: appointments.reduce((sum, a) => sum + a.duration, 0) / total,
    totalRevenue: appointments.reduce((sum, a) => sum + a.revenue, 0)
  }
}

export default function AppointmentAnalyticsPage() {
  const [selectedDateRange, setSelectedDateRange] = useState('month')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [selectedService, setSelectedService] = useState('all')
  
  const appointments = useMemo(() => generateAppointmentData(), [])
  const metrics = useMemo(() => calculateMetrics(appointments), [appointments])
  
  // Provider performance
  const providerStats = useMemo(() => {
    const stats = {}
    appointments.forEach(apt => {
      if (!stats[apt.provider]) {
        stats[apt.provider] = {
          total: 0,
          completed: 0,
          noShows: 0,
          cancelled: 0,
          revenue: 0,
          newClients: 0
        }
      }
      stats[apt.provider].total++
      if (apt.status === 'completed') stats[apt.provider].completed++
      if (apt.status === 'no-show') stats[apt.provider].noShows++
      if (apt.status === 'cancelled' || apt.status === 'late-cancel') stats[apt.provider].cancelled++
      stats[apt.provider].revenue += apt.revenue
      if (apt.isNewClient) stats[apt.provider].newClients++
    })
    return Object.entries(stats).map(([provider, data]: [string, any]) => ({
      provider,
      ...data,
      completionRate: (data.completed / data.total) * 100,
      utilizationRate: ((data.completed * 45) / (8 * 60 * 20)) * 100 // Assuming 45 min avg, 8 hrs/day, 20 days
    }))
  }, [appointments])
  
  // Service performance
  const serviceStats = useMemo(() => {
    const stats = {}
    appointments.forEach(apt => {
      if (!stats[apt.service]) {
        stats[apt.service] = {
          total: 0,
          completed: 0,
          revenue: 0,
          avgDuration: 0,
          totalDuration: 0
        }
      }
      stats[apt.service].total++
      if (apt.status === 'completed') stats[apt.service].completed++
      stats[apt.service].revenue += apt.revenue
      stats[apt.service].totalDuration += apt.duration
    })
    return Object.entries(stats).map(([service, data]: [string, any]) => ({
      service,
      ...data,
      avgDuration: data.totalDuration / data.total,
      avgRevenue: data.revenue / (data.completed || 1)
    }))
  }, [appointments])

  // Time slot analysis
  const timeSlotAnalysis = useMemo(() => {
    const slots = {
      '8-10 AM': { total: 0, completed: 0, noShows: 0 },
      '10-12 PM': { total: 0, completed: 0, noShows: 0 },
      '12-2 PM': { total: 0, completed: 0, noShows: 0 },
      '2-4 PM': { total: 0, completed: 0, noShows: 0 },
      '4-6 PM': { total: 0, completed: 0, noShows: 0 }
    }
    
    appointments.forEach(apt => {
      const hour = apt.date.getHours()
      let slot = '8-10 AM'
      if (hour >= 10 && hour < 12) slot = '10-12 PM'
      else if (hour >= 12 && hour < 14) slot = '12-2 PM'
      else if (hour >= 14 && hour < 16) slot = '2-4 PM'
      else if (hour >= 16 && hour < 18) slot = '4-6 PM'
      
      slots[slot].total++
      if (apt.status === 'completed') slots[slot].completed++
      if (apt.status === 'no-show') slots[slot].noShows++
    })
    
    return Object.entries(slots).map(([time, data]) => ({
      time,
      ...data,
      completionRate: (data.completed / data.total) * 100 || 0
    }))
  }, [appointments])

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <span>Reports</span>
                <ChevronRight className="h-4 w-4" />
                <span>Clinical</span>
                <ChevronRight className="h-4 w-4" />
                <span>Appointment Analytics</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Appointment Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive appointment metrics and provider performance</p>
            </div>
            
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center space-x-4">
              <select 
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>

              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Locations</option>
                <option value="main">Main Clinic</option>
                <option value="downtown">Downtown</option>
              </select>

              <select 
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Providers</option>
                <option value="dr-smith">Dr. Smith</option>
                <option value="dr-johnson">Dr. Johnson</option>
                <option value="sarah-rn">Sarah RN</option>
                <option value="emily-np">Emily NP</option>
              </select>

              <select 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Services</option>
                <option value="botox">Botox</option>
                <option value="filler">Filler</option>
                <option value="laser">Laser</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
              <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4" />
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.completionRate.toFixed(1)}%</p>
              <p className="text-xs text-green-600 mt-1">+2.3% vs last month</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-sm text-red-600 flex items-center">
                  <TrendingDown className="h-4 w-4" />
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">No-Show Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.noShowRate.toFixed(1)}%</p>
              <p className="text-xs text-red-600 mt-1">+0.5% vs last month</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CalendarX className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Cancellation Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.cancellationRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">Within normal range</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">New Clients</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.newClients}</p>
              <p className="text-xs text-gray-500 mt-1">{metrics.newClientRate.toFixed(1)}% of total</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(metrics.averageDuration)}m</p>
              <p className="text-xs text-gray-500 mt-1">Per appointment</p>
            </div>
          </div>

          {/* Provider Performance */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Provider Performance</h2>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">No-Shows</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cancelled</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Completion %</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization %</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">New Clients</th>
                  </tr>
                </thead>
                <tbody>
                  {providerStats.map((provider, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{provider.provider}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{provider.total}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{provider.completed}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{provider.noShows}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{provider.cancelled}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          provider.completionRate > 90 ? 'bg-green-100 text-green-700' : 
                          provider.completionRate > 80 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {provider.completionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          provider.utilizationRate > 80 ? 'bg-green-100 text-green-700' : 
                          provider.utilizationRate > 60 ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {provider.utilizationRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${provider.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{provider.newClients}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Service Performance */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Service Performance</h2>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Duration</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceStats.map((service, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{service.service}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{service.total}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{service.completed}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{Math.round(service.avgDuration)}m</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${service.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">${Math.round(service.avgRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Time Slot Analysis */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Time Slot Analysis</h2>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {timeSlotAnalysis.map((slot, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-24 text-sm font-medium text-gray-700">{slot.time}</div>
                    <div className="flex-1 mx-4">
                      <div className="flex h-8 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500"
                          style={{ width: `${(slot.completed / slot.total) * 100}%` }}
                        />
                        <div 
                          className="bg-red-500"
                          style={{ width: `${(slot.noShows / slot.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 w-32 text-right">
                      {slot.total} appointments
                    </div>
                    <div className="text-sm ml-4 w-20 text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        slot.completionRate > 90 ? 'bg-green-100 text-green-700' : 
                        slot.completionRate > 80 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {slot.completionRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                  <span className="text-gray-600">Completed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                  <span className="text-gray-600">No-Show</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-200 rounded-full mr-2" />
                  <span className="text-gray-600">Cancelled/Other</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}