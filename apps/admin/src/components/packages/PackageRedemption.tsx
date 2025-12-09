'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  Wallet,
  Gift,
  Search,
  Check,
  X,
  AlertCircle,
  Clock,
  CreditCard,
  Info,
  ChevronDown
} from 'lucide-react'
import { PackagePurchase } from '@/types/packages'
import toast from 'react-hot-toast'

interface PackageRedemptionProps {
  patientId: string
  patientName: string
  invoiceTotal: number
  lineItems: {
    id: string
    serviceId: string
    serviceName: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  onApplyPackage: (packageId: string, appliedAmount: number) => void
  onRemovePackage: (packageId: string) => void
}

export function PackageRedemption({
  patientId,
  patientName,
  invoiceTotal,
  lineItems,
  onApplyPackage,
  onRemovePackage
}: PackageRedemptionProps) {
  const [availablePackages, setAvailablePackages] = useState<PackagePurchase[]>([])
  const [selectedPackages, setSelectedPackages] = useState<Map<string, number>>(new Map())
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showWalletDetail, setShowWalletDetail] = useState<string | null>(null)
  
  // Mock data - in production, fetch from API based on patientId
  useEffect(() => {
    const mockPackages: PackagePurchase[] = [
      {
        id: 'pkg-1',
        packageId: '1',
        packageName: 'Botox Bundle - 100 Units',
        patientId: patientId,
        patientName: patientName,
        purchaseDate: new Date('2024-01-15'),
        purchasePrice: 1200,
        paymentMethod: 'credit',
        originalQuantity: 100,
        remainingQuantity: 65,
        originalValue: 1400,
        remainingValue: 910,
        expirationDate: new Date('2025-01-15'),
        status: 'active',
        usageHistory: [
          {
            id: 'use-1',
            packagePurchaseId: 'pkg-1',
            usedDate: new Date('2024-02-01'),
            serviceId: 'botox',
            serviceName: 'Botox - Forehead',
            providerId: 'dr-smith',
            providerName: 'Dr. Smith',
            quantityUsed: 20,
            valueUsed: 280,
            invoiceId: 'inv-123'
          },
          {
            id: 'use-2',
            packagePurchaseId: 'pkg-1',
            usedDate: new Date('2024-03-01'),
            serviceId: 'botox',
            serviceName: 'Botox - Crow\'s Feet',
            providerId: 'dr-smith',
            providerName: 'Dr. Smith',
            quantityUsed: 15,
            valueUsed: 210,
            invoiceId: 'inv-456'
          }
        ]
      },
      {
        id: 'pkg-2',
        packageId: '2',
        packageName: 'Aesthetic Wallet',
        patientId: patientId,
        patientName: patientName,
        purchaseDate: new Date('2024-01-01'),
        purchasePrice: 4500,
        paymentMethod: 'credit',
        originalValue: 5000,
        remainingValue: 3250,
        status: 'active',
        usageHistory: [
          {
            id: 'use-3',
            packagePurchaseId: 'pkg-2',
            usedDate: new Date('2024-01-20'),
            serviceId: 'filler',
            serviceName: 'Dermal Filler - Lips',
            providerId: 'nurse-jessica',
            providerName: 'Nurse Jessica',
            quantityUsed: 1,
            valueUsed: 650,
            invoiceId: 'inv-789'
          },
          {
            id: 'use-4',
            packagePurchaseId: 'pkg-2',
            usedDate: new Date('2024-02-15'),
            serviceId: 'hydrafacial',
            serviceName: 'HydraFacial Deluxe',
            providerId: 'sarah',
            providerName: 'Sarah',
            quantityUsed: 1,
            valueUsed: 350,
            invoiceId: 'inv-012'
          },
          {
            id: 'use-5',
            packagePurchaseId: 'pkg-2',
            usedDate: new Date('2024-03-10'),
            serviceId: 'laser',
            serviceName: 'Laser Hair Removal - Full Legs',
            providerId: 'tech-mike',
            providerName: 'Mike',
            quantityUsed: 1,
            valueUsed: 750,
            invoiceId: 'inv-345'
          }
        ]
      },
      {
        id: 'pkg-3',
        packageId: '3',
        packageName: 'Facial Package - 5+1 Free',
        patientId: patientId,
        patientName: patientName,
        purchaseDate: new Date('2024-02-01'),
        purchasePrice: 1250,
        paymentMethod: 'credit',
        originalQuantity: 6,
        remainingQuantity: 4,
        originalValue: 1500,
        remainingValue: 1000,
        expirationDate: new Date('2024-08-01'),
        status: 'active',
        usageHistory: [
          {
            id: 'use-6',
            packagePurchaseId: 'pkg-3',
            usedDate: new Date('2024-02-15'),
            serviceId: 'hydrafacial',
            serviceName: 'HydraFacial',
            providerId: 'sarah',
            providerName: 'Sarah',
            quantityUsed: 1,
            valueUsed: 250,
            invoiceId: 'inv-678'
          },
          {
            id: 'use-7',
            packagePurchaseId: 'pkg-3',
            usedDate: new Date('2024-03-15'),
            serviceId: 'hydrafacial',
            serviceName: 'HydraFacial',
            providerId: 'sarah',
            providerName: 'Sarah',
            quantityUsed: 1,
            valueUsed: 250,
            invoiceId: 'inv-901'
          }
        ]
      }
    ]
    
    setAvailablePackages(mockPackages.filter(p => p.status === 'active'))
  }, [patientId, patientName])
  
