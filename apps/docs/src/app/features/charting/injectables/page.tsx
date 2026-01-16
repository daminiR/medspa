import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Syringe, Clock, Target, Droplet, Package } from 'lucide-react'

export default function InjectableTrackingPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Syringe className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Clock className="w-3 h-3" /> In Progress
        </span>
      </div>
      <h1>Injectable Tracking</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Know exactly what went where. 3D face mapping, precise unit counts, and
        automatic inventory deduction make injectable charting fast and accurate.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        A patient returns in 4 months saying &quot;I want exactly what I had last time.&quot;
        With precise injectable tracking, you can reproduce results perfectly - down
        to the exact injection points and unit counts.
      </p>

      <h2 id="3d-mapping">3D Face Mapping</h2>
      <p>
        Tap injection points directly on a 3D face model:
      </p>
      <ul>
        <li><strong>Rotate to any angle</strong> &mdash; Front, profile, 3/4 view</li>
        <li><strong>Tap to place</strong> &mdash; Mark each injection site</li>
        <li><strong>Enter units</strong> &mdash; Amount at each point</li>
        <li><strong>Color coding</strong> &mdash; Different products in different colors</li>
      </ul>

      <div className="not-prose p-4 bg-gray-50 rounded-lg mb-6">
        <p className="text-sm text-gray-600 mb-2">Example: Botox Treatment</p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Glabella: 20u</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Forehead: 12u</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Crow&apos;s feet: 12u</span>
          </div>
        </div>
      </div>

      <h2 id="products">Product Documentation</h2>
      <p>
        For each injectable used:
      </p>
      <ul>
        <li><strong>Product name</strong> &mdash; Botox, Dysport, Juvederm, etc.</li>
        <li><strong>Lot number</strong> &mdash; Auto-populated from inventory</li>
        <li><strong>Expiration date</strong> &mdash; Tracked for safety</li>
        <li><strong>Total units/ml</strong> &mdash; Sum of all injection points</li>
      </ul>

      <Callout type="tip" title="Dilution Tracking">
        Record your dilution ratio (e.g., 2ml saline per 100u Botox). Important for
        consistent results and if other providers treat your patients.
      </Callout>

      <h2 id="templates">Treatment Templates</h2>
      <p>
        Save common treatment patterns:
      </p>
      <ul>
        <li><strong>Standard Botox</strong> &mdash; Your typical forehead pattern</li>
        <li><strong>Lip flip</strong> &mdash; Pre-set injection points</li>
        <li><strong>Full face filler</strong> &mdash; Multi-area template</li>
        <li><strong>Custom templates</strong> &mdash; Create your own patterns</li>
      </ul>
      <p>
        Templates save time while ensuring consistency across patients.
      </p>

      <h2 id="history">Treatment History</h2>
      <p>
        View previous treatments:
      </p>
      <ul>
        <li><strong>Side-by-side comparison</strong> &mdash; This visit vs. last visit</li>
        <li><strong>Unit trends</strong> &mdash; Has dosage changed over time?</li>
        <li><strong>Product history</strong> &mdash; What have they tried?</li>
        <li><strong>Response notes</strong> &mdash; How long did results last?</li>
      </ul>

      <h2 id="inventory">Inventory Integration</h2>
      <p>
        Seamless inventory management:
      </p>
      <ul>
        <li><strong>Auto-deduct</strong> &mdash; Units removed from inventory when charted</li>
        <li><strong>Lot selection</strong> &mdash; Choose from available vials</li>
        <li><strong>Open vial tracking</strong> &mdash; Use partially-used vials first</li>
        <li><strong>Waste documentation</strong> &mdash; Record any discarded product</li>
      </ul>

      <Callout type="info" title="Provider Analytics">
        Track units per area over time. See if your injection technique is consistent
        or if certain patients need more/less product than average.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/charting/soap" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SOAP Notes</h3>
          <p className="text-sm text-gray-500">Complete clinical documentation</p>
        </Link>
        <Link href="/features/inventory/vials" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Open Vial Tracking</h3>
          <p className="text-sm text-gray-500">Manage partially-used vials</p>
        </Link>
      </div>
    </div>
  )
}
