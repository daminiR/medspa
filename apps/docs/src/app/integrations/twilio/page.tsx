import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { MessageSquare, CheckCircle2, Key, Phone, Shield, ExternalLink } from 'lucide-react'

export default function TwilioIntegrationPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <MessageSquare className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Available
        </span>
      </div>
      <h1>Twilio Integration</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Connect Twilio to enable SMS messaging, appointment reminders, and two-way patient
        communication in Luxe MedSpa.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Twilio Setup Tutorial"
        duration="6 min"
        description="Step-by-step guide to connecting your Twilio account"
      />

      <h2 id="overview">What You Need</h2>
      <p>
        Before starting, you&apos;ll need:
      </p>
      <ul>
        <li>A Twilio account (free to create)</li>
        <li>A phone number purchased from Twilio (~$1/month)</li>
        <li>Your Twilio Account SID and Auth Token</li>
        <li>10DLC registration completed (required for US business SMS)</li>
      </ul>

      <Callout type="warning" title="10DLC Required">
        As of 2025, all business SMS in the US requires 10DLC (10-digit long code) registration.
        Messages from unregistered numbers may be blocked by carriers. Plan for 4-7 business days
        for approval.
      </Callout>

      <h2 id="create-account">Step 1: Create Twilio Account</h2>

      <StepList steps={[
        {
          title: 'Go to Twilio.com',
          description: 'Visit twilio.com and click "Start for free" to create an account.'
        },
        {
          title: 'Verify your email',
          description: 'Check your email and click the verification link.'
        },
        {
          title: 'Verify your phone',
          description: 'Enter your phone number to receive a verification code.'
        },
        {
          title: 'Answer setup questions',
          description: 'Tell Twilio you want to use SMS for appointment reminders.'
        }
      ]} />

      <h2 id="get-number">Step 2: Get a Phone Number</h2>
      <p>
        You need a dedicated phone number for your practice&apos;s SMS messages:
      </p>

      <StepList steps={[
        {
          title: 'Go to Phone Numbers',
          description: 'In Twilio Console, navigate to Phone Numbers → Manage → Buy a number.'
        },
        {
          title: 'Search for a number',
          description: 'Search by area code to get a local number for your practice.'
        },
        {
          title: 'Check capabilities',
          description: 'Make sure the number has SMS capability (shown with a checkmark).'
        },
        {
          title: 'Purchase the number',
          description: 'Click "Buy" to purchase. Cost is typically ~$1/month.'
        }
      ]} />

      <Callout type="tip" title="Choose a Local Number">
        Patients are more likely to read messages from local area codes. If your practice is in
        Los Angeles, get a (213) or (310) number.
      </Callout>

      <h2 id="10dlc">Step 3: Complete 10DLC Registration</h2>
      <p>
        10DLC registration is required to send business SMS without being blocked:
      </p>

      <StepList steps={[
        {
          title: 'Go to Messaging → Regulatory Compliance',
          description: 'Navigate to the Trust Hub in your Twilio Console.'
        },
        {
          title: 'Start A2P 10DLC Registration',
          description: 'Select "A2P 10DLC" to register for business messaging.'
        },
        {
          title: 'Register your business (Brand)',
          description: 'Enter your business name, EIN/Tax ID, address, and website. Fee: ~$4 one-time.'
        },
        {
          title: 'Register your use case (Campaign)',
          description: 'Describe how you\'ll use SMS: "Appointment reminders and patient communication for medical spa". Fee: ~$2-10/month.'
        },
        {
          title: 'Wait for approval',
          description: 'Review typically takes 4-7 business days. You\'ll receive email updates.'
        }
      ]} />

      <div className="not-prose bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6">
        <h4 className="font-semibold text-yellow-900 mb-2">Required Information for 10DLC</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Legal business name (as registered with IRS)</li>
          <li>• EIN (Tax ID number)</li>
          <li>• Business address</li>
          <li>• Business website (must be functional)</li>
          <li>• Contact email and phone</li>
          <li>• Sample message content</li>
        </ul>
      </div>

      <h2 id="get-credentials">Step 4: Get Your Credentials</h2>
      <p>
        You need two pieces of information from Twilio:
      </p>

      <StepList steps={[
        {
          title: 'Go to your Twilio Console',
          description: 'Log in to console.twilio.com'
        },
        {
          title: 'Find Account Info',
          description: 'On the dashboard, look for "Account Info" panel on the right side.'
        },
        {
          title: 'Copy Account SID',
          description: 'Copy the Account SID (starts with "AC...")'
        },
        {
          title: 'Copy Auth Token',
          description: 'Click "Show" next to Auth Token and copy it.'
        }
      ]} />

      <Callout type="warning" title="Keep Credentials Secure">
        Your Auth Token is like a password. Never share it publicly or commit it to code repositories.
        If compromised, regenerate it immediately from the Twilio Console.
      </Callout>

      <h2 id="connect">Step 5: Connect to Luxe MedSpa</h2>
      <p>
        Now connect your Twilio account to Luxe MedSpa:
      </p>

      <StepList steps={[
        {
          title: 'Go to Settings → Integrations',
          description: 'In Luxe MedSpa, navigate to Settings and find the Integrations section.'
        },
        {
          title: 'Click "Connect Twilio"',
          description: 'Opens the Twilio configuration modal.'
        },
        {
          title: 'Enter your credentials',
          description: 'Paste your Account SID and Auth Token.'
        },
        {
          title: 'Select your phone number',
          description: 'Choose the phone number you purchased from the dropdown.'
        },
        {
          title: 'Test the connection',
          description: 'Click "Send Test SMS" to verify everything works.'
        },
        {
          title: 'Save',
          description: 'Click Save to complete the integration.'
        }
      ]} />

      <h2 id="configure">Step 6: Configure SMS Settings</h2>
      <p>
        After connecting, configure your SMS preferences:
      </p>

      <h3>Reminder Schedule</h3>
      <p>Choose when automatic reminders are sent:</p>
      <ul>
        <li><strong>48 hours before</strong> - Initial reminder with confirmation request</li>
        <li><strong>24 hours before</strong> - Follow-up for unconfirmed appointments</li>
        <li><strong>2 hours before</strong> - Day-of reminder with address</li>
      </ul>

      <h3>Message Templates</h3>
      <p>
        Customize the messages sent to patients. Use variables like:
      </p>
      <ul>
        <li><code>{'{patient_name}'}</code> - Patient&apos;s first name</li>
        <li><code>{'{appointment_date}'}</code> - Formatted appointment date</li>
        <li><code>{'{appointment_time}'}</code> - Appointment time</li>
        <li><code>{'{service_name}'}</code> - Service being performed</li>
        <li><code>{'{provider_name}'}</code> - Provider&apos;s name</li>
        <li><code>{'{practice_name}'}</code> - Your practice name</li>
        <li><code>{'{practice_phone}'}</code> - Your practice phone</li>
      </ul>

      <h2 id="costs">Costs</h2>
      <p>
        Twilio pricing is usage-based:
      </p>
      <div className="not-prose overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Item</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3">Phone number</td>
              <td className="py-2 px-3 text-right">$1.00/month</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3">Outbound SMS</td>
              <td className="py-2 px-3 text-right">$0.0079/message</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3">Inbound SMS</td>
              <td className="py-2 px-3 text-right">$0.0079/message</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3">10DLC Brand registration</td>
              <td className="py-2 px-3 text-right">$4.00 one-time</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3">10DLC Campaign</td>
              <td className="py-2 px-3 text-right">$2-10/month</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="info">
        For a typical practice sending 500 messages/month, total Twilio costs are around $8-15/month.
        This is much cheaper than competitors who charge $50-75/month for SMS features.
      </Callout>

      <h2 id="troubleshooting">Troubleshooting</h2>

      <h3>Messages not being delivered</h3>
      <ul>
        <li>Check that 10DLC registration is approved</li>
        <li>Verify the phone number has SMS capability</li>
        <li>Check Twilio Console logs for error messages</li>
        <li>Ensure patient phone numbers include country code</li>
      </ul>

      <h3>&quot;Invalid credentials&quot; error</h3>
      <ul>
        <li>Double-check Account SID and Auth Token</li>
        <li>Make sure no extra spaces were copied</li>
        <li>Try regenerating Auth Token in Twilio Console</li>
      </ul>

      <h3>High message failure rate</h3>
      <ul>
        <li>Check if 10DLC registration expired or was revoked</li>
        <li>Review message content for carrier-blocked keywords</li>
        <li>Ensure opt-out handling is working (STOP keyword)</li>
      </ul>

      <h2 id="related">Related</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/messaging" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SMS Messaging</h3>
          <p className="text-sm text-gray-500">Two-way SMS features</p>
        </Link>
        <Link href="/features/waiting-room" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Waiting Room</h3>
          <p className="text-sm text-gray-500">SMS check-in system</p>
        </Link>
        <Link href="/features/express-booking" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Express Booking</h3>
          <p className="text-sm text-gray-500">SMS booking links</p>
        </Link>
        <a href="https://www.twilio.com/docs" target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all flex items-start gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-1">
              Twilio Documentation
              <ExternalLink className="w-3 h-3" />
            </h3>
            <p className="text-sm text-gray-500">Official Twilio docs</p>
          </div>
        </a>
      </div>
    </div>
  )
}
