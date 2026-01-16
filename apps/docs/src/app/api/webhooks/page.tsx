import { Callout } from '@/components/docs/Callout'
import { Webhook } from 'lucide-react'

export default function WebhooksPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Webhook className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Webhook className="w-3 h-3" /> Webhooks
        </span>
      </div>
      <h1>Webhooks</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Receive real-time notifications when events happen in your medical spa.
        Subscribe to appointment updates, patient changes, and payment events.
      </p>

      <h2 id="overview">Webhook Overview</h2>
      <p>
        Webhooks allow you to receive HTTP POST notifications when events occur in Luxe MedSpa.
        Instead of polling the API, you can be notified instantly when appointments are created,
        patients are updated, or payments are processed.
      </p>

      <h3>How Webhooks Work</h3>
      <ol>
        <li>You provide an endpoint URL to receive webhook events</li>
        <li>When an event occurs, we send a POST request to your URL</li>
        <li>Your server processes the event and responds with 200 OK</li>
        <li>If we don't receive a 200, we retry the webhook up to 5 times</li>
      </ol>

      <h2 id="setup">Setting Up Webhooks</h2>

      <h3>1. Create a Webhook Endpoint</h3>
      <p>
        Build an endpoint on your server that accepts POST requests:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`// Node.js/Express example
app.post('/webhooks/luxemedspa', (req, res) => {
  const event = req.body;

  // Verify signature
  const signature = req.headers['x-signature'];
  // ... verify signature ...

  // Handle event
  switch(event.type) {
    case 'appointment.created':
      console.log('Appointment created:', event.data);
      break;
    case 'patient.updated':
      console.log('Patient updated:', event.data);
      break;
    // ... handle other events ...
  }

  res.json({ success: true });
});`}</code>
      </pre>

      <h3>2. Register Webhook in Dashboard</h3>
      <p>
        Go to <strong>Settings &gt; Integrations &gt; Webhooks</strong> and click <strong>Add Webhook</strong>:
      </p>
      <ul>
        <li><strong>URL:</strong> Your endpoint URL (must use HTTPS)</li>
        <li><strong>Events:</strong> Select which events you want to receive</li>
        <li><strong>Status:</strong> Toggle active/inactive</li>
      </ul>

      <h3>3. Verify Webhook Signature</h3>
      <p>
        Always verify webhook signatures to ensure requests come from Luxe MedSpa:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return hash === signature;
}

// In your webhook handler
const signature = req.headers['x-signature'];
const secret = process.env.WEBHOOK_SECRET;

if (!verifySignature(req.body, signature, secret)) {
  return res.status(401).json({ error: 'Invalid signature' });
}`}</code>
      </pre>

      <Callout type="warning" title="Security">
        Always verify the webhook signature using your secret key. Never trust webhooks without verification.
      </Callout>

      <h2 id="events">Webhook Events</h2>
      <p>
        Supported webhook events:
      </p>

      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Event</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">appointment.created</td>
              <td className="py-3 px-4 text-gray-600">New appointment scheduled</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">appointment.updated</td>
              <td className="py-3 px-4 text-gray-600">Appointment details changed</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">appointment.completed</td>
              <td className="py-3 px-4 text-gray-600">Appointment marked as completed</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">appointment.cancelled</td>
              <td className="py-3 px-4 text-gray-600">Appointment cancelled</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">patient.created</td>
              <td className="py-3 px-4 text-gray-600">New patient record created</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">patient.updated</td>
              <td className="py-3 px-4 text-gray-600">Patient information changed</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">patient.archived</td>
              <td className="py-3 px-4 text-gray-600">Patient record archived</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">payment.created</td>
              <td className="py-3 px-4 text-gray-600">Payment received</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">payment.refunded</td>
              <td className="py-3 px-4 text-gray-600">Payment refunded</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">invoice.created</td>
              <td className="py-3 px-4 text-gray-600">Invoice generated</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="event-structure">Event Structure</h2>
      <p>
        All webhook payloads follow this structure:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "id": "evt_abc123def456",
  "type": "appointment.created",
  "created_at": "2024-01-15T14:00:00Z",
  "data": {
    // Event-specific data
  },
  "attempt": 1,
  "timestamp": 1705335600
}`}</code>
      </pre>

      <h2 id="event-examples">Event Examples</h2>

      <h3>appointment.created</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "id": "evt_abc123",
  "type": "appointment.created",
  "created_at": "2024-01-15T14:00:00Z",
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
    "created_at": "2024-01-15T13:45:00Z"
  }
}`}</code>
      </pre>

      <h3>patient.updated</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "id": "evt_def456",
  "type": "patient.updated",
  "created_at": "2024-01-15T14:30:00Z",
  "data": {
    "id": "pat_xyz789",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 123-4567",
    "updated_fields": ["phone", "email"],
    "previous_values": {
      "phone": "+1 (555) 123-4566",
      "email": "john.old@example.com"
    },
    "updated_at": "2024-01-15T14:30:00Z"
  }
}`}</code>
      </pre>

      <h3>payment.created</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "id": "evt_ghi789",
  "type": "payment.created",
  "created_at": "2024-01-15T14:35:00Z",
  "data": {
    "id": "pay_abc123",
    "patient_id": "pat_xyz789",
    "patient_name": "John Doe",
    "amount": 250.00,
    "currency": "USD",
    "method": "credit_card",
    "status": "success",
    "appointment_id": "apt_abc123",
    "reference": "ch_stripe123",
    "created_at": "2024-01-15T14:35:00Z"
  }
}`}</code>
      </pre>

      <h2 id="retry-policy">Retry Policy</h2>
      <p>
        If your endpoint doesn't respond with 200 OK, we automatically retry the webhook:
      </p>
      <ul>
        <li><strong>Attempt 1:</strong> Immediately</li>
        <li><strong>Attempt 2:</strong> 5 minutes later</li>
        <li><strong>Attempt 3:</strong> 30 minutes later</li>
        <li><strong>Attempt 4:</strong> 2 hours later</li>
        <li><strong>Attempt 5:</strong> 5 hours later</li>
      </ul>

      <p>
        After 5 failed attempts, we stop retrying and mark the webhook as failed.
        Check your webhook logs in the dashboard to see failure details.
      </p>

      <h3>Idempotency</h3>
      <p>
        Webhook events include an <code>id</code> field. Use this to ensure idempotent processing
        in case you receive the same webhook multiple times:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`// Store processed webhook IDs
