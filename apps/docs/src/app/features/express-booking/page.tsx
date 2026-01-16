import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Zap, CreditCard, MessageSquare, CheckCircle2, Clock, Shield, Smartphone } from 'lucide-react'

export default function ExpressBookingPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Zap className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 95% Complete
        </span>
      </div>
      <h1>Express Booking</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Send SMS booking links that let patients complete their booking and add a card on file &mdash;
        all in under 60 seconds. Reduce no-shows and booking friction.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Express Booking Demo"
        duration="3 min"
        description="Watch how to create and send express booking links to patients"
      />

      <h2 id="overview">What is Express Booking?</h2>
      <p>
        Express Booking is a fast-track booking flow for phone calls. When a patient calls to book,
        instead of collecting all their information over the phone, you:
      </p>
      <ol>
        <li>Get their name and phone number</li>
        <li>Select a service and time slot</li>
        <li>Send them an SMS link to complete booking</li>
      </ol>
      <p>
        The patient clicks the link, enters their details, adds a card on file, accepts your policies,
        and confirms &mdash; all in about 60 seconds. No more 5-minute phone calls for simple bookings.
      </p>

      <Callout type="tip" title="Perfect for Busy Front Desks">
        Express Booking is ideal when you have multiple calls waiting. Capture the essential info,
        send the link, and move to the next call. The patient completes booking at their convenience.
      </Callout>

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Mobile-First</h3>
          </div>
          <p className="text-sm text-gray-500">Booking page optimized for phones. Works perfectly on any device without app download.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Card on File</h3>
          </div>
          <p className="text-sm text-gray-500">Securely collect card details with Stripe. Charge no-show fees or deposits as needed.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Expiring Links</h3>
          </div>
          <p className="text-sm text-gray-500">Links expire after 30 minutes by default. Slot is released if patient doesn&apos;t complete.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Policy Acceptance</h3>
          </div>
          <p className="text-sm text-gray-500">Patient must accept cancellation policy before confirming. Digital record stored.</p>
        </div>
      </div>

      <h2 id="staff-flow">Staff Workflow</h2>
      <p>
        Creating an express booking takes about 30 seconds:
      </p>

      <StepList steps={[
        {
          title: 'Click time slot on calendar',
          description: 'Select the desired appointment time. The booking modal opens.'
        },
        {
          title: 'Enter basic info',
          description: 'Patient first name, phone number, and select the service. That\'s all you need.'
        },
        {
          title: 'Toggle "Express Booking"',
          description: 'Enable express booking mode. Optionally set expiry time and deposit requirements.'
        },
        {
          title: 'Click "Send Booking Link"',
          description: 'SMS is sent immediately. Appointment appears as "Pending" on calendar.'
        }
      ]} />

      <Callout type="info">
        Pending appointments show with a different color on the calendar so you know they&apos;re
        waiting for patient completion. Once completed, they change to the normal confirmed status.
      </Callout>

      <h2 id="patient-flow">Patient Experience</h2>
      <p>
        Patients complete booking in 4 simple steps:
      </p>

      <StepList steps={[
        {
          title: 'Receive SMS',
          description: '"Hi Sarah! Complete your Botox booking for Tue 2pm: [link]. Expires in 30 min."'
        },
        {
          title: 'Enter details',
          description: 'Full name, email, and confirm phone number on a mobile-friendly form.'
        },
        {
          title: 'Add payment card',
          description: 'Secure card entry with Stripe. Card saved for no-show policy or checkout.'
        },
        {
          title: 'Accept & confirm',
          description: 'Read cancellation policy, check acceptance box, tap "Confirm Booking".'
        }
      ]} />

      <h2 id="pending-appointments">Pending Appointments</h2>
      <p>
        When you create an express booking, the appointment is marked as &quot;Pending&quot; until the patient
        completes it. On the calendar:
      </p>
      <ul>
        <li><strong>Visual indicator</strong> &mdash; Pending appointments have a dashed border and lighter color</li>
        <li><strong>Time remaining</strong> &mdash; Shows how long until the link expires</li>
        <li><strong>Quick actions</strong> &mdash; Resend link, cancel, or manually confirm</li>
      </ul>

      <h3 id="expiration">Link Expiration</h3>
      <p>
        By default, booking links expire after 30 minutes. When a link expires:
      </p>
      <ul>
        <li>Patient sees &quot;This link has expired&quot; message with clinic phone number</li>
        <li>Pending appointment is automatically cancelled</li>
        <li>Time slot becomes available again</li>
        <li>Optional: Send SMS notifying patient the slot was released</li>
      </ul>

      <Callout type="tip" title="Customize Expiry Time">
        You can adjust the expiry time per booking. For same-day appointments, use 15 minutes.
        For appointments days away, you might use 2-4 hours.
      </Callout>

      <h2 id="payment-options">Payment Options</h2>
      <p>
        Express Booking supports flexible payment configurations:
      </p>

      <h3 id="card-on-file">Card on File Only</h3>
      <p>
        The default option. Patient&apos;s card is saved but not charged. Use for:
      </p>
      <ul>
        <li>Enforcing no-show/late cancellation policies</li>
        <li>Faster checkout after treatment</li>
        <li>Building patient payment profiles</li>
      </ul>

      <h3 id="deposit">Deposit Required</h3>
      <p>
        Charge a deposit when booking is completed. Common uses:
      </p>
      <ul>
        <li><strong>$50 deposit</strong> &mdash; Applied to treatment cost, forfeit if no-show</li>
        <li><strong>50% deposit</strong> &mdash; For expensive treatments or new patients</li>
        <li><strong>Full prepay</strong> &mdash; For packages or special promotions</li>
      </ul>

      <h2 id="manual-actions">Manual Actions</h2>
      <p>
        Staff can take several actions on pending express bookings:
      </p>
      <ul>
        <li><strong>Resend Link</strong> &mdash; Generate new link if patient didn&apos;t receive or link expired</li>
        <li><strong>Manual Confirm</strong> &mdash; Mark as confirmed without patient completing (for VIPs, regulars)</li>
        <li><strong>Cancel</strong> &mdash; Remove the pending appointment and release the slot</li>
        <li><strong>Extend Time</strong> &mdash; Give patient more time to complete</li>
      </ul>

      <h2 id="benefits">Why Use Express Booking?</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Save Time</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• 30-second calls vs 5-minute calls</li>
            <li>• Handle more calls per hour</li>
            <li>• No data entry errors</li>
            <li>• Patient enters own info</li>
          </ul>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Reduce No-Shows</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Card on file = commitment</li>
            <li>• Policy acceptance = awareness</li>
            <li>• Deposits = skin in the game</li>
            <li>• SMS confirms = documented</li>
          </ul>
        </div>
      </div>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar</h3>
          <p className="text-sm text-gray-500">View and manage all appointments</p>
        </Link>
        <Link href="/features/messaging" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SMS Messaging</h3>
          <p className="text-sm text-gray-500">How SMS booking links work</p>
        </Link>
        <Link href="/features/billing" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Billing & Payments</h3>
          <p className="text-sm text-gray-500">Payment processing details</p>
        </Link>
        <Link href="/integrations/stripe" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Stripe Integration</h3>
          <p className="text-sm text-gray-500">Set up payment processing</p>
        </Link>
      </div>
    </div>
  )
}
