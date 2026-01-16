'use client'

import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 text-white py-8 px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/landing" className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-block no-underline">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-white/70">Last Updated: January 1, 2026</p>
        </div>
      </header>

      {/* Content */}
      <main className="py-16 px-8">
        <div className="max-w-4xl mx-auto prose prose-gray prose-lg">

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Dalphene (&quot;we,&quot; &quot;us,&quot; or the &quot;Platform&quot;) is a comprehensive medical spa management platform
              designed to help medical spas and aesthetic practices manage patient information, appointments, billing,
              and communications. We are committed to protecting the privacy and security of all information entrusted to us.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use
              our Platform, whether as a medical spa operator (&quot;Business User&quot;), a staff member, or a patient whose
              information is processed through our Platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Patient Information</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              When medical spas use Dalphene to manage patient relationships, the following data may be collected:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Personal Identification:</strong> Name, date of birth, gender, photographs</li>
              <li><strong>Contact Information:</strong> Address, email, phone numbers, emergency contacts</li>
              <li><strong>Health Information:</strong> Medical history, allergies, treatment records, consent forms, before/after photos</li>
              <li><strong>Financial Information:</strong> Payment details (processed securely via Stripe), billing history, insurance information</li>
              <li><strong>Communication Records:</strong> SMS correspondence, email communications, appointment confirmations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>IP addresses and device information</li>
              <li>Browser type and operating system</li>
              <li>Usage data and feature interactions</li>
              <li>Performance and error logs</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Service Delivery:</strong> Appointment management, patient care coordination, billing and payments</li>
              <li><strong>Communication:</strong> Appointment reminders, treatment instructions, follow-up messages</li>
              <li><strong>Platform Improvement:</strong> Analyzing usage to improve features and user experience</li>
              <li><strong>Legal Compliance:</strong> Meeting regulatory obligations including HIPAA requirements</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong>We do not sell personal information.</strong> We share information only with:
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Service Providers</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Stripe:</strong> Payment processing (PCI-DSS Level 1 certified)</li>
              <li><strong>Twilio:</strong> SMS and voice communications (SOC 2 Type II compliant)</li>
              <li><strong>Google Cloud Platform:</strong> Secure cloud infrastructure (HIPAA, SOC 2, ISO 27001)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Legal Requirements</h3>
            <p className="text-gray-600 leading-relaxed">
              We may disclose information when required to comply with applicable laws, respond to lawful requests
              from authorities, or protect our rights and safety.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">HIPAA Compliance</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Dalphene is designed to support compliance with the Health Insurance Portability and Accountability
              Act (HIPAA). As a Business Associate under HIPAA:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>We sign Business Associate Agreements (BAAs) with all medical spa customers</li>
              <li>All subcontractors with PHI access maintain BAAs with us</li>
              <li>We implement required administrative, physical, and technical safeguards</li>
              <li>We apply the minimum necessary standard to all PHI access</li>
              <li>We maintain comprehensive audit trails of all PHI interactions</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Technical Safeguards</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Encryption:</strong> AES-256 at rest, TLS 1.3 in transit</li>
                <li><strong>Access Controls:</strong> Role-based access (RBAC), multi-factor authentication (MFA)</li>
                <li><strong>Monitoring:</strong> Real-time security monitoring, intrusion detection</li>
                <li><strong>Audit Logs:</strong> Comprehensive logging of all system access and actions</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Depending on your location, you may have rights to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your information (subject to legal retention requirements)</li>
              <li>Receive your data in a portable format</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              For patients: Contact your medical spa provider directly to exercise these rights.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-600 border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 px-4 py-2 text-left">Data Type</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Retention Period</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-200 px-4 py-2">Patient Medical Records</td><td className="border border-gray-200 px-4 py-2">7+ years (per state law)</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Billing Records</td><td className="border border-gray-200 px-4 py-2">7 years</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Communication Records</td><td className="border border-gray-200 px-4 py-2">3 years</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Audit Logs</td><td className="border border-gray-200 px-4 py-2">6 years</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use strictly necessary cookies for authentication, session management, and security.
              We also use performance cookies to understand Platform usage and improve our services.
              We do not use advertising cookies.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For privacy-related questions or to exercise your rights:
            </p>
            <div className="bg-purple-50 rounded-xl p-6 mt-4">
              <p className="font-semibold text-gray-900">Email: medspa@automationcoreinc.com</p>
              <p className="text-gray-600 text-sm mt-2">Subject: Privacy Inquiry</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify Business Users of material
              changes via email and update the &quot;Last Updated&quot; date. Continued use of the Platform after
              changes become effective constitutes acceptance of the revised policy.
            </p>
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
