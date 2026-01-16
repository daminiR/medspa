'use client';

import React, { useState } from 'react';
import { MessageCard } from '../components/MessageCard';
import MessageEditor, { MessageTemplate } from '../components/MessageEditor';
import { InternalNotificationConfig } from '../components/InternalNotificationConfig';
import TestSendButton from '../components/TestSendButton';
import PreviewModal from '../components/PreviewModal';
import { Eye, CalendarX } from 'lucide-react';

/**
 * AppointmentCanceledTab Component
 *
 * Configure automated messages sent when appointments are canceled.
 * Features:
 * - Email notification with template editor
 * - SMS notification with template editor
 * - Internal staff notifications
 */

// Default templates
const DEFAULT_EMAIL_TEMPLATE: MessageTemplate = {
  subject: 'Appointment Canceled',
  body: 'Hi {firstName},\n\nYour appointment on {appointmentDate} at {appointmentTime} has been canceled.\n\nTo reschedule, please call us at {locationPhone} or book online at {bookingLink}.\n\nWe look forward to seeing you soon!\n\n{locationName}',
  variables: ['{firstName}', '{appointmentDate}', '{appointmentTime}', '{locationPhone}', '{bookingLink}', '{locationName}']
};

const DEFAULT_SMS_TEMPLATE: MessageTemplate = {
  body: 'Hi {firstName}, your appointment on {appointmentDate} has been canceled. To reschedule, call us at {locationPhone} or book online. - {locationName}',
  variables: ['{firstName}', '{appointmentDate}', '{locationPhone}', '{locationName}']
};

export function AppointmentCanceledTab() {
  // Master toggle for entire tab
  const [masterEnabled, setMasterEnabled] = useState(true);

  // Accordion state - track which card is expanded
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Email notification state
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailTemplate, setEmailTemplate] = useState<MessageTemplate>(DEFAULT_EMAIL_TEMPLATE);

  // SMS notification state
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsTemplate, setSmsTemplate] = useState<MessageTemplate>(DEFAULT_SMS_TEMPLATE);

  // Internal notification state
  const [internalNotificationEnabled, setInternalNotificationEnabled] = useState(true);
  const [internalRecipients, setInternalRecipients] = useState<string[]>([
    'admin@luxemedicalspa.com',
    'frontdesk@luxemedicalspa.com'
  ]);

  // Preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
  const [previewType, setPreviewType] = useState<'sms' | 'email'>('email');

  // Handle internal notification config change
  const handleInternalNotificationChange = (config: { enabled: boolean; recipients: string[] }) => {
    setInternalNotificationEnabled(config.enabled);
    setInternalRecipients(config.recipients);
  };

  // Mock send function for test messages
  const handleTestSend = async (recipient: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Test message sent to ${recipient}`);
  };

  // Handle preview button click
  const handlePreview = (template: MessageTemplate, type: 'sms' | 'email') => {
    setPreviewTemplate(template);
    setPreviewType(type);
    setPreviewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Master Toggle */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <CalendarX className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">Appointment Canceled Messages</h2>
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
              These automated messages are sent to patients when their appointment is canceled
              (either by staff or by the patient). They help maintain communication and make
              it easy for patients to reschedule.
            </p>
            {!masterEnabled && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  All appointment cancellation messages are currently disabled. Enable this setting to activate automated messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content wrapper with disabled state */}
      <div className={masterEnabled ? '' : 'opacity-50 pointer-events-none'}>
      {/* Email Notification */}
      <MessageCard
        id="email-notification"
        title="Email Notification"
        description="Send cancellation confirmation via email"
        enabled={emailEnabled}
        onToggle={setEmailEnabled}
        channels={{ email: true, sms: false }}
        isExpanded={expandedCard === 'email-notification'}
        onExpand={setExpandedCard}
        summary="Detailed cancellation email"
      >
        <div className={emailEnabled ? '' : 'opacity-50 pointer-events-none'}>
          <MessageEditor
            template={emailTemplate}
            onChange={setEmailTemplate}
            messageType="email"
          />

          {/* Preview and Test Send Buttons */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => handlePreview(emailTemplate, 'email')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <TestSendButton
              messageType="email"
              template={{
                name: 'Appointment Canceled Email',
                content: emailTemplate.body
              }}
              onSend={handleTestSend}
            />
          </div>
        </div>
      </MessageCard>

      {/* SMS Notification */}
      <MessageCard
        id="sms-notification"
        title="SMS Notification"
        description="Send cancellation confirmation via SMS"
        enabled={smsEnabled}
        onToggle={setSmsEnabled}
        channels={{ sms: true, email: false }}
        isExpanded={expandedCard === 'sms-notification'}
        onExpand={setExpandedCard}
        summary="Brief cancellation SMS"
      >
        <div className={smsEnabled ? '' : 'opacity-50 pointer-events-none'}>
          <MessageEditor
            template={smsTemplate}
            onChange={setSmsTemplate}
            messageType="sms"
          />

          {/* Preview and Test Send Buttons */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => handlePreview(smsTemplate, 'sms')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <TestSendButton
              messageType="sms"
              template={{
                name: 'Appointment Canceled SMS',
                content: smsTemplate.body
              }}
              onSend={handleTestSend}
            />
          </div>
        </div>
      </MessageCard>

      {/* Internal Notification */}
      <InternalNotificationConfig
        enabled={internalNotificationEnabled}
        recipients={internalRecipients}
        onChange={handleInternalNotificationChange}
      />

      {/* Additional Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Settings</h3>

        <div className="space-y-4">
          {/* Send immediately option */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Send Immediately</p>
              <p className="text-xs text-gray-500 mt-1">
                Send cancellation notification as soon as appointment is canceled
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={true}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Include reschedule link */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Include Reschedule Link</p>
              <p className="text-xs text-gray-500 mt-1">
                Add a direct link to book a new appointment
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={true}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Include cancellation reason */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Include Cancellation Reason</p>
              <p className="text-xs text-gray-500 mt-1">
                Display the reason for cancellation if provided
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={false}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset to Defaults
        </button>
        <button
          type="button"
          className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <PreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          template={{
            name: 'Appointment Canceled',
            type: previewType,
            subject: previewTemplate.subject,
            content: previewTemplate.body,
            timing: 'Immediately after cancellation'
          }}
          messageType={previewType}
        />
      )}
    </div>
  );
}
