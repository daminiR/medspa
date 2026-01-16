import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { UserCog, CheckCircle2, MessageSquare, CreditCard, Clock } from 'lucide-react'

export default function CoordinatorManagementPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <UserCog className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Clock className="w-3 h-3" /> In Progress
        </span>
      </div>
      <h1>Coordinator Management</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        The coordinator is your single point of contact for the entire group.
        Communicate, collect payment, and manage changes through one person.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Trying to coordinate with 8 bridesmaids individually is chaos. The coordinator
        handles communication, collects deposits, and manages RSVPs - saving you hours
        of back-and-forth.
      </p>

      <h2 id="role">What the Coordinator Does</h2>

      <h3>Communication Hub</h3>
      <ul>
        <li>Receives all group confirmations</li>
        <li>Gets reminders for everyone</li>
        <li>Relays information to participants</li>
        <li>Single point of contact for changes</li>
      </ul>

      <h3>Payment Management</h3>
      <ul>
        <li>Can pay for the whole group</li>
        <li>Collects deposits from participants</li>
        <li>Handles refunds/cancellations</li>
      </ul>

      <h3>Scheduling Control</h3>
      <ul>
        <li>Reschedules the group if needed</li>
        <li>Adds or removes participants</li>
        <li>Confirms final attendee list</li>
      </ul>

      <Callout type="tip" title="Choose Wisely">
        For bridal parties, the coordinator is usually the bride, maid of honor, or
        wedding planner. Make sure it&apos;s someone responsive who will handle logistics.
      </Callout>

      <h2 id="assigning">Assigning a Coordinator</h2>
      <ol>
        <li>When creating a group, the first person added is usually the coordinator</li>
        <li>You can change the coordinator at any time</li>
        <li>They must be an existing patient or new patient record</li>
      </ol>

      <h2 id="permissions">Coordinator Permissions</h2>
      <p>
        Configure what coordinators can do:
      </p>
      <ul>
        <li><strong>View all participants</strong> &mdash; Always enabled</li>
        <li><strong>Add/remove participants</strong> &mdash; Optional</li>
        <li><strong>Change services</strong> &mdash; Optional</li>
        <li><strong>Reschedule</strong> &mdash; Optional</li>
        <li><strong>Pay for others</strong> &mdash; Optional</li>
      </ul>

      <h2 id="notifications">Coordinator Notifications</h2>
      <p>
        The coordinator receives:
      </p>
      <ul>
        <li><strong>Booking confirmation</strong> with full group summary</li>
        <li><strong>48-hour reminder</strong> asking to confirm attendance</li>
        <li><strong>Day-of reminder</strong> with arrival instructions</li>
        <li><strong>Changes</strong> any time participants modify bookings</li>
      </ul>

      <h2 id="group-payment">Group Payment Options</h2>

      <h3>Coordinator Pays All</h3>
      <p>
        One payment for the entire group:
      </p>
      <ul>
        <li>Coordinator provides card on file</li>
        <li>Total charged at checkout or in advance</li>
        <li>One receipt for the whole group</li>
      </ul>

      <h3>Individual Payments</h3>
      <p>
        Each person pays their share:
      </p>
      <ul>
        <li>Participants enter their own payment</li>
        <li>Coordinator tracks who has paid</li>
        <li>Individual receipts</li>
      </ul>

      <h3>Split with Deposit</h3>
      <p>
        Coordinator pays deposit, individuals pay remainder:
      </p>
      <ul>
        <li>Coordinator covers 50% upfront to hold the booking</li>
        <li>Participants pay their share day-of</li>
        <li>Good for securing bridal party bookings early</li>
      </ul>

      <Callout type="info" title="Coming Soon">
        Online coordinator portal where they can manage their group, collect RSVPs,
        and track payments - without calling you.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/group-booking/create" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Creating Groups</h3>
          <p className="text-sm text-gray-500">Book multiple people</p>
        </Link>
        <Link href="/features/group-booking/discounts" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Group Discounts</h3>
          <p className="text-sm text-gray-500">Automatic pricing</p>
        </Link>
      </div>
    </div>
  )
}