  const getPackageIcon = (packageName: string) => {
    if (packageName.toLowerCase().includes('wallet')) return Wallet
    if (packageName.toLowerCase().includes('gift')) return Gift
    return Package
  }
  
  const getExpirationStatus = (date?: Date) => {
    if (!date) return { text: 'No expiration', color: 'text-green-600', bgColor: 'bg-green-50' }
    
    const now = new Date()
    const daysUntilExpiration = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiration < 0) {
      return { text: 'Expired', color: 'text-red-600', bgColor: 'bg-red-50' }
    } else if (daysUntilExpiration <= 30) {
      return { text: `Expires in ${daysUntilExpiration} days`, color: 'text-orange-600', bgColor: 'bg-orange-50' }
    } else if (daysUntilExpiration <= 90) {
      return { text: `Expires in ${Math.floor(daysUntilExpiration / 30)} months`, color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    } else {
      return { text: `Expires ${date.toLocaleDateString()}`, color: 'text-gray-600', bgColor: 'bg-gray-50' }
    }
  }
  
  const canApplyPackageToServices = (pkg: PackagePurchase): boolean => {
    // For wallet packages, can apply to anything
    if (pkg.packageName.toLowerCase().includes('wallet')) return true
    
    // For service-specific packages, check if any line items match
    // In production, you'd check against the package's eligible services
    const hasBotox = lineItems.some(item => 
      item.serviceName.toLowerCase().includes('botox')
    )
    const hasFacial = lineItems.some(item => 
      item.serviceName.toLowerCase().includes('facial') || 
      item.serviceName.toLowerCase().includes('hydrafacial')
    )
    
    if (pkg.packageName.toLowerCase().includes('botox') && hasBotox) return true
    if (pkg.packageName.toLowerCase().includes('facial') && hasFacial) return true
    
    return false
  }
  
  const handleApplyPackage = (pkg: PackagePurchase) => {
    if (!canApplyPackageToServices(pkg)) {
      toast.error('This package cannot be applied to the current services')
      return
    }
    
    const maxApplicable = Math.min(pkg.remainingValue || 0, invoiceTotal)
    if (maxApplicable <= 0) {
      toast.error('No remaining balance on this package')
      return
    }
    
    // For wallet packages, apply up to invoice total
    if (pkg.packageName.toLowerCase().includes('wallet')) {
      const amountToApply = Math.min(maxApplicable, invoiceTotal - getTotalApplied())
      selectedPackages.set(pkg.id, amountToApply)
      setSelectedPackages(new Map(selectedPackages))
      onApplyPackage(pkg.id, amountToApply)
      toast.success(`Applied $${amountToApply.toFixed(2)} from wallet`)
    } else {
      // For session packages, calculate based on eligible services
      const eligibleAmount = calculateEligibleAmount(pkg)
      const amountToApply = Math.min(eligibleAmount, maxApplicable, invoiceTotal - getTotalApplied())
      
      selectedPackages.set(pkg.id, amountToApply)
      setSelectedPackages(new Map(selectedPackages))
      onApplyPackage(pkg.id, amountToApply)
      toast.success(`Applied package: ${pkg.packageName}`)
    }
  }
  
  const handleRemovePackage = (packageId: string) => {
    selectedPackages.delete(packageId)
    setSelectedPackages(new Map(selectedPackages))
    onRemovePackage(packageId)
    toast.success('Package removed')
  }
  
