# Medical Spa Platform - Authentication Architecture

## Overview

This document defines the authentication architecture for the Medical Spa Platform, based on:
- Competitor analysis (Mangomint, Boulevard, Zenoti, Vagaro, Jane App)
- HIPAA compliance requirements
- Current frontend state analysis
- Industry best practices for medical spa software

---

## User Types & Authentication Methods

### 1. Staff Users (Admin App, Tablet Charting)

| Role | Primary Auth | Quick Access | MFA | Session Duration |
|------|--------------|--------------|-----|------------------|
| Owner/Admin | Email + Password | PIN (4-6 digits) | Required | 8hr shift, 15min timeout |
| Manager | Email + Password | PIN | Required | 8hr shift, 15min timeout |
| Provider/Practitioner | Email + Password | PIN or Biometric | Required | Per-appointment |
| Front Desk | Email + Password | PIN | Optional | 8hr shift, 15min timeout |
| Billing | Email + Password | PIN | Required | 8hr shift, 15min timeout |

**Shift-Based Sessions:**
- Staff clock-in starts session (full auth required)
- PIN used for quick re-authentication after timeout
- Session ends at clock-out or end of day
- 15-minute inactivity timeout locks screen (PIN to resume)

### 2. Patient Users (Portal, Mobile)

| Context | Primary Auth | Fallback | MFA | Session |
|---------|--------------|----------|-----|---------|
| Patient Portal | Magic Link | Email/Password | Optional | 30-day remember, 15min PHI timeout |
| Mobile App | Biometric (Face/Touch ID) | Magic Link | Built-in | 30-day, biometric per-session |
| Guest Booking | None (guest checkout) | - | - | Single booking session |
| Kiosk Check-in | QR Code | Phone + DOB | - | Single check-in |

---

## Authentication Flows

### Flow 1: Staff Login (Admin App)

```
┌─────────────────────────────────────────────────────────────────┐
│                     STAFF LOGIN FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Email + Password                                            │
│     └─► Validate credentials against Firebase Auth              │
│         └─► If valid, check if MFA enabled                      │
│             └─► MFA Required? → Prompt for TOTP code            │
│             └─► MFA Not Required? → Create session              │
│                                                                  │
│  2. Create Session                                              │
│     └─► Generate JWT access token (15 min)                      │
│     └─► Generate refresh token (8 hours)                        │
│     └─► Set PIN for quick re-auth (if first login of day)       │
│     └─► Log audit event: LOGIN_SUCCESS                          │
│                                                                  │
│  3. Session Timeout (15 min inactivity)                         │
│     └─► Lock screen, prompt for PIN                             │
│     └─► PIN valid? → Resume session                             │
│     └─► 3 failed PINs? → Full re-authentication                 │
│                                                                  │
│  4. Logout / End of Shift                                       │
│     └─► Invalidate all tokens                                   │
│     └─► Log audit event: LOGOUT                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 2: Patient Portal Login (Passwordless)

```
┌─────────────────────────────────────────────────────────────────┐
│                  PATIENT PORTAL LOGIN                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Option A: Magic Link (Primary - like Mangomint)                │
│  ─────────────────────────────────────────────────              │
│  1. Patient enters email                                        │
│  2. System sends magic link (valid 15 min)                      │
│  3. Patient clicks link                                         │
│  4. System validates token, creates session                     │
│  5. Session: 30-day remember, 15-min PHI timeout                │
│                                                                  │
│  Option B: OAuth (Google/Apple)                                 │
│  ─────────────────────────────────────────────                  │
│  1. Patient clicks "Continue with Google/Apple"                 │
│  2. OAuth flow completes                                        │
│  3. System links OAuth identity to patient record               │
│  4. Session created                                             │
│                                                                  │
│  Option C: Email + Password (Fallback)                          │
│  ─────────────────────────────────────────────                  │
│  1. Patient enters email + password                             │
│  2. Firebase Auth validates                                     │
│  3. Session created                                             │
│                                                                  │
│  PHI Access Step-Up:                                            │
│  ─────────────────────                                          │
│  When accessing medical records/charting notes:                 │
│  └─► Require re-authentication if session > 15 min old         │
│  └─► SMS OTP or re-enter magic link                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 3: Kiosk Check-In

