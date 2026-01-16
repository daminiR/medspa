import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { CreditCard, Lock, Zap, BarChart3, CheckCircle2, Shield, TrendingUp } from 'lucide-react'

export default function PaymentsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <CreditCard className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 90% Complete
        </span>
      </div>
      <h1>Payment Processing & Methods</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Secure payment processing with Stripe integration. Accept all major payment methods,
        manage recurring billing, and maintain PCI DSS compliance for protected patient data.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Payment Setup & Processing"
        duration="6 min"
        description="Learn about payment methods, security, and Stripe integration"
      />

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Secure Processing</h3>
          </div>
          <p className="text-sm text-gray-500">PCI DSS Level 1 compliant with Stripe tokenization. Your clinic never handles raw card data.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Detailed Reporting</h3>
          </div>
          <p className="text-sm text-gray-500">Revenue tracking, transaction reports, and reconciliation tools for accurate accounting.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Recurring Billing</h3>
          </div>
          <p className="text-sm text-gray-500">Set up automatic charges for memberships, retainers, and subscription services.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Financial Dashboard</h3>
          </div>
          <p className="text-sm text-gray-500">Real-time revenue metrics, settlement information, and payment health monitoring.</p>
        </div>
      </div>

      <h2 id="stripe-integration">Stripe Payment Processing</h2>
      <p>
        The platform integrates with Stripe for all payment processing. Stripe is the leading payment
        processor used by thousands of healthcare providers worldwide.
      </p>

      <h3>Why Stripe?</h3>
      <ul>
        <li><strong>Security</strong> &mdash; PCI DSS Level 1 compliance, fraud detection, 3D Secure</li>
        <li><strong>Global</strong> &mdash; Accept payments from 195+ countries in 135+ currencies</li>
        <li><strong>Flexible</strong> &mdash; Support for cards, digital wallets, ACH, and international methods</li>
        <li><strong>Reliable</strong> &mdash; 99.99% uptime SLA with instant settlement</li>
        <li><strong>Transparent</strong> &mdash; Clear pricing with no hidden fees</li>
      </ul>

      <Callout type="info" title="Stripe Account Required">
        You need a Stripe account to process payments. Connect your account in Settings &gt; Billing &gt; Payment Methods.
        Stripe handles all data security so you stay fully PCI compliant without the complexity.
      </Callout>

      <h2 id="payment-methods">Supported Payment Methods</h2>

      <div className="overflow-x-auto not-prose mb-8">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left font-semibold text-gray-900">Payment Method</th>
              <th className="p-3 text-left font-semibold text-gray-900">Description</th>
              <th className="p-3 text-center font-semibold text-gray-900">Fee</th>
              <th className="p-3 text-center font-semibold text-gray-900">Availability</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900 font-semibold">Credit Cards</td>
              <td className="p-3 text-gray-600">Visa, Mastercard, American Express, Discover</td>
              <td className="p-3 text-center text-gray-600">2.9% + $0.30</td>
              <td className="p-3 text-center"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">All regions</span></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900 font-semibold">Debit Cards</td>
              <td className="p-3 text-gray-600">Direct debit from checking account</td>
              <td className="p-3 text-center text-gray-600">1.95% + $0.25</td>
              <td className="p-3 text-center"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">All regions</span></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900 font-semibold">ACH / Bank Transfer</td>
              <td className="p-3 text-gray-600">Direct bank-to-bank transfer (US only)</td>
              <td className="p-3 text-center text-gray-600">0.8% + $0.30</td>
              <td className="p-3 text-center"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">USA</span></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900 font-semibold">Apple Pay</td>
              <td className="p-3 text-gray-600">One-click payment from iPhone/iPad</td>
              <td className="p-3 text-center text-gray-600">2.9% + $0.30</td>
              <td className="p-3 text-center"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">All regions</span></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900 font-semibold">Google Pay</td>
              <td className="p-3 text-gray-600">One-click payment from Android devices</td>
              <td className="p-3 text-center text-gray-600">2.9% + $0.30</td>
              <td className="p-3 text-center"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">All regions</span></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900 font-semibold">Affirm / Afterpay</td>
              <td className="p-3 text-gray-600">Buy now, pay later options</td>
              <td className="p-3 text-center text-gray-600">Varies</td>
              <td className="p-3 text-center"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">USA</span></td>
            </tr>
            <tr>
              <td className="p-3 text-gray-900 font-semibold">International Methods</td>
              <td className="p-3 text-gray-600">iDEAL, Bancontact, SEPA, Alipay, WeChat Pay</td>
              <td className="p-3 text-center text-gray-600">Varies</td>
              <td className="p-3 text-center"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Selected regions</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="setup">Setting Up Payment Methods</h2>

      <StepList steps={[
        {
          title: 'Create Stripe Account',
          description: 'Sign up at stripe.com with your clinic information and bank details for payouts.'
        },
        {
          title: 'Verify Bank Account',
          description: 'Stripe will verify your bank account with 2 small deposits. This takes 1-2 days.'
        },
        {
          title: 'Connect to MedSpa Platform',
          description: 'Go to Settings &gt; Billing &gt; Payment Methods. Enter your Stripe API keys.'
        },
        {
          title: 'Enable Payment Methods',
          description: 'Choose which payment methods to accept (credit cards, ACH, digital wallets, etc.)'
        },
        {
          title: 'Configure Settlement',
          description: 'Set your payout schedule (daily, weekly, or monthly) and review fees'
        },
        {
          title: 'Test Transactions',
          description: 'Process test payments using Stripe test cards to ensure everything works'
        }
      ]} />

      <h2 id="transaction-processing">Transaction Processing</h2>

      <h3>Charge Authorization</h3>
      <p>
        When a patient pays at checkout, the system:
      </p>
      <ol>
        <li>Captures the card details securely through Stripe</li>
        <li>Requests authorization from the patient&apos;s bank</li>
        <li>Bank approves or declines (fraud detection checks run)</li>
        <li>Charge is captured and funds reserved</li>
        <li>Transaction ID is recorded in patient&apos;s billing history</li>
      </ol>

      <h3>Settlement & Payouts</h3>
      <p>
        Approved charges are deposited to your bank account on your scheduled settlement cycle:
      </p>
      <ul>
        <li><strong>Daily payouts:</strong> Funds transferred every business day</li>
        <li><strong>Weekly payouts:</strong> Batch transfer every Monday</li>
        <li><strong>Monthly payouts:</strong> Batch transfer on specified date</li>
      </ul>

      <p>
        Stripe deducts processing fees from each transaction before deposit. Review detailed payout
        reports in your Stripe dashboard to reconcile with your records.
      </p>

      <Callout type="tip" title="Faster Payouts">
        Consider daily payouts to ensure positive cash flow. Stripe deposits typically arrive within
        2-3 business days regardless of payout schedule.
      </Callout>

      <h2 id="recurring-billing">Recurring Billing</h2>
      <p>
        Set up automatic recurring charges for membership packages and retainers:
      </p>

      <h3>Creating Recurring Charges</h3>
      <ul>
        <li>Monthly membership ($99/month for VIP access)</li>
        <li>Quarterly Botox retainer ($200 charged every 3 months)</li>
        <li>Annual skincare subscription ($600/year billed monthly)</li>
        <li>Treatment retainer ($150/month deducted from balance)</li>
      </ul>

      <h3>Recurring Billing Rules</h3>
      <ul>
        <li>Charges happen automatically on the scheduled date</li>
        <li>Patient receives email notification before each charge</li>
        <li>Failed charges are automatically retried (1st and 3rd attempt)</li>
        <li>Patient can pause or cancel anytime</li>
        <li>Failed payment attempts logged and customer notified</li>
      </ul>

      <h3>Failed Recurring Charges</h3>
      <p>
        When a recurring charge fails:
      </p>
      <ol>
        <li>First attempt: Immediately retry</li>
        <li>Second attempt: Retry after 3 days</li>
        <li>Third attempt: Retry after 5 days</li>
        <li>If all fail: Alert staff and send patient payment update notification</li>
      </ol>

      <Callout type="info">
        Always ask for permission before setting up recurring charges. Maintain clear communication
        about charge dates, amounts, and easy cancellation options to maintain patient trust.
      </Callout>

      <h2 id="fraud-prevention">Fraud Detection & Prevention</h2>

      <h3>Stripe Fraud Prevention Features</h3>
      <ul>
        <li><strong>Radar</strong> &mdash; Machine learning fraud detection analyzes every transaction</li>
        <li><strong>3D Secure</strong> &mdash; Extra authentication for suspicious transactions</li>
        <li><strong>CVV Verification</strong> &mdash; Verify security code to prevent card fraud</li>
        <li><strong>Address Verification</strong> &mdash; Match billing address to card holder</li>
        <li><strong>Velocity Checks</strong> &mdash; Detect unusual payment patterns</li>
      </ul>

      <h3>Best Practices</h3>
      <ul>
        <li>Always verify ID for in-person credit card payments</li>
        <li>Ask patients to verify unusual transactions via email/SMS</li>
        <li>Monitor chargeback rates and investigate high frequencies</li>
        <li>Save customer payment information only with explicit consent</li>
        <li>Use 3D Secure for high-value transactions over $500</li>
      </ul>

      <Callout type="warning" title="Chargeback Liability">
        Fraudulent charges disputed by cardholders result in chargebacks. Stripe charges a $15 dispute
        fee plus the original transaction amount. Document all transactions carefully to contest chargebacks.
      </Callout>

      <h2 id="refunds">Processing Refunds</h2>

      <h3>Full Refunds</h3>
      <p>
        Refund an entire transaction within 90 days. Funds are reversed and returned to the original payment method
        within 3-5 business days. Refund fee ($15) is waived if done within 24 hours of original charge.
      </p>

      <h3>Partial Refunds</h3>
      <p>
        Refund specific line items (e.g., refund the $350 lip filler but keep the $240 Botox charge).
      </p>

      <h3>Refund Rules</h3>
      <ul>
        <li>Refunds must be processed within 90 days of original charge</li>
        <li>Partial refunds can be processed multiple times per transaction</li>
        <li>Each refund creates a new transaction and affects your Stripe statements</li>
        <li>Refunded fees are not refunded to your account</li>
      </ul>

      <h2 id="payment-reporting">Payment Reports & Reconciliation</h2>

      <h3>Revenue Dashboard</h3>
      <p>
        View real-time payment metrics:
      </p>
      <ul>
        <li>Daily revenue totals</li>
        <li>Transaction count and average transaction value</li>
        <li>Payment method breakdown (% credit cards vs. cash, etc.)</li>
        <li>Pending payouts and settlement schedule</li>
        <li>Refunds and chargebacks</li>
      </ul>

      <h3>Transaction Reports</h3>
      <p>
        Export detailed transaction logs with:
      </p>
      <ul>
        <li>Transaction ID and date</li>
        <li>Patient name and amount</li>
        <li>Payment method (card type, last 4 digits)</li>
        <li>Service details</li>
        <li>Provider information</li>
        <li>Discount applied</li>
        <li>Tax</li>
      </ul>

      <h3>Reconciliation Process</h3>
      <p>
        Monthly reconciliation checklist:
      </p>
      <ol>
        <li>Download transaction report from Stripe dashboard</li>
        <li>Compare to patient billing records in the platform</li>
        <li>Verify all refunds and chargebacks are recorded</li>
        <li>Check payout deposits match settlement reports</li>
        <li>Document and investigate any discrepancies</li>
        <li>Archive reports for accounting/audit purposes</li>
      </ol>

      <Callout type="tip" title="Accounting Integration">
        Export transaction data to CSV for import into QuickBooks, FreshBooks, or other accounting software
        to streamline month-end reconciliation.
      </Callout>

      <h2 id="pci-compliance">PCI DSS Compliance</h2>
      <p>
        The platform is designed to keep you PCI DSS compliant so you don&apos;t have to worry about
        sensitive card data security:
      </p>

      <h3>What We Handle</h3>
      <ul>
        <li>All card data is processed through Stripe&apos;s secure servers</li>
        <li>Your clinic never sees full card numbers</li>
        <li>Encrypted transmission using TLS 1.2+</li>
        <li>Regular security audits and vulnerability testing</li>
      </ul>

      <h3>What You Must Do</h3>
      <ul>
        <li>Use strong passwords and two-factor authentication</li>
        <li>Keep staff trained on payment security</li>
        <li>Don&apos;t store card details in emails, notes, or documents</li>
        <li>Securely destroy old transaction records after retention period</li>
        <li>Use HTTPS for all payment page access</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/billing/checkout" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">POS Checkout</h3>
          <p className="text-sm text-gray-500">Process payments at appointment checkout</p>
        </Link>
        <Link href="/features/billing/packages" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Treatment Packages</h3>
          <p className="text-sm text-gray-500">Bundled services and recurring billing</p>
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
