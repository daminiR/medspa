'use client'

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { PackageList } from '@/components/packages/PackageList'
import { GiftCardManager } from '@/components/payments/GiftCardManager'
import { CreditsRefunds } from '@/components/payments/CreditsRefunds'
import {
  Settings,
  Package,
  Users,
  Shield,
  CreditCard,
  Link,
  ChevronRight,
  Save,
  Bell,
  Moon,
  Globe,
  Calendar,
  Mail,
  MessageSquare,
  Database,
  Zap,
  Building,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Percent,
  FileText,
  Key,
  UserCheck,
  Lock,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  Gift,
  RefreshCw
} from 'lucide-react'

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<'general' | 'packages' | 'giftcards' | 'credits' | 'users' | 'security' | 'billing' | 'integrations' | 'quickreplies'>('general')

  const sections = [
    {
      id: 'general',
      title: 'General Settings',
      icon: Settings,
      description: 'Manage your clinic information and preferences'
    },
    {
      id: 'quickreplies',
      title: 'Quick Replies',
      icon: MessageSquare,
      description: 'Customize quick reply templates for messaging'
    },
    {
      id: 'packages',
      title: 'Packages & Memberships',
      icon: Package,
      description: 'Configure package types, pricing, and redemption rules'
    },
    {
      id: 'giftcards',
      title: 'Gift Cards',
      icon: Gift,
      description: 'Manage gift card programs and balances'
    },
    {
      id: 'credits',
      title: 'Credits & Refunds',
      icon: RefreshCw,
      description: 'Process refunds and manage patient credits'
    },
    {
      id: 'users',
      title: 'Users & Roles',
      icon: Users,
      description: 'Manage staff accounts and permissions'
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      description: 'Configure security settings and compliance'
    },
    {
      id: 'billing',
      title: 'Billing & Payments',
      icon: CreditCard,
      description: 'Payment methods, taxes, and financial settings'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: Link,
      description: 'Connect with third-party services'
    }
  ]

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Clinic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Clinic Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clinic Name
            </label>
            <input
              type="text"
              defaultValue="Luxe Medical Spa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              defaultValue="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              defaultValue="info@luxemedicalspa.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              defaultValue="https://luxemedicalspa.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Address</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              defaultValue="123 Spa Boulevard, Suite 100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              defaultValue="Beverly Hills"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              type="text"
              defaultValue="CA"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP/Postal Code
            </label>
            <input
              type="text"
              defaultValue="90210"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
        <div className="space-y-3">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <div key={day} className="flex items-center justify-between">
              <span className="w-24 text-sm font-medium">{day}</span>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  defaultValue="09:00"
                  className="px-3 py-1 border border-gray-300 rounded"
                />
                <span>to</span>
                <input
                  type="time"
                  defaultValue="18:00"
                  className="px-3 py-1 border border-gray-300 rounded"
                />
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={day !== 'Sunday'} />
                  <span className="text-sm">Open</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  )

  const renderBillingSettings = () => (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
        <div className="space-y-3">
          {[
            { name: 'Credit Card', enabled: true, processor: 'Stripe' },
            { name: 'Debit Card', enabled: true, processor: 'Stripe' },
            { name: 'Cash', enabled: true, processor: 'Manual' },
            { name: 'Check', enabled: false, processor: 'Manual' },
            { name: 'HSA/FSA Cards', enabled: true, processor: 'Stripe' }
          ].map((method) => (
            <div key={method.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <input type="checkbox" defaultChecked={method.enabled} />
                <span className="font-medium">{method.name}</span>
                <span className="text-sm text-gray-500">({method.processor})</span>
              </div>
              <button className="text-sm text-purple-600 hover:text-purple-700">
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Tax Settings</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sales Tax Rate (%)
            </label>
            <input
              type="number"
              defaultValue="8.75"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID Number
            </label>
            <input
              type="text"
              defaultValue="XX-XXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span className="text-sm">Apply tax to services</span>
          </label>
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" defaultChecked />
            <span className="text-sm">Apply tax to products</span>
          </label>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your clinic settings and preferences</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
              <p className="text-gray-600">
                {sections.find(s => s.id === activeSection)?.description}
              </p>
            </div>

            {activeSection === 'general' && renderGeneralSettings()}
            {activeSection === 'billing' && renderBillingSettings()}
            
            {activeSection === 'packages' && (
              <PackageList />
            )}
            
            {activeSection === 'giftcards' && (
              <GiftCardManager />
            )}
            
            {activeSection === 'credits' && (
              <CreditsRefunds />
            )}
            
            {activeSection === 'users' && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Users & Roles</h3>
                <p className="text-gray-500">User management coming soon</p>
              </div>
            )}
            
            {activeSection === 'security' && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Security Settings</h3>
                <p className="text-gray-500">Security configuration coming soon</p>
              </div>
            )}
            
            {activeSection === 'integrations' && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Link className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Integrations</h3>
                <p className="text-gray-500">Third-party integrations coming soon</p>
              </div>
            )}
            
            {activeSection === 'quickreplies' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Quick Reply Templates</h3>
                  <p className="text-gray-500 mb-6">Manage quick reply messages for faster patient communication</p>
                  <a 
                    href="/settings/quick-replies"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Quick Replies
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}