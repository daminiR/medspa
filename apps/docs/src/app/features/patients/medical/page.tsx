import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Activity, CheckCircle2, AlertTriangle, Pill, Shield, Heart, XCircle } from 'lucide-react'

export default function MedicalProfilePage() {
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
      <h1>Medical Profile</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Patient safety starts here. See allergies, medications, and contraindications at a glance
        so your providers can treat with confidence.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Imagine a patient arrives for Botox, but they started blood thinners last month and forgot
        to mention it. Or someone with a lidocaine allergy is about to get filler. The Medical
        Profile catches these situations before they become problems.
      </p>

      <Callout type="warning" title="Patient Safety First">
        Always review the Medical Profile before starting any treatment. It takes 10 seconds
        and could prevent a serious reaction.
      </Callout>

      <h2 id="alerts">Medical Alerts</h2>
      <p>
        Critical information appears in a red banner at the top - impossible to miss:
      </p>
      <div className="not-prose mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Active Medical Alerts</p>
            <p className="text-sm text-red-800 mt-1">Latex allergy - Use nitrile gloves only</p>
          </div>
        </div>
      </div>
      <p>
        If there are no alerts, you&apos;ll see a clean profile without the banner.
      </p>

      <h2 id="allergies">Allergies</h2>
      <p>
        Every documented allergy is listed with:
      </p>
      <ul>
        <li><strong>Allergen name</strong> &mdash; What they&apos;re allergic to</li>
        <li><strong>Reaction type</strong> &mdash; What happens (rash, swelling, anaphylaxis)</li>
        <li><strong>Status</strong> &mdash; Active or resolved</li>
      </ul>
      <p>
        Common allergies in med spas include:
      </p>
      <ul>
        <li><strong>Lidocaine</strong> &mdash; Affects numbing options for procedures</li>
        <li><strong>Latex</strong> &mdash; Requires nitrile gloves</li>
        <li><strong>Aspirin/NSAIDs</strong> &mdash; May affect bruising risk</li>
        <li><strong>Specific products</strong> &mdash; Skincare ingredients, filler brands</li>
      </ul>

      <h2 id="medications">Current Medications</h2>
      <p>
        See what medications the patient takes, especially:
      </p>
      <ul>
        <li><strong>Blood thinners</strong> &mdash; Warfarin, aspirin, fish oil (bruising risk)</li>
        <li><strong>Accutane</strong> &mdash; Recent use affects treatment timing</li>
        <li><strong>Immunosuppressants</strong> &mdash; May affect healing</li>
        <li><strong>Antibiotics</strong> &mdash; Some interact with procedures</li>
      </ul>

      <Callout type="tip" title="Ask About Supplements Too">
        Fish oil, vitamin E, and ginkgo biloba all increase bruising. These often
        aren&apos;t listed as &quot;medications&quot; but matter for injectables.
      </Callout>

      <h2 id="contraindications">Contraindications Checklist</h2>
      <p>
        An 8-point safety checklist is reviewed before treatment:
      </p>
      <div className="not-prose grid grid-cols-2 gap-3 mb-6">
        {[
          'Pregnancy',
          'Breastfeeding',
          'Active Infection',
          'Autoimmune Disease',
          'Blood Thinners',
          'Keloid Scarring',
          'Recent Sun Exposure',
          'Isotretinoin (Accutane)'
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>
      <p>
        Green checkmarks mean clear. Red X marks mean the contraindication is present and
        the provider should review before proceeding.
      </p>

      <h2 id="timeline">Medical History Timeline</h2>
      <p>
        A visual timeline shows key medical events:
      </p>
      <ul>
        <li><strong>Initial consultation</strong> &mdash; When full history was reviewed</li>
        <li><strong>Consent forms</strong> &mdash; When signed</li>
        <li><strong>Updates</strong> &mdash; Any changes to medical status</li>
        <li><strong>Last visit</strong> &mdash; Most recent treatment</li>
      </ul>

      <h2 id="aesthetic">Aesthetic Profile</h2>
      <p>
        Beyond medical safety, we track aesthetic information:
      </p>
      <ul>
        <li><strong>Fitzpatrick skin type</strong> &mdash; Type I-VI (affects laser settings)</li>
        <li><strong>Skin concerns</strong> &mdash; Aging, acne, dark spots, etc.</li>
        <li><strong>Treatment goals</strong> &mdash; What the patient wants to achieve</li>
        <li><strong>Photo consent</strong> &mdash; Whether we can take before/after photos</li>
      </ul>

      <h2 id="preferences">Treatment Preferences</h2>
      <p>
        Personal preferences that improve their experience:
      </p>
      <ul>
        <li><strong>Preferred provider</strong> &mdash; Who they like to see</li>
        <li><strong>Preferred times</strong> &mdash; Morning, afternoon, specific days</li>
        <li><strong>Numbing preference</strong> &mdash; Topical only, ice, none</li>
      </ul>

      <Callout type="info" title="Building Trust">
        Remembering a patient&apos;s preferences (&quot;I know you like extra numbing for lip filler&quot;)
        shows you care about their comfort and builds loyalty.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/patients/history" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Appointment History</h3>
          <p className="text-sm text-gray-500">Past visits and treatments</p>
        </Link>
        <Link href="/features/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting</h3>
          <p className="text-sm text-gray-500">Treatment documentation</p>
        </Link>
      </div>
    </div>
  )
}
