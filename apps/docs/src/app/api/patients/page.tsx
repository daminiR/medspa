import { Callout } from '@/components/docs/Callout'
import { Users } from 'lucide-react'

export default function PatientsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Users className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Users className="w-3 h-3" /> Patients API
        </span>
      </div>
      <h1>Patients API</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Manage patient data with the Patients API. Create patient records, update contact information,
        and retrieve patient details.
      </p>

      <h2 id="list-patients">List Patients</h2>
      <p>
        Retrieve a paginated list of patients with optional filtering and sorting.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/patients</code>
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
              <td className="py-3 px-4 font-mono text-gray-700">search</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Search by name, email, or phone number</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">status</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by status: active, inactive, archived</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">created_since</td>
              <td className="py-3 px-4 text-gray-600">date</td>
              <td className="py-3 px-4 text-gray-600">Filter patients created since date (ISO 8601)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">sort</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Sort field: name:asc, created:desc, last_visit:desc</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/patients?status=active&limit=25" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": [
    {
      "id": "pat_xyz789",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1 (555) 123-4567",
      "date_of_birth": "1985-06-15",
      "status": "active",
      "address": {
        "street": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "postal_code": "94102",
        "country": "US"
      },
      "last_appointment": "2024-01-10T14:00:00Z",
      "total_appointments": 12,
      "lifetime_value": 2450.00,
      "created_at": "2023-06-01T10:30:00Z",
      "updated_at": "2024-01-10T14:30:00Z"
    }
  ],
  "pagination": {
    "limit": 25,
    "offset": 0,
    "total": 487,
    "has_more": true
  }
}`}</code>
      </pre>

      <h2 id="get-patient">Get Patient</h2>
      <p>
        Retrieve a specific patient by ID.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/patients/{`{id}`}</code>
      </pre>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/patients/pat_xyz789" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "pat_xyz789",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 123-4567",
    "date_of_birth": "1985-06-15",
    "status": "active",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94102",
      "country": "US"
    },
    "emergency_contact": {
      "name": "Jane Doe",
      "phone": "+1 (555) 123-4568",
      "relationship": "Spouse"
    },
    "medical_history": {
      "allergies": "Penicillin",
      "medications": "Lisinopril",
      "previous_treatments": ["Botox", "Dermal Fillers"]
    },
    "preferences": {
      "preferred_provider": "prov_def456",
      "preferred_time": "afternoon",
      "communication_method": "email"
    },
    "last_appointment": "2024-01-10T14:00:00Z",
    "total_appointments": 12,
    "lifetime_value": 2450.00,
    "tags": ["VIP", "Referral"],
    "created_at": "2023-06-01T10:30:00Z",
    "updated_at": "2024-01-10T14:30:00Z"
  }
}`}</code>
      </pre>

      <h2 id="create-patient">Create Patient</h2>
      <p>
        Create a new patient record.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>POST /v1/patients</code>
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
              <td className="py-3 px-4 font-mono text-gray-700">first_name</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Patient's first name</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">last_name</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Patient's last name</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">email</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Patient's email address (must be unique)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">phone</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Patient's phone number</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">date_of_birth</td>
              <td className="py-3 px-4 text-gray-600">date</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Patient's date of birth (YYYY-MM-DD)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">address</td>
              <td className="py-3 px-4 text-gray-600">object</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Patient's address (street, city, state, postal_code, country)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">medical_history</td>
              <td className="py-3 px-4 text-gray-600">object</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Medical information (allergies, medications)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">tags</td>
              <td className="py-3 px-4 text-gray-600">array</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Patient tags for categorization</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X POST "https://api.luxemedspa.com/v1/patients" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1 (555) 987-6543",
    "date_of_birth": "1990-03-20",
    "address": {
      "street": "456 Oak Ave",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94103",
      "country": "US"
    },
    "medical_history": {
      "allergies": "Latex"
    },
    "tags": ["New Patient", "Referral"]
  }'`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "pat_new456",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1 (555) 987-6543",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}`}</code>
      </pre>

      <Callout type="info">
        Email addresses must be unique. The API will return a 409 Conflict error if you try to create
        a patient with an email that already exists.
      </Callout>

      <h2 id="update-patient">Update Patient</h2>
      <p>
        Update an existing patient's information. Only non-null fields are updated.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>PUT /v1/patients/{`{id}`}</code>
      </pre>

      <h3>Request Body</h3>
      <p>
        Same fields as Create Patient. All fields are optional.
      </p>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X PUT "https://api.luxemedspa.com/v1/patients/pat_xyz789" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "+1 (555) 123-5555",
    "medical_history": {
      "allergies": "Penicillin, Latex"
    }
  }'`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "pat_xyz789",
    "phone": "+1 (555) 123-5555",
    "medical_history": {
      "allergies": "Penicillin, Latex"
    },
    "updated_at": "2024-01-15T11:45:00Z"
  }
}`}</code>
      </pre>

      <h2 id="archive-patient">Archive Patient</h2>
      <p>
        Archive a patient record instead of permanently deleting it.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>DELETE /v1/patients/{`{id}`}</code>
      </pre>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X DELETE "https://api.luxemedspa.com/v1/patients/pat_xyz789" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "pat_xyz789",
    "status": "archived",
    "archived_at": "2024-01-15T12:00:00Z"
  }
}`}</code>
      </pre>

      <h2 id="patient-history">Get Patient History</h2>
      <p>
        Retrieve appointment and service history for a patient.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/patients/{`{id}`}/history</code>
      </pre>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/patients/pat_xyz789/history?limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "patient_id": "pat_xyz789",
    "appointments": [
      {
        "id": "apt_abc123",
        "service": "Botox Injection",
        "date": "2024-01-10T14:00:00Z",
        "status": "completed",
        "provider": "Dr. Sarah Smith"
      }
    ],
    "services": [
      {
        "name": "Botox Injection",
        "count": 5,
        "last_date": "2024-01-10T14:00:00Z"
      }
    ],
    "payments": [
      {
        "id": "pay_xyz789",
        "amount": 250.00,
        "date": "2024-01-10T14:30:00Z",
        "method": "credit_card"
      }
    ]
  }
}`}</code>
      </pre>

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
              <td className="py-3 px-4 font-mono text-gray-700">INVALID_PARAMETER</td>
              <td className="py-3 px-4 text-gray-600">400</td>
              <td className="py-3 px-4 text-gray-600">Required field missing or invalid</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">DUPLICATE_EMAIL</td>
              <td className="py-3 px-4 text-gray-600">409</td>
              <td className="py-3 px-4 text-gray-600">Email address already exists</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">PATIENT_NOT_FOUND</td>
              <td className="py-3 px-4 text-gray-600">404</td>
              <td className="py-3 px-4 text-gray-600">Patient doesn't exist</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">INVALID_EMAIL</td>
              <td className="py-3 px-4 text-gray-600">400</td>
              <td className="py-3 px-4 text-gray-600">Email address format is invalid</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="warning" title="HIPAA Compliance">
        Patient data is protected under HIPAA. Ensure your integration complies with HIPAA regulations
        when storing or transmitting patient information.
      </Callout>
    </div>
  )
}
