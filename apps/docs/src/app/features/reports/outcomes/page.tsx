import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Activity, CheckCircle2, TrendingUp, Users, Star, Camera } from 'lucide-react'

export default function TreatmentOutcomesPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Activity className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Treatment Outcomes</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Track what&apos;s working. See patient satisfaction, treatment effectiveness, and
        identify opportunities for improvement.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Not all treatments have the same results. Some patients rave about their Botox
        while others need touch-ups. Outcome tracking helps you understand what&apos;s working,
        refine your techniques, and demonstrate value to patients.
      </p>

      <h2 id="satisfaction">Patient Satisfaction</h2>
      <p>
        Track how patients feel about their treatments:
      </p>
      <ul>
        <li><strong>Satisfaction scores</strong> &mdash; From post-treatment surveys</li>
        <li><strong>By treatment type</strong> &mdash; Which services rate highest</li>
        <li><strong>By provider</strong> &mdash; Compare provider scores</li>
        <li><strong>Over time</strong> &mdash; Is satisfaction improving?</li>
      </ul>

      <div className="not-prose grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">4.8</p>
          <p className="text-sm text-gray-500">Avg Rating</p>
        </div>
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">94%</p>
          <p className="text-sm text-gray-500">Would Recommend</p>
        </div>
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-600">87%</p>
          <p className="text-sm text-gray-500">Rebook Rate</p>
        </div>
      </div>

      <h2 id="effectiveness">Treatment Effectiveness</h2>
      <p>
        Measure how well treatments are working:
      </p>
      <ul>
        <li><strong>Touch-up rate</strong> &mdash; How often patients need corrections</li>
        <li><strong>Duration</strong> &mdash; How long results last (Botox: 3-4 months?)</li>
        <li><strong>Product performance</strong> &mdash; Compare different products</li>
      </ul>

      <Callout type="tip" title="Use the Data">
        If one filler brand has fewer touch-ups than another, that&apos;s valuable information
        for treatment planning and patient consultations.
      </Callout>

      <h2 id="retention">Patient Retention</h2>
      <p>
        Track which treatments bring patients back:
      </p>
      <ul>
        <li><strong>Rebook rate</strong> &mdash; Percentage who schedule another appointment</li>
        <li><strong>Time to rebook</strong> &mdash; How long until they come back</li>
        <li><strong>Treatment progression</strong> &mdash; Do facial patients try injectables?</li>
      </ul>

      <h2 id="before-after">Before/After Analysis</h2>
      <p>
        When you have before/after photos:
      </p>
      <ul>
        <li><strong>Visual progress</strong> &mdash; Side-by-side comparison</li>
        <li><strong>Treatment series</strong> &mdash; Track improvement over multiple sessions</li>
        <li><strong>Patient review</strong> &mdash; Share results in consultations</li>
      </ul>

      <h2 id="complications">Complication Tracking</h2>
      <p>
        Monitor any adverse events:
      </p>
      <ul>
        <li><strong>Complication rate</strong> &mdash; By treatment type</li>
        <li><strong>Severity</strong> &mdash; Minor vs. significant</li>
        <li><strong>Resolution</strong> &mdash; How issues were addressed</li>
      </ul>

      <Callout type="warning" title="Quality Assurance">
        Regular review of complication data helps identify training needs and
        maintain high safety standards.
      </Callout>

      <h2 id="related">Related Reports</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting</h3>
          <p className="text-sm text-gray-500">Treatment documentation</p>
        </Link>
        <Link href="/features/reports/sales" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Sales Reports</h3>
          <p className="text-sm text-gray-500">Revenue by treatment</p>
        </Link>
      </div>
    </div>
  )
}
