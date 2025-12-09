'use client'

import { useState } from 'react'
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
  Package
} from 'lucide-react'

interface PaymentFormProps {
  invoiceTotal: number
  onComplete: (payments: Payment[]) => void
  onCancel: () => void
}

interface Payment {
  id: string
  method: 'cash' | 'credit' | 'debit' | 'check' | 'giftcard' | 'package' | 'membership'
  amount: number
  reference?: string
  cardLast4?: string
  cardType?: string
}

export function PaymentForm({ invoiceTotal, onComplete, onCancel }: PaymentFormProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [activeMethod, setActiveMethod] = useState<Payment['method']>('credit')
  const [amount, setAmount] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [cashReceived, setCashReceived] = useState('')
  const [giftCardNumber, setGiftCardNumber] = useState('')
  
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = invoiceTotal - totalPaid
  const isFullyPaid = remaining <= 0
  const change = remaining < 0 ? Math.abs(remaining) : 0
  
  const paymentMethods = [
    { id: 'credit', name: 'Credit Card', icon: CreditCard, color: 'purple' },
    { id: 'debit', name: 'Debit Card', icon: CreditCard, color: 'blue' },
    { id: 'cash', name: 'Cash', icon: Banknote, color: 'green' },
    { id: 'check', name: 'Check', icon: Receipt, color: 'gray' },
    { id: 'giftcard', name: 'Gift Card', icon: Gift, color: 'pink' },
    { id: 'package', name: 'Package Credit', icon: Package, color: 'orange' },
    { id: 'membership', name: 'Membership', icon: Users, color: 'indigo' },
  ]
  
  const quickCashAmounts = [20, 50, 100, 200, 500, 1000]
  
  const addPayment = () => {
    if (!amount || parseFloat(amount) <= 0) return
    
    const payment: Payment = {
      id: `PAY-${Date.now()}`,
      method: activeMethod,
      amount: parseFloat(amount),
    }
    
    // Add card details if credit/debit
    if ((activeMethod === 'credit' || activeMethod === 'debit') && cardNumber) {
      payment.cardLast4 = cardNumber.slice(-4)
      payment.cardType = detectCardType(cardNumber)
    }
    
    // Add reference for check/giftcard
    if (activeMethod === 'check' || activeMethod === 'giftcard') {
      payment.reference = activeMethod === 'giftcard' ? giftCardNumber : 'CHECK'
    }
    
    setPayments([...payments, payment])
    
    // Reset form
    setAmount('')
    setCardNumber('')
    setExpiryDate('')
    setCvv('')
    setGiftCardNumber('')
    setCashReceived('')
  }
  
  const removePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id))
  }
  
  const detectCardType = (number: string): string => {
    if (number.startsWith('4')) return 'Visa'
    if (number.startsWith('5')) return 'Mastercard'
    if (number.startsWith('3')) return 'Amex'
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
      onComplete(payments)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Process Payment</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total Due: <span className="font-bold text-lg">${invoiceTotal.toFixed(2)}</span>
              </p>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              {/* Method Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h3>
                <div className="grid grid-cols-4 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setActiveMethod(method.id as Payment['method'])}
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
                {(activeMethod === 'credit' || activeMethod === 'debit') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
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
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
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
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
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
                      <input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
                      />
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
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
                    />
                    <button
                      onClick={() => setAmount(remaining.toFixed(2))}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Full: ${remaining.toFixed(2)}
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={addPayment}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Payment
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
                          <CreditCard className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium capitalize">{payment.method}</p>
                            {payment.cardLast4 && (
                              <p className="text-xs text-gray-500">
                                {payment.cardType} ending {payment.cardLast4}
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
                  <span className="text-gray-600">Invoice Total</span>
                  <span className="font-medium">${invoiceTotal.toFixed(2)}</span>
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
    </div>
  )
}