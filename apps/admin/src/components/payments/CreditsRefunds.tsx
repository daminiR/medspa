'use client'

import { useState } from 'react'
import {
  DollarSign,
  RefreshCw,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  History,
  Receipt,
  User,
  Calendar,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Shield,
  Info,
  Heart,
  Gift
} from 'lucide-react'

interface Credit {
  id: string
  patientId: string
  patientName: string
  amount: number
  originalAmount: number
  reason: string
  type: 'refund' | 'overpayment' | 'goodwill' | 'promotional' | 'cancellation'
  createdDate: Date
  expiryDate?: Date
  createdBy: string
  status: 'active' | 'used' | 'expired' | 'cancelled'
  usageHistory: CreditUsage[]
  notes?: string
}

interface CreditUsage {
  id: string
  date: Date
  amount: number
  invoiceId: string
  description: string
  remainingBalance: number
}

interface Refund {
  id: string
  invoiceId: string
  patientName: string
  originalAmount: number
  refundAmount: number
  reason: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  method: 'credit_card' | 'cash' | 'check' | 'patient_credit'
  processedDate?: Date
  requestedDate: Date
  requestedBy: string
  approvedBy?: string
  cardLast4?: string
}

export function CreditsRefunds() {
  const [activeTab, setActiveTab] = useState<'credits' | 'refunds'>('credits')
  const [showNewCreditForm, setShowNewCreditForm] = useState(false)
  const [showRefundForm, setShowRefundForm] = useState(false)
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null)
  
  // Form states
  const [creditAmount, setCreditAmount] = useState('')
  const [creditReason, setCreditReason] = useState('')
  const [creditType, setCreditType] = useState<Credit['type']>('goodwill')
  const [creditExpiry, setCreditExpiry] = useState('')
  const [creditNotes, setCreditNotes] = useState('')
  
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refundMethod, setRefundMethod] = useState<Refund['method']>('credit_card')
  const [refundNotes, setRefundNotes] = useState('')
  
  // Sample data
  const [credits] = useState<Credit[]>([
    {
      id: 'CREDIT-001',
      patientId: 'PAT-001',
      patientName: 'Sarah Johnson',
      amount: 150,
      originalAmount: 150,
      reason: 'Service not as expected',
      type: 'goodwill',
      createdDate: new Date('2024-12-20'),
      createdBy: 'Admin',
      status: 'active',
      usageHistory: [],
      notes: 'Customer complained about treatment results'
    },
    {
      id: 'CREDIT-002',
      patientId: 'PAT-002',
      patientName: 'Michael Chen',
      amount: 75,
      originalAmount: 200,
      reason: 'Overpayment on invoice INV-2024-1234',
      type: 'overpayment',
      createdDate: new Date('2024-12-15'),
      createdBy: 'Front Desk',
      status: 'active',
      usageHistory: [
        {
          id: 'USE-001',
          date: new Date('2024-12-22'),
          amount: 125,
          invoiceId: 'INV-2024-1456',
          description: 'Applied to facial treatment',
          remainingBalance: 75
        }
      ]
    },
    {
      id: 'CREDIT-003',
      patientId: 'PAT-003',
      patientName: 'Emily Davis',
      amount: 0,
      originalAmount: 500,
      reason: 'Promotional credit - New patient special',
      type: 'promotional',
      createdDate: new Date('2024-11-01'),
      expiryDate: new Date('2024-12-31'),
      createdBy: 'Marketing',
      status: 'used',
      usageHistory: [
        {
          id: 'USE-002',
          date: new Date('2024-11-15'),
          amount: 300,
          invoiceId: 'INV-2024-0987',
          description: 'Botox treatment',
          remainingBalance: 200
        },
        {
          id: 'USE-003',
          date: new Date('2024-12-01'),
          amount: 200,
          invoiceId: 'INV-2024-1123',
          description: 'Filler treatment',
          remainingBalance: 0
        }
      ]
    }
  ])
  
  const [refunds] = useState<Refund[]>([
    {
      id: 'REF-001',
      invoiceId: 'INV-2024-1234',
      patientName: 'John Doe',
      originalAmount: 450,
      refundAmount: 450,
      reason: 'Appointment cancelled - medical emergency',
      status: 'completed',
      method: 'credit_card',
      requestedDate: new Date('2024-12-18'),
      processedDate: new Date('2024-12-18'),
      requestedBy: 'Dr. Smith',
      approvedBy: 'Admin Manager',
      cardLast4: '4242'
    },
    {
      id: 'REF-002',
      invoiceId: 'INV-2024-1456',
      patientName: 'Jane Smith',
      originalAmount: 250,
      refundAmount: 125,
      reason: 'Partial refund - service adjustment',
      status: 'processing',
      method: 'patient_credit',
      requestedDate: new Date('2024-12-22'),
      requestedBy: 'Front Desk'
    },
    {
      id: 'REF-003',
      invoiceId: 'INV-2024-1789',
      patientName: 'Robert Brown',
      originalAmount: 800,
      refundAmount: 800,
      reason: 'Duplicate payment',
      status: 'pending',
      method: 'credit_card',
      requestedDate: new Date('2024-12-23'),
      requestedBy: 'Billing Department',
      cardLast4: '5555'
    }
  ])
  
  const creditTypes = [
    { id: 'refund', label: 'Refund Credit', icon: RefreshCw, color: 'blue' },
    { id: 'overpayment', label: 'Overpayment', icon: TrendingUp, color: 'green' },
    { id: 'goodwill', label: 'Goodwill', icon: Heart, color: 'pink' },
    { id: 'promotional', label: 'Promotional', icon: Gift, color: 'purple' },
    { id: 'cancellation', label: 'Cancellation', icon: X, color: 'red' }
  ]
  
  const stats = {
    totalCredits: credits.reduce((sum, c) => sum + c.amount, 0),
    activeCredits: credits.filter(c => c.status === 'active').length,
    pendingRefunds: refunds.filter(r => r.status === 'pending').length,
    totalRefundsThisMonth: refunds.filter(r => 
      r.processedDate && r.processedDate.getMonth() === new Date().getMonth()
    ).reduce((sum, r) => sum + r.refundAmount, 0)
  }
  
  const handleCreateCredit = () => {
    console.log('Creating credit...')
    setShowNewCreditForm(false)
    // Reset form
    setCreditAmount('')
    setCreditReason('')
    setCreditNotes('')
  }
  
  const handleProcessRefund = () => {
    console.log('Processing refund...')
    setShowRefundForm(false)
    // Reset form
    setRefundAmount('')
    setRefundReason('')
    setRefundNotes('')
  }
  
  const renderCreditsTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold">${stats.totalCredits}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Total Credits</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold">{stats.activeCredits}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Active Credits</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Clock className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold">3</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Expiring Soon</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
          <button
            onClick={() => setShowNewCreditForm(true)}
            className="w-full h-full flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
          >
            <Plus className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium">New Credit</span>
          </button>
        </div>
      </div>
      
      {/* New Credit Form */}
      {showNewCreditForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Create Patient Credit</h3>
            <button
              onClick={() => setShowNewCreditForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Select patient...</option>
                  <option>Sarah Johnson</option>
                  <option>Michael Chen</option>
                  <option>Emily Davis</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Amount
                </label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {creditTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setCreditType(type.id as Credit['type'])}
                      className={`p-2 rounded-lg border-2 transition-all text-xs ${
                        creditType === type.id
                          ? `border-${type.color}-500 bg-${type.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={creditExpiry}
                  onChange={(e) => setCreditExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Notes
                </label>
                <textarea
                  value={creditNotes}
                  onChange={(e) => setCreditNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional context..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowNewCreditForm(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCredit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Credit
            </button>
          </div>
        </div>
      )}
      
      {/* Credits List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Patient Credits</h3>
        {credits.map((credit) => (
          <div key={credit.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <h4 className="font-medium">{credit.patientName}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    credit.status === 'active' ? 'bg-green-100 text-green-700' :
                    credit.status === 'used' ? 'bg-gray-100 text-gray-700' :
                    credit.status === 'expired' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs bg-${
                    creditTypes.find(t => t.id === credit.type)?.color || 'gray'
                  }-100 text-${
                    creditTypes.find(t => t.id === credit.type)?.color || 'gray'
                  }-700`}>
                    {creditTypes.find(t => t.id === credit.type)?.label}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-500">Original Amount</p>
                    <p className="font-medium">${credit.originalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Balance</p>
                    <p className="font-medium text-green-600">${credit.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="font-medium">{credit.createdDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Reason</p>
                    <p className="font-medium text-sm">{credit.reason}</p>
                  </div>
                </div>
                
                {credit.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{credit.notes}</p>
                  </div>
                )}
                
                {credit.usageHistory.length > 0 && (
                  <div className="mt-4">
                    <button 
                      onClick={() => setSelectedCredit(credit)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <History className="w-4 h-4" />
                      View usage history ({credit.usageHistory.length})
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {credit.status === 'active' && (
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  
  const renderRefundsTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <RefreshCw className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold">{stats.pendingRefunds}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Pending Approval</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold">2</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Processing</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <TrendingDown className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold">${stats.totalRefundsThisMonth}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">This Month</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4">
          <button
            onClick={() => setShowRefundForm(true)}
            className="w-full h-full flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
          >
            <RefreshCw className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium">New Refund</span>
          </button>
        </div>
      </div>
      
      {/* New Refund Form */}
      {showRefundForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Process Refund</h3>
            <button
              onClick={() => setShowRefundForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900">Refund Policy Reminder</p>
                <p className="text-yellow-700 mt-1">
                  Refunds require manager approval for amounts over $500. 
                  Credit card refunds may take 5-7 business days to appear.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option>Select invoice...</option>
                  <option>INV-2024-1234 - John Doe ($450)</option>
                  <option>INV-2024-1456 - Jane Smith ($250)</option>
                  <option>INV-2024-1789 - Robert Brown ($800)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Amount
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Original payment: $450.00
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRefundMethod('credit_card')}
                    className={`p-2 rounded-lg border-2 transition-all text-xs ${
                      refundMethod === 'credit_card'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Original Card
                  </button>
                  <button
                    onClick={() => setRefundMethod('patient_credit')}
                    className={`p-2 rounded-lg border-2 transition-all text-xs ${
                      refundMethod === 'patient_credit'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Patient Credit
                  </button>
                  <button
                    onClick={() => setRefundMethod('cash')}
                    className={`p-2 rounded-lg border-2 transition-all text-xs ${
                      refundMethod === 'cash'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    onClick={() => setRefundMethod('check')}
                    className={`p-2 rounded-lg border-2 transition-all text-xs ${
                      refundMethod === 'check'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Check
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Refund
                </label>
                <select 
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select reason...</option>
                  <option>Service not as expected</option>
                  <option>Medical emergency</option>
                  <option>Duplicate payment</option>
                  <option>Pricing error</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  rows={4}
                  placeholder="Additional information..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {refundMethod === 'credit_card' && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Card Information</p>
                      <p className="text-blue-700">Visa ending in 4242</p>
                      <p className="text-blue-700">Original payment: 12/18/2024</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowRefundForm(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessRefund}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Process Refund
            </button>
          </div>
        </div>
      )}
      
      {/* Refunds List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Refunds</h3>
        {refunds.map((refund) => (
          <div key={refund.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Receipt className="w-5 h-5 text-gray-600" />
                  <h4 className="font-medium">{refund.invoiceId}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    refund.status === 'completed' ? 'bg-green-100 text-green-700' :
                    refund.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                    refund.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                  </span>
                  {refund.status === 'pending' && (
                    <span className="text-xs text-orange-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Requires approval
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-5 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-500">Patient</p>
                    <p className="font-medium">{refund.patientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Original Amount</p>
                    <p className="font-medium">${refund.originalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Refund Amount</p>
                    <p className="font-medium text-red-600">${refund.refundAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Method</p>
                    <p className="font-medium capitalize">
                      {refund.method.replace('_', ' ')}
                      {refund.cardLast4 && ` (*${refund.cardLast4})`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium">
                      {refund.processedDate 
                        ? refund.processedDate.toLocaleDateString()
                        : refund.requestedDate.toLocaleDateString()
                      }
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Reason:</span> {refund.reason}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>Requested by: {refund.requestedBy}</span>
                  {refund.approvedBy && <span>Approved by: {refund.approvedBy}</span>}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {refund.status === 'pending' && (
                  <>
                    <button className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                      Approve
                    </button>
                    <button className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                      Reject
                    </button>
                  </>
                )}
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Credits & Refunds</h1>
        <p className="text-gray-600 mt-1">Manage patient credits and process refunds</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('credits')}
          className={`flex-1 px-4 py-2 rounded-md transition-all ${
            activeTab === 'credits'
              ? 'bg-white shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Patient Credits
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={`flex-1 px-4 py-2 rounded-md transition-all ${
            activeTab === 'refunds'
              ? 'bg-white shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Refunds
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'credits' && renderCreditsTab()}
      {activeTab === 'refunds' && renderRefundsTab()}
      
      {/* Usage History Modal */}
      {selectedCredit && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Credit Usage History</h3>
                <button
                  onClick={() => setSelectedCredit(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {selectedCredit.usageHistory.map((usage) => (
                  <div key={usage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{usage.description}</p>
                      <p className="text-sm text-gray-500">
                        {usage.date.toLocaleDateString()} • Invoice: {usage.invoiceId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">-${usage.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        Balance: ${usage.remainingBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}