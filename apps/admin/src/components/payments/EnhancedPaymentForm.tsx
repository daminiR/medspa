'use client'

import { useState, useEffect } from 'react'
import { useInvoice } from '@/contexts/InvoiceContext'
import {
  CreditCard,
  DollarSign,
  Smartphone,
  Gift,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  X,
  Calculator,
  Receipt,
  Banknote,
  Wallet,
  Package,
  Shield,
  Heart,
  Info,
  Save,
  Sparkles,
  Clock,
  Lock,
  Building,
  CreditCard as CardIcon,
  RotateCw,
  Tablet
} from 'lucide-react'
import { CustomerPaymentView } from './CustomerPaymentView'
import StripePaymentForm from './StripePaymentForm'

interface EnhancedPaymentFormProps {
  invoiceTotal: number
  onComplete: (payments: Payment[], metadata: PaymentMetadata) => void
  onCancel: () => void
  patientId?: string
}

interface Payment {
  id: string
  method: 'cash' | 'credit' | 'debit' | 'check' | 'giftcard' | 'package' | 'membership' | 'hsa' | 'fsa'
  amount: number
  reference?: string
  cardLast4?: string
  cardType?: string
  tokenId?: string
  saveCard?: boolean
  isHSA?: boolean
  isFSA?: boolean
}

interface PaymentMetadata {
  tip?: number
  tipMethod?: 'percentage' | 'amount'
  tipRecipient?: string
  saveCardOnFile?: boolean
  cardToken?: string
  receiptEmail?: string
  notes?: string
}

interface SavedCard {
  id: string
  last4: string
  type: string
  expMonth: number
  expYear: number
  isDefault: boolean
  isHSA?: boolean
  isFSA?: boolean
}

