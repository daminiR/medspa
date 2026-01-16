import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Zap, CheckCircle2, MessageSquare, Tag, Brain } from 'lucide-react'

export default function IntentDetectionPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Zap className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Intent Detection</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        AI reads between the lines. When a patient texts, the system instantly
        knows what they want and routes the message appropriately.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        &quot;hey&quot; could mean anything. &quot;hey is it ok to take advil before tomorrow&quot;
        is a pre-care question. Intent detection parses the message and tags it
        so your team can prioritize and respond faster.
      </p>

      <h2 id="intents">Detected Intents</h2>

      <div className="not-prose space-y-3 mb-6">
        <div className="p-3 bg-white border rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Confirmation</span>
          </div>
          <p className="text-sm text-gray-600">&quot;Yes see you tomorrow&quot; &quot;confirmed&quot; &quot;I&apos;ll be there&quot;</p>
        </div>
        <div className="p-3 bg-white border rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Reschedule</span>
          </div>
          <p className="text-sm text-gray-600">&quot;need to move my appt&quot; &quot;can we do friday instead&quot;</p>
        </div>
        <div className="p-3 bg-white border rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Cancellation</span>
          </div>
          <p className="text-sm text-gray-600">&quot;i need to cancel&quot; &quot;can&apos;t make it&quot;</p>
        </div>
        <div className="p-3 bg-white border rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Booking Request</span>
          </div>
          <p className="text-sm text-gray-600">&quot;want to schedule botox&quot; &quot;when can I come in&quot;</p>
        </div>
        <div className="p-3 bg-white border rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Question</span>
          </div>
          <p className="text-sm text-gray-600">&quot;how much is a facial&quot; &quot;what time do you close&quot;</p>
        </div>
        <div className="p-3 bg-white border rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">Concern</span>
          </div>
          <p className="text-sm text-gray-600">&quot;is this bruising normal&quot; &quot;I&apos;m a bit swollen&quot;</p>
        </div>
      </div>

      <h2 id="routing">Smart Routing</h2>
      <p>
        Messages go to the right place:
      </p>
      <ul>
        <li><strong>Confirmations</strong> &mdash; Auto-processed, appointment marked confirmed</li>
        <li><strong>Reschedules</strong> &mdash; Routed to scheduling queue</li>
        <li><strong>Cancellations</strong> &mdash; Flagged for follow-up offer</li>
        <li><strong>Booking requests</strong> &mdash; Priority queue for conversion</li>
        <li><strong>Medical concerns</strong> &mdash; Flagged for clinical review</li>
      </ul>

      <Callout type="tip" title="Priority Inbox">
        Filter your inbox by intent. See all reschedule requests together,
        handle all confirmations at once.
      </Callout>

      <h2 id="accuracy">High Accuracy</h2>
      <p>
        Trained on med spa conversations:
      </p>
      <ul>
        <li><strong>95%+ accuracy</strong> on common intents</li>
        <li><strong>Typo tolerant</strong> &mdash; Understands &quot;tmrw&quot;, &quot;appt&quot;, &quot;thx&quot;</li>
        <li><strong>Context aware</strong> &mdash; Uses conversation history</li>
        <li><strong>Uncertain? Flags it</strong> &mdash; Asks human to classify</li>
      </ul>

      <h2 id="actions">Automated Actions</h2>
      <p>
        Configure automatic responses:
      </p>
      <ul>
        <li><strong>Confirmations</strong> &mdash; Update appointment status automatically</li>
        <li><strong>Hours questions</strong> &mdash; Send hours automatically</li>
        <li><strong>Booking links</strong> &mdash; Send online booking when requested</li>
        <li><strong>Stop requests</strong> &mdash; Process opt-outs immediately (required)</li>
      </ul>

      <Callout type="warning" title="Medical Questions">
        Clinical concerns are never auto-responded. AI flags them for
        immediate provider review. &quot;Is this normal?&quot; always gets human attention.
      </Callout>

      <h2 id="sentiment">Sentiment Analysis</h2>
      <p>
        Beyond intent, AI detects tone:
      </p>
      <ul>
        <li><strong>Frustrated</strong> &mdash; Prioritize for quick resolution</li>
        <li><strong>Anxious</strong> &mdash; Requires reassurance</li>
        <li><strong>Happy</strong> &mdash; Potential review request</li>
        <li><strong>Neutral</strong> &mdash; Standard processing</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/messaging/ai-suggestions" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">AI Reply Suggestions</h3>
          <p className="text-sm text-gray-500">Smart response drafts</p>
        </Link>
        <Link href="/features/smart-sms" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Smart SMS Overview</h3>
          <p className="text-sm text-gray-500">AI-powered messaging</p>
        </Link>
      </div>
    </div>
  )
}
