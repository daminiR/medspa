'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Package,
  CreditCard,
  Activity,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Printer,
  RefreshCw
} from 'lucide-react'
import { ExportButton } from './ExportButton'
import { ExportColumn, formatters } from '@/lib/export'

interface DailySummaryData {
  revenue: {
    today: number
    yesterday: number
    weekToDate: number
    monthToDate: number
    yearToDate: number
  }
  services: {
    total: number
    byCategory: {
      name: string
      count: number
      revenue: number
    }[]
    topPerformers: {
      name: string
      count: number
      revenue: number
    }[]
  }
  appointments: {
    total: number
    completed: number
    noShows: number
    cancellations: number
    utilization: number
  }
  patients: {
    newPatients: number
    returningPatients: number
    totalVisits: number
    averageTicket: number
  }
  providers: {
    activeToday: number
    topProvider: {
      name: string
      revenue: number
      services: number
    }
    utilization: number
  }
  products: {
    sold: number
    revenue: number
    topProducts: {
      name: string
      quantity: number
      revenue: number
    }[]
  }
  payments: {
    cash: number
    card: number
    packageCredits: number
    giftCards: number
    total: number
  }
  packages: {
    sold: number
    revenue: number
    redeemed: number
  }
  memberships: {
    newEnrollments: number
    cancellations: number
    activeTotal: number
    mrr: number
  }
}

