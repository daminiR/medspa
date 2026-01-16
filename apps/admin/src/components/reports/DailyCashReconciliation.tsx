'use client'

import { useState, useMemo } from 'react'
import {
  DollarSign,
  CreditCard,
  Banknote,
  Calendar,
  Printer,
  TrendingUp,
  Users,
  Package,
  AlertCircle,
  Check,
  X
} from 'lucide-react'
import { ExportButton } from './ExportButton'
import { ExportColumn, formatters } from '@/lib/export'

interface PaymentBreakdown {
  cash: number
  creditCard: number
  debitCard: number
  check: number
  giftCard: number
  packageCredit: number
  other: number
}

interface ServiceBreakdown {
  injectables: number
  facials: number
  laser: number
  products: number
  packages: number
  other: number
}

interface DailyReconciliation {
  date: Date
  openingCash: number
  closingCash: number
  expectedCash: number
  variance: number
  payments: PaymentBreakdown
  services: ServiceBreakdown
  refunds: number
  discounts: number
  tips: number
  grossRevenue: number
  netRevenue: number
  transactionCount: number
  patientCount: number
  newPatients: number
}

// Mock data for today
const mockData: DailyReconciliation = {
  date: new Date('2025-08-27'),
  openingCash: 500,
  closingCash: 2847,
  expectedCash: 2850,
  variance: -3,
  payments: {
    cash: 2350,
    creditCard: 8456,
    debitCard: 1234,
    check: 500,
    giftCard: 300,
    packageCredit: 650,
    other: 0
  },
  services: {
    injectables: 7250,
    facials: 1200,
    laser: 2400,
    products: 890,
    packages: 1750,
    other: 0
  },
  refunds: 125,
  discounts: 450,
  tips: 285,
  grossRevenue: 13490,
  netRevenue: 12915,
  transactionCount: 28,
  patientCount: 24,
  newPatients: 3
}

