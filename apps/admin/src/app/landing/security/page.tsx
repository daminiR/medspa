'use client'

import Link from 'next/link'

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/landing" className="text-purple-400 hover:text-purple-300 text-sm mb-6 inline-block no-underline">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Security & HIPAA Compliance</h1>
              <p className="text-white/70 mt-1">Your patient data, protected by design</p>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Badges */}
      <div className="bg-gray-50 border-b border-gray-200 py-8 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
              <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900">HIPAA Compliant</h3>
              <p className="text-xs text-gray-500 mt-1">Full regulatory compliance</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
              <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900">AES-256 Encryption</h3>
              <p className="text-xs text-gray-500 mt-1">Bank-grade security</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
              <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900">SOC 2 Ready</h3>
              <p className="text-xs text-gray-500 mt-1">Audit-ready infrastructure</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
              <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900">PCI DSS</h3>
              <p className="text-xs text-gray-500 mt-1">Secure payments via Stripe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="py-16 px-8">
        <div className="max-w-4xl mx-auto">

          {/* Our Commitment */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Security Commitment</h2>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Security is not an afterthought at Dalphene—it&apos;s foundational. Every feature, every line of code,
                every infrastructure decision is made with your patient data protection in mind.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We designed Dalphene from the ground up for healthcare. Not adapted from salon software.
                Not a generic tool with &quot;HIPAA mode&quot; bolted on. Purpose-built for medical aesthetics with
                security woven into the architecture.
              </p>
            </div>
          </section>

          {/* HIPAA Compliance */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">HIPAA Compliance</h2>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Business Associate Agreements (BAA)</h3>
                    <p className="text-gray-600">
                      We sign BAAs with every medical spa customer at no additional cost. Our BAA establishes
                      clear responsibilities for PHI protection, breach notification, and compliance monitoring.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Subcontractor Compliance</h3>
                    <p className="text-gray-600">
                      Every third-party service that may access PHI—Stripe, Twilio, Google Cloud—maintains
                      a BAA with us and appropriate compliance certifications. No exceptions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Minimum Necessary Standard</h3>
                    <p className="text-gray-600">
                      Role-based access controls ensure staff see only the data they need for their job.
                      Front desk sees scheduling. Only authorized clinical staff access medical records.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Audit Trails</h3>
                    <p className="text-gray-600">
                      Every access to patient data is logged with timestamps, user identification, and action taken.
                      Immutable audit logs are retained for 6+ years for compliance and forensic purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Security */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Technical Security Measures</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Encryption
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>At Rest:</strong> AES-256 encryption for all stored data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>In Transit:</strong> TLS 1.3 for all data transmission</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Keys:</strong> Hardware Security Module (HSM) key management</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  Access Controls
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>MFA:</strong> Multi-factor authentication supported</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>RBAC:</strong> Role-based permission system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Sessions:</strong> Automatic timeout on inactivity</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Threat Protection
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>WAF:</strong> Web Application Firewall protection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>DDoS:</strong> Distributed denial-of-service mitigation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>IDS:</strong> Intrusion detection systems</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  Monitoring
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>24/7:</strong> Continuous security monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Alerts:</strong> Real-time anomaly detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span><strong>Response:</strong> Incident response procedures</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Infrastructure */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Infrastructure Security</h2>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">☁️</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Google Cloud Platform</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    HIPAA-eligible, SOC 2, ISO 27001 certified infrastructure
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🇺🇸</span>
                  </div>
                  <h3 className="font-bold text-gray-900">US-Based Data Centers</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Your data stays in the United States with multiple redundancy
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Automatic Backups</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Continuous backups with point-in-time recovery capabilities
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* What We Don't Do */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Don&apos;t Do</h2>
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <p className="text-gray-700 mb-4">
                Transparency means being clear about what we <strong>won&apos;t</strong> do with your data:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-lg">✕</span>
                  <span className="text-gray-600">We <strong>never sell</strong> your patient data to third parties</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-lg">✕</span>
                  <span className="text-gray-600">We <strong>never use</strong> patient data for advertising or marketing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-lg">✕</span>
                  <span className="text-gray-600">We <strong>never share</strong> identifiable data with unauthorized parties</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-lg">✕</span>
                  <span className="text-gray-600">We <strong>never train AI</strong> on your specific patient records</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Request BAA */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-white/80 mb-6 max-w-lg mx-auto">
                Request your Business Associate Agreement and get full access to our security documentation.
              </p>
              <a
                href="mailto:medspa@automationcoreinc.com?subject=BAA Request"
                className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all no-underline"
              >
                Request BAA
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Security Questions?</h2>
            <p className="text-gray-600 mb-4">
              We&apos;re transparent about our security practices. Ask us anything.
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="font-semibold text-gray-900">Email: medspa@automationcoreinc.com</p>
              <p className="text-gray-600 text-sm mt-2">Subject: Security Inquiry</p>
              <p className="text-gray-500 text-xs mt-4">
                We respond to security inquiries within 24 hours.
              </p>
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
