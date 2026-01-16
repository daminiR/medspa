import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Zap, CheckCircle2, FileText, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react'

export default function ChartingIntegrationPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Zap className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Auto-Deduction from Charting</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        When you chart a treatment, inventory deducts automatically. No manual entry,
        no reconciliation nightmares. The #1 feature users love about integrated inventory.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Charting Integration Demo"
        duration="3 min"
        description="See auto-deduction in action when charting treatments"
      />

      <Callout type="tip" title="User Feedback">
        &quot;I LOVE that the inventory tracking system deducts inventory units as providers chart procedures.&quot;
        — Aesthetic Record user review (this is what we replicated)
      </Callout>

      <h2 id="how-it-works">How It Works</h2>
      <p>
        When a provider completes a treatment chart, the system automatically:
      </p>

      <StepList steps={[
        {
          title: 'Provider charts treatment',
          description: 'Records products used, units, injection sites in the patient chart',
        },
        {
          title: 'System selects lot',
          description: 'Automatically picks the lot using FIFO (first expiring first out)',
        },
        {
          title: 'Inventory deducts',
          description: 'Units are subtracted from lot. If open vial exists, uses from that first.',
        },
        {
          title: 'Transaction logged',
          description: 'Complete audit trail: who, what, when, which lot, which patient',
        },
        {
          title: 'Alerts generated',
          description: 'If low stock triggered, alerts fire automatically',
        },
      ]} />

      <h2 id="fifo">FIFO Lot Selection</h2>
      <p>
        FIFO (First In First Out) ensures you use oldest stock first, reducing expiration waste.
        The system automatically selects lots in this order:
      </p>
      <ol>
        <li><strong>Open vials:</strong> If there&apos;s an active open vial, use from that first</li>
        <li><strong>Earliest expiration:</strong> Among available lots, pick the one expiring soonest</li>
        <li><strong>Same location:</strong> Prefer lots at the same location as the treatment</li>
      </ol>

      <div className="not-prose bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
        <h4 className="font-semibold text-gray-900 mb-3">Example: Botox Deduction</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-white rounded border">
            <span className="text-gray-600">Treatment charted:</span>
            <span className="font-medium">25 units Botox</span>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded border">
            <span className="text-gray-600">Open vial available?</span>
            <span className="font-medium text-green-600">Yes - 42.5 units remaining</span>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
            <span className="text-green-800">Deducted from:</span>
            <span className="font-medium text-green-800">Open Vial #1 (Lot C3709C3)</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
            <span className="text-green-800">Remaining:</span>
            <span className="font-medium text-green-800">17.5 units</span>
          </div>
        </div>
      </div>

      <h2 id="what-records">What Gets Recorded</h2>
      <p>
        Every auto-deduction creates a complete transaction record:
      </p>
      <ul>
        <li><strong>Product & quantity:</strong> What was used and how much</li>
        <li><strong>Lot number:</strong> For recall tracking (FDA requirement)</li>
        <li><strong>Patient:</strong> Who received this product</li>
        <li><strong>Provider:</strong> Who administered</li>
        <li><strong>Timestamp:</strong> When it happened</li>
        <li><strong>Chart ID:</strong> Link back to the treatment chart</li>
        <li><strong>Injection sites:</strong> Where on the body (if recorded)</li>
        <li><strong>Cost:</strong> Unit cost at time of use</li>
      </ul>

      <Callout type="info">
        This audit trail means you can answer &quot;which patients received lot XYZ?&quot; instantly —
        critical for recall situations.
      </Callout>

      <h2 id="alerts">Automatic Alerts</h2>
      <p>
        When a deduction triggers low stock thresholds, alerts fire automatically:
      </p>

      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Low Stock Warning</h3>
          </div>
          <p className="text-sm text-yellow-700">
            When stock falls below reorder point. &quot;Consider placing an order.&quot;
          </p>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Critical Alert</h3>
          </div>
          <p className="text-sm text-red-700">
            When stock falls below minimum. &quot;Order urgently to avoid stockouts.&quot;
          </p>
        </div>
      </div>

      <h2 id="manual-override">Manual Override</h2>
      <p>
        Sometimes you need to override automatic lot selection:
      </p>
      <ul>
        <li><strong>Specific lot required:</strong> Patient requested same lot as last time</li>
        <li><strong>Training:</strong> Using product for training, not patient treatment</li>
        <li><strong>Adjustment:</strong> Correcting a previous error</li>
      </ul>

      <p>
        In these cases, you can manually select a lot or record a non-charting deduction.
        The system records the override reason for audit purposes.
      </p>

      <h2 id="failed-deductions">Handling Failures</h2>
      <p>
        If auto-deduction fails (e.g., no stock available), the system:
      </p>
      <ol>
        <li>Marks the charting link as &quot;failed&quot;</li>
        <li>Alerts the admin dashboard</li>
        <li>Allows retry or manual override</li>
        <li>Does NOT prevent the chart from being saved</li>
      </ol>

      <Callout type="warning">
        Chart completion should never be blocked by inventory issues. The system will
        flag the discrepancy for later resolution.
      </Callout>

      <h2 id="reconciliation">End-of-Day Reconciliation</h2>
      <p>
        Even with auto-deduction, periodic reconciliation is recommended:
      </p>
      <ul>
        <li><strong>Physical count:</strong> Compare actual vs system quantities</li>
        <li><strong>Open vials:</strong> Check if any need to be closed</li>
        <li><strong>Expiring soon:</strong> Identify products to use first tomorrow</li>
        <li><strong>Failed deductions:</strong> Resolve any that weren&apos;t processed</li>
      </ul>

      <p>
        The system provides a reconciliation report showing expected vs actual,
        making physical counts quick and accurate.
      </p>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting</h3>
          <p className="text-sm text-gray-500">Treatment documentation system</p>
        </Link>
        <Link href="/features/inventory/vials" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Open Vial Tracking</h3>
          <p className="text-sm text-gray-500">How open vials integrate with charting</p>
        </Link>
        <Link href="/features/inventory/lots" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Lot Management</h3>
          <p className="text-sm text-gray-500">FIFO and expiration tracking</p>
        </Link>
        <Link href="/features/inventory/analytics" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Provider Analytics</h3>
          <p className="text-sm text-gray-500">Usage tracking from charting data</p>
        </Link>
      </div>
    </div>
  )
}
