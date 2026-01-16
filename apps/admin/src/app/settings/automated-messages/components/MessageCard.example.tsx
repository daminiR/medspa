/**
 * MessageCard Component Usage Examples
 *
 * This file demonstrates various ways to use the MessageCard component
 * in the automated messages settings interface.
 */

'use client';

import React, { useState } from 'react';
import { MessageCard } from './MessageCard';

export function MessageCardExamples() {
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [bothChannelsEnabled, setBothChannelsEnabled] = useState(true);
  const [simpleCardEnabled, setSimpleCardEnabled] = useState(false);

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">MessageCard Component Examples</h1>

      {/* Example 1: SMS Only */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">1. SMS Only Message</h2>
        <MessageCard
          title="SMS Appointment Reminder"
          description="Send text reminder 24 hours before appointment"
          enabled={smsEnabled}
          onToggle={setSmsEnabled}
          channels={{ sms: true, email: false }}
          defaultExpanded={true}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMS Template
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                rows={3}
                defaultValue="Hi {{firstName}}! Reminder: Your appointment is tomorrow at {{time}}. Reply C to confirm or R to reschedule."
              />
              <p className="text-xs text-gray-500 mt-1">138 characters (1 SMS segment)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Timing
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>12 hours before</option>
                <option selected>24 hours before</option>
                <option>48 hours before</option>
              </select>
            </div>
          </div>
        </MessageCard>
      </div>

      {/* Example 2: Email Only */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Email Only Message</h2>
        <MessageCard
          title="Detailed Appointment Confirmation"
          description="Comprehensive email with appointment details and instructions"
          enabled={emailEnabled}
          onToggle={setEmailEnabled}
          channels={{ sms: false, email: true }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                defaultValue="Your Appointment is Confirmed - {{date}}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body Template
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                rows={8}
                defaultValue={`Dear {{firstName}},

Your appointment has been confirmed!

Date: {{date}}
Time: {{time}}
Service: {{service}}
Provider: {{provider}}

Please arrive 10 minutes early to complete check-in.

Best regards,
The Team`}
              />
            </div>
          </div>
        </MessageCard>
      </div>

      {/* Example 3: Both Channels */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Multi-Channel Message (SMS + Email)</h2>
        <MessageCard
          title="Birthday Greeting"
          description="Send birthday wishes via SMS and email with special offer"
          enabled={bothChannelsEnabled}
          onToggle={setBothChannelsEnabled}
          channels={{ sms: true, email: true }}
        >
          <div className="space-y-6">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                This message will be sent through both SMS and Email channels.
                Configure separate templates for each channel below.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">SMS Version</h3>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                rows={2}
                defaultValue="Happy Birthday {{firstName}}! 🎉 Enjoy 20% off your next visit with code BDAY20. Valid for 30 days!"
              />
              <p className="text-xs text-gray-500 mt-1">98 characters (1 SMS segment)</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Email Version</h3>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                defaultValue="Happy Birthday {{firstName}}! 🎂"
                placeholder="Email subject"
              />
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                rows={6}
                defaultValue={`Happy Birthday {{firstName}}!

We hope you have a wonderful day! As a special birthday gift, we'd like to offer you 20% off your next visit.

Use code: BDAY20
Valid for: 30 days

Treat yourself to something special!

With warm wishes,
The Team`}
              />
            </div>
          </div>
        </MessageCard>
      </div>

      {/* Example 4: Simple Card (No Expanded Content) */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Simple Card (No Children)</h2>
        <MessageCard
          title="No-Show Fee Notice"
          description="Automatic notice when no-show fee is charged"
          enabled={simpleCardEnabled}
          onToggle={setSimpleCardEnabled}
          channels={{ sms: true, email: false }}
        >
          {/* No children - card can still be expanded but shows nothing */}
        </MessageCard>
      </div>

      {/* Example 5: Collapsed by Default */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Collapsed by Default</h2>
        <MessageCard
          title="Post-Treatment Follow-Up"
          description="Check in with patient 3 days after treatment"
          enabled={true}
          onToggle={() => {}}
          channels={{ sms: true, email: true }}
          defaultExpanded={false}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Configure follow-up message timing and content here...
            </p>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">Include satisfaction survey</span>
              </label>
            </div>
          </div>
        </MessageCard>
      </div>

      {/* State Display */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Current State:</h3>
        <pre className="text-xs text-gray-600">
          {JSON.stringify(
            {
              smsEnabled,
              emailEnabled,
              bothChannelsEnabled,
              simpleCardEnabled,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}

export default MessageCardExamples;
