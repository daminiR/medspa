'use client';

import { useState } from 'react';
import { MessageCard } from '../components/MessageCard';
import { InternalNotificationConfig } from '../components/InternalNotificationConfig';
import MessageEditor, { MessageTemplate } from '../components/MessageEditor';
import TestSendButton from '../components/TestSendButton';
import { useAutomatedMessages } from '@/hooks/useAutomatedMessages';
import { Clock, Link as LinkIcon, UserCheck, Users, Bell } from 'lucide-react';

interface CheckInTabProps {}

export function CheckInTab({}: CheckInTabProps) {
  // Master toggle for entire tab
  const [masterEnabled, setMasterEnabled] = useState(true);

  // Accordion state - track which card is expanded (null = all collapsed)
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Hook for managing automated message settings with smart defaults
  const {
    getSettings,
    updateSettings,
    resetToDefaults,
    isUsingDefaults,
    isLoading
  } = useAutomatedMessages();

  // Get current settings from hook
  const checkInSettings = getSettings('check_in_reminder');
  const waitingSettings = getSettings('patient_waiting');
  const readySettings = getSettings('provider_ready');

  // Pre-Arrival Message State (check_in_reminder)
  const [preArrivalEnabled, setPreArrivalEnabled] = useState(checkInSettings?.enabled ?? true);
  const [preArrivalMinutes, setPreArrivalMinutes] = useState(
    checkInSettings?.timing.type === 'before_appointment' && checkInSettings?.timing.unit === 'hours'
      ? checkInSettings.timing.value! * 60
      : 15
  );
  const [preArrivalTemplate, setPreArrivalTemplate] = useState<MessageTemplate>({
    body: checkInSettings?.template.body ?? 'Hi {firstName}! Your appointment with {providerName} is in {minutes} minutes. Check in here: {checkInLink}',
    variables: checkInSettings?.template.variables ?? ['{firstName}', '{providerName}', '{minutes}', '{checkInLink}'],
  });
  const [preArrivalInstructions, setPreArrivalInstructions] = useState(
    checkInSettings?.checkInInstructions ?? ''
  );

  // Patient Waiting Notification State (Internal)
  const [waitingNotificationEnabled, setWaitingNotificationEnabled] = useState(
    waitingSettings?.enabled ?? true
  );
  const [waitingNotificationRecipients, setWaitingNotificationRecipients] = useState<string[]>(
    waitingSettings?.internalNotification?.recipients ?? ['frontdesk@luxespa.com']
  );

  // Provider Ready Notification State
  const [providerReadyEnabled, setProviderReadyEnabled] = useState(readySettings?.enabled ?? true);
  const [providerReadyTemplate, setProviderReadyTemplate] = useState<MessageTemplate>({
    body: readySettings?.template.body ?? 'Hi {firstName}, {providerName} is ready for you! Please proceed to {roomName}.',
    variables: readySettings?.template.variables ?? ['{firstName}', '{providerName}', '{roomName}'],
  });

  // Check-in Confirmation State (using patient_waiting for now)
  const [checkInConfirmationEnabled, setCheckInConfirmationEnabled] = useState(true);
  const [checkInConfirmationTemplate, setCheckInConfirmationTemplate] = useState<MessageTemplate>({
    body: 'Thank you for checking in, {firstName}! We\'ll notify you when {providerName} is ready. Estimated wait: {waitTime} mins.',
    variables: ['{firstName}', '{providerName}', '{waitTime}'],
  });

  // Mock send function for test messages
  const handleTestSend = async (recipient: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Test message sent to ${recipient}`);
  };

  // Handler to reset a specific message to defaults
  const handleResetPreArrival = () => {
    resetToDefaults('check_in_reminder');
    const defaults = getSettings('check_in_reminder');
    if (defaults) {
      setPreArrivalEnabled(defaults.enabled);
      setPreArrivalTemplate({
        body: defaults.template.body,
        variables: defaults.template.variables,
      });
      setPreArrivalInstructions(defaults.checkInInstructions ?? '');
    }
  };

  const handleResetWaiting = () => {
    resetToDefaults('patient_waiting');
    const defaults = getSettings('patient_waiting');
    if (defaults) {
      setWaitingNotificationEnabled(defaults.enabled);
      setWaitingNotificationRecipients(defaults.internalNotification?.recipients ?? []);
    }
  };

  const handleResetReady = () => {
    resetToDefaults('provider_ready');
    const defaults = getSettings('provider_ready');
    if (defaults) {
      setProviderReadyEnabled(defaults.enabled);
      setProviderReadyTemplate({
        body: defaults.template.body,
        variables: defaults.template.variables,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Master Toggle */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <UserCheck className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">Check-In Messages</h2>
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
              Configure automated messages to streamline patient check-in, from pre-arrival reminders
              to provider-ready notifications. Keep patients informed and reduce front desk workload.
            </p>
            {!masterEnabled && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  All check-in messages are currently disabled. Enable this setting to activate automated messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content wrapper with disabled state */}
      <div className={masterEnabled ? '' : 'opacity-50 pointer-events-none'}>
      {/* 1. Pre-Arrival Message */}
      <MessageCard
        id="pre-arrival"
        title="Pre-Arrival Message"
        description="Send patients a check-in link before their appointment arrives"
        enabled={preArrivalEnabled}
        onToggle={setPreArrivalEnabled}
        channels={{ sms: true, email: false }}
        isExpanded={expandedCard === 'pre-arrival'}
        onExpand={setExpandedCard}
        summary={`Send ${preArrivalMinutes} minutes before appointment`}
        isUsingDefaults={isUsingDefaults('check_in_reminder')}
        onResetToDefaults={handleResetPreArrival}
      >
        <div className="space-y-6">
          {/* Timing Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Clock className="inline h-4 w-4 mr-1.5" />
              Send Timing
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Send</span>
              <input
                type="number"
                min="5"
                max="120"
                value={preArrivalMinutes}
                onChange={(e) => setPreArrivalMinutes(parseInt(e.target.value) || 15)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-600">minutes before appointment</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Recommended: 15-30 minutes to give patients time to arrive
            </p>
          </div>

          {/* Message Template */}
          <MessageEditor
            template={preArrivalTemplate}
            onChange={setPreArrivalTemplate}
            messageType="sms"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="sms"
              template={{
                name: 'Pre-Arrival Message',
                content: preArrivalTemplate.body
              }}
              onSend={handleTestSend}
            />
          </div>

          {/* Custom Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon className="inline h-4 w-4 mr-1.5" />
              Custom Check-In Instructions
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Optional: Add parking, directions, or arrival instructions
            </p>
            <textarea
              value={preArrivalInstructions}
              onChange={(e) => setPreArrivalInstructions(e.target.value)}
              placeholder="Example: Please park in the rear lot. Enter through the main entrance and let our front desk know you've arrived."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {preArrivalInstructions.length}/500 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <LinkIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Self Check-In Link</p>
                <p>
                  The {'{checkInLink}'} variable will be replaced with a unique, secure link that
                  allows patients to check themselves in from their phone. This link expires after
                  the appointment time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MessageCard>

      {/* 2. Patient Waiting Notification (Internal) */}
      <MessageCard
        id="patient-waiting"
        title="Patient Waiting Notification"
        description="Internal alert to staff when a patient checks in"
        enabled={waitingNotificationEnabled}
        onToggle={setWaitingNotificationEnabled}
        channels={{ sms: false, email: true }}
        isExpanded={expandedCard === 'patient-waiting'}
        onExpand={setExpandedCard}
        summary="Internal staff notification"
        isUsingDefaults={isUsingDefaults('patient_waiting')}
        onResetToDefaults={handleResetWaiting}
      >
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Staff-Only Alert</p>
                <p>
                  This notification is sent to your front desk staff when a patient completes
                  check-in. It is NOT sent to the patient. Use this to ensure staff are aware
                  of patient arrivals in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Internal Notification Config */}
          <InternalNotificationConfig
            enabled={waitingNotificationEnabled}
            recipients={waitingNotificationRecipients}
            onChange={(config) => {
              setWaitingNotificationEnabled(config.enabled);
              setWaitingNotificationRecipients(config.recipients);
            }}
          />

          {/* Notification Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Notification will include:
            </h4>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Patient name and contact information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Appointment time and provider</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Service(s) scheduled</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Check-in timestamp</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Any patient-submitted notes or requests</span>
              </li>
            </ul>
          </div>
        </div>
      </MessageCard>

      {/* 3. Provider Ready Notification */}
      <MessageCard
        id="provider-ready"
        title="Provider Ready Notification"
        description="Message to patient when provider is ready to see them"
        enabled={providerReadyEnabled}
        onToggle={setProviderReadyEnabled}
        channels={{ sms: true, email: false }}
        isExpanded={expandedCard === 'provider-ready'}
        onExpand={setExpandedCard}
        summary="Sent when provider is ready"
        isUsingDefaults={isUsingDefaults('provider_ready')}
        onResetToDefaults={handleResetReady}
      >
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Room-Ready Alert</p>
                <p>
                  This message is sent to the patient when the provider or treatment room is
                  ready. Staff can trigger this manually from the waiting room dashboard or
                  it can be sent automatically based on appointment status.
                </p>
              </div>
            </div>
          </div>

          {/* Message Template */}
          <MessageEditor
            template={providerReadyTemplate}
            onChange={setProviderReadyTemplate}
            messageType="sms"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="sms"
              template={{
                name: 'Provider Ready Notification',
                content: providerReadyTemplate.body
              }}
              onSend={handleTestSend}
            />
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Delivery Options</h4>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={true}
                className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Send to patient's mobile device
                </p>
                <p className="text-xs text-gray-500">
                  Patient will receive SMS notification on their phone
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={false}
                className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Also display on waiting room TV/monitor
                </p>
                <p className="text-xs text-gray-500">
                  If you have a waiting room display system integrated
                </p>
              </div>
            </label>
          </div>
        </div>
      </MessageCard>

      {/* 4. Check-in Confirmation */}
      <MessageCard
        id="check-in-confirmation"
        title="Check-in Confirmation"
        description="Confirmation message sent after successful check-in"
        enabled={checkInConfirmationEnabled}
        onToggle={setCheckInConfirmationEnabled}
        channels={{ sms: true, email: false }}
        isExpanded={expandedCard === 'check-in-confirmation'}
        onExpand={setExpandedCard}
        summary="Sent immediately after check-in"
      >
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Check-In Acknowledgment</p>
                <p>
                  This message is sent immediately after the patient completes check-in
                  (either via self-service link or at the front desk). It confirms successful
                  check-in and sets expectations for wait time.
                </p>
              </div>
            </div>
          </div>

          {/* Message Template */}
          <MessageEditor
            template={checkInConfirmationTemplate}
            onChange={setCheckInConfirmationTemplate}
            messageType="sms"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="sms"
              template={{
                name: 'Check-in Confirmation',
                content: checkInConfirmationTemplate.body
              }}
              onSend={handleTestSend}
            />
          </div>

          {/* Wait Time Settings */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              <Clock className="inline h-4 w-4 mr-1.5" />
              Wait Time Calculation
            </h4>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="waitTime"
                  defaultChecked={true}
                  className="mt-1 h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Calculate based on current schedule
                  </p>
                  <p className="text-xs text-gray-500">
                    Automatically estimate wait time based on provider's current schedule
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="waitTime"
                  className="mt-1 h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Use fixed estimate
                  </p>
                  <p className="text-xs text-gray-500">
                    Set a standard wait time message (e.g., "5-10 minutes")
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="waitTime"
                  className="mt-1 h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Don't include wait time
                  </p>
                  <p className="text-xs text-gray-500">
                    Remove {'{waitTime}'} variable from message
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Next Steps Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-900 mb-2">
              Patient Experience Flow:
            </h4>
            <ol className="text-sm text-purple-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-purple-600">1.</span>
                <span>
                  Patient receives <strong>Pre-Arrival Message</strong> with check-in link
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-purple-600">2.</span>
                <span>Patient clicks link and completes check-in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-purple-600">3.</span>
                <span>
                  Patient receives <strong>Check-in Confirmation</strong> (this message)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-purple-600">4.</span>
                <span>
                  Staff receive <strong>Patient Waiting Notification</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-purple-600">5.</span>
                <span>
                  When ready, patient receives <strong>Provider Ready Notification</strong>
                </span>
              </li>
            </ol>
          </div>
        </div>
      </MessageCard>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Reset to Defaults
        </button>
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
