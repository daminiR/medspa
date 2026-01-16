# Authentication Guide

Complete guide to authentication in the Patient Portal API.

## Overview

The Patient Portal uses JWT (JSON Web Tokens) for authentication with a short-lived access token and long-lived refresh token pattern.

- **Access Token:** 15 minutes validity
- **Refresh Token:** 7 days validity
- **Session Storage:** Secure database-backed sessions

## Authentication Flow

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │      │   API       │      │  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       │ POST /auth/login   │                    │
       │───────────────────>│                    │
       │                    │   Verify creds     │
       │                    │───────────────────>│
       │                    │<───────────────────│
       │                    │   Create session   │
       │                    │───────────────────>│
       │   accessToken,     │<───────────────────│
       │   refreshToken     │                    │
       │<───────────────────│                    │
       │                    │                    │
       │ GET /appointments  │                    │
       │ Authorization:     │                    │
       │ Bearer <token>     │                    │
       │───────────────────>│                    │
       │                    │   Validate token   │
       │                    │───────────────────>│
       │   appointments     │<───────────────────│
       │<───────────────────│                    │
```

## Token Storage

### Mobile (React Native / Expo)

Use `expo-secure-store` for secure token storage:

```typescript
import * as SecureStore from 'expo-secure-store';

// Store tokens
await SecureStore.setItemAsync('access_token', accessToken);
await SecureStore.setItemAsync('refresh_token', refreshToken);

// Retrieve tokens
const token = await SecureStore.getItemAsync('access_token');

// Clear on logout
await SecureStore.deleteItemAsync('access_token');
await SecureStore.deleteItemAsync('refresh_token');
```

### Web

Use HTTP-only cookies or localStorage with XSS protection:

```typescript
// For development/demo - use localStorage
localStorage.setItem('access_token', accessToken);
localStorage.setItem('refresh_token', refreshToken);

// For production - prefer HTTP-only cookies set by server
// The API can return Set-Cookie headers instead of token in body
```

## Token Refresh

Access tokens expire after 15 minutes. Implement automatic refresh:

```typescript
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // Check if token is expired
  const expiry = await getTokenExpiry();
  if (expiry && new Date(expiry) <= new Date()) {
    // Token expired, refresh it
    const refreshed = await refreshToken();
    if (!refreshed) {
      // Refresh failed, redirect to login
      redirectToLogin();
      return;
    }
  }

  const token = await getAccessToken();
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  // Handle 401 (token might have just expired)
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry the request with new token
      return apiRequest(endpoint, options);
    }
    redirectToLogin();
  }

  return response;
}

async function refreshToken(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch('/api/patient/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (data.success) {
      await setAccessToken(data.data.accessToken);
      await setRefreshToken(data.data.refreshToken);
      await setTokenExpiry(data.data.expiresAt);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
```

## Registration Flow

```typescript
// 1. Register new user
const response = await fetch('/api/patient/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'patient@example.com',
    password: 'securePassword123',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '+15551234567',
    referralCode: 'SARAH25', // Optional
    marketingOptIn: true,
    smsOptIn: true,
  }),
});

const data = await response.json();

if (data.success) {
  // Store tokens
  await setAccessToken(data.data.accessToken);
  await setRefreshToken(data.data.refreshToken);
  await setTokenExpiry(data.data.expiresAt);

  // User is now logged in
  // data.data.user contains user info
  // data.data.patient contains patient profile
}
```

## Login Flow

```typescript
// Login with email/password
const response = await fetch('/api/patient/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'patient@example.com',
    password: 'securePassword123',
  }),
});

const data = await response.json();

if (data.success) {
  await setAccessToken(data.data.accessToken);
  await setRefreshToken(data.data.refreshToken);
  await setTokenExpiry(data.data.expiresAt);
}
```

## Logout Flow

```typescript
async function logout() {
  try {
    // Notify server to invalidate session
    await fetch('/api/patient/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getAccessToken()}`,
      },
    });
  } catch (error) {
    // Continue with logout even if server request fails
  }

  // Clear local tokens
  await clearTokens();

  // Redirect to login
  navigateToLogin();
}
```

## Passkey Authentication (Future)

The API is designed to support WebAuthn/Passkey authentication:

```typescript
// 1. Get registration options
const options = await fetch('/api/patient/auth/passkey/options', {
  method: 'POST',
  body: JSON.stringify({ email: 'patient@example.com' }),
});

// 2. Create credential using WebAuthn
const credential = await navigator.credentials.create({
  publicKey: options.data,
});

// 3. Register passkey with server
await fetch('/api/patient/auth/passkey/register', {
  method: 'POST',
  body: JSON.stringify({
    credential: {
      id: credential.id,
      rawId: base64encode(credential.rawId),
      response: {
        attestationObject: base64encode(credential.response.attestationObject),
        clientDataJSON: base64encode(credential.response.clientDataJSON),
      },
      type: credential.type,
    },
  }),
});
```

## Security Best Practices

### 1. Always Use HTTPS
```typescript
const API_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://api.luxemedspa.com';
```

### 2. Implement Session Timeout
```typescript
// Track last activity
let lastActivity = Date.now();

function trackActivity() {
  lastActivity = Date.now();
}

// Check for timeout (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000;

setInterval(async () => {
  if (Date.now() - lastActivity > SESSION_TIMEOUT) {
    await logout();
  }
}, 60000);
```

### 3. Handle Network Errors
```typescript
try {
  const response = await apiRequest('/appointments');
} catch (error) {
  if (error.name === 'NetworkError') {
    showMessage('Please check your internet connection');
  } else if (error.code === 'UNAUTHORIZED') {
    redirectToLogin();
  } else {
    showMessage('Something went wrong. Please try again.');
  }
}
```

### 4. Protect Against XSS
```typescript
// Never store tokens in URLs or log them
// Always sanitize user input before display
// Use Content Security Policy headers
```

## Rate Limiting

Authentication endpoints have strict rate limits:

| Endpoint | Limit |
|----------|-------|
| POST /auth/login | 5 per minute per IP |
| POST /auth/register | 3 per minute per IP |
| POST /auth/refresh | 10 per minute per user |

When rate limited, the API returns:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

With headers:
```
Retry-After: 60
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1702300860
```

## Example: Complete Auth Hook

```typescript
import { useState, useEffect, createContext, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await apiRequest('/api/patient/auth/me');
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await apiRequest('/api/patient/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.success) {
      throw new Error(response.error.message);
    }

    await setAccessToken(response.data.accessToken);
    await setRefreshToken(response.data.refreshToken);
    setUser(response.data.user);
  }

  async function logout() {
    await apiRequest('/api/patient/auth/logout', { method: 'POST' });
    await clearTokens();
    setUser(null);
  }

  async function register(data: RegisterData) {
    const response = await apiRequest('/api/patient/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.success) {
      throw new Error(response.error.message);
    }

    await setAccessToken(response.data.accessToken);
    await setRefreshToken(response.data.refreshToken);
    setUser(response.data.user);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```
