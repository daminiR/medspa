import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import { ComparisonTable } from '@/components/docs/ComparisonTable'
import Link from 'next/link'
import { Calendar, Clock, Users, Zap, GripVertical, CheckCircle2 } from 'lucide-react'

export default function CalendarPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Calendar className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 78% Complete
        </span>
      </div>
      <h1>Calendar & Scheduling</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        A powerful, intuitive calendar system designed specifically for medical spas.
        Manage appointments, time blocks, and waitlists with ease.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Calendar Overview"
        duration="3 min"
        description="Learn how to navigate the calendar and schedule appointments efficiently"
      />

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Multiple Views</h3>
          </div>
          <p className="text-sm text-gray-500">Switch between day, week, and month views to see your schedule at a glance.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <GripVertical className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Drag & Drop</h3>
          </div>
          <p className="text-sm text-gray-500">Easily reschedule appointments by dragging them to a new time slot.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Time Blocks</h3>
          </div>
          <p className="text-sm text-gray-500">Block off time for lunch, meetings, and personal time. Prevents double-booking.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Multi-Provider</h3>
          </div>
          <p className="text-sm text-gray-500">View all providers side-by-side or filter to see individual schedules.</p>
        </div>
      </div>

      <h2 id="calendar-views">Calendar Views</h2>
      <p>
        The calendar supports three main views to help you manage your schedule effectively:
      </p>

      <h3 id="day-view">Day View</h3>
      <p>
        The day view shows a detailed timeline for a single day. Appointments are displayed as colored blocks
        with patient name, service, and time. This is the best view for:
      </p>
      <ul>
        <li>Checking your schedule for today</li>
        <li>Identifying gaps in the schedule</li>
        <li>Adding appointments to specific time slots</li>
      </ul>

      <h3 id="week-view">Week View</h3>
      <p>
        The week view displays all 7 days with appointments shown as compact blocks. Perfect for:
      </p>
      <ul>
        <li>Planning the week ahead</li>
        <li>Comparing busy vs. slow days</li>
        <li>Finding available slots for rescheduling</li>
      </ul>

      <h3 id="month-view">Month View</h3>
      <p>
        The month view provides a high-level overview of your schedule. Use it for:
      </p>
      <ul>
        <li>Long-term planning</li>
        <li>Seeing appointment density across the month</li>
        <li>Identifying vacation and busy periods</li>
      </ul>

      <Callout type="tip" title="Quick Navigation">
        Use keyboard shortcuts to quickly navigate: Press <code>T</code> for today,
        <code>D</code> for day view, <code>W</code> for week view, and <code>M</code> for month view.
      </Callout>

      <h2 id="creating-appointments">Creating Appointments</h2>
      <p>
        There are several ways to create new appointments in the calendar:
      </p>

      <StepList steps={[
        {
          title: 'Click on a time slot',
          description: 'Click any empty space on the calendar to open the new appointment modal pre-filled with that date and time.'
        },
        {
          title: 'Drag to create',
          description: 'Click and drag across a time range to create an appointment with that exact duration.'
        },
        {
          title: 'Use the "New Appointment" button',
          description: 'Click the button in the toolbar to open the appointment modal and manually enter all details.'
        },
        {
          title: 'Search for patient first',
          description: 'Search for an existing patient, then click "Book Appointment" from their profile.'
        }
      ]} />

      <h2 id="time-blocks">Time Blocks & Breaks</h2>
      <p>
        Time blocks allow you to reserve time on the calendar that shouldn&apos;t be booked with appointments.
        Common uses include:
      </p>
      <ul>
        <li><strong>Lunch breaks</strong> - Block 12-1pm daily for lunch</li>
        <li><strong>Staff meetings</strong> - Weekly Monday morning meetings</li>
        <li><strong>Personal time</strong> - Doctor appointments, errands</li>
        <li><strong>Vacations</strong> - Multi-day out-of-office blocks</li>
        <li><strong>Training</strong> - New procedure training sessions</li>
      </ul>

      <Callout type="info">
        Time blocks are color-coded by type and can be made recurring. Set up a daily lunch block
        once and it applies to every weekday automatically.
      </Callout>

      <h2 id="waitlist">Waitlist Management</h2>
      <p>
        The waitlist feature helps you fill last-minute cancellations and keep your schedule full.
        When a patient wants an earlier appointment:
      </p>
      <ol>
        <li>Add them to the waitlist with their preferred times</li>
        <li>When a cancellation occurs, the system suggests waitlist patients</li>
        <li>One-click to notify the patient and offer the slot</li>
        <li>Patient confirms via SMS and the slot is filled</li>
      </ol>

      <h2 id="comparison">Feature Comparison</h2>
      <p>See how our calendar compares to other MedSpa platforms:</p>

      <ComparisonTable
        showCompetitors
        rows={[
          { feature: 'Day/Week/Month Views', luxe: true, mangomint: true, boulevard: true, jane: true },
          { feature: 'Drag & Drop', luxe: true, mangomint: true, boulevard: true, jane: true },
          { feature: 'Recurring Time Blocks', luxe: true, mangomint: true, boulevard: 'partial', jane: false },
          { feature: 'Drag to Create', luxe: true, mangomint: false, boulevard: false, jane: false },
          { feature: 'Waitlist Auto-Fill', luxe: true, mangomint: true, boulevard: 'partial', jane: false },
          { feature: 'Multi-Provider View', luxe: true, mangomint: true, boulevard: true, jane: true },
          { feature: 'Keyboard Shortcuts', luxe: true, mangomint: false, boulevard: false, jane: false },
        ]}
      />

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/calendar/views" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar Views</h3>
          <p className="text-sm text-gray-500">Day, week, and month view documentation</p>
        </Link>
        <Link href="/features/calendar/appointments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Appointments</h3>
          <p className="text-sm text-gray-500">Deep dive into appointment management</p>
        </Link>
        <Link href="/features/calendar/blocks" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Time Blocks</h3>
          <p className="text-sm text-gray-500">Managing breaks and blocked time</p>
        </Link>
        <Link href="/features/calendar/waitlist" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Waitlist</h3>
          <p className="text-sm text-gray-500">Managing your waitlist and auto-fill</p>
        </Link>
        <Link href="/features/express-booking" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Express Booking</h3>
          <p className="text-sm text-gray-500">Quick SMS booking links</p>
        </Link>
        <Link href="/features/group-booking" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Group Booking</h3>
          <p className="text-sm text-gray-500">Booking groups and parties</p>
        </Link>
      </div>
    </div>
  )
}
