import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { CreditCard, Clock, Package, Receipt, CheckCircle2, Wallet, Tag, History } from 'lucide-react'

export default function BillingPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <CreditCard className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Clock className="w-3 h-3" /> 72% Complete
        </span>
      </div>
      <h1>Billing & Payments</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Complete POS system for MedSpas. Process payments, sell packages, manage memberships,
        and track revenue &mdash; all integrated with your scheduling.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Billing System Overview"
        duration="5 min"
        description="Learn how to use the POS, process payments, and sell packages"
      />

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">POS Checkout</h3>
          </div>
          <p className="text-sm text-gray-500">Quick checkout flow after appointments. Add services, apply discounts, process payment.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Packages</h3>
          </div>
          <p className="text-sm text-gray-500">Create and sell treatment packages with prepaid sessions at discounted rates.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Discounts & Promos</h3>
          </div>
          <p className="text-sm text-gray-500">Apply percentage or fixed discounts. Create promo codes for marketing.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Multiple Payment Methods</h3>
          </div>
          <p className="text-sm text-gray-500">Accept credit cards, cash, check, and card on file. Split payments supported.</p>
        </div>
      </div>

      <h2 id="pos">POS Checkout</h2>
      <p>
        After completing a treatment, checkout is fast and easy:
      </p>
      <ol>
        <li><strong>Click &quot;Checkout&quot;</strong> from the appointment or waiting room</li>
        <li><strong>Review services</strong> &mdash; Pre-populated from the appointment</li>
        <li><strong>Add retail products</strong> &mdash; Skincare, sunscreen, etc.</li>
        <li><strong>Apply discounts</strong> &mdash; If applicable</li>
        <li><strong>Select payment method</strong> &mdash; Card, cash, package credit</li>
        <li><strong>Complete payment</strong> &mdash; Process and print/email receipt</li>
      </ol>

      <Callout type="tip">
        If the patient has a card on file (from express booking), you can charge it with one click.
        No need to swipe or enter card details again.
      </Callout>

      <h2 id="packages">Packages & Bundles</h2>
      <p>
        Packages let patients prepay for multiple treatments at a discount:
      </p>

      <h3>Creating Packages</h3>
      <ul>
        <li><strong>Service packages</strong> &mdash; 6 laser sessions for $1,200 (save $300)</li>
        <li><strong>Mix-and-match</strong> &mdash; 3 Botox + 1 filler + 2 facials</li>
        <li><strong>Custom bundles</strong> &mdash; Build packages for specific patient needs</li>
      </ul>

      <h3>Package Features</h3>
      <ul>
        <li>Set expiration dates (e.g., 12 months from purchase)</li>
        <li>Track sessions used vs. remaining</li>
        <li>Transfer between services if needed</li>
        <li>Refund unused portions</li>
      </ul>

      <div className="not-prose bg-green-50 border border-green-200 rounded-lg p-4 my-6">
        <h4 className="font-semibold text-green-900 mb-2">Example Package</h4>
        <div className="text-sm text-green-800">
          <p className="font-medium mb-1">Laser Hair Removal - 6 Session Package</p>
          <ul className="space-y-1">
            <li>Regular price: $250/session = $1,500 total</li>
            <li>Package price: $1,200 (20% savings)</li>
            <li>Valid for: 12 months</li>
            <li>Transferable: No</li>
          </ul>
        </div>
      </div>

      <h2 id="payments">Payment Processing</h2>
      <p>
        Powered by Stripe for secure, reliable payment processing:
      </p>

      <h3>Accepted Methods</h3>
      <ul>
        <li><strong>Credit/Debit Cards</strong> &mdash; Visa, Mastercard, Amex, Discover</li>
        <li><strong>Card on File</strong> &mdash; Saved cards for repeat patients</li>
        <li><strong>Cash</strong> &mdash; Tracked in system for reconciliation</li>
        <li><strong>Check</strong> &mdash; Tracked in system, marked pending until cleared</li>
        <li><strong>Package Credit</strong> &mdash; Redeem prepaid services</li>
        <li><strong>Gift Cards</strong> &mdash; Coming soon</li>
      </ul>

      <h3>Split Payments</h3>
      <p>
        Patients can split payment across multiple methods:
      </p>
      <ul>
        <li>$200 cash + $300 credit card</li>
        <li>Package credit + cash for overage</li>
        <li>Two different credit cards</li>
      </ul>

      <h2 id="invoices">Invoices & Receipts</h2>
      <ul>
        <li><strong>Automatic receipts</strong> &mdash; Email or print after checkout</li>
        <li><strong>Invoice generation</strong> &mdash; Create invoices for later payment</li>
        <li><strong>Receipt history</strong> &mdash; All receipts stored on patient profile</li>
        <li><strong>Custom branding</strong> &mdash; Your logo on receipts</li>
      </ul>

      <h2 id="refunds">Refunds & Adjustments</h2>
      <p>
        Handle refunds and corrections easily:
      </p>
      <ul>
        <li><strong>Full refunds</strong> &mdash; Refund entire transaction</li>
        <li><strong>Partial refunds</strong> &mdash; Refund specific items</li>
        <li><strong>Void transactions</strong> &mdash; Cancel before end of day</li>
        <li><strong>Price adjustments</strong> &mdash; Fix pricing errors</li>
      </ul>

      <Callout type="warning" title="Refund Timeline">
        Card refunds typically appear on the patient&apos;s statement within 5-10 business days,
        depending on their bank.
      </Callout>

      <h2 id="coming-soon">Coming Soon</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Memberships</h3>
          <p className="text-sm text-purple-700">Recurring monthly plans with included services and discounts.</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Gift Cards</h3>
          <p className="text-sm text-purple-700">Sell digital and physical gift cards for any amount.</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Financing</h3>
          <p className="text-sm text-purple-700">Offer patient financing through Cherry or CareCredit integration.</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Inventory</h3>
          <p className="text-sm text-purple-700">Track product inventory and automatic reorder alerts.</p>
        </div>
      </div>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/billing/packages" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Packages Deep Dive</h3>
          <p className="text-sm text-gray-500">Creating and managing packages</p>
        </Link>
        <Link href="/features/reports/sales" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Sales Reports</h3>
          <p className="text-sm text-gray-500">Revenue tracking and analysis</p>
        </Link>
        <Link href="/integrations/stripe" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Stripe Integration</h3>
          <p className="text-sm text-gray-500">Set up payment processing</p>
        </Link>
        <Link href="/features/series" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Treatment Series</h3>
          <p className="text-sm text-gray-500">Package pricing for series</p>
        </Link>
      </div>
    </div>
  )
}
