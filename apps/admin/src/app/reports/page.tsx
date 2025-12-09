'use client'

import React, { useState, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Users,
  Clock,
  Package,
  FileText,
  Download,
  Filter,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
  Receipt,
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Mail,
  RefreshCw,
  Info,
  Target,
  TrendingDown,
  Wallet,
  Building,
  Award,
  ShoppingBag,
  Syringe,
  Camera,
  Star,
  MessageSquare
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, isWithinInterval } from 'date-fns'

// Mock data for demonstrations
const generateMockData = () => {
  const today = new Date()
  const lastMonth = subMonths(today, 1)
  
  return {
    revenue: {
      today: 8750,
      yesterday: 7230,
      thisWeek: 42500,
      lastWeek: 38900,
      thisMonth: 165000,
      lastMonth: 158000,
      thisYear: 1950000,
      lastYear: 1750000
    },
    appointments: {
      today: 32,
      completed: 28,
      noShow: 2,
      cancelled: 2,
      upcoming: 145,
      thisMonth: 680,
      utilizationRate: 87
    },
    patients: {
      total: 2847,
      new: 156,
      returning: 2691,
      activeRate: 68,
      retentionRate: 82,
      avgLifetimeValue: 3450
    },
    services: [
      { name: 'Botox', revenue: 45000, count: 120, growth: 15 },
      { name: 'Lip Filler', revenue: 38000, count: 85, growth: 8 },
      { name: 'Microneedling', revenue: 28000, count: 140, growth: -5 },
      { name: 'Chemical Peel', revenue: 22000, count: 110, growth: 12 },
      { name: 'Laser Hair Removal', revenue: 18000, count: 95, growth: 20 }
    ],
    providers: [
      { name: 'Dr. Amanda Chen', revenue: 52000, appointments: 85, utilization: 92, rating: 4.9 },
      { name: 'Dr. Michael Roberts', revenue: 48000, appointments: 78, utilization: 88, rating: 4.8 },
      { name: 'Sarah Johnson, RN', revenue: 35000, appointments: 92, utilization: 85, rating: 4.9 },
      { name: 'Emily Davis, NP', revenue: 31000, appointments: 88, utilization: 82, rating: 4.7 }
    ],
    transactions: generateTransactions(),
    invoices: generateInvoices()
  }
}

function generateTransactions() {
  const methods = ['Credit Card', 'Cash', 'Package Credit', 'Gift Card', 'Insurance']
  const transactions = []
  const today = new Date()
  
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, Math.floor(Math.random() * 30))
    transactions.push({
      id: `TXN-${1000 + i}`,
      date,
      patient: `Patient ${i + 1}`,
      method: methods[Math.floor(Math.random() * methods.length)],
      amount: Math.floor(Math.random() * 500) + 100,
      status: Math.random() > 0.1 ? 'completed' : 'pending'
    })
  }
  
  return transactions
}

