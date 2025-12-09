'use client'

import { useState, useEffect } from 'react'
import { useInvoice } from '@/contexts/InvoiceContext'
import { InvoiceView } from './InvoiceView'
import { InjectableBilling } from './InjectableBilling'
import { PaymentForm } from './PaymentForm'
import {
  User,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  CreditCard,
  FileText,
  CheckCircle,
  Syringe,
  Package,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react'

interface PatientCheckoutProps {
  patientId: string
  patientName: string
  appointmentTime?: string
  onClose: () => void
}

export function PatientCheckout({ patientId, patientName, appointmentTime = '2:00 PM', onClose }: PatientCheckoutProps) {
  const { currentInvoice, createInvoice, clearCurrentInvoice } = useInvoice()
  const [currentStep, setCurrentStep] = useState<'services' | 'review' | 'payment' | 'complete'>('services')
  const [showInjectableBilling, setShowInjectableBilling] = useState(false)
  const [showServiceMenu, setShowServiceMenu] = useState(false)
  const [isInvoiceInitialized, setIsInvoiceInitialized] = useState(false)
  
  // Create invoice on mount if doesn't exist - use useEffect to avoid render-time state updates
  useEffect(() => {
    if (!currentInvoice && !isInvoiceInitialized && currentStep === 'services') {
      createInvoice(patientId, patientName)
      setIsInvoiceInitialized(true)
    }
  }, [currentInvoice, isInvoiceInitialized, currentStep, patientId, patientName, createInvoice])
  
  const handleAddService = (type: string) => {
    if (type === 'injectable') {
      setShowInjectableBilling(true)
      setShowServiceMenu(false)
    }
    // TODO: Add other service types
  }
  
  const handleProceedToReview = () => {
    if (currentInvoice && currentInvoice.lineItems.length > 0) {
      setCurrentStep('review')
    }
  }
  
  const handleProceedToPayment = () => {
    setCurrentStep('payment')
  }
  
  const handleCompleteCheckout = () => {
    setCurrentStep('complete')
    // In real app, this would save to database
    setTimeout(() => {
      clearCurrentInvoice()
      onClose()
    }, 3000)
  }
  
  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  ← Back
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">Patient Checkout</h1>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="font-medium">{patientName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date().toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {appointmentTime} appointment
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  currentStep === 'services' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="text-sm font-medium">1. Add Services</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  currentStep === 'review' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="text-sm font-medium">2. Review Invoice</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  currentStep === 'payment' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="text-sm font-medium">3. Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {currentStep === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Add Services */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">What services did {patientName.split(' ')[0]} receive today?</h2>
                  
                  {/* Quick Add Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleAddService('injectable')}
                      className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200">
                          <Syringe className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Injectables</p>
                          <p className="text-sm text-gray-500">Botox, Fillers, etc.</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setShowServiceMenu(true)}
                      className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all group"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200">
                          <Sparkles className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Treatments</p>
                          <p className="text-sm text-gray-500">Facials, Lasers, etc.</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setShowServiceMenu(true)}
                      className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Products</p>
                          <p className="text-sm text-gray-500">Skincare, Retail</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setShowServiceMenu(true)}
                      className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
                          <Plus className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Other Services</p>
                          <p className="text-sm text-gray-500">Custom items</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Provider Documentation Display - Commented out for now */}
                {/* {providerDocumentation && (
                  <div className="mb-6">
                    <TreatmentDocumentationViewer
                      documentation={providerDocumentation}
                      compact={false}
                    />
                  </div>
                )} */}
                
                {/* Current Invoice Items */}
                {currentInvoice && currentInvoice.lineItems.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Added Services</h3>
                    <InvoiceView 
                      onAddItem={() => setShowServiceMenu(true)}
                    />
                  </div>
                )}
              </div>
              
              {/* Right: Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                  <h3 className="font-semibold text-gray-900 mb-4">Checkout Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Services Added</span>
                      <span className="font-medium">{currentInvoice?.lineItems.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${currentInvoice?.subtotal.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${currentInvoice?.tax.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Due</span>
                        <span className="text-xl font-bold text-green-600">
                          ${currentInvoice?.total.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleProceedToReview}
                    disabled={!currentInvoice || currentInvoice.lineItems.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Review Invoice
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  {(!currentInvoice || currentInvoice.lineItems.length === 0) && (
                    <p className="text-xs text-gray-500 mt-3 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5" />
                      Add at least one service to continue
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 'review' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Invoice</h2>
                <InvoiceView 
                  onPayment={handleProceedToPayment}
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep('services')}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ← Back to Services
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 'payment' && currentInvoice && (
            <PaymentForm
              invoiceTotal={currentInvoice.total}
              onComplete={(payments) => {
                console.log('Payments processed:', payments)
                handleCompleteCheckout()
              }}
              onCancel={() => setCurrentStep('review')}
            />
          )}
          
          {currentStep === 'complete' && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-xl border border-gray-200 p-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Checkout Complete!</h2>
                <p className="text-gray-600">Invoice has been paid and saved.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Injectable Billing Modal */}
      {showInjectableBilling && (
        <InjectableBilling
          patientName={patientName}
          onClose={() => setShowInjectableBilling(false)}
        />
      )}
      
      {/* Provider Documentation Display - No longer editable from admin */}
    </div>
  )
}