import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Image, CheckCircle2, Lock, Download, Eye } from 'lucide-react'

export default function PortalPhotosPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Image className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Patient Photo Gallery</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Patients can view their treatment photos anytime. See progress over time,
        compare before/afters, and stay motivated on their aesthetic journey.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Patients forget what they looked like before treatment. When they can see
        their own transformation, they appreciate results more, refer friends, and
        return for maintenance. Photos in their pocket = engaged patients.
      </p>

      <h2 id="gallery">Photo Gallery View</h2>
      <p>
        Organized by treatment:
      </p>
      <ul>
        <li><strong>Timeline view</strong> &mdash; Chronological progression</li>
        <li><strong>By treatment</strong> &mdash; Grouped by service type</li>
        <li><strong>Before/after pairs</strong> &mdash; Side by side comparisons</li>
        <li><strong>Full resolution</strong> &mdash; Pinch to zoom</li>
      </ul>

      <div className="not-prose p-4 bg-white border rounded-lg mb-6">
        <p className="text-sm text-gray-500 mb-3">Treatment Progress</p>
        <div className="grid grid-cols-4 gap-2">
          <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Jan</div>
          <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Mar</div>
          <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">May</div>
          <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Jul</div>
        </div>
      </div>

      <h2 id="comparison">Comparison Tools</h2>
      <p>
        Help patients see their progress:
      </p>
      <ul>
        <li><strong>Side-by-side</strong> &mdash; Two photos next to each other</li>
        <li><strong>Slider comparison</strong> &mdash; Swipe to reveal before/after</li>
        <li><strong>Select any two</strong> &mdash; Compare any photos in their gallery</li>
      </ul>

      <h2 id="privacy">Privacy Controls</h2>
      <p>
        Patient data stays secure:
      </p>
      <ul>
        <li><strong>Login required</strong> &mdash; Must authenticate to view</li>
        <li><strong>No public sharing</strong> &mdash; Photos only visible to patient</li>
        <li><strong>Session timeout</strong> &mdash; Auto-logout after inactivity</li>
        <li><strong>Watermarked</strong> &mdash; Optional watermark if downloaded</li>
      </ul>

      <Callout type="warning" title="HIPAA Compliant">
        Photos are encrypted at rest and in transit. Patients can only access
        their own photos through authenticated sessions.
      </Callout>

      <h2 id="download">Download Options</h2>
      <p>
        When enabled by your practice:
      </p>
      <ul>
        <li><strong>Download individual</strong> &mdash; Save single photos</li>
        <li><strong>Download comparison</strong> &mdash; Side-by-side image</li>
        <li><strong>Share to camera roll</strong> &mdash; For personal use</li>
      </ul>

      <Callout type="tip" title="Encourage Sharing">
        Happy patients sharing their results (with consent) is your best marketing.
        Make it easy for them to save and share their progress photos.
      </Callout>

      <h2 id="upload">Patient Photo Upload</h2>
      <p>
        Patients can upload their own photos:
      </p>
      <ul>
        <li><strong>Progress at home</strong> &mdash; Track healing between visits</li>
        <li><strong>Concerns</strong> &mdash; Show any issues for provider review</li>
        <li><strong>Reference photos</strong> &mdash; &quot;I want to look like this&quot;</li>
      </ul>
      <p>
        Uploaded photos appear in their chart for provider review.
      </p>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/charting/photos" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Photo Documentation</h3>
          <p className="text-sm text-gray-500">Clinical photo capture</p>
        </Link>
        <Link href="/features/series/progress" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Progress Tracking</h3>
          <p className="text-sm text-gray-500">Series progress visualization</p>
        </Link>
      </div>
    </div>
  )
}
