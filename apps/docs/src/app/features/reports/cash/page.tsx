import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Wallet, CheckCircle2, DollarSign, CreditCard, Calculator, FileText } from 'lucide-react'

export default function CashReconciliationPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Wallet className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Cash Reconciliation</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Balance your drawer at the end of each day. Match cash, cards, and other payments
        to what the system says you should have.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Cash discrepancies happen. Maybe someone forgot to ring something up, or change
        was given incorrectly. Daily reconciliation catches problems early - before a
        small issue becomes a big mystery.
      </p>

      <h2 id="daily-summary">Daily Summary</h2>
      <p>
        At end of day, the report shows:
      </p>
      <div className="not-prose space-y-3 mb-6">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span>Cash Payments</span>
          <span className="font-bold">$1,240.00</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span>Credit Card</span>
          <span className="font-bold">$8,450.00</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span>Other (Gift Cards, etc.)</span>
          <span className="font-bold">$560.00</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-purple-50 rounded border border-purple-200">
          <span className="font-semibold">Total Expected</span>
          <span className="font-bold text-purple-700">$10,250.00</span>
        </div>
      </div>

      <h2 id="counting">Counting Your Drawer</h2>
      <ol>
        <li>Open the Cash Reconciliation report</li>
        <li>Count your physical cash</li>
        <li>Enter the counted amount</li>
        <li>System shows any difference</li>
        <li>Add notes if there&apos;s a discrepancy</li>
        <li>Submit the reconciliation</li>
      </ol>

      <h2 id="discrepancies">Handling Discrepancies</h2>
      <p>
        If your counted cash doesn&apos;t match:
      </p>
      <ul>
        <li><strong>Over</strong> &mdash; You have more cash than expected</li>
        <li><strong>Short</strong> &mdash; You have less cash than expected</li>
      </ul>
      <p>
        Either way, enter what you actually have. The system tracks the discrepancy and
        you can add a note explaining what might have happened.
      </p>

      <Callout type="tip" title="Common Causes">
        Most discrepancies come from making change incorrectly or forgetting to ring
        up a small add-on. Review the day&apos;s transactions if you&apos;re significantly off.
      </Callout>

      <h2 id="card-payments">Card Payment Verification</h2>
      <p>
        Compare the system&apos;s card total to your payment processor:
      </p>
      <ol>
        <li>Check your Stripe/Square/terminal batch total</li>
        <li>Compare to the system&apos;s card payment total</li>
        <li>They should match exactly</li>
      </ol>
      <p>
        Card payments rarely have discrepancies since they&apos;re electronic.
      </p>

      <h2 id="history">Reconciliation History</h2>
      <p>
        View past reconciliations to:
      </p>
      <ul>
        <li><strong>Spot patterns</strong> &mdash; Recurring shortages on certain days?</li>
        <li><strong>Audit trail</strong> &mdash; Who reconciled and when</li>
        <li><strong>Investigate</strong> &mdash; Look back at discrepancies</li>
      </ul>

      <h2 id="tips">Best Practices</h2>
      <ul>
        <li><strong>Same person counts</strong> &mdash; Whoever worked the drawer counts it</li>
        <li><strong>End of every day</strong> &mdash; Don&apos;t skip days</li>
        <li><strong>Count twice</strong> &mdash; If off, recount before reporting</li>
        <li><strong>Note everything</strong> &mdash; Document any unusual transactions</li>
      </ul>

      <Callout type="info" title="Manager Review">
        Managers can see all reconciliations and are automatically notified of
        discrepancies over a certain threshold.
      </Callout>

      <h2 id="related">Related Reports</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/reports/sales" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Sales Reports</h3>
          <p className="text-sm text-gray-500">Daily revenue breakdown</p>
        </Link>
        <Link href="/features/billing/payments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Payment Processing</h3>
          <p className="text-sm text-gray-500">Card and payment methods</p>
        </Link>
      </div>
    </div>
  )
}
