'use client'

import { useState } from 'react'
import {
  X,
  CreditCard,
  User,
  Search,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Gift,
  Star,
  TrendingUp,
  Shield,
  RefreshCw,
  Clock,
  Info
} from 'lucide-react'

interface MembershipPlan {
  id: string
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'quarterly' | 'annually'
  tier: 'silver' | 'gold' | 'platinum'
  benefits: {
    discountPercentage: number
    includedServices: {
      quantity: number
      serviceName: string
      resetPeriod: 'month' | 'quarter' | 'year'
    }[]
    rolloverLimit?: number
    additionalPerks: string[]
  }
  terms: {
    minimumCommitment: number // months
    cancellationNotice: number // days
    autoRenew: boolean
  }
}

interface MembershipEnrollmentModalProps {
  membership: MembershipPlan
  onClose: () => void
  onComplete: (enrollmentData: any) => void
}

export function MembershipEnrollmentModal({ membership, onClose, onComplete }: MembershipEnrollmentModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState<'today' | 'next-month'>('today')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card')
  const [cardDetails, setCardDetails] = useState({ last4: '', brand: '' })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  // Mock patient search
  const mockPatients = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '(555) 123-4567', hasPaymentMethod: true },
    { id: '2', name: 'Michael Chen', email: 'michael@email.com', phone: '(555) 234-5678', hasPaymentMethod: false },
    { id: '3', name: 'Emma Wilson', email: 'emma@email.com', phone: '(555) 345-6789', hasPaymentMethod: true }
  ]

  const filteredPatients = searchQuery.length > 0 
    ? mockPatients.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  // Calculate pricing
  const monthlyPrice = membership.price
  const annualSavings = membership.billingCycle === 'annually' ? monthlyPrice * 12 * 0.15 : 0 // 15% discount for annual
  const firstPayment = startDate === 'today' ? monthlyPrice : 0
  const nextBilling = startDate === 'today' 
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)

  const handleEnroll = async () => {
    if (!selectedPatient) {
      alert('Please select a patient')
      return
    }
    if (!agreedToTerms) {
      alert('Please agree to the membership terms')
      return
    }

    setIsProcessing(true)
    
    // Simulate enrollment
    setTimeout(() => {
      const enrollmentData = {
        patient: selectedPatient,
        membership,
        startDate: startDate === 'today' ? new Date() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentMethod,
        monthlyPrice,
        status: 'active',
        benefits: {
          ...membership.benefits,
          nextReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
      
      onComplete(enrollmentData)
      setIsProcessing(false)
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-gray-200 bg-gradient-to-r ${
          membership.tier === 'platinum' ? 'from-gray-800 to-gray-900' :
          membership.tier === 'gold' ? 'from-yellow-500 to-amber-600' :
          'from-gray-400 to-gray-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Enroll in Membership</h2>
                <p className="text-sm text-white/80">{membership.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Membership Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{membership.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{membership.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${monthlyPrice}</p>
                  <p className="text-sm text-gray-600">per {membership.billingCycle}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">{membership.benefits.discountPercentage}% off all services</span>
                </div>
                {membership.benefits.includedServices.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">
                      {service.quantity} complimentary {service.serviceName} per {service.resetPeriod}
                    </span>
                  </div>
                ))}
                {membership.benefits.additionalPerks?.map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Gift className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-700">{perk}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-purple-200 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {membership.terms.minimumCommitment} month commitment
                </span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Auto-renews {membership.billingCycle}
                </span>
              </div>
            </div>

            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Member
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              {filteredPatients.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredPatients.map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatient(patient)
                        setSearchQuery('')
                      }}
                      className="w-full px-4 py-3 hover:bg-purple-50 flex items-center justify-between transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500">{patient.email}</p>
                        </div>
                      </div>
                      {patient.hasPaymentMethod && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          Card on file
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedPatient && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                      <p className="text-sm text-gray-600">{selectedPatient.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membership Start Date
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStartDate('today')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    startDate === 'today'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <p className="text-sm font-medium">Start Today</p>
                  <p className="text-xs text-gray-500 mt-1">First charge now</p>
                </button>
                <button
                  onClick={() => setStartDate('next-month')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    startDate === 'next-month'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <p className="text-sm font-medium">Next Month</p>
                  <p className="text-xs text-gray-500 mt-1">First charge in 30 days</p>
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method for Recurring Billing
              </label>
              {selectedPatient?.hasPaymentMethod ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Card on File</p>
                      <p className="text-sm text-gray-600">Visa ending in 4242</p>
                    </div>
                  </div>
                  <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    Change
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-sm">Credit/Debit Card</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-sm">Bank Account (ACH)</p>
                  </button>
                </div>
              )}
            </div>

            {/* Billing Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Billing Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Membership</span>
                  <span className="font-medium">${monthlyPrice}/month</span>
                </div>
                {startDate === 'today' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Due Today</span>
                    <span className="font-semibold text-gray-900">${firstPayment}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-gray-600">Next Billing Date</span>
                  <span className="font-medium">{nextBilling.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <div className="text-sm text-gray-700">
                  I agree to the membership terms including the {membership.terms.minimumCommitment} month minimum commitment,
                  automatic {membership.billingCycle} renewal, and {membership.terms.cancellationNotice} day cancellation notice requirement.
                  <button
                    onClick={() => setShowTerms(true)}
                    className="text-purple-600 hover:text-purple-700 font-medium ml-1"
                  >
                    View full terms
                  </button>
                </div>
              </label>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">Membership Benefits</p>
                <p className="text-yellow-700">
                  Benefits reset on the 1st of each {membership.benefits.includedServices[0]?.resetPeriod || 'month'}.
                  Unused services do {membership.benefits.rolloverLimit ? `roll over (max ${membership.benefits.rolloverLimit})` : 'not roll over'}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {startDate === 'today' ? (
                <>Due Today: <span className="text-2xl font-bold text-gray-900 ml-2">${firstPayment}</span></>
              ) : (
                <>First charge on {nextBilling.toLocaleDateString()}</>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={!selectedPatient || !agreedToTerms || isProcessing}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  !selectedPatient || !agreedToTerms || isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Enrolling...
                  </span>
                ) : (
                  'Enroll Member'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}