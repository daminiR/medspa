'use client';

import { FileText, Plus, Copy, Pencil, Trash2, CheckCircle2, Calendar, Heart, Megaphone, Tag } from 'lucide-react';
import Link from 'next/link';
import { Callout } from '@/components/docs/Callout';
import { StepList } from '@/components/docs/StepList';
import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder';

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-8 h-8 text-gray-600" />
        <h1 className="text-4xl font-bold">Message Templates</h1>
      </div>

      <p className="text-lg text-gray-700 mb-6">
        Create and manage reusable message templates with dynamic variables. Templates save time
        and ensure consistent, professional communication across your team.
      </p>

      {/* Video Tutorial */}
      <VideoPlaceholder
        title="Creating and Managing Templates"
        duration="4:15"
      />

      {/* Template Categories */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Template Categories</h2>

        <p className="text-gray-700">
          Templates are organized into categories for easy management. Each category serves
          a different communication purpose.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 text-center hover:bg-blue-50 cursor-pointer transition">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Appointment</h3>
            <p className="text-sm text-gray-500">5 templates</p>
          </div>
          <div className="border rounded-lg p-4 text-center hover:bg-green-50 cursor-pointer transition">
            <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Post-Care</h3>
            <p className="text-sm text-gray-500">3 templates</p>
          </div>
          <div className="border rounded-lg p-4 text-center hover:bg-purple-50 cursor-pointer transition">
            <Megaphone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Marketing</h3>
            <p className="text-sm text-gray-500">4 templates</p>
          </div>
          <div className="border rounded-lg p-4 text-center hover:bg-gray-100 cursor-pointer transition">
            <Tag className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Custom</h3>
            <p className="text-sm text-gray-500">2 templates</p>
          </div>
        </div>
      </section>

      {/* Creating Templates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Creating a Template</h2>

        <StepList
          steps={[
            {
              title: 'Go to Template Management',
              description: 'Navigate to Settings → SMS → Templates, or click "Manage Templates" from the SMS Settings page.',
            },
            {
              title: 'Click "New Template"',
              description: 'Opens the template creation form where you can define your new template.',
            },
            {
              title: 'Enter Template Details',
              description: 'Provide a name, select a category, and write your message content.',
            },
            {
              title: 'Add Variables',
              description: 'Click variable chips to insert placeholders like {patient_name} at your cursor position.',
            },
            {
              title: 'Preview & Save',
              description: 'Review how your message looks with sample data, then click Save.',
            },
          ]}
        />
      </section>

      {/* Variables */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Template Variables</h2>

        <p className="text-gray-700">
          Variables are placeholders that automatically fill in with real patient and appointment
          data when you use the template. Click any variable chip to insert it at your cursor position.
        </p>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Available Variables</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200">
              {'{patient_name}'}
            </span>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200">
              {'{appointment_date}'}
            </span>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200">
              {'{appointment_time}'}
            </span>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200">
              {'{service_name}'}
            </span>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200">
              {'{clinic_name}'}
            </span>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200">
              {'{clinic_phone}'}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="font-semibold">Variable Descriptions</h3>
          <div className="border rounded-lg divide-y">
            <div className="p-4 flex items-start gap-4">
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">{'{patient_name}'}</code>
              <div>
                <p className="font-medium">Patient's full name</p>
                <p className="text-sm text-gray-500">Example: "Sarah Johnson"</p>
              </div>
            </div>
            <div className="p-4 flex items-start gap-4">
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">{'{appointment_date}'}</code>
              <div>
                <p className="font-medium">Appointment date</p>
                <p className="text-sm text-gray-500">Example: "Monday, December 15th"</p>
              </div>
            </div>
            <div className="p-4 flex items-start gap-4">
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">{'{appointment_time}'}</code>
              <div>
                <p className="font-medium">Appointment time</p>
                <p className="text-sm text-gray-500">Example: "2:00 PM"</p>
              </div>
            </div>
            <div className="p-4 flex items-start gap-4">
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">{'{service_name}'}</code>
              <div>
                <p className="font-medium">Service being performed</p>
                <p className="text-sm text-gray-500">Example: "Botox Treatment"</p>
              </div>
            </div>
            <div className="p-4 flex items-start gap-4">
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">{'{clinic_name}'}</code>
              <div>
                <p className="font-medium">Your business name</p>
                <p className="text-sm text-gray-500">Example: "Luxe Medical Spa"</p>
              </div>
            </div>
            <div className="p-4 flex items-start gap-4">
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">{'{clinic_phone}'}</code>
              <div>
                <p className="font-medium">Your business phone</p>
                <p className="text-sm text-gray-500">Example: "(555) 123-4567"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Default Templates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Default Templates</h2>

        <p className="text-gray-700">
          The system comes with pre-built templates you can use immediately or customize to match your voice.
        </p>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Appointment Confirmation</h4>
              </div>
              <span className="text-sm text-gray-500">Used 234 times</span>
            </div>
            <div className="bg-gray-50 p-3 rounded text-sm font-mono">
              Hi {'{patient_name}'}! Your {'{service_name}'} appointment is confirmed for {'{appointment_date}'} at {'{appointment_time}'}. Reply C to confirm or call {'{clinic_phone}'} to reschedule.
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">24-Hour Reminder</h4>
              </div>
              <span className="text-sm text-gray-500">Used 189 times</span>
            </div>
            <div className="bg-gray-50 p-3 rounded text-sm font-mono">
              Reminder: Your appointment at {'{clinic_name}'} is tomorrow at {'{appointment_time}'}. Please arrive 5-10 minutes early. See you soon!
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">2-Hour Reminder</h4>
              </div>
              <span className="text-sm text-gray-500">Used 156 times</span>
            </div>
            <div className="bg-gray-50 p-3 rounded text-sm font-mono">
              Hi {'{patient_name}'}! Just a quick reminder - your appointment is in 2 hours at {'{appointment_time}'}. We're located at 123 Main St. See you soon!
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Post-Care Follow-Up</h4>
              </div>
              <span className="text-sm text-gray-500">Used 78 times</span>
            </div>
            <div className="bg-gray-50 p-3 rounded text-sm font-mono">
              Hi {'{patient_name}'}! How are you feeling after your {'{service_name}'}? If you have any questions or concerns, reply to this message or call us at {'{clinic_phone}'}.
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Review Request</h4>
              </div>
              <span className="text-sm text-gray-500">Used 112 times</span>
            </div>
            <div className="bg-gray-50 p-3 rounded text-sm font-mono">
              Thank you for visiting {'{clinic_name}'}! We'd love to hear about your experience. Leave us a review: [link]. It means the world to us!
            </div>
          </div>
        </div>

        <Callout type="tip">
          <strong>Reset to Defaults:</strong> If you've modified templates and want to start fresh,
          click "Reset to Defaults" at the bottom of the Templates page. This will restore all
          original system templates.
        </Callout>
      </section>

      {/* Character Count */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Character Count & SMS Segments</h2>

        <p className="text-gray-700">
          SMS messages are limited by character count. The template editor shows real-time
          character counting to help you keep messages concise.
        </p>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">SMS Segment Limits</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <span>Standard text (no emoji)</span>
              <span className="font-mono font-medium">160 characters/segment</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <span>With emoji or special characters</span>
              <span className="font-mono font-medium">70 characters/segment</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Character Counter Colors:</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-sm">1 segment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-sm">2 segments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span className="text-sm">3 segments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-sm">4+ segments</span>
            </div>
          </div>
        </div>

        <Callout type="warning">
          Messages that span multiple segments cost more to send. Keep templates under 160
          characters when possible, and avoid emoji in business communications.
        </Callout>
      </section>

      {/* Managing Templates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Managing Templates</h2>

        <p className="text-gray-700">
          Each template has action buttons for common operations:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Pencil className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Edit</h3>
            </div>
            <p className="text-sm text-gray-700">
              Modify the template name, category, or message content.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold">Duplicate</h3>
            </div>
            <p className="text-sm text-gray-700">
              Create a copy of the template to customize for a new purpose.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold">Delete</h3>
            </div>
            <p className="text-sm text-gray-700">
              Remove a template permanently. This cannot be undone.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Preview</h3>
            </div>
            <p className="text-sm text-gray-700">
              See how the template looks with sample patient data filled in.
            </p>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Best Practices</h2>

        <div className="space-y-3">
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Keep Messages Short</h4>
            <p className="text-sm text-blue-800">
              Aim for under 160 characters. Short messages have higher read rates and cost less.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Always Include Business Name</h4>
            <p className="text-sm text-blue-800">
              TCPA requires your business name in every message. Use {'{clinic_name}'} variable.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Provide a Call to Action</h4>
            <p className="text-sm text-blue-800">
              Tell patients what to do next: "Reply C to confirm" or "Call us at..."
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Test Before Using</h4>
            <p className="text-sm text-blue-800">
              Always preview templates with sample data before sending to real patients.
            </p>
          </div>
        </div>
      </section>

      {/* Related Features */}
      <section className="space-y-4 pt-6 border-t mt-8">
        <h2 className="text-2xl font-semibold">Related Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/features/messaging/quick-replies">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Quick Replies</h3>
              <p className="text-sm text-gray-700">
                One-click response templates in the inbox
              </p>
            </div>
          </Link>

          <Link href="/features/messaging/campaigns">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">SMS Campaigns</h3>
              <p className="text-sm text-gray-700">
                Use templates in marketing campaigns
              </p>
            </div>
          </Link>

          <Link href="/features/messaging/settings">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">SMS Settings</h3>
              <p className="text-sm text-gray-700">
                Configure messaging preferences
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
