import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { User, CheckCircle2, Phone, Mail, FileText, Calendar, CreditCard, Clock } from 'lucide-react'

export default function PatientProfilesPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <User className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Patient Profiles</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Complete patient records with contact info, medical history, treatment history,
        and communication logs. Everything you need to provide personalized care.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Patient Profiles Deep Dive"
        duration="5 min"
        description="Learn how to create and manage patient profiles effectively"
      />

      <h2 id="profile-sections">Profile Sections</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Personal Info</h3>
          </div>
          <p className="text-sm text-gray-500">Name, DOB, contact details, emergency contact, preferences.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Medical History</h3>
          </div>
          <p className="text-sm text-gray-500">Health conditions, allergies, medications, contraindications.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Treatment History</h3>
          </div>
          <p className="text-sm text-gray-500">All appointments, services received, clinical notes, photos.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Billing</h3>
          </div>
          <p className="text-sm text-gray-500">Payment history, packages owned, cards on file, outstanding balance.</p>
        </div>
      </div>

      <h2 id="personal-info">Personal Information</h2>
      <p>
        Core contact and demographic information:
      </p>

      <h3>Required Fields</h3>
      <ul>
        <li><strong>First Name</strong> &mdash; Legal first name</li>
        <li><strong>Last Name</strong> &mdash; Legal last name</li>
        <li><strong>Phone Number</strong> &mdash; Primary contact number</li>
        <li><strong>Date of Birth</strong> &mdash; For age verification and records</li>
      </ul>

      <h3>Optional Fields</h3>
      <ul>
        <li><strong>Preferred Name</strong> &mdash; Name patient prefers to be called</li>
        <li><strong>Email</strong> &mdash; For confirmations and marketing</li>
        <li><strong>Address</strong> &mdash; Mailing address</li>
        <li><strong>Emergency Contact</strong> &mdash; Name and phone for emergencies</li>
        <li><strong>Pronouns</strong> &mdash; Patient&apos;s preferred pronouns</li>
        <li><strong>Referral Source</strong> &mdash; How they heard about you</li>
      </ul>

      <Callout type="tip" title="Preferred Name">
        If a patient goes by a nickname or preferred name, enter it in the "Preferred Name" field.
        This is what appears in greetings and messages: "Hi Sarah!" instead of "Hi Sarah Elizabeth!"
      </Callout>

      <h2 id="medical-history">Medical History</h2>
      <p>
        Important health information for safe treatment:
      </p>

      <h3>Health Questionnaire</h3>
      <p>
        Patients complete a health questionnaire that captures:
      </p>
      <ul>
        <li>Current medications (especially blood thinners, Accutane)</li>
        <li>Allergies (lidocaine, latex, specific products)</li>
        <li>Skin conditions (eczema, psoriasis, active acne)</li>
        <li>Medical conditions (autoimmune, bleeding disorders)</li>
        <li>Recent procedures (surgery, dental work)</li>
        <li>Pregnancy/breastfeeding status</li>
      </ul>

      <Callout type="warning" title="Review Before Treatment">
        Always review medical history before treatment. The system flags patients with contraindications
        like pregnancy, blood thinners, or recent Accutane use.
      </Callout>

      <h3>Contraindication Alerts</h3>
      <p>
        The system automatically flags patients who may have contraindications:
      </p>
      <ul>
        <li>🔴 <strong>Red flag</strong> &mdash; Do not treat without provider review</li>
        <li>🟡 <strong>Yellow flag</strong> &mdash; Caution, review history</li>
        <li>🟢 <strong>Green</strong> &mdash; No contraindications identified</li>
      </ul>

      <h2 id="treatment-history">Treatment History</h2>
      <p>
        Complete record of every visit and treatment:
      </p>

      <h3>Timeline View</h3>
      <p>
        See all appointments in chronological order with:
      </p>
      <ul>
        <li>Date and time of visit</li>
        <li>Services performed</li>
        <li>Provider who treated them</li>
        <li>Products used (units, syringes)</li>
        <li>Before/after photos</li>
        <li>Clinical notes (SOAP)</li>
        <li>Amount paid</li>
      </ul>

      <h3>By Service View</h3>
      <p>
        Group treatments by service type to see:
      </p>
      <ul>
        <li>All Botox treatments together</li>
        <li>Total units used over time</li>
        <li>Treatment frequency</li>
        <li>Results progression</li>
      </ul>

      <h2 id="documents">Documents</h2>
      <p>
        Store and organize patient documents:
      </p>
      <ul>
        <li><strong>Consent Forms</strong> &mdash; Signed treatment consents</li>
        <li><strong>Medical History</strong> &mdash; Completed questionnaires</li>
        <li><strong>Photos</strong> &mdash; Before/after documentation</li>
        <li><strong>ID</strong> &mdash; Driver&apos;s license or ID</li>
        <li><strong>External Records</strong> &mdash; Records from other providers</li>
        <li><strong>Custom Documents</strong> &mdash; Any other attachments</li>
      </ul>

      <h2 id="communication">Communication Log</h2>
      <p>
        See all patient communications in one place:
      </p>
      <ul>
        <li><strong>SMS Messages</strong> &mdash; All sent and received texts</li>
        <li><strong>Emails</strong> &mdash; Appointment confirmations, marketing</li>
        <li><strong>Phone Calls</strong> &mdash; Logged calls with notes</li>
        <li><strong>Internal Notes</strong> &mdash; Staff notes and reminders</li>
      </ul>

      <Callout type="info">
        Click any message to see the full conversation thread. Reply directly from the
        patient profile without switching to the messages page.
      </Callout>

      <h2 id="preferences">Patient Preferences</h2>
      <p>
        Track patient preferences for better service:
      </p>
      <ul>
        <li><strong>Preferred Provider</strong> &mdash; Default provider for bookings</li>
        <li><strong>Preferred Days/Times</strong> &mdash; When they like to come in</li>
        <li><strong>Communication Preference</strong> &mdash; SMS, email, or phone</li>
        <li><strong>Marketing Opt-In</strong> &mdash; Can receive promotional messages</li>
        <li><strong>Special Notes</strong> &mdash; VIP status, special requests, etc.</li>
      </ul>

      <h2 id="creating">Creating a Patient</h2>

      <StepList steps={[
        {
          title: 'Click "New Patient"',
          description: 'From the Patients page or during booking.'
        },
        {
          title: 'Enter required info',
          description: 'First name, last name, phone number, date of birth.'
        },
        {
          title: 'Add optional details',
          description: 'Email, address, emergency contact as needed.'
        },
        {
          title: 'Complete health questionnaire',
          description: 'Can be done now or sent to patient to complete.'
        },
        {
          title: 'Upload documents',
          description: 'Add ID, consent forms, or other documents.'
        },
        {
          title: 'Save patient',
          description: 'Patient is created and ready for booking.'
        }
      ]} />

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/patients/search" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Search & Filters</h3>
          <p className="text-sm text-gray-500">Finding patients quickly</p>
        </Link>
        <Link href="/features/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting</h3>
          <p className="text-sm text-gray-500">Treatment documentation</p>
        </Link>
        <Link href="/features/messaging" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Messaging</h3>
          <p className="text-sm text-gray-500">Patient communications</p>
        </Link>
        <Link href="/features/billing" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Billing</h3>
          <p className="text-sm text-gray-500">Payment history</p>
        </Link>
      </div>
    </div>
  )
}