export function DailyCashReconciliation() {
  const [reconciliationData, setReconciliationData] = useState<DailyReconciliation>(mockData)
  const [actualCash, setActualCash] = useState('')
  const [isReconciled, setIsReconciled] = useState(false)

  const handleReconcile = () => {
    const actual = parseFloat(actualCash)
    if (!isNaN(actual)) {
      setReconciliationData({
        ...reconciliationData,
        closingCash: actual,
        variance: actual - reconciliationData.expectedCash
      })
      setIsReconciled(true)
    }
  }

  const getTotalPayments = () => {
    return Object.values(reconciliationData.payments).reduce((sum, val) => sum + val, 0)
  }

  const getTotalServices = () => {
    return Object.values(reconciliationData.services).reduce((sum, val) => sum + val, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Prepare export data
  const exportData = useMemo(() => {
    const data = reconciliationData
    return [
      { category: 'Summary', item: 'Gross Revenue', value: data.grossRevenue },
      { category: 'Summary', item: 'Net Revenue', value: data.netRevenue },
      { category: 'Summary', item: 'Transaction Count', value: data.transactionCount },
      { category: 'Summary', item: 'Patient Count', value: data.patientCount },
      { category: 'Summary', item: 'New Patients', value: data.newPatients },
      { category: 'Cash Drawer', item: 'Opening Cash', value: data.openingCash },
      { category: 'Cash Drawer', item: 'Expected Cash', value: data.expectedCash },
      { category: 'Cash Drawer', item: 'Closing Cash', value: data.closingCash },
      { category: 'Cash Drawer', item: 'Variance', value: data.variance },
      { category: 'Payments', item: 'Cash', value: data.payments.cash },
      { category: 'Payments', item: 'Credit Card', value: data.payments.creditCard },
      { category: 'Payments', item: 'Debit Card', value: data.payments.debitCard },
      { category: 'Payments', item: 'Check', value: data.payments.check },
      { category: 'Payments', item: 'Gift Card', value: data.payments.giftCard },
      { category: 'Payments', item: 'Package Credit', value: data.payments.packageCredit },
      { category: 'Services', item: 'Injectables', value: data.services.injectables },
      { category: 'Services', item: 'Facials', value: data.services.facials },
      { category: 'Services', item: 'Laser', value: data.services.laser },
      { category: 'Services', item: 'Products', value: data.services.products },
      { category: 'Services', item: 'Packages', value: data.services.packages },
      { category: 'Adjustments', item: 'Refunds', value: data.refunds },
      { category: 'Adjustments', item: 'Discounts', value: data.discounts },
      { category: 'Adjustments', item: 'Tips', value: data.tips },
    ]
  }, [reconciliationData])

  const exportColumns: ExportColumn[] = [
    { key: 'category', header: 'Category' },
    { key: 'item', header: 'Item' },
    { key: 'value', header: 'Amount', formatter: formatters.currency },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Daily Cash Reconciliation</h2>
            <p className="text-sm text-gray-600 mt-1">
              <Calendar className="inline w-4 h-4 mr-1" />
              {reconciliationData.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <ExportButton
              data={exportData}
              columns={exportColumns}
              filename="cash-reconciliation"
              title="Daily Cash Reconciliation"
              dateRange={{
                start: reconciliationData.date.toISOString().split('T')[0],
                end: reconciliationData.date.toISOString().split('T')[0]
              }}
              variant="primary"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gross Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reconciliationData.grossRevenue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reconciliationData.netRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{reconciliationData.transactionCount}</p>
            </div>
            <Package className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Patients</p>
              <p className="text-2xl font-bold text-gray-900">
                {reconciliationData.patientCount}
                <span className="text-sm text-green-600 ml-2">+{reconciliationData.newPatients} new</span>
              </p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Reconciliation */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Drawer Reconciliation</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Opening Cash</span>
              <span className="font-medium">{formatCurrency(reconciliationData.openingCash)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Cash Sales</span>
              <span className="font-medium text-green-600">+{formatCurrency(reconciliationData.payments.cash)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Cash Refunds</span>
              <span className="font-medium text-red-600">-{formatCurrency(50)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b bg-gray-50 px-2 -mx-2">
              <span className="font-semibold text-gray-900">Expected Cash</span>
              <span className="font-bold">{formatCurrency(reconciliationData.expectedCash)}</span>
            </div>
            
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cash Count</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  placeholder="Enter actual cash count"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  step="0.01"
                />
                <button
                  onClick={handleReconcile}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Reconcile
                </button>
              </div>
            </div>
            
            {isReconciled && (
              <div className={`p-4 rounded-lg ${
                Math.abs(reconciliationData.variance) <= 5 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Math.abs(reconciliationData.variance) <= 5 ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                    <span className="font-medium">
                      Variance: {formatCurrency(reconciliationData.variance)}
                    </span>
                  </div>
                  <span className={`text-sm ${
                    Math.abs(reconciliationData.variance) <= 5 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {Math.abs(reconciliationData.variance) <= 5 ? 'Acceptable' : 'Review Required'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          
          <div className="space-y-3">
            {Object.entries(reconciliationData.payments).map(([method, amount]) => {
              if (amount === 0) return null
              const percentage = (amount / getTotalPayments()) * 100
              return (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {method === 'cash' && <Banknote className="w-5 h-5 text-green-600" />}
                    {method === 'creditCard' && <CreditCard className="w-5 h-5 text-blue-600" />}
                    {(method === 'debitCard' || method === 'check' || method === 'giftCard' || method === 'packageCredit' || method === 'other') && 
                      <DollarSign className="w-5 h-5 text-gray-600" />}
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">
                          {method.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-semibold">{formatCurrency(amount)}</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Payments</span>
                <span className="font-bold text-lg">{formatCurrency(getTotalPayments())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Revenue Breakdown */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h3>
          
          <div className="space-y-3">
            {Object.entries(reconciliationData.services).map(([service, amount]) => {
              if (amount === 0) return null
              const percentage = (amount / getTotalServices()) * 100
              return (
                <div key={service}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium capitalize">{service}</span>
                    <span className="font-semibold">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Adjustments */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjustments & Tips</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Discounts Applied</span>
              <span className="font-medium text-orange-600">-{formatCurrency(reconciliationData.discounts)}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Refunds Processed</span>
              <span className="font-medium text-red-600">-{formatCurrency(reconciliationData.refunds)}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tips Collected</span>
              <span className="font-medium text-green-600">+{formatCurrency(reconciliationData.tips)}</span>
            </div>
            
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Net Adjustments</span>
                <span className="font-bold">
                  {formatCurrency(reconciliationData.tips - reconciliationData.discounts - reconciliationData.refunds)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">End of Day Notes</h3>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          rows={3}
          placeholder="Add any notes about today's operations, discrepancies, or special circumstances..."
        />
        <div className="mt-4 flex justify-end">
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Complete Day Close
          </button>
        </div>
      </div>
    </div>
  )
}