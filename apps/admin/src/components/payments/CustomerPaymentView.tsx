'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard,
  Smartphone,
  DollarSign,
  Check,
  Sparkles,
  Shield,
  Heart,
  Star,
  Lock,
  WifiOff,
  Wifi,
  Battery,
  Clock
} from 'lucide-react'

interface CustomerPaymentViewProps {
  total: number
  subtotal: number
  tip?: number
  clinicName?: string
  providerName?: string
  onComplete: (paymentMethod: string) => void
  onCancel: () => void
}

export function CustomerPaymentView({ 
  total, 
  subtotal, 
  tip = 0,
  clinicName = 'Luxe Medical Spa',
  providerName = 'Dr. Sarah Chen',
  onComplete, 
  onCancel 
}: CustomerPaymentViewProps) {
  const [selectedTip, setSelectedTip] = useState<number>(18)
  const [customTip, setCustomTip] = useState('')
  const [tipAmount, setTipAmount] = useState(tip)
  const [showingPayment, setShowingPayment] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  // Add CSS animation on mount
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes progress {
        0% { width: 0%; }
        100% { width: 100%; }
      }
      .animate-progress {
        animation: progress 2s ease-in-out;
      }
    `
    document.head.appendChild(style)
    
    // Cleanup on unmount
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])
  
  // Calculate tip
  useEffect(() => {
    if (selectedTip > 0) {
      setTipAmount(Math.round((subtotal * selectedTip / 100) * 100) / 100)
    }
  }, [selectedTip, subtotal])
  
  const handlePayment = async (method: string) => {
    setProcessingPayment(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setProcessingPayment(false)
    setPaymentComplete(true)
    
    // Show success for 2 seconds then complete
    setTimeout(() => {
      onComplete(method)
    }, 2000)
  }
  
  const tipPresets = [15, 18, 20, 25]
  
  const grandTotal = subtotal + tipAmount
  
  if (paymentComplete) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-semibold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 text-lg">Thank you for visiting {clinicName}</p>
          <div className="mt-8">
            <Sparkles className="w-8 h-8 text-purple-500 mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 z-50 flex flex-col">
      {/* iPad Status Bar - Simulated */}
      <div className="bg-white px-6 py-2 flex justify-between items-center text-xs border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="font-medium">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-gray-500">{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-3">
          <Wifi className="w-4 h-4 text-gray-600" />
          <Battery className="w-6 h-4 text-gray-600" />
          <span className="text-gray-600">100%</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-8">
          {/* Clinic Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">{clinicName}</h1>
            <p className="text-gray-600 mt-1">Service provided by {providerName}</p>
          </div>
          
          {!showingPayment ? (
            <>
              {/* Amount Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Service Total</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {/* Tip Selection */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-3">Add a tip for your provider</p>
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      {tipPresets.map((percent) => (
                        <button
                          key={percent}
                          onClick={() => {
                            setSelectedTip(percent)
                            setCustomTip('')
                          }}
                          className={`py-3 rounded-xl font-medium transition-all ${
                            selectedTip === percent
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="text-base">{percent}%</div>
                          <div className="text-xs opacity-75">${(subtotal * percent / 100).toFixed(2)}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={customTip}
                        onChange={(e) => {
                          setCustomTip(e.target.value)
                          setSelectedTip(0)
                          setTipAmount(parseFloat(e.target.value) || 0)
                        }}
                        placeholder="Custom tip amount"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-lg"
                      />
                      <button
                        onClick={() => {
                          setSelectedTip(0)
                          setTipAmount(0)
                          setCustomTip('')
                        }}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                      >
                        No Tip
                      </button>
                    </div>
                  </div>
                  
                  {tipAmount > 0 && (
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Tip</span>
                      <span className="font-medium text-green-600">+${tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <span className="text-xl font-medium">Total</span>
                    <span className="text-2xl font-bold">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Continue Button */}
              <button
                onClick={() => setShowingPayment(true)}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-medium rounded-2xl hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                Continue to Payment
              </button>
            </>
          ) : (
            <>
              {/* Payment Methods */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                <h2 className="text-xl font-semibold mb-6">Choose Payment Method</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handlePayment('tap')}
                    disabled={processingPayment}
                    className="w-full p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-lg">Tap to Pay</p>
                          <p className="text-sm text-gray-600">Apple Pay, Google Pay, or Tap Card</p>
                        </div>
                      </div>
                      <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handlePayment('insert')}
                    disabled={processingPayment}
                    className="w-full p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-lg">Insert or Swipe Card</p>
                          <p className="text-sm text-gray-600">Credit, Debit, HSA or FSA</p>
                        </div>
                      </div>
                      <div className="text-purple-600 group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </div>
                  </button>
                  
                  <div className="flex items-center gap-3 pt-4">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500">Payments are secure and encrypted</p>
                  </div>
                </div>
              </div>
              
              {/* Total Display */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount to charge</span>
                  <span className="text-2xl font-bold">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Processing Overlay */}
              {processingPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                  <div className="bg-white rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center animate-pulse">
                      <Lock className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
                    <p className="text-gray-600">Please wait...</p>
                    <div className="mt-4">
                      <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-progress" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Cancel Button */}
          {!processingPayment && !paymentComplete && (
            <button
              onClick={onCancel}
              className="w-full mt-4 py-3 text-gray-600 hover:text-gray-800"
            >
              Cancel Payment
            </button>
          )}
        </div>
      </div>
      
      {/* Trust Badges */}
      <div className="border-t border-gray-200 bg-white px-8 py-4">
        <div className="flex justify-center items-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            PCI Compliant
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-4 h-4" />
            Secure Checkout
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            HSA/FSA Accepted
          </span>
        </div>
      </div>
    </div>
  )
}

