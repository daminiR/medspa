import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Repeat, CheckCircle2, Calendar, Clock, Bell } from 'lucide-react'

export default function RepeatingAppointmentsPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Repeat className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Repeating Appointments</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Book maintenance appointments automatically. Botox every 3 months, facials
        every 6 weeks - scheduled in advance so patients never lapse.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        The #1 reason patients don&apos;t return is they simply forget to book. Repeating
        appointments lock in their schedule, improve treatment results, and guarantee
        your revenue.
      </p>

      <h2 id="how">How It Works</h2>
      <ol>
        <li>Book the initial appointment</li>
        <li>Click &quot;Make Repeating&quot;</li>
        <li>Set the interval (weeks/months)</li>
        <li>Choose how many occurrences</li>
        <li>All future appointments are created</li>
      </ol>

      <h2 id="patterns">Common Patterns</h2>

      <div className="not-prose space-y-3 mb-6">
        <div className="p-4 bg-white border rounded-lg">
          <p className="font-semibold">Botox</p>
          <p className="text-sm text-gray-500">Every 3-4 months</p>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <p className="font-semibold">Facials</p>
          <p className="text-sm text-gray-500">Every 4-6 weeks</p>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <p className="font-semibold">Laser Hair Removal</p>
          <p className="text-sm text-gray-500">Every 6 weeks for 6 sessions</p>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <p className="font-semibold">Microneedling</p>
          <p className="text-sm text-gray-500">Every 4-6 weeks for 3-4 sessions</p>
        </div>
      </div>

      <Callout type="tip" title="Pre-Book at Checkout">
        When a patient finishes Botox, book their next one before they leave.
        &quot;Same time in 3 months?&quot; Pre-booking at checkout increases retention by 40%.
      </Callout>

      <h2 id="flexibility">Flexible Scheduling</h2>
      <p>
        Repeating appointments aren&apos;t rigid:
      </p>
      <ul>
        <li><strong>Skip one</strong> &mdash; Patient going on vacation</li>
        <li><strong>Move one</strong> &mdash; Conflict with another commitment</li>
        <li><strong>Change time</strong> &mdash; Prefer mornings now instead of afternoons</li>
        <li><strong>Change provider</strong> &mdash; Try a different injector</li>
      </ul>
      <p>
        Changes to one don&apos;t affect the others unless you want them to.
      </p>

      <h2 id="reminders">Automatic Reminders</h2>
      <p>
        Each occurrence gets standard reminders:
      </p>
      <ul>
        <li>1 week before: &quot;Your Botox appointment is coming up&quot;</li>
        <li>48 hours before: &quot;Don&apos;t forget your appointment tomorrow&quot;</li>
        <li>2 hours before: &quot;We&apos;ll see you soon!&quot;</li>
      </ul>

      <h2 id="managing">Managing the Series</h2>

      <h3>Edit All Future</h3>
      <p>
        Change the time, provider, or service for all remaining appointments at once.
      </p>

      <h3>Edit This One</h3>
      <p>
        Modify just one occurrence without affecting others.
      </p>

      <h3>Cancel Series</h3>
      <p>
        Cancel all remaining appointments if the patient discontinues treatment.
      </p>

      <h2 id="visibility">Calendar View</h2>
      <p>
        Repeating appointments show with a special indicator so you know they&apos;re
        part of a series. Click to see the full series history.
      </p>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/series/pricing" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Package Pricing</h3>
          <p className="text-sm text-gray-500">Discounts for series</p>
        </Link>
        <Link href="/features/series/progress" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Progress Tracking</h3>
          <p className="text-sm text-gray-500">Track treatment progress</p>
        </Link>
      </div>
    </div>
  )
}
