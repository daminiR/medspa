'use client';

import { Send, Users, TrendingUp, Clock, Shield, CheckCircle2, AlertCircle, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Callout } from '@/components/docs/Callout';
import { StepList } from '@/components/docs/StepList';
import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder';

export default function CampaignsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Send className="w-8 h-8 text-indigo-600" />
        <h1 className="text-4xl font-bold">SMS Marketing Campaigns</h1>
        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
          NEW
        </span>
      </div>

      <p className="text-lg text-gray-700 mb-6">
        Create and send targeted SMS marketing campaigns to your patients. Promote services,
        announce specials, and re-engage inactive patients &mdash; all with built-in TCPA compliance.
      </p>

      {/* Video Tutorial */}
      <VideoPlaceholder
        title="Creating Your First SMS Campaign"
        duration="6:15"
      />

      <Callout type="warning" title="Marketing Consent Required">
        Marketing SMS requires explicit written consent from patients (TCPA requirement).
        Only patients who have opted-in to marketing messages will receive campaigns.
        <Link href="/features/messaging/settings" className="text-blue-600 hover:underline ml-1">
          Manage consent settings →
        </Link>
      </Callout>

      {/* Key Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Campaign Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-indigo-50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">Audience Targeting</h3>
            </div>
            <p className="text-sm text-gray-700">
              Target specific patient groups: all patients, inactive patients, VIPs, or custom segments.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-indigo-50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">Scheduled Delivery</h3>
            </div>
            <p className="text-sm text-gray-700">
              Send immediately or schedule campaigns for optimal times (within TCPA hours).
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-indigo-50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">Performance Analytics</h3>
            </div>
            <p className="text-sm text-gray-700">
              Track delivery rates, opens, clicks, and opt-outs for every campaign.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-indigo-50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">Compliance Built-In</h3>
            </div>
            <p className="text-sm text-gray-700">
              Automatic consent checking, opt-out processing, and TCPA time restrictions.
            </p>
          </div>
        </div>
      </section>

      {/* Creating a Campaign */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Creating a Campaign</h2>

        <StepList
          steps={[
            {
              title: 'Go to Campaigns',
              description: 'Navigate to Messages → Campaigns from the sidebar, or click the "📣 Campaigns" button in your inbox.',
            },
            {
              title: 'Click "New Campaign"',
              description: 'Opens the campaign builder where you can configure your marketing message.',
            },
            {
              title: 'Name Your Campaign',
              description: 'Give your campaign a descriptive name (e.g., "December Holiday Special" or "Botox Flash Sale").',
            },
            {
              title: 'Select Your Audience',
              description: 'Choose who will receive this campaign. Only patients with marketing consent are included.',
            },
            {
              title: 'Compose Your Message',
              description: 'Write your promotional message. Keep it under 160 characters when possible.',
            },
            {
              title: 'Schedule or Send',
              description: 'Send immediately or pick a date/time. Messages only send between 8 AM - 9 PM.',
            },
          ]}
        />
      </section>

      {/* Audience Selection */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Audience Selection</h2>

        <p className="text-gray-700">
          Target your campaigns to specific patient groups for better engagement and relevance.
        </p>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Audience</th>
                <th className="text-left p-4 font-semibold text-gray-700">Description</th>
                <th className="text-center p-4 font-semibold text-gray-700">Patients</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4 font-medium">All Patients</td>
                <td className="p-4 text-gray-600">Everyone with marketing consent</td>
                <td className="p-4 text-center">1,234</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-4 font-medium">Last Visit &gt; 30 Days</td>
                <td className="p-4 text-gray-600">Patients who haven't visited in 30+ days</td>
                <td className="p-4 text-center">456</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Last Visit &gt; 90 Days</td>
                <td className="p-4 text-gray-600">Inactive patients needing re-engagement</td>
                <td className="p-4 text-center">189</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-4 font-medium">VIP Patients</td>
                <td className="p-4 text-gray-600">Top spenders and frequent visitors</td>
                <td className="p-4 text-center">87</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Custom Segment</td>
                <td className="p-4 text-gray-600">Patients matching specific criteria you define</td>
                <td className="p-4 text-center">Varies</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="info">
          The patient count shown is only those with marketing consent. Patients who have
          opted out of marketing messages are automatically excluded from all campaigns.
        </Callout>
      </section>

      {/* Consent Warning */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Consent & Compliance</h2>

        <p className="text-gray-700">
          Before sending any campaign, the system shows you exactly how many patients have
          marketing consent:
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Marketing Consent Status</h3>
              <p className="text-yellow-800 mb-3">
                Of your selected audience of <strong>456 patients</strong>:
              </p>
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span><strong>312</strong> have marketing consent and will receive this campaign</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span><strong>89</strong> have transactional consent only (excluded)</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span><strong>55</strong> have opted out of all SMS (excluded)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6">TCPA Compliance Features</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Automatic Consent Checking</span>
              <p className="text-sm text-gray-600">Only patients with written marketing consent receive campaigns</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Time Window Enforcement</span>
              <p className="text-sm text-gray-600">Messages only sent between 8 AM - 9 PM in patient's time zone</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Instant Opt-Out Processing</span>
              <p className="text-sm text-gray-600">STOP replies immediately remove patients from future campaigns</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Business Name Required</span>
              <p className="text-sm text-gray-600">All campaigns include your business name as required by TCPA</p>
            </div>
          </li>
        </ul>
      </section>

      {/* Credit System */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">SMS Credits</h2>

        <p className="text-gray-700">
          Marketing campaigns use SMS credits from your account. The campaign builder shows
          your credit balance and estimated usage.
        </p>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="font-semibold text-gray-900">SMS Credits</p>
                <p className="text-sm text-gray-600">Available for campaigns</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600">500</p>
              <p className="text-sm text-gray-500">credits remaining</p>
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-600">
              <strong>This campaign will use:</strong> ~312 credits (1 per recipient)
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Multi-segment messages (over 160 chars) use 2+ credits per recipient.
            </p>
          </div>
        </div>

        <Callout type="tip">
          Keep messages under 160 characters to use only 1 credit per message. Messages with
          emoji use 70-character segments and may cost more credits.
        </Callout>
      </section>

      {/* Campaign Status */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Campaign Status</h2>

        <p className="text-gray-700">
          Track your campaigns from creation through delivery:
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 border rounded-lg">
            <span className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded">
              Draft
            </span>
            <span className="text-gray-600">Campaign created but not yet scheduled or sent</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="px-3 py-1 text-sm font-medium bg-blue-200 text-blue-700 rounded">
              Scheduled
            </span>
            <span className="text-gray-600">Campaign set to send at a future date/time</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="px-3 py-1 text-sm font-medium bg-green-200 text-green-700 rounded">
              Sent
            </span>
            <span className="text-gray-600">Campaign successfully delivered to recipients</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="px-3 py-1 text-sm font-medium bg-red-200 text-red-700 rounded">
              Failed
            </span>
            <span className="text-gray-600">Campaign encountered errors during sending</span>
          </div>
        </div>
      </section>

      {/* Performance Tracking */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Performance Analytics</h2>

        <p className="text-gray-700">
          After sending, track how your campaign performed:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">312</p>
            <p className="text-sm text-gray-500">Sent</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">98.4%</p>
            <p className="text-sm text-gray-500">Delivered</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">12.3%</p>
            <p className="text-sm text-gray-500">Click Rate</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-600">0.6%</p>
            <p className="text-sm text-gray-500">Opt-outs</p>
          </div>
        </div>

        <Callout type="info">
          Click rate tracking requires a link in your message. Use our built-in URL shortener
          to track clicks while keeping messages short.
        </Callout>
      </section>

      {/* Campaign Templates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Campaign Ideas</h2>

        <p className="text-gray-700">
          Here are some effective campaign types for MedSpas:
        </p>

        <div className="space-y-4">
          <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded">
            <h4 className="font-semibold text-indigo-900 mb-2">Flash Sale</h4>
            <p className="text-sm text-indigo-800 font-mono bg-white p-2 rounded border border-indigo-200">
              "🎉 Flash Sale! 20% off Botox this week only at [Clinic]. Book now: [link]. Reply STOP to opt out."
            </p>
          </div>

          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-green-900 mb-2">Re-Engagement</h4>
            <p className="text-sm text-green-800 font-mono bg-white p-2 rounded border border-green-200">
              "We miss you! It's been a while. Here's $50 off your next visit at [Clinic]. Book: [link]. Reply STOP to opt out."
            </p>
          </div>

          <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
            <h4 className="font-semibold text-purple-900 mb-2">New Service Announcement</h4>
            <p className="text-sm text-purple-800 font-mono bg-white p-2 rounded border border-purple-200">
              "NEW! We now offer [Service] at [Clinic]. Be one of the first to try it! Book: [link]. Reply STOP to opt out."
            </p>
          </div>

          <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
            <h4 className="font-semibold text-amber-900 mb-2">VIP Exclusive</h4>
            <p className="text-sm text-amber-800 font-mono bg-white p-2 rounded border border-amber-200">
              "VIP Only: Early access to our holiday packages! 25% off until Friday. [Clinic]. Book: [link]. Reply STOP to opt out."
            </p>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Best Practices</h2>

        <div className="space-y-3">
          <div className="border rounded-lg p-4 bg-indigo-50">
            <h4 className="font-semibold text-indigo-900 mb-2">Keep It Short</h4>
            <p className="text-sm text-indigo-800">
              Aim for under 160 characters. Short messages have higher engagement and lower costs.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-indigo-50">
            <h4 className="font-semibold text-indigo-900 mb-2">Include a Clear CTA</h4>
            <p className="text-sm text-indigo-800">
              Tell patients exactly what to do: "Book now", "Call us", or "Reply YES".
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-indigo-50">
            <h4 className="font-semibold text-indigo-900 mb-2">Respect Frequency</h4>
            <p className="text-sm text-indigo-800">
              Don't over-message. 2-4 campaigns per month is ideal for most MedSpas.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-indigo-50">
            <h4 className="font-semibold text-indigo-900 mb-2">Always Include Opt-Out</h4>
            <p className="text-sm text-indigo-800">
              TCPA requires opt-out instructions. Include "Reply STOP to opt out" in every campaign.
            </p>
          </div>
        </div>
      </section>

      {/* Related Features */}
      <section className="space-y-4 pt-6 border-t mt-8">
        <h2 className="text-2xl font-semibold">Related Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/features/messaging/templates">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Message Templates</h3>
              <p className="text-sm text-gray-700">
                Create reusable templates for your campaigns
              </p>
            </div>
          </Link>

          <Link href="/features/messaging/settings">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">SMS Settings</h3>
              <p className="text-sm text-gray-700">
                Manage consent and staff permissions
              </p>
            </div>
          </Link>

          <Link href="/features/messaging/sms">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Two-Way SMS</h3>
              <p className="text-sm text-gray-700">
                Handle replies from campaign recipients
              </p>
            </div>
          </Link>

          <Link href="/features/messaging">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Messaging Overview</h3>
              <p className="text-sm text-gray-700">
                All messaging features at a glance
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
