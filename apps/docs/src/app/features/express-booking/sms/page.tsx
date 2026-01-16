import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Zap, CheckCircle2, MessageSquare, Link as LinkIcon, Clock } from 'lucide-react'

export default function SMSQuickBookPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Zap className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>SMS Quick Book</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Send a booking link via text message. Patients tap, pick a time, and book -
        all without a phone call.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        When a patient texts &quot;when can I come in for Botox?&quot;, you could go back and
        forth about times. Or you could send one link and let them book themselves.
        It takes 10 seconds instead of 5 minutes.
      </p>

      <h2 id="how">How It Works</h2>
      <ol>
        <li>Patient sends a message asking to book</li>
        <li>You click &quot;Send Booking Link&quot;</li>
        <li>Select the service(s) they want</li>
        <li>Choose a provider (or any available)</li>
        <li>Link is sent via SMS</li>
        <li>Patient picks their time and confirms</li>
        <li>Appointment appears on your calendar</li>
      </ol>

      <h2 id="patient-experience">What the Patient Sees</h2>
      <div className="not-prose bg-gray-100 rounded-lg p-4 mb-6">
        <div className="bg-blue-500 text-white rounded-lg p-3 mb-2 max-w-xs ml-auto">
          <p className="text-sm">Can I get Botox this week?</p>
        </div>
        <div className="bg-white rounded-lg p-3 max-w-sm">
          <p className="text-sm mb-2">Of course! Here&apos;s a link to book your Botox appointment with Dr. Johnson:</p>
          <p className="text-sm text-blue-600 underline">book.luxemedspa.com/abc123</p>
          <p className="text-sm mt-2">Pick any time that works for you!</p>
        </div>
      </div>

      <p>
        When they tap the link, they see:
      </p>
      <ul>
        <li>Available time slots for the next 2 weeks</li>
        <li>Service pre-selected (Botox in this case)</li>
        <li>Provider pre-selected (if you chose one)</li>
        <li>One-tap booking confirmation</li>
      </ul>

      <Callout type="tip" title="Pre-Fill the Service">
        When you know what they want, pre-select the service. Fewer clicks = more
        completed bookings.
      </Callout>

      <h2 id="from-messages">From the Messages Page</h2>
      <ol>
        <li>Open the conversation with the patient</li>
        <li>Click the calendar icon (or &quot;Book&quot; button)</li>
        <li>Select service and provider</li>
        <li>Click &quot;Send Link&quot;</li>
      </ol>

      <h2 id="from-calendar">From the Calendar</h2>
      <ol>
        <li>Right-click on an empty time slot</li>
        <li>Select &quot;Send Express Booking Link&quot;</li>
        <li>Search for the patient</li>
        <li>Time slot is pre-selected</li>
        <li>Send the link</li>
      </ol>

      <h2 id="link-expiration">Link Expiration</h2>
      <p>
        Express booking links expire after:
      </p>
      <ul>
        <li><strong>48 hours</strong> by default</li>
        <li>Or when the patient books</li>
        <li>Or when you manually cancel it</li>
      </ul>
      <p>
        Expired links show a friendly message asking them to contact you for a new link.
      </p>

      <h2 id="tracking">Tracking Sent Links</h2>
      <p>
        See all pending booking links in the Express Booking dashboard:
      </p>
      <ul>
        <li>Who you sent it to</li>
        <li>When it was sent</li>
        <li>Status (pending, booked, expired)</li>
        <li>Option to resend or cancel</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/express-booking/links" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Booking Links</h3>
          <p className="text-sm text-gray-500">Shareable booking pages</p>
        </Link>
        <Link href="/features/messaging" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Messaging</h3>
          <p className="text-sm text-gray-500">Two-way SMS</p>
        </Link>
      </div>
    </div>
  )
}
