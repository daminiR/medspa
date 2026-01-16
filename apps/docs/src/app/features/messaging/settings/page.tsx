'use client';

import { Settings, Phone, Users, Shield, Clock, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Callout } from '@/components/docs/Callout';
import { StepList } from '@/components/docs/StepList';
import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder';

export default function SMSSettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-gray-600" />
        <h1 className="text-4xl font-bold">SMS Settings</h1>
      </div>

      <p className="text-lg text-gray-700 mb-6">
        Configure your SMS messaging settings including business phone number, staff permissions,
        compliance settings, and automated responses. Access these settings from Settings → SMS.
      </p>

      {/* Video Tutorial */}
      <VideoPlaceholder
        title="SMS Settings Configuration"
        duration="5:20"
      />

      {/* Business Phone Number */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Business Phone Number</h2>

        <p className="text-gray-700">
          Your dedicated business phone number is the number patients see when they receive
          SMS messages from your practice. All replies come back to your unified inbox.
        </p>

        <div className="bg-gray-50 border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">Current Number</p>
                <p className="text-lg font-mono text-gray-700">(555) 123-4567</p>
              </div>
            </div>
            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
              Active
            </span>
          </div>
          <p className="text-sm text-gray-600">
            This is your Twilio phone number. Patients can text this number directly.
          </p>
        </div>

        <h3 className="text-lg font-semibold mt-6">Managing Your Number</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-semibold">•</span>
            <span><strong>Copy Number:</strong> Click the copy button to copy your number for marketing materials</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-semibold">•</span>
            <span><strong>Get New Number:</strong> Request a new number if you need to change your business line</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-semibold">•</span>
            <span><strong>Release Number:</strong> Stop using a number (requires Twilio configuration)</span>
          </li>
        </ul>

        <Callout type="warning">
          Changing your phone number affects all outgoing messages. Update your marketing materials
          and inform patients of any number changes.
        </Callout>
      </section>

      {/* Business Hours */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Business Hours & Auto-Reply</h2>

        <p className="text-gray-700">
          Configure your business hours and set up automatic replies for messages received
          outside operating hours.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Business Hours</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Time:</span>
                <span className="font-medium">9:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Time:</span>
                <span className="font-medium">6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Zone:</span>
                <span className="font-medium">Eastern (ET)</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">After-Hours Auto-Reply</h3>
            </div>
            <div className="bg-gray-50 p-3 rounded text-sm font-mono">
              "Thanks for reaching out! Our office is currently closed. We'll respond
              during business hours (Mon-Fri 9AM-6PM). For emergencies, call 911."
            </div>
          </div>
        </div>

        <Callout type="info">
          TCPA regulations require that marketing messages only be sent between 8 AM and 9 PM
          in the recipient's time zone. Our system automatically enforces these restrictions.
        </Callout>
      </section>

      {/* Staff Permissions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Staff Permissions</h2>

        <p className="text-gray-700">
          Control which team members can send SMS messages and who has permission to send
          marketing campaigns.
        </p>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Staff Member</th>
                <th className="text-center p-4 font-semibold text-gray-700">SMS Access</th>
                <th className="text-center p-4 font-semibold text-gray-700">Marketing</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4">
                  <div>
                    <p className="font-medium">Dr. Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Owner</p>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                </td>
                <td className="p-4 text-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="p-4">
                  <div>
                    <p className="font-medium">Emily Chen</p>
                    <p className="text-sm text-gray-500">Front Desk</p>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                </td>
                <td className="p-4 text-center">
                  <AlertCircle className="w-5 h-5 text-gray-300 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="p-4">
                  <div>
                    <p className="font-medium">Michael Park</p>
                    <p className="text-sm text-gray-500">Aesthetician</p>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                </td>
                <td className="p-4 text-center">
                  <AlertCircle className="w-5 h-5 text-gray-300 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold mt-6">Permission Types</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">SMS Access</span>
              <p className="text-sm text-gray-600">Can view inbox and send individual messages to patients</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Marketing Permission</span>
              <p className="text-sm text-gray-600">Can create and send marketing campaigns (requires TCPA compliance)</p>
            </div>
          </li>
        </ul>

        <Callout type="tip">
          Limit marketing permissions to managers or owners who understand TCPA requirements.
          This reduces the risk of compliance violations.
        </Callout>
      </section>

      {/* Compliance Settings */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Compliance Settings</h2>

        <p className="text-gray-700">
          Ensure your SMS messaging complies with TCPA regulations and carrier requirements.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">10DLC Registration</h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                Registered
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Your brand and campaigns are registered with carriers. Messages will be delivered reliably.
            </p>
            <a href="#" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
              View in Twilio Portal →
            </a>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Consent Settings</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Consent collection enabled</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Marketing opt-in required</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Auto opt-out processing</span>
              </li>
            </ul>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6">10DLC Registration Status</h3>
        <p className="text-gray-700 mb-4">
          10DLC (10-Digit Long Code) registration is required for all business SMS. Status options:
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <span className="font-semibold text-green-900">Registered</span>
              <span className="text-sm text-green-700 ml-2">— Full messaging capabilities enabled</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <span className="font-semibold text-yellow-900">Pending</span>
              <span className="text-sm text-yellow-700 ml-2">— Registration submitted, awaiting approval (4-7 days)</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <span className="font-semibold text-red-900">Not Registered</span>
              <span className="text-sm text-red-700 ml-2">— Messages may be blocked by carriers</span>
            </div>
          </div>
        </div>

        <Callout type="warning" title="Registration Required">
          As of 2025, unregistered SMS traffic may be blocked by carriers. Complete your 10DLC
          registration through Twilio to ensure message delivery. See our
          <Link href="/integrations/twilio" className="text-blue-600 hover:underline ml-1">Twilio setup guide</Link>.
        </Callout>
      </section>

      {/* Notification Settings */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Notification Preferences</h2>

        <p className="text-gray-700">
          Configure how you're notified when new messages arrive.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Desktop Notifications</p>
              <p className="text-sm text-gray-500">Browser alerts for new messages</p>
            </div>
            <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">Email summary of unread messages</p>
            </div>
            <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Sound Alerts</p>
              <p className="text-sm text-gray-500">Audio notification for incoming messages</p>
            </div>
            <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Features */}
      <section className="space-y-4 pt-6 border-t mt-8">
        <h2 className="text-2xl font-semibold">Related Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/features/messaging/templates">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Message Templates</h3>
              <p className="text-sm text-gray-700">
                Create and manage reusable message templates
              </p>
            </div>
          </Link>

          <Link href="/features/messaging/campaigns">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">SMS Campaigns</h3>
              <p className="text-sm text-gray-700">
                Send marketing messages to patient groups
              </p>
            </div>
          </Link>

          <Link href="/integrations/twilio">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Twilio Integration</h3>
              <p className="text-sm text-gray-700">
                Configure your Twilio account and 10DLC registration
              </p>
            </div>
          </Link>

          <Link href="/features/messaging">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Messaging Overview</h3>
              <p className="text-sm text-gray-700">
                All messaging features at a glance
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
