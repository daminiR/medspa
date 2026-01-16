import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { BarChart3, Clock, ArrowRight, ExternalLink } from 'lucide-react'

export default function QuickBooksIntegrationPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-amber-100">
          <BarChart3 className="w-6 h-6 text-amber-600" />
        </div>
        <span className="status-badge coming-soon">
          <Clock className="w-3 h-3" /> Coming Soon
        </span>
      </div>
      <h1>QuickBooks Integration</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Sync your Luxe MedSpa financial data directly to QuickBooks Online for seamless accounting
        and bookkeeping.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="QuickBooks Integration Preview"
        duration="Coming Soon"
        description="This integration is currently in development"
      />

      <Callout type="info">
        <strong>Status:</strong> The QuickBooks integration is on our roadmap and will be available in Q2 2025.
        Sign up for notifications to be alerted when it launches.
      </Callout>

      <h2 id="overview">What This Integration Does</h2>
      <p>
        When available, the QuickBooks integration will provide:
      </p>

      <div className="not-prose grid gap-3 my-6">
        <div className="flex gap-3 p-3 border border-gray-200 rounded-lg">
          <ArrowRight className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900">Automatic Invoice Sync</h4>
            <p className="text-sm text-gray-500">Invoices created in Luxe MedSpa sync to QuickBooks automatically</p>
          </div>
        </div>
        <div className="flex gap-3 p-3 border border-gray-200 rounded-lg">
          <ArrowRight className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900">Payment Recording</h4>
            <p className="text-sm text-gray-500">Payments processed through Stripe automatically record in QuickBooks</p>
          </div>
        </div>
        <div className="flex gap-3 p-3 border border-gray-200 rounded-lg">
          <ArrowRight className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900">Customer Synchronization</h4>
            <p className="text-sm text-gray-500">Patient/customer information stays in sync across both platforms</p>
          </div>
        </div>
        <div className="flex gap-3 p-3 border border-gray-200 rounded-lg">
          <ArrowRight className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900">Real-Time Reporting</h4>
            <p className="text-sm text-gray-500">Pull real-time financial reports without manual entry</p>
          </div>
        </div>
        <div className="flex gap-3 p-3 border border-gray-200 rounded-lg">
          <ArrowRight className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900">Account Mapping</h4>
            <p className="text-sm text-gray-500">Map services and products to QuickBooks accounts for detailed tracking</p>
          </div>
        </div>
        <div className="flex gap-3 p-3 border border-gray-200 rounded-lg">
          <ArrowRight className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900">Expense Tracking</h4>
            <p className="text-sm text-gray-500">Track business expenses and product costs for profitability analysis</p>
          </div>
        </div>
      </div>

      <h2 id="benefits">Why QuickBooks Integration?</h2>

      <h3>Eliminate Manual Data Entry</h3>
      <p>
        Instead of manually re-entering invoices and payments into QuickBooks, let the systems talk
        to each other automatically. Save hours each week and eliminate transcription errors.
      </p>

      <h3>Get Accurate Financial Reports</h3>
      <p>
        With real-time data sync, your QuickBooks reports will always be current. Generate profit
        and loss statements, balance sheets, and cash flow reports instantly—no waiting for month-end close.
      </p>

      <h3>Simplify Tax Preparation</h3>
      <p>
        When your accountant needs financial data for tax return preparation, it will all be
        properly categorized and organized in QuickBooks. Tax time becomes much easier.
      </p>

      <h3>Track Profitability by Service</h3>
      <p>
        See which services are most profitable by mapping them to QuickBooks cost centers.
        Understand your business at a deeper level and make data-driven pricing decisions.
      </p>

      <h2 id="requirements">Requirements</h2>
      <p>
        When this integration becomes available, you&apos;ll need:
      </p>
      <ul>
        <li>QuickBooks Online account (subscription required)</li>
        <li>Admin access to your QuickBooks company file</li>
        <li>Stripe integration already configured (for payment sync)</li>
        <li>Services and products set up in Luxe MedSpa</li>
      </ul>

      <Callout type="tip" title="QuickBooks Online Only">
        This integration will work with QuickBooks Online. QuickBooks Desktop support may be added later.
      </Callout>

      <h2 id="setup-preview">Setup Overview (When Available)</h2>
      <p>
        The setup process will be simple and take about 15 minutes:
      </p>

      <StepList steps={[
        {
          title: 'Ensure QuickBooks Online is active',
          description: 'Make sure your QBO subscription is current'
        },
        {
          title: 'Go to Settings → Integrations',
          description: 'Navigate to the integrations section in Luxe MedSpa'
        },
        {
          title: 'Connect to QuickBooks',
          description: 'Click "Connect QuickBooks" and authorize the connection'
        },
        {
          title: 'Map your accounts',
          description: 'Map Luxe MedSpa services to QuickBooks income accounts'
        },
        {
          title: 'Configure sync settings',
          description: 'Choose which data to sync and sync frequency'
        },
        {
          title: 'Run initial sync',
          description: 'Sync your historical data (last 90 days recommended)'
        }
      ]} />

      <h2 id="roadmap">Development Roadmap</h2>
      <p>
        Here&apos;s what we have planned for the QuickBooks integration:
      </p>

      <div className="not-prose space-y-3 my-6">
        <div className="p-4 border-l-4 border-primary-500 bg-primary-50 rounded">
          <h4 className="font-semibold text-primary-900">Phase 1 (Q2 2025): Basic Sync</h4>
          <p className="text-sm text-primary-700 mt-1">Invoice and payment sync with automatic account mapping</p>
        </div>
        <div className="p-4 border-l-4 border-amber-300 bg-amber-50 rounded">
          <h4 className="font-semibold text-amber-900">Phase 2 (Q3 2025): Advanced Features</h4>
          <p className="text-sm text-amber-700 mt-1">Customer sync, expense tracking, and custom field mapping</p>
        </div>
        <div className="p-4 border-l-4 border-gray-300 bg-gray-50 rounded">
          <h4 className="font-semibold text-gray-900">Phase 3 (Q4 2025): Reporting</h4>
          <p className="text-sm text-gray-600 mt-1">Embedded QuickBooks reports and financial dashboards in Luxe MedSpa</p>
        </div>
      </div>

      <h2 id="notify">Get Notified at Launch</h2>
      <p>
        Want to be among the first to use QuickBooks integration? Sign up below and we&apos;ll notify you
        as soon as it&apos;s available.
      </p>

      <div className="not-prose bg-primary-50 border border-primary-200 rounded-lg p-6 my-6">
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="your@businessemail.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-1">
              Business Name
            </label>
            <input
              type="text"
              id="company"
              placeholder="Your Medical Spa"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Notify Me at Launch
          </button>
        </form>
      </div>

      <h2 id="faq">Frequently Asked Questions</h2>

      <h3>Will there be a fee for this integration?</h3>
      <p>
        The QuickBooks integration will be included free with Luxe MedSpa. You only pay your
        regular QuickBooks Online subscription fee.
      </p>

      <h3>Do I need QuickBooks Online or will Desktop work?</h3>
      <p>
        We&apos;re starting with QuickBooks Online only, which is cloud-based and allows for better
        integration. We may add Desktop support later depending on demand.
      </p>

      <h3>Can I customize which data syncs?</h3>
      <p>
        Yes! You&apos;ll be able to choose which invoices, payments, and customer data sync automatically.
        You can also set the sync frequency (real-time, hourly, or daily).
      </p>

      <h3>Will historical data sync?</h3>
      <p>
        Yes, you&apos;ll be able to perform an initial sync of historical data. We recommend syncing the
        last 90 days to ensure accuracy, then setting up automatic daily/real-time sync going forward.
      </p>

      <h3>What if there&apos;s a conflict between systems?</h3>
      <p>
        The integration is designed to prevent conflicts through proper account mapping and authorization flows.
        If a conflict does occur, Luxe MedSpa will log it and you can resolve it through the settings.
      </p>

      <h3>Does this work with other accounting software?</h3>
      <p>
        QuickBooks Online is our first accounting software integration. We&apos;re evaluating integrations
        with other platforms like Xero and Wave based on user demand.
      </p>

      <h2 id="related">Related</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/integrations/stripe" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Stripe Payments</h3>
          <p className="text-sm text-gray-500">Collect payments from patients</p>
        </Link>
        <Link href="/features/billing" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Billing & Invoicing</h3>
          <p className="text-sm text-gray-500">Create professional invoices</p>
        </Link>
        <Link href="/features/reporting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Financial Reporting</h3>
          <p className="text-sm text-gray-500">Track revenue and metrics</p>
        </Link>
        <a href="https://quickbooks.intuit.com/online/" target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all flex items-start gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-1">
              QuickBooks Online
              <ExternalLink className="w-3 h-3" />
            </h3>
            <p className="text-sm text-gray-500">Official QuickBooks website</p>
          </div>
        </a>
      </div>
    </div>
  )
}
