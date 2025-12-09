'use client'

import { useState } from 'react'
import {
  Package,
  Clock,
  Check,
  Star,
  Calendar,
  CreditCard,
  Users,
  Sparkles,
  Gift,
  TrendingUp,
  Info,
  Smartphone,
  Mail,
  ChevronRight
} from 'lucide-react'
import { Package as PackageType } from '@/types/packages'

interface PackagePreviewProps {
  packageData: Partial<PackageType>
  viewMode: 'staff' | 'patient' | 'email' | 'mobile'
}

export function PackagePreview({ packageData, viewMode }: PackagePreviewProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'terms' | 'faq'>('details')
  
  // Calculate monthly payment if payment plan enabled
  const monthlyPayment = packageData.paymentPlan?.enabled 
    ? (packageData.purchasePrice || 0) * (1 - (packageData.paymentPlan.downPayment || 0) / 100) / (packageData.paymentPlan.installments || 1)
    : 0
  
  const savings = (packageData.regularValue || 0) - (packageData.purchasePrice || 0)
  const savingsPercent = packageData.regularValue ? (savings / packageData.regularValue * 100).toFixed(0) : 0
  
  // Patient View (Portal/Online Booking)
  if (viewMode === 'patient') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{packageData.name || 'Package Name'}</h2>
              <p className="text-purple-100">{packageData.description || 'Package description'}</p>
            </div>
            {packageData.marketingSettings?.limitedTimeOffer && (
              <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Limited Time
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-sm text-purple-100">Package Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">${packageData.purchasePrice?.toLocaleString()}</span>
                {packageData.regularValue && (
                  <span className="text-lg line-through text-purple-200">
                    ${packageData.regularValue.toLocaleString()}
                  </span>
                )}
              </div>
              {packageData.paymentPlan?.enabled && (
                <p className="text-sm text-purple-100 mt-1">
                  or ${monthlyPayment.toFixed(2)}/month
                </p>
              )}
            </div>
            {savings > 0 && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-lg">
                <span className="text-sm font-bold">Save ${savings} ({savingsPercent}%)</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {['details', 'terms', 'faq'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">What's Included</h3>
                <div className="space-y-3">
                  {packageData.eligibleServices?.map((service, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{service.serviceName}</p>
                        {service.quantity && service.quantity > 1 && (
                          <p className="text-sm text-gray-500">{service.quantity} sessions</p>
                        )}
                      </div>
                      {service.additionalCharge && service.additionalCharge > 0 && (
                        <span className="text-sm text-gray-500">
                          +${service.additionalCharge}/session
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {packageData.sharingRules?.allowFamilySharing && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Family Sharing Available</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This package can be shared with up to {packageData.sharingRules.maxShareMembers || 4} family members
                    </p>
                  </div>
                </div>
              )}
              
              {packageData.automaticallyRedeemOnline && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Auto-Applied Online</p>
                    <p className="text-sm text-green-700 mt-1">
                      Package automatically applies when you book online - no codes needed!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'terms' && (
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Expiration</h4>
                <p>
                  {packageData.expirationDays
                    ? `Valid for ${packageData.expirationDays} days from purchase`
                    : 'This package never expires'}
                </p>
              </div>
              
              {packageData.restrictions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Booking Restrictions</h4>
                  <ul className="space-y-1">
                    {packageData.restrictions.minimumBookingNotice && (
                      <li>• Must book {packageData.restrictions.minimumBookingNotice} hours in advance</li>
                    )}
                    {packageData.restrictions.maxBookingsPerWeek && (
                      <li>• Maximum {packageData.restrictions.maxBookingsPerWeek} bookings per week</li>
                    )}
                    {packageData.restrictions.timeRestrictions && (
                      <li>• Available {packageData.restrictions.timeRestrictions.startTime} - {packageData.restrictions.timeRestrictions.endTime}</li>
                    )}
                  </ul>
                </div>
              )}
              
              {packageData.paymentPlan?.enabled && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Plan Details</h4>
                  <p>
                    {packageData.paymentPlan.downPayment}% down, then {packageData.paymentPlan.installments} 
                    {packageData.paymentPlan.frequency} payments of ${monthlyPayment.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Can I share this package?</h4>
                <p className="text-sm text-gray-600">
                  {packageData.sharingRules?.allowFamilySharing
                    ? `Yes! You can share with up to ${packageData.sharingRules.maxShareMembers || 4} family members.`
                    : 'This package is for individual use only.'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">What if I don't use all my sessions?</h4>
                <p className="text-sm text-gray-600">
                  {packageData.expirationDays
                    ? 'Unused sessions expire after the validity period. We recommend booking in advance!'
                    : 'Your sessions never expire - use them at your own pace.'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Can I upgrade my package?</h4>
                <p className="text-sm text-gray-600">
                  Yes! Contact us to upgrade and we'll credit your remaining value.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* CTA */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
            Purchase Package
          </button>
          {packageData.paymentPlan?.enabled && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Flexible payment plans available at checkout
            </p>
          )}
        </div>
      </div>
    )
  }
  
  // Mobile App View
  if (viewMode === 'mobile') {
    return (
      <div className="max-w-sm mx-auto bg-gray-100 rounded-[2rem] p-2">
        <div className="bg-white rounded-[1.75rem] overflow-hidden">
          {/* Status Bar */}
          <div className="h-6 bg-black rounded-t-[1.75rem] flex items-center justify-center">
            <div className="w-20 h-4 bg-black rounded-full" />
          </div>
          
          {/* App Content */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <ChevronRight className="w-5 h-5 text-gray-400 rotate-180" />
              <span className="font-medium">Package Details</span>
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white mb-4">
              <h3 className="font-bold text-lg mb-1">{packageData.name}</h3>
              <p className="text-sm opacity-90 mb-3">{packageData.description}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold">${packageData.purchasePrice}</p>
                  {savings > 0 && (
                    <p className="text-xs opacity-75">Save ${savings}</p>
                  )}
                </div>
                <button className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-semibold">
                  Buy Now
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {packageData.eligibleServices?.slice(0, 3).map((service, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm flex-1">{service.serviceName}</span>
                  {service.quantity && service.quantity > 1 && (
                    <span className="text-xs text-gray-500">x{service.quantity}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Email Preview
  if (viewMode === 'email') {
    return (
      <div className="max-w-xl mx-auto bg-white border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Special Offer Just For You!</h2>
          <p>{packageData.name}</p>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">{packageData.description}</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Package Value:</span>
              <span className="line-through text-gray-500">${packageData.regularValue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Your Price:</span>
              <span className="text-2xl font-bold text-green-600">${packageData.purchasePrice}</span>
            </div>
          </div>
          <a href="#" className="block w-full py-3 bg-purple-600 text-white text-center rounded-lg font-semibold hover:bg-purple-700">
            Claim This Offer →
          </a>
        </div>
      </div>
    )
  }
  
  // Default Staff View
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Staff View</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Package Type:</span>
          <span className="font-medium">{packageData.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Purchase Price:</span>
          <span className="font-medium">${packageData.purchasePrice}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Sessions:</span>
          <span className="font-medium">{packageData.quantity || 'Unlimited'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Auto-Redeem:</span>
          <span className="font-medium">{packageData.automaticallyRedeemOnline ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  )
}