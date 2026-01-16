'use client';

import { MessageCircle, Send, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { Callout } from '@/components/docs/Callout';
import { StepList } from '@/components/docs/StepList';
import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder';

export default function SMSPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-8 h-8 text-blue-600" />
        <h1 className="text-4xl font-bold">Two-Way SMS Messaging</h1>
      </div>

      <p className="text-lg text-gray-700 mb-6">
        Enable direct communication with your clients through two-way SMS messaging. Send appointment
        confirmations, updates, and receive client responses all in one place.
      </p>

      {/* Video Tutorial */}
      <VideoPlaceholder
        title="SMS Messaging Setup & Usage"
        duration="8:32"
      />

      {/* Overview Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-gray-700">
          Two-way SMS messaging allows you to maintain conversations with clients directly through text messages.
          Whether you're sending appointment confirmations, appointment reminders, or receiving client inquiries,
          all messages are logged and accessible from within the platform.
        </p>
        <p className="text-gray-700">
          The SMS system integrates with your client database, ensuring messages are properly attributed and
          conversation history is maintained for each client contact.
        </p>
      </section>

      {/* Key Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Direct Messaging</h3>
            </div>
            <p className="text-sm text-gray-700">
              Send and receive text messages directly from the client management interface.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Multi-Client Support</h3>
            </div>
            <p className="text-sm text-gray-700">
              Manage conversations with multiple clients seamlessly from a central messaging hub.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Compliance & Privacy</h3>
            </div>
            <p className="text-sm text-gray-700">
              All messages are encrypted and stored securely in compliance with HIPAA regulations.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Message History</h3>
            </div>
            <p className="text-sm text-gray-700">
              Complete conversation history is maintained for audit trails and client reference.
            </p>
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Getting Started</h2>

        <Callout type="info">
          Before you can send SMS messages, you need to configure your Twilio credentials in the SMS settings.
          This is a one-time setup that enables all messaging features.
        </Callout>

        <h3 className="text-xl font-semibold">Step-by-Step Setup</h3>

        <StepList
          steps={[
            {
              title: 'Access SMS Settings',
              description:
                'Navigate to Settings &gt; SMS Configuration to access the SMS setup page.',
            },
            {
              title: 'Enter Twilio Credentials',
              description:
                'Add your Twilio Account SID, Auth Token, and SMS-enabled phone number. You can find these in your Twilio dashboard.',
            },
            {
              title: 'Verify Phone Number',
              description:
                'Send a test message to verify that your Twilio setup is working correctly.',
            },
            {
              title: 'Configure Default Settings',
              description:
                'Set default sender information and configure auto-reply settings if desired.',
            },
            {
              title: 'Test Messaging',
              description:
                'Send a test message to a client to ensure two-way communication is functioning properly.',
            },
          ]}
        />
      </section>

      {/* Sending Messages */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sending Messages</h2>

        <p className="text-gray-700">
          There are multiple ways to send SMS messages to your clients:
        </p>

        <h3 className="text-lg font-semibold mt-4">From Messages Page</h3>
        <p className="text-gray-700 mb-3">
          The dedicated Messages page provides a centralized location for managing all SMS conversations:
        </p>

        <StepList
          steps={[
            {
              title: 'Open Messages',
              description: 'Navigate to the Messages section in the main navigation.',
            },
            {
              title: 'Select or Search Client',
              description:
                'Choose a client from the list or search for a specific client by name or phone number.',
            },
            {
              title: 'Compose Message',
              description:
                'Type your message in the compose field. You can use quick replies or create custom messages.',
            },
            {
              title: 'Send',
              description:
                'Click Send to transmit the message. The client will receive it as a standard SMS.',
            },
          ]}
        />

        <h3 className="text-lg font-semibold mt-6">From Client Profile</h3>
        <p className="text-gray-700 mb-3">
          You can also send messages directly from a client's profile:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Open the client's profile</li>
          <li>Click the "Send Message" button</li>
          <li>Compose and send your message</li>
        </ol>

        <h3 className="text-lg font-semibold mt-6">From Appointments</h3>
        <p className="text-gray-700 mb-3">
          Send appointment-related messages directly from the calendar or appointment details:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Click on an appointment in the calendar</li>
          <li>Click "Message Client" in the appointment details panel</li>
          <li>Choose from appointment reminders or send a custom message</li>
        </ol>
      </section>

      {/* Message Templates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Message Templates & Examples</h2>

        <p className="text-gray-700">
          Here are some common message templates you can customize for your practice:
        </p>

        <div className="space-y-4 mt-4">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <h4 className="font-semibold text-blue-900 mb-2">Appointment Confirmation</h4>
            <p className="text-sm text-blue-800 font-mono bg-white p-2 rounded border border-blue-200">
              "Hi [Name]! Your appointment is confirmed for [Date] at [Time] with [Provider] for [Service]. Reply STOP to cancel."
            </p>
          </div>

          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-green-900 mb-2">Pre-Appointment Reminder</h4>
            <p className="text-sm text-green-800 font-mono bg-white p-2 rounded border border-green-200">
              "Reminder: Your appointment is tomorrow at [Time] with [Provider]. Please arrive 5 minutes early. Reply with any questions!"
            </p>
          </div>

          <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
            <h4 className="font-semibold text-purple-900 mb-2">Post-Appointment Follow-Up</h4>
            <p className="text-sm text-purple-800 font-mono bg-white p-2 rounded border border-purple-200">
              "Thank you for visiting! How was your experience? We'd love to hear your feedback. Reply with comments or rate us on Google."
            </p>
          </div>

          <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
            <h4 className="font-semibold text-amber-900 mb-2">Appointment Reschedule</h4>
            <p className="text-sm text-amber-800 font-mono bg-white p-2 rounded border border-amber-200">
              "We need to reschedule your appointment. Your current slot ([Old Date/Time]) is no longer available. Please reply with your preferred date and time."
            </p>
          </div>
        </div>

        <Callout type="tip">
          Use square brackets like [Name], [Date], [Time], [Provider] as placeholders. The system will automatically
          fill these with the appropriate client and appointment information.
        </Callout>
      </section>

      {/* Receiving Messages */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Receiving & Responding to Messages</h2>

        <p className="text-gray-700">
          When clients reply to your messages, their responses appear in the Messages page with full conversation history.
        </p>

        <h3 className="text-lg font-semibold mt-4">Message Notification Options</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-semibold">•</span>
            <span>Desktop notifications when a new message arrives</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-semibold">•</span>
            <span>Email notifications for important messages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-semibold">•</span>
            <span>In-app notification badge on the Messages icon</span>
          </li>
        </ul>

        <Callout type="warning">
          Messages sent outside business hours are still logged but may require follow-up the next business day.
          Consider setting up auto-replies for after-hours messages.
        </Callout>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Best Practices</h2>

        <div className="space-y-3">
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Be Concise and Clear</h4>
            <p className="text-sm text-blue-800">
              SMS messages are limited to 160 characters. Keep messages short and direct to ensure they're readable and professional.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Respect Timing</h4>
            <p className="text-sm text-blue-800">
              Avoid sending messages outside business hours. Schedule important announcements for business hours
              to ensure faster response rates.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Provide Clear CTAs</h4>
            <p className="text-sm text-blue-800">
              Every message should include a clear call-to-action. Whether it's confirming an appointment
              or requesting a response, make the next step obvious.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Personalize When Possible</h4>
            <p className="text-sm text-blue-800">
              Use client names and specific appointment details to create personalized, professional messages
              that build stronger relationships.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Honor Opt-Out Requests</h4>
            <p className="text-sm text-blue-800">
              If a client replies with "STOP," immediately halt all marketing communications.
              Document the opt-out in the client's profile.
            </p>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Troubleshooting</h2>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Messages Not Being Sent</h4>
            <ul className="space-y-2 text-gray-700 text-sm list-disc list-inside">
              <li>Verify Twilio credentials are correctly entered in SMS settings</li>
              <li>Check that your Twilio account has active SMS service</li>
              <li>Ensure the phone number format is correct (include country code)</li>
              <li>Check your Twilio account balance and usage limits</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Not Receiving Client Replies</h4>
            <ul className="space-y-2 text-gray-700 text-sm list-disc list-inside">
              <li>Verify that Twilio webhooks are correctly configured</li>
              <li>Check that your Twilio phone number can receive SMS</li>
              <li>Ensure the client is not blocked or opted-out</li>
              <li>Check system logs for any webhook errors</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Message Formatting Issues</h4>
            <ul className="space-y-2 text-gray-700 text-sm list-disc list-inside">
              <li>Avoid special characters that may not transmit properly</li>
              <li>Test with a personal phone number first</li>
              <li>Keep messages under 160 characters for single SMS</li>
              <li>Use standard line breaks instead of special formatting</li>
            </ul>
          </div>
        </div>

        <Callout type="info">
          For more technical support, contact your system administrator or consult the Twilio documentation.
        </Callout>
      </section>

      {/* Related Features */}
      <section className="space-y-4 pt-6 border-t mt-8">
        <h2 className="text-2xl font-semibold">Related Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/features/messaging/reminders">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Appointment Reminders</h3>
              <p className="text-sm text-gray-700">
                Configure automated reminders for upcoming appointments
              </p>
            </div>
          </Link>

          <Link href="/features/messaging/quick-replies">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Quick Reply Templates</h3>
              <p className="text-sm text-gray-700">
                Set up and manage message templates for faster responses
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
