'use client'

import { useState } from 'react'
import { CustomerPaymentScreen } from '@/components/payments/CustomerPaymentScreen'
import {
  X,
  Package,
  User,
  Search,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  Gift,
  Mail,
  Phone,
  AlertCircle,
  Plus,
  Minus,
  RefreshCw,
  RotateCw
} from 'lucide-react'

interface PackageDetails {
  id: string
  name: string
  description: string
  services: { name: string; quantity: number; value: number }[]
  regularPrice: number
  salePrice: number
  savings: number
  validityDays: number
  termsAndConditions?: string
}

interface PackageSellModalProps {
  package: PackageDetails
  onClose: () => void
  onComplete: (saleData: any) => void
}

export function PackageSellModal({ package: pkg, onClose, onComplete }: PackageSellModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'other'>('card')
  const [sendEmail, setSendEmail] = useState(true)
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCustomerPayment, setShowCustomerPayment] = useState(false)

  // Mock patient search results
  const mockPatients = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '(555) 123-4567' },
    { id: '2', name: 'Michael Chen', email: 'michael@email.com', phone: '(555) 234-5678' },
    { id: '3', name: 'Emma Wilson', email: 'emma@email.com', phone: '(555) 345-6789' }
  ]

  const filteredPatients = searchQuery.length > 0 
    ? mockPatients.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const totalAmount = pkg.salePrice * quantity
  const totalSavings = pkg.savings * quantity

  const handleProcessSale = async () => {
    if (!selectedPatient) {
      alert('Please select a patient')
      return
    }

    // If credit card payment, show customer payment screen
    if (paymentMethod === 'card') {
      setShowCustomerPayment(true)
    } else {
      // For cash or other, process immediately
      completePackageSale()
    }
  }

  const completePackageSale = () => {
    setIsProcessing(true)
    
    // Create package credits for patient
    const packageCredits = {
      patient: selectedPatient,
      package: pkg,
      quantity,
      totalAmount,
      paymentMethod,
      sendEmail,
      notes,
      purchaseDate: new Date(),
      expiryDate: new Date(Date.now() + pkg.validityDays * 24 * 60 * 60 * 1000),
      credits: pkg.services.map((service: any) => ({
        serviceId: service.name.toLowerCase().replace(' ', '-'),
        serviceName: service.name,
        totalQuantity: service.quantity * quantity,
        usedQuantity: 0,
        remainingQuantity: service.quantity * quantity
      }))
    }
    
    setTimeout(() => {
      onComplete(packageCredits)
      setIsProcessing(false)
      onClose()
    }, 1500)
  }

  // Show customer payment screen when flipped
  if (showCustomerPayment) {
    return (
      <CustomerPaymentScreen
        amount={totalAmount}
        serviceName={`${pkg.name} Package (${quantity}x)`}
        providerName="Front Desk"
        onComplete={(method) => {
          setShowCustomerPayment(false)
          completePackageSale()
        }}
        onCancel={() => setShowCustomerPayment(false)}
        isIPadMode={true}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Sell Package</h2>
                <p className="text-sm text-gray-600">{pkg.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient
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
              
              {/* Search Results */}
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
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500">{patient.email}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {patient.phone}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Patient Display */}
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

            {/* Package Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Package Contents</h3>
              <div className="space-y-2">
                {pkg.services.map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {service.quantity}x {service.name}
                    </span>
                    <span className="text-gray-900 font-medium">
                      ${service.value.toFixed(2)} value
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Value</span>
                    <span className="line-through text-gray-400">${pkg.regularPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Package Price</span>
                    <span className="text-lg font-semibold text-purple-600">${pkg.salePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Savings</span>
                    <span className="text-green-600 font-medium">${pkg.savings.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="ml-4 text-sm text-gray-600">
                  <p>Total: <span className="font-semibold text-gray-900">${totalAmount.toFixed(2)}</span></p>
                  <p className="text-green-600">Save ${totalSavings.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-lg border-2 transition-all relative ${
                    paymentMethod === 'card'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <p className="text-sm">Credit Card</p>
                  {paymentMethod === 'card' && (
                    <div className="absolute top-1 right-1">
                      <RotateCw className="w-3 h-3 text-purple-600" />
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <p className="text-sm">Cash</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('other')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    paymentMethod === 'other'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Gift className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <p className="text-sm">Other</p>
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Send package details to patient via email</span>
              </label>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this purchase..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                />
              </div>
            </div>

            {/* Validity Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">Package Validity</p>
                <p className="text-yellow-700">
                  This package will be valid for {pkg.validityDays} days from purchase date.
                  Expires on: {new Date(Date.now() + pkg.validityDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total Amount: <span className="text-2xl font-bold text-gray-900 ml-2">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessSale}
                disabled={!selectedPatient || isProcessing}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  !selectedPatient || isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  paymentMethod === 'card' ? (
                    <span className="flex items-center gap-2">
                      <RotateCw className="w-4 h-4" />
                      Flip to Customer
                    </span>
                  ) : (
                    'Complete Sale'
                  )
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}