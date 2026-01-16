import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { DollarSign, CheckCircle2, TrendingUp, Calendar, Users, BarChart3 } from 'lucide-react'

export default function SalesReportsPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <DollarSign className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Sales Reports</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Know exactly how your business is performing. See revenue by day, week, month -
        broken down by service, provider, or location.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        &quot;How did we do last month?&quot; shouldn&apos;t require an accountant. Sales reports give you
        immediate answers: total revenue, what&apos;s selling, who&apos;s producing, and how you
        compare to previous periods.
      </p>

      <h2 id="overview">Revenue Overview</h2>
      <p>
        At the top of the report, you see the big numbers:
      </p>
      <div className="not-prose grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">$47,250</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">+12%</p>
          <p className="text-sm text-gray-500">vs Last Month</p>
        </div>
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">$315</p>
          <p className="text-sm text-gray-500">Avg Ticket</p>
        </div>
      </div>

      <h2 id="by-service">Revenue by Service</h2>
      <p>
        See which services bring in the most money:
      </p>
      <ul>
        <li><strong>Botox</strong> &mdash; Total units sold, revenue, percentage of total</li>
        <li><strong>Fillers</strong> &mdash; By product type (Juvederm, Restylane, etc.)</li>
        <li><strong>Facials</strong> &mdash; By treatment type</li>
        <li><strong>Packages</strong> &mdash; Package sales and redemptions</li>
      </ul>

      <Callout type="tip" title="Find Your Winners">
        Sort by revenue to see your top services. These are what you should be promoting
        and ensuring you have availability for.
      </Callout>

      <h2 id="by-provider">Revenue by Provider</h2>
      <p>
        Track how each provider is performing:
      </p>
      <ul>
        <li><strong>Total revenue</strong> &mdash; What each provider generated</li>
        <li><strong>Number of appointments</strong> &mdash; How busy they were</li>
        <li><strong>Average ticket</strong> &mdash; Revenue per appointment</li>
        <li><strong>Utilization</strong> &mdash; Percentage of available hours booked</li>
      </ul>

      <h2 id="trends">Revenue Trends</h2>
      <p>
        A line chart shows revenue over time:
      </p>
      <ul>
        <li><strong>Daily view</strong> &mdash; See each day&apos;s performance</li>
        <li><strong>Weekly view</strong> &mdash; Spot weekly patterns</li>
        <li><strong>Monthly view</strong> &mdash; Track month-over-month growth</li>
      </ul>
      <p>
        Compare to previous periods to see if you&apos;re growing.
      </p>

      <h2 id="filters">Filtering the Report</h2>
      <ul>
        <li><strong>Date range</strong> &mdash; Today, this week, this month, custom range</li>
        <li><strong>Provider</strong> &mdash; One provider or all</li>
        <li><strong>Service category</strong> &mdash; Injectables, facials, laser, etc.</li>
        <li><strong>Location</strong> &mdash; If you have multiple locations</li>
      </ul>

      <h2 id="export">Exporting Data</h2>
      <p>
        Click &quot;Export&quot; to download the report as:
      </p>
      <ul>
        <li><strong>CSV</strong> &mdash; For Excel or accounting software</li>
        <li><strong>PDF</strong> &mdash; For printing or sharing</li>
      </ul>

      <Callout type="info" title="For Your Accountant">
        Monthly sales exports include all the detail your accountant needs for
        bookkeeping and tax preparation.
      </Callout>

      <h2 id="related">Related Reports</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/reports/appointments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Appointment Analytics</h3>
          <p className="text-sm text-gray-500">Booking patterns and no-shows</p>
        </Link>
        <Link href="/features/reports/cash" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Cash Reconciliation</h3>
          <p className="text-sm text-gray-500">End-of-day cash count</p>
        </Link>
      </div>
    </div>
  )
}
