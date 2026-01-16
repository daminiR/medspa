import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Calendar, CheckCircle2, TrendingUp, Users, Clock, XCircle } from 'lucide-react'

export default function AppointmentAnalyticsPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Calendar className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Appointment Analytics</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Understand your booking patterns. See when patients book, how full you are,
        and where you&apos;re losing revenue to no-shows.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        If you don&apos;t know your no-show rate, you can&apos;t fix it. If you don&apos;t know which
        days are slow, you can&apos;t run promotions. Appointment analytics turn guesswork
        into strategy.
      </p>

      <h2 id="overview">Key Metrics</h2>
      <div className="not-prose grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">248</p>
          <p className="text-sm text-gray-500">Total Booked</p>
        </div>
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">92%</p>
          <p className="text-sm text-gray-500">Show Rate</p>
        </div>
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">78%</p>
          <p className="text-sm text-gray-500">Utilization</p>
        </div>
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-600">2.4 days</p>
          <p className="text-sm text-gray-500">Avg Lead Time</p>
        </div>
      </div>

      <h2 id="no-shows">No-Show Analysis</h2>
      <p>
        Track and reduce your no-show rate:
      </p>
      <ul>
        <li><strong>No-show rate</strong> &mdash; Percentage of appointments that didn&apos;t show</li>
        <li><strong>By day of week</strong> &mdash; Which days have the most no-shows?</li>
        <li><strong>By time of day</strong> &mdash; Early morning? Late afternoon?</li>
        <li><strong>By patient type</strong> &mdash; New patients vs existing</li>
        <li><strong>Revenue impact</strong> &mdash; How much you lost to empty chairs</li>
      </ul>

      <Callout type="tip" title="Reduce No-Shows">
        Most no-shows happen with appointments booked 4+ days out without confirmation.
        Use appointment reminders at 48 hours and 2 hours to dramatically reduce no-shows.
      </Callout>

      <h2 id="utilization">Utilization Rate</h2>
      <p>
        See how efficiently you&apos;re using your available time:
      </p>
      <ul>
        <li><strong>By provider</strong> &mdash; Who&apos;s fully booked vs has openings</li>
        <li><strong>By day of week</strong> &mdash; Which days are slow</li>
        <li><strong>By time slot</strong> &mdash; Peak hours vs dead zones</li>
      </ul>
      <p>
        Aim for 80-85% utilization. Higher than that and you can&apos;t fit walk-ins or
        accommodate last-minute requests.
      </p>

      <h2 id="booking-patterns">Booking Patterns</h2>
      <p>
        Understand how and when patients book:
      </p>
      <ul>
        <li><strong>Lead time</strong> &mdash; How far in advance do patients book?</li>
        <li><strong>Booking channel</strong> &mdash; Online, phone, walk-in, express link</li>
        <li><strong>Day of week</strong> &mdash; When do most bookings come in?</li>
        <li><strong>Time of day</strong> &mdash; When are patients booking?</li>
      </ul>

      <h2 id="cancellations">Cancellation Analysis</h2>
      <ul>
        <li><strong>Cancellation rate</strong> &mdash; Percentage cancelled</li>
        <li><strong>Notice given</strong> &mdash; How much warning you got</li>
        <li><strong>Reasons</strong> &mdash; If captured, why they cancelled</li>
        <li><strong>Recovery rate</strong> &mdash; How many rebooked</li>
      </ul>

      <h2 id="busy-times">Peak &amp; Slow Times</h2>
      <p>
        A heat map shows your busiest times:
      </p>
      <ul>
        <li><strong>Dark colors</strong> &mdash; Highly booked, consider adding hours</li>
        <li><strong>Light colors</strong> &mdash; Available, good for promotions</li>
      </ul>

      <Callout type="info" title="Slow Day Strategy">
        If Tuesdays are consistently slow, run a &quot;Tuesday Special&quot; promotion.
        It&apos;s better to fill chairs at a discount than leave them empty.
      </Callout>

      <h2 id="related">Related Reports</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/reports/sales" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Sales Reports</h3>
          <p className="text-sm text-gray-500">Revenue and performance</p>
        </Link>
        <Link href="/features/calendar/waitlist" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Waitlist</h3>
          <p className="text-sm text-gray-500">Fill cancellations automatically</p>
        </Link>
      </div>
    </div>
  )
}
