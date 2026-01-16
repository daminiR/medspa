import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Repeat, CheckCircle2, Calendar, DollarSign, TrendingUp, Clock, Package } from 'lucide-react'

export default function SeriesPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Repeat className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 90% Complete
        </span>
      </div>
      <h1>Treatment Series</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Schedule repeating appointments for maintenance treatments like Botox, or create multi-session
        series for laser and microneedling. Lock in revenue and improve patient compliance.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Treatment Series Tutorial"
        duration="6 min"
        description="Learn how to create and manage treatment series for your patients"
      />

      <h2 id="overview">What Are Treatment Series?</h2>
      <p>
        Treatment series solve two common MedSpa scheduling challenges:
      </p>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Repeat className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Maintenance Treatments</h3>
          </div>
          <p className="text-sm text-blue-800">
            Botox patients who return every 3-4 months. Set up recurring appointments so they never
            have to remember to rebook.
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Multi-Session Treatments</h3>
          </div>
          <p className="text-sm text-green-800">
            Laser hair removal requires 6 sessions. Book all 6 upfront with package pricing and
            track progress through the series.
          </p>
        </div>
      </div>

      <h2 id="benefits">Why Use Series?</h2>

      <div className="grid md:grid-cols-3 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <DollarSign className="w-8 h-8 text-green-500 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Lock In Revenue</h3>
          <p className="text-sm text-gray-500">
            Collect $1,200 upfront for 6 sessions instead of hoping the patient rebooks each time.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Better Compliance</h3>
          <p className="text-sm text-gray-500">
            Patients complete treatments on schedule for better results and satisfaction.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <Clock className="w-8 h-8 text-purple-500 mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Save Time</h3>
          <p className="text-sm text-gray-500">
            Book once instead of 6 separate calls. Saves 5+ minutes per patient.
          </p>
        </div>
      </div>

      <h2 id="creating">Creating a Treatment Series</h2>

      <StepList steps={[
        {
          title: 'Start a new appointment',
          description: 'Click a time slot or "New Appointment" button on the calendar.'
        },
        {
          title: 'Enable "Repeat Appointment"',
          description: 'Toggle the switch to show series options.'
        },
        {
          title: 'Choose series type',
          description: 'Select "Maintenance" for ongoing treatments or "Treatment Series" for fixed number of sessions.'
        },
        {
          title: 'Set frequency',
          description: 'Choose interval: every 2 weeks, 4 weeks, 3 months, etc.'
        },
        {
          title: 'Set number of sessions',
          description: 'For treatment series, enter total sessions (e.g., 6 for laser).'
        },
        {
          title: 'Choose booking mode',
          description: '"Book all now" creates all appointments immediately. "Book as you go" creates next session after each visit.'
        },
        {
          title: 'Review package pricing',
          description: 'If available, see package discount vs individual pricing.'
        },
        {
          title: 'Confirm and save',
          description: 'System creates all appointments and sends confirmation to patient.'
        }
      ]} />

      <h2 id="maintenance">Maintenance Treatments</h2>
      <p>
        For treatments patients need on a regular schedule:
      </p>

      <div className="not-prose overflow-x-auto mb-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Treatment</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">Typical Interval</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3">Botox</td>
              <td className="py-2 px-3 text-center">3-4 months</td>
              <td className="py-2 px-3 text-gray-600">Most common maintenance treatment</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3">Dysport</td>
              <td className="py-2 px-3 text-center">3-4 months</td>
              <td className="py-2 px-3 text-gray-600">Similar to Botox schedule</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3">Filler Touch-ups</td>
              <td className="py-2 px-3 text-center">6-12 months</td>
              <td className="py-2 px-3 text-gray-600">Depends on filler type and area</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3">Monthly Facial</td>
              <td className="py-2 px-3 text-center">4 weeks</td>
              <td className="py-2 px-3 text-gray-600">Skincare maintenance</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="tip" title="Maintenance Reminder">
        For maintenance mode, set "Ongoing" with no end date. System will continue creating
        appointments until you stop the series.
      </Callout>

      <h2 id="treatment-series">Multi-Session Treatment Series</h2>
      <p>
        For treatments that require multiple sessions for best results:
      </p>

      <div className="not-prose overflow-x-auto mb-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Treatment</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">Sessions</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">Interval</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Package Price</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3">Laser Hair Removal</td>
              <td className="py-2 px-3 text-center">6</td>
              <td className="py-2 px-3 text-center">4-6 weeks</td>
              <td className="py-2 px-3 text-right">$1,200 (save $300)</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3">Microneedling</td>
              <td className="py-2 px-3 text-center">4</td>
              <td className="py-2 px-3 text-center">4 weeks</td>
              <td className="py-2 px-3 text-right">$800 (save $200)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3">Chemical Peels</td>
              <td className="py-2 px-3 text-center">4-6</td>
              <td className="py-2 px-3 text-center">2-4 weeks</td>
              <td className="py-2 px-3 text-right">$600 (save $150)</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3">IPL Photofacial</td>
              <td className="py-2 px-3 text-center">3-5</td>
              <td className="py-2 px-3 text-center">4 weeks</td>
              <td className="py-2 px-3 text-right">$900 (save $225)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="progress">Progress Tracking</h2>
      <p>
        Track patient progress through their treatment series:
      </p>
      <ul>
        <li><strong>Visual progress bar</strong> &mdash; "Session 3 of 6 (50% complete)"</li>
        <li><strong>Session history</strong> &mdash; See all past sessions with dates and notes</li>
        <li><strong>Photo comparison</strong> &mdash; Before/after photos from each session</li>
        <li><strong>Treatment notes</strong> &mdash; Clinical notes and settings from each session</li>
        <li><strong>Upcoming sessions</strong> &mdash; View all remaining appointments</li>
      </ul>

      <Callout type="info">
        Practitioners see series info when the patient checks in: "This is Sarah's 4th laser session
        (of 6). Previous sessions: Jan 15, Feb 12, Mar 11."
      </Callout>

      <h2 id="package-pricing">Package Pricing</h2>
      <p>
        Offer discounts for patients who book and pay for all sessions upfront:
      </p>

      <h3>Setting Up Package Pricing</h3>
      <ol>
        <li>Go to Settings → Services</li>
        <li>Click on a service (e.g., Laser Hair Removal)</li>
        <li>Scroll to "Package Pricing" section</li>
        <li>Add package tiers (6-session, 8-session, etc.)</li>
        <li>Set package price and calculated savings</li>
      </ol>

      <h3>At Booking Time</h3>
      <p>
        When "Book all appointments now" is selected, the system shows:
      </p>
      <div className="not-prose bg-gray-50 rounded-lg p-4 my-4">
        <p className="text-sm text-gray-600 mb-2">6 sessions × $250 = <span className="line-through">$1,500</span></p>
        <p className="text-lg font-semibold text-green-600">Package rate: $1,200 (save $300 - 20% off)</p>
        <p className="text-sm text-gray-500 mt-2">✓ Charge package rate now</p>
      </div>

      <h2 id="booking-modes">Booking Modes</h2>

      <h3>Book All Now (Recommended)</h3>
      <p>
        Creates all appointments immediately. Best for:
      </p>
      <ul>
        <li>Patients who want their schedule locked in</li>
        <li>Package pricing incentives</li>
        <li>Higher commitment = better completion rates</li>
      </ul>

      <h3>Book As You Go</h3>
      <p>
        Only creates the next appointment after each session completes. Best for:
      </p>
      <ul>
        <li>Patients with unpredictable schedules</li>
        <li>Treatments where timing depends on results</li>
        <li>Lower initial commitment</li>
      </ul>

      <h2 id="editing">Editing a Series</h2>
      <p>
        When editing an appointment that&apos;s part of a series, you&apos;ll see options:
      </p>
      <ul>
        <li><strong>Edit this appointment only</strong> &mdash; Change just this one session</li>
        <li><strong>Edit this and future</strong> &mdash; Change remaining sessions (e.g., new day/time)</li>
        <li><strong>Edit all in series</strong> &mdash; Change entire series including past (rare)</li>
      </ul>

      <h2 id="cancellation">Cancellation & Refunds</h2>
      <p>
        If a patient needs to cancel mid-series:
      </p>
      <ol>
        <li>Open the series from patient profile</li>
        <li>Click "Cancel Series"</li>
        <li>Choose: Cancel remaining only, or Cancel all</li>
        <li>System calculates refund for unused sessions</li>
        <li>Confirm cancellation and process refund</li>
      </ol>

      <div className="not-prose bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
        <h4 className="font-semibold text-amber-900 mb-2">Refund Calculation Example</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>Package paid: $1,200 for 6 sessions</li>
          <li>Sessions completed: 3</li>
          <li>Sessions unused: 3</li>
          <li>Refund: (3/6) × $1,200 = <strong>$600</strong></li>
        </ul>
      </div>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar</h3>
          <p className="text-sm text-gray-500">Where series appointments appear</p>
        </Link>
        <Link href="/features/billing/packages" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Packages</h3>
          <p className="text-sm text-gray-500">Setting up package pricing</p>
        </Link>
        <Link href="/features/patients" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Patient Profiles</h3>
          <p className="text-sm text-gray-500">View patient series history</p>
        </Link>
        <Link href="/features/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting</h3>
          <p className="text-sm text-gray-500">Document each session</p>
        </Link>
      </div>
    </div>
  )
}