```
┌─────────────────────────────────────────────────────────────────┐
│                    KIOSK CHECK-IN FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Method 1: QR Code (Fastest - 3 seconds)                        │
│  ───────────────────────────────────────                        │
│  1. Patient opens confirmation email on phone                   │
│  2. Shows QR code to kiosk camera                               │
│  3. System validates:                                           │
│     - QR token is valid                                         │
│     - Appointment is today                                      │
│     - Not already checked in                                    │
│  4. Check-in complete, welcome message displayed                │
│                                                                  │
│  Method 2: Phone Number + DOB                                   │
│  ────────────────────────────────                               │
│  1. Patient enters phone number                                 │
│  2. System finds today's appointments                           │
│  3. Patient confirms DOB for verification                       │
│  4. Select appointment (if multiple)                            │
│  5. Check-in complete                                           │
│                                                                  │
│  Method 3: Confirmation Code                                    │
│  ────────────────────────────                                   │
│  1. Patient enters 6-char confirmation code                     │
│  2. System validates code                                       │
│  3. Check-in complete                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 4: Mobile App (Biometric)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE APP AUTH                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  First-Time Setup:                                              │
│  ─────────────────                                              │
│  1. Magic link or OAuth login                                   │
│  2. Prompt: "Enable Face ID/Touch ID?"                          │
│  3. Store encrypted session in Secure Enclave                   │
│  4. Generate device-bound keypair for passkey                   │
│                                                                  │
│  Subsequent Opens:                                              │
│  ─────────────────                                              │
│  1. App opens, checks for stored session                        │
│  2. If session valid, prompt biometric                          │
│  3. Biometric success → immediate access                        │
│  4. Biometric fail (3x) → magic link fallback                   │
│                                                                  │
│  Session Management:                                            │
│  ──────────────────                                             │
│  - Session stored in expo-secure-store                          │
│  - 30-day expiration                                            │
│  - Refresh token used to extend                                 │
│  - Device deauthorization available from portal                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## PIN-Based Quick Access (Staff)

### Design (Based on Mangomint/Zenoti patterns)

```typescript
// PIN is tied to user, not device
interface StaffPIN {
  userId: string;
  pinHash: string;        // bcrypt hashed
  createdAt: Date;
  lastUsedAt: Date;
  failedAttempts: number;
  lockedUntil?: Date;
}

// PIN validation rules
const PIN_RULES = {
  length: 4-6 digits,
  lockoutThreshold: 3 failed attempts,
  lockoutDuration: 5 minutes,
  sessionValidFor: 8 hours (shift duration),
};
```

### PIN Use Cases

1. **Clock-In/Clock-Out**
   - Enter PIN to start shift
   - PIN to end shift

2. **Screen Lock Resume**
   - After 15-min timeout
   - PIN to resume (not full login)

3. **Quick User Switching** (shared workstations)
   - "Switch User" button always visible
   - Enter PIN to switch context
   - Previous user's work saved

4. **Sensitive Actions** (optional step-up)
   - Process refunds
   - Access inventory controls
   - View financial reports

---

## API Endpoints

### Staff Authentication

```
POST /api/auth/staff/login
  Body: { email, password }
  Returns: { accessToken, refreshToken, mfaRequired?, user }

POST /api/auth/staff/mfa/verify
  Body: { userId, totpCode }
  Returns: { accessToken, refreshToken, user }

POST /api/auth/staff/pin/set
  Body: { pin } (4-6 digits)
  Headers: Authorization: Bearer <accessToken>
  Returns: { success }

POST /api/auth/staff/pin/verify
  Body: { userId, pin }
  Returns: { accessToken, refreshToken }

POST /api/auth/staff/refresh
  Body: { refreshToken }
  Returns: { accessToken, refreshToken }

POST /api/auth/staff/logout
  Headers: Authorization: Bearer <accessToken>
  Returns: { success }
```

### Patient Authentication

```
POST /api/auth/patient/magic-link/send
  Body: { email }
  Returns: { success, message }

POST /api/auth/patient/magic-link/verify
  Body: { token }
  Returns: { accessToken, refreshToken, user, isNewUser }

POST /api/auth/patient/oauth/callback
  Body: { provider, code, state }
  Returns: { accessToken, refreshToken, user }

POST /api/auth/patient/register
  Body: { email, firstName, lastName, phone, dateOfBirth }
  Returns: { success, message } // Sends verification email

POST /api/auth/patient/sms-otp/send
  Body: { phone }
  Returns: { success }

POST /api/auth/patient/sms-otp/verify
  Body: { phone, code }
  Returns: { accessToken, refreshToken, user }

