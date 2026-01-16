'use client';

import { useState } from 'react';
import { MessageCard } from '../components/MessageCard';
import MessageEditor, { MessageTemplate } from '../components/MessageEditor';
import { InternalNotificationConfig } from '../components/InternalNotificationConfig';
import TestSendButton from '../components/TestSendButton';
import { AdvancedSection } from '../components/AdvancedSection';
import { Clock, Mail, MessageSquare, Bell, Settings2, AlertCircle, X, Users } from 'lucide-react';

interface WaitlistMessageSettings {
  addedToWaitlist: {
    enabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    smsTemplate: MessageTemplate;
    emailTemplate: MessageTemplate;
  };
  openingAvailable: {
    enabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    smsTemplate: MessageTemplate;
    emailTemplate: MessageTemplate;
    includeBookingLink: boolean;
  };
  internalNotification: {
    enabled: boolean;
    recipients: string[];
    notifyOnMatch: boolean;
  };
  autoOffer: {
    enabled: boolean;
    offerDuration: number;
    offerUnit: 'minutes' | 'hours';
    maxOffers: number;
    skipToNextAfterExpire: boolean;
  };
}

export default function WaitlistTab() {
  // Master toggle for entire tab
  const [masterEnabled, setMasterEnabled] = useState(true);

  // Accordion state - track which card is expanded
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const [settings, setSettings] = useState<WaitlistMessageSettings>({
    addedToWaitlist: {
      enabled: true,
      smsEnabled: true,
      emailEnabled: false,
      smsTemplate: {
        body: "Hi {firstName}, you've been added to our waitlist for {serviceName}. We'll notify you when a slot becomes available. Reply STOP to opt out.",
        variables: ['{firstName}', '{serviceName}']
      },
      emailTemplate: {
        subject: 'You\'re on the Waitlist - {locationName}',
        body: "Hi {firstName},\n\nYou've been successfully added to our waitlist for {serviceName}.\n\nWe'll send you a notification as soon as a matching appointment slot becomes available.\n\nThank you for your patience!\n\nBest regards,\n{locationName}",
        variables: ['{firstName}', '{serviceName}', '{locationName}']
      }
    },
    openingAvailable: {
      enabled: true,
      smsEnabled: true,
      emailEnabled: true,
      smsTemplate: {
        body: "Good news {firstName}! A slot opened up for {serviceName} with {providerName} on {appointmentDate} at {appointmentTime}. Book now: {bookingLink}",
        variables: ['{firstName}', '{serviceName}', '{providerName}', '{appointmentDate}', '{appointmentTime}', '{bookingLink}']
      },
      emailTemplate: {
        subject: 'Appointment Slot Available - {serviceName}',
        body: "Hi {firstName},\n\nGreat news! An appointment slot has opened up:\n\nService: {serviceName}\nProvider: {providerName}\nDate: {appointmentDate}\nTime: {appointmentTime}\n\nClick here to book this slot:\n{bookingLink}\n\nThis offer is available for a limited time, so book soon to secure your appointment!\n\nBest regards,\n{locationName}",
        variables: ['{firstName}', '{serviceName}', '{providerName}', '{appointmentDate}', '{appointmentTime}', '{bookingLink}', '{locationName}']
      },
      includeBookingLink: true
    },
    internalNotification: {
      enabled: true,
      recipients: ['admin@luxemedispa.com'],
      notifyOnMatch: true
    },
    autoOffer: {
      enabled: true,
      offerDuration: 2,
      offerUnit: 'hours',
      maxOffers: 3,
      skipToNextAfterExpire: true
    }
  });

  // Update Added to Waitlist settings
  const updateAddedToWaitlist = (key: string, value: any) => {
    setSettings({
      ...settings,
      addedToWaitlist: {
        ...settings.addedToWaitlist,
        [key]: value
      }
    });
  };

  // Update Opening Available settings
  const updateOpeningAvailable = (key: string, value: any) => {
    setSettings({
      ...settings,
      openingAvailable: {
        ...settings.openingAvailable,
        [key]: value
      }
    });
  };

  // Update Internal Notification settings
  const updateInternalNotification = (config: { enabled: boolean; recipients: string[] }) => {
    setSettings({
      ...settings,
      internalNotification: {
        ...settings.internalNotification,
        ...config
      }
    });
  };

  // Update Auto-Offer settings
  const updateAutoOffer = (key: string, value: any) => {
    setSettings({
      ...settings,
      autoOffer: {
        ...settings.autoOffer,
        [key]: value
      }
    });
  };

  // Mock send function for test messages
  const handleTestSend = async (recipient: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Test message sent to ${recipient}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Master Toggle and Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">Waitlist Messages</h2>
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
            <p className="text-gray-600 mb-3">
              Automatically notify patients when they join the waitlist and when appointments become available.
            </p>

            {/* Simple Summary */}
            {masterEnabled && (
              <div className="bg-white/60 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${settings.addedToWaitlist.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-gray-700">
                    <span className="font-medium">Added to waitlist:</span> {settings.addedToWaitlist.enabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${settings.openingAvailable.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-gray-700">
                    <span className="font-medium">Opening available:</span> {settings.openingAvailable.enabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${settings.internalNotification.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-gray-700">
                    <span className="font-medium">Staff notifications:</span> {settings.internalNotification.enabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            )}

            {!masterEnabled && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  All waitlist messages are currently disabled. Enable this setting to activate automated messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content wrapper with disabled state */}
      <div className={masterEnabled ? '' : 'opacity-50 pointer-events-none'}>
      {/* 1. Added to Waitlist Confirmation */}
      <MessageCard
        id="added-to-waitlist"
        title="Added to Waitlist"
        description="Confirmation message sent when a patient is added to the waitlist"
        enabled={settings.addedToWaitlist.enabled}
        onToggle={(enabled) => updateAddedToWaitlist('enabled', enabled)}
        channels={{
          sms: settings.addedToWaitlist.smsEnabled,
          email: settings.addedToWaitlist.emailEnabled
        }}
        isExpanded={expandedCard === 'added-to-waitlist'}
        onExpand={setExpandedCard}
        summary="Sent when added to waitlist"
      >
        <div className="space-y-6">
          {/* Channel Selection */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Delivery Channels
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.addedToWaitlist.smsEnabled}
                  onChange={(e) => updateAddedToWaitlist('smsEnabled', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">SMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.addedToWaitlist.emailEnabled}
                  onChange={(e) => updateAddedToWaitlist('emailEnabled', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <Mail className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </label>
            </div>
          </div>

          {/* SMS Template */}
          {settings.addedToWaitlist.smsEnabled && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h4 className="text-md font-semibold text-gray-900">SMS Message</h4>
              </div>
              <MessageEditor
                template={settings.addedToWaitlist.smsTemplate}
                onChange={(template) => updateAddedToWaitlist('smsTemplate', template)}
                messageType="sms"
              />

              {/* Test Send Button */}
              <div className="mt-4 flex justify-end">
                <TestSendButton
                  messageType="sms"
                  template={{
                    name: 'Added to Waitlist SMS',
                    content: settings.addedToWaitlist.smsTemplate.body
                  }}
                  onSend={handleTestSend}
                />
              </div>
            </div>
          )}

          {/* Email Template */}
          {settings.addedToWaitlist.emailEnabled && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-purple-600" />
                <h4 className="text-md font-semibold text-gray-900">Email Message</h4>
              </div>
              <MessageEditor
                template={settings.addedToWaitlist.emailTemplate}
                onChange={(template) => updateAddedToWaitlist('emailTemplate', template)}
                messageType="email"
              />

              {/* Test Send Button */}
              <div className="mt-4 flex justify-end">
                <TestSendButton
                  messageType="email"
                  template={{
                    name: 'Added to Waitlist Email',
                    content: settings.addedToWaitlist.emailTemplate.body
                  }}
                  onSend={handleTestSend}
                />
              </div>
            </div>
          )}
        </div>
      </MessageCard>

      {/* 2. Opening Available */}
      <MessageCard
        id="opening-available"
        title="Opening Available"
        description="Notification sent when a matching appointment slot becomes available"
        enabled={settings.openingAvailable.enabled}
        onToggle={(enabled) => updateOpeningAvailable('enabled', enabled)}
        channels={{
          sms: settings.openingAvailable.smsEnabled,
          email: settings.openingAvailable.emailEnabled
        }}
        isExpanded={expandedCard === 'opening-available'}
        onExpand={setExpandedCard}
        summary="Sent when slot becomes available"
      >
        <div className="space-y-6">
          {/* Channel Selection */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Delivery Channels
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.openingAvailable.smsEnabled}
                  onChange={(e) => updateOpeningAvailable('smsEnabled', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">SMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.openingAvailable.emailEnabled}
                  onChange={(e) => updateOpeningAvailable('emailEnabled', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <Mail className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </label>
            </div>
          </div>

          {/* Booking Link Option */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.openingAvailable.includeBookingLink}
                onChange={(e) => updateOpeningAvailable('includeBookingLink', e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-blue-900 block mb-1">
                  Include Direct Booking Link
                </span>
                <span className="text-xs text-blue-700">
                  Send a unique link that allows the patient to instantly book the available slot.
                  Recommended for faster booking and better conversion.
                </span>
              </div>
            </label>
          </div>

          {/* SMS Template */}
          {settings.openingAvailable.smsEnabled && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h4 className="text-md font-semibold text-gray-900">SMS Message</h4>
              </div>
              <MessageEditor
                template={settings.openingAvailable.smsTemplate}
                onChange={(template) => updateOpeningAvailable('smsTemplate', template)}
                messageType="sms"
              />

              {/* Test Send Button */}
              <div className="mt-4 flex justify-end">
                <TestSendButton
                  messageType="sms"
                  template={{
                    name: 'Opening Available SMS',
                    content: settings.openingAvailable.smsTemplate.body
                  }}
                  onSend={handleTestSend}
                />
              </div>
            </div>
          )}

          {/* Email Template */}
          {settings.openingAvailable.emailEnabled && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-purple-600" />
                <h4 className="text-md font-semibold text-gray-900">Email Message</h4>
              </div>
              <MessageEditor
                template={settings.openingAvailable.emailTemplate}
                onChange={(template) => updateOpeningAvailable('emailTemplate', template)}
                messageType="email"
              />

              {/* Test Send Button */}
              <div className="mt-4 flex justify-end">
                <TestSendButton
                  messageType="email"
                  template={{
                    name: 'Opening Available Email',
                    content: settings.openingAvailable.emailTemplate.body
                  }}
                  onSend={handleTestSend}
                />
              </div>
            </div>
          )}
        </div>
      </MessageCard>

      {/* 3. Internal Staff Notifications - Collapsed by default */}
      <MessageCard
        id="internal-notifications"
        title="Staff Notifications"
        description="Send notification copies to staff members for monitoring"
        enabled={settings.internalNotification.enabled}
        onToggle={(enabled) => updateInternalNotification({ enabled, recipients: settings.internalNotification.recipients })}
        isExpanded={expandedCard === 'internal-notifications'}
        onExpand={setExpandedCard}
        summary={settings.internalNotification.enabled ? `${settings.internalNotification.recipients.length} recipient(s)` : 'Internal notifications off'}
      >
        <div className="space-y-6">
          {/* Description */}
          <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Staff-Only Notifications</p>
              <p>
                These notifications are sent to staff members only, not to patients.
                Use this to keep your team informed about important automated messages being sent.
              </p>
            </div>
          </div>

          {/* Email Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email Addresses
            </label>

            {/* Email Tags Display */}
            {settings.internalNotification.recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {settings.internalNotification.recipients.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    <Mail className="h-3 w-3" />
                    {email}
                    <button
                      onClick={() => updateInternalNotification({
                        enabled: settings.internalNotification.enabled,
                        recipients: settings.internalNotification.recipients.filter(e => e !== email)
                      })}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${email}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Email Helper Text */}
            <p className="text-xs text-gray-500 mb-3">
              Click to expand and manage recipient email addresses
            </p>
          </div>

          {/* Additional Options */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.internalNotification.notifyOnMatch}
                onChange={(e) => setSettings({
                  ...settings,
                  internalNotification: {
                    ...settings.internalNotification,
                    notifyOnMatch: e.target.checked
                  }
                })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 block mb-1">
                  Notify when opening matches waitlist patient
                </span>
                <span className="text-xs text-gray-600">
                  Send internal notification to staff when a cancellation or opening matches a patient
                  on the waitlist, allowing for quick follow-up.
                </span>
              </div>
            </label>
          </div>
        </div>
      </MessageCard>

      {/* 4. Auto-Offer Settings - Advanced Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <AdvancedSection defaultExpanded={false}>
          <div className="space-y-4">
            {/* Section Header with Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3 flex-1">
                <Settings2 className="w-5 h-5 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900">Auto-Offer Timing</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Configure automatic waitlist offers when appointments become available
                  </p>
                </div>
              </div>
            </div>

            {/* Auto-Offer Configuration */}
            <div className="space-y-6 pt-2">
              {/* Offer Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Response Time Limit
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  How long a patient has to respond before the offer expires
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={settings.autoOffer.offerDuration}
                    onChange={(e) => updateAutoOffer('offerDuration', parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <select
                    value={settings.autoOffer.offerUnit}
                    onChange={(e) => updateAutoOffer('offerUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Current: Patient has {settings.autoOffer.offerDuration} {settings.autoOffer.offerUnit} to respond
                </p>
              </div>

              {/* Auto-Skip to Next */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoOffer.skipToNextAfterExpire}
                    onChange={(e) => updateAutoOffer('skipToNextAfterExpire', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 block mb-1">
                      Automatically offer to next person after expiration
                    </span>
                    <span className="text-xs text-gray-600">
                      When an offer expires, automatically send it to the next eligible patient on the waitlist.
                    </span>
                  </div>
                </label>
              </div>

              {/* Nested Advanced Settings for Max Offers */}
              <div className="border-t border-gray-200 pt-4">
                <AdvancedSection defaultExpanded={false}>
                  <div className="space-y-4 pt-2">
                    {/* Maximum Offers */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maximum Offers per Slot
                        </label>
                        <p className="text-xs text-gray-600">
                          Limit how many times the same slot can be offered before stopping
                        </p>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={settings.autoOffer.maxOffers}
                        onChange={(e) => updateAutoOffer('maxOffers', parseInt(e.target.value))}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Will offer to up to {settings.autoOffer.maxOffers} patients before stopping
                      </p>
                    </div>
                  </div>
                </AdvancedSection>
              </div>

              {/* Auto-Offer Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How Auto-Offer Works</p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>When a slot opens, system finds matching waitlist patients</li>
                      <li>First eligible patient receives offer notification</li>
                      <li>Patient has {settings.autoOffer.offerDuration} {settings.autoOffer.offerUnit} to accept</li>
                      {settings.autoOffer.skipToNextAfterExpire && (
                        <li>If no response, offer automatically goes to next patient</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AdvancedSection>
      </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            alert('Waitlist message settings saved!');
          }}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
