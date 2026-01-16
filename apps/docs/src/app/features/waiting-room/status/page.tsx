import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Bell, CheckCircle2, MessageSquare, Clock, Smartphone } from 'lucide-react'

export default function StatusUpdatesPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Bell className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Status Updates</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Keep patients informed while they wait. Automatic and manual updates reduce
        anxiety and improve the waiting experience.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        The worst part of waiting isn&apos;t the time - it&apos;s not knowing how long it will be.
        Status updates give patients visibility and control, reducing complaints about
        wait times even when the wait is the same.
      </p>

      <h2 id="automatic">Automatic Updates</h2>
      <p>
        The system sends automatic notifications:
      </p>
      <ul>
        <li><strong>Check-in confirmed</strong> &mdash; When they text &quot;HERE&quot;</li>
        <li><strong>Position update</strong> &mdash; &quot;You&apos;re next!&quot; when they move to #1</li>
        <li><strong>Ready notification</strong> &mdash; When provider is ready for them</li>
        <li><strong>Room assignment</strong> &mdash; Which room to go to</li>
      </ul>

      <h2 id="manual">Manual Updates</h2>
      <p>
        Staff can send updates from the queue dashboard:
      </p>

      <h3>Running Late</h3>
      <p>
        If you&apos;re behind schedule:
      </p>
      <div className="not-prose bg-gray-100 rounded-lg p-4 mb-6">
        <div className="bg-white rounded-lg p-3 max-w-xs">
          <p className="text-sm">Hi Sarah, we&apos;re running about 10 minutes behind. We&apos;ll text you as soon as we&apos;re ready. Thank you for your patience!</p>
        </div>
      </div>

      <h3>Ready to Come In</h3>
      <div className="not-prose bg-gray-100 rounded-lg p-4 mb-6">
        <div className="bg-white rounded-lg p-3 max-w-xs">
          <p className="text-sm">We&apos;re ready for you! Please come to the front desk.</p>
        </div>
      </div>

      <h3>Room Assignment</h3>
      <div className="not-prose bg-gray-100 rounded-lg p-4 mb-6">
        <div className="bg-white rounded-lg p-3 max-w-xs">
          <p className="text-sm">Please proceed directly to Treatment Room 3. Your provider will be right with you.</p>
        </div>
      </div>

      <Callout type="tip" title="Set Expectations Early">
        If you know you&apos;re running late, send the update before the patient&apos;s
        scheduled time. Proactive communication prevents frustration.
      </Callout>

      <h2 id="templates">Message Templates</h2>
      <p>
        Pre-written templates for common situations:
      </p>
      <ul>
        <li>Running 5/10/15/20 minutes late</li>
        <li>Provider needed for emergency</li>
        <li>Please complete paperwork while waiting</li>
        <li>Room is ready</li>
        <li>Please see front desk</li>
      </ul>
      <p>
        One click sends the message - no typing needed.
      </p>

      <h2 id="customization">Custom Messages</h2>
      <p>
        For situations not covered by templates, type a custom message:
      </p>
      <ol>
        <li>Click the patient&apos;s name in the queue</li>
        <li>Click &quot;Send Message&quot;</li>
        <li>Type your message</li>
        <li>Click Send</li>
      </ol>

      <h2 id="history">Message History</h2>
      <p>
        View all status updates sent to a patient:
      </p>
      <ul>
        <li>What was sent and when</li>
        <li>Who sent it (for manual messages)</li>
        <li>Delivery confirmation</li>
      </ul>

      <Callout type="info" title="Conversation View">
        Status updates appear in the patient&apos;s message thread, so you can see the
        full conversation history in one place.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/waiting-room/queue" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Queue Management</h3>
          <p className="text-sm text-gray-500">Manage the waiting list</p>
        </Link>
        <Link href="/features/messaging/templates" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Message Templates</h3>
          <p className="text-sm text-gray-500">Create custom templates</p>
        </Link>
      </div>
    </div>
  )
}
