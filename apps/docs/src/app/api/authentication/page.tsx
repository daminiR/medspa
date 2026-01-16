import { Callout } from '@/components/docs/Callout'
import { Key, Lock } from 'lucide-react'

export default function AuthenticationPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Key className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Lock className="w-3 h-3" /> Authentication
        </span>
      </div>
      <h1>Authentication</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Secure your API integrations with API keys or OAuth 2.0 tokens.
        Choose the authentication method that best fits your use case.
      </p>

      <h2 id="api-keys">API Key Authentication</h2>
      <p>
        API keys are the simplest way to authenticate. They're ideal for server-to-server integrations
        and development/testing.
      </p>

      <h3>Creating an API Key</h3>
      <ol>
        <li>Log in to your Luxe MedSpa account</li>
        <li>Navigate to <strong>Settings &gt; Integrations &gt; API Keys</strong></li>
        <li>Click <strong>Create New Key</strong></li>
        <li>Enter a descriptive name (e.g., "Zapier Integration")</li>
        <li>Select the scopes your integration needs</li>
        <li>Click <strong>Create</strong></li>
        <li>Copy your key immediately - it won't be shown again</li>
      </ol>

      <Callout type="warning" title="Key Security">
        Treat API keys like passwords. Store them securely in environment variables,
        never commit them to source control, and rotate them regularly.
      </Callout>

      <h3>Using API Keys</h3>
      <p>
        Include your API key in the <code>Authorization</code> header with the <code>Bearer</code> scheme:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET https://api.luxemedspa.com/v1/appointments \\
  -H "Authorization: Bearer sk_live_abc123def456ghi789"`}</code>
      </pre>

      <h3>API Key Scopes</h3>
      <p>
        Control what an API key can access by assigning scopes:
      </p>
      <div className="not-prose bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Scope</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Permissions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">appointments:read</td>
              <td className="py-3 px-4 text-gray-600">Read appointments</td>
              <td className="py-3 px-4 text-gray-600">GET /appointments</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">appointments:write</td>
              <td className="py-3 px-4 text-gray-600">Create/update appointments</td>
              <td className="py-3 px-4 text-gray-600">POST, PUT /appointments</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">appointments:delete</td>
              <td className="py-3 px-4 text-gray-600">Delete appointments</td>
              <td className="py-3 px-4 text-gray-600">DELETE /appointments</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">patients:read</td>
              <td className="py-3 px-4 text-gray-600">Read patients</td>
              <td className="py-3 px-4 text-gray-600">GET /patients</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">patients:write</td>
              <td className="py-3 px-4 text-gray-600">Create/update patients</td>
              <td className="py-3 px-4 text-gray-600">POST, PUT /patients</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">payments:read</td>
              <td className="py-3 px-4 text-gray-600">Read payments</td>
              <td className="py-3 px-4 text-gray-600">GET /payments</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-mono text-gray-700">payments:write</td>
              <td className="py-3 px-4 text-gray-600">Create/update payments</td>
              <td className="py-3 px-4 text-gray-600">POST, PUT /payments</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono text-gray-700">webhooks:manage</td>
              <td className="py-3 px-4 text-gray-600">Manage webhooks</td>
              <td className="py-3 px-4 text-gray-600">All webhook endpoints</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Rotating Keys</h3>
      <p>
        Rotate your keys periodically for security:
      </p>
      <ol>
        <li>Generate a new API key with the same scopes</li>
        <li>Update your applications to use the new key</li>
        <li>After confirming everything works, delete the old key</li>
      </ol>

      <h2 id="oauth">OAuth 2.0</h2>
      <p>
        Use OAuth 2.0 for user-facing applications where you need user authorization to access their data.
        This is more secure than API keys for end-user scenarios.
      </p>

      <h3>OAuth Flow</h3>
      <p>
        We support the OAuth 2.0 Authorization Code flow:
      </p>
      <ol>
        <li>User clicks "Connect with Luxe MedSpa"</li>
        <li>Redirect to our authorization endpoint</li>
        <li>User logs in and grants permission</li>
        <li>Receive authorization code</li>
        <li>Exchange code for access token</li>
        <li>Use token to access API on behalf of user</li>
      </ol>

      <h3>Step 1: Register Your Application</h3>
      <p>
        Go to <strong>Settings &gt; Integrations &gt; OAuth Applications</strong> and register your app:
      </p>
      <ul>
        <li><strong>Application Name:</strong> Your app name</li>
        <li><strong>Redirect URI:</strong> Where users return after authorization (must use HTTPS)</li>
        <li><strong>Scopes:</strong> What data your app can access</li>
      </ul>

      <p>
        You'll receive a <code>client_id</code> and <code>client_secret</code>. Keep the secret confidential.
      </p>

      <h3>Step 2: Request Authorization</h3>
      <p>
        Redirect users to:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`https://auth.luxemedspa.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/callback&
  response_type=code&
  scope=appointments:read patients:read&
  state=random_state_value`}</code>
      </pre>

      <p>
        The <code>state</code> parameter prevents CSRF attacks - generate a random value, store it, and verify it in the callback.
      </p>

      <h3>Step 3: Handle Authorization Code</h3>
      <p>
        User is redirected to your redirect_uri with an authorization code:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`https://yourapp.com/callback?
  code=auth_code_abc123&
  state=random_state_value`}</code>
      </pre>

      <Callout type="warning">
        Always verify the state parameter matches the one you stored. Reject the callback if it doesn't match.
      </Callout>

      <h3>Step 4: Exchange Code for Token</h3>
      <p>
        From your backend, exchange the code for an access token:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`POST https://auth.luxemedspa.com/oauth/token

