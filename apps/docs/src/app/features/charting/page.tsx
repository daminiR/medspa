import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { FileText, Clock, Mic, Camera, Syringe, CheckCircle2, ClipboardList } from 'lucide-react'

export default function ChartingPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <FileText className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Clock className="w-3 h-3" /> 45% Complete
        </span>
      </div>
      <h1>Charting</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Document treatments with SOAP notes, track injectable usage, and maintain photo records.
        Built for MedSpa workflows with AI assistance coming soon.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Charting Overview"
        duration="5 min"
        description="Learn how to document treatments efficiently"
      />

      <Callout type="info" title="Under Active Development">
        Charting is one of our most-requested features and is under active development.
        Core SOAP notes and injectable tracking are available now, with advanced features
        coming soon.
      </Callout>

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">SOAP Notes</h3>
          </div>
          <p className="text-sm text-gray-500">Structured clinical documentation following medical standards.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Syringe className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Injectable Tracking</h3>
          </div>
          <p className="text-sm text-gray-500">Record units, injection sites, lot numbers for Botox, filler, etc.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Photo Documentation</h3>
          </div>
          <p className="text-sm text-gray-500">Before/after photos attached to treatments for progress tracking.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Voice Dictation</h3>
          </div>
          <p className="text-sm text-gray-500">Coming soon: Speak your notes and AI structures them into SOAP format.</p>
        </div>
      </div>

      <h2 id="soap-notes">SOAP Notes</h2>
      <p>
        SOAP is the medical standard for treatment documentation:
      </p>

      <div className="not-prose bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">S</span>
              Subjective
            </h4>
            <p className="text-sm text-gray-600 ml-8">What the patient reports &mdash; their concerns, symptoms, goals, and relevant history.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">O</span>
              Objective
            </h4>
            <p className="text-sm text-gray-600 ml-8">What you observe &mdash; skin condition, measurements, areas to treat.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">A</span>
              Assessment
            </h4>
            <p className="text-sm text-gray-600 ml-8">Your clinical evaluation &mdash; candidacy, contraindications, risk factors.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">P</span>
              Plan
            </h4>
            <p className="text-sm text-gray-600 ml-8">Treatment performed &mdash; products used, quantities, sites, aftercare given.</p>
          </div>
        </div>
      </div>

      <h2 id="injectable-tracking">Injectable Tracking</h2>
      <p>
        For injectable treatments (Botox, Dysport, fillers), track:
      </p>
      <ul>
        <li><strong>Product name</strong> &mdash; Botox, Dysport, Juvederm, Restylane, etc.</li>
        <li><strong>Quantity</strong> &mdash; Units (for toxins) or syringes (for fillers)</li>
        <li><strong>Injection sites</strong> &mdash; Visual diagram or text description</li>
        <li><strong>Lot number</strong> &mdash; For recall tracking and compliance</li>
        <li><strong>Expiration</strong> &mdash; Product expiration date</li>
      </ul>

      <Callout type="tip" title="Automatic Inventory Deduction">
        When you record products used, they&apos;re automatically deducted from inventory
        (inventory management coming soon).
      </Callout>

      <h2 id="photo-documentation">Photo Documentation</h2>
      <p>
        Capture and organize treatment photos:
      </p>
      <ul>
        <li><strong>Before photos</strong> &mdash; Document baseline before treatment</li>
        <li><strong>After photos</strong> &mdash; Immediate post-treatment</li>
        <li><strong>Follow-up photos</strong> &mdash; At 2-week or 1-month follow-ups</li>
        <li><strong>Comparison views</strong> &mdash; Side-by-side before/after</li>
        <li><strong>Annotation</strong> &mdash; Mark areas of treatment on photos</li>
      </ul>

      <h2 id="templates">Chart Templates</h2>
      <p>
        Pre-built templates speed up documentation for common treatments:
      </p>
      <ul>
        <li><strong>Botox template</strong> &mdash; Pre-populated fields for toxin treatments</li>
        <li><strong>Filler template</strong> &mdash; Fields for syringe counts, areas, technique</li>
        <li><strong>Facial template</strong> &mdash; Skincare products, settings, observations</li>
        <li><strong>Laser template</strong> &mdash; Device settings, passes, cooling method</li>
        <li><strong>Custom templates</strong> &mdash; Create your own for specific treatments</li>
      </ul>

      <h2 id="coming-soon">Coming Soon</h2>

      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Voice Dictation</h3>
          </div>
          <p className="text-sm text-purple-700">Speak your notes naturally. AI transcribes and structures into SOAP format automatically.</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">AI Product Extraction</h3>
          <p className="text-sm text-purple-700">&quot;20 units Botox to forehead&quot; automatically parsed into product records.</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Face Mapping</h3>
          <p className="text-sm text-purple-700">Visual diagram to mark injection sites and quantities per area.</p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Consent Integration</h3>
          <p className="text-sm text-purple-700">Link signed consent forms directly to treatment charts.</p>
        </div>
      </div>

      <h2 id="workflow">Charting Workflow</h2>
      <p>
        Typical charting workflow during an appointment:
      </p>
      <ol>
        <li><strong>Open chart</strong> from appointment or patient profile</li>
        <li><strong>Take before photos</strong> if needed</li>
        <li><strong>Complete SOAP notes</strong> during or after treatment</li>
        <li><strong>Record products used</strong> with quantities</li>
        <li><strong>Take after photos</strong></li>
        <li><strong>Add aftercare instructions</strong> given to patient</li>
        <li><strong>Sign and lock</strong> the chart</li>
      </ol>

      <Callout type="info">
        Charts can be edited until signed. Once signed, changes require an addendum
        (for compliance and audit trail).
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/patients" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Patient Profiles</h3>
          <p className="text-sm text-gray-500">Where charts are stored</p>
        </Link>
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar</h3>
          <p className="text-sm text-gray-500">Start charts from appointments</p>
        </Link>
        <Link href="/features/voice-ai" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Voice AI</h3>
          <p className="text-sm text-gray-500">Dictation features (coming soon)</p>
        </Link>
        <Link href="/features/series" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Treatment Series</h3>
          <p className="text-sm text-gray-500">Track progress across sessions</p>
        </Link>
      </div>
    </div>
  )
}
