'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  Clock,
  Activity,
  Award,
  Target,
  ChevronRight,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { ExportButton } from './ExportButton'
import { ExportColumn, formatters } from '@/lib/export'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface ProviderMetrics {
  id: string
  name: string
  role: string
  avatar?: string
  revenue: {
    today: number
    week: number
    month: number
    year: number
  }
  services: {
    today: number
    week: number
    month: number
    avgPerDay: number
  }
  performance: {
    utilization: number
    avgTicket: number
    rebookingRate: number
    satisfaction: number
    productivityScore: number
  }
  specialties: {
    category: string
    count: number
    revenue: number
  }[]
  commission: {
    services: number
    products: number
    tips: number
    total: number
  }
  trends: {
    month: string
    revenue: number
    services: number
  }[]
}

export function ProviderPerformanceDashboard() {
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [dateRange, setDateRange] = useState('month')
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid')
  
  // Mock provider data
  const providers: ProviderMetrics[] = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      role: 'Medical Director',
      revenue: {
        today: 6800,
        week: 42000,
        month: 168000,
        year: 2016000
      },
      services: {
        today: 14,
        week: 82,
        month: 328,
        avgPerDay: 16.4
      },
      performance: {
        utilization: 92,
        avgTicket: 512,
        rebookingRate: 78,
        satisfaction: 4.9,
        productivityScore: 94
      },
      specialties: [
        { category: 'Injectables', count: 180, revenue: 108000 },
        { category: 'Laser', count: 89, revenue: 35600 },
        { category: 'Consultations', count: 59, revenue: 24400 }
      ],
      commission: {
        services: 33600,
        products: 2400,
        tips: 1800,
        total: 37800
      },
      trends: [
        { month: 'May', revenue: 155000, services: 310 },
        { month: 'Jun', revenue: 162000, services: 325 },
        { month: 'Jul', revenue: 168000, services: 328 },
        { month: 'Aug', revenue: 168000, services: 328 }
      ]
    },
    {
      id: '2',
      name: 'Dr. Michael Lee',
      role: 'Senior Injector',
      revenue: {
        today: 5200,
        week: 32000,
        month: 128000,
        year: 1536000
      },
      services: {
        today: 11,
        week: 64,
        month: 256,
        avgPerDay: 12.8
      },
      performance: {
        utilization: 85,
        avgTicket: 500,
        rebookingRate: 72,
        satisfaction: 4.8,
        productivityScore: 88
      },
      specialties: [
        { category: 'Injectables', count: 140, revenue: 84000 },
        { category: 'Fillers', count: 76, revenue: 30400 },
        { category: 'PDO Threads', count: 40, revenue: 13600 }
      ],
      commission: {
        services: 25600,
        products: 1600,
        tips: 1200,
        total: 28400
      },
      trends: [
        { month: 'May', revenue: 118000, services: 240 },
        { month: 'Jun', revenue: 122000, services: 248 },
        { month: 'Jul', revenue: 125000, services: 252 },
        { month: 'Aug', revenue: 128000, services: 256 }
      ]
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Lead Aesthetician',
      revenue: {
        today: 3600,
        week: 22000,
        month: 88000,
        year: 1056000
      },
      services: {
        today: 18,
        week: 110,
        month: 440,
        avgPerDay: 22
      },
      performance: {
        utilization: 88,
        avgTicket: 200,
        rebookingRate: 85,
        satisfaction: 4.95,
        productivityScore: 90
      },
      specialties: [
        { category: 'Facials', count: 280, revenue: 56000 },
        { category: 'Chemical Peels', count: 120, revenue: 24000 },
        { category: 'Microneedling', count: 40, revenue: 8000 }
      ],
      commission: {
        services: 13200,
        products: 3200,
        tips: 2200,
        total: 18600
      },
      trends: [
        { month: 'May', revenue: 82000, services: 420 },
        { month: 'Jun', revenue: 84000, services: 425 },
        { month: 'Jul', revenue: 86000, services: 435 },
        { month: 'Aug', revenue: 88000, services: 440 }
      ]
    }
  ]
  
  const radarData = [
    { metric: 'Utilization', value: 92, fullMark: 100 },
    { metric: 'Avg Ticket', value: 85, fullMark: 100 },
    { metric: 'Rebooking', value: 78, fullMark: 100 },
    { metric: 'Satisfaction', value: 98, fullMark: 100 },
    { metric: 'Productivity', value: 94, fullMark: 100 }
  ]
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  const getChangeIndicator = (value: number, isPositive: boolean = true) => {
    const expectedPositive = value >= 0
    const color = (isPositive && expectedPositive) || (!isPositive && !expectedPositive) 
      ? 'text-green-600' 
      : 'text-red-600'
    
    return (
      <div className={`flex items-center gap-1 text-sm ${color}`}>
        {expectedPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {Math.abs(value).toFixed(1)}%
      </div>
    )
  }
  
  const selectedProviderData = selectedProvider === 'all'
    ? null
    : providers.find(p => p.id === selectedProvider)

  // Prepare export data
  const exportData = useMemo(() => {
    const dataToExport = selectedProvider === 'all' ? providers : providers.filter(p => p.id === selectedProvider)
    return dataToExport.map(p => ({
      name: p.name,
      role: p.role,
      revenueToday: p.revenue.today,
      revenueWeek: p.revenue.week,
      revenueMonth: p.revenue.month,
      revenueYear: p.revenue.year,
      servicesToday: p.services.today,
      servicesWeek: p.services.week,
      servicesMonth: p.services.month,
      avgServicesPerDay: p.services.avgPerDay,
      utilization: p.performance.utilization,
      avgTicket: p.performance.avgTicket,
      rebookingRate: p.performance.rebookingRate,
      satisfaction: p.performance.satisfaction,
      productivityScore: p.performance.productivityScore,
      commissionServices: p.commission.services,
      commissionProducts: p.commission.products,
      tips: p.commission.tips,
      totalCommission: p.commission.total,
    }))
  }, [providers, selectedProvider])

  const exportColumns: ExportColumn[] = [
    { key: 'name', header: 'Provider Name' },
    { key: 'role', header: 'Role' },
    { key: 'revenueToday', header: 'Revenue (Today)', formatter: formatters.currency },
    { key: 'revenueWeek', header: 'Revenue (Week)', formatter: formatters.currency },
    { key: 'revenueMonth', header: 'Revenue (Month)', formatter: formatters.currency },
    { key: 'revenueYear', header: 'Revenue (Year)', formatter: formatters.currency },
    { key: 'servicesToday', header: 'Services (Today)', formatter: formatters.number },
    { key: 'servicesMonth', header: 'Services (Month)', formatter: formatters.number },
    { key: 'avgServicesPerDay', header: 'Avg Services/Day', formatter: formatters.number },
    { key: 'utilization', header: 'Utilization %', formatter: formatters.percentage },
    { key: 'avgTicket', header: 'Avg Ticket', formatter: formatters.currency },
    { key: 'rebookingRate', header: 'Rebooking Rate %', formatter: formatters.percentage },
    { key: 'satisfaction', header: 'Satisfaction', formatter: formatters.number },
    { key: 'productivityScore', header: 'Productivity Score', formatter: formatters.percentage },
    { key: 'commissionServices', header: 'Service Commission', formatter: formatters.currency },
    { key: 'commissionProducts', header: 'Product Commission', formatter: formatters.currency },
    { key: 'tips', header: 'Tips', formatter: formatters.currency },
    { key: 'totalCommission', header: 'Total Commission', formatter: formatters.currency },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Provider Performance</h2>
            <p className="text-gray-600">Individual provider metrics and productivity analysis</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Providers</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <ExportButton
              data={exportData}
              columns={exportColumns}
              filename="provider-performance"
              title="Provider Performance Report"
            />
          </div>
        </div>
      </div>
      
      {/* Provider Cards Grid */}
      {selectedProvider === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div key={provider.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-600">{provider.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(provider.revenue.month)}</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Services</p>
                  <p className="text-lg font-semibold">{provider.services.month}</p>
                  {getChangeIndicator(8.5)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Ticket</p>
                  <p className="text-lg font-semibold">{formatCurrency(provider.performance.avgTicket)}</p>
                  {getChangeIndicator(3.2)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Utilization</p>
                  <p className="text-lg font-semibold">{provider.performance.utilization}%</p>
                  {getChangeIndicator(-2.1, false)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Satisfaction</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-semibold">{provider.performance.satisfaction}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Top Specialties</span>
                  <button
                    onClick={() => setSelectedProvider(provider.id)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    View Details <ChevronRight className="w-3 h-3 inline" />
                  </button>
                </div>
                <div className="space-y-2">
                  {provider.specialties.slice(0, 2).map((specialty, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{specialty.category}</span>
                      <span className="font-medium">{formatCurrency(specialty.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700">Commission (MTD)</span>
                  <span className="font-bold text-purple-900">{formatCurrency(provider.commission.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Individual Provider Detail View */}
      {selectedProviderData && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                {getChangeIndicator(12.5)}
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedProviderData.revenue.month)}</p>
              <p className="text-sm text-gray-600">Revenue (MTD)</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <Activity className="w-5 h-5 text-purple-600" />
                {getChangeIndicator(8.3)}
              </div>
              <p className="text-2xl font-bold text-gray-900">{selectedProviderData.services.month}</p>
              <p className="text-sm text-gray-600">Services Performed</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                {getChangeIndicator(3.2)}
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedProviderData.performance.avgTicket)}</p>
              <p className="text-sm text-gray-600">Average Ticket</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <p className="text-2xl font-bold text-gray-900">{selectedProviderData.performance.satisfaction}</p>
              </div>
              <p className="text-sm text-gray-600">Patient Satisfaction</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={selectedProviderData.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#9333ea" 
                    strokeWidth={2}
                    dot={{ fill: '#9333ea' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="services" 
                    stroke="#ec4899" 
                    strokeWidth={2}
                    dot={{ fill: '#ec4899' }}
                    yAxisId="right"
                  />
                  <YAxis yAxisId="right" orientation="right" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Performance Radar */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar 
                    name="Performance" 
                    dataKey="value" 
                    stroke="#9333ea" 
                    fill="#9333ea" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Service Categories */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Categories</h3>
              <div className="space-y-4">
                {selectedProviderData.specialties.map((specialty, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{specialty.category}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{specialty.count} services</span>
                        <span className="text-sm font-semibold">{formatCurrency(specialty.revenue)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                        style={{ width: `${(specialty.revenue / selectedProviderData.revenue.month) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Commission Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Breakdown (MTD)</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Service Commission</span>
                  <span className="font-semibold">{formatCurrency(selectedProviderData.commission.services)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Product Commission</span>
                  <span className="font-semibold">{formatCurrency(selectedProviderData.commission.products)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Tips</span>
                  <span className="font-semibold">{formatCurrency(selectedProviderData.commission.tips)}</span>
                </div>
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Commission</span>
                  <span className="text-lg font-bold text-purple-600">
                    {formatCurrency(selectedProviderData.commission.total)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">Commission Rate: 20%</p>
                  <p className="text-xs">Next tier at {formatCurrency(200000)} monthly revenue</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-600">Utilization Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{selectedProviderData.performance.utilization}%</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${selectedProviderData.performance.utilization}%` }}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Rebooking Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{selectedProviderData.performance.rebookingRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Target: 80%</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Services/Day</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{selectedProviderData.services.avgPerDay}</p>
              <p className="text-xs text-gray-500 mt-1">20 day average</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Productivity Score</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{selectedProviderData.performance.productivityScore}%</p>
              <p className="text-xs text-green-600 mt-1">Top 10% performer</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}