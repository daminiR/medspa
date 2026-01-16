import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { TrendingUp, CheckCircle2, Camera, BarChart3, Calendar } from 'lucide-react'

export default function ProgressTrackingPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <TrendingUp className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Progress Tracking</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Show patients their treatment journey. Before/after comparisons, session
        counts, and results visualization keep them motivated and coming back.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        &quot;Is this working?&quot; patients wonder mid-series. Progress tracking provides
        visual proof of results, reduces buyer&apos;s remorse, and increases package
        completion rates.
      </p>

      <h2 id="dashboard">Series Dashboard</h2>
      <p>
        For each treatment series, patients can see:
      </p>
      <ul>
        <li><strong>Sessions completed</strong> &mdash; 4 of 6 done</li>
        <li><strong>Sessions remaining</strong> &mdash; 2 left</li>
        <li><strong>Next appointment</strong> &mdash; Scheduled date</li>
        <li><strong>Timeline</strong> &mdash; When each session occurred</li>
      </ul>

      <div className="not-prose p-4 bg-white border rounded-lg mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold">Laser Hair Removal - Underarms</span>
          <span className="text-sm text-gray-500">4/6 sessions</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-purple-600 h-3 rounded-full" style={{width: '67%'}}></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Next session: Jan 15, 2025</p>
      </div>

      <h2 id="photos">Before/After Photos</h2>
      <p>
        Compare photos across the series:
      </p>
      <ul>
        <li><strong>Baseline photo</strong> &mdash; Before first treatment</li>
        <li><strong>Progress photos</strong> &mdash; After each session</li>
        <li><strong>Side-by-side view</strong> &mdash; Compare any two photos</li>
        <li><strong>Slider tool</strong> &mdash; Swipe to see the difference</li>
      </ul>

      <Callout type="tip" title="Consistent Photos">
        For best comparisons, take photos in the same lighting, angle, and distance
        each time. Consistency makes results obvious.
      </Callout>

      <h2 id="metrics">Treatment Metrics</h2>
      <p>
        Track measurable outcomes:
      </p>
      <ul>
        <li><strong>Skin score</strong> &mdash; Improvement percentage (if using analysis tools)</li>
        <li><strong>Treatment area</strong> &mdash; Size of area treated</li>
        <li><strong>Product used</strong> &mdash; Units/ml per session</li>
        <li><strong>Provider notes</strong> &mdash; Observations each visit</li>
      </ul>

      <h2 id="milestones">Milestones</h2>
      <p>
        Celebrate progress:
      </p>
      <ul>
        <li><strong>Halfway there!</strong> &mdash; Encouragement at 50%</li>
        <li><strong>One session left</strong> &mdash; Almost done</li>
        <li><strong>Series complete!</strong> &mdash; Celebration message</li>
      </ul>
      <p>
        These touchpoints keep patients engaged and motivated to complete treatment.
      </p>

      <h2 id="sharing">Sharing Progress</h2>
      <p>
        Patients can view their progress in the patient portal:
      </p>
      <ul>
        <li>See their treatment history</li>
        <li>View photos (if consented)</li>
        <li>Download progress reports</li>
        <li>Share results (with their control)</li>
      </ul>

      <h2 id="provider-view">Provider View</h2>
      <p>
        During consultations, providers can:
      </p>
      <ul>
        <li>Review entire treatment history</li>
        <li>Compare photos side-by-side</li>
        <li>Show progress to patient on screen</li>
        <li>Discuss next steps based on results</li>
      </ul>

      <Callout type="info" title="Retention Tool">
        After completing a series, use progress photos to recommend the next
        treatment: &quot;Look how great your skin looks! To maintain these results...&quot;
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/charting/photos" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Photo Documentation</h3>
          <p className="text-sm text-gray-500">Taking treatment photos</p>
        </Link>
        <Link href="/features/reports/outcomes" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Treatment Outcomes</h3>
          <p className="text-sm text-gray-500">Aggregate results data</p>
        </Link>
      </div>
    </div>
  )
}
