import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { CalendarPlus, CheckCircle2, Clock, CreditCard, Bell } from 'lucide-react'

export default function PortalBookingPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <CalendarPlus className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Patient Portal Booking</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Let patients book 24/7 without calling. They pick their service, provider,
        and time - you wake up to a full schedule.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        70% of patients prefer booking online. If they can&apos;t book at 11pm when they
        remember, they might book with your competitor who has online scheduling.
        Self-service booking also frees your front desk for higher-value tasks.
      </p>

      <h2 id="flow">Booking Flow</h2>
      <p>
        Simple steps for patients:
      </p>
      <ol>
        <li><strong>Log in</strong> &mdash; Or create account if new</li>
        <li><strong>Select service</strong> &mdash; Browse your menu</li>
        <li><strong>Choose provider</strong> &mdash; Optional or required</li>
        <li><strong>Pick date/time</strong> &mdash; Real-time availability</li>
        <li><strong>Confirm details</strong> &mdash; Review and book</li>
        <li><strong>Receive confirmation</strong> &mdash; Instant email + SMS</li>
      </ol>

      <h2 id="availability">Real-Time Availability</h2>
      <p>
        The calendar shows only available slots:
      </p>
      <ul>
        <li><strong>Provider schedules</strong> &mdash; Based on their working hours</li>
        <li><strong>Service duration</strong> &mdash; Correct time blocks</li>
        <li><strong>Buffer time</strong> &mdash; Your configured gaps between appointments</li>
        <li><strong>Room availability</strong> &mdash; If service requires specific room</li>
      </ul>

      <Callout type="tip" title="Book Ahead Settings">
        Control how far in advance patients can book (e.g., 1 week to 3 months).
        Prevent same-day bookings if you need prep time.
      </Callout>

      <h2 id="services">Service Configuration</h2>
      <p>
        Control what&apos;s bookable online:
      </p>
      <ul>
        <li><strong>Public services</strong> &mdash; Anyone can book</li>
        <li><strong>Returning patients only</strong> &mdash; Must have previous visit</li>
        <li><strong>Hidden services</strong> &mdash; Not shown (internal use only)</li>
        <li><strong>Consult required</strong> &mdash; New patients start with consultation</li>
      </ul>

      <h2 id="deposits">Deposits & Payments</h2>
      <p>
        Reduce no-shows with payment:
      </p>
      <ul>
        <li><strong>Card on file</strong> &mdash; Required to complete booking</li>
        <li><strong>Deposit amount</strong> &mdash; Percentage or fixed amount</li>
        <li><strong>Full prepay</strong> &mdash; Pay entire service upfront</li>
        <li><strong>No payment</strong> &mdash; For returning trusted patients</li>
      </ul>

      <div className="not-prose p-4 bg-gray-50 rounded-lg mb-6">
        <p className="text-sm font-medium mb-2">Typical Deposit Strategy</p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>New patients: $50 deposit or 50% prepay</li>
          <li>Returning patients: Card on file only</li>
          <li>High-value services: Full prepay</li>
        </ul>
      </div>

      <h2 id="confirmations">Confirmations & Reminders</h2>
      <p>
        Automatic communications:
      </p>
      <ul>
        <li><strong>Instant confirmation</strong> &mdash; Email with appointment details</li>
        <li><strong>SMS confirmation</strong> &mdash; Text with date/time</li>
        <li><strong>Calendar invite</strong> &mdash; Add to Google/Outlook</li>
        <li><strong>Reminder sequence</strong> &mdash; 48 hours, 24 hours, 2 hours</li>
      </ul>

      <h2 id="rescheduling">Self-Service Rescheduling</h2>
      <p>
        Patients can modify their bookings:
      </p>
      <ul>
        <li><strong>Reschedule</strong> &mdash; Move to a different time</li>
        <li><strong>Cancel</strong> &mdash; With your cancellation policy</li>
        <li><strong>Add services</strong> &mdash; Book additional treatments</li>
      </ul>

      <Callout type="info" title="Reschedule Limits">
        Set minimum notice for changes (e.g., 24 hours). Prevent last-minute
        cancellations that leave holes in your schedule.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/patient-portal" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Patient Portal Overview</h3>
          <p className="text-sm text-gray-500">Portal capabilities</p>
        </Link>
        <Link href="/features/express-booking" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Express Booking</h3>
          <p className="text-sm text-gray-500">Quick booking links</p>
        </Link>
      </div>
    </div>
  )
}
