import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Tag, CheckCircle2, DollarSign, Package, Percent } from 'lucide-react'

export default function PackagePricingPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Tag className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Package Pricing</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Sell treatment series at a discount. Patients save money, you lock in
        revenue upfront - everyone wins.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        A laser hair removal series of 6 sessions costs $600 each ($3,600). Offer a
        package at $2,800 and patients commit upfront. You get guaranteed revenue,
        they get a discount, and they&apos;re more likely to complete the full treatment.
      </p>

      <h2 id="creating">Creating a Package</h2>
      <ol>
        <li>Go to Settings → Services → Packages</li>
        <li>Click &quot;Create Package&quot;</li>
        <li>Name it (e.g., &quot;Laser Hair Removal - 6 Sessions&quot;)</li>
        <li>Select the service</li>
        <li>Set number of sessions</li>
        <li>Set the package price</li>
        <li>Configure expiration (optional)</li>
        <li>Save</li>
      </ol>

      <h2 id="pricing-strategies">Pricing Strategies</h2>

      <h3>Percentage Discount</h3>
      <p>
        Offer 10-20% off the individual price:
      </p>
      <div className="not-prose p-4 bg-gray-50 rounded-lg mb-4">
        <p className="text-sm">6 Facials: $150 each = $900</p>
        <p className="text-sm font-semibold text-green-600">Package Price: $765 (15% off)</p>
      </div>

      <h3>Free Session</h3>
      <p>
        &quot;Buy 5, Get 1 Free&quot; psychology:
      </p>
      <div className="not-prose p-4 bg-gray-50 rounded-lg mb-4">
        <p className="text-sm">5 Botox sessions at full price</p>
        <p className="text-sm font-semibold text-green-600">6th session included free</p>
      </div>

      <h3>Tiered Discounts</h3>
      <p>
        Bigger packages, bigger savings:
      </p>
      <ul>
        <li>3 sessions: 10% off</li>
        <li>6 sessions: 15% off</li>
        <li>12 sessions: 20% off</li>
      </ul>

      <Callout type="tip" title="Psychology Tip">
        &quot;Pay $2,400 for 6 sessions (save $600!)&quot; is more compelling than &quot;20% off.&quot;
        Show the dollar savings prominently.
      </Callout>

      <h2 id="selling">Selling Packages</h2>
      <p>
        At checkout or consultation:
      </p>
      <ol>
        <li>Explain the treatment plan (e.g., &quot;6 sessions for best results&quot;)</li>
        <li>Present the package option</li>
        <li>Highlight the savings</li>
        <li>Process payment (full or deposit)</li>
        <li>Package credits added to patient account</li>
      </ol>

      <h2 id="payment">Payment Options</h2>
      <ul>
        <li><strong>Pay in full</strong> &mdash; One payment, biggest savings</li>
        <li><strong>Deposit + payments</strong> &mdash; 50% now, rest over time</li>
        <li><strong>Monthly installments</strong> &mdash; Split across months (with financing partner)</li>
      </ul>

      <h2 id="redemption">Redeeming Package Credits</h2>
      <p>
        When the patient comes in:
      </p>
      <ol>
        <li>Book the appointment as normal</li>
        <li>At checkout, select &quot;Use Package&quot;</li>
        <li>One session deducted from their balance</li>
        <li>No payment required (already paid)</li>
      </ol>

      <h2 id="expiration">Expiration Policies</h2>
      <p>
        Common approaches:
      </p>
      <ul>
        <li><strong>12 months</strong> from purchase (most common)</li>
        <li><strong>No expiration</strong> (best for patient trust)</li>
        <li><strong>Per-session</strong> expiration (use within X months of previous)</li>
      </ul>

      <Callout type="warning" title="Check Local Laws">
        Some states have laws about gift card/package expiration. Make sure your
        policy complies with local regulations.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/series/repeating" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Repeating Appointments</h3>
          <p className="text-sm text-gray-500">Schedule the series</p>
        </Link>
        <Link href="/features/billing/packages" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Package Management</h3>
          <p className="text-sm text-gray-500">Track package balances</p>
        </Link>
      </div>
    </div>
  )
}
