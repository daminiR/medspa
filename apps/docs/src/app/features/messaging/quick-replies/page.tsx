'use client';

import { MessageSquare, Copy, Zap, Settings } from 'lucide-react';
import Link from 'next/link';
import { Callout } from '@/components/docs/Callout';
import { StepList } from '@/components/docs/StepList';
import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder';

export default function QuickRepliesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-green-600" />
        <h1 className="text-4xl font-bold">Quick Reply Templates</h1>
      </div>

      <p className="text-lg text-gray-700 mb-6">
        Create and manage message templates for quick responses to common client inquiries. Save time while
        maintaining consistent, professional communication.
      </p>

      {/* Video Tutorial */}
      <VideoPlaceholder
        title="Creating and Using Quick Reply Templates"
        duration="5:20"
      />

      {/* Overview Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-gray-700">
          Quick reply templates are pre-written message snippets that can be instantly inserted into messages
          with a single click. They help you respond faster to client inquiries while maintaining a consistent
          tone and information across your practice.
        </p>
        <p className="text-gray-700">
          Whether it's confirming attendance, providing directions, answering common questions, or handling
          rescheduling requests, quick replies ensure every client receives professional, accurate information.
        </p>
      </section>

      {/* Key Benefits */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Key Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Save Time</h3>
            </div>
            <p className="text-sm text-gray-700">
              Respond to common inquiries instantly without typing the same messages repeatedly.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Consistency</h3>
            </div>
            <p className="text-sm text-gray-700">
              Ensure all clients receive the same accurate information and professional messaging.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Customizable</h3>
            </div>
            <p className="text-sm text-gray-700">
              Create categories and organize templates for different types of responses.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Professional</h3>
            </div>
            <p className="text-sm text-gray-700">
              Maintain brand voice and professionalism in all client communications.
            </p>
          </div>
        </div>
      </section>

      {/* Creating Quick Replies */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Creating Quick Reply Templates</h2>

        <Callout type="info">
          You can create unlimited quick reply templates. Organize them by category to make them easier to find
          when responding to clients.
        </Callout>

        <StepList
          steps={[
            {
              title: 'Open Messages Page',
              description: 'Navigate to the Messages section in the main navigation.',
            },
            {
              title: 'Access Templates',
              description:
                'Click on "Quick Replies" or "Templates" button in the Messages interface to open the template manager.',
            },
            {
              title: 'Create New Template',
              description: 'Click the "New Template" or "Create" button to start a new quick reply.',
            },
            {
              title: 'Name Your Template',
              description:
                'Give your template a clear, descriptive name (e.g., "Confirm Attendance", "Parking Info", "Reschedule Request").',
            },
            {
              title: 'Write Message Content',
              description:
                'Type your message content. You can include placeholders like [Name] or [Time] for dynamic content.',
            },
            {
              title: 'Assign Category',
              description:
                'Select or create a category to organize your template (e.g., "Confirmations", "General Info", "Scheduling").',
            },
            {
              title: 'Save Template',
              description: 'Click Save to store your template for future use.',
            },
          ]}
        />
      </section>

      {/* Template Categories */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Template Categories</h2>

        <p className="text-gray-700 mb-4">
          Organize your quick replies into logical categories for easy access. Here are suggested categories
          and example templates for each:
        </p>

        <div className="space-y-6">
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-900 mb-3">Confirmations & Attendance</h3>
            <div className="space-y-2 bg-white p-3 rounded border border-blue-200">
              <p className="text-sm font-mono text-blue-800">
                "Hi [Name]! Thank you for confirming your appointment on [Date] at [Time]. We look forward to seeing you!"
              </p>
              <p className="text-sm font-mono text-blue-800">
                "Got it! We've confirmed your attendance for [Service] with [Provider] tomorrow at [Time]. See you then!"
              </p>
              <p className="text-sm font-mono text-blue-800">
                "Thanks for letting us know. Your appointment is all set for [Date]. Please arrive 5 minutes early."
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-purple-50">
            <h3 className="font-semibold text-purple-900 mb-3">Rescheduling & Cancellations</h3>
            <div className="space-y-2 bg-white p-3 rounded border border-purple-200">
              <p className="text-sm font-mono text-purple-800">
                "I understand. To reschedule, please let me know your preferred date and time, and I'll find the best option for you."
              </p>
              <p className="text-sm font-mono text-purple-800">
                "Your appointment has been canceled. To reschedule, reply with available dates or call us at [Phone]."
              </p>
              <p className="text-sm font-mono text-purple-800">
                "We're sorry you need to cancel. Our cancellation policy is [Policy Details]. Reply to discuss alternatives."
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-amber-50">
            <h3 className="font-semibold text-amber-900 mb-3">Facility Information</h3>
            <div className="space-y-2 bg-white p-3 rounded border border-amber-200">
              <p className="text-sm font-mono text-amber-800">
                "Our address is [Address]. Parking is available [Parking Info]. Look for [Building Name]."
              </p>
              <p className="text-sm font-mono text-amber-800">
                "You can reach us at [Phone]. Our hours are [Hours]. What else can I help you with?"
              </p>
              <p className="text-sm font-mono text-amber-800">
                "Please allow [Time] for your appointment. We're located on the [Floor] floor. See you soon!"
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-green-900 mb-3">Preparation Instructions</h3>
            <div className="space-y-2 bg-white p-3 rounded border border-green-200">
              <p className="text-sm font-mono text-green-800">
                "Before your appointment: [Instructions]. Please arrive hydrated and avoid [Activity] for 24 hours."
              </p>
              <p className="text-sm font-mono text-green-800">
                "Preparation checklist: 1) Avoid sun exposure 2) Hydrate well 3) Wear loose clothing. Any questions?"
              </p>
              <p className="text-sm font-mono text-green-800">
                "Please avoid [Activity] for [Time Period] before your [Service]. Wear comfortable clothing."
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-red-50">
            <h3 className="font-semibold text-red-900 mb-3">Post-Appointment Care</h3>
            <div className="space-y-2 bg-white p-3 rounded border border-red-200">
              <p className="text-sm font-mono text-red-800">
                "Thank you for your appointment! Post-care instructions: [Instructions]. Contact us if you have questions."
              </p>
              <p className="text-sm font-mono text-red-800">
                "Avoid [Activity] for [Time]. Results typically appear in [Timeline]. Call us if you experience [Concerns]."
              </p>
              <p className="text-sm font-mono text-red-800">
                "How was your experience? We'd love your feedback! Please reply or leave a review on Google."
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-indigo-50">
            <h3 className="font-semibold text-indigo-900 mb-3">General Questions</h3>
            <div className="space-y-2 bg-white p-3 rounded border border-indigo-200">
              <p className="text-sm font-mono text-indigo-800">
                "Great question! [Answer]. Feel free to reach out if you need more information."
              </p>
              <p className="text-sm font-mono text-indigo-800">
                "For detailed information about [Service], please visit [Website] or call [Phone]."
              </p>
              <p className="text-sm font-mono text-indigo-800">
                "I'd be happy to help! Please reply with more details and I'll get you the information you need."
              </p>
            </div>
          </div>
        </div>

        <Callout type="tip">
          Use placeholders like [Name], [Date], [Time], [Service], [Provider], [Address], [Phone], and [Hours].
          Some will auto-fill based on context; others you can customize when using the template.
        </Callout>
      </section>

      {/* Using Quick Replies */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Using Quick Reply Templates</h2>

        <h3 className="text-lg font-semibold mt-4">Quick Reply Methods</h3>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Method 1: From Message Compose</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Click in the message compose field</li>
              <li>Type "/" or click the template icon to open the quick reply menu</li>
              <li>Search or scroll through available templates by category</li>
              <li>Click a template to insert it into your message</li>
              <li>Edit any placeholders as needed (e.g., [Name] → "Sarah")</li>
              <li>Send the message</li>
            </ol>
          </div>

          <hr className="my-4" />

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Method 2: Quick Reply Keyboard Shortcut</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>While composing, press Ctrl+/ (or Cmd+/ on Mac)</li>
              <li>Start typing the template name to search</li>
              <li>Press Enter to insert the matching template</li>
              <li>Fill in any required information and send</li>
            </ol>
          </div>

          <hr className="my-4" />

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Method 3: Template Menu Button</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Look for the template/grid icon in the message compose area</li>
              <li>Click it to open the template panel</li>
              <li>Browse by category or search for specific templates</li>
              <li>Click any template to insert it</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Managing Templates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Managing Your Templates</h2>

        <h3 className="text-lg font-semibold mt-4">Editing Templates</h3>
        <StepList
          steps={[
            {
              title: 'Open Template Manager',
              description: 'Go to Messages > Quick Replies to access your template library.',
            },
            {
              title: 'Find Your Template',
              description: 'Search for or navigate to the template you want to edit.',
            },
            {
              title: 'Click Edit',
              description: 'Click the edit button (pencil icon) next to the template.',
            },
            {
              title: 'Make Changes',
              description: 'Update the name, message content, or category as needed.',
            },
            {
              title: 'Save Changes',
              description: 'Click Save to apply your changes. The template updates immediately.',
            },
          ]}
        />

        <h3 className="text-lg font-semibold mt-6">Organizing Templates</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-semibold">•</span>
            <span>
              <strong>Star Favorites:</strong> Mark frequently-used templates as favorites for quick access
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-semibold">•</span>
            <span>
              <strong>Create Categories:</strong> Group templates by type (Confirmations, Instructions, etc.)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-semibold">•</span>
            <span>
              <strong>Search Function:</strong> Use the search bar to quickly find templates by name or content
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-semibold">•</span>
            <span>
              <strong>Delete Unused:</strong> Remove outdated or rarely-used templates to keep your library clean
            </span>
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6">Sharing Templates</h3>
        <p className="text-gray-700 mb-2">
          If you have team members, you can make templates available to the entire team:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-semibold">•</span>
            <span>
              <strong>Team Templates:</strong> Create templates that all staff members can use
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-semibold">•</span>
            <span>
              <strong>Personal Templates:</strong> Keep private templates that only you can access
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-semibold">•</span>
            <span>
              <strong>Role-Based Access:</strong> Set templates visible only to specific roles (Admins, Schedulers, etc.)
            </span>
          </li>
        </ul>

        <Callout type="info">
          Team templates are great for maintaining consistency across your entire practice, while personal templates
          allow individual team members to customize their communication style.
        </Callout>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Best Practices</h2>

        <div className="space-y-3">
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Keep Templates Concise</h4>
            <p className="text-sm text-blue-800">
              SMS messages should be brief and focused. Aim for templates under 160 characters to fit in a single message.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Use Clear Naming</h4>
            <p className="text-sm text-blue-800">
              Name templates based on their purpose (e.g., "Confirm Attendance" vs. "Message1"). This makes them easier to find.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Maintain Tone & Voice</h4>
            <p className="text-sm text-blue-800">
              Ensure all templates reflect your practice's communication style and brand voice for consistency.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Regular Reviews</h4>
            <p className="text-sm text-blue-800">
              Periodically review and update templates based on client feedback and evolving business needs.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Test Before Using</h4>
            <p className="text-sm text-blue-800">
              Test new templates with a colleague before adding them to your library to ensure clarity and professionalism.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">Personalize When Sending</h4>
            <p className="text-sm text-blue-800">
              Even with quick replies, take a moment to add personal touches and edit placeholders to make messages feel authentic.
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

          <Link href="/features/messaging/reminders">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition">
              <h3 className="font-semibold text-blue-600 mb-1">Appointment Reminders</h3>
              <p className="text-sm text-gray-700">
                Configure automated reminders for upcoming appointments
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
