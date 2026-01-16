'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import Link from 'next/link'
import {
  MessageSquare,
  Phone,
  CheckCircle,
  AlertCircle,
  Settings,
  Clock,
  Users,
  Shield,
  ExternalLink,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Trash2,
  Moon,
  Sun
} from 'lucide-react'
import toast from 'react-hot-toast'
import PhoneNumberSelectionModal from '@/components/settings/PhoneNumberSelectionModal'
import PhoneNumberConfirmationModal from '@/components/settings/PhoneNumberConfirmationModal'

interface StaffMember {
  id: string
  name: string
  email: string
  smsEnabled: boolean
  canSendMarketing: boolean
}

interface MessageTemplate {
  id: string
  name: string
  category: string
  content: string
  isActive: boolean
}

export default function SMSSettingsPage() {
  // Business Phone Number State
  const [twilioNumber, setTwilioNumber] = useState('+1 (555) 123-4567')
  const [numberStatus, setNumberStatus] = useState<'active' | 'inactive' | 'pending'>('active')

  // Default Sender Settings State
  const [clinicName, setClinicName] = useState('Luxe Medical Spa')
  const [businessHoursStart, setBusinessHoursStart] = useState('09:00')
  const [businessHoursEnd, setBusinessHoursEnd] = useState('18:00')
  const [afterHoursReply, setAfterHoursReply] = useState(
    'Thank you for your message. Our office is currently closed. We will respond to your message during business hours. Please call us at (555) 123-4567 for emergencies.'
  )

  // Auto-close Conversations State
  const [autoCloseInactivity, setAutoCloseInactivity] = useState<string>('7')

  // Auto-responder Settings State
  const [autoResponderEnabled, setAutoResponderEnabled] = useState(true)
  const [outOfOfficeMode, setOutOfOfficeMode] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Compliance Settings State
  const [registrationStatus, setRegistrationStatus] = useState<'registered' | 'pending' | 'not-registered'>('registered')
  const [consentCollectionEnabled, setConsentCollectionEnabled] = useState(true)
  const [marketingOptInRequired, setMarketingOptInRequired] = useState(true)

  // Staff Permissions State
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    { id: '1', name: 'Sarah Johnson', email: 'sarah@luxemedicalspa.com', smsEnabled: true, canSendMarketing: true },
    { id: '2', name: 'Maria Garcia', email: 'maria@luxemedicalspa.com', smsEnabled: true, canSendMarketing: false },
    { id: '3', name: 'Jessica Lee', email: 'jessica@luxemedicalspa.com', smsEnabled: false, canSendMarketing: false }
  ])

  // Message Templates State
  const [messageTemplates] = useState<MessageTemplate[]>([
    { id: '1', name: 'Appointment Confirmation', category: 'appointments', content: 'Your appointment is confirmed for [DATE] at [TIME]. Reply C to confirm or R to reschedule.', isActive: true },
    { id: '2', name: 'Appointment Reminder', category: 'appointments', content: 'Reminder: You have an appointment tomorrow at [TIME]. Reply C to confirm.', isActive: true },
    { id: '3', name: 'Post-Care Instructions', category: 'post-care', content: 'Post-care is essential. Avoid sun exposure, apply ice if needed, and use moisturizer daily.', isActive: true },
    { id: '4', name: 'Follow-up Check-in', category: 'follow-up', content: 'How are you feeling after your treatment? Reply with any questions or concerns.', isActive: true }
  ])

  const [hasChanges, setHasChanges] = useState(false)
  const [showCopyFeedback, setShowCopyFeedback] = useState(false)

  // Phone Number Modal State
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [selectedNewNumber, setSelectedNewNumber] = useState('')

  // Load auto-close setting from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('autoCloseInactivity')
    if (stored) {
      setAutoCloseInactivity(stored)
    }
  }, [])

  // Handlers
  const handleStaffToggle = (id: string, field: 'smsEnabled' | 'canSendMarketing') => {
    setStaffMembers(prev =>
      prev.map(staff =>
        staff.id === id ? { ...staff, [field]: !staff[field] } : staff
      )
    )
    setHasChanges(true)
  }

  const handleSaveChanges = () => {
    // Save auto-close setting to localStorage
    localStorage.setItem('autoCloseInactivity', autoCloseInactivity)

    toast.success('SMS settings saved successfully')
    setHasChanges(false)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setShowCopyFeedback(true)
    setTimeout(() => setShowCopyFeedback(false), 2000)
  }

  const handleChangeNumber = () => {
    setShowPhoneNumberModal(true)
  }

  const handleSelectNumber = (phoneNumber: string) => {
    setSelectedNewNumber(phoneNumber)
    setShowPhoneNumberModal(false)
    setShowConfirmationModal(true)
  }

  const handleConfirmNumberChange = () => {
    setTwilioNumber(selectedNewNumber)
    setNumberStatus('pending')
    toast.success('Phone number change initiated. This may take a few minutes to complete.')
    setHasChanges(true)
    // Simulate activation after 2 seconds
    setTimeout(() => {
      setNumberStatus('active')
      toast.success('Phone number activated successfully!')
    }, 2000)
  }

  const handleReleaseNumber = () => {
    if (window.confirm('Are you sure you want to release this phone number? This action cannot be undone.')) {
      setNumberStatus('inactive')
      toast.success('Phone number released successfully')
      setHasChanges(true)
    }
  }

  // Helper to check if current time is within business hours
  const isWithinBusinessHours = () => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const [startHour, startMin] = businessHoursStart.split(':').map(Number)
    const [endHour, endMin] = businessHoursEnd.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return currentTime >= startMinutes && currentTime < endMinutes
  }

  // Check if auto-responder would be active now
  const isAutoResponderActive = () => {
    if (outOfOfficeMode) return true
    if (!autoResponderEnabled) return false
    return !isWithinBusinessHours()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Inactive
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        )
      case 'registered':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Registered
          </span>
        )
      case 'not-registered':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Not Registered
          </span>
        )
      default:
        return null
    }
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
            <div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-900">SMS Settings</h1>
              </div>
              <p className="text-gray-500 mt-1">Configure two-way messaging and SMS communication</p>
            </div>
          </div>
        </div>

        {/* Business Phone Number Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Business Phone Number</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Manage your Twilio phone number for SMS communication</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Twilio Number</p>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold text-gray-900">{twilioNumber}</p>
                  <button
                    onClick={() => handleCopy(twilioNumber)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copy"
                  >
                    {showCopyFeedback ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div>{getStatusBadge(numberStatus)}</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleChangeNumber}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Change Number
              </button>
              <button
                onClick={handleReleaseNumber}
                disabled={numberStatus === 'inactive'}
                className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                  numberStatus === 'inactive'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Release Number
              </button>
            </div>
          </div>
        </div>

        {/* Default Sender Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Default Sender Settings</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure how your messages appear to patients</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinic Name (SMS Header)
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => {
                  setClinicName(e.target.value)
                  setHasChanges(true)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">This name appears at the beginning of all SMS messages</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Business Hours Start
                </label>
                <input
                  type="time"
                  value={businessHoursStart}
                  onChange={(e) => {
                    setBusinessHoursStart(e.target.value)
                    setHasChanges(true)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Business Hours End
                </label>
                <input
                  type="time"
                  value={businessHoursEnd}
                  onChange={(e) => {
                    setBusinessHoursEnd(e.target.value)
                    setHasChanges(true)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                After-Hours Auto-Reply Message
              </label>
              <textarea
                value={afterHoursReply}
                onChange={(e) => {
                  setAfterHoursReply(e.target.value)
                  setHasChanges(true)
                }}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">Sent automatically when patients message outside business hours</p>
            </div>
          </div>
        </div>
        {/* After-Hours Auto-Responder */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">After-Hours Auto-Responder</h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Out of Office Quick Toggle */}
              <button
                onClick={() => {
                  setOutOfOfficeMode(!outOfOfficeMode)
                  setHasChanges(true)
                  toast.success(outOfOfficeMode ? 'Out of Office mode disabled' : 'Out of Office mode enabled')
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border ${
                  outOfOfficeMode
                    ? 'bg-orange-50 border-orange-300 text-orange-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {outOfOfficeMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {outOfOfficeMode ? 'Out of Office' : 'In Office'}
              </button>
              {/* Main Auto-Responder Toggle */}
              <button
                onClick={() => {
                  setAutoResponderEnabled(!autoResponderEnabled)
                  setHasChanges(true)
                }}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  autoResponderEnabled ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    autoResponderEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {outOfOfficeMode && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-900">Out of Office Mode Active</p>
                <p className="text-xs text-orange-700 mt-1">Auto-responder will send replies to all incoming messages regardless of business hours</p>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">
            Automatically respond to patient messages received outside business hours
            {autoResponderEnabled && !outOfOfficeMode && (
              <span className="ml-2 text-purple-600 font-medium">
                ({isWithinBusinessHours() ? 'Currently within business hours' : 'Currently after hours - auto-responder active'})
              </span>
            )}
          </p>

          {autoResponderEnabled && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-Reply Message Template
                </label>
                <textarea
                  value={afterHoursReply}
                  onChange={(e) => {
                    setAfterHoursReply(e.target.value)
                    setHasChanges(true)
                  }}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Enter your after-hours auto-reply message..."
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {afterHoursReply.length}/160 characters
                    {afterHoursReply.length > 160 && (
                      <span className="text-orange-600 ml-2">
                        (Will be sent as {Math.ceil(afterHoursReply.length / 160)} SMS segments)
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showPreview ? 'Hide' : 'Preview'}
                  </button>
                </div>
              </div>

              {/* Message Preview */}
              {showPreview && afterHoursReply && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">Message Preview</p>
                    {isAutoResponderActive() && (
                      <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Active Now
                      </span>
                    )}
                  </div>

                  {/* iPhone-style message bubble */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 max-w-sm">
                    <div className="flex items-start gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-medium">
                        {clinicName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">{clinicName}</p>
                        <p className="text-xs text-gray-500">{twilioNumber}</p>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg rounded-tl-none p-3">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{afterHoursReply}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Just now</p>
                  </div>
                </div>
              )}

              {/* Quick Response Templates */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Templates</p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      setAfterHoursReply('Thank you for your message. Our office is currently closed. We will respond to your message during business hours. Please call us at (555) 123-4567 for emergencies.')
                      setHasChanges(true)
                    }}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">Standard After-Hours</p>
                    <p className="text-xs text-gray-500 mt-1">Basic after-hours message with emergency contact</p>
                  </button>
                  <button
                    onClick={() => {
                      setAfterHoursReply('Thanks for reaching out! Our team will get back to you when we return during business hours. For urgent matters, please call us at (555) 123-4567.')
                      setHasChanges(true)
                    }}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">Friendly Casual</p>
                    <p className="text-xs text-gray-500 mt-1">More casual and friendly tone</p>
                  </button>
                  <button
                    onClick={() => {
                      setAfterHoursReply('Thank you for contacting ' + clinicName + '. We have received your message and will respond during our next business day. Business hours: ' + businessHoursStart + ' - ' + businessHoursEnd + '. Emergency line: (555) 123-4567.')
                      setHasChanges(true)
                    }}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">Professional Detailed</p>
                    <p className="text-xs text-gray-500 mt-1">Includes business hours and clinic name</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {!autoResponderEnabled && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-600">Auto-responder is currently disabled</p>
              <p className="text-xs text-gray-500 mt-1">Enable the toggle above to configure after-hours responses</p>
            </div>
          )}
        </div>
        {/* Auto-close Conversations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Conversation Management</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Automatically organize conversations based on activity</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-close conversations after inactivity
              </label>
              <select
                value={autoCloseInactivity}
                onChange={(e) => {
                  setAutoCloseInactivity(e.target.value)
                  setHasChanges(true)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="never">Never</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Conversations with no activity will automatically move to the "Closed" tab after the selected time period.
                {autoCloseInactivity !== 'never' && (
                  <span className="block mt-1 text-orange-600">
                    You'll see a warning indicator on conversations within 24 hours of auto-closing.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Compliance Settings</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Ensure adherence to SMS regulations and compliance requirements</p>

          <div className="space-y-6">
            {/* 10DLC Registration */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">10DLC Registration</h3>
                  <p className="text-sm text-gray-600 mt-1">10-Digit Long Code for higher SMS throughput and compliance</p>
                </div>
                {getStatusBadge(registrationStatus)}
              </div>
              <a
                href="https://www.twilio.com/en-us/messaging/10dlc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium mt-3"
              >
                Visit Twilio 10DLC Portal
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Consent Collection */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Require Consent for SMS</h3>
                <p className="text-sm text-gray-600 mt-1">Collect explicit opt-in consent from patients before sending marketing</p>
              </div>
              <button
                onClick={() => {
                  setConsentCollectionEnabled(!consentCollectionEnabled)
                  setHasChanges(true)
                }}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  consentCollectionEnabled ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    consentCollectionEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Marketing Opt-in Required */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Marketing Opt-in Required</h3>
                <p className="text-sm text-gray-600 mt-1">Require separate opt-in consent for promotional messages</p>
              </div>
              <button
                onClick={() => {
                  setMarketingOptInRequired(!marketingOptInRequired)
                  setHasChanges(true)
                }}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  marketingOptInRequired ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    marketingOptInRequired ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Staff Permissions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Staff Permissions</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Control which staff members can send SMS messages</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">SMS Access</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Can Send Marketing</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.map((staff) => (
                  <tr key={staff.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{staff.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">{staff.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleStaffToggle(staff.id, 'smsEnabled')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            staff.smsEnabled ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                              staff.smsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleStaffToggle(staff.id, 'canSendMarketing')}
                          disabled={!staff.smsEnabled}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            staff.smsEnabled
                              ? staff.canSendMarketing
                                ? 'bg-purple-600'
                                : 'bg-gray-300'
                              : 'bg-gray-200 cursor-not-allowed'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                              staff.canSendMarketing ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Message Templates */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Message Templates</h2>
            </div>
            <a
              href="/settings/sms/templates"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Manage Templates
            </a>
          </div>
          <p className="text-sm text-gray-600 mb-6">Active message templates available for quick sending</p>

          <div className="grid gap-4">
            {messageTemplates.filter(t => t.isActive).map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {template.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(template.content)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copy template"
                  >
                    <Copy className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{template.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              hasChanges
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>

        {/* Phone Number Modals */}
        <PhoneNumberSelectionModal
          isOpen={showPhoneNumberModal}
          onClose={() => setShowPhoneNumberModal(false)}
          onSelectNumber={handleSelectNumber}
        />

        <PhoneNumberConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmNumberChange}
          currentNumber={twilioNumber}
          newNumber={selectedNewNumber}
        />
      </div>
    </div>
  )
}
