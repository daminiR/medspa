import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Camera, Clock, Image, Lock, Share2 } from 'lucide-react'

export default function PhotoDocumentationPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Camera className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge planned">
          <Clock className="w-3 h-3" /> Planned
        </span>
      </div>
      <h1>Photo Documentation</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        A picture is worth a thousand words - and a lawsuit defense. Clinical
        photos document results, prove progress, and protect your practice.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        &quot;I don&apos;t see any difference.&quot; Show them the before photo. Consistent,
        quality photo documentation proves treatment efficacy and keeps patients
        engaged in their treatment journey.
      </p>

      <h2 id="capture">Photo Capture</h2>
      <p>
        Built-in camera guidance:
      </p>
      <ul>
        <li><strong>Face detection</strong> &mdash; Ensures consistent framing</li>
        <li><strong>Position guides</strong> &mdash; Front, left profile, right profile</li>
        <li><strong>Lighting indicator</strong> &mdash; Warns if lighting is inconsistent</li>
        <li><strong>Auto-enhancement</strong> &mdash; Consistent brightness/contrast</li>
      </ul>

      <Callout type="tip" title="Consistency is Key">
        Same lighting, same distance, same angle every time. Small differences
        make comparisons useless. Use your dedicated photo station if possible.
      </Callout>

      <h2 id="organization">Photo Organization</h2>
      <p>
        Photos are automatically organized by:
      </p>
      <ul>
        <li><strong>Treatment date</strong> &mdash; Chronological timeline</li>
        <li><strong>Treatment type</strong> &mdash; Grouped by service</li>
        <li><strong>Body area</strong> &mdash; Face, body, specific zones</li>
        <li><strong>View angle</strong> &mdash; Front, profile, 3/4</li>
      </ul>

      <h2 id="comparison">Comparison Tools</h2>
      <p>
        Show progress visually:
      </p>
      <ul>
        <li><strong>Side-by-side</strong> &mdash; Before and after next to each other</li>
        <li><strong>Slider tool</strong> &mdash; Swipe to reveal changes</li>
        <li><strong>Timeline view</strong> &mdash; See progression over multiple visits</li>
        <li><strong>Overlay</strong> &mdash; Stack images for precise comparison</li>
      </ul>

      <div className="not-prose p-4 bg-white border rounded-lg mb-6">
        <p className="text-sm text-gray-500 mb-3">Comparison View</p>
        <div className="flex gap-4">
          <div className="flex-1 aspect-square bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-400">Before</span>
          </div>
          <div className="flex-1 aspect-square bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-400">After</span>
          </div>
        </div>
      </div>

      <h2 id="consent">Photo Consent</h2>
      <p>
        Patient privacy is paramount:
      </p>
      <ul>
        <li><strong>Clinical use only</strong> &mdash; Default, required consent</li>
        <li><strong>Marketing consent</strong> &mdash; Separate permission for social/website</li>
        <li><strong>Identifiable features</strong> &mdash; Can consent to face shown or obscured</li>
        <li><strong>Revocable</strong> &mdash; Patient can withdraw consent anytime</li>
      </ul>

      <Callout type="warning" title="HIPAA Compliance">
        Photos are PHI (Protected Health Information). Store them securely,
        encrypt in transit, and never share without proper consent.
      </Callout>

      <h2 id="sharing">Sharing Options</h2>
      <p>
        When consent is obtained:
      </p>
      <ul>
        <li><strong>Patient portal</strong> &mdash; Patients view their own photos</li>
        <li><strong>Email to patient</strong> &mdash; Secure delivery</li>
        <li><strong>Marketing gallery</strong> &mdash; For consented before/afters</li>
        <li><strong>Export for consult</strong> &mdash; Send to referring provider</li>
      </ul>

      <h2 id="integration">Chart Integration</h2>
      <p>
        Photos link to clinical documentation:
      </p>
      <ul>
        <li><strong>Attached to SOAP note</strong> &mdash; Part of the visit record</li>
        <li><strong>Injectable overlay</strong> &mdash; Show injection points on photo</li>
        <li><strong>Progress tracking</strong> &mdash; Visual timeline for series</li>
        <li><strong>Report generation</strong> &mdash; Include in patient summaries</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/charting/soap" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SOAP Notes</h3>
          <p className="text-sm text-gray-500">Clinical documentation</p>
        </Link>
        <Link href="/features/series/progress" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Progress Tracking</h3>
          <p className="text-sm text-gray-500">Treatment series progress</p>
        </Link>
      </div>
    </div>
  )
}
