'use client'

import React, { useState, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Users,
  Package,
  Download,
  Filter,
  ChevronRight,
  ShoppingBag,
  Percent,
  Tag,
  Gift,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Receipt
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, isWithinInterval } from 'date-fns'

// Mock data generation
const generateSalesData = (startDate: Date, endDate: Date) => {
  const services = [
    { name: 'Botox', unitPrice: 12, units: 450, revenue: 5400, avgUnits: 25, clients: 18 },
    { name: 'Dysport', unitPrice: 4, units: 1200, revenue: 4800, avgUnits: 60, clients: 20 },
    { name: 'Filler - Juvederm', unitPrice: 650, units: 8, revenue: 5200, avgUnits: 1.5, clients: 5 },
    { name: 'Filler - Restylane', unitPrice: 600, units: 7, revenue: 4200, avgUnits: 1.2, clients: 6 },
    { name: 'Chemical Peel', unitPrice: 150, units: 35, revenue: 5250, avgUnits: 1, clients: 35 },
    { name: 'Microneedling', unitPrice: 300, units: 28, revenue: 8400, avgUnits: 1, clients: 28 },
    { name: 'Laser Hair Removal', unitPrice: 200, units: 42, revenue: 8400, avgUnits: 1, clients: 42 },
    { name: 'IPL Photofacial', unitPrice: 350, units: 22, revenue: 7700, avgUnits: 1, clients: 22 },
  ]

  const packages = [
    { name: 'Botox Membership (3 sessions)', price: 1350, sold: 12, revenue: 16200, redemptions: 8 },
    { name: 'Glow Package (Peel + Microneedling)', price: 400, sold: 15, revenue: 6000, redemptions: 10 },
    { name: 'Laser Hair 6-Session Bundle', price: 1000, sold: 8, revenue: 8000, redemptions: 5 },
    { name: 'VIP Annual Membership', price: 2500, sold: 5, revenue: 12500, redemptions: 3 },
  ]

  const products = [
    { name: 'SkinCeuticals C E Ferulic', price: 166, sold: 25, revenue: 4150, category: 'Serum' },
    { name: 'Elta MD Sunscreen', price: 35, sold: 45, revenue: 1575, category: 'Sunscreen' },
    { name: 'Skinbetter AlphaRet', price: 125, sold: 18, revenue: 2250, category: 'Retinol' },
    { name: 'ZO Skin Health Growth Factor', price: 148, sold: 12, revenue: 1776, category: 'Serum' },
  ]

  const giftCards = [
    { amount: 100, sold: 15, revenue: 1500, redeemed: 8, outstanding: 700 },
    { amount: 250, sold: 8, revenue: 2000, redeemed: 3, outstanding: 1250 },
    { amount: 500, sold: 4, revenue: 2000, redeemed: 1, outstanding: 1500 },
    { amount: 'Custom', sold: 6, revenue: 1850, redeemed: 2, outstanding: 1200 },
  ]

  return { services, packages, products, giftCards }
}

const generateDailySales = () => {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i)
    days.push({
      date,
      services: 2500 + Math.random() * 1500,
      products: 500 + Math.random() * 300,
      packages: 800 + Math.random() * 500,
      giftCards: 200 + Math.random() * 200,
      total: 0
    })
    days[days.length - 1].total = 
      days[days.length - 1].services + 
      days[days.length - 1].products + 
      days[days.length - 1].packages + 
      days[days.length - 1].giftCards
  }
  return days
}

export default function SalesReportPage() {
  const [selectedDateRange, setSelectedDateRange] = useState('month')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const { startDate, endDate } = useMemo(() => {
    const today = new Date()
    switch (selectedDateRange) {
      case 'today':
        return { startDate: today, endDate: today }
      case 'week':
        return { startDate: startOfWeek(today), endDate: endOfWeek(today) }
      case 'month':
        return { startDate: startOfMonth(today), endDate: endOfMonth(today) }
      case 'quarter':
        return { startDate: subMonths(today, 3), endDate: today }
      case 'year':
        return { startDate: subMonths(today, 12), endDate: today }
      default:
        return { startDate: startOfMonth(today), endDate: endOfMonth(today) }
    }
  }, [selectedDateRange])

  const salesData = useMemo(() => generateSalesData(startDate, endDate), [startDate, endDate])
  const dailySales = useMemo(() => generateDailySales(), [])

  // Calculate totals
  const totals = {
    services: salesData.services.reduce((sum, s) => sum + s.revenue, 0),
    packages: salesData.packages.reduce((sum, p) => sum + p.revenue, 0),
    products: salesData.products.reduce((sum, p) => sum + p.revenue, 0),
    giftCards: salesData.giftCards.reduce((sum, g) => sum + g.revenue, 0),
  }
  totals.total = totals.services + totals.packages + totals.products + totals.giftCards

  // Calculate comparison (mock data)
  const comparison = {
    total: 12.5,
    services: 15.2,
    packages: 8.3,
    products: -2.1,
    giftCards: 18.7
  }

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
                <span>Financial</span>
                <ChevronRight className="h-4 w-4" />
                <span>Sales Report</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
              <p className="text-gray-600 mt-1">Track revenue across services, products, packages, and gift cards</p>
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
                <option value="custom">Custom Range</option>
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Categories</option>
                <option value="services">Services Only</option>
                <option value="products">Products Only</option>
                <option value="packages">Packages Only</option>
                <option value="giftcards">Gift Cards Only</option>
              </select>

              <div className="ml-auto text-sm text-gray-500">
                {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <span className={`text-sm flex items-center ${comparison.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.total >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(comparison.total)}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totals.total.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <span className={`text-sm flex items-center ${comparison.services >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.services >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(comparison.services)}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Service Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totals.services.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <span className={`text-sm flex items-center ${comparison.packages >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.packages >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(comparison.packages)}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Package Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totals.packages.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-orange-600" />
                </div>
                <span className={`text-sm flex items-center ${comparison.products >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.products >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(comparison.products)}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Product Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totals.products.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-pink-600" />
                </div>
                <span className={`text-sm flex items-center ${comparison.giftCards >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparison.giftCards >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(comparison.giftCards)}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Gift Card Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totals.giftCards.toLocaleString()}</p>
            </div>
          </div>

          {/* Services Breakdown */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Service Sales</h2>
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
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Units/Client</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Clients</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.services.map((service, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{service.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">${service.unitPrice}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{service.units}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${service.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{service.avgUnits}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{service.clients}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Packages Breakdown */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Package Sales</h2>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Redemptions</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Redemption Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.packages.map((pkg, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{pkg.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">${pkg.price}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{pkg.sold}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${pkg.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{pkg.redemptions}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {((pkg.redemptions / pkg.sold) * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Products Breakdown */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Product Sales</h2>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.products.map((product, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">${product.price}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{product.sold}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${product.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gift Cards */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Gift Card Sales</h2>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cards Sold</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Redeemed</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.giftCards.map((card, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {typeof card.amount === 'number' ? `$${card.amount}` : card.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{card.sold}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${card.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{card.redeemed}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">${card.outstanding.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}