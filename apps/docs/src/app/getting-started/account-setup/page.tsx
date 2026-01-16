import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { UserCircle, Lock, Settings, Building2, Users, CheckCircle2 } from 'lucide-react'

export default function AccountSetupPage() {
  const signupSteps = [
    {
      title: 'Visit the signup page',
      description:
        'Go to app.medspa.io/signup and click "Create Account". You can also sign up from the main website.',
    },
    {
      title: 'Enter your email and password',
      description:
        'Use a strong password (minimum 12 characters with uppercase, lowercase, numbers, and symbols). We recommend using a password manager.',
    },
    {
      title: 'Verify your email',
      description:
        'Check your inbox for a verification email. Click the link to confirm your email address. The link expires in 24 hours.',
    },
    {
      title: 'Set up your business profile',
      description:
        'Enter your business name, phone number, address, and website. This information is used for patient-facing materials.',
    },
    {
      title: 'Configure your time zone',
      description:
        'Select your time zone. This affects how appointments are displayed and when automated messages are sent.',
    },
    {
      title: 'Welcome!',
      description:
        'Your account is ready! You\'ll be guided through the onboarding wizard to set up services, staff, and basic settings.',
    },
  ]

  const basicConfigSteps = [
    {
      title: 'Add your team members',
      description:
        'Invite staff members with appropriate roles (Admin, Provider, Receptionist, Billing). They\'ll receive emails to set up their accounts.',
    },
    {
      title: 'Create your services',
      description:
        'Add the treatments and services you offer (Botox, Facials, Laser, etc.). Set duration, pricing, and which providers offer each service.',
    },
    {
      title: 'Set staff schedules',
      description:
        'Configure when each provider works. Set working hours, days off, and lunch breaks.',
    },
    {
      title: 'Configure payment methods',
      description:
        'Connect your payment processor (Stripe, Square, etc.). Set up accepted payment methods and pricing.',
    },
    {
      title: 'Customize your public booking page',
      description:
        'Upload your logo, photos, and custom text. This is what patients see when they try to book online.',
    },
    {
      title: 'Test everything',
      description:
        'Create a test patient and appointment. Send a test SMS. Process a test payment. Make sure everything works.',
    },
  ]

  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <UserCircle className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge success">
          <CheckCircle2 className="w-3 h-3" /> Account Setup
        </span>
      </div>

      <h1>Account Setup Guide</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Get your MedSpa account set up in minutes with this step-by-step guide. Estimated time: 30-45 minutes.
      </p>

      <Callout type="tip" title="Pre-requisites">
        Before you start, make sure you have:
        <ul className="mt-2">
          <li>Your business information (name, address, phone)</li>
          <li>List of staff members and their roles</li>
          <li>Services/treatments you want to offer</li>
          <li>Payment processor account (Stripe, Square, etc.)</li>
        </ul>
      </Callout>

      {/* Signup */}
      <h2 id="signup">
        <UserCircle className="w-6 h-6 inline mr-2" />
        Step 1: Create Your Account
      </h2>

      <StepList steps={signupSteps} />

      <h3>Password Requirements</h3>
      <p>Your password must be at least 12 characters and contain:</p>
      <ul>
        <li>At least one uppercase letter (A-Z)</li>
        <li>At least one lowercase letter (a-z)</li>
        <li>At least one number (0-9)</li>
        <li>At least one special character (!@#$%^&*)</li>
      </ul>

      <Callout type="warning" title="Password security">
        Use a unique password that you don't use for other accounts. Consider using a password manager like
        1Password, LastPass, or Bitwarden to generate and store strong passwords.
      </Callout>

      {/* Basic Configuration */}
      <h2 id="configuration">
        <Building2 className="w-6 h-6 inline mr-2" />
        Step 2: Basic Configuration
      </h2>

      <p>
        After signing up, you'll be guided through the onboarding wizard. Here's what you'll configure:
      </p>

      <StepList steps={basicConfigSteps} />

      {/* Adding Team Members */}
      <h2 id="team">
        <Users className="w-6 h-6 inline mr-2" />
        Adding Team Members
      </h2>

      <p>
        Invite your staff to the platform so they can access the calendar, patients, and other features.
      </p>

      <h3>How to invite team members</h3>
      <ol>
        <li>Go to Settings → Team Members</li>
        <li>Click "Invite Team Member"</li>
        <li>Enter their email address and select their role:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Owner:</strong> Full access (you). Only one per account.</li>
            <li><strong>Admin:</strong> Can manage calendar, patients, messages, and reports</li>
            <li><strong>Provider:</strong> Can see only their own appointments and patients</li>
            <li><strong>Receptionist:</strong> Can book appointments and manage check-in</li>
            <li><strong>Billing:</strong> Can process payments and generate invoices</li>
          </ul>
        </li>
        <li>They'll receive an email invitation to accept and set up their account</li>
        <li>They'll be able to log in immediately after accepting</li>
      </ol>

      <Callout type="info" title="Role-based access control">
        Each role has specific permissions. For example, providers can only see their own appointments, while
        admins can see everyone's. You can customize permissions in advanced settings.
      </Callout>

      {/* Creating Services */}
      <h2>Creating Services</h2>

      <p>
        Services are the treatments and procedures you offer (Botox, Facials, Microneedling, etc.). Set them up now
        so you can schedule appointments.
      </p>

      <h3>Service Configuration</h3>
      <ol>
        <li>Go to Settings → Services</li>
        <li>Click "Add Service"</li>
        <li>Fill in the service details:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Service name:</strong> What patients see (e.g., "Botox Treatment")</li>
            <li><strong>Duration:</strong> How long the appointment takes (in minutes)</li>
            <li><strong>Description:</strong> What patients see when booking (optional)</li>
            <li><strong>Price:</strong> Base price for the service</li>
            <li><strong>Providers:</strong> Which staff members offer this service</li>
            <li><strong>Color:</strong> For calendar display (helps identify services at a glance)</li>
          </ul>
        </li>
        <li>Click "Save Service"</li>
        <li>Repeat for each service you offer</li>
      </ol>

      <h3>Pro Tips for Services</h3>
      <ul>
        <li>
          <strong>Start simple:</strong> Add your core services first. You can add specialized services later.
        </li>
        <li>
          <strong>Set accurate durations:</strong> Include setup time, procedure time, and buffer for cleanup.
          Inaccurate durations lead to double-booking.
        </li>
        <li>
          <strong>Use standard prices:</strong> You can override prices for specific providers later if needed.
        </li>
        <li>
          <strong>Group similar services:</strong> Create packages (e.g., "Glow Package" = Facial + Serum) for
          upselling.
        </li>
      </ul>

      <Callout type="success">
        Pro practices add 3-5 core services per provider. Avoid creating too many variations as it complicates
        booking.
      </Callout>

      {/* Staff Schedules */}
      <h2>Setting Staff Schedules</h2>

      <p>
        Configure when each provider is available. This prevents patients from booking appointments when staff aren't
        working.
      </p>

      <h3>How to set schedules</h3>
      <ol>
        <li>Go to Settings → Staff → Select a staff member</li>
        <li>Click "Set Schedule"</li>
        <li>Configure their working hours:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Select which days they work</li>
            <li>Set start and end times (e.g., 9:00 AM - 5:00 PM)</li>
            <li>Add lunch breaks and other scheduled breaks</li>
          </ul>
        </li>
        <li>Set time off and vacation:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Single days off</li>
            <li>Vacation periods</li>
            <li>Holiday closures</li>
          </ul>
        </li>
        <li>Click "Save Schedule"</li>
        <li>Repeat for each staff member</li>
      </ol>

      <h3>Schedule Examples</h3>
      <div className="not-prose grid md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Typical Schedule</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Monday - Friday: 9:00 AM - 5:00 PM</li>
            <li>Lunch: 12:00 PM - 1:00 PM</li>
            <li>Closed: Saturday, Sunday</li>
          </ul>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Extended Hours</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Monday - Thursday: 9:00 AM - 7:00 PM</li>
            <li>Friday: 9:00 AM - 5:00 PM</li>
            <li>Saturday: 10:00 AM - 4:00 PM</li>
            <li>Lunch: 12:30 PM - 1:30 PM</li>
          </ul>
        </div>
      </div>

      {/* Payment Setup */}
      <h2 id="payments">
        <Lock className="w-6 h-6 inline mr-2" />
        Payment Processor Setup
      </h2>

      <p>
        Connect a payment processor to accept credit card payments. We support Stripe, Square, and PayPal.
      </p>

      <h3>Supported Payment Processors</h3>
      <div className="not-prose grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Stripe</h4>
          <p className="text-sm text-gray-600">Best for most MedSpas. Lowest fees, best features.</p>
          <p className="text-xs text-gray-500 mt-2">2.9% + $0.30 per transaction</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Square</h4>
          <p className="text-sm text-gray-600">Good for in-person and online. Flat-rate pricing.</p>
          <p className="text-xs text-gray-500 mt-2">2.9% + $0.30 per transaction</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">PayPal</h4>
          <p className="text-sm text-gray-600">Good if you already use PayPal.</p>
          <p className="text-xs text-gray-500 mt-2">3.49% + $0.49 per transaction</p>
        </div>
      </div>

      <h3>How to connect Stripe (recommended)</h3>
      <ol>
        <li>Go to Settings → Payments → "Connect Stripe"</li>
        <li>You'll be redirected to Stripe.com to create/login to your account</li>
        <li>Authorize MedSpa to process payments on your behalf</li>
        <li>You'll be redirected back to the platform with Stripe connected</li>
        <li>Configure your payment methods:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Enable credit/debit cards (required)</li>
            <li>Enable digital wallets (Apple Pay, Google Pay) (optional)</li>
            <li>Set payment collection method (at booking, at check-in, after service)</li>
          </ul>
        </li>
      </ol>

      <Callout type="warning" title="Security note">
        We never see your card data. All payment information is encrypted and processed directly by your payment
        processor (Stripe, Square, etc.). This is PCI-DSS compliant.
      </Callout>

      {/* Customizing Booking Page */}
      <h2>Customizing Your Public Booking Page</h2>

      <p>
        This is what patients see when they try to book appointments online. Customize it to match your brand.
      </p>

      <h3>How to customize</h3>
      <ol>
        <li>Go to Settings → Booking Page</li>
        <li>Upload your logo (recommended size: 200x50px)</li>
        <li>Choose your brand colors and theme</li>
        <li>Upload hero images or background photos</li>
        <li>Write a welcome message</li>
        <li>Add service descriptions that patients will see</li>
        <li>Customize the appointment confirmation email</li>
        <li>Click "Preview" to see how it looks to patients</li>
        <li>Click "Publish" to make it live</li>
      </ol>

      <h3>Booking Page Best Practices</h3>
      <ul>
        <li>Use high-quality photos that represent your business</li>
        <li>Keep the color scheme professional and on-brand</li>
        <li>Write clear service descriptions (mention duration, price, benefits)</li>
        <li>Add before/after photos if you have them (with consent)</li>
        <li>Include a brief bio for each provider</li>
        <li>Make sure contact information is easy to find</li>
      </ul>

      <Callout type="success" title="Patient experience matters">
        Your public booking page is often the first impression patients have. Invest time in making it look
        professional and inviting. Studies show attractive, clear booking pages increase conversion by 40%.
      </Callout>

      {/* SMS Setup */}
      <h2>Setting Up SMS Messaging</h2>

      <p>
        SMS is one of the most effective ways to communicate with patients (98% open rate!). Set it up to send
        confirmations and reminders.
      </p>

      <h3>How to enable SMS</h3>
      <ol>
        <li>Go to Settings → Messaging → SMS</li>
        <li>Click "Enable SMS Messaging"</li>
        <li>Enter your account details or create a Twilio account (our SMS provider)</li>
        <li>Configure default SMS messages:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Booking confirmation message</li>
            <li>Appointment reminder (24 hours before)</li>
            <li>Post-appointment follow-up</li>
          </ul>
        </li>
        <li>Set when messages are automatically sent</li>
        <li>Click "Save"</li>
      </ol>

      <h3>SMS Message Tips</h3>
      <ul>
        <li>Keep messages under 160 characters for best delivery</li>
        <li>Include appointment date/time and how to cancel</li>
        <li>Personalize with patient&apos;s name using {'{patient_name}'} placeholder</li>
        <li>Always include an opt-out instruction per TCPA regulations</li>
        <li>Send reminders 24 hours before for best results</li>
      </ul>

      {/* Security Settings */}
      <h2 id="security">
        <Lock className="w-6 h-6 inline mr-2" />
        Security Settings
      </h2>

      <p>
        Protect your account and patient data with these security settings.
      </p>

      <h3>Enable Two-Factor Authentication (2FA)</h3>
      <ol>
        <li>Go to Settings → Security</li>
        <li>Click "Enable Two-Factor Authentication"</li>
        <li>Choose your 2FA method:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Authenticator app:</strong> Google Authenticator, Authy, Microsoft Authenticator</li>
            <li><strong>SMS:</strong> Receive codes via text message (less secure)</li>
          </ul>
        </li>
        <li>Follow the setup instructions</li>
        <li>Save your recovery codes in a safe place</li>
        <li>Test it out by logging out and back in</li>
      </ol>

      <Callout type="warning" title="Important security measure">
        Two-factor authentication significantly improves security. We strongly recommend enabling it for all
        accounts, especially if you have admin privileges.
      </Callout>

      <h3>Other Security Settings</h3>
      <ul>
        <li>
          <strong>Active sessions:</strong> View and terminate sessions from other devices
        </li>
        <li>
          <strong>Login activity:</strong> See when and where your account was accessed
        </li>
        <li>
          <strong>IP whitelist:</strong> Restrict login to specific IP addresses (Enterprise only)
        </li>
        <li>
          <strong>Session timeout:</strong> Set how long before automatic logout when idle
        </li>
      </ul>

      {/* Testing */}
      <h2>Testing Your Setup</h2>

      <p>
        Before going live, test everything to make sure it works:
      </p>

      <h3>Testing Checklist</h3>
      <div className="not-prose space-y-3 mb-8">
        {[
          'Create a test patient record',
          'Create a test appointment in the calendar',
          'Process a test payment (use test card 4242-4242-4242-4242)',
          'Test SMS sending (send yourself a test message)',
          'Test email notifications (check your email)',
          'Test online booking (book an appointment on your public page)',
          'Test staff member login (have a staff member log in)',
          'Test appointment reminders (create appointment and wait for SMS)',
          'Test calendar views (switch between day, week, month views)',
          'Test patient search functionality',
        ].map((item, index) => (
          <label
            key={index}
            className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700">{item}</span>
          </label>
        ))}
      </div>

      {/* Next Steps */}
      <h2>What's Next?</h2>

      <p>
        Congratulations! Your account is set up. Here's what to do next:
      </p>

      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <Link
          href="/getting-started/quick-start"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Quick Start Guide</h3>
          <p className="text-sm text-gray-500">Learn core features and workflows</p>
        </Link>

        <Link
          href="/guides/best-practices"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Best Practices</h3>
          <p className="text-sm text-gray-500">Optimize your MedSpa operations</p>
        </Link>

        <Link
          href="/features"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Explore Features</h3>
          <p className="text-sm text-gray-500">Learn about all platform capabilities</p>
        </Link>

        <Link
          href="/support"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Get Support</h3>
          <p className="text-sm text-gray-500">Contact our support team for help</p>
        </Link>
      </div>

      <Callout type="tip" title="Free setup assistance available">
        Professional and Enterprise plans include a free 30-minute setup call with our onboarding specialist.
        Schedule this when you sign up to get help with configuration.
      </Callout>
    </div>
  )
}
