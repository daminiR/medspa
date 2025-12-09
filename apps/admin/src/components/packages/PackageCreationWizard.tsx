'use client'

import { useState } from 'react'
import {
  X,
  Package,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Gift,
  Wallet,
  ShoppingBag,
  Users,
  TrendingUp,
  Info,
  ChevronRight,
  ChevronLeft,
  Save,
  Sparkles
} from 'lucide-react'
import { Package as PackageType, PackageType as PackageTypeEnum } from '@/types/packages'
import toast from 'react-hot-toast'

interface PackageCreationWizardProps {
  onClose: () => void
  onSave: (packageData: Partial<PackageType>) => void
}

export function PackageCreationWizard({ onClose, onSave }: PackageCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [packageData, setPackageData] = useState<Partial<PackageType>>({
    type: 'standard',
    status: 'active',
    allowPartialRedemption: true,
    requireFullPayment: true,
    eligibleServices: [],
    includesProducts: false,
    taxable: false,
    priceIncludesTax: false,
    automaticallyRedeemOnline: false,
    incomeCategory: 'treatment'
  })
  
  // Industry-specific package suggestions
  const [showSuggestions, setShowSuggestions] = useState(true)
  
  // Smart package suggestions based on industry
  const smartSuggestions = [
    {
      name: 'New Patient Special',
      description: 'First-timer package to convert prospects',
      template: {
        type: 'standard' as PackageTypeEnum,
        name: 'New Patient Welcome Package',
        purchasePrice: 299,
        quantity: 3,
        expirationDays: 90
      },
      metrics: '68% conversion rate',
      icon: Sparkles,
      color: 'yellow'
    },
    {
      name: 'Maintenance Membership',
      description: 'Recurring revenue from regulars',
      template: {
        type: 'wallet' as PackageTypeEnum,
        name: 'VIP Wellness Bank',
        purchasePrice: 500,
        regularValue: 600,
        automaticallyRedeemOnline: true
      },
      metrics: '$4,200 avg lifetime value',
      icon: TrendingUp,
      color: 'green'
    },
    {
      name: 'Seasonal Promotion',
      description: 'Time-limited holiday special',
      template: {
        type: 'buy-get-free' as PackageTypeEnum,
        name: 'Holiday Glow Package',
        purchasePrice: 999,
        quantity: 6,
        expirationDays: 180
      },
      metrics: '42% purchase in Q4',
      icon: Gift,
      color: 'red'
    }
  ]
  
  // Package type templates based on Jane App
  const packageTemplates = [
    {
      type: 'standard' as PackageTypeEnum,
      name: 'Standard Package',
      description: 'Prepaid sessions - Most popular for medical spas',
      icon: Package,
      color: 'purple',
      example: 'Buy 10 Botox sessions, use anytime',
      recommended: true
    },
    {
      type: 'wallet' as PackageTypeEnum,
      name: 'Wallet/Bank Style',
      description: 'Dollar amount to spend on any service',
      icon: Wallet,
      color: 'green',
      example: '$5,000 credit for treatments',
      recommended: true
    },
    {
      type: 'buy-get-free' as PackageTypeEnum,
      name: 'Buy & Get Free',
      description: 'Purchase X sessions, get Y free',
      icon: Gift,
      color: 'pink',
      example: 'Buy 5 facials, get 6th free'
    },
    {
      type: 'multi-service' as PackageTypeEnum,
      name: 'Multi-Service Bundle',
      description: 'Combine different treatments',
      icon: ShoppingBag,
      color: 'blue',
      example: '3 Botox + 2 Facials + 1 Laser'
    },
    {
      type: 'threshold' as PackageTypeEnum,
      name: 'Threshold Package',
      description: 'Pay regular for X, then discounted',
      icon: TrendingUp,
      color: 'orange',
      example: 'First 3 at full price, rest at 20% off'
    },
    {
      type: 'no-upfront' as PackageTypeEnum,
      name: 'No Upfront Payment',
      description: 'Member pricing without prepayment',
      icon: Users,
      color: 'indigo',
      example: 'VIP pricing on all services'
    }
  ]
  
  // Mock services for demonstration
  const availableServices = [
    { id: 'botox', name: 'Botox (per unit)', category: 'Injectable', price: 14 },
    { id: 'dysport', name: 'Dysport (per unit)', category: 'Injectable', price: 4.5 },
    { id: 'filler-1ml', name: 'Dermal Filler (1ml)', category: 'Injectable', price: 650 },
    { id: 'microneedling', name: 'Microneedling', category: 'Facial', price: 350 },
    { id: 'chemical-peel', name: 'Chemical Peel', category: 'Facial', price: 200 },
    { id: 'laser-hair', name: 'Laser Hair Removal', category: 'Laser', price: 300 },
    { id: 'ipl', name: 'IPL Photofacial', category: 'Laser', price: 400 },
    { id: 'hydrafacial', name: 'HydraFacial', category: 'Facial', price: 250 }
  ]
  
  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }
  
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }
  
  const handleSave = () => {
    // Validation
    if (!packageData.name) {
      toast.error('Please enter a package name')
      setCurrentStep(1)
      return
    }
    if (!packageData.purchasePrice || packageData.purchasePrice <= 0) {
      toast.error('Please set a valid purchase price')
      setCurrentStep(2)
      return
    }
    
    // Calculate savings
    if (packageData.regularValue && packageData.purchasePrice) {
      packageData.savings = packageData.regularValue - packageData.purchasePrice
    }
    
    onSave(packageData)
    toast.success('Package created successfully!')
    onClose()
  }
  
  const addService = (serviceId: string) => {
    const service = availableServices.find(s => s.id === serviceId)
    if (!service) return
    
    const newServices = [...(packageData.eligibleServices || [])]
    if (!newServices.find(s => s.serviceId === serviceId)) {
      newServices.push({
        serviceId: service.id,
        serviceName: service.name,
        sessionValue: service.price,
        quantity: 1,
        additionalCharge: 0,
        staffCompensation: service.price
      })
      setPackageData({ ...packageData, eligibleServices: newServices })
    }
  }
  
  const removeService = (serviceId: string) => {
    const newServices = (packageData.eligibleServices || []).filter(s => s.serviceId !== serviceId)
    setPackageData({ ...packageData, eligibleServices: newServices })
  }
  
  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    const newServices = (packageData.eligibleServices || []).map(s =>
      s.serviceId === serviceId ? { ...s, quantity } : s
    )
    setPackageData({ ...packageData, eligibleServices: newServices })
  }
  
  const calculateRegularValue = () => {
    let total = 0
    packageData.eligibleServices?.forEach(service => {
      total += (service.sessionValue || 0) * (service.quantity || 1)
    })
    return total
  }
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Package</h2>
                <p className="text-sm text-gray-600">Step {currentStep} of 4</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-between">
            {['Type & Details', 'Pricing', 'Services', 'Review'].map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > index + 1 
                    ? 'bg-green-600 text-white'
                    : currentStep === index + 1
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {currentStep > index + 1 ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep === index + 1 ? 'font-medium text-gray-900' : 'text-gray-500'
                }`}>
                  {step}
                </span>
                {index < 3 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
              </div>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Type & Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Smart Suggestions */}
              {showSuggestions && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Smart Package Suggestions
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">Based on top-performing packages in your industry</p>
                    </div>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {smartSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.name}
                        onClick={() => {
                          setPackageData({ ...packageData, ...suggestion.template })
                          toast.success(`Started with ${suggestion.name} template`)
                        }}
                        className="p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 text-left transition-all hover:shadow-md"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 bg-${suggestion.color}-100 rounded-lg flex items-center justify-center`}>
                            <suggestion.icon className={`w-4 h-4 text-${suggestion.color}-600`} />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{suggestion.name}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                        <p className="text-xs font-medium text-purple-600">{suggestion.metrics}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Package Type</h3>
                <div className="grid grid-cols-2 gap-4">
                  {packageTemplates.map((template) => (
                    <button
                      key={template.type}
                      onClick={() => setPackageData({ ...packageData, type: template.type })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        packageData.type === template.type
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 bg-${template.color}-100 rounded-lg flex items-center justify-center`}>
                          <template.icon className={`w-5 h-5 text-${template.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{template.name}</p>
                            {template.recommended && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="font-medium">Example:</span> {template.example}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Name</label>
                <input
                  type="text"
                  value={packageData.name || ''}
                  onChange={(e) => setPackageData({ ...packageData, name: e.target.value })}
                  placeholder="e.g., Botox Bundle 10 Sessions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={packageData.description || ''}
                  onChange={(e) => setPackageData({ ...packageData, description: e.target.value })}
                  placeholder="Describe the package benefits..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}
          
          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Pricing & Expiration</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price
                    <span className="text-gray-500 font-normal ml-1">(What patient pays)</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={packageData.purchasePrice || ''}
                      onChange={(e) => setPackageData({ ...packageData, purchasePrice: parseFloat(e.target.value) })}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Regular Value
                    <span className="text-gray-500 font-normal ml-1">(Total worth)</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={packageData.regularValue || ''}
                      onChange={(e) => setPackageData({ ...packageData, regularValue: parseFloat(e.target.value) })}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              {packageData.purchasePrice && packageData.regularValue && (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">Patient Saves</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        ${((packageData.regularValue || 0) - (packageData.purchasePrice || 0)).toFixed(2)}
                        <span className="text-sm font-normal ml-2">
                          ({(((packageData.regularValue - packageData.purchasePrice) / packageData.regularValue) * 100).toFixed(0)}% off)
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  {/* ROI Calculator */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-700 font-medium">Estimated Monthly Revenue</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">
                          ${(packageData.purchasePrice * 8).toLocaleString()}
                        </span>
                        <p className="text-xs text-blue-600">Based on 8 packages/month avg</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPackageData({ ...packageData, expirationDays: undefined })}
                    className={`p-3 rounded-lg border-2 ${
                      !packageData.expirationDays
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium">Never Expires</p>
                    <p className="text-xs text-gray-500">No time limit</p>
                  </button>
                  <button
                    onClick={() => setPackageData({ ...packageData, expirationDays: 365 })}
                    className={`p-3 rounded-lg border-2 ${
                      packageData.expirationDays === 365
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium">1 Year</p>
                    <p className="text-xs text-gray-500">365 days</p>
                  </button>
                  <button
                    onClick={() => setPackageData({ ...packageData, expirationDays: 180 })}
                    className={`p-3 rounded-lg border-2 ${
                      packageData.expirationDays === 180
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium">6 Months</p>
                    <p className="text-xs text-gray-500">180 days</p>
                  </button>
                </div>
              </div>
              
              {(packageData.type === 'standard' || packageData.type === 'buy-get-free' || packageData.type === 'threshold') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Sessions/Uses
                    {packageData.type === 'threshold' && <span className="text-gray-500 text-xs ml-1">(Set high for unlimited)</span>}
                  </label>
                  <input
                    type="number"
                    value={packageData.quantity || ''}
                    onChange={(e) => setPackageData({ ...packageData, quantity: parseInt(e.target.value) })}
                    placeholder={packageData.type === 'threshold' ? "e.g., 50 for unlimited" : "e.g., 10"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Additional Settings</h4>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={packageData.taxable || false}
                    onChange={(e) => setPackageData({ ...packageData, taxable: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Package is taxable</span>
                    <p className="text-xs text-gray-500">Apply sales tax to package purchase</p>
                  </div>
                </label>
                
                {packageData.taxable && (
                  <label className="flex items-center gap-3 ml-7">
                    <input
                      type="checkbox"
                      checked={packageData.priceIncludesTax || false}
                      onChange={(e) => setPackageData({ ...packageData, priceIncludesTax: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Price includes tax</span>
                      <p className="text-xs text-gray-500">Purchase price is tax-inclusive</p>
                    </div>
                  </label>
                )}
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={packageData.automaticallyRedeemOnline || false}
                    onChange={(e) => setPackageData({ ...packageData, automaticallyRedeemOnline: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Automatically redeem online</span>
                    <p className="text-xs text-gray-500">Auto-apply package when patient books online</p>
                  </div>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Income Category
                  </label>
                  <select
                    value={packageData.incomeCategory || 'treatment'}
                    onChange={(e) => setPackageData({ ...packageData, incomeCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="treatment">Treatment Income</option>
                    <option value="package">Package Sales</option>
                    <option value="retail">Retail/Product</option>
                    <option value="other">Other Income</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Services */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Eligible Services</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Available Services</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {availableServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => addService(service.id)}
                        disabled={packageData.eligibleServices?.some(s => s.serviceId === service.id)}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-100"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">${service.price}</span>
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Services</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {packageData.eligibleServices?.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No services selected</p>
                    ) : (
                      packageData.eligibleServices?.map((service) => (
                        <div key={service.serviceId} className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{service.serviceName}</p>
                              <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-gray-600 w-20">Quantity:</label>
                                  <input
                                    type="number"
                                    value={service.quantity || 1}
                                    onChange={(e) => updateServiceQuantity(service.serviceId, parseInt(e.target.value) || 1)}
                                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                                    min="1"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-gray-600 w-20">Add'l Charge:</label>
                                  <div className="flex items-center">
                                    <span className="text-xs text-gray-500">$</span>
                                    <input
                                      type="number"
                                      value={service.additionalCharge || 0}
                                      onChange={(e) => {
                                        const newServices = (packageData.eligibleServices || []).map(s =>
                                          s.serviceId === service.serviceId 
                                            ? { ...s, additionalCharge: parseFloat(e.target.value) || 0 }
                                            : s
                                        )
                                        setPackageData({ ...packageData, eligibleServices: newServices })
                                      }}
                                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded ml-1"
                                      min="0"
                                      step="0.01"
                                      placeholder="0.00"
                                    />
                                    <span className="text-xs text-gray-500 ml-2">per visit</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-gray-600 w-20">Staff Comp:</label>
                                  <div className="flex items-center">
                                    <span className="text-xs text-gray-500">$</span>
                                    <input
                                      type="number"
                                      value={service.staffCompensation || service.sessionValue || 0}
                                      onChange={(e) => {
                                        const newServices = (packageData.eligibleServices || []).map(s =>
                                          s.serviceId === service.serviceId 
                                            ? { ...s, staffCompensation: parseFloat(e.target.value) || 0 }
                                            : s
                                        )
                                        setPackageData({ ...packageData, eligibleServices: newServices })
                                      }}
                                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded ml-1"
                                      min="0"
                                      step="0.01"
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeService(service.serviceId)}
                              className="p-1 hover:bg-purple-100 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {packageData.eligibleServices && packageData.eligibleServices.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Total Value:</span>
                        <span className="text-lg font-bold text-gray-900">
                          ${calculateRegularValue().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Info className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-700">
                  {packageData.type === 'wallet' 
                    ? 'For wallet packages, these services can be purchased using the wallet balance.'
                    : 'Patients can only use this package for the selected services.'}
                </p>
              </div>
            </div>
          )}
          
          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Package</h3>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900">{packageData.name}</h4>
                    {packageData.description && (
                      <p className="text-gray-600 mt-1">{packageData.description}</p>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2 font-medium text-gray-900 capitalize">
                          {packageData.type?.replace('-', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expiration:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {packageData.expirationDays 
                            ? `${packageData.expirationDays} days`
                            : 'Never expires'}
                        </span>
                      </div>
                      {packageData.quantity && (
                        <div>
                          <span className="text-gray-500">Sessions:</span>
                          <span className="ml-2 font-medium text-gray-900">{packageData.quantity}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Services:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {packageData.eligibleServices?.length || 0} selected
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-purple-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${packageData.purchasePrice?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-gray-600">Purchase Price</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${packageData.regularValue?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-gray-600">Regular Value</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        ${((packageData.regularValue || 0) - (packageData.purchasePrice || 0)).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">Patient Saves</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {packageData.eligibleServices && packageData.eligibleServices.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Included Services</h4>
                  <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                    {packageData.eligibleServices.map((service) => (
                      <div key={service.serviceId} className="px-4 py-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900">{service.serviceName}</span>
                          <span className="text-sm text-gray-600">
                            {service.quantity} × ${service.sessionValue} = ${((service.quantity || 1) * (service.sessionValue || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Create Package
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}