'use client'

import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { HelpCircle, ChevronDown, Calendar, Users, CreditCard, MessageSquare, Settings, Lock } from 'lucide-react'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: React.ReactNode
  category: 'scheduling' | 'patients' | 'billing' | 'messaging' | 'general'
}

interface FAQCategory {
  name: string
  icon: React.ReactNode
  items: FAQItem[]
}

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 text-left">{item.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-600 text-sm space-y-2">
          {item.answer}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const categories: FAQCategory[] = [
    {
      name: 'Scheduling & Calendar',
      icon: <Calendar className="w-5 h-5" />,
      items: [
        {
          question: 'How do I create a new appointment?',
          answer: (
            <>
              <p>You can create appointments in several ways:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Click on an empty time slot in the calendar</li>
                <li>Use the "New Appointment" button in the top toolbar</li>
                <li>Drag to create appointments across multiple time slots</li>
                <li>Accept appointments from the waiting list or pending bookings</li>
              </ul>
              <p className="mt-2">
                Learn more in our <Link href="/features/calendar" className="text-primary-600 hover:underline">Calendar Guide</Link>.
              </p>
            </>
          ),
          category: 'scheduling',
        },
        {
          question: 'Can I block time off for breaks?',
          answer: (
            <>
              <p>Yes! You can create breaks directly in the calendar:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Click on a time slot and select "Break"</li>
                <li>Set the break duration and type (lunch, cleaning, etc.)</li>
                <li>Make it recurring for daily or weekly breaks</li>
                <li>Blocks prevent patient bookings during break times</li>
              </ul>
            </>
          ),
          category: 'scheduling',
        },
        {
          question: 'How do I handle double-booking situations?',
          answer: (
            <>
              <p>
                The system prevents most double-bookings automatically by checking provider availability and
                treatment chair conflicts. If conflicts occur:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>System shows a warning before saving</li>
                <li>You can override if needed (same provider, different chair)</li>
                <li>View conflict details before confirming</li>
              </ul>
              <p className="mt-2">
                See <Link href="/features/calendar#conflicts" className="text-primary-600 hover:underline">Appointment Conflicts</Link> for more details.
              </p>
            </>
          ),
          category: 'scheduling',
        },
        {
          question: 'Can group bookings be scheduled?',
          answer: (
            <>
              <p>
                Yes! The platform supports group bookings where multiple patients can be booked for the same
                appointment:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Create a group booking appointment type</li>
                <li>Set capacity (number of patients)</li>
                <li>Add multiple patients to the same appointment</li>
                <li>Track attendance and individual notes per patient</li>
              </ul>
            </>
          ),
          category: 'scheduling',
        },
        {
          question: 'How does the waitlist work?',
          answer: (
            <>
              <p>
                The waitlist helps you fill cancellations quickly:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Patients can join the waitlist for a specific service/date</li>
                <li>When appointments become available, candidates appear in a panel</li>
                <li>One-click to move waitlist patients into open slots</li>
                <li>Notifications sent automatically when spots open</li>
              </ul>
            </>
          ),
          category: 'scheduling',
        },
      ],
    },
    {
      name: 'Patient Management',
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          question: 'How do I add a new patient?',
          answer: (
            <>
              <p>Create new patients by:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Clicking "New Patient" in the patients view</li>
                <li>Letting them self-register through online booking</li>
                <li>Having them provide info during express booking</li>
                <li>Bulk importing from CSV if migrating from another system</li>
              </ul>
              <p className="mt-2">
                View the <Link href="/features/patients" className="text-primary-600 hover:underline">Patient Management Guide</Link> for full details.
              </p>
            </>
          ),
          category: 'patients',
        },
        {
          question: 'What information should I collect from patients?',
          answer: (
            <>
              <p>Essential patient information includes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Contact information (name, phone, email, address)</li>
                <li>Date of birth</li>
                <li>Medical history and allergies</li>
                <li>Medications and contraindications</li>
                <li>Emergency contact</li>
                <li>Communication preferences</li>
                <li>Consent to receive marketing messages</li>
              </ul>
            </>
          ),
          category: 'patients',
        },
        {
          question: 'How do I view a patient\'s treatment history?',
          answer: (
            <>
              <p>
                Each patient has a complete treatment history showing:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All past appointments in chronological order</li>
                <li>Services provided and products used</li>
                <li>Treatment notes from the provider</li>
                <li>Before and after photos</li>
                <li>Pricing and payment status</li>
              </ul>
              <p className="mt-2">Click any patient name to view their profile in a side panel.</p>
            </>
          ),
          category: 'patients',
        },
        {
          question: 'Can I store documents for patients?',
          answer: (
            <>
              <p>Yes, the platform includes secure document storage:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Upload consent forms and medical records</li>
                <li>Store before/after photos</li>
                <li>Keep ID copies and verification documents</li>
                <li>All documents are encrypted and audit-logged</li>
              </ul>
              <p className="mt-2">
                <Callout type="info">
                  Always keep medical documents HIPAA-compliant and securely stored.
                </Callout>
              </p>
            </>
          ),
          category: 'patients',
        },
        {
          question: 'How do I handle patient opt-outs?',
          answer: (
            <>
              <p>
                Patient communication preferences are easy to manage:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Update SMS/email preferences in their profile</li>
                <li>Respect TCPA and CAN-SPAM regulations</li>
                <li>Automatic opt-out detection for bounced messages</li>
                <li>Maintain consent records for compliance</li>
              </ul>
            </>
          ),
          category: 'patients',
        },
      ],
    },
    {
      name: 'Billing & Payments',
      icon: <CreditCard className="w-5 h-5" />,
      items: [
        {
          question: 'How do I set prices for services?',
          answer: (
            <>
              <p>
                Services can have flexible pricing:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Base service price (e.g., $200 for Botox)</li>
                <li>Per-unit pricing for injectables</li>
                <li>Add-on services and upgrades</li>
                <li>Package pricing for multiple treatments</li>
                <li>Provider-specific pricing overrides</li>
              </ul>
              <p className="mt-2">
                See <Link href="/features/billing" className="text-primary-600 hover:underline">Billing Guide</Link> for configuration.
              </p>
            </>
          ),
          category: 'billing',
        },
        {
          question: 'What payment methods are supported?',
          answer: (
            <>
              <p>
                The platform supports multiple payment methods:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Credit and debit cards (Visa, Mastercard, Amex)</li>
                <li>ACH bank transfers</li>
                <li>Cash and check payments</li>
                <li>Financing options (Care Credit, Affirm)</li>
                <li>Gift cards and store credit</li>
              </ul>
            </>
          ),
          category: 'billing',
        },
        {
          question: 'How do I handle insurance?',
          answer: (
            <>
              <p>
                While most MedSpa services are cosmetic (not covered), the system supports:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Storing patient insurance information</li>
                <li>Generating invoices for out-of-network claims</li>
                <li>Medical treatment documentation</li>
                <li>Exporting records for patient-submitted claims</li>
              </ul>
              <p className="mt-2">Note: Check with your insurance processor for specific integration needs.</p>
            </>
          ),
          category: 'billing',
        },
        {
          question: 'Can I track product costs and margins?',
          answer: (
            <>
              <p>
                Yes, the billing system tracks injectables and products:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Cost per unit (e.g., cost of Botox units)</li>
                <li>Automated unit tracking and usage</li>
                <li>Margin reporting per service</li>
                <li>Product expiration tracking</li>
                <li>Inventory management integration</li>
              </ul>
            </>
          ),
          category: 'billing',
        },
        {
          question: 'How do I apply discounts and promotions?',
          answer: (
            <>
              <p>
                Flexible discount options include:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Percentage discounts (10% off)</li>
                <li>Fixed amount discounts ($50 off)</li>
                <li>Package discounts (buy 3, get 10% off)</li>
                <li>Loyalty program integration</li>
                <li>Referral bonuses</li>
              </ul>
            </>
          ),
          category: 'billing',
        },
      ],
    },
    {
      name: 'Messaging & Communication',
      icon: <MessageSquare className="w-5 h-5" />,
      items: [
        {
          question: 'How do I send SMS messages to patients?',
          answer: (
            <>
              <p>
                Send SMS messages easily from the platform:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Click "Send SMS" on any patient record</li>
                <li>Use message templates for common messages</li>
                <li>Send to single patients or groups</li>
                <li>Schedule messages for later delivery</li>
                <li>Track delivery and read status</li>
              </ul>
              <p className="mt-2">
                <Callout type="warning">
                  Always ensure you have proper consent before sending marketing SMS messages. Respect TCPA regulations.
                </Callout>
              </p>
            </>
          ),
          category: 'messaging',
        },
        {
          question: 'What are SMS templates?',
          answer: (
            <>
              <p>
                Pre-written message templates for common use cases:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Appointment confirmations</li>
                <li>Appointment reminders (day before)</li>
                <li>Post-appointment follow-ups</li>
                <li>Promotional offers</li>
                <li>Birthday and anniversary messages</li>
                <li>Custom templates you create</li>
              </ul>
              <p className="mt-2">Templates use placeholders like {"{{patient_name}}"} for personalization.</p>
            </>
          ),
          category: 'messaging',
        },
        {
          question: 'How do SMS campaigns work?',
          answer: (
            <>
              <p>
                Run automated or manual SMS campaigns:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Create targeted recipient groups</li>
                <li>Schedule send times for optimal delivery</li>
                <li>Personalize messages per patient</li>
                <li>Track delivery, open, and click rates</li>
                <li>A/B test different messages</li>
              </ul>
              <p className="mt-2">
                See the <Link href="/features/messaging" className="text-primary-600 hover:underline">Messaging Feature Guide</Link>.
              </p>
            </>
          ),
          category: 'messaging',
        },
        {
          question: 'Can I see all patient communications in one place?',
          answer: (
            <>
              <p>
                Yes! Each patient profile has a communication history:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All SMS messages (sent and received)</li>
                <li>Email history</li>
                <li>Call logs with notes</li>
                <li>In-app messages</li>
                <li>Timestamped for audit purposes</li>
              </ul>
            </>
          ),
          category: 'messaging',
        },
        {
          question: 'What happens if an SMS bounces?',
          answer: (
            <>
              <p>
                The system handles undeliverable messages automatically:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Invalid numbers are marked as undeliverable</li>
                <li>Patient profile flags the bad number</li>
                <li>Automatic opt-out detection for complaints</li>
                <li>Failed messages don't count against your SMS limit</li>
              </ul>
            </>
          ),
          category: 'messaging',
        },
      ],
    },
    {
      name: 'General & Account',
      icon: <Settings className="w-5 h-5" />,
      items: [
        {
          question: 'How many staff members can use the platform?',
          answer: (
            <>
              <p>
                This depends on your plan:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Starter: 1-2 staff members</li>
                <li>Professional: Up to 5 staff members</li>
                <li>Enterprise: Unlimited staff members</li>
              </ul>
              <p className="mt-2">Each staff member needs individual login credentials and role-based permissions.</p>
            </>
          ),
          category: 'general',
        },
        {
          question: 'What are user roles and permissions?',
          answer: (
            <>
              <p>
                User roles control what staff can access:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Owner:</strong> Full access, billing, staff management</li>
                <li><strong>Admin:</strong> Calendar, patients, messaging, reports</li>
                <li><strong>Provider:</strong> Own appointments and patient records only</li>
                <li><strong>Receptionist:</strong> Booking, patient check-in, messages</li>
                <li><strong>Billing:</strong> Invoicing and payment processing only</li>
              </ul>
            </>
          ),
          category: 'general',
        },
        {
          question: 'How do I customize the patient booking page?',
          answer: (
            <>
              <p>
                Your public booking page is customizable:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Add your logo and brand colors</li>
                <li>Upload photos and videos</li>
                <li>Write custom service descriptions</li>
                <li>Set availability and booking windows</li>
                <li>Choose which services patients can self-book</li>
              </ul>
            </>
          ),
          category: 'general',
        },
        {
          question: 'Is my patient data secure?',
          answer: (
            <>
              <p>
                Yes, security is a top priority:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>HIPAA-compliant encryption for patient data</li>
                <li>SOC 2 Type II certified infrastructure</li>
                <li>Regular security audits and penetration testing</li>
                <li>Automatic backups and disaster recovery</li>
                <li>Audit logs for all data access</li>
              </ul>
              <p className="mt-2">
                <Callout type="success">
                  All data is encrypted at rest and in transit using industry-standard protocols.
                </Callout>
              </p>
            </>
          ),
          category: 'general',
        },
        {
          question: 'How do I export my data?',
          answer: (
            <>
              <p>
                Export options help you maintain control of your data:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Export patient records to CSV</li>
                <li>Export appointment history</li>
                <li>Export transaction/billing records</li>
                <li>Generate custom reports</li>
                <li>Request full data export anytime</li>
              </ul>
            </>
          ),
          category: 'general',
        },
        {
          question: 'What happens if I cancel my account?',
          answer: (
            <>
              <p>
                Account cancellation details:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>You can export all data before deletion</li>
                <li>30-day notice period (check your plan)</li>
                <li>No refunds for partial months</li>
                <li>Data deleted after 90-day retention period</li>
                <li>Contact support@medspa.io for assistance</li>
              </ul>
            </>
          ),
          category: 'general',
        },
      ],
    },
  ]

  return (
    <div className="prose animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <HelpCircle className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge info">
          <HelpCircle className="w-3 h-3" /> Frequently Asked Questions
        </span>
      </div>

      <h1>Frequently Asked Questions</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Find answers to common questions about using the MedSpa platform. Browse by category or search for
        specific topics.
      </p>

      <Callout type="tip" title="Can't find your answer?">
        If you can't find the answer you're looking for, visit our{' '}
        <Link href="/support" className="text-primary-600 hover:underline">
          Support page
        </Link>
        {' '}or contact us directly.
      </Callout>

      {/* Categories */}
      {categories.map((category) => (
        <div key={category.name} className="mb-12 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-primary-600">{category.icon}</div>
            <h2 className="!mt-0">{category.name}</h2>
          </div>

          <div className="space-y-3">
            {category.items.map((item, index) => (
              <FAQAccordion key={index} item={item} />
            ))}
          </div>
        </div>
      ))}

      {/* Related Links */}
      <h2>Want to learn more?</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <Link
          href="/getting-started/quick-start"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Quick Start Guide</h3>
          <p className="text-sm text-gray-500">Get up and running in minutes</p>
        </Link>
        <Link
          href="/guides/best-practices"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Best Practices</h3>
          <p className="text-sm text-gray-500">Tips for running your MedSpa</p>
        </Link>
        <Link
          href="/support"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Support</h3>
          <p className="text-sm text-gray-500">Get help when you need it</p>
        </Link>
        <Link
          href="/features"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Features</h3>
          <p className="text-sm text-gray-500">Explore all platform features</p>
        </Link>
      </div>
    </div>
  )
}
