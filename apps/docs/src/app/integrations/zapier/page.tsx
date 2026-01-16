import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Zap, Clock, ArrowRight, ExternalLink } from 'lucide-react'

export default function ZapierIntegrationPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-orange-100">
          <Zap className="w-6 h-6 text-orange-600" />
        </div>
        <span className="status-badge coming-soon">
          <Clock className="w-3 h-3" /> Coming Soon
        </span>
      </div>
      <h1>Zapier Integration</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Connect Luxe MedSpa to 5000+ apps through Zapier. Automate workflows and eliminate manual tasks.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Zapier Automation Preview"
        duration="Coming Soon"
        description="Learn how to automate your MedSpa workflows with Zapier"
      />

      <Callout type="info">
        <strong>Status:</strong> Zapier integration is in development and will be available in Q3 2025.
        Join our waitlist to get early access when it launches.
      </Callout>

      <h2 id="overview">What is Zapier?</h2>
      <p>
        Zapier is a no-code automation platform that connects apps without requiring technical skills.
        With Luxe MedSpa + Zapier, you can automate repetitive tasks and create powerful workflows.
      </p>

      <p>
        <strong>Example:</strong> When a new appointment is booked, automatically create a task in Asana,
        send a Slack notification to your team, and add the patient to a Gmail contact list—all without
        writing any code.
      </p>

      <h2 id="use-cases">Popular Automation Ideas</h2>
      <p>
        Here are workflows you&apos;ll be able to create once the integration launches:
      </p>

      <div className="not-prose space-y-3 my-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            New Appointment Workflows
          </h4>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 pl-4">
            <li>• Send appointment confirmation to team Slack channel</li>
            <li>• Create Google Calendar event automatically</li>
            <li>• Add patient to CRM (Pipedrive, HubSpot, Salesforce)</li>
            <li>• Send welcome email with pre-service instructions</li>
            <li>• Create task in project management tool (Asana, Monday.com)</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            Payment Workflows
          </h4>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 pl-4">
            <li>• Send receipt via email or SMS</li>
            <li>• Log payment in spreadsheet (Google Sheets, Excel)</li>
            <li>• Create invoice in Xero or Wave</li>
            <li>• Record transaction in accounting software</li>
            <li>• Send thank you email with loyalty program info</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            Patient Communication Workflows
          </h4>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 pl-4">
            <li>• Send personalized SMS follow-ups after appointments</li>
            <li>• Create survey in Typeform or Google Forms automatically</li>
            <li>• Send promotional emails for new services</li>
            <li>• Request Google reviews from satisfied patients</li>
            <li>• Update patient info in email marketing tool (Mailchimp, ConvertKit)</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            Data Sync Workflows
          </h4>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 pl-4">
            <li>• Sync appointments to Google Calendar</li>
            <li>• Back up appointment data to Google Sheets</li>
            <li>• Copy invoices to Dropbox or Google Drive</li>
            <li>• Send daily/weekly reports to email</li>
            <li>• Keep team calendar in sync across platforms</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            Team Collaboration Workflows
          </h4>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 pl-4">
            <li>• Post booking alerts to Slack/Teams</li>
            <li>• Create meeting invites in Calendly</li>
            <li>• Assign tasks automatically based on appointment type</li>
            <li>• Send scheduling conflicts to team</li>
            <li>• Notify managers of payment issues or cancellations</li>
          </ul>
        </div>
      </div>

      <h2 id="supported-apps">What Apps Can You Connect?</h2>
      <p>
        Zapier supports thousands of apps. Here are some popular ones that work with MedSpa software:
      </p>

      <div className="not-prose grid gap-3 my-6 md:grid-cols-2">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">Communication</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Slack, Microsoft Teams, Discord</div>
            <div>Gmail, Outlook, SendGrid</div>
            <div>SMS (Twilio, Vonage)</div>
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">CRM & Marketing</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>HubSpot, Salesforce, Pipedrive</div>
            <div>Mailchimp, ActiveCampaign, Klaviyo</div>
            <div>Typeform, Survey123</div>
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">Productivity</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Asana, Monday.com, ClickUp</div>
            <div>Google Sheets, Excel, Airtable</div>
            <div>Notion, Trello, Jira</div>
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">Accounting & Finance</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>QuickBooks, Xero, Wave</div>
            <div>Stripe, PayPal, Square</div>
            <div>FreshBooks, Zoho Books</div>
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">Calendar & Scheduling</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Google Calendar, Outlook</div>
            <div>Calendly, When2Meet</div>
            <div>Zoom, Microsoft Teams</div>
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">Storage & Backup</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Google Drive, Dropbox, OneDrive</div>
            <div>AWS S3, Backblaze</div>
            <div>Box, iCloud</div>
          </div>
        </div>
      </div>

      <Callout type="tip">
        Don&apos;t see your favorite app? Zapier integrates with 5000+ apps. Check zapier.com to see
        if your tools are supported.
      </Callout>

      <h2 id="how-it-works">How Zapier Zaps Work</h2>
      <p>
        A &quot;Zap&quot; is an automated workflow with three parts:
      </p>

      <div className="not-prose space-y-4 my-6">
        <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-semibold text-sm">1</div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Trigger (When...)</h4>
            <p className="text-sm text-gray-600 mt-1">
              Something happens in Luxe MedSpa, like a new appointment booked or payment received.
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-600 text-white font-semibold text-sm">2</div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Filters & Conditions (If...)</h4>
            <p className="text-sm text-gray-600 mt-1">
              Optional: Only continue if certain conditions are met (e.g., appointment is for facial services).
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-600 text-white font-semibold text-sm">3</div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Action (Then...)</h4>
            <p className="text-sm text-gray-600 mt-1">
              Perform an action in another app, like sending an email, creating a task, or logging data.
            </p>
          </div>
        </div>
      </div>

      <h3>Example Zap</h3>
      <div className="not-prose bg-gray-50 border border-gray-200 rounded-lg p-6 my-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
            <div>
              <p className="font-semibold text-gray-900">Trigger</p>
              <p className="text-sm text-gray-600">New appointment created in Luxe MedSpa for service "Botox"</p>
            </div>
          </div>
          <div className="flex items-center justify-center text-gray-400">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
            <div>
              <p className="font-semibold text-gray-900">Filter</p>
              <p className="text-sm text-gray-600">Only if appointment date is more than 3 days away</p>
            </div>
          </div>
          <div className="flex items-center justify-center text-gray-400">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
            <div>
              <p className="font-semibold text-gray-900">Actions</p>
              <p className="text-sm text-gray-600">
                • Send Slack message: "New Botox appointment for [patient name] on [date]"<br/>
                • Add patient to HubSpot list "Pre-Botox Patients"<br/>
                • Create Google Sheets row with appointment details
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2 id="pricing">Zapier Pricing</h2>
      <p>
        The Luxe MedSpa integration will be free to use. Zapier itself has a free plan plus paid plans:
      </p>

      <div className="not-prose overflow-x-auto mb-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Plan</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Price</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Zaps</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Tasks/Month</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 bg-green-50">
              <td className="py-2 px-3 font-semibold">Free</td>
              <td className="py-2 px-3">$0</td>
              <td className="py-2 px-3">Up to 5</td>
              <td className="py-2 px-3">100</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3 font-semibold">Starter</td>
              <td className="py-2 px-3">$29/mo</td>
              <td className="py-2 px-3">Up to 20</td>
              <td className="py-2 px-3">750</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 px-3 font-semibold">Professional</td>
              <td className="py-2 px-3">$99/mo</td>
              <td className="py-2 px-3">Up to 50</td>
              <td className="py-2 px-3">5,000</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 px-3 font-semibold">Advanced</td>
              <td className="py-2 px-3">$299+/mo</td>
              <td className="py-2 px-3">Unlimited</td>
              <td className="py-2 px-3">Unlimited</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="info">
        Most small to medium medical spas start with the free Zapier plan and upgrade to Starter ($29/mo)
        once they have more than 5 automations running.
      </Callout>

      <h2 id="roadmap">Implementation Roadmap</h2>
      <p>
        Here&apos;s our plan for Zapier integration rollout:
      </p>

      <div className="not-prose space-y-3 my-6">
        <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded">
          <h4 className="font-semibold text-orange-900">Phase 1 (Q3 2025): Basic Triggers & Actions</h4>
          <p className="text-sm text-orange-700 mt-1">
            Support for appointment and payment triggers, basic data mapping, Slack/email actions
          </p>
        </div>
        <div className="p-4 border-l-4 border-amber-400 bg-amber-50 rounded">
          <h4 className="font-semibold text-amber-900">Phase 2 (Q4 2025): Advanced Features</h4>
          <p className="text-sm text-amber-700 mt-1">
            Custom filters, multiple actions per zap, Google Sheets/CRM support, advanced formatting
          </p>
        </div>
        <div className="p-4 border-l-4 border-gray-300 bg-gray-50 rounded">
          <h4 className="font-semibold text-gray-900">Phase 3 (2026): Pro Features</h4>
          <p className="text-sm text-gray-600 mt-1">
            Multi-step zaps, delay actions, conditional logic, lookups, and premium templates
          </p>
        </div>
      </div>

      <h2 id="get-started">Get Started When Available</h2>
      <p>
        Once the integration launches, setup will be simple:
      </p>

      <StepList steps={[
        {
          title: 'Create Zapier account',
          description: 'Sign up for free at zapier.com if you don\'t have an account'
        },
        {
          title: 'Find Luxe MedSpa app',
          description: 'Search for "Luxe MedSpa" in Zapier\'s app library'
        },
        {
          title: 'Connect your account',
          description: 'Authorize Zapier to connect to your Luxe MedSpa account'
        },
        {
          title: 'Create your first Zap',
          description: 'Start with a simple automation and build from there'
        },
        {
          title: 'Test the Zap',
          description: 'Run a test to make sure it works before turning it on'
        },
        {
          title: 'Activate',
          description: 'Turn on the Zap and watch the automation work!'
        }
      ]} />

      <h2 id="join-waitlist">Join the Waitlist</h2>
      <p>
        Want early access to Zapier automation? Be among the first to use it when it launches.
      </p>

      <div className="not-prose bg-orange-50 border border-orange-200 rounded-lg p-6 my-6">
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="your@businessemail.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label htmlFor="interest" className="block text-sm font-semibold text-gray-900 mb-1">
              What automation interests you most?
            </label>
            <select
              id="interest"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option>-- Select an option --</option>
              <option>Appointment notifications (Slack, Teams, etc)</option>
              <option>Payment/invoice workflows</option>
              <option>Customer data sync to CRM</option>
              <option>Email marketing automation</option>
              <option>Calendar synchronization</option>
              <option>Reporting and analytics</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Join the Waitlist
          </button>
        </form>
      </div>

      <h2 id="related">Related</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/integrations/stripe" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Stripe Payments</h3>
          <p className="text-sm text-gray-500">Accept credit card payments</p>
        </Link>
        <Link href="/integrations/twilio" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Twilio SMS</h3>
          <p className="text-sm text-gray-500">Send SMS messages and reminders</p>
        </Link>
        <Link href="/features/messaging" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Messaging Features</h3>
          <p className="text-sm text-gray-500">Built-in communication tools</p>
        </Link>
        <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all flex items-start gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-1">
              Zapier
              <ExternalLink className="w-3 h-3" />
            </h3>
            <p className="text-sm text-gray-500">Official Zapier website</p>
          </div>
        </a>
      </div>
    </div>
  )
}
