'use client'

import { useState } from 'react'
import {
  DollarSign,
  Gift,
  Package,
  CreditCard,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  History,
  RefreshCw,
  Plus,
  Calendar,
  User
} from 'lucide-react'

interface PatientFinancialsProps {
  patientId: string
  patientName: string
}

interface PatientCredit {
  id: string
  amount: number
  originalAmount: number
  type: 'refund' | 'overpayment' | 'goodwill' | 'promotional'
  reason: string
  createdDate: Date
  expiryDate?: Date
  status: 'active' | 'used' | 'expired'
}

interface PatientGiftCard {
  id: string
  code: string
  balance: number
  originalAmount: number
  purchaseDate: Date
  expiryDate?: Date
  lastUsed?: Date
}

interface PatientPackage {
  id: string
  name: string
  purchaseDate: Date
  expiryDate: Date
  totalSessions: number
  usedSessions: number
  value: number
}

export function PatientFinancials({ patientId, patientName }: PatientFinancialsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'credits' | 'giftcards' | 'packages' | 'history'>('overview')
  
  // Mock data for this patient
  const credits: PatientCredit[] = [
    {
      id: 'CR-001',
      amount: 150,
      originalAmount: 150,
      type: 'goodwill',
      reason: 'Service adjustment',
      createdDate: new Date('2025-08-20'),
      status: 'active'
    }
  ]
  
  const giftCards: PatientGiftCard[] = [
    {
      id: 'GC-001',
      code: 'GIFT-2025-ABC123',
      balance: 225,
      originalAmount: 500,
      purchaseDate: new Date('2025-08-01'),
      lastUsed: new Date('2025-08-15')
    }
  ]
  
  const packages: PatientPackage[] = [
    {
      id: 'PKG-001',
      name: 'Botox Package - 3 Sessions',
      purchaseDate: new Date('2025-07-15'),
      expiryDate: new Date('2026-07-15'),
      totalSessions: 3,
      usedSessions: 1,
      value: 1800
    }
  ]
  
  const totalBalance = {
    credits: credits.reduce((sum, c) => c.status === 'active' ? sum + c.amount : sum, 0),
    giftCards: giftCards.reduce((sum, gc) => sum + gc.balance, 0),
    packageValue: packages.reduce((sum, p) => sum + (p.value * (p.totalSessions - p.usedSessions) / p.totalSessions), 0)
  }
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Balance Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold">${totalBalance.credits.toFixed(2)}</span>
          </div>
          <p className="text-sm font-medium text-gray-700">Account Credits</p>
          <p className="text-xs text-gray-500 mt-1">{credits.filter(c => c.status === 'active').length} active</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Gift className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold">${totalBalance.giftCards.toFixed(2)}</span>
          </div>
          <p className="text-sm font-medium text-gray-700">Gift Card Balance</p>
          <p className="text-xs text-gray-500 mt-1">{giftCards.length} cards</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold">${totalBalance.packageValue.toFixed(0)}</span>
          </div>
          <p className="text-sm font-medium text-gray-700">Package Value</p>
          <p className="text-xs text-gray-500 mt-1">{packages.length} active packages</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Apply Credit
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Use Gift Card
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Redeem Package
          </button>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Package Session Used</p>
                <p className="text-xs text-gray-500">Botox Treatment - Aug 15, 2025</p>
              </div>
            </div>
            <span className="text-sm font-medium">-1 Session</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Gift className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Gift Card Redeemed</p>
                <p className="text-xs text-gray-500">Facial Treatment - Aug 15, 2025</p>
              </div>
            </div>
            <span className="text-sm font-medium text-red-600">-$275.00</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Credit Added</p>
                <p className="text-xs text-gray-500">Goodwill Credit - Aug 20, 2025</p>
              </div>
            </div>
            <span className="text-sm font-medium text-green-600">+$150.00</span>
          </div>
        </div>
      </div>
    </div>
  )
  
  const renderCredits = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Patient Credits</h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Credit
        </button>
      </div>
      
      {credits.map((credit) => (
        <div key={credit.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  credit.status === 'active' ? 'bg-green-100 text-green-700' :
                  credit.status === 'used' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {credit.status}
                </span>
                <span className="text-xs text-gray-500">
                  {credit.createdDate.toLocaleDateString()}
                </span>
              </div>
              <p className="font-medium">{credit.reason}</p>
              <p className="text-sm text-gray-600 mt-1">Type: {credit.type}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-600">${credit.amount.toFixed(2)}</p>
              {credit.originalAmount !== credit.amount && (
                <p className="text-xs text-gray-500">of ${credit.originalAmount.toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
  
  const renderGiftCards = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gift Cards</h3>
      </div>
      
      {giftCards.map((card) => (
        <div key={card.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono text-sm font-medium mb-2">{card.code}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Purchased: {card.purchaseDate.toLocaleDateString()}</span>
                {card.lastUsed && (
                  <span>Last used: {card.lastUsed.toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-purple-600">${card.balance.toFixed(2)}</p>
              <p className="text-xs text-gray-500">of ${card.originalAmount.toFixed(2)}</p>
              <button className="mt-2 text-xs text-purple-600 hover:text-purple-700">
                View History →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
  
  const renderPackages = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Active Packages</h3>
      </div>
      
      {packages.map((pkg) => (
        <div key={pkg.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium mb-2">{pkg.name}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Purchased: {pkg.purchaseDate.toLocaleDateString()}</span>
                <span>Expires: {pkg.expiryDate.toLocaleDateString()}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Sessions used</span>
                  <span>{pkg.usedSessions} of {pkg.totalSessions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                    style={{ width: `${(pkg.usedSessions / pkg.totalSessions) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
              Redeem
            </button>
          </div>
        </div>
      ))}
    </div>
  )
  
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Financial Summary</h2>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex px-6">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'credits', label: 'Credits', icon: RefreshCw },
            { id: 'giftcards', label: 'Gift Cards', icon: Gift },
            { id: 'packages', label: 'Packages', icon: Package },
            { id: 'history', label: 'History', icon: History }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'credits' && renderCredits()}
        {activeTab === 'giftcards' && renderGiftCards()}
        {activeTab === 'packages' && renderPackages()}
        {activeTab === 'history' && (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Transaction history coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}