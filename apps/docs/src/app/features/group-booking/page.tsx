import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Users2, Clock, Percent, CreditCard, CheckCircle2, Heart, Sparkles } from 'lucide-react'

export default function GroupBookingPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Users2 className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Clock className="w-3 h-3" /> 60% Complete
        </span>
      </div>
      <h1>Group Booking</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Book bridal parties, couples, friend groups, and corporate events with coordinated scheduling,
        group discounts, and flexible payment options.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Group Booking Tutorial"
        duration="5 min"
        description="Learn how to create and manage group appointments for parties and events"
      />

      <h2 id="overview">Why Group Booking?</h2>
      <p>
        Group appointments are a significant revenue opportunity for MedSpas. A bridal party of 5 people
        can generate $1,500+ in a single booking. Group booking makes it easy to:
      </p>
      <ul>
        <li>Book multiple people for the same day/time</li>
        <li>Give each person different services</li>
        <li>Apply group discounts automatically</li>
        <li>Handle payment (one person pays, split, or individual)</li>
        <li>Coordinate communications through one contact</li>
      </ul>

      <Callout type="info" title="Competitive Advantage">
        Many MedSpa platforms don&apos;t handle group booking well. This feature helps you capture
        high-value bridal parties and events that competitors might fumble.
      </Callout>

      <h2 id="use-cases">Common Use Cases</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-pink-600" />
            <h3 className="font-semibold text-pink-900">Bridal Parties</h3>
          </div>
          <p className="text-sm text-pink-800">Bride + bridesmaids before the wedding. Mix of Botox, fillers, facials, and lip treatments.</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Couples</h3>
          </div>
          <p className="text-sm text-red-800">Partners getting treatments together. Same service or different, booked at the same time.</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Girls&apos; Day Out</h3>
          </div>
          <p className="text-sm text-purple-800">Friend groups celebrating birthdays, promotions, or just treating themselves.</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Corporate Events</h3>
          </div>
          <p className="text-sm text-blue-800">Team building spa days. Office pays for employees, typically same service for everyone.</p>
        </div>
      </div>

      <h2 id="creating">Creating a Group Booking</h2>
      <p>
        The group booking wizard walks you through a 4-step process:
      </p>

      <StepList steps={[
        {
          title: 'Group Details',
          description: 'Name the group (e.g., "Sarah\'s Bridal Party"), select coordinator who will be the main contact.'
        },
        {
          title: 'Add Participants',
          description: 'Add each person: search existing patients or create new ones. Select their service.'
        },
        {
          title: 'Schedule',
          description: 'Choose date and scheduling mode: all at same time, staggered 15/30 min apart, or custom times.'
        },
        {
          title: 'Payment & Discounts',
          description: 'Review pricing with group discount applied. Choose payment mode: coordinator pays, individual, or split.'
        }
      ]} />

      <h2 id="scheduling">Scheduling Options</h2>
      <p>
        Groups can be scheduled in several ways depending on your capacity:
      </p>

      <h3 id="parallel">Same Time (Parallel)</h3>
      <p>
        All participants treated simultaneously. Requires multiple providers and treatment rooms.
        Best for couples or small groups (2-3 people).
      </p>

      <h3 id="staggered">Staggered</h3>
      <p>
        Appointments start at intervals (15 or 30 minutes apart). One provider can handle multiple
        patients if service times allow. Common for larger groups.
      </p>
      <div className="bg-gray-100 rounded-lg p-4 text-sm not-prose mb-4">
        <p className="font-medium mb-2">Example: 5-person bridal party, staggered 30 min</p>
        <ul className="space-y-1">
          <li>10:00 AM - Sarah (Bride) - Botox</li>
          <li>10:30 AM - Amy - Lip Filler</li>
          <li>11:00 AM - Jessica - Facial</li>
          <li>11:30 AM - Emily - Lip Filler</li>
          <li>12:00 PM - Rachel - Facial</li>
        </ul>
      </div>

      <h3 id="custom">Custom Times</h3>
      <p>
        Set individual start times for each person. Useful when participants have different
        availability constraints.
      </p>

      <h2 id="discounts">Group Discounts</h2>
      <p>
        Automatic discounts based on group size:
      </p>
      <div className="not-prose overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Group Size</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Default Discount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Example Savings</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4">2 people</td>
              <td className="py-3 px-4 text-center"><span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">5% off</span></td>
              <td className="py-3 px-4 text-gray-600">$800 → $760 (save $40)</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-3 px-4">3-4 people</td>
              <td className="py-3 px-4 text-center"><span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">10% off</span></td>
              <td className="py-3 px-4 text-gray-600">$1,200 → $1,080 (save $120)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4">5-6 people</td>
              <td className="py-3 px-4 text-center"><span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">15% off</span></td>
              <td className="py-3 px-4 text-gray-600">$1,800 → $1,530 (save $270)</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-3 px-4">7+ people</td>
              <td className="py-3 px-4 text-center"><span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">20% off</span></td>
              <td className="py-3 px-4 text-gray-600">$2,500 → $2,000 (save $500)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="tip">
        Discount percentages are configurable in Settings → Group Discounts. You can also
        override the discount for individual groups.
      </Callout>

      <h2 id="payment">Payment Options</h2>

      <h3 id="coordinator-pays">Coordinator Pays All</h3>
      <p>
        One invoice for the entire group. The coordinator (usually the bride or event organizer)
        pays for everyone. Each participant shows &quot;$0 due - paid by [Coordinator]&quot; at checkout.
      </p>

      <h3 id="individual-payment">Individual Payment</h3>
      <p>
        Each person pays for their own service. Separate invoices created, each with the group
        discount applied to their service.
      </p>

      <h3 id="split-evenly">Split Evenly</h3>
      <p>
        Total divided equally among all participants, regardless of individual service costs.
        Useful for corporate events where everyone pays the same share.
      </p>

      <h2 id="coordinator">Coordinator Role</h2>
      <p>
        The coordinator is the primary contact for the group:
      </p>
      <ul>
        <li><strong>Receives all group communications</strong> &mdash; Confirmations, reminders, changes</li>
        <li><strong>Can confirm for everyone</strong> &mdash; Reply &quot;C&quot; to confirm entire group</li>
        <li><strong>Manages changes</strong> &mdash; Add/remove people, reschedule</li>
        <li><strong>Handles payment</strong> &mdash; If coordinator pays option selected</li>
      </ul>

      <Callout type="info">
        The coordinator doesn&apos;t have to be getting a treatment themselves. An office manager
        can be coordinator for a corporate group without having an appointment.
      </Callout>

      <h2 id="changes">Making Changes</h2>

      <h3 id="add-person">Adding Someone</h3>
      <p>
        Add a person to an existing group before the appointment date. The system:
      </p>
      <ul>
        <li>Creates their appointment linked to the group</li>
        <li>Recalculates the group discount (might increase!)</li>
        <li>Sends confirmation to the new person and coordinator</li>
      </ul>

      <h3 id="remove-person">Someone Cancels</h3>
      <p>
        When one person cancels, the others continue. The system:
      </p>
      <ul>
        <li>Cancels only their appointment</li>
        <li>Recalculates discount for remaining group size</li>
        <li>Notifies coordinator of the change and new total</li>
      </ul>

      <h3 id="cancel-group">Cancel Entire Group</h3>
      <p>
        Coordinator can cancel the entire group. All appointments cancelled, all participants
        notified, refunds issued if paid.
      </p>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar</h3>
          <p className="text-sm text-gray-500">View groups on the calendar</p>
        </Link>
        <Link href="/features/billing/packages" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Packages</h3>
          <p className="text-sm text-gray-500">Create group package deals</p>
        </Link>
        <Link href="/features/series" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Treatment Series</h3>
          <p className="text-sm text-gray-500">Recurring appointments</p>
        </Link>
        <Link href="/features/messaging" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Messaging</h3>
          <p className="text-sm text-gray-500">Group communication</p>
        </Link>
      </div>
    </div>
  )
}
