import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { FileText, Clock, Clipboard, Shield, CheckCircle2 } from 'lucide-react'

export default function SoapNotesPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <FileText className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Clock className="w-3 h-3" /> In Progress
        </span>
      </div>
      <h1>SOAP Notes</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Professional clinical documentation that protects your practice. Consistent
        SOAP notes make audits easy, insurance claims smooth, and patient care traceable.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Every injection, every treatment, every patient conversation needs documentation.
        Not just for compliance - but for continuity. When a patient returns in 6 months,
        you need to know exactly what you did, how much, and why.
      </p>

      <h2 id="format">SOAP Format</h2>
      <p>
        The classic clinical documentation structure:
      </p>

      <h3>Subjective</h3>
      <p>
        What the patient tells you:
      </p>
      <ul>
        <li><strong>Chief complaint</strong> &mdash; &quot;I want to look less tired&quot;</li>
        <li><strong>History</strong> &mdash; Previous treatments, what worked/didn&apos;t</li>
        <li><strong>Goals</strong> &mdash; What outcome they&apos;re hoping for</li>
        <li><strong>Concerns</strong> &mdash; Specific areas they&apos;re worried about</li>
      </ul>

      <h3>Objective</h3>
      <p>
        What you observe:
      </p>
      <ul>
        <li><strong>Assessment findings</strong> &mdash; Wrinkle depth, volume loss, skin quality</li>
        <li><strong>Measurements</strong> &mdash; Before photos, skin analysis scores</li>
        <li><strong>Relevant exam</strong> &mdash; Muscle movement, skin laxity</li>
      </ul>

      <h3>Assessment</h3>
      <p>
        Your clinical judgment:
      </p>
      <ul>
        <li><strong>Diagnosis</strong> &mdash; Facial volume loss, dynamic rhytids</li>
        <li><strong>Treatment rationale</strong> &mdash; Why you chose this approach</li>
        <li><strong>Expected outcome</strong> &mdash; Realistic expectations discussed</li>
      </ul>

      <h3>Plan</h3>
      <p>
        What you did and what&apos;s next:
      </p>
      <ul>
        <li><strong>Treatment performed</strong> &mdash; Products, amounts, locations</li>
        <li><strong>Post-care instructions</strong> &mdash; What to do/avoid</li>
        <li><strong>Follow-up</strong> &mdash; When to return</li>
        <li><strong>Future recommendations</strong> &mdash; Additional treatments to consider</li>
      </ul>

      <Callout type="tip" title="Smart Templates">
        Create templates for common treatments. A Botox forehead template can
        pre-fill the structure - you just adjust the specifics for each patient.
      </Callout>

      <h2 id="quick-entry">Quick Entry Mode</h2>
      <p>
        Between patients, you need speed. Quick entry features:
      </p>
      <ul>
        <li><strong>Voice dictation</strong> &mdash; Speak your notes, AI transcribes</li>
        <li><strong>Smart suggestions</strong> &mdash; Based on service booked</li>
        <li><strong>Auto-fill</strong> &mdash; Patient history pre-populated</li>
        <li><strong>One-tap injection points</strong> &mdash; Mark on 3D face model</li>
      </ul>

      <h2 id="compliance">Compliance Features</h2>
      <p>
        Built-in safeguards:
      </p>
      <ul>
        <li><strong>Required fields</strong> &mdash; Can&apos;t save incomplete notes</li>
        <li><strong>Consent tracking</strong> &mdash; Linked to signed forms</li>
        <li><strong>Timestamp + signature</strong> &mdash; Immutable record</li>
        <li><strong>Audit trail</strong> &mdash; All edits logged</li>
      </ul>

      <Callout type="warning" title="Medical-Legal Protection">
        &quot;If it wasn&apos;t documented, it didn&apos;t happen.&quot; Complete SOAP notes are your
        best defense in any dispute or audit.
      </Callout>

      <h2 id="integration">Integration with Charting</h2>
      <p>
        SOAP notes connect to:
      </p>
      <ul>
        <li><strong>Injectable tracking</strong> &mdash; Units/ml auto-populated</li>
        <li><strong>Inventory</strong> &mdash; Lot numbers recorded</li>
        <li><strong>Photos</strong> &mdash; Before/after linked to note</li>
        <li><strong>Billing</strong> &mdash; Services match documentation</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/charting/injectables" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Injectable Tracking</h3>
          <p className="text-sm text-gray-500">Precise injection documentation</p>
        </Link>
        <Link href="/features/charting/photos" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Photo Documentation</h3>
          <p className="text-sm text-gray-500">Visual treatment records</p>
        </Link>
      </div>
    </div>
  )
}
