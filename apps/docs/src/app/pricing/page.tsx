import { Callout } from '@/components/docs/Callout'
import { ComparisonTable } from '@/components/docs/ComparisonTable'
import Link from 'next/link'
import { Tag, Check, Zap, Building, Crown, MessageCircle, HelpCircle } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Tag className="w-6 h-6 text-primary-600" />
        </div>
      </div>
      <h1>Pricing</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Simple, transparent pricing. No hidden fees, no long-term contracts.
        Pay for what you use.
      </p>

      <Callout type="info" title="Early Access Pricing">
        Luxe MedSpa is currently in development. Early adopters get special pricing and lifetime
        discounts. <Link href="/support">Contact us</Link> to learn more.
      </Callout>

      {/* Pricing Cards */}
      <div className="not-prose grid md:grid-cols-3 gap-6 my-12">
        {/* Starter */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-lg text-gray-900">Starter</h3>
          </div>
          <div className="mb-4">
            <span className="text-4xl font-bold text-gray-900">$99</span>
            <span className="text-gray-500">/month</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">Perfect for solo practitioners and small practices.</p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>1 provider</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Unlimited appointments</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Patient management</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Basic SMS reminders</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Reports & analytics</span>
            </li>
          </ul>
          <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Get Started
          </button>
        </div>

        {/* Professional */}
        <div className="bg-white rounded-xl border-2 border-primary-500 p-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Most Popular
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-lg text-gray-900">Professional</h3>
          </div>
          <div className="mb-4">
            <span className="text-4xl font-bold text-gray-900">$199</span>
            <span className="text-gray-500">/month</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">For growing practices with multiple providers.</p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Up to 5 providers</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Everything in Starter</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Two-way SMS messaging</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Express booking</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Group booking</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Treatment series</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Virtual waiting room</span>
            </li>
          </ul>
          <button className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors">
            Get Started
          </button>
        </div>

        {/* Enterprise */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-600" />
            <h3 className="font-bold text-lg text-gray-900">Enterprise</h3>
          </div>
          <div className="mb-4">
            <span className="text-4xl font-bold text-gray-900">Custom</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">For multi-location practices and franchises.</p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Unlimited providers</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Everything in Professional</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Multiple locations</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>API access</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Custom integrations</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Dedicated support</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>SLA guarantee</span>
            </li>
          </ul>
          <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>

      <h2 id="add-ons">Add-Ons</h2>
      <p>
        Some features are available as optional add-ons:
      </p>

      <div className="not-prose overflow-x-auto mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Add-On</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium">Additional providers</td>
              <td className="py-3 px-4 text-right">$25/mo each</td>
              <td className="py-3 px-4 text-gray-600">Add more providers beyond your plan limit</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-3 px-4 font-medium">SMS Marketing</td>
              <td className="py-3 px-4 text-right">$50/mo + usage</td>
              <td className="py-3 px-4 text-gray-600">Promotional campaigns and bulk messaging</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium">Advanced Charting</td>
              <td className="py-3 px-4 text-right">$30/mo</td>
              <td className="py-3 px-4 text-gray-600">Injectable tracking, SOAP notes, photo documentation</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-3 px-4 font-medium">AI Features</td>
              <td className="py-3 px-4 text-right">Coming soon</td>
              <td className="py-3 px-4 text-gray-600">Smart replies, voice dictation, automated scheduling</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="usage-costs">Usage-Based Costs</h2>
      <p>
        Some features have usage-based pricing through our integration partners:
      </p>

      <h3 id="sms-costs">SMS Messaging (via Twilio)</h3>
      <ul>
        <li><strong>Outbound SMS</strong>: ~$0.0079 per message</li>
        <li><strong>Inbound SMS</strong>: ~$0.0079 per message</li>
        <li><strong>Phone number</strong>: ~$1/month</li>
      </ul>
      <p>
        Typical cost for a practice sending 500 messages/month: <strong>$8-10/month</strong>
      </p>

      <h3 id="payment-costs">Payment Processing (via Stripe)</h3>
      <ul>
        <li><strong>Card payments</strong>: 2.9% + $0.30 per transaction</li>
        <li><strong>No monthly fee</strong> from Luxe MedSpa for payment processing</li>
      </ul>

      <Callout type="tip" title="Much Lower Than Competitors">
        Mangomint charges $75/month for two-way SMS alone. With our usage-based model, you&apos;ll
        typically pay 80-90% less for the same functionality.
      </Callout>

      <h2 id="comparison">Competitor Comparison</h2>
      <p>
        See how our pricing compares to other MedSpa platforms:
      </p>

      <ComparisonTable
        showCompetitors
        rows={[
          { feature: 'Starting Price', luxe: '$99/mo', mangomint: '$165/mo', boulevard: '$175/mo', jane: '$79/mo' },
          { feature: 'Two-Way SMS', luxe: 'Included', mangomint: '+$75/mo', boulevard: '+$25/mo', jane: 'In-app only' },
          { feature: 'Payment Processing', luxe: '2.9% + $0.30', mangomint: '2.7% + $0.05', boulevard: '2.6% + $0.10', jane: '2.7% + $0.05' },
          { feature: 'Express Booking', luxe: true, mangomint: true, boulevard: true, jane: false },
          { feature: 'Group Booking', luxe: true, mangomint: true, boulevard: 'partial', jane: false },
          { feature: 'Virtual Waiting Room', luxe: true, mangomint: false, boulevard: false, jane: false },
          { feature: 'Setup Fee', luxe: '$0', mangomint: '$0', boulevard: 'Custom', jane: '$0' },
        ]}
      />

      <h2 id="faq">Pricing FAQ</h2>

      <h3>Is there a setup fee?</h3>
      <p>
        No. Setup is free and you can start using the platform immediately after signing up.
      </p>

      <h3>Are there long-term contracts?</h3>
      <p>
        No. All plans are month-to-month. You can cancel anytime with no penalty.
      </p>

      <h3>What payment methods do you accept?</h3>
      <p>
        We accept all major credit cards. Annual plans can be paid by invoice.
      </p>

      <h3>Do you offer a free trial?</h3>
      <p>
        Yes! All plans include a 14-day free trial with full access to features.
      </p>

      <h3>What happens to my data if I cancel?</h3>
      <p>
        You can export all your data at any time. After cancellation, data is retained for 30 days
        in case you want to reactivate, then permanently deleted.
      </p>

      <h2 id="contact">Questions?</h2>
      <div className="not-prose grid md:grid-cols-2 gap-4">
        <Link href="/support" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all flex gap-3">
          <MessageCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Contact Support</h3>
            <p className="text-sm text-gray-500">Get help with pricing questions</p>
          </div>
        </Link>
        <Link href="/guides/faq" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all flex gap-3">
          <HelpCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">FAQ</h3>
            <p className="text-sm text-gray-500">Common questions answered</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
