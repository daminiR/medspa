import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import { Shield, Key, Mail, Smartphone, Lock, CheckCircle2 } from 'lucide-react'

export default function AuthenticationPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Shield className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Authentication & Security</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Multiple authentication methods for secure, convenient patient access to the portal.
      </p>

      <h2 id="overview">Authentication Methods</h2>
      <p>
        The Patient Portal supports multiple authentication methods to balance security with
        user convenience. All methods are implemented using NextAuth v5 (Auth.js).
      </p>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Magic Link Email</h3>
          </div>
          <p className="text-sm text-gray-500">Passwordless email login. User clicks link in email to authenticate.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">SMS OTP</h3>
          </div>
          <p className="text-sm text-gray-500">6-digit code sent via SMS. Quick and familiar for mobile users.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">WebAuthn / Passkeys</h3>
          </div>
          <p className="text-sm text-gray-500">Biometric authentication using Touch ID, Face ID, or security keys.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Social Login</h3>
          </div>
          <p className="text-sm text-gray-500">Sign in with Google, Facebook, or Apple ID.</p>
        </div>
      </div>

      <h2 id="magic-link">Magic Link Email</h2>
      <p>
        The most user-friendly method - patients enter their email and receive a login link.
        No password to remember or type.
      </p>

      <h3 id="magic-link-flow">User Flow</h3>
      <StepList
        steps={[
          {
            title: 'Enter Email',
            description: 'Patient enters their email address on login page',
          },
          {
            title: 'Receive Link',
            description: 'Email with magic link is sent (valid for 10 minutes)',
          },
          {
            title: 'Click to Login',
            description: 'Clicking the link authenticates the user and redirects to dashboard',
          },
        ]}
      />

      <h3 id="magic-link-setup">Email Provider Setup</h3>
      <p>Configure your email provider in <code>.env.local</code>:</p>

      <div className="not-prose my-6 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm"><code>{`# Using SendGrid
EMAIL_SERVER=smtp://apikey:YOUR_SENDGRID_API_KEY@smtp.sendgrid.net:587
EMAIL_FROM=noreply@yourspa.com

# Using AWS SES
EMAIL_SERVER=smtps://YOUR_ACCESS_KEY:YOUR_SECRET_KEY@email-smtp.us-east-1.amazonaws.com:465
EMAIL_FROM=noreply@yourspa.com

# Using Gmail (for testing only)
EMAIL_SERVER=smtp://your-email@gmail.com:app-password@smtp.gmail.com:587
EMAIL_FROM=your-email@gmail.com`}</code></pre>
      </div>

      <Callout type="warning" title="Production Email">
        Use a transactional email service (SendGrid, AWS SES, Postmark) in production.
        Gmail is only suitable for development/testing.
      </Callout>

      <h2 id="sms-otp">SMS OTP Verification</h2>
      <p>
        For patients who prefer SMS or don't have easy email access, SMS OTP provides a
        quick verification method.
      </p>

      <h3 id="sms-otp-flow">User Flow</h3>
      <StepList
        steps={[
          {
            title: 'Enter Phone Number',
            description: 'Patient enters phone number in E.164 format (e.g., +1234567890)',
          },
          {
            title: 'Receive Code',
            description: '6-digit code is sent via SMS (valid for 5 minutes)',
          },
          {
            title: 'Enter Code',
            description: 'Patient types the code to complete authentication',
          },
        ]}
      />

      <h3 id="sms-otp-setup">Twilio Setup</h3>
      <p>Configure Twilio for SMS delivery:</p>

      <div className="not-prose my-6 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm"><code>{`# .env.local
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890`}</code></pre>
      </div>

      <Callout type="info" title="SMS Costs">
        Each SMS OTP costs approximately $0.0075 (SendGrid) to $0.02 (Twilio) per message.
        Consider this when choosing default authentication methods.
      </Callout>

      <h2 id="webauthn">WebAuthn / Passkeys</h2>
      <p>
        Modern biometric authentication for desktop and mobile browsers. Uses Touch ID,
        Face ID, Windows Hello, or hardware security keys.
      </p>

      <h3 id="webauthn-benefits">Benefits</h3>
      <ul>
        <li><strong>Most Secure:</strong> Cryptographic keys never leave the device</li>
        <li><strong>Fast:</strong> One-tap login with biometrics</li>
        <li><strong>No Passwords:</strong> Eliminates password reuse and phishing</li>
        <li><strong>Cross-Device:</strong> Sync passkeys via iCloud or Google Password Manager</li>
      </ul>

      <h3 id="webauthn-setup">Setup</h3>
      <p>
        WebAuthn requires HTTPS in production. No additional API keys needed - works
        out of the box with NextAuth.
      </p>

      <div className="not-prose my-6 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm"><code>{`# .env.local
# Must be HTTPS in production
NEXTAUTH_URL=https://portal.yourspa.com
WEBAUTHN_RP_NAME="Luxe MedSpa Portal"
WEBAUTHN_RP_ID=portal.yourspa.com`}</code></pre>
      </div>

      <h2 id="social-login">Social Login</h2>
      <p>
        Allow patients to sign in with existing social accounts. Reduces friction for
        new users and eliminates password management.
      </p>

      <h3 id="google-setup">Google OAuth Setup</h3>
      <StepList
        steps={[
          {
            title: 'Create OAuth App',
            description: 'Go to Google Cloud Console → APIs & Services → Credentials',
          },
          {
            title: 'Configure Redirect URIs',
            description: 'Add https://portal.yourspa.com/api/auth/callback/google',
          },
          {
            title: 'Add Credentials',
            description: 'Copy Client ID and Secret to .env.local',
          },
        ]}
      />

      <div className="not-prose my-6 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm"><code>{`# .env.local
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret`}</code></pre>
      </div>

      <h3 id="facebook-setup">Facebook OAuth Setup</h3>
      <StepList
        steps={[
          {
            title: 'Create Facebook App',
            description: 'Go to Facebook Developers → My Apps → Create App',
          },
          {
            title: 'Add OAuth Redirect URIs',
            description: 'Settings → Basic → Add Platform → Website',
          },
          {
            title: 'Add Credentials',
            description: 'Copy App ID and App Secret to .env.local',
          },
        ]}
      />

      <div className="not-prose my-6 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm"><code>{`# .env.local
FACEBOOK_CLIENT_ID=your_app_id
FACEBOOK_CLIENT_SECRET=your_app_secret`}</code></pre>
      </div>

      <h3 id="apple-setup">Apple Sign In Setup</h3>
      <p>
        Apple Sign In is required if you plan to release an iOS app. For web-only,
        it's optional but recommended for iPhone users.
      </p>

      <Callout type="info" title="Apple Developer Account Required">
        Apple Sign In requires an Apple Developer account ($99/year).
      </Callout>

      <h2 id="session-management">Session Management</h2>
      <p>
        Sessions are managed with secure, HTTP-only cookies. Default session length
        is 30 days with automatic renewal.
      </p>

      <h3 id="session-config">Session Configuration</h3>
      <div className="not-prose my-6 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm"><code>{`// src/lib/auth.ts
export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'luxe-session',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
}`}</code></pre>
      </div>

      <h2 id="security-features">Security Features</h2>

      <h3 id="rate-limiting">Rate Limiting</h3>
      <ul>
        <li>Max 5 login attempts per email/phone per 15 minutes</li>
        <li>Max 3 magic link requests per email per hour</li>
        <li>Max 3 OTP requests per phone number per hour</li>
      </ul>

      <h3 id="token-expiration">Token Expiration</h3>
      <ul>
        <li>Magic links: 10 minutes</li>
        <li>OTP codes: 5 minutes</li>
        <li>Session tokens: 30 days (renewable)</li>
      </ul>

      <h3 id="encryption">Encryption</h3>
      <ul>
        <li>All authentication tokens encrypted at rest</li>
        <li>TLS 1.3 for data in transit</li>
        <li>bcrypt for any password hashing (if enabled)</li>
        <li>Secure, signed JWTs for session management</li>
      </ul>

      <h2 id="testing">Testing Authentication</h2>

      <h3 id="development-mode">Development Mode</h3>
      <p>
        In development, you can use test credentials to bypass email/SMS verification:
      </p>

      <div className="not-prose my-6 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm"><code>{`# .env.local
NEXTAUTH_DEBUG=true

# Test credentials (dev only)
TEST_EMAIL=test@example.com
TEST_PHONE=+15555555555
TEST_OTP=123456`}</code></pre>
      </div>

      <Callout type="warning" title="Remove Test Credentials">
        Never deploy test credentials to production. Remove or disable them before launch.
      </Callout>

      <h2 id="best-practices">Best Practices</h2>

      <div className="not-prose my-6">
        <div className="space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">✓ Recommended</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Enable magic link email as primary method (best UX)</li>
              <li>• Offer social login for faster onboarding</li>
              <li>• Add WebAuthn for returning users</li>
              <li>• Use HTTPS everywhere in production</li>
              <li>• Implement 2FA for admin accounts</li>
            </ul>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">✗ Avoid</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Using SMS OTP as the only method (expensive at scale)</li>
              <li>• Allowing weak passwords if password auth is enabled</li>
              <li>• Storing authentication tokens in localStorage (use cookies)</li>
              <li>• Skipping rate limiting (vulnerable to brute force)</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 id="troubleshooting">Troubleshooting</h2>

      <h3 id="magic-link-not-received">Magic Link Not Received</h3>
      <ul>
        <li>Check spam/junk folder</li>
        <li>Verify EMAIL_FROM is a verified sender</li>
        <li>Check email provider logs (SendGrid, SES dashboard)</li>
        <li>Ensure EMAIL_SERVER credentials are correct</li>
      </ul>

      <h3 id="sms-not-received">SMS Not Received</h3>
      <ul>
        <li>Verify phone number is in E.164 format (+1234567890)</li>
        <li>Check Twilio logs for delivery status</li>
        <li>Ensure phone number is verified in Twilio (for trial accounts)</li>
        <li>Check Twilio account balance</li>
      </ul>

      <h3 id="webauthn-not-working">WebAuthn Not Working</h3>
      <ul>
        <li>Ensure site is served over HTTPS (required for WebAuthn)</li>
        <li>Check browser compatibility (Safari 14+, Chrome 67+, Firefox 60+)</li>
        <li>Verify WEBAUTHN_RP_ID matches your domain</li>
        <li>Clear browser cache and try again</li>
      </ul>

      <Callout type="success" title="Ready to Deploy">
        With authentication configured, your portal is ready for patient access.
        Test all methods thoroughly before launch and monitor login metrics.
      </Callout>
    </div>
  )
}
