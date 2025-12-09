'use client'

import { useState } from 'react'
import {
  CreditCard,
  DollarSign,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package,
  Gift,
  MoreVertical
} from 'lucide-react'

interface Transaction {
  id: string
  date: Date
  time: string
  patient: {
    name: string
    id: string
  }
  invoice: string
  method: 'card' | 'cash' | 'check' | 'package' | 'gift_card' | 'membership'
  cardLast4?: string
  amount: number
  fees?: number
  netAmount: number
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'partial_refund'
  refundAmount?: number
  provider: string
  notes?: string
}

export function PaymentTransactionsReport() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('today')
  const [filterMethod, setFilterMethod] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Mock transactions data
  const transactions: Transaction[] = [
    {
      id: 'TXN-001',
      date: new Date(),
      time: '2:45 PM',
      patient: { name: 'Sarah Johnson', id: 'PT-001' },
      invoice: 'INV-2024-0892',
      method: 'card',
      cardLast4: '4242',
      amount: 850,
      fees: 24.65,
      netAmount: 825.35,
      status: 'completed',
      provider: 'Dr. Sarah Chen'
    },
    {
      id: 'TXN-002',
      date: new Date(),
      time: '2:15 PM',
      patient: { name: 'Michael Davis', id: 'PT-045' },
      invoice: 'INV-2024-0891',
      method: 'cash',
      amount: 350,
      netAmount: 350,
      status: 'completed',
      provider: 'Emily Rodriguez'
    },
    {
      id: 'TXN-003',
      date: new Date(),
      time: '1:30 PM',
      patient: { name: 'Emma Wilson', id: 'PT-023' },
      invoice: 'INV-2024-0890',
      method: 'package',
      amount: 600,
      netAmount: 600,
      status: 'completed',
      provider: 'Dr. Michael Lee',
      notes: 'Redeemed 2 Botox sessions from package'
    },
    {
      id: 'TXN-004',
      date: new Date(),
      time: '12:00 PM',
      patient: { name: 'James Smith', id: 'PT-067' },
      invoice: 'INV-2024-0889',
      method: 'card',
      cardLast4: '8765',
      amount: 1200,
      fees: 34.80,
      netAmount: 1165.20,
      status: 'partial_refund',
      refundAmount: 200,
      provider: 'Dr. Sarah Chen',
      notes: 'Partial refund for unused product'
    },
    {
      id: 'TXN-005',
      date: new Date(),
      time: '11:30 AM',
      patient: { name: 'Lisa Park', id: 'PT-089' },
      invoice: 'INV-2024-0888',
      method: 'gift_card',
      amount: 450,
      netAmount: 450,
      status: 'completed',
      provider: 'Jessica Park'
    },
    {
      id: 'TXN-006',
      date: new Date(),
      time: '10:45 AM',
      patient: { name: 'Robert Chen', id: 'PT-034' },
      invoice: 'INV-2024-0887',
      method: 'card',
      cardLast4: '1234',
      amount: 2500,
      fees: 72.50,
      netAmount: 2427.50,
      status: 'failed',
      provider: 'Dr. Michael Lee',
      notes: 'Card declined - insufficient funds'
    }
  ]
  
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
  
  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'refunded':
      case 'partial_refund':
        return <RefreshCw className="w-4 h-4 text-orange-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }
  
  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      case 'refunded':
      case 'partial_refund':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }
  
  const getMethodIcon = (method: Transaction['method']) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4 text-blue-600" />
      case 'cash':
        return <DollarSign className="w-4 h-4 text-green-600" />
      case 'package':
        return <Package className="w-4 h-4 text-purple-600" />
      case 'gift_card':
        return <Gift className="w-4 h-4 text-pink-600" />
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />
    }
  }
  
  // Calculate summary stats
  const stats = {
    totalProcessed: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
    totalFees: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.fees || 0), 0),
    totalNet: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.netAmount, 0),
    totalRefunded: transactions.filter(t => t.status === 'refunded' || t.status === 'partial_refund')
      .reduce((sum, t) => sum + (t.refundAmount || t.amount), 0),
    transactionCount: transactions.filter(t => t.status === 'completed').length,
    averageTransaction: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0) / 
      transactions.filter(t => t.status === 'completed').length || 0
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Transactions</h2>
            <p className="text-gray-600">Detailed transaction history and payment processing</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Processed Today</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalProcessed)}</p>
          <p className="text-xs text-gray-500">{stats.transactionCount} transactions</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Processing Fees</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalFees)}</p>
          <p className="text-xs text-gray-500">2.9% avg rate</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Net Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalNet)}</p>
          <p className="text-xs text-gray-500">After fees</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Refunded</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalRefunded)}</p>
          <p className="text-xs text-gray-500">2 refunds</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Avg Transaction</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageTransaction)}</p>
          <p className="text-xs text-gray-500">Per payment</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-600">1</p>
          <p className="text-xs text-gray-500">{formatCurrency(2500)}</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patient, invoice, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
            
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Methods</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="package">Package</option>
              <option value="gift_card">Gift Card</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  <button 
                    onClick={() => {
                      setSortBy('date')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Date/Time
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Transaction ID</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Patient</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Invoice</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Method</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                  <button 
                    onClick={() => {
                      setSortBy('amount')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Amount
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Fees</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Net</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Provider</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{formatDate(txn.date)}</div>
                      <div className="text-gray-500">{txn.time}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-gray-900">{txn.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{txn.patient.name}</div>
                      <div className="text-gray-500">#{txn.patient.id}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      {txn.invoice}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(txn.method)}
                      <div className="text-sm">
                        <div className="capitalize text-gray-900">{txn.method.replace('_', ' ')}</div>
                        {txn.cardLast4 && (
                          <div className="text-xs text-gray-500">****{txn.cardLast4}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">{formatCurrency(txn.amount)}</div>
                      {txn.refundAmount && (
                        <div className="text-xs text-orange-600">-{formatCurrency(txn.refundAmount)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600">
                    {txn.fees ? formatCurrency(txn.fees) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">
                    {formatCurrency(txn.netAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(txn.status)}
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(txn.status)}`}>
                        {txn.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {txn.provider}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative group">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                          View Details
                        </button>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                          View Invoice
                        </button>
                        {txn.status === 'completed' && (
                          <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-orange-600">
                            Issue Refund
                          </button>
                        )}
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                          Download Receipt
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of{' '}
            <span className="font-medium">48</span> results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 border border-purple-600 bg-purple-600 text-white rounded">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}