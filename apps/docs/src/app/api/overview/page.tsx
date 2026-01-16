import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Code, Globe, Calendar, Users, Syringe, Camera, FileText, Webhook, Lock } from 'lucide-react'

export default function APIOverviewPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Code className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Globe className="w-3 h-3" /> API Reference
        </span>
      </div>
      <h1>API Overview</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        The Luxe MedSpa API provides programmatic access to your medical spa management platform.
        Build custom integrations, automate workflows, and extend functionality with our comprehensive REST API.
      </p>

      <h2 id="available-apis">Available APIs</h2>
      <p>
        Explore our comprehensive API endpoints organized by functional area:
      </p>

      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <Link href="/api/appointments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Appointments API</h3>
          </div>
          <p className="text-sm text-gray-500">Schedule, update, and manage patient appointments</p>
        </Link>
        <Link href="/api/patients" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Patients API</h3>
          </div>
          <p className="text-sm text-gray-500">Create and manage patient records and profiles</p>
        </Link>
        <Link href="/api/treatments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Syringe className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Treatments API</h3>
          </div>
          <p className="text-sm text-gray-500">Document treatments, SOAP notes, and injectable usage</p>
        </Link>
        <Link href="/api/photos" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Photos API</h3>
          </div>
          <p className="text-sm text-gray-500">Upload and manage clinical before/after photos</p>
        </Link>
        <Link href="/api/forms" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Forms &amp; Consents API</h3>
          </div>
          <p className="text-sm text-gray-500">Digital forms, consent collection, and e-signatures</p>
        </Link>
        <Link href="/api/webhooks" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Webhook className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Webhooks</h3>
          </div>
          <p className="text-sm text-gray-500">Real-time event notifications and callbacks</p>
        </Link>
        <Link href="/api/authentication" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Authentication</h3>
          </div>
          <p className="text-sm text-gray-500">API keys, OAuth, and security best practices</p>
        </Link>
      </div>

      <h2 id="base-url">Base URL</h2>
      <p>
        All API requests should be made to:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>https://api.luxemedspa.com/v1</code>
      </pre>

      <p>
        The API uses standard HTTP methods (GET, POST, PUT, DELETE) and returns JSON responses for all endpoints.
      </p>

      <h2 id="authentication">Authentication</h2>
      <p>
        All API requests require authentication using an API key or OAuth token. There are two ways to authenticate:
      </p>

      <h3>API Key Authentication</h3>
      <p>
        Include your API key in the <code>Authorization</code> header:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
      </pre>

      <h3>OAuth Token</h3>
      <p>
        For user-facing applications, use OAuth 2.0:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`Authorization: Bearer YOUR_ACCESS_TOKEN`}</code>
      </pre>

      <Callout type="warning">
        Never expose API keys in client-side code. Always keep them secret and rotate them regularly.
        See the <strong>Authentication</strong> section for detailed setup instructions.
      </Callout>

      <h2 id="rate-limits">Rate Limits</h2>
      <p>
        API rate limits are enforced to ensure fair usage and maintain service stability:
      </p>

      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Plan</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Requests/Min</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Requests/Day</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Burst</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700">Free</td>
              <td className="py-3 px-4 text-gray-600">10</td>
              <td className="py-3 px-4 text-gray-600">1,000</td>
              <td className="py-3 px-4 text-gray-600">20</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700">Professional</td>
              <td className="py-3 px-4 text-gray-600">100</td>
              <td className="py-3 px-4 text-gray-600">10,000</td>
              <td className="py-3 px-4 text-gray-600">200</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700">Enterprise</td>
              <td className="py-3 px-4 text-gray-600">1,000</td>
              <td className="py-3 px-4 text-gray-600">Unlimited</td>
              <td className="py-3 px-4 text-gray-600">Unlimited</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Rate limit information is included in response headers:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1640123456`}</code>
      </pre>

      <Callout type="info">
        When you exceed rate limits, you'll receive a <code>429 Too Many Requests</code> response.
        The <code>Retry-After</code> header indicates how long to wait before retrying.
      </Callout>

      <h2 id="response-format">Response Format</h2>
      <p>
        All API responses are JSON. Successful responses include the data and pagination info:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": { /* resource data */ },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_abc123def456"
  }
}`}</code>
      </pre>

      <h2 id="error-handling">Error Handling</h2>
      <p>
        Errors follow a consistent format with status codes and error details:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Patient ID is required",
    "details": {
      "field": "patient_id",
      "reason": "required"
    }
  }
}`}</code>
      </pre>

      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Common HTTP Status Codes</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Meaning</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700 font-mono">200</td>
              <td className="py-3 px-4 text-gray-600">OK</td>
              <td className="py-3 px-4 text-gray-600">Request succeeded</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700 font-mono">201</td>
              <td className="py-3 px-4 text-gray-600">Created</td>
              <td className="py-3 px-4 text-gray-600">Resource created successfully</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700 font-mono">400</td>
              <td className="py-3 px-4 text-gray-600">Bad Request</td>
              <td className="py-3 px-4 text-gray-600">Invalid request parameters</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700 font-mono">401</td>
              <td className="py-3 px-4 text-gray-600">Unauthorized</td>
              <td className="py-3 px-4 text-gray-600">Missing or invalid authentication</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700 font-mono">403</td>
              <td className="py-3 px-4 text-gray-600">Forbidden</td>
              <td className="py-3 px-4 text-gray-600">Not authorized for this resource</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700 font-mono">404</td>
              <td className="py-3 px-4 text-gray-600">Not Found</td>
              <td className="py-3 px-4 text-gray-600">Resource does not exist</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 text-gray-700 font-mono">429</td>
              <td className="py-3 px-4 text-gray-600">Too Many Requests</td>
              <td className="py-3 px-4 text-gray-600">Rate limit exceeded</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-gray-700 font-mono">500</td>
              <td className="py-3 px-4 text-gray-600">Server Error</td>
              <td className="py-3 px-4 text-gray-600">Internal server error</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="pagination">Pagination</h2>
      <p>
        List endpoints support pagination using <code>limit</code> and <code>offset</code> parameters:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`GET /v1/appointments?limit=25&offset=50`}</code>
      </pre>

      <p>
        The response includes pagination metadata:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "success": true,
  "data": [ /* appointments array */ ],
  "pagination": {
    "limit": 25,
    "offset": 50,
    "total": 247,
    "has_more": true
  }
}`}</code>
      </pre>

      <h2 id="filtering">Filtering & Sorting</h2>
      <p>
        Many endpoints support filtering and sorting:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`GET /v1/appointments?status=completed&start_date=2024-01-01&sort=date:desc`}</code>
      </pre>

      <Callout type="tip">
        Check individual endpoint documentation for supported filters and sort parameters.
      </Callout>

      <h2 id="webhooks">Webhooks</h2>
      <p>
        Subscribe to real-time events using webhooks. Configure endpoints to receive notifications
        when appointments are created, patients are updated, or payments are processed.
      </p>
      <p>
        See the <strong>Webhooks</strong> section for complete documentation.
      </p>

      <h2 id="code-examples">Code Examples</h2>
      <p>
        Example API calls in different languages:
      </p>

      <h3>JavaScript/Node.js</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`const response = await fetch('https://api.luxemedspa.com/v1/appointments', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`}</code>
      </pre>

      <h3>Python</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.luxemedspa.com/v1/appointments',
    headers=headers
)

print(response.json())`}</code>
      </pre>

      <h3>cURL</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET https://api.luxemedspa.com/v1/appointments \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
      </pre>

      <h2 id="support">Support</h2>
      <p>
        Need help with the API? Contact our support team:
      </p>
      <ul>
        <li><strong>Email:</strong> api-support@luxemedspa.com</li>
        <li><strong>Status Page:</strong> status.luxemedspa.com</li>
        <li><strong>Issues:</strong> GitHub Issues (for SDK users)</li>
      </ul>
    </div>
  )
}
