import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { ShoppingCart, CreditCard, Receipt, CheckCircle2, Zap, AlertCircle } from 'lucide-react'

export default function CheckoutPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <ShoppingCart className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 85% Complete
        </span>
      </div>
      <h1>POS Checkout Workflow</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Complete point-of-sale checkout system for processing patient payments at the end of appointments.
        Accept multiple payment methods, apply discounts, and generate receipts instantly.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="POS Checkout Walkthrough"
        duration="5 min"
        description="Learn how to process patient payments and complete the checkout workflow"
      />

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Multiple Payment Methods</h3>
          </div>
          <p className="text-sm text-gray-500">Accept credit cards, debit cards, gift cards, and cash payments in one unified interface.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Quick Payment Processing</h3>
          </div>
          <p className="text-sm text-gray-500">Process transactions in seconds with integrated Stripe payment gateway and secure tokenization.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Instant Receipts</h3>
          </div>
          <p className="text-sm text-gray-500">Generate and email receipts with itemized service details, taxes, and payment breakdown.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Discount & Promo Management</h3>
          </div>
          <p className="text-sm text-gray-500">Apply percentage discounts, fixed amounts, and promotional codes at checkout.</p>
        </div>
      </div>

      <h2 id="checkout-flow">The Checkout Process</h2>
      <p>
        The checkout workflow is designed for speed and efficiency during peak hours. Here&apos;s how it works:
      </p>

      <StepList steps={[
        {
          title: 'Patient checks out',
          description: 'Staff selects the patient from the calendar or patient search to start checkout.'
        },
        {
          title: 'Services automatically loaded',
          description: 'All services provided during the appointment are pre-loaded in the cart with their prices.'
        },
        {
          title: 'Apply discounts or promos',
          description: 'Enter discount codes, loyalty discounts, or apply manual discounts if needed.'
        },
        {
          title: 'Select payment method',
          description: 'Choose from credit card, debit, cash, or existing payment method on file.'
        },
        {
          title: 'Process payment',
          description: 'Submit payment and receive instant confirmation with payment receipt.'
        },
        {
          title: 'Schedule follow-up',
          description: 'Optionally book next appointment and send SMS confirmation to patient.'
        }
      ]} />

      <h2 id="payment-methods">Payment Methods</h2>
      <p>
        The POS supports multiple payment methods to meet your patients&apos; preferences:
      </p>

      <div className="overflow-x-auto not-prose mb-8">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left font-semibold text-gray-900">Payment Method</th>
              <th className="p-3 text-left font-semibold text-gray-900">Processing Time</th>
              <th className="p-3 text-left font-semibold text-gray-900">Transaction Fee</th>
              <th className="p-3 text-left font-semibold text-gray-900">Best For</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900">Credit Card</td>
              <td className="p-3 text-gray-600">Instant</td>
              <td className="p-3 text-gray-600">2.9% + $0.30</td>
              <td className="p-3 text-gray-600">Most customers</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900">Debit Card</td>
              <td className="p-3 text-gray-600">Instant</td>
              <td className="p-3 text-gray-600">1.95% + $0.25</td>
              <td className="p-3 text-gray-600">Lower fees than credit</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900">Cash</td>
              <td className="p-3 text-gray-600">Immediate</td>
              <td className="p-3 text-gray-600">No fee</td>
              <td className="p-3 text-gray-600">Immediate receipt, no cards</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900">Gift Card</td>
              <td className="p-3 text-gray-600">Instant</td>
              <td className="p-3 text-gray-600">No fee</td>
              <td className="p-3 text-gray-600">Gift card balance transfers</td>
            </tr>
            <tr>
              <td className="p-3 text-gray-900">ACH / Bank Transfer</td>
              <td className="p-3 text-gray-600">1-3 days</td>
              <td className="p-3 text-gray-600">0.8% + $0.30</td>
              <td className="p-3 text-gray-600">Large package payments</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="tip" title="Payment Card Tokenization">
        Patients can save their card details for one-click future payments. Cards are tokenized with Stripe
        and never stored on your servers, ensuring PCI DSS compliance.
      </Callout>

      <h2 id="discounts-promos">Discounts & Promotional Codes</h2>
      <p>
        Drive revenue and reward loyalty with flexible discount options:
      </p>

      <h3>Discount Types</h3>
      <ul>
        <li><strong>Percentage Discounts</strong> &mdash; 10%, 20%, 50% off the total</li>
        <li><strong>Fixed Amount</strong> &mdash; $10, $25, $50 off</li>
        <li><strong>Loyalty Discounts</strong> &mdash; Auto-apply based on visit count or spending</li>
        <li><strong>Promotional Codes</strong> &mdash; One-time use or recurring campaign codes</li>
        <li><strong>Employee Discounts</strong> &mdash; Staff member pricing</li>
        <li><strong>Referral Bonuses</strong> &mdash; Discount for new patient referrals</li>
      </ul>

      <h3>Creating Promotional Codes</h3>
      <p>
        Set up promotional codes in Settings &gt; Billing &gt; Promotions:
      </p>
      <ul>
        <li>Code name (e.g., &quot;SUMMER20&quot;)</li>
        <li>Discount amount (percentage or fixed)</li>
        <li>Valid date range</li>
        <li>Maximum uses (optional)</li>
        <li>Minimum purchase amount</li>
        <li>Services eligible for discount</li>
      </ul>

      <Callout type="info">
        Promotional codes can be shared via SMS, email, or social media. Track usage in your reports
        to measure ROI on marketing campaigns.
      </Callout>

      <h2 id="checkout-example">Checkout Example: Botox + Fillers Package</h2>
      <p>
        Here&apos;s a typical checkout scenario for a patient receiving multiple services:
      </p>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 not-prose mb-8 font-mono text-sm">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-900">
            <span>Botox - Forehead (20 units)</span>
            <span>$240.00</span>
          </div>
          <div className="flex justify-between text-gray-900">
            <span>Restylane Lip Filler (1 syringe)</span>
            <span>$350.00</span>
          </div>
          <div className="border-t border-gray-300 pt-2 flex justify-between text-gray-900 font-semibold">
            <span>Subtotal</span>
            <span>$590.00</span>
          </div>
          <div className="flex justify-between text-green-700">
            <span>Loyalty Discount (10%)</span>
            <span>-$59.00</span>
          </div>
          <div className="flex justify-between text-gray-900">
            <span>Sales Tax (8.5%)</span>
            <span>$45.09</span>
          </div>
          <div className="border-t border-gray-300 pt-2 flex justify-between text-gray-900 font-bold text-lg">
            <span>Total Due</span>
            <span>$576.09</span>
          </div>
        </div>
      </div>

      <h2 id="refunds-adjustments">Refunds & Adjustments</h2>
      <p>
        Handle refunds and payment adjustments directly from the checkout screen:
      </p>

      <h3>Full Refunds</h3>
      <p>
        Refund entire transactions instantly. Stripe processes refunds back to the original card
        within 3-5 business days.
      </p>

      <h3>Partial Refunds</h3>
      <p>
        Refund specific line items if a patient is unsatisfied with a particular service.
        Example: Refund the lip filler but keep the Botox charge.
      </p>

      <h3>Adjustments</h3>
      <p>
        Apply price adjustments for discrepancies:
      </p>
      <ul>
        <li>Add-on charges for extra units or services</li>
        <li>Discount adjustments for timing issues</li>
        <li>Price corrections due to system errors</li>
      </ul>

      <Callout type="warning" title="Refund Policy">
        All refunds are logged in the patient&apos;s financial history. Refunds processed after
        10 days may require manual bank reconciliation. Document the reason for every refund.
      </Callout>

      <h2 id="cash-handling">Cash Handling</h2>
      <p>
        For cash payments, the system helps track cash drawer operations:
      </p>

      <h3>Opening a Cash Drawer</h3>
      <p>Record starting cash amount at the beginning of each shift.</p>

      <h3>Recording Cash Payments</h3>
      <p>Enter payment amount and system shows change due.</p>

      <h3>Cash Reconciliation</h3>
      <p>
        At end of shift, run a cash reconciliation report comparing:
      </p>
      <ul>
        <li>Expected cash (opening balance + payments received - refunds)</li>
        <li>Actual cash in drawer</li>
        <li>Variance report for discrepancies</li>
      </ul>

      <Callout type="info">
        Cash reconciliation is important for accountability and catching errors. Reconcile at the
        end of every shift. Significant variances should be investigated.
      </Callout>

      <h2 id="receipts">Receipt Management</h2>
      <p>
        Generate professional receipts for every transaction:
      </p>

      <h3>Receipt Contents</h3>
      <ul>
        <li>Clinic name, address, and phone</li>
        <li>Patient name and ID</li>
        <li>Provider name who performed services</li>
        <li>Date and time of transaction</li>
        <li>Itemized services with prices</li>
        <li>Discounts applied</li>
        <li>Tax calculation and amount</li>
        <li>Payment method (last 4 digits for cards)</li>
        <li>Transaction ID</li>
        <li>Custom thank-you message</li>
      </ul>

      <h3>Delivery Options</h3>
      <ul>
        <li><strong>Print</strong> &mdash; Direct thermal printer for instant receipt</li>
        <li><strong>Email</strong> &mdash; Send receipt to patient email automatically</li>
        <li><strong>SMS</strong> &mdash; Text receipt via SMS for quick reference</li>
        <li><strong>Archive</strong> &mdash; Store digital copy in patient profile</li>
      </ul>

      <h2 id="loyalty">Loyalty & Rewards Integration</h2>
      <p>
        Encourage repeat visits and larger purchases with built-in loyalty rewards:
      </p>

      <h3>Points-Based System</h3>
      <ul>
        <li>Earn 1 point per $1 spent</li>
        <li>100 points = $10 reward</li>
        <li>Bonus points on package purchases</li>
        <li>Double points promotions on slow days</li>
      </ul>

      <h3>Automatic Application</h3>
      <p>
        When a patient has accumulated rewards, the system automatically suggests applying them
        at checkout, or staff can manually apply if preferred.
      </p>

      <Callout type="tip" title="Package Bundling">
        Package purchases often trigger loyalty bonuses. A $600 Botox series might award 150 points
        instead of 100, giving patients extra incentive to commit to multi-visit packages.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/billing/packages" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Treatment Packages</h3>
          <p className="text-sm text-gray-500">Bundled services and pricing</p>
        </Link>
        <Link href="/features/billing/payments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Payment Processing</h3>
          <p className="text-sm text-gray-500">Stripe integration and methods</p>
        </Link>
        <Link href="/features/billing/invoices" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Invoices</h3>
          <p className="text-sm text-gray-500">Invoice generation and tracking</p>
        </Link>
        <Link href="/features/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting</h3>
          <p className="text-sm text-gray-500">Treatment documentation</p>
        </Link>
      </div>
    </div>
  )
}
