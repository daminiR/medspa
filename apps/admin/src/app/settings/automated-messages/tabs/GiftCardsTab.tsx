'use client'

import { useState } from 'react'
import { MessageCard } from '../components/MessageCard'
import MessageEditor, { MessageTemplate } from '../components/MessageEditor'
import TestSendButton from '../components/TestSendButton'
import { Gift, CreditCard, CheckCircle, Clock } from 'lucide-react'

interface GiftCardMessageConfigs {
  buyerReceipt: {
    enabled: boolean
    channels: { sms: boolean; email: boolean }
    template: MessageTemplate
  }
  recipientNotification: {
    enabled: boolean
    channels: { sms: boolean; email: boolean }
    template: MessageTemplate
  }
  redemptionNotification: {
    enabled: boolean
    channels: { sms: boolean; email: boolean }
    template: MessageTemplate
  }
  expirationReminder: {
    enabled: boolean
    channels: { sms: boolean; email: boolean }
    daysBeforeExpiration: number
    template: MessageTemplate
  }
}

export function GiftCardsTab() {
  // Master toggle for entire tab
  const [masterEnabled, setMasterEnabled] = useState(true);

  const [configs, setConfigs] = useState<GiftCardMessageConfigs>({
    buyerReceipt: {
      enabled: true,
      channels: { sms: false, email: true },
      template: {
        subject: 'Gift Card Purchase Confirmation',
        body: 'Hi {firstName},\n\nThank you for purchasing a gift card from {locationName}!\n\nGift Card Details:\n- Amount: ${giftCardAmount}\n- Code: {giftCardCode}\n- Recipient: {recipientName}\n\nYour gift card has been sent to the recipient. They can use code {giftCardCode} to redeem their gift.\n\nThank you for sharing the gift of beauty and wellness!',
        variables: ['{firstName}', '{locationName}', '{giftCardAmount}', '{giftCardCode}', '{recipientName}']
      }
    },
    recipientNotification: {
      enabled: true,
      channels: { sms: true, email: true },
      template: {
        subject: 'You Received a Gift Card!',
        body: 'Hi {recipientName},\n\nGreat news! {buyerName} sent you a gift card to {locationName}!\n\nGift Card Details:\n- Amount: ${giftCardAmount}\n- Code: {giftCardCode}\n- Valid until: {expirationDate}\n\nHow to Redeem:\n1. Book your appointment online or call us at {clinicPhone}\n2. Provide code {giftCardCode} at checkout\n3. Enjoy your treatment!\n\nWe look forward to pampering you!',
        variables: ['{recipientName}', '{buyerName}', '{locationName}', '{giftCardAmount}', '{giftCardCode}', '{expirationDate}', '{clinicPhone}']
      }
    },
    redemptionNotification: {
      enabled: false,
      channels: { sms: false, email: true },
      template: {
        subject: 'Your Gift Card Was Redeemed',
        body: 'Hi {buyerName},\n\nWe wanted to let you know that {recipientName} redeemed the gift card you sent them!\n\nRedemption Details:\n- Amount Used: ${amountRedeemed}\n- Service: {serviceName}\n- Date: {redemptionDate}\n\nRemaining Balance: ${remainingBalance}\n\nThank you for sharing the gift of {locationName}!',
        variables: ['{buyerName}', '{recipientName}', '{amountRedeemed}', '{serviceName}', '{redemptionDate}', '{remainingBalance}', '{locationName}']
      }
    },
    expirationReminder: {
      enabled: true,
      channels: { sms: true, email: true },
      daysBeforeExpiration: 30,
      template: {
        subject: 'Gift Card Expiring Soon',
        body: 'Hi {recipientName},\n\nReminder: Your gift card from {locationName} will expire in {daysUntilExpiration} days!\n\nGift Card Details:\n- Code: {giftCardCode}\n- Balance: ${remainingBalance}\n- Expires: {expirationDate}\n\nDon\'t miss out! Book your appointment today to use your gift card.\n\nCall us at {clinicPhone} or book online.',
        variables: ['{recipientName}', '{locationName}', '{daysUntilExpiration}', '{giftCardCode}', '{remainingBalance}', '{expirationDate}', '{clinicPhone}']
      }
    }
  })

  // Update handlers for each section
  const updateBuyerReceipt = (field: 'enabled' | 'template', value: boolean | MessageTemplate) => {
    setConfigs(prev => ({
      ...prev,
      buyerReceipt: {
        ...prev.buyerReceipt,
        [field]: value
      }
    }))
  }

  const updateRecipientNotification = (field: 'enabled' | 'template', value: boolean | MessageTemplate) => {
    setConfigs(prev => ({
      ...prev,
      recipientNotification: {
        ...prev.recipientNotification,
        [field]: value
      }
    }))
  }

  const updateRedemptionNotification = (field: 'enabled' | 'template', value: boolean | MessageTemplate) => {
    setConfigs(prev => ({
      ...prev,
      redemptionNotification: {
        ...prev.redemptionNotification,
        [field]: value
      }
    }))
  }

  const updateExpirationReminder = (field: 'enabled' | 'template' | 'daysBeforeExpiration', value: boolean | MessageTemplate | number) => {
    setConfigs(prev => ({
      ...prev,
      expirationReminder: {
        ...prev.expirationReminder,
        [field]: value
      }
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
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-pink-100 rounded-lg">
            <Gift className="h-6 w-6 text-pink-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">Gift Card Messages</h2>
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
              Configure automated messages for gift card purchases, recipient notifications, redemption updates, and expiration reminders.
              These messages help both the purchaser and recipient stay informed throughout the gift card lifecycle.
            </p>
            {!masterEnabled && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  All gift card messages are currently disabled. Enable this setting to activate automated messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content wrapper with disabled state */}
      <div className={masterEnabled ? '' : 'opacity-50 pointer-events-none'}>
      {/* Section 1: Buyer Receipt */}
      <MessageCard
        title="Buyer Receipt"
        description="Email sent to purchaser confirming their gift card purchase"
        enabled={configs.buyerReceipt.enabled}
        onToggle={(enabled) => updateBuyerReceipt('enabled', enabled)}
        channels={configs.buyerReceipt.channels}
        defaultExpanded={true}
      >
        <div className="space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">When This Message Sends</p>
                <p className="text-blue-700">
                  Sent immediately after a gift card purchase is completed. Includes confirmation details, gift card code, amount, and recipient information.
                </p>
              </div>
            </div>
          </div>

          {/* Message Editor */}
          <MessageEditor
            template={configs.buyerReceipt.template}
            onChange={(template) => updateBuyerReceipt('template', template)}
            messageType="email"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="email"
              template={{
                name: 'Gift Card Buyer Receipt',
                content: configs.buyerReceipt.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          {/* Additional Variables Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Gift Card Variables</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><code className="bg-gray-200 px-1 rounded">{'{giftCardAmount}'}</code> - Dollar amount of the gift card</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{giftCardCode}'}</code> - Unique redemption code</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{recipientName}'}</code> - Name of the gift card recipient</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{buyerName}'}</code> - Name of the gift card purchaser</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{expirationDate}'}</code> - When the gift card expires (if applicable)</p>
            </div>
          </div>
        </div>
      </MessageCard>

      {/* Section 2: Recipient Notification */}
      <MessageCard
        title="Recipient Notification"
        description="Message sent to gift card recipient with card details and redemption instructions"
        enabled={configs.recipientNotification.enabled}
        onToggle={(enabled) => updateRecipientNotification('enabled', enabled)}
        channels={configs.recipientNotification.channels}
        defaultExpanded={false}
      >
        <div className="space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">When This Message Sends</p>
                <p className="text-blue-700">
                  Sent to the recipient when a gift card is purchased for them. Includes the gift card amount, redemption code, how to redeem, and expiration date (if applicable).
                </p>
              </div>
            </div>
          </div>

          {/* Message Editor */}
          <MessageEditor
            template={configs.recipientNotification.template}
            onChange={(template) => updateRecipientNotification('template', template)}
            messageType="email"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="email"
              template={{
                name: 'Gift Card Recipient Notification',
                content: configs.recipientNotification.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          {/* Redemption Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">Redemption Instructions</h4>
            <p className="text-xs text-green-700">
              Make sure to include clear instructions on how to redeem the gift card (booking online, calling, or in-person).
              Include your clinic phone number and any booking links to make it easy for recipients to use their gift.
            </p>
          </div>

          {/* Additional Variables Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Available Variables</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><code className="bg-gray-200 px-1 rounded">{'{recipientName}'}</code> - Name of the person receiving the gift</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{buyerName}'}</code> - Name of the person who sent the gift</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{giftCardAmount}'}</code> - Dollar amount</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{giftCardCode}'}</code> - Redemption code</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{clinicPhone}'}</code> - Your clinic phone number</p>
            </div>
          </div>
        </div>
      </MessageCard>

      {/* Section 3: Redemption Notification */}
      <MessageCard
        title="Redemption Notification (Optional)"
        description="Optional email to buyer when recipient redeems their gift card"
        enabled={configs.redemptionNotification.enabled}
        onToggle={(enabled) => updateRedemptionNotification('enabled', enabled)}
        channels={configs.redemptionNotification.channels}
        defaultExpanded={false}
      >
        <div className="space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">When This Message Sends</p>
                <p className="text-blue-700">
                  Sent to the original purchaser when the recipient redeems their gift card. This is optional but can create a nice connection between the gift giver and recipient.
                </p>
              </div>
            </div>
          </div>

          {/* Message Editor */}
          <MessageEditor
            template={configs.redemptionNotification.template}
            onChange={(template) => updateRedemptionNotification('template', template)}
            messageType="email"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="email"
              template={{
                name: 'Gift Card Redemption Notification',
                content: configs.redemptionNotification.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          {/* Privacy Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-amber-900 mb-2">Privacy Consideration</h4>
            <p className="text-xs text-amber-700">
              Some recipients may prefer their redemption to remain private. Consider making this notification opt-in during the gift card purchase process.
            </p>
          </div>

          {/* Additional Variables Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Redemption Variables</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><code className="bg-gray-200 px-1 rounded">{'{amountRedeemed}'}</code> - Amount used in this transaction</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{serviceName}'}</code> - Service the recipient redeemed it for</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{redemptionDate}'}</code> - When it was redeemed</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{remainingBalance}'}</code> - Remaining balance on the card</p>
            </div>
          </div>
        </div>
      </MessageCard>

      {/* Section 4: Expiration Reminder */}
      <MessageCard
        title="Expiration Reminder"
        description="Reminder sent to recipient before their gift card expires"
        enabled={configs.expirationReminder.enabled}
        onToggle={(enabled) => updateExpirationReminder('enabled', enabled)}
        channels={configs.expirationReminder.channels}
        defaultExpanded={false}
      >
        <div className="space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">When This Message Sends</p>
                <p className="text-blue-700">
                  Sent to the gift card recipient a specified number of days before the card expires. Helps ensure they don't lose the value of their gift.
                </p>
              </div>
            </div>
          </div>

          {/* Days Before Expiration Setting */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Send Reminder How Many Days Before Expiration?
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max="365"
                value={configs.expirationReminder.daysBeforeExpiration}
                onChange={(e) => updateExpirationReminder('daysBeforeExpiration', parseInt(e.target.value) || 30)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-600">days before expiration</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Recommended: 30 days. This gives recipients enough time to schedule an appointment before their gift card expires.
            </p>
          </div>

          {/* Message Editor */}
          <MessageEditor
            template={configs.expirationReminder.template}
            onChange={(template) => updateExpirationReminder('template', template)}
            messageType="email"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="email"
              template={{
                name: 'Gift Card Expiration Reminder',
                content: configs.expirationReminder.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          {/* Best Practices */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">Best Practices</h4>
            <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
              <li>Include the remaining balance and expiration date clearly</li>
              <li>Provide easy booking options (phone number, online link)</li>
              <li>Create urgency but keep the tone friendly and helpful</li>
              <li>Consider sending multiple reminders (e.g., 30 days, 7 days, 1 day before)</li>
            </ul>
          </div>

          {/* Additional Variables Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Expiration Variables</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><code className="bg-gray-200 px-1 rounded">{'{daysUntilExpiration}'}</code> - Number of days until the card expires</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{expirationDate}'}</code> - Actual expiration date</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{remainingBalance}'}</code> - Current balance on the card</p>
              <p><code className="bg-gray-200 px-1 rounded">{'{giftCardCode}'}</code> - Redemption code</p>
            </div>
          </div>
        </div>
      </MessageCard>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3">Active Gift Card Messages Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg border ${configs.buyerReceipt.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className={`h-4 w-4 ${configs.buyerReceipt.enabled ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${configs.buyerReceipt.enabled ? 'text-green-900' : 'text-gray-500'}`}>
                Buyer Receipt
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {configs.buyerReceipt.enabled ? 'Active - Email' : 'Disabled'}
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${configs.recipientNotification.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Gift className={`h-4 w-4 ${configs.recipientNotification.enabled ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${configs.recipientNotification.enabled ? 'text-green-900' : 'text-gray-500'}`}>
                Recipient Notification
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {configs.recipientNotification.enabled ? 'Active - SMS & Email' : 'Disabled'}
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${configs.redemptionNotification.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className={`h-4 w-4 ${configs.redemptionNotification.enabled ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${configs.redemptionNotification.enabled ? 'text-green-900' : 'text-gray-500'}`}>
                Redemption Notification
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {configs.redemptionNotification.enabled ? 'Active - Email' : 'Disabled'}
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${configs.expirationReminder.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Clock className={`h-4 w-4 ${configs.expirationReminder.enabled ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${configs.expirationReminder.enabled ? 'text-green-900' : 'text-gray-500'}`}>
                Expiration Reminder
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {configs.expirationReminder.enabled ? `Active - ${configs.expirationReminder.daysBeforeExpiration} days before` : 'Disabled'}
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Save Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  )
}