function generateInvoices() {
  const invoices = []
  const today = new Date()
  
  for (let i = 0; i < 50; i++) {
    const date = subDays(today, Math.floor(Math.random() * 60))
    const total = Math.floor(Math.random() * 1000) + 200
    const paid = Math.random() > 0.3 ? total : Math.floor(total * Math.random())
    
    invoices.push({
      id: `INV-${2000 + i}`,
      date,
      patient: `Patient ${i + 1}`,
      service: ['Botox', 'Filler', 'Laser', 'Facial'][Math.floor(Math.random() * 4)],
      total,
      paid,
      balance: total - paid,
      status: paid === total ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
      daysOld: Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    })
  }
  
  return invoices
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('dashboard')
  const [dateRange, setDateRange] = useState('thisMonth')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')

  const data = useMemo(() => generateMockData(), [])

  // Calculate date range
  const getDateRange = () => {
    const today = new Date()
    switch (dateRange) {
      case 'today':
        return { start: today, end: today }
      case 'yesterday':
        const yesterday = subDays(today, 1)
        return { start: yesterday, end: yesterday }
      case 'thisWeek':
        return { start: startOfWeek(today), end: endOfWeek(today) }
      case 'lastWeek':
        const lastWeek = subDays(today, 7)
        return { start: startOfWeek(lastWeek), end: endOfWeek(lastWeek) }
      case 'thisMonth':
        return { start: startOfMonth(today), end: endOfMonth(today) }
      case 'lastMonth':
        const lastMonth = subMonths(today, 1)
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
      case 'custom':
        return { start: subDays(today, 30), end: today }
      default:
        return { start: startOfMonth(today), end: today }
    }
  }

  const { start, end } = getDateRange()

  // Filter data based on date range
  const filteredTransactions = data.transactions.filter(t => 
    isWithinInterval(t.date, { start, end })
  )

  const filteredInvoices = data.invoices.filter(inv => 
    isWithinInterval(inv.date, { start, end })
  )

  // Calculate metrics
  const calculateMetrics = () => {
    const revenue = filteredInvoices.reduce((sum, inv) => sum + inv.paid, 0)
    const outstanding = filteredInvoices.reduce((sum, inv) => sum + inv.balance, 0)
    const avgTicket = revenue / (filteredInvoices.length || 1)
    
    return { revenue, outstanding, avgTicket }
  }

  const { revenue, outstanding, avgTicket } = calculateMetrics()

  const reportCategories = [
    {
      id: 'financial',
      name: 'Financial Reports',
      icon: DollarSign,
      reports: [
        { id: 'dashboard', name: 'Executive Dashboard', badge: 'Live' },
        { id: 'revenue', name: 'Revenue Analytics' },
        { id: 'sales', name: 'Sales Report' },
        { id: 'cash-reconciliation', name: 'Cash Reconciliation' },
        { id: 'accounts-receivable', name: 'Accounts Receivable' },
        { id: 'compensation', name: 'Compensation Report' }
      ]
    },
    {
      id: 'operational',
      name: 'Operational Reports',
      icon: Activity,
      reports: [
        { id: 'appointments', name: 'Appointment Analytics' },
        { id: 'utilization', name: 'Provider Utilization' },
        { id: 'services', name: 'Service Performance' },
        { id: 'room-usage', name: 'Room/Resource Usage' },
        { id: 'no-show', name: 'No-Show Analysis' }
      ]
    },
    {
      id: 'patient',
      name: 'Patient Analytics',
      icon: Users,
      reports: [
        { id: 'retention', name: 'Patient Retention' },
        { id: 'lifetime-value', name: 'Lifetime Value (LTV)' },
        { id: 'demographics', name: 'Demographics' },
        { id: 'satisfaction', name: 'Satisfaction Scores' },
        { id: 'referrals', name: 'Referral Analysis' }
      ]
    },
    {
      id: 'inventory',
      name: 'Inventory & Products',
      icon: Package,
      reports: [
        { id: 'stock-levels', name: 'Stock Levels' },
        { id: 'product-performance', name: 'Product Performance' },
        { id: 'injectable-tracking', name: 'Injectable Analytics', badge: 'New' },
        { id: 'expiration', name: 'Expiration Tracking' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing & Growth',
      icon: Target,
      reports: [
        { id: 'campaigns', name: 'Campaign Performance' },
        { id: 'online-booking', name: 'Online Booking Stats' },
        { id: 'reviews', name: 'Reviews & Ratings' },
        { id: 'social-roi', name: 'Social Media ROI' }
      ]
    }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <ArrowUpRight className="w-4 h-4" />
              +12%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${revenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Total Revenue</div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">vs last period</span>
              <span className="font-medium text-gray-900">+$18,500</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-sm text-blue-600 font-medium">
              <ArrowUpRight className="w-4 h-4" />
              +8%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.patients.new}</div>
          <div className="text-sm text-gray-600 mt-1">New Patients</div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Retention rate</span>
              <span className="font-medium text-gray-900">{data.patients.retentionRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
              <ArrowDownRight className="w-4 h-4" />
              -5%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.appointments.utilizationRate}%</div>
          <div className="text-sm text-gray-600 mt-1">Utilization Rate</div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">No-shows today</span>
              <span className="font-medium text-gray-900">{data.appointments.noShow}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
              <AlertCircle className="w-4 h-4" />
              Pending
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${outstanding.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Outstanding Balance</div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Overdue &gt;30 days</span>
              <span className="font-medium text-gray-900">$12,450</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Year to Date</option>
            </select>
          </div>
          {/* Placeholder for chart */}
          <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Revenue chart visualization</p>
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Services</h3>
            <button className="text-sm text-purple-600 hover:text-purple-700">View All</button>
          </div>
          <div className="space-y-3">
            {data.services.slice(0, 5).map((service, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    idx === 0 ? 'bg-purple-500' : 
                    idx === 1 ? 'bg-pink-500' : 
                    idx === 2 ? 'bg-blue-500' : 
                    idx === 3 ? 'bg-green-500' : 
                    'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.count} treatments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${(service.revenue / 1000).toFixed(1)}K</p>
                  <p className={`text-xs ${service.growth >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-0.5`}>
                    {service.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(service.growth)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Provider Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Provider Performance</h3>
          <div className="flex gap-2">
            <button className="text-sm px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Export</button>
            <button className="text-sm px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Details</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Provider</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Revenue</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Appointments</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Utilization</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Rating</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.providers.map((provider, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-purple-600">
                          {provider.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{provider.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3">
                    <span className="text-sm font-semibold text-gray-900">${(provider.revenue / 1000).toFixed(1)}K</span>
                  </td>
                  <td className="text-right py-3">
                    <span className="text-sm text-gray-900">{provider.appointments}</span>
                  </td>
                  <td className="text-right py-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${provider.utilization}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{provider.utilization}%</span>
                    </div>
                  </td>
                  <td className="text-right py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm text-gray-900">{provider.rating}</span>
                    </div>
                  </td>
                  <td className="text-right py-3">
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {filteredTransactions.slice(0, 5).map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    txn.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{txn.patient}</p>
                    <p className="text-xs text-gray-500">{txn.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${txn.amount}</p>
                  <p className="text-xs text-gray-500">{format(txn.date, 'MMM d')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Outstanding Invoices</h3>
          <div className="space-y-3">
            {filteredInvoices
              .filter(inv => inv.balance > 0)
              .slice(0, 5)
              .map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      inv.daysOld > 30 ? 'bg-red-500' : 
                      inv.daysOld > 15 ? 'bg-yellow-500' : 
                      'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{inv.patient}</p>
                      <p className="text-xs text-gray-500">{inv.service} • {inv.daysOld} days old</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${inv.balance}</p>
                    <p className="text-xs text-gray-500">{inv.id}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderRevenueReport = () => (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Gross Revenue</h4>
          <div className="text-3xl font-bold text-gray-900">${revenue.toLocaleString()}</div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Services</span>
              <span className="font-medium">${(revenue * 0.75).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Products</span>
              <span className="font-medium">${(revenue * 0.15).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Packages</span>
              <span className="font-medium">${(revenue * 0.10).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Net Revenue</h4>
          <div className="text-3xl font-bold text-gray-900">${(revenue * 0.85).toLocaleString()}</div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Refunds</span>
              <span className="font-medium text-red-600">-${(revenue * 0.02).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discounts</span>
              <span className="font-medium text-red-600">-${(revenue * 0.08).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Adjustments</span>
              <span className="font-medium text-red-600">-${(revenue * 0.05).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Average Ticket</h4>
          <div className="text-3xl font-bold text-gray-900">${Math.round(avgTicket)}</div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">New Patients</span>
              <span className="font-medium">${Math.round(avgTicket * 1.3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Returning</span>
              <span className="font-medium">${Math.round(avgTicket * 0.9)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Members</span>
              <span className="font-medium">${Math.round(avgTicket * 1.5)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Category Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Service Category</h3>
        <div className="h-80 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <PieChart className="w-12 h-12 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Revenue breakdown chart</p>
          </div>
        </div>
      </div>

      {/* Detailed Revenue Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Details</h3>
          <button className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Category</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Transactions</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Gross</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Discounts</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {['Injectables', 'Laser Treatments', 'Facials', 'Body Treatments', 'Products'].map((category, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 text-sm text-gray-900">{format(new Date(), 'MMM d, yyyy')}</td>
                  <td className="py-3 text-sm font-medium text-gray-900">{category}</td>
                  <td className="py-3 text-sm text-gray-900 text-right">{Math.floor(Math.random() * 50) + 10}</td>
                  <td className="py-3 text-sm text-gray-900 text-right">${(Math.random() * 50000 + 10000).toFixed(0)}</td>
                  <td className="py-3 text-sm text-red-600 text-right">-${(Math.random() * 2000 + 500).toFixed(0)}</td>
                  <td className="py-3 text-sm font-semibold text-gray-900 text-right">${(Math.random() * 45000 + 9000).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSalesReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Sales</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${filteredInvoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{filteredInvoices.length} invoices</div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Collected</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${revenue.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{Math.round((revenue / filteredInvoices.reduce((sum, inv) => sum + inv.total, 0) || 0) * 100)}% collected</div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Outstanding</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${outstanding.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">{filteredInvoices.filter(inv => inv.balance > 0).length} pending</div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Avg Ticket</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${Math.round(avgTicket).toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Per invoice</div>
        </div>
      </div>

      {/* Detailed Invoice Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Invoice Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.slice(0, 10).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{format(invoice.date, 'MMM d, yyyy')}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{invoice.patient}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{invoice.service}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${invoice.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${invoice.paid.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${invoice.balance.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                      invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderAppointmentReport = () => {
    const appointmentsByStatus = {
      completed: filteredInvoices.filter(inv => inv.status === 'paid').length,
      pending: filteredInvoices.filter(inv => inv.status === 'partial').length,
      cancelled: Math.floor(filteredInvoices.length * 0.05),
      noShow: Math.floor(filteredInvoices.length * 0.03)
    }
    
    const totalAppointments = Object.values(appointmentsByStatus).reduce((a, b) => a + b, 0)
    
    return (
      <div className="space-y-6">
        {/* Appointment Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Total Appointments</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalAppointments}</div>
            <div className="text-xs text-gray-500 mt-1">In period</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Completed</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{appointmentsByStatus.completed}</div>
            <div className="text-xs text-green-600 mt-1">{Math.round(appointmentsByStatus.completed / totalAppointments * 100)}%</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">No-Shows</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{appointmentsByStatus.noShow}</div>
            <div className="text-xs text-red-600 mt-1">{Math.round(appointmentsByStatus.noShow / totalAppointments * 100)}%</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Avg Duration</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">45m</div>
            <div className="text-xs text-gray-500 mt-1">Per appointment</div>
          </div>
        </div>

        {/* Provider Performance */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Provider Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No-Shows</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.providers.map((provider) => (
                  <tr key={provider.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{provider.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{provider.appointments}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{Math.round(provider.appointments * 0.92)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{Math.round(provider.appointments * 0.03)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${provider.utilization}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{provider.utilization}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">${provider.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-900">{provider.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointment Trends Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Appointment Trends</h3>
          <div className="h-64 flex items-end gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const height = Math.random() * 100 + 20
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500">W{i + 1}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderUtilizationReport = () => (
    <div className="space-y-6">
      {/* Utilization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Overall Utilization</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.appointments.utilizationRate}%</div>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${data.appointments.utilizationRate}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Providers Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.providers.length}</div>
          <div className="text-xs text-gray-500 mt-1">All available today</div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Room Usage</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">6/8</div>
          <div className="text-xs text-gray-500 mt-1">Rooms occupied</div>
        </div>
      </div>

      {/* Provider Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Provider Utilization Details</h3>
        </div>
        <div className="p-6 space-y-4">
          {data.providers.map((provider) => (
            <div key={provider.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{provider.name}</span>
                <span className="text-sm text-gray-600">{provider.utilization}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        provider.utilization >= 90 ? 'bg-green-600' :
                        provider.utilization >= 70 ? 'bg-blue-600' :
                        provider.utilization >= 50 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${provider.utilization}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 w-32">
                  {provider.appointments} appointments
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Slots Heat Map */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Appointment Heat Map</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center">
              <div className="text-xs font-medium text-gray-500 mb-2">{day}</div>
              <div className="space-y-1">
                {Array.from({ length: 10 }, (_, i) => {
                  const intensity = Math.random()
                  return (
                    <div
                      key={i}
                      className={`h-4 rounded ${
                        intensity > 0.8 ? 'bg-purple-600' :
                        intensity > 0.6 ? 'bg-purple-500' :
                        intensity > 0.4 ? 'bg-purple-400' :
                        intensity > 0.2 ? 'bg-purple-300' :
                        'bg-purple-100'
                      }`}
                      title={`${9 + i}:00 - ${10 + i}:00`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-100 rounded" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-400 rounded" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded" />
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderRetentionReport = () => {
    const cohorts = [
      { month: 'Jan 2024', new: 145, m1: 130, m2: 118, m3: 105, m6: 87 },
      { month: 'Feb 2024', new: 162, m1: 148, m2: 132, m3: 119, m6: 95 },
      { month: 'Mar 2024', new: 138, m1: 125, m2: 110, m3: 98, m6: 0 },
      { month: 'Apr 2024', new: 175, m1: 161, m2: 145, m3: 0, m6: 0 },
      { month: 'May 2024', new: 156, m1: 142, m2: 0, m3: 0, m6: 0 },
      { month: 'Jun 2024', new: 168, m1: 0, m2: 0, m3: 0, m6: 0 }
    ]
    
    return (
      <div className="space-y-6">
        {/* Retention Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Retention Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{data.patients.retentionRate}%</div>
            <div className="text-xs text-green-600 mt-1">+5% vs last period</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Active Patients</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(data.patients.total * 0.68)}</div>
            <div className="text-xs text-gray-500 mt-1">{data.patients.activeRate}% of total</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Avg Lifetime Value</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">${data.patients.avgLifetimeValue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Per patient</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">At Risk</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">234</div>
            <div className="text-xs text-red-600 mt-1">No visit &gt;6 months</div>
          </div>
        </div>

        {/* Cohort Retention Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Cohort Retention Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">Patient retention by acquisition month</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cohort</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">New Patients</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Month 1</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Month 2</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Month 3</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Month 6</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cohorts.map((cohort) => (
                  <tr key={cohort.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{cohort.month}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">{cohort.new}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      {cohort.m1 > 0 ? (
                        <div>
                          <div className="text-gray-900">{Math.round(cohort.m1 / cohort.new * 100)}%</div>
                          <div className="text-xs text-gray-500">{cohort.m1} patients</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {cohort.m2 > 0 ? (
                        <div>
                          <div className="text-gray-900">{Math.round(cohort.m2 / cohort.new * 100)}%</div>
                          <div className="text-xs text-gray-500">{cohort.m2} patients</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {cohort.m3 > 0 ? (
                        <div>
                          <div className="text-gray-900">{Math.round(cohort.m3 / cohort.new * 100)}%</div>
                          <div className="text-xs text-gray-500">{cohort.m3} patients</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      {cohort.m6 > 0 ? (
                        <div>
                          <div className="text-gray-900">{Math.round(cohort.m6 / cohort.new * 100)}%</div>
                          <div className="text-xs text-gray-500">{cohort.m6} patients</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Segments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Patient Segments</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-600 rounded-full" />
                  <span className="text-sm text-gray-700">VIP (Top 20%)</span>
                </div>
                <span className="text-sm font-medium text-gray-900">487 patients</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  <span className="text-sm text-gray-700">Regular</span>
                </div>
                <span className="text-sm font-medium text-gray-900">1,245 patients</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full" />
                  <span className="text-sm text-gray-700">New (&lt; 3 visits)</span>
                </div>
                <span className="text-sm font-medium text-gray-900">678 patients</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full" />
                  <span className="text-sm text-gray-700">Dormant</span>
                </div>
                <span className="text-sm font-medium text-gray-900">437 patients</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Re-engagement Opportunities</h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">Botox Due</span>
                  <span className="text-sm text-gray-600">89 patients</span>
                </div>
                <div className="text-xs text-gray-600">Last visit 3-4 months ago</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">Filler Follow-up</span>
                  <span className="text-sm text-gray-600">45 patients</span>
                </div>
                <div className="text-xs text-gray-600">Due for touch-up</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">Birthday Month</span>
                  <span className="text-sm text-gray-600">156 patients</span>
                </div>
                <div className="text-xs text-gray-600">Send birthday promotions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeReport) {
      case 'dashboard':
        return renderDashboard()
      case 'revenue':
        return renderRevenueReport()
      case 'sales':
        return renderSalesReport()
      case 'appointments':
        return renderAppointmentReport()
      case 'utilization':
        return renderUtilizationReport()
      case 'retention':
        return renderRetentionReport()
      default:
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeReport.charAt(0).toUpperCase() + activeReport.slice(1).replace(/-/g, ' ')} Report
              </h3>
              <p className="text-gray-600">This report is being prepared and will be available soon.</p>
              <button 
                onClick={() => setActiveReport('dashboard')}
                className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reports</h2>
            
            {/* Date Range Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="thisWeek">This Week</option>
                <option value="lastWeek">Last Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Filters */}
            <div className="mb-6">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <span className="text-sm font-medium text-gray-700">Filters</span>
                <Filter className="w-4 h-4 text-gray-500" />
              </button>
              
              {showFilters && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                    <select className="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                      <option value="all">All Locations</option>
                      <option value="main">Main Clinic</option>
                      <option value="downtown">Downtown</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Provider</label>
                    <select className="w-full px-2 py-1 text-sm border border-gray-300 rounded">
                      <option value="all">All Providers</option>
                      <option value="dr-chen">Dr. Chen</option>
                      <option value="dr-roberts">Dr. Roberts</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Report Categories */}
            <div className="space-y-4">
              {reportCategories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    <category.icon className="w-4 h-4" />
                    {category.name}
                  </div>
                  <div className="space-y-1">
                    {category.reports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => setActiveReport(report.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between group ${
                          activeReport === report.id
                            ? 'bg-purple-50 text-purple-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span>{report.name}</span>
                        {report.badge && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            report.badge === 'Live' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {report.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeReport === 'dashboard' ? 'Executive Dashboard' : 
                   activeReport.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Report'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {format(start, 'MMM d, yyyy')} - {format(end, 'MMM d, yyyy')}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <div className="relative group">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Export as PDF
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Export as Excel
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Export as CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Content */}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}