import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Calendar, Clock, Layout, Eye, CheckCircle2, ChevronRight, Search, Sparkles } from 'lucide-react'

export default function CalendarViewsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Layout className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Calendar Views</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Switch seamlessly between day, week, and month views to manage your schedule from every angle.
        Each view is optimized for different planning needs and workflows.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Calendar Views Tutorial"
        duration="5 min"
        description="Learn how to use day, week, and month views effectively"
      />

      <h2 id="overview">View Options Overview</h2>
      <p>
        The calendar provides three complementary views that work together to help you manage your schedule efficiently:
      </p>

      <div className="grid md:grid-cols-3 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Day View</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">Detailed hourly timeline for a single day. Perfect for checking today's schedule and finding specific time slots.</p>
          <p className="text-sm font-semibold text-primary-600">Detailed • Granular</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Week View</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">Seven-day overview with compact appointment blocks. Best for planning ahead and comparing daily workloads.</p>
          <p className="text-sm font-semibold text-primary-600">Balanced • Planning</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Month View</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">High-level overview of the entire month. Ideal for long-term planning and identifying busy periods.</p>
          <p className="text-sm font-semibold text-primary-600">Overview • Strategic</p>
        </div>
      </div>

      <h2 id="day-view">Day View</h2>
      <p>
        The day view is your primary working view. It shows a detailed hourly timeline with all appointments
        and time blocks for a single day, making it easy to identify gaps and manage patient flow.
      </p>

      <h3 id="day-features">Day View Features</h3>
      <ul>
        <li><strong>Hourly grid</strong> - 15-minute, 30-minute, or 1-hour time slots</li>
        <li><strong>Color-coded appointments</strong> - Different colors for different providers or services</li>
        <li><strong>Duration display</strong> - See exactly how long each appointment is</li>
        <li><strong>Time blocks</strong> - Lunch, meetings, and other blocked time clearly visible</li>
        <li><strong>Quick actions</strong> - Click appointments to view details or reschedule</li>
        <li><strong>Multi-provider</strong> - View all providers' schedules side-by-side</li>
      </ul>

      <Callout type="tip" title="Perfect for Daily Operations">
        Use day view when you're actively managing the schedule during business hours. It gives you the
        most detailed view of each time slot and makes it easy to spot available times or conflicts.
      </Callout>

      <h3 id="day-interactions">Interacting in Day View</h3>
      <StepList steps={[
        {
          title: 'Click a time slot',
          description: 'Click any empty time slot to create a new appointment at that time. The modal opens pre-filled with the date and time.'
        },
        {
          title: 'Drag to create',
          description: 'Click and drag from the start time to the end time to create an appointment with that exact duration.'
        },
        {
          title: 'Drag to reschedule',
          description: 'Click and drag an existing appointment to a new time slot. The system checks for conflicts automatically.'
        },
        {
          title: 'Click to edit',
          description: 'Click an appointment block to open the details panel and make quick edits to time, notes, or status.'
        }
      ]} />

      <h3 id="day-navigation">Navigating Days</h3>
      <p>
        Move between days using:
      </p>
      <ul>
        <li><strong>Previous/Next buttons</strong> - Navigate one day at a time</li>
        <li><strong>Date picker</strong> - Jump directly to a specific date</li>
        <li><strong>Keyboard shortcuts</strong> - Use arrow keys to move between days, or press <code>T</code> to go to today</li>
      </ul>

      <Callout type="info">
        The day view automatically scrolls to the current time during business hours, so you can see
        immediately what appointments are happening now and what's coming up next.
      </Callout>

      <h2 id="week-view">Week View</h2>
      <p>
        The week view provides a balanced perspective on your schedule. You see all seven days at once,
        making it easy to plan ahead, compare workloads, and find available slots for new appointments.
      </p>

      <h3 id="week-features">Week View Features</h3>
      <ul>
        <li><strong>Seven-day layout</strong> - All days from Monday to Sunday in one view</li>
        <li><strong>Compact appointments</strong> - Appointments shown as compact blocks with basic info</li>
        <li><strong>Time blocks visible</strong> - See lunch, breaks, and blocked time across the week</li>
        <li><strong>Quick scheduling</strong> - Click any empty space to create appointments</li>
        <li><strong>Daily density</strong> - Instantly see which days are busier than others</li>
        <li><strong>Multi-provider columns</strong> - Optional: view each provider in a separate column</li>
      </ul>

      <Callout type="tip" title="Best for Planning Ahead">
        Use week view when booking new appointments or rescheduling existing ones. You can quickly scan
        the entire week to find the best available time and see if there are uneven distributions of appointments.
      </Callout>

      <h3 id="week-interactions">Working in Week View</h3>
      <p>
        In week view, you can:
      </p>
      <ul>
        <li><strong>Create appointments</strong> - Click any empty space on the calendar grid</li>
        <li><strong>Drag to reschedule</strong> - Click and drag appointments across days or times</li>
        <li><strong>View details</strong> - Hover over appointments to see a preview tooltip</li>
        <li><strong>Quick edit</strong> - Click appointments to open the details panel</li>
        <li><strong>Navigate weeks</strong> - Use previous/next buttons or the date picker</li>
      </ul>

      <h3 id="week-navigation">Week Navigation</h3>
      <p>
        Move between weeks using:
      </p>
      <ul>
        <li><strong>Previous/Next buttons</strong> - Jump to the previous or next week</li>
        <li><strong>Date picker</strong> - Select any date to jump to that week</li>
        <li><strong>Keyboard shortcuts</strong> - Use <code>Shift+Left/Right</code> to navigate weeks</li>
      </ul>

      <h2 id="month-view">Month View</h2>
      <p>
        The month view gives you a bird's-eye view of your entire month. It's perfect for long-term planning,
        identifying busy periods, and spotting potential scheduling issues early.
      </p>

      <h3 id="month-features">Month View Features</h3>
      <ul>
        <li><strong>Full month calendar</strong> - See all dates from the first to last day of the month</li>
        <li><strong>Appointment count</strong> - Each day shows the number of appointments scheduled</li>
        <li><strong>Color indicators</strong> - Visual indicators for busy vs. light days</li>
        <li><strong>Time blocks</strong> - Days with time blocks or vacations are clearly marked</li>
        <li><strong>Hover previews</strong> - Hover over a day to see a quick preview of that day's schedule</li>
        <li><strong>Click to drill down</strong> - Click any day to jump to that day's view</li>
      </ul>

      <Callout type="tip" title="Strategic Planning Tool">
        Use month view for strategic planning and capacity analysis. You can quickly identify which weeks
        are over-booked, which have gaps, and where you might need to adjust pricing or marketing efforts.
      </Callout>

      <h3 id="month-interactions">Using Month View</h3>
      <p>
        In month view, you can:
      </p>
      <ul>
        <li><strong>Click a day</strong> - Jump to that day's view to see details or make changes</li>
        <li><strong>Hover over a day</strong> - See a preview tooltip with appointment details</li>
        <li><strong>Color coding</strong> - Light, medium, or dark colors indicate appointment density</li>
        <li><strong>Navigate months</strong> - Use previous/next buttons or the date picker</li>
        <li><strong>See time blocks</strong> - Days with blocks/vacations have a special indicator</li>
      </ul>

      <h3 id="month-navigation">Month Navigation</h3>
      <p>
        Move between months using:
      </p>
      <ul>
        <li><strong>Previous/Next buttons</strong> - Jump to the previous or next month</li>
        <li><strong>Month/Year picker</strong> - Click the month name to open a date selector</li>
        <li><strong>Keyboard shortcuts</strong> - Use <code>P</code> and <code>N</code> for previous/next month</li>
      </ul>

      <h2 id="switching-views">Switching Between Views</h2>
      <p>
        Switching views is instant and keeps your current context:
      </p>

      <StepList steps={[
        {
          title: 'Use the toolbar buttons',
          description: 'Click the D, W, or M button in the calendar toolbar at the top to switch views.'
        },
        {
          title: 'Use keyboard shortcuts',
          description: 'Press D for day, W for week, or M for month to switch instantly.'
        },
        {
          title: 'Context is preserved',
          description: 'When you switch views, the calendar stays focused on the same date range you were viewing.'
        }
      ]} />

      <Callout type="info">
        You can quickly navigate the month in month view, then jump to day view to see the full schedule
        for a specific day, then back to week view to find rescheduling options. The views complement each other.
      </Callout>

      <h2 id="provider-filtering">Provider Filtering</h2>
      <p>
        If you have multiple providers, you can filter the calendar to show:
      </p>
      <ul>
        <li><strong>All providers</strong> - See everyone's schedule combined</li>
        <li><strong>Individual providers</strong> - Focus on one provider's schedule</li>
        <li><strong>Provider columns</strong> - In week view, show each provider in a separate column</li>
      </ul>

      <h3 id="filtering-workflow">Filtering Workflow</h3>
      <p>
        To filter by provider:
      </p>
      <ol>
        <li>Click the <strong>Provider Filter</strong> button in the toolbar</li>
        <li>Select which providers to show</li>
        <li>The calendar updates instantly to show only those providers' schedules</li>
        <li>In week view, you can toggle between combined and column views</li>
      </ol>

      <h2 id="service-filtering">Service Type Filtering</h2>
      <p>
        Filter your calendar by service category to focus on specific appointment types. This is especially useful
        when you want to see all appointments of a certain type across providers.
      </p>

      <h3 id="service-filter-usage">Using the Service Filter</h3>
      <p>
        The service filter is located in the toolbar next to the location selector:
      </p>
      <ol>
        <li>Click the <strong>✨ Service Filter</strong> dropdown (sparkles icon) in the toolbar</li>
        <li>Select a service category: <strong>Aesthetics</strong>, <strong>Physiotherapy</strong>, <strong>Chiropractic</strong>, or <strong>Massage</strong></li>
        <li>The calendar instantly filters to show only appointments matching that category</li>
        <li>Select <strong>All Services</strong> to reset and show all appointments</li>
      </ol>

      <Callout type="tip" title="Focus Your View">
        Use the service filter when preparing for specific types of treatments. For example, filter to "Aesthetics"
        to see only injectable appointments when you're preparing for a busy filler day.
      </Callout>

      <h2 id="global-search">Global Appointment Search</h2>
      <p>
        Quickly find any appointment using the global search feature. Search by patient name, phone number, or service type.
      </p>

      <h3 id="search-usage">Using Global Search</h3>
      <p>
        Access global search in two ways:
      </p>
      <ul>
        <li><strong>Keyboard shortcut</strong> - Press <code>⌘K</code> (Mac) or <code>Ctrl+K</code> (Windows) to open search</li>
        <li><strong>Click the search icon</strong> - Click the search icon in the toolbar's right section</li>
      </ul>
      <p>
        Once open, type your search query to find appointments:
      </p>
      <ul>
        <li><strong>Patient name</strong> - Search "Sarah" to find all appointments for patients named Sarah</li>
        <li><strong>Phone number</strong> - Search a phone number to find the patient's appointments</li>
        <li><strong>Service</strong> - Search "Botox" to find all Botox appointments</li>
      </ul>
      <p>
        Click a search result to navigate directly to that appointment in the calendar.
      </p>

      <Callout type="info">
        The search shows upcoming appointments first, with the date, time, provider, and service for each result.
        Results are color-coded to match the appointment's status.
      </Callout>

      <h2 id="visual-elements">Visual Elements & Indicators</h2>
      <p>
        The calendar uses carefully designed visual elements to help you quickly understand the schedule at a glance:
      </p>

      <h3 id="shift-indicators">Shift Boundaries</h3>
      <p>
        Provider shifts are shown with subtle purple tinting and boundary lines:
      </p>
      <ul>
        <li><strong>Shift start</strong> - A <span className="text-purple-700 font-semibold">darker purple line</span> marks when the provider's shift begins</li>
        <li><strong>Shift end</strong> - A <span className="text-purple-300 font-semibold">lighter lavender line</span> marks when the shift ends</li>
        <li><strong>Background tint</strong> - A subtle purple tint shows the duration of the shift</li>
      </ul>
      <p>
        These visual cues help you avoid scheduling appointments outside of a provider's working hours.
      </p>

      <h3 id="current-time">Current Time Indicator</h3>
      <p>
        A horizontal gray line with a dot indicator shows the current time. This line spans across all provider
        columns, making it easy to see "where we are" in the day at a glance. The indicator only appears when
        viewing today's date.
      </p>

      <h3 id="grid-lines">Grid Lines</h3>
      <p>
        The calendar uses a three-tier grid system for easy time reading:
      </p>
      <ul>
        <li><strong>Hourly lines</strong> - Darkest lines mark each hour</li>
        <li><strong>Half-hour lines</strong> - Medium lines mark 30-minute intervals</li>
        <li><strong>15-minute lines</strong> - Lightest lines mark quarter-hour intervals</li>
      </ul>

      <h2 id="best-practices">Best Practices</h2>
      <p>
        To get the most from all three views:
      </p>

      <Callout type="tip" title="Daily Workflow">
        Start your day in day view to see today's schedule and manage patient flow. Use the day view's
        detailed timeline to identify gaps and optimize your schedule in real-time.
      </Callout>

      <Callout type="tip" title="Weekly Planning">
        At the start of each week, spend a few minutes in week view. Check for uneven distributions and
        identify which days have the most availability for new appointments.
      </Callout>

      <Callout type="tip" title="Monthly Strategy">
        Once a month, review month view to see trends and plan for busy periods. Use this insight to
        plan time blocks, staffing, and marketing campaigns.
      </Callout>

      <Callout type="info">
        The views are optimized for different tasks, but all three are connected. Changes you make in one
        view are instantly reflected in the others, keeping your schedule in sync.
      </Callout>

      <h2 id="related">Related Topics</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar Overview</h3>
          <p className="text-sm text-gray-500">Learn about all calendar features</p>
        </Link>
        <Link href="/features/calendar/appointments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Appointments</h3>
          <p className="text-sm text-gray-500">Creating and managing appointments</p>
        </Link>
        <Link href="/features/calendar/blocks" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Time Blocks</h3>
          <p className="text-sm text-gray-500">Managing breaks and blocked time</p>
        </Link>
        <Link href="/features/calendar/waitlist" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Waitlist</h3>
          <p className="text-sm text-gray-500">Managing the waitlist</p>
        </Link>
      </div>
    </div>
  )
}
