'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import {
  ArrowLeft,
  MessageSquare,
  CalendarCheck,
  CalendarX,
  FileCheck,
  Clock,
  UserCheck,
  DollarSign,
  Gift,
  Users,
  Sparkles,
  Settings,
  Plus,
  X
} from 'lucide-react'
import AppointmentBookedTab from './tabs/AppointmentBookedTab'
import { AppointmentCanceledTab } from './tabs/AppointmentCanceledTab'
import { CheckInTab } from './tabs/CheckInTab'
import { FormSubmittedTab } from './tabs/FormSubmittedTab'
import WaitlistTab from './tabs/WaitlistTab'
import SaleClosedTab from './tabs/SaleClosedTab'
import { GiftCardsTab } from './tabs/GiftCardsTab'
import MembershipsTab from './tabs/MembershipsTab'
import { SetupWizard, isWizardCompleted, WizardConfig } from '@/components/settings/SetupWizard'

type TabId =
  | 'appointment-booked'
  | 'appointment-canceled'
  | 'form-submitted'
  | 'waitlist'
  | 'check-in'
  | 'sale-closed'
  | 'gift-cards'
  | 'memberships'

type ViewMode = 'simple' | 'advanced'

interface FeatureFlags {
  hasMemberships: boolean
  hasGiftCards: boolean
  hasWaitlist: boolean
}

// Mock feature detection - reads from localStorage
function getFeatureFlags(): FeatureFlags {
  if (typeof window === 'undefined') {
    return {
      hasMemberships: false,
      hasGiftCards: false,
      hasWaitlist: false,
    }
  }

  const stored = localStorage.getItem('featureFlags')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return {
        hasMemberships: false,
        hasGiftCards: false,
        hasWaitlist: false,
      }
    }
  }

  return {
    hasMemberships: false,
    hasGiftCards: false,
    hasWaitlist: false,
  }
}

function saveFeatureFlags(flags: FeatureFlags) {
  localStorage.setItem('featureFlags', JSON.stringify(flags))
}

