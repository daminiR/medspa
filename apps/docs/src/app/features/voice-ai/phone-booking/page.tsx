import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Phone, Clock, Calendar, MessageSquare, Sparkles } from 'lucide-react'
import { BRAND } from '@medspa/config'

export default function PhoneBookingPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Phone className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge planned">
          <Clock className="w-3 h-3" /> Planned
        </span>
      </div>
      <h1>Phone Booking Assistant</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        An AI receptionist that sounds human. Takes calls after hours, during
        lunch, or when lines are busy - and books appointments directly.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        47% of patients who call and don&apos;t reach someone never call back. They book
        with the practice that answered. An AI assistant ensures every call is
        answered, every potential patient captured.
      </p>

      <h2 id="capabilities">What It Does</h2>
      <ul>
        <li><strong>Answers calls</strong> &mdash; &quot;Thanks for calling {BRAND.shortName}...&quot;</li>
        <li><strong>Books appointments</strong> &mdash; Accesses your real-time calendar</li>
        <li><strong>Answers FAQs</strong> &mdash; Hours, location, services, pricing</li>
        <li><strong>Takes messages</strong> &mdash; For complex requests</li>
        <li><strong>Transfers to humans</strong> &mdash; When needed</li>
      </ul>

      <h2 id="conversation">Natural Conversation</h2>
      <p>
        Not a robotic phone tree - a real conversation:
      </p>

      <div className="not-prose p-4 bg-gray-50 rounded-lg mb-6 space-y-3">
        <div className="text-sm">
          <span className="font-medium text-blue-600">AI:</span>
          <span className="text-gray-600"> &quot;Thank you for calling {BRAND.shortName}, this is our AI assistant. How can I help you today?&quot;</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-900">Caller:</span>
          <span className="text-gray-600"> &quot;Hi, I want to schedule Botox.&quot;</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-blue-600">AI:</span>
          <span className="text-gray-600"> &quot;I&apos;d be happy to help you book a Botox appointment. Do you have a provider preference, or would you like the next available?&quot;</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-900">Caller:</span>
          <span className="text-gray-600"> &quot;I&apos;ve seen Dr. Sarah before.&quot;</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-blue-600">AI:</span>
          <span className="text-gray-600"> &quot;Great! Dr. Sarah has availability this Thursday at 2pm or Friday at 10am. Which works better for you?&quot;</span>
        </div>
      </div>

      <h2 id="when">When It Activates</h2>
      <p>
        Configure when AI answers:
      </p>
      <ul>
        <li><strong>After hours</strong> &mdash; When office is closed</li>
        <li><strong>Lunch break</strong> &mdash; During scheduled breaks</li>
        <li><strong>Overflow</strong> &mdash; After X rings with no answer</li>
        <li><strong>High volume</strong> &mdash; When all lines are busy</li>
        <li><strong>Always</strong> &mdash; Handle all calls (optional)</li>
      </ul>

      <Callout type="tip" title="Hybrid Approach">
        Most practices start with after-hours only, then expand to overflow
        during busy periods. You control the experience.
      </Callout>

      <h2 id="booking">Direct Booking</h2>
      <p>
        AI has full calendar access:
      </p>
      <ul>
        <li><strong>Real-time availability</strong> &mdash; Sees open slots</li>
        <li><strong>Service duration</strong> &mdash; Books correct time</li>
        <li><strong>Provider matching</strong> &mdash; Respects preferences</li>
        <li><strong>Confirmation</strong> &mdash; Sends SMS/email after booking</li>
      </ul>

      <h2 id="handoff">Human Handoff</h2>
      <p>
        Not everything can be automated:
      </p>
      <ul>
        <li><strong>Complex questions</strong> &mdash; &quot;Let me connect you to our team&quot;</li>
        <li><strong>Complaints</strong> &mdash; Immediately routes to manager</li>
        <li><strong>Medical concerns</strong> &mdash; Transfers to clinical staff</li>
        <li><strong>Caller request</strong> &mdash; &quot;Can I speak to a person?&quot;</li>
      </ul>

      <Callout type="info" title="After Hours Handoff">
        When staff isn&apos;t available, AI takes detailed messages with callback
        number, reason for call, and urgency level.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/voice-ai/dictation" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting Dictation</h3>
          <p className="text-sm text-gray-500">Voice-to-text documentation</p>
        </Link>
        <Link href="/features/express-booking" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Express Booking</h3>
          <p className="text-sm text-gray-500">Quick booking links</p>
        </Link>
      </div>
    </div>
  )
}