{
  "grant_type": "authorization_code",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "auth_code_abc123",
  "redirect_uri": "https://yourapp.com/callback"
}`}</code>
      </pre>

      <h3>Step 5: Use Access Token</h3>
      <p>
        Use the access token to make API requests on behalf of the user:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`curl -X GET https://api.luxemedspa.com/v1/appointments \\
  -H "Authorization: Bearer access_token_xyz789"`}</code>
      </pre>

      <h3>Token Response</h3>
      <p>
        The token endpoint returns:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`{
  "access_token": "access_token_xyz789",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_abc123",
  "scope": "appointments:read patients:read"
}`}</code>
      </pre>

      <h2 id="token-management">Token Management</h2>

      <h3>Access Token Expiration</h3>
      <p>
        Access tokens expire after 1 hour. Use the refresh token to get a new access token:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`POST https://auth.luxemedspa.com/oauth/token

{
  "grant_type": "refresh_token",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "refresh_token_abc123"
}`}</code>
      </pre>

      <h3>Refresh Token Expiration</h3>
      <p>
        Refresh tokens expire after 30 days of inactivity. If a refresh token expires,
        you'll need to ask the user to authorize again.
      </p>

      <h3>Revoking Tokens</h3>
      <p>
        Revoke access or refresh tokens to instantly disconnect an application:
      </p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`POST https://auth.luxemedspa.com/oauth/revoke

{
  "token": "access_token_xyz789",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET"
}`}</code>
      </pre>

      <h2 id="error-responses">Authentication Errors</h2>
      <p>
        Common authentication errors and how to handle them:
      </p>

      <h3>Invalid API Key</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`HTTP/1.1 401 Unauthorized

{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "API key is invalid or revoked"
  }
}`}</code>
      </pre>

      <h3>Missing Authorization Header</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`HTTP/1.1 401 Unauthorized

{
  "success": false,
  "error": {
    "code": "MISSING_AUTHORIZATION",
    "message": "Authorization header is required"
  }
}`}</code>
      </pre>

      <h3>Expired Token</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`HTTP/1.1 401 Unauthorized

{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Access token has expired",
    "hint": "Use refresh token to get a new access token"
  }
}`}</code>
      </pre>

      <h3>Insufficient Permissions</h3>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6">
        <code>{`HTTP/1.1 403 Forbidden

{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_SCOPE",
    "message": "Your API key does not have permission for this action",
    "required_scope": "appointments:write"
  }
}`}</code>
      </pre>

      <h2 id="best-practices">Best Practices</h2>
      <ul>
        <li><strong>Use environment variables:</strong> Store API keys in .env files, never in code</li>
        <li><strong>Use HTTPS only:</strong> Always communicate over HTTPS to prevent key interception</li>
        <li><strong>Rotate keys regularly:</strong> Rotate API keys every 90 days</li>
        <li><strong>Limit scope:</strong> Only request the permissions your integration needs</li>
        <li><strong>Monitor usage:</strong> Check your API usage regularly for unusual activity</li>
        <li><strong>Use OAuth for user apps:</strong> Don't pass user data through API keys</li>
        <li><strong>Validate state in OAuth:</strong> Always verify the state parameter in OAuth callbacks</li>
        <li><strong>Handle token expiration:</strong> Implement automatic token refresh for uninterrupted service</li>
      </ul>

      <Callout type="success">
        Need help setting up authentication? Check out our SDKs for JavaScript, Python, and Go
        which handle authentication automatically.
      </Callout>
    </div>
  )
}
