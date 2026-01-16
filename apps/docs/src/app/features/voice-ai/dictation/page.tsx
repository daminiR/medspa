import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Mic, Clock, FileText, Sparkles, Check } from 'lucide-react'

export default function ChartingDictationPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Mic className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge planned">
          <Clock className="w-3 h-3" /> Planned
        </span>
      </div>
      <h1>Charting Dictation</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Speak your notes, see them charted. Voice-to-text AI transcribes and
        formats your SOAP notes in seconds - no typing required.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Providers spend 2+ hours daily on documentation. Voice dictation cuts
        that in half while producing better notes. Speak naturally while the
        patient is fresh in your mind.
      </p>

      <h2 id="how">How It Works</h2>
      <ol>
        <li><strong>Tap the mic</strong> &mdash; Start recording</li>
        <li><strong>Speak naturally</strong> &mdash; Describe the visit</li>
        <li><strong>AI transcribes</strong> &mdash; Real-time text appears</li>
        <li><strong>Auto-formats</strong> &mdash; Organized into SOAP sections</li>
        <li><strong>Review & save</strong> &mdash; Make quick edits if needed</li>
      </ol>

      <h2 id="example">Example Dictation</h2>

      <div className="not-prose p-4 bg-gray-50 rounded-lg mb-6">
        <p className="text-sm font-medium mb-2">You say:</p>
        <p className="text-sm text-gray-600 italic mb-4">
          &quot;Patient is a 45-year-old female returning for routine Botox. She&apos;s happy
          with last results, lasted about 3.5 months. Today treating glabella 20 units,
          forehead 10 units, crow&apos;s feet 10 units each side. Using Botox lot number
          B1234, expiring February 2025. No adverse reactions. Discussed adding lip
          flip next time. Return 3-4 months.&quot;
        </p>
        <p className="text-sm font-medium mb-2">AI generates:</p>
        <div className="bg-white p-3 rounded border text-sm">
          <p className="font-medium">SUBJECTIVE</p>
          <p className="text-gray-600 mb-2">45 y/o female for routine Botox. Reports satisfaction with previous results (duration ~3.5 months).</p>
          <p className="font-medium">OBJECTIVE</p>
          <p className="text-gray-600 mb-2">Treatment areas assessed. Appropriate candidate for continued neurotoxin therapy.</p>
          <p className="font-medium">ASSESSMENT</p>
          <p className="text-gray-600 mb-2">Dynamic rhytids - glabella, forehead, periorbital. Maintenance treatment.</p>
          <p className="font-medium">PLAN</p>
          <p className="text-gray-600">Botox (Lot B1234, Exp 02/2025): Glabella 20u, Forehead 10u, Crow&apos;s feet 20u (10u/side). Total: 50 units. Discussed lip flip for future. RTC 3-4 months.</p>
        </div>
      </div>

      <h2 id="vocabulary">Medical Vocabulary</h2>
      <p>
        Trained on aesthetic medicine terminology:
      </p>
      <ul>
        <li><strong>Products</strong> &mdash; Botox, Dysport, Xeomin, Juvederm, Restylane, etc.</li>
        <li><strong>Anatomy</strong> &mdash; Glabella, crow&apos;s feet, nasolabial folds, marionette lines</li>
        <li><strong>Procedures</strong> &mdash; Microneedling, RF, IPL, chemical peel</li>
        <li><strong>Units & measurements</strong> &mdash; u, ml, cc, properly formatted</li>
      </ul>

      <Callout type="tip" title="Natural Speech">
        Don&apos;t speak like a robot. Say &quot;crow&apos;s feet&quot; not &quot;lateral periorbital area&quot;
        - the AI understands both and uses appropriate clinical terminology.
      </Callout>

      <h2 id="features">Smart Features</h2>
      <ul>
        <li><strong>Auto-populate patient info</strong> &mdash; Age, name already filled</li>
        <li><strong>Lot number lookup</strong> &mdash; Validates against inventory</li>
        <li><strong>Injection mapping</strong> &mdash; Creates 3D face diagram from description</li>
        <li><strong>Previous visit context</strong> &mdash; Knows what was done last time</li>
      </ul>

      <h2 id="editing">Review & Edit</h2>
      <p>
        Before saving:
      </p>
      <ul>
        <li><strong>Full edit capability</strong> &mdash; Change any text</li>
        <li><strong>Section rearranging</strong> &mdash; Move content between SOAP sections</li>
        <li><strong>Quick corrections</strong> &mdash; Tap to fix transcription errors</li>
        <li><strong>Add more</strong> &mdash; Continue dictating to add detail</li>
      </ul>

      <h2 id="privacy">Privacy & Security</h2>
      <ul>
        <li><strong>HIPAA compliant</strong> &mdash; Encrypted processing</li>
        <li><strong>No data retention</strong> &mdash; Audio deleted after transcription</li>
        <li><strong>On-device option</strong> &mdash; Process locally (coming soon)</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/charting/soap" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SOAP Notes</h3>
          <p className="text-sm text-gray-500">Clinical documentation format</p>
        </Link>
        <Link href="/features/charting/injectables" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Injectable Tracking</h3>
          <p className="text-sm text-gray-500">Precise injection documentation</p>
        </Link>
      </div>
    </div>
  )
}
