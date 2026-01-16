import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Mic, Clock, Phone, FileText, Sparkles } from 'lucide-react'

export default function VoiceAIPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Mic className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge planned">
          <Clock className="w-3 h-3" /> Planned
        </span>
      </div>
      <h1>Voice AI</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Your practice, hands-free. AI phone assistants handle bookings after hours,
        and voice dictation lets providers chart without typing.
      </p>

      <h2 id="vision">The Vision</h2>
      <p>
        Every phone call answered. Every note documented. Voice AI brings two
        powerful capabilities to your practice:
      </p>
      <ul>
        <li><strong>Phone booking assistant</strong> &mdash; 24/7 AI receptionist</li>
        <li><strong>Charting dictation</strong> &mdash; Speak your SOAP notes</li>
      </ul>

      <h2 id="phone">Phone Booking Assistant</h2>
      <p>
        Never miss a call:
      </p>
      <ul>
        <li><strong>After hours</strong> &mdash; AI answers when you&apos;re closed</li>
        <li><strong>Overflow</strong> &mdash; Picks up when staff is busy</li>
        <li><strong>Direct booking</strong> &mdash; Patients book appointments by voice</li>
        <li><strong>FAQs</strong> &mdash; Answers common questions about services, hours, location</li>
      </ul>

      <Callout type="info" title="Coming Soon">
        Voice AI phone assistant is in development. We&apos;re training it on
        med spa-specific conversations for natural, helpful interactions.
      </Callout>

      <h2 id="dictation">Charting Dictation</h2>
      <p>
        Speed up documentation:
      </p>
      <ul>
        <li><strong>Speak naturally</strong> &mdash; Just talk, AI transcribes</li>
        <li><strong>SOAP formatting</strong> &mdash; Auto-organizes into sections</li>
        <li><strong>Medical vocabulary</strong> &mdash; Knows aesthetic terminology</li>
        <li><strong>Review and edit</strong> &mdash; Quick corrections before saving</li>
      </ul>

      <div className="not-prose p-4 bg-gray-50 rounded-lg mb-6">
        <p className="text-sm font-medium mb-2">Example Dictation</p>
        <p className="text-sm text-gray-600 italic">
          &quot;Patient presents for routine Botox. Treated glabella with 20 units,
          forehead with 12 units, lateral crow&apos;s feet bilateral 12 units each.
          No adverse reactions. Return in 3 months.&quot;
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Automatically formatted into SOAP note with injection details.
        </p>
      </div>

      <h2 id="benefits">Benefits</h2>
      <ul>
        <li><strong>Faster charting</strong> &mdash; 3x faster than typing</li>
        <li><strong>More detail</strong> &mdash; Easy to be thorough when speaking</li>
        <li><strong>Hands-free</strong> &mdash; Document while treating</li>
        <li><strong>Reduced burnout</strong> &mdash; Less administrative burden</li>
      </ul>

      <h2 id="features">Voice AI Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/voice-ai/phone-booking" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <Phone className="w-5 h-5 text-primary-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Phone Booking Assistant</h3>
          <p className="text-sm text-gray-500">24/7 AI receptionist</p>
        </Link>
        <Link href="/features/voice-ai/dictation" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <FileText className="w-5 h-5 text-primary-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Charting Dictation</h3>
          <p className="text-sm text-gray-500">Voice-to-chart documentation</p>
        </Link>
      </div>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2 mt-4">
        <Link href="/features/smart-sms" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Smart SMS</h3>
          <p className="text-sm text-gray-500">AI-powered messaging</p>
        </Link>
        <Link href="/features/charting/soap" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SOAP Notes</h3>
          <p className="text-sm text-gray-500">Clinical documentation</p>
        </Link>
      </div>
    </div>
  )
}
