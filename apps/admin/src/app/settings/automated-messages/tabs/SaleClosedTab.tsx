'use client'

import { useState } from 'react'
import { MessageCard } from '../components/MessageCard'
import MessageEditor, { MessageTemplate } from '../components/MessageEditor'
import TestSendButton from '../components/TestSendButton'
import { Mail, MessageSquare, Star, FileText, Clock } from 'lucide-react'

interface SaleClosedSettings {
  thankYouEmail: {
    enabled: boolean
    template: MessageTemplate
  }
  thankYouSMS: {
    enabled: boolean
    template: MessageTemplate
  }
  reviewRequest: {
    enabled: boolean
    template: MessageTemplate
    delayAmount: number
    delayUnit: 'hours' | 'days'
    googleReviewLink: string
    yelpReviewLink: string
  }
  postCareInstructions: {
    enabled: boolean
    sendWhenTreatmentPerformed: boolean
    template: MessageTemplate
  }
}

export default function SaleClosedTab() {
  // Master toggle for entire tab
  const [masterEnabled, setMasterEnabled] = useState(true);

  // Accordion state - track which card is expanded
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const [settings, setSettings] = useState<SaleClosedSettings>({
    thankYouEmail: {
      enabled: true,
      template: {
        subject: 'Thank you for visiting {locationName}!',
        body: 'Hi {firstName},\n\nThank you for choosing {locationName} for your beauty and wellness needs! We hope you had a wonderful experience.\n\nYour receipt is available here: {receiptLink}\n\nIf you have any questions about your treatment or products, please don\'t hesitate to reach out.\n\nWe look forward to seeing you again soon!\n\nWarm regards,\nThe {locationName} Team',
        variables: ['{firstName}', '{locationName}', '{receiptLink}']
      }
    },
    thankYouSMS: {
      enabled: true,
      template: {
        body: 'Hi {firstName}! Thanks for visiting {locationName} today! Your receipt: {receiptLink}. Questions? Reply here anytime!',
        variables: ['{firstName}', '{locationName}', '{receiptLink}']
      }
    },
    reviewRequest: {
      enabled: false,
      template: {
        body: 'Hi {firstName}! We hope you\'re loving your results from {locationName}! Would you mind sharing your experience? Review us here: {reviewLink}\n\nYour feedback helps us and future clients. Thank you!',
        variables: ['{firstName}', '{locationName}', '{reviewLink}']
      },
      delayAmount: 24,
      delayUnit: 'hours',
      googleReviewLink: '',
      yelpReviewLink: ''
    },
    postCareInstructions: {
      enabled: true,
      sendWhenTreatmentPerformed: true,
      template: {
        body: 'Hi {firstName}! Here are your post-care instructions for {serviceName}: {careInstructionsLink}\n\nFollow these carefully for best results. Questions? Reply here!',
        variables: ['{firstName}', '{serviceName}', '{careInstructionsLink}']
      }
    }
  })

  const handleThankYouEmailToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      thankYouEmail: { ...prev.thankYouEmail, enabled }
    }))
  }

  const handleThankYouEmailChange = (template: MessageTemplate) => {
    setSettings(prev => ({
      ...prev,
      thankYouEmail: { ...prev.thankYouEmail, template }
    }))
  }

  const handleThankYouSMSToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      thankYouSMS: { ...prev.thankYouSMS, enabled }
    }))
  }

  const handleThankYouSMSChange = (template: MessageTemplate) => {
    setSettings(prev => ({
      ...prev,
      thankYouSMS: { ...prev.thankYouSMS, template }
    }))
  }

  const handleReviewRequestToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      reviewRequest: { ...prev.reviewRequest, enabled }
    }))
  }

  const handleReviewRequestChange = (template: MessageTemplate) => {
    setSettings(prev => ({
      ...prev,
      reviewRequest: { ...prev.reviewRequest, template }
    }))
  }

  const handlePostCareToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      postCareInstructions: { ...prev.postCareInstructions, enabled }
    }))
  }

  const handlePostCareChange = (template: MessageTemplate) => {
    setSettings(prev => ({
      ...prev,
      postCareInstructions: { ...prev.postCareInstructions, template }
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
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Star className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">Sale Closed Messages</h2>
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
              Configure automated messages sent after checkout, including thank you notes, review requests, and post-care instructions.
              Build lasting relationships and encourage great results.
            </p>
            {!masterEnabled && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  All sale closed messages are currently disabled. Enable this setting to activate automated messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content wrapper with disabled state */}
      <div className={masterEnabled ? '' : 'opacity-50 pointer-events-none'}>
      {/* Thank You Email */}
      <MessageCard
        id="thank-you-email"
        title="Thank You Email"
        description="Sent immediately after checkout with receipt link and customizable message"
        enabled={settings.thankYouEmail.enabled}
        onToggle={handleThankYouEmailToggle}
        channels={{ email: true, sms: false }}
        isExpanded={expandedCard === 'thank-you-email'}
        onExpand={setExpandedCard}
        summary="Sent immediately after checkout"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">When this sends</p>
              <p>Automatically sent immediately after checkout is completed. Includes a link to the digital receipt.</p>
            </div>
          </div>

          <MessageEditor
            template={settings.thankYouEmail.template}
            onChange={handleThankYouEmailChange}
            messageType="email"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="email"
              template={{
                name: 'Thank You Email',
                content: settings.thankYouEmail.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Additional Variables Available:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><code className="bg-white px-2 py-0.5 rounded">{'{receiptLink}'}</code> - Link to digital receipt</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{totalAmount}'}</code> - Total purchase amount</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{servicesPerformed}'}</code> - List of services</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{productsPurchased}'}</code> - List of products</div>
            </div>
          </div>
        </div>
      </MessageCard>

      {/* Thank You SMS */}
      <MessageCard
        id="thank-you-sms"
        title="Thank You SMS"
        description="Shorter version sent via text message after checkout"
        enabled={settings.thankYouSMS.enabled}
        onToggle={handleThankYouSMSToggle}
        channels={{ sms: true, email: false }}
        isExpanded={expandedCard === 'thank-you-sms'}
        onExpand={setExpandedCard}
        summary="Sent immediately after checkout"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">When this sends</p>
              <p>Sent immediately after checkout. Keep it short and include the receipt link for easy access on mobile.</p>
            </div>
          </div>

          <MessageEditor
            template={settings.thankYouSMS.template}
            onChange={handleThankYouSMSChange}
            messageType="sms"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="sms"
              template={{
                name: 'Thank You SMS',
                content: settings.thankYouSMS.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Additional Variables Available:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><code className="bg-white px-2 py-0.5 rounded">{'{receiptLink}'}</code> - Link to digital receipt</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{totalAmount}'}</code> - Total amount</div>
            </div>
          </div>
        </div>
      </MessageCard>

      {/* Review Request */}
      <MessageCard
        id="review-request"
        title="Review Request"
        description="Optional request sent after a delay asking patients to review on Google or Yelp"
        enabled={settings.reviewRequest.enabled}
        onToggle={handleReviewRequestToggle}
        channels={{ sms: true, email: false }}
        isExpanded={expandedCard === 'review-request'}
        onExpand={setExpandedCard}
        summary={`Sent ${settings.reviewRequest.delayAmount} ${settings.reviewRequest.delayUnit} after checkout`}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Star className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-purple-800">
              <p className="font-medium mb-1">Best Practice</p>
              <p>Wait 24-48 hours after service so patients can see initial results. Great reviews come from happy patients who've experienced the benefits!</p>
            </div>
          </div>

          {/* Timing Configuration */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Clock className="inline h-4 w-4 mr-1" />
              Send Delay
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Send review request</span>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.reviewRequest.delayAmount}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  reviewRequest: {
                    ...prev.reviewRequest,
                    delayAmount: parseInt(e.target.value) || 1
                  }
                }))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={settings.reviewRequest.delayUnit}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  reviewRequest: {
                    ...prev.reviewRequest,
                    delayUnit: e.target.value as 'hours' | 'days'
                  }
                }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="hours">hours</option>
                <option value="days">days</option>
              </select>
              <span className="text-sm text-gray-600">after checkout</span>
            </div>
          </div>

          {/* Review Links */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Review Link
              </label>
              <input
                type="url"
                value={settings.reviewRequest.googleReviewLink}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  reviewRequest: {
                    ...prev.reviewRequest,
                    googleReviewLink: e.target.value
                  }
                }))}
                placeholder="https://g.page/your-business/review"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your Google review link from your Google Business Profile
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yelp Review Link
              </label>
              <input
                type="url"
                value={settings.reviewRequest.yelpReviewLink}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  reviewRequest: {
                    ...prev.reviewRequest,
                    yelpReviewLink: e.target.value
                  }
                }))}
                placeholder="https://www.yelp.com/writeareview/biz/your-business-id"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Find your Yelp review link on your business page
              </p>
            </div>
          </div>

          <MessageEditor
            template={settings.reviewRequest.template}
            onChange={handleReviewRequestChange}
            messageType="sms"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="sms"
              template={{
                name: 'Review Request',
                content: settings.reviewRequest.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Additional Variables Available:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><code className="bg-white px-2 py-0.5 rounded">{'{reviewLink}'}</code> - Smart link (Google or Yelp)</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{googleReviewLink}'}</code> - Google review URL</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{yelpReviewLink}'}</code> - Yelp review URL</div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-start gap-2">
              <Star className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">Review Request Tips</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Only send to patients who had a positive experience</li>
                  <li>Make it easy with a direct link</li>
                  <li>Personalize the message</li>
                  <li>Don't send too frequently to the same patient</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </MessageCard>

      {/* Post-Care Instructions */}
      <MessageCard
        id="post-care"
        title="Post-Care Instructions"
        description="Send treatment-specific aftercare instructions when a treatment is performed"
        enabled={settings.postCareInstructions.enabled}
        onToggle={handlePostCareToggle}
        channels={{ sms: true, email: false }}
        isExpanded={expandedCard === 'post-care'}
        onExpand={setExpandedCard}
        summary={settings.postCareInstructions.sendWhenTreatmentPerformed ? "Sent when treatment performed" : "Sent for all sales"}
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <FileText className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Links to Prep Reminders System</p>
              <p>This uses the same care instructions configured in Settings → Prep Reminders. The system automatically selects the appropriate instructions based on the treatment performed.</p>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={settings.postCareInstructions.sendWhenTreatmentPerformed}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  postCareInstructions: {
                    ...prev.postCareInstructions,
                    sendWhenTreatmentPerformed: e.target.checked
                  }
                }))}
                className="mt-0.5 h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Only send when treatment is performed</div>
                <div className="text-sm text-gray-500 mt-1">
                  Skip sending post-care instructions if the sale only includes products (no services/treatments)
                </div>
              </div>
            </label>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">
                <span className="font-medium">How it works:</span>
              </p>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                <li>Patient checks out after a treatment</li>
                <li>System identifies which treatments were performed</li>
                <li>Looks up post-care instructions from your Prep Reminders settings</li>
                <li>Sends appropriate care instructions automatically</li>
              </ol>
            </div>
          </div>

          <MessageEditor
            template={settings.postCareInstructions.template}
            onChange={handlePostCareChange}
            messageType="sms"
          />

          {/* Test Send Button */}
          <div className="mt-4 flex justify-end">
            <TestSendButton
              messageType="sms"
              template={{
                name: 'Post-Care Instructions',
                content: settings.postCareInstructions.template.body
              }}
              onSend={handleTestSend}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Additional Variables Available:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><code className="bg-white px-2 py-0.5 rounded">{'{careInstructionsLink}'}</code> - Link to care instructions</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{serviceName}'}</code> - Name of treatment</div>
              <div><code className="bg-white px-2 py-0.5 rounded">{'{providerName}'}</code> - Provider who performed treatment</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Manage Post-Care Instructions</h4>
              <a
                href="/settings/prep-reminders"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Go to Prep Reminders Settings →
              </a>
            </div>
            <p className="text-sm text-gray-600">
              Configure treatment-specific post-care instructions, timing, and content in the Prep Reminders settings page.
            </p>
          </div>
        </div>
      </MessageCard>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-3">About Post-Checkout Messages</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>Thank You Messages:</strong> Show appreciation and provide easy access to receipts. This is great for customer service and record-keeping.
          </p>
          <p>
            <strong>Review Requests:</strong> Happy patients are your best marketing! Reviews help build trust with potential new patients. Time your requests carefully for best results.
          </p>
          <p>
            <strong>Post-Care Instructions:</strong> Proper aftercare leads to better outcomes and happier patients. Automated instructions ensure patients never miss important care steps.
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
