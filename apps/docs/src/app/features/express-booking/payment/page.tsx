import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { CreditCard, CheckCircle2, Shield, Clock, Lock } from 'lucide-react'

export default function CardOnFilePage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <CreditCard className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Clock className="w-3 h-3" /> In Progress
        </span>
      </div>
      <h1>Card on File</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Collect payment information during express booking to reduce no-shows and
        speed up checkout.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Patients who provide a card when booking are 70% less likely to no-show.
        And when they do show up, checkout takes seconds instead of minutes.
      </p>

      <h2 id="how">How It Works</h2>
      <p>
        When sending an express booking link, you can require card information:
      </p>
      <ol>
        <li>Toggle on &quot;Require Card on File&quot;</li>
        <li>Optionally set a cancellation policy</li>
        <li>Send the booking link</li>
        <li>Patient enters card details during booking</li>
        <li>Card is securely stored for future use</li>
      </ol>

      <h2 id="patient-view">What Patients See</h2>
      <p>
        During the booking process:
      </p>
      <ul>
        <li>Clear message: &quot;A card is required to hold your appointment&quot;</li>
        <li>Secure Stripe-powered card entry</li>
        <li>Explanation that they won&apos;t be charged until checkout</li>
        <li>Cancellation policy (if set)</li>
      </ul>

      <Callout type="info" title="No Surprise Charges">
        Cards on file are for holding appointments and fast checkout. Patients are
        never charged without consent, and we show them the cancellation policy upfront.
      </Callout>

      <h2 id="security">Security</h2>
      <p>
        Card data is handled securely:
      </p>
      <ul>
        <li><strong>PCI compliant</strong> &mdash; We never see full card numbers</li>
        <li><strong>Stripe tokenization</strong> &mdash; Cards stored securely with Stripe</li>
        <li><strong>Display</strong> &mdash; Staff only see last 4 digits</li>
        <li><strong>Encryption</strong> &mdash; All data encrypted in transit</li>
      </ul>

      <h2 id="cancellation">Cancellation Policies</h2>
      <p>
        Set policies for different scenarios:
      </p>
      <ul>
        <li><strong>24-hour notice</strong> &mdash; No charge if cancelled in time</li>
        <li><strong>No-show fee</strong> &mdash; Charge partial fee for no-shows</li>
        <li><strong>Late cancellation</strong> &mdash; Fee for cancelling under 24 hours</li>
      </ul>
      <p>
        The policy is shown to the patient before they book, so there are no surprises.
      </p>

      <Callout type="warning" title="Clear Communication">
        Always display your cancellation policy clearly. Surprise charges lead to
        chargebacks and bad reviews. Transparency builds trust.
      </Callout>

      <h2 id="using-stored-cards">Using Stored Cards</h2>
      <p>
        At checkout:
      </p>
      <ol>
        <li>The stored card appears as a payment option</li>
        <li>Staff selects &quot;Use Card on File&quot;</li>
        <li>Patient confirms the charge</li>
        <li>Payment processes instantly</li>
      </ol>

      <h2 id="managing-cards">Managing Cards</h2>
      <p>
        From the patient profile:
      </p>
      <ul>
        <li>View stored cards (last 4 digits, expiry)</li>
        <li>Set a default card</li>
        <li>Remove expired or unwanted cards</li>
        <li>Add new cards manually</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/express-booking/sms" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SMS Quick Book</h3>
          <p className="text-sm text-gray-500">Send booking links via text</p>
        </Link>
        <Link href="/features/billing/payments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Payment Processing</h3>
          <p className="text-sm text-gray-500">Accept all payment types</p>
        </Link>
      </div>
    </div>
  )
}