const processedWebhooks = new Set();

app.post('/webhooks/luxemedspa', (req, res) => {
  const event = req.body;

  // Skip if already processed
  if (processedWebhooks.has(event.id)) {
    return res.json({ success: true });
  }

  // Process event
  processEvent(event);
  processedWebhooks.add(event.id);

  res.json({ success: true });
});`}</code>
      </pre>

      <h2 id="testing">Testing Webhooks</h2>

      <h3>Manual Webhook Test</h3>
      <p>
        In the dashboard, go to <strong>Settings &gt; Integrations &gt; Webhooks</strong> and click
        <strong>Send Test Event</strong> to test your webhook endpoint.
      </p>

      <h3>Webhook Logs</h3>
      <p>
        View all webhook deliveries and their responses in the webhook logs:
      </p>
      <ul>
        <li>Timestamp of delivery attempt</li>
        <li>Response status code</li>
        <li>Response body</li>
        <li>Time to respond</li>
      </ul>

      <h2 id="best-practices">Best Practices</h2>
      <ul>
        <li><strong>Respond quickly:</strong> Acknowledge receipt immediately with 200 OK, then process async</li>
        <li><strong>Verify signatures:</strong> Always validate webhook signatures</li>
        <li><strong>Implement idempotency:</strong> Handle duplicate webhooks gracefully</li>
        <li><strong>Log all webhooks:</strong> Keep logs for debugging and auditing</li>
        <li><strong>Monitor deliveries:</strong> Watch for failed webhooks and investigate</li>
        <li><strong>Use HTTPS:</strong> All webhook URLs must use HTTPS</li>
        <li><strong>Handle timeouts:</strong> Set appropriate timeouts (we wait max 30 seconds)</li>
        <li><strong>Process asynchronously:</strong> Use queues for time-consuming operations</li>
      </ul>

      <h2 id="managing-webhooks">Managing Webhooks</h2>

      <h3>List Webhooks</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>GET /v1/webhooks</code>
      </pre>

      <h3>Create Webhook</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`POST /v1/webhooks

{
  "url": "https://yourapp.com/webhooks/luxemedspa",
  "events": [
    "appointment.created",
    "appointment.updated",
    "patient.updated",
    "payment.created"
  ],
  "active": true
}`}</code>
      </pre>

      <h3>Update Webhook</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`PUT /v1/webhooks/{id}

{
  "active": false
}`}</code>
      </pre>

      <h3>Delete Webhook</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>DELETE /v1/webhooks/{`{id}`}</code>
      </pre>

      <h2 id="troubleshooting">Troubleshooting</h2>

      <h3>Webhooks Not Being Delivered</h3>
      <ul>
        <li>Check that your URL is accessible and returning 200 OK</li>
        <li>Verify the webhook is active in the dashboard</li>
        <li>Check firewall rules - our servers must be able to reach your endpoint</li>
        <li>Look at webhook logs for delivery attempts and error messages</li>
      </ul>

      <h3>Signature Verification Failing</h3>
      <ul>
        <li>Ensure your secret key matches the one in the dashboard</li>
        <li>Use the raw request body for signature calculation (not parsed JSON)</li>
        <li>Use SHA256 HMAC for signature generation</li>
      </ul>

      <h3>Timeout Errors</h3>
      <ul>
        <li>Return 200 OK immediately, process the webhook asynchronously</li>
        <li>Use a background job queue for heavy processing</li>
        <li>Check your server performance and database query times</li>
      </ul>

      <Callout type="success">
        Need help? Email our support team at webhook-support@luxemedspa.com
      </Callout>
    </div>
  )
}
