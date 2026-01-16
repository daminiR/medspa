'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navigation } from '@/components/Navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Clock,
  Users,
  MessageSquare,
  Shield,
  Trash2,
  BarChart3,
  Bell,
  Zap,
  Crown,
  Award,
  Medal,
  AlertCircle,
  CheckCircle,
  Calendar,
  Mail,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Eye,
  ChevronDown,
  Info,
  FileText,
  Activity
} from 'lucide-react'

// Types for waitlist settings
interface VIPTierConfig {
  platinum: number
  gold: number
  silver: number
}

interface AutoTierThreshold {
  visits: number
  revenue: number
}

interface AutoTierRules {
  platinum: AutoTierThreshold
  gold: AutoTierThreshold
}

interface CommunicationPreferences {
  smsEnabled: boolean
  emailEnabled: boolean
  multiChannelDelayMinutes: number
  sendPeriodicReminders: boolean
  reminderFrequencyDays: number
}

interface CleanupEntry {
  id: string
  timestamp: Date
  entriesRemoved: number
  reason: string
}

interface WaitlistStats {
  totalActiveEntries: number
  pendingOffers: number
  fillRate7Days: number
  fillRate30Days: number
  averageResponseTimeMinutes: number
}

interface WaitlistSettings {
  // Automated Offers
  automaticOffersEnabled: boolean
  offerExpiryMinutes: number
  maxOffersPerSlot: number
  minimumNoticeHours: number
  offerSequence: 'priority' | 'fifo' | 'tier-weighted'

  // VIP Tier Configuration
  tierWeights: VIPTierConfig
  autoTierRules: AutoTierRules

  // Communication
  communication: CommunicationPreferences

  // Expiry & Cleanup
  autoExpireDays: number

  // Compliance
  doubleOptInRequired: boolean
  auditLogRetentionDays: number
}

// SMS Template types
interface SMSTemplate {
  id: string
  name: string
  type: 'offer' | 'reminder' | 'confirmation' | 'expiry'
  content: string
}

const DEFAULT_SETTINGS: WaitlistSettings = {
  automaticOffersEnabled: true,
  offerExpiryMinutes: 30,
  maxOffersPerSlot: 3,
  minimumNoticeHours: 4,
  offerSequence: 'tier-weighted',
  tierWeights: {
    platinum: 60,
    gold: 30,
    silver: 10
  },
  autoTierRules: {
    platinum: { visits: 12, revenue: 5000 },
    gold: { visits: 6, revenue: 2000 }
  },
  communication: {
    smsEnabled: true,
    emailEnabled: true,
    multiChannelDelayMinutes: 5,
    sendPeriodicReminders: true,
    reminderFrequencyDays: 7
  },
  autoExpireDays: 30,
  doubleOptInRequired: true,
  auditLogRetentionDays: 90
}

const SMS_TEMPLATES: SMSTemplate[] = [
  {
    id: 'offer',
    name: 'Slot Offer',
    type: 'offer',
    content: 'Great news! An appointment slot for [SERVICE] is now available on [DATE] at [TIME]. Reply YES to book or NO to pass. This offer expires in [EXPIRY] minutes.'
  },
  {
    id: 'reminder',
    name: 'Waitlist Reminder',
    type: 'reminder',
    content: 'Hi [NAME], you\'re still on our waitlist for [SERVICE]. We\'ll notify you as soon as a slot becomes available. Reply STOP to opt out.'
  },
  {
    id: 'confirmation',
    name: 'Booking Confirmation',
    type: 'confirmation',
    content: 'Your appointment for [SERVICE] has been confirmed for [DATE] at [TIME]. We look forward to seeing you!'
  },
  {
    id: 'expiry',
    name: 'Entry Expiring',
    type: 'expiry',
    content: 'Your waitlist entry for [SERVICE] will expire in 3 days. Reply RENEW to stay on the list or let it expire automatically.'
  }
]