export function EnhancedPaymentForm({ 
  invoiceTotal, 
  onComplete, 
  onCancel,
  patientId 
}: EnhancedPaymentFormProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [activeMethod, setActiveMethod] = useState<Payment['method']>('credit')
  const [amount, setAmount] = useState(invoiceTotal.toString())
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [cashReceived, setCashReceived] = useState('')
  const [giftCardNumber, setGiftCardNumber] = useState('')
  const [saveCard, setSaveCard] = useState(false)
  const [selectedSavedCard, setSelectedSavedCard] = useState<string>('')
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Tip state
  const [tipAmount, setTipAmount] = useState(0)
  const [tipPercentage, setTipPercentage] = useState(0)
  const [customTip, setCustomTip] = useState('')
  const [tipMode, setTipMode] = useState<'percentage' | 'amount'>('percentage')
  const [showTipSection, setShowTipSection] = useState(true)
  
  // HSA/FSA state
  const [isHSAFSA, setIsHSAFSA] = useState(false)
  const [hsaFsaType, setHsaFsaType] = useState<'hsa' | 'fsa'>('hsa')
  
  // Receipt state
  const [receiptEmail, setReceiptEmail] = useState('')
  const [sendReceipt, setSendReceipt] = useState(true)
  const [showCustomerView, setShowCustomerView] = useState(false)
  const [showStripePayment, setShowStripePayment] = useState(false)
  
  const subtotal = invoiceTotal
  const total = subtotal + tipAmount
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = total - totalPaid
  const isFullyPaid = remaining <= 0
  const change = remaining < 0 ? Math.abs(remaining) : 0
  
  const paymentMethods = [
    { id: 'credit', name: 'Credit', icon: CreditCard, color: 'purple' },
    { id: 'debit', name: 'Debit', icon: CreditCard, color: 'blue' },
    { id: 'hsa', name: 'HSA', icon: Heart, color: 'red' },
    { id: 'fsa', name: 'FSA', icon: Shield, color: 'orange' },
    { id: 'cash', name: 'Cash', icon: Banknote, color: 'green' },
    { id: 'check', name: 'Check', icon: Receipt, color: 'gray' },
    { id: 'giftcard', name: 'Gift Card', icon: Gift, color: 'pink' },
    { id: 'package', name: 'Package', icon: Package, color: 'indigo' },
  ]
  
  const quickCashAmounts = [20, 50, 100, 200, 500, 1000]
  const tipPresets = [15, 18, 20, 25]
  
  // Load saved cards on mount and set initial amount
  useEffect(() => {
    if (patientId) {
      loadSavedCards()
    }
  }, [patientId])
  
  // Update amount when remaining changes (for split payments)
  useEffect(() => {
    if (remaining > 0 && !amount) {
      setAmount(remaining.toFixed(2))
    }
  }, [remaining])
  
  // Calculate tip when percentage changes
  useEffect(() => {
    if (tipMode === 'percentage' && tipPercentage > 0) {
      setTipAmount(Math.round((subtotal * tipPercentage / 100) * 100) / 100)
    }
  }, [tipPercentage, subtotal, tipMode])
  
  const loadSavedCards = async () => {
    // Simulated saved cards - would fetch from API
    const mockCards: SavedCard[] = [
      {
        id: 'CARD-001',
        last4: '4242',
        type: 'Visa',
        expMonth: 12,
        expYear: 2025,
        isDefault: true
      },
      {
        id: 'CARD-002',
        last4: '5555',
        type: 'Mastercard',
        expMonth: 3,
        expYear: 2026,
        isDefault: false
      },
      {
        id: 'CARD-003',
        last4: '1234',
        type: 'Visa',
        expMonth: 6,
        expYear: 2025,
        isDefault: false,
        isHSA: true
      }
    ]
    setSavedCards(mockCards)
  }
  
  const tokenizeCard = async (cardData: any) => {
    // Simulate card tokenization - would call Stripe/payment processor
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    const token = `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setIsProcessing(false)
    return token
  }
  
  const addPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    
    // For card payments, show Stripe payment form
    if ((activeMethod === 'credit' || activeMethod === 'debit' || activeMethod === 'hsa' || activeMethod === 'fsa') && !selectedSavedCard) {
      setShowStripePayment(true)
      return
    }
    
    let tokenId: string | undefined
    
    const payment: Payment = {
      id: `PAY-${Date.now()}`,
      method: activeMethod,
      amount: parseFloat(amount),
      tokenId,
      saveCard: saveCard && !selectedSavedCard,
      isHSA: activeMethod === 'hsa',
      isFSA: activeMethod === 'fsa'
    }
    
    // Add card details if credit/debit/HSA/FSA
    if ((activeMethod === 'credit' || activeMethod === 'debit' || activeMethod === 'hsa' || activeMethod === 'fsa')) {
      if (selectedSavedCard) {
        const card = savedCards.find(c => c.id === selectedSavedCard)
        if (card) {
          payment.cardLast4 = card.last4
          payment.cardType = card.type
        }
      } else if (cardNumber) {
        payment.cardLast4 = cardNumber.slice(-4)
        payment.cardType = detectCardType(cardNumber)
      }
    }
    
    // Add reference for check/giftcard
    if (activeMethod === 'check' || activeMethod === 'giftcard') {
      payment.reference = activeMethod === 'giftcard' ? giftCardNumber : 'CHECK'
    }
    
    setPayments([...payments, payment])
    
    // Reset form but keep remaining amount populated
    setAmount(remaining > 0 ? remaining.toFixed(2) : '')
    setCardNumber('')
    setExpiryDate('')
    setCvv('')
    setZipCode('')
    setGiftCardNumber('')
    setCashReceived('')
    setSaveCard(false)
    setSelectedSavedCard('')
  }
  
  const removePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id))
  }
  
  const detectCardType = (number: string): string => {
    if (number.startsWith('4')) return 'Visa'
    if (number.startsWith('5')) return 'Mastercard'
    if (number.startsWith('3')) return 'Amex'
    if (number.startsWith('6')) return 'Discover'
    return 'Card'
  }
  
  const calculateChange = () => {
    if (activeMethod === 'cash' && cashReceived) {
      const received = parseFloat(cashReceived)
      const toPay = remaining > 0 ? remaining : 0
      return received - toPay
    }
    return 0
  }
  
  const handleComplete = () => {
    if (isFullyPaid) {
      const metadata: PaymentMetadata = {
        tip: tipAmount,
        tipMethod: tipMode,
        receiptEmail: sendReceipt ? receiptEmail : undefined,
        saveCardOnFile: payments.some(p => p.saveCard),
        notes: undefined
      }
      onComplete(payments, metadata)
    }
  }
  
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s+/g, '')
    const groups = cleaned.match(/.{1,4}/g) || []
    return groups.join(' ')
  }
  
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }
  
  // Show customer-facing view if enabled
  if (showCustomerView) {
    return (
      <CustomerPaymentView
        total={total}
        subtotal={subtotal}
        tip={tipAmount}
        clinicName="Luxe Medical Spa"
        providerName="Dr. Sarah Chen"
        onComplete={(method) => {
          console.log('Payment completed via:', method)
          setShowCustomerView(false)
          // Process the payment
          handleComplete()
        }}
        onCancel={() => setShowCustomerView(false)}
      />
    )
  }
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Process Payment</h2>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-600">
                  Subtotal: <span className="font-bold">${subtotal.toFixed(2)}</span>
                </p>
                {tipAmount > 0 && (
                  <p className="text-sm text-gray-600">
                    Tip: <span className="font-bold text-green-600">+${tipAmount.toFixed(2)}</span>
                  </p>
                )}
                <p className="text-sm text-gray-900">
                  Total: <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowCustomerView(true)}
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 text-sm"
                title="Show customer-facing payment screen"
              >
                <RotateCw className="w-4 h-4" />
                <span>Flip to Customer</span>
              </button>
              <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Payment Methods & Tips */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tip Section */}
              {showTipSection && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Add Tip</h3>
                    <button
                      onClick={() => setShowTipSection(false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Skip tip
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {tipPresets.map((percent) => (
                        <button
                          key={percent}
                          onClick={() => {
                            setTipMode('percentage')
                            setTipPercentage(percent)
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                            tipMode === 'percentage' && tipPercentage === percent
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium">{percent}%</div>
                          <div className="text-xs text-gray-500">
                            ${(subtotal * percent / 100).toFixed(2)}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={customTip}
                        onChange={(e) => {
                          setCustomTip(e.target.value)
                          setTipMode('amount')
                          setTipAmount(parseFloat(e.target.value) || 0)
                        }}
                        placeholder="Custom amount"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={() => {
                          setTipAmount(0)
                          setTipPercentage(0)
                          setCustomTip('')
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Method Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h3>
                <div className="grid grid-cols-4 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setActiveMethod(method.id as Payment['method'])
                        if (method.id === 'hsa' || method.id === 'fsa') {
                          setIsHSAFSA(true)
                          setHsaFsaType(method.id as 'hsa' | 'fsa')
                        } else {
                          setIsHSAFSA(false)
                        }
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        activeMethod === method.id
                          ? `border-${method.color}-500 bg-${method.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <method.icon className={`w-5 h-5 mx-auto mb-1 ${
                        activeMethod === method.id ? `text-${method.color}-600` : 'text-gray-600'
                      }`} />
                      <p className="text-xs font-medium text-gray-700">{method.name}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Payment Details Based on Method */}
              <div className="bg-gray-50 rounded-lg p-4">
                {(activeMethod === 'credit' || activeMethod === 'debit' || activeMethod === 'hsa' || activeMethod === 'fsa') && (
                  <div className="space-y-4">
                    {/* HSA/FSA Notice */}
                    {isHSAFSA && (
                      <div className="p-3 bg-blue-100 rounded-lg flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900">
                            {hsaFsaType.toUpperCase()} Card Payment
                          </p>
                          <p className="text-blue-700 mt-1">
                            Using {hsaFsaType === 'hsa' ? 'Health Savings Account' : 'Flexible Spending Account'} for eligible medical expenses.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Saved Cards */}
                    {savedCards.length > 0 && !isHSAFSA && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Saved Cards
                        </label>
                        <div className="space-y-2">
                          {savedCards
                            .filter(card => isHSAFSA ? (card.isHSA || card.isFSA) : true)
                            .map((card) => (
                            <button
                              key={card.id}
                              onClick={() => setSelectedSavedCard(card.id)}
                              className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                                selectedSavedCard === card.id
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-gray-600" />
                                <div className="text-left">
                                  <p className="text-sm font-medium">
                                    {card.type} ending in {card.last4}
                                    {card.isHSA && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">HSA</span>}
                                    {card.isFSA && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">FSA</span>}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Expires {card.expMonth}/{card.expYear}
                                    {card.isDefault && <span className="ml-2 text-purple-600">Default</span>}
                                  </p>
                                </div>
                              </div>
                              {selectedSavedCard === card.id && (
                                <CheckCircle className="w-5 h-5 text-purple-600" />
                              )}
                            </button>
                          ))}
                          <button
                            onClick={() => setSelectedSavedCard('')}
                            className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 text-sm text-gray-600 flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Use new card
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* New Card Form */}
                    {!selectedSavedCard && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                            {cardNumber && (
                              <div className="absolute right-3 top-2.5">
                                <img 
                                  src={`/card-icons/${detectCardType(cardNumber).toLowerCase()}.svg`} 
                                  alt={detectCardType(cardNumber)}
                                  className="h-5"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={expiryDate}
                              onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="text"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                              placeholder="123"
                              maxLength={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="12345"
                            maxLength={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        {/* Save Card Option */}
                        {!isHSAFSA && (
                          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                            <input
                              type="checkbox"
                              id="saveCard"
                              checked={saveCard}
                              onChange={(e) => setSaveCard(e.target.checked)}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <label htmlFor="saveCard" className="text-sm text-gray-700">
                              Save card for future payments
                            </label>
                            <Lock className="w-3 h-3 text-gray-500 ml-auto" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {activeMethod === 'cash' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quick Cash Amounts
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {quickCashAmounts.map((quickAmount) => (
                          <button
                            key={quickAmount}
                            onClick={() => setCashReceived(quickAmount.toString())}
                            className="py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                          >
                            ${quickAmount}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cash Received
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                        <input
                          type="number"
                          value={cashReceived || remaining.toFixed(2)}
                          onChange={(e) => setCashReceived(e.target.value)}
                          placeholder={remaining.toFixed(2)}
                          step="0.01"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
                        />
                      </div>
                    </div>
                    {cashReceived && parseFloat(cashReceived) > 0 && (
                      <div className="p-3 bg-green-100 rounded-lg">
                        <p className="text-sm text-green-700">
                          Change Due: <span className="font-bold text-lg">${calculateChange().toFixed(2)}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeMethod === 'giftcard' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gift Card Number
                      </label>
                      <input
                        type="text"
                        value={giftCardNumber}
                        onChange={(e) => setGiftCardNumber(e.target.value)}
                        placeholder="XXXX-XXXX-XXXX"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button className="text-sm text-purple-600 hover:text-purple-700">
                      Check Balance →
                    </button>
                  </div>
                )}
                
                {/* Amount Input */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Pay
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
                      />
                    </div>
                    {parseFloat(amount) !== remaining && remaining > 0 && (
                      <button
                        onClick={() => setAmount(remaining.toFixed(2))}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        Reset to ${remaining.toFixed(2)}
                      </button>
                    )}
                  </div>
                  {parseFloat(amount) < remaining && (
                    <p className="text-xs text-amber-600 mt-1">Partial payment of ${amount}</p>
                  )}
                </div>
                
                <button
                  onClick={addPayment}
                  disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Add Payment'
                  )}
                </button>
              </div>
            </div>
            
            {/* Right: Payment Summary */}
            <div className="space-y-6">
              {/* Applied Payments */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Applied Payments</h3>
                {payments.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No payments added yet</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <CreditCard className="w-4 h-4 text-gray-600" />
                            {payment.tokenId && (
                              <Lock className="w-2 h-2 text-green-600 absolute -top-1 -right-1" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {payment.method}
                              {payment.isHSA && <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">HSA</span>}
                              {payment.isFSA && <span className="ml-1 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">FSA</span>}
                            </p>
                            {payment.cardLast4 && (
                              <p className="text-xs text-gray-500">
                                {payment.cardType} ending {payment.cardLast4}
                                {payment.saveCard && <span className="ml-1 text-purple-600">• Saved</span>}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">${payment.amount.toFixed(2)}</span>
                          <button
                            onClick={() => removePayment(payment.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <X className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Totals */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tip ({tipMode === 'percentage' ? `${tipPercentage}%` : 'Custom'})</span>
                    <span className="font-medium text-green-600">+${tipAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="font-medium text-green-600">${totalPaid.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-medium">Remaining</span>
                    <span className={`text-lg font-bold ${isFullyPaid ? 'text-green-600' : 'text-red-600'}`}>
                      ${remaining.toFixed(2)}
                    </span>
                  </div>
                </div>
                {change > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">Change Due</span>
                      <span className="text-lg font-bold">${change.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Receipt Options */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-medium text-gray-700">Receipt Options</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sendReceipt"
                      checked={sendReceipt}
                      onChange={(e) => setSendReceipt(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="sendReceipt" className="text-sm text-gray-700">
                      Email receipt to patient
                    </label>
                  </div>
                  {sendReceipt && (
                    <input
                      type="email"
                      value={receiptEmail}
                      onChange={(e) => setReceiptEmail(e.target.value)}
                      placeholder="patient@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  )}
                </div>
              </div>
              
              {/* Complete Button */}
              <button
                onClick={handleComplete}
                disabled={!isFullyPaid}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Complete Payment
              </button>
              
              {!isFullyPaid && (
                <p className="text-xs text-gray-500 text-center flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5" />
                  Full payment required to complete
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stripe Payment Modal */}
      {showStripePayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Secure Payment</h3>
              <button
                onClick={() => setShowStripePayment(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <StripePaymentForm
              amount={parseFloat(amount)}
              patientId={patientId || 'guest'}
              patientName="Patient"
              patientEmail={receiptEmail}
              invoiceId={`INV-${Date.now()}`}
              onSuccess={(paymentIntentId) => {
                // Add the payment to the list
                const payment: Payment = {
                  id: paymentIntentId,
                  method: activeMethod,
                  amount: parseFloat(amount),
                  cardLast4: '****',
                  cardType: 'Card',
                  tokenId: paymentIntentId,
                  saveCard: saveCard,
                  isHSA: activeMethod === 'hsa',
                  isFSA: activeMethod === 'fsa'
                }
                setPayments([...payments, payment])
                setShowStripePayment(false)
                setAmount(remaining > 0 ? remaining.toFixed(2) : '')
                setCardNumber('')
                setExpiryDate('')
                setCvv('')
                setZipCode('')
                setSaveCard(false)
              }}
              onCancel={() => setShowStripePayment(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}