export default function AutomatedMessagesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('appointment-booked')
  const [viewMode, setViewMode] = useState<ViewMode>('simple')
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    hasMemberships: false,
    hasGiftCards: false,
    hasWaitlist: false,
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  // Load view mode and feature flags from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('automatedMessagesViewMode') as ViewMode
    if (savedMode) {
      setViewMode(savedMode)
    }

    const flags = getFeatureFlags()
    setFeatureFlags(flags)

    // Check if wizard should be shown (first-time user)
    const wizardCompleted = isWizardCompleted()
    if (!wizardCompleted) {
      setShowWizard(true)
    }
  }, [])

  // Save view mode to localStorage whenever it changes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('automatedMessagesViewMode', mode)
  }

  const tabs = [
    {
      id: 'appointment-booked' as TabId,
      title: 'Appointment Booked',
      icon: CalendarCheck,
      description: 'Configure automated messages when appointments are scheduled',
      simpleMode: true,
      requiresFeature: null as keyof FeatureFlags | null,
      alwaysVisible: true,
    },
    {
      id: 'appointment-canceled' as TabId,
      title: 'Appointment Canceled',
      icon: CalendarX,
      description: 'Configure automated messages when appointments are canceled',
      simpleMode: true,
      requiresFeature: null as keyof FeatureFlags | null,
      alwaysVisible: true,
    },
    {
      id: 'check-in' as TabId,
      title: 'Check-In',
      icon: UserCheck,
      description: 'Configure automated messages for patient check-in',
      simpleMode: true,
      requiresFeature: null as keyof FeatureFlags | null,
      alwaysVisible: true,
    },
    {
      id: 'sale-closed' as TabId,
      title: 'Sale Closed',
      icon: DollarSign,
      description: 'Configure automated messages when sales are completed',
      simpleMode: false,
      requiresFeature: null as keyof FeatureFlags | null,
      alwaysVisible: true,
    },
    {
      id: 'form-submitted' as TabId,
      title: 'Form Submitted',
      icon: FileCheck,
      description: 'Configure automated messages when patient forms are submitted',
      simpleMode: false,
      requiresFeature: null as keyof FeatureFlags | null,
      alwaysVisible: false,
    },
    {
      id: 'waitlist' as TabId,
      title: 'Waitlist',
      icon: Clock,
      description: 'Configure automated messages for waitlist notifications',
      simpleMode: false,
      requiresFeature: 'hasWaitlist' as keyof FeatureFlags,
      alwaysVisible: false,
    },
    {
      id: 'gift-cards' as TabId,
      title: 'Gift Cards',
      icon: Gift,
      description: 'Configure automated messages for gift card purchases',
      simpleMode: false,
      requiresFeature: 'hasGiftCards' as keyof FeatureFlags,
      alwaysVisible: false,
    },
    {
      id: 'memberships' as TabId,
      title: 'Memberships',
      icon: Users,
      description: 'Configure automated messages for membership management',
      simpleMode: false,
      requiresFeature: 'hasMemberships' as keyof FeatureFlags,
      alwaysVisible: false,
    }
  ]

  // Check if a tab should be visible based on feature flags
  const isTabVisible = (tab: typeof tabs[0]) => {
    // Always show if it's always visible
    if (tab.alwaysVisible) return true

    // Check feature requirement
    if (tab.requiresFeature) {
      return featureFlags[tab.requiresFeature as keyof FeatureFlags]
    }

    // Form submitted is always available (no feature flag needed)
    return true
  }

  // Filter tabs based on view mode and feature flags
  const visibleTabs = tabs.filter(tab => {
    // First check if tab is visible based on features
    if (!isTabVisible(tab)) return false

    // Then apply view mode filter
    if (viewMode === 'simple') {
      return tab.simpleMode
    }

    return true
  })

  // Get available tabs that can be enabled (not yet visible)
  const availableTabs = tabs.filter(tab => {
    // Skip if already visible
    if (isTabVisible(tab)) return false

    // Only show tabs that have feature requirements
    return tab.requiresFeature !== null
  })

  // Reset to first visible tab if current tab is not visible in current mode
  useEffect(() => {
    const isActiveTabVisible = visibleTabs.some(tab => tab.id === activeTab)
    if (!isActiveTabVisible && visibleTabs.length > 0) {
      setActiveTab(visibleTabs[0].id)
    }
  }, [viewMode, visibleTabs, activeTab])

  const currentTab = tabs.find(tab => tab.id === activeTab)

  // Toggle feature flag
  const toggleFeature = (featureKey: keyof FeatureFlags) => {
    const newFlags = {
      ...featureFlags,
      [featureKey]: !featureFlags[featureKey],
    }
    setFeatureFlags(newFlags)
    saveFeatureFlags(newFlags)
    setShowAddModal(false)
  }

  // Handle wizard completion
  const handleWizardComplete = (config: WizardConfig) => {
    console.log('Wizard completed with config:', config)
    // TODO: Apply the wizard configuration to the actual settings
    // For now, just close the wizard
    setShowWizard(false)

    // Show a success notification or banner
    // You could also navigate to specific tabs based on what was enabled
  }

  // Handle wizard skip
  const handleWizardSkip = () => {
    console.log('Wizard skipped')
    setShowWizard(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Automated Messages</h1>
            </div>

            {/* Simple/Advanced Mode Toggle */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => handleViewModeChange('simple')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  viewMode === 'simple'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Simple Mode
              </button>
              <button
                onClick={() => handleViewModeChange('advanced')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                  viewMode === 'advanced'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="h-4 w-4" />
                Advanced Mode
              </button>
            </div>
          </div>
          <div className="ml-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">
                  Configure automated messages for different events and triggers
                </p>
                {viewMode === 'simple' && (
                  <p className="text-sm text-purple-600 mt-1">
                    Simple Mode: Showing essential message types only. Switch to Advanced Mode for more options.
                  </p>
                )}
              </div>
              {isWizardCompleted() && (
                <button
                  onClick={() => setShowWizard(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
                >
                  <Sparkles className="h-4 w-4" />
                  Run Setup Wizard Again
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px items-center">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-700'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.title}
                  </button>
                )
              })}

              {/* Add Message Type Button - Only in Advanced Mode */}
              {viewMode === 'advanced' && availableTabs.length > 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent text-gray-400 hover:text-purple-600 hover:border-purple-300 font-medium text-sm transition-colors ml-2"
                  title="Add more message types"
                >
                  <Plus className="w-4 h-4" />
                  Add Type
                </button>
              )}
            </nav>
          </div>

          {/* Tab Description */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-start gap-3">
              {currentTab && (
                <>
                  <currentTab.icon className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      {currentTab.title}
                    </h2>
                    <p className="text-sm text-gray-600">{currentTab.description}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'appointment-booked' && (
              <AppointmentBookedTab />
            )}

            {activeTab === 'appointment-canceled' && (
              <AppointmentCanceledTab />
            )}

            {activeTab === 'check-in' && (
              <CheckInTab />
            )}

            {activeTab === 'form-submitted' && (
              <FormSubmittedTab />
            )}

            {activeTab === 'waitlist' && (
              <WaitlistTab />
            )}

            {activeTab === 'sale-closed' && (
              <SaleClosedTab />
            )}

            {activeTab === 'gift-cards' && (
              <GiftCardsTab />
            )}

            {activeTab === 'memberships' && (
              <MembershipsTab />
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">About Automated Messages</p>
              <p className="text-blue-700">
                Configure automated messages that are sent when specific events occur in your clinic.
                Each tab allows you to customize the message content, timing, and delivery method
                (SMS, email, or push notification).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Message Type Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Message Types
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Enable message types based on the features you use in your clinic
              </p>
            </div>

            <div className="p-6 space-y-3">
              {availableTabs.map((tab) => {
                const Icon = tab.icon
                const featureKey = tab.requiresFeature as keyof FeatureFlags
                const isEnabled = featureKey && featureFlags[featureKey]

                return (
                  <button
                    key={tab.id}
                    onClick={() => featureKey && toggleFeature(featureKey)}
                    className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                      isEnabled
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      isEnabled ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${
                        isEnabled ? 'text-purple-900' : 'text-gray-900'
                      }`}>
                        {tab.title}
                      </p>
                      <p className="text-sm text-gray-600">{tab.description}</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      isEnabled ? 'bg-purple-600' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                        isEnabled ? 'ml-5' : 'ml-1'
                      }`} />
                    </div>
                  </button>
                )
              })}

              {availableTabs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">All available message types are enabled</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Wizard */}
      {showWizard && (
        <SetupWizard
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
        />
      )}
    </div>
  )
}