export default function WaitlistSettingsPage() {
  // Settings state
  const [settings, setSettings] = useState<WaitlistSettings>(DEFAULT_SETTINGS)
  const [originalSettings, setOriginalSettings] = useState<WaitlistSettings>(DEFAULT_SETTINGS)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Cleanup state
  const [isRunningCleanup, setIsRunningCleanup] = useState(false)
  const [cleanupPreview, setCleanupPreview] = useState<number | null>(null)
  const [cleanupLog, setCleanupLog] = useState<CleanupEntry[]>([
    { id: '1', timestamp: new Date(Date.now() - 86400000 * 2), entriesRemoved: 12, reason: 'Auto-expire (30 days)' },
    { id: '2', timestamp: new Date(Date.now() - 86400000 * 9), entriesRemoved: 8, reason: 'Auto-expire (30 days)' },
    { id: '3', timestamp: new Date(Date.now() - 86400000 * 16), entriesRemoved: 15, reason: 'Manual cleanup' }
  ])

  // Statistics state
  const [stats, setStats] = useState<WaitlistStats>({
    totalActiveEntries: 47,
    pendingOffers: 8,
    fillRate7Days: 72,
    fillRate30Days: 68,
    averageResponseTimeMinutes: 23
  })

  // Compliance state
  const [a2pStatus, setA2pStatus] = useState<'registered' | 'pending' | 'not-registered'>('registered')
  const [baaStatus, setBaaStatus] = useState<'active' | 'pending' | 'expired'>('active')

  // Template preview state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('offer')

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  // Check for changes
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings))
  }, [settings, originalSettings])

  // Load settings
  useEffect(() => {
    // Simulate loading from API
    const loadSettings = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      // In real app, fetch from API
      setSettings(DEFAULT_SETTINGS)
      setOriginalSettings(DEFAULT_SETTINGS)
      setIsLoading(false)
    }
    loadSettings()
  }, [])

  // Update settings helper
  const updateSettings = useCallback(<K extends keyof WaitlistSettings>(
    key: K,
    value: WaitlistSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  // Update nested settings helper
  const updateNestedSettings = useCallback(<
    K extends keyof WaitlistSettings,
    NK extends keyof WaitlistSettings[K]
  >(
    key: K,
    nestedKey: NK,
    value: WaitlistSettings[K][NK]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] as object),
        [nestedKey]: value
      }
    }))
  }, [])

  // Save settings
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOriginalSettings(settings)
      setHasChanges(false)
      toast.success('Waitlist settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Cancel changes
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('Discard unsaved changes?')) {
        setSettings(originalSettings)
      }
    }
  }

  // Reset to defaults
  const handleResetToDefaults = () => {
    if (confirm('Reset all waitlist settings to defaults? This cannot be undone.')) {
      setSettings(DEFAULT_SETTINGS)
      toast.success('Settings reset to defaults')
    }
  }

  // Run cleanup
  const handleRunCleanup = async () => {
    setIsRunningCleanup(true)
    try {
      // Preview first
      await new Promise(resolve => setTimeout(resolve, 500))
      setCleanupPreview(14) // Simulated count

      // Ask for confirmation
      if (confirm(`This will remove 14 expired waitlist entries. Continue?`)) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setCleanupLog(prev => [{
          id: Date.now().toString(),
          timestamp: new Date(),
          entriesRemoved: 14,
          reason: 'Manual cleanup'
        }, ...prev])
        setStats(prev => ({
          ...prev,
          totalActiveEntries: prev.totalActiveEntries - 14
        }))
        toast.success('Cleanup completed: 14 entries removed')
      }
    } catch (error) {
      toast.error('Cleanup failed')
    } finally {
      setIsRunningCleanup(false)
      setCleanupPreview(null)
    }
  }

  // Toggle component
  const Toggle = ({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-14 h-8 rounded-full transition-colors ${
        disabled ? 'bg-gray-200 cursor-not-allowed' :
        enabled ? 'bg-purple-600' : 'bg-gray-300'
      }`}
    >
      <div
        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  )

  // Slider component
  const Slider = ({ value, onChange, min = 0, max = 100, label, icon: Icon, color }: {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
      />
    </div>
  )

  // Status badge component
  const StatusBadge = ({ status, type }: { status: string; type: 'success' | 'warning' | 'error' | 'info' }) => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800'
    }
    const icons = {
      success: CheckCircle,
      warning: AlertCircle,
      error: AlertCircle,
      info: Info
    }
    const Icon = icons[type]

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colors[type]}`}>
        <Icon className="w-4 h-4" />
        {status}
      </span>
    )
  }

  // Stat card component
  const StatCard = ({ title, value, subtitle, icon: Icon, color }: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading waitlist settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <Link
              href="/settings"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-900">Waitlist Settings</h1>
              </div>
              <p className="text-gray-500 mt-1">Configure waitlist behavior, offers, and compliance</p>
            </div>
            {hasChanges && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        {/* Section 1: Automated Offers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Automated Offers</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure how the system automatically sends slot offers to waitlist patients</p>

          <div className="space-y-6">
            {/* Auto-send toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Automatically send offers when slots open</h3>
                <p className="text-sm text-gray-600 mt-1">System will notify eligible patients when appointments become available</p>
              </div>
              <Toggle
                enabled={settings.automaticOffersEnabled}
                onChange={() => updateSettings('automaticOffersEnabled', !settings.automaticOffersEnabled)}
              />
            </div>

            <div className={`grid grid-cols-2 gap-6 ${!settings.automaticOffersEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Offer expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer expiry (minutes)
                </label>
                <select
                  value={settings.offerExpiryMinutes}
                  onChange={(e) => updateSettings('offerExpiryMinutes', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Time before offer expires if not accepted</p>
              </div>

              {/* Max offers per slot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max offers per slot
                </label>
                <select
                  value={settings.maxOffersPerSlot}
                  onChange={(e) => updateSettings('maxOffersPerSlot', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'patient' : 'patients'}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Number of patients to offer each slot to simultaneously</p>
              </div>

              {/* Minimum notice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum notice hours
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={settings.minimumNoticeHours}
                  onChange={(e) => updateSettings('minimumNoticeHours', Math.min(24, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum time before appointment to send offers (1-24 hours)</p>
              </div>

              {/* Offer sequence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer sequence
                </label>
                <select
                  value={settings.offerSequence}
                  onChange={(e) => updateSettings('offerSequence', e.target.value as WaitlistSettings['offerSequence'])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="priority">Priority (high/medium/low)</option>
                  <option value="fifo">FIFO (First In, First Out)</option>
                  <option value="tier-weighted">Tier-Weighted (VIP first)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">How to determine offer order</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: VIP Tier Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">VIP Tier Configuration</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure tier weights for waitlist priority and automatic tier assignment rules</p>

          <div className="grid grid-cols-2 gap-8">
            {/* Tier Weights */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Tier Weights</h3>
              <div className="space-y-4">
                <Slider
                  value={settings.tierWeights.platinum}
                  onChange={(value) => updateNestedSettings('tierWeights', 'platinum', value)}
                  label="Platinum"
                  icon={Crown}
                  color="text-purple-600"
                />
                <Slider
                  value={settings.tierWeights.gold}
                  onChange={(value) => updateNestedSettings('tierWeights', 'gold', value)}
                  label="Gold"
                  icon={Award}
                  color="text-yellow-600"
                />
                <Slider
                  value={settings.tierWeights.silver}
                  onChange={(value) => updateNestedSettings('tierWeights', 'silver', value)}
                  label="Silver"
                  icon={Medal}
                  color="text-gray-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Higher weight = higher priority in tier-weighted offer sequence
              </p>
            </div>

            {/* Auto-tier Rules */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Auto-Tier Rules</h3>
              <div className="space-y-4">
                {/* Platinum threshold */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-900">Platinum Threshold</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-purple-700 mb-1">Visits</label>
                      <input
                        type="number"
                        min={0}
                        value={settings.autoTierRules.platinum.visits}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoTierRules: {
                            ...prev.autoTierRules,
                            platinum: { ...prev.autoTierRules.platinum, visits: parseInt(e.target.value) || 0 }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-purple-700 mb-1">Revenue ($)</label>
                      <input
                        type="number"
                        min={0}
                        value={settings.autoTierRules.platinum.revenue}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoTierRules: {
                            ...prev.autoTierRules,
                            platinum: { ...prev.autoTierRules.platinum, revenue: parseInt(e.target.value) || 0 }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Gold threshold */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Gold Threshold</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-yellow-700 mb-1">Visits</label>
                      <input
                        type="number"
                        min={0}
                        value={settings.autoTierRules.gold.visits}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoTierRules: {
                            ...prev.autoTierRules,
                            gold: { ...prev.autoTierRules.gold, visits: parseInt(e.target.value) || 0 }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-yellow-700 mb-1">Revenue ($)</label>
                      <input
                        type="number"
                        min={0}
                        value={settings.autoTierRules.gold.revenue}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoTierRules: {
                            ...prev.autoTierRules,
                            gold: { ...prev.autoTierRules.gold, revenue: parseInt(e.target.value) || 0 }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Patients meeting OR exceeding either threshold qualify for that tier
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Communication Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Communication Preferences</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure how and when patients are notified about waitlist updates</p>

          <div className="space-y-6">
            {/* Channel toggles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">SMS Enabled</span>
                </div>
                <Toggle
                  enabled={settings.communication.smsEnabled}
                  onChange={() => updateNestedSettings('communication', 'smsEnabled', !settings.communication.smsEnabled)}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Email Enabled</span>
                </div>
                <Toggle
                  enabled={settings.communication.emailEnabled}
                  onChange={() => updateNestedSettings('communication', 'emailEnabled', !settings.communication.emailEnabled)}
                />
              </div>
            </div>

            {/* Multi-channel delay */}
            {settings.communication.smsEnabled && settings.communication.emailEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multi-channel delay (minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={settings.communication.multiChannelDelayMinutes}
                  onChange={(e) => updateNestedSettings('communication', 'multiChannelDelayMinutes', parseInt(e.target.value) || 0)}
                  className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Delay between sending SMS and email (0 = send simultaneously)</p>
              </div>
            )}

            {/* Periodic reminders */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Send periodic reminders</h3>
                <p className="text-sm text-gray-600 mt-1">Remind patients they are still on the waitlist</p>
              </div>
              <Toggle
                enabled={settings.communication.sendPeriodicReminders}
                onChange={() => updateNestedSettings('communication', 'sendPeriodicReminders', !settings.communication.sendPeriodicReminders)}
              />
            </div>

            {settings.communication.sendPeriodicReminders && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder frequency (days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.communication.reminderFrequencyDays}
                  onChange={(e) => updateNestedSettings('communication', 'reminderFrequencyDays', Math.min(30, Math.max(1, parseInt(e.target.value) || 7)))}
                  className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">How often to send reminder messages (1-30 days)</p>
              </div>
            )}

            {/* Template Preview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">SMS Template Preview</h3>
              <div className="flex gap-2 mb-3">
                {SMS_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedTemplate === template.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Preview</span>
                </div>
                <p className="text-sm text-gray-700">
                  {SMS_TEMPLATES.find(t => t.id === selectedTemplate)?.content}
                </p>
              </div>
              <Link
                href="/settings/sms/templates"
                className="inline-flex items-center gap-2 mt-3 text-sm text-purple-600 hover:text-purple-700"
              >
                Edit templates
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Section 4: Expiry & Cleanup */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Expiry & Cleanup</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Manage automatic expiration of old waitlist entries</p>

          <div className="space-y-6">
            {/* Auto-expire days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-expire entries after (days)
              </label>
              <select
                value={settings.autoExpireDays}
                onChange={(e) => updateSettings('autoExpireDays', parseInt(e.target.value))}
                className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Entries older than this will be automatically removed</p>
            </div>

            {/* Run cleanup button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleRunCleanup}
                disabled={isRunningCleanup}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunningCleanup ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Run Cleanup Now
                  </>
                )}
              </button>
              {cleanupPreview !== null && (
                <span className="text-sm text-gray-600">
                  {cleanupPreview} entries will be removed
                </span>
              )}
            </div>

            {/* Audit log */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Cleanups</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entries Removed</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cleanupLog.slice(0, 5).map(entry => (
                      <tr key={entry.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{entry.entriesRemoved}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{entry.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Compliance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Compliance</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">SMS compliance and regulatory settings</p>

          <div className="space-y-6">
            {/* Registration statuses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">A2P 10DLC Registration</h3>
                  <StatusBadge
                    status={a2pStatus === 'registered' ? 'Registered' : a2pStatus === 'pending' ? 'Pending' : 'Not Registered'}
                    type={a2pStatus === 'registered' ? 'success' : a2pStatus === 'pending' ? 'warning' : 'error'}
                  />
                </div>
                <p className="text-sm text-gray-600">Required for business SMS messaging</p>
                <a
                  href="https://www.twilio.com/en-us/messaging/10dlc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-purple-600 hover:text-purple-700"
                >
                  Manage in Twilio
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Twilio BAA Status</h3>
                  <StatusBadge
                    status={baaStatus === 'active' ? 'Active' : baaStatus === 'pending' ? 'Pending' : 'Expired'}
                    type={baaStatus === 'active' ? 'success' : baaStatus === 'pending' ? 'warning' : 'error'}
                  />
                </div>
                <p className="text-sm text-gray-600">Business Associate Agreement for HIPAA</p>
                <a
                  href="https://www.twilio.com/docs/glossary/what-is-a-hipaa-business-associate-agreement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-purple-600 hover:text-purple-700"
                >
                  Learn more
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Double opt-in */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Double opt-in required</h3>
                <p className="text-sm text-gray-600 mt-1">Require patients to confirm SMS consent via text message</p>
              </div>
              <Toggle
                enabled={settings.doubleOptInRequired}
                onChange={() => updateSettings('doubleOptInRequired', !settings.doubleOptInRequired)}
              />
            </div>

            {/* Audit log retention */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audit log retention period (days)
              </label>
              <select
                value={settings.auditLogRetentionDays}
                onChange={(e) => updateSettings('auditLogRetentionDays', parseInt(e.target.value))}
                className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={365}>1 year</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">How long to keep waitlist activity logs for compliance</p>
            </div>
          </div>
        </div>

        {/* Section 6: Statistics & Monitoring */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Statistics & Monitoring</h2>
            </div>
            <Link
              href="/reports/waitlist"
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2"
            >
              View full analytics
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-sm text-gray-600 mb-6">Current waitlist metrics and performance</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Active Entries"
              value={stats.totalActiveEntries}
              icon={Users}
              color="text-blue-600"
            />
            <StatCard
              title="Pending Offers"
              value={stats.pendingOffers}
              icon={Bell}
              color="text-yellow-600"
            />
            <StatCard
              title="Fill Rate (7 days)"
              value={`${stats.fillRate7Days}%`}
              subtitle={`30-day: ${stats.fillRate30Days}%`}
              icon={Activity}
              color="text-green-600"
            />
            <StatCard
              title="Avg Response Time"
              value={`${stats.averageResponseTimeMinutes}m`}
              subtitle="Time to accept/decline offers"
              icon={Clock}
              color="text-purple-600"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handleResetToDefaults}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={!hasChanges}
              className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-lg transition-colors ${
                hasChanges ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                hasChanges && !isSaving
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
