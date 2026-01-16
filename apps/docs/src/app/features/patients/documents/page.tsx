import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { FileText, CheckCircle2, Upload, FolderOpen, Shield, Camera, Clock } from 'lucide-react'

export default function DocumentStoragePage() {
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
      <h1>Document Storage</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Store consent forms, medical history, ID documents, and photos securely.
        Everything you need for a patient in one place.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Paper consent forms get lost. Emailed medical histories end up buried in inboxes.
        When a patient disputes a charge or you need to verify what they signed, you need
        documents at your fingertips - not in a filing cabinet across the room.
      </p>

      <h2 id="document-types">Document Types</h2>

      <h3>Consent Forms</h3>
      <p>
        Every treatment consent with signature, date, and timestamp:
      </p>
      <ul>
        <li>General treatment consent</li>
        <li>Botox/filler specific consents</li>
        <li>Laser treatment consents</li>
        <li>Photo release consent</li>
      </ul>

      <h3>Medical History</h3>
      <p>
        Health questionnaires and intake forms:
      </p>
      <ul>
        <li>Initial health questionnaire</li>
        <li>Updated medical history forms</li>
        <li>Specialist referral letters</li>
      </ul>

      <h3>Identification</h3>
      <ul>
        <li>Driver&apos;s license (for new patient verification)</li>
        <li>Insurance cards (if applicable)</li>
      </ul>

      <h3>Photos</h3>
      <ul>
        <li>Before/after treatment photos</li>
        <li>Progress photos over time</li>
        <li>Reaction documentation (if any)</li>
      </ul>

      <Callout type="warning" title="HIPAA Compliance">
        All documents are stored with HIPAA-compliant encryption. Access is logged
        for audit purposes. Only authorized staff can view patient documents.
      </Callout>

      <h2 id="uploading">Uploading Documents</h2>
      <ol>
        <li>Open the patient&apos;s profile</li>
        <li>Go to the Documents tab</li>
        <li>Click &quot;Upload Document&quot;</li>
        <li>Select the document type</li>
        <li>Drag and drop or browse for the file</li>
        <li>Add any notes (optional)</li>
        <li>Click Save</li>
      </ol>

      <h3>Supported File Types</h3>
      <ul>
        <li><strong>Images</strong> &mdash; JPG, PNG, HEIC</li>
        <li><strong>Documents</strong> &mdash; PDF</li>
        <li><strong>Size limit</strong> &mdash; 10MB per file</li>
      </ul>

      <h2 id="organizing">Organizing Documents</h2>
      <p>
        Documents are automatically organized by:
      </p>
      <ul>
        <li><strong>Type</strong> &mdash; Consents, Medical History, Photos, etc.</li>
        <li><strong>Date</strong> &mdash; Most recent first</li>
        <li><strong>Treatment</strong> &mdash; Linked to specific appointments</li>
      </ul>

      <h2 id="viewing">Viewing &amp; Downloading</h2>
      <ul>
        <li><strong>Preview</strong> &mdash; Click any document to view it</li>
        <li><strong>Download</strong> &mdash; Save a copy to your computer</li>
        <li><strong>Print</strong> &mdash; Print directly from the preview</li>
      </ul>

      <Callout type="tip" title="Quick Consent Check">
        Before starting a treatment, quickly verify the consent is signed by checking
        the Documents tab. It&apos;s faster than asking &quot;did you sign everything?&quot;
      </Callout>

      <h2 id="security">Security Features</h2>
      <ul>
        <li><strong>Encryption</strong> &mdash; Documents encrypted at rest and in transit</li>
        <li><strong>Access logging</strong> &mdash; Every view is recorded</li>
        <li><strong>Role-based access</strong> &mdash; Only authorized users can see documents</li>
        <li><strong>Automatic backups</strong> &mdash; Documents are backed up daily</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/patients/profiles" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Patient Profiles</h3>
          <p className="text-sm text-gray-500">Complete patient records</p>
        </Link>
        <Link href="/features/charting/photos" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Photo Documentation</h3>
          <p className="text-sm text-gray-500">Before/after photos</p>
        </Link>
      </div>
    </div>
  )
}
