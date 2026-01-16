import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Sparkles, CheckCircle2, MessageSquare, Brain, Zap } from 'lucide-react'

export default function SmartSMSPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Sparkles className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Smart SMS</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        AI makes your messaging smarter. Auto-detect what patients want, suggest
        perfect replies, and handle routine conversations automatically.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Your front desk gets hundreds of texts. Many are simple: &quot;What time is
        my appointment?&quot; or &quot;Can I reschedule to Friday?&quot; Smart SMS handles the
        routine so your team focuses on what matters.
      </p>

      <h2 id="capabilities">AI Capabilities</h2>

      <h3>Intent Detection</h3>
      <p>
        AI understands what patients want:
      </p>
      <ul>
        <li><strong>Booking requests</strong> &mdash; &quot;I need an appointment&quot;</li>
        <li><strong>Reschedule</strong> &mdash; &quot;Can we move to next week?&quot;</li>
        <li><strong>Confirmation</strong> &mdash; &quot;Yes I&apos;ll be there&quot;</li>
        <li><strong>Questions</strong> &mdash; &quot;How much is Botox?&quot;</li>
        <li><strong>Concerns</strong> &mdash; &quot;Is this swelling normal?&quot;</li>
      </ul>

      <h3>Reply Suggestions</h3>
      <p>
        One-click responses:
      </p>
      <ul>
        <li><strong>Context-aware</strong> &mdash; Based on patient history</li>
        <li><strong>Personalized</strong> &mdash; Uses their name, appointment details</li>
        <li><strong>Multiple options</strong> &mdash; Choose the tone you prefer</li>
        <li><strong>Editable</strong> &mdash; Modify before sending</li>
      </ul>

      <div className="not-prose p-4 bg-gray-50 rounded-lg mb-6">
        <p className="text-sm font-medium mb-2">Patient message:</p>
        <p className="text-sm text-gray-600 mb-3">&quot;hey can i reschedule my appt thursday?&quot;</p>
        <p className="text-sm font-medium mb-2">AI suggestions:</p>
        <div className="space-y-2">
          <div className="p-2 bg-white rounded border text-sm">
            &quot;Hi Sarah! I&apos;d be happy to help reschedule your Thursday Botox appointment. We have Friday 2pm or Monday 10am available. Which works better?&quot;
          </div>
          <div className="p-2 bg-white rounded border text-sm">
            &quot;Of course! Your Thursday appointment can be moved. When works for you?&quot;
          </div>
        </div>
      </div>

      <h2 id="automation">Smart Automation</h2>
      <p>
        Some messages can be handled automatically:
      </p>
      <ul>
        <li><strong>Appointment confirmations</strong> &mdash; Auto-confirm when patient says yes</li>
        <li><strong>Hours/location</strong> &mdash; Answer automatically (configurable)</li>
        <li><strong>Booking links</strong> &mdash; Send online booking when requested</li>
        <li><strong>Prep instructions</strong> &mdash; Send when patient asks</li>
      </ul>

      <Callout type="tip" title="Human Review">
        AI never sends messages without your approval (unless you enable
        auto-responses for specific scenarios). You stay in control.
      </Callout>

      <h2 id="learning">Continuous Learning</h2>
      <p>
        AI gets smarter over time:
      </p>
      <ul>
        <li><strong>Learns your style</strong> &mdash; Matches your practice&apos;s tone</li>
        <li><strong>Common questions</strong> &mdash; Better answers to frequent asks</li>
        <li><strong>Feedback loop</strong> &mdash; Improves from your edits</li>
      </ul>

      <h2 id="features">Smart SMS Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/messaging/ai-suggestions" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <Brain className="w-5 h-5 text-primary-600 mb-2" />
          <h3 className="font-semibold text-gray-900">AI Reply Suggestions</h3>
          <p className="text-sm text-gray-500">One-click smart responses</p>
        </Link>
        <Link href="/features/smart-sms/intent" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <Zap className="w-5 h-5 text-primary-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Intent Detection</h3>
          <p className="text-sm text-gray-500">Understand what patients want</p>
        </Link>
      </div>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2 mt-4">
        <Link href="/features/messaging/sms" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Two-Way SMS</h3>
          <p className="text-sm text-gray-500">Text communication platform</p>
        </Link>
        <Link href="/features/voice-ai" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Voice AI</h3>
          <p className="text-sm text-gray-500">AI phone assistant</p>
        </Link>
      </div>
    </div>
  )
}
