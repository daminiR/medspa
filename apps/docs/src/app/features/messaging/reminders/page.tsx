'use client';

import { Bell, Clock, Settings, Zap } from 'lucide-react';
import Link from 'next/link';
import { Callout } from '@/components/docs/Callout';
import { StepList } from '@/components/docs/StepList';
import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder';

export default function RemindersPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-8 h-8 text-amber-600" />
        <h1 className="text-4xl font-bold">Appointment Reminders</h1>
      </div>

      <p className="text-lg text-gray-700 mb-6">
        Automatically send appointment reminders to reduce no-shows and keep clients informed about upcoming appointments.
      </p>

      {/* Video Tutorial */}
      <VideoPlaceholder
        title="Setting Up Appointment Reminders"
        duration="6:45"
      />

      {/* Overview Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-gray-700">
          Appointment reminders are automated SMS messages sent to clients before their scheduled appointments.
          They help reduce no-show rates by keeping clients informed and giving them time to reschedule if needed.
        </p>
        <p className="text-gray-700">
          The reminder system is fully customizable, allowing you to set the timing, frequency, and message content
          to match your practice's preferences and client communication style.
        </p>
      </section>

      {/* Benefits */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Key Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-amber-50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold">Reduce No-Shows</h3>
            </div>
            <p className="text-sm text-gray-700">
              Decrease cancellation and no-show rates with timely appointment reminders.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-amber-50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold">Flexible Timing</h3>
            </div>
            <p className="text-sm text-gray-700">
              Send reminders 24 hours, 48 hours, or custom intervals before appointments.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-amber-50">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold">Fully Customizable</h3>
            </div>
            <p className="text-sm text-gray-700">
              Personalize reminder messages with client and appointment details.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-amber-50">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold">Client Self-Service</h3>
            </div>
            <p className="text-sm text-gray-700">
              Clients can easily confirm, reschedule, or cancel appointments via SMS reply.
            </p>
          </div>
        </div>
      </section>

      {/* Configuration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Configuration</h2>

        <Callout type="info">
          Reminder settings can be configured globally for your practice, or customized on a per-service basis
          for more granular control over when reminders are sent.
        </Callout>

        <h3 className="text-xl font-semibold">Global Settings</h3>

        <StepList
          steps={[
            {
              title: 'Navigate to Settings',
              description: 'Go to Settings &gt; SMS > Reminders to access global reminder configuration.',
            },
            {
              title: 'Enable Reminders',
              description:
                'Toggle "Automatic Appointment Reminders" to enable the feature for your entire practice.',
            },
            {
              title: 'Set Reminder Timing',
              description:
                'Choose when reminders should be sent: 24 hours before, 48 hours before, or a custom interval.',
            },
            {
              title: 'Choose Default Message',
              description:
                'Select from preset templates or create a custom default reminder message.',
            },
            {
              title: 'Configure Opt-Out Handling',
              description:
                'Decide how to handle clients who opt out of appointment reminders.',
            },
            {
              title: 'Save Settings',
              description: 'Save your configuration to apply across all appointments.',
            },
          ]}
        />

        <h3 className="text-xl font-semibold mt-6">Service-Specific Settings</h3>
        <p className="text-gray-700 mb-3">
          You can also set different reminder rules for specific services:
        </p>

        <StepList
          steps={[
            {
              title: 'Go to Service Settings',
              description: 'Navigate to Settings &gt; Services and select a specific service.',
            },
            {
              title: 'Enable Service Reminders',
              description:
                'Toggle "Custom Reminders" to override global settings for this service.',
            },
            {
              title: 'Set Service-Specific Timing',
              description:
                'Configure reminder timing specific to this service (e.g., 48 hours for longer procedures).',
            },
            {
              title: 'Customize Message',
              description:
                'Create a service-specific reminder message that includes relevant preparation instructions.',
            },
            {
              title: 'Save Service Settings',
              description: 'Save to apply these reminders to all appointments for this service.',
            },
          ]}
        />
      </section>

      {/* Reminder Message Templates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Reminder Message Templates</h2>

        <p className="text-gray-700">
          Here are some effective reminder message templates you can customize for your practice:
        </p>

        <div className="space-y-4 mt-4">
          <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
            <h4 className="font-semibold text-amber-900 mb-2">Standard 24-Hour Reminder</h4>
            <p className="text-sm text-amber-800 font-mono bg-white p-2 rounded border border-amber-200">
              "Hi [Name]! This is a reminder that your appointment is tomorrow at [Time] with [Provider] for [Service]. See you soon!"
            </p>
          </div>

          <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
            <h4 className="font-semibold text-amber-900 mb-2">48-Hour Reminder with Preparation</h4>
            <p className="text-sm text-amber-800 font-mono bg-white p-2 rounded border border-amber-200">
              "Hi [Name]! Your appointment is in 2 days at [Time]. Please avoid sun exposure and heavy exercise 24 hours before. Reply CONFIRM to confirm."
            </p>
          </div>

          <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
            <h4 className="font-semibold text-amber-900 mb-2">Morning-Of Reminder</h4>
            <p className="text-sm text-amber-800 font-mono bg-white p-2 rounded border border-amber-200">
              "Good morning [Name]! Just a reminder: your appointment is today at [Time]. Please arrive 5 minutes early. Reply if you have questions."
            </p>
          </div>

          <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
            <h4 className="font-semibold text-amber-900 mb-2">Pre-Appointment Checklist</h4>
            <p className="text-sm text-amber-800 font-mono bg-white p-2 rounded border border-amber-200">
              "Reminder for [Service] tomorrow at [Time]: Please hydrate well, avoid caffeine, and wear comfortable clothing. Reply READY when you're prepared!"
            </p>
          </div>
        </div>

        <Callout type="tip">
          Use placeholders like [Name], [Date], [Time], [Provider], and [Service]. The system automatically fills
          these with the appointment and client details.
        </Callout>
      </section>

      {/* Advanced Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Advanced Features</h2>

        <h3 className="text-lg font-semibold mt-4">Conditional Reminders</h3>
        <p className="text-gray-700 mb-3">
          Set reminders based on specific conditions:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-semibold">•</span>
            <span>Send different reminders for first-time vs. returning clients</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-semibold">•</span>
            <span>Trigger additional reminders for high-value or frequently canceling clients</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-semibold">•</span>
            <span>Skip reminders for clients who have opted out or unsubscribed</span>
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6">Two-Way Confirmation</h3>
        <p className="text-gray-700 mb-3">
          Clients can respond to reminders with actions:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-semibold">•</span>
            <span>
              <strong>CONFIRM</strong> - Client confirms attendance
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-semibold">•</span>
            <span>
              <strong>CANCEL</strong> - Client cancels the appointment
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-semibold">•</span>
            <span>
              <strong>RESCHEDULE</strong> - Client requests to change the appointment time
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-semibold">•</span>
            <span>
              <strong>STOP</strong> - Client opts out of future reminders
            </span>
          </li>
        </ul>

        <Callout type="warning">
          When a client replies STOP, honor the request immediately and update their preferences to prevent
          future reminder messages.
        </Callout>

        <h3 className="text-lg font-semibold mt-6">Reminder History & Analytics</h3>
        <p className="text-gray-700">
          Track reminder effectiveness with:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-semibold">•</span>
            <span>Delivery status for each reminder (sent, delivered, failed)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-semibold">•</span>
            <span>Client response rates and confirmation statistics</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-semibold">•</span>
            <span>No-show reduction metrics and ROI analysis</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-semibold">•</span>
            <span>Opt-out tracking to maintain compliance</span>
          </li>
        </ul>
      </section>

      {/* Troubleshooting */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Troubleshooting</h2>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Reminders Not Sending</h4>
            <ul className="space-y-2 text-gray-700 text-sm list-disc list-inside">
              <li>Verify that reminders are enabled in SMS settings</li>
              <li>Check that reminder timing is set correctly (e.g., 24 hours before)</li>
              <li>Ensure SMS is properly configured with valid Twilio credentials</li>
              <li>Confirm that the client has not opted out of reminders</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Client Confirmations Not Recording</h4>
            <ul className="space-y-2 text-gray-700 text-sm list-disc list-inside">
              <li>Verify that webhook handling is properly configured</li>
              <li>Check that the client's SMS response contains expected keywords (CONFIRM, CANCEL, etc.)</li>
              <li>Review SMS logs for any processing errors</li>
              <li>Ensure appointment is still in the system when response is received</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Wrong Timing or Messages</h4>
            <ul className="space-y-2 text-gray-700 text-sm list-disc list-inside">
              <li>Check global vs. service-specific reminder settings</li>
              <li>Verify timezone configuration in system settings</li>
              <li>Review message template for correct placeholders</li>
              <li>Ensure appointment details are correctly entered in the calendar</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Duplicate or Multiple Reminders</h4>
            <ul className="space-y-2 text-gray-700 text-sm list-disc list-inside">
              <li>Check if both global and service-specific reminders are enabled</li>
              <li>Review reminder frequency settings to ensure only one is scheduled</li>
              <li>Check for manual reminder messages sent in addition to automated ones</li>
              <li>Verify the appointment doesn't have multiple services set</li>
            </ul>
          </div>
        </div>

        <Callout type="info">
          If issues persist, check the system logs or contact your system administrator for technical support.
        </Callout>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Best Practices</h2>

        <div className="space-y-3">
          <div className="border rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold text-green-900 mb-2">Use Multiple Reminders Strategically</h4>
            <p className="text-sm text-green-800">
              Send reminders 48 hours in advance for complex procedures and 24 hours for routine appointments.
              Consider a same-day reminder for afternoon appointments.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold text-green-900 mb-2">Personalize Messages</h4>
            <p className="text-sm text-green-800">
              Include client names, provider names, and service details. Personalized messages have higher
              confirmation rates and lower opt-out rates.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold text-green-900 mb-2">Include Relevant Information</h4>
            <p className="text-sm text-green-800">
              For procedures requiring preparation, include pre-appointment instructions in the reminder.
              This prevents last-minute cancellations due to unpreparedness.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold text-green-900 mb-2">Monitor Response Metrics</h4>
            <p className="text-sm text-green-800">
              Track confirmation rates and no-shows to optimize your reminder strategy. A/B test different
              message templates to find what works best for your clientele.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold text-green-900 mb-2">Respect Opt-Out Requests</h4>
            <p className="text-sm text-green-800">
              Honor any STOP requests immediately. Maintain a list of clients who have opted out and
              ensure they're excluded from future reminders.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold text-green-900 mb-2">Time Reminders Appropriately</h4>
            <p className="text-sm text-green-800">
              Send reminders during business hours when clients are likely to see and respond to messages.
              Avoid very early morning or late evening sends.
            </p>
          </div>
        </div>
      </section>

      {/* Related Features */}
      <section className="space-y-4 pt-6 border-t mt-8">
        <h2 className="text-2xl font-semibold">Related Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/features/messaging/sms">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Two-Way SMS Messaging</h3>
              <p className="text-sm text-gray-700">
                Send and receive SMS messages with complete conversation history
              </p>
            </div>
          </Link>

          <Link href="/features/messaging/quick-replies">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Quick Reply Templates</h3>
              <p className="text-sm text-gray-700">
                Create and manage message templates for faster responses
              </p>
            </div>
          </Link>

          <Link href="/features/messaging/campaigns">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">SMS Campaigns</h3>
              <p className="text-sm text-gray-700">
                Create and manage marketing campaigns with bulk messaging
              </p>
            </div>
          </Link>

          <Link href="/features/messaging">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Back to Messaging</h3>
              <p className="text-sm text-gray-700">
                Overview of all messaging features and capabilities
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
