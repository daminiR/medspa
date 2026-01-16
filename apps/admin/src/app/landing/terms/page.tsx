'use client'

import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 text-white py-8 px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/landing" className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-block no-underline">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-white/70">Last Updated: January 1, 2026</p>
        </div>
      </header>

      {/* Content */}
      <main className="py-16 px-8">
        <div className="max-w-4xl mx-auto prose prose-gray prose-lg">

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using Dalphene (&quot;the Platform&quot;), you agree to be bound by these Terms of Service.
              If you are using the Platform on behalf of a medical spa or organization, you represent that you have
              authority to bind that entity to these terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Dalphene is a software-as-a-service (SaaS) platform providing medical spa management capabilities including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Appointment scheduling and calendar management</li>
              <li>Patient records and clinical documentation</li>
              <li>Billing, invoicing, and payment processing</li>
              <li>SMS and email communication</li>
              <li>Inventory and product management</li>
              <li>Reporting and analytics</li>
              <li>Staff management and scheduling</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Responsibilities</h2>
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Account Security</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your login credentials</li>
              <li>You must immediately notify us of any unauthorized access</li>
              <li>You are responsible for all activities under your account</li>
              <li>Multi-factor authentication is strongly recommended and may be required</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Administrator Duties</h3>
            <p className="text-gray-600 leading-relaxed">
              Account administrators are responsible for managing user access, maintaining appropriate role-based
              permissions, and ensuring all users comply with these terms and applicable regulations.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
            <p className="text-gray-600 leading-relaxed mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Use the Platform for any unlawful purpose</li>
              <li>Violate any applicable laws or regulations (including HIPAA)</li>
              <li>Transmit malicious code, viruses, or harmful data</li>
              <li>Attempt to gain unauthorized access to any part of the Platform</li>
              <li>Interfere with or disrupt the Platform&apos;s operation</li>
              <li>Use the Platform to send spam or unsolicited communications</li>
              <li>Reverse engineer, decompile, or disassemble the Platform</li>
              <li>Resell or sublicense access without authorization</li>
              <li>Store or transmit content that infringes on intellectual property rights</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. HIPAA Business Associate Agreement</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-6">
              <p className="text-gray-700 font-medium mb-2">Important Notice</p>
              <p className="text-gray-600 text-sm">
                Before transmitting any Protected Health Information (PHI) through the Platform, you must execute
                a Business Associate Agreement (BAA) with Dalphene. Contact us at medspa@automationcoreinc.com to
                request your BAA.
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed">
              As a Covered Entity under HIPAA, you are responsible for ensuring proper patient consent,
              implementing appropriate privacy policies, training your staff on HIPAA requirements, and
              reporting any suspected breaches to us immediately.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Subscription</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Subscriptions are billed in advance on a monthly or annual basis</li>
              <li>Annual subscriptions receive a discount as specified at signup</li>
              <li>All fees are non-refundable except as expressly stated</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Late Payment</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Late payments may incur a fee of 1.5% per month</li>
              <li>Access may be suspended after 15 days of non-payment</li>
              <li>Accounts may be terminated after 30 days of non-payment</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Price Changes</h3>
            <p className="text-gray-600 leading-relaxed">
              We will provide at least 30 days&apos; notice before any price increases. Price changes
              take effect at the start of your next billing cycle.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong>Our Property:</strong> Dalphene, including all software, content, designs, trademarks,
              and documentation, is owned by Automation Core and protected by intellectual property laws.
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong>Your License:</strong> We grant you a limited, non-exclusive, non-transferable license
              to access and use the Platform during your subscription term for your internal business purposes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Ownership</h2>
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl mb-6">
              <p className="text-gray-700 font-medium mb-2">You Own Your Data</p>
              <p className="text-gray-600 text-sm">
                All patient information, business data, and content you enter into the Platform remains your property.
                We do not claim ownership of your data and will not use it except to provide and improve the Platform.
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed">
              You grant us a limited license to process your data solely to provide the Platform services.
              We may use aggregated, anonymized data that cannot identify individuals for analytics and
              platform improvement.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Service Availability</h2>
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Uptime Commitment</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We target 99.9% uptime for the Platform, excluding scheduled maintenance and circumstances
              beyond our reasonable control.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Scheduled Maintenance</h3>
            <p className="text-gray-600 leading-relaxed">
              We perform scheduled maintenance during low-usage periods (typically 2-6 AM local time)
              and will provide advance notice for maintenance expected to exceed 30 minutes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <div className="bg-gray-100 rounded-xl p-6">
              <p className="text-gray-600 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Our total liability is limited to the fees you paid in the 12 months preceding the claim</li>
                <li>We are not liable for delays or failures due to circumstances beyond our reasonable control</li>
                <li>The Platform is provided &quot;as is&quot; without warranty of any kind</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify and hold harmless Dalphene, Automation Core, and their officers,
              directors, and employees from any claims, damages, or expenses arising from your use of
              the Platform, violation of these terms, or infringement of any third-party rights.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">By You</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              You may cancel your subscription at any time. Cancellation takes effect at the end of
              your current billing period. No refunds are provided for partial periods.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">By Us</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may terminate or suspend your access immediately for violations of these terms,
              non-payment, or if required by law. We will provide 30 days&apos; notice for terminations
              not based on violations.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Data Export</h3>
            <p className="text-gray-600 leading-relaxed">
              Upon termination, you have 30 days to export your data. We provide data exports in
              standard formats (CSV, PDF, JSON). After 30 days, data may be deleted according to
              our retention policies, subject to legal requirements.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Dispute Resolution</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Before initiating formal proceedings, you agree to contact us to attempt informal resolution.
              Any disputes that cannot be resolved informally shall be resolved through binding arbitration
              administered by JAMS under its Comprehensive Arbitration Rules.
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong>Class Action Waiver:</strong> You agree that any disputes will be resolved on an
              individual basis and not as part of a class action.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by the laws of the State of Delaware, without regard to conflict
              of law principles. Any litigation shall be brought exclusively in the state or federal
              courts located in Wilmington, Delaware.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may modify these Terms at any time. We will provide at least 30 days&apos; notice of
              material changes via email or Platform notification. Continued use after changes become
              effective constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms:
            </p>
            <div className="bg-purple-50 rounded-xl p-6 mt-4">
              <p className="font-semibold text-gray-900">Email: medspa@automationcoreinc.com</p>
              <p className="text-gray-600 text-sm mt-2">Subject: Terms Inquiry</p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/50 text-sm">© 2026 Dalphene by Automation Core. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
