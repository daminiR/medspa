import { Callout } from '@/components/docs/Callout'
import { FileText } from 'lucide-react'

export default function FormsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <FileText className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <FileText className="w-3 h-3" /> Forms API
        </span>
      </div>
      <h1>Forms &amp; Consents API</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Manage digital forms and consent documents with the Forms API. Create custom intake forms,
        collect electronic signatures, and track consent status for patient treatments.
      </p>

      <h2 id="overview">Overview</h2>
      <p>
        The Forms API enables you to create and manage digital forms for patient intake, consent collection,
        and treatment authorization. Forms can be sent to patients electronically, completed on tablets,
        or integrated into your patient portal.
      </p>

      <Callout type="info" title="Authentication Required">
        All Forms API endpoints require authentication. Form templates may require admin permissions
        to create or modify.
      </Callout>

      <h2 id="form-templates">Form Templates</h2>

      <h3>List Form Templates</h3>
      <p>
        Retrieve available form templates for your organization.
      </p>

      <h4>Endpoint</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/forms/templates</code>
      </pre>

      <h4>Query Parameters</h4>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Parameter</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by type: intake, consent, medical_history, treatment</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">status</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by status: active, archived</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">service_type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by associated service type</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Example Request</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/forms/templates?type=consent&status=active" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h4>Example Response</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": [
    {
      "id": "tmpl_abc123",
      "name": "Botox Treatment Consent",
      "type": "consent",
      "description": "Informed consent for neurotoxin injections",
      "version": "2.1",
      "status": "active",
      "requires_signature": true,
      "requires_witness": false,
      "expiration_days": 365,
      "service_types": ["botox", "dysport", "xeomin"],
      "fields_count": 12,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    },
    {
      "id": "tmpl_def456",
      "name": "New Patient Intake Form",
      "type": "intake",
      "description": "Comprehensive intake form for new patients",
      "version": "1.5",
      "status": "active",
      "requires_signature": true,
      "requires_witness": false,
      "expiration_days": null,
      "service_types": [],
      "fields_count": 35,
      "created_at": "2023-06-15T10:00:00Z",
      "updated_at": "2024-01-10T09:15:00Z"
    }
  ],
  "pagination": {
    "limit": 25,
    "offset": 0,
    "total": 12,
    "has_more": false
  }
}`}</code>
      </pre>

      <h3>Get Form Template</h3>
      <p>
        Retrieve a specific form template with all fields and configuration.
      </p>

      <h4>Endpoint</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/forms/templates/{`{id}`}</code>
      </pre>

      <h4>Example Response</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "tmpl_abc123",
    "name": "Botox Treatment Consent",
    "type": "consent",
    "description": "Informed consent for neurotoxin injections",
    "version": "2.1",
    "status": "active",
    "requires_signature": true,
    "requires_witness": false,
    "expiration_days": 365,
    "service_types": ["botox", "dysport", "xeomin"],
    "sections": [
      {
        "id": "sec_001",
        "title": "Treatment Information",
        "description": "Please review the following treatment information",
        "order": 1,
        "fields": [
          {
            "id": "field_001",
            "type": "paragraph",
            "content": "Neurotoxin injections (Botox, Dysport, Xeomin) are used to reduce the appearance of wrinkles...",
            "order": 1
          },
          {
            "id": "field_002",
            "type": "checkbox",
            "label": "I understand the purpose of the treatment",
            "required": true,
            "order": 2
          }
        ]
      },
      {
        "id": "sec_002",
        "title": "Risks and Side Effects",
        "description": "Please review potential risks",
        "order": 2,
        "fields": [
          {
            "id": "field_003",
            "type": "paragraph",
            "content": "Possible side effects include bruising, swelling, headache...",
            "order": 1
          },
          {
            "id": "field_004",
            "type": "checkbox",
            "label": "I understand the risks and potential side effects",
            "required": true,
            "order": 2
          }
        ]
      },
      {
        "id": "sec_003",
        "title": "Patient Acknowledgment",
        "order": 3,
        "fields": [
          {
            "id": "field_005",
            "type": "checkbox",
            "label": "I have had the opportunity to ask questions",
            "required": true,
            "order": 1
          },
          {
            "id": "field_006",
            "type": "signature",
            "label": "Patient Signature",
            "required": true,
            "order": 2
          },
          {
            "id": "field_007",
            "type": "date",
            "label": "Date",
            "required": true,
            "default_value": "today",
            "order": 3
          }
        ]
      }
    ],
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}`}</code>
      </pre>

      <h3>Create Form Template</h3>
      <p>
        Create a new form template. Requires admin permissions.
      </p>

      <h4>Endpoint</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>POST /v1/forms/templates</code>
      </pre>

      <h4>Request Body</h4>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Field</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Required</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">name</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Template name</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">intake, consent, medical_history, treatment</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">sections</td>
              <td className="py-3 px-4 text-gray-600">array</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Array of form sections with fields</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">requires_signature</td>
              <td className="py-3 px-4 text-gray-600">boolean</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Whether signature is required</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">expiration_days</td>
              <td className="py-3 px-4 text-gray-600">integer</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Days until consent expires</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="form-submissions">Form Submissions</h2>

      <h3>List Form Submissions</h3>
      <p>
        Retrieve completed form submissions for a patient or organization.
      </p>

      <h4>Endpoint</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/forms/submissions</code>
      </pre>

      <h4>Query Parameters</h4>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Parameter</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">patient_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by patient</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">template_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by form template</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">status</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">pending, completed, expired</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by form type</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Example Request</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/forms/submissions?patient_id=pat_xyz789&status=completed" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h4>Example Response</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": [
    {
      "id": "sub_abc123",
      "template_id": "tmpl_abc123",
      "template_name": "Botox Treatment Consent",
      "patient_id": "pat_xyz789",
      "patient_name": "John Doe",
      "status": "completed",
      "type": "consent",
      "signed_at": "2024-01-15T13:30:00Z",
      "expires_at": "2025-01-15T13:30:00Z",
      "is_expired": false,
      "appointment_id": "apt_def456",
      "completed_at": "2024-01-15T13:30:00Z",
      "created_at": "2024-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "limit": 25,
    "offset": 0,
    "total": 8,
    "has_more": false
  }
}`}</code>
      </pre>

      <h3>Get Form Submission</h3>
      <p>
        Retrieve a specific form submission with all responses.
      </p>

      <h4>Endpoint</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/forms/submissions/{`{id}`}</code>
      </pre>

      <h4>Example Response</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "sub_abc123",
    "template_id": "tmpl_abc123",
    "template_name": "Botox Treatment Consent",
    "template_version": "2.1",
    "patient_id": "pat_xyz789",
    "patient_name": "John Doe",
    "status": "completed",
    "type": "consent",
    "responses": [
      {
        "field_id": "field_002",
        "field_label": "I understand the purpose of the treatment",
        "value": true
      },
      {
        "field_id": "field_004",
        "field_label": "I understand the risks and potential side effects",
        "value": true
      },
      {
        "field_id": "field_005",
        "field_label": "I have had the opportunity to ask questions",
        "value": true
      },
      {
        "field_id": "field_006",
        "field_label": "Patient Signature",
        "value": "https://cdn.luxemedspa.com/signatures/sig_xyz789.png",
        "type": "signature"
      },
      {
        "field_id": "field_007",
        "field_label": "Date",
        "value": "2024-01-15"
      }
    ],
    "signature": {
      "url": "https://cdn.luxemedspa.com/signatures/sig_xyz789.png",
      "signed_at": "2024-01-15T13:30:00Z",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0..."
    },
    "witness": null,
    "pdf_url": "https://cdn.luxemedspa.com/forms/sub_abc123.pdf",
    "signed_at": "2024-01-15T13:30:00Z",
    "expires_at": "2025-01-15T13:30:00Z",
    "is_expired": false,
    "appointment_id": "apt_def456",
    "treatment_id": "trt_ghi789",
    "completed_at": "2024-01-15T13:30:00Z",
    "created_at": "2024-01-15T12:00:00Z"
  }
}`}</code>
      </pre>

      <h3>Send Form to Patient</h3>
      <p>
        Send a form request to a patient via email or SMS.
      </p>

      <h4>Endpoint</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>POST /v1/forms/send</code>
      </pre>

      <h4>Request Body</h4>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Field</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Required</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">template_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Form template ID</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">patient_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Patient ID</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">delivery_method</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">email, sms, or both</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">appointment_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Associated appointment</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">due_date</td>
              <td className="py-3 px-4 text-gray-600">date</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Form completion deadline</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Example Request</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X POST "https://api.luxemedspa.com/v1/forms/send" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "tmpl_abc123",
    "patient_id": "pat_xyz789",
    "delivery_method": "email",
    "appointment_id": "apt_def456",
    "due_date": "2024-01-14"
  }'`}</code>
      </pre>

      <h4>Example Response</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "submission_id": "sub_new123",
    "form_url": "https://forms.luxemedspa.com/s/sub_new123?token=...",
    "sent_to": "john.doe@example.com",
    "delivery_method": "email",
    "status": "pending",
    "due_date": "2024-01-14",
    "expires_at": "2024-01-21T12:00:00Z"
  }
}`}</code>
      </pre>

      <Callout type="tip" title="Pre-Appointment Forms">
        Send consent forms before appointments to save time during check-in.
        The appointment_id links the form to the visit automatically.
      </Callout>

      <h3>Submit Form</h3>
      <p>
        Submit a completed form with responses. This is typically used for in-office tablet submissions.
      </p>

      <h4>Endpoint</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>POST /v1/forms/submissions</code>
      </pre>

      <h4>Request Body</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "template_id": "tmpl_abc123",
  "patient_id": "pat_xyz789",
  "appointment_id": "apt_def456",
  "responses": [
    {
      "field_id": "field_002",
      "value": true
    },
    {
      "field_id": "field_004",
      "value": true
    },
    {
      "field_id": "field_005",
      "value": true
    },
    {
      "field_id": "field_006",
      "value": "data:image/png;base64,..."
    },
    {
      "field_id": "field_007",
      "value": "2024-01-15"
    }
  ]
}`}</code>
      </pre>

      <h4>Example Response</h4>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "sub_new456",
    "status": "completed",
    "signed_at": "2024-01-15T13:30:00Z",
    "expires_at": "2025-01-15T13:30:00Z",
    "pdf_url": "https://cdn.luxemedspa.com/forms/sub_new456.pdf"
  }
}`}</code>
      </pre>

      <h2 id="check-consent">Check Consent Status</h2>
      <p>
        Check if a patient has valid consent for a specific treatment type.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/forms/consent-status</code>
      </pre>

      <h3>Query Parameters</h3>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Parameter</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">patient_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Patient ID (required)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">service_type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Service type to check consent for</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/forms/consent-status?patient_id=pat_xyz789&service_type=botox" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "patient_id": "pat_xyz789",
    "service_type": "botox",
    "has_valid_consent": true,
    "consent_details": {
      "submission_id": "sub_abc123",
      "template_name": "Botox Treatment Consent",
      "signed_at": "2024-01-15T13:30:00Z",
      "expires_at": "2025-01-15T13:30:00Z",
      "days_until_expiration": 350
    },
    "other_consents": [
      {
        "service_type": "filler",
        "has_valid_consent": false,
        "last_signed": "2023-01-10T10:00:00Z",
        "expired_at": "2024-01-10T10:00:00Z"
      }
    ]
  }
}`}</code>
      </pre>

      <Callout type="warning" title="Consent Verification">
        Always verify consent status before performing treatments. The API returns
        expired consent information to help identify forms that need renewal.
      </Callout>

      <h2 id="download-pdf">Download Form PDF</h2>
      <p>
        Download a completed form as a signed PDF document.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/forms/submissions/{`{id}`}/pdf</code>
      </pre>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/forms/submissions/sub_abc123/pdf" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -o consent_form.pdf`}</code>
      </pre>

      <h2 id="data-types">Key Data Types</h2>

      <h3>Form Field Types</h3>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Value Format</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">text</td>
              <td className="py-3 px-4 text-gray-600">Single-line text input</td>
              <td className="py-3 px-4 text-gray-600">string</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">textarea</td>
              <td className="py-3 px-4 text-gray-600">Multi-line text input</td>
              <td className="py-3 px-4 text-gray-600">string</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">checkbox</td>
              <td className="py-3 px-4 text-gray-600">Boolean checkbox</td>
              <td className="py-3 px-4 text-gray-600">boolean</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">select</td>
              <td className="py-3 px-4 text-gray-600">Dropdown selection</td>
              <td className="py-3 px-4 text-gray-600">string</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">date</td>
              <td className="py-3 px-4 text-gray-600">Date picker</td>
              <td className="py-3 px-4 text-gray-600">YYYY-MM-DD</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">signature</td>
              <td className="py-3 px-4 text-gray-600">Electronic signature</td>
              <td className="py-3 px-4 text-gray-600">base64 or URL</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">paragraph</td>
              <td className="py-3 px-4 text-gray-600">Display-only text</td>
              <td className="py-3 px-4 text-gray-600">null (read-only)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Submission Status</h3>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">pending</td>
              <td className="py-3 px-4 text-gray-600">Form sent but not yet completed</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">completed</td>
              <td className="py-3 px-4 text-gray-600">Form completed and signed</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">expired</td>
              <td className="py-3 px-4 text-gray-600">Consent has expired (needs renewal)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="errors">Error Codes</h2>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Code</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">TEMPLATE_NOT_FOUND</td>
              <td className="py-3 px-4 text-gray-600">404</td>
              <td className="py-3 px-4 text-gray-600">Form template does not exist</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">SUBMISSION_NOT_FOUND</td>
              <td className="py-3 px-4 text-gray-600">404</td>
              <td className="py-3 px-4 text-gray-600">Form submission does not exist</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">REQUIRED_FIELD_MISSING</td>
              <td className="py-3 px-4 text-gray-600">400</td>
              <td className="py-3 px-4 text-gray-600">Required field not provided</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">SIGNATURE_REQUIRED</td>
              <td className="py-3 px-4 text-gray-600">400</td>
              <td className="py-3 px-4 text-gray-600">Form requires signature to submit</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">FORM_ALREADY_SUBMITTED</td>
              <td className="py-3 px-4 text-gray-600">400</td>
              <td className="py-3 px-4 text-gray-600">Form has already been completed</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">FORM_LINK_EXPIRED</td>
              <td className="py-3 px-4 text-gray-600">410</td>
              <td className="py-3 px-4 text-gray-600">Form link has expired</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="info" title="Audit Trail">
        All form submissions are logged with timestamps, IP addresses, and user agents
        for compliance and audit purposes. Completed forms cannot be deleted.
      </Callout>
    </div>
  )
}
