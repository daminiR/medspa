import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { FileText, Clock, AlertCircle, CheckCircle2, Send } from 'lucide-react'

export default function InvoicesPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <FileText className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge planning">
          <Clock className="w-3 h-3" /> Coming Soon
        </span>
      </div>
      <h1>Invoice Generation & Tracking</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Professional invoice generation for treatments and services. Track payment status, send reminders,
        and maintain complete financial records for compliance and accounting.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Invoice Management"
        duration="Coming Soon"
        description="This feature is currently in development. Learn how to generate and manage invoices when it launches."
      />

      <Callout type="info" title="Feature Status">
        Invoice generation is coming soon. We&apos;re currently refining the feature based on feedback from
        beta users. Expected release is Q1 2024. For now, receipts are automatically generated at checkout.
      </Callout>

      <h2 id="planned-features">Planned Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Professional Invoicing</h3>
          </div>
          <p className="text-sm text-gray-500">Generate customizable invoices with your clinic branding, payment terms, and billing details.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Invoice Delivery</h3>
          </div>
          <p className="text-sm text-gray-500">Automatically send invoices via email with payment links and options for online payment.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Payment Tracking</h3>
          </div>
          <p className="text-sm text-gray-500">Monitor invoice status, track payments received, and manage outstanding balances.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Payment Reminders</h3>
          </div>
          <p className="text-sm text-gray-500">Automatic reminders for overdue invoices with customizable reminder schedules.</p>
        </div>
      </div>

      <h2 id="use-cases">Use Cases</h2>

      <h3>Treatment Plans & Multi-Visit Services</h3>
      <p>
        Create invoices for multi-visit treatment packages that will be completed over several months:
      </p>
      <ul>
        <li>6-session laser hair removal course ($900)</li>
        <li>12-week CoolSculpting series ($3,600)</li>
        <li>Quarterly Botox maintenance plan ($800/visit)</li>
      </ul>

      <h3>Insurance Billing</h3>
      <p>
        For clinics that accept insurance or offer medical aesthetic services that may be partially covered:
      </p>
      <ul>
        <li>Generate itemized invoices with medical codes</li>
        <li>Submit to insurance companies for reimbursement</li>
        <li>Track insurance vs. patient portion</li>
      </ul>

      <h3>Corporate & Gift Services</h3>
      <p>
        Create invoices for corporate gift packages or group bookings:
      </p>
      <ul>
        <li>Corporate wellness packages for employee benefits</li>
        <li>Group gift certificates</li>
        <li>Bulk service agreements</li>
      </ul>

      <h2 id="current-alternative">Current Alternative: Receipts</h2>

      <p>
        Until invoices launch, the platform generates professional receipts at checkout that serve similar purposes:
      </p>

      <h3>Receipt Features Today</h3>
      <ul>
        <li>Automatically generated for every transaction</li>
        <li>Email sent instantly to patient</li>
        <li>Itemized with all services and discounts</li>
        <li>Tax calculation and payment details</li>
        <li>Saved in patient&apos;s document library</li>
      </ul>

      <Callout type="info">
        For now, checkout receipts work as invoices for most use cases. They&apos;re automatically generated,
        emailed, and archived. When the full invoice feature launches, it will add support for deferred
        billing, payment plans, and professional invoice numbering sequences.
      </Callout>

      <h2 id="roadmap">What&apos;s Coming</h2>

      <h3>Phase 1: Invoice Generation (Q1 2024)</h3>
      <ul>
        <li>Create invoices for future or deferred services</li>
        <li>Customize invoice templates with clinic branding</li>
        <li>Set payment terms (Net 30, Net 60, etc.)</li>
        <li>Add custom line items and notes</li>
        <li>Professional invoice numbering and sequences</li>
      </ul>

      <h3>Phase 2: Payment Links (Q1 2024)</h3>
      <ul>
        <li>Generate unique payment links for each invoice</li>
        <li>Patients pay directly from email</li>
        <li>Track payment status in real-time</li>
        <li>Accept partial payments</li>
      </ul>

      <h3>Phase 3: Automated Reminders (Q2 2024)</h3>
      <ul>
        <li>Automatic payment reminders on due date</li>
        <li>Overdue notices for past-due invoices</li>
        <li>Customizable reminder sequences</li>
        <li>SMS and email options</li>
      </ul>

      <h3>Phase 4: Accounting Integration (Q2 2024)</h3>
      <ul>
        <li>QuickBooks Online sync</li>
        <li>Wave Accounting integration</li>
        <li>FreshBooks compatibility</li>
        <li>Custom invoice export for other systems</li>
      </ul>

      <h2 id="invoice-example">Invoice Example (When Available)</h2>

      <p>
        Here&apos;s a preview of what invoices will look like:
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 not-prose mb-8">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">LUXE AESTHETICS</h3>
          <p className="text-sm text-gray-500">123 Wellness Street, Los Angeles, CA 90001</p>
          <p className="text-sm text-gray-500">(555) 123-4567 | billing@luxeaesthetics.com</p>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <p className="text-xs text-gray-500 uppercase">Invoice</p>
            <p className="font-bold text-lg">INV-2024-0001</p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Bill To:</strong><br />
              Sarah Johnson<br />
              sarah.johnson@email.com<br />
              (555) 987-6543
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase">Date</p>
            <p className="font-bold">January 15, 2024</p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Due Date:</strong><br />
              February 15, 2024
            </p>
          </div>
        </div>

        <table className="w-full mb-8 text-sm">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-left font-semibold pb-2">Description</th>
              <th className="text-center font-semibold pb-2">Qty</th>
              <th className="text-right font-semibold pb-2">Unit Price</th>
              <th className="text-right font-semibold pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2">Botox Treatment - Forehead (20 units)</td>
              <td className="text-center">1</td>
              <td className="text-right">$240.00</td>
              <td className="text-right">$240.00</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">Restylane Filler - Lips (1 syringe)</td>
              <td className="text-center">1</td>
              <td className="text-right">$350.00</td>
              <td className="text-right">$350.00</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">Consultation & Skin Analysis</td>
              <td className="text-center">1</td>
              <td className="text-right">$100.00</td>
              <td className="text-right">$100.00</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal:</span>
              <span>$690.00</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tax (8.5%):</span>
              <span>$58.65</span>
            </div>
            <div className="border-t-2 border-gray-900 pt-2 flex justify-between font-bold">
              <span>Total Due:</span>
              <span>$748.65</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          <strong>Payment Terms:</strong> Due within 30 days of invoice date
        </p>
        <p className="text-xs text-gray-500 mb-4">
          <strong>Payment Methods:</strong> Credit Card, Debit Card, or Bank Transfer
        </p>
        <p className="text-xs text-gray-500">
          Pay online: <span className="font-mono">https://luxeaesthetics.pay/inv-2024-0001</span>
        </p>
      </div>

      <h2 id="getting-ready">Getting Ready for Invoices</h2>

      <p>
        While we finalize the invoice feature, here&apos;s what you can do to prepare:
      </p>

      <h3>Set Your Clinic Information</h3>
      <ul>
        <li>Complete your clinic profile in Settings</li>
        <li>Add your clinic logo and branding colors</li>
        <li>Update your business address and phone</li>
        <li>Add your tax ID (EIN) for invoice compliance</li>
      </ul>

      <h3>Organize Your Services</h3>
      <ul>
        <li>Ensure all services have accurate pricing</li>
        <li>Add medical codes if needed for insurance billing</li>
        <li>Categorize services for better invoice organization</li>
        <li>Document any treatment packages and pricing</li>
      </ul>

      <h3>Plan Your Payment Terms</h3>
      <ul>
        <li>Decide on standard payment terms (Net 30, Net 60, etc.)</li>
        <li>Define which services allow deferred billing</li>
        <li>Set up any deposit requirements</li>
        <li>Document late payment policies</li>
      </ul>

      <Callout type="tip" title="Beta Access">
        Sign up for our beta program in Settings to get early access to invoices when they launch.
        Beta testers will receive dedicated support and can help shape the final feature.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/billing/checkout" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">POS Checkout</h3>
          <p className="text-sm text-gray-500">Instant receipts and transactions</p>
        </Link>
        <Link href="/features/billing/packages" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Treatment Packages</h3>
          <p className="text-sm text-gray-500">Multi-visit service bundles</p>
        </Link>
        <Link href="/features/billing/payments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Payment Processing</h3>
          <p className="text-sm text-gray-500">Stripe integration and methods</p>
        </Link>
        <Link href="/features/reports" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Reports & Analytics</h3>
          <p className="text-sm text-gray-500">Financial reporting and insights</p>
        </Link>
      </div>
    </div>
  )
}
