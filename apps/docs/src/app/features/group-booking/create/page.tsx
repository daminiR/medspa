import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Users, CheckCircle2, Plus, Calendar, UserPlus } from 'lucide-react'

export default function CreatingGroupsPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Users className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Creating Groups</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Book multiple people at once for bridal parties, couples treatments, and
        mother-daughter spa days.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Group bookings are high-value - a bridal party of 6 getting facials is better
        than 6 individual bookings. But managing them manually is a nightmare. Our
        group booking system handles all the complexity.
      </p>

      <h2 id="starting">Starting a Group Booking</h2>
      <ol>
        <li>Click &quot;New Appointment&quot; on the calendar</li>
        <li>Select &quot;Group Booking&quot;</li>
        <li>Enter the group coordinator (who&apos;s organizing)</li>
        <li>Name the group (e.g., &quot;Sarah&apos;s Bridal Party&quot;)</li>
        <li>Add participants</li>
      </ol>

      <h2 id="adding-participants">Adding Participants</h2>
      <p>
        For each person in the group:
      </p>
      <ol>
        <li>Click &quot;Add Participant&quot;</li>
        <li>Search for existing patient or create new</li>
        <li>Select their service(s)</li>
        <li>Assign a provider (or &quot;any available&quot;)</li>
        <li>Repeat for each person</li>
      </ol>

      <Callout type="tip" title="Use Family Linking">
        If group members are already linked as family members, they appear at the
        top of the search for quick adding.
      </Callout>

      <h2 id="scheduling">Scheduling Options</h2>

      <h3>Same Time</h3>
      <p>
        Everyone comes in at the same time - requires multiple providers or rooms.
        Best for: Facial parties, group classes
      </p>

      <h3>Back-to-Back</h3>
      <p>
        Appointments scheduled consecutively with one provider.
        Best for: Injectables with the same injector
      </p>

      <h3>Mixed</h3>
      <p>
        Some services overlap, others are sequential.
        Best for: Complex bridal parties with different services
      </p>

      <h2 id="coordinator">The Coordinator</h2>
      <p>
        Every group has a coordinator who:
      </p>
      <ul>
        <li>Receives all group communications</li>
        <li>Can modify the booking</li>
        <li>Gets reminder texts for the whole group</li>
        <li>May handle group payment</li>
      </ul>

      <h2 id="confirmation">Group Confirmation</h2>
      <p>
        After creating the group:
      </p>
      <ul>
        <li>Each participant gets their individual confirmation</li>
        <li>Coordinator gets a summary of all appointments</li>
        <li>Group appears on the calendar with a special indicator</li>
      </ul>

      <h2 id="editing">Editing Groups</h2>
      <p>
        To modify an existing group:
      </p>
      <ul>
        <li><strong>Add/remove participants</strong> before the appointment</li>
        <li><strong>Change services</strong> for individual participants</li>
        <li><strong>Reschedule</strong> the whole group or individuals</li>
        <li><strong>Cancel</strong> the group or specific people</li>
      </ul>

      <Callout type="info" title="Group Integrity">
        When you reschedule a group, the system tries to keep everyone together.
        You can also break someone out into an individual appointment if needed.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/group-booking/discounts" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Group Discounts</h3>
          <p className="text-sm text-gray-500">Automatic group pricing</p>
        </Link>
        <Link href="/features/patients/family" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Family Linking</h3>
          <p className="text-sm text-gray-500">Connect related patients</p>
        </Link>
      </div>
    </div>
  )
}
