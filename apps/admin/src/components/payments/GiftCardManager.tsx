'use client'

import { useState } from 'react'
import {
  Gift,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Sparkles,
  CreditCard,
  ShoppingBag,
  Heart,
  Star,
  Send,
  RefreshCw,
  Lock,
  History
} from 'lucide-react'

interface GiftCard {
  id: string
  code: string
  originalAmount: number
  currentBalance: number
  purchasedBy: string
  purchasedDate: Date
  recipientEmail?: string
  recipientName?: string
  expiryDate?: Date
  status: 'active' | 'redeemed' | 'expired' | 'pending'
  lastUsed?: Date
  transactions: GiftCardTransaction[]
  design: 'standard' | 'birthday' | 'holiday' | 'spa' | 'custom'
  message?: string
  scheduledDate?: Date
}

interface GiftCardTransaction {
  id: string
  date: Date
  type: 'purchase' | 'redemption' | 'reload' | 'refund'
  amount: number
  description: string
  performedBy: string
  invoiceId?: string
}

export function GiftCardManager() {
  const [activeTab, setActiveTab] = useState<'purchase' | 'manage' | 'bulk'>('purchase')
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDesign, setSelectedDesign] = useState<GiftCard['design']>('standard')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  // Purchase form state
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [personalMessage, setPersonalMessage] = useState('')
  const [sendImmediately, setSendImmediately] = useState(true)
  const [scheduledDate, setScheduledDate] = useState('')
  const [purchaserName, setPurchaserName] = useState('')
  const [purchaserEmail, setPurchaserEmail] = useState('')
  
  // Sample data - this would come from database in real app
  const [giftCards, setGiftCards] = useState<GiftCard[]>([
    {
      id: 'GC-001',
      code: 'GIFT-2024-XMAS-001',
      originalAmount: 500,
      currentBalance: 325,
      purchasedBy: 'John Smith',
      purchasedDate: new Date('2024-12-15'),
      recipientEmail: 'jane.doe@email.com',
      recipientName: 'Jane Doe',
      expiryDate: new Date('2025-12-15'),
      status: 'active',
      lastUsed: new Date('2024-12-20'),
      design: 'holiday',
      message: 'Merry Christmas! Enjoy your spa day!',
      transactions: [
        {
          id: 'T-001',
          date: new Date('2024-12-15'),
          type: 'purchase',
          amount: 500,
          description: 'Gift card purchased',
          performedBy: 'John Smith'
        },
        {
          id: 'T-002',
          date: new Date('2024-12-20'),
          type: 'redemption',
          amount: -175,
          description: 'Facial treatment',
          performedBy: 'Front Desk',
          invoiceId: 'INV-2024-1234'
        }
      ]
    },
    {
      id: 'GC-002',
      code: 'GIFT-2024-BDAY-002',
      originalAmount: 250,
      currentBalance: 250,
      purchasedBy: 'Sarah Johnson',
      purchasedDate: new Date('2024-12-01'),
      recipientEmail: 'mike.wilson@email.com',
      recipientName: 'Mike Wilson',
      status: 'pending',
      design: 'birthday',
      scheduledDate: new Date('2025-01-15'),
      transactions: [
        {
          id: 'T-003',
          date: new Date('2024-12-01'),
          type: 'purchase',
          amount: 250,
          description: 'Gift card purchased - Scheduled delivery',
          performedBy: 'Sarah Johnson'
        }
      ]
    },
    {
      id: 'GC-003',
      code: 'GIFT-2024-SPA-003',
      originalAmount: 1000,
      currentBalance: 0,
      purchasedBy: 'Corporate Account - Tech Inc',
      purchasedDate: new Date('2024-11-01'),
      recipientName: 'Various Employees',
      status: 'redeemed',
      design: 'spa',
      lastUsed: new Date('2024-12-22'),
      transactions: [
        {
          id: 'T-004',
          date: new Date('2024-11-01'),
          type: 'purchase',
          amount: 1000,
          description: 'Bulk purchase - Employee rewards',
          performedBy: 'Corporate Account'
        },
        {
          id: 'T-005',
          date: new Date('2024-11-15'),
          type: 'redemption',
          amount: -450,
          description: 'Massage therapy package',
          performedBy: 'Therapist Jane',
          invoiceId: 'INV-2024-0987'
        },
        {
          id: 'T-006',
          date: new Date('2024-12-22'),
          type: 'redemption',
          amount: -550,
          description: 'Injectable treatments',
          performedBy: 'Dr. Smith',
          invoiceId: 'INV-2024-1456'
        }
      ]
    }
  ])
  
  const quickAmounts = [50, 100, 150, 200, 250, 500, 750, 1000]
  
  const designs = [
    { id: 'standard', name: 'Classic Spa', icon: Sparkles, color: 'purple' },
    { id: 'birthday', name: 'Birthday', icon: Gift, color: 'pink' },
    { id: 'holiday', name: 'Holiday', icon: Star, color: 'green' },
    { id: 'spa', name: 'Luxury Spa', icon: Heart, color: 'red' },
    { id: 'custom', name: 'Custom', icon: Upload, color: 'blue' }
  ]
  
  const stats = {
    totalActive: giftCards.filter(gc => gc.status === 'active').length,
    totalBalance: giftCards.reduce((sum, gc) => sum + gc.currentBalance, 0),
    totalSold: giftCards.reduce((sum, gc) => sum + gc.originalAmount, 0),
    monthlyRedemptions: 1250
  }
  
  const handlePurchase = () => {
    // Create new gift card
    const newGiftCard: GiftCard = {
      id: `GC-${Date.now()}`,
      code: `GIFT-2025-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      originalAmount: parseFloat(purchaseAmount) || 0,
      currentBalance: parseFloat(purchaseAmount) || 0,
      purchasedBy: purchaserName || 'Guest',
      purchasedDate: new Date(),
      recipientEmail: recipientEmail,
      recipientName: recipientName,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      status: sendImmediately ? 'active' : 'pending',
      design: selectedDesign,
      message: personalMessage,
      transactions: [
        {
          id: `T-${Date.now()}`,
          date: new Date(),
          type: 'purchase',
          amount: parseFloat(purchaseAmount) || 0,
          description: 'Gift card purchased',
          performedBy: purchaserName || 'Guest'
        }
      ]
    }
    
    // Add to list (in real app, would save to database)
    setGiftCards([newGiftCard, ...giftCards])
    
    // Show success message
    alert(`Gift card created! Code: ${newGiftCard.code}`)
    
    // Reset form
    setShowPurchaseForm(false)
    setPurchaseAmount('')
    setRecipientName('')
    setRecipientEmail('')
    setPersonalMessage('')
    setPurchaserName('')
    setPurchaserEmail('')
  }
  
  const handleReload = (cardId: string) => {
    console.log('Reloading gift card:', cardId)
  }
  
  const handleCheckBalance = (code: string) => {
    const card = giftCards.find(gc => gc.code === code)
    if (card) {
      alert(`Balance: $${card.currentBalance.toFixed(2)}`)
    } else {
      alert('Gift card not found')
    }
  }
  
  const renderPurchaseTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Gift className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold">{stats.totalActive}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Active Cards</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold">${stats.totalBalance.toFixed(0)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Total Balance</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold">${stats.totalSold.toFixed(0)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Total Sold</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <ShoppingBag className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold">${stats.monthlyRedemptions}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Monthly Redemptions</p>
        </div>
      </div>
      
      {!showPurchaseForm ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Gift className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Purchase New Gift Card</h3>
          <p className="text-gray-600 mb-6">
            Create a perfect gift for spa treatments and products
          </p>
          <button
            onClick={() => setShowPurchaseForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
          >
            Create Gift Card
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">New Gift Card</h3>
            <button
              onClick={() => setShowPurchaseForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Card Design & Amount */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Design
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {designs.map((design) => (
                    <button
                      key={design.id}
                      onClick={() => setSelectedDesign(design.id as GiftCard['design'])}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedDesign === design.id
                          ? design.color === 'purple' ? 'border-purple-500 bg-purple-50' :
                            design.color === 'pink' ? 'border-pink-500 bg-pink-50' :
                            design.color === 'green' ? 'border-green-500 bg-green-50' :
                            design.color === 'red' ? 'border-red-500 bg-red-50' :
                            design.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                            'border-gray-500 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <design.icon className={`w-6 h-6 mx-auto mb-2 ${
                        selectedDesign === design.id
                          ? design.color === 'purple' ? 'text-purple-600' :
                            design.color === 'pink' ? 'text-pink-600' :
                            design.color === 'green' ? 'text-green-600' :
                            design.color === 'red' ? 'text-red-600' :
                            design.color === 'blue' ? 'text-blue-600' :
                            'text-gray-600'
                          : 'text-gray-600'
                      }`} />
                      <p className="text-xs font-medium">{design.name}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gift Amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {quickAmounts.slice(0, 4).map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setPurchaseAmount(amount.toString())}
                      className={`py-2 rounded-lg border transition-all ${
                        purchaseAmount === amount.toString()
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  rows={3}
                  placeholder="Happy Birthday! Enjoy a relaxing day at the spa..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            {/* Right: Recipient & Delivery */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recipient Information</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Recipient email (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Purchaser Information</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={purchaserName}
                    onChange={(e) => setPurchaserName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="email"
                    value={purchaserEmail}
                    onChange={(e) => setPurchaserEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Delivery Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="sendNow"
                      checked={sendImmediately}
                      onChange={() => setSendImmediately(true)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <label htmlFor="sendNow" className="text-sm text-gray-700">
                      Send immediately
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="sendLater"
                      checked={!sendImmediately}
                      onChange={() => setSendImmediately(false)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <label htmlFor="sendLater" className="text-sm text-gray-700">
                      Schedule for later
                    </label>
                  </div>
                  {!sendImmediately && (
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handlePurchase}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Purchase ${purchaseAmount || '0'}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Payment will be processed securely
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
  
  const renderManageTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, recipient, or purchaser..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          Filters
        </button>
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Download className="w-5 h-5 text-gray-600" />
          Export
        </button>
      </div>
      
      {/* Gift Cards List */}
      <div className="space-y-4">
        {giftCards.map((card) => (
          <div key={card.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">{card.code}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    card.status === 'active' ? 'bg-green-100 text-green-700' :
                    card.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    card.status === 'redeemed' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                  </span>
                  {card.design !== 'standard' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {card.design} design
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-500">Original Amount</p>
                    <p className="font-medium">${card.originalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Balance</p>
                    <p className="font-medium text-green-600">${card.currentBalance.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Recipient</p>
                    <p className="font-medium">{card.recipientName || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Purchased By</p>
                    <p className="font-medium">{card.purchasedBy}</p>
                  </div>
                </div>
                
                {card.message && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 italic">"{card.message}"</p>
                  </div>
                )}
                
                {/* Transaction History */}
                {card.transactions.length > 0 && (
                  <div className="mt-4">
                    <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                      <History className="w-4 h-4" />
                      View {card.transactions.length} transaction{card.transactions.length > 1 ? 's' : ''}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {card.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleReload(card.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Reload"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Send">
                      <Send className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="More">
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
  
  const renderBulkTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Bulk Gift Card Purchase</h3>
            <p className="text-sm text-gray-600">Perfect for corporate gifts and employee rewards</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4">
            <Upload className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-medium mb-1">Upload CSV</h4>
            <p className="text-xs text-gray-600">Import recipient list</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <CreditCard className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-medium mb-1">Set Values</h4>
            <p className="text-xs text-gray-600">Same or different amounts</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <Send className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-medium mb-1">Deliver</h4>
            <p className="text-xs text-gray-600">Email or print codes</p>
          </div>
        </div>
        
        <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Start Bulk Purchase
        </button>
      </div>
      
      {/* Corporate Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Corporate Features</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Volume Discounts</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>$1,000 - $5,000</span>
                <span className="text-green-600 font-medium">5% bonus</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>$5,001 - $10,000</span>
                <span className="text-green-600 font-medium">10% bonus</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>$10,000+</span>
                <span className="text-green-600 font-medium">15% bonus</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Custom Options</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Custom branding & designs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Extended expiration dates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Dedicated account manager
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Usage reports & analytics
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gift Cards</h1>
        <p className="text-gray-600 mt-1">Manage gift cards and digital vouchers</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('purchase')}
          className={`flex-1 px-4 py-2 rounded-md transition-all ${
            activeTab === 'purchase'
              ? 'bg-white shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Purchase
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex-1 px-4 py-2 rounded-md transition-all ${
            activeTab === 'manage'
              ? 'bg-white shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manage
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`flex-1 px-4 py-2 rounded-md transition-all ${
            activeTab === 'bulk'
              ? 'bg-white shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Bulk & Corporate
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'purchase' && renderPurchaseTab()}
      {activeTab === 'manage' && renderManageTab()}
      {activeTab === 'bulk' && renderBulkTab()}
    </div>
  )
}