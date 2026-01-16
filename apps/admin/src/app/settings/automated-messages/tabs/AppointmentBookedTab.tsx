'use client'

import React, { useState } from 'react'
import { MessageCard, TimelineConfigurator, ReminderPoint, BookingSourceToggle, AdvancedSection } from '../components'
import { ConfirmationRequestConfig } from '../components/ConfirmationRequestConfig'
import {
  Mail,
  MessageSquare,
  FileText,
  Bell,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react'

type SubTab = 'confirmations' | 'reminders' | 'staff-alerts'

interface ConfirmationSettings {
  emailEnabled: boolean
  smsEnabled: boolean
  formRequestEnabled: boolean
}

interface InternalNotificationSettings {
  onlineBookingNotification: boolean
  staffBookingNotification: boolean
}

interface ConfirmationRequestSettings {
  enabled: boolean
  setUnconfirmed: boolean
  followUpEnabled: boolean
  followUpHours: number
}

export default function AppointmentBookedTab() {
  // Master toggle for entire tab
  const [masterEnabled, setMasterEnabled] = useState(true);

  // Sub-tab state for organizing sections
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('confirmations');

  // Accordion state - track which card is expanded
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // 1) Confirmation Section State
  const [confirmationSettings, setConfirmationSettings] = useState<ConfirmationSettings>({
    emailEnabled: true,
    smsEnabled: true,
    formRequestEnabled: false,
  })

  // 2) Internal Notifications State
  const [internalNotifications, setInternalNotifications] = useState<InternalNotificationSettings>({
    onlineBookingNotification: true,
    staffBookingNotification: false,
  })

  // 3) Reminders Section State - Timeline with configurable reminders
  const [reminders, setReminders] = useState<ReminderPoint[]>([
    {
      id: '1',
      timing: { value: 7, unit: 'days' },
      enabled: true,
      messageType: 'reminder',
      label: '7 Day Reminder',
    },
    {
      id: '2',
      timing: { value: 3, unit: 'days' },
      enabled: true,
      messageType: 'reminder',
      label: '3 Day Reminder',
    },
    {
      id: '3',
      timing: { value: 1, unit: 'days' },
      enabled: true,
      messageType: 'reminder',
      label: '1 Day Reminder',
    },
    {
      id: '4',
      timing: { value: 2, unit: 'hours' },
      enabled: false,
      messageType: 'reminder',
      label: '2 Hour Reminder',
    },
  ])

  // 4) Confirmation Request State
  const [confirmationRequest, setConfirmationRequest] = useState<ConfirmationRequestSettings>({
    enabled: true,
    setUnconfirmed: true,
    followUpEnabled: true,
    followUpHours: 48,
  })

  // 5) Same-day reminder state
  const [sameDayReminderEnabled, setSameDayReminderEnabled] = useState(true)

  // 6) Booking source state
  const [bookingSourceSettings, setBookingSourceSettings] = useState({
    onlineEnabled: true,
    staffEnabled: true,
  })

  // Handlers for confirmation settings
  const handleConfirmationToggle = (field: keyof ConfirmationSettings) => {
    setConfirmationSettings(prev => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  // Handlers for internal notifications
  const handleInternalNotificationToggle = (field: keyof InternalNotificationSettings) => {
    setInternalNotifications(prev => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  // Handlers for reminders
  const handleToggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    )
  }

  const handleRemoveReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const handleAddReminder = () => {
    const newReminder: ReminderPoint = {
      id: Date.now().toString(),
      timing: { value: 12, unit: 'hours' },
      enabled: true,
      messageType: 'reminder',
      label: 'New Reminder',
    }
    setReminders(prev => [...prev, newReminder])
  }

  const handleUpdateReminder = (id: string, updates: Partial<ReminderPoint>) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  // Handlers for confirmation request
  const handleConfirmationRequestChange = (config: ConfirmationRequestSettings) => {
    setConfirmationRequest(config)
  }

  // Helper to get sub-tab stats
  const getSubTabStats = () => {
    const confirmationsActive = confirmationSettings.emailEnabled || confirmationSettings.smsEnabled || confirmationSettings.formRequestEnabled
    const remindersActive = reminders.filter(r => r.enabled).length
    const staffAlertsActive = internalNotifications.onlineBookingNotification || internalNotifications.staffBookingNotification

    return {
      confirmations: confirmationsActive ? 'active' : 'inactive',
      reminders: remindersActive > 0 ? `${remindersActive} active` : 'inactive',
      staffAlerts: staffAlertsActive ? 'active' : 'inactive'
    }
  }

  const stats = getSubTabStats()

  return (
    <div className="space-y-6">
      {/* Header with Master Toggle */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">Appointment Booked Messages</h2>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${masterEnabled ? 'text-green-700' : 'text-gray-500'}`}>
                  {masterEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={masterEnabled}
                    onChange={(e) => setMasterEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
            <p className="text-gray-600">
              Organized into three key areas: patient confirmations, appointment reminders, and staff alerts.
            </p>
            {!masterEnabled && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  All appointment booked messages are currently disabled. Enable this setting to activate automated messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveSubTab('confirmations')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeSubTab === 'confirmations'
                  ? 'border-purple-600 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Confirmations</span>
                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  stats.confirmations === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {stats.confirmations}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab('reminders')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeSubTab === 'reminders'
                  ? 'border-purple-600 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Reminders</span>
                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  stats.reminders !== 'inactive'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {stats.reminders}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveSubTab('staff-alerts')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeSubTab === 'staff-alerts'
                  ? 'border-purple-600 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                <span>Staff Alerts</span>
                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  stats.staffAlerts === 'active'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {stats.staffAlerts}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Content wrapper with disabled state */}
        <div className={masterEnabled ? 'p-6' : 'p-6 opacity-50 pointer-events-none'}>

          {/* CONFIRMATIONS TAB CONTENT */}
          {activeSubTab === 'confirmations' && (
            <div className="space-y-6">
              {/* Section Description */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Booking Confirmations</h3>
                    <p className="text-sm text-gray-600">
                      Sent immediately when an appointment is booked. Choose which channels to use for confirmation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Email Confirmation */}
                <MessageCard
                  id="email-confirmation"
                  title="Email Confirmation"
                  description="Send detailed appointment confirmation via email"
                  enabled={confirmationSettings.emailEnabled}
                  onToggle={() => handleConfirmationToggle('emailEnabled')}
                  channels={{ email: true, sms: false }}
                  isExpanded={expandedCard === 'email-confirmation'}
                  onExpand={setExpandedCard}
                  summary="Detailed confirmation with all appointment info"
                >
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Email includes:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-500 ml-2">
                        <li>Appointment date, time, and duration</li>
                        <li>Service details and provider name</li>
                        <li>Location and directions</li>
                        <li>Pre-visit preparation instructions</li>
                        <li>Cancellation policy</li>
                      </ul>
                    </div>
                    <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      Edit Email Template →
                    </button>
                  </div>
                </MessageCard>

                {/* SMS Confirmation */}
                <MessageCard
                  id="sms-confirmation"
                  title="SMS Confirmation"
                  description="Send brief appointment confirmation via text message"
                  enabled={confirmationSettings.smsEnabled}
                  onToggle={() => handleConfirmationToggle('smsEnabled')}
                  channels={{ sms: true, email: false }}
                  isExpanded={expandedCard === 'sms-confirmation'}
                  onExpand={setExpandedCard}
                  summary={confirmationRequest.enabled ? "Includes confirmation request" : "Brief confirmation via SMS"}
                >
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">SMS Preview:</p>
                      <p className="text-sm text-gray-700 font-mono">
                        {confirmationRequest.enabled
                          ? "Your appointment at Luxe Medical Spa is confirmed for Tuesday, Jan 9 at 2:00 PM with Dr. Sarah Johnson. Reply C to confirm, R to reschedule."
                          : "Your appointment at Luxe Medical Spa is confirmed for Tuesday, Jan 9 at 2:00 PM with Dr. Sarah Johnson. See you soon!"}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Character count: {confirmationRequest.enabled ? "148" : "124"}/160 (1 SMS segment)
                    </div>
                    {confirmationRequest.enabled && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-800">
                            <strong>Confirmation Request Active:</strong> Patients will be prompted to reply "C" to confirm or "R" to reschedule.
                            {confirmationRequest.setUnconfirmed && " Appointments will be marked as 'Unconfirmed' until patient responds."}
                          </p>
                        </div>
                      </div>
                    )}
                    <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                      Edit SMS Template →
                    </button>
                  </div>
                </MessageCard>

                {/* Form Request */}
                <MessageCard
                  id="form-request"
                  title="Form Request"
                  description="Request patient forms to be completed before appointment"
                  enabled={confirmationSettings.formRequestEnabled}
                  onToggle={() => handleConfirmationToggle('formRequestEnabled')}
                  channels={{ email: true, sms: true }}
                  isExpanded={expandedCard === 'form-request'}
                  onExpand={setExpandedCard}
                  summary="Sent with secure links to patient forms"
                >
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Includes secure links to:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-500 ml-2">
                        <li>Medical history forms</li>
                        <li>Consent forms</li>
                        <li>Patient intake questionnaire</li>
                        <li>Photo consent (if applicable)</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-800">
                          Forms are sent immediately after booking if this is enabled. Patients can complete forms online before arrival.
                        </p>
                      </div>
                    </div>
                  </div>
                </MessageCard>
              </div>

              {/* Confirmation Request Configuration */}
              <ConfirmationRequestConfig
                enabled={confirmationRequest.enabled}
                setUnconfirmed={confirmationRequest.setUnconfirmed}
                followUpEnabled={confirmationRequest.followUpEnabled}
                followUpHours={confirmationRequest.followUpHours}
                onChange={handleConfirmationRequestChange}
              />
            </div>
          )}

          {/* REMINDERS TAB CONTENT */}
          {activeSubTab === 'reminders' && (
            <div className="space-y-6">
              {/* Section Description */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Appointment Reminders</h3>
                    <p className="text-sm text-gray-600">
                      Configure automated reminders sent before appointments. Reminders help reduce no-shows by up to 50%.
                    </p>
                  </div>
                </div>
              </div>

              {/* Compact Timeline Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Active Reminders Timeline</h4>
                  <span className="text-sm text-gray-600">
                    <strong>{reminders.filter(r => r.enabled).length}</strong> of {reminders.length} active
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {reminders.filter(r => r.enabled).length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No active reminders configured</p>
                  ) : (
                    reminders
                      .filter(r => r.enabled)
                      .sort((a, b) => {
                        const aMinutes = a.timing.value * (a.timing.unit === 'days' ? 1440 : a.timing.unit === 'hours' ? 60 : 1)
                        const bMinutes = b.timing.value * (b.timing.unit === 'days' ? 1440 : b.timing.unit === 'hours' ? 60 : 1)
                        return bMinutes - aMinutes
                      })
                      .map((reminder) => (
                        <div key={reminder.id} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg whitespace-nowrap">
                          <Bell className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            {reminder.timing.value} {reminder.timing.unit}
                          </span>
                        </div>
                      ))
                  )}
                  <div className="flex items-center gap-2 px-3 py-2 bg-pink-100 border-2 border-pink-400 rounded-lg whitespace-nowrap">
                    <Calendar className="h-4 w-4 text-pink-700" />
                    <span className="text-sm font-semibold text-pink-900">Appointment</span>
                  </div>
                </div>
              </div>

              {/* Full Timeline Configurator */}
              <TimelineConfigurator
                reminders={reminders}
                onToggleReminder={handleToggleReminder}
                onRemoveReminder={handleRemoveReminder}
                onAddReminder={handleAddReminder}
                onUpdateReminder={handleUpdateReminder}
              />

              {/* Same-day Reminder Toggle */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${sameDayReminderEnabled ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Same-Day Appointment Reminder</h4>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Send a reminder on the morning of the appointment (9:00 AM) for same-day bookings
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={sameDayReminderEnabled}
                      onChange={(e) => setSameDayReminderEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STAFF ALERTS TAB CONTENT */}
          {activeSubTab === 'staff-alerts' && (
            <div className="space-y-6">
              {/* Section Description */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Staff Alerts</h3>
                    <p className="text-sm text-gray-600">
                      Internal notifications to alert your team when new appointments are booked. Keep everyone in the loop.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Online Booking Notification */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${internalNotifications.onlineBookingNotification ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Online Booking Notification</h4>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Notify staff when a patient books online through the portal
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={internalNotifications.onlineBookingNotification}
                        onChange={() => handleInternalNotificationToggle('onlineBookingNotification')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                {/* Staff Booking Notification */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${internalNotifications.staffBookingNotification ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Provider Notification</h4>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Notify the assigned provider when they're booked for an appointment
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={internalNotifications.staffBookingNotification}
                        onChange={() => handleInternalNotificationToggle('staffBookingNotification')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                {/* Notification Recipients Info */}
                {(internalNotifications.onlineBookingNotification || internalNotifications.staffBookingNotification) && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">Notification Recipients</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Notifications are sent via email and in-app alerts to the assigned provider and front desk staff.
                        </p>
                        <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                          Configure notification recipients →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Advanced Options */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <AdvancedSection defaultExpanded={false}>
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Booking Source Toggle</h4>
            <p className="text-sm text-gray-500 mb-4">
              Control which types of bookings trigger automated messages
            </p>
            <BookingSourceToggle
              onlineEnabled={bookingSourceSettings.onlineEnabled}
              staffEnabled={bookingSourceSettings.staffEnabled}
              onOnlineChange={(enabled) => setBookingSourceSettings(prev => ({ ...prev, onlineEnabled: enabled }))}
              onStaffChange={(enabled) => setBookingSourceSettings(prev => ({ ...prev, staffEnabled: enabled }))}
            />
          </div>
        </AdvancedSection>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
          Cancel
        </button>
        <button className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  )
}
