import { Callout } from '@/components/docs/Callout'
import { Syringe } from 'lucide-react'

export default function TreatmentsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Syringe className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Syringe className="w-3 h-3" /> Treatments API
        </span>
      </div>
      <h1>Treatments API</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Manage treatment records and clinical documentation with the Treatments API. Record injectable usage,
        track SOAP notes, and maintain complete treatment histories for patients.
      </p>

      <h2 id="overview">Overview</h2>
      <p>
        The Treatments API provides endpoints for creating and managing clinical treatment records.
        Each treatment record can include SOAP notes, injectable products used, treatment areas,
        and associated clinical data.
      </p>

      <Callout type="info" title="Authentication Required">
        All Treatments API endpoints require authentication with appropriate clinical permissions.
        See the <strong>Authentication</strong> section for details on obtaining API credentials with clinical access.
      </Callout>

      <h2 id="list-treatments">List Treatments</h2>
      <p>
        Retrieve a paginated list of treatment records with optional filtering.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/treatments</code>
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
              <td className="py-3 px-4 font-mono text-gray-700">limit</td>
              <td className="py-3 px-4 text-gray-600">integer</td>
              <td className="py-3 px-4 text-gray-600">Max results per page (default: 25, max: 100)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">offset</td>
              <td className="py-3 px-4 text-gray-600">integer</td>
              <td className="py-3 px-4 text-gray-600">Number of results to skip (default: 0)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">patient_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by patient</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">provider_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by provider</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">treatment_type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by type: injectable, facial, laser, body</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">status</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by status: in_progress, completed, signed</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">start_date</td>
              <td className="py-3 px-4 text-gray-600">date</td>
              <td className="py-3 px-4 text-gray-600">Filter treatments from this date (ISO 8601)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">end_date</td>
              <td className="py-3 px-4 text-gray-600">date</td>
              <td className="py-3 px-4 text-gray-600">Filter treatments until this date (ISO 8601)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/treatments?patient_id=pat_xyz789&status=completed&limit=25" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": [
    {
      "id": "trt_abc123",
      "appointment_id": "apt_def456",
      "patient_id": "pat_xyz789",
      "patient_name": "John Doe",
      "provider_id": "prov_ghi789",
      "provider_name": "Dr. Sarah Smith",
      "treatment_type": "injectable",
      "service_name": "Botox Treatment",
      "status": "completed",
      "treatment_date": "2024-01-15T14:00:00Z",
      "products_used": [
        {
          "product_name": "Botox Cosmetic",
          "units": 40,
          "lot_number": "LOT123456",
          "expiration_date": "2025-06-15"
        }
      ],
      "created_at": "2024-01-15T14:00:00Z",
      "updated_at": "2024-01-15T15:30:00Z"
    }
  ],
  "pagination": {
    "limit": 25,
    "offset": 0,
    "total": 45,
    "has_more": true
  }
}`}</code>
      </pre>

      <h2 id="get-treatment">Get Treatment</h2>
      <p>
        Retrieve a specific treatment record by ID with full details.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/treatments/{`{id}`}</code>
      </pre>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/treatments/trt_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "trt_abc123",
    "appointment_id": "apt_def456",
    "patient_id": "pat_xyz789",
    "patient_name": "John Doe",
    "provider_id": "prov_ghi789",
    "provider_name": "Dr. Sarah Smith",
    "treatment_type": "injectable",
    "service_name": "Botox Treatment",
    "status": "signed",
    "treatment_date": "2024-01-15T14:00:00Z",
    "soap_notes": {
      "subjective": "Patient presents for treatment of dynamic forehead lines and glabellar complex. Reports satisfaction with previous Botox treatments. No adverse reactions reported.",
      "objective": "Moderate dynamic rhytids observed in the glabellar region and horizontal forehead lines. No signs of infection or contraindications.",
      "assessment": "Good candidate for neurotoxin treatment. Treatment plan discussed and consented.",
      "plan": "Administered Botox Cosmetic as per treatment plan. Post-care instructions provided. Follow-up in 2 weeks."
    },
    "products_used": [
      {
        "id": "prod_123",
        "product_name": "Botox Cosmetic",
        "units": 20,
        "area": "Glabellar Complex",
        "lot_number": "LOT123456",
        "expiration_date": "2025-06-15"
      },
      {
        "id": "prod_124",
        "product_name": "Botox Cosmetic",
        "units": 20,
        "area": "Frontalis",
        "lot_number": "LOT123456",
        "expiration_date": "2025-06-15"
      }
    ],
    "treatment_areas": [
      {
        "area": "Glabellar Complex",
        "injection_points": 5,
        "technique": "Standard 5-point injection"
      },
      {
        "area": "Frontalis",
        "injection_points": 8,
        "technique": "Horizontal distribution"
      }
    ],
    "photos": [
      {
        "id": "photo_abc123",
        "type": "before",
        "url": "https://cdn.luxemedspa.com/photos/photo_abc123.jpg"
      },
      {
        "id": "photo_abc124",
        "type": "after",
        "url": "https://cdn.luxemedspa.com/photos/photo_abc124.jpg"
      }
    ],
    "aftercare_instructions": "Avoid rubbing the treated area for 4 hours. Do not lie down for 4 hours. Avoid strenuous exercise for 24 hours.",
    "follow_up_date": "2024-01-29",
    "signed_at": "2024-01-15T15:45:00Z",
    "signed_by": "prov_ghi789",
    "created_at": "2024-01-15T14:00:00Z",
    "updated_at": "2024-01-15T15:45:00Z"
  }
}`}</code>
      </pre>

      <h2 id="create-treatment">Create Treatment</h2>
      <p>
        Create a new treatment record for a patient appointment.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>POST /v1/treatments</code>
      </pre>

      <h3>Request Body</h3>
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
              <td className="py-3 px-4 font-mono text-gray-700">patient_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">ID of the patient</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">provider_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">ID of the treating provider</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">appointment_id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Associated appointment ID</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">treatment_type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Type: injectable, facial, laser, body</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">service_name</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Name of the service performed</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">soap_notes</td>
              <td className="py-3 px-4 text-gray-600">object</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">SOAP notes object with subjective, objective, assessment, plan</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">products_used</td>
              <td className="py-3 px-4 text-gray-600">array</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Array of products used in treatment</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">aftercare_instructions</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Post-treatment care instructions</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X POST "https://api.luxemedspa.com/v1/treatments" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "patient_id": "pat_xyz789",
    "provider_id": "prov_ghi789",
    "appointment_id": "apt_def456",
    "treatment_type": "injectable",
    "service_name": "Botox Treatment",
    "soap_notes": {
      "subjective": "Patient presents for treatment of forehead lines.",
      "objective": "Moderate dynamic rhytids in frontalis region.",
      "assessment": "Good candidate for neurotoxin treatment.",
      "plan": "Proceed with Botox treatment as discussed."
    },
    "products_used": [
      {
        "product_name": "Botox Cosmetic",
        "units": 40,
        "area": "Forehead",
        "lot_number": "LOT123456",
        "expiration_date": "2025-06-15"
      }
    ]
  }'`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "trt_new789",
    "patient_id": "pat_xyz789",
    "provider_id": "prov_ghi789",
    "treatment_type": "injectable",
    "service_name": "Botox Treatment",
    "status": "in_progress",
    "created_at": "2024-01-15T14:00:00Z"
  }
}`}</code>
      </pre>

      <Callout type="tip" title="Inventory Deduction">
        When you include products_used in a treatment, inventory is automatically deducted.
        Ensure lot numbers and quantities are accurate for compliance tracking.
      </Callout>

      <h2 id="update-treatment">Update Treatment</h2>
      <p>
        Update an existing treatment record. Only non-null fields are updated.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>PUT /v1/treatments/{`{id}`}</code>
      </pre>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X PUT "https://api.luxemedspa.com/v1/treatments/trt_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "soap_notes": {
      "plan": "Treatment completed successfully. Follow-up in 2 weeks."
    },
    "aftercare_instructions": "Avoid rubbing treated areas. No exercise for 24 hours.",
    "follow_up_date": "2024-01-29"
  }'`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "trt_abc123",
    "status": "in_progress",
    "follow_up_date": "2024-01-29",
    "updated_at": "2024-01-15T15:30:00Z"
  }
}`}</code>
      </pre>

      <h2 id="sign-treatment">Sign Treatment</h2>
      <p>
        Sign and lock a treatment record. Once signed, changes require an addendum.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>POST /v1/treatments/{`{id}`}/sign</code>
      </pre>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X POST "https://api.luxemedspa.com/v1/treatments/trt_abc123/sign" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "trt_abc123",
    "status": "signed",
    "signed_at": "2024-01-15T15:45:00Z",
    "signed_by": "prov_ghi789"
  }
}`}</code>
      </pre>

      <Callout type="warning" title="Signed Treatment Records">
        Once signed, treatment records cannot be modified directly. Any corrections must be made
        via the addendum endpoint to maintain audit trail compliance.
      </Callout>

      <h2 id="add-addendum">Add Addendum</h2>
      <p>
        Add an addendum to a signed treatment record for corrections or additional notes.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>POST /v1/treatments/{`{id}`}/addendum</code>
      </pre>

      <h3>Request Body</h3>
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
              <td className="py-3 px-4 font-mono text-gray-700">content</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">The addendum content</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">reason</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Reason for the addendum</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X POST "https://api.luxemedspa.com/v1/treatments/trt_abc123/addendum" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Patient called to report mild bruising at injection site. Advised this is normal and should resolve within 7-10 days.",
    "reason": "Follow-up documentation"
  }'`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "add_xyz789",
    "treatment_id": "trt_abc123",
    "content": "Patient called to report mild bruising at injection site. Advised this is normal and should resolve within 7-10 days.",
    "reason": "Follow-up documentation",
    "created_by": "prov_ghi789",
    "created_at": "2024-01-16T10:30:00Z"
  }
}`}</code>
      </pre>

      <h2 id="data-types">Key Data Types</h2>

      <h3>Treatment Object</h3>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Field</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">id</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Unique treatment identifier</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">treatment_type</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">injectable, facial, laser, body</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">status</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">in_progress, completed, signed</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">soap_notes</td>
              <td className="py-3 px-4 text-gray-600">object</td>
              <td className="py-3 px-4 text-gray-600">SOAP documentation object</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">products_used</td>
              <td className="py-3 px-4 text-gray-600">array</td>
              <td className="py-3 px-4 text-gray-600">Array of ProductUsed objects</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>ProductUsed Object</h3>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Field</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">product_name</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Name of the product</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">units</td>
              <td className="py-3 px-4 text-gray-600">number</td>
              <td className="py-3 px-4 text-gray-600">Units/syringes used</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">area</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Treatment area</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">lot_number</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Product lot number for tracking</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">expiration_date</td>
              <td className="py-3 px-4 text-gray-600">date</td>
              <td className="py-3 px-4 text-gray-600">Product expiration date</td>
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
              <td className="py-3 px-4 font-mono text-gray-700">TREATMENT_NOT_FOUND</td>
              <td className="py-3 px-4 text-gray-600">404</td>
              <td className="py-3 px-4 text-gray-600">Treatment record does not exist</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">TREATMENT_ALREADY_SIGNED</td>
              <td className="py-3 px-4 text-gray-600">400</td>
              <td className="py-3 px-4 text-gray-600">Cannot modify signed treatment</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">INVALID_PRODUCT</td>
              <td className="py-3 px-4 text-gray-600">400</td>
              <td className="py-3 px-4 text-gray-600">Product not found or invalid</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">INSUFFICIENT_INVENTORY</td>
              <td className="py-3 px-4 text-gray-600">400</td>
              <td className="py-3 px-4 text-gray-600">Not enough inventory for deduction</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">CLINICAL_ACCESS_REQUIRED</td>
              <td className="py-3 px-4 text-gray-600">403</td>
              <td className="py-3 px-4 text-gray-600">API key lacks clinical permissions</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="info" title="HIPAA Compliance">
        Treatment records contain PHI and are subject to HIPAA regulations. Ensure your integration
        maintains appropriate security measures and access controls.
      </Callout>
    </div>
  )
}
