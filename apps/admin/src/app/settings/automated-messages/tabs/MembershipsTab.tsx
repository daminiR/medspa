'use client'

import { useState } from 'react'
import { MessageCard } from '../components/MessageCard'
import MessageEditor, { MessageTemplate } from '../components/MessageEditor'
import TestSendButton from '../components/TestSendButton'
import {
  Mail,
  MessageSquare,
  Users,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Gift,
  Clock
} from 'lucide-react'

interface MembershipSettings {
  membershipStarted: {
    enabled: boolean
    template: MessageTemplate
    includeBenefitsSummary: boolean
  }
  preRenewalReminder: {
    enabled: boolean
    template: MessageTemplate
    daysBeforeRenewal: number
  }
  renewalSuccess: {
    enabled: boolean
    template: MessageTemplate
  }
  renewalFailed: {
    enabled: boolean
    template: MessageTemplate
    includePaymentUpdateLink: boolean
  }
  membershipCanceled: {
    enabled: boolean
    template: MessageTemplate
    includeReactivationInfo: boolean
  }
}

export default function MembershipsTab() {
  // Master toggle for entire tab
  const [masterEnabled, setMasterEnabled] = useState(true);

  const [settings, setSettings] = useState<MembershipSettings>({
    membershipStarted: {
      enabled: true,
      template: {
        subject: 'Welcome to {locationName} Membership!',
        body: 'Hi {firstName},\n\nWelcome to your {membershipName} membership at {locationName}! We\'re thrilled to have you as a member.\n\n✨ Your Membership Benefits:\n{benefitsSummary}\n\nYour membership is active and ready to use. You can view your membership details and book appointments anytime through your patient portal.\n\nWe look forward to helping you achieve your beauty and wellness goals!\n\nWarm regards,\nThe {locationName} Team',
        variables: ['{firstName}', '{locationName}', '{membershipName}', '{benefitsSummary}']
      },
      includeBenefitsSummary: true
    },
    preRenewalReminder: {
      enabled: true,
      template: {
        body: 'Hi {firstName}! Your {membershipName} membership at {locationName} will renew in {daysUntilRenewal} days for ${renewalAmount}. Your card ending in {lastFourDigits} will be charged on {renewalDate}. Questions? Reply here!',
        variables: ['{firstName}', '{membershipName}', '{locationName}', '{daysUntilRenewal}', '{renewalAmount}', '{lastFourDigits}', '{renewalDate}']
      },
      daysBeforeRenewal: 7
    },
    renewalSuccess: {
      enabled: true,
      template: {
        body: 'Hi {firstName}! Your {membershipName} membership has been successfully renewed for ${renewalAmount}. Your membership is active until {nextRenewalDate}. Thank you for being a valued member at {locationName}!',
        variables: ['{firstName}', '{membershipName}', '{renewalAmount}', '{nextRenewalDate}', '{locationName}']
      }
    },
    renewalFailed: {
      enabled: true,
      template: {
        body: 'Hi {firstName}, we couldn\'t process your {membershipName} membership renewal. Please update your payment method to keep your membership active: {updatePaymentLink}\n\nQuestions? Reply here or call us at {phoneNumber}.',
        variables: ['{firstName}', '{membershipName}', '{updatePaymentLink}', '{phoneNumber}']
      },
      includePaymentUpdateLink: true
    },
    membershipCanceled: {
      enabled: true,
      template: {
        subject: 'Your Membership Cancellation Confirmation',
        body: 'Hi {firstName},\n\nYour {membershipName} membership at {locationName} has been canceled as requested. Your membership benefits will remain active until {expirationDate}.\n\nWe\'re sorry to see you go! If you\'d like to reactivate your membership in the future, you can do so anytime through your patient portal or by contacting us.\n\n📞 Reactivation: {reactivationLink}\n\nThank you for being part of our community. We hope to see you again soon!\n\nBest regards,\nThe {locationName} Team',
        variables: ['{firstName}', '{membershipName}', '{locationName}', '{expirationDate}', '{reactivationLink}']
      },
      includeReactivationInfo: true
    }
  })

  // Handler functions
  const handleMembershipStartedToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      membershipStarted: { ...prev.membershipStarted, enabled }
    }))
  }

  const handleMembershipStartedChange = (template: MessageTemplate) => {
    setSettings(prev => ({
      ...prev,
      membershipStarted: { ...prev.membershipStarted, template }
    }))
  }

  const handlePreRenewalToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      preRenewalReminder: { ...prev.preRenewalReminder, enabled }
    }))
  }

  const handlePreRenewalChange = (template: MessageTemplate) => {
    setSettings(prev => ({
      ...prev,
      preRenewalReminder: { ...prev.preRenewalReminder, template }
    }))
  }

  const handleRenewalSuccessToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      renewalSuccess: { ...prev.renewalSuccess, enabled }
    }))
  }

  const handleRenewalSuccessChange = (template: MessageTemplate) => {
    setSettings(prev => ({
      ...prev,
      renewalSuccess: { ...prev.renewalSuccess, template }
    }))
  }

  const handleRenewalFailedToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      renewalFailed: { ...prev.renewalFailed, enabled }
    }))
  }

  const handleRenewalFailedChange = (template: MessageTemplate) => {
    setSettings(prev => ({
      ...prev,
      renewalFailed: { ...prev.renewalFailed, template }
    }))
  }

  const handleMembershipCanceledToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      membershipCanceled: { ...prev.membershipCanceled, enabled }
    }))
  }

  const handleMembershipCanceledChange = (template: MessageTemplate) => {
    setSettings(prev => ({
      ...prev,
      membershipCanceled: { ...prev.membershipCanceled, template }
    }))
  }

  // Mock send function for test messages
  const handleTestSend = async (recipient: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Test message sent to ${recipient}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Master Toggle */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">Membership Messages</h2>
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
              Configure automated messages for all stages of the membership lifecycle - from welcome to renewal to cancellation.
              Keep members informed and engaged throughout their journey.
            </p>
            {!masterEnabled && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  All membership messages are currently disabled. Enable this setting to activate automated messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content wrapper with disabled state */}
      <div className={masterEnabled ? '' : 'opacity-50 pointer-events-none'}>
      {/* 1) Membership Started */}
      <MessageCard
        title="Membership Started"
        description="Welcome message sent when a new membership begins"
        enabled={settings.membershipStarted.enabled}
        onToggle={handleMembershipStartedToggle}
        channels={{ email: true, sms: true }}
        defaultExpanded={false}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">When this sends</p>
              <p>Sent immediately after a membership is activated or purchased. This is a great opportunity to welcome new members and set expectations.</p>
            </div>
          </div>

          {/* Benefits Summary Toggle */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.membershipStarted.includeBenefitsSummary}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  membershipStarted: {
                    ...prev.membershipStarted,
                    includeBenefitsSummary: e.target.checked
                  }
                }))}
                className="mt-0.5 h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <Gift className="h-4 w-4 text-purple-600" />
                  Include Benefits Summary
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Automatically include a personalized list of membership benefits (monthly credits, discounts, perks)
                </div>
              </div>
            </label>
          </div>

          <MessageEditor
            template={settings.membershipStarted.template}
            onChange={handleMembershipStartedChange}
            messageType="email"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="email"
              template={{
                name: 'Membership Started',
                content: settings.membershipStarted.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Additional Variables Available:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><code className="bg-white px-2 py-0.5 rounded">{'{membershipName}'}</code> - Name of membership tier</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{benefitsSummary}'}</code> - List of membership benefits</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{monthlyPrice}'}</code> - Monthly membership price</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{startDate}'}</code> - Membership start date</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{nextRenewalDate}'}</code> - Next renewal date</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{portalLink}'}</code> - Link to patient portal</div>
            </div>
          </div>
        </div>
      </MessageCard>

      {/* 2) Pre-Renewal Reminder */}
      <MessageCard
        title="Pre-Renewal Reminder"
        description="Reminder sent before membership auto-renewal"
        enabled={settings.preRenewalReminder.enabled}
        onToggle={handlePreRenewalToggle}
        channels={{ sms: true, email: false }}
        defaultExpanded={false}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Best Practice</p>
              <p>Give members advance notice before charging their card. This reduces payment failures and builds trust with transparent communication.</p>
            </div>
          </div>

          {/* Days Before Renewal Configuration */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Clock className="inline h-4 w-4 mr-1" />
              Reminder Timing
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Send reminder</span>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.preRenewalReminder.daysBeforeRenewal}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  preRenewalReminder: {
                    ...prev.preRenewalReminder,
                    daysBeforeRenewal: parseInt(e.target.value) || 7
                  }
                }))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">days before renewal</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Recommended: 7 days gives members time to update payment info if needed
            </p>
          </div>

          <MessageEditor
            template={settings.preRenewalReminder.template}
            onChange={handlePreRenewalChange}
            messageType="sms"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="sms"
              template={{
                name: 'Pre-Renewal Reminder',
                content: settings.preRenewalReminder.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Additional Variables Available:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><code className="bg-white px-2 py-0.5 rounded">{'{membershipName}'}</code> - Membership tier name</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{renewalAmount}'}</code> - Renewal charge amount</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{renewalDate}'}</code> - Date of renewal</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{daysUntilRenewal}'}</code> - Days until renewal</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{lastFourDigits}'}</code> - Last 4 of payment card</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{updatePaymentLink}'}</code> - Link to update payment</div>
            </div>
          </div>
        </div>
      </MessageCard>

      {/* 3) Renewal Success */}
      <MessageCard
        title="Renewal Success"
        description="Confirmation sent after successful membership renewal"
        enabled={settings.renewalSuccess.enabled}
        onToggle={handleRenewalSuccessToggle}
        channels={{ sms: true, email: true }}
        defaultExpanded={false}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">When this sends</p>
              <p>Sent immediately after a membership renewal payment is successfully processed. Confirms the charge and extends membership benefits.</p>
            </div>
          </div>

          <MessageEditor
            template={settings.renewalSuccess.template}
            onChange={handleRenewalSuccessChange}
            messageType="sms"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="sms"
              template={{
                name: 'Renewal Success',
                content: settings.renewalSuccess.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Additional Variables Available:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><code className="bg-white px-2 py-0.5 rounded">{'{membershipName}'}</code> - Membership tier name</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{renewalAmount}'}</code> - Amount charged</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{renewalDate}'}</code> - Date renewed</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{nextRenewalDate}'}</code> - Next renewal date</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{receiptLink}'}</code> - Link to receipt</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{lastFourDigits}'}</code> - Last 4 of card charged</div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-start gap-2">
              <Gift className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-purple-800">
                <p className="font-medium mb-1">Retention Opportunity</p>
                <p>Use this message to remind members of their benefits and encourage them to book their next appointment. Happy, active members are more likely to renew long-term.</p>
              </div>
            </div>
          </div>
        </div>
      </MessageCard>

      {/* 4) Renewal Failed */}
      <MessageCard
        title="Renewal Failed"
        description="Notification when membership renewal payment fails"
        enabled={settings.renewalFailed.enabled}
        onToggle={handleRenewalFailedToggle}
        channels={{ sms: true, email: true }}
        defaultExpanded={false}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">When this sends</p>
              <p>Sent when a renewal payment fails (expired card, insufficient funds, etc.). Quick notification helps members resolve issues before membership lapses.</p>
            </div>
          </div>

          {/* Payment Update Link Toggle */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.renewalFailed.includePaymentUpdateLink}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  renewalFailed: {
                    ...prev.renewalFailed,
                    includePaymentUpdateLink: e.target.checked
                  }
                }))}
                className="mt-0.5 h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  Include Payment Update Link
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Add a secure link where members can update their payment method immediately
                </div>
              </div>
            </label>
          </div>

          <MessageEditor
            template={settings.renewalFailed.template}
            onChange={handleRenewalFailedChange}
            messageType="sms"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="sms"
              template={{
                name: 'Renewal Failed',
                content: settings.renewalFailed.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Additional Variables Available:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><code className="bg-white px-2 py-0.5 rounded">{'{membershipName}'}</code> - Membership tier name</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{renewalAmount}'}</code> - Failed charge amount</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{updatePaymentLink}'}</code> - Link to update payment</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{phoneNumber}'}</code> - Clinic phone number</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{failureReason}'}</code> - Reason for failure (if available)</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{gracePeriodDays}'}</code> - Days until membership expires</div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">Grace Period Best Practices</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Give members 7-14 days to update payment before canceling</li>
                  <li>Send follow-up reminders if payment isn't updated</li>
                  <li>Make it easy with a direct link to update payment info</li>
                  <li>Offer support via phone or chat for members who need help</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </MessageCard>

      {/* 5) Membership Canceled */}
      <MessageCard
        title="Membership Canceled"
        description="Confirmation sent when a membership is canceled"
        enabled={settings.membershipCanceled.enabled}
        onToggle={handleMembershipCanceledToggle}
        channels={{ email: true, sms: true }}
        defaultExpanded={false}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <XCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-800">
              <p className="font-medium mb-1">When this sends</p>
              <p>Sent when a member cancels their membership or when membership is terminated due to non-payment. Confirms cancellation and provides reactivation options.</p>
            </div>
          </div>

          {/* Reactivation Info Toggle */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.membershipCanceled.includeReactivationInfo}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  membershipCanceled: {
                    ...prev.membershipCanceled,
                    includeReactivationInfo: e.target.checked
                  }
                }))}
                className="mt-0.5 h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Include Reactivation Information
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Add information about how to reactivate their membership in the future
                </div>
              </div>
            </label>
          </div>

          <MessageEditor
            template={settings.membershipCanceled.template}
            onChange={handleMembershipCanceledChange}
            messageType="email"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="email"
              template={{
                name: 'Membership Canceled',
                content: settings.membershipCanceled.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Additional Variables Available:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><code className="bg-white px-2 py-0.5 rounded">{'{membershipName}'}</code> - Membership tier name</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{cancellationDate}'}</code> - Date of cancellation</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{expirationDate}'}</code> - Benefits end date</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{reactivationLink}'}</code> - Link to reactivate</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{remainingCredits}'}</code> - Unused membership credits</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{phoneNumber}'}</code> - Clinic phone number</div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Win-Back Strategy</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Keep the door open - members may want to return later</li>
                  <li>Mention any benefits that remain active through the paid period</li>
                  <li>Make reactivation easy with a direct link</li>
                  <li>Consider following up in 30-60 days with a special offer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </MessageCard>
      </div>

      {/* Help Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-purple-900 mb-3">About Membership Messages</h3>
        <div className="space-y-2 text-sm text-purple-800">
          <p>
            <strong>Welcome Messages:</strong> Set the tone for the member experience. Clearly communicate benefits and how to use them.
          </p>
          <p>
            <strong>Renewal Reminders:</strong> Transparent communication about upcoming charges reduces payment failures and builds trust.
          </p>
          <p>
            <strong>Payment Issues:</strong> Quick notification and easy resolution options help retain members who encounter payment problems.
          </p>
          <p>
            <strong>Cancellations:</strong> Professional cancellation confirmations maintain goodwill and leave the door open for future reactivation.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          Save Changes
        </button>
      </div>
    </div>
  )
}