POST /api/auth/patient/refresh
  Body: { refreshToken }
  Returns: { accessToken, refreshToken }
```

### Kiosk Authentication

```
POST /api/kiosk/check-in/qr
  Body: { qrToken }
  Returns: { success, appointment, patient }

POST /api/kiosk/check-in/phone
  Body: { phone, dateOfBirth }
  Returns: { appointments[] } // List of today's appointments

POST /api/kiosk/check-in/confirm
  Body: { appointmentId, verificationMethod }
  Returns: { success, checkInTime }

POST /api/kiosk/check-in/code
  Body: { confirmationCode }
  Returns: { success, appointment, patient }
```

---

## Database Schema (Sessions & Auth)

```sql
-- User sessions (staff)
CREATE TABLE staff_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  device_info JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Staff PINs
CREATE TABLE staff_pins (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  pin_hash VARCHAR(255) NOT NULL,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient sessions
CREATE TABLE patient_sessions (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  token_hash VARCHAR(255) NOT NULL,
  device_info JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ,
  remember_device BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

-- Magic link tokens
CREATE TABLE magic_link_tokens (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Passkey credentials (WebAuthn)
CREATE TABLE passkey_credentials (
  id UUID PRIMARY KEY,
  user_id UUID, -- Can be staff or patient
  user_type VARCHAR(20), -- 'staff' or 'patient'
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  device_name VARCHAR(255),
  transports JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Auth audit log (HIPAA requirement)
CREATE TABLE auth_audit_log (
  id UUID PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- LOGIN, LOGOUT, LOGIN_FAILED, PIN_VERIFY, etc.
  user_id UUID,
  user_type VARCHAR(20), -- 'staff' or 'patient'
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX idx_auth_audit_user ON auth_audit_log(user_id, created_at DESC);
CREATE INDEX idx_auth_audit_event ON auth_audit_log(event_type, created_at DESC);
```

---

## Security Considerations

### HIPAA Compliance Checklist

- [x] **Unique User Identification** - Each user has unique ID, no shared accounts
- [x] **Automatic Logoff** - 15-minute inactivity timeout
- [x] **Audit Controls** - All auth events logged with timestamps
- [x] **Person Authentication** - Multi-factor for staff, identity verification for patients
- [x] **Emergency Access** - Break-glass procedures documented

### Token Security

```typescript
// Access Token (JWT)
{
  header: { alg: 'RS256', typ: 'JWT' },
  payload: {
    sub: userId,
    type: 'staff' | 'patient',
    role: 'admin' | 'provider' | 'frontdesk' | 'patient',
    locationIds: ['loc_1', 'loc_2'],  // Multi-location support
    permissions: ['patients:read', 'appointments:write', ...],
    iat: timestamp,
    exp: timestamp + 15min,
  }
}

// Refresh Token
{
  token: secureRandomString(64),
  hashedInDb: true,
  expiresIn: '8h' (staff) | '30d' (patient),
  canOnlyBeUsedOnce: true,  // Rotation on use
}
```

### Rate Limiting

```typescript
const RATE_LIMITS = {
  login: '5 attempts per 15 minutes per IP',
  magicLink: '3 requests per hour per email',
  pinVerify: '3 attempts before lockout',
  smsOtp: '3 codes per hour per phone',
  passwordReset: '3 requests per hour per email',
};
```

---

## Implementation Priority

### Phase 2A: Staff Authentication (Week 1)
1. Staff login endpoint (email/password)
2. Firebase Auth integration
3. JWT token generation
4. Session management
5. Admin app login page
6. Route protection middleware

### Phase 2B: PIN & Quick Access (Week 1-2)
1. PIN set/verify endpoints
2. Screen lock UI in admin app
3. Quick user switching
4. Clock-in/clock-out integration

### Phase 2C: Patient Authentication (Week 2)
1. Magic link send/verify
2. OAuth integration (existing NextAuth)
3. Patient registration flow
4. SMS OTP backup

### Phase 2D: Kiosk & Audit (Week 2)
1. QR code generation for appointments
2. Kiosk check-in endpoints
3. Audit logging for all auth events
4. HIPAA compliance verification

---

## References

- Mangomint: Passwordless magic links for clients, PIN for staff time clock
- Zenoti: SSO (SAML 2.0), biometric fingerprint for staff
- Boulevard: Code verification for patients, HIPAA-compliant
- HIPAA Security Rule: 45 CFR 164.312
- NIST SP 800-63B: Digital Identity Guidelines
