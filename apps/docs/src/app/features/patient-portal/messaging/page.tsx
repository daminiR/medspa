import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { MessageSquare, CheckCircle2, Bell, Clock, Shield } from 'lucide-react'

export default function PortalMessagingPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <MessageSquare className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Portal Messaging</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Secure communication between patients and your practice. Answer questions,
        share pre-care instructions, and follow up after treatments - all in one place.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Patients have questions at 9pm when your phone lines are closed. Secure
        messaging lets them ask, and you can respond when convenient. Better
        communication = fewer missed calls, happier patients, smoother operations.
      </p>

      <h2 id="inbox">Patient Inbox</h2>
      <p>
        Patients see a simple inbox:
      </p>
      <ul>
        <li><strong>Conversation threads</strong> &mdash; Organized by topic</li>
        <li><strong>Unread indicators</strong> &mdash; Know what&apos;s new</li>
        <li><strong>Message history</strong> &mdash; Full conversation preserved</li>
        <li><strong>Timestamp</strong> &mdash; When each message was sent</li>
      </ul>

      <h2 id="compose">Sending Messages</h2>
      <p>
        Simple message composition:
      </p>
      <ul>
        <li><strong>Text messages</strong> &mdash; Type questions or updates</li>
        <li><strong>Photo attachments</strong> &mdash; Share concerns visually</li>
        <li><strong>Quick actions</strong> &mdash; Request appointment, ask about products</li>
      </ul>

      <Callout type="tip" title="Photo Questions">
        When patients can easily send photos of concerns (&quot;Is this swelling normal?&quot;),
        you can often reassure them without an office visit.
      </Callout>

      <h2 id="notifications">Notification Settings</h2>
      <p>
        Patients control how they&apos;re notified:
      </p>
      <ul>
        <li><strong>Push notifications</strong> &mdash; Instant alerts</li>
        <li><strong>Email digest</strong> &mdash; Summary of messages</li>
        <li><strong>SMS alert</strong> &mdash; Text when new message arrives</li>
        <li><strong>Quiet hours</strong> &mdash; No notifications during sleep</li>
      </ul>

      <h2 id="security">Secure & Compliant</h2>
      <p>
        Protected communication:
      </p>
      <ul>
        <li><strong>Encrypted</strong> &mdash; Messages encrypted in transit and at rest</li>
        <li><strong>Authenticated</strong> &mdash; Must be logged in to view</li>
        <li><strong>Audit trail</strong> &mdash; All messages logged</li>
        <li><strong>HIPAA compliant</strong> &mdash; Safe for PHI discussion</li>
      </ul>

      <Callout type="warning" title="For Non-Urgent Questions">
        Make clear that messaging is not for emergencies. Urgent concerns should
        call the office or 911. Most practices set response time expectations
        (e.g., &quot;within 1 business day&quot;).
      </Callout>

      <h2 id="staff-side">Staff Experience</h2>
      <p>
        On your side, messages appear in the admin inbox:
      </p>
      <ul>
        <li><strong>All conversations</strong> &mdash; From all patients</li>
        <li><strong>Assign to team</strong> &mdash; Route to right person</li>
        <li><strong>Templates</strong> &mdash; Quick replies for common questions</li>
        <li><strong>AI suggestions</strong> &mdash; Suggested responses</li>
      </ul>

      <h2 id="common-uses">Common Uses</h2>
      <ul>
        <li><strong>Pre-treatment questions</strong> &mdash; &quot;Can I take aspirin before?&quot;</li>
        <li><strong>Post-treatment concerns</strong> &mdash; &quot;Is this bruising normal?&quot;</li>
        <li><strong>Scheduling help</strong> &mdash; &quot;Need to reschedule&quot;</li>
        <li><strong>Product questions</strong> &mdash; &quot;Can I reorder my skincare?&quot;</li>
        <li><strong>Payment questions</strong> &mdash; &quot;What&apos;s my balance?&quot;</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/messaging/sms" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Two-Way SMS</h3>
          <p className="text-sm text-gray-500">Text-based communication</p>
        </Link>
        <Link href="/features/messaging/ai-suggestions" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">AI Reply Suggestions</h3>
          <p className="text-sm text-gray-500">Smart response drafts</p>
        </Link>
      </div>
    </div>
  )
}
