import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { MessageSquare, CheckCircle2, Smartphone, Clock, MapPin } from 'lucide-react'

export default function SMSCheckInPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <MessageSquare className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>SMS Check-In</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Patients check in from their car by replying to a text. No crowded waiting rooms,
        no clipboards, no touching shared tablets.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Post-COVID, patients expect contactless options. SMS check-in lets them wait
        comfortably in their car until you&apos;re ready for them. It also reduces congestion
        in your waiting area and speeds up the check-in process.
      </p>

      <h2 id="how">How It Works</h2>
      <ol>
        <li>Patient arrives and parks</li>
        <li>They receive an automatic SMS: &quot;Reply HERE when you arrive&quot;</li>
        <li>Patient texts back &quot;HERE&quot;</li>
        <li>They appear on your waiting room dashboard</li>
        <li>When ready, you text them to come in</li>
      </ol>

      <Callout type="tip" title="Arrival Detection">
        The check-in SMS is sent automatically based on appointment time. For a 2pm
        appointment, the text goes out at 1:45pm asking if they&apos;ve arrived.
      </Callout>

      <h2 id="patient-experience">What Patients See</h2>
      <div className="not-prose bg-gray-100 rounded-lg p-4 mb-6">
        <div className="bg-white rounded-lg p-3 mb-2 max-w-xs">
          <p className="text-sm text-gray-600">Luxe MedSpa:</p>
          <p className="text-sm">Hi Sarah! Here for your 2pm appointment? Reply HERE when you arrive and we&apos;ll text you when we&apos;re ready.</p>
        </div>
        <div className="bg-blue-500 text-white rounded-lg p-3 mb-2 max-w-xs ml-auto">
          <p className="text-sm">HERE</p>
        </div>
        <div className="bg-white rounded-lg p-3 max-w-xs">
          <p className="text-sm">Perfect! You&apos;re checked in. We&apos;ll text you shortly. Feel free to wait in your car.</p>
        </div>
      </div>

      <h2 id="dashboard">Staff Dashboard View</h2>
      <p>
        On your waiting room dashboard, checked-in patients appear with:
      </p>
      <ul>
        <li><strong>Patient name</strong> &mdash; Who&apos;s waiting</li>
        <li><strong>Appointment time</strong> &mdash; When they were scheduled</li>
        <li><strong>Wait time</strong> &mdash; How long since check-in</li>
        <li><strong>Provider</strong> &mdash; Who they&apos;re seeing</li>
        <li><strong>Status</strong> &mdash; Waiting, Ready, In Room</li>
      </ul>

      <h2 id="ready-notification">Calling Them In</h2>
      <p>
        When the provider is ready:
      </p>
      <ol>
        <li>Click &quot;Ready&quot; next to the patient</li>
        <li>They get a text: &quot;We&apos;re ready for you! Please come to the front desk.&quot;</li>
        <li>Their status updates to &quot;Called In&quot;</li>
      </ol>

      <h2 id="customization">Customizing Messages</h2>
      <p>
        You can customize the check-in messages in Settings:
      </p>
      <ul>
        <li>Arrival prompt text</li>
        <li>Check-in confirmation message</li>
        <li>Ready notification text</li>
        <li>Running late message</li>
      </ul>

      <Callout type="info" title="Personal Touch">
        Messages automatically include the patient&apos;s first name and appointment details.
        &quot;Hi Sarah! Here for your Botox at 2pm?&quot; feels more personal.
      </Callout>

      <h2 id="walk-ins">Walk-In Patients</h2>
      <p>
        For patients who walk in without checking in via SMS:
      </p>
      <ol>
        <li>Click &quot;Add Walk-In&quot; on the dashboard</li>
        <li>Select their appointment or create a new one</li>
        <li>They&apos;re added to the queue manually</li>
      </ol>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/waiting-room/queue" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Queue Management</h3>
          <p className="text-sm text-gray-500">Manage the waiting list</p>
        </Link>
        <Link href="/features/messaging/reminders" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Appointment Reminders</h3>
          <p className="text-sm text-gray-500">Automated reminder texts</p>
        </Link>
      </div>
    </div>
  )
}
