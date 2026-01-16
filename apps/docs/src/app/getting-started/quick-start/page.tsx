import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Rocket, CheckCircle2, Calendar, Users, MessageCircle, CreditCard, Settings } from 'lucide-react'

export default function QuickStartPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Rocket className="w-6 h-6 text-primary-600" />
        </div>
      </div>
      <h1>Quick Start Guide</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Get up and running with Luxe MedSpa in under 30 minutes. This guide walks you through
        the essential setup steps to start scheduling patients today.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Getting Started with Luxe MedSpa"
        duration="8 min"
        description="Complete walkthrough of initial setup and your first appointment"
      />

      <Callout type="tip" title="Need Help?">
        Our support team is here to help with setup. Email support@luxemedspa.com or use the
        chat widget in the bottom right corner of the app.
      </Callout>

      <h2 id="overview">Setup Overview</h2>
      <p>
        Here&apos;s what we&apos;ll cover in this quick start guide:
      </p>

      <div className="not-prose grid md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200 flex gap-3">
          <div className="step-number">1</div>
          <div>
            <h3 className="font-semibold text-gray-900">Account Setup</h3>
            <p className="text-sm text-gray-500">Create your account and configure basic settings</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200 flex gap-3">
          <div className="step-number">2</div>
          <div>
            <h3 className="font-semibold text-gray-900">Add Services</h3>
            <p className="text-sm text-gray-500">Set up the treatments you offer</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200 flex gap-3">
          <div className="step-number">3</div>
          <div>
            <h3 className="font-semibold text-gray-900">Add Staff</h3>
            <p className="text-sm text-gray-500">Create provider profiles and set availability</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200 flex gap-3">
          <div className="step-number">4</div>
          <div>
            <h3 className="font-semibold text-gray-900">Connect Integrations</h3>
            <p className="text-sm text-gray-500">Set up SMS and payments</p>
          </div>
        </div>
      </div>

      <h2 id="step-1">Step 1: Account Setup</h2>
      <p>
        After signing up, you&apos;ll land on the dashboard. Let&apos;s configure your practice details:
      </p>

      <StepList steps={[
        {
          title: 'Go to Settings',
          description: 'Click the gear icon in the sidebar or navigate to Settings from the menu.'
        },
        {
          title: 'Practice Information',
          description: 'Enter your practice name, address, phone number, and business hours.'
        },
        {
          title: 'Logo & Branding',
          description: 'Upload your logo. It appears on patient-facing pages and communications.'
        },
        {
          title: 'Timezone',
          description: 'Confirm your timezone is correct. All appointments use this timezone.'
        }
      ]} />

      <h2 id="step-2">Step 2: Add Your Services</h2>
      <p>
        Services are the treatments patients can book. Navigate to Settings → Services:
      </p>

      <StepList steps={[
        {
          title: 'Click "Add Service"',
          description: 'Opens the service creation form.'
        },
        {
          title: 'Enter service details',
          description: 'Name (e.g., "Botox - Full Face"), duration (e.g., 30 min), and price (e.g., $400).'
        },
        {
          title: 'Set category',
          description: 'Group services by type: Injectables, Facials, Laser, etc.'
        },
        {
          title: 'Add description',
          description: 'Brief description shown to patients when booking online.'
        }
      ]} />

      <Callout type="info">
        Start with your most popular services. You can always add more later. Common MedSpa services
        include Botox, Fillers, Chemical Peels, Microneedling, and Laser Hair Removal.
      </Callout>

      <h3 id="service-example">Example Services</h3>
      <div className="not-prose overflow-x-auto mb-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Service</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">Duration</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3">Botox - Full Face</td>
              <td className="py-2 px-3 text-center">30 min</td>
              <td className="py-2 px-3 text-right">$400</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3">Lip Filler - 1 Syringe</td>
              <td className="py-2 px-3 text-center">45 min</td>
              <td className="py-2 px-3 text-right">$650</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3">HydraFacial</td>
              <td className="py-2 px-3 text-center">60 min</td>
              <td className="py-2 px-3 text-right">$199</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3">Laser Hair Removal - Underarms</td>
              <td className="py-2 px-3 text-center">15 min</td>
              <td className="py-2 px-3 text-right">$150</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="step-3">Step 3: Add Staff & Providers</h2>
      <p>
        Add your team members who will perform treatments or manage the front desk:
      </p>

      <StepList steps={[
        {
          title: 'Go to Staff page',
          description: 'Click "Staff" in the sidebar navigation.'
        },
        {
          title: 'Click "Add Staff Member"',
          description: 'Opens the staff creation form.'
        },
        {
          title: 'Enter their details',
          description: 'Name, email, phone, and role (Provider, Front Desk, Admin).'
        },
        {
          title: 'Set availability',
          description: 'Configure their working days and hours (e.g., Mon-Fri 9am-5pm).'
        },
        {
          title: 'Assign services',
          description: 'Select which services this provider can perform.'
        }
      ]} />

      <Callout type="tip" title="Provider Colors">
        Each provider gets a unique color on the calendar. This makes it easy to see who&apos;s
        working when and spot scheduling conflicts at a glance.
      </Callout>

      <h2 id="step-4">Step 4: Connect Integrations</h2>
      <p>
        Two integrations are essential for full functionality:
      </p>

      <h3 id="twilio">Twilio (SMS)</h3>
      <p>
        SMS messaging requires a Twilio account. Follow our <Link href="/integrations/twilio">Twilio Setup Guide</Link> to:
      </p>
      <ul>
        <li>Create a Twilio account (free to start)</li>
        <li>Get a phone number for your practice</li>
        <li>Connect it to Luxe MedSpa</li>
      </ul>

      <h3 id="stripe">Stripe (Payments)</h3>
      <p>
        Payment processing requires Stripe. Follow our <Link href="/integrations/stripe">Stripe Setup Guide</Link> to:
      </p>
      <ul>
        <li>Create or connect your Stripe account</li>
        <li>Complete business verification</li>
        <li>Enable card-on-file and payments</li>
      </ul>

      <Callout type="warning" title="Complete Before Going Live">
        Both Twilio and Stripe require verification steps that can take 1-3 business days.
        Start these early to avoid delays when you&apos;re ready to go live.
      </Callout>

      <h2 id="first-appointment">Book Your First Appointment</h2>
      <p>
        With setup complete, let&apos;s book a test appointment:
      </p>

      <StepList steps={[
        {
          title: 'Go to Calendar',
          description: 'Click "Calendar" in the sidebar.'
        },
        {
          title: 'Click a time slot',
          description: 'Click on any available time to open the booking modal.'
        },
        {
          title: 'Create a test patient',
          description: 'Enter your own name and phone number as a test.'
        },
        {
          title: 'Select a service',
          description: 'Choose one of the services you created.'
        },
        {
          title: 'Save the appointment',
          description: 'Click "Book Appointment" to save.'
        }
      ]} />

      <p>
        Congratulations! You&apos;ve booked your first appointment. If you set up Twilio, you should
        receive a confirmation SMS.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <p>
        Now that you have the basics set up, explore these features:
      </p>

      <div className="not-prose grid md:grid-cols-2 gap-4">
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all flex gap-3">
          <Calendar className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Calendar Features</h3>
            <p className="text-sm text-gray-500">Learn about views, drag-drop, and time blocks</p>
          </div>
        </Link>
        <Link href="/features/patients" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all flex gap-3">
          <Users className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Patient Management</h3>
            <p className="text-sm text-gray-500">Managing patient profiles and history</p>
          </div>
        </Link>
        <Link href="/features/messaging" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all flex gap-3">
          <MessageCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">SMS Messaging</h3>
            <p className="text-sm text-gray-500">Two-way messaging and reminders</p>
          </div>
        </Link>
        <Link href="/features/billing" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all flex gap-3">
          <CreditCard className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Billing & Payments</h3>
            <p className="text-sm text-gray-500">Checkout, packages, and payments</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
