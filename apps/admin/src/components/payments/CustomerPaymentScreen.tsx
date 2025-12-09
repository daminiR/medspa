'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard,
  Smartphone,
  Check,
  ArrowLeft,
  Wifi,
  Battery
} from 'lucide-react'

interface CustomerPaymentScreenProps {
  amount: number
  serviceName: string
  providerName: string
  onComplete: (method: 'card' | 'tap') => void
  onCancel: () => void
  isIPadMode?: boolean
}

export function CustomerPaymentScreen({
  amount,
  serviceName,
  providerName,
  onComplete,
  onCancel,
  isIPadMode = true
}: CustomerPaymentScreenProps) {
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'tap' | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handlePayment = async (method: 'card' | 'tap') => {
    setSelectedMethod(method)
    setProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      setShowSuccess(true)
      
      // Auto-complete after showing success
      setTimeout(() => {
        onComplete(method)
      }, 2000)
    }, 2000)
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[100]">
        <div className="text-center">
          <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-20 h-20 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600">Thank you for your payment</p>
          <p className="text-lg text-gray-500 mt-4">You can hand the device back to staff</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 z-[100]">
      {/* iPad Status Bar */}
      {isIPadMode && (
        <div className="absolute top-0 left-0 right-0 h-6 bg-black/5 flex items-center justify-between px-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium">{currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3" />
            <Battery className="w-5 h-3" />
            <span>100%</span>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center h-full px-8 pt-12 pb-8">
        {/* Back to Staff Button */}
        <button
          onClick={onCancel}
          className="absolute top-10 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Staff</span>
        </button>
        
        {/* Spa Logo/Name */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
            <span className="text-3xl font-bold text-white">MS</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 text-center">Medical Spa</h2>
        </div>
        
        {/* Payment Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mb-8">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">Service</p>
            <p className="text-xl font-semibold text-gray-900">{serviceName}</p>
            <p className="text-sm text-gray-500 mt-1">with {providerName}</p>
          </div>
          
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="flex justify-between items-baseline">
              <span className="text-lg text-gray-600">Total Due</span>
              <span className="text-4xl font-bold text-gray-900">
                ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="space-y-3">
            <button
              onClick={() => handlePayment('card')}
              disabled={processing}
              className={`w-full p-6 rounded-xl border-2 transition-all ${
                selectedMethod === 'card' && processing
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'
              } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Insert or Swipe Card</p>
                    <p className="text-sm text-gray-600">Credit or Debit</p>
                  </div>
                </div>
                {selectedMethod === 'card' && processing && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent" />
                )}
              </div>
            </button>
            
            <button
              onClick={() => handlePayment('tap')}
              disabled={processing}
              className={`w-full p-6 rounded-xl border-2 transition-all ${
                selectedMethod === 'tap' && processing
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'
              } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Tap to Pay</p>
                    <p className="text-sm text-gray-600">Apple Pay, Google Pay, or NFC Card</p>
                  </div>
                </div>
                {selectedMethod === 'tap' && processing && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent" />
                )}
              </div>
            </button>
          </div>
          
          {processing && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 animate-pulse">
                {selectedMethod === 'card' ? 'Please insert or swipe your card...' : 'Hold your device near the reader...'}
              </p>
            </div>
          )}
        </div>
        
        {/* Security Badge */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-4 h-4">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-8-5z"/>
            </svg>
          </div>
          <span>Secure Payment Processing</span>
        </div>
      </div>
    </div>
  )
}