import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import {
  Package, Clock, AlertTriangle, CheckCircle2, Shield, Calendar,
  Barcode, ThermometerSun, FileText
} from 'lucide-react'

export default function LotsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Barcode className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Lot &amp; Expiration Management</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        FDA-compliant lot tracking with FEFO (First Expire First Out) expiration management.
        Know exactly which products came from which lot, and never let expensive inventory expire.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Lot Management Overview"
        duration="4 min"
        description="Learn how to receive, track, and manage inventory lots"
      />

      <Callout type="info" title="Why Lot Tracking Matters">
        If there&apos;s ever a product recall, you need to identify which patients received
        the affected lot within 10 business days (FDA requirement). Without proper tracking,
        this is nearly impossible.
      </Callout>

      <h2 id="what-is-lot">What is a Lot?</h2>
      <p>
        A lot (or batch) is a group of products manufactured together with the same:
      </p>
      <ul>
        <li><strong>Lot number:</strong> Unique identifier (e.g., &quot;C3709C3&quot;)</li>
        <li><strong>Manufacturing date:</strong> When the batch was produced</li>
        <li><strong>Expiration date:</strong> When the batch expires</li>
        <li><strong>Quality characteristics:</strong> Same formulation, same quality</li>
      </ul>

      <p>
        When you receive inventory, you&apos;re receiving specific lots. Each vial in a shipment
        has the same lot number printed on it.
      </p>

      <h2 id="receiving">Receiving Inventory</h2>
      <p>
        When you receive a shipment, record each lot:
      </p>

      <div className="not-prose bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
        <h4 className="font-semibold text-gray-900 mb-4">New Lot Entry</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Product</label>
              <div className="font-medium">Botox® Cosmetic (100U)</div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Quantity</label>
              <div className="font-medium">5 vials (500 units)</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Lot Number</label>
              <div className="font-medium font-mono">C3710D4</div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Expiration Date</label>
              <div className="font-medium">Dec 31, 2025</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Vendor</label>
              <div className="font-medium">Allergan Aesthetics</div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Invoice #</label>
              <div className="font-medium">ALG-INV-2024-002</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Storage Location</label>
              <div className="font-medium">Fridge A, Shelf 1</div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Unit Cost</label>
              <div className="font-medium">$420/vial</div>
            </div>
          </div>
        </div>
      </div>

      <h2 id="fefo">FEFO: First Expire First Out</h2>
      <p>
        FEFO ensures you use products closest to expiration first, minimizing waste:
      </p>

      <div className="not-prose bg-white border border-gray-200 rounded-lg overflow-hidden my-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h4 className="font-semibold text-gray-900">Botox Lots — Usage Priority</h4>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="p-4 flex items-center justify-between bg-orange-50/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded">USE FIRST</span>
                <span className="font-mono text-sm">C3700A1</span>
              </div>
              <div className="text-sm text-gray-500">30 units remaining</div>
            </div>
            <div className="text-right">
              <div className="text-orange-600 font-semibold">Exp: Jan 15, 2025</div>
              <div className="text-sm text-orange-600">28 days</div>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">2ND</span>
                <span className="font-mono text-sm">C3709C3</span>
              </div>
              <div className="text-sm text-gray-500">420 units remaining</div>
            </div>
            <div className="text-right">
              <div className="text-gray-900">Exp: Dec 31, 2025</div>
              <div className="text-sm text-gray-500">378 days</div>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">3RD</span>
                <span className="font-mono text-sm">C3710D4</span>
              </div>
              <div className="text-sm text-gray-500">400 units remaining</div>
            </div>
            <div className="text-right">
              <div className="text-gray-900">Exp: Jun 30, 2026</div>
              <div className="text-sm text-gray-500">560 days</div>
            </div>
          </div>
        </div>
      </div>

      <h2 id="expiration-alerts">Expiration Alerts</h2>
      <p>
        The system monitors expiration dates and alerts you proactively:
      </p>

      <div className="not-prose grid gap-4 md:grid-cols-3 mb-8">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">90 Days</h3>
          </div>
          <p className="text-sm text-blue-700">Notice: Plan to use this lot in upcoming appointments.</p>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">30 Days</h3>
          </div>
          <p className="text-sm text-yellow-700">Warning: Prioritize this lot. Consider discounting treatments.</p>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">7 Days</h3>
          </div>
          <p className="text-sm text-red-700">Critical: Use immediately or prepare to write off as waste.</p>
        </div>
      </div>

      <Callout type="warning" title="Expired Products">
        Once a lot expires, the system blocks usage. Any remaining units must be documented
        as waste. Using expired products is a compliance violation.
      </Callout>

      <h2 id="storage">Storage Requirements</h2>
      <p>
        Track storage requirements for each product:
      </p>

      <div className="not-prose overflow-x-auto my-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left">Product</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Temperature</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Light Sensitive</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Special Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-4 py-2">Botox®</td>
              <td className="border border-gray-200 px-4 py-2">2-8°C (Refrigerated)</td>
              <td className="border border-gray-200 px-4 py-2">Yes</td>
              <td className="border border-gray-200 px-4 py-2">Use within 24h of reconstitution</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="border border-gray-200 px-4 py-2">Dysport®</td>
              <td className="border border-gray-200 px-4 py-2">2-8°C (Refrigerated)</td>
              <td className="border border-gray-200 px-4 py-2">Yes</td>
              <td className="border border-gray-200 px-4 py-2">Use within 4h of reconstitution</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2">Xeomin®</td>
              <td className="border border-gray-200 px-4 py-2">20-25°C (Room temp)</td>
              <td className="border border-gray-200 px-4 py-2">No</td>
              <td className="border border-gray-200 px-4 py-2">Use within 24h of reconstitution</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="border border-gray-200 px-4 py-2">Juvederm®</td>
              <td className="border border-gray-200 px-4 py-2">2-25°C (Flexible)</td>
              <td className="border border-gray-200 px-4 py-2">No</td>
              <td className="border border-gray-200 px-4 py-2">Do not freeze</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="recall-tracking">Recall Tracking</h2>
      <p>
        If a manufacturer issues a recall, you need to:
      </p>
      <ol>
        <li><strong>Identify affected lot:</strong> Search by lot number</li>
        <li><strong>Find patients:</strong> See all patients who received that lot</li>
        <li><strong>Contact patients:</strong> Notify them of the recall</li>
        <li><strong>Quarantine remaining:</strong> Mark unused stock as quarantined</li>
        <li><strong>Document disposal:</strong> Record how/when remaining stock was disposed</li>
      </ol>

      <div className="not-prose bg-red-50 border border-red-200 rounded-lg p-4 my-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900">Recall Example: Lot C3700A1</h4>
            <p className="text-sm text-red-700 mt-1 mb-3">
              Manufacturer issued recall. System found:
            </p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• 12 patients received from this lot</li>
              <li>• 30 units remaining (quarantined)</li>
              <li>• Patient contact info ready for export</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 id="audit-trail">Audit Trail</h2>
      <p>
        Every lot has a complete history:
      </p>
      <ul>
        <li><strong>Receipt:</strong> When received, from whom, by whom</li>
        <li><strong>Usage:</strong> Every deduction with patient/provider details</li>
        <li><strong>Adjustments:</strong> Any manual adjustments with reasons</li>
        <li><strong>Status changes:</strong> Quarantine, release, disposal</li>
      </ul>

      <p>
        This audit trail is retained for the required period (typically 2+ years)
        and can be exported for compliance reviews.
      </p>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/inventory" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Inventory Overview</h3>
          <p className="text-sm text-gray-500">Full inventory management system</p>
        </Link>
        <Link href="/features/inventory/vials" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Open Vial Tracking</h3>
          <p className="text-sm text-gray-500">Multi-patient vial management</p>
        </Link>
        <Link href="/features/inventory/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting Integration</h3>
          <p className="text-sm text-gray-500">Auto-deduction with lot selection</p>
        </Link>
        <Link href="/features/reports" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Reports</h3>
          <p className="text-sm text-gray-500">Inventory reports and exports</p>
        </Link>
      </div>
    </div>
  )
}
