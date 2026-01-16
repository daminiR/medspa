import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { ComparisonTable } from '@/components/docs/ComparisonTable'
import Link from 'next/link'
import {
  BarChart,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Download,
  Filter,
  Clock,
  Users,
  Target,
  Gift,
  AlertCircle,
  Sparkles,
  FileText,
  Mail,
  PieChart,
  Activity
} from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <BarChart className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 82% Complete
        </span>
      </div>
      <h1>Reports & Analytics</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Stop digging through spreadsheets at 2 AM. Get instant answers to your biggest business questions:
        &quot;What&apos;s my actual revenue?&quot; &quot;Who&apos;s my top performer?&quot; &quot;Why are Mondays slow?&quot;
        Real-time insights that actually help you make decisions.
      </p>

      {/* The Problem We Solve */}
      <Callout type="warning" title="The Problem We Solve">
        You&apos;re running your med spa on gut feeling because getting real answers takes hours. QuickBooks
        shows one number, your calendar shows another, and your credit card processor shows a third.
        Meanwhile, you don&apos;t know which services are actually profitable, which staff need help, or
        which patients are about to leave. <strong>We fix that in 5 seconds, not 5 hours.</strong>
      </Callout>

      {/* Video */}
      <VideoPlaceholder
        title="Reports Dashboard Tour"
        duration="3 min"
        description="See how to answer your top 10 business questions in under 30 seconds"
      />

      <h2 id="what-you-can-track">What You Can Track</h2>
      <p>
        Every question you ask yourself at the end of the day, we answer automatically:
      </p>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Revenue & Sales</h3>
          </div>
          <p className="text-sm text-gray-500 mb-2">Today, this week, this month. Gross, net, or cash collected. By service, by provider, by payment method.</p>
          <p className="text-xs text-gray-400">No more &quot;which number is right?&quot; confusion</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Appointment Analytics</h3>
          </div>
          <p className="text-sm text-gray-500 mb-2">Booking rates, no-shows, cancellations, utilization. Which days are busy, which times are dead.</p>
          <p className="text-xs text-gray-400">Industry avg: 15-20% no-shows. You&apos;ll see yours instantly</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Staff Performance</h3>
          </div>
          <p className="text-sm text-gray-500 mb-2">Revenue per provider, treatments completed, patient satisfaction, commission calculations that are actually accurate.</p>
          <p className="text-xs text-gray-400">End the &quot;my commission is wrong&quot; arguments</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Patient Retention</h3>
          </div>
          <p className="text-sm text-gray-500 mb-2">Who hasn&apos;t booked in 90 days, lifetime value per patient, treatment frequency, series completion rates.</p>
          <p className="text-xs text-gray-400">Catch patients before they leave for your competitor</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-pink-600" />
            <h3 className="font-semibold text-gray-900">Service Profitability</h3>
          </div>
          <p className="text-sm text-gray-500 mb-2">Which treatments make money, which lose money, cost of goods per service, margins by category.</p>
          <p className="text-xs text-gray-400">Stop promoting services that don&apos;t make money</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Cash Reconciliation</h3>
          </div>
          <p className="text-sm text-gray-500 mb-2">End-of-day cash drawer balancing. Expected vs. actual, down to the penny.</p>
          <p className="text-xs text-gray-400">No more 20-minute cash counting sessions</p>
        </div>
      </div>

      <h2 id="new-analytics">New: Referral & Acquisition Analytics</h2>
      <p>
        Two brand-new analytics dashboards that answer &quot;Where do my patients come from?&quot; and
        &quot;Is my marketing working?&quot;
      </p>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <Link href="/features/reports/referrals" className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Referral Tracking</h3>
            <span className="ml-auto px-2 py-1 bg-purple-200 text-purple-800 text-xs font-semibold rounded">NEW</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Who refers the most patients? Which rewards work best? ROI on your referral program.</p>
          <p className="text-xs text-purple-600 font-medium">Track every referral, calculate every reward →</p>
        </Link>

        <Link href="/features/reports/acquisition" className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Patient Acquisition</h3>
            <span className="ml-auto px-2 py-1 bg-blue-200 text-blue-800 text-xs font-semibold rounded">NEW</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Instagram vs. Google vs. referrals. Cost per acquisition, conversion rates, lifetime value by source.</p>
          <p className="text-xs text-blue-600 font-medium">Stop guessing which ads work →</p>
        </Link>
      </div>

      <h2 id="dashboard">Key Metrics at a Glance</h2>
      <p>
        Your main dashboard shows the numbers that matter, updated in real-time:
      </p>

      <div className="not-prose bg-gradient-to-br from-primary-50 to-purple-50 rounded-lg p-6 my-6 border border-primary-200">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" />
          Today&apos;s Snapshot (Example)
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">$4,850</div>
            <div className="text-sm text-gray-500">Today&apos;s Revenue</div>
            <div className="text-xs text-green-600 font-medium mt-1">↑ 18% vs. last Friday</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">28 / 32</div>
            <div className="text-sm text-gray-500">Appointments Completed</div>
            <div className="text-xs text-gray-600 mt-1">2 no-shows (6.3%) • 2 cancelled</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">$68,400</div>
            <div className="text-sm text-gray-500">This Month (MTD)</div>
            <div className="text-xs text-green-600 font-medium mt-1">↑ $6,300 ahead of last month</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">5 patients</div>
            <div className="text-sm text-gray-500">Haven&apos;t Booked in 90+ Days</div>
            <div className="text-xs text-orange-600 font-medium mt-1">At-risk VIPs • Send win-back</div>
          </div>
        </div>
      </div>

      <h2 id="quick-wins">Quick Wins: What You Can Do in 5 Minutes</h2>
      <p>
        You don&apos;t need a data science degree. Here&apos;s what you&apos;ll actually use this for:
      </p>

      <div className="not-prose space-y-3 my-6">
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">1</div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Answer &quot;How much did we make?&quot;</h4>
            <p className="text-sm text-gray-600">Dashboard → See today, this week, this month. Done. No spreadsheets, no calculators.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">2</div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Find patients about to leave</h4>
            <p className="text-sm text-gray-600">Reports → Patient Retention → &quot;90+ days inactive&quot; list → Call them this week with a special offer.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">3</div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Prove to your star employee they earned that raise</h4>
            <p className="text-sm text-gray-600">Staff Performance → See revenue per provider → Dr. Smith generated $42K this month vs. $28K average.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">4</div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Figure out why Mondays suck</h4>
            <p className="text-sm text-gray-600">Appointment Analytics → Filter by day of week → Monday has 12% no-show rate vs. 5% Friday → Send extra reminders.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">5</div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Stop promoting treatments that lose money</h4>
            <p className="text-sm text-gray-600">Service Profitability → See margins per treatment → That &quot;hot new service&quot; costs you $80 in product per treatment but you only charge $90. Raise prices or stop offering it.</p>
          </div>
        </div>
      </div>

      <Callout type="success" title="Real Result">
        Med spa owner in Dallas used the &quot;90+ days inactive&quot; report to find 23 VIP patients who
        hadn&apos;t booked. Called them with a &quot;we miss you&quot; 20% off offer.
        <strong> 17 rebooked within a week. $12,400 in revenue from 2 hours of work.</strong>
      </Callout>

      <h2 id="comparison">Why Our Reports Beat Competitors</h2>

      <ComparisonTable
        showCompetitors={true}
        rows={[
          {
            feature: 'Real-time revenue dashboard (not yesterday)',
            luxe: true,
            mangomint: 'partial',
            boulevard: 'partial',
            jane: false,
          },
          {
            feature: 'One-click patient retention report',
            luxe: true,
            mangomint: false,
            boulevard: false,
            jane: false,
          },
          {
            feature: 'Accurate commission calculations (includes packages)',
            luxe: true,
            mangomint: 'partial',
            boulevard: 'partial',
            jane: true,
          },
          {
            feature: 'No-show rate by day/time/provider',
            luxe: true,
            mangomint: false,
            boulevard: true,
            jane: false,
          },
          {
            feature: 'Marketing ROI tracking (Instagram vs Google)',
            luxe: true,
            mangomint: false,
            boulevard: false,
            jane: false,
          },
          {
            feature: 'Service profitability (revenue minus COGS)',
            luxe: true,
            mangomint: false,
            boulevard: 'partial',
            jane: false,
          },
          {
            feature: 'Referral program analytics',
            luxe: true,
            mangomint: false,
            boulevard: false,
            jane: false,
          },
          {
            feature: 'Cash drawer reconciliation',
            luxe: true,
            mangomint: true,
            boulevard: true,
            jane: 'partial',
          },
          {
            feature: 'Export to CSV/Excel (take data anywhere)',
            luxe: true,
            mangomint: true,
            boulevard: true,
            jane: true,
          },
          {
            feature: 'Scheduled email reports (Monday morning summary)',
            luxe: 'Coming soon',
            mangomint: true,
            boulevard: 'partial',
            jane: false,
          },
        ]}
      />

      <h2 id="benchmarks">Industry Benchmarks: How Do You Stack Up?</h2>
      <p>
        Our reports show you YOUR numbers. Here&apos;s what &quot;good&quot; looks like in the med spa industry:
      </p>

      <div className="not-prose overflow-x-auto my-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Target</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Industry Average</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">What It Means</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700">No-show rate</td>
              <td className="py-3 px-4 text-center text-green-600 font-medium">&lt; 8%</td>
              <td className="py-3 px-4 text-center text-gray-600">15-20%</td>
              <td className="py-3 px-4 text-sm text-gray-600">If yours is 15%+, you need better reminders</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <td className="py-3 px-4 text-gray-700">Late cancellation rate</td>
              <td className="py-3 px-4 text-center text-green-600 font-medium">&lt; 5%</td>
              <td className="py-3 px-4 text-center text-gray-600">8-12%</td>
              <td className="py-3 px-4 text-sm text-gray-600">Enforce 24-hour cancellation policy</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700">Provider utilization</td>
              <td className="py-3 px-4 text-center text-green-600 font-medium">70-85%</td>
              <td className="py-3 px-4 text-center text-gray-600">60-70%</td>
              <td className="py-3 px-4 text-sm text-gray-600">Booked time ÷ available time</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <td className="py-3 px-4 text-gray-700">New patient ratio</td>
              <td className="py-3 px-4 text-center text-green-600 font-medium">15-25%</td>
              <td className="py-3 px-4 text-center text-gray-600">10-20%</td>
              <td className="py-3 px-4 text-sm text-gray-600">Too high = retention problem. Too low = marketing problem</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700">Patient retention (90-day)</td>
              <td className="py-3 px-4 text-center text-green-600 font-medium">&gt; 75%</td>
              <td className="py-3 px-4 text-center text-gray-600">60-70%</td>
              <td className="py-3 px-4 text-sm text-gray-600">% of patients who return within 90 days</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <td className="py-3 px-4 text-gray-700">Gross profit margin</td>
              <td className="py-3 px-4 text-center text-green-600 font-medium">60-70%</td>
              <td className="py-3 px-4 text-center text-gray-600">50-65%</td>
              <td className="py-3 px-4 text-sm text-gray-600">Revenue minus cost of goods sold (COGS)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700">Average ticket per visit</td>
              <td className="py-3 px-4 text-center text-green-600 font-medium">$400-$600</td>
              <td className="py-3 px-4 text-center text-gray-600">$300-$450</td>
              <td className="py-3 px-4 text-sm text-gray-600">Train staff on upselling retail/add-ons</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <td className="py-3 px-4 text-gray-700">Patient lifetime value (LTV)</td>
              <td className="py-3 px-4 text-center text-green-600 font-medium">$3,000-$8,000</td>
              <td className="py-3 px-4 text-center text-gray-600">$2,000-$5,000</td>
              <td className="py-3 px-4 text-sm text-gray-600">Total revenue per patient over their lifetime</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="tip" title="Use These Benchmarks">
        You don&apos;t need to hit all these targets immediately. Pick ONE metric to improve this month.
        For example: &quot;Get no-show rate from 15% to under 10%&quot; (add SMS reminders). Track it weekly.
        You&apos;ll see the impact in your revenue within 30 days.
      </Callout>

      <h2 id="report-features">Report Features</h2>

      <div className="grid md:grid-cols-3 gap-4 not-prose mb-8">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Smart Filters</h4>
          </div>
          <p className="text-sm text-gray-500 mb-2">Filter by date range, provider, location, service, payment method.</p>
          <p className="text-xs text-gray-400">Compare last week vs. this week, Dr. Smith vs. Dr. Jones, Botox vs. Fillers.</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-4 h-4 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Export Anywhere</h4>
          </div>
          <p className="text-sm text-gray-500 mb-2">Export to CSV or Excel. Share with your accountant, analyze in Google Sheets.</p>
          <p className="text-xs text-gray-400">Your data, your control. No lock-in.</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Scheduled Reports</h4>
          </div>
          <p className="text-sm text-gray-500 mb-2">Get weekly or monthly summary emails. Monday morning = revenue report in your inbox.</p>
          <p className="text-xs text-gray-400">Coming soon • Request early access</p>
        </div>
      </div>

      <h2 id="exports">What You Can Export</h2>
      <p>
        Every report exports to CSV or Excel. Here&apos;s what med spa owners actually export:
      </p>

      <div className="not-prose space-y-2 my-6">
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
          <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Monthly revenue report for accountant</div>
            <div className="text-xs text-gray-500">Revenue by service, payment methods, refunds, outstanding AR</div>
          </div>
          <Download className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
          <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Staff commission calculations (for payroll)</div>
            <div className="text-xs text-gray-500">Revenue per provider, commission %, total payout</div>
          </div>
          <Download className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
          <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Patient list for marketing campaign</div>
            <div className="text-xs text-gray-500">All Botox patients who haven&apos;t booked in 90+ days (with email/phone)</div>
          </div>
          <Download className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
          <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">Service profitability analysis</div>
            <div className="text-xs text-gray-500">Revenue, COGS, gross profit, margin % per treatment type</div>
          </div>
          <Download className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
          <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-gray-900">No-show report for policy enforcement</div>
            <div className="text-xs text-gray-500">Patients with 3+ no-shows → require prepayment</div>
          </div>
          <Download className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <h2 id="hipaa">HIPAA & Data Security</h2>
      <div className="not-prose bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Your Data is Protected</h4>
            <p className="text-sm text-blue-800 mb-2">
              All reports are HIPAA-compliant. Patient names are only visible to authorized staff.
              Exports are encrypted. No patient data is shared with third parties.
            </p>
            <p className="text-xs text-blue-700">
              <strong>Best practice:</strong> When exporting patient lists for marketing, only export
              the minimum needed (name + contact info, not medical history).
            </p>
          </div>
        </div>
      </div>

      <h2 id="available-reports">All Available Reports</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <Link href="/features/reports/sales" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Sales Reports</h3>
          </div>
          <p className="text-sm text-gray-500">Revenue by service, provider, payment method. Daily/weekly/monthly trends.</p>
        </Link>
        <Link href="/features/reports/appointments" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Appointment Analytics</h3>
          </div>
          <p className="text-sm text-gray-500">Booking rates, no-shows, cancellations, utilization by provider.</p>
        </Link>
        <Link href="/features/reports/outcomes" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Treatment Outcomes</h3>
          </div>
          <p className="text-sm text-gray-500">Track patient progress, treatment effectiveness, retention rates.</p>
        </Link>
        <Link href="/features/reports/cash" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Cash Reconciliation</h3>
          </div>
          <p className="text-sm text-gray-500">End-of-day cash drawer reconciliation, payment method breakdown.</p>
        </Link>
        <Link href="/features/reports/referrals" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-pink-600" />
            <h3 className="font-semibold text-gray-900">Referral Analytics</h3>
            <span className="ml-auto px-2 py-1 bg-pink-100 text-pink-800 text-xs font-semibold rounded">NEW</span>
          </div>
          <p className="text-sm text-gray-500">Who refers the most? Which rewards work? ROI on referral program.</p>
        </Link>
        <Link href="/features/reports/acquisition" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-cyan-600" />
            <h3 className="font-semibold text-gray-900">Patient Acquisition</h3>
            <span className="ml-auto px-2 py-1 bg-cyan-100 text-cyan-800 text-xs font-semibold rounded">NEW</span>
          </div>
          <p className="text-sm text-gray-500">Marketing channel performance, cost per patient, conversion rates.</p>
        </Link>
      </div>

      <h2 id="coming-soon">Advanced Analytics (Coming Soon)</h2>
      <p>
        We&apos;re building predictive analytics powered by AI. Here&apos;s what&apos;s coming:
      </p>

      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Churn Prediction</h3>
          </div>
          <p className="text-sm text-purple-700">AI identifies patients likely to leave in the next 30 days (before they&apos;re gone). Auto-generates win-back tasks.</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Revenue Forecasting</h3>
          </div>
          <p className="text-sm text-purple-700">Predict next month&apos;s revenue based on booking trends, seasonal patterns, and historical data.</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Smart Upsell Suggestions</h3>
          </div>
          <p className="text-sm text-purple-700">&quot;Patients who get Botox also get fillers 67% of the time.&quot; Show staff what to recommend to each patient.</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Automated Weekly Summary</h3>
          </div>
          <p className="text-sm text-purple-700">Every Monday at 8am: email with last week&apos;s revenue, top performers, at-risk patients, and action items.</p>
        </div>
      </div>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/billing" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Billing & Payments</h3>
          <p className="text-sm text-gray-500">Where revenue data comes from</p>
        </Link>
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar & Scheduling</h3>
          <p className="text-sm text-gray-500">Where appointment data comes from</p>
        </Link>
        <Link href="/features/patients" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Patient Management</h3>
          <p className="text-sm text-gray-500">Patient history and lifetime value</p>
        </Link>
        <Link href="/features/inventory" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Inventory Tracking</h3>
          <p className="text-sm text-gray-500">Cost of goods sold (COGS) for profitability</p>
        </Link>
      </div>
    </div>
  )
}
