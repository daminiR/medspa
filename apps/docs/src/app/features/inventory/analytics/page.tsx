import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import {
  BarChart3, Users, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, DollarSign, Target, PieChart
} from 'lucide-react'

export default function ProviderAnalyticsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <BarChart3 className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Provider Analytics</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Know exactly who uses what, when, and how it compares to your clinic average.
        Identify waste, training opportunities, and optimize profitability by provider.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Provider Analytics Dashboard"
        duration="5 min"
        description="Learn to identify variance and optimize provider performance"
      />

      <Callout type="info" title="The Accountability Problem">
        &quot;When multiple providers and assistants are pulling from shared stock, things can go missing
        or be misused—especially if no one&apos;s accountable.&quot; — Common medspa owner complaint
      </Callout>

      <h2 id="overview">What We Track</h2>
      <p>
        For each provider, the system tracks and compares:
      </p>
      <ul>
        <li><strong>Total units used</strong> per time period</li>
        <li><strong>Average units per treatment</strong> compared to clinic average</li>
        <li><strong>Usage by product</strong> (Botox, Dysport, fillers, etc.)</li>
        <li><strong>Usage by area</strong> (forehead, glabella, crow&apos;s feet, etc.)</li>
        <li><strong>Waste percentage</strong> and cost impact</li>
        <li><strong>Revenue and profit margin</strong> generated</li>
      </ul>

      <h2 id="variance">Variance Detection</h2>
      <p>
        The key insight is <strong>variance from average</strong>. When a provider uses significantly
        more or less product than others, it&apos;s worth investigating:
      </p>

      <div className="not-prose bg-white border border-gray-200 rounded-lg overflow-hidden my-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h4 className="font-semibold text-gray-900">Provider Comparison — Last 30 Days</h4>
          <p className="text-sm text-gray-500">Clinic average: 25.5 units per treatment</p>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-semibold">SL</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Dr. Susan Lo</div>
                <div className="text-sm text-gray-500">48 treatments • 1,200 units</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">25.0 avg</div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-sm">
                <TrendingDown className="w-3 h-3" />
                -2% vs avg
              </span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-semibold">MG</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Dr. Maria Garcia</div>
                <div className="text-sm text-gray-500">42 treatments • 980 units</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">23.3 avg</div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-sm">
                <TrendingDown className="w-3 h-3" />
                -8% vs avg
              </span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between bg-orange-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-700 font-semibold">JK</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">NP Jennifer Kim</div>
                <div className="text-sm text-gray-500">52 treatments • 1,680 units</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">32.3 avg</div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-sm">
                <AlertTriangle className="w-3 h-3" />
                +27% vs avg
              </span>
            </div>
          </div>
        </div>
      </div>

      <Callout type="warning" title="High Variance Alert">
        NP Jennifer Kim uses 27% more product per treatment than average. This could indicate:
        technique differences, over-treatment, or waste. Review and discuss with the provider.
      </Callout>

      <h2 id="interpreting">Interpreting Variance</h2>
      <p>
        Variance isn&apos;t inherently bad — context matters:
      </p>

      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            High Usage Might Mean
          </h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Over-treatment (potential patient safety issue)</li>
            <li>• Inefficient technique (training opportunity)</li>
            <li>• Product waste during draw-up</li>
            <li>• Different patient mix (heavier musculature)</li>
            <li>• More touch-up appointments</li>
          </ul>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Low Usage Might Mean
          </h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Efficient, precise technique</li>
            <li>• Under-treatment (patient outcomes?)</li>
            <li>• Different patient mix (lighter musculature)</li>
            <li>• More conservative approach</li>
            <li>• Fewer touch-ups needed</li>
          </ul>
        </div>
      </div>

      <h2 id="by-product">Usage by Product</h2>
      <p>
        Break down each provider&apos;s usage by product to find specific patterns:
      </p>

      <div className="not-prose bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
        <h4 className="font-semibold text-gray-900 mb-4">NP Jennifer Kim — Product Breakdown</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Botox® Cosmetic</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">30.7 avg/tx</span>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-sm">+25%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Dysport®</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">72 avg/tx</span>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-sm">+26%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Juvéderm Voluma</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">1.6 avg/tx</span>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-sm">+14%</span>
            </div>
          </div>
        </div>
      </div>

      <h2 id="waste">Waste Tracking</h2>
      <p>
        Track waste by provider to identify who may need additional training:
      </p>
      <ul>
        <li><strong>Draw-up loss:</strong> Residual left in vials (industry avg: 5 units/vial)</li>
        <li><strong>Stability expiration:</strong> Product expired before use</li>
        <li><strong>Patient no-shows:</strong> Reconstituted for patient who didn&apos;t come</li>
        <li><strong>Other waste:</strong> Contamination, drops, accidents</li>
      </ul>

      <div className="not-prose bg-red-50 border border-red-200 rounded-lg p-4 my-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900">High Waste Alert: NP Jennifer Kim</h4>
            <p className="text-sm text-red-700 mt-1">
              8.4% waste rate vs clinic average of 4.5%. Review vial management and reconstitution practices.
              Potential savings: $420/month by reducing waste to average.
            </p>
          </div>
        </div>
      </div>

      <h2 id="profitability">Profitability by Provider</h2>
      <p>
        The ultimate metric: which providers are most profitable?
      </p>

      <div className="not-prose overflow-x-auto my-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left">Provider</th>
              <th className="border border-gray-200 px-4 py-2 text-right">Revenue</th>
              <th className="border border-gray-200 px-4 py-2 text-right">COGS</th>
              <th className="border border-gray-200 px-4 py-2 text-right">Waste</th>
              <th className="border border-gray-200 px-4 py-2 text-right">Gross Profit</th>
              <th className="border border-gray-200 px-4 py-2 text-right">Margin</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-4 py-2">Dr. Susan Lo</td>
              <td className="border border-gray-200 px-4 py-2 text-right">$18,500</td>
              <td className="border border-gray-200 px-4 py-2 text-right">$5,100</td>
              <td className="border border-gray-200 px-4 py-2 text-right text-red-600">$163</td>
              <td className="border border-gray-200 px-4 py-2 text-right text-green-600">$13,237</td>
              <td className="border border-gray-200 px-4 py-2 text-right font-semibold text-green-600">71.5%</td>
            </tr>
            <tr className="bg-gray-50/50">
              <td className="border border-gray-200 px-4 py-2">Dr. Maria Garcia</td>
              <td className="border border-gray-200 px-4 py-2 text-right">$15,200</td>
              <td className="border border-gray-200 px-4 py-2 text-right">$4,160</td>
              <td className="border border-gray-200 px-4 py-2 text-right text-red-600">$75</td>
              <td className="border border-gray-200 px-4 py-2 text-right text-green-600">$10,965</td>
              <td className="border border-gray-200 px-4 py-2 text-right font-semibold text-green-600">72.1%</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2">NP Jennifer Kim</td>
              <td className="border border-gray-200 px-4 py-2 text-right">$22,400</td>
              <td className="border border-gray-200 px-4 py-2 text-right">$7,140</td>
              <td className="border border-gray-200 px-4 py-2 text-right text-red-600">$600</td>
              <td className="border border-gray-200 px-4 py-2 text-right text-green-600">$14,660</td>
              <td className="border border-gray-200 px-4 py-2 text-right font-semibold text-orange-600">65.4%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Despite higher revenue, NP Jennifer Kim has the lowest margin due to higher product
        usage and waste. This data enables targeted coaching conversations.
      </p>

      <h2 id="actions">Taking Action</h2>
      <p>
        When you identify variance, here&apos;s what to do:
      </p>
      <ul>
        <li><strong>Review with provider:</strong> Non-judgmental conversation about technique</li>
        <li><strong>Shadow sessions:</strong> Observe their injection process</li>
        <li><strong>Compare outcomes:</strong> Are high-usage providers getting better results?</li>
        <li><strong>Training:</strong> Consider advanced injection technique courses</li>
        <li><strong>Set benchmarks:</strong> Establish acceptable variance ranges</li>
      </ul>

      <Callout type="tip">
        The goal isn&apos;t to punish high users — it&apos;s to understand why and optimize.
        Sometimes high usage is justified; sometimes it&apos;s a training opportunity.
      </Callout>

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
        <Link href="/features/reports" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Reports</h3>
          <p className="text-sm text-gray-500">Broader analytics and reporting</p>
        </Link>
        <Link href="/features/settings/users" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">User Management</h3>
          <p className="text-sm text-gray-500">Manage provider accounts</p>
        </Link>
      </div>
    </div>
  )
}