export function DailySummaryDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  
  // Mock data - would come from API
  const data: DailySummaryData = {
    revenue: {
      today: 15420,
      yesterday: 12350,
      weekToDate: 68900,
      monthToDate: 285000,
      yearToDate: 3420000
    },
    services: {
      total: 42,
      byCategory: [
        { name: 'Injectables', count: 18, revenue: 8600 },
        { name: 'Laser', count: 8, revenue: 3200 },
        { name: 'Facials', count: 12, revenue: 2400 },
        { name: 'Consultations', count: 4, revenue: 0 }
      ],
      topPerformers: [
        { name: 'Botox (50 units)', count: 12, revenue: 6000 },
        { name: 'Lip Filler', count: 6, revenue: 2600 },
        { name: 'IPL Photofacial', count: 4, revenue: 1600 }
      ]
    },
    appointments: {
      total: 48,
      completed: 42,
      noShows: 2,
      cancellations: 4,
      utilization: 87.5
    },
    patients: {
      newPatients: 8,
      returningPatients: 34,
      totalVisits: 42,
      averageTicket: 367
    },
    providers: {
      activeToday: 4,
      topProvider: {
        name: 'Dr. Sarah Chen',
        revenue: 6800,
        services: 14
      },
      utilization: 82
    },
    products: {
      sold: 23,
      revenue: 1220,
      topProducts: [
        { name: 'SkinCeuticals CE Ferulic', quantity: 5, revenue: 850 },
        { name: 'EltaMD UV Clear SPF', quantity: 8, revenue: 280 },
        { name: 'Revision Skincare Nectifirm', quantity: 3, revenue: 90 }
      ]
    },
    payments: {
      cash: 2400,
      card: 11820,
      packageCredits: 800,
      giftCards: 400,
      total: 15420
    },
    packages: {
      sold: 3,
      revenue: 4500,
      redeemed: 7
    },
    memberships: {
      newEnrollments: 2,
      cancellations: 0,
      activeTotal: 156,
      mrr: 23400
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    const isPositive = change >= 0
    
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {formatPercent(Math.abs(change))}
      </div>
    )
  }

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 500)
      }, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Prepare export data
  const exportData = useMemo(() => {
    return [
      { metric: 'Revenue Today', value: data.revenue.today, category: 'Revenue' },
      { metric: 'Revenue Week to Date', value: data.revenue.weekToDate, category: 'Revenue' },
      { metric: 'Revenue Month to Date', value: data.revenue.monthToDate, category: 'Revenue' },
      { metric: 'Revenue Year to Date', value: data.revenue.yearToDate, category: 'Revenue' },
      { metric: 'Total Services', value: data.services.total, category: 'Services' },
      ...data.services.byCategory.map(cat => ({
        metric: `${cat.name} - Count`, value: cat.count, category: 'Services'
      })),
      ...data.services.byCategory.map(cat => ({
        metric: `${cat.name} - Revenue`, value: cat.revenue, category: 'Services'
      })),
      { metric: 'Appointments Total', value: data.appointments.total, category: 'Appointments' },
      { metric: 'Appointments Completed', value: data.appointments.completed, category: 'Appointments' },
      { metric: 'No Shows', value: data.appointments.noShows, category: 'Appointments' },
      { metric: 'Cancellations', value: data.appointments.cancellations, category: 'Appointments' },
      { metric: 'Utilization %', value: data.appointments.utilization, category: 'Appointments' },
      { metric: 'New Patients', value: data.patients.newPatients, category: 'Patients' },
      { metric: 'Returning Patients', value: data.patients.returningPatients, category: 'Patients' },
      { metric: 'Total Visits', value: data.patients.totalVisits, category: 'Patients' },
      { metric: 'Average Ticket', value: data.patients.averageTicket, category: 'Patients' },
      { metric: 'Cash Payments', value: data.payments.cash, category: 'Payments' },
      { metric: 'Card Payments', value: data.payments.card, category: 'Payments' },
      { metric: 'Package Credits', value: data.payments.packageCredits, category: 'Payments' },
      { metric: 'Gift Cards', value: data.payments.giftCards, category: 'Payments' },
      { metric: 'Total Payments', value: data.payments.total, category: 'Payments' },
      { metric: 'Packages Sold', value: data.packages.sold, category: 'Packages' },
      { metric: 'Package Revenue', value: data.packages.revenue, category: 'Packages' },
      { metric: 'Packages Redeemed', value: data.packages.redeemed, category: 'Packages' },
      { metric: 'New Memberships', value: data.memberships.newEnrollments, category: 'Memberships' },
      { metric: 'Membership Cancellations', value: data.memberships.cancellations, category: 'Memberships' },
      { metric: 'Active Members', value: data.memberships.activeTotal, category: 'Memberships' },
      { metric: 'Monthly Recurring Revenue', value: data.memberships.mrr, category: 'Memberships' },
      { metric: 'Products Sold', value: data.products.sold, category: 'Products' },
      { metric: 'Product Revenue', value: data.products.revenue, category: 'Products' },
    ]
  }, [data])

  const exportColumns: ExportColumn[] = [
    { key: 'category', header: 'Category' },
    { key: 'metric', header: 'Metric' },
    { key: 'value', header: 'Value', formatter: (v) => typeof v === 'number' && v > 100 ? formatters.currency(v) : String(v) },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Daily Summary Dashboard</h2>
            <p className="text-gray-600">Complete overview of today's performance</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border ${
                autoRefresh
                  ? 'bg-purple-50 border-purple-200 text-purple-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>
            <ExportButton
              data={exportData}
              columns={exportColumns}
              filename="daily-summary"
              title="Daily Summary Report"
              dateRange={{ start: selectedDate.toISOString().split('T')[0], end: selectedDate.toISOString().split('T')[0] }}
            />
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Printer className="w-4 h-4 inline mr-2" />
              Print
            </button>
          </div>
        </div>
        
        {/* Date selector */}
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                const yesterday = new Date(selectedDate)
                yesterday.setDate(yesterday.getDate() - 1)
                setSelectedDate(yesterday)
              }}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Previous Day
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            {getChangeIndicator(data.revenue.today, data.revenue.yesterday)}
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.revenue.today)}</p>
          <p className="text-sm text-gray-600">Today's Revenue</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.revenue.weekToDate)}</p>
          <p className="text-sm text-gray-600">Week to Date</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.revenue.monthToDate)}</p>
          <p className="text-sm text-gray-600">Month to Date</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-2">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.patients.totalVisits}</p>
          <p className="text-sm text-gray-600">Total Visits</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-2">
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.patients.averageTicket)}</p>
          <p className="text-sm text-gray-600">Average Ticket</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Performance</h3>
          <div className="space-y-4">
            {data.services.byCategory.map((category) => (
              <div key={category.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{category.count} services</span>
                    <span className="text-sm font-semibold">{formatCurrency(category.revenue)}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                    style={{ width: `${(category.revenue / data.revenue.today) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Top Services Today</h4>
            <div className="space-y-2">
              {data.services.topPerformers.map((service, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{service.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">x{service.count}</span>
                    <span className="font-medium">{formatCurrency(service.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment Analytics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Analytics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-700">{data.appointments.completed}</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-orange-700">{data.appointments.noShows}</p>
              <p className="text-sm text-orange-600">No Shows</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-700">{data.appointments.cancellations}</p>
              <p className="text-sm text-red-600">Cancellations</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-700">{formatPercent(data.appointments.utilization)}</p>
              <p className="text-sm text-blue-600">Utilization</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Patient Mix</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Patients</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{data.patients.newPatients}</span>
                  <span className="text-xs text-gray-500">
                    ({formatPercent((data.patients.newPatients / data.patients.totalVisits) * 100)})
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Returning Patients</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{data.patients.returningPatients}</span>
                  <span className="text-xs text-gray-500">
                    ({formatPercent((data.patients.returningPatients / data.patients.totalVisits) * 100)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Credit/Debit Card</span>
              </div>
              <span className="font-semibold">{formatCurrency(data.payments.card)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Cash</span>
              </div>
              <span className="font-semibold">{formatCurrency(data.payments.cash)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-700">Package Credits</span>
              </div>
              <span className="font-semibold">{formatCurrency(data.payments.packageCredits)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-pink-600" />
                <span className="text-sm text-gray-700">Gift Cards</span>
              </div>
              <span className="font-semibold">{formatCurrency(data.payments.giftCards)}</span>
            </div>
            <div className="pt-3 border-t flex justify-between items-center">
              <span className="font-medium text-gray-900">Total Collected</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(data.payments.total)}</span>
            </div>
          </div>
        </div>

        {/* Provider Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Performance</h3>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Top Provider Today</p>
            <p className="text-lg font-semibold text-gray-900">{data.providers.topProvider.name}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">{data.providers.topProvider.services} services</span>
              <span className="font-bold text-purple-700">{formatCurrency(data.providers.topProvider.revenue)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.providers.activeToday}</p>
              <p className="text-sm text-gray-600">Active Providers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatPercent(data.providers.utilization)}</p>
              <p className="text-sm text-gray-600">Avg Utilization</p>
            </div>
          </div>
        </div>

        {/* Package & Membership Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Packages & Memberships</h3>
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-purple-700">Packages Sold</span>
                <span className="font-bold text-purple-900">{data.packages.sold}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-purple-600">
                <span>Revenue: {formatCurrency(data.packages.revenue)}</span>
                <span>Redeemed: {data.packages.redeemed}</span>
              </div>
            </div>
            
            <div className="bg-pink-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-pink-700">New Memberships</span>
                <span className="font-bold text-pink-900">+{data.memberships.newEnrollments}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-pink-600">
                <span>Active: {data.memberships.activeTotal}</span>
                <span>MRR: {formatCurrency(data.memberships.mrr)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Sales */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Sales</h3>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.products.sold}</p>
              <p className="text-sm text-gray-600">Units Sold</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data.products.revenue)}</p>
              <p className="text-sm text-gray-600">Product Revenue</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {data.products.topProducts.map((product, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{product.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">x{product.quantity}</span>
                  <span className="font-medium">{formatCurrency(product.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900 mb-2">Action Items</h4>
            <ul className="space-y-1 text-sm text-yellow-800">
              {data.appointments.noShows > 0 && (
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Follow up with {data.appointments.noShows} no-show patients
                </li>
              )}
              {data.appointments.utilization < 80 && (
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Schedule utilization below 80% - consider promotions
                </li>
              )}
              {data.memberships.cancellations > 0 && (
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3" />
                  Review {data.memberships.cancellations} membership cancellation(s)
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}