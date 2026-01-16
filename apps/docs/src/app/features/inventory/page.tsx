import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { ComparisonTable } from '@/components/docs/ComparisonTable'
import Link from 'next/link'
import {
  Package, Clock, Users, BarChart3, Droplet, AlertTriangle,
  CheckCircle2, Syringe, DollarSign, Shield, Zap, Link2
} from 'lucide-react'

export default function InventoryPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Package className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Clock className="w-3 h-3" /> 75% Complete
        </span>
      </div>
      <h1>Inventory Management</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        The only inventory system built specifically for injectable practices. Track every unit,
        across every vial, to every patient &mdash; with fractional precision that competitors can&apos;t match.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Inventory Management Overview"
        duration="6 min"
        description="See how multi-patient vial tracking and provider analytics work"
      />

      {/* Key Differentiator Callout */}
      <div className="not-prose bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 my-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Droplet className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              What Makes Us Different
            </h3>
            <p className="text-purple-800 mb-4">
              Unlike Mangomint (can&apos;t track half syringes) or Boulevard (no expiration tracking),
              we built inventory from the ground up for injectable treatments:
            </p>
            <ul className="space-y-2 text-purple-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <strong>Fractional units</strong> &mdash; Track 12.5 units, not just whole numbers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <strong>Multi-patient vials</strong> &mdash; One Botox vial across 4 patients
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <strong>Stability timers</strong> &mdash; 24hr countdown after reconstitution
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <strong>Provider accountability</strong> &mdash; Who used what, when
              </li>
            </ul>
          </div>
        </div>
      </div>

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Open Vial Tracking</h3>
          </div>
          <p className="text-sm text-gray-500">
            Track one vial across multiple patients with live stability countdown and fractional units.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Provider Analytics</h3>
          </div>
          <p className="text-sm text-gray-500">
            Compare usage by provider, identify variance, and spot waste or training opportunities.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Auto-Deduction</h3>
          </div>
          <p className="text-sm text-gray-500">
            Chart a treatment and inventory deducts automatically. No manual entry needed.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Allē &amp; ASPIRE Ready</h3>
          </div>
          <p className="text-sm text-gray-500">
            Integration hooks for Allergan and Galderma loyalty programs. Log treatments automatically.
          </p>
        </div>
      </div>

      <h2 id="problem">The Problem We Solve</h2>
      <p>
        Inventory is the <strong>#2 expense</strong> in medical spas after payroll. Yet most practices:
      </p>
      <ul>
        <li>Use Excel spreadsheets with no real-time tracking</li>
        <li>Lose <strong>$50-60 per vial</strong> to improper extraction and waste</li>
        <li>Can&apos;t answer &quot;which provider uses more product than average?&quot;</li>
        <li>Don&apos;t know true cost-per-treatment for profitable pricing</li>
        <li>Discover expired $1,000 HA boxes in the back of drawers</li>
      </ul>

      <Callout type="tip" title="Industry Insight">
        If your inventory variance exceeds 5%, you have a problem. Our provider analytics
        help you identify whether it&apos;s waste, technique differences, or something else.
      </Callout>

      <h2 id="vial-tracking">Multi-Patient Vial Tracking</h2>
      <p>
        When you reconstitute a Botox vial, you have 24 hours to use it. In that time,
        you might treat 3-5 patients from the same vial. Our system tracks:
      </p>

      <div className="not-prose bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
            <div>
              <h4 className="font-semibold text-gray-900">Botox® Cosmetic</h4>
              <p className="text-sm text-gray-500">Lot: C3709C3 • Vial #1</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-600">42.5 units left</div>
              <div className="text-sm text-orange-600">18h remaining</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div className="p-2 bg-white rounded border">
              <div className="font-bold text-gray-900">100</div>
              <div className="text-gray-500 text-xs">Original</div>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="font-bold text-blue-600">52.5</div>
              <div className="text-gray-500 text-xs">Used</div>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="font-bold text-green-600">3</div>
              <div className="text-gray-500 text-xs">Patients</div>
            </div>
            <div className="p-2 bg-white rounded border">
              <div className="font-bold text-red-600">5</div>
              <div className="text-gray-500 text-xs">Waste</div>
            </div>
          </div>
        </div>
      </div>

      <p>
        Notice the <strong>fractional units</strong> (42.5, 52.5). Competitors like Mangomint
        can&apos;t track half syringes. We can track to decimal precision because real treatments
        rarely use round numbers.
      </p>

      <h2 id="provider-analytics">Provider Accountability</h2>
      <p>
        &quot;When multiple providers pull from shared stock, things can go missing.&quot;
        Our analytics show usage per provider compared to clinic averages:
      </p>

      <div className="not-prose bg-white border border-gray-200 rounded-lg overflow-hidden my-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h4 className="font-semibold text-gray-900">Provider Usage Comparison</h4>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Dr. Susan Lo</div>
              <div className="text-sm text-gray-500">48 treatments • 1,250 units</div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                -2.3% vs avg
              </span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">NP Jennifer Kim</div>
              <div className="text-sm text-gray-500">52 treatments • 1,680 units</div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                +26.8% vs avg
              </span>
            </div>
          </div>
        </div>
      </div>

      <Callout type="warning" title="Variance Alert">
        When a provider is 20%+ above average, the system alerts you. This could indicate
        technique differences, over-treatment, or waste. Review and address proactively.
      </Callout>

      <h2 id="auto-deduction">Charting Integration</h2>
      <p>
        The #1 feature users love: <strong>auto-deduction when charting</strong>. When your
        provider completes a treatment chart, inventory automatically:
      </p>
      <ul>
        <li>Deducts from the correct lot (FIFO - first expiring first out)</li>
        <li>Records which patient received which lot number</li>
        <li>Tracks the provider who administered</li>
        <li>Updates real-time stock levels</li>
        <li>Triggers low-stock alerts if needed</li>
      </ul>

      <p>
        No manual inventory entry. No reconciliation nightmares. Just accurate tracking
        that happens automatically as you work.
      </p>

      <h2 id="compliance">FDA Compliance Built In</h2>
      <p>
        Medical spa inventory requires proper compliance tracking:
      </p>

      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Lot Tracking</h3>
          </div>
          <p className="text-sm text-gray-500">
            Every unit linked to lot number. If there&apos;s ever a recall, know exactly which patients received which products.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Expiration Alerts</h3>
          </div>
          <p className="text-sm text-gray-500">
            FEFO (First Expire First Out) ensures oldest stock is used first. Alerts before products expire.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Syringe className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Reconstitution Tracking</h3>
          </div>
          <p className="text-sm text-gray-500">
            Track when vials are opened, stability timers, and who reconstituted each vial.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Waste Documentation</h3>
          </div>
          <p className="text-sm text-gray-500">
            Document waste with reason codes. Track cost impact and identify reduction opportunities.
          </p>
        </div>
      </div>

      <h2 id="comparison">How We Compare</h2>

      <ComparisonTable
        showCompetitors={true}
        rows={[
          { feature: 'Fractional unit tracking', luxe: true, mangomint: false, boulevard: false, jane: false },
          { feature: 'Multi-patient vial tracking', luxe: true, mangomint: false, boulevard: false, jane: false },
          { feature: 'Reconstitution stability timer', luxe: true, mangomint: false, boulevard: false, jane: false },
          { feature: 'Provider usage analytics', luxe: true, mangomint: false, boulevard: false, jane: 'partial' },
          { feature: 'Auto-deduction from charting', luxe: true, mangomint: false, boulevard: 'partial', jane: 'partial' },
          { feature: 'Expiration date tracking', luxe: true, mangomint: true, boulevard: false, jane: true },
          { feature: 'Lot number tracking', luxe: true, mangomint: 'partial', boulevard: 'partial', jane: true },
          { feature: 'Allē/ASPIRE integration hooks', luxe: true, mangomint: false, boulevard: false, jane: false },
          { feature: 'Waste tracking with cost impact', luxe: true, mangomint: false, boulevard: false, jane: false },
          { feature: 'Cost-per-treatment analytics', luxe: true, mangomint: false, boulevard: false, jane: false },
        ]}
      />

      <h2 id="coming-soon">Coming Soon</h2>

      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">AI Demand Forecasting</h3>
          <p className="text-sm text-purple-700">
            Predict when you&apos;ll run out based on booking patterns and historical usage.
          </p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Auto Purchase Orders</h3>
          <p className="text-sm text-purple-700">
            Automatically generate POs when stock hits reorder points.
          </p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Vendor Portal Integration</h3>
          <p className="text-sm text-purple-700">
            Direct ordering through Allergan, Galderma, and Merz portals.
          </p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Mobile Scanning</h3>
          <p className="text-sm text-purple-700">
            Scan barcodes with your phone to receive inventory and check stock.
          </p>
        </div>
      </div>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting</h3>
          <p className="text-sm text-gray-500">Inventory deducts when treatments are charted</p>
        </Link>
        <Link href="/features/billing" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Billing & POS</h3>
          <p className="text-sm text-gray-500">Cost of goods flows to profitability reports</p>
        </Link>
        <Link href="/features/reports" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Reports & Analytics</h3>
          <p className="text-sm text-gray-500">Inventory value and usage analytics</p>
        </Link>
        <Link href="/features/inventory/vials" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Open Vial Tracking</h3>
          <p className="text-sm text-gray-500">Deep dive into multi-patient vial management</p>
        </Link>
      </div>
    </div>
  )
}
