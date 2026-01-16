import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import { ComparisonTable } from '@/components/docs/ComparisonTable'
import Link from 'next/link'
import { MessageCircle, Clock, Bell, Send, CheckCircle2, Zap, Shield, Sparkles, Settings, FileText, Users } from 'lucide-react'

export default function MessagingPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <MessageCircle className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 100% Complete
        </span>
      </div>
      <h1>Messaging & SMS</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Communicate with patients through two-way SMS messaging. Send appointment reminders,
        run marketing campaigns, and have real conversations &mdash; all from one unified inbox
        with AI-powered reply suggestions.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="SMS Messaging Overview"
        duration="4 min"
        description="Learn how to set up and use two-way SMS messaging with patients"
      />

      <Callout type="info" title="Twilio Integration Required">
        SMS messaging requires a Twilio account. See our <Link href="/integrations/twilio">Twilio Integration Guide</Link> to set up your account and get your dedicated business phone number.
      </Callout>

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Two-Way SMS</h3>
          </div>
          <p className="text-sm text-gray-500">Real conversations with patients. They can reply directly to your messages from their phone.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI Reply Suggestions</h3>
          </div>
          <p className="text-sm text-gray-500">Get 3 smart reply suggestions for each incoming message. Click to send instantly.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Auto Reminders</h3>
          </div>
          <p className="text-sm text-gray-500">Automatic appointment reminders at 48hr, 24hr, and 2hr before appointments.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Quick Replies</h3>
          </div>
          <p className="text-sm text-gray-500">Pre-saved message templates for common responses like directions and aftercare.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Marketing Campaigns</h3>
          </div>
          <p className="text-sm text-gray-500">Send promotional messages to patient segments with full TCPA compliance built-in.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">TCPA Compliant</h3>
          </div>
          <p className="text-sm text-gray-500">Built-in opt-out handling, consent tracking, and time-of-day restrictions.</p>
        </div>
      </div>

      <h2 id="two-way-sms">Two-Way SMS Messaging</h2>
      <p>
        Unlike basic reminder systems, Luxe MedSpa provides true two-way messaging. Patients can reply
        to any message and their response appears in your unified inbox. This enables:
      </p>
      <ul>
        <li><strong>Appointment confirmations</strong> &mdash; Patient replies &quot;C&quot; to confirm</li>
        <li><strong>Rescheduling requests</strong> &mdash; &quot;Can I move to Thursday instead?&quot;</li>
        <li><strong>Pre-appointment questions</strong> &mdash; &quot;Should I stop retinol before my peel?&quot;</li>
        <li><strong>Post-treatment concerns</strong> &mdash; &quot;Is this bruising normal?&quot;</li>
        <li><strong>General inquiries</strong> &mdash; &quot;What are your hours?&quot;</li>
      </ul>

      <Callout type="tip" title="Dedicated Business Number">
        You get a dedicated phone number for your practice. Patients text this number and it shows
        in your inbox &mdash; no more using personal phones for business texts.
      </Callout>

      <h2 id="ai-suggestions">AI Reply Suggestions</h2>
      <p>
        Our AI-powered reply system analyzes each incoming message and suggests 3 contextual responses.
        Simply click a suggestion to auto-fill your reply, then send. The AI detects:
      </p>
      <ul>
        <li><strong>Appointment-related messages</strong> &mdash; Suggestions for confirming, rescheduling, or providing directions</li>
        <li><strong>Medical concerns</strong> &mdash; Reassurance messages, when-to-call guidance, and aftercare tips</li>
        <li><strong>Questions</strong> &mdash; Helpful answers, offers to call, and booking suggestions</li>
        <li><strong>Thank you messages</strong> &mdash; Warm, professional responses</li>
      </ul>

      <Callout type="info" title="HIPAA Compliant AI">
        Our AI suggestions use local pattern matching &mdash; patient data never leaves your system.
        No PHI is sent to external AI services. Learn more in our <Link href="/features/messaging/ai-suggestions">AI Suggestions guide</Link>.
      </Callout>

      <h2 id="consent-tracking">Consent & Compliance</h2>
      <p>
        Every patient conversation displays their SMS consent status clearly:
      </p>
      <div className="not-prose my-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <span className="font-semibold text-green-900">SMS Enabled</span>
              <span className="text-sm text-green-700 ml-2">— Full consent for transactional and marketing messages</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <span className="font-semibold text-yellow-900">Transactional Only</span>
              <span className="text-sm text-yellow-700 ml-2">— Appointment reminders OK, no marketing</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Shield className="w-5 h-5 text-red-600" />
            <div>
              <span className="font-semibold text-red-900">Opted Out</span>
              <span className="text-sm text-red-700 ml-2">— Patient has unsubscribed from all SMS</span>
            </div>
          </div>
        </div>
      </div>

      <h2 id="auto-reminders">Appointment Reminders</h2>
      <p>
        Automated reminders are sent at configurable intervals before appointments:
      </p>

      <StepList steps={[
        {
          title: '48 Hours Before',
          description: 'Initial reminder with appointment details and confirmation request. Patient replies "C" to confirm.'
        },
        {
          title: '24 Hours Before',
          description: 'Follow-up reminder for unconfirmed appointments. Includes link to cancel/reschedule if needed.'
        },
        {
          title: '2 Hours Before',
          description: 'Day-of reminder with address, parking info, and any pre-appointment instructions.'
        }
      ]} />

      <h2 id="character-counter">Smart Character Counter</h2>
      <p>
        As you type, the character counter shows exactly how many SMS segments your message will use:
      </p>
      <ul>
        <li><strong>Standard messages</strong> &mdash; 160 characters per segment</li>
        <li><strong>Messages with emoji</strong> &mdash; 70 characters per segment (automatically detected)</li>
        <li><strong>Color coding</strong> &mdash; Green (1 segment), Yellow (2), Orange (3), Red (4+)</li>
      </ul>
      <p>
        This helps you keep messages concise and control SMS costs.
      </p>

      <h2 id="message-status">Message Delivery Status</h2>
      <p>
        Track exactly what happened to each message you send:
      </p>
      <div className="not-prose my-6 space-y-2">
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600"><strong>Queued</strong> — Message is waiting to be sent</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600"><strong>Sending</strong> — Message is being transmitted</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600"><strong>Sent</strong> — Message left our server</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-4 h-4 text-blue-500" />
          <span className="text-gray-600"><strong>Delivered</strong> — Message reached patient's phone</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500" />
          <span className="text-gray-600"><strong>Read</strong> — Patient opened the message</span>
        </div>
      </div>

      <h2 id="comparison">Feature Comparison</h2>
      <ComparisonTable
        showCompetitors
        rows={[
          { feature: 'Two-Way SMS', luxe: true, mangomint: '$75/mo', boulevard: true, jane: 'In-app only' },
          { feature: 'Auto Reminders', luxe: true, mangomint: true, boulevard: true, jane: true },
          { feature: 'Quick Replies', luxe: true, mangomint: true, boulevard: true, jane: false },
          { feature: 'Unified Inbox', luxe: true, mangomint: true, boulevard: true, jane: false },
          { feature: 'TCPA Compliance', luxe: true, mangomint: true, boulevard: true, jane: true },
          { feature: 'Dedicated Number', luxe: true, mangomint: true, boulevard: true, jane: false },
          { feature: 'AI Suggestions', luxe: true, mangomint: false, boulevard: false, jane: false },
          { feature: 'Marketing Campaigns', luxe: true, mangomint: true, boulevard: true, jane: false },
          { feature: 'Consent Tracking', luxe: true, mangomint: true, boulevard: true, jane: true },
        ]}
      />

      <h2 id="pricing">SMS Pricing</h2>
      <p>
        SMS pricing is usage-based through Twilio. Typical costs:
      </p>
      <ul>
        <li><strong>Outbound SMS</strong>: ~$0.0079 per message</li>
        <li><strong>Inbound SMS</strong>: ~$0.0079 per message</li>
        <li><strong>Phone number</strong>: ~$1/month</li>
      </ul>
      <p>
        For a typical MedSpa sending 500 messages/month, expect costs around $8-10/month.
        This is significantly cheaper than competitors who charge $50-75/month for SMS features.
      </p>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/messaging/two-way-texting" className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-lg hover:border-primary-400 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-primary-900">Two-Way Texting Guide</h3>
          </div>
          <p className="text-sm text-primary-700 font-medium">Complete guide to messaging workflows, permissions, and use cases</p>
        </Link>
        <Link href="/features/messaging/ai-suggestions" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI Reply Suggestions</h3>
          </div>
          <p className="text-sm text-gray-500">Smart, contextual reply suggestions</p>
        </Link>
        <Link href="/features/messaging/campaigns" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Send className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">SMS Campaigns</h3>
          </div>
          <p className="text-sm text-gray-500">Marketing messages with consent tracking</p>
        </Link>
        <Link href="/features/messaging/settings" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">SMS Settings</h3>
          </div>
          <p className="text-sm text-gray-500">Staff permissions and compliance</p>
        </Link>
        <Link href="/features/messaging/templates" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Message Templates</h3>
          </div>
          <p className="text-sm text-gray-500">Create and manage reusable templates</p>
        </Link>
        <Link href="/features/messaging/quick-replies" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Quick Replies</h3>
          </div>
          <p className="text-sm text-gray-500">One-click response templates</p>
        </Link>
        <Link href="/integrations/twilio" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Twilio Setup</h3>
          </div>
          <p className="text-sm text-gray-500">Configure SMS integration</p>
        </Link>
      </div>
    </div>
  )
}
