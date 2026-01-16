import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { History, CheckCircle2, Search, Filter, Calendar, DollarSign, Clock, Eye } from 'lucide-react'

export default function AppointmentHistoryPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <History className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Appointment History</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        See every visit at a glance. Know exactly when patients came in, what they had done,
        and how much they spent - so you can provide personalized care and spot opportunities.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        When a patient calls asking &quot;when was my last Botox?&quot; or you want to remind someone
        they&apos;re due for their next treatment, appointment history gives you instant answers.
        No more flipping through paper charts or guessing.
      </p>

      <h2 id="stats">At-a-Glance Statistics</h2>
      <p>
        The moment you open a patient&apos;s history, you see four key numbers:
      </p>

      <div className="grid md:grid-cols-4 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
          <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-lg font-bold text-gray-900">Total Visits</p>
          <p className="text-sm text-gray-500">All appointments ever</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
          <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-lg font-bold text-gray-900">Upcoming</p>
          <p className="text-sm text-gray-500">Scheduled appointments</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
          <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-lg font-bold text-gray-900">Completed</p>
          <p className="text-sm text-gray-500">Past visits</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
          <DollarSign className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-lg font-bold text-gray-900">Total Spent</p>
          <p className="text-sm text-gray-500">Lifetime value</p>
        </div>
      </div>

      <Callout type="tip" title="Spot Your VIPs">
        The &quot;Total Spent&quot; number helps you instantly identify high-value patients.
        Someone who&apos;s spent $10,000+ deserves VIP treatment!
      </Callout>

      <h2 id="filtering">Quick Filters</h2>
      <p>
        Three buttons let you focus on what matters:
      </p>
      <ul>
        <li><strong>All</strong> &mdash; Every appointment in their history</li>
        <li><strong>Upcoming</strong> &mdash; What&apos;s scheduled next (great for confirming)</li>
        <li><strong>Past</strong> &mdash; Completed visits only (for reviewing treatment history)</li>
      </ul>

      <h2 id="search">Search Within History</h2>
      <p>
        Looking for a specific treatment? Type in the search box:
      </p>
      <ul>
        <li><strong>&quot;Botox&quot;</strong> &mdash; Find all Botox appointments</li>
        <li><strong>&quot;Dr. Johnson&quot;</strong> &mdash; See visits with a specific provider</li>
        <li><strong>&quot;Filler&quot;</strong> &mdash; Track filler treatments over time</li>
      </ul>
      <p>
        Results filter instantly as you type - no need to press Enter.
      </p>

      <h2 id="details">What You See for Each Visit</h2>
      <p>
        Every appointment card shows:
      </p>
      <ul>
        <li><strong>Date &amp; Time</strong> &mdash; When they came in</li>
        <li><strong>Service</strong> &mdash; What treatment they received</li>
        <li><strong>Provider</strong> &mdash; Who performed it</li>
        <li><strong>Duration</strong> &mdash; How long it took</li>
        <li><strong>Status</strong> &mdash; Completed, cancelled, no-show</li>
        <li><strong>Amount</strong> &mdash; What they paid</li>
      </ul>

      <h2 id="status-colors">Status Colors</h2>
      <p>
        Quickly scan appointment status by color:
      </p>
      <div className="not-prose space-y-2 mb-6">
        <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm"><strong>Blue</strong> - Scheduled/Upcoming</span>
        </div>
        <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm"><strong>Green</strong> - Confirmed/Completed</span>
        </div>
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span className="text-sm"><strong>Gray</strong> - Cancelled</span>
        </div>
        <div className="flex items-center gap-3 p-2 bg-red-50 rounded">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm"><strong>Red</strong> - No-Show</span>
        </div>
      </div>

      <h2 id="actions">What You Can Do</h2>
      <ul>
        <li><strong>Click any appointment</strong> &mdash; See full details including notes</li>
        <li><strong>Book New</strong> &mdash; Schedule their next visit right from here</li>
        <li><strong>View Chart</strong> &mdash; Jump to treatment notes and photos</li>
      </ul>

      <Callout type="info" title="Pro Tip">
        Before a patient arrives, quickly review their last few visits. Knowing what they
        had done and any notes from the provider helps you give a more personal experience.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/patients/medical" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Medical Profile</h3>
          <p className="text-sm text-gray-500">Allergies, medications, contraindications</p>
        </Link>
        <Link href="/features/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting</h3>
          <p className="text-sm text-gray-500">Treatment notes and documentation</p>
        </Link>
      </div>
    </div>
  )
}
