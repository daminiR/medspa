'use client'

import { useState, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import { InvoiceView } from '@/components/billing/InvoiceView'
import { PatientCheckout } from '@/components/billing/PatientCheckout'
import { EnhancedPaymentForm } from '@/components/payments/EnhancedPaymentForm'
import { JaneStyleBillingView } from '@/components/billing/JaneStyleBillingView'
import { PackageSellModal } from '@/components/packages/PackageSellModal'
import { MembershipEnrollmentModal } from '@/components/memberships/MembershipEnrollmentModal'
import { GiftCardManager } from '@/components/payments/GiftCardManager'
import PaymentPlanManagement from '@/components/billing/PaymentPlanManagement'
import { useInvoice } from '@/contexts/InvoiceContext'
import {
  Search,
  Filter,
  Plus,
  Download,
  Send,
  DollarSign,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Syringe,
  Calendar,
  TrendingUp,
  Receipt,
  MoreVertical,
  Gift,
  Eye,
  Edit,
  Printer,
  Mail,
  RefreshCw,
  User
} from 'lucide-react'
import { mockInvoices, mockPackages, mockMemberships } from '@/lib/mockBillingData'
import { Invoice, PaymentMethod } from '@/types/billing'

export default function BillingPage() {
  const { currentInvoice, createInvoice } = useInvoice()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | Invoice['status']>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('month')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'invoices' | 'packages' | 'memberships' | 'gift-cards' | 'payment-plans'>('invoices')
  const [showInjectableBilling, setShowInjectableBilling] = useState(false)
  const [showInvoiceView, setShowInvoiceView] = useState(false)
  const [selectedPatient] = useState({ id: 'PT-001', name: 'Sarah Johnson' }) // Mock patient
  const [showCheckoutFlow, setShowCheckoutFlow] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null)
  const [selectedPackageToSell, setSelectedPackageToSell] = useState<any>(null)
  const [selectedMembershipToEnroll, setSelectedMembershipToEnroll] = useState<any>(null)

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let filtered = [...mockInvoices]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.patientName.toLowerCase().includes(query) ||
        invoice.practitionerName.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus)
    }

    // Date range filter - temporarily disabled to always show invoices
    // We'll show all invoices for testing purposes
    // In production, you'd want proper date filtering
    
    switch (dateRange) {
      case 'today':
        // Show recent invoices for testing
        break
      case 'week':
        // Show recent invoices for testing
        break
      case 'month':
        // Show all invoices for testing
        break
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime())

    return filtered
  }, [searchQuery, filterStatus, dateRange])

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todaysInvoices = mockInvoices.filter(inv => 
      inv.invoiceDate >= today
    )
    
    return {
      todayRevenue: todaysInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
      monthRevenue: mockInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
      outstandingBalance: mockInvoices.reduce((sum, inv) => sum + inv.balance, 0),
      overdueCount: mockInvoices.filter(inv => 
        inv.status === 'overdue' || (inv.balance > 0 && inv.dueDate < today)
      ).length,
      paidToday: todaysInvoices.filter(inv => inv.status === 'paid').length,
      pendingCount: mockInvoices.filter(inv => inv.balance > 0).length
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'partially_paid':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'overdue':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'sent':
      case 'viewed':
        return <Send className="w-4 h-4 text-blue-500" />
      case 'draft':
        return <FileText className="w-4 h-4 text-gray-400" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700'
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-700'
      case 'overdue':
        return 'bg-red-100 text-red-700'
      case 'sent':
      case 'viewed':
        return 'bg-blue-100 text-blue-700'
      case 'draft':
        return 'bg-gray-100 text-gray-700'
      case 'cancelled':
      case 'refunded':
        return 'bg-gray-100 text-gray-500'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        return <CreditCard className="w-3 h-3" />
      case PaymentMethod.CASH:
        return <DollarSign className="w-3 h-3" />
      case PaymentMethod.PACKAGE_CREDIT:
      case PaymentMethod.MEMBERSHIP_CREDIT:
        return <Package className="w-3 h-3" />
      default:
        return <DollarSign className="w-3 h-3" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-500 mt-1">Manage invoices, payments, and financial transactions</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCheckoutFlow(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
          >
            <User className="w-4 h-4" />
            Process Payment
          </button>
          {currentInvoice && (
            <button 
              onClick={() => setShowInvoiceView(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Active Checkout ({currentInvoice.lineItems.length} items)
            </button>
          )}
        </div>
      </div>

      {/* Jane-style appointment list for front desk */}
      <div className="mb-6">
        <JaneStyleBillingView />
      </div>
      
      {/* Stats Cards - Hidden as info now in Command Center */}
      {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todayRevenue)}</p>
          <p className="text-sm text-gray-600">Today's Revenue</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthRevenue)}</p>
          <p className="text-sm text-gray-600">Month Revenue</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.outstandingBalance)}</p>
          <p className="text-sm text-gray-600">Outstanding</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.overdueCount}</p>
          <p className="text-sm text-gray-600">Overdue</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.paidToday}</p>
          <p className="text-sm text-gray-600">Paid Today</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
      </div> */}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'invoices'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Invoices
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'packages'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Packages
          </button>
          <button
            onClick={() => setActiveTab('memberships')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'memberships'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Memberships
          </button>
          <button
            onClick={() => setActiveTab('gift-cards')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'gift-cards'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Gift className="w-4 h-4 inline mr-2" />
            Gift Cards
          </button>
          <button
            onClick={() => setActiveTab('payment-plans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'payment-plans'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Payment Plans
          </button>
        </nav>
      </div>

      {activeTab === 'invoices' && (
        <>
          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by invoice #, patient, practitioner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="overdue">Overdue</option>
                </select>

                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>

                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Invoice List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvoices(filteredInvoices.map(i => i.id))
                          } else {
                            setSelectedInvoices([])
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Invoice #</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Patient</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Services</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Provider</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Total</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Paid</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Balance</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoices([...selectedInvoices, invoice.id])
                            } else {
                              setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id))
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{invoice.patientName}</div>
                          <div className="text-gray-500">#{invoice.patientId.slice(-4).toUpperCase()}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {invoice.lineItems.map((item, idx) => (
                            <div key={item.id} className="flex items-center gap-1">
                              {item.type === 'unit' && item.unitType === 'unit' && (
                                <Syringe className="w-3 h-3 text-purple-500" />
                              )}
                              {item.type === 'package' && (
                                <Package className="w-3 h-3 text-blue-500" />
                              )}
                              <span className="text-gray-700">
                                {item.name}
                                {item.unitType && ` (${item.quantity} ${item.unitType}s)`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {invoice.practitionerName}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {invoice.amountPaid > 0 ? (
                          <div className="flex items-center gap-1">
                            {invoice.payments[0] && getPaymentMethodIcon(invoice.payments[0].method)}
                            <span className="text-green-600 font-medium">
                              {formatCurrency(invoice.amountPaid)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {invoice.balance > 0 ? (
                          <span className="font-medium text-red-600">
                            {formatCurrency(invoice.balance)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.status)}
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                            {invoice.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {invoice.status !== 'paid' && invoice.balance > 0 ? (
                            <button 
                              onClick={() => {
                                setSelectedInvoiceForPayment(invoice)
                                setShowPaymentForm(true)
                              }}
                              className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all" 
                            >
                              <DollarSign className="w-4 h-4 inline mr-1" />
                              Process Payment
                            </button>
                          ) : invoice.status === 'paid' ? (
                            <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Paid
                            </span>
                          ) : null}
                          
                          <div className="flex items-center gap-1">
                            <button className="p-2 hover:bg-gray-100 rounded-lg" title="View Invoice">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Send">
                              <Mail className="w-4 h-4 text-gray-600" />
                            </button>
                            <div className="relative group">
                              <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </button>
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2">
                                  <Printer className="w-4 h-4" />
                                  Print Invoice
                                </button>
                                {invoice.status === 'paid' && (
                                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-red-600">
                                    <RefreshCw className="w-4 h-4" />
                                    Issue Refund
                                  </button>
                                )}
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2">
                                  <Edit className="w-4 h-4" />
                                  Edit Invoice
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredInvoices.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No invoices found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <Package className="w-8 h-8 text-purple-600" />
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  Active
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Regular Price</span>
                  <span className="line-through text-gray-400">{formatCurrency(pkg.regularPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sale Price</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(pkg.salePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Savings</span>
                  <span className="text-green-600 font-medium">{formatCurrency(pkg.savings)}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setSelectedPackageToSell(pkg)}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm hover:shadow-md"
                >
                  Sell Package
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'memberships' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockMemberships.map((membership) => (
            <div key={membership.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  membership.tier === 'platinum' ? 'bg-gray-800' :
                  membership.tier === 'gold' ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`}>
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="capitalize text-sm font-medium text-gray-700">
                  {membership.tier}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{membership.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{membership.description}</p>
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(membership.price)}
                  <span className="text-sm font-normal text-gray-500">/{membership.billingCycle}</span>
                </div>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{membership.benefits.discountPercentage}% off all services</span>
                </div>
                {membership.benefits.includedServices.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{service.quantity} {service.serviceName}/{service.resetPeriod}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setSelectedMembershipToEnroll(membership)}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors shadow-sm hover:shadow-md"
              >
                Enroll Patient
              </button>
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'gift-cards' && (
        <GiftCardManager />
      )}

      {activeTab === 'payment-plans' && (
        <PaymentPlanManagement />
      )}

      {/* Patient Checkout Flow */}
      {showCheckoutFlow && (
        <PatientCheckout
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          appointmentTime="2:00 PM"
          onClose={() => setShowCheckoutFlow(false)}
        />
      )}
      
      {/* Quick Invoice View (for existing active checkout) */}
      {showInvoiceView && currentInvoice && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <InvoiceView 
              onClose={() => setShowInvoiceView(false)}
              onAddItem={() => {
                setShowInvoiceView(false)
                setShowCheckoutFlow(true)
              }}
              onPayment={() => {
                setShowInvoiceView(false)
                setShowCheckoutFlow(true)
              }}
            />
          </div>
        </div>
      )}
      
      {/* Enhanced Payment Form */}
      {showPaymentForm && selectedInvoiceForPayment && (
        <EnhancedPaymentForm
          invoiceTotal={selectedInvoiceForPayment.balance > 0 ? selectedInvoiceForPayment.balance : selectedInvoiceForPayment.total}
          patientId={selectedInvoiceForPayment.patientId}
          onComplete={(payments, metadata) => {
            console.log('Payment completed:', { payments, metadata })
            setShowPaymentForm(false)
            setSelectedInvoiceForPayment(null)
            // Would update invoice status here
          }}
          onCancel={() => {
            setShowPaymentForm(false)
            setSelectedInvoiceForPayment(null)
          }}
        />
      )}
      
      {/* Package Sell Modal */}
      {selectedPackageToSell && (
        <PackageSellModal
          package={{
            ...selectedPackageToSell,
            services: [
              { name: 'Botox', quantity: 2, value: 600 },
              { name: 'Lip Filler', quantity: 1, value: 800 },
              { name: 'Chemical Peel', quantity: 3, value: 350 }
            ],
            validityDays: 365,
            termsAndConditions: 'Package must be used within 1 year of purchase.'
          }}
          onClose={() => setSelectedPackageToSell(null)}
          onComplete={(saleData) => {
            console.log('Package sold:', saleData)
            setSelectedPackageToSell(null)
            // Would update package credits here
            alert(`Package sold successfully! ${saleData.patient.name} now has ${saleData.quantity} ${saleData.package.name} package(s).`)
          }}
        />
      )}
      
      {/* Membership Enrollment Modal */}
      {selectedMembershipToEnroll && (
        <MembershipEnrollmentModal
          membership={{
            ...selectedMembershipToEnroll,
            terms: {
              minimumCommitment: 3,
              cancellationNotice: 30,
              autoRenew: true
            },
            benefits: {
              ...selectedMembershipToEnroll.benefits,
              additionalPerks: [
                'Birthday gift treatment',
                'Priority booking',
                'Free skin analysis quarterly',
                'Member-only events'
              ],
              rolloverLimit: 1
            }
          }}
          onClose={() => setSelectedMembershipToEnroll(null)}
          onComplete={(enrollmentData) => {
            console.log('Membership enrolled:', enrollmentData)
            setSelectedMembershipToEnroll(null)
            alert(`${enrollmentData.patient.name} successfully enrolled in ${enrollmentData.membership.name}! Recurring billing will start on ${enrollmentData.startDate.toLocaleDateString()}.`)
          }}
        />
      )}
      </div>
    </div>
  )
}