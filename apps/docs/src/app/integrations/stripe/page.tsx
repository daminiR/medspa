import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { CreditCard, CheckCircle2, Lock, Shield, ExternalLink } from 'lucide-react'

export default function StripeIntegrationPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <CreditCard className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Available
        </span>
      </div>
      <h1>Stripe Payment Integration</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Accept credit and debit card payments directly in Luxe MedSpa with Stripe. Process deposits,
        package payments, and service charges securely.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Stripe Payment Setup Tutorial"
        duration="8 min"
        description="Complete guide to setting up Stripe payments for your MedSpa"
      />

      <h2 id="overview">What You Need</h2>
      <p>
        Before starting, you&apos;ll need:
      </p>
      <ul>
        <li>A Stripe account (free to create, no monthly fees)</li>
        <li>Business bank account for deposits</li>
        <li>Business address and EIN/Tax ID</li>
        <li>Stripe API keys (published and secret keys)</li>
        <li>SSL certificate (included in Luxe MedSpa)</li>
      </ul>

      <Callout type="info" title="Stripe is PCI Compliant">
        Stripe is certified PCI Level 1 compliant, the highest standard for payment security.
        Your patient payment data is never stored on your servers.
      </Callout>

      <h2 id="create-account">Step 1: Create Stripe Account</h2>

      <StepList steps={[
        {
          title: 'Visit Stripe.com',
          description: 'Go to stripe.com and click "Start now" to begin account creation.'
        },
        {
          title: 'Enter your business email',
          description: 'Use your business email address (not personal Gmail).'
        },
        {
          title: 'Create a password',
          description: 'Create a strong password with 12+ characters, numbers, and symbols.'
        },
        {
          title: 'Confirm your email',
          description: 'Click the verification link sent to your email.'
        },
        {
          title: 'Answer onboarding questions',
          description: 'Select "Beauty & wellness" as your industry and "Medical spa" as business type.'
        }
      ]} />

      <Callout type="tip" title="Use a Business Email">
        Create a dedicated email for payment processing (e.g., payments@yourspa.com) for better
        security and team management.
      </Callout>

      <h2 id="verify-business">Step 2: Verify Your Business Information</h2>
      <p>
        Stripe needs to verify your business details before processing payments:
      </p>

      <StepList steps={[
        {
          title: 'Log in to Stripe Dashboard',
          description: 'Go to dashboard.stripe.com and sign in with your credentials.'
        },
        {
          title: 'Navigate to Settings',
          description: 'Click Settings (gear icon) in the top right corner.'
        },
        {
          title: 'Go to Account Settings',
          description: 'Select "Business Profile" or "Account" tab.'
        },
        {
          title: 'Enter your business details',
          description: 'Provide: business name, address, phone, website, EIN/Tax ID.'
        },
        {
          title: 'Enter banking information',
          description: 'Add your business bank account for receiving payments. This should be in the business name.'
        },
        {
          title: 'Verify your identity',
          description: 'Stripe may ask for a photo ID and business verification. Upload when requested.'
        },
        {
          title: 'Wait for verification',
          description: 'Usually takes 1-2 business days. You\'ll receive email confirmation.'
        }
      ]} />

      <div className="not-prose bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
        <h4 className="font-semibold text-blue-900 mb-2">Required Business Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Legal business name (matching your license)</li>
          <li>• Business address (physical location, not P.O. box)</li>
          <li>• EIN or Tax ID number</li>
          <li>• Business phone number</li>
          <li>• Business website URL</li>
          <li>• Business owner's full name and SSN</li>
          <li>• Owner's date of birth and address</li>
        </ul>
      </div>

      <h2 id="get-api-keys">Step 3: Get Your API Keys</h2>
      <p>
        You need API keys to connect Stripe to Luxe MedSpa:
      </p>

      <StepList steps={[
        {
          title: 'Go to Developers Section',
          description: 'In the top navigation, click "Developers" and select "API keys".'
        },
        {
          title: 'Enable Test Mode',
          description: 'Toggle "View test data" at the top. Start in test mode to try payments safely.'
        },
        {
          title: 'Copy Test Keys',
          description: 'You\'ll see two keys: Publishable key (pk_test_...) and Secret key (sk_test_...)'
        },
        {
          title: 'Save in secure location',
          description: 'Copy both keys to a secure password manager. Keep the secret key private!'
        },
        {
          title: 'Switch to Live Mode',
          description: 'After testing, toggle "View test data" off to get your live keys (pk_live_... and sk_live_...)'
        },
        {
          title: 'Copy Live Keys',
          description: 'Copy live keys using the copy buttons next to each key.'
        }
      ]} />

      <Callout type="warning" title="Secret Keys Must Be Private">
        Your Secret key (sk_...) is like a password. Never share it, never commit it to code,
        and never show it to anyone. If compromised, regenerate it immediately from the API keys page.
      </Callout>

      <h2 id="configure-webhook">Step 4: Configure Webhooks (Important)</h2>
      <p>
        Webhooks tell Luxe MedSpa when payments succeed or fail:
      </p>

      <StepList steps={[
        {
          title: 'Go to Webhooks',
          description: 'In Developers section, click "Webhooks" in the left sidebar.'
        },
        {
          title: 'Click "Add endpoint"',
          description: 'Opens the webhook configuration form.'
        },
        {
          title: 'Enter webhook URL',
          description: 'Enter: https://yourdomain.com/api/webhooks/stripe'
        },
        {
          title: 'Select events to listen for',
          description: 'Check: "charge.succeeded", "charge.failed", "payment_intent.succeeded", "payment_intent.payment_failed"'
        },
        {
          title: 'Create endpoint',
          description: 'Click "Add endpoint" to save.'
        },
        {
          title: 'Copy signing secret',
          description: 'After creation, copy the "Signing secret" (whsec_...). You\'ll need this for MedSpa.'
        }
      ]} />

      <Callout type="info" title="Test Mode Webhooks">
        In test mode, you need to add a separate webhook endpoint with test keys. Set up both test
        and live webhooks before going live.
      </Callout>

      <h2 id="connect-to-medspa">Step 5: Connect to Luxe MedSpa</h2>
      <p>
        Now connect your Stripe account to Luxe MedSpa:
      </p>

      <StepList steps={[
        {
          title: 'Go to Settings → Integrations',
          description: 'In Luxe MedSpa, navigate to Settings and find the Integrations section.'
        },
        {
          title: 'Click "Connect Stripe"',
          description: 'Opens the Stripe configuration form.'
        },
        {
          title: 'Choose your mode',
          description: 'Select "Test Mode" for testing or "Live Mode" for real payments.'
        },
        {
          title: 'Enter Publishable Key',
          description: 'Paste your Publishable key (pk_test_... or pk_live_...)'
        },
        {
          title: 'Enter Secret Key',
          description: 'Paste your Secret key (sk_test_... or sk_live_...)'
        },
        {
          title: 'Enter Webhook Secret',
          description: 'Paste the webhook signing secret (whsec_...) from step 4.'
        },
        {
          title: 'Test the connection',
          description: 'Click "Test Connection" to verify all keys are correct.'
        },
        {
          title: 'Save',
          description: 'Click Save to complete the integration.'
        }
      ]} />

      <h2 id="test-mode">Step 6: Test Payments (Critical!)</h2>
      <p>
        Before accepting real payments, test the payment flow thoroughly:
      </p>

      <h3>Test Cards in Stripe</h3>
      <p>
        Use these test card numbers to simulate different payment scenarios:
      </p>
      <div className="not-prose overflow-x-auto mb-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Scenario</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Card Number</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Expiry/CVC</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3 font-semibold">Successful Payment</td>
              <td className="py-2 px-3 font-mono">4242 4242 4242 4242</td>
              <td className="py-2 px-3">Any future date, any CVC</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3 font-semibold">Declined Card</td>
              <td className="py-2 px-3 font-mono">4000 0000 0000 0002</td>
              <td className="py-2 px-3">Any future date, any CVC</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3 font-semibold">Requires Authentication</td>
              <td className="py-2 px-3 font-mono">4000 0025 0000 3155</td>
              <td className="py-2 px-3">Any future date, any CVC</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3 font-semibold">3D Secure (3DS)</td>
              <td className="py-2 px-3 font-mono">4000 0082 5000 0000</td>
              <td className="py-2 px-3">Any future date, any CVC</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>What to Test</h3>
      <ul>
        <li><strong>Book an appointment</strong> with payment</li>
        <li><strong>Use different payment amounts</strong> - single payment, multi-payment, deposits</li>
        <li><strong>Test declined cards</strong> - verify error message is clear</li>
        <li><strong>Check payment confirmation</strong> - receipt sent to patient email</li>
        <li><strong>Verify Stripe dashboard</strong> - payment appears in live transactions</li>
        <li><strong>Refund a payment</strong> - test refund flow from Luxe MedSpa</li>
        <li><strong>Check webhook events</strong> - in Stripe dashboard, see "Events" section</li>
      </ul>

      <Callout type="success" title="Test Thoroughly">
        The most common integration issues occur because testing wasn't thorough enough.
        Spend 15-20 minutes testing various scenarios before switching to live mode.
      </Callout>

      <h2 id="go-live">Step 7: Going Live</h2>
      <p>
        Once testing is complete and you&apos;re confident in the setup:
      </p>

      <StepList steps={[
        {
          title: 'Request activation',
          description: 'In Stripe Dashboard, click "Activate" or "Go Live" button when prompted.'
        },
        {
          title: 'Complete verification if needed',
          description: 'Stripe may ask final verification questions. Answer promptly.'
        },
        {
          title: 'Get live API keys',
          description: 'Once activated, toggle off "View test data" in API keys section to see live keys.'
        },
        {
          title: 'Update Luxe MedSpa settings',
          description: 'In Settings → Integrations, switch to "Live Mode" and enter your live keys.'
        },
        {
          title: 'Update webhook endpoint',
          description: 'Create a live webhook endpoint in Stripe for live events.'
        },
        {
          title: 'Test one live payment',
          description: 'Process a small test payment with a real card to verify everything works.'
        },
        {
          title: 'Monitor dashboard',
          description: 'Watch Stripe Dashboard for 24 hours to ensure payments are processing normally.'
        }
      ]} />

      <Callout type="warning" title="No Turning Back">
        Once you switch to live mode and process real payments, those transactions cannot be moved back to test mode.
        Make sure everything works in test mode first.
      </Callout>

      <h2 id="configure-payments">Step 8: Configure Payment Settings</h2>
      <p>
        Customize how payments work in your practice:
      </p>

      <h3>Payment Options</h3>
      <ul>
        <li><strong>Deposit payments</strong> - Require upfront deposit when booking</li>
        <li><strong>Full payment</strong> - Charge full price at booking</li>
        <li><strong>Payment plans</strong> - Allow installment payments for packages</li>
        <li><strong>Package prepayment</strong> - Pre-sell service packages</li>
        <li><strong>Add-on purchases</strong> - Sell products (skincare, supplements) at checkout</li>
      </ul>

      <h3>Customize Payment Experience</h3>
      <ul>
        <li>Set your business name on the payment form</li>
        <li>Choose payment methods (cards, Apple Pay, Google Pay, etc.)</li>
        <li>Enable/disable certain card types if needed</li>
        <li>Set automatic refund policy</li>
        <li>Configure receipt email templates</li>
      </ul>

      <h2 id="pricing">Pricing & Fees</h2>
      <p>
        Stripe pricing is simple and transparent:
      </p>
      <div className="not-prose overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Transaction Type</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Stripe Fee</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Example on $100</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3">Card present (in-person)</td>
              <td className="py-2 px-3 text-right">2.6% + $0.30</td>
              <td className="py-2 px-3 text-right">$2.90</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3">Card not present (online)</td>
              <td className="py-2 px-3 text-right">2.9% + $0.30</td>
              <td className="py-2 px-3 text-right">$3.20</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3">ACH Bank Transfer (US)</td>
              <td className="py-2 px-3 text-right">$0.80</td>
              <td className="py-2 px-3 text-right">$0.80</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3">International cards</td>
              <td className="py-2 px-3 text-right">3.9% + $0.30</td>
              <td className="py-2 px-3 text-right">$4.20</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3">Refund</td>
              <td className="py-2 px-3 text-right">No additional fee</td>
              <td className="py-2 px-3 text-right">$0.00</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3">Monthly account fee</td>
              <td className="py-2 px-3 text-right">None</td>
              <td className="py-2 px-3 text-right">$0.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="info">
        <strong>Cost Example:</strong> If you process $10,000 in payments per month at an average of $150 per transaction,
        your Stripe fees would be approximately $310/month. No monthly subscription required!
      </Callout>

      <h2 id="security">Security Best Practices</h2>
      <ul>
        <li>Never log your secret keys in code or error messages</li>
        <li>Rotate your API keys every 6-12 months</li>
        <li>Use webhook signing to verify requests from Stripe</li>
        <li>Enable two-factor authentication on your Stripe account</li>
        <li>Monitor your Stripe Dashboard for suspicious activity daily</li>
        <li>Keep your Luxe MedSpa software up to date</li>
        <li>Review payment logs regularly for chargebacks or disputes</li>
      </ul>

      <Callout type="warning" title="PCI Compliance Required">
        Payment card processing is heavily regulated. By using Stripe, you outsource PCI compliance to them.
        However, you must still handle customer data securely in other parts of your business.
      </Callout>

      <h2 id="troubleshooting">Troubleshooting</h2>

      <h3>Payments not processing</h3>
      <ul>
        <li>Verify your API keys are correct and not reversed</li>
        <li>Check that your Stripe account is activated (not just in test mode)</li>
        <li>Confirm your bank account details are correct in Stripe</li>
        <li>Check Stripe Dashboard → Events for error messages</li>
        <li>Verify webhook endpoint is receiving events (should show green checkmarks)</li>
      </ul>

      <h3>&quot;Invalid API key&quot; error</h3>
      <ul>
        <li>Double-check you&apos;re using the correct key (test vs live)</li>
        <li>Ensure no extra spaces were copied</li>
        <li>Try regenerating keys in Stripe API keys section</li>
        <li>Verify the key hasn&apos;t been revoked</li>
      </ul>

      <h3>Webhook events not being received</h3>
      <ul>
        <li>Check that webhook endpoint URL is correct and accessible</li>
        <li>Verify webhook signing secret is correct</li>
        <li>Check server logs for webhook delivery attempts</li>
        <li>Confirm your firewall/security isn&apos;t blocking Stripe&apos;s IP addresses</li>
        <li>In Stripe Dashboard, click webhook endpoint to see delivery history</li>
      </ul>

      <h3>Charges appearing in test mode on live account</h3>
      <ul>
        <li>Make sure you&apos;re using the correct API keys (pk_test_... or pk_live_...)</li>
        <li>Test mode and live mode are completely separate - check which mode you&apos;re in</li>
        <li>If charges exist in wrong mode, contact Stripe support</li>
      </ul>

      <h2 id="related">Related</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/billing" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Billing & Invoicing</h3>
          <p className="text-sm text-gray-500">Create invoices and manage payments</p>
        </Link>
        <Link href="/features/packages" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Service Packages</h3>
          <p className="text-sm text-gray-500">Sell service packages and bundles</p>
        </Link>
        <Link href="/features/reporting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Financial Reporting</h3>
          <p className="text-sm text-gray-500">Track revenue and payment metrics</p>
        </Link>
        <a href="https://stripe.com/docs" target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all flex items-start gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-1">
              Stripe Documentation
              <ExternalLink className="w-3 h-3" />
            </h3>
            <p className="text-sm text-gray-500">Official Stripe docs and guides</p>
          </div>
        </a>
      </div>
    </div>
  )
}
