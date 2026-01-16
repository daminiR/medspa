import { Callout } from '@/components/docs/Callout'
import { Calendar } from 'lucide-react'

export default function AppointmentsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Calendar className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Calendar className="w-3 h-3" /> Appointments API
        </span>
      </div>
      <h1>Appointments API</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Manage appointments with the Appointments API. Create, retrieve, update, and delete appointments
        for your medical spa patients.
      </p>

      <h2 id="list-appointments">List Appointments</h2>
      <p>
        Retrieve a paginated list of appointments with optional filtering and sorting.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/appointments</code>
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
              <td className="py-3 px-4 font-mono text-gray-700">status</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Filter by status: scheduled, completed, cancelled, no-show</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">start_date</td>
              <td className="py-3 px-4 text-gray-600">date</td>
              <td className="py-3 px-4 text-gray-600">Filter appointments from this date (ISO 8601)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">end_date</td>
              <td className="py-3 px-4 text-gray-600">date</td>
              <td className="py-3 px-4 text-gray-600">Filter appointments until this date (ISO 8601)</td>
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
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">sort</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Sort field and direction: date:asc, date:desc, created:desc</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/appointments?status=scheduled&start_date=2024-01-15&limit=25" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": [
    {
      "id": "apt_abc123",
      "patient_id": "pat_xyz789",
      "patient_name": "John Doe",
      "provider_id": "prov_def456",
      "provider_name": "Dr. Sarah Smith",
      "service": "Botox Injection",
      "status": "scheduled",
      "start_time": "2024-01-15T14:00:00Z",
      "end_time": "2024-01-15T14:30:00Z",
      "duration_minutes": 30,
      "notes": "Patient mentioned sensitivity",
      "created_at": "2024-01-10T10:30:00Z",
      "updated_at": "2024-01-10T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 25,
    "offset": 0,
    "total": 156,
    "has_more": true
  }
}`}</code>
      </pre>

      <h2 id="get-appointment">Get Appointment</h2>
      <p>
        Retrieve a specific appointment by ID.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/appointments/{`{id}`}</code>
      </pre>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET "https://api.luxemedspa.com/v1/appointments/apt_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "apt_abc123",
    "patient_id": "pat_xyz789",
    "patient_name": "John Doe",
    "provider_id": "prov_def456",
    "provider_name": "Dr. Sarah Smith",
    "service": "Botox Injection",
    "status": "scheduled",
    "start_time": "2024-01-15T14:00:00Z",
    "end_time": "2024-01-15T14:30:00Z",
    "duration_minutes": 30,
    "location": "Treatment Room 2",
    "notes": "Patient mentioned sensitivity",
    "custom_fields": {
      "sensitivity_level": "high"
    },
    "created_at": "2024-01-10T10:30:00Z",
    "updated_at": "2024-01-10T10:30:00Z"
  }
}`}</code>
      </pre>

      <h2 id="create-appointment">Create Appointment</h2>
      <p>
        Create a new appointment for a patient.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>POST /v1/appointments</code>
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
              <td className="py-3 px-4 text-gray-600">ID of the provider</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">service</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Service name or ID</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">start_time</td>
              <td className="py-3 px-4 text-gray-600">datetime</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Appointment start time (ISO 8601)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">end_time</td>
              <td className="py-3 px-4 text-gray-600">datetime</td>
              <td className="py-3 px-4 text-gray-600">Yes</td>
              <td className="py-3 px-4 text-gray-600">Appointment end time (ISO 8601)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">notes</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Additional notes for the appointment</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">location</td>
              <td className="py-3 px-4 text-gray-600">string</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Treatment room or location</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">custom_fields</td>
              <td className="py-3 px-4 text-gray-600">object</td>
              <td className="py-3 px-4 text-gray-600">No</td>
              <td className="py-3 px-4 text-gray-600">Custom fields for your workflow</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X POST "https://api.luxemedspa.com/v1/appointments" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "patient_id": "pat_xyz789",
    "provider_id": "prov_def456",
    "service": "Botox Injection",
    "start_time": "2024-01-15T14:00:00Z",
    "end_time": "2024-01-15T14:30:00Z",
    "notes": "Patient mentioned sensitivity",
    "location": "Treatment Room 2"
  }'`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "apt_abc123",
    "patient_id": "pat_xyz789",
    "provider_id": "prov_def456",
    "service": "Botox Injection",
    "status": "scheduled",
    "start_time": "2024-01-15T14:00:00Z",
    "end_time": "2024-01-15T14:30:00Z",
    "duration_minutes": 30,
    "created_at": "2024-01-10T10:30:00Z"
  }
}`}</code>
      </pre>

      <Callout type="warning">
        Ensure the appointment doesn't conflict with existing appointments for the provider.
        The API will return a 409 Conflict error if there are scheduling conflicts.
      </Callout>

      <h2 id="update-appointment">Update Appointment</h2>
      <p>
        Update an existing appointment. Only non-null fields are updated.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>PUT /v1/appointments/{`{id}`}</code>
      </pre>

      <h3>Request Body</h3>
      <p>
        Same fields as Create Appointment. All fields are optional.
      </p>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X PUT "https://api.luxemedspa.com/v1/appointments/apt_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "completed",
    "notes": "Treatment completed successfully"
  }'`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "apt_abc123",
    "status": "completed",
    "notes": "Treatment completed successfully",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}`}</code>
      </pre>

      <h2 id="delete-appointment">Delete Appointment</h2>
      <p>
        Cancel or delete an appointment.
      </p>

      <h3>Endpoint</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>DELETE /v1/appointments/{`{id}`}</code>
      </pre>

      <h3>Example Request</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X DELETE "https://api.luxemedspa.com/v1/appointments/apt_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
      </pre>

      <h3>Example Response</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": {
    "id": "apt_abc123",
    "status": "cancelled",
    "deleted_at": "2024-01-15T14:45:00Z"
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
              <td className="py-3 px-4 font-mono text-gray-700">APPOINTMENT_NOT_FOUND</td>
              <td className="py-3 px-4 text-gray-600">404</td>
              <td className="py-3 px-4 text-gray-600">Appointment doesn't exist</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">SCHEDULING_CONFLICT</td>
              <td className="py-3 px-4 text-gray-600">409</td>
              <td className="py-3 px-4 text-gray-600">Appointment conflicts with existing appointment</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">INVALID_TIME_RANGE</td>
              <td className="py-3 px-4 text-gray-600">400</td>
              <td className="py-3 px-4 text-gray-600">End time must be after start time</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="tip">
        Use webhooks to receive real-time notifications when appointments are created, updated, or deleted.
      </Callout>
    </div>
  )
}
