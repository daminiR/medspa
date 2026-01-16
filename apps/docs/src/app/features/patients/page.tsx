import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Users, Search, FileText, Clock, CheckCircle2, Mail, Phone, History, Activity, Heart, UserPlus } from 'lucide-react'

export default function PatientsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Users className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 100% Complete
        </span>
      </div>
      <h1>Patient Management</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Complete patient CRM with profiles, treatment history, documents, and communication
        tracking. Know your patients better, provide better care.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Patient Management Overview"
        duration="4 min"
        description="Learn how to create and manage patient records effectively"
      />

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Smart Search</h3>
          </div>
          <p className="text-sm text-gray-500">Find patients by name, phone, email, or any field. Results appear as you type.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Appointment History</h3>
          </div>
          <p className="text-sm text-gray-500">Full history with filtering, search, stats (total visits, spent), and status tracking.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Medical Profile</h3>
          </div>
          <p className="text-sm text-gray-500">Allergies, medications, medical history timeline, and contraindications checklist.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Aesthetic Profile</h3>
          </div>
          <p className="text-sm text-gray-500">Fitzpatrick skin type, skin concerns, treatment goals, and photo consent status.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Document Storage</h3>
          </div>
          <p className="text-sm text-gray-500">Store consent forms, medical history, before/after photos, and notes.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Communication Log</h3>
          </div>
          <p className="text-sm text-gray-500">See all SMS messages and emails sent to each patient in one place.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Family Linking</h3>
          </div>
          <p className="text-sm text-gray-500">Link family members for group bookings (couples, mother-daughter, bridal parties).</p>
        </div>
      </div>

      <h2 id="profiles">Patient Profiles</h2>
      <p>
        Each patient has a comprehensive profile containing:
      </p>

      <h3>Contact Information</h3>
      <ul>
        <li>Name (first, last, preferred name)</li>
        <li>Phone number (with SMS consent status)</li>
        <li>Email address</li>
        <li>Mailing address</li>
        <li>Date of birth</li>
        <li>Emergency contact</li>
      </ul>

      <h3>Medical Information</h3>
      <ul>
        <li>Medical history questionnaire</li>
        <li>Allergies and contraindications</li>
        <li>Current medications</li>
        <li>Previous treatments (at other clinics)</li>
        <li>Skin type and concerns</li>
      </ul>

      <h3>Preferences</h3>
      <ul>
        <li>Preferred provider</li>
        <li>Preferred appointment times</li>
        <li>Communication preferences (SMS, email, phone)</li>
        <li>Marketing opt-in status</li>
      </ul>

      <Callout type="tip" title="Quick Profile View">
        Click any patient name anywhere in the app (calendar, messages, reports) to instantly
        open their profile in a side panel without leaving your current page.
      </Callout>

      <h2 id="search">Search & Filters</h2>
      <p>
        Find any patient instantly with powerful search:
      </p>
      <ul>
        <li><strong>Global search bar</strong> &mdash; Type name, phone, or email from any page</li>
        <li><strong>Advanced filters</strong> &mdash; Filter by last visit, services received, spend amount</li>
        <li><strong>Saved searches</strong> &mdash; Save frequently used filter combinations</li>
        <li><strong>Export results</strong> &mdash; Export search results to CSV for mail merges</li>
      </ul>

      <h2 id="history">Appointment History</h2>
      <p>
        Comprehensive appointment history with powerful filtering and search:
      </p>
      <ul>
        <li><strong>Stats overview</strong> &mdash; Total appointments, upcoming count, completed count, total spent</li>
        <li><strong>Filter buttons</strong> &mdash; Quick filters for All, Upcoming, and Past appointments</li>
        <li><strong>Search</strong> &mdash; Search by service name or provider within history</li>
        <li><strong>Timeline view</strong> &mdash; All appointments grouped by date with full details</li>
        <li><strong>Status tracking</strong> &mdash; See Scheduled, Confirmed, Completed, Cancelled, No-Show status</li>
        <li><strong>Payment info</strong> &mdash; Amount paid for each appointment</li>
        <li><strong>Click to view</strong> &mdash; Click any appointment to see full details</li>
      </ul>

      <h2 id="medical-profile">Medical Profile</h2>
      <p>
        Dedicated Medical Profile tab with comprehensive health information:
      </p>

      <h3>Allergies & Medications</h3>
      <ul>
        <li><strong>Allergy tracking</strong> &mdash; Each allergy shown with reaction status and active indicator</li>
        <li><strong>Medications list</strong> &mdash; Current medications with interaction warnings</li>
        <li><strong>Add buttons</strong> &mdash; Quick add for new allergies and medications</li>
      </ul>

      <h3>Medical History Timeline</h3>
      <ul>
        <li><strong>Visual timeline</strong> &mdash; Track initial consultation, consent forms, and visits</li>
        <li><strong>Date stamps</strong> &mdash; See when each milestone occurred</li>
      </ul>

      <h3>Contraindications Checklist</h3>
      <ul>
        <li><strong>8-point checklist</strong> &mdash; Pregnancy, Breastfeeding, Active Infection, Autoimmune Disease, Blood Thinners, Keloid Scarring, Recent Sun Exposure, Isotretinoin</li>
        <li><strong>Auto-detection</strong> &mdash; Blood thinner status auto-detected from medications</li>
        <li><strong>Visual indicators</strong> &mdash; Green check for clear, red X for flagged items</li>
      </ul>

      <h3>Aesthetic Profile</h3>
      <ul>
        <li><strong>Fitzpatrick skin type</strong> &mdash; Type I-VI with descriptions</li>
        <li><strong>Skin concerns</strong> &mdash; Tagged concerns (aging, acne, dark spots, etc.)</li>
        <li><strong>Treatment goals</strong> &mdash; Tagged goals (anti-aging, rejuvenation, etc.)</li>
        <li><strong>Photo consent</strong> &mdash; Clear consent status display</li>
      </ul>

      <h3>Treatment Preferences</h3>
      <ul>
        <li><strong>Preferred days/times</strong> &mdash; When patient likes to come in</li>
        <li><strong>Primary provider</strong> &mdash; Default provider preference</li>
        <li><strong>Numbing preference</strong> &mdash; Topical, none, etc.</li>
      </ul>

      <h3>Family Members</h3>
      <ul>
        <li><strong>Linked accounts</strong> &mdash; Connect family members (spouse, child, parent, sibling)</li>
        <li><strong>Group booking support</strong> &mdash; Perfect for couples, mother-daughter, bridal parties</li>
        <li><strong>Quick profile access</strong> &mdash; View linked family member profiles with one click</li>
      </ul>

      <Callout type="tip" title="Group Bookings">
        Family linking enables group bookings! Link family members to easily book appointments
        for couples treatments, mother-daughter spa days, or bridal party events.
      </Callout>

      <h2 id="treatment-history">Treatment History</h2>
      <p>
        See everything that&apos;s been done for each patient:
      </p>
      <ul>
        <li><strong>Timeline view</strong> &mdash; All appointments in chronological order</li>
        <li><strong>By service</strong> &mdash; Group by service type (all Botox treatments together)</li>
        <li><strong>Treatment notes</strong> &mdash; Clinical notes from each visit</li>
        <li><strong>Photos</strong> &mdash; Before/after photos attached to visits</li>
        <li><strong>Products used</strong> &mdash; Injectables with units/syringes per visit</li>
      </ul>

      <h2 id="documents">Document Management</h2>
      <p>
        Store and organize patient documents:
      </p>
      <ul>
        <li><strong>Consent forms</strong> &mdash; Signed treatment consents with timestamps</li>
        <li><strong>Medical history</strong> &mdash; Health questionnaires</li>
        <li><strong>Photos</strong> &mdash; Before/after documentation</li>
        <li><strong>ID documents</strong> &mdash; Driver&apos;s license for new patients</li>
        <li><strong>External records</strong> &mdash; Records from other providers</li>
      </ul>

      <Callout type="info">
        All documents are stored securely with HIPAA-compliant encryption. Access is logged
        for audit purposes.
      </Callout>

      <h2 id="communications">Communication History</h2>
      <p>
        Track all patient communications:
      </p>
      <ul>
        <li><strong>SMS messages</strong> &mdash; All sent and received text messages</li>
        <li><strong>Email history</strong> &mdash; Appointment confirmations and marketing emails</li>
        <li><strong>Phone calls</strong> &mdash; Log calls with notes</li>
        <li><strong>Internal notes</strong> &mdash; Staff notes about patient preferences</li>
      </ul>

      <h2 id="creating">Creating Patients</h2>
      <p>
        New patients can be created in several ways:
      </p>
      <ul>
        <li><strong>Manual entry</strong> &mdash; Staff enters details when booking</li>
        <li><strong>Express booking</strong> &mdash; Patient enters own info via booking link</li>
        <li><strong>Online booking</strong> &mdash; Patient creates profile when booking online</li>
        <li><strong>Import</strong> &mdash; Bulk import from CSV or other systems</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting</h3>
          <p className="text-sm text-gray-500">Treatment documentation</p>
        </Link>
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar</h3>
          <p className="text-sm text-gray-500">Book appointments</p>
        </Link>
        <Link href="/features/messaging" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Messaging</h3>
          <p className="text-sm text-gray-500">Communicate with patients</p>
        </Link>
        <Link href="/features/reports" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Reports</h3>
          <p className="text-sm text-gray-500">Patient analytics</p>
        </Link>
      </div>
    </div>
  )
}
