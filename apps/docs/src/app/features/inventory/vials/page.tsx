import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Droplet, Clock, Users, AlertTriangle, CheckCircle2, Play, Pause, X } from 'lucide-react'

export default function OpenVialsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Droplet className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Open Vial Tracking</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Track multi-patient usage from a single vial with fractional precision, stability timers,
        and complete audit trails. The feature competitors can&apos;t match.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Open Vial Tracking Demo"
        duration="4 min"
        description="See how to open, use, and close vials with multi-patient tracking"
      />

      <Callout type="tip" title="Why This Matters">
        A single Botox vial often serves 3-5 patients. Without proper tracking, you can&apos;t
        know your true cost per patient, waste percentage, or which lot went to whom.
      </Callout>

      <h2 id="concept">How It Works</h2>
      <p>
        When you reconstitute a neurotoxin vial, a timer starts. You have a limited window
        (24 hours for Botox, 4 hours for Dysport) to use that vial. During that time,
        multiple patients may receive units from the same vial.
      </p>

      <p>Our system tracks:</p>
      <ul>
        <li><strong>Opening:</strong> When the vial was reconstituted and by whom</li>
        <li><strong>Usage:</strong> Each patient draw with exact units (including fractional)</li>
        <li><strong>Stability:</strong> Live countdown to expiration</li>
        <li><strong>Closing:</strong> When depleted, expired, or manually closed</li>
        <li><strong>Cost:</strong> Real cost per unit used, accounting for waste</li>
      </ul>

      <h2 id="opening">Opening a Vial</h2>

      <StepList steps={[
        {
          title: 'Select the lot',
          description: 'Choose which lot to open from (system shows FEFO - first expiring first out)',
        },
        {
          title: 'Record reconstitution',
          description: 'Enter diluent type, volume, and who reconstituted the vial',
        },
        {
          title: 'Timer starts',
          description: 'Stability countdown begins based on product (24h Botox, 4h Dysport, etc.)',
        },
        {
          title: 'Vial is active',
          description: 'Appears in Open Vials panel, ready for patient draws',
        },
      ]} />

      <h2 id="using">Using From a Vial</h2>
      <p>
        When treating a patient, select the open vial and record the draw:
      </p>

      <div className="not-prose bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
        <h4 className="font-semibold text-gray-900 mb-4">Usage Recording</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
            <div>
              <span className="text-sm text-gray-500">Patient</span>
              <div className="font-medium">Sarah Johnson</div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">Units Used</span>
              <div className="font-medium text-purple-600">27.5 units</div>
            </div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-100">
            <span className="text-sm text-gray-500">Areas Injected</span>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">Forehead: 12u</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">Glabella: 10u</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">Crow&apos;s Feet: 5.5u</span>
            </div>
          </div>
        </div>
      </div>

      <p>
        Note the <strong>fractional units</strong> (27.5, 5.5). Real treatments rarely use
        perfectly round numbers. Our competitors can&apos;t track this level of precision.
      </p>

      <h2 id="stability">Stability Timer</h2>
      <p>
        Each product has specific stability requirements after reconstitution:
      </p>

      <div className="not-prose overflow-x-auto my-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left">Product</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Stability Period</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Storage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-4 py-2">Botox Cosmetic</td>
              <td className="border border-gray-200 px-4 py-2">24 hours</td>
              <td className="border border-gray-200 px-4 py-2">Refrigerated (2-8°C)</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="border border-gray-200 px-4 py-2">Dysport</td>
              <td className="border border-gray-200 px-4 py-2">4 hours</td>
              <td className="border border-gray-200 px-4 py-2">Refrigerated (2-8°C)</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2">Xeomin</td>
              <td className="border border-gray-200 px-4 py-2">24 hours</td>
              <td className="border border-gray-200 px-4 py-2">Room temperature OK</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="border border-gray-200 px-4 py-2">Daxxify</td>
              <td className="border border-gray-200 px-4 py-2">24 hours</td>
              <td className="border border-gray-200 px-4 py-2">Refrigerated (2-8°C)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="warning" title="Expired Vials">
        When a vial expires (stability exceeded), the system automatically closes it
        and records remaining units as waste. You cannot use from an expired vial.
      </Callout>

      <h2 id="closing">Closing a Vial</h2>
      <p>
        Vials can be closed for several reasons:
      </p>

      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Depleted</h3>
          </div>
          <p className="text-sm text-green-700">All units used. Optimal outcome.</p>
        </div>
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-900">Expired</h3>
          </div>
          <p className="text-sm text-orange-700">Stability period exceeded. Remaining units become waste.</p>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Contamination</h3>
          </div>
          <p className="text-sm text-red-700">Suspected contamination. Entire vial discarded.</p>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <X className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Manual Close</h3>
          </div>
          <p className="text-sm text-gray-700">End of day or other reason. Document remaining as waste.</p>
        </div>
      </div>

      <h2 id="cost-tracking">Cost Analytics</h2>
      <p>
        Each open vial session tracks cost in real-time:
      </p>
      <ul>
        <li><strong>Vial Cost:</strong> Original purchase cost from the lot</li>
        <li><strong>Cost Per Unit Used:</strong> Calculated as you go: vial cost ÷ units used</li>
        <li><strong>Revenue Generated:</strong> Total billed from this vial (if connected to billing)</li>
        <li><strong>Profit Margin:</strong> Real margin accounting for waste</li>
      </ul>

      <div className="not-prose bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 my-6">
        <h4 className="font-semibold text-green-900 mb-2">Example: Botox Vial Economics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">$420</div>
            <div className="text-sm text-gray-600">Vial Cost</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">95 units</div>
            <div className="text-sm text-gray-600">Used (of 100)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">$4.42</div>
            <div className="text-sm text-gray-600">Cost/Unit</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">68%</div>
            <div className="text-sm text-gray-600">Margin</div>
          </div>
        </div>
        <p className="text-sm text-green-700 mt-3">
          5 units wasted (5%). Industry average is 5-10 units/vial. You&apos;re doing great!
        </p>
      </div>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/inventory" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Inventory Overview</h3>
          <p className="text-sm text-gray-500">Full inventory management system</p>
        </Link>
        <Link href="/features/inventory/analytics" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Provider Analytics</h3>
          <p className="text-sm text-gray-500">Usage comparison by provider</p>
        </Link>
        <Link href="/features/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting</h3>
          <p className="text-sm text-gray-500">Where treatments are documented</p>
        </Link>
        <Link href="/features/inventory/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Auto-Deduction</h3>
          <p className="text-sm text-gray-500">Automatic inventory updates from charting</p>
        </Link>
      </div>
    </div>
  )
}
