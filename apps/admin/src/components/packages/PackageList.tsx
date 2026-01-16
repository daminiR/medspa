'use client'

import { useState } from 'react'
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Archive,
  Copy,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Wallet,
  Gift,
  ShoppingBag
} from 'lucide-react'
import { Package as PackageType } from '@/types/packages'
import { PackageCreationWizard } from './PackageCreationWizard'
import toast from 'react-hot-toast'

export function PackageList() {
  const [packages, setPackages] = useState<PackageType[]>([
    {
      id: '1',
      name: 'Botox Bundle - 100 Units',
      description: 'Pre-purchase 100 units of Botox at a discounted rate',
      type: 'standard',
      status: 'active',
      purchasePrice: 1200,
      regularValue: 1400,
      savings: 200,
      quantity: 100,
      expirationDays: 365,
      eligibleServices: [
        { serviceId: 'botox', serviceName: 'Botox (per unit)', sessionValue: 14, quantity: 100 }
      ],
      allowPartialRedemption: true,
      requireFullPayment: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin',
      includesProducts: false,
      taxable: true,
      priceIncludesTax: false,
      automaticallyRedeemOnline: true
    },
    {
      id: '2',
      name: 'Aesthetic Wallet - $5000',
      description: 'Pre-load $5000 to use on any treatments',
      type: 'wallet',
      status: 'active',
      purchasePrice: 4500,
      regularValue: 5000,
      savings: 500,
      expirationDays: undefined,
      eligibleServices: [],
      allowPartialRedemption: true,
      requireFullPayment: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'admin',
      includesProducts: true,
      taxable: true,
      priceIncludesTax: false,
      automaticallyRedeemOnline: true
    },
    {
      id: '3',
      name: 'Facial Package - Buy 5 Get 1 Free',
      description: 'Purchase 5 HydraFacials and receive the 6th free',
      type: 'buy-get-free',
      status: 'active',
      purchasePrice: 1250,
      regularValue: 1500,
      savings: 250,
      quantity: 6,
      expirationDays: 180,
      eligibleServices: [
        { serviceId: 'hydrafacial', serviceName: 'HydraFacial', sessionValue: 250, quantity: 6 }
      ],
      allowPartialRedemption: true,
      requireFullPayment: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      createdBy: 'admin',
      includesProducts: false,
      taxable: true,
      priceIncludesTax: false,
      automaticallyRedeemOnline: true
    }
  ])
  
  const [showCreateWizard, setShowCreateWizard] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  
  const getPackageIcon = (type: string) => {
    switch(type) {
      case 'wallet':
      case 'bank':
        return Wallet
      case 'buy-get-free':
        return Gift
      case 'multi-service':
        return ShoppingBag
      default:
        return Package
    }
  }
  
  const getPackageColor = (type: string) => {
    switch(type) {
      case 'wallet':
      case 'bank':
        return 'green'
      case 'buy-get-free':
        return 'pink'
      case 'multi-service':
        return 'blue'
      case 'threshold':
        return 'orange'
      case 'no-upfront':
        return 'indigo'
      default:
        return 'purple'
    }
  }
  
  const handleCreatePackage = (packageData: Partial<PackageType>) => {
    const newPackage: PackageType = {
      ...packageData as PackageType,
      id: (packages.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin'
    }
    setPackages([...packages, newPackage])
  }
  
  const handleDuplicate = (pkg: PackageType) => {
    const duplicated: PackageType = {
      ...pkg,
      id: (packages.length + 1).toString(),
      name: `${pkg.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setPackages([...packages, duplicated])
    toast.success('Package duplicated successfully')
  }
  
  const handleArchive = (packageId: string) => {
    setPackages(packages.map(pkg => 
      pkg.id === packageId 
        ? { ...pkg, status: 'archived' as const }
        : pkg
    ))
    toast.success('Package archived')
  }
  
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || pkg.type === filterType
    const notArchived = pkg.status !== 'archived'
    return matchesSearch && matchesFilter && notArchived
  })
  
  // Calculate statistics
  const stats = {
    totalActive: packages.filter(p => p.status === 'active').length,
    totalRevenue: packages.reduce((sum, p) => sum + (p.purchasePrice || 0), 0),
    avgSavings: packages.reduce((sum, p) => sum + (p.savings || 0), 0) / packages.length,
    walletPackages: packages.filter(p => p.type === 'wallet' || p.type === 'bank').length
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Packages & Bundles</h1>
            <p className="text-gray-600 mt-1">Manage treatment packages and prepaid bundles</p>
          </div>
          <button
            onClick={() => setShowCreateWizard(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Package
          </button>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Packages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActive}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Package Value</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Savings</p>
                <p className="text-2xl font-bold text-gray-900">${Math.round(stats.avgSavings)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wallet Packages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.walletPackages}</p>
              </div>
              <Wallet className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Types</option>
            <option value="standard">Standard</option>
            <option value="wallet">Wallet</option>
            <option value="buy-get-free">Buy & Get Free</option>
            <option value="multi-service">Multi-Service</option>
            <option value="threshold">Threshold</option>
            <option value="no-upfront">No Upfront</option>
          </select>
        </div>
      </div>
      
      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => {
          const Icon = getPackageIcon(pkg.type)
          const color = getPackageColor(pkg.type)
          
          return (
            <div key={pkg.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-2 bg-gradient-to-r from-${color}-500 to-${color}-600`} />
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{pkg.type.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setSelectedPackage(selectedPackage === pkg.id ? null : pkg.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    {selectedPackage === pkg.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDuplicate(pkg)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" /> Duplicate
                        </button>
                        <button 
                          onClick={() => handleArchive(pkg.id)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Archive className="w-4 h-4" /> Archive
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {pkg.description && (
                  <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                )}
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Purchase Price</span>
                    <span className="font-semibold text-gray-900">${pkg.purchasePrice.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Regular Value</span>
                    <span className="font-medium text-gray-700">${pkg.regularValue.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Patient Saves</span>
                    <span className="font-semibold text-green-600">
                      ${pkg.savings.toLocaleString()}
                      <span className="text-xs ml-1">({Math.round((pkg.savings / pkg.regularValue) * 100)}%)</span>
                    </span>
                  </div>
                  
                  {pkg.quantity && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Sessions/Uses</span>
                      <span className="font-medium text-gray-700">{pkg.quantity}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Expiration</span>
                    <span className="font-medium text-gray-700">
                      {pkg.expirationDays ? `${pkg.expirationDays} days` : 'Never'}
                    </span>
                  </div>
                  
                  {pkg.eligibleServices.length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Eligible Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {pkg.eligibleServices.slice(0, 3).map((service, index) => (
                          <span key={index} className="px-2 py-0.5 bg-gray-100 text-xs text-gray-700 rounded">
                            {service.serviceName}
                          </span>
                        ))}
                        {pkg.eligibleServices.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-xs text-gray-700 rounded">
                            +{pkg.eligibleServices.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      pkg.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {pkg.status}
                    </span>
                    <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Empty State */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No packages found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
      
      {/* Creation Wizard */}
      {showCreateWizard && (
        <PackageCreationWizard
          onClose={() => setShowCreateWizard(false)}
          onSave={handleCreatePackage}
        />
      )}
    </div>
  )
}