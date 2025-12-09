'use client'

import React, { useState, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import { 
  DollarSign, 
  Calendar,
  Download,
  ChevronRight,
  CreditCard,
  Banknote,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Calculator,
  FileText,
  TrendingUp
} from 'lucide-react'
import { format, startOfDay, endOfDay } from 'date-fns'

// Mock data generation
const generateTransactions = () => {
  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Check', 'Gift Card', 'Package Redemption']
  const transactions = []
  
  // Generate 50 transactions for today
  for (let i = 0; i < 50; i++) {
    const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    const amount = Math.floor(Math.random() * 500) + 50
    const time = new Date()
    time.setHours(8 + Math.floor(Math.random() * 10))
    time.setMinutes(Math.floor(Math.random() * 60))
    
    transactions.push({
      id: `INV-${1000 + i}`,
      time: format(time, 'h:mm a'),
      client: `Client ${i + 1}`,
      service: ['Botox', 'Filler', 'Chemical Peel', 'Microneedling', 'Laser'][Math.floor(Math.random() * 5)],
      method,
      amount,
      status: Math.random() > 0.1 ? 'completed' : 'pending',
      provider: ['Dr. Smith', 'Dr. Johnson', 'Sarah RN', 'Emily NP'][Math.floor(Math.random() * 4)]
    })
  }
  
  return transactions.sort((a, b) => a.time.localeCompare(b.time))
}

const generateCashMovements = () => {
  return [
    { type: 'Opening Float', amount: 500, time: '8:00 AM', user: 'Admin' },
    { type: 'Cash Payment', amount: 250, time: '9:15 AM', user: 'Sarah RN' },
    { type: 'Cash Payment', amount: 150, time: '10:30 AM', user: 'Emily NP' },
    { type: 'Cash Payment', amount: 350, time: '11:45 AM', user: 'Dr. Smith' },
    { type: 'Cash Withdrawal', amount: -200, time: '12:00 PM', user: 'Admin', note: 'Petty cash' },
    { type: 'Cash Payment', amount: 175, time: '2:30 PM', user: 'Dr. Johnson' },
    { type: 'Cash Payment', amount: 425, time: '3:45 PM', user: 'Sarah RN' },
    { type: 'Cash Payment', amount: 200, time: '4:15 PM', user: 'Emily NP' },
  ]
}

export default function CashReconciliationPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [reconciliationStatus, setReconciliationStatus] = useState('pending')
  
  const transactions = useMemo(() => generateTransactions(), [])
  const cashMovements = useMemo(() => generateCashMovements(), [])
  
  // Calculate totals by payment method
  const paymentTotals = useMemo(() => {
    const totals = {}
    transactions.forEach(t => {
      if (t.status === 'completed') {
        totals[t.method] = (totals[t.method] || 0) + t.amount
      }
    })
    return totals
  }, [transactions])
  
  // Calculate cash specific totals
  const cashTotals = useMemo(() => {
    const openingFloat = 500
    const cashPayments = cashMovements
      .filter(m => m.type === 'Cash Payment')
      .reduce((sum, m) => sum + m.amount, 0)
    const cashWithdrawals = cashMovements
      .filter(m => m.type === 'Cash Withdrawal')
      .reduce((sum, m) => sum + Math.abs(m.amount), 0)
    
    return {
      openingFloat,
      cashPayments,
      cashWithdrawals,
      expectedClosing: openingFloat + cashPayments - cashWithdrawals,
      actualClosing: 0, // To be entered by user
      variance: 0
    }
  }, [cashMovements])
  
  // Summary stats
  const summary = {
    totalRevenue: Object.values(paymentTotals).reduce((sum, amount) => sum + amount, 0),
    cashRevenue: paymentTotals['Cash'] || 0,
    cardRevenue: (paymentTotals['Credit Card'] || 0) + (paymentTotals['Debit Card'] || 0),
    otherRevenue: (paymentTotals['Check'] || 0) + (paymentTotals['Gift Card'] || 0) + (paymentTotals['Package Redemption'] || 0),
    transactionCount: transactions.filter(t => t.status === 'completed').length,
    pendingCount: transactions.filter(t => t.status === 'pending').length
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
                <span>Cash Reconciliation</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Cash Reconciliation</h1>
              <p className="text-gray-600 mt-1">Daily cash drawer reconciliation and payment verification</p>
            </div>
            
            <div className="flex space-x-3">
              {reconciliationStatus === 'pending' ? (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete Reconciliation</span>
                </button>
              ) : (
                <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg flex items-center space-x-2" disabled>
                  <CheckCircle className="h-4 w-4" />
                  <span>Reconciled</span>
                </button>
              )}
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              />
              
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="all">All Locations</option>
                <option value="main">Main Clinic</option>
                <option value="downtown">Downtown</option>
              </select>

              <div className="ml-auto flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  reconciliationStatus === 'completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {reconciliationStatus === 'completed' ? 'Reconciled' : 'Pending Reconciliation'}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${summary.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{summary.transactionCount} transactions</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Banknote className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Cash Payments</p>
              <p className="text-2xl font-bold text-gray-900">${summary.cashRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{Math.round((summary.cashRevenue / summary.totalRevenue) * 100)}% of total</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Card Payments</p>
              <p className="text-2xl font-bold text-gray-900">${summary.cardRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{Math.round((summary.cardRevenue / summary.totalRevenue) * 100)}% of total</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-orange-600" />
                </div>
                {summary.pendingCount > 0 && (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">Other Payments</p>
              <p className="text-2xl font-bold text-gray-900">${summary.otherRevenue.toLocaleString()}</p>
              {summary.pendingCount > 0 && (
                <p className="text-xs text-orange-600 mt-1">{summary.pendingCount} pending</p>
              )}
            </div>
          </div>

          {/* Cash Drawer Reconciliation */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Cash Drawer Reconciliation</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Cash Movements</h3>
                  <div className="space-y-3">
                    {cashMovements.map((movement, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{movement.type}</p>
                          <p className="text-xs text-gray-500">{movement.time} • {movement.user}</p>
                          {movement.note && <p className="text-xs text-gray-400 italic">{movement.note}</p>}
                        </div>
                        <span className={`text-sm font-medium ${movement.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {movement.amount < 0 ? '-' : '+'}${Math.abs(movement.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Cash Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Opening Float</span>
                      <span className="text-sm font-medium">${cashTotals.openingFloat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cash Received</span>
                      <span className="text-sm font-medium text-green-600">+${cashTotals.cashPayments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cash Withdrawn</span>
                      <span className="text-sm font-medium text-red-600">-${cashTotals.cashWithdrawals}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">Expected Closing</span>
                        <span className="text-lg font-bold text-gray-900">${cashTotals.expectedClosing}</span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cash Count</label>
                      <input
                        type="number"
                        placeholder="Enter actual cash count"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">Variance: $0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Payment Method Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(paymentTotals).map(([method, amount]) => {
                    const count = transactions.filter(t => t.method === method && t.status === 'completed').length
                    return (
                      <tr key={method} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 flex items-center space-x-2">
                          {method === 'Cash' && <Banknote className="h-4 w-4 text-gray-400" />}
                          {(method === 'Credit Card' || method === 'Debit Card') && <CreditCard className="h-4 w-4 text-gray-400" />}
                          {method === 'Gift Card' && <CreditCard className="h-4 w-4 text-gray-400" />}
                          <span>{method}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{count}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">${Math.round(amount / count)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {Math.round((amount / summary.totalRevenue) * 100)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">All Transactions</h2>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{transaction.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.time}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.client}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.service}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.provider}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.method}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${transaction.amount}</td>
                      <td className="px-6 py-4 text-sm">
                        {transaction.status === 'completed' ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
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