  const calculateEligibleAmount = (pkg: PackagePurchase): number => {
    // Calculate based on matching services in the invoice
    let eligibleTotal = 0
    
    lineItems.forEach(item => {
      if (pkg.packageName.toLowerCase().includes('botox') && 
          item.serviceName.toLowerCase().includes('botox')) {
        eligibleTotal += item.total
      } else if (pkg.packageName.toLowerCase().includes('facial') && 
                (item.serviceName.toLowerCase().includes('facial') || 
                 item.serviceName.toLowerCase().includes('hydrafacial'))) {
        eligibleTotal += item.total
      }
    })
    
    return eligibleTotal
  }
  
  const getTotalApplied = (): number => {
    let total = 0
    selectedPackages.forEach(amount => {
      total += amount
    })
    return total
  }
  
  const filteredPackages = availablePackages.filter(pkg =>
    pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.status.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Available Packages & Credits</h3>
          <span className="text-sm text-gray-500">
            {availablePackages.length} package{availablePackages.length !== 1 ? 's' : ''} available
          </span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {filteredPackages.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No packages available for this patient</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPackages.map(pkg => {
              const Icon = getPackageIcon(pkg.packageName)
              const expStatus = getExpirationStatus(pkg.expirationDate)
              const isSelected = selectedPackages.has(pkg.id)
              const canApply = canApplyPackageToServices(pkg)
              const isWallet = pkg.packageName.toLowerCase().includes('wallet')
              
              return (
                <div key={pkg.id} className={`p-4 ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isWallet ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isWallet ? 'text-green-600' : 'text-purple-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{pkg.packageName}</h4>
                          {isSelected && (
                            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                              Applied
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          {isWallet ? (
                            <span className="font-medium text-green-600">
                              Balance: ${pkg.remainingValue?.toFixed(2) || '0.00'}
                            </span>
                          ) : (
                            <>
                              <span className="text-gray-600">
                                {pkg.remainingQuantity} of {pkg.originalQuantity} sessions remaining
                              </span>
                              <span className="font-medium text-gray-900">
                                Value: ${pkg.remainingValue?.toFixed(2) || '0.00'}
                              </span>
                            </>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${expStatus.bgColor} ${expStatus.color}`}>
                            {expStatus.text}
                          </span>
                        </div>
                        
                        {!canApply && !isWallet && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                            <AlertCircle className="w-3 h-3" />
                            <span>Not applicable to current services</span>
                          </div>
                        )}
                        
                        {/* Usage History Toggle */}
                        <button
                          onClick={() => setExpandedPackage(expandedPackage === pkg.id ? null : pkg.id)}
                          className="flex items-center gap-1 mt-2 text-xs text-purple-600 hover:text-purple-700"
                        >
                          <Clock className="w-3 h-3" />
                          <span>View usage history ({pkg.usageHistory.length})</span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${
                            expandedPackage === pkg.id ? 'rotate-180' : ''
                          }`} />
                        </button>
                        
                        {/* Expanded Usage History */}
                        {expandedPackage === pkg.id && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h5 className="text-xs font-medium text-gray-700 mb-2">Recent Usage</h5>
                            <div className="space-y-2">
                              {pkg.usageHistory.slice(0, 3).map(usage => (
                                <div key={usage.id} className="flex justify-between text-xs">
                                  <div>
                                    <span className="text-gray-900">{usage.serviceName}</span>
                                    <span className="text-gray-500 ml-2">
                                      {new Date(usage.usedDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <span className="font-medium text-gray-900">
                                    -${usage.valueUsed.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                              {pkg.usageHistory.length > 3 && (
                                <button className="text-purple-600 hover:text-purple-700 text-xs">
                                  View all {pkg.usageHistory.length} transactions →
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="ml-4">
                      {isSelected ? (
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-sm font-medium text-green-600">
                            -${selectedPackages.get(pkg.id)?.toFixed(2) || '0.00'}
                          </span>
                          <button
                            onClick={() => handleRemovePackage(pkg.id)}
                            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApplyPackage(pkg)}
                          disabled={!canApply || (pkg.remainingValue || 0) <= 0}
                          className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                            canApply && (pkg.remainingValue || 0) > 0
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Summary */}
      {selectedPackages.size > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {selectedPackages.size} package{selectedPackages.size !== 1 ? 's' : ''} applied
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total package credit</p>
              <p className="text-xl font-bold text-green-600">
                -${getTotalApplied().toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}