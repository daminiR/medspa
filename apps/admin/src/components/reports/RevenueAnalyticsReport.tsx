'use client'

import { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  ChevronRight,
  Package,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface RevenueData {
  period: string
  services: number
  products: number
  packages: number
  memberships: number
  total: number
}

interface ServiceCategoryData {
  name: string
  revenue: number
  percentage: number
  growth: number
}

interface ProviderRevenue {
  name: string
  revenue: number
  services: number
  avgTicket: number
}

export function RevenueAnalyticsReport() {
  const [dateRange, setDateRange] = useState('month')
  const [comparison, setComparison] = useState('lastPeriod')
  
  // Mock data
  const monthlyData: RevenueData[] = [
    { period: 'Week 1', services: 45000, products: 5000, packages: 12000, memberships: 8000, total: 70000 },
    { period: 'Week 2', services: 52000, products: 6200, packages: 15000, memberships: 8500, total: 81700 },
    { period: 'Week 3', services: 48000, products: 4800, packages: 10000, memberships: 9000, total: 71800 },
    { period: 'Week 4', services: 58000, products: 7500, packages: 18000, memberships: 9200, total: 92700 }
  ]
  
  const serviceCategories: ServiceCategoryData[] = [
    { name: 'Injectables', revenue: 125000, percentage: 43.8, growth: 12.5 },
    { name: 'Laser Treatments', revenue: 68000, percentage: 23.8, growth: 8.2 },
    { name: 'Facials', revenue: 42000, percentage: 14.7, growth: 15.3 },
    { name: 'Body Contouring', revenue: 35000, percentage: 12.3, growth: -5.1 },
    { name: 'Other', revenue: 15200, percentage: 5.3, growth: 3.0 }
  ]
  
  const providerRevenue: ProviderRevenue[] = [
    { name: 'Dr. Sarah Chen', revenue: 68000, services: 142, avgTicket: 479 },
    { name: 'Dr. Michael Lee', revenue: 52000, services: 98, avgTicket: 531 },
    { name: 'Emily Rodriguez', revenue: 45000, services: 156, avgTicket: 288 },
    { name: 'Jessica Park', revenue: 38000, services: 134, avgTicket: 284 }
  ]
  
  const yearOverYearData = [
    { month: 'Jan', thisYear: 250000, lastYear: 210000 },
    { month: 'Feb', thisYear: 265000, lastYear: 225000 },
    { month: 'Mar', thisYear: 285000, lastYear: 240000 },
    { month: 'Apr', thisYear: 295000, lastYear: 255000 },
    { month: 'May', thisYear: 310000, lastYear: 270000 },
    { month: 'Jun', thisYear: 325000, lastYear: 285000 },
    { month: 'Jul', thisYear: 340000, lastYear: 295000 },
    { month: 'Aug', thisYear: 355000, lastYear: 0 }
  ]
  
  const pieColors = ['#9333ea', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  const currentTotal = 285200
  const previousTotal = 245800
  const percentChange = ((currentTotal - previousTotal) / previousTotal) * 100
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
            <p className="text-gray-600">Comprehensive revenue breakdown and trends</p>
          </div>
          <div className="flex gap-2">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 inline mr-2" />
              Filters
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            <div className={`flex items-center gap-1 text-sm ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {percentChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(percentChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(currentTotal)}</p>
          <p className="text-sm text-gray-600">Total Revenue (MTD)</p>
          <p className="text-xs text-gray-500 mt-1">vs {formatCurrency(previousTotal)} last month</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <Activity className="w-6 h-6 text-purple-600" />
            <span className="text-sm text-green-600">+8.2%</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(203000)}</p>
          <p className="text-sm text-gray-600">Service Revenue</p>
          <p className="text-xs text-gray-500 mt-1">71% of total revenue</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-green-600">+15.3%</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(55000)}</p>
          <p className="text-sm text-gray-600">Package Revenue</p>
          <p className="text-xs text-gray-500 mt-1">19% of total revenue</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <Users className="w-6 h-6 text-pink-600" />
            <span className="text-sm text-green-600">+22.1%</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(34200)}</p>
          <p className="text-sm text-gray-600">Membership MRR</p>
          <p className="text-xs text-gray-500 mt-1">156 active members</p>
        </div>
      </div>
      
      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={(value) => `$${value/1000}k`} />
            <Tooltip 
              formatter={(value: any) => formatCurrency(value)}
              labelStyle={{ color: '#111827' }}
            />
            <Legend />
            <Area type="monotone" dataKey="services" stackId="1" stroke="#9333ea" fill="#9333ea" fillOpacity={0.6} />
            <Area type="monotone" dataKey="packages" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="products" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            <Area type="monotone" dataKey="memberships" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Category Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service Category</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie
                    data={serviceCategories}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={false}
                  >
                    {serviceCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {serviceCategories.map((category, idx) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(category.revenue)}</p>
                    <p className="text-xs text-gray-500">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Provider Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Revenue Performance</h3>
          <div className="space-y-4">
            {providerRevenue.map((provider) => (
              <div key={provider.name} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{provider.name}</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(provider.revenue)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{provider.services} services</span>
                  <span>Avg: {formatCurrency(provider.avgTicket)}</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                    style={{ width: `${(provider.revenue / providerRevenue[0].revenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Year over Year Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Year over Year Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yearOverYearData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `$${value/1000}k`} />
            <Tooltip formatter={(value: any) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="lastYear" fill="#e5e7eb" name="Last Year" />
            <Bar dataKey="thisYear" fill="#9333ea" name="This Year" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Insights */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-900 mb-2">Key Insights</h4>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Injectables continue to be the highest revenue generator at 43.8% of service revenue
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Package sales increased 15.3% compared to last period - promotional campaigns working
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Membership MRR growth of 22.1% indicates strong retention and new enrollments
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Body Contouring showing -5.1% decline - consider staff training or equipment upgrade
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}